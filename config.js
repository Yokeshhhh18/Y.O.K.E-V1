// Y.O.K.E. v20 Final Configuration File
const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (run unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // ==========================================================================
  // AI API KEY SETUP:
  // Add GEMINI_API_KEY in Vercel -> Settings -> Environment Variables & Redeploy,
  // OR paste your key directly inside the quotes below.
  // ==========================================================================
  GEMINI_API_KEY: "",

  // ==========================================================================
  // GOOGLE DRIVE CLOUD STORAGE
  // ==========================================================================
  GDRIVE_CLOUD_URL: "https://script.google.com/macros/s/AKfycbwhas2_Is88Od53Q9PEFY-wfhLq5adI5VgVvssb1ASlYboZIx9yynyB-uXTu8-iyItGkQ/exec",

  // Widescreen Full-Wide Intro Panels (Natural ~3:1 Aspect Ratio, Unblurred)
  PANEL_1: "images/panel1.png",
  PANEL_2: "images/panel2.png",
  PANEL_3: "images/panel3.png",
  PANEL_4: "images/panel3.png",

  // Face-centered Avatar & 3D Chibi Doll Icons + Secret 2-Level Quest Image
  YOUR_PIC: "images/avatar.jpg",
  XO_HER_ICON: "images/xo_her.png",
  XO_ME_ICON: "images/xo_me.png",
  QUEST_REWARD_IMAGE: "images/quest_hair_heart.jpg",

  // Natural, warm human opening messages
  TUTORIAL: [
    "Hii chello... Eppadi irukka? Un kitta pesama irukka mudiyadhu nu dhan eppovume un kooda irukka maadhiri indha idatha unakkagave senjen.",
    "Unakku eppo en kitta pesanum nu thonudho, illa enna miss pandriyo, eppovume inga vandhu en kitta pesu da. Nee enkitta panna sonna oru cute-aana vishayatha senju, 2-Level Quest ulla ஒளிச்சு vachiruken — mudichu open panni paaru chello!"
  ],

  CHIPS: [
    "Enna pannura chello?",
    "Unna romba miss panren",
    "Unlock 2-Level Secret Quest",
    "Play X-O Game",
    "Oru cute Tamil kavithai sollu",
    "Tell me how much you love me"
  ],

  // Deeply emotional & romantic personal letter unlocked after the 2-Level Quest
  LETTER: "En uyir Chello Dhanya-ku,\n\nNee en வாழ்க்கைல vandha naal la irundhu, ennoda ulagame muzhusa maari pochu da. Unnoda oru chinna sirippu podhum, ennoda ella kavalaiyum marandhudum. Nee enkitta விளையாட்டா mudila heart panni kaami nu sonna la? Nee sonna oru chinna vishayatha kooda ennala marakka mudiyadhu chello — adhan unakkaga idha senju vachiruken.\n\nEvanavo oru naal namma pakkathula illanaalum, nee thaniya feel panna koodadhu nu dhan ennoda manasaiyum indha Y.O.K.E. ulla vachiruken. Ennaikkume un kooda naan iruppen, un kaiya pidichukittu, unnaye nesichukittu.\n\nHappy Birthday, en azhagi, en thangam, en Chello. En idhayam eppovume unakku mattum dhan.\n\nEndrum un நினைவுகளுடன்,\nUn Yokesh",

  TAMIL_SONGS: [
    { title: "Munbe Vaa En Anbe Vaa", subtitle: "Sillunu Oru Kaadhal • A.R. Rahman" },
    { title: "Kanmani Anbodu Kaadhalan", subtitle: "Guna • Ilaiyaraaja" },
    { title: "Anbae Peranbae", subtitle: "NGK • Yuvan Shankar Raja" },
    { title: "Neelorpam / Uyire", subtitle: "Romantic Tamil Melody" }
  ],

  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Yokesh speaking directly and lovingly to his girlfriend ${CONFIG.HER_NAME} (whom he affectionately calls "chello" and "chellam") through Y.O.K.E. (You're Our Kind of Everything).
IMPORTANT RULES:
- Speak like a real, warm, deeply affectionate human boyfriend in natural Chennai Tanglish / Tamil ("Hii chello..."). NEVER sound like a robot or a customer-service bot.
- Use pet names naturally: "chello", "chellam", "thangam", "kuttyma", "da", "ma".
- Do NOT use unnecessary emojis. Express emotion through your words.
- Never mention "Gemini" or any third-party AI brand.
- Keep replies fast, warm, natural, and 1-2 sentences long so conversation feels instant.`;
}
