const router = require("express").Router();
const projectController = require("../controllers/project.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/", requireAuth, projectController.createProject);
router.get("/me", requireAuth, projectController.getMyProjects);
router.get("/users/:customer_id", requireAuth, projectController.getProjectsByUser);
router.patch("/:project_id/status", requireAuth, projectController.updateProjectStatus);

module.exports = router;
