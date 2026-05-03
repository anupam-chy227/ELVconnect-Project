const axios = require("axios");
const nodemailer = require("nodemailer");

const notificationTriggers = {
  NEW_LEAD: "new_lead",
  SITE_VISIT_BOOKED: "site_visit_booked",
  QUOTE_SUBMITTED: "quote_submitted",
  DELAY_ALERT: "delay_alert",
};

const channels = {
  EMAIL: "email",
  SMS: "sms",
};

const templates = {
  [notificationTriggers.NEW_LEAD]: ({ customer_name, category, location }) => ({
    subject: "New ELV lead received",
    text: `New lead: ${customer_name || "Customer"} needs ${category || "ELV"} service at ${location || "their site"}.`,
  }),
  [notificationTriggers.SITE_VISIT_BOOKED]: ({ project_id, scheduled_at }) => ({
    subject: "Site visit booked",
    text: `Site visit booked for project ${project_id}. Scheduled at ${scheduled_at}.`,
  }),
  [notificationTriggers.QUOTE_SUBMITTED]: ({ vendor_name, project_id, amount }) => ({
    subject: "New quote submitted",
    text: `${vendor_name || "A vendor"} submitted a quote of Rs ${amount} for project ${project_id}.`,
  }),
  [notificationTriggers.DELAY_ALERT]: ({ project_id, stage, delay_reason }) => ({
    subject: "Project delay alert",
    text: `Delay alert for project ${project_id}. Stage: ${stage}. Reason: ${delay_reason || "Not specified"}.`,
  }),
};

const createEmailTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 465);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildMessage = (trigger, payload = {}) => {
  const template = templates[trigger];

  if (!template) {
    throw new Error(`Unsupported notification trigger: ${trigger}`);
  }

  return template(payload);
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error("Email recipient is required");
  }

  const transporter = createEmailTransporter();
  const from = process.env.EMAIL_FROM || "noreply@elvconnect.com";

  if (!transporter) {
    console.log("[EMAIL:DEV]", { to, from, subject, text });
    return { channel: channels.EMAIL, sent: false, dev_mode: true };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  });

  return { channel: channels.EMAIL, sent: true };
};

const sendSms = async ({ to, text }) => {
  if (!to) {
    throw new Error("SMS recipient is required");
  }

  if (!process.env.SMS_WEBHOOK_URL) {
    console.log("[SMS:DEV]", { to, text });
    return { channel: channels.SMS, sent: false, dev_mode: true };
  }

  await axios.post(
    process.env.SMS_WEBHOOK_URL,
    {
      to,
      message: text,
    },
    {
      headers: {
        Authorization: process.env.SMS_API_KEY ? `Bearer ${process.env.SMS_API_KEY}` : undefined,
      },
    }
  );

  return { channel: channels.SMS, sent: true };
};

const sendNotification = async ({ trigger, payload = {}, recipients = {}, channel_list = [] }) => {
  const message = buildMessage(trigger, payload);
  const selectedChannels = channel_list.length ? channel_list : [channels.EMAIL, channels.SMS];
  const results = [];

  if (selectedChannels.includes(channels.EMAIL) && recipients.email) {
    results.push(
      await sendEmail({
        to: recipients.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      })
    );
  }

  if (selectedChannels.includes(channels.SMS) && recipients.phone) {
    results.push(
      await sendSms({
        to: recipients.phone,
        text: message.text,
      })
    );
  }

  return {
    trigger,
    message,
    recipients,
    results,
  };
};

module.exports = {
  notificationTriggers,
  channels,
  buildMessage,
  sendEmail,
  sendSms,
  sendNotification,
};
