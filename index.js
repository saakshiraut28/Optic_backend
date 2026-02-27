/** @format */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// ── Route modules ──
const profileRoutes = require("./routes/profile");
const verifyRoutes = require("./routes/verify");
const authRoutes = require("./routes/auth");
const followRoutes = require("./routes/follow");
const searchRoutes = require("./routes/search");
const postRoutes = require("./routes/posts");
const agreeRoutes = require("./routes/agree");
const disagreeRoutes = require("./routes/disagree");
const notificationRoutes = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT;

// ─────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://optic-solana.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.options("*", cors()); // handle preflight requests
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: process.env.TAPESTRY_NAMESPACE ?? "ProofApp",
    version: "1.0.0",
  });
});

// ─────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────

// Verify — ai route
app.use("/api/verify", verifyRoutes);

// Auth — for user signup and login
app.use("/api/auth", authRoutes);

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

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`ProofApp API running on http://localhost:${PORT}`);
  console.log(`Namespace: ${process.env.TAPESTRY_NAMESPACE ?? "ProofApp"}`);
});

module.exports = app;