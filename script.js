// RHS Firebase Mode - Complete Fixed Version

/* ===================== GLOBAL UTILITIES ===================== */
function setLoading(btn, loading, text="") {
  if (!btn) return;
  if (loading) {
    btn._origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${text} <i class="fa-solid fa-spinner fa-spin"></i>`;
    btn.style.opacity = "0.85";
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._origHtml || btn.innerHTML;
    btn.style.opacity = "1";
  }
}

function resetForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll("input, textarea, select").forEach(el => {
    if (el.type === "submit" || el.type === "button") return;
    el.value = "";
    el.removeAttribute("value");
  });
  form.querySelectorAll(".form-msg").forEach(el => {
    el.textContent = "";
    el.className = "form-msg";
  });
}

/* ===================== NGO SETTINGS ===================== */
window.NGO = {
  name: "Rising Hope Society",
  phone: "0346-4800064",
  address: "Khairpur Tamewali, Bahawalpur, Punjab, Pakistan",
  email: "risinghopesociety@gmail.com",
  bank: "111111111111111",
  alert: "0346-4800064",
  ourTeamTitle: "Our Team",
  ourTeamMatter: ""
};

function loadNGOSettings() {
  if (!window.RHS) { setTimeout(loadNGOSettings, 500); return; }
  RHS.getNGOSettings().then(res => {
    window.NGO = {
      name:         res.ngoName        || window.NGO.name,
      phone:        res.ngoPhone       || window.NGO.phone,
      address:      res.ngoAddress     || window.NGO.address,
      email:        res.ngoEmail       || window.NGO.email,
      bank:         res.bankAccount    || window.NGO.bank,
      alert:        res.alertNumber    || res.ngoPhone || window.NGO.alert,
      ourTeamTitle: res.ourTeamTitle   || "Our Team",
      ourTeamMatter:res.ourTeamMatter  || ""
    };
    document.querySelectorAll(".ngo-name").forEach(el => el.textContent = window.NGO.name);
    document.querySelectorAll(".ngo-address").forEach(el => el.textContent = window.NGO.address);
    document.querySelectorAll(".ngo-phone").forEach(el => el.textContent = window.NGO.phone);
    document.querySelectorAll(".ngo-email").forEach(el => el.textContent = window.NGO.email);
    const teamTitle = document.querySelector("#team .section-head h2");
    if (teamTitle) teamTitle.textContent = window.NGO.ourTeamTitle;
    const teamMatter = document.querySelector("#team .section-head p");
    if (teamMatter && window.NGO.ourTeamMatter) teamMatter.textContent = window.NGO.ourTeamMatter;
  }).catch(() => {});
}

/* ===================== PAGE LOADER ===================== */
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.classList.add("done");
  }, 1200);
});

/* ===================== INIT AFTER DOM ===================== */
document.addEventListener("DOMContentLoaded", () => {

  /* AUTOCOMPLETE OFF */
  document.querySelectorAll("input, textarea, select, form").forEach(el => {
    el.setAttribute("autocomplete", "off");
  });

  /* NAVBAR */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
        navLinks.querySelectorAll("a").forEach(a => a.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }

  /* SCROLL ACTIVE NAV */
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    let current = "home";
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    if (navLinks) {
      navLinks.querySelectorAll("a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    }
  });

  /* HERO SLIDER */
  const slides = document.querySelectorAll(".slide");
  const dotsWrap = document.getElementById("sliderDots");
  if (slides.length && dotsWrap) {
    let currentSlide = 0;
    let sliderInterval;
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll(".dot");
    function goToSlide(index) {
      slides[currentSlide].classList.remove("active");
      dots[currentSlide].classList.remove("active");
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add("active");
      dots[currentSlide].classList.add("active");
    }
    function startSlider() { sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5500); }
    function resetSlider() { clearInterval(sliderInterval); startSlider(); }
    const nextBtn = document.getElementById("nextSlide");
    const prevBtn = document.getElementById("prevSlide");
    if (nextBtn) nextBtn.addEventListener("click", () => { goToSlide(currentSlide + 1); resetSlider(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { goToSlide(currentSlide - 1); resetSlider(); });
    startSlider();
  }

  /* CNIC FORMAT */
  document.querySelectorAll('[id*="cnic"],[id*="Cnic"],[placeholder*="00000-"]').forEach(el => {
    el.setAttribute("autocomplete", "new-password");
    el.addEventListener("input", function() {
      let v = this.value.replace(/\D/g, "").slice(0, 13);
      if (v.length > 12) v = v.slice(0,5) + "-" + v.slice(5,12) + "-" + v.slice(12);
      else if (v.length > 5) v = v.slice(0,5) + "-" + v.slice(5);
      this.value = v;
    });
  });

  /* DOB FORMAT */
  document.querySelectorAll('[id*="dob"],[id*="Dob"],[placeholder*="dd-mm-yyyy"]').forEach(el => {
    el.setAttribute("autocomplete", "new-password");
    el.addEventListener("input", function() {
      let v = this.value.replace(/\D/g, "").slice(0, 8);
      if (v.length > 4) v = v.slice(0,2) + "-" + v.slice(2,4) + "-" + v.slice(4);
      else if (v.length > 2) v = v.slice(0,2) + "-" + v.slice(2);
      this.value = v;
    });
    el.addEventListener("blur", function() {
      const val = this.value.trim();
      this.style.borderColor = (val && !/^\d{2}-\d{2}-\d{4}$/.test(val)) ? "#D9483A" : "";
    });
  });

  /* MOBILE FORMAT */
  document.querySelectorAll('[id*="mobile"],[id*="Mobile"],[placeholder*="0300-"],[placeholder*="0346-"]').forEach(el => {
    el.addEventListener("input", function() {
      let v = this.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 4) v = v.slice(0,4) + "-" + v.slice(4);
      this.value = v;
    });
  });

  /* STATISTICS */
  function animateCount(el, target) {
    target = Number(target) || 0;
    const duration = 1400;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }

  function loadStatistics() {
    if (!window.RHS) { setTimeout(loadStatistics, 500); return; }
    RHS.getStatistics().then(res => {
      document.querySelectorAll(".stat-num").forEach(el => {
        const key = el.dataset.key;
        if (key && res[key] !== undefined) {
          el.dataset.target = res[key];
        }
      });
    }).catch(() => {});
  }
  loadStatistics();

  const statsEl = document.getElementById("stats");
  if (statsEl) {
    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll(".stat-num").forEach(el => {
            animateCount(el, el.dataset.target || 0);
          });
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsEl);
  }

  /* YEAR */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* REGISTRATION FORM */
  const regForm = document.getElementById("regForm");
  const formMsg = document.getElementById("formMsg");
  const formResult = document.getElementById("formResult");
  const submitBtn = document.getElementById("submitBtn");

  if (regForm) {
    regForm.addEventListener("reset", () => {
      setTimeout(() => {
        if (formMsg) { formMsg.textContent = ""; formMsg.className = "form-msg"; }
      }, 0);
    });

    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!formMsg) return;
      formMsg.textContent = "";
      formMsg.className = "form-msg";

      const cnic     = document.getElementById("cnic")?.value.trim() || "";
      const dob      = document.getElementById("dob")?.value.trim() || "";
      const fullName = document.getElementById("fullName")?.value.trim() || "";
      const father   = document.getElementById("fatherName")?.value.trim() || "";
      const gender   = document.getElementById("gender")?.value || "";
      const prof     = document.getElementById("profession")?.value.trim() || "";
      const email    = document.getElementById("email")?.value.trim() || "";
      const mobile   = document.getElementById("mobile")?.value.trim() || "";
      const province = document.getElementById("province")?.value || "";
      const address  = document.getElementById("address")?.value.trim() || "";

      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) { formMsg.textContent = "⚠️ Valid CNIC required: 00000-0000000-0"; formMsg.classList.add("error"); return; }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) { formMsg.textContent = "⚠️ DOB format: dd-mm-yyyy"; formMsg.classList.add("error"); return; }
      if (!fullName) { formMsg.textContent = "⚠️ Full Name required."; formMsg.classList.add("error"); return; }
      if (!father) { formMsg.textContent = "⚠️ Father/Husband Name required."; formMsg.classList.add("error"); return; }
      if (!gender) { formMsg.textContent = "⚠️ Please select Gender."; formMsg.classList.add("error"); return; }
      if (!prof) { formMsg.textContent = "⚠️ Profession required."; formMsg.classList.add("error"); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { formMsg.textContent = "⚠️ Valid Email required."; formMsg.classList.add("error"); return; }
      if (!/^\d{4}-\d{7}$/.test(mobile)) { formMsg.textContent = "⚠️ Mobile format: 0300-0000000"; formMsg.classList.add("error"); return; }
      if (!province) { formMsg.textContent = "⚠️ Please select Province."; formMsg.classList.add("error"); return; }
      if (!address) { formMsg.textContent = "⚠️ Address required."; formMsg.classList.add("error"); return; }

      setLoading(submitBtn, true, 'Submitting...');

      // Upload photo if selected
      let photoUrl = "";
      const photoFile = document.getElementById("regPhoto")?.files?.[0];
      if (photoFile && window.RHS) {
        try { photoUrl = await RHS.uploadImage(photoFile, "rhs/members"); } catch(err) {}
      }

      if (!window.RHS) { setLoading(submitBtn, false); formMsg.textContent = "Please wait, loading..."; return; }

      RHS.registerMember({ cnic, dob, fullName, fatherName: father, gender, profession: prof, email, mobile, province, address, photo: photoUrl })
      .then(res => {
        setLoading(submitBtn, false);
        if (res.success) {
          if (regForm) regForm.hidden = true;
          if (formResult) {
            formResult.hidden = false;
            formResult.classList.remove("error");
            const resultTitle = document.getElementById("resultTitle");
            const resultText = document.getElementById("resultText");
            if (resultTitle) resultTitle.textContent = "Registration Submitted!";
            if (resultText) resultText.textContent = res.message || "";
          }
        } else if (res.code === "DUPLICATE") {
          if (regForm) regForm.hidden = true;
          if (formResult) {
            formResult.hidden = false;
            formResult.classList.add("error");
            const resultTitle = document.getElementById("resultTitle");
            const resultText = document.getElementById("resultText");
            if (resultTitle) resultTitle.textContent = "Already Registered";
            if (resultText) resultText.textContent = res.message || "";
          }
        } else {
          formMsg.textContent = res.message || "Something went wrong.";
          formMsg.classList.add("error");
        }
      }).catch(() => {
        setLoading(submitBtn, false);
        formMsg.textContent = "Network error. Please try again.";
        formMsg.classList.add("error");
      });
    });

    const newRegBtn = document.getElementById("newRegBtn");
    if (newRegBtn) {
      newRegBtn.addEventListener("click", () => {
        regForm.reset();
        regForm.hidden = false;
        if (formResult) formResult.hidden = true;
        if (formMsg) formMsg.textContent = "";
      });
    }
  }

  /* CERTIFICATE VERIFICATION */
  const verifyForm = document.getElementById("verifyForm");
  const verifyMsg = document.getElementById("verifyMsg");
  const certResult = document.getElementById("certResult");
  const verifyBtn = document.getElementById("verifyBtn");

  if (verifyForm) {
    verifyForm.addEventListener("submit", (e) => { e.preventDefault(); doVerify(); });
  }

  function doVerify() {
    if (!verifyMsg || !certResult) return;
    verifyMsg.textContent = "";
    verifyMsg.className = "form-msg";
    certResult.hidden = true;
    certResult.innerHTML = "";
    const cnic = document.getElementById("vCnic")?.value.trim() || "";
    const dob  = document.getElementById("vDob")?.value.trim() || "";
    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic) || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      verifyMsg.textContent = "Please enter valid CNIC and DOB (dd-mm-yyyy).";
      verifyMsg.classList.add("error"); return;
    }
    setLoading(verifyBtn, true, 'Verifying...');
    if (!window.RHS) { setLoading(verifyBtn, false); return; }
    RHS.getMemberByCredentials(cnic, dob).then(res => {
      setLoading(verifyBtn, false);
      if (res.success && res.found && res.active) {
        renderCertificate(res.member);
      } else if (res.success && res.found) {
        certResult.hidden = false;
        certResult.innerHTML = `<div class="status-msg status-yellow"><i class="fa-solid fa-hourglass-half"></i><div class="status-title">Status: ${res.member.status}</div><p>${res.message||""}</p><p class="status-note">📞 ${window.NGO.alert} | 📧 ${window.NGO.email}</p></div>`;
      } else {
        verifyMsg.textContent = res.message || "Record not found.";
        verifyMsg.classList.add("error");
      }
    }).catch(() => { setLoading(verifyBtn, false); verifyMsg.textContent = "Network error."; verifyMsg.classList.add("error"); });
  }

  function renderCertificate(member) {
    if (!certResult) return;
    certResult.hidden = false;
    certResult.innerHTML = `
      <div class="cert-card">
        <div class="cert-header">
          <h3><i class="fa-solid fa-certificate"></i> Digital Membership Certificate</h3>
          <span class="cert-badge">Active</span>
        </div>
        <div class="cert-grid">
          <div class="item"><span class="lbl">Full Name</span><span class="val">${member.fullName}</span></div>
          <div class="item"><span class="lbl">Reg No</span><span class="val">${member.registrationNo}</span></div>
          <div class="item"><span class="lbl">Membership</span><span class="val">${member.membershipType||"—"}</span></div>
          <div class="item"><span class="lbl">Gender</span><span class="val">${member.gender}</span></div>
          <div class="item"><span class="lbl">Mobile</span><span class="val">${member.mobile}</span></div>
          <div class="item"><span class="lbl">Valid Upto</span><span class="val">${member.validUpto||"—"}</span></div>
          <div class="item" style="grid-column:1/-1"><span class="lbl">Address</span><span class="val">${member.address}</span></div>
        </div>
        <div class="cert-actions">
          <button class="btn btn-primary" onclick="printCertificate(${JSON.stringify(member).replace(/"/g,'&quot;')})">
            Download / Print <i class="fa-solid fa-print"></i>
          </button>
        </div>
        <p class="cert-footnote">Computer-generated digital certificate. No signature required.</p>
      </div>`;
  }

  window.printCertificate = function(member) {
    const pa = document.getElementById("printCert");
    if (!pa) return;
    pa.innerHTML = `<div style="border:6px double #14534F;padding:40px;text-align:center;font-family:Georgia,serif;">
      <h1 style="color:#14534F">${window.NGO.name}</h1>
      <p style="letter-spacing:2px;color:#E8A33D">DIGITAL MEMBERSHIP CERTIFICATE</p>
      <h2>${member.fullName}</h2>
      <p>is a verified ${member.membershipType||"Member"} of ${window.NGO.name}</p>
      <table style="margin:20px auto;text-align:left">
        <tr><td style="padding:4px 12px;font-weight:bold">Reg No:</td><td>${member.registrationNo}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold">Valid Upto:</td><td>${member.validUpto||"—"}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold">Mobile:</td><td>${member.mobile}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold">Address:</td><td>${member.address}</td></tr>
      </table>
      <p style="margin-top:30px;color:#888;font-size:12px">${window.NGO.address} — Verified Digitally</p>
    </div>`;
    window.print();
    setTimeout(() => { pa.innerHTML = ""; }, 2000);
  };

  /* CLEAR VERIFY BTN */
  const verifyClearBtn = document.getElementById("verifyClearBtn");
  if (verifyClearBtn) {
    verifyClearBtn.addEventListener("click", () => {
      const vCnic = document.getElementById("vCnic");
      const vDob = document.getElementById("vDob");
      if (vCnic) vCnic.value = "";
      if (vDob) vDob.value = "";
      if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
      if (verifyMsg) { verifyMsg.textContent = ""; verifyMsg.className = "form-msg"; }
      if (verifyForm) verifyForm.style.display = "block";
    });
  }
  
  /* CHARITY DONATION CLEAR BTN */
  window.closeLedger = function() {
    if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
    if (verifyForm) verifyForm.style.display = "block";
    if (verifyMsg) { verifyMsg.textContent = ""; verifyMsg.className = "form-msg"; }
    const vCnic = document.getElementById("vCnic");
    const vDob = document.getElementById("vDob");
    if (vCnic) vCnic.value = "";
    if (vDob) vDob.value = "";
  };

  /* CHARITY LEDGER */
  const verifyDonationBtn = document.getElementById("verifyCharityBtn");
  if (verifyDonationBtn) {
    verifyDonationBtn.addEventListener("click", () => {
      const cnic = document.getElementById("vCnic")?.value.trim() || "";
      const dob  = document.getElementById("vDob")?.value.trim()  || "";
      const donResult = document.getElementById("donationResult");
      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
        if (verifyMsg) { verifyMsg.textContent = "⚠️ Valid CNIC: 00000-0000000-0"; verifyMsg.className = "form-msg error"; } return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        if (verifyMsg) { verifyMsg.textContent = "⚠️ DOB: dd-mm-yyyy"; verifyMsg.className = "form-msg error"; } return;
      }
      if (verifyMsg) { verifyMsg.textContent = ""; verifyMsg.className = "form-msg"; }
      if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
      if (donResult) donResult.innerHTML = "";
      setLoading(verifyDonationBtn, true, "Loading...");
      if (!window.RHS) { setLoading(verifyDonationBtn, false); return; }
      RHS.getCharityLedger(cnic, dob).then(res => {
        setLoading(verifyDonationBtn, false);
        if (!res.success) {
          if (verifyMsg) { verifyMsg.textContent = res.message || "Not found."; verifyMsg.className = "form-msg error"; } return;
        }
        const m = res.member;
        const donations = res.donations || [];
        const logoSrc = window.NGO.logoUrl || "images/logo.png";
        const isActive = (m.status||"").toLowerCase()==="active";
        const statusColor = isActive ? "#2E9E5B" : "#D9483A";
        let rows = "";
        if (!donations.length) {
          rows = `<tr><td colspan="4" style="text-align:center;padding:20px;color:#8A9A96;font-style:italic">No charity records found.</td></tr>`;
        } else {
          donations.forEach((d,i) => {
            rows += `<tr style="background:${i%2?"#F5F9F8":"#fff"}">
              <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-family:sans-serif;font-size:.88rem">${d.date||"—"}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-family:sans-serif;font-size:.88rem">${d.paymentMethod||d.method||"Cash"}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;color:#2E9E5B;font-weight:700;font-family:sans-serif;font-size:.88rem">Rs. ${Number(d.amount||0).toLocaleString()}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-weight:700;font-family:sans-serif;font-size:.88rem">Rs. ${Number(d.runningTotal||0).toLocaleString()}</td>
            </tr>`;
          });
        }
        if (donResult) {
          donResult.innerHTML = `
            <div id="ledgerContent" style="border:2px solid #E7DFD2;border-radius:12px;overflow:hidden;background:#fff;font-family:Georgia,serif">
              <div style="background:#14534F;padding:18px 24px;display:flex;align-items:center;gap:14px">
                <img src="${logoSrc}" style="width:50px;height:50px;border-radius:50%;object-fit:contain;background:#fff;padding:4px;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">
                <div style="flex:1">
                  <div style="font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.6);font-family:sans-serif;margin-bottom:2px">CHARITY DONATION LEDGER</div>
                  <div style="font-size:16px;font-weight:700;color:#fff">${window.NGO.name}</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.6);font-family:sans-serif">${window.NGO.address}</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-size:9px;color:rgba(255,255,255,0.5);font-family:sans-serif;margin-bottom:2px">TOTAL CHARITY</div>
                  <div style="font-size:16px;font-weight:700;color:#E8A33D;font-family:sans-serif">Rs. ${res.total.toLocaleString()}</div>
                </div>
              </div>
              <div style="height:3px;background:#E8A33D"></div>
              <div style="padding:16px 24px;display:flex;gap:16px;align-items:center;border-bottom:1px solid #E7DFD2;background:#FAFAF8;flex-wrap:wrap">
                ${m.photo?`<img src="${m.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #14534F;flex-shrink:0">`:`<div style="width:60px;height:60px;border-radius:50%;background:#EEF8F1;border:3px solid #14534F;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa-solid fa-user" style="font-size:1.5rem;color:#4CAF8A"></i></div>`}
                <div style="flex:1;min-width:0">
                  <div style="font-size:16px;font-weight:700;color:#14534F">${m.fullName}</div>
                  <div style="font-size:12px;color:#8A9A96;font-family:sans-serif">${m.registrationNo||"—"} · ${m.membershipType||"Member"}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:11px;color:#8A9A96;font-family:sans-serif;margin-bottom:4px">Valid Upto</div>
                  <div style="font-size:14px;font-weight:700;color:#14534F;font-family:sans-serif">${m.validUpto||"—"}</div>
                  <div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;background:${isActive?"#EEF8F1":"#FEF2F2"};border:1px solid ${statusColor}40;border-radius:20px;padding:3px 10px">
                    <div style="width:6px;height:6px;border-radius:50%;background:${statusColor}"></div>
                    <span style="font-size:11px;font-weight:700;color:${statusColor};font-family:sans-serif">${(m.status||"—").toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;min-width:400px">
                  <thead><tr style="background:#14534F;color:#fff">
                    <th style="padding:10px 14px;text-align:left;font-family:sans-serif;font-size:.82rem">Date</th>
                    <th style="padding:10px 14px;text-align:left;font-family:sans-serif;font-size:.82rem">Payment Method</th>
                    <th style="padding:10px 14px;text-align:left;font-family:sans-serif;font-size:.82rem">Amount</th>
                    <th style="padding:10px 14px;text-align:left;font-family:sans-serif;font-size:.82rem">Running Total</th>
                  </tr></thead>
                  <tbody>${rows}</tbody>
                  <tfoot><tr style="background:#EEF8F1">
                    <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F;font-family:sans-serif">Total Charity Donated</td>
                    <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F;font-size:1rem;font-family:sans-serif">Rs. ${res.total.toLocaleString()}</td>
                  </tr></tfoot>
                </table>
              </div>
              <div style="padding:10px 24px;background:#F5F9F8;text-align:center;border-top:1px solid #E7DFD2">
                <div style="font-size:10px;color:#8A9A96;font-family:sans-serif">⚠️ Computer-generated statement · ${window.NGO.name} · ${window.NGO.phone}</div>
              </div>
              <div style="padding:14px 24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;border-top:1px solid #E7DFD2">
                <button class="btn btn-primary" onclick="printLedger()"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>
                <button class="btn btn-ghost" onclick="document.getElementById('donationResult').innerHTML='';document.getElementById('verifyMsg').textContent=''">
                  <i class="fa-solid fa-arrow-left"></i> Clear
                </button>
              </div>
            </div>`;
        }
      }).catch(() => { setLoading(verifyDonationBtn, false); if(verifyMsg){verifyMsg.textContent="⚠️ Network error.";verifyMsg.className="form-msg error";} });
    });
  }

  window.printLedger = function() {
    const content = document.getElementById("ledgerContent");
    if (!content) return;
    const pa = document.getElementById("printCert");
    if (!pa) return;
    pa.innerHTML = `<style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}</style>${content.outerHTML}`;
    window.print();
    setTimeout(() => { pa.innerHTML = ""; }, 3000);
  };

  window.closeLedger = function() {
    const donResult = document.getElementById("donationResult");
    if (donResult) donResult.innerHTML = "";
    if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
    if (verifyForm) verifyForm.style.display = "block";
    if (verifyMsg) { verifyMsg.textContent = ""; verifyMsg.className = "form-msg"; }
  };

  /* TEAM */
  function loadTeam() {
    if (!window.RHS) { setTimeout(loadTeam, 500); return; }
    const teamGrid = document.getElementById("teamGrid");
    if (!teamGrid) return;
    RHS.getTeam().then(res => {
      if (!res.success || !res.team || !res.team.length) return;
      teamGrid.innerHTML = "";
      res.team.forEach(member => {
        const card = document.createElement("div");
        card.className = "team-card";
        const photoHtml = member.photo
          ? `<div class="photo" style="background-image:url('${member.photo}')"></div>`
          : `<div class="photo" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user" style="font-size:2rem;color:#8A9A96"></i></div>`;
        card.innerHTML = `${photoHtml}<h4>${member.name}</h4><div class="role">${member.designation}</div><p class="bio">${member.bio||""}</p>`;
        teamGrid.appendChild(card);
      });
    }).catch(() => {});
  }
  loadTeam();

  /* CONTACT FORM */
  const contactForm = document.getElementById("contactForm");
  const contactMsg = document.getElementById("contactMsg");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactMsg) return;
      contactMsg.textContent = "";
      contactMsg.className = "form-msg";
      const name    = document.getElementById("cName")?.value.trim() || "";
      const email   = document.getElementById("cEmail")?.value.trim() || "";
      const message = document.getElementById("cMsg")?.value.trim() || "";
      if (!name || !email || !message) { contactMsg.textContent = "⚠️ Please fill all fields."; contactMsg.classList.add("error"); return; }
      const sendBtn = contactForm.querySelector("button[type='submit']");
      setLoading(sendBtn, true, "Sending...");
      if (!window.RHS) { setLoading(sendBtn, false); return; }
      RHS.submitContactMessage({ name, email, message }).then(res => {
        setLoading(sendBtn, false);
        if (res.success) { contactMsg.textContent = "✅ Thank you! Message sent."; contactMsg.classList.add("success"); contactForm.reset(); }
        else { contactMsg.textContent = res.message || "Something went wrong."; contactMsg.classList.add("error"); }
      }).catch(() => { setLoading(sendBtn, false); contactMsg.textContent = "⚠️ Network error."; contactMsg.classList.add("error"); });
    });
  }

  /* MEMBER PORTAL */
  window.showMemberSection = function(which) {
    if (which === "registration") {
      const regSection = document.getElementById("registration");
      if (regSection) {
        regSection.classList.add("show");
        regSection.style.display = "block";
        regSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      const verSection = document.getElementById("verify");
      if (verSection) verSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* CHARITY HELP DESK */
  window.showHelpSection = function(which) {
    const btns = document.getElementById("helpdeskBtns");
    const grantFormWrap = document.getElementById("grantFormWrap");
    const grantStatusWrap = document.getElementById("grantStatusWrap");
    if (btns) btns.style.display = "none";
    if (grantFormWrap) grantFormWrap.style.display = (which === "grantForm" || which === "grant") ? "block" : "none";
    if (grantStatusWrap) grantStatusWrap.style.display = (which === "grantForm" || which === "grant") ? "none" : "block";
    const desk = document.getElementById("charityDesk");
    if (desk) desk.scrollIntoView({ behavior: "smooth" });
  };

  window.hideHelpSection = function() {
    ['grantForm','grantStatusForm'].forEach(resetForm);
    const btns = document.getElementById("helpdeskBtns");
    const grantFormWrap = document.getElementById("grantFormWrap");
    const grantStatusWrap = document.getElementById("grantStatusWrap");
    if (btns) btns.style.display = "flex";
    if (grantFormWrap) grantFormWrap.style.display = "none";
    if (grantStatusWrap) grantStatusWrap.style.display = "none";
    const grantForm2 = document.getElementById("grantForm");
    if (grantForm2) grantForm2.style.display = "block";
    const grantResult2 = document.getElementById("grantResult");
    if (grantResult2) grantResult2.hidden = true;
    const desk = document.getElementById("charityDesk");
    if (desk) desk.scrollIntoView({ behavior: "smooth" });
  };

  /* GRANT FORM */
  const grantForm = document.getElementById("grantForm");
  const grantMsg = document.getElementById("grantMsg");
  const grantResult = document.getElementById("grantResult");
  const grantSubmitBtn = document.getElementById("grantSubmitBtn");

  if (grantForm) {
    grantForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (grantMsg) { grantMsg.textContent = ""; grantMsg.className = "form-msg"; }
      const cnic     = document.getElementById("gCnic")?.value.trim() || "";
      const dob      = document.getElementById("gDob")?.value.trim() || "";
      const name     = document.getElementById("gName")?.value.trim() || "";
      const father   = document.getElementById("gFather")?.value.trim() || "";
      const gender   = document.getElementById("gGender")?.value || "";
      const mobile   = document.getElementById("gMobile")?.value.trim() || "";
      const helpType = document.getElementById("gHelpType")?.value || "";
      const amount   = document.getElementById("gAmount")?.value || "";
      const address  = document.getElementById("gAddress")?.value.trim() || "";
      const email    = document.getElementById("gEmail")?.value.trim() || "";
      if (!cnic || !dob || !name || !father || !gender || !mobile || !helpType || !amount || !address) {
        if (grantMsg) { grantMsg.textContent = "Please fill all required fields."; grantMsg.classList.add("error"); }
        return;
      }
      setLoading(grantSubmitBtn, true, 'Submitting...');
      if (!window.RHS) { setLoading(grantSubmitBtn, false); return; }
      RHS.submitGrant({ cnic, dob, name, fatherName: father, gender, email, mobile, helpType, amountRequired: Number(amount), address })
      .then(res => {
        setLoading(grantSubmitBtn, false);
        if (res.success || res.code === "DUPLICATE_CASE") {
          if (grantForm) grantForm.style.display = "none";
          if (grantResult) {
            grantResult.hidden = false;
            const txt = document.getElementById("grantResultText");
            if (txt) txt.innerHTML = res.message || "";
          }
        } else {
          if (grantMsg) { grantMsg.textContent = res.message || "Something went wrong."; grantMsg.classList.add("error"); }
        }
      }).catch(() => { setLoading(grantSubmitBtn, false); if (grantMsg) { grantMsg.textContent = "Network error."; grantMsg.classList.add("error"); } });
    });
  }

  /* GRANT STATUS */
  const grantStatusForm = document.getElementById("grantStatusForm");
  const gsMsg = document.getElementById("gsMsg");
  const grantStatusResult = document.getElementById("grantStatusResult");

  if (grantStatusForm) {
    grantStatusForm.addEventListener("reset", () => {
      setTimeout(() => {
        if (gsMsg) { gsMsg.textContent = ""; gsMsg.className = "form-msg"; }
        if (grantStatusResult) grantStatusResult.innerHTML = "";
      }, 0);
    });

    grantStatusForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (gsMsg) { gsMsg.textContent = ""; gsMsg.className = "form-msg"; }
      if (grantStatusResult) grantStatusResult.innerHTML = "";
      const cnic = document.getElementById("gsCnic")?.value.trim() || "";
      const dob  = document.getElementById("gsDob")?.value.trim() || "";
      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic) || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        if (gsMsg) { gsMsg.textContent = "Please enter valid CNIC and DOB."; gsMsg.classList.add("error"); }
        return;
      }
      const gsBtn = grantStatusForm.querySelector('[type="submit"]');
      setLoading(gsBtn, true, 'Checking...');
      if (!window.RHS) { setLoading(gsBtn, false); return; }
      RHS.getGrantStatus(cnic, dob).then(res => {
        setLoading(gsBtn, false);
        if (!res.success || !res.grants || !res.grants.length) {
          if (grantStatusResult) grantStatusResult.innerHTML = `<div class="status-msg status-red"><i class="fa-solid fa-circle-xmark"></i><div class="status-title">No Request Found</div><p>${res.message||"Not found."}</p></div>`;
          return;
        }
        const active = res.grants.filter(g => (g.status||"").toLowerCase() !== "closed");
        const closed = res.grants.filter(g => (g.status||"").toLowerCase() === "closed");
        const list = active.length ? active : closed;
        let html = "";
        list.forEach(g => {
          let msg = "", vibe = "status-yellow", icon = "fa-hourglass-half";
          const s = (g.status||"").toLowerCase();
          const d = (g.decision||"").toLowerCase();
          if (s==="new") { msg=`Dear <strong>${g.name}</strong>, Your Request <strong>${g.crn}</strong> received. Team will contact you soon. 📞 ${window.NGO.alert} | 📧 ${window.NGO.email}`; vibe="status-yellow"; icon="fa-hourglass-half"; }
          else if (s==="assigned") { msg=`Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> assigned to <strong>${g.assignedTo||""}</strong>. Please cooperate. 📞 ${window.NGO.alert}`; vibe="status-green"; icon="fa-user-check"; }
          else if (s==="completed") { msg=`Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> verification completed. Please wait for decision. 📞 ${window.NGO.alert}`; vibe="status-yellow"; icon="fa-clipboard-check"; }
          else if (d==="approved"&&s!=="closed") { msg=`Dear <strong>${g.name}</strong>, Congratulations! Case <strong>${g.crn}</strong> Approved. Team will contact you. 📞 ${window.NGO.alert}`; vibe="status-green"; icon="fa-circle-check"; }
          else if (d==="rejected"&&s!=="closed") { msg=`Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> Rejected. Please meet President. 📞 ${window.NGO.alert}`; vibe="status-red"; icon="fa-circle-xmark"; }
          else if (s==="closed"&&(d==="closed"||d==="approved")) { msg=`Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> Successfully Closed. Jazak Allah Khair! 🤲`; vibe="status-green"; icon="fa-lock"; }
          else if (s==="closed"&&d==="rejected") { msg=`Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> Closed after Rejection. Meet President. 📞 ${window.NGO.alert}`; vibe="status-red"; icon="fa-lock"; }
          else { msg=`Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> under process. 📞 ${window.NGO.alert}`; }
          html += `<div class="status-msg ${vibe}" style="margin-bottom:16px"><i class="fa-solid ${icon}"></i><div class="status-title">${g.crn} — ${g.helpType}</div><p>${msg}</p><p class="status-note">Applied: ${g.timestamp} • Rs. ${Number(g.amount||0).toLocaleString()}</p></div>`;
        });
        if (grantStatusResult) grantStatusResult.innerHTML = html;
      }).catch(() => { setLoading(gsBtn, false); if (gsMsg) { gsMsg.textContent = "Network error."; gsMsg.classList.add("error"); } });
    });
  }

  /* PHOTO PREVIEW */
  window.previewRegPhoto = function(input) {
    const file = input.files?.[0];
    if (!file) return;
    const preview = document.getElementById("regPhotoPreview");
    if (!preview) return;
    const reader = new FileReader();
    reader.onload = e => { preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`; };
    reader.readAsDataURL(file);
  };

  /* REGISTRATION OPEN/CLOSE */
  const registrationSection = document.getElementById("registration");
  window.openRegistration = function() {
    if (registrationSection) { registrationSection.classList.add("show"); registrationSection.scrollIntoView({ behavior: "smooth" }); }
  };
  window.closeRegistration = function() {
    if (registrationSection) registrationSection.classList.remove("show");
    const homeEl = document.getElementById("home");
    if (homeEl) homeEl.scrollIntoView({ behavior: "smooth" });
  };
  document.querySelectorAll('a[href="#registration"]').forEach(link => {
    link.addEventListener("click", (e) => { e.preventDefault(); window.openRegistration(); });
  });
  const backBtn1 = document.getElementById("backBtn1");
  const backBtn2 = document.getElementById("backBtn2");
  if (backBtn1) backBtn1.addEventListener("click", window.closeRegistration);
  if (backBtn2) backBtn2.addEventListener("click", window.closeRegistration);

  /* URDU TOGGLE */
  let isUrdu = false;
  window.toggleLang = function() {
    isUrdu = !isUrdu;
    const label = document.getElementById("langLabel");
    const html = document.getElementById("htmlRoot");
    if (label) label.textContent = isUrdu ? "English" : "اردو";
    if (html) { html.setAttribute("lang", isUrdu ? "ur" : "en"); if (isUrdu) html.setAttribute("dir","rtl"); else html.removeAttribute("dir"); }
    document.querySelectorAll("[data-ur]").forEach(el => {
      if (isUrdu) { el._origText = el.textContent; el.textContent = el.getAttribute("data-ur"); }
      else if (el._origText) el.textContent = el._origText;
    });
  };

  /* NEWS */
  function loadNews() {
    const grid = document.getElementById("newsGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem"></i><p>Loading news...</p></div>';
    if (!window.RHS) { setTimeout(loadNews, 800); return; }
    RHS.getNews().then(res => {
      if (!res.news || !res.news.length) {
        grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-newspaper" style="font-size:2rem;display:block;margin-bottom:8px"></i>No news yet. Check back soon!</div>';
        return;
      }
      grid.innerHTML = res.news.map(n => `
        <article class="news-card">
          ${n.imageURL ? `<img src="${n.imageURL}" alt="${n.title}" class="news-card-img" loading="lazy">` : `<div class="news-card-img" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-newspaper" style="font-size:2rem;color:#8A9A96"></i></div>`}
          <div class="news-card-body">
            <span class="news-tag">${n.category||"News"}</span>
            <div class="news-card-date"><i class="fa-regular fa-calendar"></i> ${n.date||""}</div>
            <h3 class="news-card-title">${n.title||""}</h3>
            <p class="news-card-text">${n.body||n.content||""}</p>
          </div>
        </article>`).join("");
    }).catch(() => {
      grid.innerHTML = '<div class="news-loading">Could not load news.</div>';
    });
  }

  /* STORIES */
  function loadStories() {
    const grid = document.getElementById("storiesGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem"></i><p>Loading stories...</p></div>';
    if (!window.RHS) { setTimeout(loadStories, 800); return; }
    RHS.getStories().then(res => {
      if (!res.stories || !res.stories.length) {
        grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-heart" style="font-size:2rem;display:block;margin-bottom:8px;color:var(--coral)"></i>Stories coming soon!</div>';
        return;
      }
      grid.innerHTML = res.stories.map(s => `
        <article class="story-card">
          <span class="story-badge">${s.helpType||"Community"}</span>
          ${s.photoURL ? `<img src="${s.photoURL}" alt="${s.name}" class="story-card-img" loading="lazy">` : `<div class="story-card-img" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center;font-size:2.5rem">🤲</div>`}
          <div class="story-card-body">
            <div class="story-card-name">${s.name||""}</div>
            <div class="story-card-location"><i class="fa-solid fa-location-dot"></i> ${s.location||"Khairpur Tamewali"}</div>
            <p class="story-card-text">${s.story||""}</p>
          </div>
        </article>`).join("");
    }).catch(() => {
      grid.innerHTML = '<div class="news-loading">Could not load stories.</div>';
    });
  }

  /* LOAD ALL */
  loadNGOSettings();
  loadNews();
  loadStories();

}); // END DOMContentLoaded
