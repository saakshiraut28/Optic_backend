/** @format */

const express = require("express");
const router = express.Router();
const axios = require("axios");

// ─────────────────────────────────────────────
//  POST /api/verify
//  Uses Claude to verify if a post's claim is
//  supported by the provided proof.
//
//  Body: { content, proofUrl?, proofMedia?, proofCitation? }
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { content, proofUrl, proofMedia, proofCitation } = req.body;

  if (!content?.trim()) {
    return res
      .status(400)
      .json({ success: false, error: "No content provided." });
  }

  // Build proof context string
  const proofParts = [];
  if (proofUrl) proofParts.push(`Proof URL: ${proofUrl}`);
  if (proofMedia) proofParts.push(`Proof Media URL: ${proofMedia}`);
  if (proofCitation) proofParts.push(`Proof Citation: ${proofCitation}`);
  const proofContext =
    proofParts.length > 0 ? proofParts.join("\n") : "No proof provided.";

  const prompt = `You are a strict fact-checking and content moderation assistant for a social platform where users post claims and back them up with proof.

A user wants to post the following:
"${content.trim()}"

Proof provided:
${proofContext}

---

Follow these rules strictly:

1️⃣ POST ELIGIBILITY RULES
Reject the post (approved: false) if:
- It is a greeting or low-value content (e.g., "hi", "gm", "yo", "hello guys", "good morning")
- It is a casual or personal question (e.g., "what's the weather?", "how are you?")
- It does not contain a meaningful claim, question, or verifiable statement
- It is spam, vague, or lacks context

Accept the post (approved: true) if:
- It contains a factual claim
- It asks about the truth of a claim (e.g., "Is ChatGPT really hiring?")
- It shares news, data, or an event that can be verified
- It provides proof, links, screenshots, or references

2️⃣ CLAIM VERIFICATION RULES
If the post contains a factual claim, evaluate whether it is:
- True
- Likely True
- Unverified
- Misleading
- False

If False or Misleading:
- Provide a short 1–3 sentence explanation
- Clearly explain what makes it incorrect
- Mention if evidence is outdated, manipulated, or from unreliable sources

If the claim cannot be verified:
- Mark it as "Unverified" and explain why

Be neutral, concise, and evidence-based. Do NOT hallucinate unknown facts. Do NOT invent sources.

3️⃣ VERIFICATION SCORE
Return a score from 0 to 100:
- 90–100 → Highly credible / verified
- 70–89 → Likely true but limited verification
- 40–69 → Unverified / unclear
- 10–39 → Likely misleading
- 0–9 → False / clearly misinformation

For rejected posts (greetings, spam, low-value), set score to 0.

---

Respond ONLY with a JSON object in this exact format, no other text, no markdown:
{
  "approved": true or false,
  "status": "True" | "Likely True" | "Unverified" | "Misleading" | "False" | "Rejected",
  "score": 0-100,
  "reason": "A short 1-3 sentence explanation."
}`;

  try {
    const { data } = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5",
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      },
    );

    const raw = data.content?.[0]?.text ?? "";

    // Strip markdown code fences if present
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Enforce approval logic based on status + score
    // Don't trust Claude's approved field alone — derive it from status/score
    const rejectedStatuses = ["False", "Misleading", "Rejected"];
    const approved =
      !rejectedStatuses.includes(parsed.status) && (parsed.score ?? 50) >= 40;

    return res.status(200).json({
      success: true,
      approved,
      status: parsed.status ?? "Unverified",
      score: parsed.score ?? 50,
      reason: parsed.reason ?? "",
    });
  } catch (err) {
    const errData = err?.response?.data;
    const errMsg = err?.message;
    const errStatus = err?.response?.status;
    console.error("Verify error status:", errStatus);
    console.error("Verify error data:", JSON.stringify(errData, null, 2));
    console.error("Verify error message:", errMsg);
    // If AI fails, allow the post through — don't block users due to API issues
    return res.status(200).json({
      success: true,
      approved: true,
      status: "Unverified",
      score: 50,
      reason: `Verification unavailable (${errStatus ?? errMsg}), post allowed.`,
    });
  }
});

module.exports = router;