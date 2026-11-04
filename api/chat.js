// Vercel Serverless Function: Y.O.K.E. Real Gemini AI Brain + Auto Model Discovery (v13)
// Automatically discovers active Gemini models via ListModels & uses audio/test.m4a for Yokesh's style!
const fs = require("fs");
const path = require("path");

let cachedVoiceBase64 = null;
function getVoiceSample() {
  if (cachedVoiceBase64 !== null) return cachedVoiceBase64;
  const candidates = [
    path.join(process.cwd(), "audio", "test.m4a"),
    path.join(__dirname, "..", "audio", "test.m4a")
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        cachedVoiceBase64 = fs.readFileSync(p).toString("base64");
        return cachedVoiceBase64;
      }
    } catch (e) {}
  }
  cachedVoiceBase64 = "";
  return "";
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

    // Sort so flash/2.5/2.0 models come first for fast chat responses
    models.sort((a, b) => {
      const score = (name) => {
        if (name === "gemini-2.5-flash") return 100;
        if (name.includes("2.5-flash")) return 90;
        if (name.includes("2.0-flash")) return 80;
        if (name.includes("flash")) return 70;
        if (name.includes("2.5-pro") || name.includes("pro")) return 60;
        return 10;
      };
      return score(b) - score(a);
    });
    return models;
  } catch (e) {
    return [];
  }
}

async function callGeminiModel(key, model, payload) {
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
      message: "GEMINI_API_KEY is not set in Vercel Environment Variables (or config.js)."
    });
  }

  try {
    const history = Array.isArray(body.history) ? body.history : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "history is empty" });
    }

    const recent = history.slice(-20).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 1500) }]
    }));

    const systemPrompt = String(body.systemPrompt || "").slice(0, 8000);
    const voiceSample = getVoiceSample();

    const contentsWithVoice = [];
    if (voiceSample) {
      contentsWithVoice.push({
        role: "user",
        parts: [
          { inlineData: { mimeType: "audio/mp4", data: voiceSample } },
          {
            text: "Listen to Yokesh's real voice recording above ('Hii chellam...'). Adopt his exact warm, playful, romantic Chennai Tanglish / Tamil speaking style, tone, and rhythm (using pet names like chellam, thangam, kuttyma, da, ma). Answer every question naturally, intelligently, and conversationally just like Gemini, while staying in character as Y.O.K.E. AI created by Yokesh for Dhanya."
          }
        ]
      });
      contentsWithVoice.push({
        role: "model",
        parts: [
          {
            text: "Hii chellam! Naan Yokesh oda exact voice tone matrum Chennai Tanglish style-ah appadiye kathukitten. Ippo nee enna ketalum semma natural-ah, real conversation maadhiriye pesuven! 💗"
          }
        ]
      });
    }
    contentsWithVoice.push(...recent);

    // Active 2026 Gemini models (retired 1.5 models removed!)
    const envModel = (process.env.GEMINI_MODEL || "").trim();
    const validEnvModel = envModel && !/1\.5/i.test(envModel) ? envModel : null;

    const baseCandidates = [
      validEnvModel,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest",
      "gemini-2.5-pro"
    ].filter(Boolean);

    let reply = "";
    let primaryError = null;

    async function tryModels(modelList) {
      for (const model of modelList) {
        // 1. Try text-first or multimodal with voice sample
        const attempt1 = await callGeminiModel(key, model, {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: contentsWithVoice,
          generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
        });

        if (attempt1.ok) {
          const text = (attempt1.data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
          if (text) return text;
        } else {
          // Record the first non-404 error (e.g., 400 Invalid Key, 403, or 429 Quota) so a later 404 never hides it!
          const errMsg = attempt1.data?.error?.message || `HTTP ${attempt1.status}`;
          if (attempt1.status !== 404 || !primaryError) {
            primaryError = `[${model}]: ${errMsg}`;
          }
        }

        // 2. If multimodal audio/mp4 caused a 400 error on this model, immediately retry text-only!
        if (voiceSample && attempt1.status !== 404) {
          const attempt2 = await callGeminiModel(key, model, {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: recent,
            generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
          });
          if (attempt2.ok) {
            const text = (attempt2.data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
            if (text) return text;
          }
        }
      }
      return "";
    }

    reply = await tryModels(baseCandidates);

    // 3. If none of the static model names matched, dynamically call ListModels to find every model enabled for this API key!
    if (!reply) {
      const discovered = await discoverAvailableModels(key);
      const unseen = discovered.filter((m) => !baseCandidates.includes(m));
      if (unseen.length > 0) {
        reply = await tryModels(unseen.slice(0, 5));
      }
    }

    if (!reply) {
      return res.status(502).json({
        error: "GEMINI_API_ERROR",
        message: primaryError || "No supported Gemini model responded. Verify your GEMINI_API_KEY at aistudio.google.com/apikey."
      });
    }

    // Optional: Sync chat turn to Google Drive
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
