const projectService = require("../services/project.service");
const asyncHandler = require("../utils/asyncHandler");

const formatProject = (project) => ({
  id: project.id,
  customer_id: project.customer_id,
  category: project.category,
  location: {
    lat: Number(project.location_lat),
    lng: Number(project.location_lng),
  },
  budget: Number(project.budget),
  description: project.description,
  images: project.images,
  status: project.status,
  created_at: project.created_at,
  updated_at: project.updated_at,
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user);

  res.status(201).json({
    success: true,
    data: {
      project: formatProject(project),
    },
  });
});

const getProjectsByUser = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjectsByUser(
    req.params.customer_id,
    req.user
  );

  res.status(200).json({
    success: true,
    data: {
      projects: projects.map(formatProject),
    },
  });
});

const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjectsByUser(req.user.id, req.user);

  res.status(200).json({
    success: true,
    data: {
      projects: projects.map(formatProject),
    },
  });
});

const updateProjectStatus = asyncHandler(async (req, res) => {
  const project = await projectService.updateProjectStatus({
    project_id: req.params.project_id,
    status: req.body.status,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      project: formatProject(project),
    },
  });
});

module.exports = {
  createProject,
  getProjectsByUser,
  getMyProjects,
  updateProjectStatus,
};
