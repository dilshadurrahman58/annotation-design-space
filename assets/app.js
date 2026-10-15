/* A Qualitative Analysis of Common Practices in Annotations: page behavior.
   All content comes from data/paper.js; nothing here adds claims. */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fmt = (n) => n.toLocaleString("en-US");
  const P = window.PAPER;
  const TYPE = Object.fromEntries(P.TYPES.map((t) => [t.id, t]));
  const TOTAL = 1888;

  // a list read aloud: a, b, and c
  const list = (xs) =>
    xs.length < 2 ? xs.join("") : xs.length === 2 ? xs.join(" and ") : `${xs.slice(0, -1).join(", ")}, and ${xs.at(-1)}`;
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const plural = (name) => {
    const s = lower(name);
    if (s === "map" || s === "density map") return s + "s";
    if (s === "graph") return "graphs";
    return s.endsWith("chart") || s.endsWith("plot") || s.endsWith("map") || s.endsWith("gram") ? s + "s" : s;
  };

  // ── Small glyphs for the seven types ─────────────────────────
  const ICON = {
    enclosure: '<rect x="3.5" y="5.5" width="17" height="13" rx="3.5"/><circle cx="9.5" cy="12" r="1.2" class="i-f"/><circle cx="14.5" cy="12" r="1.2" class="i-f"/>',
    connector: '<path d="M4 18.5C9 18.5 12 8 18.5 6.5"/><path d="M14.5 5.2l4.3 1.2-1.6 4.1"/>',
    text: '<path d="M5 7h14M5 12h14M5 17h9"/>',
    glyph: '<path d="M7 20.5V4"/><path d="M7 5l10.5 3.8L7 12.6" class="i-f"/>',
    color: '<circle cx="12" cy="12" r="7.5"/><path d="M12 4.5a7.5 7.5 0 0 1 0 15z" class="i-f"/>',
    indicator: '<path d="M4 19.5h16"/><path d="M6 16v-3M10 16v-5M14 16v-4M18 16V9" class="i-soft"/><path d="M4.5 12.5L19.5 5" stroke-dasharray="2 2.2"/>',
    geometric: '<path d="M10.5 5.5a7.5 7.5 0 1 0 7.5 7.5h-7.5z"/><path d="M13.5 3a7.5 7.5 0 0 1 7.5 7.5h-7.5z" class="i-f"/>',
  };
  const icon = (id) => `<svg class="ti" viewBox="0 0 24 24" aria-hidden="true">${ICON[id]}</svg>`;

  // ── Figures fade in once loaded ──────────────────────────────
  $$(".sheet img").forEach((img) => {
    const done = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener("load", done, { once: true });
  });

  // ── Fig. 2a/2d: with and without ─────────────────────────────
  const ba = $("#ba");
  const baRange = $("#ba-range");
  const baBtns = $$("[data-ba]");
  function setBa(v) {
    ba.style.setProperty("--p", v + "%");
    baRange.value = v;
    baBtns.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.ba === +v)));
  }
  baRange.addEventListener("input", () => {
    ba.classList.remove("is-easing");
    setBa(+baRange.value);
  });
  // drag anywhere on the chart, with a mouse, pen, or finger
  const baArt = $(".ba__art", ba);
  const baAt = (x) => {
    const r = baArt.getBoundingClientRect();
    return Math.round(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };
  let baId = null;
  let baStart = null;
  baArt.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    baId = e.pointerId;
    baStart = { x: e.clientX, y: e.clientY, live: e.pointerType === "mouse" };
    if (baStart.live) {
      e.preventDefault();
      try {
        baArt.setPointerCapture(baId);
      } catch (err) {}
      baArt.classList.add("is-dragging");
      ba.classList.add("is-easing");
      setBa(baAt(e.clientX));
      baRange.focus({ preventScroll: true });
    }
  });
  baArt.addEventListener("pointermove", (e) => {
    if (e.pointerId !== baId || !baStart) return;
    // on touch, only a sideways gesture moves the divider; an upward one scrolls the page
    if (!baStart.live) {
      if (Math.abs(e.clientX - baStart.x) < 6) return;
      baStart.live = true;
      baArt.classList.add("is-dragging");
    }
    ba.classList.remove("is-easing");
    setBa(baAt(e.clientX));
  });
  const baEnd = (e) => {
    if (e.pointerId !== baId) return;
    // a tap moves the divider to where it landed
    if (baStart && !baStart.live && e.type === "pointerup") {
      ba.classList.add("is-easing");
      setBa(baAt(e.clientX));
    }
    baId = null;
    baStart = null;
    baArt.classList.remove("is-dragging");
  };
  baArt.addEventListener("pointerup", baEnd);
  baArt.addEventListener("pointercancel", baEnd);
  baBtns.forEach((b) =>
    b.addEventListener("click", () => {
      ba.classList.add("is-easing");
      // "Without" pushes the divider all the way right, "With" all the way left
      setBa(+b.dataset.ba);
    }),
  );
  setBa(50);
  // once in view, sweep the divider so it is clear it moves
  if ("IntersectionObserver" in window && !reduceMotion()) {
    const io = new IntersectionObserver(
      (en) => {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        ba.classList.add("is-easing");
        setTimeout(() => setBa(78), 500);
        setTimeout(() => setBa(50), 1500);
      },
      { threshold: 0.6 },
    );
    io.observe(ba);
  }

  // ── Fig. 4, redrawn: the seven types, one at a time ──────────
  // Values come from the paper's figure (data/paper.js). Each annotation is its own layer,
  // so a type can be shown alone on the plain chart while the others fade to ghosts.
  const F = P.FIG4;
  const f4 = $("#f4");
  const ORDER = P.TYPES.map((t) => t.id);
  // the chart sits on white paper in both themes, so its colors are fixed
  const C = {
    ink: "#1F2328", tick: "#6B6F76", grid: "#ECEAE4", axis: "#B9BBC0",
    red: "#C23B30", green: "#2F7D4E", avg: "#B4533A", warm: "#9E4E24",
    A: "#7193C6", B: "#E0A465", C: "#A99BC9",
  };
  const SHAPE = { A: "circle", B: "square", C: "triangle" };
  const f4El = {};
  let f4Width = 0;

  const mark = (shape, cx, cy, r, fill) => {
    if (shape === "circle") return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
    if (shape === "square") return `<rect x="${cx - r * 0.9}" y="${cy - r * 0.9}" width="${r * 1.8}" height="${r * 1.8}" rx="1" fill="${fill}"/>`;
    const h = r * 1.15;
    return `<path d="M${cx} ${cy - h}L${cx + h} ${cy + h * 0.8}L${cx - h} ${cy + h * 0.8}Z" fill="${fill}"/>`;
  };
  const rectPath = (x0, y0, x1, y1) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  const valueOf = (h, g) => F.groups[g][h - 1];

  function drawF4() {
    const W = Math.round(f4.getBoundingClientRect().width);
    if (W < 240) return;
    f4Width = W;
    const n = W < 460;
    const fs = n ? 11 : 12.5;
    const L = n ? 34 : 46, R = n ? 8 : 16, T = n ? 50 : 60, B = n ? 38 : 46;
    const H = Math.round(Math.max(n ? 330 : 360, Math.min(560, W * (n ? 0.95 : 0.64))));
    const x = (v) => +(L + (v / 14) * (W - L - R)).toFixed(1);
    const y = (v) => +(T + (1 - v / 140) * (H - T - B)).toFixed(1);
    f4.setAttribute("viewBox", `0 0 ${W} ${H}`);
    f4.setAttribute("height", H);
    const r = n ? 3.4 : 4.3;

    // ── the plain chart ──
    let base = `<text x="${L}" y="${n ? 16 : 20}" class="f4-title" style="font-size:${n ? 12 : 14}px">Relationship Between Time Spent and Test Scores</text>`;
    let lx = L;
    ["A", "B", "C"].forEach((g) => {
      base += mark(SHAPE[g], lx + 5, (n ? 34 : 40) - 4, r, C[g]);
      base += `<text x="${lx + 13}" y="${n ? 34 : 40}" class="f4-tick" style="font-size:${fs}px">Group ${g}</text>`;
      lx += n ? 70 : 82;
    });
    for (let v = 0; v <= 140; v += 20)
      base += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.grid : C.axis}"/>
        <text x="${L - 7}" y="${y(v) + 4}" text-anchor="end" class="f4-tick" style="font-size:${fs - 1}px">${v}</text>`;
    for (let v = 0; v <= 14; v += 2)
      base += `<line x1="${x(v)}" x2="${x(v)}" y1="${y(140)}" y2="${y(0)}" stroke="${v ? C.grid : C.axis}"/>
        <text x="${x(v)}" y="${y(0) + 16}" text-anchor="middle" class="f4-tick" style="font-size:${fs - 1}px">${v}</text>`;
    base += `<text x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle" class="f4-axt" style="font-size:${fs - 0.5}px">Time Spent Studying (Hours)</text>
      <text transform="translate(${n ? 10 : 13} ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle" class="f4-axt" style="font-size:${fs - 0.5}px">Test Score</text>`;
    let data = "";
    ["A", "B", "C"].forEach((g) => F.groups[g].forEach((v, i) => (data += mark(SHAPE[g], x(i + 1), y(v), r, C[g]))));

    // ── the seven annotations ──
    const lay = {};
    const bx = F.box;
    const encl = rectPath(x(bx.x0), y(bx.y1), x(bx.x1), y(bx.y0));
    lay.enclosure = `<path class="halo" d="${encl}"/><path class="draw" pathLength="1" d="${encl}" fill="none" stroke="${C.ink}" stroke-width="${n ? 2 : 2.4}"/><path class="hit" d="${encl}"/>`;

    // the sentence, wrapped to the room it has
    const tfs = n ? 11 : W < 640 ? 12 : 13.5;
    const tx = x(0.45);
    const maxW = x(8.3) - tx;
    const words = F.text.join(" ").split(" ");
    const lines = [];
    let line = "";
    words.forEach((w) => {
      const t = line ? line + " " + w : w;
      if (t.length * tfs * 0.5 > maxW && line) {
        lines.push(line);
        line = w;
      } else line = t;
    });
    lines.push(line);
    const lh = tfs * 1.3;
    const ty0 = y(140) + tfs + 6;
    const tLast = ty0 + lh * (lines.length - 1);
    lay.text = `<rect class="halo halo--box" data-fit="text"/><text class="f4-note" style="font-size:${tfs}px">${lines
      .map((l, i) => `<tspan x="${tx}" y="${(ty0 + i * lh).toFixed(1)}">${l}</tspan>`)
      .join("")}</text><rect class="hit" data-fit="text"/>`;

    // the arrow from the sentence to the trend line
    const a0 = [Math.min(x(5.55), tx + maxW * 0.86), tLast + (n ? 5 : 6)];
    const a1 = [x(F.arrowTo[0]), y(F.arrowTo[1])];
    const ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
    const hl = n ? 7 : 9;
    const tip = (s) => [a1[0] - hl * Math.cos(ang + s), a1[1] - hl * Math.sin(ang + s)];
    const [p1, p2] = [tip(0.42), tip(-0.42)];
    const shaft = `M${a0[0]} ${a0[1]}L${(a1[0] - hl * 0.7 * Math.cos(ang)).toFixed(1)} ${(a1[1] - hl * 0.7 * Math.sin(ang)).toFixed(1)}`;
    lay.connector = `<path class="halo" d="M${a0[0]} ${a0[1]}L${a1[0]} ${a1[1]}"/><path class="draw" pathLength="1" d="${shaft}" stroke="${C.ink}" stroke-width="${n ? 1.8 : 2.2}" fill="none" stroke-linecap="round"/>
      <path class="pop" d="M${a1[0]} ${a1[1]}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z" fill="${C.ink}"/><path class="hit" d="M${a0[0]} ${a0[1]}L${a1[0]} ${a1[1]}"/>`;

    // glyphs: shapes only; color is a separate layer that tints them
    const xs = n ? 3.8 : 5.2;
    const cross = (cx, cy) => `<path class="gl gl--x" d="M${cx - xs} ${cy - xs}L${cx + xs} ${cy + xs}M${cx + xs} ${cy - xs}L${cx - xs} ${cy + xs}"/>`;
    const ring = (cx, cy) => `<circle class="gl gl--o" cx="${cx}" cy="${cy}" r="${n ? 6.5 : 8}"/>`;
    let gl = "";
    let tint = "";
    F.under.forEach(([h, g]) => {
      gl += cross(x(h), y(valueOf(h, g)));
      tint += `<circle cx="${x(h)}" cy="${y(valueOf(h, g))}" r="${n ? 9 : 11}" fill="${C.red}" fill-opacity=".14"/>`;
    });
    F.over.forEach(([h, g]) => {
      gl += ring(x(h), y(valueOf(h, g)));
      tint += `<circle cx="${x(h)}" cy="${y(valueOf(h, g))}" r="${n ? 10 : 12}" fill="${C.green}" fill-opacity=".14"/>`;
    });
    const lgx = x(n ? 0.4 : 0.6), lg1 = y(14), lg2 = y(5.5);
    const lfs = n ? 10 : fs;
    gl += cross(lgx, lg1 - 4) + ring(lgx, lg2 - 4);
    gl += `<text x="${lgx + 13}" y="${lg1}" class="f4-legend" style="font-size:${lfs}px">Students underperforming peers</text>
      <text x="${lgx + 13}" y="${lg2}" class="f4-legend" style="font-size:${lfs}px">Students outperforming peers</text>`;
    const glHit =
      [...F.under, ...F.over].map(([h, g]) => `<circle class="hit hit--fill" cx="${x(h)}" cy="${y(valueOf(h, g))}" r="11"/>`).join("") +
      `<rect class="hit hit--fill" x="${lgx - 9}" y="${lg1 - 16}" width="${n ? 180 : 210}" height="${lg2 - lg1 + 22}"/>`;
    lay.glyph = `<g class="halo-g">${[...F.under, ...F.over].map(([h, g]) => `<circle class="halo halo--dot" cx="${x(h)}" cy="${y(valueOf(h, g))}" r="${n ? 10 : 12}"/>`).join("")}</g>${gl}${glHit}`;
    lay.color = `<g class="tint">${tint}</g>`;

    // indicators: the trend line and the national average
    const [t0, t1] = F.trend;
    const trend = `M${x(t0[0])} ${y(t0[1])}L${x(t1[0])} ${y(t1[1])}`;
    const avg = `M${L} ${y(F.average)}H${W - R}`;
    lay.indicator = `<path class="halo" d="${trend}"/><path class="halo" d="${avg}"/>
      <path d="${trend}" stroke="${C.ink}" stroke-width="${n ? 2.2 : 2.6}" stroke-dasharray="0.1 ${n ? 4.4 : 5.2}" stroke-linecap="round" fill="none"/>
      <path d="${avg}" stroke="${C.avg}" stroke-width="1.6" stroke-dasharray="7 5" fill="none"/>
      <text x="${x(n ? 12.85 : 12.7)}" y="${y(F.average) + (n ? 12 : 15)}" text-anchor="end" class="f4-avg" style="font-size:${n ? 9.5 : fs - 1}px">National average</text>
      <text x="${L - 7}" y="${y(F.average) + 4}" text-anchor="end" class="f4-avg f4-avg--n" style="font-size:${fs - 1}px">${F.average}</text>
      <path class="hit" d="${trend}"/><path class="hit" d="${avg}"/>`;

    // geometric: a zoom box onto the enclosed corner, with each point labeled
    const z = F.zoom;
    const zx0 = x(z.x0), zx1 = x(z.x1), zy0 = y(z.y1), zy1 = y(z.y0);
    const pl = n ? 30 : 34, pb = n ? 16 : 19, pt = 8, pr = n ? 24 : 28;
    const ix = (v) => +(zx0 + pl + ((v - z.dx[0]) / (z.dx[1] - z.dx[0])) * (zx1 - zx0 - pl - pr)).toFixed(1);
    const iy = (v) => +(zy1 - pb - ((v - z.dy[0]) / (z.dy[1] - z.dy[0])) * (zy1 - zy0 - pb - pt)).toFixed(1);
    let inset = `<rect x="${zx0}" y="${zy0}" width="${zx1 - zx0}" height="${zy1 - zy0}" fill="#fff"/>`;
    [100, 110, 120, 130].forEach((v) => (inset += `<line x1="${ix(9.5)}" x2="${ix(12.5)}" y1="${iy(v)}" y2="${iy(v)}" stroke="${C.grid}"/><text x="${ix(9.5) - 4}" y="${iy(v) + 3}" text-anchor="end" class="f4-tick" style="font-size:${n ? 8.5 : 9.5}px">${v}</text>`));
    [10, 11, 12].forEach((v) => (inset += `<text x="${ix(v)}" y="${zy1 - 4}" text-anchor="middle" class="f4-tick" style="font-size:${n ? 8.5 : 9.5}px">${v}</text>`));
    inset += `<path d="M${ix(9.5)} ${iy(135)}V${iy(100)}H${ix(12.5)}" stroke="${C.axis}" fill="none"/>`;
    ["A", "B", "C"].forEach((g) =>
      [10, 11, 12].forEach((h) => {
        const v = valueOf(h, g);
        inset += mark(SHAPE[g], ix(h), iy(v), r * 0.85, C[g]) + `<text x="${ix(h) + 6}" y="${iy(v) + 3.5}" class="f4-val" style="font-size:${n ? 8.5 : 10}px">${v}</text>`;
      }),
    );
    const zbox = rectPath(zx0, zy0, zx1, zy1);
    lay.geometric = `<path class="halo" d="${zbox}"/>
      <path d="${encl}" fill="none" stroke="${C.ink}" stroke-width="1" stroke-dasharray="3 3" class="zsrc"/>
      <path class="draw" pathLength="1" d="M${x(bx.x0)} ${y(bx.y0)}L${zx0} ${zy0}M${x(bx.x1)} ${y(bx.y0)}L${zx1} ${zy0}" stroke="${C.ink}" stroke-width="1" fill="none"/>
      ${inset}<path class="draw" pathLength="1" d="${zbox}" fill="none" stroke="${C.ink}" stroke-width="${n ? 2 : 2.4}"/>
      <path class="hit hit--fill" d="${zbox}"/>`;

    // stacking follows the paper: the inset sits under the data, the rest above it
    const g = (id) => `<g class="an" data-t="${id}">${lay[id]}</g>`;
    f4.innerHTML = `<g class="f4-base">${base}</g>${g("geometric")}<g class="f4-data">${data}</g>${g("indicator")}${g("enclosure")}${g("color")}${g("glyph")}${g("connector")}${g("text")}<g class="f4-tags"></g>`;

    // fit the text's halo and hit area to the drawn text
    const tb = $(".f4-note", f4).getBBox();
    $$('[data-fit="text"]', f4).forEach((el) => {
      el.setAttribute("x", (tb.x - 6).toFixed(1));
      el.setAttribute("y", (tb.y - 4).toFixed(1));
      el.setAttribute("width", (tb.width + 12).toFixed(1));
      el.setAttribute("height", (tb.height + 8).toFixed(1));
      el.setAttribute("rx", 6);
    });
    const lgEnd = Math.max(...$$(".f4-legend", f4).map((t) => t.getBBox().x + t.getBBox().width));

    // where each type's name tag goes: [x, y, anchor]
    f4El.tags = {
      enclosure: [x(bx.x0) - 10, y(bx.y1) + 14, "end"],
      connector: [(a0[0] + a1[0]) / 2 - 10, (a0[1] + a1[1]) / 2 + 2, "end"],
      text: [tb.x + tb.width + 16, tb.y + 10, "start"],
      glyph: [lgEnd + 12, (lg1 + lg2) / 2 - 4, "start"],
      color: [lgEnd + 12, (lg1 + lg2) / 2 - 4, "start"],
      indicator: [W - R - 4, y(F.average) - 14, "end"],
      geometric: [zx0 - 10, (zy0 + zy1) / 2, "end"],
    };
    // on narrow charts the text tag would run off the right edge; put it under the sentence
    if (f4El.tags.text[0] + 70 > W) f4El.tags.text = [tx, tb.y + tb.height + 16, "start"];
    paintF4({ draw: false });
  }

  // ── what the figure shows ──
  const F4 = { lock: [], hover: null, playing: null };
  const shown = () => (F4.hover ? [F4.hover] : F4.lock);
  const anatRead = $("#anat-read");
  const f4Status = $("#f4-status");
  const tlist = $("#tlist");

  function paintF4({ draw = true } = {}) {
    const on = shown();
    const any = on.length > 0;
    f4.classList.toggle("has-on", any);
    // color needs glyphs to act on, so they stay when color is shown
    f4.classList.toggle("has-color", !any || on.includes("color"));
    $$(".an", f4).forEach((g) => {
      const t = g.dataset.t;
      const isOn = on.includes(t);
      const carrier = t === "glyph" && on.includes("color") && !isOn;
      const wasOn = g.classList.contains("is-on");
      g.classList.toggle("is-on", isOn);
      g.classList.toggle("is-carrier", carrier);
      g.classList.toggle("is-ghost", any && !isOn && !carrier);
      if (isOn && !wasOn && draw && !reduceMotion()) {
        g.classList.remove("is-draw");
        void g.getBBox();
        g.classList.add("is-draw");
      }
    });
    // one small name tag per shown type, in place of the paper's letters
    const tags = $(".f4-tags", f4);
    if (tags && f4El.tags) {
      tags.innerHTML = on
        .filter((t, i, a) => !(t === "glyph" && a.includes("color")) || t === "color")
        .map((t) => {
          const [tx, ty, anchor] = f4El.tags[t];
          return `<g class="f4-tag" data-t="${t}"><rect rx="10" height="21"/><text x="${tx}" y="${ty + 4}" text-anchor="${anchor}">${TYPE[t].name}</text></g>`;
        })
        .join("");
      $$(".f4-tag", tags).forEach((tg) => {
        const tt = $("text", tg).getBBox();
        const rc = $("rect", tg);
        rc.setAttribute("x", tt.x - 9);
        rc.setAttribute("y", tt.y - 3.5);
        rc.setAttribute("width", tt.width + 18);
      });
    }
    // the list and the words under the chart follow
    $$(".trow", tlist).forEach((b) => {
      b.setAttribute("aria-pressed", String(F4.lock.includes(b.dataset.t)));
      b.classList.toggle("is-hover", F4.hover === b.dataset.t);
    });
    tlist.classList.toggle("has-on", any);
    const i = on.length === 1 ? ORDER.indexOf(on[0]) : -1;
    f4Status.innerHTML = !any
      ? `<strong>All seven types</strong><span>Pick one to see it on its own</span>`
      : on.length > 1
        ? `<strong>${on.map((t) => TYPE[t].name).join(" + ")}</strong><span>An ensemble</span>`
        : `<strong>${TYPE[on[0]].name}</strong><span>${i + 1} of 7</span>`;
    if (!any) {
      anatRead.innerHTML = `<p class="anat__hint">Each mark in black is an annotation; the colored points are the data. Pick a type to see it alone, or touch an annotation on the chart.</p>`;
    } else if (on.length > 1) {
      anatRead.innerHTML = `<p class="anat__def"><strong>A two-way ensemble.</strong> The sentence states the finding, and the arrow connects it to the correlation line. Each relies on the other; without either one, the message is unclear.</p>`;
    } else {
      const t = TYPE[on[0]];
      anatRead.innerHTML = `<p class="anat__def"><strong>${t.name}.</strong> ${esc(t.def)}</p><p class="anat__here">${esc(t.here)}</p>`;
    }
  }

  function lockF4(ids) {
    F4.lock = ids;
    F4.hover = null;
    paintF4();
  }
  function stopPlay() {
    if (!F4.playing) return;
    clearInterval(F4.playing);
    F4.playing = null;
    $("#f4-play").classList.remove("is-playing");
    $("#f4-play").setAttribute("aria-label", "Step through the seven types");
  }
  function stepF4(d) {
    const cur = F4.lock.length === 1 ? ORDER.indexOf(F4.lock[0]) : -1;
    let nx = cur + d;
    if (cur === -1 && d < 0) nx = ORDER.length - 1;
    lockF4(nx < 0 || nx >= ORDER.length ? [] : [ORDER[nx]]);
  }

  tlist.innerHTML = P.TYPES.map(
    (t, i) => `<li><button type="button" class="trow" data-t="${t.id}" aria-pressed="false" style="--i:${i}">
      ${icon(t.id)}<span class="trow__name">${t.name}</span>
      <span class="trow__bar" aria-hidden="true"><span style="--w:${((t.n / TOTAL) * 100).toFixed(2)}%"></span></span>
      <span class="trow__n">${fmt(t.n)}</span></button></li>`,
  ).join("");
  $$(".trow", tlist).forEach((b) => {
    b.addEventListener("click", () => {
      stopPlay();
      const t = b.dataset.t;
      lockF4(F4.lock.length === 1 && F4.lock[0] === t ? [] : [t]);
    });
    b.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || F4.playing) return;
      F4.hover = b.dataset.t;
      paintF4();
    });
    b.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse" || F4.playing) return;
      F4.hover = null;
      paintF4({ draw: false });
    });
  });

  // point at an annotation on the chart itself
  const hitType = (el) => el.closest?.(".hit") && el.closest(".an")?.dataset.t;
  f4.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || F4.playing) return;
    const t = hitType(e.target);
    if (t === F4.hover) return;
    F4.hover = t || null;
    paintF4({ draw: !!t });
  });
  f4.addEventListener("pointerleave", () => {
    if (!F4.hover) return;
    F4.hover = null;
    paintF4({ draw: false });
  });
  f4.addEventListener("click", (e) => {
    stopPlay();
    const t = hitType(e.target);
    if (!t) return lockF4([]);
    lockF4(F4.lock.length === 1 && F4.lock[0] === t && !F4.hover ? [] : [t]);
  });

  $("#f4-prev").addEventListener("click", () => (stopPlay(), stepF4(-1)));
  $("#f4-next").addEventListener("click", () => (stopPlay(), stepF4(1)));
  $("#f4-play").addEventListener("click", (e) => {
    if (F4.playing) return stopPlay();
    const b = e.currentTarget;
    b.classList.add("is-playing");
    b.setAttribute("aria-label", "Pause");
    if (!(F4.lock.length === 1)) lockF4([ORDER[0]]);
    else stepF4(1);
    F4.playing = setInterval(() => {
      if (F4.lock.length === 1 && F4.lock[0] === ORDER.at(-1)) {
        stopPlay();
        lockF4([]);
      } else stepF4(1);
    }, 2600);
  });
  $(".anat").addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") stepF4(1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") stepF4(-1);
    else if (e.key === "Escape") lockF4([]);
    else return;
    stopPlay();
    e.preventDefault();
    $(`.trow[data-t="${F4.lock[0]}"]`)?.focus({ preventScroll: true });
  });

  // "Show me" links elsewhere on the page open the figure on those types
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-show]");
    if (!b) return;
    stopPlay();
    lockF4(b.dataset.show.split(" "));
    $(".anat__fig").scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
  });

  if ("ResizeObserver" in window)
    new ResizeObserver(() => {
      if (Math.round(f4.getBoundingClientRect().width) !== f4Width) drawF4();
    }).observe(f4);
  drawF4();
  document.fonts?.ready.then(drawF4);

  // ── Fig. 1: six charts, three questions ──────────────────────
  const q = (k) => `<span class="q q--${k}">${k[0].toUpperCase() + k.slice(1)}?</span>`;
  $("#gallery").innerHTML = P.FIG1.map(
    (f, i) => `<li class="gcard in-view" style="--d:${i % 3}">
      <button type="button" class="zoomable" data-zoom="fig1${f.k}" aria-label="Open Fig. 1${f.k}, the ${lower(f.kind)}, at full size">
        <div class="sheet gcard__art"><img src="images/fig1${f.k}.webp" alt="${esc(f.alt)}" loading="lazy" decoding="async" /></div>
      </button>
      <p class="gcard__k"><span class="figcap__n">(${f.k})</span>${f.kind}</p>
      <table class="wtable">
        <thead><tr><th scope="col">${q("why")}</th><th scope="col">${q("how")}</th><th scope="col">${q("what")}</th></tr></thead>
        <tbody>${f.rows.map((r) => `<tr><td class="c-why">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody>
      </table>
      <p class="gcard__cap">${esc(f.cap)}</p>
    </li>`,
  ).join("");
  // lazily loaded images join the fade
  $$("#gallery img").forEach((img) => {
    const done = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener("load", done, { once: true });
  });

  // ── Fig. 5: the design space ─────────────────────────────────
  const mx = $("#mx");
  const TASKS = P.TASKS;
  const CH = P.CHARTS;
  let html = `<div class="mx__corner"></div>
    <div class="mx__grp mx__grp--why" style="grid-column: 2 / span 4">${q("why")}<span>Task</span></div>
    <div class="mx__grp mx__grp--how" style="grid-column: 7 / span 14">${q("how")}<span>Usage on each kind of chart</span></div>
    <div class="mx__corner mx__corner--2"><span class="label">Type</span></div>`;
  TASKS.forEach(
    (t, j) =>
      (html += `<button type="button" class="mx__th mx__th--why" data-task="${t.id}" style="grid-column:${2 + j}" aria-pressed="false"><span>${t.name}</span></button>`),
  );
  CH.forEach(
    ([name, n], j) =>
      (html += `<button type="button" class="mx__th" data-chart="${j}" style="grid-column:${7 + j}" aria-pressed="false" aria-label="${name}, ${n} charts"><span>${name} <i>${n}</i></span></button>`),
  );
  P.TYPES.forEach((t, r) => {
    const row = 3 + r;
    html += `<button type="button" class="mx__rh" data-type="${t.id}" style="grid-row:${row}" aria-pressed="false">${icon(t.id)}<span>${t.name}</span></button>`;
    P.WHY[t.id].forEach(
      (v, j) =>
        (html += `<span class="mx__c mx__c--why${v ? " is-yes" : ""}" data-type="${t.id}" data-task="${TASKS[j].id}" style="grid-row:${row};grid-column:${2 + j}"></span>`),
    );
    P.HOW[t.id].forEach(
      (v, j) =>
        (html += `<span class="mx__c mx__c--how l${v}" data-type="${t.id}" data-chart="${j}" style="grid-row:${row};grid-column:${7 + j}"></span>`),
    );
  });
  mx.innerHTML = html;

  const cells = $$(".mx__c", mx);
  const dsRead = $("#ds-read");
  const dsLabel = $("#ds-label");
  const dsClear = $("#ds-clear");
  const taskSeg = $("#task-seg");
  taskSeg.innerHTML =
    `<button type="button" data-task="" aria-pressed="true">All</button>` +
    TASKS.map((t) => `<button type="button" data-task="${t.id}" aria-pressed="false">${t.name}</button>`).join("");

  const supports = (type, task) => !!P.WHY[type][TASKS.findIndex((t) => t.id === task)];
  const typesFor = (task) => P.TYPES.filter((t) => supports(t.id, task));
  const chip = (attr, id, label) => `<button type="button" class="chip chip--sm" ${attr}="${id}">${label}</button>`;
  const typeChip = (id) => chip("data-go-type", id, `${icon(id)}${TYPE[id].name}`);

  function bandsHtml(entries) {
    // entries: [label, band]; strongest band first, empty bands left out
    return [3, 2, 1, 0]
      .map((b) => {
        const xs = entries.filter((e) => e[1] === b).map((e) => e[0]);
        if (!xs.length) return "";
        return `<div class="bands__row"><span class="bands__k"><span class="kx kx--${b}"></span>${P.BANDS[b]}</span><span class="bands__v">${xs.join(", ")}</span></div>`;
      })
      .join("");
  }
  function sourcesLine(id) {
    const j = P.TYPES.findIndex((t) => t.id === id);
    return P.SOURCES.map(
      (s) => `<span class="srcline__i"><span class="srcline__k">${s.name}</span> ${P.TABLE1[s.id][j]}%</span>`,
    ).join("");
  }

  const READ = {
    intro: () => `<h3 class="rd__title">Read it three ways</h3>
      <p class="rd__text">Across a row, one annotation type: the tasks it supports, then how often it appears on each kind of chart. Down a column, one kind of chart. Or start from a task and see which types support it.</p>
      <p class="rd__text rd__text--quiet">Text appears on every kind of chart, on most of them in 51% or more. Indicators are rare on charts without a clear axis, such as pie charts and treemaps. Geometric annotations are rare: in the figure, only maps, pie charts, and density maps reach the lowest band.</p>
      <div class="rd__go">${TASKS.map((t) => chip("data-go-task", t.id, t.name)).join("")}</div>`,
    type: (id) => {
      const t = TYPE[id];
      const tasks = TASKS.filter((x) => supports(id, x.id)).map((x) => lower(x.name));
      const note =
        id === "glyph"
          ? `<p class="rd__note">As printed, glyph's squares mark identify and summarize, while its listed usages, and Sect. 5.2.1, name identify and compare.</p>`
          : "";
      return `<p class="label rd__kind">Annotation type</p>
        <h3 class="rd__title rd__title--icon">${icon(id)}${t.name}</h3>
        <p class="rd__text">In ${fmt(t.n)} of 1,888 charts. Supports ${list(tasks)}.</p>
        <ul class="rd__usage">${t.usage.map((u) => `<li><span class="c-why">${u[0].replace(/^./, (c) => c.toUpperCase())}</span> ${u[1]}</li>`).join("")}</ul>
        ${note}
        <p class="rd__sub">${q("how")} By kind of chart</p>
        <div class="bands">${bandsHtml(CH.map(([n], j) => [lower(n).replace(/^./, (c) => c.toUpperCase()), P.HOW[id][j]]))}</div>
        <p class="rd__sub">${q("what")} Share of the 3,610 instances</p>
        <p class="srcline">${sourcesLine(id)}</p>`;
    },
    chart: (j) => {
      const [name, n] = CH[j];
      return `<p class="label rd__kind">Chart type</p>
        <h3 class="rd__title">${name}</h3>
        <p class="rd__text">${n} ${plural(name)} in the corpus. How often each type appears on them:</p>
        <div class="bands">${bandsHtml(P.TYPES.map((t) => [t.name, P.HOW[t.id][j]]))}</div>`;
    },
    task: (id) => {
      const t = TASKS.find((x) => x.id === id);
      return `<p class="label rd__kind">${t.kind} task</p>
        <h3 class="rd__title c-why">${t.name}</h3>
        <p class="rd__text">${P.TASK_NOTE[id]}</p>
        <div class="rd__go">${typesFor(id).map((x) => typeChip(x.id)).join("")}</div>`;
    },
    cell: (type, key, isTask) => {
      const t = TYPE[type];
      if (isTask) {
        const k = TASKS.find((x) => x.id === key);
        const yes = supports(type, key);
        return `<p class="label rd__kind">${q("why")}</p>
          <h3 class="rd__title">${t.name} · ${lower(k.name)}</h3>
          <p class="rd__text">${yes ? `Fig. 5 marks ${lower(t.name)} as supporting ${lower(k.name)} tasks.` : `Fig. 5 does not mark ${lower(t.name)} for ${lower(k.name)} tasks.`}</p>`;
      }
      const [name, n] = CH[key];
      const b = P.HOW[type][key];
      return `<p class="label rd__kind">${q("how")}</p>
        <h3 class="rd__title">${t.name} on ${plural(name)}</h3>
        <p class="rd__text"><span class="kx kx--${b}"></span>${b ? `Used in ${P.BANDS[b]} of them.` : "Below the figure's lowest band, 6%."} The corpus has ${n} ${plural(name)}.</p>`;
    },
  };

  const DS = { sel: null, task: "" };

  function paintMx(state) {
    const { kind, id, type, key, isTask } = state || {};
    const task = DS.task;
    mx.classList.toggle("has-on", !!state || !!task);
    cells.forEach((c) => {
      let on = true;
      if (kind === "type") on = c.dataset.type === id;
      else if (kind === "chart") on = c.dataset.chart === String(id);
      else if (kind === "task") on = c.dataset.task === id || (c.dataset.chart != null && supports(c.dataset.type, id));
      else if (kind === "cell")
        on = c.dataset.type === type || (isTask ? c.dataset.task === key : c.dataset.chart === String(key));
      if (!kind && task) on = c.dataset.task === task || (c.dataset.chart != null && supports(c.dataset.type, task));
      c.classList.toggle("is-dim", !on);
      c.classList.toggle(
        "is-pt",
        kind === "cell" && c.dataset.type === type && (isTask ? c.dataset.task === key : c.dataset.chart === String(key)),
      );
    });
    $$(".mx__rh", mx).forEach((b) => {
      const t = b.dataset.type;
      let on = true;
      if (kind === "type") on = t === id;
      else if (kind === "cell") on = t === type;
      else if (kind === "task") on = supports(t, id);
      else if (task) on = supports(t, task);
      b.classList.toggle("is-dim", !on);
    });
    $$(".mx__th", mx).forEach((b) => {
      let on = false;
      if (kind === "chart") on = b.dataset.chart === String(id);
      else if (kind === "task") on = b.dataset.task === id;
      else if (kind === "cell") on = isTask ? b.dataset.task === key : b.dataset.chart === String(key);
      else if (task) on = b.dataset.task === task;
      b.classList.toggle("is-hi", on);
    });
    // Table 1 follows the selected type
    const tcol = kind === "type" ? id : kind === "cell" ? type : null;
    $$("[data-col]", t1).forEach((c) => c.classList.toggle("is-hi", c.dataset.col === tcol));
    t1.classList.toggle("has-on", !!tcol);
  }

  function readFor(state) {
    if (!state) return READ.intro();
    if (state.kind === "cell") return READ.cell(state.type, state.key, state.isTask);
    return READ[state.kind](state.id);
  }
  function render(state, { swap = true } = {}) {
    paintMx(state);
    dsRead.innerHTML = readFor(state);
    if (swap && !reduceMotion()) {
      dsRead.classList.remove("is-swap");
      void dsRead.offsetWidth;
      dsRead.classList.add("is-swap");
    }
    dsLabel.textContent = DS.sel ? "Selected" : "Reading the design space";
    dsClear.hidden = !DS.sel;
  }
  function select(state) {
    const same = DS.sel && state && JSON.stringify(DS.sel) === JSON.stringify(state);
    DS.sel = same ? null : state;
    syncPressed();
    render(DS.sel || (DS.task ? { kind: "task", id: DS.task } : null));
  }
  function syncPressed() {
    const s = DS.sel || {};
    $$(".mx__rh", mx).forEach((b) => b.setAttribute("aria-pressed", String(s.kind === "type" && s.id === b.dataset.type)));
    $$(".mx__th[data-chart]", mx).forEach((b) =>
      b.setAttribute("aria-pressed", String(s.kind === "chart" && String(s.id) === b.dataset.chart)),
    );
    $$(".mx__th[data-task]", mx).forEach((b) => b.setAttribute("aria-pressed", String(DS.task === b.dataset.task)));
    $$("button", taskSeg).forEach((b) => b.setAttribute("aria-pressed", String(DS.task === b.dataset.task)));
  }
  function setTask(id) {
    DS.task = id;
    DS.sel = id ? { kind: "task", id } : null;
    syncPressed();
    render(DS.sel);
  }
  const current = () => DS.sel || (DS.task ? { kind: "task", id: DS.task } : null);

  // hover previews, for a mouse only
  const canHover = matchMedia("(hover: hover) and (pointer: fine)");
  let hoverTimer;
  function preview(state) {
    if (!canHover.matches) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => render(state || current(), { swap: false }), state ? 0 : 60);
  }
  mx.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const c = e.target.closest(".mx__c");
    const rh = e.target.closest(".mx__rh");
    const th = e.target.closest(".mx__th");
    if (c) {
      const isTask = c.dataset.task != null;
      preview({ kind: "cell", type: c.dataset.type, key: isTask ? c.dataset.task : +c.dataset.chart, isTask });
    } else if (rh) preview({ kind: "type", id: rh.dataset.type });
    else if (th) preview(th.dataset.task ? { kind: "task", id: th.dataset.task } : { kind: "chart", id: +th.dataset.chart });
  });
  mx.addEventListener("pointerleave", () => preview(null));
  mx.addEventListener("click", (e) => {
    const c = e.target.closest(".mx__c");
    const rh = e.target.closest(".mx__rh");
    const th = e.target.closest(".mx__th");
    if (c) {
      const isTask = c.dataset.task != null;
      select({ kind: "cell", type: c.dataset.type, key: isTask ? c.dataset.task : +c.dataset.chart, isTask });
    } else if (rh) select({ kind: "type", id: rh.dataset.type });
    else if (th?.dataset.task) setTask(DS.task === th.dataset.task ? "" : th.dataset.task);
    else if (th) select({ kind: "chart", id: +th.dataset.chart });
  });
  taskSeg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) setTask(b.dataset.task);
  });
  dsRead.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go-type]");
    const k = e.target.closest("[data-go-task]");
    if (t) select({ kind: "type", id: t.dataset.goType });
    if (k) setTask(k.dataset.goTask);
  });
  dsClear.addEventListener("click", () => {
    DS.sel = null;
    DS.task = "";
    syncPressed();
    render(null);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (DS.sel || DS.task) && !$("#zoom").open && $("#ds").contains(document.activeElement)) {
      dsClear.click();
    }
  });

  // say when the matrix scrolls sideways
  const mxWrap = $("#mx-wrap");
  const mxHint = $("#mx-hint");
  const checkScroll = () => {
    const over = mxWrap.scrollWidth > mxWrap.clientWidth + 2;
    mxHint.hidden = !over;
    mxWrap.classList.toggle("can-left", mxWrap.scrollLeft > 4);
    mxWrap.classList.toggle("can-right", over && mxWrap.scrollLeft < mxWrap.scrollWidth - mxWrap.clientWidth - 4);
  };
  mxWrap.addEventListener("scroll", checkScroll, { passive: true });
  addEventListener("resize", checkScroll);

  // ── What? ────────────────────────────────────────────────────
  $("#srcs").innerHTML = P.SOURCES.map(
    (s, i) => `<li class="src in-view" style="--d:${i}">
      <p class="src__n">${fmt(s.n)}<span>charts, ${s.approx}</span></p>
      <span class="src__bar" aria-hidden="true"><span style="--w:${((s.n / TOTAL) * 100).toFixed(2)}%"></span></span>
      <h4 class="src__name">${s.name}</h4>
      <p class="src__def">${esc(s.def)}</p>
      <p class="src__ex">${esc(s.ex)}</p>
    </li>`,
  ).join("");

  // Table 1, shaded in the paper's three bands
  const t1 = $("#t1");
  const wband = (v) => (v >= 10 ? 3 : v >= 5 ? 2 : v >= 1 ? 1 : 0);
  t1.insertAdjacentHTML(
    "beforeend",
    `<thead><tr><td></td>${P.TYPES.map(
      (t) => `<th scope="col" data-col="${t.id}"><button type="button" class="t1__th" data-go-type="${t.id}">${icon(t.id)}<span>${t.name}</span></button></th>`,
    ).join("")}</tr></thead>
    <tbody>${P.SOURCES.map(
      (s) =>
        `<tr><th scope="row">${s.name}</th>${P.TABLE1[s.id]
          .map((v, j) => `<td class="w${wband(v)}" data-col="${P.TYPES[j].id}">${v ? v + "%" : "0"}</td>`)
          .join("")}</tr>`,
    ).join("")}
    <tr class="t1__total"><th scope="row">Charts</th>${P.TYPES.map((t) => `<td data-col="${t.id}">${fmt(t.n)}</td>`).join("")}</tr></tbody>`,
  );
  t1.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go-type]");
    if (!b) return;
    select({ kind: "type", id: b.dataset.goType });
  });

  render(null, { swap: false });
  checkScroll();

  // ── Ensembles ────────────────────────────────────────────────
  $$(".combo").forEach((el) => {
    const ids = el.dataset.c.split(" ");
    el.innerHTML =
      `<span class="combo__n">${ids.length === 2 ? "Two" : "Three"} types</span>` +
      `<span class="combo__parts">${ids
        .map((id) => `<span class="combo__t">${icon(id)}${TYPE[id].name}</span>`)
        .join('<span class="combo__plus" aria-hidden="true">+</span>')}</span>`;
  });

  // ── Case studies ─────────────────────────────────────────────
  // Each step adds one task's annotations to the bare chart. What a step adds is outlined on the
  // chart, and each ensemble reads as a card: why, how, what. A card and its marks point at each other.
  const cs = $("#cs");
  const csSeg = $("#cs-seg");
  const csArt = $("#cs-art");
  const csBeats = $("#cs-beats");
  const csStep = $("#cs-step");
  const csEns = $("#cs-ens");
  const csCap = $("#cs-cap");
  const csIntro = $("#cs-intro");
  const csHold = $("#cs-hold");
  const LET = ["a", "b", "c", "d"];
  const CS = { c: 0, s: 0, focus: null, pin: null };
  const qs = (k) => `<span class="q q--${k}">${k[0].toUpperCase() + k.slice(1)}?</span>`;
  const howChips = (how) =>
    how
      .split(" + ")
      .map((id) => `<span class="ens__t">${icon(id)}${id}</span>`)
      .join('<span class="ens__plus" aria-hidden="true">+</span>');

  csSeg.innerHTML = P.CASES.map(
    (c, i) =>
      `<button type="button" data-case="${i}" aria-pressed="${i === 0}"><span class="cs__long">${c.source}</span><span class="cs__short">${c.source.replace(/^The /, "").replace("Wall Street Journal", "WSJ").replace("Washington Post", "Post")}</span></button>`,
  ).join("");

  // which ensembles a step shows: its own, or all of them on the last step
  const ensFor = (c, s) => c.ens.map((e, i) => ({ ...e, i })).filter((e) => (s === 3 ? true : e.step === s));
  // a short name for each step, from the tasks it adds
  const stepName = (c, s) =>
    s === 0
      ? "Bare chart"
      : s === 3
        ? "All together"
        : [...new Set(c.ens.filter((e) => e.step === s).map((e) => e.why))].map((w) => w[0].toUpperCase() + w.slice(1)).join(" & ");

  function buildCase() {
    const c = P.CASES[CS.c];
    const rx = 0.7;
    const ry = +((0.7 * c.w) / c.h).toFixed(2);
    const shape = (m, cls, pad = 0) => {
      const [t, x0, y0, x1, y1] = m.map((v) => (typeof v === "number" ? v * 100 : v));
      if (t === "l") return `<line class="${cls}" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`;
      const px = pad, py = (pad * c.w) / c.h;
      return `<rect class="${cls}" x="${(x0 - px).toFixed(2)}" y="${(y0 - py).toFixed(2)}" width="${(x1 - x0 + 2 * px).toFixed(2)}" height="${(y1 - y0 + 2 * py).toFixed(2)}" rx="${rx}" ry="${ry}"/>`;
    };
    csArt.style.aspectRatio = `${c.w} / ${c.h}`;
    csArt.innerHTML =
      LET.map(
        (l, i) =>
          `<img src="images/${c.img}${l}.webp" width="${c.w}" height="${c.h}" alt="${esc(`${c.source}, ${c.fig}${l}: ${c.steps[i].title.toLowerCase()}.`)}" decoding="async" class="${i === CS.s ? "is-on" : ""}" />`,
      ).join("") +
      `<svg class="cs__ov" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs><mask id="cs-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="#fff"/><g id="cs-holes"></g></mask></defs>
        <rect class="cs__veil" width="100" height="100" mask="url(#cs-mask)"/>
        ${c.ens
          .map(
            (e, i) =>
              `<g class="cs__mk" data-i="${i}" data-step="${e.step}">${e.marks.map((m) => shape(m, "mk", 0.4)).join("")}${e.marks
                .map((m) => shape(m, "mk-hit", 1.2))
                .join("")}</g>`,
          )
          .join("")}
      </svg>`;
    csArt._holes = c.ens.map((e) => e.marks.map((m) => shape(m, "hole", 1)).join(""));
    $$("img", csArt).forEach((img) => {
      const done = () => img.classList.add("is-loaded");
      if (img.complete && img.naturalWidth) done();
      else img.addEventListener("load", done, { once: true });
    });
    csBeats.innerHTML = c.steps
      .map(
        (s, i) =>
          `<li><button type="button" data-step="${i}"><span class="cs__dot">${LET[i]}</span><span class="cs__lbl">${stepName(c, i)}</span></button></li>`,
      )
      .join("");
    csIntro.innerHTML = `<p class="cs__story">${esc(c.story)}</p>`;
    csCap.innerHTML = `<span class="figcap__n">${c.fig}</span><span>${esc(c.about)}</span>`;
  }

  function focusEns(i, { pin } = {}) {
    if (pin !== undefined) CS.pin = pin;
    CS.focus = i ?? CS.pin;
    const on = CS.focus;
    $("#cs-holes").innerHTML = on == null ? "" : csArt._holes[on];
    csArt.classList.toggle("has-focus", on != null);
    $$(".cs__mk", csArt).forEach((g) => g.classList.toggle("is-focus", +g.dataset.i === on));
    $$(".ens__card", csEns).forEach((b) => {
      b.classList.toggle("is-focus", +b.dataset.i === on);
      b.setAttribute("aria-pressed", String(+b.dataset.i === CS.pin));
    });
  }

  function showStep() {
    const c = P.CASES[CS.c];
    const s = c.steps[CS.s];
    $$("img", csArt).forEach((img, i) => img.classList.toggle("is-on", i === CS.s));
    // what this step adds glows briefly when the step opens, then the chart rests clean
    $$(".cs__mk", csArt).forEach((g) => {
      const show = CS.s === 3 || +g.dataset.step === CS.s;
      g.classList.toggle("is-shown", show);
      g.classList.remove("is-new");
      if (show && CS.s !== 3 && !reduceMotion()) {
        g.classList.remove("is-new");
        void g.getBBox();
        g.classList.add("is-new");
      }
    });
    csArt.dataset.step = CS.s;
    $$("button", csBeats).forEach((b, i) => {
      b.classList.toggle("is-on", i === CS.s);
      b.classList.toggle("is-done", i < CS.s);
      b.setAttribute("aria-current", i === CS.s ? "step" : "false");
    });
    csBeats.style.setProperty("--p", CS.s / 3);
    const list = ensFor(c, CS.s);
    csStep.innerHTML = `<h3 class="cs__title">${esc(s.title)}</h3>${CS.s === 0 ? `<p class="cs__text">${esc(s.text)} Step through to add them back, one task at a time.</p>` : ""}`;
    csEns.innerHTML = list
      .map(
        (e) => `<li><button type="button" class="ens__card" data-i="${e.i}" aria-pressed="false">
          <span class="ens__why"><span class="q q--why">Why?</span> <span class="c-why">${e.why}</span> ${esc(e.goal)}</span>
          <span class="ens__meta"><span class="q q--how">How?</span> <span class="ens__how">${howChips(e.how)}</span><span class="ens__dot" aria-hidden="true">·</span><span class="q q--what">What?</span> <span class="ens__src">${e.what}</span></span>
          <span class="ens__more"><span>${esc(e.roles)} ${esc(e.src)}</span></span>
        </button></li>`,
      )
      .join("");
    if (!reduceMotion()) {
      [csStep, csEns].forEach((el) => {
        el.classList.remove("is-swap");
        void el.offsetWidth;
        el.classList.add("is-swap");
      });
    }
    focusEns(null, { pin: null });
  }
  function goStep(i) {
    const n = Math.max(0, Math.min(3, i));
    if (n === CS.s) return;
    CS.s = n;
    showStep();
  }

  csSeg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || +b.dataset.case === CS.c) return;
    CS.c = +b.dataset.case;
    CS.s = 0;
    $$("button", csSeg).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    buildCase();
    showStep();
  });
  csBeats.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) goStep(+b.dataset.step);
  });

  // cards and marks point at each other
  csEns.addEventListener("pointerover", (e) => {
    const b = e.target.closest(".ens__card");
    if (b && e.pointerType === "mouse") focusEns(+b.dataset.i);
  });
  csEns.addEventListener("pointerleave", () => focusEns(null));
  csEns.addEventListener("click", (e) => {
    const b = e.target.closest(".ens__card");
    if (!b) return;
    const i = +b.dataset.i;
    focusEns(CS.pin === i ? null : i, { pin: CS.pin === i ? null : i });
  });
  csEns.addEventListener("focusin", (e) => {
    const b = e.target.closest(".ens__card");
    if (b && b.matches(":focus-visible")) focusEns(+b.dataset.i);
  });
  csArt.addEventListener("pointerover", (e) => {
    const g = e.target.closest(".cs__mk.is-shown");
    if (e.pointerType === "mouse") focusEns(g ? +g.dataset.i : null);
  });
  csArt.addEventListener("pointerleave", () => focusEns(null));
  csArt.addEventListener("click", (e) => {
    const g = e.target.closest(".cs__mk.is-shown");
    const i = g ? +g.dataset.i : null;
    focusEns(i, { pin: i === CS.pin ? null : i });
    if (i != null) $(`.ens__card[data-i="${i}"]`, csEns)?.scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
  });

  // hold to see the chart bare
  const holdOn = () => csArt.classList.add("is-bare");
  const holdOff = () => csArt.classList.remove("is-bare");
  csHold.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    holdOn();
    try {
      csHold.setPointerCapture(e.pointerId);
    } catch (err) {}
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => csHold.addEventListener(t, holdOff));
  csHold.addEventListener("contextmenu", (e) => e.preventDefault());
  csHold.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      holdOn();
    }
  });
  csHold.addEventListener("keyup", holdOff);
  csHold.addEventListener("blur", holdOff);
  $("#cs-zoom").addEventListener("click", () => {
    const c = P.CASES[CS.c];
    zoomReturn = $("#cs-zoom");
    zoomImg.src = `images/${c.img}${LET[CS.s]}.webp`;
    zoomImg.alt = $("img.is-on", csArt)?.alt || "";
    zoom.showModal();
    root.classList.add("has-modal");
  });

  cs.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea") || e.target === csHold) return;
    if (e.key === "ArrowRight") goStep(CS.s + 1);
    else if (e.key === "ArrowLeft") goStep(CS.s - 1);
    else if (e.key === "Escape") focusEns(null, { pin: null });
    else return;
    e.preventDefault();
  });
  // swipe the chart to step through it
  let sx = null;
  csArt.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  csArt.addEventListener(
    "touchend",
    (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) goStep(CS.s + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  // ── The corpus by chart type ─────────────────────────────────
  const maxC = CH[0][1];
  $("#ctypes").innerHTML = CH.map(
    ([name, n]) =>
      `<li><span class="ctypes__name">${name}</span><span class="ctypes__bar" aria-hidden="true"><span style="--w:${((n / maxC) * 100).toFixed(2)}%"></span></span><span class="ctypes__n">${n}</span></li>`,
  ).join("");

  // ── Full-size figures ────────────────────────────────────────
  const zoom = $("#zoom");
  const zoomImg = $("#zoom-img");
  let zoomReturn = null;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-zoom]");
    if (!b) return;
    if (b.dataset.swiped) {
      delete b.dataset.swiped;
      return;
    }
    const img = $("img.is-on", b) || $("img", b);
    zoomReturn = b;
    zoomImg.src = `images/${b.dataset.zoom}.webp`;
    zoomImg.alt = img
      ? img.alt
      : b.dataset.zoom === "fig4"
        ? "Fig. 4 from the paper: the illustrative scatterplot with its seven annotations labeled (a) to (g)."
        : "Fig. 5 from the paper: the design space, with the Why?, How?, and What? panels.";
    zoom.showModal();
    root.classList.add("has-modal");
  });
  const closeZoom = () => zoom.open && zoom.close();
  $("#zoom-close").addEventListener("click", closeZoom);
  $("#zoom-stage").addEventListener("click", closeZoom);
  zoom.addEventListener("close", () => {
    root.classList.remove("has-modal");
    zoomReturn?.focus({ preventScroll: true });
  });

  // the case studies use the zoom dialog, so they start once it exists
  buildCase();
  showStep();

  // ── Copy ─────────────────────────────────────────────────────
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  }
  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.readOnly = true;
      ta.style.cssText = "position:fixed;opacity:0";
      ta.value = text;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(msg);
  }
  $$("[data-copy]").forEach((b) =>
    b.addEventListener("click", () => copy($(`#${b.dataset.copy}`).textContent, "Citation copied")),
  );

  // ── Theme ────────────────────────────────────────────────────
  $("#theme-toggle").addEventListener("click", (e) => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      $("#theme-color-meta").setAttribute("content", next === "dark" ? "#0E1013" : "#F5F4F0");
    };
    try {
      localStorage.setItem("designspace-theme", next);
    } catch (err) {}
    if (!document.startViewTransition || reduceMotion()) return apply();
    // the new theme spreads outward from the toggle
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  });

  // ── Entry motion ─────────────────────────────────────────────
  const items = $$(".in-view");
  if (!("IntersectionObserver" in window)) items.forEach((el) => el.classList.add("is-in"));
  else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
          if (en.target.id === "ds") checkScroll();
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => io.observe(el));
  }
})();
