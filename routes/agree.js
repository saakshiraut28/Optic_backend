/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  POST /api/agree
//  Agree with a post (like).
//
//  Body: { profileId, postId }
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { profileId, postId } = req.body;

    const { data } = await tapestry.post("/likes", {
      profileId,
      contentId: postId,
      blockchain: "SOLANA",
      execution: "FAST_UNCONFIRMED",
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  DELETE /api/agree
//  Remove an agreement (un-agree / un-like).
//  Called when user accidentally agreed or wants to undo.
//
//  Body: { profileId, postId }
// ─────────────────────────────────────────────
router.delete("/", async (req, res) => {
  try {
    const { profileId, postId } = req.body;

    const { data } = await tapestry.delete("/likes", {
      data: {
        profileId,
        contentId: postId,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/agree/:postId/count
//  Get total agree count for a post.
// ─────────────────────────────────────────────
router.get("/:postId/count", async (req, res) => {
  try {
    const { data } = await tapestry.get(
      `/likes/content/${req.params.postId}/count`,
    );
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/agree/check
//  Check if a specific user has agreed with a specific post.
//  Used to render the agree button state on the frontend.
//
//  Query: ?profileId=johndoe&postId=abc123
// ─────────────────────────────────────────────
router.get("/check", async (req, res) => {
  try {
    const { profileId, postId } = req.query;

    const { data } = await tapestry.get("/likes", {
      params: {
        profileId,
        contentId: postId,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;
