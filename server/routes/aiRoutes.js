const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/generate-email", protect, aiController.generateEmail);
router.get("/history", protect, aiController.generateHistory);

module.exports = router;
