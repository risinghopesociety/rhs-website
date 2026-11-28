/* ============================================================
   RHS Charity Ledger — professional A4 statement (PDF)
   Builds clean, paginated A4 pages (no buttons, no screen UI) and
   saves them as a real PDF with html2canvas + jsPDF.
   Light, print-safe design: reads well in colour AND black & white.
   Exposes: window.RHSLedger = { download(data), buildPagesHTML(data) }
   data = { member, donations, total }
   ============================================================ */
(function () {
  "use strict";
  var PW = 794, PH = 1123;                       // A4 at 96 dpi
  var CAP = { first: 17, next: 26, lastFirst: 8, lastNext: 16 };

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var num = function (n) { return Number(n || 0).toLocaleString("en-US"); };
  var money = function (n) { return "Rs. " + num(n); };
  var ngo = function () { return window.NGO || {}; };

  /* ---------- amount in words (Pakistani grouping: lakh / crore) ---------- */
  function words(n) {
    n = Math.floor(Number(n) || 0);
    if (n === 0) return "Zero";
    var a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
      "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    var b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    var two = function (x) { return x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : ""); };
    var three = function (x) {
      var s = "";
      if (x >= 100) { s = a[Math.floor(x / 100)] + " Hundred"; x %= 100; if (x) s += " "; }
      return s + (x ? two(x) : "");
    };
    var out = [], units = [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]];
    for (var i = 0; i < units.length; i++) {
      if (n >= units[i][0]) {
        var q = Math.floor(n / units[i][0]);
        out.push((q >= 100 ? three(q) : two(q)) + " " + units[i][1]);
        n %= units[i][0];
      }
    }
    if (n > 0) out.push(three(n));
    return out.join(" ");
  }

  var maskCnic = function (c) {
    return String(c || "").replace(/^(\d{5})-(\d{7})-(\d)$/, "$1-*******-$3") || "—";
  };

  function qrDataUrl(text, size) {
    return new Promise(function (resolve) {
      if (!window.QRCode) return resolve("");
      var d = document.createElement("div");
      d.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.appendChild(d);
      try {
        new window.QRCode(d, { text: text, width: size, height: size, colorDark: "#161616", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.M });
        setTimeout(function () {
          var c = d.querySelector("canvas"), im = d.querySelector("img"), u = "";
          try { u = c ? c.toDataURL("image/png") : (im ? im.src : ""); } catch (e) { u = ""; }
          d.remove(); resolve(u);
        }, 80);
      } catch (e) { d.remove(); resolve(""); }
    });
  }

  /* ---------- pagination: never split a row, leave room for the closing block ---------- */
  function paginate(rows) {
    if (rows.length <= CAP.lastFirst) return [rows];
    if (rows.length <= CAP.first) return [rows, []];           // closing block moves to page 2
    var pages = [rows.slice(0, CAP.first)], i = CAP.first;
    while (i < rows.length) {
      var rest = rows.length - i;
      if (rest <= CAP.lastNext) { pages.push(rows.slice(i)); break; }
      if (rest <= CAP.next) { pages.push(rows.slice(i)); pages.push([]); break; }
      pages.push(rows.slice(i, i + CAP.next)); i += CAP.next;
    }
    return pages;
  }

  /* ---------- styles (scoped with .lp-) ---------- */
  var CSS = '<style>' +
    '.lp-page{width:' + PW + 'px;height:' + PH + 'px;position:relative;background:#fff;color:#161616;font-family:Inter,Arial,Helvetica,sans-serif;overflow:hidden;box-sizing:border-box;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.lp-page *{box-sizing:border-box;margin:0;padding:0}' +
    '.lp-top{height:8px;background:linear-gradient(to bottom,#161616 0,#161616 3px,#fff 3px,#fff 4px,#ff385c 4px,#ff385c 8px)}' +
    '.lp-in{padding:24px 44px 0}' +
    '.lp-letter{display:flex;align-items:center;gap:16px}' +
    '.lp-logo{width:66px;height:66px;border-radius:50%;object-fit:contain;border:3px solid #ff385c;background:#fff;padding:3px;flex-shrink:0}' +
    '.lp-org h1{font-family:Fraunces,Georgia,serif;font-size:25px;font-weight:700;line-height:1.1}' +
    '.lp-org p{font-size:10.5px;color:#4a4d55;margin-top:4px;line-height:1.55}' +
    '.lp-doc{margin-left:auto;text-align:right}' +
    '.lp-doc b{display:block;font-size:10.5px;letter-spacing:.24em;color:#c4123f;font-weight:700}' +
    '.lp-doc span{display:block;font-size:10.5px;color:#4a4d55;margin-top:4px;line-height:1.5}' +
    '.lp-rule{height:1.6px;background:#161616;margin-top:15px}' +
    '.lp-title{margin-top:16px;display:flex;justify-content:space-between;align-items:flex-end}' +
    '.lp-title h2{font-family:Fraunces,Georgia,serif;font-size:22px;font-weight:700}' +
    '.lp-title h2:after{content:"";display:block;width:50px;height:3.5px;border-radius:2px;margin-top:7px;background:#ff385c}' +
    '.lp-title small{font-size:11px;color:#4a4d55}' +
    '.lp-member{margin-top:15px;border:1.2px solid #c9ccd3;border-radius:12px;padding:13px 16px;display:flex;gap:16px;align-items:center;background:#fafafb}' +
    '.lp-photo{width:66px;height:80px;border-radius:9px;object-fit:cover;border:1.5px solid #161616;flex-shrink:0;background:#f1f2f5}' +
    '.lp-mgrid{flex:1;display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:10px 16px}' +
    '.lp-k{font-size:8.5px;letter-spacing:.2em;font-weight:700;color:#5a5d65;text-transform:uppercase}' +
    '.lp-v{font-size:12.5px;font-weight:600;margin-top:3px;word-break:break-word}' +
    '.lp-chip{display:inline-block;height:22px;line-height:19px;padding:0 13px 0 14px;border:1.5px solid #161616;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.14em;vertical-align:top;white-space:nowrap}' +
    '.lp-sum{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:12px;margin-top:13px}' +
    '.lp-box{border:1.2px solid #c9ccd3;border-radius:12px;padding:11px 16px}' +
    '.lp-box.main{border-left:5px solid #ff385c;background:#fff8f9}' +
    '.lp-big{font-family:Fraunces,Georgia,serif;font-size:25px;font-weight:700;margin-top:3px;line-height:1.1}' +
    '.lp-mid{font-size:16px;font-weight:700;margin-top:4px}' +
    '.lp-sub{font-size:10px;color:#5a5d65;margin-top:2px}' +
    '.lp-table{width:100%;border-collapse:collapse;margin-top:15px;font-size:11.5px;table-layout:fixed}' +
    '.lp-table th{background:#f1f2f5;border-top:1.6px solid #161616;border-bottom:1.6px solid #161616;padding:9px 9px;text-align:left;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#2a2c31}' +
    '.lp-table td{height:32px;padding:0 9px;border-bottom:1px solid #e3e5ea;vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.lp-table tbody tr:nth-child(even) td{background:#fafafb}' +
    '.lp-table .r{text-align:right;font-variant-numeric:tabular-nums}' +
    '.lp-table td.amt{font-weight:700}' +
    '.lp-table td.muted{color:#5a5d65;font-size:10.5px}' +
    '.lp-empty td{height:54px;text-align:center;color:#5a5d65;font-style:italic;white-space:normal}' +
    '.lp-cont{font-size:10px;color:#5a5d65;text-align:right;margin-top:6px;letter-spacing:.08em}' +
    '.lp-total{margin-top:0;display:flex;justify-content:space-between;align-items:center;padding:11px 9px;border-bottom:1.6px solid #161616;background:#f1f2f5;font-weight:700;font-size:13px}' +
    '.lp-words{margin-top:14px;border:1.2px dashed #9a9da6;border-radius:10px;padding:10px 14px;font-size:11.5px;line-height:1.55}' +
    '.lp-words b{font-size:8.5px;letter-spacing:.2em;color:#5a5d65;display:block;margin-bottom:3px}' +
    '.lp-note{font-size:10px;color:#62656d;line-height:1.65;margin-top:12px}' +
    '.lp-sign{display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px}' +
    '.lp-auth{position:relative;width:300px;height:132px}' +
    '.lp-auth .st{position:absolute;left:0;top:-4px;width:130px;height:130px;object-fit:contain;transform:rotate(-6deg)}' +
    '.lp-auth .sg{position:absolute;left:96px;right:0;top:44px;height:66px;display:flex;align-items:flex-end;justify-content:center}' +
    '.lp-auth .sg img{max-height:64px;max-width:196px;object-fit:contain}' +
    '.lp-auth .l{position:absolute;left:70px;right:0;bottom:0;border-top:1.6px solid #161616;padding-top:6px;text-align:center;font-size:9px;font-weight:700;letter-spacing:.18em;color:#4a4d55}' +
    '.lp-qr{text-align:center;font-size:8.5px;color:#4a4d55;line-height:1.4;width:96px}' +
    '.lp-qr img{width:84px;height:84px;display:block;margin:0 auto 4px;border:1.4px solid #161616;padding:3px;border-radius:6px}' +
    '.lp-cmp{display:flex;align-items:center;gap:12px}' +
    '.lp-cmp .lp-logo{width:36px;height:36px;border-width:2px;padding:2px}' +
    '.lp-cmp b{font-family:Fraunces,Georgia,serif;font-size:15px}' +
    '.lp-cmp small{display:block;font-size:9.5px;color:#4a4d55;margin-top:2px}' +
    '.lp-foot{position:absolute;left:0;right:0;bottom:0;padding:10px 44px 13px;border-top:1.6px solid #161616;background:linear-gradient(180deg,#fffafb,#fff0f3);display:flex;justify-content:space-between;align-items:center;font-size:9.5px;color:#4a4d55;line-height:1.6}' +
    '.lp-foot b{color:#161616}' +
    '.lp-foot .pg{text-align:right;font-weight:700;color:#161616}' +
    '</style>';

  /* ---------- one page ---------- */
  function pageHTML(ctx, idx, total, rows, startNo) {
    var n = ctx.ngo, m = ctx.m, isFirst = idx === 0, isLast = idx === total - 1;
    var head;
    if (isFirst) {
      head =
        '<div class="lp-letter">' +
          '<img class="lp-logo" src="' + esc(ctx.logo) + '" alt="">' +
          '<div class="lp-org"><h1>' + esc(n.name || "Rising Hope Society") + '</h1>' +
            '<p>' + esc(n.address || "Khairpur Tamewali, Bahawalpur") + '<br>' +
            esc([n.phone, n.email].filter(Boolean).join("  ·  ")) + '</p></div>' +
          '<div class="lp-doc"><b>OFFICIAL STATEMENT</b>' +
            '<span>Statement no. <b style="display:inline;letter-spacing:0;color:#161616;font-size:10.5px">' + esc(ctx.stmtNo) + '</b><br>Generated ' + esc(ctx.generated) + '</span></div>' +
        '</div><div class="lp-rule"></div>' +
        '<div class="lp-title"><h2>Charity Donation Statement</h2><small>' + esc(ctx.period) + '</small></div>' +
        '<div class="lp-member">' +
          (ctx.photo ? '<img class="lp-photo" src="' + esc(ctx.photo) + '" alt="">' : '<div class="lp-photo"></div>') +
          '<div class="lp-mgrid">' +
            '<div><div class="lp-k">Member name</div><div class="lp-v">' + esc(m.fullName || "—") + '</div></div>' +
            '<div><div class="lp-k">Registration no.</div><div class="lp-v">' + esc(m.registrationNo || "—") + '</div></div>' +
            '<div><div class="lp-k">Membership type</div><div class="lp-v">' + esc(m.membershipType || "Member") + '</div></div>' +
            '<div><div class="lp-k">CNIC</div><div class="lp-v">' + esc(maskCnic(m.cnic)) + '</div></div>' +
            '<div><div class="lp-k">Valid upto</div><div class="lp-v">' + esc(m.validUpto || "—") + '</div></div>' +
            '<div><div class="lp-k">Status</div><div class="lp-v"><span class="lp-chip">' + esc(String(m.status || "—").toUpperCase()) + '</span></div></div>' +
          '</div></div>' +
        '<div class="lp-sum">' +
          '<div class="lp-box main"><div class="lp-k">Total charity donated</div><div class="lp-big">' + esc(money(ctx.total)) + '</div></div>' +
          '<div class="lp-box"><div class="lp-k">Donations</div><div class="lp-mid">' + ctx.count + '</div><div class="lp-sub">recorded</div></div>' +
          '<div class="lp-box"><div class="lp-k">Last donation</div><div class="lp-mid">' + esc(ctx.lastDate) + '</div><div class="lp-sub">' + esc(ctx.lastAmt) + '</div></div>' +
        '</div>';
    } else {
      head =
        '<div class="lp-letter"><div class="lp-cmp"><img class="lp-logo" src="' + esc(ctx.logo) + '" alt="">' +
          '<div><b>' + esc(n.name || "Rising Hope Society") + '</b><small>Charity Donation Statement — ' + esc(m.fullName || "") + ' · ' + esc(m.registrationNo || "") + '</small></div></div>' +
          '<div class="lp-doc"><b>STATEMENT ' + esc(ctx.stmtNo) + '</b></div></div><div class="lp-rule"></div>';
    }

    var body = "";
    if (rows.length || isFirst) {
      body += '<table class="lp-table"><colgroup><col style="width:34px"><col style="width:92px"><col style="width:112px"><col style="width:102px"><col style="width:112px"><col></colgroup>' +
        '<thead><tr><th>#</th><th>Date</th><th>Method</th><th class="r">Amount</th><th class="r">Running total</th><th>Membership validity</th></tr></thead><tbody>';
      if (!rows.length) {
        body += '<tr class="lp-empty"><td colspan="6">No donation records found for this member.</td></tr>';
      } else {
        rows.forEach(function (d, i) {
          var val = d.daysAdded ? "+" + d.daysAdded + " days · till " + esc(d.validUpto || "—") : "—";
          body += '<tr><td class="muted">' + (startNo + i) + '</td><td>' + esc(d.date || "—") + '</td>' +
            '<td>' + esc(d.paymentMethod || d.method || "Cash") + '</td>' +
            '<td class="r amt">' + esc(num(d.amount)) + '</td><td class="r">' + esc(num(d.runningTotal)) + '</td>' +
            '<td class="muted">' + val + '</td></tr>';
        });
      }
      body += '</tbody></table>';
      if (!isLast) body += '<div class="lp-cont">Continued on next page →</div>';
    }

    var closing = "";
    if (isLast) {
      var sig = ctx.sig ? '<img src="' + esc(ctx.sig) + '" alt="">' : "";
      closing =
        '<div class="lp-total"><span>Total charity donated (' + ctx.count + (ctx.count === 1 ? ' donation' : ' donations') + ')</span><span>' + esc(money(ctx.total)) + '</span></div>' +
        '<div class="lp-words"><b>AMOUNT IN WORDS</b>Rupees ' + esc(words(ctx.total)) + ' only.</div>' +
        '<p class="lp-note">This statement lists the charity donations recorded by ' + esc(n.name || "Rising Hope Society") + ' against the member named above. ' +
        'Membership validity follows the society\'s validation rules for each donation amount. ' +
        'This is a computer-generated statement; to confirm it, scan the QR code or visit the verification page.</p>' +
        '<div class="lp-sign">' +
          '<div class="lp-qr">' + (ctx.qr ? '<img src="' + ctx.qr + '" alt="">' : '') + 'Scan to verify<br>online</div>' +
          '<div class="lp-auth">' + (ctx.stamp ? '<img class="st" src="' + esc(ctx.stamp) + '" alt="">' : '') +
            '<div class="sg">' + sig + '</div><div class="l">AUTHORIZED SIGNATORY</div></div>' +
        '</div>';
    }

    return '<section class="lp-page"><div class="lp-top"></div><div class="lp-in">' + head + body + closing + '</div>' +
      '<div class="lp-foot"><div><b>' + esc(n.name || "Rising Hope Society") + '</b> · ' + esc(n.address || "Khairpur Tamewali, Bahawalpur") + '<br>' +
      esc([n.phone, n.email].filter(Boolean).join("  ·  ")) + '</div>' +
      '<div class="pg">Statement ' + esc(ctx.stmtNo) + '<br>Page ' + (idx + 1) + ' of ' + total + '</div></div></section>';
  }

  function build(data, n) {
    var m = data.member || {}, donations = data.donations || [];
    n = n || ngo();
    var total = data.total != null ? data.total : donations.reduce(function (s, d) { return s + (Number(d.amount) || 0); }, 0);
    var now = new Date();
    var ymd = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    var last = donations[donations.length - 1];
    var ctx = {
      ngo: n, m: m, total: total, count: donations.length,
      logo: n.logoUrl || "images/logo.png",
      sig: n.signatureUrl || "",
      stamp: n.stampUrl || "images/stamp.png",
      photo: m.photo ? (window.RHS && window.RHS.imgUrl ? window.RHS.imgUrl(m.photo, 200) : m.photo) : "",
      stmtNo: "CL-" + (m.registrationNo || "NA") + "-" + ymd,
      generated: now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      period: donations.length ? "Period: " + (donations[0].date || "—") + " to " + (last.date || "—") : "No donations recorded",
      lastDate: last ? (last.date || "—") : "—",
      lastAmt: last ? money(last.amount) : "",
      qr: ""
    };
    return ctx;
  }

  function buildPagesHTML(data, ctx) {
    ctx = ctx || build(data);
    var pages = paginate(data.donations || []);
    var no = 1;
    return CSS + pages.map(function (rows, i) {
      var html = pageHTML(ctx, i, pages.length, rows, no);
      no += rows.length;
      return html;
    }).join("");
  }

  // Fresh settings straight from the admin panel data (same place the card reads from)
  function loadSettings() {
    var base = Object.assign({}, ngo());
    if (!(window.RHS && window.RHS.getNGOSettings)) return Promise.resolve(base);
    return Promise.race([window.RHS.getNGOSettings(), new Promise(function (r) { setTimeout(function () { r(null); }, 4000); })])
      .then(function (r) {
        if (!r) return base;
        return Object.assign(base, {
          name: r.ngoName || base.name, phone: r.ngoPhone || base.phone, address: r.ngoAddress || base.address, email: r.ngoEmail || base.email,
          logoUrl: r.logoUrl || base.logoUrl || "", signatureUrl: r.presidentSignatureUrl || base.signatureUrl || "", stampUrl: r.stampUrl || base.stampUrl || ""
        });
      }).catch(function () { return base; });
  }
  // Embed images as data URLs so nothing is lost when the page is turned into a PDF
  function toData(url) {
    return new Promise(function (resolve) {
      if (!url || /^data:/.test(url)) return resolve(url || "");
      fetch(url, { mode: "cors" }).then(function (r) { if (!r.ok) throw new Error("x"); return r.blob(); })
        .then(function (b) { var fr = new FileReader(); fr.onload = function () { resolve(fr.result); }; fr.onerror = function () { resolve(url); }; fr.readAsDataURL(b); })
        .catch(function () { resolve(url); });
    });
  }

  function waitImages(root) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll("img"));
    var all = Promise.all(imgs.map(function (img) {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(function (r) { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); });
    }));
    return Promise.race([all, new Promise(function (r) { setTimeout(r, 5000); })]);
  }

  function download(data) {
    var ctx;
    return loadSettings().then(function (n) {
      ctx = build(data, n);
      return Promise.all([toData(ctx.logo), toData(ctx.photo), toData(ctx.sig), toData(ctx.stamp), qrDataUrl(location.origin + "/member.html#verify", 160)]);
    }).then(function (r) {
      ctx.logo = r[0] || ctx.logo; ctx.photo = r[1]; ctx.sig = r[2]; ctx.stamp = r[3]; ctx.qr = r[4];
      var host = document.createElement("div");
      host.id = "rhsLedgerHost";
      host.style.cssText = "position:fixed;left:-99999px;top:0;width:" + PW + "px;z-index:-1";
      host.innerHTML = buildPagesHTML(data, ctx);
      document.body.appendChild(host);

      var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 2500); })]) : Promise.resolve();
      return Promise.all([waitImages(host), fontsReady]).then(function () {
        var filename = "Charity-Ledger-" + String((data.member || {}).registrationNo || "RHS").replace(/[^\w-]+/g, "") + ".pdf";
        if (!window.html2canvas || !(window.jspdf && window.jspdf.jsPDF)) {
          // libraries missing -> native print of the same pages
          var pa = document.getElementById("printCert");
          if (pa) { pa.innerHTML = host.innerHTML; host.remove(); window.print(); window.addEventListener("afterprint", function () { pa.innerHTML = ""; }, { once: true }); }
          return;
        }
        var pdf = new window.jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        var els = host.querySelectorAll(".lp-page"), chain = Promise.resolve();
        els.forEach(function (el, i) {
          chain = chain.then(function () {
            return window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: PW, height: PH, windowWidth: PW, windowHeight: PH })
              .then(function (canvas) {
                if (i) pdf.addPage();
                pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);
              });
          });
        });
        return chain.then(function () { pdf.save(filename); host.remove(); });
      }).catch(function (e) { host.remove(); throw e; });
    });
  }

  window.RHSLedger = { download: download, buildPagesHTML: buildPagesHTML, _words: words, _paginate: paginate };
})();
