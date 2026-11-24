// ============================================================
// Shared header/footer loader
// Runs as a <script type="module"> — module scripts execute in
// document order, after HTML parsing, before DOMContentLoaded fires,
// and the browser WAITS for any top-level await inside them before
// firing DOMContentLoaded. That guarantees the header/footer markup
// (and #navToggle, #langToggle, #navLinks, #year, etc.) already exist
// in the DOM by the time script.js's DOMContentLoaded handler runs.
// ============================================================
import { SITE_INFO } from "./site-info.js";

async function loadPartial(placeholderId, url) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  try {
    const res = await fetch(url, { cache: "no-store" });
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
document.querySelectorAll('.nav-links a[data-page], .footer-links a[data-page], .footer-legal-links a[data-page]').forEach(a => {
  if (a.dataset.page === currentPage) a.classList.add("active");
});

// ---- "More" dropdown (desktop) ----
const more = document.getElementById("navMore");
const moreBtn = document.getElementById("navMoreBtn");
if (more && moreBtn) {
  if (more.querySelector("a.active")) moreBtn.classList.add("active");
  const setOpen = open => {
    more.classList.toggle("open", open);
    moreBtn.setAttribute("aria-expanded", String(open));
  };
  moreBtn.addEventListener("click", e => { e.stopPropagation(); setOpen(!more.classList.contains("open")); });
  document.addEventListener("click", e => { if (!more.contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { setOpen(false); moreBtn.focus(); } });
}

// ---- Footer details come from site-info.js (empty values are hidden) ----
const I = SITE_INFO || {};
const show = (id, fn) => { const el = document.getElementById(id); if (el) { fn(el); el.hidden = false; } };
if (I.registrationNumber) {
  show("footerReg", el => {
    el.textContent = "Registration no. " + I.registrationNumber + (I.registeredWith ? " · " + I.registeredWith : "");
  });
}
if (I.address) show("footerAddress", el => { el.querySelector("span").textContent = I.address; });
if (I.phone)   show("footerPhone",   el => { const a = el.querySelector("a"); a.textContent = I.phone; a.href = I.phoneLink || ("tel:" + I.phone.replace(/[^+\d]/g, "")); });
if (I.email)   show("footerEmail",   el => { const a = el.querySelector("a"); a.textContent = I.email; a.href = "mailto:" + I.email; });
const socialWrap = document.getElementById("footerSocial");
if (socialWrap) {
  (I.social || []).filter(s => s && s.url).forEach(s => {
    const a = document.createElement("a");
    a.href = s.url; a.target = "_blank"; a.rel = "noopener";
    a.setAttribute("aria-label", s.label); a.title = s.label;
    const i = document.createElement("i"); i.className = s.icon;
    a.appendChild(i); socialWrap.appendChild(a);
  });
}

// Remove placeholder social icons that point nowhere (href="#") on page bodies
document.querySelectorAll('.social-links a[href="#"]').forEach(a => a.remove());
