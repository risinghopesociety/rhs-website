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
  const regForm   = document.getElementById("regForm");
  const formMsg   = document.getElementById("formMsg");
  const formResult= document.getElementById("formResult");
  const submitBtn = document.getElementById("submitBtn");

  // Photo preview — document level (mobile Chrome fix)
  document.addEventListener("change", function(e) {
    if (e.target && e.target.id === "regPhoto") {
      const file = e.target.files[0];
      const pm = document.getElementById("photoMsg");
      const pv = document.getElementById("regPhotoPreview");
      if (!file) return;
      if (file.size > 3*1024*1024) {
        if (pm) { pm.textContent="⚠️ Max 3MB allowed"; pm.className="form-msg error"; }
        e.target.value=""; return;
      }
      if (pm) { pm.textContent="✅ "+file.name; pm.className="form-msg success"; }
      const reader=new FileReader();
      reader.onload=ev=>{ if(pv) pv.innerHTML=`<img src="${ev.target.result}" style="width:90px;height:90px;object-fit:cover;border-radius:8px;border:3px solid #14534F;display:block;margin-top:6px">`; };
      reader.readAsDataURL(file);
    }
  });

  if (regForm) {
    regForm.addEventListener("reset", () => {
      setTimeout(() => {
        if (formMsg) { formMsg.textContent=""; formMsg.className="form-msg"; }
        const pm=document.getElementById("photoMsg"); if(pm){pm.textContent="";pm.className="form-msg";}
        const pv=document.getElementById("regPhotoPreview"); if(pv) pv.innerHTML="";
      }, 0);
    });

    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!formMsg) return;
      formMsg.textContent=""; formMsg.className="form-msg";

      const cnic       = document.getElementById("regCnic")?.value.trim()      || "";
      const dob        = document.getElementById("regDob")?.value.trim()        || "";
      const fullName   = document.getElementById("regName")?.value.trim()       || "";
      const father     = document.getElementById("regFather")?.value.trim()     || "";
      const gender     = document.getElementById("regGender")?.value            || "";
      const prof       = document.getElementById("regProfession")?.value.trim() || "";
      const mobile     = document.getElementById("regMobile")?.value.trim()     || "";
      const email      = document.getElementById("regEmail")?.value.trim()       || "";
      const province   = document.getElementById("regProvince")?.value          || "";
      const membership = document.getElementById("regMembership")?.value        || "";
      const address    = document.getElementById("regAddress")?.value.trim()    || "";
      const photoFile  = document.getElementById("regPhoto")?.files?.[0]        || null;

      if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) { formMsg.textContent="⚠️ Valid CNIC: 00000-0000000-0"; formMsg.classList.add("error"); return; }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob))   { formMsg.textContent="⚠️ DOB: dd-mm-yyyy";             formMsg.classList.add("error"); return; }
      if (!fullName)   { formMsg.textContent="⚠️ Full Name required";            formMsg.classList.add("error"); return; }
      if (!father)     { formMsg.textContent="⚠️ Father/Husband Name required";  formMsg.classList.add("error"); return; }
      if (!gender)     { formMsg.textContent="⚠️ Please select Gender";          formMsg.classList.add("error"); return; }
      if (!prof)       { formMsg.textContent="⚠️ Profession required";           formMsg.classList.add("error"); return; }
      if (!/^\d{4}-\d{7}$/.test(mobile))       { formMsg.textContent="⚠️ Mobile: 0300-0000000";        formMsg.classList.add("error"); return; }
      if (!province)   { formMsg.textContent="⚠️ Please select Province";        formMsg.classList.add("error"); return; }
      if (!membership) { formMsg.textContent="⚠️ Please select Membership Type"; formMsg.classList.add("error"); return; }
      if (!address)    { formMsg.textContent="⚠️ Address required";              formMsg.classList.add("error"); return; }
      if (!photoFile)  {
        formMsg.textContent="⚠️ Photo required — please select passport size photo";
        formMsg.classList.add("error");
        document.getElementById("regPhoto")?.scrollIntoView({behavior:"smooth",block:"center"});
        return;
      }

      setLoading(submitBtn, true, "Uploading photo...");
      formMsg.textContent="Uploading photo..."; formMsg.className="form-msg";

      let photoUrl="";
      try {
        const fd=new FormData();
        fd.append("file",photoFile); fd.append("upload_preset","rhs-upload"); fd.append("folder","rhs/members");
        const resp=await fetch("https://api.cloudinary.com/v1_1/dt9yspaw7/image/upload",{method:"POST",body:fd});
        const data=await resp.json();
        if (data.secure_url) { photoUrl=data.secure_url; formMsg.textContent="✅ Photo uploaded!"; }
        else throw new Error(data.error?.message||"Upload failed");
      } catch(err) {
        setLoading(submitBtn,false);
        formMsg.textContent="⚠️ Photo upload failed: "+err.message;
        formMsg.classList.add("error"); return;
      }

      setLoading(submitBtn, true, "Submitting...");
      if (!window.RHS) { setLoading(submitBtn,false); return; }

      RHS.registerMember({cnic,dob,fullName,fatherName:father,gender,profession:prof,email,mobile,province,address,membershipType:membership,photo:photoUrl})
      .then(res => {
        setLoading(submitBtn,false);
        formMsg.textContent="";
        if (res.success) {
          regForm.style.display="none";
          if (formResult) {
            formResult.hidden=false;
            formResult.innerHTML=`
              <div class="status-msg status-green">
                <i class="fa-solid fa-circle-check"></i>
                <div class="status-title">Registration Submitted Successfully!</div>
                <p>Dear <strong>${fullName}</strong>, Your Registration Request has been Successfully Received.</p>
                <p style="margin-top:8px">Your Registration is now <strong>Underprocess</strong>. You will be notified after approval.</p>
                <p style="margin-top:12px;font-size:.88rem">📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}</p>
              </div>`;
          }
        } else if (res.code==="DUPLICATE") {
          if (formResult) {
            formResult.hidden=false;
            formResult.innerHTML=`
              <div class="status-msg status-yellow">
                <i class="fa-solid fa-circle-info"></i>
                <div class="status-title">Already Registered</div>
                <p>Dear <strong>${fullName}</strong>, you are already a Registered Member. Please check your status by using the <strong>Registration & Certificate Verification</strong> button.</p>
                <p style="margin-top:12px;font-size:.88rem">📞 ${window.NGO.alert} &nbsp;|&nbsp; 📧 ${window.NGO.email}</p>
              </div>`;
          }
        } else {
          formMsg.textContent=res.message||"Something went wrong.";
          formMsg.classList.add("error");
        }
      }).catch(()=>{ setLoading(submitBtn,false); formMsg.textContent="⚠️ Network error. Please try again."; formMsg.classList.add("error"); });
    });
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
    // Hide donation result when verifying certificate
    const donResult = document.getElementById("donationResult");
    if (donResult) donResult.innerHTML = "";
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
    // Hide donation result when certificate shows
    const donResult = document.getElementById("donationResult");
    if (donResult) donResult.innerHTML = "";
    certResult.hidden=false;
    const isActive=(member.status||"").toLowerCase()==="active";
    const statusColor=isActive?"#2E9E5B":"#D9483A";
    const logoSrc=window.NGO.logoUrl||"images/logo.png";
    const issueDate=new Date().toLocaleDateString("en-PK",{day:"2-digit",month:"long",year:"numeric"});
    const photoHtml=member.photo
      ?`<img src="${member.photo}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:4px solid #14534F;flex-shrink:0">`
      :`<div style="width:88px;height:88px;border-radius:50%;border:4px solid #14534F;background:#EEF8F1;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa-solid fa-user" style="font-size:2rem;color:#4CAF8A"></i></div>`;
    certResult.innerHTML=`
      <div style="border:3px double #14534F;border-radius:10px;overflow:hidden;background:#fff;max-width:580px;margin:0 auto;font-family:Georgia,serif">
        <div style="background:#14534F;padding:20px 26px;display:flex;align-items:center;gap:16px">
          <img src="${logoSrc}" style="width:56px;height:56px;border-radius:50%;object-fit:contain;background:#fff;padding:4px;border:3px solid rgba(255,255,255,0.35);flex-shrink:0">
          <div style="flex:1">
            <div style="font-size:9px;letter-spacing:0.22em;color:rgba(255,255,255,0.6);font-family:sans-serif;margin-bottom:3px">DIGITAL MEMBERSHIP CERTIFICATE</div>
            <div style="font-size:17px;font-weight:700;color:#fff">${window.NGO.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);font-family:sans-serif;margin-top:1px">${window.NGO.address}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:9px;color:rgba(255,255,255,0.5);font-family:sans-serif;margin-bottom:3px">REG NO.</div>
            <div style="font-size:13px;font-weight:700;color:#E8A33D;letter-spacing:0.06em;font-family:sans-serif">${member.registrationNo||"—"}</div>
          </div>
        </div>
        <div style="height:4px;background:#E8A33D"></div>
        <div style="padding:20px 26px;display:flex;gap:18px;align-items:center;border-bottom:1px solid #E7DFD2;background:#FAFAF8">
          ${photoHtml}
          <div style="flex:1;min-width:0">
            <div style="font-size:19px;font-weight:700;color:#14534F;margin-bottom:3px">${member.fullName}</div>
            <div style="font-size:13px;color:#666;font-family:sans-serif;margin-bottom:10px">${member.membershipType||"Member"}</div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:${isActive?"#EEF8F1":"#FEF2F2"};border:1px solid ${statusColor}40;border-radius:20px;padding:4px 12px">
              <div style="width:7px;height:7px;border-radius:50%;background:${statusColor};flex-shrink:0"></div>
              <span style="font-size:12px;font-weight:700;color:${statusColor};font-family:sans-serif">${(member.status||"Unknown").toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr">
          ${[["CNIC",member.cnic||"—","Date of Birth",member.dob||"—"],["Mobile",member.mobile||"—","Valid Upto",`<span style="color:#14534F;font-weight:700">${member.validUpto||"—"}</span>`],["Gender",member.gender||"—","Province",member.province||"—"]].map(([l1,v1,l2,v2])=>`
            <div style="padding:11px 26px;border-right:1px solid #E7DFD2;border-bottom:1px solid #E7DFD2">
              <div style="font-size:9px;font-weight:700;color:#8A9A96;text-transform:uppercase;letter-spacing:0.12em;font-family:sans-serif;margin-bottom:3px">${l1}</div>
              <div style="font-size:13px;color:#1F2E2B;font-weight:700;font-family:sans-serif">${v1}</div>
            </div>
            <div style="padding:11px 26px;border-bottom:1px solid #E7DFD2">
              <div style="font-size:9px;font-weight:700;color:#8A9A96;text-transform:uppercase;letter-spacing:0.12em;font-family:sans-serif;margin-bottom:3px">${l2}</div>
              <div style="font-size:13px;color:#1F2E2B;font-family:sans-serif">${v2}</div>
            </div>`).join("")}
          <div style="padding:11px 26px;grid-column:1/-1;border-bottom:1px solid #E7DFD2">
            <div style="font-size:9px;font-weight:700;color:#8A9A96;text-transform:uppercase;letter-spacing:0.12em;font-family:sans-serif;margin-bottom:3px">ADDRESS</div>
            <div style="font-size:13px;color:#1F2E2B;font-weight:700;font-family:sans-serif">${member.address||"—"}</div>
          </div>
        </div>
        <div style="padding:14px 26px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #E7DFD2">
          <div>
            <div style="font-size:9px;color:#8A9A96;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px">Issued On</div>
            <div style="font-size:12px;color:#1F2E2B;font-weight:700;font-family:sans-serif">${issueDate}</div>
          </div>
          <div style="text-align:center">
            <div style="width:110px;border-top:1px solid #1F2E2B;padding-top:7px;margin:0 auto">
              <div style="font-size:11px;font-weight:700;color:#14534F;font-family:sans-serif">President</div>
              <div style="font-size:10px;color:#8A9A96;font-family:sans-serif">${window.NGO.name}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:9px;color:#8A9A96;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px">Verify at</div>
            <div style="font-size:11px;color:#14534F;font-weight:700;font-family:sans-serif">${window.location.hostname}</div>
          </div>
        </div>
        <div style="padding:14px 26px;background:#F5F9F8;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div style="font-size:10px;color:#8A9A96;font-family:sans-serif">⚠️ Computer-generated · No physical signature required</div>
          <button class="btn btn-primary" onclick="printCertificate(${JSON.stringify(member).replace(/"/g,'&quot;')})" style="font-size:13px">
            <i class="fa-solid fa-download"></i> Download / Print
          </button>
        </div>
        <div style="padding:12px 26px;text-align:center;border-top:1px solid #E7DFD2">
          <button class="btn btn-ghost" onclick="hideMemberSection()" style="font-size:13px">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>
      </div>`;
  }

  window.printCertificate = function(member) {
    const pa=document.getElementById("printCert"); if(!pa) return;
    const isActive=(member.status||"").toLowerCase()==="active";
    const statusColor=isActive?"#2E9E5B":"#D9483A";
    const logoSrc=window.NGO.logoUrl||"images/logo.png";
    const issueDate=new Date().toLocaleDateString("en-PK",{day:"2-digit",month:"long",year:"numeric"});
    const photoHtml=member.photo
      ?`<img src="${member.photo}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:4px solid #14534F;flex-shrink:0">`
      :`<div style="width:88px;height:88px;border-radius:50%;background:#EEF8F1;border:4px solid #14534F;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:2rem">👤</div>`;
    pa.innerHTML=`
    <style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}</style>
    <div style="font-family:Georgia,serif;max-width:660px;margin:0 auto;border:3px double #14534F;border-radius:10px;overflow:hidden">
      <div style="background:#14534F;padding:22px 30px;display:flex;align-items:center;gap:16px">
        <img src="${logoSrc}" style="width:60px;height:60px;border-radius:50%;object-fit:contain;background:#fff;padding:5px;border:3px solid rgba(255,255,255,0.35);flex-shrink:0">
        <div style="flex:1">
          <div style="font-size:9px;letter-spacing:0.22em;color:rgba(255,255,255,0.6);font-family:sans-serif;margin-bottom:3px">DIGITAL MEMBERSHIP CERTIFICATE</div>
          <div style="font-size:18px;font-weight:700;color:#fff">${window.NGO.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6);font-family:sans-serif;margin-top:2px">${window.NGO.address}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:9px;color:rgba(255,255,255,0.5);font-family:sans-serif;margin-bottom:3px">REG NO.</div>
          <div style="font-size:14px;font-weight:700;color:#E8A33D;font-family:sans-serif">${member.registrationNo||"—"}</div>
        </div>
      </div>
      <div style="height:4px;background:#E8A33D"></div>
      <div style="padding:22px 30px;display:flex;gap:20px;align-items:center;border-bottom:1px solid #E7DFD2;background:#FAFAF8">
        ${photoHtml}
        <div>
          <div style="font-size:21px;font-weight:700;color:#14534F;margin-bottom:3px">${member.fullName}</div>
          <div style="font-size:13px;color:#666;font-family:sans-serif;margin-bottom:10px">${member.membershipType||"Member"}</div>
          <div style="display:inline-flex;align-items:center;gap:6px;background:${isActive?"#EEF8F1":"#FEF2F2"};border:1px solid ${statusColor}50;border-radius:20px;padding:4px 14px">
            <div style="width:7px;height:7px;border-radius:50%;background:${statusColor};flex-shrink:0"></div>
            <span style="font-size:12px;font-weight:700;color:${statusColor};font-family:sans-serif">${(member.status||"Unknown").toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr">
        ${[["CNIC",member.cnic||"—","Date of Birth",member.dob||"—"],["Mobile",member.mobile||"—","Valid Upto",member.validUpto||"—"],["Gender",member.gender||"—","Province",member.province||"—"]].map(([l1,v1,l2,v2])=>`
          <div style="padding:11px 30px;border-right:1px solid #E7DFD2;border-bottom:1px solid #E7DFD2">
            <div style="font-size:9px;font-weight:700;color:#8A9A96;text-transform:uppercase;letter-spacing:0.12em;font-family:sans-serif;margin-bottom:3px">${l1}</div>
            <div style="font-size:13px;color:#1F2E2B;font-weight:700;font-family:sans-serif">${v1}</div>
          </div>
          <div style="padding:11px 30px;border-bottom:1px solid #E7DFD2">
            <div style="font-size:9px;font-weight:700;color:#8A9A96;text-transform:uppercase;letter-spacing:0.12em;font-family:sans-serif;margin-bottom:3px">${l2}</div>
            <div style="font-size:13px;color:#1F2E2B;font-weight:700;font-family:sans-serif">${v2}</div>
          </div>`).join("")}
        <div style="padding:11px 30px;grid-column:1/-1;border-bottom:1px solid #E7DFD2">
          <div style="font-size:9px;font-weight:700;color:#8A9A96;text-transform:uppercase;letter-spacing:0.12em;font-family:sans-serif;margin-bottom:3px">ADDRESS</div>
          <div style="font-size:13px;color:#1F2E2B;font-weight:700;font-family:sans-serif">${member.address||"—"}</div>
        </div>
      </div>
      <div style="padding:16px 30px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #E7DFD2">
        <div>
          <div style="font-size:9px;color:#8A9A96;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px">Issued On</div>
          <div style="font-size:13px;color:#1F2E2B;font-weight:700;font-family:sans-serif">${issueDate}</div>
        </div>
        <div style="text-align:center">
          <div style="width:120px;border-top:1px solid #1F2E2B;padding-top:8px;margin:0 auto">
            <div style="font-size:12px;font-weight:700;color:#14534F;font-family:sans-serif">President</div>
            <div style="font-size:10px;color:#8A9A96;font-family:sans-serif">${window.NGO.name}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:9px;color:#8A9A96;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px">Verify at</div>
          <div style="font-size:12px;color:#14534F;font-weight:700;font-family:sans-serif">${window.location.hostname}</div>
        </div>
      </div>
      <div style="padding:10px 30px;background:#F5F9F8;text-align:center">
        <div style="font-size:10px;color:#8A9A96;font-family:sans-serif">⚠️ Computer-generated certificate · No physical signature required · ${window.NGO.name} · ${window.NGO.phone}</div>
      </div>
    </div>`;
    window.print();
    setTimeout(()=>{pa.innerHTML="";},3000);
  };

  /* CLEAR VERIFY BTN */
  const verifyClearBtn = document.getElementById("verifyClearBtn");
  if (verifyClearBtn) {
    verifyClearBtn.addEventListener("click", () => {
      const vCnic = document.getElementById("vCnic"); if(vCnic) vCnic.value="";
      const vDob  = document.getElementById("vDob");  if(vDob)  vDob.value="";
      if (certResult) { certResult.hidden=true; certResult.innerHTML=""; }
      const donResult=document.getElementById("donationResult"); if(donResult) donResult.innerHTML="";
      if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
    });
  }

  window.closeLedger = function() {
    if (certResult) { certResult.hidden=true; certResult.innerHTML=""; }
    const donResult=document.getElementById("donationResult"); if(donResult) donResult.innerHTML="";
    if (verifyMsg) { verifyMsg.textContent=""; verifyMsg.className="form-msg"; }
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
                <button class="btn btn-ghost" onclick="closeLedger()">
                  <i class="fa-solid fa-arrow-left"></i> Back
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

  /* MEMBER PORTAL — Show/Hide */
  window.showMemberSection = function(which) {
    const regSection = document.getElementById("registration");
    const verSection = document.getElementById("verify");
    // Hide both
    if (regSection) regSection.style.display = "none";
    if (verSection) verSection.style.display = "none";
    // Show requested
    if (which === "registration") {
      if (regSection) {
        regSection.style.display = "block";
        setTimeout(() => regSection.scrollIntoView({behavior:"smooth", block:"start"}), 50);
      }
    } else {
      // Clear previous results
      const certResult2 = document.getElementById("certResult");
      const donResult   = document.getElementById("donationResult");
      if (certResult2) { certResult2.hidden = true; certResult2.innerHTML = ""; }
      if (donResult)   donResult.innerHTML = "";
      if (verSection) {
        verSection.style.display = "block";
        setTimeout(() => verSection.scrollIntoView({behavior:"smooth", block:"start"}), 50);
      }
    }
  };

  window.hideMemberSection = function() {
    const regSection = document.getElementById("registration");
    const verSection = document.getElementById("verify");
    if (regSection) regSection.style.display = "none";
    if (verSection) verSection.style.display = "none";
    // Clear results
    const certResult2 = document.getElementById("certResult");
    const donResult   = document.getElementById("donationResult");
    if (certResult2) { certResult2.hidden = true; certResult2.innerHTML = ""; }
    if (donResult)   donResult.innerHTML = "";
    const verMsg = document.getElementById("verifyMsg");
    if (verMsg) { verMsg.textContent = ""; verMsg.className = "form-msg"; }
    document.getElementById("memberSection")?.scrollIntoView({behavior:"smooth"});
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
