const MilestonePayment = require("../models/milestonePayment.model");
const Milestone = require("../models/milestone.model");
const Project = require("../models/project.model");
const Vendor = require("../models/vendor.model");
const ApiError = require("../utils/ApiError");

const adminStatuses = new Set(["approved", "rejected"]);
const paymentStatuses = new Set([
  "pending_admin_approval",
  "approved",
  "rejected",
  "paid",
]);

const canAccessProject = (user, project) =>
  user.role === "admin" || user.id === project.customer_id;

const formatCurrency = (value) => String(value || "INR").trim().toUpperCase();

const getProjectOrFail = async (project_id) => {
  const project = await Project.findById(project_id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
};

const getMilestoneOrFail = async ({ project_id, milestone_id }) => {
  const milestones = await Milestone.findByProjectId(project_id);
  const milestone = milestones.find((item) => item.id === milestone_id);

  if (!milestone) {
    throw new ApiError(404, "Milestone not found for this project");
  }

  return milestone;
};

const createMilestonePayment = async (payload, user) => {
  const project_id = String(payload.project_id || "").trim();
  const milestone_id = String(payload.milestone_id || "").trim();
  const vendor_id = String(payload.vendor_id || "").trim();
  const amount = Number(payload.amount);
  const currency = formatCurrency(payload.currency);

  if (!project_id) throw new ApiError(400, "project_id is required");
  if (!milestone_id) throw new ApiError(400, "milestone_id is required");
  if (!vendor_id) throw new ApiError(400, "vendor_id is required");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "amount must be a positive number");
  }

  const project = await getProjectOrFail(project_id);
  if (!canAccessProject(user, project)) {
    throw new ApiError(403, "You cannot create payment for this project");
  }

  const milestone = await getMilestoneOrFail({ project_id, milestone_id });
  if (milestone.status !== "completed") {
    throw new ApiError(400, "Milestone must be completed before payment request");
  }

  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return MilestonePayment.create({
    project_id,
    milestone_id,
    vendor_id,
    amount,
    currency,
    requested_by: user.id,
  });
};

const getProjectPayments = async ({ project_id, user }) => {
  const project = await getProjectOrFail(project_id);
  if (!canAccessProject(user, project)) {
    throw new ApiError(403, "You cannot view payments for this project");
  }

  return MilestonePayment.findByProjectId(project_id);
};

const reviewMilestonePayment = async ({ payment_id, status, rejected_reason, adminUser }) => {
  if (!adminStatuses.has(status)) {
    throw new ApiError(400, "status must be approved or rejected");
  }

  if (status === "rejected" && !String(rejected_reason || "").trim()) {
    throw new ApiError(400, "rejected_reason is required when rejecting payment");
  }

  const existingPayment = await MilestonePayment.findById(payment_id);
  if (!existingPayment) {
    throw new ApiError(404, "Milestone payment not found");
  }

  if (existingPayment.status !== "pending_admin_approval") {
    throw new ApiError(400, "Only pending payments can be approved or rejected");
  }

  return MilestonePayment.updateStatus({
    id: payment_id,
    status,
    approved_by: adminUser.id,
    rejected_reason,
  });
};

const updatePaymentStatus = async ({ payment_id, status, user }) => {
  if (!paymentStatuses.has(status)) {
    throw new ApiError(400, "status is invalid");
  }

  const existingPayment = await MilestonePayment.findById(payment_id);
  if (!existingPayment) {
    throw new ApiError(404, "Milestone payment not found");
  }

  if (user.role !== "admin") {
    const project = await getProjectOrFail(existingPayment.project_id);
    if (!canAccessProject(user, project)) {
      throw new ApiError(403, "You cannot update this payment");
    }
  }

  if (status === "paid" && existingPayment.status !== "approved") {
    throw new ApiError(400, "Payment must be approved before marking as paid");
  }

  return MilestonePayment.updateStatus({ id: payment_id, status });
};

module.exports = {
  createMilestonePayment,
  getProjectPayments,
  reviewMilestonePayment,
  updatePaymentStatus,
};
