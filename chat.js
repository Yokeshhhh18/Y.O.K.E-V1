// Vercel Serverless Function: Y.O.K.E. Ultra-Fast Conversational Engine (v20)
// Responds immediately after text by caching the working model & racing fast models in parallel with thinkingBudget: 0!

let cachedWorkingModel = null;

async function callModelFast(key, model, systemPrompt, recent, useNoThinking = true) {
  const cleanModel = String(model).replace(/^models\//, "").trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(key)}`;

  const genConfig = {
    temperature: 0.8,
    maxOutputTokens: 180
  };
  if (useNoThinking && (cleanModel.includes("2.5") || cleanModel.includes("3"))) {
    genConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: recent,
        generationConfig: genConfig
      })
    });
    clearTimeout(timer);
    const data = await r.json().catch(() => ({}));

    if (r.ok) {
      const text = (data.candidates?.[0]?.content?.parts || [])
        .filter((p) => !p.thought)
        .map((p) => p.text || "")
        .join("")
        .trim();
      if (text) return { ok: true, reply: text, model: cleanModel };
    }

    // If thinkingConfig caused a 400 error on this model, immediately retry without thinkingConfig
    if (r.status === 400 && useNoThinking && genConfig.thinkingConfig) {
      return await callModelFast(key, cleanModel, systemPrompt, recent, false);
    }

    const errMsg = data?.error?.message || `HTTP ${r.status}`;
    // If Google's error message tells us which model to use (e.g., "use models/gemini-3.8-flash"), call it immediately!
    const matchSuggested = errMsg.match(/models\/([a-zA-Z0-9._-]+)/);
    if (matchSuggested && matchSuggested[1] && matchSuggested[1] !== cleanModel) {
      return await callModelFast(key, matchSuggested[1], systemPrompt, recent, true);
    }

    return { ok: false, status: r.status, error: `[${cleanModel}]: ${errMsg}`, model: cleanModel };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 500, error: `[${cleanModel}]: ${err.message}`, model: cleanModel };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const key = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    body.apiKey ||
    ""
  ).trim();

  if (!key) {
    return res.status(500).json({
      error: "MISSING_API_KEY",
      message: "API key is not set in Vercel Environment Variables (or config.js)."
    });
  }

  try {
    const history = Array.isArray(body.history) ? body.history : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "history is empty" });
    }

    // Keep last 6 turns for sub-second response speed
    const recent = history.slice(-6).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 800) }]
    }));

    const systemPrompt = String(body.systemPrompt || "").slice(0, 3500) +
      "\nKeep reply concise (1-2 natural sentences in Chennai Tanglish/Tamil). Never mention Gemini. No emojis.";

    // 1. If we already know the working fast model (from client cache or server memory), call it directly first!
    const fastTarget = body.preferredModel || process.env.GEMINI_MODEL || cachedWorkingModel;
    if (fastTarget) {
      const directHit = await callModelFast(key, fastTarget, systemPrompt, recent, true);
      if (directHit.ok && directHit.reply) {
        cachedWorkingModel = directHit.model;
        return res.status(200).json({ reply: directHit.reply, model: directHit.model });
      }
    }

    // 2. Otherwise, race the top fast models in PARALLEL so whichever model is active on this API key answers immediately without sequential waiting!
    const parallelCandidates = [
      "gemini-3.8-flash",
      "gemini-3-flash-preview",
      "gemini-3.1-flash-lite-preview",
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-2.0-flash"
    ];

    let winner = null;
    let errors = [];

    try {
      winner = await Promise.any(
        parallelCandidates.map(async (m) => {
          const resObj = await callModelFast(key, m, systemPrompt, recent, true);
          if (resObj.ok && resObj.reply) return resObj;
          errors.push(resObj.error);
          throw new Error(resObj.error);
        })
      );
    } catch (aggErr) {
      winner = null;
    }

    // 3. If parallel race didn't find one, dynamically query ListModels once
    if (!winner) {
      try {
        const lr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
        if (lr.ok) {
          const ld = await lr.json();
          const discovered = (ld.models || [])
            .filter((m) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes("generateContent") &&
              /gemini/i.test(m.name || "") &&
              !/tts|image|embedding|vision|aqa|veo|imagen/i.test(m.name || "")
            )
            .map((m) => String(m.name).replace(/^models\//, ""));

          for (const dm of discovered.slice(0, 4)) {
            const attempt = await callModelFast(key, dm, systemPrompt, recent, true);
            if (attempt.ok && attempt.reply) {
              winner = attempt;
              break;
            }
          }
        }
      } catch (e) {}
    }

    if (!winner || !winner.reply) {
      return res.status(502).json({
        error: "AI_API_ERROR",
        message: errors[0] || "No model responded. Verify your API key."
      });
    }

    cachedWorkingModel = winner.model;

    // Non-blocking Google Drive Cloud Sync
    const gdriveUrl = process.env.GDRIVE_WEBHOOK_URL || body.gdriveWebhookUrl;
    if (gdriveUrl && gdriveUrl.startsWith("https://script.google.com/")) {
      const lastUserMsg = recent[recent.length - 1]?.parts?.[0]?.text || "";
      fetch(gdriveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          sender: "Dhanya",
          userMessage: lastUserMsg,
          yokeReply: winner.reply,
          fullHistory: recent
        })
      }).catch(() => {});
    }

    return res.status(200).json({ reply: winner.reply, model: winner.model });
  } catch (e) {
    console.error("chat.js error:", e);
    return res.status(500).json({ error: "SERVER_ERROR", message: e.message });
  }
};
