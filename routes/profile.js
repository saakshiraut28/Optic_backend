/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  GET /api/profile
//  Fetch a user's full profile by username or profile ID.
// ─────────────────────────────────────────────
router.get("", async (req, res) => {
  try {
    const { data } = await tapestry.get(`/profiles`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  POST /api/profile/findOrCreate
//  Create a new profile or retrieve an existing one.
//  Acts as both Sign Up and Login in one call.
//
//  Body: { walletAddress, username, bio?, profileImage?, website? }
// ─────────────────────────────────────────────
router.post("/findOrCreate", async (req, res) => {
  try {
    const { walletAddress, username, bio, profileImage, website } = req.body;

    const { data } = await tapestry.post("/profiles/findOrCreate", {
      walletAddress,
      username,
      blockchain: "SOLANA",
      execution: "FAST_UNCONFIRMED",
      customProperties: [
        { key: "bio", value: bio ?? "" },
        { key: "profileImage", value: profileImage ?? "" },
        { key: "website", value: website ?? "" },
      ],
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/profile/:id
//  Fetch a user's full profile by username or profile ID.
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const { data } = await tapestry.get(`/profiles/${req.params.id}`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  PUT /api/profile/update
//  Update bio, profileImage, or website for a profile.
//
//  Body: { id, bio?, profileImage?, website? }
// ─────────────────────────────────────────────
router.put("/update", async (req, res) => {
  try {
    const { id, bio, profileImage, website } = req.body;

    const properties = [];
    if (bio !== undefined) properties.push({ key: "bio", value: bio });
    if (profileImage !== undefined)
      properties.push({ key: "profileImage", value: profileImage });
    if (website !== undefined)
      properties.push({ key: "website", value: website });

    const { data } = await tapestry.post("/profiles/update", {
      id,
      blockchain: "SOLANA",
      execution: "FAST_UNCONFIRMED",
      properties,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/profile/:id/followers
//  Get a paginated list of followers for a profile.
//
//  Query: ?page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/:id/followers", async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get(
      `/profiles/${req.params.id}/followers`,
      {
        params: { page, pageSize },
      },
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/profile/:id/following
//  Get a paginated list of profiles this user follows.
//
//  Query: ?page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/:id/following", async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get(
      `/profiles/${req.params.id}/following`,
      {
        params: { page, pageSize },
      },
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/profile/:id/followers/count
//  Get total follower count for a profile.
// ─────────────────────────────────────────────
router.get("/:id/followers/count", async (req, res) => {
  try {
    const { data } = await tapestry.get(
      `/profiles/${req.params.id}/followers/count`,
    );
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/profile/:id/following/count
//  Get total following count for a profile.
// ─────────────────────────────────────────────
router.get("/:id/following/count", async (req, res) => {
  try {
    const { data } = await tapestry.get(
      `/profiles/${req.params.id}/following/count`,
    );
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;
