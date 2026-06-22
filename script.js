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

/* ===== ALERT MODAL — screen center, ✕ close button ===== */
function showAlertModal(color, icon, title, bodyHtml, buttons) {
  const ex = document.getElementById("rhsAlertModal"); if (ex) ex.remove();
  const C = {green:{bg:"#EEF8F1",bd:"#1a9e5c",tc:"#1a9e5c",ic:"#1a9e5c"},yellow:{bg:"#FFFBEB",bd:"#D97706",tc:"#92400E",ic:"#D97706"},red:{bg:"#FEF2F2",bd:"#DC2626",tc:"#991B1B",ic:"#DC2626"},orange:{bg:"#FFF7ED",bd:"#EA580C",tc:"#9A3412",ic:"#EA580C"},teal:{bg:"#EEF8F1",bd:"#14534F",tc:"#14534F",ic:"#14534F"}}[color]||{bg:"#EEF8F1",bd:"#14534F",tc:"#14534F",ic:"#14534F"};
  const btns=(buttons||[]).map(b=>`<button class="btn btn-ghost" onclick="${b.fn}" style="min-width:120px;margin:4px">${b.label}</button>`).join("");
  const ov=document.createElement("div");
  ov.id="rhsAlertModal";
  ov.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;";
  ov.innerHTML=`<div style="background:${C.bg};border:2.5px solid ${C.bd};border-radius:20px;padding:32px 28px 28px;max-width:480px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);position:relative;animation:rhsIn .25s ease"><button onclick="closeAlertModal()" style="position:absolute;top:10px;right:12px;background:none;border:none;font-size:1.5rem;color:#9CA3AF;cursor:pointer;line-height:1;padding:2px 8px">✕</button><i class="fa-solid ${icon}" style="font-size:2.8rem;color:${C.ic};margin-bottom:12px;display:block"></i><h3 style="font-family:'Fraunces',serif;color:${C.tc};margin:0 0 12px;font-size:1.25rem;line-height:1.3">${title}</h3><div style="color:#374151;line-height:1.75;font-size:.92rem;margin-bottom:20px">${bodyHtml}</div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${btns}</div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener("click", e => { if (e.target===ov) closeAlertModal(); });
}
function closeAlertModal() { const m=document.getElementById("rhsAlertModal"); if(m) m.remove(); }
window.closeAlertModal = closeAlertModal;
window.showAlertModal  = showAlertModal;
(function(){if(document.getElementById("rhsAni"))return;const s=document.createElement("style");s.id="rhsAni";s.textContent="@keyframes rhsIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}";document.head.appendChild(s);})();

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
  const regForm   = document.getElementById("regForm");
  const formMsg   = document.getElementById("formMsg");
  const submitBtn = document.getElementById("submitBtn");

  // Photo preview — simple addEventListener on the visible input
  const regPhotoInput = document.getElementById("regPhoto");
  if (regPhotoInput) {
    regPhotoInput.addEventListener("change", function() {
      const file = this.files[0];
      const photoMsg  = document.getElementById("photoMsg");
      const preview   = document.getElementById("regPhotoPreview");
      if (!file) return;
      if (file.size > 3 * 1024 * 1024) {
        if (photoMsg) { photoMsg.textContent = "⚠️ Photo too large (max 3MB)"; photoMsg.className = "form-msg error"; }
        this.value = "";
        return;
      }
      if (photoMsg) { photoMsg.textContent = "✅ " + file.name + " selected"; photoMsg.className = "form-msg success"; }
      const reader = new FileReader();
      reader.onload = e => {
        if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid #14534F;display:block">`;
      };
      reader.readAsDataURL(file);
    });
  }

  if (regForm) {
    regForm.addEventListener("reset", () => {
      setTimeout(() => {
        if (formMsg) { formMsg.textContent = ""; formMsg.className = "form-msg"; }
        const photoMsg = document.getElementById("photoMsg");
        if (photoMsg) { photoMsg.textContent = ""; photoMsg.className = "form-msg"; }
        const preview = document.getElementById("regPhotoPreview");
        if (preview) preview.innerHTML = "";
      }, 0);
    });

    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!formMsg) return;
      formMsg.textContent = "";
      formMsg.className = "form-msg";

      // Correct IDs matching index.html
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

      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic))  { formMsg.textContent = "⚠️ Valid CNIC: 00000-0000000-0";    formMsg.classList.add("error"); return; }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob))    { formMsg.textContent = "⚠️ Date of Birth: dd-mm-yyyy";      formMsg.classList.add("error"); return; }
      if (!fullName)   { formMsg.textContent = "⚠️ Full Name required";           formMsg.classList.add("error"); return; }
      if (!father)     { formMsg.textContent = "⚠️ Father/Husband Name required"; formMsg.classList.add("error"); return; }
      if (!gender)     { formMsg.textContent = "⚠️ Please select Gender";         formMsg.classList.add("error"); return; }
      if (!prof)       { formMsg.textContent = "⚠️ Profession required";          formMsg.classList.add("error"); return; }
      if (!/^\d{4}-\d{7}$/.test(mobile))       { formMsg.textContent = "⚠️ Mobile: 0300-0000000";           formMsg.classList.add("error"); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { formMsg.textContent = "⚠️ Valid Email format"; formMsg.classList.add("error"); return; }
      if (!province)   { formMsg.textContent = "⚠️ Please select Province";       formMsg.classList.add("error"); return; }
      if (!membership) { formMsg.textContent = "⚠️ Please select Membership Type";formMsg.classList.add("error"); return; }
      if (!address)    { formMsg.textContent = "⚠️ Full Address required";         formMsg.classList.add("error"); return; }
      if (!photoFile)  { formMsg.textContent = "⚠️ Please select your photo";     formMsg.classList.add("error"); return; }

      setLoading(submitBtn, true, "Uploading photo...");
      formMsg.textContent = "Uploading photo...";

      // Direct Cloudinary upload — no dependency on RHS.uploadImage
      let photoUrl = "";
      try {
        const fd = new FormData();
        fd.append("file", photoFile);
        fd.append("upload_preset", "rhs-upload");
        fd.append("folder", "rhs/members");
        const r = await fetch("https://api.cloudinary.com/v1_1/dt9yspaw7/image/upload", { method:"POST", body:fd });
        const d = await r.json();
        if (d.secure_url) {
          photoUrl = d.secure_url;
          formMsg.textContent = "✅ Photo uploaded!";
        } else {
          throw new Error(d.error?.message || "Upload failed");
        }
      } catch (err) {
        setLoading(submitBtn, false);
        formMsg.textContent = "⚠️ Photo upload failed: " + err.message;
        formMsg.classList.add("error");
        return;
      }

      setLoading(submitBtn, true, "Saving...");
      if (!window.RHS) { setLoading(submitBtn, false); formMsg.textContent = "Please wait..."; return; }

      RHS.registerMember({ cnic, dob, fullName, fatherName:father, gender, profession:prof, email, mobile, province, address, membershipType:membership, photo:photoUrl })
      .then(res => {
        setLoading(submitBtn, false);
        formMsg.textContent = "";
        if (res.success) {
          if (regForm) regForm.style.display = "none";
          showAlertModal("green","fa-circle-check","Registration Submitted Successfully!",
            `Dear <strong>${fullName}</strong>, Your Registration has been Received.<br><br>
             Status: <strong>Underprocess</strong>. You will be notified after approval.<br><br>
             📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`,
            [
              {label:"<i class='fa-solid fa-house'></i> Main Menu",          fn:"backToMemberPortalMain()"},
              {label:"<i class='fa-solid fa-user-plus'></i> New Registration", fn:"restartRegistration()"}
            ]
          );
        } else if (res.code === "DUPLICATE") {
          showAlertModal("yellow","fa-circle-info","Already Registered",
            res.message || `Dear <strong>${fullName}</strong>, You are already registered.`,
            [{label:"<i class='fa-solid fa-house'></i> Main Menu", fn:"backToMemberPortalMain()"}]
          );
        } else {
          formMsg.textContent = res.message || "Something went wrong.";
          formMsg.classList.add("error");
        }
      }).catch(() => {
        setLoading(submitBtn, false);
        formMsg.textContent = "⚠️ Network error. Please try again.";
        formMsg.classList.add("error");
      });
    });
  }

  /* MEMBER PORTAL NAVIGATION */
  window.showMemberSection = function(which) {
    const reg = document.getElementById("registration");
    const vw  = document.getElementById("verifyPortalWrap");
    if (which === "registration") {
      if (vw) vw.style.display = "none";
      if (reg) { reg.style.display = "block"; setTimeout(() => reg.scrollIntoView({behavior:"smooth",block:"start"}), 50); }
    } else {
      if (reg) reg.style.display = "none";
      if (vw) {
        vw.style.display = "block";
        _resetVerify();
        setTimeout(() => vw.scrollIntoView({behavior:"smooth",block:"start"}), 50);
      }
    }
  };
  window.backToMemberPortalMain = function() {
    closeAlertModal();
    const reg = document.getElementById("registration");
    const vw  = document.getElementById("verifyPortalWrap");
    const rf  = document.getElementById("regForm");
    if (reg) reg.style.display = "none";
    if (vw)  vw.style.display  = "none";
    if (rf)  rf.style.display  = "block";
    _resetVerify();
    const ms = document.getElementById("memberSection");
    if (ms) setTimeout(() => ms.scrollIntoView({behavior:"smooth",block:"start"}), 50);
  };
  window.restartRegistration = function() {
    closeAlertModal();
    const rf = document.getElementById("regForm");
    if (rf) { rf.style.display = "block"; rf.reset(); }
    const reg = document.getElementById("registration");
    if (reg) setTimeout(() => reg.scrollIntoView({behavior:"smooth",block:"start"}), 50);
  };
  window.backToVerifyForm = function() {
    closeAlertModal();
    const cr = document.getElementById("certResult");   if (cr) cr.innerHTML = "";
    const lc = document.getElementById("memberLookupCard"); if (lc) lc.style.display = "block";
    const vm = document.getElementById("verifyMsg");    if (vm) { vm.textContent=""; vm.className="form-msg"; }
  };
  function _resetVerify() {
    ["vCnic","vDob"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
    const vm = document.getElementById("verifyMsg"); if (vm) { vm.textContent=""; vm.className="form-msg"; }
    const cr = document.getElementById("certResult"); if (cr) cr.innerHTML="";
    const lc = document.getElementById("memberLookupCard"); if (lc) lc.style.display="block";
  }

  /* CERTIFICATE VERIFICATION + CHARITY LEDGER */
  const verifyForm        = document.getElementById("verifyForm");
  const verifyMsg         = document.getElementById("verifyMsg");
  const certResult        = document.getElementById("certResult");
  const verifyBtn         = document.getElementById("verifyBtn");
  const verifyDonationBtn = document.getElementById("verifyDonationBtn");
  const verifyClearBtn    = document.getElementById("verifyClearBtn");
  const memberLookupCard  = document.getElementById("memberLookupCard");

  function getVC(){return{cnic:document.getElementById("vCnic")?.value.trim()||"",dob:document.getElementById("vDob")?.value.trim()||""};}
  function chkVC(){const{cnic,dob}=getVC();if(!/^\d{5}-\d{7}-\d{1}$/.test(cnic)){if(verifyMsg){verifyMsg.textContent="⚠️ Valid CNIC: 00000-0000000-0";verifyMsg.classList.add("error");}return false;}if(!/^\d{2}-\d{2}-\d{4}$/.test(dob)){if(verifyMsg){verifyMsg.textContent="⚠️ Date of Birth: dd-mm-yyyy";verifyMsg.classList.add("error");}return false;}if(verifyMsg){verifyMsg.textContent="";verifyMsg.className="form-msg";}return true;}
  function showCertArea(html){if(memberLookupCard)memberLookupCard.style.display="none";if(certResult){certResult.innerHTML=html;setTimeout(()=>certResult.scrollIntoView({behavior:"smooth",block:"start"}),100);}}

  if(verifyForm) verifyForm.addEventListener("submit",e=>{e.preventDefault();doVC();});

  function doVC(){
    if(!chkVC())return;
    const{cnic,dob}=getVC();
    setLoading(verifyBtn,true,"Verifying...");
    if(!window.RHS){setLoading(verifyBtn,false);return;}
    RHS.getMemberByCredentials(cnic,dob).then(res=>{
      setLoading(verifyBtn,false);
      if(res.success&&res.found){
        const m=res.member,s=(m.status||"").toLowerCase();
        if(s==="active"){showCertArea(buildCertCard(m));}
        else{
          const cfg={underprocess:{c:"yellow",i:"fa-hourglass-half",t:"Membership Underprocess",b:`Dear <strong>${m.fullName}</strong>, Your Membership is <strong>Underprocess</strong>. Being reviewed.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`},expired:{c:"orange",i:"fa-clock",t:"Membership Expired",b:`Dear <strong>${m.fullName}</strong>, Your Membership is <strong>Expired</strong>. Please contact us.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`},banned:{c:"red",i:"fa-ban",t:"Membership Banned",b:`Dear <strong>${m.fullName}</strong>, Your Membership is <strong>Banned</strong>. Please contact us.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`}}[s]||{c:"yellow",i:"fa-circle-info",t:`Status: ${m.status}`,b:`Dear <strong>${m.fullName}</strong>, Status: <strong>${m.status}</strong>.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`};
          showAlertModal(cfg.c,cfg.i,cfg.t,cfg.b,[{label:"<i class='fa-solid fa-arrow-left'></i> Back",fn:"backToVerifyForm()"},{label:"<i class='fa-solid fa-house'></i> Main Menu",fn:"backToMemberPortalMain()"}]);
        }
      }else{if(verifyMsg){verifyMsg.textContent=res.message||"No record found.";verifyMsg.classList.add("error");}}
    }).catch(()=>{setLoading(verifyBtn,false);if(verifyMsg){verifyMsg.textContent="Network error.";verifyMsg.classList.add("error");}});
  }

  if(verifyDonationBtn){
    verifyDonationBtn.addEventListener("click",()=>{
      if(!chkVC())return;
      const{cnic,dob}=getVC();
      setLoading(verifyDonationBtn,true,"Loading...");
      if(!window.RHS){setLoading(verifyDonationBtn,false);return;}
      RHS.getCharityLedger(cnic,dob).then(res=>{
        setLoading(verifyDonationBtn,false);
        if(!res.success){if(verifyMsg){verifyMsg.textContent=res.message||"No record found.";verifyMsg.classList.add("error");}return;}
        showCertArea(buildLedger(res));
      }).catch(()=>{setLoading(verifyDonationBtn,false);if(verifyMsg){verifyMsg.textContent="Network error.";verifyMsg.classList.add("error");}});
    });
  }
  if(verifyClearBtn) verifyClearBtn.addEventListener("click",_resetVerify);

  function buildCertCard(m){
    const ph=m.photo?`<img src="${m.photo}" style="width:100%;height:100%;object-fit:cover">`:`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#EEF8F1;color:#8A9A96;font-size:2.5rem"><i class="fa-solid fa-user"></i></div>`;
    const mD=JSON.stringify(m).replace(/"/g,"&quot;");
    return `<div class="cert-card"><div class="cert-top-bar"><img src="images/logo.png" class="cert-logo" alt="RHS"><div class="cert-org-info"><div class="cert-org-name">${window.NGO.name}</div><div class="cert-org-addr">${window.NGO.address}</div></div><span class="cert-badge-active">✓ Active</span></div><div class="cert-body"><div class="cert-photo">${ph}</div><div class="cert-details"><div class="cert-member-name">${m.fullName}</div><div class="cert-member-type">${m.membershipType||"Member"}</div><div class="cert-grid"><div class="cert-item"><span class="lbl">Reg No</span><span class="val">${m.registrationNo}</span></div><div class="cert-item"><span class="lbl">CNIC</span><span class="val">${m.cnic}</span></div><div class="cert-item"><span class="lbl">Father/Husband</span><span class="val">${m.fatherName||"—"}</span></div><div class="cert-item"><span class="lbl">Gender</span><span class="val">${m.gender||"—"}</span></div><div class="cert-item"><span class="lbl">Mobile</span><span class="val">${m.mobile||"—"}</span></div><div class="cert-item"><span class="lbl">Valid Upto</span><span class="val" style="color:#1a9e5c;font-weight:700">${m.validUpto||"—"}</span></div><div class="cert-item cert-full"><span class="lbl">Address</span><span class="val">${m.address||"—"}</span></div></div></div></div><div class="cert-footer-bar"><span>📞 ${window.NGO.phone}</span><span>✉️ ${window.NGO.email}</span><span style="font-style:italic">Computer-Generated</span></div><div class="cert-actions"><button class="btn btn-primary" onclick="printCert(${mD})"><i class="fa-solid fa-file-pdf"></i> Download PDF</button><button class="btn btn-ghost" onclick="backToVerifyForm()"><i class="fa-solid fa-arrow-left"></i> Back</button><button class="btn btn-ghost" onclick="backToMemberPortalMain()"><i class="fa-solid fa-house"></i> Main Menu</button></div><p class="cert-footnote">Digital proof of membership in ${window.NGO.name}.</p></div>`;
  }
  window.printCert=function(m){const pa=document.getElementById("printCert");if(!pa)return;pa.innerHTML=`<div style="border:6px double #14534F;padding:40px;font-family:Georgia,serif;max-width:700px;margin:0 auto"><div style="text-align:center;border-bottom:2px solid #E8A33D;padding-bottom:16px;margin-bottom:20px"><h1 style="color:#14534F;margin:0">${window.NGO.name}</h1><p style="color:#E8A33D;letter-spacing:3px;font-size:.85rem;margin:4px 0">DIGITAL MEMBERSHIP CERTIFICATE</p></div><table style="width:100%;border-collapse:collapse"><tr><td style="width:25%;vertical-align:top;padding-right:24px">${m.photo?`<img src="${m.photo}" style="width:110px;height:130px;object-fit:cover;border:3px solid #14534F;display:block">`:`<div style="width:110px;height:130px;background:#eee;border:3px solid #14534F;display:flex;align-items:center;justify-content:center;font-size:3rem">👤</div>`}</td><td style="vertical-align:top"><h2 style="color:#14534F;margin:0 0 4px">${m.fullName}</h2><p style="color:#888;margin:0 0 10px">${m.membershipType||"Member"}</p><table style="font-size:.88rem"><tr><td style="padding:3px 0;font-weight:bold;width:140px">Reg No:</td><td style="color:#14534F;font-weight:bold">${m.registrationNo}</td></tr><tr><td style="padding:3px 0;font-weight:bold">CNIC:</td><td>${m.cnic}</td></tr><tr><td style="padding:3px 0;font-weight:bold">Father:</td><td>${m.fatherName||"—"}</td></tr><tr><td style="padding:3px 0;font-weight:bold">Mobile:</td><td>${m.mobile||"—"}</td></tr><tr><td style="padding:3px 0;font-weight:bold">Valid Upto:</td><td style="color:#1a9e5c;font-weight:bold">${m.validUpto||"—"}</td></tr><tr><td style="padding:3px 0;font-weight:bold">Address:</td><td>${m.address||"—"}</td></tr></table></td></tr></table><div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #E7DFD2;color:#888;font-size:.75rem">${window.NGO.address} &nbsp;·&nbsp; 📞 ${window.NGO.phone} &nbsp;·&nbsp; ✉️ ${window.NGO.email}</div></div>`;window.print();setTimeout(()=>{pa.innerHTML="";},3000);};

  function buildLedger(res){
    const m=res.member,don=res.donations||[];let rt=0;
    const rows=!don.length?`<tr><td colspan="4" style="text-align:center;padding:24px;color:#8A9A96;font-style:italic">No donations yet.</td></tr>`:don.map((d,i)=>{rt+=Number(d.amount)||0;return`<tr style="background:${i%2?"#F5F9F8":"#fff"}"><td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.date||""}</td><td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.paymentMethod||d.method||"Cash"}</td><td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;color:#2E9E5B;font-weight:600">Rs. ${Number(d.amount||0).toLocaleString()}</td><td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-weight:600">Rs. ${rt.toLocaleString()}</td></tr>`;}).join("");
    return `<div class="ledger-wrap"><div class="ledger-header"><img src="images/logo.png" class="ledger-logo"><div><h3 style="margin:0;color:#14534F">${window.NGO.name}</h3><small>${window.NGO.address}</small></div></div><div style="text-align:center;margin:10px 0"><span class="eyebrow">Charity Donation Ledger</span></div><div class="ledger-member-info"><div class="ledger-info-row"><span class="lbl">Member Name</span><span class="val">${m.fullName}</span></div><div class="ledger-info-row"><span class="lbl">Reg No</span><span class="val">${m.registrationNo}</span></div><div class="ledger-info-row"><span class="lbl">CNIC</span><span class="val">${m.cnic}</span></div><div class="ledger-info-row"><span class="lbl">Valid Upto</span><span class="val" style="color:#14534F;font-weight:700">${m.validUpto||"—"}</span></div><div class="ledger-info-row"><span class="lbl">Status</span><span class="val"><span class="cert-badge">${m.status}</span></span></div><div class="ledger-info-row"><span class="lbl">Total Donations</span><span class="val" style="color:#1a9e5c;font-weight:700">${don.length}</span></div></div><div style="overflow-x:auto;margin-top:16px"><table style="width:100%;border-collapse:collapse;font-size:.88rem"><thead><tr style="background:#14534F;color:#fff"><th style="padding:10px 14px;text-align:left">Date</th><th style="padding:10px 14px;text-align:left">Payment</th><th style="padding:10px 14px;text-align:left">Amount</th><th style="padding:10px 14px;text-align:left">Running Total</th></tr></thead><tbody>${rows}</tbody><tfoot><tr style="background:#EEF8F1"><td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F">Total Charity</td><td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F;font-size:1rem">Rs. ${res.total.toLocaleString()}</td></tr></tfoot></table></div><p class="cert-footnote">${window.NGO.name} | ${window.NGO.phone} | ${window.NGO.email}</p><div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" onclick="window.print()"><i class="fa-solid fa-file-pdf"></i> Download PDF</button><button class="btn btn-ghost" onclick="backToVerifyForm()"><i class="fa-solid fa-arrow-left"></i> Back</button><button class="btn btn-ghost" onclick="backToMemberPortalMain()"><i class="fa-solid fa-house"></i> Main Menu</button></div></div>`;
  }

  /* TEAM */
  function loadTeam(){if(!window.RHS){setTimeout(loadTeam,500);return;}const g=document.getElementById("teamGrid");if(!g)return;RHS.getTeam().then(res=>{if(!res.success||!res.team||!res.team.length)return;g.innerHTML="";res.team.forEach(m=>{const c=document.createElement("div");c.className="team-card";const ph=m.photo?`<div class="photo" style="background-image:url('${m.photo}')"></div>`:`<div class="photo" style="background:#EEF8F1;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user" style="font-size:2rem;color:#8A9A96"></i></div>`;c.innerHTML=ph+`<h4>${m.name}</h4><div class="role">${m.designation}</div><p class="bio">${m.bio||""}</p>`;g.appendChild(c);});}).catch(()=>{});}
  loadTeam();

  /* CONTACT FORM */
  const contactForm=document.getElementById("contactForm"),contactMsg=document.getElementById("contactMsg");
  if(contactForm){contactForm.addEventListener("submit",e=>{e.preventDefault();if(!contactMsg)return;contactMsg.textContent="";contactMsg.className="form-msg";const nm=document.getElementById("cName")?.value.trim()||"",em=document.getElementById("cEmail")?.value.trim()||"",ms=document.getElementById("cMsg")?.value.trim()||"";if(!nm||!em||!ms){contactMsg.textContent="⚠️ Please fill all fields.";contactMsg.classList.add("error");return;}const sb=contactForm.querySelector("button[type='submit']");setLoading(sb,true,"Sending...");if(!window.RHS){setLoading(sb,false);return;}RHS.submitContactMessage({name:nm,email:em,message:ms}).then(res=>{setLoading(sb,false);if(res.success){showAlertModal("green","fa-envelope-circle-check","Message Sent!",`Dear <strong>${nm}</strong>, Thank you! We will get back to you soon.<br><br>📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}`,[{label:"OK",fn:"closeAlertModal()"}]);contactForm.reset();}else{contactMsg.textContent=res.message||"Error.";contactMsg.classList.add("error");}}).catch(()=>{setLoading(sb,false);contactMsg.textContent="Network error.";contactMsg.classList.add("error");});})

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
