const Admin = require("../models/admin.model");
const ApiError = require("../utils/ApiError");

const projectStatuses = new Set(["open", "assigned", "in_progress", "completed", "cancelled"]);
const categories = new Set([
  "CCTV",
  "Fire",
  "Networking",
  "Access Control",
  "BMS",
  "PA System",
  "Intercom",
  "Gate Automation",
  "Other",
]);

const parsePositiveInteger = (value, fallback, max = 100) => {
  const number = Number(value || fallback);

  if (!Number.isInteger(number) || number <= 0) {
    return fallback;
  }

  return Math.min(number, max);
};

const getAllProjects = async (query) => {
  const status = query.status ? String(query.status).trim() : null;
  const category = query.category ? String(query.category).trim() : null;

  if (status && !projectStatuses.has(status)) {
    throw new ApiError(400, "status is invalid");
  }

  if (category && !categories.has(category)) {
    throw new ApiError(400, "category is invalid");
  }

  return Admin.findAllProjects({
    status,
    category,
    limit: parsePositiveInteger(query.limit, 50),
    offset: Math.max(Number(query.offset || 0), 0),
  });
};

const approveVendor = async ({ vendor_id, adminUser }) => {
  const vendor = await Admin.approveVendor({
    vendor_id,
    admin_id: adminUser.id,
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return vendor;
};

const reassignVendor = async ({ project_id, vendor_id, reason, adminUser }) => {
  if (!project_id) throw new ApiError(400, "project_id is required");
  if (!vendor_id) throw new ApiError(400, "vendor_id is required");

  const result = await Admin.reassignVendor({
    project_id,
    vendor_id,
    reason: reason ? String(reason).trim() : null,
    admin_id: adminUser.id,
  });

  if (!result.project) {
    throw new ApiError(404, "Project not found");
  }

  if (!result.vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (result.vendor.status !== "approved") {
    throw new ApiError(400, "Vendor must be approved before assignment");
  }

  return result.assignment;
};

const getDelayedProjects = async (query) => {
  return Admin.findDelayedProjects({
    threshold_days: parsePositiveInteger(query.threshold_days, 7, 365),
    limit: parsePositiveInteger(query.limit, 50),
    offset: Math.max(Number(query.offset || 0), 0),
  });
};

module.exports = {
  getAllProjects,
  approveVendor,
  reassignVendor,
  getDelayedProjects,
};
