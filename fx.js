// Y.O.K.E. v8 Graphical Particle & Fireworks Engine (fx.js)
(function () {
  const canvas = document.getElementById("fx");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W = (canvas.width = window.innerWidth);
  let H = (canvas.height = window.innerHeight);
  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const particles = [];
  const petals = [];
  const COLORS = ["#ff4d88", "#ffd166", "#ff8fab", "#c77dff", "#ffbe0b", "#ffffff"];

  // Ambient floating rose petals / golden sparkles
  for (let i = 0; i < 26; i++) {
    petals.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 3 + Math.random() * 5,
      vx: -0.3 + Math.random() * 0.6,
      vy: 0.4 + Math.random() * 0.9,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.03,
      color: i % 3 === 0 ? "rgba(255, 209, 102, 0.45)" : "rgba(255, 122, 168, 0.4)"
    });
  }

  function spawnConfettiBurst(x, y, count = 55) {
    const cx = typeof x === "number" ? x : W / 2;
    const cy = typeof y === "number" ? y : H * 0.4;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 9.5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        g: 0.16,
        size: 5 + Math.random() * 6,
        rot: Math.random() * 6.28,
        vrot: (Math.random() - 0.5) * 0.22,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.01,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: i % 4 === 0 ? "heart" : "rect"
      });
    }
  }

  function spawnHeartTrail(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 2.6,
        vy: -1.4 - Math.random() * 2.5,
        g: 0.04,
        size: 6 + Math.random() * 6,
        rot: 0,
        vrot: 0,
        alpha: 0.95,
        decay: 0.022,
        color: i % 2 === 0 ? "#ff5c8a" : "#ffd166",
        shape: "heart"
      });
    }
  }

  function drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 12, size / 12);
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(0, 0, -6, 0, -6, 4);
    ctx.bezierCurveTo(-6, 8, 0, 11, 0, 14);
    ctx.bezierCurveTo(0, 11, 6, 8, 6, 4);
    ctx.bezierCurveTo(6, 0, 0, 0, 0, 4);
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    // Draw ambient petals
    for (const p of petals) {
      p.x += p.vx + Math.sin(p.rot) * 0.25;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y > H + 15) { p.y = -15; p.x = Math.random() * W; }
      if (p.x > W + 15) p.x = -15;
      if (p.x < -15) p.x = W + 15;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw burst particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += pt.g;
      pt.rot += pt.vrot;
      pt.alpha -= pt.decay;

      if (pt.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      if (pt.shape === "heart") {
        drawHeart(ctx, pt.x, pt.y, pt.size, pt.color, pt.alpha);
      } else {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.fillStyle = pt.color;
        ctx.fillRect(-pt.size / 2, -pt.size / 3, pt.size, pt.size * 0.66);
        ctx.restore();
      }
    }

    requestAnimationFrame(loop);
  }
  loop();

  // Tap sparkle burst anywhere on screen
  window.addEventListener("pointerdown", (e) => {
    spawnHeartTrail(e.clientX, e.clientY, 7);
  });

  window.YOKE_FX = {
    confetti: spawnConfettiBurst,
    hearts: spawnHeartTrail
  };
})();
