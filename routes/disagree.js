/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  POST /api/disagree
//  Disagree with a post by submitting a counter-argument.
//  reason (text) is mandatory. Proof fields are optional.
//
//
//  Body: { profileId, postId, reason, proofUrl?, proofMedia?, proofCitation? }
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { profileId, postId, reason, proofUrl, proofMedia, proofCitation } =
      req.body;

    const properties = [
      { key: "type", value: "disagreement" },
      { key: "text", value: reason }, // store text as property so it comes back in GET
    ];

    if (proofUrl) properties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia) properties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      properties.push({ key: "proofCitation", value: proofCitation });

    const { data } = await tapestry.post("/comments", {
      profileId,
      contentId: postId,
      text: reason,
      properties,
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/disagree/:postId
//  Get all disagreements on a post.
//  Query: ?page=1&pageSize=20
// ─────────────────────────────────────────────
router.get("/:postId", async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const { data } = await tapestry.get("/comments", {
      params: {
        contentId: req.params.postId,
        page,
        pageSize,
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  PUT /api/disagree/:commentId
//  Edit an existing disagreement.
//  Body: { reason?, proofUrl?, proofMedia?, proofCitation? }
// ─────────────────────────────────────────────
router.put("/:commentId", async (req, res) => {
  try {
    const { reason, proofUrl, proofMedia, proofCitation } = req.body;

    const properties = [];
    if (reason) properties.push({ key: "text", value: reason });
    if (proofUrl) properties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia) properties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      properties.push({ key: "proofCitation", value: proofCitation });

    const { data } = await tapestry.put(`/comments/${req.params.commentId}`, {
      ...(reason && { text: reason }),
      ...(properties.length && { properties }),
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  DELETE /api/disagree/:commentId
//  Delete a disagreement by comment ID.
// ─────────────────────────────────────────────
router.delete("/:commentId", async (req, res) => {
  try {
    const { data } = await tapestry.delete(`/comments/${req.params.commentId}`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;