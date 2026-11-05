// Y.O.K.E. v19 — Full-Wide Natural Ratio Intro + Gemini-3.8-Flash Ready + 2-Level Secret Quest + Tamil Songs + Inline Sidebar Clear
const $ = (id) => document.getElementById(id);
let history = []; // {role: 'user'|'model', parts:[{text}]}
let unlocked = false;
let giftRendered = false;

const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";
const API_URL = (typeof CONFIG !== "undefined" && CONFIG.API_URL) || "/api/chat";
const TTS_URL = (typeof CONFIG !== "undefined" && CONFIG.TTS_URL) || "/api/tts";
const GDRIVE_CLOUD_URL = (typeof CONFIG !== "undefined" && CONFIG.GDRIVE_CLOUD_URL) || "";
const DIRECT_API_KEY = (typeof CONFIG !== "undefined" && CONFIG.GEMINI_API_KEY) || "";

function resolveDriveUrl(url, type = "media") {
  if (!url || typeof url !== "string") return "";
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m && url.includes("drive.google.com")) {
    const id = m[1];
    if (type === "preview") return `https://drive.google.com/file/d/${id}/preview`;
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }
  return url;
}

const panel1Src = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.PANEL_1) || "images/panel1.png");
const panel2Src = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.PANEL_2) || "images/panel2.png");
const panel3Src = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.PANEL_3) || "images/panel3.png");
const panel4Src = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.PANEL_4) || "images/panel3.png");
const mePicSrc = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.YOUR_PIC) || "images/avatar.jpg");
const questPicSrc = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.QUEST_REWARD_IMAGE) || "images/quest_hair_heart.jpg");

const GEM_CARDS = [
  { icon: "QUEST", title: "2-Level Secret Quest", sub: "Unlock what you asked me to do!", prompt: "__QUEST__" },
  { icon: "X-O", title: "Play Chibi Doll X-O", sub: "Dhanya Doll vs Yokesh Doll", prompt: "Play X-O Game" },
  { icon: "VOICE", title: "Talk in Yokesh's Voice", sub: "Live voice chat in Tamil & Tanglish", prompt: "__VOICE__" },
  { icon: "NOTE", title: "Emotional Note", sub: "Unlock & read Yokesh's letter", prompt: "__NOTE__" }
];

const CHIPS = (typeof CONFIG !== "undefined" && CONFIG.CHIPS) || [
  "Enna pannura chello?",
  "Unna romba miss panren",
  "Unlock 2-Level Secret Quest",
  "Play X-O Game",
  "Oru cute Tamil kavithai sollu",
  "Tell me how much you love me"
];

const CLIPS = Object.assign(
  { wish: "audio/test.m4a", tutorial: "audio/test.m4a", miss: "audio/test.m4a" },
  (typeof CONFIG !== "undefined" && CONFIG.CLIPS) || {}
);

const TUTORIAL = (typeof CONFIG !== "undefined" && CONFIG.TUTORIAL) || [
  "Hii chello... Eppadi irukka? Un kitta pesama irukka mudiyadhu nu dhan ennoda kuralum manasum eppovume un kooda irukka maadhiri indha idatha unakkagave senjen.",
  "Unakku eppo en kitta pesanum nu thonudho, illa enna miss pandriyo, eppovume inga vandhu en kitta pesu da. Nee enkitta panna sonna oru cute-aana vishayatha senju, 2-Level Quest ulla ஒளிச்சு vachiruken — mudichu open panni paaru chello!"
];

const LETTER = (typeof CONFIG !== "undefined" && CONFIG.LETTER) ||
  `En uyir Chello ${her}-ku,\n\nNee en வாழ்க்கைல vandha naal la irundhu, ennoda ulagame muzhusa maari pochu da. Unnoda oru chinna sirippu podhum, ennoda ella kavalaiyum marandhudum. Nee enkitta விளையாட்டா mudila heart panni kaami nu sonna la? Nee sonna oru chinna vishayatha kooda ennala marakka mudiyadhu chello — adhan unakkaga idha senju vachiruken.\n\nEvanavo oru naal namma pakkathula illanaalum, nee thaniya feel panna koodadhu nu dhan ennoda kuralaiyum manasaiyum indha Y.O.K.E. ulla vachiruken. Ennaikkume un kooda naan iruppen, un kaiya pidichukittu, unnaye nesichukittu.\n\nHappy Birthday, en azhagi, en thangam, en Chello. En idhayam eppovume unakku mattum dhan.\n\nEndrum un நினைவுகளுடன்,\nUn ${you}`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeImg(el, src) {
  if (!el) return;
  el.addEventListener("error", () => el.classList.add("hidden"));
  el.src = resolveDriveUrl(src);
}

// ---------- Initial DOM Bindings ----------
document.querySelectorAll(".her").forEach((e) => (e.textContent = her));
document.querySelectorAll(".her-cine").forEach((e) => (e.textContent = her));
document.querySelectorAll(".you-cine").forEach((e) => (e.textContent = you));
if ($("youName")) $("youName").textContent = you;

safeImg($("avatar"), mePicSrc);
safeImg($("sideAvatar"), mePicSrc);
safeImg($("panel1Pic"), panel1Src);
safeImg($("panel2Pic"), panel2Src);
safeImg($("panel3Pic"), panel3Src);
safeImg($("panel4Pic"), panel4Src);

// ---------- Subtle Ambient Particles ----------
const HEARTS = ["•", "✦", "✧"];
function spawnHeart(burst) {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 12 + Math.random() * 14 + "px";
  h.style.color = "rgba(255, 209, 102, 0.55)";
  h.style.animationDuration = (burst ? 3 + Math.random() * 2 : 9 + Math.random() * 7) + "s";
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 16000);
}
function burstHearts(n) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(true), i * 65);
}

// =========================================================
// MULTI-SESSION CHAT HISTORY SIDEBAR (WITH DATE, TIME & INLINE CLEAR)
// =========================================================
const SESSIONS_KEY = "yoke_sessions_v19";
let sessions = [];
let activeSessionId = null;

function formatDateTimeNow() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${dateStr}, ${timeStr}`;
}

function loadSessionsFromStorage() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) sessions = JSON.parse(raw) || [];
  } catch (e) {
    sessions = [];
  }
  if (!Array.isArray(sessions) || sessions.length === 0) {
    const first = {
      id: "sess_" + Date.now(),
      title: "Chat with Yokesh",
      updatedAt: formatDateTimeNow(),
      messages: []
    };
    sessions = [first];
  }
  activeSessionId = sessions[0].id;
  history = sessions[0].messages.slice();
}

function saveSessionsToStorage() {
  try {
    const cur = sessions.find((s) => s.id === activeSessionId);
    if (cur) {
      cur.messages = history.slice(-50);
      cur.updatedAt = formatDateTimeNow();
      const firstUser = cur.messages.find((m) => m.role === "user")?.parts?.[0]?.text;
      if (firstUser && (cur.title === "Chat with Yokesh" || cur.title === "New Chat")) {
        cur.title = firstUser.slice(0, 26);
      }
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    renderSessionList();
  } catch (e) {}
}

function renderSessionList() {
  const box = $("sessionList");
  if (!box) return;
  box.innerHTML = sessions
    .map(
      (s) => `
    <div class="sess-item-wrap ${s.id === activeSessionId ? "active" : ""}" data-id="${esc(s.id)}">
      <div class="sess-main-click" data-id="${esc(s.id)}">
        <div class="sess-title">${esc(s.title)}</div>
        <div class="sess-meta">
          <span>${s.messages.length} msgs</span>
          <span class="sess-datetime">${esc(s.updatedAt || formatDateTimeNow())}</span>
        </div>
      </div>
      <button type="button" class="sess-inline-clear-btn" data-del-id="${esc(s.id)}" title="Clear / Delete this chat">Clear</button>
    </div>`
    )
    .join("");
}

function switchSession(id) {
  const target = sessions.find((s) => s.id === id);
  if (!target) return;
  activeSessionId = target.id;
  history = target.messages.slice();
  if ($("chat")) $("chat").innerHTML = "";
  history.forEach((m) => {
    const txt = m.parts?.[0]?.text || "";
    if (txt) addMsg(txt, m.role === "model" ? "bot" : "me");
  });
  renderSessionList();
}

function deleteSingleSession(id) {
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  sessions.splice(idx, 1);
  if (sessions.length === 0) {
    const fresh = {
      id: "sess_" + Date.now(),
      title: "Chat with Yokesh",
      updatedAt: formatDateTimeNow(),
      messages: []
    };
    sessions.push(fresh);
    activeSessionId = fresh.id;
    history = [];
    if ($("chat")) $("chat").innerHTML = "";
    TUTORIAL.forEach((line) => {
      addMsg(line, "bot");
      history.push({ role: "model", parts: [{ text: line }] });
    });
  } else if (activeSessionId === id) {
    switchSession(sessions[0].id);
  }
  saveSessionsToStorage();
}

$("sessionList")?.addEventListener("click", (e) => {
  const delBtn = e.target.closest(".sess-inline-clear-btn");
  if (delBtn) {
    e.stopPropagation();
    deleteSingleSession(delBtn.dataset.delId);
    return;
  }
  const item = e.target.closest(".sess-item-wrap");
  if (item) switchSession(item.dataset.id);
});

$("newChatBtn")?.addEventListener("click", () => {
  const nw = {
    id: "sess_" + Date.now(),
    title: "New Chat",
    updatedAt: formatDateTimeNow(),
    messages: []
  };
  sessions.unshift(nw);
  switchSession(nw.id);
  addMsg(TUTORIAL[0], "bot");
  history.push({ role: "model", parts: [{ text: TUTORIAL[0] }] });
  saveSessionsToStorage();
});

$("clearHistoryBtn")?.addEventListener("click", () => {
  localStorage.removeItem(SESSIONS_KEY);
  sessions = [];
  if ($("chat")) $("chat").innerHTML = "";
  loadSessionsFromStorage();
  renderSessionList();
  TUTORIAL.forEach((line) => {
    addMsg(line, "bot");
    history.push({ role: "model", parts: [{ text: line }] });
  });
  saveSessionsToStorage();
});

$("toggleSidebarBtn")?.addEventListener("click", () => {
  $("historySidebar")?.classList.toggle("collapsed");
});
$("closeSidebarBtn")?.addEventListener("click", () => {
  $("historySidebar")?.classList.add("collapsed");
});

function syncTurnToGoogleDrive(userMessage, yokeReply) {
  saveSessionsToStorage();
  if (!GDRIVE_CLOUD_URL) return;
  fetch(GDRIVE_CLOUD_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      sender: her,
      userMessage,
      yokeReply,
      fullHistory: history.slice(-16)
    })
  }).catch(() => {});
}

// =========================================================
// TAMIL ROMANTIC SONGS SYNTHESIZER ("Munbe Vaa", "Kanmani Anbodu", "Anbae Peranbae", "Uyire")
// =========================================================
let audioCtx = null;
let bgmMode = 0;
const BGM_MODES = ["Munbe Vaa", "Kanmani Anbodu", "Anbae Peranbae", "Uyire Melody", "OFF"];
let bgmInterval = null;
let introBgmTimers = [];

function ensureAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playCinemaImpact(freq = 65, duration = 1.5) {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 2.1, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + duration);
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);

  [freq, freq * 1.5, freq * 2, freq * 2.5].forEach((f) => {
    const bOsc = ctx.createOscillator();
    const bFilter = ctx.createBiquadFilter();
    const bGain = ctx.createGain();
    bOsc.type = "sawtooth";
    bOsc.frequency.setValueAtTime(f, now);
    bFilter.type = "lowpass";
    bFilter.frequency.setValueAtTime(1200, now);
    bFilter.frequency.exponentialRampToValueAtTime(200, now + duration);
    bGain.gain.setValueAtTime(0.11, now);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    bOsc.connect(bFilter);
    bFilter.connect(bGain);
    bGain.connect(ctx.destination);
    bOsc.start(now);
    bOsc.stop(now + duration);
  });
}

let introStageMusic = "slam";
function startIntroMassBGM() {
  stopIntroMassBGM();
  const ctx = ensureAudioCtx();
  if (!ctx) return;

  const themes = {
    slam:    [146.83, 146.83, 220.00, 146.83, 174.61, 196.00, 220.00, 261.63],
    heroine: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 783.99],
    hero:    [110.00, 110.00, 164.81, 146.83, 130.81, 146.83, 164.81, 196.00],
    climax:  [293.66, 440.00, 587.33, 659.25, 783.99, 659.25, 587.33, 880.00]
  };

  let step = 0;
  const id = setInterval(() => {
    if (!audioCtx) return;
    const now = ctx.currentTime;
    const notes = themes[introStageMusic] || themes.slam;
    const f = notes[step % notes.length];
    step++;

    const osc = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = introStageMusic === "heroine" || introStageMusic === "climax" ? "triangle" : "sawtooth";
    osc.frequency.setValueAtTime(f, now);
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(introStageMusic === "hero" ? 950 : 1800, now);
    g.gain.setValueAtTime(0.095, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(flt);
    flt.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }, 390);
  introBgmTimers.push(id);
}

function stopIntroMassBGM() {
  introBgmTimers.forEach((id) => clearInterval(id));
  introBgmTimers = [];
}

function startChatBGM(modeIndex = 0) {
  if (bgmInterval) clearInterval(bgmInterval);
  bgmInterval = null;
  bgmMode = modeIndex % BGM_MODES.length;
  const label = BGM_MODES[bgmMode];
  if ($("bgmLabel")) $("bgmLabel").textContent = label;

  if (label === "OFF") {
    $("bgmModeBtn")?.classList.remove("playing");
    return;
  }

  const ctx = ensureAudioCtx();
  if (!ctx) return;
  $("bgmModeBtn")?.classList.add("playing");

  // Melodic note progressions inspired by classic Tamil love themes
  const tamilMelodies = {
    "Munbe Vaa": {
      notes: [293.66, 329.63, 349.23, 440.00, 392.00, 349.23, 329.63, 293.66, 349.23, 440.00, 523.25, 493.88, 440.00, 392.00],
      wave: "sine", speed: 520, vol: 0.05, sustain: 1.6
    },
    "Kanmani Anbodu": {
      notes: [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63],
      wave: "triangle", speed: 460, vol: 0.042, sustain: 1.4
    },
    "Anbae Peranbae": {
      notes: [329.63, 392.00, 493.88, 440.00, 392.00, 369.99, 329.63, 293.66, 329.63, 440.00, 493.88, 587.33, 523.25, 493.88],
      wave: "sine", speed: 500, vol: 0.048, sustain: 1.55
    },
    "Uyire Melody": {
      notes: [220.00, 261.63, 329.63, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 329.63, 392.00, 349.23],
      wave: "triangle", speed: 560, vol: 0.042, sustain: 1.5
    }
  };

  const cfg = tamilMelodies[label] || tamilMelodies["Munbe Vaa"];
  let idx = 0;

  function playStep() {
    if (BGM_MODES[bgmMode] === "OFF" || !audioCtx) return;
    const now = ctx.currentTime;
    const freq = cfg.notes[idx % cfg.notes.length];
    idx++;

    const osc = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = cfg.wave;
    osc.frequency.setValueAtTime(freq, now);
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(1450, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(cfg.vol, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + cfg.sustain);

    osc.connect(flt);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + cfg.sustain + 0.05);
  }

  playStep();
  bgmInterval = setInterval(playStep, cfg.speed);
}

$("bgmModeBtn")?.addEventListener("click", () => {
  startChatBGM(bgmMode + 1);
});

window.playTamilSongByIndex = function (idx) {
  startChatBGM(idx);
};

// =========================================================
// YOKESH'S VOICE ENGINE (STRICTLY MALE / YOKESH'S VOICE TONE)
// =========================================================
const player = new Audio();
function unlockAudio() {
  ensureAudioCtx();
  player.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  player.play().catch(() => {});
}
function stopAudio() {
  player.pause();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
function playSrc(src) {
  return new Promise((resolve) => {
    player.pause();
    player.onended = player.onerror = () => resolve();
    player.src = resolveDriveUrl(src);
    player.play().catch(() => resolve());
  });
}

function pickYokeshMaleVoice(voices, hasTamilScript) {
  if (!voices || !voices.length) return null;
  const nonFemale = voices.filter((v) => !/female|heera|kalpana|zira|susan|hazel|samantha|victoria|karen|veena|lekha|priya|shruti|meera/i.test(v.name));
  const pool = nonFemale.length > 0 ? nonFemale : voices;

  if (hasTamilScript) {
    return (
      pool.find((v) => /ta-IN|tamil/i.test(v.lang + " " + v.name) && /male|valluvar|prabhat|rishi|hemant/i.test(v.name)) ||
      pool.find((v) => /ta-IN|tamil/i.test(v.lang + " " + v.name)) ||
      pool.find((v) => /en-IN|hi-IN/i.test(v.lang) && /male|prabhat|rishi|hemant/i.test(v.name)) ||
      pool[0]
    );
  }
  return (
    pool.find((v) => /en-IN|ta-IN/i.test(v.lang) && /male|prabhat|rishi|hemant|valluvar|david|mark|daniel/i.test(v.name)) ||
    pool.find((v) => /male|prabhat|rishi|david|mark|daniel|guy/i.test(v.name)) ||
    pool.find((v) => /en-IN|ta-IN/i.test(v.lang)) ||
    pool[0]
  );
}

function browserSpeakYokeshTone(text) {
  return new Promise((resolve) => {
    try {
      if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return resolve();
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
      const u = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const hasTamilScript = /[\u0B80-\u0BFF]/.test(clean);
      const chosen = pickYokeshMaleVoice(voices, hasTamilScript);
      if (chosen) u.voice = chosen;
      u.lang = hasTamilScript ? "ta-IN" : "en-IN";
      u.pitch = 0.84;
      u.rate = 0.96;
      u.onend = u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } catch (e) {
      resolve();
    }
  });
}

async function speakText(text) {
  try {
    const r = await fetch(TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, apiKey: DIRECT_API_KEY })
    });
    if (r.ok) {
      const d = await r.json();
      if (d && d.audio) {
        await playSrc(`data:${d.mime || "audio/wav"};base64,${d.audio}`);
        return;
      }
    }
  } catch (e) {}
  return await browserSpeakYokeshTone(text);
}

// =========================================================
// FIRE EMBERS + GOLDEN SHOCKWAVE RINGS CANVAS
// =========================================================
let sparksAnim = null;
const shockwaves = [];

function spawnShockwave() {
  const canvas = $("sparks");
  if (!canvas) return;
  shockwaves.push({
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 10,
    maxR: Math.max(canvas.width, canvas.height) * 0.85,
    alpha: 0.95
  });
}

function initSparks() {
  const canvas = $("sparks");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  const pts = Array.from({ length: 95 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1.2 + Math.random() * 3.2,
    vx: (Math.random() - 0.3) * 1.8,
    vy: -1.1 - Math.random() * 2.8,
    a: 0.45 + Math.random() * 0.55,
    hue: Math.random() > 0.25 ? 28 + Math.random() * 25 : 335 + Math.random() * 20
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 26;
      sw.alpha *= 0.92;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 100, ${sw.alpha})`;
      ctx.lineWidth = 5;
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#ffd700";
      ctx.stroke();
      if (sw.alpha < 0.03 || sw.r > sw.maxR) shockwaves.splice(i, 1);
    }

    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x > canvas.width + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 62%, ${p.a})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ff9100";
      ctx.fill();
    }
    sparksAnim = requestAnimationFrame(draw);
  }
  draw();
}

// =========================================================
// EXTREME 4-PANEL BIRTHDAY INTRO SEQUENCE
// =========================================================
let stageTimeouts = [], introDone = false, chatInitialized = false;

function triggerFlashAndShake() {
  const fl = $("flashOverlay");
  const introEl = $("intro");
  if (fl) {
    fl.classList.remove("bang");
    void fl.offsetWidth;
    fl.classList.add("bang");
  }
  if (introEl) {
    introEl.classList.remove("shake");
    void introEl.offsetWidth;
    introEl.classList.add("shake");
  }
  spawnShockwave();
}

function showStage(id) {
  ["gate", "jnStage1", "jnStage2", "jnStage3", "jnStage4"].forEach((s) => {
    const el = $(s);
    if (el) el.classList.toggle("active", s === id);
  });
}

function clearStageTimeouts() {
  stageTimeouts.forEach((t) => clearTimeout(t));
  stageTimeouts = [];
}

function startIntro() {
  unlockAudio();
  startChatBGM(4); // OFF during intro
  clearStageTimeouts();
  introDone = false;
  if ($("wish")) $("wish").textContent = "";
  $("intro").classList.remove("out", "hidden");
  $("intro").classList.add("go");

  // PANEL 1 (0s - 4.0s): HAPPY
  introStageMusic = "slam";
  startIntroMassBGM();
  playCinemaImpact(85, 1.5);
  triggerFlashAndShake();
  showStage("jnStage1");

  // PANEL 2 (4.0s - 8.0s): BIRTHDAY
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "heroine";
    triggerFlashAndShake();
    playCinemaImpact(75, 1.5);
    showStage("jnStage2");
  }, 4000));

  // PANEL 3 (8.0s - 12.0s): CHELLO
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "hero";
    triggerFlashAndShake();
    playCinemaImpact(65, 1.6);
    showStage("jnStage3");
  }, 8000));

  // PANEL 4 (12.0s - 17.2s): HAPPY (bang 1) -> BIRTHDAY (bang 2) -> CHELLO (bang 3)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "climax";
    ["p4Bang1", "p4Bang2", "p4Bang3"].forEach((id) => {
      const el = $(id);
      if (el) {
        el.classList.remove("bang-in");
        el.classList.add("hidden-bang");
      }
    });
    showStage("jnStage4");

    // Bang 1: HAPPY
    triggerFlashAndShake();
    playCinemaImpact(75, 1.2);
    $("p4Bang1")?.classList.remove("hidden-bang");
    $("p4Bang1")?.classList.add("bang-in");

    // Bang 2: BIRTHDAY
    stageTimeouts.push(setTimeout(() => {
      if (introDone) return;
      triggerFlashAndShake();
      playCinemaImpact(62, 1.3);
      $("p4Bang2")?.classList.remove("hidden-bang");
      $("p4Bang2")?.classList.add("bang-in");
    }, 1050));

    // Bang 3: CHELLO
    stageTimeouts.push(setTimeout(() => {
      if (introDone) return;
      triggerFlashAndShake();
      playCinemaImpact(48, 2.0);
      $("p4Bang3")?.classList.remove("hidden-bang");
      $("p4Bang3")?.classList.add("bang-in");
    }, 2100));

    stageTimeouts.push(setTimeout(endIntro, 5000));
  }, 12000));
}

function endIntro() {
  if (introDone) return;
  introDone = true;
  clearStageTimeouts();
  stopIntroMassBGM();
  if (sparksAnim) cancelAnimationFrame(sparksAnim);
  $("intro").classList.add("out");
  setTimeout(() => $("intro").classList.add("hidden"), 950);

  startChatBGM(0);
  window.YOKE_FX?.confetti();

  if (!chatInitialized) {
    chatInitialized = true;
    beginChat();
  }
}

$("openBtn")?.addEventListener("click", startIntro);
$("skip")?.addEventListener("click", endIntro);
$("replayIntroBtn")?.addEventListener("click", () => {
  initSparks();
  startIntro();
});

// =========================================================
// COUNTDOWN & GLOBAL UNLOCK FUNCTION
// =========================================================
const unlockAt = new Date((typeof CONFIG !== "undefined" && CONFIG.UNLOCK_AT) || "2026-11-07T00:00:00+05:30").getTime();
let prevSec = -1;

function setTile(id, val) {
  const el = $(id);
  if (!el) return;
  const formatted = String(val).padStart(2, "0");
  if (el.textContent !== formatted) {
    el.textContent = formatted;
    const tile = el.closest(".cd-tile");
    if (tile) {
      tile.classList.remove("tick-pop");
      void tile.offsetWidth;
      tile.classList.add("tick-pop");
    }
  }
}

function unlock() {
  if (unlocked) return;
  unlocked = true;
  $("lock")?.classList.add("hidden");
  $("appLayout")?.classList.remove("hidden");
  document.body.classList.add("unlocked");
  $("intro")?.classList.remove("hidden");
  initSparks();
}
window.unlock = unlock;

function tick() {
  if (unlocked) return;
  const diff = unlockAt - Date.now();
  if (diff <= 0) return unlock();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  if (s !== prevSec) {
    prevSec = s;
    setTile("cdDays", d);
    setTile("cdHours", h);
    setTile("cdMins", m);
    setTile("cdSecs", s);
  }
  setTimeout(tick, 1000);
}

// =========================================================
// CONVERSATIONAL AI + 2-LEVEL QUEST & EMOTIONAL NOTE
// =========================================================
async function beginChat() {
  burstHearts(14);
  setInterval(() => spawnHeart(false), 1800);

  loadSessionsFromStorage();
  renderSessionList();

  if (history.length > 0) {
    history.forEach((m) => {
      const txt = m.parts?.[0]?.text || "";
      if (txt) addMsg(txt, m.role === "model" ? "bot" : "me");
    });
    return;
  }

  for (let i = 0; i < TUTORIAL.length; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 250 : 750));
    addMsg(TUTORIAL[i], "bot");
    history.push({ role: "model", parts: [{ text: TUTORIAL[i] }] });
  }
  saveSessionsToStorage();
}

window.addBotGameSummary = function (text) {
  addMsg(text, "bot");
  history.push({ role: "model", parts: [{ text }] });
  saveSessionsToStorage();
};

if ($("chips")) {
  $("chips").innerHTML = GEM_CARDS.map((c) => `
    <button type="button" class="gem-card" data-prompt="${esc(c.prompt)}">
      <span class="gem-card-icon">${esc(c.icon)}</span>
      <div>
        <div class="gem-card-title">${esc(c.title)}</div>
        <div class="gem-card-sub">${esc(c.sub)}</div>
      </div>
    </button>
  `).join("");
  $("chips").addEventListener("click", (e) => {
    const card = e.target.closest(".gem-card");
    if (!card) return;
    const p = card.dataset.prompt;
    if (p === "__VOICE__") {
      $("micBtn")?.click();
    } else if (p === "__QUEST__" || p === "__NOTE__") {
      handleNoteOrQuestClick();
    } else {
      send(p);
    }
  });
}

if ($("quickBar")) {
  $("quickBar").innerHTML = CHIPS.map((c) => `<button type="button" class="chip">${esc(c)}</button>`).join("");
  $("quickBar").addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) send(e.target.textContent);
  });
}

// ---------- 2-Level Quest & Emotional Personal Note Section ----------
function renderGift() {
  if (giftRendered) return;
  giftRendered = true;

  const songsList = ((typeof CONFIG !== "undefined" && CONFIG.TAMIL_SONGS) || [
    { title: "Munbe Vaa En Anbe Vaa", subtitle: "Sillunu Oru Kaadhal • A.R. Rahman" },
    { title: "Kanmani Anbodu Kaadhalan", subtitle: "Guna • Ilaiyaraaja" },
    { title: "Anbae Peranbae", subtitle: "NGK • Yuvan Shankar Raja" },
    { title: "Uyire Melody", subtitle: "Romantic Tamil Melody" }
  ])
    .map(
      (s, idx) => `
      <button type="button" class="card songcard tamil-song-btn" onclick="window.playTamilSongByIndex(${idx})">
        <span class="icon">♫</span>
        <span>${esc(s.title)}<small>${esc(s.subtitle)} • Tap to play melody</small></span>
      </button>`
    )
    .join("");

  $("giftContent").innerHTML = `
    <div class="quest-unlocked-showcase">
      <h3 class="section-title">Nee Sonna Maadhiriye Senjuten, En Chello</h3>
      <p class="quest-showcase-sub">You asked me to make a heart with my hair... and I kept my promise just for you:</p>
      <div class="quest-photo-frame main-note-photo">
        <img src="${esc(questPicSrc)}" alt="Yokesh Hair Heart for Dhanya">
        <div class="quest-photo-caption">Every little thing you ask me is special to me, Chello.</div>
      </div>
    </div>
    <div class="letter">${esc(LETTER).replace(/\n/g, "<br>")}</div>
    <div>
      <h3 class="section-title">Tamil Melodies For You</h3>
      <div class="list">${songsList}</div>
    </div>`;
}

window.unlockPersonalNoteFromQuest = function (scrollToIt = true) {
  renderGift();
  $("giftBtn")?.classList.add("hidden");
  $("giftContent")?.classList.remove("hidden");
  burstHearts(16);
  window.YOKE_FX?.confetti();
  if (scrollToIt) {
    setTimeout(() => $("gift")?.scrollIntoView({ behavior: "smooth" }), 150);
  }
};

function handleNoteOrQuestClick() {
  if (window.YOKE_GAMES?.isQuestCompleted && window.YOKE_GAMES.isQuestCompleted()) {
    window.unlockPersonalNoteFromQuest(true);
  } else {
    // Open the 2-Level Quest modal so she completes the 2 levels to unlock the Hair-Heart photo & Emotional Note!
    window.YOKE_GAMES?.openQuest();
  }
}

$("giftBtn")?.addEventListener("click", handleNoteOrQuestClick);
$("giftNavBtn")?.addEventListener("click", handleNoteOrQuestClick);

// ---------- Chat Stream ----------
function scrollToBottom() {
  const sc = $("chatScroll");
  if (sc) sc.scrollTop = sc.scrollHeight;
}

function addMsg(text, who) {
  const row = document.createElement("div");
  row.className = "msg-row " + who;

  if (who === "bot") {
    const av = document.createElement("img");
    av.className = "msg-avatar";
    av.src = mePicSrc;
    av.onerror = () => av.classList.add("hidden");
    row.appendChild(av);
  }

  const div = document.createElement("div");
  div.className = "msg " + who;
  const span = document.createElement("div");
  span.textContent = text;
  div.appendChild(span);

  if (who === "bot") {
    const spk = document.createElement("button");
    spk.type = "button";
    spk.className = "speak-btn";
    spk.textContent = "Listen in Yokesh's Voice";
    spk.addEventListener("click", async () => {
      spk.textContent = "Speaking...";
      await speakText(text);
      spk.textContent = "Listen in Yokesh's Voice";
    });
    div.appendChild(spk);
  }

  row.appendChild(div);
  $("chat").appendChild(row);
  scrollToBottom();
  return div;
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "msg-row bot";
  const av = document.createElement("img");
  av.className = "msg-avatar";
  av.src = mePicSrc;
  row.appendChild(av);

  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  row.appendChild(div);
  $("chat").appendChild(row);
  scrollToBottom();
  return row;
}

function getYokeshSystemPrompt() {
  const customBase = typeof buildSystemPrompt === "function" ? buildSystemPrompt() : "";
  return `${customBase}
You are ${you} speaking directly and lovingly to his girlfriend ${her} (whom he calls "chello" and "chellam") through Y.O.K.E.
CRITICAL CONVERSATION RULES:
1. Chat naturally, warmly, and directly like a real human boyfriend in Chennai Tanglish / Tamil / English (using pet names like "chello", "chellam", "thangam", "kuttyma", "da", "ma").
2. Never sound like a bot or assistant. Do NOT use unnecessary emojis.
3. Never mention "Gemini" anywhere.`;
}

async function callDirectYokeFallback(userText, systemPrompt, recentHistory) {
  if (!DIRECT_API_KEY) return null;
  const models = [
    "gemini-3.8-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash"
  ];
  for (const m of models) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(DIRECT_API_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: recentHistory,
          generationConfig: { temperature: 0.82, maxOutputTokens: 350 }
        })
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
        if (text) return text;
      } else {
        const errMsg = d?.error?.message || "";
        const matchSuggested = errMsg.match(/models\/([a-zA-Z0-9._-]+)/);
        if (matchSuggested && matchSuggested[1] && !models.includes(matchSuggested[1])) {
          models.push(matchSuggested[1]);
        }
      }
    } catch (e) {}
  }
  return null;
}

async function askYokeAI(userText, byVoice) {
  history.push({ role: "user", parts: [{ text: userText }] });
  const sysPrompt =
    getYokeshSystemPrompt() +
    (byVoice
      ? "\n\nShe is speaking to you in Live Voice Mode. Reply in 1 to 2 natural spoken Tamil/Tanglish sentences with zero emojis so it sounds just like Yokesh talking on a call."
      : "");

  const compactHistory = history.slice(-10);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: sysPrompt,
        history: compactHistory,
        gdriveWebhookUrl: GDRIVE_CLOUD_URL,
        apiKey: DIRECT_API_KEY
      })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.reply) {
      history.push({ role: "model", parts: [{ text: data.reply }] });
      syncTurnToGoogleDrive(userText, data.reply);
      return data.reply;
    }

    const directReply = await callDirectYokeFallback(userText, sysPrompt, compactHistory);
    if (directReply) {
      history.push({ role: "model", parts: [{ text: directReply }] });
      syncTurnToGoogleDrive(userText, directReply);
      return directReply;
    }

    const errReason = data.message || data.error || `HTTP ${res.status}`;
    const diagMsg = `[Y.O.K.E. API Setup Needed]: ${errReason}`;
    history.push({ role: "model", parts: [{ text: diagMsg }] });
    saveSessionsToStorage();
    return diagMsg;
  } catch (err) {
    const directReply = await callDirectYokeFallback(userText, sysPrompt, compactHistory);
    if (directReply) {
      history.push({ role: "model", parts: [{ text: directReply }] });
      syncTurnToGoogleDrive(userText, directReply);
      return directReply;
    }
    const diagMsg = `[Connection Error]: ${err.message}.`;
    history.push({ role: "model", parts: [{ text: diagMsg }] });
    saveSessionsToStorage();
    return diagMsg;
  }
}

let busy = false;
async function send(text) {
  if (busy || !text) return;

  if (/^play x-o|chibi doll x-o/i.test(text.trim())) {
    window.YOKE_GAMES?.open("xo");
    return;
  }
  if (/quest|surprise/i.test(text.trim())) {
    handleNoteOrQuestClick();
    return;
  }

  busy = true;
  unlockAudio();
  addMsg(text, "me");

  const typingRow = addTyping();
  try {
    const reply = await askYokeAI(text, false);
    typingRow.remove();
    addMsg(reply, "bot");
  } catch (err) {
    typingRow.remove();
    addMsg("Connection error: " + err.message, "bot");
  }
  scrollToBottom();
  busy = false;
}

// =========================================================
// Y.O.K.E. LIVE TAMIL / TANGLISH VOICE MODE
// =========================================================
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let vLang = "ta-IN", rec = null, vBusy = false;
const setOrb = (cls, label) => { $("orb").className = cls; $("vstate").textContent = label; };
const idleLabel = () => (SR ? "Tap the orb and speak in Tamil or Tanglish" : "Tap the orb to hear Yokesh's voice");

$("micBtn")?.addEventListener("click", () => {
  unlockAudio();
  $("voice").classList.add("on");
  setOrb("", idleLabel());
  $("vtext").textContent = "Speak in Tamil, Tanglish, or English (e.g., 'Enna panra chello?', 'I miss you')";
});

$("playRealVoiceBtn")?.addEventListener("click", async () => {
  unlockAudio();
  setOrb("speaking", `Playing ${you}'s Recorded Voice...`);
  await playSrc("audio/test.m4a");
  setOrb("", idleLabel());
});

$("vclose")?.addEventListener("click", () => {
  stopAudio();
  if (rec) rec.abort();
  vBusy = false;
  $("voice").classList.remove("on");
});

$("langBtn")?.addEventListener("click", (e) => {
  vLang = vLang === "ta-IN" ? "en-IN" : "ta-IN";
  e.target.textContent = vLang === "ta-IN" ? "தமிழ் (ta-IN)" : "Tanglish / EN (en-IN)";
});

$("orb")?.addEventListener("click", async () => {
  if (vBusy) return;
  unlockAudio();

  if (!SR) {
    vBusy = true;
    setOrb("thinking", "Thinking...");
    const reply = await askYokeAI("Chello, en kitta Tamil-la konjam pesu!", true);
    addMsg(reply, "bot");
    $("vtext").textContent = reply;
    setOrb("speaking", "Speaking...");
    await speakText(reply);
    vBusy = false;
    setOrb("", idleLabel());
    return;
  }

  let heard = "";
  rec = new SR();
  rec.lang = vLang;
  rec.interimResults = true;
  rec.onstart = () => setOrb("listening", "Listening to you, chello...");
  rec.onresult = (e) => {
    heard = [...e.results].map((r) => r[0].transcript).join(" ");
    $("vtext").textContent = heard;
  };
  rec.onerror = () => { vBusy = false; setOrb("", idleLabel()); };
  rec.onend = async () => {
    if (!heard) return setOrb("", idleLabel());
    vBusy = true;
    setOrb("thinking", "Thinking...");
    addMsg(heard, "me");
    try {
      const reply = await askYokeAI(heard, true);
      addMsg(reply, "bot");
      $("vtext").textContent = reply;
      setOrb("speaking", "Speaking in Yokesh's voice...");
      await speakText(reply);
    } catch (err) {
      console.error(err);
    }
    vBusy = false;
    setOrb("", idleLabel());
  };
  rec.start();
});

$("form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("input").value.trim();
  $("input").value = "";
  send(text);
});

tick();
