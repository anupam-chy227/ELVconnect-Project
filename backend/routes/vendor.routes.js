const router = require("express").Router();
const vendorController = require("../controllers/vendor.controller");
const { requireAuth, allowRoles } = require("../middleware/auth.middleware");

router.post("/", requireAuth, vendorController.createVendor);
router.get("/me", requireAuth, vendorController.getOwnVendorProfile);
router.get("/:vendor_id/score", requireAuth, vendorController.getVendorScore);
router.patch(
  "/:vendor_id/score",
  requireAuth,
  allowRoles("admin"),
  vendorController.updateVendorScore
);
router.get("/:vendor_id", requireAuth, vendorController.getVendorProfile);
router.patch(
  "/:vendor_id/status",
  requireAuth,
  allowRoles("admin"),
  vendorController.reviewVendor
);

module.exports = router;
