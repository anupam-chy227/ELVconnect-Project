const milestoneService = require("../services/milestone.service");
const asyncHandler = require("../utils/asyncHandler");

const formatMilestone = (milestone) => ({
  id: milestone.id,
  project_id: milestone.project_id,
  stage: milestone.stage,
  status: milestone.status,
  proof_images: milestone.proof_images || [],
  notes: milestone.notes,
  completed_at: milestone.completed_at,
  created_at: milestone.created_at,
  updated_at: milestone.updated_at,
});

const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.updateMilestone({
    project_id: req.params.project_id,
    stage: req.body.stage,
    status: req.body.status,
    proof_image_url: req.body.proof_image_url,
    notes: req.body.notes,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      milestone: formatMilestone(milestone),
    },
  });
});

const uploadProof = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.uploadProof({
    project_id: req.params.project_id,
    stage: req.body.stage,
    proof_image_url: req.body.proof_image_url,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      milestone: formatMilestone(milestone),
    },
  });
});

const getProjectProgress = asyncHandler(async (req, res) => {
  const result = await milestoneService.getProjectProgress(req.params.project_id, req.user);

  res.status(200).json({
    success: true,
    data: {
      progress: result.progress,
      milestones: result.milestones.map(formatMilestone),
    },
  });
});

module.exports = {
  updateMilestone,
  uploadProof,
  getProjectProgress,
};
