// ============================================================
// OUR WORK — public list page (data comes from Admin → Setup → Our Work)
// ============================================================
const PAGE_SIZE = 12;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let ALL = [];
let activeLoc = "all";
let query = "";
let shown = PAGE_SIZE;

function ready() {
  return new Promise(res => {
    const t = setInterval(() => { if (window.RHS && window.RHS.getWorkHistory) { clearInterval(t); res(); } }, 60);
  });
}

function coverOf(w) {
  if (w.images && w.images.length) return RHS.imgUrl(w.images[0], 700);
  if (w.youtubeId) return `https://img.youtube.com/vi/${encodeURIComponent(w.youtubeId)}/hqdefault.jpg`;
  return "";
}

function cardHTML(w, i) {
  const cover = coverOf(w);
  const imgCount = (w.images || []).length;
  const url = "work-detail.html?id=" + encodeURIComponent(w.id);
  return `
  <article class="work-card" style="animation-delay:${Math.min(i, 12) * 60}ms">
    <a class="work-media" href="${url}" target="_blank" rel="noopener" aria-label="${esc(w.title)}">
      ${cover ? `<img src="${esc(cover)}" alt="${esc(w.title)}" loading="lazy">` : `<span class="work-ph"><i class="fa-solid fa-hand-holding-heart"></i></span>`}
      ${w.youtubeId ? `<span class="work-play"><i class="fa-solid fa-play"></i></span>` : ""}
      ${w.year ? `<span class="work-badge year"><i class="fa-regular fa-calendar"></i> ${esc(w.year)}</span>` : ""}
      ${imgCount > 1 ? `<span class="work-badge count"><i class="fa-regular fa-images"></i> ${imgCount}</span>` : ""}
    </a>
    <div class="work-body">
      ${w.location ? `<span class="work-loc"><i class="fa-solid fa-location-dot"></i> ${esc(w.location)}</span>` : ""}
      <h3 class="work-title">${esc(w.title)}</h3>
      <p class="work-text">${esc(w.detail)}</p>
      <a class="btn btn-primary work-view" href="${url}" target="_blank" rel="noopener">
        <span data-ur="کام کی تفصیل دیکھیں">View Work History</span> <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>`;
}

function renderStats() {
  const locs = new Set(ALL.map(w => (w.location || "").trim().toLowerCase()).filter(Boolean));
  const photos = ALL.reduce((n, w) => n + (w.images || []).length, 0);
  const videos = ALL.filter(w => w.youtubeId).length;
  const box = $("workStats");
  box.innerHTML = `
    <div class="work-stat"><b>${ALL.length}</b><span>Projects</span></div>
    <div class="work-stat"><b>${locs.size}</b><span>Locations</span></div>
    <div class="work-stat"><b>${photos}</b><span>Photos</span></div>
    <div class="work-stat"><b>${videos}</b><span>Videos</span></div>`;
  box.style.display = "";
}

function renderFilters() {
  const map = new Map();
  ALL.forEach(w => { const l = (w.location || "").trim(); if (l) map.set(l.toLowerCase(), l); });
  const locs = [...map.values()].sort((a, b) => a.localeCompare(b));
  const box = $("workFilters");
  if (locs.length < 2) { box.innerHTML = ""; return; }
  box.innerHTML = `<button class="work-chip ${activeLoc === "all" ? "active" : ""}" data-loc="all">All</button>` +
    locs.map(l => `<button class="work-chip ${activeLoc === l.toLowerCase() ? "active" : ""}" data-loc="${esc(l.toLowerCase())}"><i class="fa-solid fa-location-dot" style="color:inherit;opacity:.7"></i> ${esc(l)}</button>`).join("");
}

function filtered() {
  const q = query.trim().toLowerCase();
  return ALL.filter(w => {
    if (activeLoc !== "all" && (w.location || "").trim().toLowerCase() !== activeLoc) return false;
    if (!q) return true;
    return [w.title, w.detail, w.location, w.year].some(v => String(v || "").toLowerCase().includes(q));
  });
}

function render() {
  const list = filtered();
  const grid = $("workGrid");
  if (!list.length) {
    grid.innerHTML = `<div class="work-empty"><i class="fa-regular fa-folder-open"></i><p>${ALL.length ? "No work found for your search." : "Work history will be published here soon."}</p></div>`;
    $("workMoreWrap").style.display = "none";
    return;
  }
  grid.innerHTML = list.slice(0, shown).map(cardHTML).join("");
  $("workMoreWrap").style.display = list.length > shown ? "" : "none";
}

function hideLoader() { document.getElementById("pageLoader")?.classList.add("done"); }

(async function init() {
  await ready();
  try {
    const [page, res] = await Promise.all([RHS.getWorkPageContent(), RHS.getWorkHistory()]);
    if (page) {
      if (page.eyebrow) $("workEyebrow").textContent = page.eyebrow;
      if (page.heading) $("workHeading").textContent = page.heading;
      if (page.subheading) $("workSub").textContent = page.subheading;
    }
    if (!res.success) {
      $("workGrid").innerHTML = `<div class="work-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load work history. Please refresh and try again.</p></div>`;
    } else {
      ALL = res.works;
      if (ALL.length) { renderStats(); renderFilters(); $("workToolbar").style.display = ""; }
      render();
    }
  } catch (e) {
    console.error(e);
    $("workGrid").innerHTML = `<div class="work-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Something went wrong. Please refresh.</p></div>`;
  }
  hideLoader();
})();

$("workSearch").addEventListener("input", e => { query = e.target.value; shown = PAGE_SIZE; render(); });
$("workFilters").addEventListener("click", e => {
  const b = e.target.closest(".work-chip"); if (!b) return;
  activeLoc = b.dataset.loc; shown = PAGE_SIZE; renderFilters(); render();
});
$("workMoreBtn").addEventListener("click", () => { shown += PAGE_SIZE; render(); });
