const SiteVisit = require("../models/siteVisit.model");
const Project = require("../models/project.model");
const Vendor = require("../models/vendor.model");
const ApiError = require("../utils/ApiError");

const allowedStatuses = new Set(["scheduled", "completed"]);

const canAccessVisit = (user, visit, vendor = null) =>
  user.role === "admin" ||
  user.id === visit.customer_id ||
  (vendor && user.id === vendor.owner_id);

const validateScheduledAt = (value) => {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw new ApiError(400, "scheduled_at must be a valid date/time");
  }

  return date.toISOString();
};

const bookVisit = async (payload, user) => {
  const customer_id = String(payload.customer_id || user.id || "").trim();
  const vendor_id = String(payload.vendor_id || "").trim();
  const project_id = payload.project_id ? String(payload.project_id).trim() : null;
  const scheduled_at = validateScheduledAt(payload.scheduled_at);
  const notes = payload.notes ? String(payload.notes).trim() : null;

  if (!customer_id) {
    throw new ApiError(400, "customer_id is required");
  }

  if (!vendor_id) {
    throw new ApiError(400, "vendor_id is required");
  }

  if (user.role !== "admin" && user.id !== customer_id) {
    throw new ApiError(403, "You cannot book a site visit for another customer");
  }

  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (vendor.status !== "approved") {
    throw new ApiError(400, "Vendor must be approved before booking a site visit");
  }

  if (project_id) {
    const project = await Project.findById(project_id);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (project.customer_id !== customer_id) {
      throw new ApiError(400, "project_id does not belong to customer_id");
    }
  }

  return SiteVisit.create({
    customer_id,
    vendor_id,
    project_id,
    scheduled_at,
    notes,
  });
};

const getVisitById = async (visit_id, user) => {
  const visit = await SiteVisit.findById(visit_id);
  if (!visit) {
    throw new ApiError(404, "Site visit not found");
  }

  const vendor = await Vendor.findById(visit.vendor_id);
  if (!canAccessVisit(user, visit, vendor)) {
    throw new ApiError(403, "You cannot access this site visit");
  }

  return visit;
};

const getMyVisits = async (user) => {
  if (user.role === "vendor") {
    const vendor = await Vendor.findByOwnerId(user.id);
    if (!vendor) return [];
    return SiteVisit.findByVendorId(vendor.id);
  }

  return SiteVisit.findByCustomerId(user.id);
};

const updateVisitStatus = async ({ visit_id, status, user }) => {
  if (!allowedStatuses.has(status)) {
    throw new ApiError(400, "status must be scheduled or completed");
  }

  const visit = await SiteVisit.findById(visit_id);
  if (!visit) {
    throw new ApiError(404, "Site visit not found");
  }

  const vendor = await Vendor.findById(visit.vendor_id);
  if (!canAccessVisit(user, visit, vendor)) {
    throw new ApiError(403, "You cannot update this site visit");
  }

  return SiteVisit.updateStatus({ id: visit_id, status });
};

module.exports = {
  bookVisit,
  getVisitById,
  getMyVisits,
  updateVisitStatus,
};
