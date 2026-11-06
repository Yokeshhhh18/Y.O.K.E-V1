// Y.O.K.E. v19 Interactive Game & 2-Level Secret Quest Module (games.js)
// Features:
// 1. 3D Chibi Doll X-O Battle (Dhanya Doll vs Yokesh Doll)
// 2. 2-Level Human Quest that unlocks Yokesh's Hair-Heart Photo (images/quest_hair_heart.jpg) + Emotional Romantic Note!
(function () {
  const $ = (id) => document.getElementById(id);
  const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
  const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";

  const HER_ICON = (window.YOKE_INLINE_IMAGES && window.YOKE_INLINE_IMAGES.XO_HER_ICON) || (typeof CONFIG !== "undefined" && CONFIG.XO_HER_ICON) || "images/xo_her.png";
  const ME_ICON = (window.YOKE_INLINE_IMAGES && window.YOKE_INLINE_IMAGES.XO_ME_ICON) || (typeof CONFIG !== "undefined" && CONFIG.XO_ME_ICON) || "images/xo_me.png";

  let questCompleted = false;
  try {
    questCompleted = localStorage.getItem("yoke_quest_unlocked_v19") === "1";
  } catch (e) {}

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

  function switchTab(tab) {
    const isQuest = tab === "quest";
    $("tabXOBtn")?.classList.toggle("active", !isQuest);
    $("tabQuestBtn")?.classList.toggle("active", isQuest);
    $("xoView")?.classList.toggle("hidden", isQuest);
    $("questView")?.classList.toggle("hidden", !isQuest);
    if (!isQuest) {
      initXO();
    } else {
      if (questCompleted) {
        showQuestRewardState();
      } else {
        resetQuestToLevel1();
      }
    }
  }

  function openGamesModal(defaultTab = "xo") {
    const modal = $("gamesModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    switchTab(defaultTab);
  }

  function closeGamesModal() {
    $("gamesModal")?.classList.add("hidden");
  }

  // =========================================================
  // 2-LEVEL HUMAN QUEST LOGIC
  // =========================================================
  function resetQuestToLevel1() {
    $("qNode1")?.classList.add("current");
    $("qNode1")?.classList.remove("done");
    $("qNode2")?.classList.remove("current", "done");
    $("qNodeReward")?.classList.remove("current", "done");

    $("questStage1")?.classList.remove("hidden");
    $("questStage2")?.classList.add("hidden");
    $("questRewardBox")?.classList.add("hidden");
    if ($("q1Feedback")) {
      $("q1Feedback").textContent = "Complete Level 1 to reach the final lock.";
      $("q1Feedback").classList.remove("pop-love");
    }
  }

  function advanceToLevel2() {
    playWinFanfare();
    $("qNode1")?.classList.remove("current");
    $("qNode1")?.classList.add("done");
    $("qNode2")?.classList.add("current");

    $("questStage1")?.classList.add("hidden");
    $("questStage2")?.classList.remove("hidden");
    $("questRewardBox")?.classList.add("hidden");
    if ($("q2Feedback")) {
      $("q2Feedback").textContent = "Final step, Chello! Answer to unlock your secret photo & emotional note.";
      $("q2Feedback").classList.remove("pop-love");
    }
  }

  function showQuestRewardState() {
    questCompleted = true;
    try {
      localStorage.setItem("yoke_quest_unlocked_v19", "1");
    } catch (e) {}
    playWinFanfare();
    window.YOKE_FX?.confetti();

    $("qNode1")?.classList.remove("current");
    $("qNode1")?.classList.add("done");
    $("qNode2")?.classList.remove("current");
    $("qNode2")?.classList.add("done");
    $("qNodeReward")?.classList.add("current", "done");

    $("questStage1")?.classList.add("hidden");
    $("questStage2")?.classList.add("hidden");
    $("questRewardBox")?.classList.remove("hidden");

    // Also unlock the main page Emotional Note & Hair-Heart Photo automatically!
    if (typeof window.unlockPersonalNoteFromQuest === "function") {
      window.unlockPersonalNoteFromQuest(false);
    }
  }

  // =========================================================
  // X-O BATTLE LOGIC
  // =========================================================
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
        let inner = `<span class="xo-empty-dot">•</span>`;
        if (val === "X") {
          inner = `<div class="xo-avatar-wrap her-token"><img src="${HER_ICON}" alt="${her}" class="xo-avatar-img"></div>`;
        } else if (val === "O") {
          inner = `<div class="xo-avatar-wrap me-token"><img src="${ME_ICON}" alt="${you}" class="xo-avatar-img"></div>`;
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
      $("xoStatus").textContent = `Un turn dhan chello! Tap a box to place your Queen Doll`;
    }
  }

  function pickSmartAIMove(b) {
    const empty = b.map((v, i) => (v === "" ? i : -1)).filter((i) => i !== -1);
    if (empty.length === 0) return -1;

    if (Math.random() < 0.65) {
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
    if ($("xoStatus")) $("xoStatus").textContent = `${you} yosikkuran...`;

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
      if ($("xoStatus")) $("xoStatus").textContent = "Un turn chello! Place your Queen Doll";
    }, 420);
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
      if ($("xoStatus")) $("xoStatus").textContent = `Woooow ${her} jeichuta! Ippo 2-Level Quest open panni surprise paaru chello!`;
      chatMsg = `X-O la nee jeichuta chello! Unakkaga vachiruka 2-Level Secret Quest-la ennoda Hair-Heart surprise-ah open panni paaru!`;
    } else if (res.winner === "O") {
      scores.yoke++;
      playGameTone(340, 0.28, "sawtooth");
      if ($("xoStatus")) $("xoStatus").textContent = "Naan jeichuten chello! Punishment: Oru cute smile pannu";
      chatMsg = `X-O la naan jeichuten! Aana en மனசுல eppovume nee dhan winner chello.`;
    } else {
      scores.draw++;
      if ($("xoStatus")) $("xoStatus").textContent = "Match Draw! Namma rendu perume semma tough!";
      chatMsg = `X-O Match Draw aagiduchu chello! Innoru round vilayaduvoma?`;
    }
    updateScoreUI();
    if (typeof window.addBotGameSummary === "function") {
      window.addBotGameSummary(chatMsg);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    $("gamesNavBtn")?.addEventListener("click", () => openGamesModal("xo"));
    $("closeGamesBtn")?.addEventListener("click", closeGamesModal);
    $("xoResetBtn")?.addEventListener("click", initXO);
    $("tabXOBtn")?.addEventListener("click", () => switchTab("xo"));
    $("tabQuestBtn")?.addEventListener("click", () => switchTab("quest"));
    $("goToQuestFromXOBtn")?.addEventListener("click", () => switchTab("quest"));

    $("xoBoard")?.addEventListener("click", (e) => {
      const cell = e.target.closest(".xo-cell");
      if (cell) handleXOMove(Number(cell.dataset.idx));
    });

    // Level 1 option clicks
    $("questStage1")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".quest-opt-btn");
      if (!btn) return;
      if (btn.dataset.ans === "correct") {
        if ($("q1Feedback")) {
          $("q1Feedback").textContent = "Correct da en Chello! Level 1 unlocked!";
          $("q1Feedback").classList.add("pop-love");
        }
        setTimeout(advanceToLevel2, 550);
      } else {
        playGameTone(300, 0.18, "sawtooth");
        if ($("q1Feedback")) {
          $("q1Feedback").textContent = "Adhu illa da! Yokesh unna eppovume eppadi kupduvan nu yosi...";
          $("q1Feedback").classList.remove("pop-love");
        }
      }
    });

    // Level 2 option clicks
    $("questStage2")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".quest-opt-btn");
      if (!btn) return;
      if ($("q2Feedback")) {
        $("q2Feedback").textContent =
          btn.dataset.l2 === "yes"
            ? "Ama chello! Nee sonnadha epdi seyama iruppen? Idho paaru!"
            : "Unna pathi oru chinna vishayatha kooda marakka maaten chello! Idho paaru!";
        $("q2Feedback").classList.add("pop-love");
      }
      setTimeout(showQuestRewardState, 650);
    });

    $("replayQuestBtn")?.addEventListener("click", () => {
      questCompleted = false;
      resetQuestToLevel1();
    });

    $("readNoteFromQuestBtn")?.addEventListener("click", () => {
      closeGamesModal();
      if (typeof window.unlockPersonalNoteFromQuest === "function") {
        window.unlockPersonalNoteFromQuest(true);
      }
    });
  });

  window.YOKE_GAMES = {
    open: (tab = "xo") => openGamesModal(tab),
    openQuest: () => openGamesModal("quest"),
    isQuestCompleted: () => questCompleted,
    close: closeGamesModal
  };
})();
