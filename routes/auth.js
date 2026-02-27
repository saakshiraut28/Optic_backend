/** @format */
const express = require("express");
const router = express.Router();
const nacl = require("tweetnacl");
const bs58 = require("bs58");
const tapestry = require("../config/tapestry");

// Helper — convert wallet address to tapestry profile id
const tapestryError = (res, error) => {
  const msg = error?.response?.data ?? error.message;
  return res.status(500).json({ success: false, error: msg });
};

// ─────────────────────────────────────────────
//  GET /api/auth/nonce
//  Returns a nonce message for the wallet to sign
// ─────────────────────────────────────────────
router.get("/nonce", (req, res) => {
  const nonce = `Sign in to Optic\nNonce: ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return res.status(200).json({ success: true, nonce });
});

// ─────────────────────────────────────────────
//  POST /api/auth/signup
//  Creates a new profile with wallet address
//  Body: { walletAddress, username, signature, nonce }
// ─────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { walletAddress, username, signature, nonce } = req.body;
    if (!walletAddress || !username || !signature || !nonce) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    // ── Verify signature ──
    const isValid = verifySignature(walletAddress, signature, nonce);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid wallet signature." });
    }

    // ── Create profile on Tapestry ──
    const { data } = await tapestry.post("/profiles/findOrCreate", {
      walletAddress,
      username,
      blockchain: "SOLANA",
      execution: "FAST_UNCONFIRMED",
      properties: [
        { key: "username", value: username },
        { key: "walletAddress", value: walletAddress },
      ],
    });

    const profile = data?.profile ?? data;
    return res.status(200).json({
      success: true,
      data: {
        profile,
        walletAddress,
      },
    });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  POST /api/auth/signin
//  Verifies wallet signature and returns profile
//  Body: { walletAddress, signature, nonce }
// ─────────────────────────────────────────────
router.post("/signin", async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;
    if (!walletAddress || !signature || !nonce) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    // ── Verify signature ──
    const isValid = verifySignature(walletAddress, signature, nonce);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid wallet signature." });
    }

    // ── Fetch profile by wallet address ──
    const { data } = await tapestry.get("/profiles", {
      params: { walletAddress },
    });

    const profiles = data?.profiles ?? [];
    if (profiles.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          error: "No profile found for this wallet. Please sign up first.",
        });
    }

    const profile = profiles[0]?.profile ?? profiles[0];
    return res.status(200).json({
      success: true,
      data: {
        profile,
        walletAddress,
      },
    });
  } catch (error) {
    return tapestryError(res, error);
  }
});

// ─────────────────────────────────────────────
//  Signature verification helper
// ─────────────────────────────────────────────
function verifySignature(walletAddress, signature, nonce) {
  try {
    const messageBytes = new TextEncoder().encode(nonce);
    const signatureBytes = bs58.default
      ? bs58.default.decode(signature)
      : bs58.decode(signature);
    const publicKeyBytes = bs58.default
      ? bs58.default.decode(walletAddress)
      : bs58.decode(walletAddress);

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );
  } catch (err) {
    console.error("Signature verification error:", err.message);
    return false;
  }
}

module.exports = router;
