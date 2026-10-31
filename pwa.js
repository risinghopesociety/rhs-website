/* RHS — "Install App" (PWA) support */
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) return;                                    // already installed — show nothing

  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let deferred = null;

  function makeButton() {
    if (document.getElementById("pwaInstallBtn")) return;
    const b = document.createElement("button");
    b.id = "pwaInstallBtn";
    b.type = "button";
    b.className = "pwa-install-btn";
    b.innerHTML = '<i class="fa-solid fa-download"></i> <span>Install App</span>';
    b.addEventListener("click", onClick);
    document.body.appendChild(b);
  }

  async function onClick() {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) {}
      deferred = null;
      const b = document.getElementById("pwaInstallBtn");
      if (b) b.remove();
    } else {
      showHelp();
    }
  }

  function showHelp() {
    if (document.getElementById("pwaHelp")) return;
    const m = document.createElement("div");
    m.id = "pwaHelp";
    m.className = "pwa-help";
    const steps = isIOS
      ? '<li>Safari mein ye website kholein</li><li>Neeche <b>Share</b> <i class="fa-solid fa-arrow-up-from-bracket"></i> button dabayein</li><li><b>Add to Home Screen</b> chunein</li><li><b>Add</b> dabayein — app aapki home screen par aa jayegi</li>'
      : '<li>Browser ke <b>⋮ menu</b> (upar kone mein) par tap karein</li><li><b>Install app</b> ya <b>Add to Home screen</b> chunein</li><li><b>Install</b> dabayein — app aapki home screen par aa jayegi</li>';
    m.innerHTML = '<div class="pwa-help-box"><button class="pwa-help-x" aria-label="Close">&times;</button>' +
      '<img src="images/icons/icon-192.png" alt="RHS" width="64" height="64">' +
      '<h3>Rising Hope Society App</h3><p>Is website ko app ki tarah install karein:</p><ol>' + steps + '</ol></div>';
    m.addEventListener("click", e => { if (e.target === m || e.target.closest(".pwa-help-x")) m.remove(); });
    document.body.appendChild(m);
  }

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferred = e;
    makeButton();
  });
  window.addEventListener("appinstalled", () => {
    const b = document.getElementById("pwaInstallBtn");
    if (b) b.remove();
  });

  // iOS Safari never fires beforeinstallprompt — show the button with manual steps instead
  if (isIOS) document.addEventListener("DOMContentLoaded", makeButton);
})();
