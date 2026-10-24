/* ============================================================
   RHS Admin — Urdu / English writing helper
   Adds a small "Auto | Left (English) | Right (اردو)" switch above every
   multi-line text box. It controls how the text looks while you type.
   On the website each LINE is shown in its own direction automatically,
   and Enter (new line) is kept exactly as typed.
   ============================================================ */
(function () {
  const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

  function setDir(ta, mode) {
    ta.dataset.rtMode = mode;
    if (mode === "auto") { ta.setAttribute("dir", "auto"); ta.style.textAlign = ""; }
    else { ta.setAttribute("dir", mode); ta.style.textAlign = mode === "rtl" ? "right" : "left"; }
    ta.classList.toggle("rt-ta-urdu", mode === "rtl" || (mode === "auto" && RTL.test(ta.value)));
  }

  function enhance(ta) {
    if (ta.dataset.rtReady) return;
    ta.dataset.rtReady = "1";
    const bar = document.createElement("div");
    bar.className = "rt-tools";
    bar.innerHTML =
      '<span class="rt-tools-lbl"><i class="fa fa-language"></i> Text direction</span>' +
      '<button type="button" data-m="auto" class="on" title="Each line follows its own language">Auto</button>' +
      '<button type="button" data-m="ltr" title="Write from the left (English)">Left &rarr; English</button>' +
      '<button type="button" data-m="rtl" title="Write from the right (Urdu)">&larr; Right اردو</button>' +
      '<span class="rt-tools-hint">Enter = new line</span>';
    ta.parentNode.insertBefore(bar, ta);
    bar.addEventListener("click", e => {
      const b = e.target.closest("button[data-m]"); if (!b) return;
      bar.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      setDir(ta, b.dataset.m); ta.focus();
    });
    ta.addEventListener("input", () => { if (ta.dataset.rtMode === "auto") setDir(ta, "auto"); });
    // when admin.js fills the box programmatically, re-check Urdu font
    const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    if (desc && desc.set) {
      Object.defineProperty(ta, "value", {
        configurable: true, get() { return desc.get.call(this); },
        set(v) { desc.set.call(this, v); if (this.dataset.rtMode === "auto") setDir(this, "auto"); }
      });
    }
    setDir(ta, "auto");
  }

  function scan(root) { (root || document).querySelectorAll("textarea").forEach(enhance); }
  document.addEventListener("DOMContentLoaded", () => {
    scan(document);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) { if (n.tagName === "TEXTAREA") enhance(n); else scan(n); }
    }))).observe(document.body, { childList: true, subtree: true });
  });
})();
