const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/health", require("./health.routes"));
router.use("/vendors", require("./vendor.routes"));
router.use("/projects", require("./project.routes"));
router.use("/site-visits", require("./siteVisit.routes"));
router.use("/quotes", require("./quote.routes"));
router.use("/milestones", require("./milestone.routes"));
router.use("/documents", require("./document.routes"));
router.use("/milestone-payments", require("./milestonePayment.routes"));
router.use("/admin", require("./admin.routes"));

module.exports = router;
