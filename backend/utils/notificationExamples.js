const {
  notificationTriggers,
  channels,
  sendNotification,
} = require("../services/notification.service");

const triggerExamples = {
  new_lead: () =>
    sendNotification({
      trigger: notificationTriggers.NEW_LEAD,
      payload: {
        customer_name: "Amit Sharma",
        category: "CCTV",
        location: "Delhi NCR factory",
      },
      recipients: {
        email: "vendor@example.com",
        phone: "+919999999999",
      },
      channel_list: [channels.EMAIL, channels.SMS],
    }),

  site_visit_booked: () =>
    sendNotification({
      trigger: notificationTriggers.SITE_VISIT_BOOKED,
      payload: {
        project_id: "project_uuid",
        scheduled_at: "2026-05-02T10:30:00.000Z",
      },
      recipients: {
        email: "customer@example.com",
        phone: "+918888888888",
      },
      channel_list: [channels.EMAIL, channels.SMS],
    }),

  quote_submitted: () =>
    sendNotification({
      trigger: notificationTriggers.QUOTE_SUBMITTED,
      payload: {
        vendor_name: "Secure Vision Pvt Ltd",
        project_id: "project_uuid",
        amount: 125000,
      },
      recipients: {
        email: "customer@example.com",
        phone: "+918888888888",
      },
      channel_list: [channels.EMAIL, channels.SMS],
    }),

  delay_alert: () =>
    sendNotification({
      trigger: notificationTriggers.DELAY_ALERT,
      payload: {
        project_id: "project_uuid",
        stage: "installation",
        delay_reason: "Material delivery delayed by 1 day",
      },
      recipients: {
        email: "ops@example.com",
        phone: "+917777777777",
      },
      channel_list: [channels.EMAIL, channels.SMS],
    }),
};

module.exports = {
  triggerExamples,
};
