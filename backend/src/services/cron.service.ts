import cron from 'node-cron';
import { Invoice } from '../modules/invoices/invoice.model';
import { User } from '../modules/users/user.model';
import { sendAmcRenewalReminder } from './email.service';

// ── Mark overdue invoices daily at 12:05 AM ───────────────────────────────
const markOverdueCron = () => {
  cron.schedule('5 0 * * *', async () => {
    try {
      const result = await Invoice.updateMany(
        { status: 'sent', dueDate: { $lt: new Date() }, isDeleted: false },
        { $set: { status: 'overdue' } }
      );
      console.log(`[CRON] Marked ${result.modifiedCount} invoices as overdue`);
    } catch (err) {
      console.error('[CRON] markOverdue error:', err);
    }
  });
};

// ── AMC renewal reminders daily at 8:00 AM ───────────────────────────────
const amcRenewalCron = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const today = new Date();

      // Find AMC invoices due within 7 days that are NOT yet sent
      const upcomingAMC = await Invoice.find({
        type: 'amc',
        status: 'draft',
        'amcDetails.contractPeriodEnd': { $gte: today, $lte: sevenDaysFromNow },
        isDeleted: false,
      }).populate<{ userId: any }>('userId', 'email profile');

      for (const invoice of upcomingAMC) {
        if (invoice.amcDetails?.contractPeriodEnd && invoice.userId?.email) {
          await sendAmcRenewalReminder(
            invoice.userId.email,
            invoice.to.name,
            invoice.amcDetails.contractPeriodEnd,
            invoice.invoiceNumber
          );
        }
      }
      console.log(`[CRON] Sent ${upcomingAMC.length} AMC renewal reminders`);
    } catch (err) {
      console.error('[CRON] amcRenewal error:', err);
    }
  });
};

// ── Reset monthly invoice counters on 1st of each month ──────────────────
const resetMonthlyCounterCron = () => {
  cron.schedule('0 0 1 * *', async () => {
    try {
      await User.updateMany({}, { $set: { 'subscription.invoicesThisMonth': 0 } });
      console.log('[CRON] Reset monthly invoice counters');
    } catch (err) {
      console.error('[CRON] resetMonthlyCounter error:', err);
    }
  });
};

export const startCronJobs = () => {
  markOverdueCron();
  amcRenewalCron();
  resetMonthlyCounterCron();
  console.log('⏰ Cron jobs started');
};
