// ============================================================
// RHS Firebase Database Layer
// Replaces all Google Sheets / Apps Script calls
// ============================================================

const CLOUDINARY_CLOUD = "dt9yspaw7";
const CLOUDINARY_PRESET = "rhs-upload";

// Wait for Firebase to be ready
function waitForFB() {
  return new Promise(resolve => {
    if (window.__fbReady) return resolve();
    window.addEventListener('firebaseReady', resolve, { once: true });
  });
}

function db() { return window.__db; }
function fs() { return window.__fs; }
function auth() { return window.__auth; }

// ============================================================
// CLOUDINARY — Image Upload
// ============================================================
async function uploadImage(file, folder = "rhs/members") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  fd.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST", body: fd
  });
  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  throw new Error(data.error?.message || "Image upload failed");
}

function imgUrl(url, size = 300) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/w_${size},h_${size},c_fill,q_auto,f_auto/${url}`;
}

// ============================================================
// NGO SETTINGS
// ============================================================
async function getNGOSettings() {
  await waitForFB();
  const snap = await fs().getDoc(fs().doc(db(), "settings", "ngo"));
  if (snap.exists()) return snap.data();
  return {
    ngoName: "Rising Hope Society",
    ngoPhone: "0308-8919628",
    ngoAddress: "Khairpur Tamewali, Bahawalpur, Punjab, Pakistan",
    ngoEmail: "risinghopesociety@gmail.com",
    bankAccount: "111111111111111",
    alertNumber: "0308-8919628",
    logoUrl: "",
    copyrightText: "Rising Hope Society — Khairpur Tamewali, Bahawalpur. All rights reserved.",
    ourTeamTitle: "Our Team",
    ourTeamMatter: "The volunteers and coordinators who keep Rising Hope Society moving forward."
  };
}

async function saveNGOSettings(data) {
  await waitForFB();
  await fs().updateDoc(fs().doc(db(), "settings", "ngo"), data);
}

// ============================================================
// STATISTICS
// ============================================================
async function getStatistics() {
  await waitForFB();
  const snap = await fs().getDoc(fs().doc(db(), "settings", "statistics"));
  if (snap.exists()) return { success: true, ...snap.data() };
  return { success: true, members: 0, families: 0, projects: 0, volunteers: 0 };
}

// ============================================================
// TEAM
// ============================================================
async function getTeam() {
  await waitForFB();
  const q = fs().query(fs().collection(db(), "team"), fs().orderBy("order", "asc"));
  const snaps = await fs().getDocs(q);
  const team = [];
  snaps.forEach(d => team.push({ id: d.id, ...d.data() }));
  return { success: true, team };
}

async function addTeamMember(data) {
  await waitForFB();
  const ref = await fs().addDoc(fs().collection(db(), "team"), {
    ...data,
    createdAt: fs().serverTimestamp()
  });
  return { success: true, id: ref.id };
}

async function updateTeamMember(id, data) {
  await waitForFB();
  await fs().updateDoc(fs().doc(db(), "team", id), data);
  return { success: true };
}

async function deleteTeamMember(id) {
  await waitForFB();
  await fs().deleteDoc(fs().doc(db(), "team", id));
  return { success: true };
}

// ============================================================
// CONTACT
// ============================================================
async function getContact() {
  await waitForFB();
  const snap = await fs().getDoc(fs().doc(db(), "settings", "contact"));
  if (snap.exists()) return { success: true, ...snap.data() };
  return { success: true, facebook: "", instagram: "", whatsapp: "", youtube: "" };
}

async function saveContact(data) {
  await waitForFB();
  await fs().updateDoc(fs().doc(db(), "settings", "contact"), data);
  return { success: true };
}

async function submitContactMessage(data) {
  await waitForFB();
  await fs().addDoc(fs().collection(db(), "contactMessages"), {
    ...data,
    createdAt: fs().serverTimestamp(),
    read: false
  });
  return { success: true, message: "Message sent successfully!" };
}

async function getContactMessages() {
  await waitForFB();
  const q = fs().query(fs().collection(db(), "contactMessages"), fs().orderBy("createdAt", "desc"));
  const snaps = await fs().getDocs(q);
  const msgs = [];
  snaps.forEach(d => msgs.push({ id: d.id, ...d.data() }));
  return { success: true, messages: msgs };
}

// ============================================================
// CONTENT (Sliders, About etc)
// ============================================================
async function getContent() {
  await waitForFB();
  const snap = await fs().getDoc(fs().doc(db(), "settings", "content"));
  if (snap.exists()) return { success: true, ...snap.data() };
  return { success: true };
}

async function saveContent(data) {
  await waitForFB();
  await fs().updateDoc(fs().doc(db(), "settings", "content"), data);
  return { success: true };
}

// ============================================================
// MEMBERS
// ============================================================
function generateCNIC(cnic) {
  const d = (cnic || "").replace(/\D/g, "");
  if (d.length !== 13) return (cnic || "").trim();
  return d.slice(0, 5) + "-" + d.slice(5, 12) + "-" + d.slice(12);
}

function today() {
  const d = new Date();
  return ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear();
}

function addMonthToDate(ds) {
  const p = (ds || "").split("-");
  if (p.length !== 3) return ds;
  const dt = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
  dt.setMonth(dt.getMonth() + 1);
  return ("0" + dt.getDate()).slice(-2) + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + dt.getFullYear();
}

async function generateRegNo() {
  await waitForFB();
  const year = new Date().getFullYear();
  const month = ("0" + (new Date().getMonth() + 1)).slice(-2);
  const q = fs().query(
    fs().collection(db(), "members"),
    fs().where("registrationNo", ">=", `RHS-${year}-${month}-`),
    fs().orderBy("registrationNo", "desc"),
    fs().limit(1)
  );
  const snaps = await fs().getDocs(q);
  let seq = 1;
  if (!snaps.empty) {
    const last = snaps.docs[0].data().registrationNo;
    const parts = last.split("-");
    seq = parseInt(parts[parts.length - 1]) + 1;
  }
  return `RHS-${year}-${month}-${("0" + seq).slice(-2)}`;
}

async function registerMember(data) {
  await waitForFB();
  const cnic = generateCNIC(data.cnic);

  // Check duplicate CNIC
  const q = fs().query(fs().collection(db(), "members"), fs().where("cnic", "==", cnic));
  const existing = await fs().getDocs(q);
  if (!existing.empty) {
    const m = existing.docs[0].data();
    const settings = await getNGOSettings();
    return {
      success: false,
      code: "DUPLICATE",
      message: `Dear ${data.fullName}, You are already registered as ${m.registrationNo}. Contact: ${settings.alertNumber} | ${settings.ngoEmail}`
    };
  }

  const regNo = await generateRegNo();
  const now = today();

  const memberData = {
    cnic,
    dob: data.dob || "",
    registrationNo: regNo,
    fullName: data.fullName || "",
    fatherName: data.fatherName || "",
    gender: data.gender || "",
    profession: data.profession || "",
    email: data.email || "",
    mobile: data.mobile || "",
    province: data.province || "Punjab",
    address: data.address || "",
    membershipType: data.membershipType || "General",
    designation: data.designation || "",
    status: "Underprocess",
    photo: data.photo || "",
    adminComments: "",
    timestamp: now,
    validUpto: "",
    createdAt: fs().serverTimestamp()
  };

  const ref = await fs().addDoc(fs().collection(db(), "members"), memberData);
  const settings = await getNGOSettings();

  return {
    success: true,
    registrationNo: regNo,
    fullName: data.fullName,
    message: `Dear ${data.fullName}, Your Registration Successfully Submitted. Registration is Underprocess. Contact: ${settings.alertNumber} | ${settings.ngoEmail}. (Reg No: ${regNo})`
  };
}

async function getMembers(filter = "all") {
  await waitForFB();
  let q;
  if (filter === "pending") {
    q = fs().query(fs().collection(db(), "members"), fs().where("status", "==", "Underprocess"));
  } else if (filter === "active") {
    q = fs().query(fs().collection(db(), "members"), fs().where("status", "==", "Active"));
  } else if (filter === "expired") {
    q = fs().query(fs().collection(db(), "members"), fs().where("status", "==", "Expired"));
  } else if (filter === "banned") {
    q = fs().query(fs().collection(db(), "members"), fs().where("status", "==", "Banned"));
  } else {
    q = fs().query(fs().collection(db(), "members"), fs().orderBy("createdAt", "desc"));
  }
  const snaps = await fs().getDocs(q);
  const members = [];
  snaps.forEach(d => members.push({ id: d.id, ...d.data() }));
  return { success: true, members };
}

async function getMemberByCredentials(cnic, dob) {
  await waitForFB();
  const cnicF = generateCNIC(cnic);
  const q = fs().query(
    fs().collection(db(), "members"),
    fs().where("cnic", "==", cnicF),
    fs().where("dob", "==", dob)
  );
  const snaps = await fs().getDocs(q);
  if (snaps.empty) return { success: false, message: "No member found with these credentials." };
  const data = { id: snaps.docs[0].id, ...snaps.docs[0].data() };
  return { success: true, found: true, active: data.status === "Active", member: data };
}

async function updateMemberStatus(id, status) {
  await waitForFB();
  const updates = { status };
  if (status === "Active") {
    updates.validUpto = addMonthToDate(today());
  }
  await fs().updateDoc(fs().doc(db(), "members", id), updates);
  return { success: true };
}

async function searchMembers(q) {
  await waitForFB();
  const snaps = await fs().getDocs(fs().collection(db(), "members"));
  const members = [];
  const ql = q.toLowerCase();
  snaps.forEach(d => {
    const m = { id: d.id, ...d.data() };
    if (
      (m.fullName || "").toLowerCase().includes(ql) ||
      (m.cnic || "").includes(q) ||
      (m.mobile || "").includes(q) ||
      (m.registrationNo || "").toLowerCase().includes(ql)
    ) members.push(m);
  });
  return { success: true, members };
}

// ============================================================
// CHARITY DONATIONS
// ============================================================
async function addCharityEntry(data) {
  await waitForFB();
  const ref = await fs().addDoc(fs().collection(db(), "charityDonations"), {
    ...data,
    createdAt: fs().serverTimestamp()
  });

  // Update member validUpto
  if (data.memberId) {
    const validUpto = addMonthToDate(data.date || today());
    await fs().updateDoc(fs().doc(db(), "members", data.memberId), { validUpto });
    data.validUpto = validUpto;
  }

  // Add to cashbook
  await addCashEntry({
    type: "Inflow",
    date: data.date || today(),
    source: `Charity — ${data.memberName} (${data.cnic})`,
    amount: Number(data.amount) || 0,
    note: data.paymentMethod || ""
  });

  return { success: true, id: ref.id, validUpto: data.validUpto || "" };
}

async function getCharityLedger(cnic, dob) {
  await waitForFB();
  const cnicF = generateCNIC(cnic);
  const memberQ = fs().query(
    fs().collection(db(), "members"),
    fs().where("cnic", "==", cnicF),
    fs().where("dob", "==", dob)
  );
  const memberSnaps = await fs().getDocs(memberQ);
  if (memberSnaps.empty) return { success: false, message: "No member found with these credentials." };
  const member = { id: memberSnaps.docs[0].id, ...memberSnaps.docs[0].data() };
  // No orderBy — avoids composite index error
  const donQ = fs().query(fs().collection(db(), "charityDonations"), fs().where("cnic", "==", cnicF));
  const donSnaps = await fs().getDocs(donQ);
  const donations = [];
  donSnaps.forEach(d => donations.push({ id: d.id, ...d.data() }));
  // Sort by date in JS (dd-mm-yyyy)
  const parseDate = s => { if(!s) return 0; const p=s.split("-"); return p.length===3 ? new Date(+p[2],+p[1]-1,+p[0]).getTime() : 0; };
  donations.sort((a,b) => parseDate(a.date) - parseDate(b.date));
  let total = 0;
  const donationsWithTotal = donations.map(d => { total += Number(d.amount)||0; return { ...d, runningTotal: total }; });
  return { success: true, member, donations: donationsWithTotal, total };
}

async function getAllCharity() {
  await waitForFB();
  const q = fs().query(fs().collection(db(), "charityDonations"), fs().orderBy("createdAt", "desc"));
  const snaps = await fs().getDocs(q);
  const donations = [];
  let total = 0;
  snaps.forEach(d => {
    const dd = d.data();
    total += Number(dd.amount) || 0;
    donations.push({ id: d.id, ...dd });
  });
  return { success: true, donations, total };
}

// ============================================================
// GRANT REQUESTS
// ============================================================
async function generateCRN() {
  await waitForFB();
  const year = new Date().getFullYear();
  const month = ("0" + (new Date().getMonth() + 1)).slice(-2);
  const prefix = `CRN-${year}-${month}-`;
  const q = fs().query(
    fs().collection(db(), "grantRequests"),
    fs().where("crn", ">=", prefix),
    fs().orderBy("crn", "desc"),
    fs().limit(1)
  );
  const snaps = await fs().getDocs(q);
  let seq = 1;
  if (!snaps.empty) {
    const last = snaps.docs[0].data().crn;
    const parts = last.split("-");
    seq = parseInt(parts[parts.length - 1]) + 1;
  }
  return `${prefix}${("0" + seq).slice(-2)}`;
}

async function submitGrant(data) {
  await waitForFB();
  const cnic = generateCNIC(data.cnic);

  // Check duplicate active case
  const q = fs().query(
    fs().collection(db(), "grantRequests"),
    fs().where("cnic", "==", cnic)
  );
  const existing = await fs().getDocs(q);
  let activeCase = null;
  existing.forEach(d => {
    const dd = d.data();
    const st = (dd.status || "").toLowerCase();
    const dec = (dd.decision || "").toLowerCase();
    // Allow re-apply if case is closed OR rejected
    if (st !== "closed" && dec !== "rejected") activeCase = dd;
  });

  if (activeCase) {
    const s = await getNGOSettings();
    return {
      success: false,
      code: "DUPLICATE_CASE",
      crn: activeCase.crn,
      message: `Dear ${data.name}, Your Case is already registered as ${activeCase.crn}. Contact: ${s.alertNumber} | ${s.ngoEmail}`
    };
  }

  const crn = await generateCRN();
  const ref = await fs().addDoc(fs().collection(db(), "grantRequests"), {
    crn,
    cnic,
    dob: data.dob || "",
    name: data.name || "",
    fatherName: data.fatherName || "",
    gender: data.gender || "",
    email: data.email || "",
    mobile: data.mobile || "",
    address: data.address || "",
    helpType: data.helpType || "",
    amountRequired: Number(data.amountRequired) || 0,
    status: "New",
    decision: "",
    decisionNote: "",
    assignedTo: "",
    assignedContact: "",
    verificationStatus: "",
    timestamp: today(),
    updatedAt: today(),
    createdAt: fs().serverTimestamp()
  });

  return {
    success: true, crn,
    message: `Dear ${data.name}, Your Charity Request No ${crn} has been received. Our team will contact you soon.`
  };
}

// Check if an active (non-closed) grant exists for a CNIC — no DOB needed
async function checkGrantByCnic(cnic) {
  await waitForFB();
  const cnicF = generateCNIC(cnic);
  const q = fs().query(
    fs().collection(db(), "grantRequests"),
    fs().where("cnic", "==", cnicF)
  );
  const snaps = await fs().getDocs(q);
  if (snaps.empty) return { found: false };
  const grants = [];
  snaps.forEach(d => grants.push({ id: d.id, ...d.data() }));
  const active = grants.filter(g => (g.status || "").toLowerCase() !== "closed");
  if (!active.length) return { found: false };
  return { found: true, grant: active[0] };
}

async function getGrantStatus(cnic, dob) {
  await waitForFB();
  const cnicF = generateCNIC(cnic);
  const q = fs().query(
    fs().collection(db(), "grantRequests"),
    fs().where("cnic", "==", cnicF),
    fs().where("dob", "==", dob)
  );
  const snaps = await fs().getDocs(q);
  if (snaps.empty) return { success: false, message: "No grant request found." };
  const grants = [];
  snaps.forEach(d => grants.push({ id: d.id, ...d.data() }));

  // Show active case first, closed last
  const active = grants.filter(g => (g.status || "").toLowerCase() !== "closed");
  const closed = grants.filter(g => (g.status || "").toLowerCase() === "closed");
  return { success: true, grants: active.length ? active : closed };
}

async function getGrants(filter = "all") {
  await waitForFB();
  let q;
  const col = fs().collection(db(), "grantRequests");
  if (filter === "new") q = fs().query(col, fs().where("status", "==", "New"));
  else if (filter === "assigned") q = fs().query(col, fs().where("status", "==", "Assigned"));
  else if (filter === "completed") q = fs().query(col, fs().where("status", "==", "Completed"));
  else if (filter === "approved") q = fs().query(col, fs().where("decision", "==", "Approved"));
  else if (filter === "rejected") q = fs().query(col, fs().where("decision", "==", "Rejected"));
  else if (filter === "closed") q = fs().query(col, fs().where("status", "==", "Closed"));
  else q = fs().query(col, fs().orderBy("createdAt", "desc"));

  const snaps = await fs().getDocs(q);
  let grants = [];
  snaps.forEach(d => grants.push({ id: d.id, ...d.data() }));

  // FIX: Completed filter mein sirf woh cases jo status=Completed hain aur decision nahi (Approved/Rejected nahi)
  if (filter === "completed") {
    grants = grants.filter(g => {
      const dec = (g.decision || "").toLowerCase();
      return dec !== "approved" && dec !== "rejected";
    });
  }
  // FIX: Approved filter mein closed cases nahi aane chahiye
  if (filter === "approved") {
    grants = grants.filter(g => (g.status || "").toLowerCase() !== "closed");
  }

  return { success: true, grants };
}

async function updateGrant(id, updates) {
  await waitForFB();
  await fs().updateDoc(fs().doc(db(), "grantRequests", id), {
    ...updates,
    updatedAt: today()
  });
  return { success: true };
}

// ============================================================
// CASE EXPENSES
// ============================================================
async function addCaseExpense(data) {
  await waitForFB();
  const ref = await fs().addDoc(fs().collection(db(), "caseExpenses"), {
    ...data,
    createdAt: fs().serverTimestamp()
  });

  // Debit cashbook
  await addCashEntry({
    type: "Outflow",
    date: data.date || today(),
    source: `${data.crn} | ${data.name} | ${data.detail}`,
    amount: Number(data.amount) || 0,
    note: `Case Expense — ${data.helpType || ""}`
  });

  return { success: true, id: ref.id };
}

async function getCaseExpenses(crn) {
  await waitForFB();
  const q = fs().query(fs().collection(db(), "caseExpenses"), fs().where("crn", "==", crn));
  const snaps = await fs().getDocs(q);
  const expenses = [];
  let total = 0;
  snaps.forEach(d => {
    const dd = d.data();
    total += Number(dd.amount) || 0;
    expenses.push({ id: d.id, ...dd });
  });
  // Sort by date in JS
  const p = s => { if(!s) return 0; const x=s.split("-"); return x.length===3?new Date(+x[2],+x[1]-1,+x[0]).getTime():0; };
  expenses.sort((a,b) => p(a.date) - p(b.date));
  return { success: true, expenses, total };
}

async function getAllCaseExpenses() {
  await waitForFB();
  const snaps = await fs().getDocs(fs().collection(db(), "caseExpenses"));
  const expenses = [];
  let total = 0;
  snaps.forEach(d => {
    const dd = d.data();
    total += Number(dd.amount) || 0;
    expenses.push({ id: d.id, ...dd });
  });
  return { success: true, expenses, total };
}

// ============================================================
// ADMIN EXPENSES
// ============================================================
async function addAdminExpense(data) {
  await waitForFB();
  await fs().addDoc(fs().collection(db(), "adminExpenses"), {
    ...data,
    createdAt: fs().serverTimestamp()
  });

  await addCashEntry({
    type: "Outflow",
    date: data.date || today(),
    source: `Admin Expense: ${data.detail || ""}`,
    amount: Number(data.amount) || 0,
    note: `Paid to: ${data.payto || ""}`
  });

  return { success: true };
}

async function getAdminExpenses(from = "", to = "") {
  await waitForFB();
  const snaps = await fs().getDocs(
    fs().query(fs().collection(db(), "adminExpenses"), fs().orderBy("date", "asc"))
  );
  const expenses = [];
  let total = 0;
  snaps.forEach(d => {
    const dd = d.data();
    if (from && dd.date < from) return;
    if (to && dd.date > to) return;
    total += Number(dd.amount) || 0;
    expenses.push({ id: d.id, ...dd });
  });
  return { success: true, expenses, total };
}

// ============================================================
// CASH BOOK
// ============================================================
async function addCashEntry(data) {
  await waitForFB();
  await fs().addDoc(fs().collection(db(), "cashBook"), {
    type: data.type || "Inflow",
    date: data.date || today(),
    source: data.source || "",
    amount: Number(data.amount) || 0,
    note: data.note || "",
    createdAt: fs().serverTimestamp()
  });
  return { success: true };
}

async function getCashBook() {
  await waitForFB();
  const q = fs().query(fs().collection(db(), "cashBook"), fs().orderBy("date", "asc"));
  const snaps = await fs().getDocs(q);
  const entries = [];
  let inflow = 0, outflow = 0;
  snaps.forEach(d => {
    const dd = d.data();
    const amt = Number(dd.amount) || 0;
    if (dd.type === "Inflow") inflow += amt;
    else outflow += amt;
    entries.push({ id: d.id, ...dd });
  });
  return { success: true, entries, inflow, outflow, netWorth: inflow - outflow };
}

async function getNetWorth() {
  const cb = await getCashBook();
  return { success: true, netWorth: cb.netWorth, inflow: cb.inflow, outflow: cb.outflow };
}

// ============================================================
// ADMIN STATS
// ============================================================
async function getAdminStats() {
  await waitForFB();

  const [members, grants, charity, adminExp, caseExp] = await Promise.all([
    fs().getDocs(fs().collection(db(), "members")),
    fs().getDocs(fs().collection(db(), "grantRequests")),
    fs().getDocs(fs().collection(db(), "charityDonations")),
    fs().getDocs(fs().collection(db(), "adminExpenses")),
    fs().getDocs(fs().collection(db(), "caseExpenses"))
  ]);

  let pending = 0, active = 0, expired = 0, banned = 0;
  members.forEach(d => {
    const s = (d.data().status || "").toLowerCase();
    if (s === "underprocess") pending++;
    else if (s === "active") active++;
    else if (s === "expired") expired++;
    else if (s === "banned") banned++;
  });

  let newG = 0, completed = 0, approved = 0, rejected = 0, closed = 0;
  grants.forEach(d => {
    const s = (d.data().status || "").toLowerCase();
    const dec = (d.data().decision || "").toLowerCase();
    if (s === "new") newG++;
    if (s === "completed") completed++;
    if (dec === "approved" && s !== "closed") approved++;
    if (dec === "rejected" && s !== "closed") rejected++;
    if (s === "closed") closed++;
  });

  let totalCharity = 0;
  charity.forEach(d => { totalCharity += Number(d.data().amount) || 0; });

  let totalAdminExp = 0;
  adminExp.forEach(d => { totalAdminExp += Number(d.data().amount) || 0; });

  let totalCaseCost = 0;
  caseExp.forEach(d => { totalCaseCost += Number(d.data().amount) || 0; });

  const nw = await getNetWorth();

  return {
    success: true,
    pendingMembers: pending, activeMembers: active,
    expiredMembers: expired, bannedMembers: banned,
    newGrants: newG, completedCases: completed,
    approvedCases: approved, rejectedCases: rejected, closedCases: closed,
    totalCharity, totalAdminExp, totalCaseCost,
    netWorth: nw.netWorth || 0
  };
}

// ============================================================
// EXPORT ALL FUNCTIONS
// ============================================================
async function getPublicStats() {
  await waitForFB();
  try {
    const [members, grants] = await Promise.all([
      fs().getDocs(fs().collection(db(), "members")),
      fs().getDocs(fs().collection(db(), "grantRequests"))
    ]);

    let pending = 0, active = 0, expired = 0, banned = 0;
    members.forEach(d => {
      const s = (d.data().status || "").toLowerCase();
      if (s === "underprocess") pending++;
      else if (s === "active") active++;
      else if (s === "expired") expired++;
      else if (s === "banned") banned++;
    });

    let completed = 0, approved = 0, rejected = 0, closed = 0;
    grants.forEach(d => {
      const s = (d.data().status || "").toLowerCase();
      const dec = (d.data().decision || "").toLowerCase();
      if (s === "completed") completed++;
      if (dec === "approved" && s !== "closed") approved++;
      if (dec === "rejected" && s !== "closed") rejected++;
      if (s === "closed") closed++;
    });

    return {
      success: true,
      pendingMembers: pending, activeMembers: active,
      expiredMembers: expired, bannedMembers: banned,
      completedCases: completed, approvedCases: approved,
      rejectedCases: rejected, closedCases: closed
    };
  } catch(e) {
    return { success: false };
  }
}


window.RHS = {
  // Settings
  getNGOSettings, saveNGOSettings,
  getStatistics, getContent, saveContent,
  getContact, saveContact,
  // Team
  getTeam, addTeamMember, updateTeamMember, deleteTeamMember,
  // Members
  registerMember, getMembers, getMemberByCredentials,
  updateMemberStatus, searchMembers,
  // Charity
  addCharityEntry, getCharityLedger, getAllCharity,
  // Grants
  submitGrant, getGrantStatus, getGrants, updateGrant, checkGrantByCnic,
  // Case Expenses
  addCaseExpense, getCaseExpenses, getAllCaseExpenses,
  // Admin Expenses
  addAdminExpense, getAdminExpenses,
  // Cash Book
  addCashEntry, getCashBook, getNetWorth,
  // Stats
  getAdminStats, getPublicStats,
  // Messages
  submitContactMessage, getContactMessages,
  // Image
  uploadImage, imgUrl,
  // Utils
  today, generateCNIC, addMonthToDate
};

console.log("✅ RHS Firebase DB Layer Ready!");

// ============================================================
// NEWS & STORIES (Firestore se)
// ============================================================
async function getNews() {
  await waitForFB();
  try {
    const q = fs().query(fs().collection(db(), "news"), fs().orderBy("date", "desc"));
    const snaps = await fs().getDocs(q);
    const news = [];
    snaps.forEach(d => news.push({ id: d.id, ...d.data() }));
    return { success: true, news };
  } catch(e) {
    return { success: true, news: [] };
  }
}

async function getStories() {
  await waitForFB();
  try {
    const q = fs().query(fs().collection(db(), "stories"), fs().orderBy("createdAt", "desc"));
    const snaps = await fs().getDocs(q);
    const stories = [];
    snaps.forEach(d => stories.push({ id: d.id, ...d.data() }));
    return { success: true, stories };
  } catch(e) {
    return { success: true, stories: [] };
  }
}

// Add to RHS exports
window.RHS.getNews = getNews;
window.RHS.getStories = getStories;

// ============================================================
// NEW FUNCTIONS — Slides, News CRUD, Stories CRUD, Delete Message
// ============================================================

// NEWS CRUD
async function addNews(data) {
  await waitForFB();
  const ref = await fs().addDoc(fs().collection(db(), "news"), { ...data, createdAt: fs().serverTimestamp() });
  return { success: true, id: ref.id };
}
async function deleteNews(id) {
  await waitForFB();
  await fs().deleteDoc(fs().doc(db(), "news", id));
  return { success: true };
}

// STORIES CRUD
async function addStory(data) {
  await waitForFB();
  const ref = await fs().addDoc(fs().collection(db(), "stories"), { ...data, createdAt: fs().serverTimestamp() });
  return { success: true, id: ref.id };
}
async function deleteStory(id) {
  await waitForFB();
  await fs().deleteDoc(fs().doc(db(), "stories", id));
  return { success: true };
}

// SLIDES
async function getSlides() {
  await waitForFB();
  try {
    const q = fs().query(fs().collection(db(), "slides"), fs().orderBy("order", "asc"));
    const snaps = await fs().getDocs(q);
    const slides = [];
    snaps.forEach(d => slides.push({ id: d.id, ...d.data() }));
    return { success: true, slides };
  } catch(e) {
    try {
      const snaps = await fs().getDocs(fs().collection(db(), "slides"));
      const slides = [];
      snaps.forEach(d => slides.push({ id: d.id, ...d.data() }));
      return { success: true, slides };
    } catch(e2) { return { success: true, slides: [] }; }
  }
}
async function addSlide(data) {
  await waitForFB();
  const ref = await fs().addDoc(fs().collection(db(), "slides"), { ...data, createdAt: fs().serverTimestamp() });
  return { success: true, id: ref.id };
}
async function updateSlide(id, data) {
  await waitForFB();
  await fs().updateDoc(fs().doc(db(), "slides", id), data);
  return { success: true };
}
async function deleteSlide(id) {
  await waitForFB();
  await fs().deleteDoc(fs().doc(db(), "slides", id));
  return { success: true };
}

// DELETE CONTACT MESSAGE
async function deleteContactMessage(id) {
  await waitForFB();
  await fs().deleteDoc(fs().doc(db(), "contactMessages", id));
  return { success: true };
}

// Add all new functions to RHS exports
window.RHS.addNews               = addNews;
window.RHS.deleteNews            = deleteNews;
window.RHS.addStory              = addStory;
window.RHS.deleteStory           = deleteStory;
window.RHS.getSlides             = getSlides;
window.RHS.addSlide              = addSlide;
window.RHS.updateSlide           = updateSlide;
window.RHS.deleteSlide           = deleteSlide;
window.RHS.deleteContactMessage  = deleteContactMessage;

console.log("✅ All RHS functions ready!");
