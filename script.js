// ============================================================
// RISING HOPE SOCIETY — script.js (Fixed & Complete)
// ============================================================

/* ===================== GLOBAL UTILITIES ===================== */
function setLoading(btn, loading, text = "") {
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
  logoUrl: "",
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
      logoUrl:       res.logoUrl        || "",
      copyright:     res.copyrightText  || "",
      ourTeamTitle:  res.ourTeamTitle   || "Our Team",
      ourTeamMatter: res.ourTeamMatter  || ""
    };

    // === Apply name everywhere ===
    document.querySelectorAll(".ngo-name").forEach(el => el.textContent = window.NGO.name);
    document.querySelectorAll(".ngo-address").forEach(el => el.textContent = window.NGO.address);
    document.querySelectorAll(".ngo-phone").forEach(el => el.textContent = window.NGO.phone);
    document.querySelectorAll(".ngo-email").forEach(el => el.textContent = window.NGO.email);

    // === Apply to specific elements ===
    // Navbar brand name
    const brandName = document.querySelector(".brand-name");
    if(brandName && window.NGO.name) brandName.innerHTML = window.NGO.name.replace(" ", " <em>") + "</em>";

    // Team section
    const teamTitle = document.querySelector("#team .section-head h2");
    if(teamTitle) teamTitle.textContent = window.NGO.ourTeamTitle;
    const teamMatter = document.querySelector("#team .section-head p");
    if(teamMatter && window.NGO.ourTeamMatter) teamMatter.textContent = window.NGO.ourTeamMatter;

    // Copyright line
    if(window.NGO.copyright) {
      const copyrightEl = document.getElementById("copyrightLine");
      if(copyrightEl) copyrightEl.textContent = "© " + new Date().getFullYear() + " " + window.NGO.copyright;
    }

    // === Apply logo everywhere ===
    if(window.NGO.logoUrl) {
      ["navbarLogo","heroLogo","footerLogo"].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.src = window.NGO.logoUrl;
      });
    }
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

  /* ===================== NAVBAR ===================== */
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
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    if (navLinks) {
      navLinks.querySelectorAll("a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    }
  });

  /* ===================== HERO SLIDER ===================== */
  const slides   = document.querySelectorAll(".slide");
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

  /* ===================== INPUT FORMATTERS ===================== */

  /* CNIC FORMAT */
  document.querySelectorAll('[id*="cnic"],[id*="Cnic"],[placeholder*="00000-"]').forEach(el => {
    el.setAttribute("autocomplete", "new-password");
    el.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").slice(0, 13);
      if (v.length > 12) v = v.slice(0, 5) + "-" + v.slice(5, 12) + "-" + v.slice(12);
      else if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
      this.value = v;
    });
  });

  /* DOB FORMAT */
  document.querySelectorAll('[id*="dob"],[id*="Dob"],[placeholder*="dd-mm-yyyy"]').forEach(el => {
    el.setAttribute("autocomplete", "new-password");
    el.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").slice(0, 8);
      if (v.length > 4) v = v.slice(0, 2) + "-" + v.slice(2, 4) + "-" + v.slice(4);
      else if (v.length > 2) v = v.slice(0, 2) + "-" + v.slice(2);
      this.value = v;
    });
    el.addEventListener("blur", function () {
      const val = this.value.trim();
      this.style.borderColor = (val && !/^\d{2}-\d{2}-\d{4}$/.test(val)) ? "#D9483A" : "";
    });
  });

  /* MOBILE FORMAT */
  document.querySelectorAll('[id*="mobile"],[id*="Mobile"],[placeholder*="0300-"],[placeholder*="0346-"]').forEach(el => {
    el.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 4) v = v.slice(0, 4) + "-" + v.slice(4);
      this.value = v;
    });
  });

  /* ===================== STATISTICS ===================== */
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

  let statsLoaded = false;
  let statsVisible = false;

  function runStatsAnimation() {
    if (!statsLoaded || !statsVisible) return;
    ["pub-pending","pub-active","pub-expired","pub-banned",
     "pub-completed","pub-approved","pub-rejected","pub-closed"].forEach(id => {
      const el = document.getElementById(id);
      if (el) animateCount(el, el.dataset.target || 0);
    });
  }

  function loadStatistics() {
    if (!window.RHS) { setTimeout(loadStatistics, 500); return; }
    RHS.getPublicStats().then(res => {
      if (!res || !res.success) return;
      const map = {
        "pub-pending":   res.pendingMembers  || 0,
        "pub-active":    res.activeMembers   || 0,
        "pub-expired":   res.expiredMembers  || 0,
        "pub-banned":    res.bannedMembers   || 0,
        "pub-completed": res.completedCases  || 0,
        "pub-approved":  res.approvedCases   || 0,
        "pub-rejected":  res.rejectedCases   || 0,
        "pub-closed":    res.closedCases     || 0
      };
      Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.dataset.target = val;
      });
      statsLoaded = true;
      runStatsAnimation();
    }).catch(() => {});
  }
  loadStatistics();

  const statsEl = document.getElementById("stats");
  if (statsEl) {
    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statsVisible = true;
          runStatsAnimation();
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });
    statsObserver.observe(statsEl);
  }

  /* YEAR */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== REGISTRATION FORM ===================== */
  const regForm    = document.getElementById("regForm");
  const formMsg    = document.getElementById("formMsg");
  const formResult = document.getElementById("formResult");
  const submitBtn  = document.getElementById("submitBtn");

  /* Helper: show full-page alert replacing the form */
  function showRegAlert(type, html) {
    if (regForm) regForm.style.display = "none";
    if (formResult) {
      formResult.hidden = false;
      formResult.innerHTML = `<div class="status-msg ${type}">${html}</div>`;
      setTimeout(() => formResult.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    }
  }

  /* ---- LIVE CNIC DUPLICATE CHECK ---- */
  /* Fires when CNIC field loses focus AND is fully valid (15 chars) */
  const regCnicEl = document.getElementById("regCnic");
  let cnicCheckTimer = null;
  if (regCnicEl) {
    regCnicEl.addEventListener("blur", function () {
      const val = this.value.trim();
      if (!/^\d{5}-\d{7}-\d{1}$/.test(val)) return; // not complete yet — skip
      if (!window.RHS) return;
      clearTimeout(cnicCheckTimer);
      cnicCheckTimer = setTimeout(() => {
        // Check duplicate by querying Firestore through a lightweight member search
        RHS.getMembers && RHS.searchMembers
          ? RHS.searchMembers(val).then(res => {
              const found = res.members && res.members.length > 0;
              if (found) {
                const m = res.members[0];
                showRegAlert("status-yellow", `
                  <i class="fa-solid fa-circle-exclamation" style="font-size:2.2rem;color:#E8A33D;display:block;margin-bottom:12px"></i>
                  <div class="status-title" style="color:#92620A">Already Registered!</div>
                  <p>Dear <strong>${m.fullName || "Applicant"}</strong>, You are already a Registered Member of <strong>${window.NGO.name}</strong>.</p>
                  <p style="margin-top:8px">Please check your Registration Status by using the <strong>Certificate &amp; Donation Verify</strong> portal.</p>
                  <p style="margin-top:12px;font-size:.88rem;color:#555">
                    📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:var(--teal);font-weight:600">${window.NGO.alert}</a>
                    &nbsp;|&nbsp;
                    📧 <a href="mailto:${window.NGO.email}" style="color:var(--teal);font-weight:600">${window.NGO.email}</a>
                  </p>
                  <div class="reg-alert-btns">
                    <button class="btn btn-primary" onclick="hideMemberSection();setTimeout(()=>showMemberSection('verify'),100)">
                      <i class="fa-solid fa-shield-halved"></i> Verify My Certificate
                    </button>
                    <button class="btn btn-ghost" onclick="if(formResult){formResult.hidden=true;} if(regForm){regForm.style.display='';document.getElementById('regCnic').value='';document.getElementById('regCnic').focus();}">
                      <i class="fa-solid fa-rotate-left"></i> Try Different CNIC
                    </button>
                    <button class="btn btn-ghost" onclick="hideMemberSection()">
                      <i class="fa-solid fa-arrow-left"></i> Back to Portal
                    </button>
                  </div>`);
              }
            }).catch(() => {})
          : null;
      }, 400);
    });
  }

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

      const cnic       = document.getElementById("regCnic")?.value.trim()       || "";
      const dob        = document.getElementById("regDob")?.value.trim()        || "";
      const fullName   = document.getElementById("regName")?.value.trim()       || "";
      const father     = document.getElementById("regFather")?.value.trim()     || "";
      const gender     = document.getElementById("regGender")?.value            || "";
      const prof       = document.getElementById("regProfession")?.value.trim() || "";
      const email      = document.getElementById("regEmail")?.value.trim()      || "";
      const mobile     = document.getElementById("regMobile")?.value.trim()     || "";
      const province   = document.getElementById("regProvince")?.value          || "";
      const address    = document.getElementById("regAddress")?.value.trim()    || "";
      const membership = document.getElementById("regMembership")?.value        || "";

      // Validations — clear inline errors
      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))   { formMsg.textContent = "⚠️ CNIC format: 00000-0000000-0"; formMsg.classList.add("error"); document.getElementById("regCnic")?.focus(); return; }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob))    { formMsg.textContent = "⚠️ Date of Birth format: dd-mm-yyyy"; formMsg.classList.add("error"); document.getElementById("regDob")?.focus(); return; }
      if (!fullName)                             { formMsg.textContent = "⚠️ Full Name is required."; formMsg.classList.add("error"); document.getElementById("regName")?.focus(); return; }
      if (!father)                               { formMsg.textContent = "⚠️ Father / Husband Name is required."; formMsg.classList.add("error"); document.getElementById("regFather")?.focus(); return; }
      if (!gender)                               { formMsg.textContent = "⚠️ Please select Gender."; formMsg.classList.add("error"); return; }
      if (!prof)                                 { formMsg.textContent = "⚠️ Profession is required."; formMsg.classList.add("error"); document.getElementById("regProfession")?.focus(); return; }
      if (!/^\d{4}-\d{7}$/.test(mobile))        { formMsg.textContent = "⚠️ Mobile format: 0300-0000000"; formMsg.classList.add("error"); document.getElementById("regMobile")?.focus(); return; }
      if (!province)                             { formMsg.textContent = "⚠️ Please select Province."; formMsg.classList.add("error"); return; }
      if (!membership)                           { formMsg.textContent = "⚠️ Please select Membership Type."; formMsg.classList.add("error"); return; }
      if (!address)                              { formMsg.textContent = "⚠️ Full Address is required."; formMsg.classList.add("error"); document.getElementById("regAddress")?.focus(); return; }

      setLoading(submitBtn, true, "Submitting...");

      /* Upload photo if selected */
      let photoUrl = "";
      const photoFile = document.getElementById("regPhoto")?.files?.[0];
      if (photoFile && window.RHS) {
        try { photoUrl = await RHS.uploadImage(photoFile, "rhs/members"); } catch (err) {}
      }

      if (!window.RHS) { setLoading(submitBtn, false); formMsg.textContent = "Please wait, loading..."; return; }

      RHS.registerMember({ cnic, dob, fullName, fatherName: father, gender, profession: prof, email, mobile, province, address, membershipType: membership, photo: photoUrl })
        .then(res => {
          setLoading(submitBtn, false);

          if (res.success) {
            // ✅ SUCCESS ALERT
            showRegAlert("status-green", `
              <i class="fa-solid fa-circle-check" style="font-size:2.5rem;color:#2E9E5B;display:block;margin-bottom:12px"></i>
              <div class="status-title" style="color:#1A6B3A">Registration Submitted Successfully!</div>
              <p>Dear <strong>${fullName}</strong>, Your Registration Application has been <strong>Successfully Submitted</strong> to <strong>${window.NGO.name}</strong>.</p>
              <p style="margin-top:8px">Your application is currently <strong>Under Process</strong>. Our team will review your application and contact you after approval. Please keep your CNIC and Date of Birth handy for future verification.</p>
              <p style="margin-top:12px;font-size:.9rem;color:#555">
                📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:var(--teal);font-weight:600">${window.NGO.alert}</a>
                &nbsp;|&nbsp;
                📧 <a href="mailto:${window.NGO.email}" style="color:var(--teal);font-weight:600">${window.NGO.email}</a>
              </p>
              <div class="reg-alert-btns">
                <button class="btn btn-primary" onclick="hideMemberSection();setTimeout(()=>showMemberSection('verify'),100)">
                  <i class="fa-solid fa-shield-halved"></i> Verify My Status
                </button>
                <button class="btn btn-ghost" onclick="hideMemberSection()">
                  <i class="fa-solid fa-arrow-left"></i> Back to Portal
                </button>
              </div>`);

          } else if (res.code === "DUPLICATE") {
            // ⚠️ DUPLICATE ALERT
            showRegAlert("status-yellow", `
              <i class="fa-solid fa-circle-exclamation" style="font-size:2.2rem;color:#E8A33D;display:block;margin-bottom:12px"></i>
              <div class="status-title" style="color:#92620A">Already Registered!</div>
              <p>Dear <strong>${fullName}</strong>, You are already a Registered Member of <strong>${window.NGO.name}</strong>.</p>
              <p style="margin-top:8px">Please check your Registration Status by using the <strong>Certificate &amp; Donation Verify</strong> portal.</p>
              <p style="margin-top:12px;font-size:.9rem;color:#555">
                📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:var(--teal);font-weight:600">${window.NGO.alert}</a>
                &nbsp;|&nbsp;
                📧 <a href="mailto:${window.NGO.email}" style="color:var(--teal);font-weight:600">${window.NGO.email}</a>
              </p>
              <div class="reg-alert-btns">
                <button class="btn btn-primary" onclick="hideMemberSection();setTimeout(()=>showMemberSection('verify'),100)">
                  <i class="fa-solid fa-shield-halved"></i> Verify My Certificate
                </button>
                <button class="btn btn-ghost" onclick="hideMemberSection()">
                  <i class="fa-solid fa-arrow-left"></i> Back to Portal
                </button>
              </div>`);

          } else {
            formMsg.textContent = res.message || "Something went wrong. Please try again.";
            formMsg.classList.add("error");
          }
        })
        .catch(() => {
          setLoading(submitBtn, false);
          formMsg.textContent = "⚠️ Network error. Please check your connection and try again.";
          formMsg.classList.add("error");
        });
    });

    const newRegBtn = document.getElementById("newRegBtn");
    if (newRegBtn) {
      newRegBtn.addEventListener("click", () => {
        regForm.reset();
        regForm.style.display = "";
        if (formResult) formResult.hidden = true;
        if (formMsg) { formMsg.textContent = ""; formMsg.className = "form-msg"; }
      });
    }
  }

  /* ===================== CERTIFICATE VERIFICATION ===================== */
  const verifyForm = document.getElementById("verifyForm");
  const verifyMsg  = document.getElementById("verifyMsg");
  const certResult = document.getElementById("certResult");
  const verifyBtn  = document.getElementById("verifyBtn");

  if (verifyForm) {
    verifyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Hide charity report before showing certificate
      const donResult = document.getElementById("donationResult");
      if (donResult) donResult.innerHTML = "";
      doVerify();
    });
  }

  function doVerify() {
    if (!verifyMsg || !certResult) return;
    verifyMsg.textContent = "";
    verifyMsg.className = "form-msg";
    certResult.hidden = true;
    certResult.innerHTML = "";
    const cnic = document.getElementById("vCnic")?.value.trim() || "";
    const dob  = document.getElementById("vDob")?.value.trim()  || "";
    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic) || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      verifyMsg.textContent = "Please enter valid CNIC and DOB (dd-mm-yyyy).";
      verifyMsg.classList.add("error");
      return;
    }
    setLoading(verifyBtn, true, "Verifying...");
    if (!window.RHS) { setLoading(verifyBtn, false); return; }
    RHS.getMemberByCredentials(cnic, dob)
      .then(res => {
        setLoading(verifyBtn, false);
        if (res.success && res.found) {
          const stLow = (res.member.status || "").toLowerCase();
          // Show certificate for active/expired/banned; professional alert for underprocess/others
          if (stLow === "active" || stLow === "expired" || stLow === "banned") {
            renderCertificate(res.member);
          } else {
          const m = res.member;
          const st = (m.status || "Underprocess");
          const isRejected = st.toLowerCase() === "rejected" || st.toLowerCase() === "banned";
          const vibe  = isRejected ? "status-red"    : "status-yellow";
          const icon  = isRejected ? "fa-circle-xmark" : "fa-hourglass-half";
          const iconColor = isRejected ? "#D9483A" : "#E8A33D";
          const titleColor = isRejected ? "#8B1A1A" : "#92620A";
          const msgBody = isRejected
            ? `Dear <strong>${m.fullName || "Applicant"}</strong>, Your Membership Request is currently <strong>${st}</strong>. Please visit our office or contact us for further information.`
            : `Dear <strong>${m.fullName || "Applicant"}</strong>, Your Membership Request is currently <strong>${st}</strong>. Our team is reviewing your application. You will be contacted after approval. Please keep your CNIC and Date of Birth handy.`;
          certResult.hidden = false;
          certResult.innerHTML = `
            <div class="status-msg ${vibe}">
              <i class="fa-solid ${icon}" style="font-size:2.2rem;color:${iconColor};display:block;margin-bottom:12px"></i>
              <div class="status-title" style="color:${titleColor}">Membership Status: ${st}</div>
              <p>${msgBody}</p>
              <p style="margin-top:10px;font-size:.88rem;color:#555">
                📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:var(--teal);font-weight:600">${window.NGO.alert}</a>
                &nbsp;|&nbsp;
                📧 <a href="mailto:${window.NGO.email}" style="color:var(--teal);font-weight:600">${window.NGO.email}</a>
              </p>
              <div class="reg-alert-btns">
                <button class="btn btn-ghost" onclick="window.closeLedger();document.getElementById('certResult').hidden=true;document.getElementById('certResult').innerHTML='';">
                  <i class="fa-solid fa-rotate-left"></i> Search Again
                </button>
                <button class="btn btn-ghost" onclick="hideMemberSection()">
                  <i class="fa-solid fa-arrow-left"></i> Back to Portal
                </button>
              </div>
            </div>`;
          }
        } else {
          verifyMsg.textContent = res.message || "Record not found.";
          verifyMsg.classList.add("error");
        }
      })
      .catch(() => {
        setLoading(verifyBtn, false);
        verifyMsg.textContent = "Network error.";
        verifyMsg.classList.add("error");
      });
  }

  function renderCertificate(member) {
    if (!certResult) return;
    const st = (member.status || "Active");
    const stLow = st.toLowerCase();
    const isActive  = stLow === "active";
    const isBanned  = stLow === "banned";
    const isExpired = stLow === "expired";
    // Badge color: Active=green, Banned=red, Expired=orange, else yellow
    const badgeColor = isActive ? "#2E9E5B" : isBanned ? "#D9483A" : isExpired ? "#E07B2A" : "#E8A33D";
    const badgeBg    = isActive ? "#EEF8F1"  : isBanned ? "#FEF2F2" : isExpired ? "#FEF3EA" : "#FEF9EC";
    const badgeTxt   = isActive ? "✅ Active"  : isBanned ? "🚫 Banned" : isExpired ? "🕐 Expired" : st;
    const borderCol  = isActive ? "#14534F"   : isBanned ? "#D9483A" : isExpired ? "#E07B2A" : "#E8A33D";

    const photoHtml = member.photo
      ? `<img src="${member.photo}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid ${borderCol};display:block;margin:0 auto 12px">`
      : `<div style="width:90px;height:90px;border-radius:50%;background:#EEF8F1;border:3px solid ${borderCol};display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><i class="fa-solid fa-user" style="font-size:2rem;color:#8A9A96"></i></div>`;
    certResult.hidden = false;
    certResult.innerHTML = `
      <div class="cert-card">
        <div class="cert-header">
          <h3><i class="fa-solid fa-certificate"></i> Digital Membership Certificate</h3>
          <span class="cert-badge" style="background:${badgeBg};color:${badgeColor};border:1.5px solid ${badgeColor}55">${badgeTxt}</span>
        </div>
        ${photoHtml}
        <div class="cert-grid">
          <div class="item"><span class="lbl">Full Name</span><span class="val">${member.fullName}</span></div>
          <div class="item"><span class="lbl">Reg No</span><span class="val">${member.registrationNo}</span></div>
          <div class="item"><span class="lbl">Membership</span><span class="val">${member.membershipType || "—"}</span></div>
          <div class="item"><span class="lbl">Gender</span><span class="val">${member.gender}</span></div>
          <div class="item"><span class="lbl">Mobile</span><span class="val">${member.mobile}</span></div>
          <div class="item"><span class="lbl">Valid Upto</span><span class="val">${member.validUpto || "—"}</span></div>
          <div class="item" style="grid-column:1/-1"><span class="lbl">Address</span><span class="val">${member.address}</span></div>
        </div>
        <div class="cert-actions">
          <button class="btn btn-primary" onclick="printCertificate(${JSON.stringify(member).replace(/"/g, '&quot;')})">
            <i class="fa-solid fa-print"></i> Download / Print
          </button>
          <button class="btn btn-ghost" onclick="window.closeLedger ? window.closeLedger() : null; document.getElementById('certResult').hidden=true; document.getElementById('certResult').innerHTML='';">
            <i class="fa-solid fa-rotate-left"></i> Search Again
          </button>
          <button class="btn btn-ghost" onclick="hideMemberSection()">
            <i class="fa-solid fa-arrow-left"></i> Back to Portal
          </button>
        </div>
        <p class="cert-footnote">Computer-generated digital certificate. No signature required.</p>
      </div>`;
  }

  window.printCertificate = function (member) {
    const pa = document.getElementById("printCert");
    if (!pa) return;
    const logoSrc  = window.NGO.logoUrl || "images/logo.png";
    const regNo    = member.registrationNo || "—";
    const status   = (member.status || "Active").toUpperCase();
    const isActive = status === "ACTIVE";
    const isBanned = status === "BANNED";
    const badgeColor = isActive ? "#2E9E5B" : isBanned ? "#D9483A" : "#E8A33D";
    const badgeBg    = isActive ? "#EEF8F1"  : isBanned ? "#FEF2F2" : "#FEF9EC";
    const issueDate  = new Date().toLocaleDateString("en-PK", { day:"2-digit", month:"long", year:"numeric" });
    const verifyUrl  = `${location.origin}${location.pathname}#verify`;
    const photoBlock = member.photo
      ? `<img src="${member.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25)">`
      : `<div style="width:100px;height:100px;border-radius:50%;background:#EEF8F1;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center"><svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='#4CAF8A' viewBox='0 0 24 24'><path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/></svg></div>`;
    pa.innerHTML = `
      <style>
        @page{margin:10mm;size:A4;}
        body{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0}
        .no-print{display:none!important}
      </style>
      <div style="border:5px double #14534F;border-radius:6px;font-family:Georgia,serif;max-width:680px;margin:0 auto;overflow:hidden">

        <!-- DARK GREEN HEADER -->
        <div style="background:#14534F;padding:22px 28px;display:flex;align-items:center;gap:18px">
          <img src="${logoSrc}" style="width:70px;height:70px;border-radius:50%;object-fit:contain;background:#fff;padding:5px;border:3px solid rgba(255,255,255,.3);flex-shrink:0">
          <div style="flex:1;color:#fff">
            <div style="font-size:10px;letter-spacing:.25em;color:rgba(255,255,255,.6);font-family:sans-serif;margin-bottom:3px">MEMBERSHIP CERTIFICATE</div>
            <div style="font-size:22px;font-weight:700;line-height:1.2">${window.NGO.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.65);font-family:sans-serif;margin-top:3px">${window.NGO.address}</div>
          </div>
          <div style="text-align:right;color:#fff;flex-shrink:0">
            <div style="font-size:9px;color:rgba(255,255,255,.5);font-family:sans-serif">REG. NO.</div>
            <div style="font-size:15px;font-weight:700;font-family:sans-serif">${regNo}</div>
          </div>
        </div>

        <!-- GOLD ACCENT BAR -->
        <div style="height:5px;background:linear-gradient(90deg,#E8A33D,#F5C76A,#E8A33D)"></div>

        <!-- PHOTO + NAME ROW -->
        <div style="background:#F5F9F8;padding:22px 28px;display:flex;align-items:center;gap:20px;border-bottom:1px solid #E7DFD2">
          ${photoBlock}
          <div style="flex:1">
            <div style="font-size:21px;font-weight:700;color:#14534F">${member.fullName || "—"}</div>
            <div style="font-size:13px;color:#8A9A96;font-family:sans-serif;margin-top:2px">${member.membershipType || "Member"}</div>
            <div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;background:${badgeBg};border:1.5px solid ${badgeColor}55;border-radius:20px;padding:4px 12px">
              <div style="width:7px;height:7px;border-radius:50%;background:${badgeColor}"></div>
              <span style="font-size:11px;font-weight:700;color:${badgeColor};font-family:sans-serif;letter-spacing:.05em">${status}</span>
            </div>
          </div>
        </div>

        <!-- DETAILS GRID -->
        <div style="padding:20px 28px;display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #E7DFD2">
          ${[
            ["CNIC",       member.cnic         || "—"],
            ["Date of Birth", member.dob        || "—"],
            ["Mobile",     member.mobile        || "—"],
            ["Valid Upto", member.validUpto      || "—"],
            ["Gender",     member.gender         || "—"],
            ["Province",   member.province       || "—"],
          ].map(([l,v]) => `
            <div style="padding:10px 0;border-bottom:1px dashed #E7DFD2">
              <div style="font-size:9px;letter-spacing:.1em;color:#8A9A96;font-family:sans-serif;text-transform:uppercase">${l}</div>
              <div style="font-size:13px;font-weight:600;color:#1C2B29;font-family:sans-serif;margin-top:2px">${v}</div>
            </div>`).join("")}
          <div style="padding:10px 0;grid-column:1/-1;border-bottom:1px dashed #E7DFD2">
            <div style="font-size:9px;letter-spacing:.1em;color:#8A9A96;font-family:sans-serif;text-transform:uppercase">Address</div>
            <div style="font-size:13px;font-weight:600;color:#1C2B29;font-family:sans-serif;margin-top:2px">${member.address || "—"}</div>
          </div>
        </div>

        <!-- SIGNATURE + ISSUE DATE -->
        <div style="padding:20px 28px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #E7DFD2;flex-wrap:wrap;gap:12px">
          <div style="text-align:center;min-width:180px">
            <div style="font-size:11px;color:#14534F;font-family:sans-serif;font-weight:700;margin-bottom:24px">President / Authorized Signatory</div>
            <div style="border-top:1.5px solid #14534F;padding-top:5px;font-size:10px;color:#8A9A96;font-family:sans-serif">${window.NGO.name}</div>
          </div>
          <div style="text-align:right;font-family:sans-serif">
            <div style="font-size:9px;color:#8A9A96;text-transform:uppercase;letter-spacing:.08em">Issue Date</div>
            <div style="font-size:13px;font-weight:700;color:#14534F;margin-top:2px">${issueDate}</div>
          </div>
        </div>

        <!-- VERIFY URL FOOTER -->
        <div style="padding:11px 28px;background:#EEF8F1;text-align:center">
          <div style="font-size:9.5px;color:#4A6B60;font-family:sans-serif">
            ✅ Verify this certificate online: <strong>${verifyUrl}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp; 📞 ${window.NGO.phone} &nbsp;|&nbsp; 📧 ${window.NGO.email}
          </div>
          <div style="font-size:9px;color:#8A9A96;font-family:sans-serif;margin-top:3px">Computer-generated digital certificate · ${window.NGO.name}</div>
        </div>

      </div>`;
    window.print();
    setTimeout(() => { pa.innerHTML = ""; }, 3000);
  };

  /* CLEAR VERIFY BTN */
  const verifyClearBtn = document.getElementById("verifyClearBtn");
  if (verifyClearBtn) {
    verifyClearBtn.addEventListener("click", () => {
      const vCnic = document.getElementById("vCnic");
      const vDob  = document.getElementById("vDob");
      const donResult = document.getElementById("donationResult");
      if (vCnic) vCnic.value = "";
      if (vDob)  vDob.value  = "";
      if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
      if (donResult) donResult.innerHTML = "";
      if (verifyMsg) { verifyMsg.textContent = ""; verifyMsg.className = "form-msg"; }
    });
  }

  window.closeLedger = function () {
    const donResult = document.getElementById("donationResult");
    if (donResult) donResult.innerHTML = "";
    if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
    if (verifyMsg)  { verifyMsg.textContent = ""; verifyMsg.className = "form-msg"; }
    const vCnic = document.getElementById("vCnic");
    const vDob  = document.getElementById("vDob");
    if (vCnic) vCnic.value = "";
    if (vDob)  vDob.value  = "";
  };

  /* ===================== CHARITY LEDGER ===================== */
  const verifyDonationBtn = document.getElementById("verifyCharityBtn");
  if (verifyDonationBtn) {
    verifyDonationBtn.addEventListener("click", () => {
      const cnic = document.getElementById("vCnic")?.value.trim() || "";
      const dob  = document.getElementById("vDob")?.value.trim()  || "";
      const donResult = document.getElementById("donationResult");
      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
        if (verifyMsg) { verifyMsg.textContent = "⚠️ Valid CNIC: 00000-0000000-0"; verifyMsg.className = "form-msg error"; }
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        if (verifyMsg) { verifyMsg.textContent = "⚠️ DOB: dd-mm-yyyy"; verifyMsg.className = "form-msg error"; }
        return;
      }
      if (verifyMsg) { verifyMsg.textContent = ""; verifyMsg.className = "form-msg"; }
      // Hide certificate before showing charity report
      if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
      if (donResult) donResult.innerHTML = "";
      setLoading(verifyDonationBtn, true, "Loading...");
      if (!window.RHS) { setLoading(verifyDonationBtn, false); return; }
      RHS.getCharityLedger(cnic, dob)
        .then(res => {
          setLoading(verifyDonationBtn, false);
          if (!res.success) {
            if (verifyMsg) { verifyMsg.textContent = res.message || "Not found."; verifyMsg.className = "form-msg error"; }
            return;
          }
          const m = res.member;
          const donations = res.donations || [];
          const logoSrc   = window.NGO.logoUrl || "images/logo.png";
          const isActive  = (m.status || "").toLowerCase() === "active";
          const statusColor = isActive ? "#2E9E5B" : "#D9483A";
          let rows = "";
          if (!donations.length) {
            rows = `<tr><td colspan="4" style="text-align:center;padding:20px;color:#8A9A96;font-style:italic">No charity records found.</td></tr>`;
          } else {
            donations.forEach((d, i) => {
              rows += `<tr style="background:${i % 2 ? "#F5F9F8" : "#fff"}">
                <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-family:sans-serif;font-size:.88rem">${d.date || "—"}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-family:sans-serif;font-size:.88rem">${d.paymentMethod || d.method || "Cash"}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;color:#2E9E5B;font-weight:700;font-family:sans-serif;font-size:.88rem">Rs. ${Number(d.amount || 0).toLocaleString()}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-weight:700;font-family:sans-serif;font-size:.88rem">Rs. ${Number(d.runningTotal || 0).toLocaleString()}</td>
              </tr>`;
            });
          }
          if (donResult) {
            donResult.innerHTML = `
              <div id="ledgerContent" style="border:2px solid #E7DFD2;border-radius:12px;overflow:hidden;background:#fff;font-family:Georgia,serif">
                <div style="background:#14534F;padding:18px 24px;display:flex;align-items:center;gap:14px">
                  <img src="${logoSrc}" style="width:50px;height:50px;border-radius:50%;object-fit:contain;background:#fff;padding:4px;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">
                  <div style="flex:1">
                    <div style="font-size:9px;letter-spacing:.2em;color:rgba(255,255,255,.6);font-family:sans-serif;margin-bottom:2px">CHARITY DONATION LEDGER</div>
                    <div style="font-size:16px;font-weight:700;color:#fff">${window.NGO.name}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,.6);font-family:sans-serif">${window.NGO.address}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-size:9px;color:rgba(255,255,255,.5);font-family:sans-serif;margin-bottom:2px">TOTAL CHARITY</div>
                    <div style="font-size:16px;font-weight:700;color:#E8A33D;font-family:sans-serif">Rs. ${res.total.toLocaleString()}</div>
                  </div>
                </div>
                <div style="height:3px;background:#E8A33D"></div>
                <div style="padding:16px 24px;display:flex;gap:16px;align-items:center;border-bottom:1px solid #E7DFD2;background:#FAFAF8;flex-wrap:wrap">
                  ${m.photo
                    ? `<img src="${m.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #14534F;flex-shrink:0">`
                    : `<div style="width:60px;height:60px;border-radius:50%;background:#EEF8F1;border:3px solid #14534F;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa-solid fa-user" style="font-size:1.5rem;color:#4CAF8A"></i></div>`}
                  <div style="flex:1;min-width:0">
                    <div style="font-size:16px;font-weight:700;color:#14534F">${m.fullName}</div>
                    <div style="font-size:12px;color:#8A9A96;font-family:sans-serif">${m.registrationNo || "—"} · ${m.membershipType || "Member"}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:11px;color:#8A9A96;font-family:sans-serif;margin-bottom:4px">Valid Upto</div>
                    <div style="font-size:14px;font-weight:700;color:#14534F;font-family:sans-serif">${m.validUpto || "—"}</div>
                    <div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;background:${isActive ? "#EEF8F1" : "#FEF2F2"};border:1px solid ${statusColor}40;border-radius:20px;padding:3px 10px">
                      <div style="width:6px;height:6px;border-radius:50%;background:${statusColor}"></div>
                      <span style="font-size:11px;font-weight:700;color:${statusColor};font-family:sans-serif">${(m.status || "—").toUpperCase()}</span>
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
                  <button class="btn btn-ghost" onclick="window.closeLedger()"><i class="fa-solid fa-rotate-left"></i> Search Again</button>
                  <button class="btn btn-ghost" onclick="hideMemberSection()"><i class="fa-solid fa-arrow-left"></i> Back to Portal</button>
                </div>
              </div>`;
          }
        })
        .catch(() => {
          setLoading(verifyDonationBtn, false);
          if (verifyMsg) { verifyMsg.textContent = "⚠️ Network error."; verifyMsg.className = "form-msg error"; }
        });
    });
  }

  window.printLedger = function () {
    const content = document.getElementById("ledgerContent");
    if (!content) return;
    const pa = document.getElementById("printCert");
    if (!pa) return;
    pa.innerHTML = `<style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}</style>${content.outerHTML}`;
    window.print();
    setTimeout(() => { pa.innerHTML = ""; }, 3000);
  };

  /* ===================== TEAM ===================== */
  function loadTeam() {
    if (!window.RHS) { setTimeout(loadTeam, 500); return; }
    const teamGrid = document.getElementById("teamGrid");
    if (!teamGrid) return;
    RHS.getTeam().then(res => {
      if (!res.success || !res.team || !res.team.length) {
        teamGrid.innerHTML = '<div class="news-loading">No team members added yet.</div>';
        return;
      }
      teamGrid.innerHTML = "";
      res.team.forEach(member => {
        const card = document.createElement("div");
        card.className = "team-card";
        const photoHtml = member.photo
          ? `<div class="photo" style="background-image:url('${member.photo}')"></div>`
          : `<div class="photo" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user" style="font-size:2rem;color:#8A9A96"></i></div>`;
        card.innerHTML = `${photoHtml}<h4>${member.name}</h4><div class="role">${member.designation}</div><p class="bio">${member.bio || ""}</p>`;
        teamGrid.appendChild(card);
      });
    }).catch(() => {});
  }
  loadTeam();

  /* ===================== CONTACT FORM ===================== */
  const contactForm = document.getElementById("contactForm");
  const contactMsg  = document.getElementById("contactMsg");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactMsg) return;
      contactMsg.textContent = "";
      contactMsg.className = "form-msg";
      const name    = document.getElementById("cName")?.value.trim()  || "";
      const email   = document.getElementById("cEmail")?.value.trim() || "";
      const message = document.getElementById("cMsg")?.value.trim()   || "";
      if (!name || !email || !message) { contactMsg.textContent = "⚠️ Please fill all fields."; contactMsg.classList.add("error"); return; }
      const sendBtn = contactForm.querySelector("button[type='submit']");
      setLoading(sendBtn, true, "Sending...");
      if (!window.RHS) { setLoading(sendBtn, false); return; }
      RHS.submitContactMessage({ name, email, message })
        .then(res => {
          setLoading(sendBtn, false);
          if (res.success) {
            contactMsg.textContent = "✅ Thank you! Message sent.";
            contactMsg.classList.add("success");
            contactForm.reset();
          } else {
            contactMsg.textContent = res.message || "Something went wrong.";
            contactMsg.classList.add("error");
          }
        })
        .catch(() => {
          setLoading(sendBtn, false);
          contactMsg.textContent = "⚠️ Network error.";
          contactMsg.classList.add("error");
        });
    });
  }

  /* ===================== MEMBER PORTAL — SHOW/HIDE ===================== */

  // Helper: hide both sections
  function hideAllMemberSections() {
    const reg = document.getElementById("registration");
    const ver = document.getElementById("verify");
    if (reg) { reg.style.display = "none"; reg.classList.remove("show"); }
    if (ver) ver.style.display = "none";
  }

  window.showMemberSection = function (which) {
    hideAllMemberSections();
    if (which === "registration") {
      const regSection = document.getElementById("registration");
      if (regSection) {
        regSection.style.display = "block";
        regSection.classList.add("show");
        setTimeout(() => regSection.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } else {
      // 'verify' — Certificate & Donation Verify — BUG WAS HERE (display was never set to block)
      const verSection = document.getElementById("verify");
      if (verSection) {
        verSection.style.display = "block";
        setTimeout(() => verSection.scrollIntoView({ behavior: "smooth" }), 50);
      }
    }
  };

  window.hideMemberSection = function () {
    hideAllMemberSections();
    // Reset registration form
    if (regForm) {
      regForm.reset();
      regForm.style.display = "";
      if (formResult) formResult.hidden = true;
      if (formMsg) { formMsg.textContent = ""; formMsg.className = "form-msg"; }
    }
    // Reset verify form
    if (verifyMsg)  { verifyMsg.textContent  = ""; verifyMsg.className = "form-msg"; }
    if (certResult) { certResult.hidden = true; certResult.innerHTML = ""; }
    const donResult = document.getElementById("donationResult");
    if (donResult) donResult.innerHTML = "";
    const vCnic = document.getElementById("vCnic");
    const vDob  = document.getElementById("vDob");
    if (vCnic) vCnic.value = "";
    if (vDob)  vDob.value  = "";
    // Scroll back to member portal
    const portal = document.getElementById("memberSection");
    if (portal) setTimeout(() => portal.scrollIntoView({ behavior: "smooth" }), 50);
  };

  /* PHOTO PREVIEW */
  window.previewRegPhoto = function (input) {
    const file = input.files?.[0];
    if (!file) return;
    const preview = document.getElementById("regPhotoPreview");
    if (!preview) return;
    const reader = new FileReader();
    reader.onload = e => { preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #14534F;">`; };
    reader.readAsDataURL(file);
  };

  /* Legacy back buttons */
  const backBtn1 = document.getElementById("backBtn1");
  const backBtn2 = document.getElementById("backBtn2");
  if (backBtn1) backBtn1.addEventListener("click", window.hideMemberSection);
  if (backBtn2) backBtn2.addEventListener("click", window.hideMemberSection);

  /* ===================== CHARITY HELP DESK ===================== */
  window.showHelpSection = function (which) {
    const btns           = document.getElementById("helpdeskBtns");
    const grantFormWrap  = document.getElementById("grantFormWrap");
    const grantStatusWrap = document.getElementById("grantStatusWrap");
    if (btns) btns.style.display = "none";
    const showGrant = (which === "grantForm" || which === "grant");
    if (grantFormWrap)   grantFormWrap.style.display   = showGrant ? "block" : "none";
    if (grantStatusWrap) grantStatusWrap.style.display = showGrant ? "none"  : "block";
    const desk = document.getElementById("charityDesk");
    if (desk) setTimeout(() => desk.scrollIntoView({ behavior: "smooth" }), 50);
  };

  window.hideHelpSection = function () {
    ["grantForm", "grantStatusForm"].forEach(resetForm);
    const btns           = document.getElementById("helpdeskBtns");
    const grantFormWrap  = document.getElementById("grantFormWrap");
    const grantStatusWrap = document.getElementById("grantStatusWrap");
    if (btns) btns.style.display = "flex";
    if (grantFormWrap)   grantFormWrap.style.display   = "none";
    if (grantStatusWrap) grantStatusWrap.style.display = "none";
    const grantFormEl = document.getElementById("grantForm");
    if (grantFormEl) grantFormEl.style.display = "block";
    const grantResultEl = document.getElementById("grantResult");
    if (grantResultEl) grantResultEl.hidden = true;
    const desk = document.getElementById("charityDesk");
    if (desk) setTimeout(() => desk.scrollIntoView({ behavior: "smooth" }), 50);
  };

  /* ===================== GRANT FORM ===================== */
  const grantForm       = document.getElementById("grantForm");
  const grantMsg        = document.getElementById("grantMsg");
  const grantResult     = document.getElementById("grantResult");
  const grantSubmitBtn  = document.getElementById("grantSubmitBtn");

  /* ---- LIVE CNIC DUPLICATE CHECK for Grant Form ---- */
  const grantCnicEl = document.getElementById("gCnic");
  let grantCnicTimer = null;
  if (grantCnicEl) {
    grantCnicEl.addEventListener("blur", function () {
      const val = this.value.trim();
      if (!/^\d{5}-\d{7}-\d{1}$/.test(val)) return;
      if (!window.RHS) return;
      clearTimeout(grantCnicTimer);
      grantCnicTimer = setTimeout(() => {
        if (!window.RHS || !RHS.checkGrantByCnic) return;
        RHS.checkGrantByCnic(val)
          .then(res => {
            if (!res.found) return;
            const c = res.grant;
            const nameVal = document.getElementById("gName")?.value.trim() || c.name || "Applicant";
            if (grantForm) grantForm.style.display = "none";
            if (grantResult) {
              grantResult.hidden = false;
              grantResult.innerHTML = `
                <div class="status-msg status-yellow">
                  <i class="fa-solid fa-circle-exclamation" style="font-size:2.2rem;color:#E8A33D;display:block;margin-bottom:12px"></i>
                  <div class="status-title" style="color:#92620A">Case Already Submitted!</div>
                  <p>Dear <strong>${c.name || nameVal}</strong>, Your case is already submitted as <strong>${c.crn}</strong>. Please check status of your case by using <strong>Check Request Status</strong>.</p>
                  <p style="margin-top:8px;font-size:.88rem;color:#555">
                    📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:var(--teal);font-weight:600">${window.NGO.alert}</a>
                    &nbsp;|&nbsp;
                    📧 <a href="mailto:${window.NGO.email}" style="color:var(--teal);font-weight:600">${window.NGO.email}</a>
                  </p>
                  <div class="reg-alert-btns">
                    <button class="btn btn-primary" onclick="window.hideHelpSection();setTimeout(()=>window.showHelpSection('grantStatus'),100)">
                      <i class="fa-solid fa-magnifying-glass"></i> Check Request Status
                    </button>
                    <button class="btn btn-ghost" onclick="if(grantResult){grantResult.hidden=true;grantResult.innerHTML='';} if(grantForm){grantForm.style.display='';document.getElementById('gCnic').value='';document.getElementById('gCnic').focus();}">
                      <i class="fa-solid fa-rotate-left"></i> Try Different CNIC
                    </button>
                    <button class="btn btn-ghost" onclick="window.hideHelpSection()">
                      <i class="fa-solid fa-arrow-left"></i> Back
                    </button>
                  </div>
                </div>`;
            }
          }).catch(() => {});
      }, 400);
    });
  }

  if (grantForm) {
    grantForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (grantMsg) { grantMsg.textContent = ""; grantMsg.className = "form-msg"; }
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

      if (!cnic || !dob || !name || !father || !gender || !mobile || !helpType || !amount || !address) {
        if (grantMsg) { grantMsg.textContent = "Please fill all required fields."; grantMsg.classList.add("error"); }
        return;
      }
      setLoading(grantSubmitBtn, true, "Submitting...");
      if (!window.RHS) { setLoading(grantSubmitBtn, false); return; }
      RHS.submitGrant({ cnic, dob, name, fatherName: father, gender, email, mobile, helpType, amountRequired: Number(amount), address })
        .then(res => {
          setLoading(grantSubmitBtn, false);
          if (res.success) {
            if (grantForm) grantForm.style.display = "none";
            if (grantResult) {
              grantResult.hidden = false;
              const txt = document.getElementById("grantResultText");
              if (txt) txt.innerHTML = res.message || "";
            }
          } else if (res.code === "DUPLICATE_CASE") {
            // Styled duplicate alert matching registration form
            if (grantForm) grantForm.style.display = "none";
            if (grantResult) {
              grantResult.hidden = false;
              grantResult.innerHTML = `
                <div class="status-msg status-yellow">
                  <i class="fa-solid fa-circle-exclamation" style="font-size:2.2rem;color:#E8A33D;display:block;margin-bottom:12px"></i>
                  <div class="status-title" style="color:#92620A">Case Already Submitted!</div>
                  <p>Dear <strong>${name}</strong>, Your case is already submitted as <strong>${res.crn || ""}</strong>. Please check status of your case by using <strong>Check Request Status</strong>.</p>
                  <p style="margin-top:8px;font-size:.88rem;color:#555">
                    📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:var(--teal);font-weight:600">${window.NGO.alert}</a>
                    &nbsp;|&nbsp;
                    📧 <a href="mailto:${window.NGO.email}" style="color:var(--teal);font-weight:600">${window.NGO.email}</a>
                  </p>
                  <div class="reg-alert-btns">
                    <button class="btn btn-primary" onclick="window.hideHelpSection();setTimeout(()=>window.showHelpSection('grantStatus'),100)">
                      <i class="fa-solid fa-magnifying-glass"></i> Check Request Status
                    </button>
                    <button class="btn btn-ghost" onclick="if(grantResult){grantResult.hidden=true;grantResult.innerHTML='';} if(grantForm){grantForm.style.display='';document.getElementById('gCnic').value='';document.getElementById('gCnic').focus();}">
                      <i class="fa-solid fa-rotate-left"></i> Try Different CNIC
                    </button>
                    <button class="btn btn-ghost" onclick="window.hideHelpSection()">
                      <i class="fa-solid fa-arrow-left"></i> Back
                    </button>
                  </div>
                </div>`;
            }
          } else {
            if (grantMsg) { grantMsg.textContent = res.message || "Something went wrong."; grantMsg.classList.add("error"); }
          }
        })
        .catch(() => {
          setLoading(grantSubmitBtn, false);
          if (grantMsg) { grantMsg.textContent = "Network error."; grantMsg.classList.add("error"); }
        });
    });
  }

  /* ===================== GRANT STATUS ===================== */
  const grantStatusForm   = document.getElementById("grantStatusForm");
  const gsMsg             = document.getElementById("gsMsg");
  const grantStatusResult = document.getElementById("grantStatusResult");

  /* Helper: hide search form, show result; or reverse */
  function gsShowResult(html) {
    if (grantStatusForm) grantStatusForm.style.display = "none";
    if (gsMsg) { gsMsg.textContent = ""; gsMsg.className = "form-msg"; }
    if (grantStatusResult) {
      grantStatusResult.innerHTML = html;
      grantStatusResult.style.display = "";
      setTimeout(() => grantStatusResult.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    }
  }
  function gsShowForm() {
    if (grantStatusForm) grantStatusForm.style.display = "";
    if (grantStatusResult) { grantStatusResult.innerHTML = ""; grantStatusResult.style.display = "none"; }
    if (gsMsg) { gsMsg.textContent = ""; gsMsg.className = "form-msg"; }
    // Clear fields so user searches fresh
    const cnicEl = document.getElementById("gsCnic");
    const dobEl  = document.getElementById("gsDob");
    if (cnicEl) cnicEl.value = "";
    if (dobEl)  dobEl.value  = "";
    if (cnicEl) cnicEl.focus();
  }
  /* Back buttons inside result call hideHelpSection to go back to charity main */
  function gsBack() { gsShowForm(); hideHelpSection(); }

  // Make helpers available globally for onclick in rendered HTML
  window._gsShowForm = gsShowForm;
  window._gsBack     = gsBack;

  if (grantStatusForm) {
    grantStatusForm.addEventListener("reset", () => {
      setTimeout(() => {
        if (gsMsg) { gsMsg.textContent = ""; gsMsg.className = "form-msg"; }
        if (grantStatusResult) { grantStatusResult.innerHTML = ""; grantStatusResult.style.display = "none"; }
        grantStatusForm.style.display = "";
      }, 0);
    });

    grantStatusForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (gsMsg) { gsMsg.textContent = ""; gsMsg.className = "form-msg"; }
      if (grantStatusResult) grantStatusResult.innerHTML = "";
      const cnic = document.getElementById("gsCnic")?.value.trim() || "";
      const dob  = document.getElementById("gsDob")?.value.trim()  || "";
      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic) || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        if (gsMsg) { gsMsg.textContent = "Please enter valid CNIC and DOB."; gsMsg.classList.add("error"); }
        return;
      }
      const gsBtn = grantStatusForm.querySelector('[type="submit"]');
      setLoading(gsBtn, true, "Checking...");
      if (!window.RHS) { setLoading(gsBtn, false); return; }
      RHS.getGrantStatus(cnic, dob)
        .then(res => {
          setLoading(gsBtn, false);
          if (!res.success || !res.grants || !res.grants.length) {
            gsShowResult(`
              <div class="status-msg status-red">
                <i class="fa-solid fa-circle-xmark"></i>
                <div class="status-title">No Request Found</div>
                <p>${res.message || "No grant request found for this CNIC and Date of Birth."}</p>
                <div class="reg-alert-btns" style="margin-top:16px">
                  <button class="btn btn-primary" onclick="window._gsShowForm()">
                    <i class="fa-solid fa-search"></i> Search Again
                  </button>
                  <button class="btn btn-ghost" onclick="window._gsBack()">
                    <i class="fa-solid fa-arrow-left"></i> Back
                  </button>
                </div>
              </div>`);
            return;
          }
          const active = res.grants.filter(g => (g.status || "").toLowerCase() !== "closed");
          const closed = res.grants.filter(g => (g.status || "").toLowerCase() === "closed");
          const list   = active.length ? active : closed;
          let html = "";
          for (const g of list) {
            let msg = "", vibe = "status-yellow", icon = "fa-hourglass-half";
            const s = (g.status   || "").toLowerCase();
            const d = (g.decision || "").toLowerCase();
            const amt = Number(g.amount || 0).toLocaleString();

            if (s === "new") {
              msg = `Dear <strong>${g.name}</strong>, Your Request <strong>${g.crn}</strong> has been received successfully. Our team will contact you soon.<br>
                     📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:inherit;font-weight:600">${window.NGO.alert}</a>
                     &nbsp;|&nbsp; 📧 <a href="mailto:${window.NGO.email}" style="color:inherit;font-weight:600">${window.NGO.email}</a>`;
              vibe = "status-yellow"; icon = "fa-hourglass-half";

            } else if (s === "assigned") {
              msg = `<strong>${g.crn}</strong> — ${g.helpType || ""}<br><br>
                     Dear <strong>${g.name}</strong>, your case has been assigned to our team member
                     <strong>${g.assignedTo || "Team Member"}</strong>
                     ${g.assignedContact ? `(<a href="tel:${g.assignedContact}" style="color:inherit;font-weight:600">${g.assignedContact}</a>)` : ""}.
                     Please cooperate with our team during verification.<br><br>
                     📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:inherit;font-weight:600">${window.NGO.alert}</a>
                     &nbsp;|&nbsp; 📧 <a href="mailto:${window.NGO.email}" style="color:inherit;font-weight:600">${window.NGO.email}</a>`;
              vibe = "status-green"; icon = "fa-user-check";

            } else if (s === "completed" && d !== "approved" && d !== "rejected") {
              msg = `Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> verification completed. Please wait for the decision.<br>
                     📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:inherit;font-weight:600">${window.NGO.alert}</a>`;
              vibe = "status-yellow"; icon = "fa-clipboard-check";

            } else if (d === "approved" && s !== "closed") {
              // ---- SPECIAL APPROVED CARD (rendered inline, skips default card) ----
              html += `
                <div style="
                  background: linear-gradient(135deg, #e8f8f0 0%, #d0f0e0 50%, #e8f8f0 100%);
                  border: 2px solid #2E9E5B;
                  border-radius: 18px;
                  padding: 32px 28px 24px;
                  text-align: center;
                  margin-bottom: 16px;
                  box-shadow: 0 4px 24px rgba(46,158,91,0.13);
                  position: relative;
                  overflow: hidden;
                ">
                  <!-- confetti dots decoration -->
                  <div style="position:absolute;top:12px;left:18px;font-size:1.3rem;opacity:.5">🎉</div>
                  <div style="position:absolute;top:12px;right:18px;font-size:1.3rem;opacity:.5">🎊</div>
                  <div style="position:absolute;bottom:14px;left:24px;font-size:1rem;opacity:.35">✨</div>
                  <div style="position:absolute;bottom:14px;right:24px;font-size:1rem;opacity:.35">✨</div>

                  <!-- Big check icon -->
                  <div style="
                    width: 72px; height: 72px; border-radius: 50%;
                    background: linear-gradient(135deg,#2E9E5B,#4CAF8A);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px; box-shadow: 0 4px 16px rgba(46,158,91,0.35);
                  ">
                    <i class="fa-solid fa-circle-check" style="font-size:2rem;color:#fff"></i>
                  </div>

                  <!-- Congratulations heading -->
                  <div style="font-size:1.05rem;font-weight:700;letter-spacing:.08em;color:#2E9E5B;text-transform:uppercase;margin-bottom:6px">
                    🎉 Congratulations! 🎉
                  </div>
                  <div style="font-size:1.5rem;font-weight:800;color:#14534F;margin-bottom:4px;font-family:'Fraunces',Georgia,serif">
                    Case Approved
                  </div>

                  <!-- Divider -->
                  <div style="width:60px;height:3px;background:linear-gradient(90deg,#2E9E5B,#4CAF8A);border-radius:2px;margin:12px auto 18px"></div>

                  <!-- CRN badge -->
                  <div style="
                    display:inline-block;background:#fff;border:1.5px solid #2E9E5B55;
                    border-radius:20px;padding:5px 18px;font-size:.85rem;
                    color:#2E9E5B;font-weight:700;letter-spacing:.04em;margin-bottom:18px;
                  ">
                    <i class="fa-solid fa-hashtag" style="font-size:.75rem"></i> ${g.crn} &nbsp;·&nbsp; ${g.helpType || "Grant"}
                  </div>

                  <!-- Main message -->
                  <p style="font-size:1rem;color:#1a4a38;line-height:1.8;margin:0 0 10px">
                    Dear <strong style="color:#14534F">${g.name}</strong>,<br>
                    We are pleased to inform you that your grant request has been
                    <strong style="color:#2E9E5B">officially approved</strong>.
                    Please wait for the grant disbursement — our team will contact you
                    very soon to complete the process. 🤝
                  </p>

                  <!-- Applied / Amount note -->
                  <p style="font-size:.84rem;color:#4a7a62;margin:10px 0 18px;background:#fff8;border-radius:8px;padding:7px 14px;display:inline-block">
                    📅 Applied: <strong>${g.timestamp}</strong> &nbsp;•&nbsp; 💰 Rs. <strong>${amt}</strong>
                  </p>

                  <!-- Contact line -->
                  <div style="font-size:.9rem;color:#2d6e50;margin-bottom:6px">
                    For any query, feel free to contact us:
                  </div>
                  <div style="font-size:.92rem;font-weight:600;color:#14534F">
                    📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:#14534F;text-decoration:none">${window.NGO.alert}</a>
                    &nbsp;|&nbsp;
                    📧 <a href="mailto:${window.NGO.email}" style="color:#14534F;text-decoration:none">${window.NGO.email}</a>
                  </div>
                </div>`;
              // skip default card rendering for this grant
              continue;
              // ---- END SPECIAL APPROVED CARD ----

            } else if (d === "rejected" && s !== "closed") {
              msg = `Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> has been Rejected. Please visit our office or meet the President.<br>
                     📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:inherit;font-weight:600">${window.NGO.alert}</a>`;
              vibe = "status-red"; icon = "fa-circle-xmark";

            } else if (s === "closed" && (d === "closed" || d === "approved")) {
              msg = `Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> has been Successfully Closed. Jazak Allah Khair! 🤲`;
              vibe = "status-green"; icon = "fa-lock";

            } else if (s === "closed" && d === "rejected") {
              msg = `Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> has been Closed after Rejection. Please meet the President.<br>
                     📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:inherit;font-weight:600">${window.NGO.alert}</a>`;
              vibe = "status-red"; icon = "fa-lock";

            } else {
              msg = `Dear <strong>${g.name}</strong>, Case <strong>${g.crn}</strong> is currently under process.<br>
                     📞 <a href="tel:+92${window.NGO.alert.replace(/\D/g,'').slice(-10)}" style="color:inherit;font-weight:600">${window.NGO.alert}</a>`;
            }

            // For "assigned": icon is inside titleHtml only — skip top icon to avoid duplicate
            const titleHtml = s === "assigned"
              ? `<div class="status-title"><i class="fa-solid fa-user-check"></i> Case Assigned</div>`
              : `<div class="status-title">${g.crn} — ${g.helpType || ""}</div>`;
            const topIcon = s === "assigned" ? "" : `<i class="fa-solid ${icon}"></i>`;

            html += `
              <div class="status-msg ${vibe}" style="margin-bottom:16px">
                ${topIcon}
                ${titleHtml}
                <p style="line-height:1.7">${msg}</p>
                <p class="status-note" style="margin-top:10px">
                  📅 Applied: <strong>${g.timestamp}</strong> &nbsp;•&nbsp; 💰 Rs. <strong>${amt}</strong>
                </p>
              </div>`;
          } // end for...of

          // Append Back & Search Again buttons below all results
          html += `
            <div class="reg-alert-btns" style="margin-top:8px">
              <button class="btn btn-primary" onclick="window._gsShowForm()">
                <i class="fa-solid fa-search"></i> Search Again
              </button>
              <button class="btn btn-ghost" onclick="window._gsBack()">
                <i class="fa-solid fa-arrow-left"></i> Back
              </button>
            </div>`;

          gsShowResult(html);
        })
        .catch(() => {
          setLoading(gsBtn, false);
          if (gsMsg) { gsMsg.textContent = "Network error. Please try again."; gsMsg.classList.add("error"); }
        });
    });
  }

  /* ===================== URDU TOGGLE ===================== */
  let isUrdu = false;
  window.toggleLang = function () {
    isUrdu = !isUrdu;
    const label   = document.getElementById("langLabel");
    const htmlEl  = document.getElementById("htmlRoot");
    if (label) label.textContent = isUrdu ? "English" : "اردو";
    if (htmlEl) {
      htmlEl.setAttribute("lang", isUrdu ? "ur" : "en");
      if (isUrdu) htmlEl.setAttribute("dir", "rtl");
      else htmlEl.removeAttribute("dir");
    }
    document.querySelectorAll("[data-ur]").forEach(el => {
      if (isUrdu) { el._origText = el.textContent; el.textContent = el.getAttribute("data-ur"); }
      else if (el._origText) el.textContent = el._origText;
    });
  };

  /* ===================== NEWS ===================== */
  function loadNews() {
    const grid = document.getElementById("newsGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem"></i><p>Loading news...</p></div>';
    if (!window.RHS) { setTimeout(loadNews, 800); return; }
    RHS.getNews()
      .then(res => {
        if (!res.news || !res.news.length) {
          grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-newspaper" style="font-size:2rem;display:block;margin-bottom:8px"></i>No news yet. Check back soon!</div>';
          return;
        }
        grid.innerHTML = res.news.map(n => `
          <article class="news-card">
            ${n.imageURL
              ? `<img src="${n.imageURL}" alt="${n.title}" class="news-card-img" loading="lazy">`
              : `<div class="news-card-img" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-newspaper" style="font-size:2rem;color:#8A9A96"></i></div>`}
            <div class="news-card-body">
              <span class="news-tag">${n.category || "News"}</span>
              <div class="news-card-date"><i class="fa-regular fa-calendar"></i> ${n.date || ""}</div>
              <h3 class="news-card-title">${n.title || ""}</h3>
              <p class="news-card-text">${n.body || n.content || ""}</p>
            </div>
          </article>`).join("");
      })
      .catch(() => {
        grid.innerHTML = '<div class="news-loading">Could not load news.</div>';
      });
  }

  /* ===================== STORIES ===================== */
  function loadStories() {
    const grid = document.getElementById("storiesGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem"></i><p>Loading stories...</p></div>';
    if (!window.RHS) { setTimeout(loadStories, 800); return; }
    RHS.getStories()
      .then(res => {
        if (!res.stories || !res.stories.length) {
          grid.innerHTML = '<div class="news-loading"><i class="fa-solid fa-heart" style="font-size:2rem;display:block;margin-bottom:8px;color:var(--coral)"></i>Stories coming soon!</div>';
          return;
        }
        grid.innerHTML = res.stories.map(s => `
          <article class="story-card">
            <span class="story-badge">${s.helpType || "Community"}</span>
            ${s.photoURL
              ? `<img src="${s.photoURL}" alt="${s.name}" class="story-card-img" loading="lazy">`
              : `<div class="story-card-img" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center;font-size:2.5rem">🤲</div>`}
            <div class="story-card-body">
              <div class="story-card-name">${s.name || ""}</div>
              <div class="story-card-location"><i class="fa-solid fa-location-dot"></i> ${s.location || "Khairpur Tamewali"}</div>
              <p class="story-card-text">${s.story || ""}</p>
            </div>
          </article>`).join("");
      })
      .catch(() => {
        grid.innerHTML = '<div class="news-loading">Could not load stories.</div>';
      });
  }

  /* ===================== LOAD ALL ===================== */
  loadNGOSettings();
  loadNews();
  loadStories();

}); // END DOMContentLoaded
