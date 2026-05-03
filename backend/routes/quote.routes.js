const router = require("express").Router();
const quoteController = require("../controllers/quote.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/", requireAuth, quoteController.submitQuote);
router.get("/projects/:project_id", requireAuth, quoteController.getProjectQuotes);
router.get("/projects/:project_id/compare", requireAuth, quoteController.compareProjectQuotes);

module.exports = router;
