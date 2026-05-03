const router = require("express").Router();
const milestoneController = require("../controllers/milestone.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.patch("/projects/:project_id", requireAuth, milestoneController.updateMilestone);
router.post("/projects/:project_id/proof", requireAuth, milestoneController.uploadProof);
router.get("/projects/:project_id/progress", requireAuth, milestoneController.getProjectProgress);

module.exports = router;
