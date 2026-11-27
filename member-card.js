/* ============================================================
   RHS Membership Card — ONE design used everywhere
   (online view, Smart Card PNG, PDF). CNIC / driving-licence size
   (ID-1: 85.6 × 53.98 mm). Designed on a 1011 × 638 px canvas.
   Exposes: window.RHSCard = { mount, downloadPNG, downloadPDF }
   ============================================================ */
(function () {
  const W = 1011, H = 638;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const val = v => (v !== undefined && v !== null && String(v).trim() !== "") ? esc(v) : "—";
  const ngo = () => window.NGO || {};

  function verifyUrl() { return `${location.origin}${location.pathname}#verify`; }

  function issueDate(m) {
    const raw = m.timestamp || "";
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("-");
      return new Date(+yyyy, +mm - 1, +dd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }
    return raw || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  /* ---------- status colours (light chip; the word itself carries the meaning in B&W) ---------- */
  const STATUS = {
    ACTIVE:  { dot: "#1fa35a", bg: "#e9f8ef", bd: "#1f9d57", tx: "#0f5f33" },
    BANNED:  { dot: "#d9483a", bg: "#fdeceb", bd: "#d9483a", tx: "#8f1d12" },
    EXPIRED: { dot: "#e07b2a", bg: "#fff2e6", bd: "#e07b2a", tx: "#8a4310" },
    OTHER:   { dot: "#d9a21b", bg: "#fff8df", bd: "#d9a21b", tx: "#7a5a07" }
  };
  function statusInfo(m) {
    const st = String(m.status || "Active").toUpperCase();
    return Object.assign({ label: st }, STATUS[st] || STATUS.OTHER);
  }

  function nameSize(n) { n = String(n || ""); return n.length > 38 ? 24 : n.length > 30 ? 28 : n.length > 22 ? 34 : 42; }
  // back-side values: shrink long text so rows never collide with the terms line
  function oneLineSize(v) { const l = String(v || "").length; return l > 50 ? 15 : l > 42 ? 17 : l > 34 ? 19 : l > 28 ? 21 : 24; }
  function addrSize(v) { const l = String(v || "").length; return l > 100 ? 19 : l > 70 ? 21 : 24; }
  function commentSize(c) { c = String(c || ""); return c.length > 50 ? 16 : c.length > 36 ? 21 : 28; }

  /* faint security pattern (same maths is used for the PNG/PDF canvas) */
  function guilY(i, x) {
    const base = 118 + i * 12.5, A = 9 + (i % 7) * 1.4, f = 0.018 + (i % 5) * 0.0016, ph = i * 0.55;
    return base + A * Math.sin(x * f + ph) + (A * 0.6) * Math.sin(x * f * 2.3 - ph);
  }
  let _guil = "";
  function guilHTML() {
    if (_guil) return _guil;
    let d = "";
    for (let i = 0; i < 46; i++) {
      let p = "";
      for (let x = 0; x <= W; x += 9) p += (x ? "L" : "M") + x + " " + guilY(i, x).toFixed(1) + " ";
      d += `<path d="${p}" fill="none" stroke="#e0245a" stroke-opacity=".065" stroke-width=".7"/>`;
    }
    return (_guil = `<svg class="rc-guil" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${d}</svg>`);
  }
  const ARC_R = [[30, .20], [58, .17], [86, .14], [114, .11], [142, .08]];
  const ARCS = `<svg class="rc-arcs" viewBox="0 0 260 260"><g fill="none" stroke="#ff385c">${ARC_R.map(([r, o]) => `<circle cx="130" cy="130" r="${r}" stroke-opacity="${o}" stroke-width="1.3"/>`).join("")}</g></svg>`;
  const SEAL_TEXT = "RISING HOPE SOCIETY · OFFICIAL ·";
  const SEAL_FS = 7.4, SEAL_LS = 1.8;
  const sealHTML = (id, back) => `<div class="rc-seal${back ? " rc-seal-back" : ""}"><svg viewBox="0 0 100 100"><defs><path id="${id}" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0"/></defs><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.2"/><circle cx="50" cy="50" r="30" fill="rgba(255,255,255,.55)" stroke="#161616" stroke-width="1"/><text font-family="Inter,Arial,sans-serif" font-weight="700" font-size="${SEAL_FS}" letter-spacing="${SEAL_LS}" fill="#161616"><textPath href="#${id}" startOffset="2%">${SEAL_TEXT}</textPath></text><path d="M37 51 l9 9 l17 -19" fill="none" stroke="#161616" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;

  const photoHTML = m => m.photo
    ? `<div class="rc-photo"><img src="${esc(window.RHS && RHS.imgUrl ? RHS.imgUrl(m.photo, 520) : m.photo)}" alt=""></div>`
    : `<div class="rc-photo"><div class="rc-ph"><svg width="90" height="90" viewBox="0 0 24 24" fill="#b3b6be"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg></div></div>`;

  const field = (l, v) => `<div class="rc-f"><label>${l}</label><span>${val(v)}</span></div>`;
  const ICON = {
    pin:  '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/></svg>',
    bag:  '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/></svg>'
  };
  const iconField = (ic, l, v, fs, clamp) => `<div class="rc-f"><i class="rc-chip">${ICON[ic]}</i><div><label>${l}</label><span class="${clamp ? "rc-clamp2" : "rc-one"}" style="font-size:${fs}px">${val(v)}</span></div></div>`;
  const sigHTML = () => ngo().signatureUrl ? `<img src="${esc(ngo().signatureUrl)}" alt="">` : "";
  const QR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#c4123f" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v1M14 20h1M18 18h3v3"/></svg>';
  const orgUpper = () => String(ngo().name || "Rising Hope Society").toUpperCase();

  function frontHTML(m) {
    const n = ngo(), st = statusInfo(m);
    const logo = n.logoUrl || "images/logo.png";
    const comment = String(m.adminComments || "").trim();
    const micro = Array(30).fill(orgUpper()).join(" · ");
    return `
    <div class="rc-card rc-front-card" style="width:${W}px;height:${H}px">
      ${guilHTML()}
      <div class="rc-glow"></div>
      <div class="rc-wm"><img src="${esc(logo)}" alt=""></div>
      <div class="rc-head">
        ${ARCS}
        <img class="rc-lg" src="${esc(logo)}" alt="">
        <div><h1>${esc(n.name || "Rising Hope Society")}</h1><small>Khairpur Tamewali · Bahawalpur</small></div>
        <div class="rc-r"><b>MEMBERSHIP CARD</b><span class="rc-pill" style="background:${st.bg};border-color:${st.bd};color:${st.tx}"><i style="background:${st.dot}"></i>${esc(st.label)}</span></div>
      </div>
      <div class="rc-rule" style="top:112px"></div>
      ${photoHTML(m)}
      ${sealHTML("rcSealF", false)}
      <div class="rc-info">
        <div class="rc-name" style="font-size:${nameSize(m.fullName)}px">${val(m.fullName)}</div>
        <div class="rc-desg">${esc(m.designation || "General Member")}</div>
        <span class="rc-type"><i></i>${esc(m.membershipType || "General Member")}</span>
        <div class="rc-grid">
          ${field("Reg No", m.registrationNo)}
          ${field("Valid Upto", m.validUpto)}
          ${field("Gender", m.gender)}
          ${field("Mobile", m.mobile)}
        </div>
      </div>
      ${comment ? `<div class="rc-cmt"><label>Remarks</label><span style="font-size:${commentSize(comment)}px">${esc(comment)}</span></div>` : ""}
      <div class="rc-fsig"><div class="rc-fsig-img">${sigHTML()}</div><div>AUTHORIZED SIGNATURE</div></div>
      <div class="rc-micro">${esc(micro)}</div>
      <div class="rc-foot">${QR_ICON}<span>Scan QR on back or visit</span> <b>${esc(verifyUrl().replace(/^https?:\/\//, ""))}</b></div>
    </div>`;
  }

  function backHTML(m) {
    const n = ngo();
    const logo = n.logoUrl || "images/logo.png";
    return `
    <div class="rc-card rc-back-card" style="width:${W}px;height:${H}px">
      ${guilHTML()}
      <div class="rc-wm"><img src="${esc(logo)}" alt=""></div>
      <div class="rc-bhead">${ARCS}<img class="rc-lg" src="${esc(logo)}" alt=""><h2>${esc(n.name || "Rising Hope Society")}</h2><small>MEMBER IDENTITY CARD</small></div>
      <div class="rc-rule" style="top:92px"></div>
      <div class="rc-bl">
        ${iconField("pin", "Address", m.address, addrSize(m.address), true)}
        ${iconField("bag", "Profession", m.profession, oneLineSize(m.profession), false)}
        ${iconField("mail", "Email", m.email, oneLineSize(m.email), false)}
      </div>
      <p class="rc-terms"><b>Terms of use.</b> This card remains the property of ${esc(n.name || "Rising Hope Society")} and must be shown on request. It is non-transferable. Validity can be confirmed online by scanning the QR code.</p>
      <div class="rc-qrbox"><div class="rc-qr" data-rc-qr></div><p><b>SCAN TO VERIFY</b>this membership online</p></div>
      ${sealHTML("rcSealB", true)}
      <div class="rc-bsig"><div class="rc-bsig-img">${sigHTML()}</div><div>AUTHORIZED SIGNATORY</div></div>
      <div class="rc-issue"><label>ISSUED</label><span>${esc(issueDate(m))}</span></div>
      <div class="rc-bfoot"><span>If found, please return to ${esc(n.name || "Rising Hope Society")}, Khairpur Tamewali, Bahawalpur</span><span><b>${esc(n.phone || "")}</b> · ${esc(n.email || "")}</span></div>
    </div>`;
  }

  function fillQR(root) {
    root.querySelectorAll("[data-rc-qr]").forEach(el => {
      el.innerHTML = "";
      if (window.QRCode) {
        new QRCode(el, { text: verifyUrl(), width: 240, height: 240, colorDark: "#161616", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
      }
    });
  }

  /* Responsive on-screen preview: card is always drawn at 1011×638 and scaled to fit */
  function fit(host) {
    const card = host.querySelector(".rc-card"); if (!card) return;
    const s = Math.min(1, (host.clientWidth || W) / W);
    card.style.transformOrigin = "top left";
    card.style.transform = `scale(${s})`;
    host.style.height = Math.round(H * s) + "px";
  }
  function mount(host, member, side) {
    if (!host) return;
    host.classList.add("rc-host");
    host.innerHTML = side === "back" ? backHTML(member) : frontHTML(member);
    fillQR(host);
    fit(host);
    if (window.ResizeObserver) new ResizeObserver(() => fit(host)).observe(host);
    else window.addEventListener("resize", () => fit(host));
  }

  /* ---------- export renderer (PNG / PDF) ----------
     Draws the card straight onto a <canvas> using the SAME measurements as the
     on-screen HTML/CSS design (no html2canvas), so the downloaded files are
     pixel-consistent on every phone/browser. */
  const SERIF = "Fraunces,'DejaVu Serif',Georgia,serif";
  const SANS = "Inter,'Liberation Sans',Arial,sans-serif";
  const SC = 2; // export scale → 2022 × 1276 px

  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function tw(g, s, ls) {
    if (!ls) return g.measureText(s).width;
    let w = 0; for (const c of s) w += g.measureText(c).width + ls; return w;
  }
  // draw text vertically centred on y; returns width
  function T(g, s, x, y, o) {
    s = String(s == null ? "" : s);
    g.font = o.font; g.fillStyle = o.color; g.textBaseline = "middle"; g.textAlign = "left";
    if (o.upper) s = s.toUpperCase();
    const ls = o.ls || 0, w = tw(g, s, ls);
    let sx = o.align === "right" ? x - w : o.align === "center" ? x - w / 2 : x;
    if (!ls) g.fillText(s, sx, y);
    else for (const c of s) { g.fillText(c, sx, y); sx += g.measureText(c).width + ls; }
    return w;
  }
  function wrap(g, s, font, maxW, maxLines) {
    g.font = font; s = String(s || "—");
    const lines = []; let cur = "";
    for (const word of s.split(/\s+/)) {
      const t = cur ? cur + " " + word : word;
      if (g.measureText(t).width <= maxW) { cur = t; continue; }
      if (cur) lines.push(cur);
      cur = word;
      while (g.measureText(cur).width > maxW) {            // very long word (e.g. email)
        let i = cur.length; while (i > 1 && g.measureText(cur.slice(0, i)).width > maxW) i--;
        lines.push(cur.slice(0, i)); cur = cur.slice(i);
      }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, maxLines || 2);
  }
  function fitImg(g, img, x, y, w, h, mode, align) {
    const k = mode === "cover" ? Math.max(w / img.width, h / img.height) : Math.min(w / img.width, h / img.height);
    const iw = img.width * k, ih = img.height * k;
    const ix = align === "left" ? x : align === "right" ? x + w - iw : x + (w - iw) / 2;
    const iy = mode === "cover" ? y + (h - ih) / 2 : y + h - ih;   // contain → bottom aligned
    g.drawImage(img, ix, iy, iw, ih);
  }
  function loadImg(url) {
    return new Promise(res => {
      if (!url) return res(null);
      const i = new Image(); i.crossOrigin = "anonymous";
      i.onload = () => res(i); i.onerror = () => res(null); i.src = url;
    });
  }
  function qrCanvas(text) {
    if (!window.QRCode) return null;
    const d = document.createElement("div");
    new QRCode(d, { text, width: 240, height: 240, colorDark: "#161616", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    return d.querySelector("canvas");
  }

  /* ====================== new design: canvas renderer ====================== */
  const INK = "#161616", SUB = "#4a4d55", LAB = "#5a5d65", CRIM = "#c4123f", CRIM2 = "#a3163a", BLUSH = "#f4c6d1";

  // CSS-style angled linear gradient (same direction maths as CSS linear-gradient(<deg>, ...))
  function cssGrad(g, x, y, w, h, deg, stops) {
    const a = deg * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
    const len = Math.abs(w * dx) + Math.abs(h * dy), cx = x + w / 2, cy = y + h / 2;
    const gr = g.createLinearGradient(cx - dx * len / 2, cy - dy * len / 2, cx + dx * len / 2, cy + dy * len / 2);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    return gr;
  }
  const circ = (g, cx, cy, r) => { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); };
  function containC(g, img, x, y, w, h) {                       // object-fit: contain, centred
    if (!img) return;
    const k = Math.min(w / img.width, h / img.height), iw = img.width * k, ih = img.height * k;
    g.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  }
  function clipText(g, s, font, maxW) {
    g.font = font; s = String(s == null ? "" : s);
    if (g.measureText(s).width <= maxW) return s;
    while (s.length > 1 && g.measureText(s + "…").width > maxW) s = s.slice(0, -1);
    return s + "…";
  }
  function wrapEllipsis(g, s, font, maxW, maxLines) {
    const all = wrap(g, s, font, maxW, 99);
    if (all.length <= maxLines) return all;
    const out = all.slice(0, maxLines); let last = out[maxLines - 1]; g.font = font;
    while (last.length > 1 && g.measureText(last + "…").width > maxW) last = last.slice(0, -1);
    out[maxLines - 1] = last + "…"; return out;
  }
  function drawGuil(g) {
    g.save(); g.strokeStyle = "rgba(224,36,90,.065)"; g.lineWidth = .7;
    for (let i = 0; i < 46; i++) {
      g.beginPath();
      for (let x = 0; x <= W; x += 9) { const y = guilY(i, x); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  function cardBase(g, im, back) {
    g.save(); rr(g, 0, 0, W, H, 30); g.clip();
    g.fillStyle = "#fff"; g.fillRect(0, 0, W, H);
    drawGuil(g);
    if (!back) {                                               // soft glow behind the photo
      g.save(); g.translate(155, 310); g.scale(165, 190);
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      rg.addColorStop(0, "rgba(255,56,92,.09)"); rg.addColorStop(1, "rgba(255,56,92,0)");
      g.fillStyle = rg; g.fillRect(-1.2, -1.2, 2.4, 2.4); g.restore();
    }
    if (im.logo) {                                             // emblem watermark (top part of the logo)
      g.save(); g.globalAlpha = .07; g.beginPath();
      if (back) { g.rect(330, 150, 260, 147); g.clip(); containC(g, im.logo, 330, 143, 260, 260); }
      else      { g.rect(665, 146, 300, 170); g.clip(); containC(g, im.logo, 665, 138, 300, 300); }
      g.restore();
    }
    return () => {                                             // finish: thin card edge, then un-clip
      rr(g, .75, .75, W - 1.5, H - 1.5, 29.25); g.lineWidth = 1.5; g.strokeStyle = "#b9bdc6"; g.stroke();
      g.restore();
    };
  }
  function header(g, h) {
    g.fillStyle = cssGrad(g, 0, 0, W, h, 100, [[0, "#fff"], [.5, "#fff"], [1, "#fff1f4"]]); g.fillRect(0, 0, W, h);
    g.save(); g.beginPath(); g.rect(0, 0, W, h); g.clip();
    ARC_R.forEach(([r, o]) => { circ(g, 1001, h / 2, r); g.strokeStyle = `rgba(255,56,92,${(o * .7).toFixed(3)})`; g.lineWidth = 1.3; g.stroke(); });
    g.restore();
  }
  function rule(g, y) {
    const gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, "#ff385c"); gr.addColorStop(.45, "#e31c5f"); gr.addColorStop(1, "#b80f45");
    g.fillStyle = gr; g.fillRect(0, y, W, 8);
    g.fillStyle = INK; g.fillRect(0, y, W, 3);
    g.fillStyle = "#fff"; g.fillRect(0, y + 3, W, 1);
  }
  function logoBadge(g, logo, cx, cy, size, bw, pad) {
    const R = size / 2;
    g.save(); g.shadowColor = "rgba(196,18,63,.35)"; g.shadowBlur = 12; g.shadowOffsetY = 5;
    circ(g, cx, cy, R); g.fillStyle = cssGrad(g, cx - R, cy - R, size, size, 135, [[0, "#ff5a78"], [1, "#b80f45"]]); g.fill(); g.restore();
    circ(g, cx, cy, R - bw); g.fillStyle = "#fff"; g.fill();
    if (logo) {
      g.save(); circ(g, cx, cy, R - bw); g.clip();
      const inner = size - 2 * bw - 2 * pad; containC(g, logo, cx - inner / 2, cy - inner / 2, inner, inner); g.restore();
    }
  }
  // hologram-style "official" seal (matches the on-screen SVG seal)
  function drawSeal(g, x, y, s) {
    const cx = x + s / 2, cy = y + s / 2, k = s / 100, R = s / 2;
    g.save(); g.shadowColor = "rgba(196,18,63,.30)"; g.shadowBlur = 18; g.shadowOffsetY = 8;
    circ(g, cx, cy, R + 4.5); g.fillStyle = INK; g.fill(); g.restore();
    circ(g, cx, cy, R + 3); g.fillStyle = "#fff"; g.fill();
    circ(g, cx, cy, R);
    if (g.createConicGradient) {
      const cg = g.createConicGradient((30 - 90) * Math.PI / 180, cx, cy);
      ["#ffd0da", "#d5e3ff", "#d0f6e2", "#fff1bf", "#ffd0da"].forEach((c, i) => cg.addColorStop(i / 4, c));
      g.fillStyle = cg;
    } else {
      const rg0 = g.createRadialGradient(cx, cy, 0, cx, cy, R); rg0.addColorStop(0, "#fff1bf"); rg0.addColorStop(1, "#ffd0da"); g.fillStyle = rg0;
    }
    g.fill();
    const hx = x + .3 * s, hy = y + .25 * s, hr = 1.026 * s * .45;
    const hg = g.createRadialGradient(hx, hy, 0, hx, hy, hr); hg.addColorStop(0, "rgba(255,255,255,.95)"); hg.addColorStop(1, "rgba(255,255,255,0)");
    g.save(); circ(g, cx, cy, R); g.clip(); g.fillStyle = hg; g.fillRect(x, y, s, s); g.restore();
    circ(g, cx, cy, 46 * k); g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 1.2 * k; g.stroke();
    circ(g, cx, cy, 30 * k); g.fillStyle = "rgba(255,255,255,.55)"; g.fill(); g.strokeStyle = INK; g.lineWidth = 1 * k; g.stroke();
    // text on a circle, clockwise from 9 o'clock
    const fs = SEAL_FS * k, ls = SEAL_LS * k, r = 37 * k;
    g.save(); g.font = `700 ${fs}px ${SANS}`; g.fillStyle = INK; g.textBaseline = "alphabetic"; g.textAlign = "left";
    let arc = 2 * Math.PI * r * .02;
    for (const ch of SEAL_TEXT) {
      const w = g.measureText(ch).width;
      if (arc + w / 2 > 2 * Math.PI * r) break;                 // like SVG textPath: nothing past the end of the circle
      const ang = -Math.PI / 2 + (arc + w / 2) / r;
      g.save(); g.translate(cx, cy); g.rotate(ang); g.translate(0, -r); g.fillText(ch, -w / 2, 0); g.restore();
      arc += w + ls;
    }
    g.restore();
    g.save(); g.strokeStyle = INK; g.lineWidth = 5.5 * k; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x + 37 * k, y + 51 * k); g.lineTo(x + 46 * k, y + 60 * k); g.lineTo(x + 63 * k, y + 41 * k); g.stroke(); g.restore();
  }
  function icon24(g, x, y, size, paths, lw, color) {          // draw a 24×24 stroke icon
    g.save(); g.translate(x, y); g.scale(size / 24, size / 24);
    g.strokeStyle = color; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round";
    paths.forEach(p => { if (typeof p === "string") g.stroke(new Path2D(p)); else p(g); });
    g.restore();
  }
  const rrp = (x, y, w, h, r) => g => { rr(g, x, y, w, h, r); g.stroke(); };
  const ICON_PATHS = {
    pin:  [ "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z", g => { circ(g, 12, 9.5, 2.6); g.stroke(); } ],
    bag:  [ rrp(3, 7, 18, 13, 2.5), "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18" ],
    mail: [ rrp(3, 5, 18, 14, 2.5), "M3.5 7.5l8.5 6 8.5-6" ]
  };

  function drawFront(g, m, im) {
    const n = ngo(), st = statusInfo(m), done = cardBase(g, im, false);
    header(g, 112);
    logoBadge(g, im.logo, 78, 56, 80, 3, 5);
    T(g, n.name || "Rising Hope Society", 140, 44.5, { font: `700 37px ${SERIF}`, color: INK, ls: .2 });
    T(g, "Khairpur Tamewali · Bahawalpur", 140, 79.5, { font: `600 12.5px ${SANS}`, color: SUB, ls: 3.75, upper: true });
    T(g, "MEMBERSHIP CARD", 973, 33.5, { font: `700 14.5px ${SANS}`, color: CRIM, ls: 4.64, align: "right" });
    // status chip
    g.font = `700 14px ${SANS}`;
    const pt = tw(g, st.label, 2.8), pw = 3.6 + 40 + 11 + 10 + pt, px = 973 - pw, py = 53, ph = 34;
    rr(g, px, py, pw, ph, 17); g.fillStyle = st.bg; g.fill();
    rr(g, px + .9, py + .9, pw - 1.8, ph - 1.8, 16.1); g.lineWidth = 1.8; g.strokeStyle = st.bd; g.stroke();
    g.save(); g.globalAlpha = .22; circ(g, px + 21.8 + 5.5, py + ph / 2, 8); g.fillStyle = st.dot; g.fill(); g.restore();
    circ(g, px + 21.8 + 5.5, py + ph / 2, 5.5); g.fillStyle = st.dot; g.fill();
    T(g, st.label, px + 21.8 + 11 + 10, py + ph / 2 + .5, { font: `700 14px ${SANS}`, color: st.tx, ls: 2.8 });
    rule(g, 112);

    // photo with gradient frame
    g.save(); g.shadowColor = "rgba(196,18,63,.40)"; g.shadowBlur = 26; g.shadowOffsetY = 14;
    rr(g, 38, 146, 216, 272, 20); g.fillStyle = cssGrad(g, 38, 146, 216, 272, 145, [[0, "#ff5a78"], [.55, "#c4123f"], [1, "#7d0a2b"]]); g.fill(); g.restore();
    rr(g, 41, 149, 210, 266, 17); g.fillStyle = "#fff"; g.fill();
    g.save(); rr(g, 45, 153, 202, 258, 13); g.clip(); g.fillStyle = "#f1f2f5"; g.fillRect(45, 153, 202, 258);
    if (im.photo) fitImg(g, im.photo, 45, 153, 202, 258, "cover");
    else { g.save(); g.translate(101, 237); g.scale(3.75, 3.75); g.fillStyle = "#b3b6be"; g.fill(new Path2D("M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z")); g.restore(); }
    g.restore();
    drawSeal(g, 198, 368, 86);

    // name block
    const IX = 298, IW = 682;
    T(g, clipText(g, m.fullName || "—", `700 ${nameSize(m.fullName)}px ${SERIF}`, IW), IX, 161, { font: `700 ${nameSize(m.fullName)}px ${SERIF}`, color: INK });
    rr(g, IX, 194, 58, 4, 2); g.fillStyle = cssGrad(g, IX, 194, 58, 4, 90, [[0, "#ff385c"], [1, "#b80f45"]]); g.fill();
    T(g, clipText(g, m.designation || "General Member", `600 20px ${SANS}`, IW), IX, 214, { font: `600 20px ${SANS}`, color: SUB });
    const type = String(m.membershipType || "General Member").toUpperCase();
    g.font = `700 13px ${SANS}`;
    const tW = tw(g, type, 2.21), bw = Math.min(IW, tW + 35.8 + 21.8);
    rr(g, IX, 238, bw, 33, 16.5); g.fillStyle = cssGrad(g, IX, 238, bw, 33, 180, [[0, "#fff4f6"], [1, "#ffe3ea"]]); g.fill();
    rr(g, IX + .9, 238.9, bw - 1.8, 31.2, 15.6); g.lineWidth = 1.8; g.strokeStyle = CRIM; g.stroke();
    circ(g, IX + 1.8 + 16 + 4, 254.5, 4); g.fillStyle = CRIM; g.fill();
    T(g, type, IX + 35.8, 254.5, { font: `700 13px ${SANS}`, color: "#9c0f31", ls: 2.21 });

    // fields
    [["Reg No", m.registrationNo, 298, 286], ["Valid Upto", m.validUpto, 656, 286],
     ["Gender", m.gender, 298, 352], ["Mobile", m.mobile, 656, 352]].forEach(([l, v, x, y]) => {
      g.fillStyle = BLUSH; g.fillRect(x, y, 324, 1.2);
      T(g, l, x, y + 16, { font: `700 11px ${SANS}`, color: CRIM2, ls: 2.42, upper: true });
      T(g, clipText(g, v || "—", `600 22px ${SANS}`, 324), x, y + 40, { font: `600 22px ${SANS}`, color: INK });
    });

    // remarks (admin comment) + signature
    const cm = String(m.adminComments || "").trim();
    if (cm) {
      g.save(); rr(g, 38, 452, 640, 80, 12); g.clip();
      g.fillStyle = cssGrad(g, 38, 452, 640, 80, 90, [[0, "#fff6f8"], [1, "#ffffff"]]); g.fillRect(38, 452, 640, 80);
      g.fillStyle = cssGrad(g, 38, 452, 7, 80, 180, [[0, "#ff385c"], [1, "#b80f45"]]); g.fillRect(38, 452, 7, 80);
      g.restore();
      g.save(); g.beginPath(); g.rect(46, 440, 640, 100); g.clip();          // border has no left edge (the bar covers it)
      rr(g, 38.7, 452.7, 638.6, 78.6, 11.5); g.lineWidth = 1.4; g.strokeStyle = BLUSH; g.stroke(); g.restore();
      const cs = commentSize(cm), lh = cs * 1.2, font = `600 ${cs}px ${SERIF}`;
      const lines = wrap(g, cm, font, 590, 2);
      const total = 14 + 3 + lh * lines.length, top = 463.4 + (57.2 - total) / 2;
      T(g, "Remarks", 64, top + 7, { font: `700 11px ${SANS}`, color: CRIM2, ls: 2.86, upper: true });
      lines.forEach((ln, i) => T(g, ln, 64, top + 17 + lh * i + lh / 2, { font, color: INK }));
    }
    if (im.sig) fitImg(g, im.sig, 722, 461, 240, 44, "contain");
    g.fillStyle = INK; g.fillRect(712, 509, 260, 1.6);
    T(g, "AUTHORIZED SIGNATURE", 842, 525, { font: `700 11px ${SANS}`, color: SUB, ls: 2.2, align: "center" });

    // micro-print + footer
    g.save(); g.beginPath(); g.rect(0, 550, W, 10); g.clip();
    g.font = `700 6.5px ${SANS}`; g.fillStyle = "#e9b9c5"; g.textBaseline = "middle"; g.textAlign = "left";
    let mx = 0; const mt = Array(30).fill(String(n.name || "Rising Hope Society").toUpperCase()).join(" · ");
    for (const c of mt) { if (mx > W) break; g.fillText(c, mx, 555); mx += g.measureText(c).width + 2.21; }
    g.restore();
    g.fillStyle = cssGrad(g, 0, 576, W, 62, 180, [[0, "#fffafb"], [1, "#fff0f3"]]); g.fillRect(0, 576, W, 62);
    g.fillStyle = INK; g.fillRect(0, 576, W, 1.5);
    const a1 = "Scan QR on back or visit", a2 = verifyUrl().replace(/^https?:\/\//, "");
    g.font = `400 15.5px ${SANS}`; const w1 = g.measureText(a1).width; g.font = `700 15.5px ${SANS}`; const w2 = g.measureText(a2).width;
    const sx = (W - (22 + 10 + w1 + 10 + w2)) / 2;
    icon24(g, sx, 596.5, 22, [rrp(3, 3, 7, 7, 1), rrp(14, 3, 7, 7, 1), rrp(3, 14, 7, 7, 1), "M14 14h3v3h-3zM20 14v1M14 20h1M18 18h3v3"], 1.8, CRIM);
    T(g, a1, sx + 32, 607, { font: `400 15.5px ${SANS}`, color: SUB });
    T(g, a2, sx + 32 + w1 + 10, 607, { font: `700 15.5px ${SANS}`, color: INK });
    done();
  }

  function drawBack(g, m, im) {
    const n = ngo(), done = cardBase(g, im, true);
    header(g, 92);
    logoBadge(g, im.logo, 69, 46, 62, 2.5, 5);
    T(g, n.name || "Rising Hope Society", 118, 46, { font: `700 31px ${SERIF}`, color: INK });
    T(g, "MEMBER IDENTITY CARD", 973, 45.5, { font: `700 14px ${SANS}`, color: CRIM, ls: 4.2, align: "right" });
    rule(g, 92);

    // address / profession / email rows with icon chips
    let y = 128;
    [["pin", "Address", m.address], ["bag", "Profession", m.profession], ["mail", "Email", m.email]].forEach(([ic, l, v]) => {
      const fs = ic === "pin" ? addrSize(v) : oneLineSize(v), fnt = `600 ${fs}px ${SANS}`;
      const lines = ic === "pin" ? wrapEllipsis(g, v || "—", fnt, 528, 2) : [clipText(g, v || "—", fnt, 528)];
      const contentH = 17 + 30 * lines.length;
      g.fillStyle = BLUSH; g.fillRect(38, y, 590, 1.2);
      const cy = y + 13.2 + contentH / 2;
      circ(g, 61, cy, 23); g.fillStyle = cssGrad(g, 38, cy - 23, 46, 46, 145, [[0, "#fff4f6"], [1, "#ffd9e2"]]); g.fill();
      circ(g, 61, cy, 22.2); g.lineWidth = 1.6; g.strokeStyle = CRIM; g.stroke();
      icon24(g, 50, cy - 11, 22, ICON_PATHS[ic], 1.9, CRIM);
      T(g, l, 100, y + 20.2, { font: `700 11px ${SANS}`, color: CRIM2, ls: 2.42, upper: true });
      lines.forEach((ln, i) => T(g, ln, 100, y + 45.5 + 30 * i, { font: fnt, color: INK }));
      y += 1.2 + 12 + contentH + 14;
    });

    // terms (bold lead + wrapped text)
    const org = n.name || "Rising Hope Society";
    const words = [["Terms", 1], ["of", 1], ["use.", 1]].concat(
      `This card remains the property of ${org} and must be shown on request. It is non-transferable. Validity can be confirmed online by scanning the QR code.`.split(/\s+/).map(w => [w, 0]));
    const fB = `700 12.5px ${SANS}`, fN = `400 12.5px ${SANS}`, maxW = 543;
    g.font = fN; const sp = g.measureText(" ").width;
    const rows = []; let cur = [], cx = 0;
    words.forEach(([w, b]) => {
      g.font = b ? fB : fN; const ww = g.measureText(w).width;
      if (cur.length && cx + sp + ww > maxW) { rows.push(cur); cur = []; cx = 0; }
      cur.push([w, b, cx ? cx + sp : 0, ww]); cx = (cx ? cx + sp : 0) + ww;
    });
    if (cur.length) rows.push(cur);
    g.fillStyle = BLUSH; g.fillRect(38, 384, 3, rows.length * 20);
    rows.forEach((r, i) => r.forEach(([w, b, x]) => T(g, w, 55 + x, 394 + i * 20, { font: b ? fB : fN, color: b ? INK : "#62656d" })));

    // QR card
    g.save(); g.shadowColor = "rgba(196,18,63,.40)"; g.shadowBlur = 24; g.shadowOffsetY = 14;
    rr(g, 690, 124, 282, 282, 24); g.fillStyle = cssGrad(g, 690, 124, 282, 282, 145, [[0, "#ff5a78"], [.6, "#c4123f"], [1, "#7d0a2b"]]); g.fill(); g.restore();
    rr(g, 693, 127, 276, 276, 21); g.fillStyle = "#fff"; g.fill();
    if (im.qr) g.drawImage(im.qr, 711, 145, 240, 240);
    g.save(); g.strokeStyle = INK; g.lineWidth = 3.5; g.lineCap = "butt";
    g.beginPath(); g.moveTo(686.75, 145); g.lineTo(686.75, 133); g.arcTo(686.75, 120.75, 699, 120.75, 12.25); g.lineTo(711, 120.75); g.stroke();
    g.beginPath(); g.moveTo(951, 409.25); g.lineTo(963, 409.25); g.arcTo(975.25, 409.25, 975.25, 397, 12.25); g.lineTo(975.25, 385); g.stroke();
    g.restore();
    T(g, "SCAN TO VERIFY", 831, 427, { font: `700 11.5px ${SANS}`, color: INK, ls: 2.99, align: "center" });
    T(g, "this membership online", 831, 447.5, { font: `400 15px ${SANS}`, color: SUB, align: "center" });

    drawSeal(g, 470, 462, 92);
    if (im.sig) fitImg(g, im.sig, 38, 496, 260, 46, "contain", "left");
    g.fillStyle = INK; g.fillRect(38, 546, 290, 1.6);
    T(g, "AUTHORIZED SIGNATORY", 38, 562, { font: `700 11px ${SANS}`, color: SUB, ls: 2.2 });
    T(g, "ISSUED", 973, 495, { font: `700 11px ${SANS}`, color: LAB, ls: 2.86, align: "right" });
    T(g, issueDate(m), 973, 520, { font: `600 25px ${SANS}`, color: INK, align: "right" });

    // footer
    g.fillStyle = cssGrad(g, 0, 574, W, 64, 180, [[0, "#fffafb"], [1, "#fff0f3"]]); g.fillRect(0, 574, W, 64);
    g.fillStyle = INK; g.fillRect(0, 574, W, 1.5);
    T(g, `If found, please return to ${org}, Khairpur Tamewali, Bahawalpur`, W / 2, 593.5, { font: `400 14.5px ${SANS}`, color: SUB, align: "center" });
    g.font = `700 14.5px ${SANS}`; const p1 = n.phone || ""; const wp = g.measureText(p1).width;
    g.font = `400 14.5px ${SANS}`; const p2 = " · " + (n.email || ""); const wq = g.measureText(p2).width;
    const bx = (W - (wp + wq)) / 2;
    T(g, p1, bx, 618.5, { font: `700 14.5px ${SANS}`, color: CRIM });
    T(g, p2, bx + wp, 618.5, { font: `400 14.5px ${SANS}`, color: SUB });
    done();
  }

  async function capture(member) {
    if (document.fonts && document.fonts.load) {
      try { await Promise.all([
        document.fonts.load(`700 37px Fraunces`), document.fonts.load(`600 28px Fraunces`), document.fonts.load(`700 14px Inter`),
        document.fonts.load(`600 22px Inter`), document.fonts.load(`400 14px Inter`)
      ]); } catch (e) {}
    }
    const n = ngo();
    const [logo, photo, sig] = await Promise.all([
      loadImg(n.logoUrl || "images/logo.png"),
      loadImg(member.photo ? (window.RHS && RHS.imgUrl ? RHS.imgUrl(member.photo, 520) : member.photo) : ""),
      loadImg(n.signatureUrl)
    ]);
    const im = { logo, photo, sig, qr: qrCanvas(verifyUrl()) };
    return [drawFront, drawBack].map(fn => {
      const c = document.createElement("canvas"); c.width = W * SC; c.height = H * SC;
      const g = c.getContext("2d"); g.scale(SC, SC); fn(g, member, im); return c;
    });
  }

  const safeName = m => (m.registrationNo || m.fullName || "RHS").replace(/[^a-z0-9]+/gi, "-");

  async function downloadPNG(member) {
    const [f, b] = await capture(member);
    const gap = 50, pad = 30;
    const c = document.createElement("canvas");
    c.width = f.width + pad * 2; c.height = f.height + b.height + gap + pad * 2;
    const g = c.getContext("2d");
    g.fillStyle = "#eceef1"; g.fillRect(0, 0, c.width, c.height);            // light backdrop so the card edges show
    g.drawImage(f, pad, pad);
    g.drawImage(b, pad, pad + f.height + gap);
    const a = document.createElement("a");
    a.download = "Membership-SmartCard-" + safeName(member) + ".png";
    a.href = c.toDataURL("image/png");
    document.body.appendChild(a); a.click(); a.remove();
  }

  async function downloadPDF(member) {
    if (!(window.jspdf && window.jspdf.jsPDF)) throw new Error("jsPDF missing");
    const [f, b] = await capture(member);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const CW = 85.6, CH = 53.98, gap = 8, x1 = (210 - (CW * 2 + gap)) / 2, y = 52;
    const n = ngo();
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.setTextColor(22, 22, 22);
    pdf.text(n.name || "Rising Hope Society", 105, 24, { align: "center" });
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(90, 93, 101);
    pdf.text("MEMBERSHIP SMART CARD  ·  " + (member.registrationNo || ""), 105, 31, { align: "center" });
    pdf.setFontSize(9);
    pdf.text("FRONT", x1, y - 3); pdf.text("BACK", x1 + CW + gap, y - 3);
    const jpg = cv => { const t = document.createElement("canvas"); t.width = cv.width; t.height = cv.height; const g = t.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, t.width, t.height); g.drawImage(cv, 0, 0); return t.toDataURL("image/jpeg", 0.95); };
    pdf.addImage(jpg(f), "JPEG", x1, y, CW, CH);
    pdf.addImage(jpg(b), "JPEG", x1 + CW + gap, y, CW, CH);
    pdf.setDrawColor(185, 189, 198); pdf.setLineDashPattern([1.5, 1.5], 0); pdf.setLineWidth(0.2);
    pdf.roundedRect(x1 - 1.5, y - 1.5, CW + 3, CH + 3, 3, 3);
    pdf.roundedRect(x1 + CW + gap - 1.5, y - 1.5, CW + 3, CH + 3, 3, 3);
    pdf.setLineDashPattern([], 0);
    pdf.setFontSize(9); pdf.setTextColor(90, 93, 101);
    pdf.text("Print at 100% (Actual size). Card size: 85.6 × 54 mm, same as CNIC / driving licence.", 105, y + CH + 12, { align: "center" });
    pdf.setFontSize(8.5);
    pdf.text("Verify online: " + verifyUrl() + "   |   " + (n.phone || "") + "   |   " + (n.email || ""), 105, y + CH + 18, { align: "center" });
    pdf.text("Computer-generated digital membership card · " + (n.name || ""), 105, y + CH + 23, { align: "center" });
    pdf.save("Membership-Card-" + safeName(member) + ".pdf");
  }

  window.RHSCard = { mount, downloadPNG, downloadPDF };
})();
