// RHS Firebase Mode
// All data via window.RHS.* functions from firebase-db.js

/* ==========================================================
   RISING HOPE SOCIETY — SCRIPT.JS
   Replace API_URL below with your deployed Google Apps Script
   Web App URL (see SHEET_SETUP.md for instructions).
   ========================================================== */

// Firebase mode — RHS.* functions handle all data

/* ===================== GLOBAL UTILITIES ===================== */

// ---- LOADING BUTTON ----
// Usage: setLoading(btn, true, "Searching...") / setLoading(btn, false)
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

// ---- FORM RESET — clears all inputs, removes saved data ----
function resetForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll("input, textarea, select").forEach(el => {
    if (el.type === "submit" || el.type === "button") return;
    el.value = "";
    el.removeAttribute("value");
  });
  // Clear all messages
  form.querySelectorAll(".form-msg").forEach(el => {
    el.textContent = "";
    el.className = "form-msg";
  });
}

// ---- AUTOCOMPLETE OFF — puri site ke liye ----
document.querySelectorAll("input, textarea, select, form").forEach(el => {
  el.setAttribute("autocomplete", "off");
});
// Also disable browser suggestions on CNIC/DOB fields specifically
document.querySelectorAll('[id*="cnic"],[id*="Cnic"],[id*="dob"],[id*="Dob"]').forEach(el => {
  el.setAttribute("autocomplete", "new-password"); // Trick to force disable
  el.setAttribute("autocorrect", "off");
  el.setAttribute("autocapitalize", "off");
  el.setAttribute("spellcheck", "false");
});

// ---- DD-MM-YYYY AUTO FORMAT — for all DOB fields ----
function applyDateFormat(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener("input", function() {
    let v = this.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 4) v = v.slice(0,2) + "-" + v.slice(2,4) + "-" + v.slice(4);
    else if (v.length > 2) v = v.slice(0,2) + "-" + v.slice(2);
    this.value = v;
  });
  // Validate on blur
  inputEl.addEventListener("blur", function() {
    const val = this.value.trim();
    if (val && !/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      this.style.borderColor = "#D9483A";
      this.title = "Format: dd-mm-yyyy (e.g. 01-04-1988)";
    } else {
      this.style.borderColor = "";
      this.title = "";
    }
  });
}

// Apply to all DOB fields on page
document.querySelectorAll('[id*="dob"],[id*="Dob"],[placeholder*="dd-mm-yyyy"]').forEach(applyDateFormat);

// ---- CNIC AUTO FORMAT — for all CNIC fields ----
function applyCnicFormat(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener("input", function() {
    let v = this.value.replace(/\D/g, "").slice(0, 13);
    if (v.length > 12) v = v.slice(0,5) + "-" + v.slice(5,12) + "-" + v.slice(12);
    else if (v.length > 5) v = v.slice(0,5) + "-" + v.slice(5);
    this.value = v;
  });
}
document.querySelectorAll('[id*="cnic"],[id*="Cnic"],[placeholder*="00000-"]').forEach(applyCnicFormat);

// ---- MOBILE AUTO FORMAT ----
function applyMobileFormat(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener("input", function() {
    let v = this.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 4) v = v.slice(0,4) + "-" + v.slice(4);
    this.value = v;
  });
}
document.querySelectorAll('[id*="mobile"],[id*="Mobile"],[placeholder*="0300-"]').forEach(applyMobileFormat);

/* ===================== NGO SETTINGS — AdminSettings sheet se ===================== */
window.NGO = {
  name: "Rising Hope Society",
  phone: "0346-4800064",
  address: "Khairpur Tamewali, Bahawalpur, Punjab, Pakistan",
  email: "risinghopesociety@gmail.com",
  bank: "111111111111111",
  alert: "0346-4800064"
};

function loadNGOSettings() {
  RHS.getNGOSettings().then(res => {
    if (!res.success) return;
    window.NGO = {
      name:         res.ngoName        || window.NGO.name,
      phone:        res.ngoPhone       || window.NGO.phone,
      address:      res.ngoAddress     || window.NGO.address,
      email:        res.ngoEmail       || window.NGO.email,
      bank:         res.bankAccount    || window.NGO.bank,
      alert:        res.alertNumber    || res.ngoPhone || window.NGO.alert,
      ourTeamTitle: res.ourTeamTitle   || "Our team",
      ourTeamMatter:res.ourTeamMatter  || ""
    };
    // Update DOM
    document.querySelectorAll(".ngo-name").forEach(el => el.textContent = window.NGO.name);
    document.querySelectorAll(".ngo-address").forEach(el => el.textContent = window.NGO.address);
    document.querySelectorAll(".ngo-phone").forEach(el => el.textContent = window.NGO.phone);
    document.querySelectorAll(".ngo-email").forEach(el => el.textContent = window.NGO.email);

    // Team heading — B10
    const teamTitle = document.querySelector("#team .section-head h2");
    if (teamTitle && window.NGO.ourTeamTitle) teamTitle.textContent = window.NGO.ourTeamTitle;

    // Team matter — B11
    const teamMatter = document.querySelector("#team .section-head p");
    if (teamMatter && window.NGO.ourTeamMatter) teamMatter.textContent = window.NGO.ourTeamMatter;

  }).catch(() => {});
}
loadNGOSettings();

/* ===================== NAVBAR TOGGLE ===================== */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

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

/* Highlight active nav link on scroll */
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  let current = "home";
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.id;
  });
  navLinks.querySelectorAll("a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});

/* ===================== HERO SLIDER ===================== */
const slides = document.querySelectorAll(".slide");
const dotsWrap = document.getElementById("sliderDots");
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

function startSlider() {
  sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5500);
}
function resetSlider() {
  clearInterval(sliderInterval);
  startSlider();
}

document.getElementById("nextSlide").addEventListener("click", () => { goToSlide(currentSlide + 1); resetSlider(); });
document.getElementById("prevSlide").addEventListener("click", () => { goToSlide(currentSlide - 1); resetSlider(); });

startSlider();

/* ===================== HELPERS ===================== */
// Firebase mode — RHS.* functions handle all data

// Firebase mode - RHS.* functions handle all data
// Old apiGet/apiPost replaced by firebase-db.js

/* CNIC auto-format: 00000-0000000-0 */
function formatCnic(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").slice(0, 13);
    if (v.length > 5 && v.length <= 12) v = v.slice(0,5) + "-" + v.slice(5);
    else if (v.length > 12) v = v.slice(0,5) + "-" + v.slice(5,12) + "-" + v.slice(12);
    input.value = v;
  });
}

/* Mobile auto-format: 0000-0000000 */
function formatMobile(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 4) v = v.slice(0,4) + "-" + v.slice(4);
    input.value = v;
  });
}

/* DOB auto-format: dd-mm-yyyy */
function formatDob(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 2 && v.length <= 4) v = v.slice(0,2) + "-" + v.slice(2);
    else if (v.length > 4) v = v.slice(0,2) + "-" + v.slice(2,4) + "-" + v.slice(4);
    input.value = v;
  });
}

document.querySelectorAll('input[placeholder="00000-0000000-0"]').forEach(formatCnic);
document.querySelectorAll('input[placeholder="dd-mm-yyyy"]').forEach(formatDob);
formatMobile(document.getElementById("mobile"));

/* ===================== STATISTICS (with count-up) ===================== */
function animateCount(el, target) {
  const start = 0;
  const duration = 1400;
  const startTime = performance.now();
  target = Number(target) || 0;

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(start + (target - start) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

let statsLoaded = false;
function loadStatistics() {
  RHS.getStatistics().then(res => {
    if (!res.success) return;
    document.querySelectorAll(".stat-num").forEach(el => {
      const key = el.dataset.key;
      const value = res.stats[key] ?? 0;
      el.dataset.target = value;
    });
    statsLoaded = true;
    maybeAnimateStats();
  }).catch(() => {});
}
loadStatistics();

/* Trigger count-up animation when stats section enters viewport */
function maybeAnimateStats() {
  if (!statsLoaded) return;
  document.querySelectorAll(".stat-num").forEach(el => {
    animateCount(el, el.dataset.target || 0);
  });
}
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      maybeAnimateStats();
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
statsObserver.observe(document.getElementById("stats"));

/* ===================== REGISTRATION FORM ===================== */
const regForm = document.getElementById("regForm");
const formMsg = document.getElementById("formMsg");
const formResult = document.getElementById("formResult");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const submitBtn = document.getElementById("submitBtn");

// Clear button — clear fields + message + result
regForm.addEventListener("reset", () => {
  setTimeout(() => {
    formMsg.textContent = "";
    formMsg.className = "form-msg";
  }, 0);
});

regForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formMsg.textContent = "";
  formMsg.className = "form-msg";

  const cnic     = document.getElementById("cnic").value.trim();
  const dob      = document.getElementById("dob").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const father   = document.getElementById("fatherName").value.trim();
  const gender   = document.getElementById("gender").value;
  const prof     = document.getElementById("profession").value.trim();
  const email    = document.getElementById("email").value.trim();
  const mobile   = document.getElementById("mobile").value.trim();
  const province = document.getElementById("province").value;
  const address  = document.getElementById("address").value.trim();

  // ===== FULL VALIDATION =====
  if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
    formMsg.textContent = "⚠️ Please enter a valid CNIC in format 00000-0000000-0.";
    formMsg.classList.add("error"); return;
  }
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    formMsg.textContent = "⚠️ Please enter Date of Birth in format dd-mm-yyyy.";
    formMsg.classList.add("error"); return;
  }
  if (!fullName) {
    formMsg.textContent = "⚠️ Full Name is required.";
    formMsg.classList.add("error"); return;
  }
  if (!father) {
    formMsg.textContent = "⚠️ Father / Husband Name is required.";
    formMsg.classList.add("error"); return;
  }
  if (!gender) {
    formMsg.textContent = "⚠️ Please select Gender.";
    formMsg.classList.add("error"); return;
  }
  if (!prof) {
    formMsg.textContent = "⚠️ Profession is required.";
    formMsg.classList.add("error"); return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formMsg.textContent = "⚠️ Please enter a valid Email address.";
    formMsg.classList.add("error"); return;
  }
  if (!/^\d{4}-\d{7}$/.test(mobile)) {
    formMsg.textContent = "⚠️ Please enter a valid Mobile Number in format 0300-0000000.";
    formMsg.classList.add("error"); return;
  }
  if (!province) {
    formMsg.textContent = "⚠️ Please select Province.";
    formMsg.classList.add("error"); return;
  }
  if (!address) {
    formMsg.textContent = "⚠️ Full Address is required.";
    formMsg.classList.add("error"); return;
  }

  const payload = {
    action: "register",
    cnic, dob, fullName,
    fatherHusbandName: father,
    gender, profession: prof,
    email, mobile, province, address
  };

  setLoading(submitBtn, true, 'Submitting...');

  RHS.submitContactMessage(payload).then(res => {
    setLoading(submitBtn, false);

    if (res.success) {
      regForm.hidden = true;
      formResult.hidden = false;
      formResult.classList.remove("error");
      resultTitle.textContent = "Registration Submitted";
      resultText.textContent = `Dear ${res.fullName}, Your Registration form Successfully Submitted. Now your Registration is Underprocess, please contact our team ${window.NGO.alert} or email ${window.NGO.email}. (Registration No: ${res.registrationNo})`;
    } else if (res.code === "DUPLICATE_CNIC") {
      regForm.hidden = true;
      formResult.hidden = false;
      formResult.classList.add("error");
      resultTitle.textContent = "Already Registered";
      resultText.textContent = "You are already a Registered Member. Please check your Certificate on the Verification Portal.";
    } else {
      formMsg.textContent = res.message || "Something went wrong. Please try again.";
      formMsg.classList.add("error");
    }
  }).catch(() => {
    setLoading(submitBtn, false);
    formMsg.textContent = "Network error. Please check your connection and try again.";
    formMsg.classList.add("error");
  });
});

document.getElementById("newRegBtn").addEventListener("click", () => {
  regForm.reset();
  regForm.hidden = false;
  formResult.hidden = true;
  formMsg.textContent = "";
});

/* ===================== CERTIFICATE VERIFICATION ===================== */
const verifyForm = document.getElementById("verifyForm");
const verifyMsg = document.getElementById("verifyMsg");
const certResult = document.getElementById("certResult");
const verifyBtn = document.getElementById("verifyBtn");

verifyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  doVerify();
});

function doVerify() {
  verifyMsg.textContent = "";
  verifyMsg.className = "form-msg";
  certResult.hidden = true;
  certResult.innerHTML = "";

  const cnic = document.getElementById("vCnic").value.trim();
  const dob = document.getElementById("vDob").value.trim();

  if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic) || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    verifyMsg.textContent = "Please enter a valid CNIC (00000-0000000-0) and DOB (dd-mm-yyyy).";
    verifyMsg.classList.add("error");
    return;
  }

  setLoading(verifyBtn, true, 'Verifying...');

  RHS.getMemberByCredentials(cnic, dob).then(res => {
    setLoading(verifyBtn, false);

    if (res.success && res.found && res.active) {
      renderCertificate(res.member);
    } else if (res.success && res.found && !res.active) {
      renderStatusMessage(res.message, res.member.status);
    } else {
      verifyMsg.textContent = res.message || "Record not found. Please check your CNIC and Date of Birth.";
      verifyMsg.classList.add("error");
    }
  }).catch(() => {
    setLoading(verifyBtn, false);
    verifyMsg.textContent = "Network error. Please check your connection and try again.";
    verifyMsg.classList.add("error");
  });
}

function renderCertificate(member) {
  certResult.hidden = false;
  certResult.innerHTML = `
    <div class="cert-card">
      <div class="cert-header">
        <h3><i class="fa-solid fa-certificate"></i> Digital Membership Certificate</h3>
        <span class="cert-badge">Active</span>
      </div>
      <div class="cert-grid">
        <div class="item"><span class="lbl">Full Name</span><span class="val">${member.fullName}</span></div>
        <div class="item"><span class="lbl">Registration No</span><span class="val">${member.registrationNo}</span></div>
        <div class="item"><span class="lbl">Membership Type</span><span class="val">${member.membershipType || "—"}</span></div>
        <div class="item"><span class="lbl">Designation</span><span class="val">${member.designation || "—"}</span></div>
        <div class="item"><span class="lbl">Gender</span><span class="val">${member.gender}</span></div>
        <div class="item"><span class="lbl">Mobile Number</span><span class="val">${member.mobile}</span></div>
        <div class="item" style="grid-column:1/-1"><span class="lbl">Full Address</span><span class="val">${member.address}</span></div>
        <div class="item"><span class="lbl">Valid Upto</span><span class="val">${member.validUpto || "—"}</span></div>
      </div>
      <div class="cert-actions">
        <button class="btn btn-primary" onclick="printCertificate(${JSON.stringify(member).replace(/"/g, '&quot;')})">
          Download / Print Certificate <i class="fa-solid fa-print"></i>
        </button>
      </div>
      <p class="cert-footnote">This is a computer-generated digital certificate. No signature is required.</p>
    </div>
  `;
}

function renderStatusMessage(message, status) {
  certResult.hidden = false;

  const greenStatuses = ["underprocess", "pending", "under process"];
  const redStatuses = ["expired", "banned", "rejected", "suspended", "blocked", "cancelled", "canceled"];

  const s = (status || "").toString().trim().toLowerCase();
  let vibe = "status-yellow";
  let icon = "fa-circle-exclamation";
  let title = "Status: " + (status || "Unknown");

  if (greenStatuses.includes(s)) {
    vibe = "status-green";
    icon = "fa-hourglass-half";
    title = "Registration Under Process";
  } else if (redStatuses.includes(s)) {
    vibe = "status-red";
    icon = "fa-circle-xmark";
    title = "Registration " + status;
  } else {
    vibe = "status-yellow";
    icon = "fa-triangle-exclamation";
    title = "Status: " + status;
  }

  certResult.innerHTML = `
    <div class="status-msg ${vibe}">
      <i class="fa-solid ${icon}"></i>
      <div class="status-title">${title}</div>
      <p>${message}</p>
      <p class="status-note">For any queries: 📞 ${window.NGO.alert} | 📧 ${window.NGO.email}</p>
    </div>
  `;
}

document.getElementById("verifyClearBtn").addEventListener("click", () => {
  // Clear form fields
  document.getElementById("vCnic").value = "";
  document.getElementById("vDob").value = "";
  // Clear results and messages
  certResult.hidden = true;
  certResult.innerHTML = "";
  verifyMsg.textContent = "";
  verifyMsg.className = "form-msg";
  // Show form again if hidden
  document.getElementById("verifyForm").style.display = "block";
});


document.getElementById("verifyDonationBtn").addEventListener("click", () => {
  const cnic = document.getElementById("vCnic").value.trim();
  const dob = document.getElementById("vDob").value.trim();

  if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic) || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    verifyMsg.textContent = "Please enter valid CNIC (00000-0000000-0) and DOB (dd-mm-yyyy) first.";
    verifyMsg.classList.add("error");
    return;
  }

  verifyMsg.textContent = "";
  verifyMsg.className = "form-msg";
  certResult.hidden = true;
  certResult.innerHTML = "";

  const btn = document.getElementById("verifyDonationBtn");
  setLoading(btn, true, 'Loading...');

  RHS.getCharityLedger(cnic, dob).then(res => {
    setLoading(btn, false);

    if (!res.success) {
      verifyMsg.textContent = res.message || "Record not found.";
      verifyMsg.classList.add("error");
      return;
    }

    // Hide search form
    document.getElementById("verifyForm").style.display = "none";

    const m = res.member;
    const donations = res.donations || [];
    let runningTotal = 0;

    let rows = "";
    if (donations.length === 0) {
      rows = `<tr><td colspan="4" style="text-align:center;padding:20px;color:#8A9A96">No charity records found.</td></tr>`;
    } else {
      donations.forEach((d, i) => {
        runningTotal += Number(d.amount) || 0;
        rows += `<tr style="background:${i%2===0?'#fff':'#F5F9F8'}">
          <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.date}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2">${d.paymentMethod||'—'}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;color:#2E9E5B;font-weight:600">Rs. ${Number(d.amount||0).toLocaleString()}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E7DFD2;font-weight:600">Rs. ${runningTotal.toLocaleString()}</td>
        </tr>`;
      });
    }

    certResult.hidden = false;
    certResult.innerHTML = `
      <div class="ledger-wrap">
        <!-- Header -->
        <div class="ledger-header">
          <img src="images/logo.png" alt="RHS" class="ledger-logo">
          <div>
            <h3>${window.NGO.name}</h3>
            <small>${window.NGO.address}</small>
          </div>
        </div>

        <div class="ledger-member-info">
          <div class="ledger-info-row">
            <span class="lbl">Member Name</span>
            <span class="val">${m.fullName}</span>
          </div>
          <div class="ledger-info-row">
            <span class="lbl">Registration No</span>
            <span class="val">${m.registrationNo}</span>
          </div>
          <div class="ledger-info-row">
            <span class="lbl">Membership Type</span>
            <span class="val">${m.membershipType||'—'}</span>
          </div>
          <div class="ledger-info-row">
            <span class="lbl">Address</span>
            <span class="val">${m.address}</span>
          </div>
          <div class="ledger-info-row">
            <span class="lbl">Valid Upto</span>
            <span class="val" style="color:#14534F;font-weight:700">${m.validUpto||'—'}</span>
          </div>
          <div class="ledger-info-row">
            <span class="lbl">Status</span>
            <span class="val"><span class="cert-badge">${m.status}</span></span>
          </div>
        </div>

        <!-- Table -->
        <div style="overflow-x:auto;margin-top:16px">
          <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
            <thead>
              <tr style="background:#14534F;color:#fff">
                <th style="padding:10px 14px;text-align:left">Date</th>
                <th style="padding:10px 14px;text-align:left">Payment Detail</th>
                <th style="padding:10px 14px;text-align:left">Amount Received</th>
                <th style="padding:10px 14px;text-align:left">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr style="background:#EEF8F1">
                <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F">Total Charity</td>
                <td colspan="2" style="padding:12px 14px;font-weight:700;color:#14534F;font-size:1.05rem">
                  Rs. ${runningTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p class="cert-footnote">This is a computer-generated ledger. ${window.NGO.name} | ${window.NGO.phone} | ${window.NGO.email}</p>

        <!-- Buttons -->
        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="downloadLedgerPDF()">
            <i class="fa-solid fa-file-pdf"></i> Download PDF
          </button>
          <button class="btn btn-ghost" onclick="closeLedger()">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>
      </div>
    `;
  }).catch(() => {
    setLoading(btn, false);
    verifyMsg.textContent = "Network error. Please try again.";
    verifyMsg.classList.add("error");
  });
});

function closeLedger() {
  certResult.hidden = true;
  certResult.innerHTML = "";
  document.getElementById("verifyForm").style.display = "block";
  verifyMsg.textContent = "";
}

function downloadLedgerPDF() {
  const content = document.querySelector(".ledger-wrap");
  if (!content) return;
  const printArea = document.getElementById("printCert");
  printArea.innerHTML = `
    <style>
      @page { margin: 12mm; size: A4; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    </style>
    <div style="font-family:Georgia,serif;max-width:680px;margin:0 auto">
      <div style="text-align:center;border-bottom:3px double #14534F;padding-bottom:14px;margin-bottom:18px">
        <h2 style="color:#14534F;margin-bottom:4px;font-size:1.4rem">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.12em;font-size:.8rem;margin-bottom:3px">CHARITY LEDGER — MEMBER STATEMENT</p>
        <p style="color:#8A9A96;font-size:.72rem">${window.NGO.address} · ${window.NGO.phone} · ${window.NGO.email}</p>
      </div>
      ${content.querySelector('.ledger-header').outerHTML}
      ${content.querySelector('.ledger-member-info').outerHTML}
      ${content.querySelector('div[style*="overflow-x"]').outerHTML}
      <div style="text-align:center;margin-top:20px;border-top:1px solid #E7DFD2;padding-top:12px">
        <p style="color:#8A9A96;font-size:.72rem;font-style:italic">
          ⚠️ This is a computer-generated statement. No signature required.
        </p>
      </div>
    </div>`;
  window.print();
  setTimeout(() => { printArea.innerHTML = ""; }, 2000);
}

/* Print certificate */
function printCertificate(member) {
  const printArea = document.getElementById("printCert");
  printArea.innerHTML = `
    <div style="border:6px double #14534F;padding:40px;text-align:center;font-family:Georgia,serif;">
      <h1 style="color:#14534F;margin-bottom:6px;">${window.NGO.name}</h1>
      <p style="letter-spacing:2px;color:#E8A33D;margin-bottom:24px;">DIGITAL MEMBERSHIP CERTIFICATE</p>
      <p style="font-size:22px;margin-bottom:6px;">This certifies that</p>
      <h2 style="margin-bottom:6px;">${member.fullName}</h2>
      <p style="margin-bottom:24px;">is a verified ${member.membershipType || "Member"} of ${window.NGO.name}, serving as ${member.designation || "Member"}.</p>
      <table style="margin:0 auto;text-align:left;font-size:15px;">
        <tr><td style="padding:4px 12px;font-weight:bold;">Registration No:</td><td>${member.registrationNo}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Gender:</td><td>${member.gender}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Mobile:</td><td>${member.mobile}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Address:</td><td>${member.address}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Valid Upto:</td><td>${member.validUpto || "—"}</td></tr>
      </table>
      <p style="margin-top:40px;color:#888;font-size:12px;">${window.NGO.address} — Verified Digitally</p>
      <p style="margin-top:8px;color:#aaa;font-size:11px;font-style:italic;">This is a computer-generated digital certificate. No signature is required.</p>
    </div>
  `;
  window.print();
}

/* ===================== TEAM ===================== */
function loadTeam() {
  const teamGrid = document.getElementById("teamGrid");
  RHS.getTeam().then(res => {
    if (!res.success || !res.team || !res.team.length) return;
    teamGrid.innerHTML = "";
    res.team.forEach(member => {
      const card = document.createElement("div");
      card.className = "team-card";
      card.innerHTML = `
        <div class="photo" style="background-image:url('${member.photo || ""}')"></div>
        <h4>${member.name}</h4>
        <div class="role">${member.designation}</div>
        <p class="bio">${member.bio || ""}</p>
      `;
      teamGrid.appendChild(card);
    });
  }).catch(() => {});
}
loadTeam();

/* ===================== CONTACT INFO ===================== */
function loadContact() {
  RHS.getContact().then(res => {
    if (!res.success) return;
    const c = res.contact;
    if (c["Address"]) {
      document.getElementById("officeAddress").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${c["Address"]}`;
    }
    document.querySelectorAll("[data-social]").forEach(a => {
      const key = a.dataset.social;
      if (c[key]) a.href = c[key];
    });
  }).catch(() => {});
}
loadContact();

/* ===================== ABOUT / CONTENT (editable via Google Sheet) ===================== */
function loadContent() {
  apiGet({ action: "getContent" }).then(res => {
    if (!res.success || !res.content) return;
    const c = res.content;

    // NGO Name & Tagline — Navbar
    if (c["OrgName"]) {
      const el = document.getElementById("siteOrgName");
      if (el) el.innerHTML = c["OrgName"].replace("Society", "<em>Society</em>");
    }
    if (c["OrgTagline"]) {
      const el = document.getElementById("siteOrgTagline");
      if (el) el.textContent = c["OrgTagline"];
    }

    // Hero Section
    if (c["HeroEyebrow"]) {
      const el = document.getElementById("heroEyebrow");
      if (el) el.textContent = c["HeroEyebrow"];
    }
    if (c["HeroHeading"]) {
      const el = document.getElementById("heroHeading");
      if (el) {
        const parts = c["HeroHeading"].split("rising hope");
        if (parts.length === 2) {
          el.innerHTML = parts[0] + '<span class="accent">rising hope.</span>' + parts[1];
        } else {
          el.textContent = c["HeroHeading"];
        }
      }
    }
    if (c["HeroText"]) {
      const el = document.getElementById("heroText");
      if (el) el.textContent = c["HeroText"];
    }

    // About Section
    if (c["AboutEyebrow"]) {
      const el = document.getElementById("aboutEyebrow");
      if (el) el.textContent = c["AboutEyebrow"];
    }
    if (c["AboutTitle"]) {
      const el = document.getElementById("aboutTitle");
      if (el) el.textContent = c["AboutTitle"];
    }
    if (c["AboutText"]) {
      const el = document.getElementById("aboutText");
      if (el) el.textContent = c["AboutText"];
    }

    // Green Card
    if (c["CardTitle"]) {
      const el = document.getElementById("aboutCardTitle");
      if (el) el.textContent = c["CardTitle"];
    }
    if (c["CardText"]) {
      const el = document.getElementById("aboutCardText");
      if (el) el.textContent = c["CardText"];
    }

    // Footer
    if (c["OrgName"]) {
      const el = document.getElementById("footerOrgName");
      if (el) el.innerHTML = c["OrgName"].replace("Society", "<em>Society</em>");
    }
    if (c["OrgTagline"]) {
      const el = document.getElementById("footerOrgTagline");
      if (el) el.textContent = c["OrgTagline"];
    }
    if (c["FooterCopyright"]) {
      const el = document.getElementById("footerCopyright");
      if (el) el.textContent = c["FooterCopyright"];
    }

    // Alert/Contact Number — sab messages mein use hoga
    if (c["AlertNumber"]) {
      window.RHS_ALERT_NUMBER = c["AlertNumber"];
    }

    // Contact info
    if (c["OrgAddress"]) {
      const el = document.getElementById("officeAddress");
      if (el) el.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${c["OrgAddress"]}`;
    }
    if (c["OrgPhone"]) {
      const el = document.querySelector(".phone");
      if (el) el.innerHTML = `<i class="fa-solid fa-phone"></i> ${c["OrgPhone"]}`;
    }

  }).catch(() => {});
}
loadContent();

/* ===================== CONTACT FORM ===================== */
const contactForm = document.getElementById("contactForm");
const contactMsg = document.getElementById("contactMsg");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  contactMsg.textContent = "";
  contactMsg.className = "form-msg";

  const name    = document.getElementById("cName").value.trim();
  const email   = document.getElementById("cEmail").value.trim();
  const message = document.getElementById("cMsg").value.trim();

  if (!name || !email || !message) {
    contactMsg.textContent = "⚠️ Please fill all fields.";
    contactMsg.classList.add("error");
    return;
  }

  const sendBtn = contactForm.querySelector("button[type='submit']");
  setLoading(sendBtn, true, "Sending...");

  const payload = {
    action: "contactMessage",
    name: name,
    email: email,
    message: message
  };

  RHS.submitContactMessage(payload).then(res => {
    setLoading(sendBtn, false);
    if (res.success) {
      contactMsg.textContent = "✅ Thank you! Your message has been sent.";
      contactMsg.classList.add("success");
      contactForm.reset();
    } else {
      contactMsg.textContent = res.message || "Something went wrong.";
      contactMsg.classList.add("error");
    }
  }).catch(() => {
    setLoading(sendBtn, false);
    contactMsg.textContent = "⚠️ Network error. Please try again later.";
    contactMsg.classList.add("error");
  });
});

/* ===================== MEMBER PORTAL ===================== */
function showMemberSection(which){
  if(which==="registration"){
    document.getElementById("registration").scrollIntoView({behavior:"smooth"});
    // Show registration form
    const regSection = document.getElementById("registration");
    if(regSection) regSection.classList.add("show");
    const formResult = document.getElementById("formResult");
    if(formResult) formResult.hidden = true;
    const formCard = document.getElementById("formCard");
    if(formCard){
      const form = document.getElementById("regForm");
      if(form) form.style.display = "block";
    }
  } else {
    document.getElementById("verify").scrollIntoView({behavior:"smooth"});
  }
}

/* ===================== PAGE LOADER ===================== */
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("pageLoader");
    if(loader) loader.classList.add("done");
  }, 1200);
});

/* ===================== ANIMATED COUNTER ===================== */
function animateCounter(el, target) {
  let start = 0;
  const duration = 1800;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start.toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 16);
}

/* ===================== NEWS SECTION ===================== */
function loadNews() {
  const grid = document.getElementById("newsGrid");
  if (!grid) return;
  apiGet({ action: "getNews" }).then(res => {
    if (!res.news || !res.news.length) {
      grid.innerHTML = `<div class="news-loading"><i class="fa-solid fa-newspaper" style="font-size:2rem;display:block;margin-bottom:8px"></i>No news yet. Check back soon!</div>`;
      return;
    }
    grid.innerHTML = res.news.map(n => `
      <article class="news-card">
        ${n.imageURL
          ? `<img src="${n.imageURL}" alt="${n.title}" class="news-card-img" loading="lazy" onerror="this.style.display='none'">`
          : `<div class="news-card-img"><i class="fa-solid fa-newspaper"></i></div>`}
        <div class="news-card-body">
          <span class="news-tag">${n.category}</span>
          <div class="news-card-date"><i class="fa-regular fa-calendar"></i> ${n.date}</div>
          <h3 class="news-card-title">${n.title}</h3>
          <p class="news-card-text">${n.body}</p>
        </div>
      </article>
    `).join("");
  }).catch(() => {
    grid.innerHTML = `<div class="news-loading">Could not load news. Please try again.</div>`;
  });
}

/* ===================== IMPACT STORIES ===================== */
function loadStories() {
  const grid = document.getElementById("storiesGrid");
  if (!grid) return;
  apiGet({ action: "getStories" }).then(res => {
    if (!res.stories || !res.stories.length) {
      grid.innerHTML = `<div class="news-loading"><i class="fa-solid fa-heart" style="font-size:2rem;display:block;margin-bottom:8px;color:var(--coral)"></i>Stories coming soon. Your support changes lives!</div>`;
      return;
    }
    grid.innerHTML = res.stories.map(s => `
      <article class="story-card">
        <span class="story-badge">${s.helpType || "Community"}</span>
        ${s.photoURL
          ? `<img src="${s.photoURL}" alt="${s.name}" class="story-card-img" loading="lazy" onerror="this.parentNode.querySelector('.story-card-img').classList.add('placeholder');this.remove()">`
          : `<div class="story-card-img placeholder">🤲</div>`}
        <div class="story-card-body">
          <div class="story-card-name">${s.name}</div>
          <div class="story-card-location"><i class="fa-solid fa-location-dot"></i> ${s.location || "Khairpur Tamewali"}</div>
          <p class="story-card-text">${s.story}</p>
        </div>
      </article>
    `).join("");
  }).catch(() => {
    grid.innerHTML = `<div class="news-loading">Could not load stories.</div>`;
  });
}

/* ===================== URDU LANGUAGE TOGGLE ===================== */
const urduTranslations = {
  // Nav
  "Home": "ہوم",
  "Members": "رکنیت",
  "Charity Help": "امداد",
  "News": "خبریں",
  "Stories": "کہانیاں",
  "Our Team": "ہماری ٹیم",
  "Contact": "رابطہ",
  // Hero
  "Join Us": "شامل ہوں",
  "Get Help": "مدد حاصل کریں",
  // Sections
  "News & Announcements": "خبریں اور اعلانات",
  "Impact Stories": "کامیابی کی کہانیاں",
};

let isUrdu = false;
function toggleLang() {
  isUrdu = !isUrdu;
  const label = document.getElementById("langLabel");
  const html = document.getElementById("htmlRoot");
  if (isUrdu) {
    label.textContent = "English";
    html.setAttribute("lang", "ur");
    html.setAttribute("dir", "rtl");
    document.querySelectorAll("[data-ur]").forEach(el => {
      el._origText = el.textContent;
      el.textContent = el.getAttribute("data-ur");
    });
  } else {
    label.textContent = "اردو";
    html.setAttribute("lang", "en");
    html.removeAttribute("dir");
    document.querySelectorAll("[data-ur]").forEach(el => {
      if(el._origText) el.textContent = el._origText;
    });
  }
}

// Init on load
loadNews();
loadStories();
document.getElementById("year").textContent = new Date().getFullYear();

/* ===================== SHOW/HIDE REGISTRATION FORM ===================== */
const registrationSection = document.getElementById("registration");

function openRegistration() {
  registrationSection.classList.add("show");
  registrationSection.scrollIntoView({ behavior: "smooth" });
}

function closeRegistration() {
  registrationSection.classList.remove("show");
  document.getElementById("home").scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll('a[href="#registration"]').forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    openRegistration();
  });
});

document.getElementById("backBtn1").addEventListener("click", closeRegistration);
document.getElementById("backBtn2").addEventListener("click", closeRegistration);

/* ===================== CHARITY HELP DESK ===================== */
function showHelpSection(which) {
  document.getElementById("helpdeskBtns").style.display = "none";
  document.getElementById("grantFormWrap").style.display = "none";
  document.getElementById("grantStatusWrap").style.display = "none";
  if (which === "grantForm") {
    document.getElementById("grantFormWrap").style.display = "block";
  } else {
    document.getElementById("grantStatusWrap").style.display = "block";
  }
  document.getElementById("charityDesk").scrollIntoView({ behavior: "smooth" });
}

function hideHelpSection() {
  // Reset all forms
  ['grantForm','grantStatusForm'].forEach(resetForm);
  // Show main buttons
  document.getElementById("helpdeskBtns").style.display = "flex";
  // Hide all sections
  document.getElementById("grantFormWrap").style.display = "none";
  document.getElementById("grantStatusWrap").style.display = "none";
  // Reset grant form
  const grantForm = document.getElementById("grantForm");
  if (grantForm) grantForm.style.display = "block";
  const grantResult = document.getElementById("grantResult");
  if (grantResult) { grantResult.hidden = true; }
  const grantResultText = document.getElementById("grantResultText");
  if (grantResultText) grantResultText.innerHTML = "";
  const grantMsg = document.getElementById("grantMsg");
  if (grantMsg) { grantMsg.textContent = ""; grantMsg.className = "form-msg"; }
  // Reset status portal
  const grantStatusResult = document.getElementById("grantStatusResult");
  if (grantStatusResult) grantStatusResult.innerHTML = "";
  const gsMsg = document.getElementById("gsMsg");
  if (gsMsg) { gsMsg.textContent = ""; gsMsg.className = "form-msg"; }
  // Scroll to section
  document.getElementById("charityDesk").scrollIntoView({ behavior: "smooth" });
}

/* CNIC/DOB auto format for grant form */
document.querySelectorAll('#gCnic, #gsCnic').forEach(el => {
  el.addEventListener("input", () => {
    let v = el.value.replace(/\D/g, "").slice(0, 13);
    if (v.length > 5 && v.length <= 12) v = v.slice(0,5) + "-" + v.slice(5);
    else if (v.length > 12) v = v.slice(0,5) + "-" + v.slice(5,12) + "-" + v.slice(12);
    el.value = v;
  });
});
document.querySelectorAll('#gDob, #gsDob').forEach(el => {
  el.addEventListener("input", () => {
    let v = el.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 2 && v.length <= 4) v = v.slice(0,2) + "-" + v.slice(2);
    else if (v.length > 4) v = v.slice(0,2) + "-" + v.slice(2,4) + "-" + v.slice(4);
    el.value = v;
  });
});
document.getElementById("gMobile").addEventListener("input", function() {
  let v = this.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 4) v = v.slice(0,4) + "-" + v.slice(4);
  this.value = v;
});

/* GRANT REQUEST FORM SUBMIT */
const grantForm = document.getElementById("grantForm");
const grantMsg = document.getElementById("grantMsg");
const grantResult = document.getElementById("grantResult");
const grantSubmitBtn = document.getElementById("grantSubmitBtn");

grantForm.addEventListener("submit", (e) => {
  e.preventDefault();
  grantMsg.textContent = "";
  grantMsg.className = "form-msg";

  const cnic = document.getElementById("gCnic").value.trim();
  const dob = document.getElementById("gDob").value.trim();
  const name = document.getElementById("gName").value.trim();
  const father = document.getElementById("gFather").value.trim();
  const gender = document.getElementById("gGender").value;
  const mobile = document.getElementById("gMobile").value.trim();
  const helpType = document.getElementById("gHelpType").value;
  const amount = document.getElementById("gAmount").value;
  const address = document.getElementById("gAddress").value.trim();

  if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
    grantMsg.textContent = "Please enter a valid CNIC in format 00000-0000000-0.";
    grantMsg.classList.add("error");
    return;
  }
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    grantMsg.textContent = "Please enter Date of Birth in format dd-mm-yyyy.";
    grantMsg.classList.add("error");
    return;
  }
  if (!name || !father || !gender || !mobile || !helpType || !amount || !address) {
    grantMsg.textContent = "Please fill all required fields.";
    grantMsg.classList.add("error");
    return;
  }

  setLoading(grantSubmitBtn, true, 'Submitting...');

  const payload = {
    action: "submitGrant",
    cnic, dob, name, fatherName: father, gender,
    email: document.getElementById("gEmail").value.trim(),
    mobile, helpType, amountRequired: Number(amount), address
  };

  RHS.submitContactMessage(payload).then(res => {
    setLoading(grantSubmitBtn, false);
    if (res.success) {
      grantForm.style.display = "none";
      grantResult.hidden = false;
      const crn = res.crn || "";
      const msg = res.message || "";
      const highlighted = msg.replace(crn, `<span class="crn-highlight">${crn}</span>`);
      document.getElementById("grantResultText").innerHTML = highlighted;
    } else if (res.code === "DUPLICATE_CASE") {
      // Duplicate case — show warning with CRN highlighted
      grantForm.style.display = "none";
      grantResult.hidden = false;
      const crn = res.crn || "";
      const msg = res.message || "";
      const highlighted = msg.replace(crn, `<span class="crn-highlight">${crn}</span>`);
      document.getElementById("grantResultText").innerHTML = `
        <div style="background:#FEF8E9;border:1px solid #F2DFA8;border-radius:12px;padding:16px 20px;margin-bottom:8px">
          <i class="fa-solid fa-triangle-exclamation" style="color:#E8A33D;font-size:1.5rem;margin-bottom:8px;display:block"></i>
          <p style="color:#8A6A1F;font-weight:600;margin-bottom:6px">Case Already Registered!</p>
          <p style="color:#4A5C58">${highlighted}</p>
        </div>`;
      // Change icon to warning
      grantResult.querySelector("i.fa-circle-check").className = "fa-solid fa-triangle-exclamation";
      grantResult.querySelector("i.fa-triangle-exclamation").style.color = "#E8A33D";
      grantResult.querySelector("h3").textContent = "Already Registered!";
      grantResult.querySelector("h3").style.color = "#8A6A1F";
    } else {
      grantMsg.textContent = res.message || "Something went wrong.";
      grantMsg.classList.add("error");
    }
  }).catch(() => {
    setLoading(grantSubmitBtn, false);
    grantMsg.textContent = "Network error. Please check your connection.";
    grantMsg.classList.add("error");
  });
});

/* GRANT STATUS CHECK */
const grantStatusForm = document.getElementById("grantStatusForm");
const gsMsg = document.getElementById("gsMsg");
const grantStatusResult = document.getElementById("grantStatusResult");

// Clear button — clear fields + result + message
grantStatusForm.addEventListener("reset", () => {
  setTimeout(() => {
    gsMsg.textContent = "";
    gsMsg.className = "form-msg";
    grantStatusResult.innerHTML = "";
  }, 0);
});

// Grant form clear button also clears result
const grantFormClearBtn = document.querySelector("#grantFormWrap button[type='reset']");
if(grantFormClearBtn){
  grantFormClearBtn.addEventListener("click", () => {
    document.getElementById("grantMsg").textContent = "";
    document.getElementById("grantMsg").className = "form-msg";
  });
}

grantStatusForm.addEventListener("submit", (e) => {
  e.preventDefault();
  gsMsg.textContent = "";
  gsMsg.className = "form-msg";
  grantStatusResult.innerHTML = "";

  const cnic = document.getElementById("gsCnic").value.trim();
  const dob = document.getElementById("gsDob").value.trim();

  if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic) || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    gsMsg.textContent = "Please enter valid CNIC and Date of Birth.";
    gsMsg.classList.add("error");
    return;
  }

  const gsBtn = grantStatusForm.querySelector('[type="submit"]');
  setLoading(gsBtn, true, 'Checking...');
  gsMsg.textContent = "";
  RHS.getGrantStatus(cnic, dob).then(res => {
    setLoading(gsBtn, false);
    gsMsg.textContent = "";
    if (!res.success || !res.grants || !res.grants.length) {
      grantStatusResult.innerHTML = `<div class="status-msg status-red">
        <i class="fa-solid fa-circle-xmark"></i>
        <div class="status-title">No Request Found</div>
        <p>${res.message || "No grant request found. Please check your CNIC and Date of Birth."}</p>
      </div>`;
      return;
    }
    let html = "";

    // Priority: active cases first, closed cases only if no active case
    const activeCases = res.grants.filter(g => (g.status||"").toLowerCase() !== "closed");
    const closedCases = res.grants.filter(g => (g.status||"").toLowerCase() === "closed");
    const displayGrants = activeCases.length > 0 ? activeCases : closedCases;

    displayGrants.forEach(g => {
      let msg = "", vibe = "status-yellow", icon = "fa-hourglass-half";
      const s = (g.status || "").toLowerCase();
      const d = (g.decision || "").toLowerCase();

      // 1 — New Tab
      if (s === "new") {
        msg = `Dear <strong>${g.name}</strong>, Your Charity Request No <strong>${g.crn}</strong> has been received. Our team will contact you soon and visit you physically. For queries: ${window.NGO.alert} | ${window.NGO.email}`;
        vibe = "status-yellow"; icon = "fa-hourglass-half";

      // 2 — Assigned Tab
      } else if (s === "assigned") {
        msg = `Dear <strong>${g.name}</strong>, Your Case <strong>${g.crn}</strong> has been assigned to our team member <strong>${g.assignedTo}</strong> ${g.assignedContact}. Please cooperate for Physical Verification. Contact: ${window.NGO.alert} | ${window.NGO.email}`;
        vibe = "status-green"; icon = "fa-user-check";

      // 3 — Case Completed Tab
      } else if (s === "completed") {
        msg = `Dear <strong>${g.name}</strong>, Your Case <strong>${g.crn}</strong> Verification Completed. Please wait for decision. For queries: ${window.NGO.alert} | ${window.NGO.email}`;
        vibe = "status-yellow"; icon = "fa-clipboard-check";

      // 4 — Approved Tab
      } else if (d === "approved" && s !== "closed") {
        msg = `Dear <strong>${g.name}</strong>, Congratulations! Your Case <strong>${g.crn}</strong> Approved. Our team will contact you with your need at your door step. Contact: ${window.NGO.alert} | ${window.NGO.email}`;
        vibe = "status-green"; icon = "fa-circle-check";

      // 5 — Rejected Tab
      } else if (d === "rejected" && s !== "closed") {
        msg = `Dear <strong>${g.name}</strong>, Your Case <strong>${g.crn}</strong> Rejected. Please meet our President before case close. Contact: ${window.NGO.alert} | ${window.NGO.email}`;
        vibe = "status-red"; icon = "fa-circle-xmark";

      // Closed — Approved then Closed (Successfully Granted)
      } else if (s === "closed" && (d === "closed" || d === "approved")) {
        msg = `Dear <strong>${g.name}</strong>, Your Case <strong>${g.crn}</strong> has been Successfully Closed. Your grant has been processed and delivered. Jazak Allah Khair! 🤲 — ${window.NGO.name} | ${window.NGO.alert}`;
        vibe = "status-green"; icon = "fa-lock";

      // Closed — Rejected then Closed
      } else if (s === "closed" && d === "rejected") {
        msg = `Dear <strong>${g.name}</strong>, Your Case <strong>${g.crn}</strong> has been Closed after Rejection. Please physically meet our President with Case No <strong>${g.crn}</strong>. Contact: ${window.NGO.alert} | ${window.NGO.email}`;
        vibe = "status-red"; icon = "fa-lock";

      // Fallback
      } else {
        msg = `Dear <strong>${g.name}</strong>, Your Case <strong>${g.crn}</strong> is currently under process. Please wait for updates. For queries: ${window.NGO.alert} | ${window.NGO.email}`;
        vibe = "status-yellow"; icon = "fa-hourglass-half";
      }

      html += `<div class="status-msg ${vibe}" style="margin-bottom:16px">
        <i class="fa-solid ${icon}"></i>
        <div class="status-title">${g.crn} — ${g.helpType}</div>
        <p>${msg}</p>
        <p class="status-note">Applied: ${g.timestamp} &bull; Amount Requested: Rs. ${Number(g.amount||0).toLocaleString()}</p>
      </div>`;
    });
    grantStatusResult.innerHTML = html;
  }).catch(() => {
    setLoading(gsBtn, false);
    gsMsg.textContent = "Network error. Please try again.";
    gsMsg.classList.add("error");
  });
});

/* ===================== PHOTO UPLOAD PREVIEW ===================== */
function previewRegPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById("regPhotoPreview");
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Photo Preview">`;
  };
  reader.readAsDataURL(file);
}
