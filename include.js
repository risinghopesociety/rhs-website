// ============================================================
// Shared header/footer loader
// Runs as a <script type="module"> — module scripts execute in
// document order, after HTML parsing, before DOMContentLoaded fires,
// and the browser WAITS for any top-level await inside them before
// firing DOMContentLoaded. That guarantees the header/footer markup
// (and #navToggle, #langToggle, #navLinks, #year, etc.) already exist
// in the DOM by the time script.js's DOMContentLoaded handler runs.
// ============================================================

async function loadPartial(placeholderId, url) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  try {
    const res = await fetch(url);
    el.innerHTML = await res.text();
  } catch (e) {
    console.error("Failed to load " + url, e);
  }
}

await Promise.all([
  loadPartial("site-header", "header.html"),
  loadPartial("site-footer", "footer.html")
]);

// Highlight the current page's nav link (set window.PAGE_ID before this
// script runs, e.g. <script>window.PAGE_ID = "home";</script>)
const currentPage = window.PAGE_ID || "";
document.querySelectorAll('.nav-links a[data-page], .footer-links a[data-page]').forEach(a => {
  if (a.dataset.page === currentPage) a.classList.add("active");
});
