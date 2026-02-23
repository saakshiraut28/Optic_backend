/** @format */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// ── Route modules ──
const profileRoutes = require("./routes/profile");
const followRoutes = require("./routes/follow");
const searchRoutes = require("./routes/search");
const postRoutes = require("./routes/posts");
const agreeRoutes = require("./routes/agree");
const disagreeRoutes = require("./routes/disagree");
const notificationRoutes = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT ?? 3000;

// ─────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
  }),
);
app.use(express.json());
app.use(morgan("dev"));


app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: process.env.TAPESTRY_NAMESPACE ?? "Optic",
    version: "1.0.0",
  });
});


// Profile  — create, view, update, followers, following
app.use("/api/profile", profileRoutes);

// Follow   — follow / unfollow a user
app.use("/api/follow", followRoutes);

// Search   — search users + suggested users
app.use("/api/search", searchRoutes);

// Posts    — create, read, update, delete, feed
app.use("/api/posts", postRoutes);

// Agree    — agree, un-agree, count, check status
app.use("/api/agree", agreeRoutes);

// Disagree — disagree with proof, edit, delete, list
app.use("/api/disagree", disagreeRoutes);

// Notifications — agree / disagree / reply / follow alerts
app.use("/api/notifications", notificationRoutes);

// ─────────────────────────────────────────────
//  404 CATCH-ALL
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─────────────────────────────────────────────
//  GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});


app.listen(PORT, () => {
  console.log(` Optic API running on http://localhost:${PORT}`);
  console.log(` Namespace: ${process.env.TAPESTRY_NAMESPACE ?? "Optic"}`);
});

module.exports = app;