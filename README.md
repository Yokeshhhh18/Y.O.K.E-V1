# Y.O.K.E. 💛
**You're Our Kind of Everything** — a Tanglish birthday AI for Dhanya.

## Files
- `config.js` — your personal details (name, song, videos, memories, sample texts). **No API key in here.**
- `api/chat.js` — Vercel server function that talks to Gemini using a secret key
- `index.html`, `style.css`, `app.js` — the website
- `images/` — cartoon pics (`dhanya.png`, `me.png`, `us.png`)

## Why the key must NOT be on GitHub
GitHub scans public repos for API keys and tells Google, which disables the key
automatically. So the key lives only in Vercel's settings.

## Setup (Vercel)
1. Make a NEW key at https://aistudio.google.com/apikey (the old one is already disabled)
2. Vercel -> your project -> Settings -> Environment Variables
   - Name: `GEMINI_API_KEY`   Value: your key   Environments: Production (+ Preview)
3. Deployments -> latest -> ... -> Redeploy (env vars apply only to new deployments)
4. In `config.js`, delete the `GEMINI_API_KEY` line.

## Optional extras in config.js
```js
CHIPS: ["Surprise 🎁", "Joke sollu 😂"],
LETTER: "Dhanya,\n\nYour own birthday letter here...\n\n- Your name",
GALLERY: [{ src: "images/us.png", caption: "Us 💛" }],
```

## Testing
Open your Vercel link, press Ctrl+Shift+J, type `unlock()` and press Enter.
(The chat only works on the Vercel link, not by opening index.html from your computer.)
Before gifting, make sure `UNLOCK_AT` is `2026-11-07T00:00:00+05:30`.

## v2 additions
- **Intro**: after unlock, a "Tap to open" screen → her wish types out with hearts, then the chat + a short tutorial (once per device).
- **Voice mode**: 🎙 button. Listening uses the browser (Chrome on Android is best). Replies are spoken by `api/tts.js` (Gemini TTS, same `GEMINI_API_KEY`).
- **Your own recorded voice**: put files in `audio/` and add to `config.js`:
```js
CLIPS: { wish: "audio/wish.m4a", tutorial: "audio/tutorial.m4a", miss: "audio/miss.m4a", see: "audio/see.m4a" },
SEE_YOU: { type: "image", src: "images/us.png", caption: "Inga dhan iruken 😍" },  // or type: "video"
TUTORIAL: ["line 1", "line 2"],   // optional: your own words
INTRO_PIC: "images/me.png",       // optional
```
- Optional Vercel env vars: `GEMINI_TTS_MODEL` (default `gemini-3.1-flash-tts-preview`), `GEMINI_TTS_VOICE` (default `Kore`).
- `images/dhanya.png` and `images/me.png` are already included. Add `images/us.png` when you have it.
