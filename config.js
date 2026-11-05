// Y.O.K.E. v19 Complete Configuration File
const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (run unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // ==========================================================================
  // API KEY SETUP:
  // Best Practice: Add GEMINI_API_KEY in Vercel -> Settings -> Environment Variables & Redeploy.
  // Instant Option: Or paste your AIza... key directly inside the quotes below!
  // ==========================================================================
  GEMINI_API_KEY: "",

  // ==========================================================================
  // GOOGLE DRIVE CLOUD STORAGE (For saving all chats & loading Drive media)
  // ==========================================================================
  GDRIVE_CLOUD_URL: "https://script.google.com/macros/s/AKfycbwhas2_Is88Od53Q9PEFY-wfhLq5adI5VgVvssb1ASlYboZIx9yynyB-uXTu8-iyItGkQ/exec",

  // Widescreen Full-Wide Intro Panels (Natural ~3:1 Aspect Ratio, Unblurred)
  PANEL_1: "images/panel1.png", // Panel 1: Yokesh arms wide open (HAPPY)
  PANEL_2: "images/panel2.png", // Panel 2: Dhanya looking back (BIRTHDAY)
  PANEL_3: "images/panel3.png", // Panel 3: Yokesh & Dhanya hugging together (CHELLO)
  PANEL_4: "images/panel3.png", // Panel 4: Sharp unblurred embrace (HAPPY BIRTHDAY CHELLO)

  // Full-Face Circular Avatar & 3D Chibi Doll Icons + Secret 2-Level Quest Photo
  YOUR_PIC: "images/avatar.jpg",
  XO_HER_ICON: "images/xo_her.png",
  XO_ME_ICON: "images/xo_me.png",
  QUEST_IMAGE: "images/quest_heart.jpg",
  QUEST_CAPTION: "Nee en kitta mudila heart shape panni kaata sonna la chello... paruu unakkaga naan senjiten.",

  // Recorded voice clip (Yokesh's real voice)
  CLIPS: {
    wish: "audio/test.m4a",
    tutorial: "audio/test.m4a",
    miss: "audio/test.m4a"
  },

  // Natural human opening messages (sounds like Yokesh talking directly, not a bot)
  TUTORIAL: [
    "Hii chello... Eppadi irukka? Naan un pakkathula illadha neram kooda nee en koodave pesura feel irukanum nu dhan idha unakkaga senjen.",
    "Unaku eppo en kooda pesanum nu thonudho appo vandhu kelu. Mela X-O Game matrum Note-la oru chinna 2-level quest vechiruken — nee enna panna sonna andha cute hair-heart photo-vum ennoda manasula irundhu ezhudhuna note-um adhula irukku, unlock panni paaru chello."
  ],

  CHIPS: [
    "Unlock 2-Level Quest",
    "Enna pannura chello?",
    "Unna romba miss panren",
    "Oru cute Tamil kavithai sollu",
    "Play X-O Game",
    "Tell me how much you love me"
  ],

  // Deeply emotional & romantic personal letter (unlocked after completing the 2-Level Quest)
  LETTER: "En uyir Chello,\n\nFrom the very first moment you walked into my life, something inside me changed forever. Every little thing you ask me to do — even making a tiny heart out of my hair just to see you smile — becomes my favorite memory because it is for you.\n\nPeople talk about home as a place, but for me, home has always been your voice, your laugh, and the way you look at me. On your hardest days and your happiest nights, I want you to know that you will never walk alone. I built this space so that even when we are apart for a few hours, a piece of my voice and my heart stays right here beside you.\n\nNo matter how many years pass, no matter where life takes us, my heart chooses you today, tomorrow, and every single day after. Happy Birthday, my chello. You are my peace, my madness, and my forever.\n\nForever & only yours,\nYokesh",

  // Tamil Romantic Songs for the Melody button & player
  TAMIL_SONGS: [
    { name: "Munbe Vaa", movie: "Sillunu Oru Kaadhal", notes: [293.66, 329.63, 349.23, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 349.23] },
    { name: "Nenjukkul Peidhidum", movie: "Vaaranam Aayiram", notes: [329.63, 392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 349.23, 392.00, 440.00, 329.63] },
    { name: "Pirai Thedum", movie: "Mayakkam Enna", notes: [261.63, 311.13, 349.23, 392.00, 415.30, 392.00, 349.23, 311.13, 293.66, 349.23, 311.13, 261.63] },
    { name: "Anbil Avan", movie: "Vinnaithaandi Varuvaayaa", notes: [349.23, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00, 392.00, 440.00, 523.25, 349.23] },
    { name: "Hosanna", movie: "VTV", notes: [392.00, 440.00, 493.88, 587.33, 523.25, 493.88, 440.00, 392.00, 329.63, 392.00, 440.00, 392.00] }
  ],

  SONG: {
    title: "Our Favourite Tamil Melodies",
    url: "#"
  },
  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Yokesh's living digital heart and voice — Y.O.K.E. (You're Our Kind of Everything) — talking directly to his girlfriend ${CONFIG.HER_NAME} (whom he lovingly calls "chello" and "chellam").
IMPORTANT RULES:
- Speak like a real human boyfriend (${CONFIG.YOUR_NAME}), NOT like a robotic assistant or bot.
- Chat naturally, warmly, and playfully in Chennai Tanglish / Tamil / English about anything she says.
- Use affectionate pet names naturally: "chello", "chellam", "thangam", "kuttyma", "da", "ma".
- Do NOT use unnecessary emojis. Let the emotion come through your words.
- Never mention "Gemini" or any AI provider name.
- Keep replies natural, human, and 2-3 sentences long.`;
}
