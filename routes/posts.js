/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  POST /api/posts
//  Create a new post with optional proof.
//
//  Body: {
//    profileId,
//    content,
//    proofType?,     — "link" | "media" | "citation" | "mixed"
//    proofUrl?,      — URL string
//    proofMedia?,    — CDN URL of uploaded image/video
//    proofCitation?, — plain text reference e.g. "Smith et al., 2023"
//  }
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      profileId,
      content,
      proofType,
      proofUrl,
      proofMedia,
      proofCitation,
    } = req.body;

    const customProperties = [{ key: "postType", value: "original" }];

    if (proofType)
      customProperties.push({ key: "proofType", value: proofType });
    if (proofUrl) customProperties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia)
      customProperties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      customProperties.push({ key: "proofCitation", value: proofCitation });

    const { data } = await tapestry.post("/contents/findOrCreate", {
      profileId,
      content,
      contentType: "text",
      blockchain: "SOLANA",
      execution: "FAST_UNCONFIRMED",
      customProperties,
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/posts/feed/home
//  Get posts from users the current user follows (home feed).
//
//  Query: ?profileId=johndoe&page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/feed/home", async (req, res) => {
  try {
    const { profileId, page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get(`/contents/following/${profileId}`, {
      params: { page, pageSize },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/posts/feed/explore
//  Get all posts in the namespace (explore / global feed).
//
//  Query: ?page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/feed/explore", async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get("/contents", {
      params: { page, pageSize },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/posts/user/:profileId
//  Get all posts created by a specific user.
//
//  Query: ?page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/user/:profileId", async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get(
      `/contents/profile/${req.params.profileId}`,
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
//  GET /api/posts/:postId
//  Get a single post by ID.
// ─────────────────────────────────────────────
router.get("/:postId", async (req, res) => {
  try {
    const { data } = await tapestry.get(`/contents/${req.params.postId}`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  PUT /api/posts/:postId
//  Update a post's content or proof fields.
//
//  Body: { content?, proofType?, proofUrl?, proofMedia?, proofCitation? }
// ─────────────────────────────────────────────
router.put("/:postId", async (req, res) => {
  try {
    const { content, proofType, proofUrl, proofMedia, proofCitation } =
      req.body;

    const customProperties = [];
    if (proofType)
      customProperties.push({ key: "proofType", value: proofType });
    if (proofUrl) customProperties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia)
      customProperties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      customProperties.push({ key: "proofCitation", value: proofCitation });

    const { data } = await tapestry.put(`/contents/${req.params.postId}`, {
      id: req.params.postId,
      ...(content && { content }),
      ...(customProperties.length && { customProperties }),
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  DELETE /api/posts/:postId
//  Delete a post by ID.
// ─────────────────────────────────────────────
router.delete("/:postId", async (req, res) => {
  try {
    const { data } = await tapestry.delete(`/contents/${req.params.postId}`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;
