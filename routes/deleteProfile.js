/** @format */
const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  DELETE /api/profile/delete
//  1. Fetch and delete all posts by this profile
//  2. Flag profile as deleted using real walletAddress
//
//  Body: { profileId, walletAddress }
// ─────────────────────────────────────────────
router.delete("/", async (req, res) => {
  const { profileId, walletAddress } = req.body;

  if (!profileId)
    return res
      .status(400)
      .json({ success: false, error: "profileId is required." });
  if (!walletAddress)
    return res
      .status(400)
      .json({ success: false, error: "walletAddress is required." });

  const errors = [];
  let deletedCount = 0;
  let myPosts = [];

  try {
    // ── Step 1: Fetch all posts by this profile ──
    try {
      const { data } = await tapestry.get("/contents", {
        params: { page: 1, pageSize: 100 },
      });
      myPosts = (data?.contents ?? []).filter(
        (c) => c.authorProfile?.id === profileId,
      );
      console.log(`Found ${myPosts.length} posts for ${profileId}`);
    } catch (err) {
      console.error("Fetch posts error:", err?.response?.data ?? err.message);
      errors.push("Could not fetch posts.");
    }

    // ── Step 2: Delete each post individually ──
    if (myPosts.length > 0) {
      const results = await Promise.allSettled(
        myPosts.map((post) => tapestry.delete(`/contents/${post.content.id}`)),
      );
      deletedCount = results.filter((r) => r.status === "fulfilled").length;
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(
            `Failed to delete post ${myPosts[i]?.content?.id}:`,
            r.reason?.response?.data ?? r.reason?.message,
          );
          errors.push(`Could not delete post ${myPosts[i]?.content?.id}`);
        }
      });
    }

    // ── Step 3: Flag profile as deleted using the real walletAddress ──
    try {
      await tapestry.post("/profiles/findOrCreate", {
        walletAddress, // use the real wallet address
        username: profileId,
        blockchain: "SOLANA",
        execution: "FAST_UNCONFIRMED",
        properties: [
          { key: "bio", value: "" },
          { key: "image", value: "" },
          { key: "website", value: "" },
          { key: "deleted", value: "true" },
          { key: "deletedAt", value: new Date().toISOString() },
        ],
      });
      console.log(`✅ Profile ${profileId} flagged as deleted`);
    } catch (err) {
      console.error("Flag deleted error:", err?.response?.data ?? err.message);
      errors.push("Could not flag profile as deleted.");
    }

    return res.status(200).json({
      success: true,
      message: `Profile deleted. ${deletedCount}/${myPosts.length} posts removed.`,
      deletedPosts: deletedCount,
      totalPosts: myPosts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;