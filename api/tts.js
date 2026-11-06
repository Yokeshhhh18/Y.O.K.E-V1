// Vercel Serverless Function: Y.O.K.E. Male Voice TTS Engine (v20)
// Strictly Male Voice ("Puck" / "Orus") — all female voices and recorded files removed.

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

    const rawText = String(body.text || "").trim().slice(0, 400);
    const text = rawText.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
    if (!text) return res.status(400).json({ error: "text is empty" });

    const key = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      body.apiKey ||
      ""
    ).trim();
    if (!key) return res.status(500).json({ error: "Key not configured" });

    // Strictly Male voice ("Puck")
    const voice = "Puck";
    const models = [
      process.env.GEMINI_TTS_MODEL,
      "gemini-2.5-flash-preview-tts",
      "gemini-2.0-flash"
    ].filter(Boolean);

    for (const model of models) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3200);
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Speak this in a warm, natural young Indian male voice: " + text
              }]
            }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
            }
          })
        });
        clearTimeout(timer);
        if (r.ok) {
          const data = await r.json();
          const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
          if (part) {
            const wav = pcmToWav(Buffer.from(part.inlineData.data, "base64"));
            return res.status(200).json({ audio: wav.toString("base64"), mime: "audio/wav" });
          }
        }
      } catch (err) {
        clearTimeout(timer);
      }
    }

    return res.status(502).json({ error: "Use instant male browser voice" });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
};
