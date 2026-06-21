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

  /* ============================================================
     MEMBER PORTAL — Navigation helpers
     Issues 5,6: alert screen ke samne aaye, Main Menu + Back
  ============================================================ */

  // Show/hide helpers
  function showEl(id)  { const el=document.getElementById(id); if(el) el.style.display="block"; }
  function hideEl(id)  { const el=document.getElementById(id); if(el) el.style.display="none";  }

  // Back to root Member Portal (New Reg + Certificate Verify buttons)
  window.backToMemberPortalMain = function() {
    hideEl("registration");
    hideEl("verifyPortalWrap");
    const certResult = document.getElementById("certResult");
    if (certResult) certResult.innerHTML = "";
    const memberLookupCard = document.getElementById("memberLookupCard");
    if (memberLookupCard) memberLookupCard.style.display = "block";
    clearVerifyForm();
    const ms = document.getElementById("memberSection");
    if (ms) { ms.style.display="block"; ms.scrollIntoView({ behavior:"smooth" }); }
  };

  // Back to verify form (within verify portal)
  window.backToVerifyForm = function() {
    const certResult = document.getElementById("certResult");
    if (certResult) certResult.innerHTML = "";
    const memberLookupCard = document.getElementById("memberLookupCard");
    if (memberLookupCard) memberLookupCard.style.display = "block";
    clearVerifyForm();
    const vp = document.getElementById("verifyPortalWrap");
    if (vp) vp.scrollIntoView({ behavior:"smooth" });
  };

  function clearVerifyForm() {
    const vCnic = document.getElementById("vCnic");
    const vDob  = document.getElementById("vDob");
    if (vCnic) vCnic.value = "";
    if (vDob)  vDob.value = "";
    const verifyMsg = document.getElementById("verifyMsg");
    if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
  }

  window.showMemberSection = function(which) {
    if (which === "registration") {
      hideEl("verifyPortalWrap");
      showEl("registration");
      document.getElementById("registration")?.scrollIntoView({ behavior:"smooth" });
    } else if (which === "verify") {
      hideEl("registration");
      showEl("verifyPortalWrap");
      const certResult = document.getElementById("certResult");
      if (certResult) certResult.innerHTML = "";
      const memberLookupCard = document.getElementById("memberLookupCard");
      if (memberLookupCard) memberLookupCard.style.display = "block";
      document.getElementById("verifyPortalWrap")?.scrollIntoView({ behavior:"smooth" });
    }
  };

  /* ============================================================
     REGISTRATION FORM — Issues 1,2,3
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

      const cnic       = document.getElementById("regCnic")?.value.trim() || "";
      const dob        = document.getElementById("regDob")?.value.trim() || "";
      const fullName   = document.getElementById("regName")?.value.trim() || "";
      const father     = document.getElementById("regFather")?.value.trim() || "";
      const gender     = document.getElementById("regGender")?.value || "";
      const prof       = document.getElementById("regProfession")?.value.trim() || "";
      const email      = document.getElementById("regEmail")?.value.trim() || "";
      const mobile     = document.getElementById("regMobile")?.value.trim() || "";
      const province   = document.getElementById("regProvince")?.value || "";
      const membership = document.getElementById("regMembership")?.value || "";
      const address    = document.getElementById("regAddress")?.value.trim() || "";

      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))  { formMsg.textContent="⚠️ Valid CNIC required: 00000-0000000-0"; formMsg.classList.add("error"); return; }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob))    { formMsg.textContent="⚠️ DOB format: dd-mm-yyyy"; formMsg.classList.add("error"); return; }
      if (!fullName)   { formMsg.textContent="⚠️ Full Name required."; formMsg.classList.add("error"); return; }
      if (!father)     { formMsg.textContent="⚠️ Father/Husband Name required."; formMsg.classList.add("error"); return; }
      if (!gender)     { formMsg.textContent="⚠️ Please select Gender."; formMsg.classList.add("error"); return; }
      if (!prof)       { formMsg.textContent="⚠️ Profession required."; formMsg.classList.add("error"); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { formMsg.textContent="⚠️ Valid Email format required."; formMsg.classList.add("error"); return; }
      if (!/^\d{4}-\d{7}$/.test(mobile)) { formMsg.textContent="⚠️ Mobile format: 0300-0000000"; formMsg.classList.add("error"); return; }
      if (!province)   { formMsg.textContent="⚠️ Please select Province."; formMsg.classList.add("error"); return; }
      if (!membership) { formMsg.textContent="⚠️ Please select Membership Type."; formMsg.classList.add("error"); return; }
      if (!address)    { formMsg.textContent="⚠️ Address required."; formMsg.classList.add("error"); return; }

      setLoading(submitBtn, true, "Submitting...");

      // Photo upload
      let photoUrl = "";
      const photoFile = document.getElementById("regPhoto")?.files?.[0];
      if (photoFile && window.RHS) {
        try { photoUrl = await RHS.uploadImage(photoFile, "rhs/members"); } catch(err) {}
      }

      if (!window.RHS) { setLoading(submitBtn, false); formMsg.textContent="Please wait, loading..."; return; }

      RHS.registerMember({ cnic, dob, fullName, fatherName: father, gender, profession: prof, email, mobile, province, address, membershipType: membership, photo: photoUrl })
      .then(res => {
        setLoading(submitBtn, false);
        if (res.success) {
          if (regForm) regForm.style.display = "none";
          if (formResult) {
            formResult.hidden = false;
            // Issue 2: Proper styled success alert
            formResult.innerHTML = makeAlert("green", "fa-circle-check",
              "Registration Submitted Successfully!",
              `Dear <strong>${fullName}</strong>, Your Registration Request has been Successfully Received.<br><br>
               Your Registration is now <strong>Underprocess</strong>. You will be notified after approval.<br><br>
               📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`,
              [
                {label:"<i class='fa-solid fa-house'></i> Main Menu", fn:"backToMemberPortalMain()"},
                {label:"<i class='fa-solid fa-user-plus'></i> New Registration", fn:"restartRegistration()"}
              ]
            );
          }
        } else if (res.code === "DUPLICATE") {
          if (regForm) regForm.style.display = "none";
          if (formResult) {
            formResult.hidden = false;
            formResult.innerHTML = makeAlert("yellow", "fa-circle-info",
              "Already Registered",
              res.message || `Dear <strong>${fullName}</strong>, You are already registered.`,
              [{label:"<i class='fa-solid fa-house'></i> Main Menu", fn:"backToMemberPortalMain()"}]
            );
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
  }

  window.restartRegistration = function() {
    if (regForm) { regForm.style.display="block"; regForm.reset(); }
    if (formResult) { formResult.hidden=true; formResult.innerHTML=""; }
    if (formMsg) { formMsg.textContent=""; formMsg.className="form-msg"; }
  };

  /* ============================================================
     ALERT BUILDER — Issues 4,5,6
     Colors: green=Active/Success, yellow=Underprocess, red=Banned, orange=Expired
  ============================================================ */
  function makeAlert(color, icon, title, body, buttons) {
    const colorMap = {
      green:  { bg:"#EEF8F1", border:"#1a9e5c", title:"#1a9e5c", icon:"#1a9e5c" },
      yellow: { bg:"#FFFBEB", border:"#D97706", title:"#92400E", icon:"#D97706" },
      red:    { bg:"#FEF2F2", border:"#DC2626", title:"#991B1B", icon:"#DC2626" },
      orange: { bg:"#FFF7ED", border:"#EA580C", title:"#9A3412", icon:"#EA580C" },
      teal:   { bg:"#EEF8F1", border:"#14534F", title:"#14534F", icon:"#14534F" },
    };
    const c = colorMap[color] || colorMap.teal;
    const btns = (buttons||[]).map(b =>
      `<button class="btn btn-ghost" onclick="${b.fn}" style="margin:4px">${b.label}</button>`
    ).join("");
    return `
      <div style="background:${c.bg};border:2px solid ${c.border};border-radius:16px;padding:32px 28px;max-width:540px;margin:0 auto;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <i class="fa-solid ${icon}" style="font-size:2.5rem;color:${c.icon};margin-bottom:12px;display:block"></i>
        <h3 style="font-family:'Fraunces',serif;color:${c.title};margin:0 0 12px;font-size:1.25rem">${title}</h3>
        <p style="color:#374151;line-height:1.7;margin:0 0 20px;font-size:.93rem">${body}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${btns}</div>
      </div>`;
  }
  window.makeAlert = makeAlert;

  /* ============================================================
     VERIFY PORTAL — Issues 3,4,5,6,7
     Single form, 3 buttons, result hides form, colored alerts
  ============================================================ */
  const verifyForm        = document.getElementById("verifyForm");
  const verifyMsg         = document.getElementById("verifyMsg");
  const certResult        = document.getElementById("certResult");
  const verifyBtn         = document.getElementById("verifyBtn");
  const verifyDonationBtn = document.getElementById("verifyDonationBtn");
  const verifyClearBtn    = document.getElementById("verifyClearBtn");
  const memberLookupCard  = document.getElementById("memberLookupCard");

  function getVerifyVals() {
    return {
      cnic: document.getElementById("vCnic")?.value.trim() || "",
      dob:  document.getElementById("vDob")?.value.trim()  || ""
    };
  }

  function validateVerify(cnic, dob) {
    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
      if (verifyMsg) { verifyMsg.textContent="⚠️ Valid CNIC required: 00000-0000000-0"; verifyMsg.classList.add("error"); }
      return false;
    }
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      if (verifyMsg) { verifyMsg.textContent="⚠️ DOB format: dd-mm-yyyy"; verifyMsg.classList.add("error"); }
      return false;
    }
    return true;
  }

  function showVerifyResult(html) {
    // Hide form, show result — Issue 5: screen ke samne
    if (memberLookupCard) memberLookupCard.style.display = "none";
    if (certResult) { certResult.innerHTML = html; certResult.scrollIntoView({ behavior:"smooth", block:"start" }); }
    if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
  }

  if (verifyForm) {
    verifyForm.addEventListener("submit", e => { e.preventDefault(); doVerifyCert(); });
  }

  // ---- Verify Certificate ----
  function doVerifyCert() {
    if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
    if (certResult) certResult.innerHTML = "";
    const { cnic, dob } = getVerifyVals();
    if (!validateVerify(cnic, dob)) return;
    setLoading(verifyBtn, true, "Verifying...");
    if (!window.RHS) { setLoading(verifyBtn, false); return; }
    RHS.getMemberByCredentials(cnic, dob).then(res => {
      setLoading(verifyBtn, false);
      if (res.success && res.found) {
        const m = res.member;
        const s = (m.status || "").toLowerCase();
        if (s === "active") {
          // Show digital certificate
          showVerifyResult(renderCertCard(m));
        } else {
          // Issue 3,4: Status-based colored alert with name
          const statusConfig = {
            underprocess: { color:"yellow", icon:"fa-hourglass-half", title:`Membership Underprocess`, msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>Underprocess</strong>. Your application is being reviewed. Please contact us for more information.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` },
            expired:      { color:"orange", icon:"fa-clock",           title:`Membership Expired`,      msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>Expired</strong>. Please contact us to renew your membership.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` },
            banned:       { color:"red",    icon:"fa-ban",             title:`Membership Banned`,       msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>Banned</strong>. Please contact us for more information.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` },
          };
          const cfg = statusConfig[s] || { color:"yellow", icon:"fa-circle-info", title:`Status: ${m.status}`, msg:`Dear <strong>${m.fullName}</strong>, Your Membership Status is <strong>${m.status}</strong>. Please contact us.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}` };
          showVerifyResult(makeAlert(cfg.color, cfg.icon, cfg.title, cfg.msg, [
            {label:"<i class='fa-solid fa-arrow-left'></i> Back", fn:"backToVerifyForm()"},
            {label:"<i class='fa-solid fa-house'></i> Main Menu", fn:"backToMemberPortalMain()"}
          ]));
        }
      } else {
        if (verifyMsg) { verifyMsg.textContent = res.message || "No record found with these credentials."; verifyMsg.classList.add("error"); }
      }
    }).catch(() => { setLoading(verifyBtn, false); if (verifyMsg) { verifyMsg.textContent="Network error."; verifyMsg.classList.add("error"); } });
  }

  // ---- Verify Charity Donation ----
  if (verifyDonationBtn) {
    verifyDonationBtn.addEventListener("click", () => {
      if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
      if (certResult) certResult.innerHTML = "";
      const { cnic, dob } = getVerifyVals();
      if (!validateVerify(cnic, dob)) return;
      setLoading(verifyDonationBtn, true, "Loading...");
      if (!window.RHS) { setLoading(verifyDonationBtn, false); return; }
      RHS.getCharityLedger(cnic, dob).then(res => {
        setLoading(verifyDonationBtn, false);
        if (!res.success) {
          if (verifyMsg) { verifyMsg.textContent = res.message || "No record found."; verifyMsg.classList.add("error"); }
          return;
        }
        showVerifyResult(renderLedger(res));
      }).catch(() => { setLoading(verifyDonationBtn, false); if (verifyMsg) { verifyMsg.textContent="Network error."; verifyMsg.classList.add("error"); } });
    });
  }

  // ---- Clear Button ----
  if (verifyClearBtn) {
    verifyClearBtn.addEventListener("click", () => {
      clearVerifyForm();
      if (certResult) certResult.innerHTML = "";
      if (memberLookupCard) memberLookupCard.style.display = "block";
    });
  }

  // Back to verify form (from result)
  window.backToVerifyForm = function() {
    if (certResult) certResult.innerHTML = "";
    if (memberLookupCard) memberLookupCard.style.display = "block";
    clearVerifyForm();
    const vp = document.getElementById("verifyPortalWrap");
    if (vp) vp.scrollIntoView({ behavior:"smooth" });
  };

  // ---- Certificate Card Renderer ----
  function renderCertCard(m) {
    const photoHtml = m.photo
      ? `<img src="${m.photo}" alt="${m.fullName}" style="width:100%;height:100%;object-fit:cover">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#EEF8F1;color:#8A9A96;font-size:2.5rem"><i class="fa-solid fa-user"></i></div>`;
    const mData = JSON.stringify(m).replace(/"/g, "&quot;");
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

  window.printMemberCert = function(m) {
    const pa = document.getElementById("printCert");
    if (!pa) return;
    pa.innerHTML = `
      <div style="border:6px double #14534F;padding:40px;font-family:Georgia,serif;max-width:700px;margin:0 auto">
        <div style="text-align:center;border-bottom:2px solid #E8A33D;padding-bottom:16px;margin-bottom:20px">
          <h1 style="color:#14534F;margin:0">${window.NGO.name}</h1>
          <p style="color:#E8A33D;letter-spacing:3px;margin:4px 0;font-size:.85rem">DIGITAL MEMBERSHIP CERTIFICATE</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="width:28%;vertical-align:top;padding-right:20px">
              ${m.photo?`<img src="${m.photo}" style="width:110px;height:130px;object-fit:cover;border:2px solid #14534F">`:`<div style="width:110px;height:130px;background:#eee;border:2px solid #14534F;display:flex;align-items:center;justify-content:center;font-size:3rem;color:#aaa">👤</div>`}
            </td>
            <td style="vertical-align:top">
              <h2 style="color:#14534F;margin:0 0 4px">${m.fullName}</h2>
              <p style="color:#888;margin:0 0 10px">${m.membershipType||"Member"}</p>
              <table style="width:100%;font-size:.9rem">
                <tr><td style="padding:3px 0;font-weight:bold;width:130px">Reg No:</td><td>${m.registrationNo}</td></tr>
                <tr><td style="padding:3px 0;font-weight:bold">CNIC:</td><td>${m.cnic}</td></tr>
                <tr><td style="padding:3px 0;font-weight:bold">Father/Husband:</td><td>${m.fatherName||"—"}</td></tr>
                <tr><td style="padding:3px 0;font-weight:bold">Mobile:</td><td>${m.mobile||"—"}</td></tr>
                <tr><td style="padding:3px 0;font-weight:bold">Valid Upto:</td><td style="color:#1a9e5c;font-weight:bold">${m.validUpto||"—"}</td></tr>
                <tr><td style="padding:3px 0;font-weight:bold">Address:</td><td>${m.address||"—"}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #E7DFD2;color:#888;font-size:.75rem">
          ${window.NGO.address} &nbsp;·&nbsp; ${window.NGO.phone} &nbsp;·&nbsp; ${window.NGO.email}
        </div>
      </div>`;
    window.print();
    setTimeout(() => { pa.innerHTML=""; }, 3000);
  };

  // ---- Charity Ledger Renderer ----
  function renderLedger(res) {
    const m = res.member;
    const donations = res.donations || [];
    let runTotal = 0;
    const rows = !donations.length
      ? `<tr><td colspan="4" style="text-align:center;padding:24px;color:#8A9A96;font-style:italic">No charity donations recorded yet.</td></tr>`
      : donations.map((d,i) => {
          runTotal += Number(d.amount)||0;
          return `<tr style="background:${i%2?"#F5F9F8":"#fff"}">
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.date||""}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.paymentMethod||d.method||"Cash"}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;color:#2E9E5B;font-weight:600">Rs. ${Number(d.amount||0).toLocaleString()}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-weight:600">Rs. ${runTotal.toLocaleString()}</td>
          </tr>`;
        }).join("");
    return `
      <div class="ledger-wrap">
        <div class="ledger-header">
          <img src="images/logo.png" alt="RHS" class="ledger-logo">
          <div><h3>${window.NGO.name}</h3><small>${window.NGO.address}</small></div>
        </div>
        <div style="text-align:center;margin:10px 0"><span class="eyebrow">Charity Donation Ledger</span></div>
        <div class="ledger-member-info">
          <div class="ledger-info-row"><span class="lbl">Member Name</span><span class="val">${m.fullName}</span></div>
          <div class="ledger-info-row"><span class="lbl">Reg No</span><span class="val">${m.registrationNo}</span></div>
          <div class="ledger-info-row"><span class="lbl">CNIC</span><span class="val">${m.cnic}</span></div>
          <div class="ledger-info-row"><span class="lbl">Valid Upto</span><span class="val" style="color:#14534F;font-weight:700">${m.validUpto||"—"}</span></div>
          <div class="ledger-info-row"><span class="lbl">Status</span><span class="val"><span class="cert-badge">${m.status}</span></span></div>
        </div>
        <div style="overflow-x:auto;margin-top:16px">
          <table style="width:100%;border-collapse:collapse;font-size:.88rem">
            <thead><tr style="background:#14534F;color:#fff">
              <th style="padding:10px 14px;text-align:left">Date</th>
              <th style="padding:10px 14px;text-align:left">Payment</th>
              <th style="padding:10px 14px;text-align:left">Amount</th>
              <th style="padding:10px 14px;text-align:left">Running Total</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr style="background:#EEF8F1">
              <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F">Total Charity Contributed</td>
              <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F;font-size:1rem">Rs. ${res.total.toLocaleString()}</td>
            </tr></tfoot>
          </table>
        </div>
        <p class="cert-footnote">${window.NGO.name} &nbsp;|&nbsp; ${window.NGO.phone} &nbsp;|&nbsp; ${window.NGO.email}</p>
        <div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="window.print()"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>
          <button class="btn btn-ghost" onclick="backToVerifyForm()"><i class="fa-solid fa-arrow-left"></i> Back</button>
          <button class="btn btn-ghost" onclick="backToMemberPortalMain()"><i class="fa-solid fa-house"></i> Main Menu</button>
        </div>
      </div>`;
  }

  /* PHOTO PREVIEW */
  window.previewRegPhoto = function(input) {
    const file = input.files?.[0];
    if (!file) return;
    const preview = document.getElementById("regPhotoPreview");
    if (!preview) return;
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
    };
    reader.readAsDataURL(file);
  };
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

  /* TEAM */
  window.showHelpSection = function(which) {
    const btns = document.getElementById("helpdeskBtns");
    const grantFormWrap = document.getElementById("grantFormWrap");
    const grantStatusWrap = document.getElementById("grantStatusWrap");
    if (btns) btns.style.display = "none";
    if (grantFormWrap) grantFormWrap.style.display = (which === "grant") ? "block" : "none";
    if (grantStatusWrap) grantStatusWrap.style.display = (which === "status") ? "block" : "none";
    const desk = document.getElementById("charityDesk");
    if (desk) desk.scrollIntoView({ behavior:"smooth" });
  };

  window.hideHelpSection = function() {
    const btns = document.getElementById("helpdeskBtns");
    const grantFormWrap = document.getElementById("grantFormWrap");
    const grantStatusWrap = document.getElementById("grantStatusWrap");
    if (btns) btns.style.display = "flex";
    if (grantFormWrap) grantFormWrap.style.display = "none";
    if (grantStatusWrap) grantStatusWrap.style.display = "none";
    const grantForm2 = document.getElementById("grantForm");
    if (grantForm2) grantForm2.style.display = "block";
    const grantResult2 = document.getElementById("grantResult");
    if (grantResult2) { grantResult2.style.display="none"; grantResult2.innerHTML=""; }
    const desk = document.getElementById("charityDesk");
    if (desk) desk.scrollIntoView({ behavior:"smooth" });
  };

  /* GRANT FORM — Issue 1: Submission message */
  const grantForm = document.getElementById("grantForm");
  const grantMsg  = document.getElementById("grantMsg");
  const grantResult = document.getElementById("grantResult");
  const grantSubmitBtn = document.getElementById("grantSubmitBtn");

  if (grantForm) {
    grantForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (grantMsg) { grantMsg.textContent=""; grantMsg.className="form-msg"; }
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
      if (!cnic||!dob||!name||!father||!gender||!mobile||!helpType||!amount||!address) {
        if (grantMsg) { grantMsg.textContent="Please fill all required fields."; grantMsg.classList.add("error"); }
        return;
      }
      setLoading(grantSubmitBtn, true, "Submitting...");
      if (!window.RHS) { setLoading(grantSubmitBtn, false); return; }
      RHS.submitGrant({ cnic, dob, name, fatherName:father, gender, email, mobile, helpType, amountRequired:Number(amount), address })
      .then(res => {
        setLoading(grantSubmitBtn, false);
        if (res.success) {
          grantForm.style.display = "none";
          if (grantResult) {
            grantResult.style.display = "block";
            grantResult.innerHTML = makeAlert("green","fa-circle-check","Request Submitted Successfully!",
              `Dear <strong>${name}</strong>, Your Charity Help Request has been Successfully Received.<br><br>
               Your <strong>Case Reference Number</strong> is <strong>${res.crn||""}</strong>. Our team will contact you soon.<br><br>
               📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`,
              [{label:"<i class='fa-solid fa-arrow-left'></i> Back", fn:"hideHelpSection()"}]
            );
          }
        } else if (res.code === "DUPLICATE_CASE") {
          grantForm.style.display = "none";
          if (grantResult) {
            grantResult.style.display = "block";
            grantResult.innerHTML = makeAlert("yellow","fa-circle-info","Case Already Submitted",
              res.message || `Dear <strong>${name}</strong>, You already have an active case.`,
              [{label:"<i class='fa-solid fa-arrow-left'></i> Back", fn:"hideHelpSection()"}]
            );
          }
        } else {
          if (grantMsg) { grantMsg.textContent=res.message||"Something went wrong."; grantMsg.classList.add("error"); }
        }
      }).catch(() => { setLoading(grantSubmitBtn, false); if (grantMsg) { grantMsg.textContent="Network error."; grantMsg.classList.add("error"); } });
    });
  }

  /* GRANT STATUS — Issue 7: charity approval status, Issue 8: proper status display */
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

    grantStatusForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (gsMsg) { gsMsg.textContent=""; gsMsg.className="form-msg"; }
      if (grantStatusResult) grantStatusResult.innerHTML="";
      const cnic = document.getElementById("gsCnic")?.value.trim() || "";
      const dob  = document.getElementById("gsDob")?.value.trim() || "";
      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)||!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        if (gsMsg) { gsMsg.textContent="Please enter valid CNIC and DOB."; gsMsg.classList.add("error"); }
        return;
      }
      const gsBtn = grantStatusForm.querySelector('[type="submit"]');
      setLoading(gsBtn, true, "Checking...");
      if (!window.RHS) { setLoading(gsBtn, false); return; }
      RHS.getGrantStatus(cnic, dob).then(res => {
        setLoading(gsBtn, false);
        if (!res.success||!res.grants||!res.grants.length) {
          if (grantStatusResult) grantStatusResult.innerHTML = makeAlert("red","fa-circle-xmark","No Request Found",
            res.message||"No charity request found with these credentials. Please check your CNIC and Date of Birth.",
            [{label:"<i class='fa-solid fa-rotate-left'></i> Try Again", fn:"document.getElementById('grantStatusForm').reset()"}]
          );
          return;
        }
        const active = res.grants.filter(g=>(g.status||"").toLowerCase()!=="closed");
        const closed = res.grants.filter(g=>(g.status||"").toLowerCase()==="closed");
        const list = active.length ? active : closed;
        let html = "";
        list.forEach(g => {
          const s = (g.status||"").toLowerCase();
          const d = (g.decision||"").toLowerCase();
          let color, icon, title, msg;
          if (s==="new") {
            color="yellow"; icon="fa-hourglass-half"; title=`Case Received — ${g.crn}`;
            msg=`Dear <strong>${g.name}</strong>, Your Charity Help Request <strong>${g.crn}</strong> has been received. Our team will review and contact you soon.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`;
          } else if (s==="assigned") {
            color="teal"; icon="fa-user-check"; title=`Case Assigned — ${g.crn}`;
            msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> has been assigned to our team member <strong>${g.assignedTo||"our team"}</strong>. They will contact you soon. Please cooperate.<br><br>📞 ${window.NGO.alert}`;
          } else if (s==="completed") {
            color="yellow"; icon="fa-clipboard-check"; title=`Verification Completed — ${g.crn}`;
            msg=`Dear <strong>${g.name}</strong>, The verification for your case <strong>${g.crn}</strong> has been completed. Please wait for the final decision.<br><br>📞 ${window.NGO.alert}`;
          } else if (d==="approved"&&s!=="closed") {
            color="green"; icon="fa-circle-check"; title=`Case APPROVED — ${g.crn}`;
            msg=`Dear <strong>${g.name}</strong>, Congratulations! 🎉 Your Charity Case <strong>${g.crn}</strong> has been <strong>Approved</strong>. Our team will contact you and deliver your help at your doorstep.<br><br>📞 ${window.NGO.alert}`;
          } else if (d==="rejected"&&s!=="closed") {
            color="red"; icon="fa-circle-xmark"; title=`Case Rejected — ${g.crn}`;
            msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> has been <strong>Rejected</strong> as it does not match our current criteria. To reopen or appeal, please physically meet our President with your Case No.<br><br>📞 ${window.NGO.alert}`;
          } else if (s==="closed"&&d!=="rejected") {
            color="green"; icon="fa-lock"; title=`Case Closed — Successfully Granted`;
            msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> has been <strong>Successfully Closed</strong> after granting. Jazak Allah Khair! 🤲`;
          } else if (s==="closed"&&d==="rejected") {
            color="red"; icon="fa-lock"; title=`Case Closed — ${g.crn}`;
            msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> has been Closed after Rejection. To appeal, please meet our President.<br><br>📞 ${window.NGO.alert}`;
          } else {
            color="yellow"; icon="fa-hourglass-half"; title=`Case Under Process — ${g.crn}`;
            msg=`Dear <strong>${g.name}</strong>, Your case <strong>${g.crn}</strong> is under process. Please contact us for more information.<br><br>📞 ${window.NGO.alert}`;
          }
          html += `<div style="margin-bottom:16px">${makeAlert(color, icon, title,
            msg + `<br><br><small style="color:#6B7280">Help Type: ${g.helpType||"—"} &nbsp;|&nbsp; Applied: ${g.timestamp||"—"} &nbsp;|&nbsp; Amount: Rs. ${Number(g.amountRequired||g.amount||0).toLocaleString()}</small>`,
            []
          )}</div>`;
        });
        if (grantStatusResult) grantStatusResult.innerHTML = html;
      }).catch(() => { setLoading(gsBtn, false); if (gsMsg) { gsMsg.textContent="Network error."; gsMsg.classList.add("error"); } });
    });
  }

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
