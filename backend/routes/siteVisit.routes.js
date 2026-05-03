const router = require("express").Router();
const siteVisitController = require("../controllers/siteVisit.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/", requireAuth, siteVisitController.bookVisit);
router.get("/me", requireAuth, siteVisitController.getMyVisits);
router.get("/:visit_id", requireAuth, siteVisitController.getVisitById);
router.patch("/:visit_id/status", requireAuth, siteVisitController.updateVisitStatus);

module.exports = router;
