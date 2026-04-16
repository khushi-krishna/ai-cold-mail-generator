const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const aiController = require("../controllers/aiController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });


router.post("/generate-email", protect, aiController.generateEmail);
router.post("/generate-resume", protect, upload.single("resume"), aiController.generateFromResume); // ✅
router.get("/history", protect, aiController.getHistory);
router.delete("/history", protect, aiController.clearHistory);

module.exports = router;