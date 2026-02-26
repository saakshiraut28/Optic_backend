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
      id,
      profileId,
      content,
      proofType,
      proofUrl,
      proofMedia,
      proofCitation,
    } = req.body;

    // properties must never be empty — always send at least 2 entries.
    // "text" is stored as a property so it comes back in GET responses.
    const properties = [
      { key: "postType", value: "original" },
      { key: "proofType", value: proofType ?? "none" },
      { key: "text", value: content }, // store post body so it appears in responses
    ];

    if (proofUrl) properties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia) properties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      properties.push({ key: "proofCitation", value: proofCitation });

        const postId =
          id ??
          `${profileId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const { data } = await tapestry.post("/contents/findOrCreate", {
      id: postId,
      profileId,
      content,
      contentType: "text",
      blockchain: "SOLANA",
      execution: "FAST_UNCONFIRMED",
      properties,
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/posts/feed/home ->>>> work in progress
//  Get posts from users the current user follows (home feed).
//
//  Query: ?profileId=johndoe&page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/feed/home", async (req, res) => {
  try {
    const { profileId, page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get(`/contents/`, {
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

/// ─────────────────────────────────────────────
//  GET /api/posts/user/:profileId
//  All posts by a specific user.
//
//  Query: ?limit=20&offset=0
// ─────────────────────────────────────────────
router.get("/user/:profileId", async (req, res) => {
  try {
    const { pageSize = 20 } = req.query;
    const { profileId } = req.params;

    // Tapestry has no /contents/profile/:id endpoint.
    // Fetch a broad batch and filter by authorId/creatorId matching the profileId.
    const { data } = await tapestry.get("/contents", {
      params: { limit: 100, offset: 0 },
    });

    const allContents = data?.contents ?? [];

    // Author ID lives at authorProfile.id based on Tapestry response structure
    const userPosts = allContents
      .filter((item) => item?.authorProfile?.id === profileId)
      .slice(0, Number(pageSize));

    return res.status(200).json({ success: true, data: userPosts });
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

    const properties = [];

    // Keep "text" property in sync with content field
    if (content) properties.push({ key: "text", value: content });
    if (proofType) properties.push({ key: "proofType", value: proofType });
    if (proofUrl) properties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia) properties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      properties.push({ key: "proofCitation", value: proofCitation });

    const { data } = await tapestry.put(`/contents/${req.params.postId}`, {
      id: req.params.postId,
      ...(content && { content }),
      ...(properties.length && { properties }),
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
