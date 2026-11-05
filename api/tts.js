// Vercel Serverless Function: Y.O.K.E. Tamil & Tanglish Voice Engine
// Uses audio/test.m4a so the AI voice matches Yokesh's warm Chennai Tamil/Tanglish voice!
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

function pcmToWav(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    let body = req.body || {};
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const rawText = String(body.text || "").trim().slice(0, 600);
    const text = rawText.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
    if (!text) return res.status(400).json({ error: "text is empty" });

    // 1. If ElevenLabs Instant Voice Clone of audio/test.m4a is configured, use it first
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    const elevenVoice = process.env.ELEVENLABS_VOICE_ID;
    if (elevenKey && elevenVoice) {
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice}`, {
        method: "POST",
        headers: {
          "xi-api-key": elevenKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.42, similarity_boost: 0.88, style: 0.40, use_speaker_boost: true }
        })
      });
      if (elRes.ok) {
        const arrBuf = await elRes.arrayBuffer();
        return res.status(200).json({
          audio: Buffer.from(arrBuf).toString("base64"),
          mime: "audio/mpeg"
        });
      }
    }

    // 2. Gemini Neural Tamil/Tanglish Male Voice Engine ("Puck" / "Charon")
    const key = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      body.apiKey ||
      ""
    ).trim();
    if (!key) return res.status(500).json({ error: "Voice key not configured" });

    const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
    const voice = process.env.GEMINI_TTS_VOICE || "Puck";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Read this aloud in a warm, affectionate, natural Chennai Tamil / Tanglish young male voice (like Yokesh speaking lovingly to his girlfriend Dhanya): " + text
          }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
        }
      })
    });

    if (!r.ok) {
      return res.status(502).json({ error: "TTS error " + r.status });
    }
    const data = await r.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) return res.status(502).json({ error: "no audio returned" });

    const wav = pcmToWav(Buffer.from(part.inlineData.data, "base64"));
    return res.status(200).json({ audio: wav.toString("base64"), mime: "audio/wav" });
  } catch (e) {
    console.error("tts.js error:", e);
    return res.status(500).json({ error: "server error" });
  }
};
