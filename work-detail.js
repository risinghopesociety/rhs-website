// ============================================================
// OUR WORK — detail page (work-detail.html?id=...)
// ============================================================
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Close this page: closes the tab if it was opened from the list,
// otherwise (opened directly / same tab) goes back to the Our Work page.
window.closeWork = function () {
  window.close();
  setTimeout(() => {
    if (history.length > 1 && document.referrer.includes("our-work")) history.back();
    else location.href = "our-work.html";
  }, 200);
};

function ready() {
  return new Promise(res => {
    const t = setInterval(() => { if (window.RHS && window.RHS.getWork) { clearInterval(t); res(); } }, 60);
  });
}

let IMAGES = [];
let idx = 0;

function state(icon, msg) {
  $("wdRoot").innerHTML = `<div class="wd-state"><i class="fa-solid ${icon}"></i><p>${esc(msg)}</p>
    <div class="wd-actions"><button class="wd-close" onclick="closeWork()"><i class="fa-solid fa-xmark"></i> Close</button></div></div>`;
}

function render(w) {
  document.title = w.title + " — Rising Hope Society";
  IMAGES = (w.images || []).filter(Boolean);
  const gallery = IMAGES.length ? `
    <section class="wd-card">
      <h3><i class="fa-regular fa-images"></i> Photo Gallery (${IMAGES.length})</h3>
      <div class="wd-gallery">
        ${IMAGES.map((u, i) => `<button type="button" data-i="${i}" aria-label="Open photo ${i + 1}"><img src="${esc(RHS.imgUrl(u, 700))}" alt="${esc(w.title)} — photo ${i + 1}" loading="lazy"></button>`).join("")}
      </div>
    </section>` : "";
  const video = w.youtubeId ? `
    <div class="wd-video">
      <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(w.youtubeId)}?rel=0" title="${esc(w.title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
    </div>` : "";

  $("wdRoot").innerHTML = `
    <header class="wd-head">
      <span class="eyebrow">Work History</span>
      <h1>${esc(w.title)}</h1>
      <div class="wd-meta">
        ${w.location ? `<span class="wd-chip"><i class="fa-solid fa-location-dot"></i> ${esc(w.location)}</span>` : ""}
        ${w.year ? `<span class="wd-chip"><i class="fa-regular fa-calendar"></i> ${esc(w.year)}</span>` : ""}
        ${IMAGES.length ? `<span class="wd-chip"><i class="fa-regular fa-images"></i> ${IMAGES.length} photo${IMAGES.length > 1 ? "s" : ""}</span>` : ""}
        ${w.youtubeId ? `<span class="wd-chip"><i class="fa-brands fa-youtube"></i> Video</span>` : ""}
      </div>
    </header>
    ${video}
    <section class="wd-card">
      <h3><i class="fa-solid fa-circle-info"></i> About this work</h3>
      <p class="wd-detail">${esc(w.detail)}</p>
    </section>
    ${gallery}
    <div class="wd-actions">
      <button class="btn btn-ghost" id="wdShare" style="color:var(--teal)"><i class="fa-solid fa-share-nodes"></i> Share</button>
      <button class="wd-close" onclick="closeWork()"><i class="fa-solid fa-xmark"></i> Close</button>
    </div>`;

  $("wdShare").addEventListener("click", async () => {
    const data = { title: w.title, text: w.title + " — Rising Hope Society", url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); $("wdShare").innerHTML = '<i class="fa-solid fa-check"></i> Link copied'; }
    } catch (e) {}
  });
}

/* ---------- Lightbox ---------- */
function showImg() {
  $("lbImg").src = RHS.imgUrl(IMAGES[idx], 1600);
  $("lbCount").textContent = `${idx + 1} / ${IMAGES.length}`;
  const multi = IMAGES.length > 1;
  $("lbPrev").style.display = $("lbNext").style.display = multi ? "" : "none";
}
function openLb(i) { idx = i; showImg(); $("wdLightbox").classList.add("open"); document.body.style.overflow = "hidden"; }
function closeLb() { $("wdLightbox").classList.remove("open"); document.body.style.overflow = ""; }
function step(d) { idx = (idx + d + IMAGES.length) % IMAGES.length; showImg(); }

$("wdRoot").addEventListener("click", e => {
  const b = e.target.closest(".wd-gallery button"); if (b) openLb(+b.dataset.i);
});
$("lbClose").onclick = closeLb;
$("lbPrev").onclick = () => step(-1);
$("lbNext").onclick = () => step(1);
$("wdLightbox").addEventListener("click", e => { if (e.target === $("wdLightbox")) closeLb(); });
document.addEventListener("keydown", e => {
  if (!$("wdLightbox").classList.contains("open")) { if (e.key === "Escape") closeWork(); return; }
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
let touchX = null;
$("wdLightbox").addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
$("wdLightbox").addEventListener("touchend", e => {
  if (touchX === null || IMAGES.length < 2) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  touchX = null;
});

(async function init() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return state("fa-circle-question", "No work selected.");
  await ready();
  const res = await RHS.getWork(id);
  if (res.success) render(res.work);
  else if (res.notFound) state("fa-folder-open", "This work record was not found. It may have been removed.");
  else state("fa-triangle-exclamation", "Could not load this work. Please check your connection and try again.");
})();
