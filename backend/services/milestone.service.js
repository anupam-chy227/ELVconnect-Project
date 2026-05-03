const Milestone = require("../models/milestone.model");
const Project = require("../models/project.model");
const ApiError = require("../utils/ApiError");

const stages = ["survey", "quote", "installation", "testing", "handover"];
const statuses = new Set(["pending", "in_progress", "completed"]);

const canAccessProject = (user, project) =>
  user.role === "admin" || user.id === project.customer_id;

const validateUrl = (value) => {
  try {
    new URL(value);
  } catch (_error) {
    throw new ApiError(400, "proof_image_url must be a valid URL");
  }
};

const getProjectOrFail = async (project_id, user) => {
  const project = await Project.findById(project_id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!canAccessProject(user, project)) {
    throw new ApiError(403, "You cannot access this project");
  }

  return project;
};

const normalizeMilestones = (rows) =>
  stages.map((stage) => {
    const found = rows.find((row) => row.stage === stage);

    return found || {
      id: null,
      project_id: null,
      stage,
      status: "pending",
      proof_images: [],
      notes: null,
      completed_at: null,
      created_at: null,
      updated_at: null,
    };
  });

const calculateProgress = (milestones) => {
  const completed = milestones.filter((milestone) => milestone.status === "completed").length;

  return {
    completed_stages: completed,
    total_stages: stages.length,
    progress_percentage: Math.round((completed / stages.length) * 100),
  };
};

const updateMilestone = async ({ project_id, stage, status, proof_image_url, notes, user }) => {
  const normalizedStage = String(stage || "").trim();
  const normalizedStatus = String(status || "").trim() || "in_progress";
  const proof_images = [];

  await getProjectOrFail(project_id, user);

  if (!stages.includes(normalizedStage)) {
    throw new ApiError(400, "stage is invalid");
  }

  if (!statuses.has(normalizedStatus)) {
    throw new ApiError(400, "status is invalid");
  }

  if (proof_image_url) {
    validateUrl(proof_image_url);
    proof_images.push(proof_image_url);
  }

  return Milestone.upsert({
    project_id,
    stage: normalizedStage,
    status: normalizedStatus,
    proof_images,
    notes: notes ? String(notes).trim() : null,
  });
};

const uploadProof = async ({ project_id, stage, proof_image_url, user }) => {
  return updateMilestone({
    project_id,
    stage,
    status: "in_progress",
    proof_image_url,
    user,
  });
};

const getProjectProgress = async (project_id, user) => {
  await getProjectOrFail(project_id, user);

  const rows = await Milestone.findByProjectId(project_id);
  const milestones = normalizeMilestones(rows).map((milestone) => ({
    ...milestone,
    project_id,
  }));

  return {
    milestones,
    progress: calculateProgress(milestones),
  };
};

module.exports = {
  stages,
  updateMilestone,
  uploadProof,
  getProjectProgress,
};
