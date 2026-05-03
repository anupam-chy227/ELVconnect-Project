const adminService = require("../services/admin.service");
const asyncHandler = require("../utils/asyncHandler");

const formatProject = (project) => ({
  id: project.id,
  customer_id: project.customer_id,
  customer_name: project.customer_name,
  customer_email: project.customer_email,
  category: project.category,
  location: {
    lat: Number(project.location_lat),
    lng: Number(project.location_lng),
  },
  budget: Number(project.budget),
  description: project.description,
  images: project.images,
  status: project.status,
  assigned_vendor_id: project.assigned_vendor_id,
  assigned_vendor_company: project.assigned_vendor_company,
  completed_milestones:
    project.completed_milestones === undefined ? undefined : Number(project.completed_milestones),
  total_milestones:
    project.total_milestones === undefined ? undefined : Number(project.total_milestones),
  progress_percentage:
    project.progress_percentage === undefined ? undefined : Number(project.progress_percentage),
  last_activity_at: project.last_activity_at,
  delayed_days: project.delayed_days === undefined ? undefined : Number(project.delayed_days),
  created_at: project.created_at,
  updated_at: project.updated_at,
});

const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await adminService.getAllProjects(req.query);

  res.status(200).json({
    success: true,
    data: {
      projects: projects.map(formatProject),
    },
  });
});

const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await adminService.approveVendor({
    vendor_id: req.params.vendor_id,
    adminUser: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      vendor,
    },
  });
});

const reassignVendor = asyncHandler(async (req, res) => {
  const assignment = await adminService.reassignVendor({
    project_id: req.params.project_id,
    vendor_id: req.body.vendor_id,
    reason: req.body.reason,
    adminUser: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      assignment,
    },
  });
});

const getDelayedProjects = asyncHandler(async (req, res) => {
  const projects = await adminService.getDelayedProjects(req.query);

  res.status(200).json({
    success: true,
    data: {
      projects: projects.map(formatProject),
    },
  });
});

module.exports = {
  getAllProjects,
  approveVendor,
  reassignVendor,
  getDelayedProjects,
};
