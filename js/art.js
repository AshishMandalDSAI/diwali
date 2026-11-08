/* SVG artwork generators: diyas, candles, lanterns, rangoli, petals. */
(function () {
  "use strict";
  let uid = 0;
  const id = (p) => p + (++uid);

  function flameDefs(n) {
    return `
      <radialGradient id="glow${n}" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#ffe29a" stop-opacity=".95"/>
        <stop offset=".35" stop-color="#ffa53c" stop-opacity=".38"/>
        <stop offset="1" stop-color="#ff7a00" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="fl${n}" cx="50%" cy="78%" r="75%">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".28" stop-color="#fff3a0"/>
        <stop offset=".6" stop-color="#ffae2e"/>
        <stop offset="1" stop-color="#ff4d00" stop-opacity=".2"/>
      </radialGradient>`;
  }

  function flame(n, cx, base, h, glowR) {
    const w = h * 0.34, top = base - h;
    return `
      <g class="flame-group">
        <circle class="flame-glow" cx="${cx}" cy="${base - h * 0.45}" r="${glowR}" fill="url(#glow${n})"/>
        <path class="flame" fill="url(#fl${n})" d="M${cx} ${top}
          C${cx + w * 0.5} ${top + h * 0.28} ${cx + w} ${top + h * 0.5} ${cx + w * 0.8} ${top + h * 0.74}
          C${cx + w * 0.6} ${base - 2} ${cx + 3} ${base} ${cx} ${base}
          C${cx - 3} ${base} ${cx - w * 0.6} ${base - 2} ${cx - w * 0.8} ${top + h * 0.74}
          C${cx - w} ${top + h * 0.5} ${cx - w * 0.5} ${top + h * 0.28} ${cx} ${top}Z"/>
        <path class="flame flame--b" fill="#fffbea" opacity=".9" d="M${cx} ${top + h * 0.42}
          C${cx + w * 0.4} ${top + h * 0.6} ${cx + w * 0.45} ${base - h * 0.12} ${cx} ${base - 1}
          C${cx - w * 0.45} ${base - h * 0.12} ${cx - w * 0.4} ${top + h * 0.6} ${cx} ${top + h * 0.42}Z"/>
      </g>`;
  }

  /** Traditional clay diya */
  function diya(opts = {}) {
    const n = uid++;
    const hue = opts.hue || "orange";
    const body = hue === "red"
      ? ["#ff8a5c", "#c8341a", "#5e1206"]
      : hue === "pink"
        ? ["#ff9ac6", "#d6337a", "#5c0a32"]
        : ["#ffbf5e", "#e0661b", "#7a2408"];
    return `
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        ${flameDefs(n)}
        <linearGradient id="bowl${n}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${body[0]}"/><stop offset=".45" stop-color="${body[1]}"/><stop offset="1" stop-color="${body[2]}"/>
        </linearGradient>
        <linearGradient id="rim${n}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#b86a0c"/><stop offset=".5" stop-color="#ffe9a8"/><stop offset="1" stop-color="#b86a0c"/>
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="108" rx="34" ry="5" fill="#000" opacity=".35"/>
      <path d="M6 60 C28 69 92 69 114 60 C111 87 88 104 60 104 C32 104 9 87 6 60Z" fill="url(#bowl${n})"/>
      <path d="M18 78 Q24 72 30 78 T42 78 T54 78 T66 78 T78 78 T90 78 T102 78" fill="none" stroke="#ffe08a" stroke-width="2" stroke-linecap="round" opacity=".9"/>
      <g fill="#fff1c1" opacity=".95">
        <circle cx="30" cy="89" r="2"/><circle cx="45" cy="93" r="2"/><circle cx="60" cy="94.5" r="2.4"/><circle cx="75" cy="93" r="2"/><circle cx="90" cy="89" r="2"/>
      </g>
      <ellipse cx="60" cy="60.5" rx="54" ry="7.5" fill="url(#rim${n})"/>
      <ellipse cx="60" cy="60.5" rx="45" ry="4.6" fill="#4a1d04"/>
      <ellipse cx="60" cy="60" rx="38" ry="2.6" fill="#8a4a0e" opacity=".8"/>
      <path d="M60 61 L60 55" stroke="#2a1205" stroke-width="2.6" stroke-linecap="round"/>
      ${flame(n, 60, 56, 46, 44)}
    </svg>`;
  }

  /** Wax candle */
  function candle(opts = {}) {
    const n = uid++;
    const h = opts.height || 86;
    const top = 130 - h;
    return `
    <svg viewBox="0 0 40 140" aria-hidden="true" focusable="false">
      <defs>
        ${flameDefs(n)}
        <linearGradient id="wax${n}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#e8a874"/><stop offset=".4" stop-color="#fff4e4"/><stop offset="1" stop-color="#eab486"/>
        </linearGradient>
        <linearGradient id="hold${n}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#9a5a08"/><stop offset=".5" stop-color="#ffe08a"/><stop offset="1" stop-color="#9a5a08"/>
        </linearGradient>
      </defs>
      <rect x="9" y="${top}" width="22" height="${h}" rx="3" fill="url(#wax${n})"/>
      <path d="M9 ${top + 4} Q9 ${top} 13 ${top} H27 Q31 ${top} 31 ${top + 4} V${top + 9} Q29 ${top + 16} 27 ${top + 9} Q25 ${top + 6} 23 ${top + 12} Q21 ${top + 20} 19 ${top + 10} Q16 ${top + 6} 13 ${top + 9} Q11 ${top + 13} 9 ${top + 8}Z" fill="#fff8ee"/>
      <path d="M20 ${top + 1} L20 ${top - 5}" stroke="#2a1205" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="20" cy="132" rx="19" ry="5" fill="url(#hold${n})"/>
      <rect x="4" y="128" width="32" height="5" rx="2.5" fill="url(#hold${n})"/>
      ${flame(n, 20, top - 3, 28, 24)}
    </svg>`;
  }

  /** Hanging paper lantern (kandil) */
  function lantern(c1, c2, stringLen) {
    const n = uid++;
    const s = stringLen;
    return `
    <svg viewBox="0 0 100 ${s + 170}" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="paper${n}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${c2}"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
        </linearGradient>
        <radialGradient id="lg${n}" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff2b0" stop-opacity=".95"/><stop offset=".6" stop-color="#ffb347" stop-opacity=".25"/><stop offset="1" stop-color="#ff8a1f" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cap${n}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#a9670a"/><stop offset=".5" stop-color="#ffe9a8"/><stop offset="1" stop-color="#a9670a"/>
        </linearGradient>
      </defs>
      <line x1="50" y1="0" x2="50" y2="${s}" stroke="#d9a441" stroke-width="1.4" opacity=".8"/>
      <rect x="34" y="${s}" width="32" height="9" rx="2" fill="url(#cap${n})"/>
      <path d="M32 ${s + 9} H68 L90 ${s + 40} V${s + 80} L68 ${s + 111} H32 L10 ${s + 80} V${s + 40}Z" fill="url(#paper${n})"/>
      <ellipse class="lantern__glow" cx="50" cy="${s + 60}" rx="34" ry="44" fill="url(#lg${n})"/>
      <g stroke="#ffe08a" stroke-width="1.3" opacity=".75" fill="none">
        <path d="M50 ${s + 9} V${s + 111}"/>
        <path d="M38 ${s + 9} Q28 ${s + 60} 38 ${s + 111}"/>
        <path d="M62 ${s + 9} Q72 ${s + 60} 62 ${s + 111}"/>
        <path d="M10 ${s + 40} H90 M10 ${s + 80} H90"/>
      </g>
      <path d="M30 ${s + 60} l20 -16 l20 16 l-20 16z" fill="#fff4cf" opacity=".55"/>
      <rect x="34" y="${s + 111}" width="32" height="8" rx="2" fill="url(#cap${n})"/>
      <g stroke="${c1}" stroke-width="2" stroke-linecap="round">
        <line x1="40" y1="${s + 119}" x2="38" y2="${s + 158}"/><line x1="50" y1="${s + 119}" x2="50" y2="${s + 165}"/><line x1="60" y1="${s + 119}" x2="62" y2="${s + 158}"/>
      </g>
      <g fill="#ffd36b"><circle cx="38" cy="${s + 160}" r="3"/><circle cx="50" cy="${s + 167}" r="3.4"/><circle cx="62" cy="${s + 160}" r="3"/></g>
    </svg>`;
  }

  /** Animated rangoli mandala */
  function rangoli(opts = {}) {
    const animate = opts.animate !== false;
    const petal = (len, w) =>
      `M0 0 C${w} ${-len * 0.3} ${w * 0.8} ${-len * 0.8} 0 ${-len} C${-w * 0.8} ${-len * 0.8} ${-w} ${-len * 0.3} 0 0Z`;
    let delay = 0;
    const d = () => (delay += 0.035).toFixed(3);

    function ring(count, r0, len, w, colors, extra = "") {
      let out = "";
      for (let i = 0; i < count; i++) {
        const a = (360 / count) * i;
        const col = colors[i % colors.length];
        out += `<path class="r-petal" style="--delay:${d()}s" transform="rotate(${a}) translate(0 ${-r0})" d="${petal(len, w)}" fill="${col}" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>`;
        if (extra === "inner") {
          out += `<path class="r-petal" style="--delay:${d()}s" transform="rotate(${a}) translate(0 ${-r0 - len * 0.18}) scale(.45)" d="${petal(len, w)}" fill="#fff6d8" opacity=".85"/>`;
        }
      }
      return out;
    }
    function dots(count, r, size, colors) {
      let out = "";
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        out += `<circle class="r-petal" style="--delay:${d()}s" cx="${(Math.cos(a) * r).toFixed(2)}" cy="${(Math.sin(a) * r).toFixed(2)}" r="${size}" fill="${colors[i % colors.length]}"/>`;
      }
      return out;
    }

    const cls = (dir, dur) => (animate ? `ring ring--${dir}" style="--d:${dur}s` : "ring");
    return `
    <svg viewBox="-200 -200 400 400" aria-hidden="true" focusable="false">
      <g class="${cls("cw", 140)}">${dots(56, 192, 4, ["#ffd36b", "#ff4fa3", "#ff8a1f", "#9b5cff"])}</g>
      <g class="${cls("ccw", 110)}">${ring(16, 112, 70, 22, ["#ff4fa3", "#ff8a1f"], "inner")}</g>
      <g class="${cls("cw", 90)}">${dots(32, 108, 3.2, ["#fff4cf"])}</g>
      <g class="${cls("cw", 80)}">${ring(12, 46, 60, 24, ["#9b5cff", "#ffd36b"], "inner")}</g>
      <g class="${cls("ccw", 60)}">${ring(8, 18, 30, 15, ["#ff6a3d"])}</g>
      <circle class="r-petal" style="--delay:${d()}s" r="22" fill="#ffd36b" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>
      <circle class="r-petal" style="--delay:${d()}s" r="13" fill="#ff4fa3"/>
      <circle class="r-petal" style="--delay:${d()}s" r="5.5" fill="#fff8e1"/>
    </svg>`;
  }

  /** Small flower petal for the floating layer */
  function petal(color) {
    return `<svg viewBox="0 0 20 26" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d="M10 1 C17 6 19 14 15 21 C13 24 7 24 5 21 C1 14 3 6 10 1Z" fill="${color}"/>
      <path d="M10 4 C11 10 11 16 10 22" stroke="#fff" stroke-opacity=".35" stroke-width="1" fill="none"/>
    </svg>`;
  }

  window.DiwaliArt = { diya, candle, lantern, rangoli, petal, id };
})();
