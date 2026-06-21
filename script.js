// RHS Website — Complete Fixed Script v2

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
      name:          res.ngoName        || window.NGO.name,
      phone:         res.ngoPhone       || window.NGO.phone,
      address:       res.ngoAddress     || window.NGO.address,
      email:         res.ngoEmail       || window.NGO.email,
      bank:          res.bankAccount    || window.NGO.bank,
      alert:         res.alertNumber    || res.ngoPhone || window.NGO.alert,
      ourTeamTitle:  res.ourTeamTitle   || "Our Team",
      ourTeamMatter: res.ourTeamMatter  || ""
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

/* ============================================================
   ALERT MODAL SYSTEM — Screen ke bilkul center mein
   Colors: green, yellow, red, orange, teal
============================================================ */
function showAlertModal(color, icon, title, bodyHtml, buttons) {
  const existing = document.getElementById("rhsAlertModal");
  if (existing) existing.remove();

  const colorMap = {
    green:  { bg:"#EEF8F1", border:"#1a9e5c", titleClr:"#1a9e5c", iconClr:"#1a9e5c" },
    yellow: { bg:"#FFFBEB", border:"#D97706", titleClr:"#92400E", iconClr:"#D97706" },
    red:    { bg:"#FEF2F2", border:"#DC2626", titleClr:"#991B1B", iconClr:"#DC2626" },
    orange: { bg:"#FFF7ED", border:"#EA580C", titleClr:"#9A3412", iconClr:"#EA580C" },
    teal:   { bg:"#EEF8F1", border:"#14534F", titleClr:"#14534F", iconClr:"#14534F" },
  };
  const c = colorMap[color] || colorMap.teal;
  const btns = (buttons || []).map(b =>
    `<button class="btn btn-ghost" onclick="${b.fn}" style="min-width:130px;margin:4px">${b.label}</button>`
  ).join("");

  const overlay = document.createElement("div");
  overlay.id = "rhsAlertModal";
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;";
  overlay.innerHTML = `
    <div style="background:${c.bg};border:2.5px solid ${c.border};border-radius:20px;padding:36px 28px;max-width:480px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:rhsModalIn .25s cubic-bezier(.34,1.56,.64,1);">
      <i class="fa-solid ${icon}" style="font-size:3rem;color:${c.iconClr};margin-bottom:14px;display:block"></i>
      <h3 style="font-family:'Fraunces',serif;color:${c.titleClr};margin:0 0 14px;font-size:1.3rem;line-height:1.3">${title}</h3>
      <div style="color:#374151;line-height:1.75;font-size:.93rem;margin-bottom:22px">${bodyHtml}</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${btns}</div>
    </div>`;
  document.body.appendChild(overlay);
}

function closeAlertModal() {
  const m = document.getElementById("rhsAlertModal");
  if (m) m.remove();
}
window.closeAlertModal = closeAlertModal;

// Inject modal animation CSS once
(function() {
  if (document.getElementById("rhsModalStyle")) return;
  const s = document.createElement("style");
  s.id = "rhsModalStyle";
  s.textContent = "@keyframes rhsModalIn{from{opacity:0;transform:scale(.85) translateY(-10px)}to{opacity:1;transform:scale(1) translateY(0)}}";
  document.head.appendChild(s);
})();

/* ===================== INIT AFTER DOM ===================== */
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("input, textarea, select, form").forEach(el => {
    el.setAttribute("autocomplete", "off");
  });

  /* NAVBAR */
  const navToggle = document.getElementById("navToggle");
  const navLinks  = document.getElementById("navLinks");
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
    sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 120) current = sec.id; });
    if (navLinks) navLinks.querySelectorAll("a").forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  });

  /* HERO SLIDER */
  const slides   = document.querySelectorAll(".slide");
  const dotsWrap = document.getElementById("sliderDots");
  if (slides.length && dotsWrap) {
    let cur = 0, interval;
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => go(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll(".dot");
    function go(i) {
      slides[cur].classList.remove("active"); dots[cur].classList.remove("active");
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add("active"); dots[cur].classList.add("active");
    }
    function start() { interval = setInterval(() => go(cur + 1), 5500); }
    function reset() { clearInterval(interval); start(); }
    const nb = document.getElementById("nextSlide");
    const pb = document.getElementById("prevSlide");
    if (nb) nb.addEventListener("click", () => { go(cur + 1); reset(); });
    if (pb) pb.addEventListener("click", () => { go(cur - 1); reset(); });
    start();
  }

  /* CNIC FORMAT */
  document.querySelectorAll('[id*="cnic"],[id*="Cnic"],[placeholder*="00000-"]').forEach(el => {
    el.setAttribute("autocomplete", "new-password");
    el.addEventListener("input", function() {
      const d = this.value.replace(/\D/g, "").slice(0, 13);
      let v = d;
      if (d.length > 12) v = d.slice(0,5)+"-"+d.slice(5,12)+"-"+d.slice(12);
      else if (d.length > 5) v = d.slice(0,5)+"-"+d.slice(5);
      this.value = v;
    });
  });

  /* DOB FORMAT */
  document.querySelectorAll('[id*="dob"],[id*="Dob"],[placeholder*="dd-mm-yyyy"]').forEach(el => {
    el.setAttribute("autocomplete", "new-password");
    el.addEventListener("input", function() {
      let v = this.value.replace(/\D/g, "").slice(0, 8);
      if (v.length > 4) v = v.slice(0,2)+"-"+v.slice(2,4)+"-"+v.slice(4);
      else if (v.length > 2) v = v.slice(0,2)+"-"+v.slice(2);
      this.value = v;
    });
  });

  /* MOBILE FORMAT */
  document.querySelectorAll('[id*="mobile"],[id*="Mobile"],[placeholder*="0300-"]').forEach(el => {
    el.addEventListener("input", function() {
      let v = this.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 4) v = v.slice(0,4)+"-"+v.slice(4);
      this.value = v;
    });
  });

  /* STATISTICS */
  function animateCount(el, target) {
    target = Number(target) || 0;
    const dur = 1400, t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }
  function loadStatistics() {
    if (!window.RHS) { setTimeout(loadStatistics, 500); return; }
    RHS.getStatistics().then(res => {
      document.querySelectorAll(".stat-num").forEach(el => {
        const key = el.dataset.key;
        if (key && res[key] !== undefined) el.dataset.target = res[key];
      });
    }).catch(() => {});
  }
  loadStatistics();
  const statsEl = document.getElementById("stats");
  if (statsEl) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll(".stat-num").forEach(el => animateCount(el, el.dataset.target || 0));
        }
      });
    }, { threshold: 0.3 }).observe(statsEl);
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     MEMBER PORTAL NAVIGATION
  ============================================================ */
  window.showMemberSection = function(which) {
    const regSec  = document.getElementById("registration");
    const verWrap = document.getElementById("verifyPortalWrap");
    if (which === "registration") {
      if (verWrap) verWrap.style.display = "none";
      if (regSec) { regSec.style.display = "block"; setTimeout(() => regSec.scrollIntoView({ behavior:"smooth", block:"start" }), 50); }
    } else {
      if (regSec) regSec.style.display = "none";
      if (verWrap) {
        verWrap.style.display = "block";
        resetVerifyPortal();
        setTimeout(() => verWrap.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
      }
    }
  };

  window.backToMemberPortalMain = function() {
    closeAlertModal();
    const regSec  = document.getElementById("registration");
    const verWrap = document.getElementById("verifyPortalWrap");
    if (regSec)  regSec.style.display  = "none";
    if (verWrap) verWrap.style.display = "none";
    resetVerifyPortal();
    const regForm = document.getElementById("regForm");
    const formResult = document.getElementById("formResult");
    if (regForm) { regForm.style.display = "block"; regForm.reset(); }
    if (formResult) { formResult.hidden = true; }
    const ms = document.getElementById("memberSection");
    if (ms) setTimeout(() => ms.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
  };

  window.restartRegistration = function() {
    closeAlertModal();
    const regForm = document.getElementById("regForm");
    const formResult = document.getElementById("formResult");
    if (regForm) { regForm.style.display = "block"; regForm.reset(); }
    if (formResult) { formResult.hidden = true; }
    const preview = document.getElementById("regPhotoPreview");
    if (preview) preview.innerHTML = `<i class="fa-solid fa-camera"></i><span>Click to upload</span>`;
    const regSec = document.getElementById("registration");
    if (regSec) setTimeout(() => regSec.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
  };

  function resetVerifyPortal() {
    const vCnic = document.getElementById("vCnic");
    const vDob  = document.getElementById("vDob");
    if (vCnic) vCnic.value = "";
    if (vDob)  vDob.value  = "";
    const verifyMsg = document.getElementById("verifyMsg");
    if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
    const certResult = document.getElementById("certResult");
    if (certResult) certResult.innerHTML = "";
    const lookupCard = document.getElementById("memberLookupCard");
    if (lookupCard) lookupCard.style.display = "block";
  }

  window.backToVerifyForm = function() {
    closeAlertModal();
    const certResult = document.getElementById("certResult");
    if (certResult) certResult.innerHTML = "";
    const lookupCard = document.getElementById("memberLookupCard");
    if (lookupCard) lookupCard.style.display = "block";
    const verifyMsg = document.getElementById("verifyMsg");
    if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
    const vp = document.getElementById("verifyPortalWrap");
    if (vp) setTimeout(() => vp.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
  };

  /* ============================================================
     REGISTRATION FORM
     - All fields required including photo
     - Cloudinary upload → photo URL saved in Firestore
     - Photo shows on certificate
  ============================================================ */
  const regForm   = document.getElementById("regForm");
  const formMsg   = document.getElementById("formMsg");
  const formResult= document.getElementById("formResult");
  const submitBtn = document.getElementById("submitBtn");

  if (regForm) {
    regForm.addEventListener("reset", () => {
      setTimeout(() => {
        if (formMsg) { formMsg.textContent=""; formMsg.className="form-msg"; }
        const preview = document.getElementById("regPhotoPreview");
        if (preview) preview.innerHTML = `<i class="fa-solid fa-camera"></i><span>Click to upload</span>`;
      }, 0);
    });

    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!formMsg) return;
      formMsg.textContent = "";
      formMsg.className = "form-msg";

      const cnic       = document.getElementById("regCnic")?.value.trim()       || "";
      const dob        = document.getElementById("regDob")?.value.trim()         || "";
      const fullName   = document.getElementById("regName")?.value.trim()        || "";
      const father     = document.getElementById("regFather")?.value.trim()      || "";
      const gender     = document.getElementById("regGender")?.value             || "";
      const prof       = document.getElementById("regProfession")?.value.trim()  || "";
      const mobile     = document.getElementById("regMobile")?.value.trim()      || "";
      const email      = document.getElementById("regEmail")?.value.trim()       || "";
      const province   = document.getElementById("regProvince")?.value           || "";
      const membership = document.getElementById("regMembership")?.value         || "";
      const address    = document.getElementById("regAddress")?.value.trim()     || "";
      const photoFile  = document.getElementById("regPhoto")?.files?.[0]         || null;

      // Validation
      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))  { formMsg.textContent="⚠️ Valid CNIC required: 00000-0000000-0"; formMsg.classList.add("error"); return; }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob))    { formMsg.textContent="⚠️ Date of Birth required (dd-mm-yyyy)"; formMsg.classList.add("error"); return; }
      if (!fullName)   { formMsg.textContent="⚠️ Full Name is required"; formMsg.classList.add("error"); return; }
      if (!father)     { formMsg.textContent="⚠️ Father/Husband Name is required"; formMsg.classList.add("error"); return; }
      if (!gender)     { formMsg.textContent="⚠️ Please select Gender"; formMsg.classList.add("error"); return; }
      if (!prof)       { formMsg.textContent="⚠️ Profession is required"; formMsg.classList.add("error"); return; }
      if (!/^\d{4}-\d{7}$/.test(mobile)) { formMsg.textContent="⚠️ Mobile format: 0300-0000000"; formMsg.classList.add("error"); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { formMsg.textContent="⚠️ Valid Email format required"; formMsg.classList.add("error"); return; }
      if (!province)   { formMsg.textContent="⚠️ Please select Province"; formMsg.classList.add("error"); return; }
      if (!membership) { formMsg.textContent="⚠️ Please select Membership Type"; formMsg.classList.add("error"); return; }
      if (!address)    { formMsg.textContent="⚠️ Full Address is required"; formMsg.classList.add("error"); return; }
      if (!photoFile)  { formMsg.textContent="⚠️ Passport size photo is required"; formMsg.classList.add("error"); return; }

      setLoading(submitBtn, true, "Uploading photo...");

      // Upload photo to Cloudinary (cloud: dt9yspaw7, preset: rhs-upload, folder: rhs/members)
      let photoUrl = "";
      if (photoFile && window.RHS) {
        try {
          photoUrl = await RHS.uploadImage(photoFile, "rhs/members");
          // photoUrl is now like: https://res.cloudinary.com/dt9yspaw7/image/upload/.../rhs/members/filename.jpg
        } catch(err) {
          setLoading(submitBtn, false);
          formMsg.textContent = "⚠️ Photo upload failed. Check your internet and try again.";
          formMsg.classList.add("error");
          return;
        }
      }

      setLoading(submitBtn, true, "Submitting...");
      if (!window.RHS) { setLoading(submitBtn, false); formMsg.textContent="Please wait..."; return; }

      // Save to Firestore — photoUrl saved alongside member data
      RHS.registerMember({ cnic, dob, fullName, fatherName:father, gender, profession:prof, email, mobile, province, address, membershipType:membership, photo:photoUrl })
      .then(res => {
        setLoading(submitBtn, false);
        if (res.success) {
          if (regForm) regForm.style.display = "none";
          showAlertModal("green","fa-circle-check","Registration Submitted Successfully!",
            `Dear <strong>${fullName}</strong>, Your Registration Request has been Successfully Received.<br><br>
             Your Registration is now <strong>Underprocess</strong>. You will be notified after approval.<br><br>
             📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`,
            [
              { label:"<i class='fa-solid fa-house'></i> Main Menu",         fn:"backToMemberPortalMain()" },
              { label:"<i class='fa-solid fa-user-plus'></i> New Registration", fn:"restartRegistration()" }
            ]
          );
        } else if (res.code === "DUPLICATE") {
          showAlertModal("yellow","fa-circle-info","Already Registered",
            res.message || `Dear <strong>${fullName}</strong>, You are already registered.`,
            [{ label:"<i class='fa-solid fa-house'></i> Main Menu", fn:"backToMemberPortalMain()" }]
          );
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
  }

  /* PHOTO PREVIEW — with size check */
  window.previewRegPhoto = function(input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showAlertModal("orange","fa-triangle-exclamation","Photo Too Large",
        "Photo size must be under 2MB. Please choose a smaller image.",
        [{ label:"<i class='fa-solid fa-check'></i> OK", fn:"closeAlertModal()" }]
      );
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const preview = document.getElementById("regPhotoPreview");
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
    };
    reader.readAsDataURL(file);
  };

  /* ============================================================
     VERIFY PORTAL — Certificate + Charity Ledger
     Both use same CNIC+DOB form
  ============================================================ */
  const verifyForm        = document.getElementById("verifyForm");
  const verifyMsg         = document.getElementById("verifyMsg");
  const verifyBtn         = document.getElementById("verifyBtn");
  const verifyDonationBtn = document.getElementById("verifyDonationBtn");
  const verifyClearBtn    = document.getElementById("verifyClearBtn");

  function getVerifyVals() {
    return {
      cnic: document.getElementById("vCnic")?.value.trim() || "",
      dob:  document.getElementById("vDob")?.value.trim()  || ""
    };
  }

  function validateVerify() {
    const { cnic, dob } = getVerifyVals();
    if (!cnic || !/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
      if (verifyMsg) { verifyMsg.textContent="⚠️ Valid CNIC required: 00000-0000000-0"; verifyMsg.classList.add("error"); }
      return false;
    }
    if (!dob || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      if (verifyMsg) { verifyMsg.textContent="⚠️ Date of Birth required (dd-mm-yyyy)"; verifyMsg.classList.add("error"); }
      return false;
    }
    if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
    return true;
  }

  function showCertResult(html) {
    const lookupCard = document.getElementById("memberLookupCard");
    const certResult  = document.getElementById("certResult");
    if (lookupCard) lookupCard.style.display = "none";
    if (certResult) {
      certResult.innerHTML = html;
      setTimeout(() => certResult.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
    }
  }

  if (verifyForm) {
    verifyForm.addEventListener("submit", e => { e.preventDefault(); doVerifyCert(); });
  }

  /* --- Verify Certificate --- */
  function doVerifyCert() {
    if (!validateVerify()) return;
    const { cnic, dob } = getVerifyVals();
    setLoading(verifyBtn, true, "Verifying...");
    if (!window.RHS) { setLoading(verifyBtn, false); return; }

    RHS.getMemberByCredentials(cnic, dob).then(res => {
      setLoading(verifyBtn, false);
      if (res.success && res.found) {
        const m = res.member;
        const s = (m.status || "").toLowerCase();
        if (s === "active") {
          // Show certificate card inline
          showCertResult(buildCertCard(m));
        } else {
          // Colored modal for other statuses
          const cfg = {
            underprocess: { color:"yellow", icon:"fa-hourglass-half", title:"Membership Underprocess",
              msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>Underprocess</strong>. Your application is being reviewed by our team.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` },
            expired:      { color:"orange", icon:"fa-clock",          title:"Membership Expired",
              msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>Expired</strong>. Please contact us to renew your membership.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` },
            banned:       { color:"red",    icon:"fa-ban",            title:"Membership Banned",
              msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>Banned</strong>. Please contact us for more information.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` },
          }[s] || { color:"yellow", icon:"fa-circle-info", title:`Status: ${m.status}`,
            msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>${m.status}</strong>.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` };

          showAlertModal(cfg.color, cfg.icon, cfg.title, cfg.msg, [
            { label:"<i class='fa-solid fa-arrow-left'></i> Back",       fn:"backToVerifyForm()" },
            { label:"<i class='fa-solid fa-house'></i> Main Menu",       fn:"backToMemberPortalMain()" }
          ]);
        }
      } else {
        if (verifyMsg) { verifyMsg.textContent = res.message || "No record found with these credentials."; verifyMsg.classList.add("error"); }
      }
    }).catch(() => { setLoading(verifyBtn, false); if (verifyMsg) { verifyMsg.textContent="Network error. Please try again."; verifyMsg.classList.add("error"); } });
  }

  /* --- Verify Charity Donation / Ledger --- */
  if (verifyDonationBtn) {
    verifyDonationBtn.addEventListener("click", () => {
      if (!validateVerify()) return;
      const { cnic, dob } = getVerifyVals();
      setLoading(verifyDonationBtn, true, "Loading...");
      if (!window.RHS) { setLoading(verifyDonationBtn, false); return; }

      RHS.getCharityLedger(cnic, dob).then(res => {
        setLoading(verifyDonationBtn, false);
        if (!res.success) {
          if (verifyMsg) { verifyMsg.textContent = res.message || "No record found."; verifyMsg.classList.add("error"); }
          return;
        }
        showCertResult(buildLedger(res));
      }).catch(err => {
        setLoading(verifyDonationBtn, false);
        if (verifyMsg) { verifyMsg.textContent="Network error. Please try again."; verifyMsg.classList.add("error"); }
      });
    });
  }

  if (verifyClearBtn) {
    verifyClearBtn.addEventListener("click", () => { resetVerifyPortal(); });
  }

  /* --- Build Certificate Card HTML ---
     Photo comes from Cloudinary URL stored in Firestore
     Shows on card + in Print PDF
  */
  function buildCertCard(m) {
    // Photo from Cloudinary (uploaded during registration, URL in Firestore)
    const photoHtml = m.photo
      ? `<img src="${m.photo}" alt="${m.fullName}" style="width:100%;height:100%;object-fit:cover">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#EEF8F1;color:#8A9A96;font-size:2.5rem"><i class="fa-solid fa-user"></i></div>`;
    const mData = JSON.stringify(m).replace(/"/g,"&quot;");
    return `
    <div class="cert-card">
      <div class="cert-top-bar">
        <img src="images/logo.png" class="cert-logo" alt="RHS">
        <div class="cert-org-info">
          <div class="cert-org-name">${window.NGO.name}</div>
          <div class="cert-org-addr">${window.NGO.address}</div>
        </div>
        <span class="cert-badge-active">✓ Active Member</span>
      </div>
      <div class="cert-body">
        <div class="cert-photo">${photoHtml}</div>
        <div class="cert-details">
          <div class="cert-member-name">${m.fullName}</div>
          <div class="cert-member-type">${m.membershipType||"Member"}</div>
          <div class="cert-grid">
            <div class="cert-item"><span class="lbl">Reg No</span><span class="val">${m.registrationNo}</span></div>
            <div class="cert-item"><span class="lbl">CNIC</span><span class="val">${m.cnic}</span></div>
            <div class="cert-item"><span class="lbl">Father / Husband</span><span class="val">${m.fatherName||"—"}</span></div>
            <div class="cert-item"><span class="lbl">Gender</span><span class="val">${m.gender||"—"}</span></div>
            <div class="cert-item"><span class="lbl">Mobile</span><span class="val">${m.mobile||"—"}</span></div>
            <div class="cert-item"><span class="lbl">Member Since</span><span class="val">${m.timestamp||"—"}</span></div>
            <div class="cert-item"><span class="lbl">Valid Upto</span><span class="val" style="color:#1a9e5c;font-weight:700">${m.validUpto||"—"}</span></div>
            <div class="cert-item cert-full"><span class="lbl">Address</span><span class="val">${m.address||"—"}</span></div>
          </div>
        </div>
      </div>
      <div class="cert-footer-bar">
        <span>📞 ${window.NGO.phone}</span>
        <span>✉️ ${window.NGO.email}</span>
        <span style="font-style:italic">Computer-Generated · No Signature Required</span>
      </div>
      <div class="cert-actions">
        <button class="btn btn-primary" onclick="printMemberCert(${mData})">
          <i class="fa-solid fa-file-pdf"></i> Download PDF
        </button>
        <button class="btn btn-ghost" onclick="backToVerifyForm()">
          <i class="fa-solid fa-arrow-left"></i> Back
        </button>
        <button class="btn btn-ghost" onclick="backToMemberPortalMain()">
          <i class="fa-solid fa-house"></i> Main Menu
        </button>
      </div>
      <p class="cert-footnote">This digital certificate is valid proof of membership in ${window.NGO.name}.</p>
    </div>`;
  }

  /* Print Certificate as PDF — includes photo from Cloudinary */
  window.printMemberCert = function(m) {
    const pa = document.getElementById("printCert");
    if (!pa) return;
    pa.innerHTML = `
    <div style="border:6px double #14534F;padding:40px;font-family:Georgia,serif;max-width:700px;margin:0 auto">
      <div style="text-align:center;border-bottom:2px solid #E8A33D;padding-bottom:16px;margin-bottom:20px">
        <h1 style="color:#14534F;margin:0">${window.NGO.name}</h1>
        <p style="color:#E8A33D;letter-spacing:3px;margin:4px 0;font-size:.85rem">DIGITAL MEMBERSHIP CERTIFICATE</p>
      </div>
      <table style="width:100%;border-collapse:collapse"><tr>
        <td style="width:25%;vertical-align:top;padding-right:24px">
          ${m.photo
            ? `<img src="${m.photo}" style="width:110px;height:130px;object-fit:cover;border:3px solid #14534F;display:block">`
            : `<div style="width:110px;height:130px;background:#EEF8F1;border:3px solid #14534F;display:flex;align-items:center;justify-content:center;font-size:3rem;color:#aaa">👤</div>`}
        </td>
        <td style="vertical-align:top">
          <h2 style="color:#14534F;margin:0 0 4px">${m.fullName}</h2>
          <p style="color:#888;margin:0 0 12px;font-size:.9rem">${m.membershipType||"Member"}</p>
          <table style="width:100%;font-size:.88rem;border-collapse:collapse">
            <tr><td style="padding:4px 0;font-weight:bold;width:140px;color:#555">Reg No:</td><td style="color:#14534F;font-weight:bold">${m.registrationNo}</td></tr>
            <tr><td style="padding:4px 0;font-weight:bold;color:#555">CNIC:</td><td>${m.cnic}</td></tr>
            <tr><td style="padding:4px 0;font-weight:bold;color:#555">Father/Husband:</td><td>${m.fatherName||"—"}</td></tr>
            <tr><td style="padding:4px 0;font-weight:bold;color:#555">Mobile:</td><td>${m.mobile||"—"}</td></tr>
            <tr><td style="padding:4px 0;font-weight:bold;color:#555">Valid Upto:</td><td style="color:#1a9e5c;font-weight:bold">${m.validUpto||"—"}</td></tr>
            <tr><td style="padding:4px 0;font-weight:bold;color:#555">Status:</td><td style="color:#1a9e5c">Active ✓</td></tr>
            <tr><td style="padding:4px 0;font-weight:bold;color:#555">Address:</td><td>${m.address||"—"}</td></tr>
          </table>
        </td>
      </tr></table>
      <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:2px solid #E7DFD2;color:#888;font-size:.75rem">
        ${window.NGO.address} &nbsp;·&nbsp; 📞 ${window.NGO.phone} &nbsp;·&nbsp; ✉️ ${window.NGO.email}
      </div>
    </div>`;
    window.print();
    setTimeout(() => { pa.innerHTML=""; }, 3000);
  };

  /* --- Build Charity Ledger HTML --- */
  function buildLedger(res) {
    const m = res.member;
    const donations = res.donations || [];
    let runTotal = 0;
    const rows = !donations.length
      ? `<tr><td colspan="4" style="text-align:center;padding:24px;color:#8A9A96;font-style:italic">No charity donations recorded yet.</td></tr>`
      : donations.map((d, i) => {
          runTotal += Number(d.amount)||0;
          return `<tr style="background:${i%2?"#F5F9F8":"#fff"}">
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.date||""}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.paymentMethod||d.method||"Cash"}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;color:#2E9E5B;font-weight:600">Rs. ${Number(d.amount||0).toLocaleString()}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-weight:600">Rs. ${runTotal.toLocaleString()}</td>
          </tr>`;
        }).join("");

    return `
    <div class="ledger-wrap" id="ledgerPrintArea">
      <div class="ledger-header">
        <img src="images/logo.png" alt="RHS" class="ledger-logo">
        <div>
          <h3 style="margin:0;font-family:'Fraunces',serif;color:#14534F">${window.NGO.name}</h3>
          <small style="color:#8A9A96">${window.NGO.address}</small>
        </div>
      </div>
      <div style="text-align:center;margin:12px 0">
        <span class="eyebrow">Charity Donation Ledger</span>
      </div>
      <div class="ledger-member-info">
        <div class="ledger-info-row"><span class="lbl">Member Name</span><span class="val">${m.fullName}</span></div>
        <div class="ledger-info-row"><span class="lbl">Reg No</span><span class="val">${m.registrationNo}</span></div>
        <div class="ledger-info-row"><span class="lbl">CNIC</span><span class="val">${m.cnic}</span></div>
        <div class="ledger-info-row"><span class="lbl">Valid Upto</span><span class="val" style="color:#14534F;font-weight:700">${m.validUpto||"—"}</span></div>
        <div class="ledger-info-row"><span class="lbl">Status</span><span class="val"><span class="cert-badge">${m.status}</span></span></div>
        <div class="ledger-info-row"><span class="lbl">Total Donations</span><span class="val" style="color:#1a9e5c;font-weight:700">${donations.length}</span></div>
      </div>
      <div style="overflow-x:auto;margin-top:16px">
        <table style="width:100%;border-collapse:collapse;font-size:.88rem">
          <thead><tr style="background:#14534F;color:#fff">
            <th style="padding:10px 14px;text-align:left">Date</th>
            <th style="padding:10px 14px;text-align:left">Payment Method</th>
            <th style="padding:10px 14px;text-align:left">Amount</th>
            <th style="padding:10px 14px;text-align:left">Running Total</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr style="background:#EEF8F1">
            <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F">Total Charity Contributed</td>
            <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F;font-size:1.05rem">Rs. ${res.total.toLocaleString()}</td>
          </tr></tfoot>
        </table>
      </div>
      <p class="cert-footnote">${window.NGO.name} &nbsp;|&nbsp; ${window.NGO.phone} &nbsp;|&nbsp; ${window.NGO.email}</p>
      <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="printLedger()">
          <i class="fa-solid fa-file-pdf"></i> Download PDF
        </button>
        <button class="btn btn-ghost" onclick="backToVerifyForm()">
          <i class="fa-solid fa-arrow-left"></i> Back
        </button>
        <button class="btn btn-ghost" onclick="backToMemberPortalMain()">
          <i class="fa-solid fa-house"></i> Main Menu
        </button>
      </div>
    </div>`;
  }

  /* Print Ledger as PDF */
  window.printLedger = function() {
    window.print();
  };

  /* ============================================================
     CHARITY HELP DESK
  ============================================================ */
  window.showHelpSection = function(which) {
    const btns    = document.getElementById("helpdeskBtns");
    const gWrap   = document.getElementById("grantFormWrap");
    const sWrap   = document.getElementById("grantStatusWrap");
    if (btns)  btns.style.display  = "none";
    if (gWrap) gWrap.style.display = which === "grant"  ? "block" : "none";
    if (sWrap) sWrap.style.display = which === "status" ? "block" : "none";
    const desk = document.getElementById("charityDesk");
    if (desk) desk.scrollIntoView({ behavior:"smooth" });
  };

  window.hideHelpSection = function() {
    closeAlertModal();
    const btns    = document.getElementById("helpdeskBtns");
    const gWrap   = document.getElementById("grantFormWrap");
    const sWrap   = document.getElementById("grantStatusWrap");
    const gForm   = document.getElementById("grantForm");
    const gResult = document.getElementById("grantResult");
    if (btns)  btns.style.display  = "flex";
    if (gWrap) gWrap.style.display = "none";
    if (sWrap) sWrap.style.display = "none";
    if (gForm) gForm.style.display = "block";
    if (gResult) { gResult.style.display="none"; gResult.innerHTML=""; }
    const desk = document.getElementById("charityDesk");
    if (desk) desk.scrollIntoView({ behavior:"smooth" });
  };

  /* GRANT FORM */
  const grantForm      = document.getElementById("grantForm");
  const grantMsg       = document.getElementById("grantMsg");
  const grantResult    = document.getElementById("grantResult");
  const grantSubmitBtn = document.getElementById("grantSubmitBtn");

  if (grantForm) {
    grantForm.addEventListener("submit", e => {
      e.preventDefault();
      if (grantMsg) { grantMsg.textContent=""; grantMsg.className="form-msg"; }

      const cnic     = document.getElementById("gCnic")?.value.trim()    || "";
      const dob      = document.getElementById("gDob")?.value.trim()     || "";
      const name     = document.getElementById("gName")?.value.trim()    || "";
      const father   = document.getElementById("gFather")?.value.trim()  || "";
      const gender   = document.getElementById("gGender")?.value         || "";
      const mobile   = document.getElementById("gMobile")?.value.trim()  || "";
      const helpType = document.getElementById("gHelpType")?.value       || "";
      const amount   = document.getElementById("gAmount")?.value         || "";
      const address  = document.getElementById("gAddress")?.value.trim() || "";
      const email    = document.getElementById("gEmail")?.value.trim()   || "";

      if (!cnic || !/^\d{5}-\d{7}-\d{1}$/.test(cnic)) { grantMsg.textContent="⚠️ Valid CNIC required";        grantMsg.classList.add("error"); return; }
      if (!dob  || !/^\d{2}-\d{2}-\d{4}$/.test(dob))  { grantMsg.textContent="⚠️ Date of Birth required";     grantMsg.classList.add("error"); return; }
      if (!name)     { grantMsg.textContent="⚠️ Full Name is required";           grantMsg.classList.add("error"); return; }
      if (!father)   { grantMsg.textContent="⚠️ Father/Husband Name is required"; grantMsg.classList.add("error"); return; }
      if (!gender)   { grantMsg.textContent="⚠️ Please select Gender";            grantMsg.classList.add("error"); return; }
      if (!mobile || !/^\d{4}-\d{7}$/.test(mobile)) { grantMsg.textContent="⚠️ Mobile: 0300-0000000"; grantMsg.classList.add("error"); return; }
      if (!helpType) { grantMsg.textContent="⚠️ Please select Help Type";         grantMsg.classList.add("error"); return; }
      if (!amount || Number(amount) < 1) { grantMsg.textContent="⚠️ Amount is required"; grantMsg.classList.add("error"); return; }
      if (!address)  { grantMsg.textContent="⚠️ Full Address is required";        grantMsg.classList.add("error"); return; }

      setLoading(grantSubmitBtn, true, "Submitting...");
      if (!window.RHS) { setLoading(grantSubmitBtn, false); return; }

      RHS.submitGrant({ cnic, dob, name, fatherName:father, gender, email, mobile, helpType, amountRequired:Number(amount), address })
      .then(res => {
        setLoading(grantSubmitBtn, false);
        if (res.success) {
          grantForm.style.display = "none";
          showAlertModal("green","fa-circle-check","Charity Request Submitted!",
            `Dear <strong>${name}</strong>, Your Charity Help Request has been Successfully Received.<br><br>
             Your Case No: <strong>${res.crn||""}</strong><br>Our team will contact you soon.<br><br>
             📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`,
            [{ label:"<i class='fa-solid fa-arrow-left'></i> Back", fn:"hideHelpSection()" }]
          );
        } else if (res.code === "DUPLICATE_CASE") {
          showAlertModal("yellow","fa-circle-info","Case Already Submitted",
            res.message || `Dear <strong>${name}</strong>, You already have an active case.`,
            [{ label:"<i class='fa-solid fa-arrow-left'></i> Back", fn:"hideHelpSection()" }]
          );
        } else {
          grantMsg.textContent = res.message || "Something went wrong.";
          grantMsg.classList.add("error");
        }
      }).catch(() => { setLoading(grantSubmitBtn, false); grantMsg.textContent="Network error."; grantMsg.classList.add("error"); });
    });
  }

  /* GRANT STATUS */
  const grantStatusForm   = document.getElementById("grantStatusForm");
  const gsMsg             = document.getElementById("gsMsg");
  const grantStatusResult = document.getElementById("grantStatusResult");

  if (grantStatusForm) {
    grantStatusForm.addEventListener("reset", () => {
      setTimeout(() => {
        if (gsMsg) { gsMsg.textContent=""; gsMsg.className="form-msg"; }
        if (grantStatusResult) grantStatusResult.innerHTML="";
      }, 0);
    });
    grantStatusForm.addEventListener("submit", e => {
      e.preventDefault();
      if (gsMsg) { gsMsg.textContent=""; gsMsg.className="form-msg"; }
      if (grantStatusResult) grantStatusResult.innerHTML="";
      const cnic = document.getElementById("gsCnic")?.value.trim() || "";
      const dob  = document.getElementById("gsDob")?.value.trim()  || "";
      if (!cnic || !/^\d{5}-\d{7}-\d{1}$/.test(cnic)) { gsMsg.textContent="⚠️ Valid CNIC required"; gsMsg.classList.add("error"); return; }
      if (!dob  || !/^\d{2}-\d{2}-\d{4}$/.test(dob))  { gsMsg.textContent="⚠️ Date of Birth required"; gsMsg.classList.add("error"); return; }
      const gsBtn = grantStatusForm.querySelector('[type="submit"]');
      setLoading(gsBtn, true, "Checking...");
      if (!window.RHS) { setLoading(gsBtn, false); return; }

      RHS.getGrantStatus(cnic, dob).then(res => {
        setLoading(gsBtn, false);
        if (!res.success || !res.grants || !res.grants.length) {
          showAlertModal("red","fa-circle-xmark","No Request Found",
            "No charity request found with these credentials.",
            [{ label:"<i class='fa-solid fa-rotate-left'></i> Try Again", fn:"closeAlertModal()" }]
          );
          return;
        }
        const active = res.grants.filter(g => (g.status||"").toLowerCase() !== "closed");
        const list = active.length ? active : res.grants;
        // Show first/most relevant grant
        const g = list[0];
        const s = (g.status||"").toLowerCase();
        const d = (g.decision||"").toLowerCase();
        let color,icon,title,msg;
        if (s==="new") {
          color="yellow"; icon="fa-hourglass-half"; title=`Request Received — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Your Charity Request <strong>${g.crn}</strong> has been received. Our team will contact you soon.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`;
        } else if (s==="assigned") {
          color="teal"; icon="fa-user-check"; title=`Case Assigned — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> has been assigned to our team. They will contact you soon.<br><br>📞 ${window.NGO.alert}`;
        } else if (s==="completed") {
          color="yellow"; icon="fa-clipboard-check"; title=`Verification Done — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Verification for case <strong>${g.crn}</strong> is complete. Please wait for the final decision.<br><br>📞 ${window.NGO.alert}`;
        } else if (d==="approved" && s!=="closed") {
          color="green"; icon="fa-circle-check"; title=`Case APPROVED ✅ — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Congratulations! 🎉 Your case <strong>${g.crn}</strong> has been <strong>Approved</strong>. Our team will contact you.<br><br>📞 ${window.NGO.alert}`;
        } else if (d==="rejected" && s!=="closed") {
          color="red"; icon="fa-circle-xmark"; title=`Case Rejected — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> was <strong>Rejected</strong>. To appeal, please meet our President with Case No.<br><br>📞 ${window.NGO.alert}`;
        } else if (s==="closed" && d!=="rejected") {
          color="green"; icon="fa-lock"; title=`Successfully Closed — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> has been <strong>Successfully Closed</strong>. Jazak Allah Khair! 🤲`;
        } else if (s==="closed" && d==="rejected") {
          color="red"; icon="fa-lock"; title=`Case Closed — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> was Closed after Rejection. To appeal, meet our President.<br><br>📞 ${window.NGO.alert}`;
        } else {
          color="yellow"; icon="fa-hourglass-half"; title=`Under Process — ${g.crn}`;
          msg=`Dear <strong>${g.name}</strong>, Your case is under process. Please contact us.<br><br>📞 ${window.NGO.alert}`;
        }
        showAlertModal(color, icon, title,
          msg + `<br><br><small style="color:#6B7280">Help: ${g.helpType||"—"} &nbsp;|&nbsp; Applied: ${g.timestamp||"—"} &nbsp;|&nbsp; Amount: Rs. ${Number(g.amountRequired||0).toLocaleString()}</small>`,
          [{ label:"<i class='fa-solid fa-rotate-left'></i> Check Again", fn:"closeAlertModal()" }]
        );
      }).catch(() => { setLoading(gsBtn, false); if (gsMsg) { gsMsg.textContent="Network error."; gsMsg.classList.add("error"); } });
    });
  }

  /* TEAM */
  function loadTeam() {
    if (!window.RHS) { setTimeout(loadTeam, 500); return; }
    const grid = document.getElementById("teamGrid");
    if (!grid) return;
    RHS.getTeam().then(res => {
      if (!res.success || !res.team || !res.team.length) { grid.innerHTML=""; return; }
      grid.innerHTML = "";
      res.team.forEach(member => {
        const card = document.createElement("div");
        card.className = "team-card";
        const ph = member.photo
          ? `<div class="photo" style="background-image:url('${member.photo}')"></div>`
          : `<div class="photo" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user" style="font-size:2rem;color:#8A9A96"></i></div>`;
        card.innerHTML = `${ph}<h4>${member.name}</h4><div class="role">${member.designation}</div><p class="bio">${member.bio||""}</p>`;
        grid.appendChild(card);
      });
    }).catch(() => {});
  }
  loadTeam();

  /* CONTACT FORM */
  const contactForm = document.getElementById("contactForm");
  const contactMsg  = document.getElementById("contactMsg");
  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!contactMsg) return;
      contactMsg.textContent=""; contactMsg.className="form-msg";
      const name    = document.getElementById("cName")?.value.trim()  || "";
      const email   = document.getElementById("cEmail")?.value.trim() || "";
      const message = document.getElementById("cMsg")?.value.trim()   || "";
      if (!name||!email||!message) { contactMsg.textContent="⚠️ Please fill all fields."; contactMsg.classList.add("error"); return; }
      const sendBtn = contactForm.querySelector("button[type='submit']");
      setLoading(sendBtn, true, "Sending...");
      if (!window.RHS) { setLoading(sendBtn, false); return; }
      RHS.submitContactMessage({ name, email, message }).then(res => {
        setLoading(sendBtn, false);
        if (res.success) {
          showAlertModal("green","fa-envelope-circle-check","Message Sent!",
            `Dear <strong>${name}</strong>, Thank you for contacting us. We will get back to you soon.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`,
            [{ label:"<i class='fa-solid fa-check'></i> OK", fn:"closeAlertModal()" }]
          );
          contactForm.reset();
        } else {
          contactMsg.textContent = res.message||"Something went wrong."; contactMsg.classList.add("error");
        }
      }).catch(() => { setLoading(sendBtn, false); contactMsg.textContent="⚠️ Network error."; contactMsg.classList.add("error"); });
    });
  }

  /* URDU TOGGLE */
  let isUrdu = false;
  window.toggleLang = function() {
    isUrdu = !isUrdu;
    const label = document.getElementById("langLabel");
    const html  = document.getElementById("htmlRoot");
    if (label) label.textContent = isUrdu ? "English" : "اردو";
    if (html) { html.setAttribute("lang", isUrdu?"ur":"en"); if(isUrdu) html.setAttribute("dir","rtl"); else html.removeAttribute("dir"); }
    document.querySelectorAll("[data-ur]").forEach(el => {
      if (isUrdu) { el._origText=el.textContent; el.textContent=el.getAttribute("data-ur"); }
      else if (el._origText) el.textContent=el._origText;
    });
  };

  /* NEWS */
  function loadNews() {
    const grid = document.getElementById("newsGrid");
    if (!grid) return;
    grid.innerHTML='<div class="news-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';
    if (!window.RHS) { setTimeout(loadNews, 800); return; }
    RHS.getNews().then(res => {
      if (!res.news||!res.news.length) { grid.innerHTML='<div class="news-loading">No news yet.</div>'; return; }
      grid.innerHTML = res.news.map(n => `
        <article class="news-card">
          ${n.imageURL?`<img src="${n.imageURL}" alt="${n.title}" class="news-card-img" loading="lazy">`:`<div class="news-card-img" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-newspaper" style="font-size:2rem;color:#8A9A96"></i></div>`}
          <div class="news-card-body">
            <span class="news-tag">${n.category||"News"}</span>
            <div class="news-card-date"><i class="fa-regular fa-calendar"></i> ${n.date||""}</div>
            <h3 class="news-card-title">${n.title||""}</h3>
            <p class="news-card-text">${n.body||n.content||""}</p>
          </div>
        </article>`).join("");
    }).catch(() => { grid.innerHTML='<div class="news-loading">Could not load news.</div>'; });
  }
  loadNews();

  /* STORIES */
  function loadStories() {
    const grid = document.getElementById("storiesGrid");
    if (!grid) return;
    grid.innerHTML='<div class="news-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';
    if (!window.RHS) { setTimeout(loadStories, 800); return; }
    RHS.getStories().then(res => {
      if (!res.stories||!res.stories.length) { grid.innerHTML='<div class="news-loading">No stories yet.</div>'; return; }
      grid.innerHTML = res.stories.map(s => `
        <article class="story-card">
          ${s.photo?`<img src="${s.photo}" alt="${s.name}" class="story-card-img" loading="lazy">`:`<div class="story-card-img placeholder"><i class="fa-solid fa-heart"></i></div>`}
          <span class="story-badge">${s.category||"Story"}</span>
          <div class="story-card-body">
            <div class="story-card-name">${s.name||""}</div>
            <div class="story-card-location"><i class="fa-solid fa-location-dot"></i> ${s.location||""}</div>
            <p class="story-card-text">${s.story||""}</p>
          </div>
        </article>`).join("");
    }).catch(() => { grid.innerHTML='<div class="news-loading">Could not load stories.</div>'; });
  }
  loadStories();

  /* SOCIAL LINKS */
  function loadContact() {
    if (!window.RHS) { setTimeout(loadContact, 500); return; }
    RHS.getContact().then(res => {
      if (!res.success) return;
      const setHref = (id, url) => { const el=document.getElementById(id); if(el&&url) el.href=url; };
      setHref("socialFb", res.facebook);
      setHref("socialIg", res.instagram);
      setHref("socialYt", res.youtube);
      if (res.whatsapp) { const el=document.getElementById("socialWa"); if(el) el.href="https://wa.me/"+res.whatsapp.replace(/\D/g,""); }
    }).catch(() => {});
  }
  loadContact();

  /* INIT */
  loadNGOSettings();

}); // end DOMContentLoaded
