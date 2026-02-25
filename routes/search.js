/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// ─────────────────────────────────────────────
//  POST /api/search
//  Search for users by username.
//
//  Body: { query, limit?, offset? }
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;

    const { data } = await tapestry.get("/search/profiles", {
      params: { query, limit, offset },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/search/suggested
//  Get suggested users for a given profile.
//  Based on social graph (mutual follows, wallet history).
//
//  Query: ?profileId=johndoe&limit=10
// ─────────────────────────────────────────────
router.get("/suggested", async (req, res) => {
  try {
    return console.log("Still working"); // working on this one
  } catch (error) {
    return tapestryError(res, error);
  }
});

module.exports = router;
