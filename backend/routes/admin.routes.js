const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const { requireAuth, allowRoles } = require("../middleware/auth.middleware");

router.use(requireAuth, allowRoles("admin"));

router.get("/projects", adminController.getAllProjects);
router.get("/projects/delayed", adminController.getDelayedProjects);
router.patch("/vendors/:vendor_id/approve", adminController.approveVendor);
router.patch("/projects/:project_id/reassign-vendor", adminController.reassignVendor);

module.exports = router;
