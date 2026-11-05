// Vercel Serverless Function: Y.O.K.E. Fast Conversational AI Engine (v18)
// Optimized for sub-second response latency & non-blocking Google Drive Cloud Sync!

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

    // Keep last 10 turns for ultra-fast latency
    const recent = history.slice(-10).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 1200) }]
    }));

    const systemPrompt = String(body.systemPrompt || "").slice(0, 6000) +
      "\nVoice & Persona Reference: Speak in Yokesh's exact natural Chennai Tanglish / Tamil voice ('Hii chello...'). Never mention Gemini. Do not use unnecessary emojis.";

    const envModel = (process.env.GEMINI_MODEL || "").trim();
    const validEnvModel = envModel && !/1\.5/i.test(envModel) ? envModel : null;

    // Prioritize fastest flash models first
    const candidates = [
      validEnvModel,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash"
    ].filter(Boolean);

    let reply = "";
    let primaryError = null;

    for (const model of candidates) {
      const attempt = await callModel(key, model, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: recent,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 320,
          thinkingConfig: model.includes("2.5") ? { thinkingBudget: 0 } : undefined
        }
      });

      if (attempt.ok) {
        const text = (attempt.data.candidates?.[0]?.content?.parts || [])
          .filter((p) => !p.thought)
          .map((p) => p.text || "")
          .join("")
          .trim();
        if (text) {
          reply = text;
          break;
        }
      } else {
        // Retry once without thinkingConfig if the model doesn't support thinkingConfig
        if (attempt.status === 400 && model.includes("2.5")) {
          const retry = await callModel(key, model, {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: recent,
            generationConfig: { temperature: 0.8, maxOutputTokens: 320 }
          });
          if (retry.ok) {
            const text = (retry.data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
            if (text) {
              reply = text;
              break;
            }
          }
        }
        const errMsg = attempt.data?.error?.message || `HTTP ${attempt.status}`;
        if (attempt.status !== 404 || !primaryError) {
          primaryError = `[${model}]: ${errMsg}`;
        }
      }
    }

    if (!reply) {
      return res.status(502).json({
        error: "AI_API_ERROR",
        message: primaryError || "No model responded. Verify your API key."
      });
    }

    // Fire-and-forget non-blocking Google Drive sync
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
