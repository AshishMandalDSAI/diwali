/* Canvas fireworks engine — rockets, glowing trails, several burst styles. */
(function () {
  "use strict";

  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d", { alpha: true });
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const TAU = Math.PI * 2;

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = () => window.innerWidth < 768;

  let W = 0, H = 0, dpr = 1;
  let quality = coarse || small() ? 0.6 : 1;   // scales particle counts; adapts to frame rate
  const MAX_PARTICLES = () => (coarse || small() ? 900 : 2200);

  const rockets = [];
  const particles = [];
  const flashes = [];
  let running = false, last = 0, autoTimer = 0, autoOn = false;
  let frameAvg = 16;

  // Colour palettes (hue, saturation, lightness)
  const PALETTE = [
    { h: 28, s: 100, l: 60 },  // saffron
    { h: 330, s: 100, l: 65 }, // pink
    { h: 275, s: 95, l: 70 },  // violet
    { h: 48, s: 100, l: 62 },  // yellow-gold
    { h: 8, s: 100, l: 62 },   // vermilion
    { h: 190, s: 100, l: 65 }, // sky
    { h: 140, s: 85, l: 60 },  // emerald
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
  }

  function count(n) { return Math.max(18, Math.round(n * quality)); }

  /* ---------- Rockets ---------- */
  function launch(tx, ty, type, color) {
    if (!running) return;
    tx = tx ?? rand(W * 0.15, W * 0.85);
    ty = ty ?? rand(H * 0.12, H * 0.45);
    const x = Math.min(W - 10, Math.max(10, tx + rand(-W * 0.12, W * 0.12)));
    const y = H + 8;
    const g = 0.055;
    const dy = Math.max(60, y - ty);
    const vy = -Math.sqrt(2 * g * dy);
    const t = -vy / g;
    rockets.push({
      x, y, vx: (tx - x) / t, vy, g,
      trail: [], type: type || randomType(), color: color || pick(PALETTE),
      age: 0,
    });
  }

  function randomType() {
    const r = Math.random();
    if (r < 0.14) return "willow";
    if (r < 0.28) return "ring";
    if (r < 0.42) return "double";
    if (r < 0.54) return "crackle";
    if (r < 0.6) return "heart";
    return "peony";
  }

  /* ---------- Particles ---------- */
  function spawn(x, y, vx, vy, c, o = {}) {
    if (particles.length >= MAX_PARTICLES()) return;
    particles.push({
      x, y, vx, vy,
      h: c.h + rand(-8, 8), s: c.s, l: c.l,
      life: 1, decay: o.decay ?? rand(0.010, 0.018),
      drag: o.drag ?? 0.982, grav: o.grav ?? 0.045,
      w: o.w ?? rand(1.4, 2.4), flicker: !!o.flicker,
      sparkle: o.sparkle || 0,
      t: [x, y], tl: (o.trail ?? 5) * 2,
    });
  }

  function explode(r) {
    const { x, y, color: c, type } = r;
    flashes.push({ x, y, r: type === "willow" ? 140 : 100, a: 0.55, h: c.h });
    const sp = coarse ? 0.9 : 1;

    switch (type) {
      case "ring": {
        const n = count(70), speed = rand(3.2, 4.2) * sp;
        const tilt = rand(0.35, 0.9), rot = rand(0, TAU);
        for (let i = 0; i < n; i++) {
          const a = (TAU * i) / n;
          let vx = Math.cos(a) * speed, vy = Math.sin(a) * speed * tilt;
          const rx = vx * Math.cos(rot) - vy * Math.sin(rot);
          const ry = vx * Math.sin(rot) + vy * Math.cos(rot);
          spawn(x, y, rx, ry, c, { decay: rand(0.011, 0.015), grav: 0.03 });
        }
        peony(x, y, pick(PALETTE), count(30), 1.6 * sp);
        break;
      }
      case "willow": {
        const gold = { h: 42, s: 100, l: 62 };
        const n = count(130);
        for (let i = 0; i < n; i++) {
          const a = rand(0, TAU), s = Math.sqrt(Math.random()) * 5.2 * sp;
          spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, gold, {
            decay: rand(0.0045, 0.0075), drag: 0.972, grav: 0.035, w: rand(1.2, 2), flicker: true, trail: 14,
          });
        }
        break;
      }
      case "double": {
        const c2 = pick(PALETTE.filter((p) => p !== c));
        peony(x, y, c, count(70), 4.6 * sp);
        peony(x, y, c2, count(40), 2.4 * sp);
        break;
      }
      case "crackle": {
        const n = count(90);
        for (let i = 0; i < n; i++) {
          const a = rand(0, TAU), s = Math.sqrt(Math.random()) * 4.6 * sp;
          spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, { h: 45, s: 100, l: 80 }, {
            decay: rand(0.012, 0.02), sparkle: 1, w: rand(1, 1.8),
          });
        }
        break;
      }
      case "heart":
        heart(x, y, { h: 340, s: 100, l: 64 }, 1);
        break;
      default:
        peony(x, y, c, count(110), rand(4.2, 5.4) * sp);
    }
  }

  function peony(x, y, c, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = (TAU * i) / n + rand(-0.05, 0.05);
      const s = speed * (0.55 + Math.pow(Math.random(), 0.5) * 0.45);
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, c);
    }
  }

  function heart(x, y, c, scale) {
    const n = count(90);
    const k = (coarse ? 0.2 : 0.24) * scale;
    for (let i = 0; i < n; i++) {
      const t = (TAU * i) / n;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      spawn(x, y, hx * k, hy * k, c, { decay: 0.011, drag: 0.975, grav: 0.012, w: 2.2 });
    }
    peony(x, y, { h: 48, s: 100, l: 75 }, count(26), 1.2);
  }

  /* ---------- Loop ---------- */
  function frame(now) {
    if (!running) return;
    const raw = Math.min(64, now - (last || now));
    last = now;
    const dt = raw / 16.667 || 1;

    // Adaptive quality: keep things smooth on slower phones
    frameAvg = frameAvg * 0.95 + raw * 0.05;
    if (frameAvg > 26 && quality > 0.35) quality -= 0.01;
    else if (frameAvg < 18 && quality < (coarse || small() ? 0.75 : 1)) quality += 0.002;

    // Clear each frame; trails come from each particle's own position history,
    // so nothing ghosts or smears on the transparent canvas.
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    // Flashes
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, `hsla(${f.h},100%,80%,${f.a})`);
      g.addColorStop(1, `hsla(${f.h},100%,60%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
      f.a -= 0.06 * dt;
      if (f.a <= 0) flashes.splice(i, 1);
    }

    // Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.trail.push(r.x, r.y);
      if (r.trail.length > 10) r.trail.splice(0, 2);
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.vy += r.g * dt;
      r.age += dt;

      ctx.lineWidth = 2.2;
      ctx.strokeStyle = `hsla(${r.color.h},100%,75%,0.9)`;
      ctx.beginPath();
      ctx.moveTo(r.trail[0], r.trail[1]);
      for (let j = 2; j < r.trail.length; j += 2) ctx.lineTo(r.trail[j], r.trail[j + 1]);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,245,220,1)";
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.2, 0, TAU); ctx.fill();

      // a few sparks falling from the rocket
      if (Math.random() < 0.35 * quality) {
        spawn(r.x, r.y, rand(-0.4, 0.4), rand(0.4, 1.2), { h: 40, s: 100, l: 70 }, { decay: 0.05, w: 1, trail: 2 });
      }
      if (r.vy >= -0.4) {
        explode(r);
        rockets.splice(i, 1);
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const drag = Math.pow(p.drag, dt);
      p.vx *= drag; p.vy = p.vy * drag + p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0 || p.y > H + 20) { particles.splice(i, 1); continue; }
      const tr = p.t;
      tr.push(p.x, p.y);
      if (tr.length > p.tl) tr.splice(0, tr.length - p.tl);

      let a = p.life;
      if (p.flicker) a *= 0.55 + Math.random() * 0.45;
      if (p.sparkle && p.life < 0.6) a *= Math.random() < 0.5 ? 1 : 0.1;
      const l = Math.min(92, p.l - (1 - p.life) * 10 + (p.life > 0.85 ? 18 : 0));
      ctx.lineWidth = p.w * (0.6 + p.life * 0.5);
      ctx.strokeStyle = `hsla(${p.h},${p.s}%,${l}%,${(a * 0.5).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(tr[0], tr[1]);
      for (let j = 2; j < tr.length; j += 2) ctx.lineTo(tr[j], tr[j + 1]);
      ctx.stroke();
      // bright head
      const n = tr.length;
      if (n >= 4) {
        ctx.strokeStyle = `hsla(${p.h},${p.s}%,${Math.min(95, l + 12)}%,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(tr[n - 4], tr[n - 3]);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    requestAnimationFrame(frame);
  }

  /* ---------- Auto show ---------- */
  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (!autoOn) return;
    const base = reduced ? 3200 : coarse || small() ? 1400 : 1000;
    autoTimer = setTimeout(() => {
      if (!document.hidden) {
        const r = Math.random();
        if (r < 0.14) launch(undefined, rand(H * 0.12, H * 0.3), "willow");
        else if (r < 0.24 && !reduced) { launch(); setTimeout(() => launch(), 220); }
        else launch();
      }
      scheduleAuto();
    }, rand(base * 0.6, base * 1.4));
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  function auto(on) { autoOn = on; scheduleAuto(); }

  /** Spectacular choreographed sequence for the "Celebrate" button */
  function celebrate() {
    const n = reduced ? 6 : coarse || small() ? 14 : 22;
    for (let i = 0; i < n; i++) {
      setTimeout(() => launch(rand(W * 0.1, W * 0.9), rand(H * 0.1, H * 0.45)), i * 150 + rand(0, 80));
    }
    const t = n * 150 + 300;
    setTimeout(() => {
      launch(W * 0.25, H * 0.2, "willow");
      launch(W * 0.5, H * 0.15, "willow");
      launch(W * 0.75, H * 0.2, "willow");
    }, t);
    setTimeout(() => launch(W * 0.5, H * 0.32, "heart"), t + 1300);
    setTimeout(() => {
      launch(W * 0.2, H * 0.35, "ring");
      launch(W * 0.8, H * 0.35, "ring");
    }, t + 1900);
    return t + 3500;
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else start();
  });
  resize();

  window.Fireworks = { start, stop, launch, auto, celebrate };
})();
