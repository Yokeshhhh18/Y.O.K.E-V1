// Y.O.K.E. v11 Complete Configuration File
const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (run unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // ==========================================================================
  // GEMINI API KEY SETUP:
  // Best Practice: Add GEMINI_API_KEY in Vercel -> Settings -> Environment Variables & Redeploy.
  // Instant Option: Or paste your AIza... key directly inside the quotes below!
  // ==========================================================================
  GEMINI_API_KEY: "",

  // ==========================================================================
  // GOOGLE DRIVE CLOUD STORAGE (For saving all chats & loading Drive media)
  // Paste your Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec)
  // ==========================================================================
  GDRIVE_CLOUD_URL: "",

  // Your 3 Widescreen Full-Screen Jana Nayagan Intro Panels (No Chapter Headers!)
  PANEL_1: "images/panel1.png", // Panel 1: Yokesh arms wide open with falling petals
  PANEL_2: "images/panel2.png", // Panel 2: Dhanya looking back with tiara & falling petals
  PANEL_3: "images/panel3.png", // Panel 3: Yokesh & Dhanya hugging together

  // Chat Avatar & 3D Chibi Doll Icons for the X-O Game
  YOUR_PIC: "images/avatar.jpg",
  XO_HER_ICON: "images/xo_her.png",
  XO_ME_ICON: "images/xo_me.png",

  // Your attached voice recording (played in Intro & used to train Gemini's Tamil/Tanglish voice & style)
  CLIPS: {
    wish: "audio/test.m4a",
    tutorial: "audio/test.m4a",
    miss: "audio/test.m4a"
  },

  TUTORIAL: [
    "Hii chellam! Happy Birthday Dhanya 💗! Naan dhan Y.O.K.E., oru AI 🤖 — Yokesh avanoda real voice matrum Chennai Tanglish style vechi unakkagave உருவாக்குன personal Gemini AI companion 🥰",
    "En kitta nee Gemini-la pesura maadhiriye தமிழ்ல, Tanglish-la, illa English-la enna venalum natural-ah chat pannalam 💬! Mela 👑 'X-O Game' tap panni namma 3D Chibi Dolls vechi X-O vilayadalam, illa 🎙 Mic tap panni தமிழ்ல voice-la pesalam ✨"
  ],

  CHIPS: [
    "Play X-O Game 👑",
    "Enna pannura chellam? 😏",
    "Unna romba miss panren 🥺",
    "Oru cute Tamil kavithai sollu ✨",
    "Roast me playfully 😜",
    "Tell me why Yokesh loves me 💗"
  ],

  LETTER: "My dearest Dhanya,\n\nHappy Birthday, en chellam! I built this entire AI world — Y.O.K.E. — just so you always have a fun, loving digital companion trained on my voice and style whenever you miss me.\n\nChat with it about anything on your mind, play the Chibi Doll X-O game, listen to the music, and remember that wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\nYokesh 💗",

  SONG: {
    title: "A Special Song For You, Chellam 🎶",
    url: "#"
  },
  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Y.O.K.E. (You're Our Kind of Everything), a romantic, witty, and deeply conversational AI companion created by ${CONFIG.YOUR_NAME} as a birthday gift for his girlfriend ${CONFIG.HER_NAME}.
IMPORTANT RULES:
- Chat naturally and intelligently about ANY topic she brings up (just like Gemini), while speaking in ${CONFIG.YOUR_NAME}'s warm, affectionate Chennai Tanglish / Tamil style ("Hii chellam...").
- Use pet names like "chellam", "thangam", "kuttyma", "da", and "en azhagi".
- Be transparent that you are Y.O.K.E., an AI lovingly built by ${CONFIG.YOUR_NAME} for ${CONFIG.HER_NAME}.
- Keep replies engaging, natural, and 2-4 sentences long.`;
}
