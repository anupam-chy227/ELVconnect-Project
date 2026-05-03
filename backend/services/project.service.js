const Project = require("../models/project.model");
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

const allowedStatuses = new Set([
  "open",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

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

const canManageCustomerProject = (user, customer_id) =>
  user.role === "admin" || user.id === customer_id;

const createProject = async (payload, user) => {
  const customer_id = String(payload.customer_id || user.id || "").trim();
  const category = String(payload.category || "").trim();
  const location = payload.location || {};
  const location_lat = Number(location.lat);
  const location_lng = Number(location.lng);
  const budget = Number(payload.budget);
  const description = String(payload.description || "").trim();
  const images = normalizeArray(payload.images, "images");

  if (!customer_id) {
    throw new ApiError(400, "customer_id is required");
  }

  if (!canManageCustomerProject(user, customer_id)) {
    throw new ApiError(403, "You cannot create a project for another customer");
  }

  if (!allowedCategories.has(category)) {
    throw new ApiError(400, "category is invalid");
  }

  if (!Number.isFinite(location_lat) || location_lat < -90 || location_lat > 90) {
    throw new ApiError(400, "location.lat must be a valid latitude");
  }

  if (!Number.isFinite(location_lng) || location_lng < -180 || location_lng > 180) {
    throw new ApiError(400, "location.lng must be a valid longitude");
  }

  if (!Number.isFinite(budget) || budget < 0) {
    throw new ApiError(400, "budget must be a valid positive number");
  }

  if (!description) {
    throw new ApiError(400, "description is required");
  }

  validateUrlArray(images, "images");

  return Project.create({
    customer_id,
    category,
    location_lat,
    location_lng,
    budget,
    description,
    images,
  });
};

const getProjectsByUser = async (customer_id, user) => {
  if (!canManageCustomerProject(user, customer_id)) {
    throw new ApiError(403, "You cannot view projects for this customer");
  }

  return Project.findByCustomerId(customer_id);
};

const updateProjectStatus = async ({ project_id, status, user }) => {
  if (!allowedStatuses.has(status)) {
    throw new ApiError(400, "status is invalid");
  }

  const existingProject = await Project.findById(project_id);
  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  if (!canManageCustomerProject(user, existingProject.customer_id)) {
    throw new ApiError(403, "You cannot update this project");
  }

  return Project.updateStatus({ id: project_id, status });
};

module.exports = {
  createProject,
  getProjectsByUser,
  updateProjectStatus,
};
