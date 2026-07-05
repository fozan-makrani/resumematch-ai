const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require('./routes/authRoutes')

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" })); // resume/JD text can be long-ish; default 100kb is too small
app.use(express.urlencoded({ extended: true }));

// Health check — useful for uptime monitoring / deployment sanity checks
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes will be mounted here as we build them:
app.use('/api/auth', authRoutes);
// app.use('/api/match', require('./routes/matchRoutes'));

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler — must be last
app.use(errorHandler);

module.exports = app;