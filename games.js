// Y.O.K.E. v10 Interactive Game Module (games.js)
// Features: 3D Chibi Doll X-O Battle (Dhanya 3D Tiara Doll vs Yokesh 3D AI Doll)
(function () {
  const $ = (id) => document.getElementById(id);
  const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
  const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";

  const HER_ICON = (typeof CONFIG !== "undefined" && CONFIG.XO_HER_ICON) || "images/xo_her.png";
  const ME_ICON = (typeof CONFIG !== "undefined" && CONFIG.XO_ME_ICON) || "images/xo_me.png";

  function playGameTone(freq = 520, dur = 0.14, type = "sine") {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!window._yokeGameAC) window._yokeGameAC = new AC();
      const ctx = window._yokeGameAC;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    } catch (e) {}
  }

  function playWinFanfare() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => playGameTone(f, 0.22, "triangle"), i * 110);
    });
  }

  function openGamesModal() {
    const modal = $("gamesModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    initXO();
  }

  function closeGamesModal() {
    $("gamesModal")?.classList.add("hidden");
  }

  let board = Array(9).fill("");
  let xoOver = false;
  let xoLocked = false;
  const scores = { her: 0, yoke: 0, draw: 0 };

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const LINE_COORDS = {
    "0,1,2": [10, 16.6, 90, 16.6],
    "3,4,5": [10, 50.0, 90, 50.0],
    "6,7,8": [10, 83.3, 90, 83.3],
    "0,3,6": [16.6, 10, 16.6, 90],
    "1,4,7": [50.0, 10, 50.0, 90],
    "2,5,8": [83.3, 10, 83.3, 90],
    "0,4,8": [12, 12, 88, 88],
    "2,4,6": [88, 12, 12, 88]
  };

  function checkWinner(b) {
    for (const [a, c, d] of WIN_LINES) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line: [a, c, d] };
      }
    }
    if (b.every((cell) => cell !== "")) return { winner: "draw", line: null };
    return null;
  }

  function renderXOBoard() {
    const grid = $("xoBoard");
    if (!grid) return;
    grid.innerHTML = board
      .map((val, idx) => {
        let inner = `<span class="xo-empty-dot">✨</span>`;
        if (val === "X") {
          inner = `<div class="xo-avatar-wrap her-token"><img src="${HER_ICON}" alt="${her}" class="xo-avatar-img"><span class="xo-badge">👑</span></div>`;
        } else if (val === "O") {
          inner = `<div class="xo-avatar-wrap me-token"><img src="${ME_ICON}" alt="${you}" class="xo-avatar-img"><span class="xo-badge">🤖</span></div>`;
        }
        return `
      <button type="button" class="xo-cell ${val ? "taken " + val.toLowerCase() : ""}" data-idx="${idx}" ${val || xoOver ? "disabled" : ""}>
        ${inner}
      </button>`;
      })
      .join("");
  }

  function drawWinStrike(line) {
    const svg = $("xoWinSvg");
    if (!svg) return;
    if (!line) {
      svg.innerHTML = "";
      svg.classList.add("hidden");
      return;
    }
    const key = line.join(",");
    const [x1, y1, x2, y2] = LINE_COORDS[key] || [10, 50, 90, 50];
    svg.classList.remove("hidden");
    svg.innerHTML = `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" class="win-stroke" />`;
  }

  function updateScoreUI() {
    if ($("scoreHer")) $("scoreHer").textContent = scores.her;
    if ($("scoreYoke")) $("scoreYoke").textContent = scores.yoke;
    if ($("scoreDraw")) $("scoreDraw").textContent = scores.draw;
  }

  function initXO() {
    board = Array(9).fill("");
    xoOver = false;
    xoLocked = false;
    drawWinStrike(null);
    renderXOBoard();
    updateScoreUI();
    if ($("xoStatus")) {
      $("xoStatus").textContent = `Un turn dhan chellam! Tap a box to place your Queen Doll 👑👇`;
    }
  }

  function pickSmartAIMove(b) {
    const empty = b.map((v, i) => (v === "" ? i : -1)).filter((i) => i !== -1);
    if (empty.length === 0) return -1;

    if (Math.random() < 0.72) {
      for (const idx of empty) {
        const copy = b.slice();
        copy[idx] = "O";
        if (checkWinner(copy)?.winner === "O") return idx;
      }
      for (const idx of empty) {
        const copy = b.slice();
        copy[idx] = "X";
        if (checkWinner(copy)?.winner === "X") return idx;
      }
      if (b[4] === "") return 4;
    }
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function handleXOMove(idx) {
    if (xoOver || xoLocked || board[idx] !== "") return;
    board[idx] = "X";
    playGameTone(620, 0.12, "sine");
    renderXOBoard();

    let res = checkWinner(board);
    if (res) return finishXO(res);

    xoLocked = true;
    if ($("xoStatus")) $("xoStatus").textContent = "🤖 Y.O.K.E. AI Doll yosikkudhu… 🤔";

    setTimeout(() => {
      const aiIdx = pickSmartAIMove(board);
      if (aiIdx !== -1) {
        board[aiIdx] = "O";
        playGameTone(440, 0.14, "triangle");
      }
      xoLocked = false;
      renderXOBoard();
      res = checkWinner(board);
      if (res) return finishXO(res);
      if ($("xoStatus")) $("xoStatus").textContent = "Un turn chellam! Place your Queen Doll 👑💗";
    }, 460);
  }

  function finishXO(res) {
    xoOver = true;
    if (res.line) {
      drawWinStrike(res.line);
      res.line.forEach((i) => {
        document.querySelector(`.xo-cell[data-idx="${i}"]`)?.classList.add("win-cell");
      });
    }

    let chatMsg = "";
    if (res.winner === "X") {
      scores.her++;
      playWinFanfare();
      window.YOKE_FX?.confetti();
      if ($("xoStatus")) $("xoStatus").textContent = `🥳 Woooow ${her} Doll jeichuta! Queen always rules 👑💗`;
      chatMsg = `🎮 Chibi X-O: Yayy chellam! Unnoda Queen doll ennoda AI doll-ah jeichiduchu 🥳👑 Birthday girl-ku neraya chocolates! 🍫💗`;
    } else if (res.winner === "O") {
      scores.yoke++;
      playGameTone(340, 0.28, "sawtooth");
      if ($("xoStatus")) $("xoStatus").textContent = "🤖 Ennoda Y.O.K.E. AI doll jeichuten! 😜 Punishment: Oru cute smile pannu 😁💗";
      chatMsg = `🎮 Chibi X-O la naan jeichuten 😜 Aana ennoda creator ${you}-kum enakkum eppovume nee dhan real winner chellam! 💗`;
    } else {
      scores.draw++;
      if ($("xoStatus")) $("xoStatus").textContent = "🤝 Match Draw! Namma rendu dolls-ume semma cute & tough 😍";
      chatMsg = `🎮 Chibi X-O Draw aagiduchu chellam 🤝 Innoru round vilayaduvoma? 😏`;
    }
    updateScoreUI();
    if (typeof window.addBotGameSummary === "function") {
      window.addBotGameSummary(chatMsg);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    $("gamesNavBtn")?.addEventListener("click", openGamesModal);
    $("closeGamesBtn")?.addEventListener("click", closeGamesModal);
    $("xoResetBtn")?.addEventListener("click", initXO);
    $("xoBoard")?.addEventListener("click", (e) => {
      const cell = e.target.closest(".xo-cell");
      if (cell) handleXOMove(Number(cell.dataset.idx));
    });
  });

  window.YOKE_GAMES = {
    open: openGamesModal,
    close: closeGamesModal
  };
})();
