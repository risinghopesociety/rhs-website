/* ==========================================================================
   Motion layer — scroll reveals, glossy button highlight, nav shadow.
   Pure progressive enhancement: if this file fails or the visitor prefers
   reduced motion, the site simply shows everything with no animation.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1) "page-ready": start the hero entrance once the loader is gone ---- */
  function ready() { root.classList.add("page-ready"); }
  var loader = document.getElementById("pageLoader");
  if (!loader || root.classList.contains("no-loader")) {
    ready();
  } else {
    var lo = new MutationObserver(function () {
      if (loader.classList.contains("done") || !document.body.contains(loader)) { ready(); lo.disconnect(); }
    });
    lo.observe(loader, { attributes: true, attributeFilter: ["class"] });
    setTimeout(ready, 3500); // safety net
  }

  /* ---- 2) Navbar: gains a soft shadow once the page scrolls ---- */
  function navState() {
    var nav = document.getElementById("navbar");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", navState, { passive: true });
  window.addEventListener("load", navState);
  setTimeout(navState, 600);

  /* ---- 3) Glossy buttons: the highlight follows the pointer ---- */
  document.addEventListener("pointermove", function (e) {
    var b = e.target.closest && e.target.closest(".btn-primary, .btn-donate");
    if (!b) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    b.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
  }, { passive: true });

  if (reduce || !("IntersectionObserver" in window)) return;
  root.classList.add("js-motion");

  /* ---- 4) Scroll reveal with stagger (also catches cards loaded later) ---- */
  var SEL = [
    ".section-head", ".about-text", ".about-card", ".svc-card", ".stat-card", ".use-item", ".use-actions",
    ".bank-card", ".donate-note", ".team-card", ".news-card", ".story-card", ".work-card", ".work-stat",
    ".form-card", ".contact-info", ".contact-form-wrap", ".carousel-heading", ".hero-carousel-wrap",
    ".footer-col", ".legal-wrap > *", ".cert-card"
  ].join(",");

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      io.unobserve(el);
      el.classList.add("rv-in");
      // hand the element back to its normal CSS once the entrance has finished
      setTimeout(function () {
        el.classList.remove("rv", "rv-in");
        el.style.removeProperty("--rv-d");
      }, 1200);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function prep(el) {
    if (el.__rv) return;
    el.__rv = true;
    var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(SEL); }) : [el];
    var i = Math.max(0, sibs.indexOf(el));
    el.style.setProperty("--rv-d", Math.min(i, 8) * 70 + "ms");
    el.classList.add("rv");
    io.observe(el);
  }
  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.matches(SEL)) prep(node);
    node.querySelectorAll(SEL).forEach(prep);
  }

  scan(document.body);
  var pending = false, queue = [];
  new MutationObserver(function (muts) {
    muts.forEach(function (m) { m.addedNodes.forEach(function (n) { queue.push(n); }); });
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; queue.splice(0).forEach(scan); });
  }).observe(document.body, { childList: true, subtree: true });
})();
