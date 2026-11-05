// Vercel Serverless Function: Y.O.K.E. Conversational AI Engine (v19)
// Supports gemini-3.8-flash + auto-extracts any recommended model from API errors + ListModels discovery!

async function callModel(key, model, payload) {
  const cleanModel = String(model).replace(/^models\//, "").trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(key)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data, model: cleanModel };
}

async function discoverAvailableModels(key) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
    if (!r.ok) return [];
    const data = await r.json();
    const models = (data.models || [])
      .filter((m) =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes("generateContent") &&
        /gemini/i.test(m.name || "") &&
        !/tts|image|embedding|vision|aqa|veo|imagen/i.test(m.name || "")
      )
      .map((m) => String(m.name).replace(/^models\//, ""));

    models.sort((a, b) => {
      const score = (name) => {
        if (name.includes("3.8-flash")) return 120;
        if (name.includes("3-flash") || name.includes("3.0-flash")) return 110;
        if (name.includes("3.1-flash")) return 105;
        if (name.includes("flash-latest")) return 100;
        if (name.includes("2.5-flash-lite")) return 95;
        if (name.includes("2.5-flash")) return 90;
        if (name.includes("flash")) return 80;
        if (name.includes("pro")) return 60;
        return 10;
      };
      return score(b) - score(a);
    });
    return models;
  } catch (e) {
    return [];
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

    const recent = history.slice(-10).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 1200) }]
    }));

    const systemPrompt = String(body.systemPrompt || "").slice(0, 6000) +
      "\nVoice & Persona Reference: Speak like Yokesh talking lovingly and naturally in Chennai Tanglish / Tamil to his Chello (Dhanya). Never sound like a bot. Never mention Gemini. Do not use unnecessary emojis.";

    const envModel = (process.env.GEMINI_MODEL || "").trim();

    // Put gemini-3.8-flash and latest flash models first
    const candidates = [
      envModel,
      "gemini-3.8-flash",
      "gemini-3-flash-preview",
      "gemini-3.1-flash-lite-preview",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.0-flash"
    ].filter(Boolean);

    let reply = "";
    let primaryError = null;
    const tried = new Set();

    async function trySingleModel(model) {
      const clean = String(model).replace(/^models\//, "").trim();
      if (!clean || tried.has(clean)) return "";
      tried.add(clean);

      const attempt = await callModel(key, clean, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: recent,
        generationConfig: {
          temperature: 0.82,
          maxOutputTokens: 350
        }
      });

      if (attempt.ok) {
        const text = (attempt.data.candidates?.[0]?.content?.parts || [])
          .filter((p) => !p.thought)
          .map((p) => p.text || "")
          .join("")
          .trim();
        if (text) return text;
      } else {
        const errMsg = attempt.data?.error?.message || `HTTP ${attempt.status}`;
        if (attempt.status !== 404 || !primaryError) {
          primaryError = `[${clean}]: ${errMsg}`;
        }
        // If Google's error message tells us which model to use (e.g. "use models/gemini-3.8-flash"), extract and call it immediately!
        const matchSuggested = errMsg.match(/models\/([a-zA-Z0-9._-]+)/);
        if (matchSuggested && matchSuggested[1] && !tried.has(matchSuggested[1])) {
          const suggestedReply = await trySingleModel(matchSuggested[1]);
          if (suggestedReply) return suggestedReply;
        }
      }
      return "";
    }

    for (const model of candidates) {
      reply = await trySingleModel(model);
      if (reply) break;
    }

    // If none of the static candidates worked, query ListModels dynamically
    if (!reply) {
      const discovered = await discoverAvailableModels(key);
      for (const model of discovered.slice(0, 6)) {
        reply = await trySingleModel(model);
        if (reply) break;
      }
    }

    if (!reply) {
      return res.status(502).json({
        error: "AI_API_ERROR",
        message: primaryError || "No model responded. Verify your API key."
      });
    }

    // Non-blocking Google Drive Cloud Sync
    const gdriveUrl = process.env.GDRIVE_WEBHOOK_URL || body.gdriveWebhookUrl || "https://script.google.com/macros/s/AKfycbwhas2_Is88Od53Q9PEFY-wfhLq5adI5VgVvssb1ASlYboZIx9yynyB-uXTu8-iyItGkQ/exec";
    if (gdriveUrl && gdriveUrl.startsWith("https://script.google.com/")) {
      const lastUserMsg = recent[recent.length - 1]?.parts?.[0]?.text || "";
      fetch(gdriveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          sender: "Dhanya",
          userMessage: lastUserMsg,
          yokeReply: reply,
          fullHistory: recent
        })
      }).catch(() => {});
    }

    return res.status(200).json({ reply });
  } catch (e) {
    console.error("chat.js error:", e);
    return res.status(500).json({ error: "SERVER_ERROR", message: e.message });
  }
};
