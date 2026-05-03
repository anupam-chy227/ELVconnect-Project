const Vendor = require("../models/vendor.model");
const VendorScore = require("../models/vendorScore.model");
const ApiError = require("../utils/ApiError");

const parseMetric = (payload, key) => {
  const value = Number(payload[key]);

  if (!Number.isFinite(value) || value < 0 || value > 5) {
    throw new ApiError(400, `${key} must be a number between 0 and 5`);
  }

  return value;
};

const calculateVendorScore = ({
  completion_rate,
  quality,
  rating,
  response_time,
  compliance,
}) =>
  Number(
    (
      completion_rate * 0.25 +
      quality * 0.25 +
      rating * 0.2 +
      response_time * 0.15 +
      compliance * 0.15
    ).toFixed(2)
  );

const updateVendorScore = async ({ vendor_id, payload, adminUser }) => {
  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const metrics = {
    completion_rate: parseMetric(payload, "completion_rate"),
    quality: parseMetric(payload, "quality"),
    rating: parseMetric(payload, "rating"),
    response_time: parseMetric(payload, "response_time"),
    compliance: parseMetric(payload, "compliance"),
  };

  const expectedScore = calculateVendorScore(metrics);
  const score = await VendorScore.upsertScore({
    vendor_id,
    ...metrics,
    scored_by: adminUser.id,
  });

  return {
    ...score,
    score: Number(score.score),
    performance_score: Number(score.performance_score),
    expected_score: expectedScore,
  };
};

const getVendorScore = async (vendor_id) => {
  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return VendorScore.findByVendorId(vendor_id);
};

module.exports = {
  calculateVendorScore,
  updateVendorScore,
  getVendorScore,
};
