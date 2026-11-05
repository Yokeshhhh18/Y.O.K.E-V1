// Y.O.K.E. v19 Interactive Game & 2-Level Human Quest Module (games.js)
// Features:
// 1. 2-Level Secret Human Quest -> Unlocks Yokesh's Hair-Heart Photo (images/quest_heart.jpg) + Emotional Romantic Note
// 2. 3D Chibi Doll X-O Battle (Dhanya Doll vs Yokesh Doll) with human banter
(function () {
  const $ = (id) => document.getElementById(id);
  const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
  const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";

  const HER_ICON = (typeof CONFIG !== "undefined" && CONFIG.XO_HER_ICON) || "images/xo_her.png";
  const ME_ICON = (typeof CONFIG !== "undefined" && CONFIG.XO_ME_ICON) || "images/xo_me.png";
  const QUEST_IMAGE = (typeof CONFIG !== "undefined" && CONFIG.QUEST_IMAGE) || "images/quest_heart.jpg";
  const QUEST_CAPTION =
    (typeof CONFIG !== "undefined" && CONFIG.QUEST_CAPTION) ||
    "Nee en kitta mudila heart shape panni kaata sonna la chello... paruu unakkaga naan senjiten.";

  let questLevel = 1; // 1 -> Level 1, 2 -> Level 2, 3 -> Unlocked!

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

  function switchTab(tabName) {
    const isQuest = tabName === "quest";
    $("tabQuestBtn")?.classList.toggle("active", isQuest);
    $("tabXoBtn")?.classList.toggle("active", !isQuest);
    $("questView")?.classList.toggle("hidden", !isQuest);
    $("xoView")?.classList.toggle("hidden", isQuest);
    if (isQuest) {
      renderQuestStage();
    } else {
      initXO();
    }
  }

  function openGamesModal(defaultTab = "quest") {
    const modal = $("gamesModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    switchTab(defaultTab);
  }

  function closeGamesModal() {
    $("gamesModal")?.classList.add("hidden");
  }

  // =========================================================
  // 2-LEVEL HUMAN QUEST (UNLOCKS HAIR-HEART PHOTO & ROMANTIC NOTE)
  // =========================================================
  function renderQuestStage() {
    const box = $("questStageBody");
    if (!box) return;

    const node1 = $("qNode1");
    const node2 = $("qNode2");
    if (node1) {
      node1.className = "quest-node " + (questLevel === 1 ? "current" : "done");
      node1.textContent = questLevel > 1 ? "✓" : "1";
    }
    if (node2) {
      node2.className = "quest-node " + (questLevel === 2 ? "current" : questLevel > 2 ? "done" : "");
      node2.textContent = questLevel > 2 ? "✓" : "2";
    }

    if (questLevel === 1) {
      box.innerHTML = `
        <div class="yn-progress">LEVEL 1 OF 2 • OUR LITTLE SECRET</div>
        <div class="yn-question">Chello, nee en kitta oru naal en mudila (hair-la) enna shape panni kaata solli ketta nyabagam irukka?</div>
        <div id="questFeedback" class="yn-reaction">Correct-ah choose pannu, illana X-O la oru round enna jeichu Level 1 clear pannu!</div>
        <div class="quest-choices">
          <button type="button" class="game-action-btn quest-opt" data-ans="heart">En mudila Heart Shape</button>
          <button type="button" class="game-action-btn secondary quest-opt" data-ans="wrong1">Star Shape</button>
          <button type="button" class="game-action-btn secondary quest-opt" data-ans="xo">Win 1 X-O Round Instead</button>
        </div>
      `;
      box.querySelectorAll(".quest-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ans = btn.dataset.ans;
          if (ans === "heart") {
            playWinFanfare();
            const fb = $("questFeedback");
            if (fb) {
              fb.textContent = "Correct-ah solluva nu theriyum chello! Moving to Level 2...";
              fb.classList.add("pop-love");
            }
            setTimeout(() => {
              questLevel = 2;
              renderQuestStage();
            }, 700);
          } else if (ans === "xo") {
            switchTab("xo");
          } else {
            playGameTone(300, 0.2, "sawtooth");
            const fb = $("questFeedback");
            if (fb) fb.textContent = "Ayyo adhu illa chello! Nalla yosi... mudila enna shape ketta?";
          }
        });
      });
    } else if (questLevel === 2) {
      box.innerHTML = `
        <div class="yn-progress">LEVEL 2 OF 2 • FINAL PROMISE</div>
        <div class="yn-question">Level 1 cleared! Ippo unakkaga naan senja andha photo-vayum ennoda personal note-ayum kaata poren... Aana adhuku munnadi oru unmaiya sollu: En koodave eppovum irupiya chello?</div>
        <div id="questFeedback" class="yn-reaction">Un manasula irukuradha tap pannu</div>
        <div class="quest-choices">
          <button type="button" class="game-action-btn gold-cta quest-l2" data-ans="yes1">Eppovume un kooda dhan Yokesh</button>
          <button type="button" class="game-action-btn quest-l2" data-ans="yes2">Forever & Always Chello</button>
        </div>
      `;
      box.querySelectorAll(".quest-l2").forEach((btn) => {
        btn.addEventListener("click", () => {
          playWinFanfare();
          window.YOKE_FX?.confetti();
          questLevel = 3;
          renderQuestStage();
          if (typeof window.unlockPersonalQuestReward === "function") {
            window.unlockPersonalQuestReward();
          }
        });
      });
    } else {
      const rawLetter = (typeof CONFIG !== "undefined" && CONFIG.LETTER) || "";
      const safeLetter = String(rawLetter)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      box.innerHTML = `
        <div class="yn-progress">QUEST COMPLETED • UNLOCKED FOR ${her.toUpperCase()}</div>
        <h3 class="quest-unlock-title">Nee Ketta Hair-Heart & En Manasu</h3>
        <div class="quest-photo-frame">
          <img src="${QUEST_IMAGE}" alt="Hair Heart for ${her}" class="quest-unlocked-img">
          <p class="quest-photo-cap">${QUEST_CAPTION}</p>
        </div>
        <div class="letter quest-letter-box">${safeLetter}</div>
        <div class="quest-final-actions">
          <button type="button" id="questReplayBtn" class="game-action-btn secondary">Replay 2-Level Quest</button>
          <button type="button" id="questViewInPageBtn" class="game-action-btn gold-cta">Keep Unlocked on Page</button>
        </div>
      `;
      $("questReplayBtn")?.addEventListener("click", () => {
        questLevel = 1;
        renderQuestStage();
      });
      $("questViewInPageBtn")?.addEventListener("click", () => {
        if (typeof window.unlockPersonalQuestReward === "function") {
          window.unlockPersonalQuestReward();
        }
        closeGamesModal();
      });
    }
  }

  // =========================================================
  // X-O BATTLE WITH HUMAN BANTER
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
      $("xoStatus").textContent = `Un turn dhan chello! Enna jeichu Level 1 Quest-ah unlock pannu paapom.`;
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
    if ($("xoStatus")) $("xoStatus").textContent = `${you} yosikiran...`;

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
      if ($("xoStatus")) $("xoStatus").textContent = "Un turn chello! Place your doll.";
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
      if (questLevel === 1) questLevel = 2;
      if ($("xoStatus")) $("xoStatus").textContent = `Parra! Ennaye jeichuta chello! Level 1 Quest unlocked — tap '2-Level Quest' above!`;
      chatMsg = `X-O la enna jeichuta chello! Promise panna maadhiri Level 1 Quest unlock aagiduchu.`;
    } else if (res.winner === "O") {
      scores.yoke++;
      playGameTone(340, 0.28, "sawtooth");
      if ($("xoStatus")) $("xoStatus").textContent = `Naan jeichuten chello! Dare: Ippo oru cute smile pannu, apram innoru round vaa.`;
      chatMsg = `X-O la naan jeichuten chello... Aana un சிரிப்புக்கு munnadi naan eppovume தோத்து போயிடுவேன்.`;
    } else {
      scores.draw++;
      if ($("xoStatus")) $("xoStatus").textContent = "Match Draw! Namma rendu perume semma tough dhan.";
      chatMsg = `X-O match draw aagiduchu chello. Innoru round poduvoma?`;
    }
    updateScoreUI();
    if (typeof window.addBotGameSummary === "function") {
      window.addBotGameSummary(chatMsg);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    $("gamesNavBtn")?.addEventListener("click", () => openGamesModal("xo"));
    $("tabQuestBtn")?.addEventListener("click", () => switchTab("quest"));
    $("tabXoBtn")?.addEventListener("click", () => switchTab("xo"));
    $("closeGamesBtn")?.addEventListener("click", closeGamesModal);
    $("xoResetBtn")?.addEventListener("click", initXO);
    $("xoBoard")?.addEventListener("click", (e) => {
      const cell = e.target.closest(".xo-cell");
      if (cell) handleXOMove(Number(cell.dataset.idx));
    });
  });

  window.YOKE_GAMES = {
    open: (tab = "quest") => openGamesModal(tab),
    close: closeGamesModal,
    isQuestUnlocked: () => questLevel >= 3
  };
})();
