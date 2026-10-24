/* ============================================================
   RHS — Auto Urdu / English text layout (public website)
   • Every LINE of admin-typed text picks its own direction:
     Urdu line → right-to-left (Nastaliq font), English line → left-to-right.
   • Enter (new line) typed in the admin dashboard is kept on the website.
   • Works for text set by any script (also re-runs after language toggle).
   ============================================================ */
(function () {
  const RTL_CH = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g;
  const LTR_CH = /[A-Za-z\u00C0-\u024F]/g;
  const HAS_RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

  // Full text blocks: split into lines, each line gets its own direction
  const FULL = "#donateDetail,#donateSubheading,#heroText,#teamMatter,#workSub,#detailModalText,.wd-detail,.bio,.rt";
  // Clamped previews (3-line cards): keep as one block, choose direction by majority
  const PREVIEW = ".news-card-text,.story-card-text,.work-text";

  function dirOf(s) {
    const r = (s.match(RTL_CH) || []).length, l = (s.match(LTR_CH) || []).length;
    return r > l ? "rtl" : "ltr";
  }

  function renderFull(el) {
    if (el.children.length) return;                      // already processed / contains markup
    const txt = el.textContent;
    if (!txt || !txt.trim()) return;
    const centered = getComputedStyle(el).textAlign === "center";
    const frag = document.createDocumentFragment();
    txt.split(/\r?\n/).forEach(line => {
      const d = document.createElement("div");
      if (!line.trim()) { d.className = "rt-gap"; }
      else {
        d.className = "rt-line" + (centered ? " rt-center" : "");
        d.setAttribute("dir", dirOf(line));
        d.textContent = line;
      }
      frag.appendChild(d);
    });
    el.textContent = "";
    el.appendChild(frag);
    el.classList.add("rt-done");
  }

  function renderPreview(el) {
    if (el.children.length) return;
    const txt = el.textContent;
    if (!txt || !txt.trim()) return;
    el.setAttribute("dir", dirOf(txt));
    el.classList.add("rt-preview");
  }

  // Short leaf texts (titles, names, labels) that contain Urdu → auto direction
  function renderLeaf(el) {
    if (el.children.length || el.hasAttribute("dir")) return;
    const t = el.textContent;
    if (t && HAS_RTL.test(t)) el.setAttribute("dir", "auto");
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    const run = (list, fn) => {
      if (root.matches && root.matches(list)) fn(root);
      root.querySelectorAll(list).forEach(fn);
    };
    run(FULL, renderFull);
    run(PREVIEW, renderPreview);
    if (!root.children.length) renderLeaf(root);
    root.querySelectorAll("h1,h2,h3,h4,p,span,li,a,label,div").forEach(renderLeaf);
  }

  let queued = false;
  const pending = new Set();
  function flush() {
    queued = false;
    pending.forEach(n => { if (n.isConnected) scan(n); });
    pending.clear();
  }
  function schedule(n) {
    if (n && n.nodeType === 3) n = n.parentElement;
    if (!n || n.nodeType !== 1) return;
    pending.add(n);
    if (!queued) { queued = true; requestAnimationFrame(flush); }
  }

  function start() {
    scan(document.body);
    new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(schedule);
        if (m.type === "characterData") schedule(m.target);
        // text replaced inside an existing block (textContent = ...)
        if (m.type === "childList" && m.target.nodeType === 1) schedule(m.target);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);

  window.RHSText = { scan };
})();
