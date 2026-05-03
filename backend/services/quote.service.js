const Quote = require("../models/quote.model");
const Project = require("../models/project.model");
const Vendor = require("../models/vendor.model");
const ApiError = require("../utils/ApiError");

const canAccessProjectQuotes = (user, project) =>
  user.role === "admin" || user.id === project.customer_id;

const submitQuote = async (payload, user) => {
  const project_id = String(payload.project_id || "").trim();
  const vendor_id = String(payload.vendor_id || "").trim();
  const amount = Number(payload.amount);
  const boq_details = payload.boq_details;

  if (!project_id) {
    throw new ApiError(400, "project_id is required");
  }

  if (!vendor_id) {
    throw new ApiError(400, "vendor_id is required");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "amount must be a positive number");
  }

  if (!boq_details || Array.isArray(boq_details) || typeof boq_details !== "object") {
    throw new ApiError(400, "boq_details must be a JSON object");
  }

  const project = await Project.findById(project_id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (vendor.status !== "approved") {
    throw new ApiError(400, "Vendor must be approved before submitting a quote");
  }

  if (user.role !== "admin" && user.id !== vendor.owner_id) {
    throw new ApiError(403, "You cannot submit a quote for this vendor");
  }

  const existingQuote = await Quote.findByProjectAndVendor({ project_id, vendor_id });
  if (existingQuote) {
    throw new ApiError(409, "Vendor has already submitted a quote for this project");
  }

  return Quote.create({
    project_id,
    vendor_id,
    amount,
    boq_details,
  });
};

const getProjectQuotes = async (project_id, user) => {
  const project = await Project.findById(project_id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!canAccessProjectQuotes(user, project)) {
    throw new ApiError(403, "You cannot view quotes for this project");
  }

  return Quote.findByProjectId(project_id);
};

const compareProjectQuotes = async (project_id, user) => {
  const quotes = await getProjectQuotes(project_id, user);
  const amounts = quotes.map((quote) => Number(quote.amount));
  const lowestAmount = amounts.length ? Math.min(...amounts) : null;

  return quotes.map((quote) => {
    const amount = Number(quote.amount);
    const saving_vs_highest = amounts.length
      ? Number((Math.max(...amounts) - amount).toFixed(2))
      : 0;

    return {
      ...quote,
      amount,
      is_lowest: lowestAmount !== null && amount === lowestAmount,
      saving_vs_highest,
      comparison_score: Number(
        (
          (lowestAmount && amount ? (lowestAmount / amount) * 5 * 0.5 : 0) +
          (Number(quote.rating || 0) * 0.25) +
          (Number(quote.performance_score || 0) * 0.25)
        ).toFixed(2)
      ),
    };
  }).sort((a, b) => b.comparison_score - a.comparison_score);
};

module.exports = {
  submitQuote,
  getProjectQuotes,
  compareProjectQuotes,
};
