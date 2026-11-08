/* Page orchestration: intro, decorations, interactions, share & music UI. */
(function () {
  "use strict";
  const cfg = window.DIWALI_CONFIG || {};
  const Art = window.DiwaliArt;
  const FW = window.Fireworks;
  const Music = window.DiwaliMusic;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Decorations ---------- */
  function buildSky() {
    const sky = $("#sky");
    const n = mobile ? 55 : 110;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i");
      const size = rand(1, i % 9 === 0 ? 3 : 2.2);
      s.className = "star" + (Math.random() < 0.12 ? " star--gold" : "");
      s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 78)}%;width:${size}px;height:${size}px;--d:${rand(2, 5).toFixed(2)}s;--delay:${rand(-5, 0).toFixed(2)}s`;
      frag.appendChild(s);
    }
    sky.appendChild(frag);
  }

  function buildFloaters() {
    if (reduced) return;
    const layer = $("#floaters");
    const frag = document.createDocumentFragment();
    const embers = mobile ? 12 : 24;
    for (let i = 0; i < embers; i++) {
      const e = document.createElement("i");
      const size = rand(3, 7);
      e.className = "ember";
      e.style.cssText = `left:${rand(0, 100)}%;width:${size}px;height:${size}px;--d:${rand(10, 18).toFixed(1)}s;--delay:${rand(-18, 0).toFixed(1)}s;--drift:${rand(-60, 60).toFixed(0)}px`;
      frag.appendChild(e);
    }
    const colors = ["#ff8a1f", "#ffb627", "#ff4fa3", "#ffd36b", "#e8361f", "#ff6fb5"];
    const petals = mobile ? 8 : 15;
    for (let i = 0; i < petals; i++) {
      const p = document.createElement("div");
      const size = rand(10, 18);
      p.className = "petal";
      p.style.cssText = `left:${rand(0, 100)}%;width:${size}px;height:${size * 1.3}px;--d:${rand(12, 22).toFixed(1)}s;--delay:${rand(-22, 0).toFixed(1)}s;--drift:${rand(-120, 120).toFixed(0)}px;--spin:${rand(3, 7).toFixed(1)}s`;
      p.innerHTML = Art.petal(colors[i % colors.length]);
      frag.appendChild(p);
    }
    layer.appendChild(frag);
  }

  function buildLanterns() {
    const wrap = $("#lanterns");
    const set = mobile
      ? [{ x: 3, s: 20, w: 46, c: ["#ff7a3d", "#c2185b"] }, { x: 20, s: 60, w: 38, c: ["#ffcf4a", "#e65100"] }, { x: 66, s: 50, w: 40, c: ["#ff5fa8", "#7b1fa2"] }]
      : [
          { x: 4, s: 30, w: 64, c: ["#ff7a3d", "#c2185b"] },
          { x: 14, s: 110, w: 52, c: ["#ffcf4a", "#e65100"] },
          { x: 72, s: 20, w: 58, c: ["#ff9e40", "#d84315"] },
          { x: 84, s: 120, w: 56, c: ["#ff5fa8", "#7b1fa2"] },
        ];
    set.forEach((l, i) => {
      const el = document.createElement("div");
      el.className = "lantern";
      el.style.cssText = `left:${l.x}%;width:${l.w}px;--d:${rand(4, 6.5).toFixed(1)}s;--a:${rand(3, 6).toFixed(1)}deg;animation-delay:${-i * 1.3}s`;
      el.innerHTML = Art.lantern(l.c[0], l.c[1], l.s);
      wrap.appendChild(el);
    });
  }

  function buildDiyas() {
    const top = $("#diyaRowTop");
    const row = mobile
      ? ["candle", "orange", "pink", "orange", "candle"]
      : ["candle", "orange", "red", "pink", "red", "orange", "candle"];
    top.innerHTML = row
      .map((t) => (t === "candle"
        ? `<span class="candle">${Art.candle({ height: 70 + Math.round(rand(0, 24)) })}</span>`
        : `<span class="diya">${Art.diya({ hue: t })}</span>`))
      .join("");

    $("#altar").innerHTML = [
      `<span class="candle">${Art.candle({ height: 92 })}</span>`,
      `<span class="diya">${Art.diya({ hue: "pink" })}</span>`,
      `<span class="diya diya--big">${Art.diya()}</span>`,
      `<span class="diya">${Art.diya({ hue: "red" })}</span>`,
      `<span class="candle">${Art.candle({ height: 92 })}</span>`,
    ].join("");

    // de-sync flame flicker for a natural look
    $$(".stage .flame, .stage .flame-glow").forEach((f) => {
      f.style.animationDelay = `${rand(-2, 0).toFixed(2)}s`;
    });
  }

  function buildRangoli() {
    $("#rangoliHero").innerHTML = Art.rangoli();
    $("#rangoliCard").innerHTML = Art.rangoli();
  }

  /* ---------- Reveal on scroll ---------- */
  function setupReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
    items.forEach((i) => io.observe(i));
  }

  /* ---------- Intro ---------- */
  const intro = $("#intro");
  let entered = false, autoEnter = 0;

  function playIntro() {
    $("#introDiya").innerHTML = Art.diya();
    const steps = [[500, "is-lit"], [1300, "step-1"], [2100, "step-2"], [2900, "step-3"]];
    steps.forEach(([t, c]) => setTimeout(() => intro.classList.add(c), reduced ? 0 : t));
    // If nobody taps (e.g. a quick WhatsApp preview), continue automatically
    autoEnter = setTimeout(() => enter(false), 11000);
  }

  function enter(withMusic) {
    if (entered) return;
    entered = true;
    clearTimeout(autoEnter);
    if (withMusic) Music.play();
    intro.classList.add("is-leaving");
    document.body.classList.remove("is-intro");
    document.body.classList.add("is-ready");
    FW.start();
    setupReveal();
    setTimeout(() => {
      FW.launch(window.innerWidth * 0.3, window.innerHeight * 0.28, "peony");
      setTimeout(() => FW.launch(window.innerWidth * 0.7, window.innerHeight * 0.24, "double"), 350);
      setTimeout(() => FW.launch(window.innerWidth * 0.5, window.innerHeight * 0.16, "willow"), 800);
      FW.auto(true);
    }, 500);
    setTimeout(() => { intro.remove(); }, 1600);
    setTimeout(() => $("#tapHint").classList.add("is-hidden"), 9000);
  }

  /* ---------- Interactions ---------- */
  function setupTapFireworks() {
    window.addEventListener("pointerdown", (e) => {
      if (!entered) return;
      if (e.target.closest("button, a, input, .sheet, .music")) return;
      FW.launch(e.clientX, e.clientY, Math.random() < 0.12 ? "heart" : undefined);
      $("#tapHint").classList.add("is-hidden");
    }, { passive: true });
  }

  let celebrating = false;
  function celebrate() {
    if (celebrating) { FW.launch(); return; }
    celebrating = true;
    document.body.classList.add("is-celebrating");
    const ms = FW.celebrate();
    setTimeout(() => { celebrating = false; document.body.classList.remove("is-celebrating"); }, Math.min(ms, 3600));
  }

  /* ---------- Share ---------- */
  const shareUrl = () => cfg.shareUrl || window.location.href.split("#")[0];
  const shareText = () => cfg.shareText || "Happy Diwali! 🪔";

  async function share() {
    const data = { title: cfg.shareTitle || document.title, text: shareText(), url: shareUrl() };
    if (navigator.share) {
      try {
        await navigator.share(data);
        toast("Happiness sent! ❤️");
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    openSheet();
  }

  const sheet = $("#sheet");
  let lastFocus = null;
  function openSheet() {
    lastFocus = document.activeElement;
    $("#shareInput").value = shareUrl();
    $("#waLink").href = "https://wa.me/?text=" + encodeURIComponent(shareText() + "\n" + shareUrl());
    sheet.hidden = false;
    $("#copyBtn").focus();
  }
  function closeSheet() {
    sheet.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  async function copyLink() {
    const url = shareUrl();
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); ok = true; }
    } catch (e) { ok = false; }
    if (!ok) {
      const input = $("#shareInput");
      input.focus(); input.select(); input.setSelectionRange(0, url.length);
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    }
    toast(ok ? "Link copied! Paste it on WhatsApp ❤️" : "Select the link above and copy it ❤️");
  }

  /* ---------- Toast ---------- */
  let toastTimer = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  /* ---------- Music UI ---------- */
  const musicBtn = $("#musicBtn");
  function renderMusic(on) {
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "Turn music off" : "Turn music on");
    $(".music__label", musicBtn).textContent = on ? "Music On" : "Music Off";
  }
  document.addEventListener("musicchange", (e) => renderMusic(e.detail.playing));

  async function toggleMusic() {
    const wasPlaying = Music.playing;
    const result = await Music.toggle();
    if (!wasPlaying && !result) toast("Music isn't available on this device");
  }

  /* ---------- Wire up ---------- */
  function init() {
    buildSky();
    buildLanterns();
    buildFloaters();
    buildDiyas();
    buildRangoli();
    playIntro();
    setupTapFireworks();

    $("#enterMusic").addEventListener("click", () => enter(true));
    $("#enterQuiet").addEventListener("click", () => enter(false));
    $$('[data-action="celebrate"]').forEach((b) => b.addEventListener("click", celebrate));
    $$('[data-action="share"]').forEach((b) => b.addEventListener("click", share));
    musicBtn.addEventListener("click", toggleMusic);
    $("#copyBtn").addEventListener("click", copyLink);
    $$("[data-close]", sheet).forEach((el) => el.addEventListener("click", closeSheet));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
