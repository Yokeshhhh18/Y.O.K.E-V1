// Y.O.K.E. v18 Complete Configuration File
const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (run unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // ==========================================================================
  // AI API KEY SETUP:
  // Best Practice: Add GEMINI_API_KEY in Vercel -> Settings -> Environment Variables & Redeploy.
  // Instant Option: Or paste your AIza... key directly inside the quotes below!
  // ==========================================================================
  GEMINI_API_KEY: "",

  // ==========================================================================
  // GOOGLE DRIVE CLOUD STORAGE (For saving all chats & loading Drive media)
  // ==========================================================================
  GDRIVE_CLOUD_URL: "https://script.google.com/macros/s/AKfycbwhas2_Is88Od53Q9PEFY-wfhLq5adI5VgVvssb1ASlYboZIx9yynyB-uXTu8-iyItGkQ/exec",

  // Widescreen Full-Wide Intro Panels (Natural ~3:1 Aspect Ratio, Unblurred)
  PANEL_1: "images/panel1.png", // Panel 1: Yokesh arms wide open
  PANEL_2: "images/panel2.png", // Panel 2: Dhanya looking back
  PANEL_3: "images/panel3.png", // Panel 3: Yokesh & Dhanya hugging together (CHELLO)
  PANEL_4: "images/panel3.png", // Panel 4: Sharp unblurred embrace (HAPPY BIRTHDAY CHELLO)

  // Chat Avatar & 3D Chibi Doll Icons for the X-O Game
  YOUR_PIC: "images/avatar.jpg",
  XO_HER_ICON: "images/xo_her.png",
  XO_ME_ICON: "images/xo_me.png",

  // Recorded voice clip (Yokesh's real voice)
  CLIPS: {
    wish: "audio/test.m4a",
    tutorial: "audio/test.m4a",
    miss: "audio/test.m4a"
  },

  TUTORIAL: [
    "Hii chello! Naan dhan Y.O.K.E. — Yokesh avanoda real voice matrum Chennai Tanglish style vechi unakkagave uruvaakkuna personal AI companion.",
    "En kitta nee eppovume Tamil-la, Tanglish-la, illa English-la enna venalum natural-ah pesalam. Mela 'X-O Game' tap panni vilayadalam, illa Mic tap panni voice-la pesalam."
  ],

  CHIPS: [
    "Play X-O Game",
    "Enna pannura chello?",
    "Unna romba miss panren",
    "Oru cute Tamil kavithai sollu",
    "Roast me playfully",
    "Tell me why Yokesh loves me"
  ],

  LETTER: "My dearest Dhanya,\n\nHappy Birthday, en chello! I built this entire AI world — Y.O.K.E. — just so you always have a fun, loving digital companion trained on my voice and style whenever you miss me.\n\nChat with it about anything on your mind on any day, play the Chibi Doll X-O game, listen to the music, and remember that wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\nYokesh",

  SONG: {
    title: "A Special Song For You, Chello",
    url: "#"
  },
  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Y.O.K.E. (You're Our Kind of Everything), a romantic, witty, and deeply conversational personal AI companion created by ${CONFIG.YOUR_NAME} for his girlfriend ${CONFIG.HER_NAME} (whom he lovingly calls "chello" / "chellam").
IMPORTANT RULES:
- Chat naturally and intelligently about ANY topic she brings up, while speaking in ${CONFIG.YOUR_NAME}'s warm, affectionate Chennai Tanglish / Tamil style ("Hii chello...").
- Use pet names like "chello", "chellam", "thangam", "kuttyma", "da", and "en azhagi".
- Do NOT use unnecessary emojis in your responses. Keep text clean and expressive through words.
- Never mention "Gemini" or any third-party AI model name; you are strictly Y.O.K.E. AI, built by ${CONFIG.YOUR_NAME} for ${CONFIG.HER_NAME}.
- Keep replies fast, engaging, natural, and 2-3 sentences long.`;
}
