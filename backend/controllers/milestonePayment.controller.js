const milestonePaymentService = require("../services/milestonePayment.service");
const asyncHandler = require("../utils/asyncHandler");

const formatPayment = (payment) => ({
  id: payment.id,
  project_id: payment.project_id,
  milestone_id: payment.milestone_id,
  vendor_id: payment.vendor_id,
  amount: Number(payment.amount),
  currency: payment.currency,
  status: payment.status,
  requested_by: payment.requested_by,
  approved_by: payment.approved_by,
  approved_at: payment.approved_at,
  rejected_reason: payment.rejected_reason,
  paid_at: payment.paid_at,
  created_at: payment.created_at,
  updated_at: payment.updated_at,
});

const createMilestonePayment = asyncHandler(async (req, res) => {
  const payment = await milestonePaymentService.createMilestonePayment(req.body, req.user);

  res.status(201).json({
    success: true,
    data: {
      milestone_payment: formatPayment(payment),
    },
  });
});

const getProjectPayments = asyncHandler(async (req, res) => {
  const payments = await milestonePaymentService.getProjectPayments({
    project_id: req.params.project_id,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      milestone_payments: payments.map(formatPayment),
    },
  });
});

const reviewMilestonePayment = asyncHandler(async (req, res) => {
  const payment = await milestonePaymentService.reviewMilestonePayment({
    payment_id: req.params.payment_id,
    status: req.body.status,
    rejected_reason: req.body.rejected_reason,
    adminUser: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      milestone_payment: formatPayment(payment),
    },
  });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const payment = await milestonePaymentService.updatePaymentStatus({
    payment_id: req.params.payment_id,
    status: req.body.status,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      milestone_payment: formatPayment(payment),
    },
  });
});

module.exports = {
  createMilestonePayment,
  getProjectPayments,
  reviewMilestonePayment,
  updatePaymentStatus,
};
