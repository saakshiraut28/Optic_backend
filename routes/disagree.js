/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  POST /api/disagree
//  Disagree with a post by submitting a counter-argument.
//  A reason (text) is mandatory. Proof fields are optional but encouraged.
//
//  FRONTEND NOTE:
//  When user clicks "Disagree", open a modal.
//  Keep submit disabled until `reason` is filled.
//  Optionally call DELETE /api/agree first if the user had previously agreed.
//
//  Body: {
//    profileId,
//    postId,
//    reason,         — required: the counter-argument text
//    proofUrl?,      — optional: link to supporting source
//    proofMedia?,    — optional: CDN URL of image/video
//    proofCitation?, — optional: text-based reference
//  }
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { profileId, postId, reason, proofUrl, proofMedia, proofCitation } =
      req.body;

    const customProperties = [{ key: "type", value: "disagreement" }];

    if (proofUrl) customProperties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia)
      customProperties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      customProperties.push({ key: "proofCitation", value: proofCitation });

    const { data } = await tapestry.post("/comments", {
      profileId,
      contentId: postId,
      text: reason,
      customProperties,
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/disagree/:postId
//  Get all disagreements on a post.
//  Filter by customProperties.type === "disagreement" on the frontend
//  if you also have neutral replies and want to separate them.
//
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
//
//  Body: { reason?, proofUrl?, proofMedia?, proofCitation? }
// ─────────────────────────────────────────────
router.put("/:commentId", async (req, res) => {
  try {
    const { reason, proofUrl, proofMedia, proofCitation } = req.body;

    const customProperties = [];
    if (proofUrl) customProperties.push({ key: "proofUrl", value: proofUrl });
    if (proofMedia)
      customProperties.push({ key: "proofMedia", value: proofMedia });
    if (proofCitation)
      customProperties.push({ key: "proofCitation", value: proofCitation });

    const { data } = await tapestry.put(`/comments/${req.params.commentId}`, {
      ...(reason && { text: reason }),
      ...(customProperties.length && { customProperties }),
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
