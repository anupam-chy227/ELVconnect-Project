const router = require("express").Router();
const milestonePaymentController = require("../controllers/milestonePayment.controller");
const { requireAuth, allowRoles } = require("../middleware/auth.middleware");

router.post("/", requireAuth, milestonePaymentController.createMilestonePayment);
router.get("/projects/:project_id", requireAuth, milestonePaymentController.getProjectPayments);
router.patch(
  "/:payment_id/review",
  requireAuth,
  allowRoles("admin"),
  milestonePaymentController.reviewMilestonePayment
);
router.patch("/:payment_id/status", requireAuth, milestonePaymentController.updatePaymentStatus);

module.exports = router;
