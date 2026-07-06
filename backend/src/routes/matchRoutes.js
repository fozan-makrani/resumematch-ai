const express = require("express");
const {
  submitMatch,
  getHistory,
  getHistoryDetail,
} = require("../controllers/matchController");
const protect = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

// Order matters: protect populates req.user, rateLimiter depends on it
router.post("/", protect, rateLimiter, submitMatch);
router.get("/history", protect, getHistory);
router.get("/history/:id", protect, getHistoryDetail);

module.exports = router;