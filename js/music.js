/* Festive instrumental music.
   Default: a gentle synthesized raga-style piece (Raag Bhupali scale) with a
   tanpura drone, santoor-like plucks, soft bells and a light tabla pulse —
   generated with the Web Audio API, so no audio file is needed.
   Optional: set DIWALI_CONFIG.musicFile to play a file instead; if it fails,
   the synthesized music is used. Audio only ever starts from a user tap. */
(function () {
  "use strict";
  const cfg = window.DIWALI_CONFIG || {};
  const AC = window.AudioContext || window.webkitAudioContext;

  let ac = null, master = null, reverb = null, dry = null;
  let playing = false, timer = 0, nextTime = 0, step = 0;
  let fileAudio = null, useFile = !!cfg.musicFile;

  // D Bhupali: Sa Re Ga Pa Dha (D E F# A B)
  const SA = 146.83;
  const ratio = { S: 1, R: 9 / 8, G: 5 / 4, P: 3 / 2, D: 5 / 3 };
  const note = (sym, oct = 1) => SA * ratio[sym] * Math.pow(2, oct);

  // Melodic phrases: [swara, octave, beats]
  const PHRASES = [
    [["G", 1, 1], ["R", 1, 0.5], ["S", 1, 0.5], ["D", 0, 1], ["S", 1, 1], ["R", 1, 1], ["G", 1, 2]],
    [["G", 1, 0.5], ["P", 1, 0.5], ["D", 1, 1], ["P", 1, 1], ["G", 1, 1], ["R", 1, 1], ["G", 1, 2]],
    [["P", 1, 1], ["D", 1, 0.5], ["S", 2, 0.5], ["D", 1, 1], ["P", 1, 1], ["G", 1, 0.5], ["P", 1, 0.5], ["G", 1, 1], ["R", 1, 2]],
    [["S", 1, 1], ["R", 1, 1], ["G", 1, 1], ["P", 1, 1], ["G", 1, 0.5], ["R", 1, 0.5], ["S", 1, 1], ["D", 0, 1], ["S", 1, 2]],
    [["S", 2, 1], ["D", 1, 0.5], ["P", 1, 0.5], ["G", 1, 1], ["P", 1, 1], ["D", 1, 1], ["S", 2, 2], ["R", 2, 1], ["S", 2, 2]],
  ];
  const BEAT = 60 / 76;
  let melody = [], mIndex = 0, mTime = 0, phraseCount = 0;

  function buildGraph() {
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0;
    master.connect(ac.destination);

    // Generated impulse-response reverb
    reverb = ac.createConvolver();
    const len = ac.sampleRate * 2.8;
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    reverb.buffer = ir;
    const wet = ac.createGain(); wet.gain.value = 0.45;
    reverb.connect(wet).connect(master);
    dry = ac.createGain(); dry.gain.value = 0.8;
    dry.connect(master);
  }

  function out(node) { node.connect(dry); node.connect(reverb); }

  // Santoor / bell-like pluck
  function pluck(freq, t, vel = 0.18, decay = 1.6) {
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    out(g);
    [[1, 1], [2.01, 0.35], [3.02, 0.12], [4.2, 0.05]].forEach(([m, a]) => {
      const o = ac.createOscillator();
      const og = ac.createGain();
      o.type = m === 1 ? "triangle" : "sine";
      o.frequency.value = freq * m;
      og.gain.value = a;
      o.connect(og).connect(g);
      o.start(t); o.stop(t + decay + 0.05);
    });
  }

  // Tanpura string
  function tanpura(freq, t) {
    const g = ac.createGain();
    const f = ac.createBiquadFilter();
    f.type = "lowpass"; f.frequency.setValueAtTime(2200, t); f.frequency.exponentialRampToValueAtTime(500, t + 3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    const o1 = ac.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = freq;
    const o2 = ac.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = freq * 1.003;
    o1.connect(f); o2.connect(f); f.connect(g); out(g);
    o1.start(t); o2.start(t); o1.stop(t + 3.7); o2.stop(t + 3.7);
  }

  // Soft tabla-like "dha" / "na"
  function tabla(t, bass) {
    const g = ac.createGain();
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(bass ? 120 : 330, t);
    o.frequency.exponentialRampToValueAtTime(bass ? 62 : 300, t + (bass ? 0.35 : 0.12));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(bass ? 0.22 : 0.06, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (bass ? 0.45 : 0.18));
    o.connect(g); g.connect(dry);
    o.start(t); o.stop(t + 0.5);
  }

  function nextPhrase() {
    melody = PHRASES[phraseCount % PHRASES.length];
    phraseCount++;
    mIndex = 0;
  }

  function scheduler() {
    const ahead = ac.currentTime + 0.25;
    // Rhythm grid (half beats)
    while (nextTime < ahead) {
      const s = step % 16;
      // tanpura cycle: Pa Sa' Sa' Sa every 8 half-beats
      if (s % 4 === 0) {
        const tp = [note("P", 0), note("S", 1), note("S", 1), note("S", 0)][(s / 4) % 4];
        tanpura(tp, nextTime);
      }
      // light tabla theka (gentle)
      if (s === 0 || s === 6 || s === 8) tabla(nextTime, true);
      if (s === 3 || s === 11 || s === 13) tabla(nextTime, false);
      // bell every 4 bars
      if (step % 64 === 0) pluck(note("S", 3), nextTime, 0.06, 3.2);
      nextTime += BEAT / 2;
      step++;
    }
    // Melody
    while (mTime < ahead) {
      if (mIndex >= melody.length) {
        nextPhrase();
        mTime += BEAT; // breath between phrases
        continue;
      }
      const [sym, oct, beats] = melody[mIndex++];
      pluck(note(sym, oct), mTime, 0.16, 1.4 + beats * 0.4);
      if (beats >= 1 && Math.random() < 0.35) pluck(note(sym, oct + 1), mTime + 0.05, 0.035, 1);
      mTime += beats * BEAT;
    }
  }

  async function startSynth() {
    if (!AC) throw new Error("Web Audio not supported");
    if (!ac) buildGraph();
    if (ac.state === "suspended") await ac.resume();
    const t = ac.currentTime + 0.1;
    nextTime = t; mTime = t + BEAT * 2; step = 0;
    nextPhrase();
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setValueAtTime(master.gain.value, ac.currentTime);
    master.gain.linearRampToValueAtTime(0.55, ac.currentTime + 2);
    clearInterval(timer);
    timer = setInterval(scheduler, 60);
    scheduler();
  }

  function stopSynth() {
    if (!ac) return;
    clearInterval(timer);
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.6);
    setTimeout(() => { if (!playing && ac.state === "running") ac.suspend().catch(() => {}); }, 900);
  }

  async function startFile() {
    if (!fileAudio) {
      fileAudio = new Audio(cfg.musicFile);
      fileAudio.loop = true;
      fileAudio.volume = 0.6;
    }
    await fileAudio.play();
  }

  async function play() {
    if (playing) return true;
    try {
      if (useFile) {
        try { await startFile(); }
        catch (e) { useFile = false; await startSynth(); }
      } else {
        await startSynth();
      }
      playing = true;
      emit();
      return true;
    } catch (e) {
      playing = false;
      emit();
      return false;
    }
  }

  function pause() {
    playing = false;
    if (fileAudio && !fileAudio.paused) fileAudio.pause();
    stopSynth();
    emit();
  }

  function emit() { document.dispatchEvent(new CustomEvent("musicchange", { detail: { playing } })); }

  // Pause when the tab is hidden; resume when back
  let resumeOnShow = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) { resumeOnShow = true; pause(); }
    else if (!document.hidden && resumeOnShow) { resumeOnShow = false; play(); }
  });

  window.DiwaliMusic = {
    play, pause,
    toggle: () => (playing ? (pause(), Promise.resolve(false)) : play()),
    get playing() { return playing; },
    supported: !!AC || !!cfg.musicFile,
  };
})();
