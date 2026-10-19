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

  function statusInfo(m) {
    const st = String(m.status || "Active").toUpperCase();
    const dot = st === "ACTIVE" ? "#5BE08E" : st === "BANNED" ? "#F08A7E" : st === "EXPIRED" ? "#F5B57A" : "#F0D98A";
    return { label: st, dot };
  }

  function nameSize(n) { n = String(n || ""); return n.length > 30 ? 27 : n.length > 22 ? 32 : 40; }
  function commentSize(c) { c = String(c || ""); return c.length > 70 ? 17 : c.length > 45 ? 21 : 28; }

  const photoHTML = m => m.photo
    ? `<img class="rc-photo" src="${esc(window.RHS && RHS.imgUrl ? RHS.imgUrl(m.photo, 520) : m.photo)}" alt="">`
    : `<div class="rc-photo rc-photo-ph"><svg width="90" height="90" viewBox="0 0 24 24" fill="#9bb5b1"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg></div>`;

  const field = (l, v) => `<div class="rc-f"><label>${l}</label><span>${val(v)}</span></div>`;
  const sigHTML = () => ngo().signatureUrl ? `<img src="${esc(ngo().signatureUrl)}" alt="">` : "";

  function frontHTML(m) {
    const n = ngo(), st = statusInfo(m);
    const logo = n.logoUrl || "images/logo.png";
    const comment = String(m.adminComments || "").trim();
    return `
    <div class="rc-card rc-front-card" style="width:${W}px;height:${H}px">
      <img class="rc-wm" src="${esc(logo)}" alt="">
      <div class="rc-head">
        <img class="rc-lg" src="${esc(logo)}" alt="">
        <div><h1>${esc(n.name || "Rising Hope Society")}</h1><small>Khairpur Tamewali · Bahawalpur</small></div>
        <div class="rc-r"><b>MEMBERSHIP CARD</b><span class="rc-pill"><i style="background:${st.dot}"></i>${esc(st.label)}</span></div>
      </div>
      <div class="rc-stripe"></div>
      <div class="rc-body">
        ${photoHTML(m)}
        <div class="rc-info">
          <div class="rc-name" style="font-size:${nameSize(m.fullName)}px">${val(m.fullName)}</div>
          <div class="rc-desg">${esc(m.designation || "General Member")}</div>
          <span class="rc-type">${esc(m.membershipType || "General Member")}</span>
          <div class="rc-grid">
            ${field("Reg No", m.registrationNo)}
            ${field("Valid Upto", m.validUpto)}
            ${field("Gender", m.gender)}
            ${field("Mobile", m.mobile)}
          </div>
          <div class="rc-fsig"><div class="rc-fsig-img">${sigHTML()}</div><div>AUTHORIZED SIGNATURE</div></div>
        </div>
      </div>
      ${comment ? `<div class="rc-cmt"><label>Admin Comment</label><span style="font-size:${commentSize(comment)}px">${esc(comment)}</span></div>` : ""}
      <div class="rc-foot"><span>Scan QR on back or visit</span> <b>${esc(verifyUrl().replace(/^https?:\/\//, ""))}</b></div>
    </div>`;
  }

  function backHTML(m) {
    const n = ngo();
    const logo = n.logoUrl || "images/logo.png";
    return `
    <div class="rc-card rc-back-card" style="width:${W}px;height:${H}px">
      <img class="rc-wm" src="${esc(logo)}" alt="">
      <div class="rc-bhead"><img src="${esc(logo)}" alt=""><h2>${esc(n.name || "Rising Hope Society")}</h2><small>MEMBER IDENTITY CARD</small></div>
      <div class="rc-stripe"></div>
      <div class="rc-bbody">
        <div class="rc-bl">
          ${field("Address", m.address)}
          ${field("Profession", m.profession)}
          ${field("Email", m.email)}
        </div>
        <div class="rc-br"><div class="rc-qr" data-rc-qr></div><p>Scan to verify<br>this membership online</p></div>
      </div>
      <div class="rc-bsig"><div class="rc-bsig-img">${sigHTML()}</div><div>AUTHORIZED SIGNATORY</div></div>
      <div class="rc-issue"><label>ISSUED</label><span>${esc(issueDate(m))}</span></div>
      <div class="rc-bfoot"><span>If found, please return to ${esc(n.name || "Rising Hope Society")}, Khairpur Tamewali, Bahawalpur</span><span><b>${esc(n.phone || "")}</b> · ${esc(n.email || "")}</span></div>
    </div>`;
  }

  function fillQR(root) {
    root.querySelectorAll("[data-rc-qr]").forEach(el => {
      el.innerHTML = "";
      if (window.QRCode) {
        new QRCode(el, { text: verifyUrl(), width: 176, height: 176, colorDark: "#14534F", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
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
    new QRCode(d, { text, width: 176, height: 176, colorDark: "#14534F", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    return d.querySelector("canvas");
  }

  function base(g, logo) {
    g.save(); rr(g, 0, 0, W, H, 34); g.clip();
    g.fillStyle = "#FBF6EF"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(20,83,79,.035)"; g.lineWidth = 2;
    for (let c = 0; c < W + H; c += 19.8) { g.beginPath(); g.moveTo(c, 0); g.lineTo(c - H, H); g.stroke(); }
    const rg = g.createRadialGradient(860, 510, 0, 860, 510, 470);
    rg.addColorStop(0, "rgba(232,163,61,.14)"); rg.addColorStop(1, "rgba(232,163,61,0)");
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    if (logo) { g.globalAlpha = .07; fitImg(g, logo, 651, 288, 420, 420, "contain"); g.globalAlpha = 1; }
    return () => g.restore();
  }
  function headBar(g, h) {
    const lg = g.createLinearGradient(0, 0, W, h * 1.6);
    lg.addColorStop(0, "#14534F"); lg.addColorStop(1, "#1E7A73");
    g.fillStyle = lg; g.fillRect(0, 0, W, h);
    const sg = g.createLinearGradient(0, 0, W, 0);
    sg.addColorStop(0, "#E8A33D"); sg.addColorStop(1, "#F2785C");
    g.fillStyle = sg; g.fillRect(0, h, W, 7);
  }
  function logoBadge(g, logo, cx, cy, size) {
    g.save(); g.beginPath(); g.arc(cx, cy, size / 2, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.lineWidth = size > 70 ? 3 : 2; g.strokeStyle = "#E8A33D"; g.stroke(); g.restore();
    if (logo) {
      g.save(); g.beginPath(); g.arc(cx, cy, size / 2 - 3, 0, Math.PI * 2); g.clip();
      const inner = size - (size > 70 ? 12 : 8);
      fitImg(g, logo, cx - inner / 2, cy - inner / 2, inner, inner, "contain"); g.restore();
    }
  }
  function drawFront(g, m, im) {
    const n = ngo(), st = statusInfo(m), done = base(g, im.logo);
    headBar(g, 120);
    logoBadge(g, im.logo, 34 + 41, 60, 82);
    T(g, n.name || "Rising Hope Society", 136, 49, { font: `700 34px ${SERIF}`, color: "#fff" });
    T(g, "Khairpur Tamewali · Bahawalpur", 136, 82, { font: `400 14px ${SANS}`, color: "#CFE3E0", ls: 3.08, upper: true });
    T(g, "MEMBERSHIP CARD", 977, 40.5, { font: `700 15px ${SANS}`, color: "#E8A33D", ls: 3, align: "right" });
    // status pill
    g.font = `700 15px ${SANS}`;
    const pt = tw(g, st.label, 2.1), pw = 16 + 11 + 8 + pt + 16 + 3, px = 977 - pw, py = 58.5;
    rr(g, px, py, pw, 31, 15.5); g.fillStyle = "rgba(255,255,255,.14)"; g.fill();
    g.lineWidth = 1.5; g.strokeStyle = "rgba(255,255,255,.4)"; g.stroke();
    g.beginPath(); g.arc(px + 1.5 + 16 + 5.5, py + 15.5, 5.5, 0, 7); g.fillStyle = st.dot; g.fill();
    T(g, st.label, px + 1.5 + 16 + 11 + 8, py + 16, { font: `700 15px ${SANS}`, color: "#fff", ls: 2.1 });

    // photo
    g.save(); g.shadowColor = "rgba(20,83,79,.25)"; g.shadowBlur = 20; g.shadowOffsetY = 8;
    rr(g, 34, 153, 210, 296, 16); g.fillStyle = "#14534F"; g.fill(); g.restore();
    g.save(); rr(g, 39, 158, 200, 286, 11); g.clip(); g.fillStyle = "#EEF8F1"; g.fillRect(39, 158, 200, 286);
    if (im.photo) fitImg(g, im.photo, 39, 158, 200, 286, "cover");
    else { g.fillStyle = "#9bb5b1"; g.beginPath(); g.arc(139, 260, 38, 0, 7); g.fill(); g.beginPath(); g.ellipse(139, 380, 70, 62, 0, Math.PI, 0); g.fill(); }
    g.restore();

    const X = 274, IW = 703;
    T(g, m.fullName || "—", X, 177, { font: `700 ${nameSize(m.fullName)}px ${SERIF}`, color: "#14534F" });
    T(g, m.designation || "General Member", X, 216, { font: `400 20px ${SANS}`, color: "#6b7c78" });
    const type = String(m.membershipType || "General Member");
    g.font = `700 15px ${SANS}`;
    const bw = tw(g, type.toUpperCase(), 1.2) + 32;
    rr(g, X, 237, bw, 32, 16); g.fillStyle = "#14534F"; g.fill();
    T(g, type, X + 16, 253, { font: `700 15px ${SANS}`, color: "#fff", ls: 1.2, upper: true });
    const cw = (IW - 24) / 2;
    [["Reg No", m.registrationNo, X, 285], ["Valid Upto", m.validUpto, X + cw + 24, 285],
     ["Gender", m.gender, X, 342], ["Mobile", m.mobile, X + cw + 24, 342]].forEach(([l, v, x, y]) => {
      T(g, l, x, y + 7, { font: `700 12px ${SANS}`, color: "#8A9A96", ls: 1.92, upper: true });
      T(g, v || "—", x, y + 17 + 14, { font: `700 22px ${SANS}`, color: "#1F2E2B" });
    });
    // signature (front)
    if (im.sig) fitImg(g, im.sig, 717 + 10, 390, 240, 44, "contain");
    g.fillStyle = "#14534F"; g.fillRect(717, 436, 260, 2);
    T(g, "AUTHORIZED SIGNATURE", 847, 449, { font: `700 12px ${SANS}`, color: "#4A5C58", ls: 1.68, align: "center" });

    // admin comment
    const cm = String(m.adminComments || "").trim();
    if (cm) {
      rr(g, 34, 498, 943, 78, 16);
      const cg = g.createLinearGradient(0, 498, 0, 576); cg.addColorStop(0, "#EEF6F4"); cg.addColorStop(1, "#E3F0ED");
      g.fillStyle = cg; g.fill(); g.setLineDash([6, 5]); g.lineWidth = 1.5; g.strokeStyle = "#9CC4BE"; g.stroke(); g.setLineDash([]);
      T(g, "ADMIN COMMENT", 505.5, 518, { font: `700 12px ${SANS}`, color: "#6b8a85", ls: 2.88, align: "center" });
      T(g, cm, 505.5, 546, { font: `700 ${commentSize(cm)}px ${SERIF}`, color: "#14534F", align: "center" });
    }
    // footer
    g.fillStyle = "#EAF3F0"; g.fillRect(0, 592, W, 46);
    g.setLineDash([4, 3]); g.strokeStyle = "#B9D3CE"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 592.5); g.lineTo(W, 592.5); g.stroke(); g.setLineDash([]);
    const a1 = "Scan QR on back or visit", a2 = verifyUrl().replace(/^https?:\/\//, "");
    g.font = `400 14px ${SANS}`; const w1 = g.measureText(a1).width; g.font = `700 14px ${SANS}`; const w2 = g.measureText(a2).width;
    const sx = (W - (w1 + 8 + w2)) / 2;
    T(g, a1, sx, 615, { font: `400 14px ${SANS}`, color: "#4A5C58" });
    T(g, a2, sx + w1 + 8, 615, { font: `700 14px ${SANS}`, color: "#14534F" });
    done();
  }

  function drawBack(g, m, im) {
    const n = ngo(), done = base(g, im.logo);
    headBar(g, 84);
    logoBadge(g, im.logo, 34 + 28, 42, 56);
    T(g, n.name || "Rising Hope Society", 106, 42, { font: `700 26px ${SERIF}`, color: "#fff" });
    T(g, "MEMBER IDENTITY CARD", 977, 42, { font: `700 13px ${SANS}`, color: "#E8A33D", ls: 2.6, align: "right" });
    let y = 115;
    [["Address", m.address, 2], ["Profession", m.profession, 1], ["Email", m.email, 1]].forEach(([l, v, ml]) => {
      T(g, l, 34, y + 7, { font: `700 12px ${SANS}`, color: "#8A9A96", ls: 1.92, upper: true });
      const lines = wrap(g, v || "—", `700 20px ${SANS}`, 683, ml);
      lines.forEach((ln, i) => T(g, ln, 34, y + 17 + 14 + i * 28, { font: `700 20px ${SANS}`, color: "#1F2E2B" }));
      y += 14 + 3 + 28 * lines.length + 14;
    });
    // QR
    rr(g, 762, 115, 200, 200, 14); g.fillStyle = "#fff"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#14534F"; g.stroke();
    if (im.qr) g.drawImage(im.qr, 774, 127, 176, 176);
    T(g, "Scan to verify", 862, 331.5, { font: `400 13px ${SANS}`, color: "#4A5C58", align: "center" });
    T(g, "this membership online", 862, 348.5, { font: `400 13px ${SANS}`, color: "#4A5C58", align: "center" });
    // signature
    if (im.sig) fitImg(g, im.sig, 34, 475, 300, 62, "contain", "left");
    g.fillStyle = "#14534F"; g.fillRect(34, 539, 330, 2);
    T(g, "AUTHORIZED SIGNATORY", 34, 552, { font: `700 12px ${SANS}`, color: "#4A5C58", ls: 1.68 });
    T(g, "ISSUED", 977, 523, { font: `700 12px ${SANS}`, color: "#8A9A96", ls: 1.92, align: "right" });
    T(g, issueDate(m), 977, 542, { font: `700 20px ${SANS}`, color: "#1F2E2B", align: "right" });
    // footer
    g.fillStyle = "#14534F"; g.fillRect(0, 576, W, 62);
    T(g, `If found, please return to ${n.name || "Rising Hope Society"}, Khairpur Tamewali, Bahawalpur`, W / 2, 597, { font: `400 13px ${SANS}`, color: "#DCEBE8", align: "center" });
    g.font = `700 13px ${SANS}`; const p1 = n.phone || ""; const wp = g.measureText(p1).width;
    g.font = `400 13px ${SANS}`; const p2 = " · " + (n.email || ""); const wq = g.measureText(p2).width;
    const bx = (W - (wp + wq)) / 2;
    T(g, p1, bx, 617, { font: `700 13px ${SANS}`, color: "#E8A33D" });
    T(g, p2, bx + wp, 617, { font: `400 13px ${SANS}`, color: "#DCEBE8" });
    done();
  }

  async function capture(member) {
    if (document.fonts && document.fonts.load) {
      try { await Promise.all([
        document.fonts.load(`700 34px Fraunces`), document.fonts.load(`700 20px Inter`), document.fonts.load(`400 14px Inter`)
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
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.setTextColor(20, 83, 79);
    pdf.text(n.name || "Rising Hope Society", 105, 24, { align: "center" });
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(120, 135, 130);
    pdf.text("MEMBERSHIP SMART CARD  ·  " + (member.registrationNo || ""), 105, 31, { align: "center" });
    pdf.setFontSize(9);
    pdf.text("FRONT", x1, y - 3); pdf.text("BACK", x1 + CW + gap, y - 3);
    const jpg = cv => { const t = document.createElement("canvas"); t.width = cv.width; t.height = cv.height; const g = t.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, t.width, t.height); g.drawImage(cv, 0, 0); return t.toDataURL("image/jpeg", 0.95); };
    pdf.addImage(jpg(f), "JPEG", x1, y, CW, CH);
    pdf.addImage(jpg(b), "JPEG", x1 + CW + gap, y, CW, CH);
    pdf.setDrawColor(190, 200, 196); pdf.setLineDashPattern([1.5, 1.5], 0); pdf.setLineWidth(0.2);
    pdf.roundedRect(x1 - 1.5, y - 1.5, CW + 3, CH + 3, 3, 3);
    pdf.roundedRect(x1 + CW + gap - 1.5, y - 1.5, CW + 3, CH + 3, 3, 3);
    pdf.setLineDashPattern([], 0);
    pdf.setFontSize(9); pdf.setTextColor(120, 135, 130);
    pdf.text("Print at 100% (Actual size). Card size: 85.6 × 54 mm, same as CNIC / driving licence.", 105, y + CH + 12, { align: "center" });
    pdf.setFontSize(8.5);
    pdf.text("Verify online: " + verifyUrl() + "   |   " + (n.phone || "") + "   |   " + (n.email || ""), 105, y + CH + 18, { align: "center" });
    pdf.text("Computer-generated digital membership card · " + (n.name || ""), 105, y + CH + 23, { align: "center" });
    pdf.save("Membership-Card-" + safeName(member) + ".pdf");
  }

  window.RHSCard = { mount, downloadPNG, downloadPDF };
})();
