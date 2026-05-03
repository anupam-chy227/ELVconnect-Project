const siteVisitService = require("../services/siteVisit.service");
const asyncHandler = require("../utils/asyncHandler");

const formatSiteVisit = (visit) => ({
  id: visit.id,
  customer_id: visit.customer_id,
  vendor_id: visit.vendor_id,
  project_id: visit.project_id,
  scheduled_at: visit.scheduled_at,
  status: visit.status,
  notes: visit.notes,
  completed_at: visit.completed_at,
  created_at: visit.created_at,
  updated_at: visit.updated_at,
});

const bookVisit = asyncHandler(async (req, res) => {
  const visit = await siteVisitService.bookVisit(req.body, req.user);

  res.status(201).json({
    success: true,
    data: {
      site_visit: formatSiteVisit(visit),
    },
  });
});

const getVisitById = asyncHandler(async (req, res) => {
  const visit = await siteVisitService.getVisitById(req.params.visit_id, req.user);

  res.status(200).json({
    success: true,
    data: {
      site_visit: formatSiteVisit(visit),
    },
  });
});

const getMyVisits = asyncHandler(async (req, res) => {
  const visits = await siteVisitService.getMyVisits(req.user);

  res.status(200).json({
    success: true,
    data: {
      site_visits: visits.map(formatSiteVisit),
    },
  });
});

const updateVisitStatus = asyncHandler(async (req, res) => {
  const visit = await siteVisitService.updateVisitStatus({
    visit_id: req.params.visit_id,
    status: req.body.status,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      site_visit: formatSiteVisit(visit),
    },
  });
});

module.exports = {
  bookVisit,
  getVisitById,
  getMyVisits,
  updateVisitStatus,
};
