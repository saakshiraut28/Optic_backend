/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  NOTIFICATION TYPES (reference)
//
//  "agree"      — someone agreed with your post
//  "disagree"   — someone disagreed with your post (with proof)
//  "reply"      — someone replied to your post
//  "follow"     — someone followed you
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
//  POST /api/notifications/agree
//  Notify a post owner that someone agreed with their post.
//  Call this right after POST /api/agree succeeds.
//
//  Body: { recipientWalletAddress, actorProfileId, postId }
// ─────────────────────────────────────────────
router.post("/agree", async (req, res) => {
  try {
    const { recipientWalletAddress, actorProfileId, postId } = req.body;

    const { data } = await tapestry.post("/notifications", {
      recipientWalletAddress,
      type: "agree",
      message: `@${actorProfileId} agreed with your post.`,
      metadata: {
        contentId: postId,
        actorProfileId,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  POST /api/notifications/disagree
//  Notify a post owner that someone disagreed with their post.
//  Call this right after POST /api/disagree succeeds.
//
//  Body: { recipientWalletAddress, actorProfileId, postId, commentId }
// ─────────────────────────────────────────────
router.post("/disagree", async (req, res) => {
  try {
    const { recipientWalletAddress, actorProfileId, postId, commentId } =
      req.body;

    const { data } = await tapestry.post("/notifications", {
      recipientWalletAddress,
      type: "disagree",
      message: `@${actorProfileId} disagreed with your post and added a counter-proof.`,
      metadata: {
        contentId: postId,
        commentId,
        actorProfileId,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  POST /api/notifications/reply
//  Notify a post owner that someone replied to their post.
//  Call this right after a neutral comment/reply is posted.
//
//  Body: { recipientWalletAddress, actorProfileId, postId, commentId }
// ─────────────────────────────────────────────
router.post("/reply", async (req, res) => {
  try {
    const { recipientWalletAddress, actorProfileId, postId, commentId } =
      req.body;

    const { data } = await tapestry.post("/notifications", {
      recipientWalletAddress,
      type: "reply",
      message: `@${actorProfileId} replied to your post.`,
      metadata: {
        contentId: postId,
        commentId,
        actorProfileId,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  POST /api/notifications/follow
//  Notify a user that someone followed them.
//  Call this right after POST /api/follow succeeds.
//
//  Body: { recipientWalletAddress, actorProfileId }
// ─────────────────────────────────────────────
router.post("/follow", async (req, res) => {
  try {
    const { recipientWalletAddress, actorProfileId } = req.body;

    const { data } = await tapestry.post("/notifications", {
      recipientWalletAddress,
      type: "follow",
      message: `@${actorProfileId} started following you.`,
      metadata: {
        actorProfileId,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/notifications
//  Get all notifications for a user (their notification feed).
//
//  Query: ?walletAddress=USER_WALLET&page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { walletAddress, page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get("/notifications", {
      params: { walletAddress, page, pageSize },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;
