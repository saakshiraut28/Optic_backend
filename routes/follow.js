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

    const { data } = await tapestry.post("/followers/add", {
      startId: followerId,
      endId: targetId,
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

    const { data } = await tapestry.post("/followers/remove", {
      startId: followerId,
      endId: targetId,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/follow/state
//  Check if a user is following another user.
//  Query: ?followerId=Saak&targetId=Saak123
// ─────────────────────────────────────────────
router.get("/state", async (req, res) => {
  try {
    const { followerId, targetId } = req.query;

    const { data } = await tapestry.get("/followers/state", {
      params: {
        startId: followerId,
        endId: targetId,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;