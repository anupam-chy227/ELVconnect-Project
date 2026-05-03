const vendorService = require("../services/vendor.service");
const vendorScoringService = require("../services/vendorScoring.service");
const asyncHandler = require("../utils/asyncHandler");

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.createVendor(req.body, req.user);

  res.status(201).json({
    success: true,
    data: {
      vendor,
    },
  });
});

const getOwnVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getOwnVendorProfile(req.user);

  res.status(200).json({
    success: true,
    data: {
      vendor,
    },
  });
});

const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorProfile(req.params.vendor_id);

  res.status(200).json({
    success: true,
    data: {
      vendor,
    },
  });
});

const reviewVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.reviewVendor({
    vendorId: req.params.vendor_id,
    status: req.body.status,
    rejection_reason: req.body.rejection_reason,
    adminUser: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      vendor,
    },
  });
});

const formatVendorScore = (score) => ({
  id: score.id,
  vendor_id: score.vendor_id,
  company_name: score.company_name,
  completion_rate: Number(score.completion_rate),
  quality: Number(score.quality),
  rating: Number(score.rating),
  response_time: Number(score.response_time),
  compliance: Number(score.compliance),
  score: Number(score.score),
  performance_score:
    score.performance_score === undefined ? undefined : Number(score.performance_score),
  scored_by: score.scored_by,
  created_at: score.created_at,
  updated_at: score.updated_at,
});

const updateVendorScore = asyncHandler(async (req, res) => {
  const score = await vendorScoringService.updateVendorScore({
    vendor_id: req.params.vendor_id,
    payload: req.body,
    adminUser: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      vendor_score: formatVendorScore(score),
    },
  });
});

const getVendorScore = asyncHandler(async (req, res) => {
  const score = await vendorScoringService.getVendorScore(req.params.vendor_id);

  res.status(200).json({
    success: true,
    data: {
      vendor_score: score ? formatVendorScore(score) : null,
    },
  });
});

module.exports = {
  createVendor,
  getOwnVendorProfile,
  getVendorProfile,
  reviewVendor,
  updateVendorScore,
  getVendorScore,
};
