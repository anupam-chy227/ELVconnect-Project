const Vendor = require("../models/vendor.model");
const ApiError = require("../utils/ApiError");

const allowedCategories = new Set([
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

const allowedStatuses = new Set(["approved", "rejected"]);

const normalizeArray = (value, fieldName) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, `${fieldName} must be an array`);
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
};

const validateUrlArray = (items, fieldName) => {
  for (const item of items) {
    try {
      new URL(item);
    } catch (_error) {
      throw new ApiError(400, `${fieldName} contains an invalid URL: ${item}`);
    }
  }
};

const createVendor = async (payload, user) => {
  const company_name = String(payload.company_name || "").trim();
  const category = String(payload.category || "").trim();
  const location = payload.location || {};
  const location_lat =
    location.lat === undefined || location.lat === null ? null : Number(location.lat);
  const location_lng =
    location.lng === undefined || location.lng === null ? null : Number(location.lng);
  const service_radius = Number(payload.service_radius);
  const rating = payload.rating === undefined ? 0 : Number(payload.rating);
  const performance_score =
    payload.performance_score === undefined ? 0 : Number(payload.performance_score);
  const certifications = normalizeArray(payload.certifications, "certifications");
  const documents = normalizeArray(payload.documents, "documents");

  if (!company_name) {
    throw new ApiError(400, "company_name is required");
  }

  if (!allowedCategories.has(category)) {
    throw new ApiError(400, "category is invalid");
  }

  if (!Number.isFinite(service_radius) || service_radius <= 0) {
    throw new ApiError(400, "service_radius must be a positive number");
  }

  if (location_lat !== null && (!Number.isFinite(location_lat) || location_lat < -90 || location_lat > 90)) {
    throw new ApiError(400, "location.lat must be a valid latitude");
  }

  if (location_lng !== null && (!Number.isFinite(location_lng) || location_lng < -180 || location_lng > 180)) {
    throw new ApiError(400, "location.lng must be a valid longitude");
  }

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw new ApiError(400, "rating must be between 0 and 5");
  }

  if (!Number.isFinite(performance_score) || performance_score < 0 || performance_score > 5) {
    throw new ApiError(400, "performance_score must be between 0 and 5");
  }

  validateUrlArray(documents, "documents");

  return Vendor.create({
    owner_id: user.id,
    company_name,
    category,
    location_lat,
    location_lng,
    service_radius,
    rating,
    performance_score,
    certifications,
    documents,
  });
};

const getOwnVendorProfile = async (user) => {
  const vendor = await Vendor.findByOwnerId(user.id);
  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  return vendor;
};

const getVendorProfile = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  return vendor;
};

const reviewVendor = async ({ vendorId, status, adminUser, rejection_reason }) => {
  if (!allowedStatuses.has(status)) {
    throw new ApiError(400, "status must be approved or rejected");
  }

  if (status === "rejected" && !String(rejection_reason || "").trim()) {
    throw new ApiError(400, "rejection_reason is required when status is rejected");
  }

  const vendor = await Vendor.updateStatus({
    id: vendorId,
    status,
    reviewed_by: adminUser.id,
    rejection_reason: status === "rejected" ? rejection_reason : null,
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  return vendor;
};

module.exports = {
  createVendor,
  getOwnVendorProfile,
  getVendorProfile,
  reviewVendor,
};
