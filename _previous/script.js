/* Extracted from index.html <script> */

const FALLBACK_WHY_HOW = {
  present: ["text"],
  identify: [
    "enclosure",
    "connector",
    "text",
    "glyph",
    "color",
    "indicator",
    "geometric",
  ],
  summarize: ["text", "glyph", "indicator"],
  compare: ["enclosure", "connector", "text", "glyph", "color", "indicator"],
};
const FALLBACK_ANN_WHAT = {
  enclosure: ["internal", "external"],
  connector: ["external"],
  text: ["internal", "derived", "external"],
  glyph: ["internal", "external"],
  color: ["external", "derived"],
  indicator: ["derived", "external"],
  geometric: ["external"],
};
const FALLBACK_ANN_INFO = {
  enclosure: { ens: ["Enclosure + Text", "Enclosure + Connector + Text"] },
  connector: { ens: ["Connector + Text", "Enclosure + Connector + Text"] },
  text: { ens: ["Connector + Text", "Enclosure + Text", "Indicator + Text"] },
  glyph: { ens: ["Glyph + Color"] },
  color: { ens: ["Glyph + Color", "Color + Enclosure + Text"] },
  indicator: { ens: ["Indicator + Text"] },
  geometric: { ens: [] },
};
const FALLBACK_TAXON = [
  {
    name: "Enclosure",
    pct: 31,
    n: "588",
    c: "enc",
    tasks: ["Identify", "Compare"],
    desc: "Closed boundaries such as rectangles, ellipses, and brackets. They isolate or group chart marks and often work with text or connectors.",
  },
  {
    name: "Connector",
    pct: 21,
    n: "393",
    c: "con",
    tasks: ["Identify", "Compare"],
    desc: "Lines or arrows that link an annotation to the mark it refers to. They reduce ambiguity and usually appear with text.",
  },
  {
    name: "Text",
    pct: 76,
    n: "1,434",
    c: "txt",
    tasks: ["Present", "Identify", "Summarize", "Compare"],
    desc: "Words or sentences used for labels, descriptions, summaries, or added context. Text appears in 1,434 of 1,888 charts and is the only type that supports Present.",
  },
  {
    name: "Glyph",
    pct: 14,
    n: "270",
    c: "gly",
    tasks: ["Identify", "Compare"],
    desc: "Symbols or shapes that mark points, events, or categories. The paper shows them most often in maps and line charts.",
  },
  {
    name: "Color",
    pct: 14,
    n: "259",
    c: "col",
    tasks: ["Identify", "Compare"],
    desc: "Added color used as an annotation layer to highlight or distinguish marks. Color that is already part of the chart encoding does not count as an annotation.",
  },
  {
    name: "Indicator",
    pct: 22,
    n: "424",
    c: "ind",
    tasks: ["Identify", "Summarize", "Compare"],
    desc: "Reference lines and overlays used for trends, thresholds, averages, or correlations. Many indicator annotations are derived from the underlying data.",
  },
  {
    name: "Geometric",
    pct: 3,
    n: "61",
    c: "geo",
    tasks: ["Identify"],
    desc: "Spatial modifications such as zoom boxes or exploded slices that focus attention on one area. This type is rare and only supports Identify in the paper.",
  },
];

let WHY_HOW = { ...FALLBACK_WHY_HOW };
let ANN_WHAT = { ...FALLBACK_ANN_WHAT };
let WHY_INFO = {};
let ANN_INFO = { ...FALLBACK_ANN_INFO };
let TAXON = [...FALLBACK_TAXON];
const TASK_META = {
  Identify: {
    initial: "I",
    desc: "Locate, isolate, or call out specific marks, values, or regions.",
  },
  Compare: {
    initial: "C",
    desc: "Contrast values, groups, positions, or changes across the chart.",
  },
  Summarize: {
    initial: "S",
    desc: "Condense trends, aggregates, or broader patterns into a takeaway.",
  },
  Present: {
    initial: "P",
    desc: "Provide narrative context, explanation, or supporting editorial framing.",
  },
};
let CS = [];
let drawerCsSlide = 0;

/* ═══════════════════════ DARK MODE ═══════════════════════ */
const dmtoggle = document.getElementById("dmtoggle");
if (localStorage.getItem("dark") === "1") {
  document.body.classList.add("dark");
  dmtoggle.checked = true;
}
dmtoggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", dmtoggle.checked);
  localStorage.setItem("dark", dmtoggle.checked ? "1" : "0");
});

let activeWhy = null;
let activeAnn = null;
let activeTaxKey = null;
let activeTaxFilter = "All";
let activeCaseIndex = 0;
let drawerReturnFocusKey = null;

function getTypeIcon(type) {
  const iconMap = {
    enclosure:
      '<svg viewBox="0 0 24 24" fill="none"><ellipse cx="11.5" cy="12.5" rx="7" ry="5.5" stroke="currentColor" stroke-width="1.9"/><circle cx="9.5" cy="13" r="1.5" fill="currentColor"/><circle cx="12.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="14" cy="14" r="1.5" fill="currentColor"/><circle cx="10.5" cy="15" r="1.5" fill="currentColor"/></svg>',
    connector:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6h14m0 0-3-3m3 3-3 3M21 12H7m0 0 3-3m-3 3 3 3M3 18h14m0 0-3-3m3 3-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h8l4 4v14H6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v5h5M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    glyph:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M6 3v18M7 4l12 4-12 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    color:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c5.2 0 9 3.5 9 7.8 0 4-2.6 7.2-6.2 7.2h-1.5c-.9 0-1.6.7-1.6 1.6V21c0 .6-.4 1-1 1-4.7 0-8.7-4-8.7-8.9C2 7.2 6.3 3 12 3z" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="9" r="1.1" fill="currentColor"/><circle cx="12" cy="8" r="1.1" fill="currentColor"/><circle cx="16" cy="10" r="1.1" fill="currentColor"/><circle cx="9.5" cy="13" r="1.1" fill="currentColor"/></svg>',
    indicator:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="2.8" height="8" fill="currentColor"/><rect x="11.6" y="8.5" width="2.8" height="10.5" fill="currentColor"/><rect x="16.2" y="6" width="2.8" height="13" fill="currentColor"/><path d="M6.8 10.4 10.8 7.4l3 2.2 4.2-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    geometric:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M10 13L16 13A6 6 0 1 1 10 7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13 10L13 4A6 6 0 0 1 19 10Z" fill="currentColor" fill-opacity="0.28" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  };
  return `<span class="ann-svg" aria-hidden="true">${iconMap[type] || iconMap.text}</span>`;
}

function getTaskMeta(task) {
  return TASK_META[task] || { initial: task?.[0] || "?", desc: task || "" };
}

function renderTaskDot(task, className = "") {
  const meta = getTaskMeta(task);
  return `<span class="task-dot${className ? ` ${className}` : ""}" aria-hidden="true">${meta.initial}</span>`;
}

function clearAll() {
  document.querySelectorAll(".why-card,.ann-card,.what-card").forEach((e) => {
    e.classList.remove("active", "dim");
  });
  document.querySelectorAll(".ann-card").forEach((e) => {
    e.style.background = "";
    e.style.borderColor = "";
    e.style.boxShadow = "";
  });
}

function hideInfo() {
  document.getElementById("ds-info").style.display = "none";
}

function showInfo(title, body, ens, whats) {
  document.getElementById("ds-info-title").textContent = title;
  document.getElementById("ds-info-body").textContent = body;

  const er = document.getElementById("ds-ens-row");
  er.innerHTML =
    ens && ens.length
      ? '<span class="ds-ens-lbl">Common ensembles:</span>' +
        ens.map((e) => `<span class="ds-ens-tag">${e}</span>`).join("")
      : "";

  const wr = document.getElementById("ds-what-row");
  wr.innerHTML =
    whats && whats.length
      ? '<span class="ds-what-lbl">Typical data sources (What?):</span>' +
        whats
          .map(
            (w) =>
              `<span class="ds-what-tag">${w[0].toUpperCase() + w.slice(1)}</span>`,
          )
          .join("")
      : "";

  document.getElementById("ds-info").style.display = "block";
}

function doWhy(el) {
  const w = el.dataset.why;
  if (!WHY_HOW[w] || !WHY_INFO[w]) return;

  if (activeWhy === w) {
    clearAll();
    activeWhy = null;
    hideInfo();
    return;
  }

  clearAll();
  activeWhy = w;
  activeAnn = null;
  el.classList.add("active");

  document.querySelectorAll(".why-card").forEach((c) => {
    if (c !== el) c.classList.add("dim");
  });

  const ok = WHY_HOW[w];
  document.querySelectorAll(".ann-card").forEach((c) => {
    if (ok.includes(c.dataset.ann)) c.classList.add("active");
    else c.classList.add("dim");
  });

  const i = WHY_INFO[w];
  showInfo(i.t, i.d, [], []);
}

function doAnn(el) {
  const a = el.dataset.ann;
  if (!ANN_INFO[a] || !ANN_WHAT[a]) return;

  if (activeAnn === a) {
    clearAll();
    activeAnn = null;
    activeWhy = null;
    hideInfo();
    return;
  }

  clearAll();
  activeAnn = a;
  activeWhy = null;
  el.classList.add("active");

  el.style.background = "var(--abg,var(--bg-alt))";
  el.style.borderColor = "var(--abr,var(--border))";
  el.style.boxShadow =
    "0 0 0 3px rgba(0,0,0,0.06),2px 5px 18px rgba(0,0,0,0.10)";

  document.querySelectorAll(".ann-card").forEach((c) => {
    if (c !== el) c.classList.add("dim");
  });
  document.querySelectorAll(".why-card").forEach((c) => c.classList.add("dim"));

  const i = ANN_INFO[a];
  showInfo(i.t, i.d, i.ens, ANN_WHAT[a]);
}

function doWhat(el) {
  const w = el.dataset.what;

  clearAll();
  activeAnn = null;
  activeWhy = null;
  el.classList.add("active");

  document.querySelectorAll(".what-card").forEach((c) => {
    if (c !== el) c.classList.add("dim");
  });

  const matching = Object.entries(ANN_WHAT)
    .filter(([, v]) => v.includes(w))
    .map(([k]) => k);

  document.querySelectorAll(".ann-card").forEach((c) => {
    if (matching.includes(c.dataset.ann)) c.classList.add("active");
    else c.classList.add("dim");
  });
  document.querySelectorAll(".why-card").forEach((c) => c.classList.add("dim"));

  const titles = {
    internal: "Internal Data Source (~52%)",
    derived: "Derived Data Source (~17%)",
    external: "External Data Source (~53%)",
  };
  const descs = {
    internal:
      "Values taken directly from the dataset without transformation. Annotation value = exact dataset value. Text annotations showing data point labels are the most common example.",
    derived:
      "Values computed from the chart data, such as regression lines, cluster assignments, averages, or confidence intervals. Indicator annotations are the most frequent derived annotation type.",
    external:
      "Content originating outside the dataset, such as expert commentary, historical events, narrative from an article, or another data file. This is the most flexible category and the most commonly observed across all annotation types.",
  };

  const whichAnns = matching.map((m) => m[0].toUpperCase() + m.slice(1));
  showInfo(titles[w], descs[w], [], []);

  document.getElementById("ds-ens-row").innerHTML =
    '<span class="ds-ens-lbl">Annotation types commonly using this source:</span>' +
    whichAnns.map((n) => `<span class="ds-ens-tag">${n}</span>`).join("");
}

function setDrawerSlide(idx) {
  const total = document.querySelectorAll(".drawer-slide").length;
  drawerCsSlide = Math.max(0, Math.min(idx, total - 1));
  document
    .querySelectorAll(".drawer-slide")
    .forEach((s, i) => {
      const isActive = i === drawerCsSlide;
      s.classList.toggle("active", isActive);
      s.hidden = !isActive;
      s.setAttribute("aria-hidden", String(!isActive));
    });
  document
    .querySelectorAll(".drawer-nav-dot")
    .forEach((d, i) => {
      const isActive = i === drawerCsSlide;
      d.classList.toggle("active", isActive);
      d.setAttribute("aria-current", isActive ? "true" : "false");
    });
  const prev = document.getElementById("drawer-prev");
  const next = document.getElementById("drawer-next");
  const lbl = document.getElementById("drawer-nav-lbl");
  if (prev) prev.disabled = drawerCsSlide === 0;
  if (next) next.disabled = drawerCsSlide === total - 1;
  if (lbl) lbl.textContent = `${drawerCsSlide + 1} / ${total}`;
}

function restoreDrawerFocus() {
  if (!drawerReturnFocusKey) return;
  const target = document.querySelector(
    `.tax-card[data-tax-key="${drawerReturnFocusKey}"]`,
  );
  drawerReturnFocusKey = null;
  target?.focus();
}

function focusDrawerClose() {
  document.querySelector("#tax-drawer .drawer-close")?.focus();
}

function closeDrawer() {
  if (activeTaxKey) drawerReturnFocusKey = activeTaxKey;
  activeTaxKey = null;
  renderTaxonomy();
  renderCaseStudies();
  requestAnimationFrame(restoreDrawerFocus);
  setTimeout(animFills, 80);
}

function renderTaxonomy() {
  const filterWrap = document.getElementById("tax-controls");
  const tg = document.getElementById("tax-grid");
  const detail = document.getElementById("tax-drawer");
  const status = document.getElementById("tax-status");
  const filterOrder = ["All", "Identify", "Compare", "Summarize", "Present"];
  const filterValues = filterOrder.filter(
    (f) => f === "All" || TAXON.some((a) => a.tasks.includes(f)),
  );

  filterWrap.innerHTML = filterValues
    .map((f) => {
      const isActive = f === activeTaxFilter;
      if (f === "All") {
        return `
    <button type="button" class="tax-filter tax-filter--all${isActive ? " active" : ""}" data-filter="${f}" aria-pressed="${isActive ? "true" : "false"}" aria-label="Show all annotation types">
      <span class="tax-filter-label">All Types</span>
    </button>`;
      }
      const meta = getTaskMeta(f);
      return `
    <button type="button" class="tax-filter${isActive ? " active" : ""}" data-filter="${f}" aria-pressed="${isActive ? "true" : "false"}" aria-label="${f}. ${meta.desc}">
      ${renderTaskDot(f, "task-dot--filter")}
      <span class="tax-filter-label">${f}</span>
    </button>`;
    })
    .join("");
  filterWrap.querySelectorAll(".tax-filter").forEach((b) => {
    b.addEventListener("click", () => {
      activeTaxFilter = b.dataset.filter;
      const visibleKeys = TAXON.filter(
        (a) => activeTaxFilter === "All" || a.tasks.includes(activeTaxFilter),
      ).map((a) => a.name.toLowerCase());
      if (activeTaxKey && !visibleKeys.includes(activeTaxKey)) {
        activeTaxKey = null;
      }
      renderTaxonomy();
      renderCaseStudies();
    });
  });

  tg.innerHTML = "";
  const filtered = TAXON.filter(
    (a) => activeTaxFilter === "All" || a.tasks.includes(activeTaxFilter),
  );
  if (status) {
    status.textContent =
      activeTaxFilter === "All"
        ? `Showing all ${filtered.length} annotation types. Select a card to open its detail drawer.`
        : `Showing ${filtered.length} annotation types for ${activeTaxFilter}. Select a card to open its detail drawer.`;
  }

  filtered.forEach((a, i) => {
    const key = a.name.toLowerCase();
    const icon = getTypeIcon(key);
    const div = document.createElement("button");
    div.type = "button";
    div.className = "tax-card fu" + (activeTaxKey === key ? " active" : "");
    div.style.animationDelay = i * 0.06 + "s";
    div.style.borderTop = `2px solid var(--${a.c}-c)`;
    div.style.setProperty("--card-tint", "var(--bg-alt)");
    div.dataset.taxKey = key;
    div.setAttribute("aria-controls", "tax-drawer");
    div.setAttribute("aria-expanded", activeTaxKey === key ? "true" : "false");
    div.setAttribute("aria-haspopup", "dialog");
    div.setAttribute(
      "aria-label",
      `${a.name}. ${a.n} charts, ${a.pct}% of corpus. Tasks: ${a.tasks.join(", ")}. Open detail drawer.`,
    );
    div.innerHTML = `
      <div class="tax-card-head">
        <div class="tax-icon" style="background:var(--${a.c}-bg);border-color:var(--${a.c}-br);color:var(--${a.c}-c)">${icon}</div>
        <div class="tax-name">${a.name}</div>
      </div>
      <div class="tax-card-body">
        <div class="tax-meta-row">
          <div class="tax-count">${a.n} charts</div>
          <div class="tax-tasks" aria-hidden="true" title="Supported tasks: ${a.tasks.join(", ")}">${a.tasks.map((t) => renderTaskDot(t, "task-dot--card")).join("")}</div>
        </div>
        <div class="tax-bar-row" aria-hidden="true">
          <div class="tax-bar"><div class="tax-fill" style="background:var(--accent)" data-w="${a.pct}"></div></div>
          <span class="tax-pct">${a.pct}%</span>
        </div>
      </div>`;
    div.addEventListener("click", () => {
      if (activeTaxKey === key) {
        closeDrawer();
        return;
      }
      activeTaxKey = key;
      renderTaxonomy();
      renderCaseStudies();
    });
    tg.appendChild(div);
  });

  const overlay = document.getElementById("drawer-overlay");
  if (!activeTaxKey) {
    detail.className = "tax-drawer";
    detail.innerHTML = "";
    detail.setAttribute("aria-hidden", "true");
    detail.removeAttribute("aria-labelledby");
    detail.removeAttribute("aria-describedby");
    document.body.classList.remove("drawer-open");
    if (overlay) {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }
    return;
  }

  const selected = TAXON.find((a) => a.name.toLowerCase() === activeTaxKey);
  if (!selected) {
    detail.className = "tax-drawer";
    detail.innerHTML = "";
    detail.setAttribute("aria-hidden", "true");
    detail.removeAttribute("aria-labelledby");
    detail.removeAttribute("aria-describedby");
    document.body.classList.remove("drawer-open");
    if (overlay) {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }
    return;
  }

  drawerCsSlide = 0;

  const whyTasks = Object.entries(WHY_HOW)
    .filter(([, arr]) => arr.includes(activeTaxKey))
    .map(([k]) => k[0].toUpperCase() + k.slice(1));
  const whatSources = (ANN_WHAT[activeTaxKey] || []).map(
    (w) => w[0].toUpperCase() + w.slice(1),
  );
  const ensembles =
    ANN_INFO[activeTaxKey] && ANN_INFO[activeTaxKey].ens
      ? ANN_INFO[activeTaxKey].ens
      : [];
  const renderChipSet = (items, className, emptyLabel) =>
    items.length
      ? items
          .map(
            (item) =>
              `<span class="tax-chip${className ? ` ${className}` : ""}">${item}</span>`,
          )
          .join("")
      : `<span class="tax-chip tax-chip--empty">${emptyLabel}</span>`;

  const drawerCS = CS.filter((cs) =>
    cs.rows.some((r) => r.how.toLowerCase().includes(activeTaxKey)),
  );

  const slidesHtml = drawerCS.length
    ? drawerCS
        .map((cs, csIdx) => {
          const matchingRows = cs.rows.filter((r) =>
            r.how.toLowerCase().includes(activeTaxKey),
          );
          const rowsHtml = matchingRows
            .map((r) => {
              return `<div class="drawer-slide-row">
              <span class="row-why" style="color:var(--why-c)">${r.why}</span>
              <span class="row-how"><span class="row-how-lbl">Annotation used:</span> ${r.how}</span>
              ${r.note ? `<span class="row-note"><span class="row-note-lbl">What to look for:</span> ${r.note}</span>` : ""}
            </div>`;
            })
            .join("");
          return `<section class="drawer-slide${csIdx === 0 ? " active" : ""}" aria-label="Case study ${csIdx + 1} of ${drawerCS.length}" aria-hidden="${csIdx === 0 ? "false" : "true"}"${csIdx === 0 ? "" : " hidden"}>
          <img class="drawer-slide-img" src="${cs.image}" alt="${cs.label}: ${cs.chart} chart from ${cs.source}" loading="lazy"/>
          <div class="drawer-slide-meta">
            <div class="drawer-slide-title">${cs.label.replace(/Case \d\s*[:—]\s*/, "")}</div>
            <div class="drawer-slide-sub">${cs.chart} &nbsp;·&nbsp; ${cs.source}</div>
          </div>
          <div class="drawer-slide-rows">${rowsHtml}</div>
        </section>`;
        })
        .join("")
    : `<div class="drawer-slide-none">This annotation type was not directly featured in the case studies.</div>`;

  const dotsHtml = drawerCS.length > 1
    ? drawerCS
        .map(
          (_, i) =>
            `<button type="button" class="drawer-nav-dot${i === 0 ? " active" : ""}" onclick="setDrawerSlide(${i})" aria-label="Show case study ${i + 1} of ${drawerCS.length}" aria-current="${i === 0 ? "true" : "false"}"></button>`,
        )
        .join("")
    : "";

  detail.style.setProperty("--card-tint", `var(--${selected.c}-bg)`);
  detail.style.borderLeftColor = `var(--${selected.c}-c)`;
  detail.className = "tax-drawer open";
  detail.setAttribute("aria-hidden", "false");
  detail.setAttribute("aria-labelledby", "drawer-type-name");
  detail.setAttribute("aria-describedby", "drawer-type-desc");
  detail.innerHTML = `
    <div class="drawer-header">
      <div class="drawer-head-icon" style="background:var(--${selected.c}-bg);border-color:var(--${selected.c}-br);color:var(--${selected.c}-c)">${getTypeIcon(activeTaxKey)}</div>
      <div class="drawer-head-text">
        <div class="drawer-type-name" id="drawer-type-name" style="color:var(--${selected.c}-c)">${selected.name}</div>
        <div class="drawer-type-meta">${selected.n} charts &nbsp;·&nbsp; ${selected.pct}% of corpus</div>
      </div>
      <button type="button" class="drawer-close" onclick="closeDrawer()" aria-label="Close drawer">×</button>
    </div>
    <div class="drawer-body">
      <p class="drawer-desc" id="drawer-type-desc">${selected.desc}</p>
      <div class="drawer-summary-grid" aria-label="Annotation summary">
        <section class="drawer-summary-card" aria-labelledby="drawer-intent-title">
          <div class="drawer-section-lbl" id="drawer-intent-title">Why: Task Intent</div>
          <div class="drawer-chips drawer-chips--dense">${renderChipSet(whyTasks, "tax-chip--why", "Not specified")}</div>
        </section>
        <section class="drawer-summary-card" aria-labelledby="drawer-ensemble-title">
          <div class="drawer-section-lbl" id="drawer-ensemble-title">How: Common Ensembles</div>
          <div class="drawer-chips drawer-chips--dense">${renderChipSet(ensembles, "tax-chip--how", "None reported")}</div>
        </section>
      </div>
      <section class="drawer-cs-slider-wrap" aria-labelledby="drawer-case-title">
        <div class="drawer-cs-head-row">
          <span class="drawer-cs-head" id="drawer-case-title">In the Case Studies</span>
          ${
            drawerCS.length > 1
              ? `<div class="drawer-nav-inline" role="group" aria-label="Case study navigation">
                  <button type="button" class="drawer-nav-btn" id="drawer-prev" onclick="setDrawerSlide(drawerCsSlide-1)" aria-label="Previous case study" disabled>&#8249;</button>
                  <div class="drawer-nav-dots">${dotsHtml}</div>
                  <span class="drawer-nav-lbl" id="drawer-nav-lbl" aria-live="polite" aria-atomic="true">1 / ${drawerCS.length}</span>
                  <button type="button" class="drawer-nav-btn" id="drawer-next" onclick="setDrawerSlide(drawerCsSlide+1)" aria-label="Next case study">&#8250;</button>
                </div>`
              : ""
          }
        </div>
        <div class="drawer-slider" role="region" aria-label="Case study examples">${slidesHtml}</div>
      </section>
      <section class="drawer-summary-card drawer-summary-card--full" aria-labelledby="drawer-provenance-title">
        <div class="drawer-section-lbl" id="drawer-provenance-title">What: Data Provenance</div>
        <div class="drawer-chips drawer-chips--dense">${renderChipSet(whatSources, "tax-chip--what", "Not specified")}</div>
      </section>
    </div>`;

  document.body.classList.add("drawer-open");
  detail.scrollTop = 0;
  if (overlay) {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }
  requestAnimationFrame(focusDrawerClose);
}

function renderCaseStudies() {
  const csTabs = document.getElementById("cs-tabs");
  const csPanels = document.getElementById("cs-panels");
  const csStatus = document.getElementById("cs-status");
  csTabs.innerHTML = "";
  csPanels.innerHTML = "";

  if (activeCaseIndex > CS.length - 1) {
    activeCaseIndex = 0;
  }

  const activeTax = activeTaxKey
    ? TAXON.find((a) => a.name.toLowerCase() === activeTaxKey)
    : null;
  const activeCase = CS[activeCaseIndex];
  if (csStatus && activeCase) {
    const matchCount = activeTax
      ? activeCase.rows.filter((r) =>
          r.how.toLowerCase().includes(activeTaxKey),
        ).length
      : activeCase.rows.length;
    const rowWord = matchCount === 1 ? "row" : "rows";
    csStatus.textContent = activeTax
      ? `${matchCount} ${rowWord} match ${activeTax.name}.`
      : `${matchCount} annotation ${rowWord} shown.`;
  }

  CS.forEach((cs, i) => {
    const tabId = `cs-tab-${i}`;
    const panelId = `cs-panel-${i}`;
    const shortLabel = cs.label.replace(/Case \d\s*[:—]\s*/, "");
    const caseLabel = `Case ${i + 1}`;
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "cs-tab" + (i === activeCaseIndex ? " active" : "");
    tab.id = tabId;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", i === activeCaseIndex ? "true" : "false");
    tab.setAttribute("tabindex", i === activeCaseIndex ? "0" : "-1");
    tab.setAttribute("aria-controls", panelId);
    tab.setAttribute("aria-label", `${cs.label}. ${cs.chart}. ${cs.source}.`);
    tab.innerHTML = `
      <span class="cs-tab-k">${caseLabel}</span>
      <span class="cs-tab-title">${shortLabel}</span>`;
    tab.onclick = () => selectCS(i, true);
    tab.addEventListener("keydown", (e) => handleCaseTabKeydown(e, i));
    csTabs.appendChild(tab);

    const rows = cs.rows
      .map((r) => {
        const match = activeTaxKey
          ? r.how.toLowerCase().includes(activeTaxKey)
          : false;
        const marker = match && activeTax
          ? `<span class="cs-row-tag">Uses ${activeTax.name}</span>`
          : "";
        return `<article class="cs-breakdown-row${match ? " cs-breakdown-row--hit" : ""}" role="listitem">
          <div class="cs-breakdown-meta">
            <span class="cs-dim cs-dim--why"><span class="cs-dim-k">Why</span><span class="cs-dim-v">${r.why}</span></span>
            <span class="cs-dim cs-dim--how"><span class="cs-dim-k">How</span><span class="cs-dim-v">${r.how}</span></span>
            <span class="cs-dim cs-dim--what"><span class="cs-dim-k">What</span><span class="cs-dim-v">${r.what}</span></span>
          </div>
          <p class="cs-breakdown-note">${r.note}</p>
          ${marker}
        </article>`;
      })
      .join("");
    const figureMarkup = cs.image
      ? `<img src="${cs.image}" alt="${cs.imageAlt || cs.label}" loading="lazy"/>`
      : cs.svg;
    const figureNote = cs.figureNote
      ? `<p class="cs-figure-note">${cs.figureNote}</p>`
      : "";
    const insights =
      Array.isArray(cs.takeaways) && cs.takeaways.length
        ? `
        <div class="cs-insights">
          <h5>Main Points</h5>
          <ul>${cs.takeaways.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>`
        : "";
    const focusNoteClass = activeTax
      ? "cs-focus-note cs-focus-note--active"
      : "cs-focus-note";
    const focusNote = activeTax
      ? `<p class="${focusNoteClass}">Rows that use ${activeTax.name} are highlighted.</p>`
      : `<p class="${focusNoteClass}">Each row explains the annotation task, form, source, and what to look for in the chart.</p>`;

    const panel = document.createElement("div");
    panel.className = "cs-panel" + (i === activeCaseIndex ? " active" : "");
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId);
    panel.setAttribute("aria-hidden", i === activeCaseIndex ? "false" : "true");
    panel.hidden = i !== activeCaseIndex;
    panel.innerHTML = `
      <article class="cs-panel-shell">
        <div class="cs-panel-head">
          <div class="cs-header-row">
            <span class="cs-badge" style="background:var(--how-bg);border-color:var(--how-border);color:var(--how-c)">${cs.chart}</span>
            <span class="cs-badge" style="background:var(--bg-alt);border-color:var(--border-s);color:var(--muted2)">${cs.source}</span>
          </div>
          <p class="cs-panel-desc">${cs.desc}</p>
        </div>
        <div class="cs-panel-grid">
          <figure class="cs-card cs-card--figure">
            <div class="cs-card-head">Annotated Chart</div>
            <div class="cs-fig">${figureMarkup}</div>
            ${figureNote}
            ${insights}
          </figure>
          <section class="cs-card cs-card--analysis" aria-label="Annotation breakdown">
            <div class="cs-analysis-head">
              <div>
                <div class="cs-card-head">Annotation Breakdown</div>
                ${focusNote}
              </div>
            </div>
            <div class="cs-breakdown" role="list">${rows}</div>
          </section>
        </div>
      </article>`;
    csPanels.appendChild(panel);
  });
}

function handleCaseTabKeydown(e, i) {
  if (!CS.length) return;
  let nextIndex = null;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    nextIndex = (i + 1) % CS.length;
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    nextIndex = (i - 1 + CS.length) % CS.length;
  } else if (e.key === "Home") {
    nextIndex = 0;
  } else if (e.key === "End") {
    nextIndex = CS.length - 1;
  }
  if (nextIndex === null) return;
  e.preventDefault();
  selectCS(nextIndex, true);
}

function selectCS(i, focusTab = false) {
  activeCaseIndex = i;
  renderCaseStudies();
  if (focusTab) {
    document.getElementById(`cs-tab-${i}`)?.focus();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeTaxKey) {
    closeDrawer();
    return;
  }

  if (e.key !== "Tab" || !activeTaxKey) return;

  const detail = document.getElementById("tax-drawer");
  const focusable = [...detail.querySelectorAll(
    'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
  )].filter((el) => !el.disabled && !el.hidden && el.getClientRects().length);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const inside = detail.contains(active);

  if (e.shiftKey) {
    if (!inside || active === first) {
      e.preventDefault();
      last.focus();
    }
    return;
  }

  if (!inside || active === last) {
    e.preventDefault();
    first.focus();
  }
});

const animFills = () => {
  document.querySelectorAll(".tax-fill,.ann-fill").forEach((b) => {
    if (b.getBoundingClientRect().top < window.innerHeight - 40) {
      b.style.width = b.dataset.w + "%";
    }
  });
};
window.addEventListener("scroll", animFills, { passive: true });
setTimeout(animFills, 500);

function scrollTo_(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function copyBib() {
  navigator.clipboard
    .writeText(document.getElementById("bibtext").textContent)
    .then(() => {
      const buttons = document.querySelectorAll("[data-copy-bib]");
      buttons.forEach((b) => {
        b.textContent = "Copied";
      });
      setTimeout(() => {
        buttons.forEach((b) => {
          b.textContent = "Copy BibTeX";
        });
      }, 2200);
    });
}

const SECS = [
  "overview",
  "design-space",
  "methodology",
  "taxonomy",
  "case-studies",
  "cite",
];
const dots = document.querySelectorAll(".nav-dot");
dots.forEach((d) =>
  d.addEventListener("click", () => {
    document
      .getElementById(d.dataset.t)
      ?.scrollIntoView({ behavior: "smooth" });
  }),
);
const navLinks = document.querySelectorAll(".top__nav a");

const btt = document.getElementById("back-to-top");
if (btt) {
  btt.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

window.addEventListener(
  "scroll",
  () => {
    let active = 0;
    SECS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55)
        active = i;
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === active));
    navLinks.forEach((a) => {
      const href = a.getAttribute("href")?.replace("#", "");
      a.classList.toggle("active", href === SECS[active]);
    });
    if (btt) btt.classList.toggle("visible", window.scrollY > 400);
  },
  { passive: true },
);

async function loadData() {
  try {
    const res = await fetch("./data.json");
    if (!res.ok) {
      throw new Error(`Failed to load data.json: ${res.status}`);
    }

    const data = await res.json();
    WHY_HOW = data.WHY_HOW || { ...FALLBACK_WHY_HOW };
    ANN_WHAT = data.ANN_WHAT || { ...FALLBACK_ANN_WHAT };
    WHY_INFO = data.WHY_INFO || {};
    ANN_INFO = data.ANN_INFO || { ...FALLBACK_ANN_INFO };
    TAXON = data.TAXON || [...FALLBACK_TAXON];
    CS = data.CS || [];
    return true;
  } catch (err) {
    console.warn(
      "Using fallback taxonomy data because data.json was not loaded.",
      err,
    );
    WHY_HOW = { ...FALLBACK_WHY_HOW };
    ANN_WHAT = { ...FALLBACK_ANN_WHAT };
    WHY_INFO = {};
    ANN_INFO = { ...FALLBACK_ANN_INFO };
    TAXON = [...FALLBACK_TAXON];
    CS = [];
    return false;
  }
}

async function init() {
  await loadData();
  renderTaxonomy();
  renderCaseStudies();
  animFills();
}

init();
