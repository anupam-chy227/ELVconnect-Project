import nodemailer from 'nodemailer';
import { env } from '../config/env';

const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️  Email not configured — SMTP env vars missing');
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 465,
    secure: (env.SMTP_PORT || 465) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
};

const transporter = createTransporter();
const FROM = env.EMAIL_FROM || 'noreply@elvconnect.com';

// ── Generic send ──────────────────────────────────────────────────────────
const sendMail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.log(`[EMAIL SKIP] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
};

// ── Password Reset Email ──────────────────────────────────────────────────
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  clientUrl: string
) => {
  const resetUrl = `${clientUrl}/auth/reset-password?token=${resetToken}`;
  await sendMail(
    to,
    'ELV CONNECT — Password Reset Request',
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #7c3aed;">ELV CONNECT</h2>
      <p>You requested a password reset. Click the button below to reset your password.</p>
      <p>This link is valid for <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:6px;margin:16px 0;">
        Reset Password
      </a>
      <p>If you did not request this, ignore this email.</p>
      <hr/>
      <small style="color:#999;">ELV CONNECT — Integrated Security & ELV Solutions Platform</small>
    </div>
    `
  );
};

// ── Invoice Sent Email ────────────────────────────────────────────────────
export const sendInvoiceEmail = async (
  to: string,
  invoiceNumber: string,
  clientUrl: string,
  portalToken?: string
) => {
  const link = portalToken
    ? `${clientUrl}/invoice/view/${portalToken}`
    : `${clientUrl}/dashboard/invoices`;

  await sendMail(
    to,
    `ELV CONNECT — Invoice ${invoiceNumber}`,
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #7c3aed;">ELV CONNECT</h2>
      <p>You have received a new invoice: <strong>${invoiceNumber}</strong></p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:6px;margin:16px 0;">
        View Invoice
      </a>
      <hr/>
      <small style="color:#999;">ELV CONNECT — Integrated Security & ELV Solutions Platform</small>
    </div>
    `
  );
};

// ── AMC Renewal Reminder ──────────────────────────────────────────────────
export const sendAmcRenewalReminder = async (
  to: string,
  customerName: string,
  contractEnd: Date,
  invoiceNumber: string
) => {
  await sendMail(
    to,
    `ELV CONNECT — AMC Renewal Due: ${invoiceNumber}`,
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #7c3aed;">ELV CONNECT — AMC Renewal Reminder</h2>
      <p>Hello,</p>
      <p>The AMC contract for <strong>${customerName}</strong> is due for renewal on
         <strong>${contractEnd.toDateString()}</strong>.</p>
      <p>Invoice <strong>${invoiceNumber}</strong> has been prepared for your review in the dashboard.</p>
      <hr/>
      <small style="color:#999;">ELV CONNECT — Integrated Security & ELV Solutions Platform</small>
    </div>
    `
  );
};
