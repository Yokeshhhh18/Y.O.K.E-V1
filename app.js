// Y.O.K.E. v10 — Full-Screen English Jana Nayagan Intro + Real Gemini Conversational AI + Tamil Voice Chat + Chibi X-O Game + Chat History Sidebar
const $ = (id) => document.getElementById(id);
let history = []; // {role: 'user'|'model', parts:[{text}]}
let unlocked = false;
let giftRendered = false;

const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";
const API_URL = (typeof CONFIG !== "undefined" && CONFIG.API_URL) || "/api/chat";
const TTS_URL = (typeof CONFIG !== "undefined" && CONFIG.TTS_URL) || "/api/tts";
const GDRIVE_CLOUD_URL = (typeof CONFIG !== "undefined" && CONFIG.GDRIVE_CLOUD_URL) || "";
const DIRECT_GEMINI_KEY = (typeof CONFIG !== "undefined" && CONFIG.GEMINI_API_KEY) || "";

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
const panel4Src = resolveDriveUrl("images/panel4_blur.png");
const mePicSrc = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.YOUR_PIC) || "images/avatar.jpg");

const GEM_CARDS = [
  { icon: "👑", title: "Play Chibi Doll X-O", sub: "Dhanya Doll vs Yokesh AI Doll!", prompt: "Play X-O Game" },
  { icon: "🎙", title: "Talk in Tamil Voice", sub: "Live voice chat in Yokesh's style", prompt: "__VOICE__" },
  { icon: "🥺", title: "I miss you chellam", sub: "Chat with Y.O.K.E. AI in Tanglish", prompt: "Unna romba miss panren chellam 🥺" },
  { icon: "💌", title: "Birthday Letter", sub: "Read Yokesh's special note for you", prompt: "Surprise 💌" }
];

const CHIPS = (typeof CONFIG !== "undefined" && CONFIG.CHIPS) || [
  "Play X-O Game 👑",
  "Enna pannura chellam? 😏",
  "Unna romba miss panren 🥺",
  "Oru cute Tamil kavithai sollu ✨",
  "Roast me playfully 😜",
  "Tell me why Yokesh loves me 💗"
];

const CLIPS = Object.assign(
  { wish: "audio/test.m4a", tutorial: "audio/test.m4a", miss: "audio/test.m4a" },
  (typeof CONFIG !== "undefined" && CONFIG.CLIPS) || {}
);

const TUTORIAL = (typeof CONFIG !== "undefined" && CONFIG.TUTORIAL) || [
  `Hii chellam! Happy Birthday ${her} 💗! Naan dhan Y.O.K.E., oru AI 🤖 — ${you} avanoda real voice matrum Chennai Tanglish style vechi unakkagave உருவாக்குன personal Gemini AI companion 🥰`,
  "En kitta nee Gemini-la pesura maadhiriye தமிழ்ல, Tanglish-la, illa English-la enna venalum natural-ah chat pannalam 💬! Mela 👑 'X-O Game' tap panni namma 3D Chibi Dolls vechi X-O vilayadalam, illa 🎙 Mic tap panni தமிழ்ல voice-la pesalam ✨"
];

const LETTER = (typeof CONFIG !== "undefined" && CONFIG.LETTER) ||
  `My dearest ${her},\n\nHappy Birthday, en chellam! I built this entire AI world — Y.O.K.E. — just so you always have a fun, loving digital companion trained on my voice and style whenever you miss me.\n\nChat with it about anything on your mind, play the Chibi Doll X-O game, listen to the music, and remember that wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\n${you} 💗`;

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

// ---------- Floating Hearts ----------
const HEARTS = ["💗", "💖", "💛", "🌸", "✨", "💕"];
function spawnHeart(burst) {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 14 + Math.random() * 20 + "px";
  h.style.animationDuration = (burst ? 3 + Math.random() * 2 : 9 + Math.random() * 7) + "s";
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 16000);
}
function burstHearts(n) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(true), i * 65);
}

// =========================================================
// MULTI-SESSION CHAT HISTORY SIDEBAR + GOOGLE DRIVE SYNC
// =========================================================
const SESSIONS_KEY = "yoke_sessions_v10";
let sessions = [];
let activeSessionId = null;

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
      title: "First Birthday Chat 💗",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
      cur.updatedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const firstUser = cur.messages.find((m) => m.role === "user")?.parts?.[0]?.text;
      if (firstUser && cur.title.startsWith("New Birthday Chat")) {
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
    <button type="button" class="sess-item ${s.id === activeSessionId ? "active" : ""}" data-id="${esc(s.id)}">
      <div class="sess-title">💬 ${esc(s.title)}</div>
      <div class="sess-meta"><span>${s.messages.length} msgs</span><span>${esc(s.updatedAt || "")}</span></div>
    </button>`
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

$("sessionList")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".sess-item");
  if (btn) switchSession(btn.dataset.id);
});

$("newChatBtn")?.addEventListener("click", () => {
  const nw = {
    id: "sess_" + Date.now(),
    title: "New Birthday Chat 💗",
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
  addMsg(TUTORIAL[0], "bot");
  history.push({ role: "model", parts: [{ text: TUTORIAL[0] }] });
  saveSessionsToStorage();
});

$("toggleSidebarBtn")?.addEventListener("click", () => {
  $("historySidebar")?.classList.toggle("collapsed");
});
$("closeSidebarBtn")?.addEventListener("click", () => {
  $("historySidebar")?.classList.add("collapsed");
});

async function syncTurnToGoogleDrive(userMessage, yokeReply) {
  saveSessionsToStorage();
  if (!GDRIVE_CLOUD_URL) return;
  try {
    await fetch(GDRIVE_CLOUD_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        sender: her,
        userMessage,
        yokeReply,
        fullHistory: history.slice(-30)
      })
    });
  } catch (e) {}
}

// =========================================================
// MULTI-MODE BGM SYNTHESIZER
// =========================================================
let audioCtx = null;
let bgmMode = 0;
const BGM_MODES = ["Melody", "MusicBox", "MassBeat", "OFF"];
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

  const melodies = {
    Melody: {
      notes: [349.23, 440.00, 523.25, 659.25, 392.00, 493.88, 587.33, 659.25, 293.66, 349.23, 440.00, 523.25],
      wave: "sine", speed: 620, vol: 0.045, sustain: 1.7
    },
    MusicBox: {
      notes: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 587.33, 698.46, 880.00, 1174.66, 880.00, 698.46],
      wave: "triangle", speed: 480, vol: 0.038, sustain: 1.3
    },
    MassBeat: {
      notes: [146.83, 220.00, 293.66, 349.23, 164.81, 246.94, 329.63, 392.00, 130.81, 196.00, 261.63, 329.63],
      wave: "sawtooth", speed: 440, vol: 0.032, sustain: 0.65
    }
  };

  const cfg = melodies[label] || melodies.Melody;
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
    flt.frequency.setValueAtTime(1400, now);

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

// =========================================================
// TAMIL / TANGLISH VOICE ENGINE (MATCHED TO YOKESH'S VOICE)
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

function browserSpeakFallback(text) {
  return new Promise((resolve) => {
    try {
      if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return resolve();
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
      const u = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const hasTamilScript = /[\u0B80-\u0BFF]/.test(clean);
      const preferred = voices.find((v) =>
        hasTamilScript
          ? /ta-IN|tamil|valluvar/i.test(v.name + " " + v.lang)
          : /ta-IN|en-IN|india|rishi|prabhat|male/i.test(v.name + " " + v.lang)
      );
      if (preferred) u.voice = preferred;
      u.lang = hasTamilScript ? "ta-IN" : "en-IN";
      u.pitch = 0.96;
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
      body: JSON.stringify({ text, apiKey: DIRECT_GEMINI_KEY })
    });
    if (!r.ok) throw new Error("TTS " + r.status);
    const { audio, mime } = await r.json();
    if (!audio) throw new Error("Empty audio");
    return await playSrc(`data:${mime || "audio/wav"};base64,${audio}`);
  } catch (e) {
    return await browserSpeakFallback(text);
  }
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
    maxR: Math.max(canvas.width, canvas.height) * 0.75,
    alpha: 0.9
  });
}

function initSparks() {
  const canvas = $("sparks");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  const pts = Array.from({ length: 85 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1 + Math.random() * 3,
    vx: (Math.random() - 0.3) * 1.5,
    vy: -0.9 - Math.random() * 2.4,
    a: 0.4 + Math.random() * 0.6,
    hue: Math.random() > 0.25 ? 28 + Math.random() * 25 : 335 + Math.random() * 20
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 22;
      sw.alpha *= 0.93;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 100, ${sw.alpha})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
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
// JANA NAYAGAN FULL-SCREEN ENGLISH INTRO SEQUENCE
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
  startChatBGM(3);
  clearStageTimeouts();
  introDone = false;
  $("wish").textContent = "";
  $("intro").classList.remove("out", "hidden");
  $("intro").classList.add("go");

  // Play Yokesh's real voice greeting ("Hii chellam...") right as the intro starts!
  if (CLIPS.wish) playSrc(CLIPS.wish);

  // PANEL 1 (0s - 4.2s): HAPPY (Yokesh arms wide open)
  introStageMusic = "slam";
  startIntroMassBGM();
  playCinemaImpact(85, 1.4);
  triggerFlashAndShake();
  showStage("jnStage1");

  // PANEL 2 (4.2s - 8.4s): BIRTHDAY (Dhanya looking back)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "heroine";
    triggerFlashAndShake();
    playCinemaImpact(75, 1.4);
    showStage("jnStage2");
  }, 4200));

  // PANEL 3 (8.4s - 12.6s): DHANYA (Hugging together)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "hero";
    triggerFlashAndShake();
    playCinemaImpact(65, 1.6);
    showStage("jnStage3");
  }, 8400));

  // PANEL 4 (12.6s - 18.5s): HAPPY BIRTHDAY DHANYA (Blurred Panel 3 Background + Typewriter Wish)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "climax";
    triggerFlashAndShake();
    playCinemaImpact(48, 2.2);
    showStage("jnStage4");
    const text = `Happy Birthday, ${her} 💗`;
    let i = 0;
    (function type() {
      if (introDone) return;
      $("wish").textContent = text.slice(0, i++);
      if (i <= text.length) stageTimeouts.push(setTimeout(type, 80));
      else stageTimeouts.push(setTimeout(endIntro, 3200));
    })();
  }, 12600));
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
// PHOTO-FREE COUNTDOWN WITH 4 ANIMATED FLIP TILES
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

function tick() {
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

function unlock() {
  if (unlocked) return;
  unlocked = true;
  $("lock")?.classList.add("hidden");
  $("appLayout")?.classList.remove("hidden");
  document.body.classList.add("unlocked");
  $("intro")?.classList.remove("hidden");
  initSparks();
}

// =========================================================
// REAL GEMINI AI CONVERSATION + CHIBI X-O GAME INTEGRATION
// =========================================================
async function beginChat() {
  burstHearts(24);
  setInterval(() => spawnHeart(false), 1100);

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
    await new Promise((r) => setTimeout(r, i === 0 ? 350 : 1200));
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
      <span class="gem-card-icon">${c.icon}</span>
      <div>
        <div class="gem-card-title">${esc(c.title)}</div>
        <div class="gem-card-sub">${esc(c.sub)}</div>
      </div>
    </button>
  `).join("");
  $("chips").addEventListener("click", (e) => {
    const card = e.target.closest(".gem-card");
    if (!card) return;
    if (card.dataset.prompt === "__VOICE__") {
      $("micBtn")?.click();
    } else {
      send(card.dataset.prompt);
    }
  });
}

if ($("quickBar")) {
  $("quickBar").innerHTML = CHIPS.map((c) => `<button type="button" class="chip">${esc(c)}</button>`).join("");
  $("quickBar").addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) send(e.target.textContent);
  });
}

// ---------- Gift Section (NO POLAROID PHOTOS — ONLY ROMANTIC LETTER & OPTIONAL SONG/VIDEOS!) ----------
function renderGift() {
  if (giftRendered) return;
  giftRendered = true;

  const vids = ((typeof CONFIG !== "undefined" && CONFIG.VIDEOS) || [])
    .map((v) => `<a class="card" href="${esc(v.url)}" target="_blank" rel="noopener">
        <span class="icon">🎬</span><span>${esc(v.title)}<small>Tap to watch</small></span></a>`)
    .join("");

  const songObj = typeof CONFIG !== "undefined" && CONFIG.SONG;
  const songHtml = songObj && songObj.url && songObj.url !== "#" ? `
    <div><h3 class="section-title">A Song For You 🎶</h3>
      <a class="card songcard" href="${esc(songObj.url)}" target="_blank" rel="noopener">
        <span class="icon">💿</span><span>${esc(songObj.title || "Our Song")}<small>Tap to listen 🎧</small></span></a></div>` : "";

  $("giftContent").innerHTML = `
    <div class="letter">${esc(LETTER).replace(/\n/g, "<br>")}</div>
    ${songHtml}
    ${vids ? `<div><h3 class="section-title">Special Videos</h3><div class="list">${vids}</div></div>` : ""}`;
}

function openGift() {
  renderGift();
  $("giftBtn")?.classList.add("hidden");
  $("giftContent")?.classList.remove("hidden");
  burstHearts(25);
  window.YOKE_FX?.confetti();
  setTimeout(() => $("gift")?.scrollIntoView({ behavior: "smooth" }), 150);
}
$("giftBtn")?.addEventListener("click", openGift);
$("giftNavBtn")?.addEventListener("click", openGift);

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
    spk.innerHTML = "🔊 Listen in Tamil/Tanglish";
    spk.addEventListener("click", async () => {
      spk.textContent = "🔊 Speaking…";
      await speakText(text);
      spk.innerHTML = "🔊 Listen in Tamil/Tanglish";
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
You are Y.O.K.E. (You're Our Kind of Everything), a smart, conversational, deeply affectionate AI companion created by ${you} as a birthday gift for his girlfriend ${her}.
CRITICAL CONVERSATION RULES:
1. Chat naturally, intelligently, and directly about WHATEVER she asks or says—just like Gemini—while speaking in ${you}'s warm, playful Chennai Tanglish / Tamil / English style (using pet names like "chellam", "thangam", "kuttyma", "da", "ma").
2. NEVER give repetitive or generic template replies. Directly answer her exact question ("enna panriga", jokes, stories, advice, Tamil songs, teasing, life questions, or casual banter) with wit, warmth, and real conversational depth!
3. Always remember you are Y.O.K.E. AI 🤖 built with love by ${you} for ${her}.`;
}

// Direct client-side Gemini fallback with automatic ListModels discovery (Active 2026 models, retired 1.5-flash removed!)
async function callDirectGeminiFallback(userText, systemPrompt, recentHistory) {
  if (!DIRECT_GEMINI_KEY) return null;
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest"
  ];
  try {
    const lr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(DIRECT_GEMINI_KEY)}`);
    if (lr.ok) {
      const ld = await lr.json();
      (ld.models || []).forEach((m) => {
        const name = String(m.name || "").replace(/^models\//, "");
        if (
          m.supportedGenerationMethods?.includes("generateContent") &&
          /gemini/i.test(name) &&
          !/tts|image|embedding|vision|aqa|veo|imagen/i.test(name) &&
          !models.includes(name)
        ) {
          models.push(name);
        }
      });
    }
  } catch (e) {}

  for (const m of models) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(DIRECT_GEMINI_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: recentHistory,
          generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
        })
      });
      if (r.ok) {
        const d = await r.json();
        const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
        if (text) return text;
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
      ? "\n\nShe is speaking to you in Live Tamil/Tanglish Voice Mode. Reply in 1 to 3 natural spoken Tamil/Tanglish sentences without emojis so it sounds just like Yokesh talking on a call."
      : "");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: sysPrompt,
        history,
        gdriveWebhookUrl: GDRIVE_CLOUD_URL,
        apiKey: DIRECT_GEMINI_KEY
      })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.reply) {
      history.push({ role: "model", parts: [{ text: data.reply }] });
      syncTurnToGoogleDrive(userText, data.reply);
      return data.reply;
    }

    // Try direct Gemini call if API key is in config.js
    const directReply = await callDirectGeminiFallback(userText, sysPrompt, history.slice(-16));
    if (directReply) {
      history.push({ role: "model", parts: [{ text: directReply }] });
      syncTurnToGoogleDrive(userText, directReply);
      return directReply;
    }

    // Show exact diagnostic reason so Yokesh knows why Gemini didn't respond!
    const errReason = data.message || data.error || `HTTP ${res.status}`;
    const diagMsg = `⚠️ [Gemini API Setup Needed]: ${errReason}. (To fix: In Vercel -> Settings -> Environment Variables, add GEMINI_API_KEY with your key from aistudio.google.com/apikey and click Redeploy — or paste it inside config.js!)`;
    history.push({ role: "model", parts: [{ text: diagMsg }] });
    saveSessionsToStorage();
    return diagMsg;
  } catch (err) {
    const directReply = await callDirectGeminiFallback(userText, sysPrompt, history.slice(-16));
    if (directReply) {
      history.push({ role: "model", parts: [{ text: directReply }] });
      syncTurnToGoogleDrive(userText, directReply);
      return directReply;
    }
    const diagMsg = `⚠️ [Could not reach /api/chat]: ${err.message}. Make sure this is deployed on Vercel with GEMINI_API_KEY set in Environment Variables (or paste your key in config.js).`;
    history.push({ role: "model", parts: [{ text: diagMsg }] });
    saveSessionsToStorage();
    return diagMsg;
  }
}

let busy = false;
async function send(text) {
  if (busy || !text) return;

  if (/^play x-o|chibi doll x-o/i.test(text.trim())) {
    window.YOKE_GAMES?.open();
    return;
  }

  busy = true;
  unlockAudio();
  addMsg(text, "me");
  if (/^surprise/i.test(text.trim())) openGift();

  const typingRow = addTyping();
  try {
    const reply = await askYokeAI(text, false);
    typingRow.remove();
    addMsg(reply, "bot");
  } catch (err) {
    typingRow.remove();
    addMsg("⚠️ Connection error: " + err.message, "bot");
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
const idleLabel = () => (SR ? "Tap the orb & speak in Tamil or Tanglish 🎙" : "Tap the orb to hear Y.O.K.E. AI talk 💗");

$("micBtn")?.addEventListener("click", () => {
  unlockAudio();
  $("voice").classList.add("on");
  setOrb("", idleLabel());
  $("vtext").textContent = "தமிழ்ல இல்ல Tanglish-ல எது வேணாலும் பேசு செல்லம்… (e.g., 'என்ன பண்றீங்க?', 'I miss you')";
});

$("playRealVoiceBtn")?.addEventListener("click", async () => {
  unlockAudio();
  setOrb("speaking", `Playing ${you}'s Original Recorded Voice… 🎧`);
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
  e.target.textContent = vLang === "ta-IN" ? "🌐 தமிழ் (ta-IN)" : "🌐 Tanglish / EN (en-IN)";
});

$("orb")?.addEventListener("click", async () => {
  if (vBusy) return;
  unlockAudio();

  if (!SR) {
    vBusy = true;
    setOrb("thinking", "Thinking…");
    const reply = await askYokeAI("Chellam, en kitta தமிழ்ல konjam pesu!", true);
    addMsg(reply, "bot");
    $("vtext").textContent = reply;
    setOrb("speaking", "Speaking…");
    await speakText(reply);
    vBusy = false;
    setOrb("", idleLabel());
    return;
  }

  let heard = "";
  rec = new SR();
  rec.lang = vLang;
  rec.interimResults = true;
  rec.onstart = () => setOrb("listening", "Listening to you in Tamil / Tanglish, chellam… 🎙");
  rec.onresult = (e) => {
    heard = [...e.results].map((r) => r[0].transcript).join(" ");
    $("vtext").textContent = heard;
  };
  rec.onerror = () => { vBusy = false; setOrb("", idleLabel()); };
  rec.onend = async () => {
    if (!heard) return setOrb("", idleLabel());
    vBusy = true;
    setOrb("thinking", "Y.O.K.E. AI is thinking… 🤔");
    addMsg(heard, "me");
    try {
      const reply = await askYokeAI(heard, true);
      addMsg(reply, "bot");
      $("vtext").textContent = reply;
      setOrb("speaking", "Speaking in Tamil / Tanglish… 🔊");
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
