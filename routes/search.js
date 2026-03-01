/** @format */

const express = require("express");
const router = express.Router();
const tapestry = require("../config/tapestry");
const { tapestryError } = require("../config/errorHandler");

// Check deleted flag — works whether it's a direct prop or inside properties array
const isProfileDeleted = (p) => {
  const profile = p?.profile ?? p;
  if (!profile) return false;
  if (profile.deleted === "true") return true;
  if (Array.isArray(profile.properties)) {
    const prop = profile.properties.find((x) => x.key === "deleted");
    if (prop?.value === "true") return true;
  }
  return false;
};

const filterDeleted = (profiles) =>
  (profiles ?? []).filter((p) => !isProfileDeleted(p));

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

    const profiles = filterDeleted(data?.profiles ?? data);
    return res.status(200).json({ success: true, data: { ...data, profiles } });
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
