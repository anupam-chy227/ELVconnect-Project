const router = require("express").Router();
const documentController = require("../controllers/document.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/", requireAuth, documentController.uploadDocument);
router.get("/projects/:project_id", requireAuth, documentController.getProjectDocuments);
router.get("/:document_id", requireAuth, documentController.getDocumentById);

module.exports = router;
