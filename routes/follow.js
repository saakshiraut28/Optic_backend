/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  POST /api/follow
//  Follow a user.
//
//  Body: { followerId, targetId }
//  followerId — the person doing the following
//  targetId   — the person being followed
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { followerId, targetId } = req.body;

    const { data } = await tapestry.post("/followers", {
      startId: followerId,
      endId: targetId,
      blockchain: "SOLANA",
      execution: "FAST_UNCONFIRMED",
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  DELETE /api/follow
//  Unfollow a user.
//
//  Body: { followerId, targetId }
// ─────────────────────────────────────────────
router.delete("/", async (req, res) => {
  try {
    const { followerId, targetId } = req.body;

    const { data } = await tapestry.delete("/followers", {
      data: {
        startId: followerId,
        endId: targetId,
        blockchain: "SOLANA",
        execution: "FAST_UNCONFIRMED",
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;
