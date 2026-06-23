/* ============================================================
   RISING HOPE SOCIETY — ADMIN.JS — Firebase Mode
   ============================================================ */

// NGO Settings defaults
window.NGO = {
  name: "Rising Hope Society",
  phone: "0346-4800064",
  address: "Khairpur Tamewali, Bahawalpur, Punjab, Pakistan",
  email: "risinghopesociety@gmail.com",
  bank: "111111111111111",
  alert: "0346-4800064"
};

function loadNGOSettings() {
  if (!window.RHS) { setTimeout(loadNGOSettings, 500); return; }
  RHS.getNGOSettings().then(res => {
    if (!res) return;
    window.NGO = {
      name:    res.ngoName    || window.NGO.name,
      phone:   res.ngoPhone   || window.NGO.phone,
      address: res.ngoAddress || window.NGO.address,
      email:   res.ngoEmail   || window.NGO.email,
      bank:    res.bankAccount|| window.NGO.bank,
      alert:   res.alertNumber|| res.ngoPhone || window.NGO.alert
    };
    document.querySelectorAll(".ngo-name").forEach(el => el.textContent = window.NGO.name);
    document.querySelectorAll(".ngo-address").forEach(el => el.textContent = window.NGO.address);
  }).catch(() => {});
}

/* ===================== LOADING BUTTON ===================== */
function setLoading(btn, loading, text="") {
  if (!btn) return;
  if (loading) {
    btn._origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${text} <i class="fa fa-spinner fa-spin"></i>`;
    btn.style.opacity = "0.85";
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._origHtml || btn.innerHTML;
    btn.style.opacity = "1";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input, textarea, select, form").forEach(el => {
    el.setAttribute("autocomplete", "off");
  });
});

// Dummy apiGet/apiPost for any remaining old calls
function apiGet(params){ return Promise.resolve({success:false}); }
function apiPost(data){ return Promise.resolve({success:false}); }

/* ===================== LOGIN ===================== */
function doLogin(){
  const email = document.getElementById("loginEmail")?.value.trim();
  const pass  = document.getElementById("loginPass")?.value.trim();
  const msg   = document.getElementById("loginMsg");
  if (!email || !pass) { if(msg){msg.textContent="Please enter email and password.";} return; }
  if (msg) { msg.textContent=""; }
  const loginBtn = document.getElementById("loginSubmitBtn");
  if (loginBtn) { loginBtn.disabled=true; loginBtn.innerHTML='<i class="fa fa-spinner fa-spin"></i> Logging in...'; }

  if (!window.__fauth || !window.__auth) {
    setTimeout(doLogin, 800); return;
  }

  window.__fauth.signInWithEmailAndPassword(window.__auth, email, pass)
    .then(() => {
      if (loginBtn) { loginBtn.disabled=false; loginBtn.innerHTML='<i class="fa fa-sign-in-alt"></i> Login to Dashboard'; }
      document.getElementById("loginScreen")?.classList.add("hidden");
      document.getElementById("dashboard")?.classList.remove("hidden");
      loadNGOSettings();
      loadAdminStats();
      setDefaultDates();
    })
    .catch(err => {
      if (loginBtn) { loginBtn.disabled=false; loginBtn.innerHTML='<i class="fa fa-sign-in-alt"></i> Login to Dashboard'; }
      let errMsg = "Login failed. Check email and password.";
      if (err.code==="auth/user-not-found") errMsg = "Email not registered.";
      if (err.code==="auth/wrong-password" || err.code==="auth/invalid-credential") errMsg = "Wrong password.";
      if (err.code==="auth/too-many-requests") errMsg = "Too many attempts. Try later.";
      if (msg) { msg.textContent = errMsg; msg.style.color="#D9483A"; }
    });
}

/* ===================== FORGOT PASSWORD ===================== */
function doForgotPassword(){
  const email = document.getElementById("loginEmail")?.value.trim();
  const msg   = document.getElementById("loginMsg");
  if (!email) { if(msg){msg.textContent="Enter your email first."; msg.style.color="#D9483A";} return; }
  if (!window.__fauth || !window.__auth) { setTimeout(()=>doForgotPassword(), 800); return; }
  window.__fauth.sendPasswordResetEmail(window.__auth, email)
    .then(() => {
      if(msg){ msg.textContent="✅ Password reset email sent! Check your inbox."; msg.style.color="#2E9E5B"; }
    })
    .catch(err => {
      if(msg){ msg.textContent="Failed: "+err.message; msg.style.color="#D9483A"; }
    });
}

function hideForgotPassword(){
  const fb = document.getElementById("forgotBox");
  if(fb) fb.style.display="none";
}

/* ===================== LOGOUT ===================== */
function doLogout(){
  if(window.__fauth && window.__auth){
    window.__fauth.signOut(window.__auth).catch(()=>{});
  }
  document.getElementById("loginScreen")?.classList.remove("hidden");
  document.getElementById("dashboard")?.classList.add("hidden");
  document.getElementById("loginEmail").value="";
  document.getElementById("loginPass").value="";
}


// ====== HELPERS ======
function Rs(n){return"Rs. "+(Number(n)||0).toLocaleString("en-PK");}
function escHtml(s){const d=document.createElement("div");d.appendChild(document.createTextNode(s||""));return d.innerHTML;}
function today(){const d=new Date();return d.toISOString().split("T")[0];}
function showMsg(id,msg,type){const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className="form-msg "+(type||"success");}

let selectedMember=null;

// ====== LOGIN ======
function togglePass(){
  const inp=document.getElementById("loginPass");
  const btn=document.getElementById("passToggle");
  if(inp.type==="password"){inp.type="text";btn.innerHTML='<i class="fa fa-eye-slash"></i>';}
  else{inp.type="password";btn.innerHTML='<i class="fa fa-eye"></i>';}
}


// ====== SIDEBAR ======
function toggleSidebar(){document.getElementById("sidebar").classList.toggle("open");}

// ====== TABS ======
function switchTab(name){
  document.querySelectorAll(".tab-content").forEach(t=>t.classList.add("hidden"));
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
  const tabEl = document.getElementById("tab-"+name);
  if(tabEl){
    tabEl.classList.remove("hidden");
    // Scroll to top of page
    window.scrollTo(0,0);
    document.querySelector(".main-content")?.scrollTo(0,0);
  }
  const navEl = document.getElementById("nav-"+name);
  if(navEl) navEl.classList.add("active");
  const titles={home:"Dashboard",members:"Members Management",charity:"Charity Entry",grants:"Grant Cases (CRN)",cashbook:"Cash Book",adminexp:"Admin Expenses",reports:"Reports",messages:"Messages",setup:"Setup"};
  document.getElementById("pageTitle").textContent=titles[name]||"Dashboard";
  if(name==="members") loadMembers("all");
  if(name==="charity"){loadCharityList();setDefaultDates();}
  if(name==="grants") loadGrants("all");
  if(name==="cashbook"){loadCashBook();setDefaultDates();}
  if(name==="adminexp"){loadAdminExpenses();setDefaultDates();}
  if(name==="messages") loadMessages();
  if(name==="setup") loadSetupData();
  if(window.innerWidth<=900) document.getElementById("sidebar").classList.remove("open");
}

// ====== SETUP SECTION TOGGLE ======
function showSetupSection(section, btn){
  document.querySelectorAll(".setup-section").forEach(s=>s.classList.add("hidden"));
  document.querySelectorAll("#tab-setup .filter-btn").forEach(b=>b.classList.remove("active"));
  const el = document.getElementById("setup-"+section);
  if(el) el.classList.remove("hidden");
  if(btn) btn.classList.add("active");
}

// ====== LOAD ALL SETUP DATA ======
function loadSetupData(){
  if(!window.RHS){setTimeout(loadSetupData,500);return;}
  // Load NGO Settings
  RHS.getNGOSettings().then(res=>{
    if(!res) return;
    const fields = {
      "set-ngoName":res.ngoName||"","set-ngoPhone":res.ngoPhone||"",
      "set-ngoEmail":res.ngoEmail||"","set-alertNumber":res.alertNumber||"",
      "set-ngoAddress":res.ngoAddress||"","set-bankAccount":res.bankAccount||"",
      "set-ourTeamTitle":res.ourTeamTitle||"","set-ourTeamMatter":res.ourTeamMatter||""
    };
    Object.entries(fields).forEach(([id,val])=>{
      const el=document.getElementById(id);
      if(el) el.value=val;
    });
  }).catch(()=>{});
  // Load Statistics
  RHS.getStatistics().then(res=>{
    if(!res) return;
    ["members","families","projects","volunteers"].forEach(k=>{
      const el=document.getElementById("set-"+k);
      if(el) el.value=res[k]||0;
    });
  }).catch(()=>{});
  // Load Contact
  RHS.getContact().then(res=>{
    if(!res) return;
    ["facebook","instagram","whatsapp","youtube"].forEach(k=>{
      const el=document.getElementById("set-"+k);
      if(el) el.value=res[k]||"";
    });
  }).catch(()=>{});
  // Load Team list
  loadTeamList();
}

// ====== SAVE ADMIN SETTINGS ======
function saveAdminSettings(){
  if(!window.RHS){return;}
  const data={
    ngoName:document.getElementById("set-ngoName")?.value||"",
    ngoPhone:document.getElementById("set-ngoPhone")?.value||"",
    ngoEmail:document.getElementById("set-ngoEmail")?.value||"",
    alertNumber:document.getElementById("set-alertNumber")?.value||"",
    ngoAddress:document.getElementById("set-ngoAddress")?.value||"",
    bankAccount:document.getElementById("set-bankAccount")?.value||"",
    ourTeamTitle:document.getElementById("set-ourTeamTitle")?.value||"",
    ourTeamMatter:document.getElementById("set-ourTeamMatter")?.value||""
  };
  const btn=document.querySelector('#setup-adminSettings .btn-primary');
  setLoading(btn,true,"Saving...");
  RHS.saveNGOSettings(data).then(()=>{
    setLoading(btn,false);
    showMsg("adminSettingsMsg","✅ Settings saved!","success");
    loadNGOSettings();
  }).catch(()=>{setLoading(btn,false);showMsg("adminSettingsMsg","Failed to save.","error");});
}

// ====== SAVE STATISTICS ======
function saveStatistics(){
  if(!window.RHS){return;}
  const data={
    members:Number(document.getElementById("set-members")?.value)||0,
    families:Number(document.getElementById("set-families")?.value)||0,
    projects:Number(document.getElementById("set-projects")?.value)||0,
    volunteers:Number(document.getElementById("set-volunteers")?.value)||0
  };
  const btn=document.querySelector('#setup-statistics .btn-primary');
  setLoading(btn,true,"Saving...");
  window.__fs.updateDoc(window.__fs.doc(window.__db,"settings","statistics"),data)
    .then(()=>{setLoading(btn,false);showMsg("statisticsMsg","✅ Statistics updated!","success");})
    .catch(()=>{setLoading(btn,false);showMsg("statisticsMsg","Failed.","error");});
}

// ====== SAVE CONTACT ======
function saveContactSettings(){
  if(!window.RHS){return;}
  const data={
    facebook:document.getElementById("set-facebook")?.value||"",
    instagram:document.getElementById("set-instagram")?.value||"",
    whatsapp:document.getElementById("set-whatsapp")?.value||"",
    youtube:document.getElementById("set-youtube")?.value||""
  };
  const btn=document.querySelector('#setup-contact .btn-primary');
  setLoading(btn,true,"Saving...");
  RHS.saveContact(data).then(()=>{
    setLoading(btn,false);
    showMsg("contactSettingsMsg","✅ Contact saved!","success");
  }).catch(()=>{setLoading(btn,false);showMsg("contactSettingsMsg","Failed.","error");});
}

// ====== TEAM MANAGEMENT ======
function previewTeamPhoto(input){
  const file=input.files?.[0];
  if(!file) return;
  const preview=document.getElementById("team-photo-preview");
  if(!preview) return;
  const reader=new FileReader();
  reader.onload=e=>{preview.innerHTML=`<img src="${e.target.result}" alt="Preview">`;};
  reader.readAsDataURL(file);
}

async function addTeamMember(){
  if(!window.RHS){return;}
  const name=document.getElementById("team-name")?.value.trim();
  const desig=document.getElementById("team-designation")?.value.trim();
  const order=Number(document.getElementById("team-order")?.value)||99;
  const bio=document.getElementById("team-bio")?.value.trim()||"";
  if(!name||!desig){showMsg("teamMsg","Name and Designation required.","error");return;}
  const btn=document.querySelector('#setup-team .btn-primary');
  setLoading(btn,true,"Adding...");
  let photoUrl="";
  const photoFile=document.getElementById("team-photo")?.files?.[0];
  if(photoFile){
    try{photoUrl=await RHS.uploadImage(photoFile,"rhs/team");}catch(e){}
  }
  RHS.addTeamMember({name,designation:desig,order,bio,photo:photoUrl}).then(()=>{
    setLoading(btn,false);
    showMsg("teamMsg","✅ Team member added!","success");
    document.getElementById("team-name").value="";
    document.getElementById("team-designation").value="";
    document.getElementById("team-bio").value="";
    document.getElementById("team-order").value="";
    document.getElementById("team-photo-preview").innerHTML="";
    loadTeamList();
  }).catch(()=>{setLoading(btn,false);showMsg("teamMsg","Failed.","error");});
}

function loadTeamList(){
  if(!window.RHS){setTimeout(loadTeamList,500);return;}
  const wrap=document.getElementById("teamListWrap");
  if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i></div>';
  RHS.getTeam().then(res=>{
    if(!res.team||!res.team.length){wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No team members yet.</p>';return;}
    let html='<table class="data-table"><thead><tr><th>Photo</th><th>Name</th><th>Designation</th><th>Order</th><th>Action</th></tr></thead><tbody>';
    res.team.forEach(m=>{
      html+=`<tr>
        <td>${m.photo?`<img src="${m.photo}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:"—"}</td>
        <td><strong>${escHtml(m.name)}</strong></td>
        <td>${escHtml(m.designation)}</td>
        <td>${m.order||"—"}</td>
        <td><button class="btn btn-sm btn-reject" onclick="deleteTeamMember('${m.id}','${escHtml(m.name)}')"><i class="fa fa-trash"></i></button></td>
      </tr>`;
    });
    html+='</tbody></table>';
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<p style="color:#D9483A">Failed to load team.</p>';});
}

function deleteTeamMember(id,name){
  if(!confirm(`Delete "${name}" from team?`)) return;
  RHS.deleteTeamMember(id).then(()=>{
    loadTeamList();
    showMsg("teamMsg","✅ Member deleted.","success");
  }).catch(()=>showMsg("teamMsg","Failed to delete.","error"));
}

// ====== MESSAGES ======
function loadMessages(){
  if(!window.RHS){setTimeout(loadMessages,500);return;}
  const wrap=document.getElementById("messagesWrap");
  if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getContactMessages().then(res=>{
    if(!res.messages||!res.messages.length){
      wrap.innerHTML='<div class="empty-state"><i class="fa fa-envelope"></i><p>No messages yet.</p></div>';
      return;
    }
    let html='';
    res.messages.forEach(m=>{
      const date=m.createdAt?.toDate?m.createdAt.toDate().toLocaleDateString("en-PK"):"—";
      html+=`<div class="message-card">
        <div class="msg-header">
          <span class="msg-name"><i class="fa fa-user"></i> ${escHtml(m.name||"")}</span>
          <span class="msg-date">${date}</span>
        </div>
        <div class="msg-email"><i class="fa fa-envelope"></i> ${escHtml(m.email||"")}</div>
        <div class="msg-text">${escHtml(m.message||"")}</div>
      </div>`;
    });
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<div class="empty-state">Failed to load messages.</div>';});
}

function setDefaultDates(){
  const t=today();
  ["charityDate","cbDate"].forEach(id=>{const el=document.getElementById(id);if(el&&!el.value)el.value=t;});
}

// ====== ADMIN STATS ======
function loadAdminStats(){
  RHS.getAdminStats().then(res=>{
    if(!res.success)return;
    // Row 1 - Members
    document.getElementById("st-pending").textContent=res.pendingMembers||0;
    document.getElementById("st-active").textContent=res.activeMembers||0;
    document.getElementById("st-expired").textContent=res.expiredMembers||0;
    document.getElementById("st-banned").textContent=res.bannedMembers||0;
    // Row 2 - Financials
    document.getElementById("st-charity").textContent=Rs(res.totalCharity||0);
    document.getElementById("st-adminexp").textContent=Rs(res.totalAdminExp||0);
    document.getElementById("st-casecost").textContent=Rs(res.totalCaseCost||0);
    document.getElementById("st-networth").textContent=Rs(res.netWorth||0);
    // Row 3 - Cases
    document.getElementById("st-completed").textContent=res.completedCases||0;
    document.getElementById("st-approved").textContent=res.approvedCases||0;
    document.getElementById("st-rejected").textContent=res.rejectedCases||0;
    document.getElementById("st-closed").textContent=res.closedCases||0;
    // Badges
    document.getElementById("pendingBadge").textContent=res.pendingMembers||0;
    document.getElementById("grantBadge").textContent=res.newGrants||0;
    // Sync to reports tab if visible
    ["pending","active","expired","banned"].forEach(k=>{
      const el=document.getElementById("rp-"+k);
      if(el) el.textContent=res[k+"Members"]||res[k]||0;
    });
    const rpCharity=document.getElementById("rp-charity");
    if(rpCharity) rpCharity.textContent=Rs(res.totalCharity||0);
    const rpAdminexp=document.getElementById("rp-adminexp");
    if(rpAdminexp) rpAdminexp.textContent=Rs(res.totalAdminExp||0);
    const rpCasecost=document.getElementById("rp-casecost");
    if(rpCasecost) rpCasecost.textContent=Rs(res.totalCaseCost||0);
    const rpNetworth=document.getElementById("rp-networth");
    if(rpNetworth) rpNetworth.textContent=Rs(res.netWorth||0);
    ["completed","approved","rejected","closed"].forEach(k=>{
      const el=document.getElementById("rp-"+k);
      if(el) el.textContent=res[k+"Cases"]||0;
    });
  }).catch(()=>{});
}

// ====== MEMBERS ======
let currentMemberFilter="all";
function loadMembers(filter,btn){
  currentMemberFilter=filter||"all";
  if(btn){document.querySelectorAll("#tab-members .filter-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");}
  const wrap=document.getElementById("membersTableWrap");
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading members...</div>';
  RHS.getMembers(currentMemberFilter).then(res=>{
    if(!res.success||!res.members.length){
      document.getElementById("membersTableWrap").innerHTML='<div class="empty-state"><i class="fa fa-users"></i><p>No members found.</p></div>';
      allMembersData=[];
      return;
    }
    allMembersData=res.members;
    const searchBox=document.getElementById("memberSearchBox");
    if(searchBox) searchBox.value="";
    renderMembersTable(allMembersData);
  }).catch(()=>{document.getElementById("membersTableWrap").innerHTML='<div class="empty-state"><i class="fa fa-exclamation-circle"></i><p>Failed to load. Please try again.</p></div>';});
}

// Quick status change from table row buttons
function quickStatus(row, status, name){
  if(!confirm(`Change ${name} status to "${status}"?`)) return;
  if(!window.RHS) return;
  RHS.updateMemberStatus(row, status).then(res=>{
    if(res.success){ loadMembers(currentMemberFilter); loadAdminStats(); }
    else alert(res.message||"Failed to update status.");
  }).catch(()=>alert("Network error."));
}

function statusBadge(status){
  const s=(status||"").toLowerCase();
  if(s==="active")         return`<span class="status-badge status-active">✅ Active</span>`;
  if(s==="underprocess"||s==="under process") return`<span class="status-badge status-underprocess">⏳ Underprocess</span>`;
  if(s==="expired")        return`<span class="status-badge status-expired">🕐 Expired</span>`;
  if(s==="banned")         return`<span class="status-badge status-banned">🚫 Banned</span>`;
  if(s==="rejected")       return`<span class="status-badge status-rejected">❌ Rejected</span>`;
  if(s==="new")            return`<span class="status-badge status-new">🆕 New</span>`;
  if(s==="assigned")       return`<span class="status-badge status-assigned">👤 Assigned</span>`;
  if(s==="completed")      return`<span class="status-badge" style="background:#EEF3FF;color:#2563EB">📋 Case Completed</span>`;
  if(s==="approved")       return`<span class="status-badge status-approved">✅ Approved</span>`;
  if(s==="closed")         return`<span class="status-badge status-approved">🔒 Closed</span>`;
  return`<span class="status-badge status-verification">${escHtml(status)}</span>`;
}

function viewMember(m){
  document.getElementById("modalMemberName").textContent=m.fullName;
  document.getElementById("memberModalBody").innerHTML=`
    <div class="detail-grid">
      <div class="detail-item"><span class="lbl">Registration No</span><span class="val">${escHtml(m.registrationNo)}</span></div>
      <div class="detail-item"><span class="lbl">Status</span><span class="val">${statusBadge(m.status)}</span></div>
      <div class="detail-item"><span class="lbl">CNIC</span><span class="val">${escHtml(m.cnic)}</span></div>
      <div class="detail-item"><span class="lbl">Date of Birth</span><span class="val">${escHtml(m.dob)}</span></div>
      <div class="detail-item"><span class="lbl">Gender</span><span class="val">${escHtml(m.gender)}</span></div>
      <div class="detail-item"><span class="lbl">Profession</span><span class="val">${escHtml(m.profession)}</span></div>
      <div class="detail-item"><span class="lbl">Mobile</span><span class="val">${escHtml(m.mobile)}</span></div>
      <div class="detail-item"><span class="lbl">Email</span><span class="val">${escHtml(m.email)}</span></div>
      <div class="detail-item"><span class="lbl">Father / Husband</span><span class="val">${escHtml(m.fatherName)}</span></div>
      <div class="detail-item"><span class="lbl">Province</span><span class="val">${escHtml(m.province)}</span></div>
      <div class="detail-item detail-full"><span class="lbl">Address</span><span class="val">${escHtml(m.address)}</span></div>
      <div class="detail-item"><span class="lbl">Membership Type</span><span class="val">${escHtml(m.membershipType)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Designation</span><span class="val">${escHtml(m.designation)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Registered On</span><span class="val">${escHtml(m.timestamp)}</span></div>
      <div class="detail-item"><span class="lbl">Valid Upto</span><span class="val">${escHtml(m.validUpto)||"—"}</span></div>
    </div>
    <div class="modal-actions">
      <div class="field"><label class="lbl" style="margin-bottom:4px">Membership Type</label>
        <select class="modal-input" id="mMemType" onchange="">
          <option value="">— Select —</option>
          <option value="Executive Body Member" ${m.membershipType==="Executive Body Member"?"selected":""}>Executive Body Member</option>
          <option value="General Body Member" ${m.membershipType==="General Body Member"?"selected":""}>General Body Member</option>
          <option value="Associate Member" ${m.membershipType==="Associate Member"?"selected":""}>Associate Member</option>
        </select>
      </div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Designation</label>
        <input class="modal-input" id="mDesig" value="${escHtml(m.designation||"")}" placeholder="e.g. President">
      </div>
      <div class="field detail-full"><label class="lbl" style="margin-bottom:4px">Admin Comment</label>
        <input class="modal-input" id="mComment" value="${escHtml(m.adminComments||"")}" placeholder="Optional note">
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
      ${(()=>{
        const s=(m.status||"").toLowerCase();
        let btns="";
        if(s==="underprocess"||s==="under process"){
          btns+=`<button class="btn btn-approve btn-sm" onclick="changeMemberStatus(${m.row},'Active')"><i class="fa fa-check"></i> Approve → Active</button>`;
          btns+=`<button class="btn btn-ban btn-sm" onclick="changeMemberStatus(${m.row},'Expired')"><i class="fa fa-clock"></i> Mark Expired</button>`;
          btns+=`<button class="btn btn-reject btn-sm" onclick="changeMemberStatus(${m.row},'Banned')"><i class="fa fa-ban"></i> Ban</button>`;
        } else if(s==="active"){
          btns+=`<button class="btn btn-ban btn-sm" onclick="changeMemberStatus(${m.row},'Expired')"><i class="fa fa-clock"></i> Mark Expired</button>`;
          btns+=`<button class="btn btn-reject btn-sm" onclick="changeMemberStatus(${m.row},'Banned')"><i class="fa fa-ban"></i> Ban</button>`;
        } else if(s==="expired"){
          btns+=`<button class="btn btn-approve btn-sm" onclick="changeMemberStatus(${m.row},'Active')"><i class="fa fa-check"></i> Activate</button>`;
          btns+=`<button class="btn btn-reject btn-sm" onclick="changeMemberStatus(${m.row},'Banned')"><i class="fa fa-ban"></i> Ban</button>`;
        } else if(s==="banned"){
          btns+=`<button class="btn btn-approve btn-sm" onclick="changeMemberStatus(${m.row},'Active')"><i class="fa fa-check"></i> Activate</button>`;
          btns+=`<button class="btn btn-ban btn-sm" onclick="changeMemberStatus(${m.row},'Expired')"><i class="fa fa-clock"></i> Mark Expired</button>`;
        }
        return btns;
      })()}
    </div>
    <p class="form-msg" id="memberActionMsg"></p>`;
  document.getElementById("memberModal").classList.remove("hidden");
}

function changeMemberStatus(row,status){
  showMsg("memberActionMsg","Updating...","");
  if(!window.RHS){showMsg("memberActionMsg","System loading...","error");return;}
  RHS.updateMemberStatus(row, status).then(res=>{
    if(res.success){
      showMsg("memberActionMsg","✅ Status updated to: "+status,"success");
      loadMembers(currentMemberFilter);
      loadAdminStats();
    } else {
      showMsg("memberActionMsg",res.message||"Failed.","error");
    }
  }).catch(()=>showMsg("memberActionMsg","Network error.","error"));
}

// ====== TABLE SEARCH — MEMBERS ======
let allMembersData = [];

function searchMembersTable(q) {
  q = (q || "").toLowerCase().trim();
  const wrap = document.getElementById("membersTableWrap");
  if (!allMembersData.length) return;

  if (!q) {
    renderMembersTable(allMembersData);
    return;
  }

  const filtered = allMembersData.filter(m =>
    (m.fullName || "").toLowerCase().includes(q) ||
    (m.cnic || "").toLowerCase().includes(q) ||
    (m.mobile || "").toLowerCase().includes(q) ||
    (m.registrationNo || "").toLowerCase().includes(q) ||
    (m.email || "").toLowerCase().includes(q) ||
    (m.status || "").toLowerCase().includes(q)
  );

  if (!filtered.length) {
    wrap.innerHTML = `<div class="no-search-result"><i class="fa fa-search" style="font-size:1.5rem;margin-bottom:8px;display:block;color:#8A9A96"></i>No results found for "<strong>${escHtml(q)}</strong>"</div>`;
    return;
  }
  renderMembersTable(filtered, q);
}

function clearMemberSearch() {
  document.getElementById("memberSearchBox").value = "";
  renderMembersTable(allMembersData);
}

function highlight(text, q) {
  if (!q || !text) return escHtml(text || "");
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escHtml(text).replace(new RegExp(escaped, 'gi'), m => `<span class="search-highlight">${m}</span>`);
}

function renderMembersTable(members, q = "") {
  const wrap = document.getElementById("membersTableWrap");
  if (!members.length) {
    wrap.innerHTML = '<div class="empty-state"><i class="fa fa-users"></i><p>No members found.</p></div>';
    return;
  }
  let html = '<table class="data-table"><thead><tr><th>#</th><th>Reg No</th><th>Name</th><th>CNIC</th><th>Gender</th><th>Mobile</th><th>Status</th><th>Valid Upto</th><th>Actions</th></tr></thead><tbody>';
  members.forEach((m, i) => {
    const sb = statusBadge(m.status);
    const s = (m.status || "").toLowerCase();
    let actionBtns = "";
    if (s === "underprocess" || s === "under process") {
      actionBtns = `
        <button class="btn btn-sm btn-approve" onclick='quickStatus(${m.row},"Active","${escHtml(m.fullName)}")' title="Approve"><i class="fa fa-check"></i></button>
        <button class="btn btn-sm btn-ban" onclick='quickStatus(${m.row},"Expired","${escHtml(m.fullName)}")' title="Expired"><i class="fa fa-clock"></i></button>
        <button class="btn btn-sm btn-reject" onclick='quickStatus(${m.row},"Banned","${escHtml(m.fullName)}")' title="Ban"><i class="fa fa-ban"></i></button>`;
    } else if (s === "active") {
      actionBtns = `
        <button class="btn btn-sm btn-ban" onclick='quickStatus(${m.row},"Expired","${escHtml(m.fullName)}")' title="Mark Expired"><i class="fa fa-clock"></i></button>
        <button class="btn btn-sm btn-reject" onclick='quickStatus(${m.row},"Banned","${escHtml(m.fullName)}")' title="Ban"><i class="fa fa-ban"></i></button>`;
    } else if (s === "expired") {
      actionBtns = `
        <button class="btn btn-sm btn-approve" onclick='quickStatus(${m.row},"Active","${escHtml(m.fullName)}")' title="Activate"><i class="fa fa-check"></i></button>
        <button class="btn btn-sm btn-reject" onclick='quickStatus(${m.row},"Banned","${escHtml(m.fullName)}")' title="Ban"><i class="fa fa-ban"></i></button>`;
    } else if (s === "banned") {
      actionBtns = `
        <button class="btn btn-sm btn-approve" onclick='quickStatus(${m.row},"Active","${escHtml(m.fullName)}")' title="Activate"><i class="fa fa-check"></i></button>
        <button class="btn btn-sm btn-ban" onclick='quickStatus(${m.row},"Expired","${escHtml(m.fullName)}")' title="Mark Expired"><i class="fa fa-clock"></i></button>`;
    }
    html += `<tr>
      <td>${i + 1}</td>
      <td><strong>${highlight(m.registrationNo, q)}</strong></td>
      <td>${highlight(m.fullName, q)}</td>
      <td><code>${highlight(m.cnic, q)}</code></td>
      <td>${escHtml(m.gender)}</td>
      <td>${highlight(m.mobile, q)}</td>
      <td>${sb}</td>
      <td>${m.validUpto || "—"}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        ${actionBtns}
        <button class="btn btn-sm btn-ghost" onclick='viewMember(${JSON.stringify(m).replace(/'/g, "&#39;")})' title="View Detail">
          <i class="fa fa-eye"></i>
        </button>
      </td>
    </tr>`;
  });
  html += "</tbody></table>";
  wrap.innerHTML = html;
}

// ====== TABLE SEARCH — GRANTS ======
let allGrantsData = [];

function searchGrantsTable(q) {
  q = (q || "").toLowerCase().trim();
  const wrap = document.getElementById("grantsTableWrap");
  if (!allGrantsData.length) return;

  if (!q) {
    renderGrantsTable(allGrantsData);
    return;
  }

  const filtered = allGrantsData.filter(g =>
    (g.crn || "").toLowerCase().includes(q) ||
    (g.name || "").toLowerCase().includes(q) ||
    (g.cnic || "").toLowerCase().includes(q) ||
    (g.mobile || "").toLowerCase().includes(q) ||
    (g.helpType || "").toLowerCase().includes(q) ||
    (g.status || "").toLowerCase().includes(q) ||
    (g.assignedTo || "").toLowerCase().includes(q)
  );

  if (!filtered.length) {
    wrap.innerHTML = `<div class="no-search-result"><i class="fa fa-search" style="font-size:1.5rem;margin-bottom:8px;display:block;color:#8A9A96"></i>No results found for "<strong>${escHtml(q)}</strong>"</div>`;
    return;
  }
  renderGrantsTable(filtered, q);
}

function clearGrantSearch() {
  document.getElementById("grantSearchBox").value = "";
  renderGrantsTable(allGrantsData);
}

function renderGrantsTable(grants, q = "") {
  const wrap = document.getElementById("grantsTableWrap");
  if (!grants.length) {
    wrap.innerHTML = '<div class="empty-state"><i class="fa fa-file-alt"></i><p>No cases found.</p></div>';
    return;
  }
  let html = '<table class="data-table"><thead><tr><th>CRN</th><th>Name</th><th>Help Type</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
  grants.forEach(g => {
    html += `<tr>
      <td><strong>${highlight(g.crn, q)}</strong></td>
      <td>${highlight(g.name, q)}</td>
      <td>${highlight(g.helpType, q)}</td>
      <td>${Rs(g.amount)}</td>
      <td>${statusBadge(g.status)}</td>
      <td>${escHtml(g.timestamp)}</td>
      <td><button class="btn btn-sm btn-ghost" onclick='viewGrant(${JSON.stringify(g).replace(/'/g, "&#39;")})'>
        <i class="fa fa-eye"></i> View
      </button></td>
    </tr>`;
  });
  html += "</tbody></table>";
  wrap.innerHTML = html;
}
let searchTimer=null;
function liveSearchMember(q){
  const res=document.getElementById("charitySearchResults");
  if(!q||q.length<2){res.classList.add("hidden");res.innerHTML="";return;}
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{
    res.innerHTML='<div style="padding:12px;color:#8A9A96;text-align:center"><i class="fa fa-spinner fa-spin"></i> Searching...</div>';
    res.classList.remove("hidden");
    if(!window.RHS){res.innerHTML='<div style="padding:12px;color:#8A9A96;text-align:center">Loading...</div>';return;}
    RHS.searchMembers(q).then(data=>{
      if(!data.members||!data.members.length){res.innerHTML='<div style="padding:12px;color:#8A9A96;text-align:center">No members found.</div>';return;}
      res.innerHTML=data.members.map(m=>`
        <div class="live-result-item" onclick='selectCharityMember(${JSON.stringify(m).replace(/'/g,"&#39;")})'>
          <i class="fa fa-user-circle"></i>
          <div>
            <strong>${escHtml(m.fullName)}</strong>
            <span>${escHtml(m.cnic)} &bull; ${escHtml(m.mobile)} &bull; ${statusBadge(m.status)}</span>
          </div>
        </div>`).join("");
    }).catch(()=>{res.innerHTML='<div style="padding:12px;color:var(--red);text-align:center">Search failed.</div>';});
  },350);
}

function selectCharityMember(m){
  selectedMember=m;
  document.getElementById("charitySearch").value=m.fullName;
  document.getElementById("charitySearchResults").classList.add("hidden");
  document.getElementById("charityMemberInfo").classList.remove("hidden");
  document.getElementById("cmName").textContent=m.fullName;
  document.getElementById("cmCnic").textContent=m.cnic;
  document.getElementById("cmMobile").textContent=m.mobile;
}

function clearCharityMember(){
  selectedMember=null;
  document.getElementById("charitySearch").value="";
  document.getElementById("charityMemberInfo").classList.add("hidden");
  document.getElementById("cmName").textContent="—";
  document.getElementById("cmCnic").textContent="—";
  document.getElementById("cmMobile").textContent="—";
}

// ====== CHARITY ENTRY ======
function submitCharity(){
  if(!selectedMember){showMsg("charityMsg","Please search and select a member first.","error");return;}
  const method=document.getElementById("paymentMethod").value;
  const amount=document.getElementById("charityAmount").value;
  const date=document.getElementById("charityDate").value;
  if(!method||!amount||!date){showMsg("charityMsg","Please fill all required fields.","error");return;}
  const sendEmail=document.getElementById("sendThankMsg").checked;
  const sendWA=document.getElementById("sendWhatsApp").checked;
  const charityBtn = document.querySelector('#tab-charity .btn-primary');
  setLoading(charityBtn, true, 'Saving...');
  if(!window.RHS){setLoading(charityBtn,false);showMsg("charityMsg","System loading...","error");return;}
  const dateFormatted = formatDateForServer(date);
  RHS.addCharityEntry({
    memberId: selectedMember.id,
    cnic: selectedMember.cnic,
    memberName: selectedMember.fullName,
    name: selectedMember.fullName,
    mobile: selectedMember.mobile,
    email: selectedMember.email||"",
    address: selectedMember.address||"",
    paymentMethod: method,
    amount: Number(amount),
    date: dateFormatted,
    slipRef: document.getElementById("charitySlip").value||"",
    note: document.getElementById("charityNote").value||""
  }).then(res=>{
    setLoading(charityBtn, false);
    if(res.success){
      let msg="✅ Charity entry saved! Valid Upto: "+(res.validUpto||"—");
      showMsg("charityMsg",msg,"success");
      if(sendWA&&selectedMember.mobile){
        const mob=selectedMember.mobile.replace(/\D/g,"");
        const waNum="92"+mob.slice(1);
        const waMsg=encodeURIComponent(`Assalam-u-Alaikum Dear ${selectedMember.fullName},\n\nYour charity of Rs. ${Number(amount).toLocaleString()} has been received by ${window.NGO.name}.\n\nPayment: ${method}\nDate: ${dateFormatted}\nValid Upto: ${res.validUpto||"—"}\n\nJazak Allah Khair! 🤲\n\n${window.NGO.name}\n${window.NGO.phone}`);
        window.open(`https://wa.me/${waNum}?text=${waMsg}`,"_blank");
      }
      if(sendEmail) openThankYouLetter(selectedMember,{paymentMethod:method,amount:Number(amount),date:dateFormatted},res.validUpto||"—");
      clearCharityForm();
      loadCharityList();
      loadAdminStats();
    } else {
      showMsg("charityMsg",res.message||"Failed.","error");
    }
  }).catch(()=>{setLoading(charityBtn, false);showMsg("charityMsg","Network error.","error");});
}

function formatDateForServer(ymd){
  if(!ymd)return"";
  const p=ymd.split("-");
  if(p.length===3)return p[2]+"-"+p[1]+"-"+p[0];
  return ymd;
}

function clearCharityForm(){
  const form = document.querySelector('#tab-charity');
  if(form) form.querySelectorAll('input,textarea,select').forEach(el=>{ if(el.type!=='submit'&&el.type!=='button'&&el.type!=='checkbox') el.value=''; });
  clearCharityMember();
  ["paymentMethod","charityAmount","charitySlip","charityNote"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
  document.getElementById("charityDate").value=today();
  document.getElementById("sendThankMsg").checked=true;
  showMsg("charityMsg","","");
}

function loadCharityList(){
  const wrap=document.getElementById("charityListWrap");
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getAllCharity().then(res=>{
    if(!res.donations||!res.donations.length){wrap.innerHTML='<div class="empty-state"><i class="fa fa-hand-holding-heart"></i><p>No charity entries yet.</p></div>';return;}
    const list=[...res.donations].reverse();
    let html='<table class="data-table"><thead><tr><th>Date</th><th>Name</th><th>CNIC</th><th>Method</th><th>Amount</th><th>Slip Ref</th></tr></thead><tbody>';
    list.forEach(d=>{
      html+=`<tr><td>${escHtml(d.date)}</td><td>${escHtml(d.name)}</td><td><code>${escHtml(d.cnic)}</code></td><td>${escHtml(d.paymentMethod)}</td><td><strong>${Rs(d.amount)}</strong></td><td>${escHtml(d.slipRef)||"—"}</td></tr>`;
    });
    html+="</tbody></table>";
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<div class="empty-state">Failed to load.</div>';});
}

// ====== THANK YOU LETTER ======
function openThankYouLetter(member,entry,validUpto){
  const dateStr=entry.date||today();
  document.getElementById("letterModalBody").innerHTML=`
    <div class="letter-wrap" id="letterContent">
      <div class="letter-header">
        <img src="images/logo.png" alt="RHS Logo">
        <h2>${window.NGO.name}</h2>
        <p>${window.NGO.address.toUpperCase()}</p>
      </div>
      <div class="letter-body">
        <p><strong>Date:</strong> ${dateStr} &nbsp;&nbsp;&nbsp; <strong>Ref:</strong> RHS-CHR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}</p>
        <p>Dear <strong>${escHtml(member.fullName)}</strong>,</p>
        <p>Assalam-u-Alaikum! We acknowledge receipt of your generous charity contribution to <strong>${window.NGO.name}</strong>. Your kind support helps us serve the community.</p>
        <table class="letter-table">
          <tr><td>Member Name</td><td>${escHtml(member.fullName)}</td></tr>
          <tr><td>CNIC</td><td>${escHtml(member.cnic)}</td></tr>
          <tr><td>Payment Method</td><td>${escHtml(entry.paymentMethod)}</td></tr>
          <tr><td>Amount</td><td><strong>${Rs(entry.amount)}</strong></td></tr>
          <tr><td>Date</td><td>${escHtml(dateStr)}</td></tr>
          <tr><td>Membership Valid Upto</td><td><strong>${escHtml(validUpto||"—")}</strong></td></tr>
        </table>
        <p>May Allah bless you for your generosity. Jazak Allah Khair! 🤲</p>
        <p>Your membership certificate has been updated and is valid until <strong>${escHtml(validUpto||"—")}</strong>.</p>
      </div>
      <div class="letter-footer">
        <p style="font-size:1rem;color:var(--teal);font-weight:700;font-style:normal;margin-bottom:4px;">President</p>
        <p style="font-size:1rem;color:var(--teal);font-style:normal;margin-bottom:12px;">${window.NGO.name}, ${window.NGO.address}</p>
        <p>⚠️ This is a computer-generated letter. Signature not required.</p>
        <p>📞 ${window.NGO.phone} &nbsp;|&nbsp; 📧 ${window.NGO.email}<br>${window.NGO.address}</p>
      </div>
    </div>`;
  document.getElementById("letterModal").classList.remove("hidden");
}

function printLetter(){
  const content=document.getElementById("letterContent");
  if(!content)return;
  const pa=document.getElementById("printArea");
  pa.innerHTML=content.outerHTML;
  window.print();
}

// ====== GRANTS ======
let currentGrantFilter="all";
function loadGrants(filter,btn){
  currentGrantFilter=filter||"all";
  if(btn){document.querySelectorAll("#tab-grants .filter-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");}
  const wrap=document.getElementById("grantsTableWrap");
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading cases...</div>';
  RHS.getGrants(currentGrantFilter).then(res=>{
    if(!res.grants||!res.grants.length){
      wrap.innerHTML='<div class="empty-state"><i class="fa fa-file-alt"></i><p>No cases found.</p></div>';
      allGrantsData=[];
      return;
    }
    allGrantsData=res.grants;
    const searchBox=document.getElementById("grantSearchBox");
    if(searchBox) searchBox.value="";
    renderGrantsTable(allGrantsData);
  }).catch(()=>{wrap.innerHTML='<div class="empty-state">Failed to load.</div>';});
}

function viewGrant(g){
  document.getElementById("modalGrantCrn").textContent="Case: "+g.crn;
  const decLower=(g.decision||"").toLowerCase();
  const stLower=(g.status||"").toLowerCase();
  document.getElementById("grantModalBody").innerHTML=`
    <div class="detail-grid">
      <div class="detail-item"><span class="lbl">CRN</span><span class="val">${escHtml(g.crn)}</span></div>
      <div class="detail-item"><span class="lbl">Status</span><span class="val">${statusBadge(g.status)}</span></div>
      <div class="detail-item"><span class="lbl">Name</span><span class="val">${escHtml(g.name)}</span></div>
      <div class="detail-item"><span class="lbl">Father / Husband</span><span class="val">${escHtml(g.fatherName)}</span></div>
      <div class="detail-item"><span class="lbl">CNIC</span><span class="val">${escHtml(g.cnic)}</span></div>
      <div class="detail-item"><span class="lbl">DOB</span><span class="val">${escHtml(g.dob)}</span></div>
      <div class="detail-item"><span class="lbl">Gender</span><span class="val">${escHtml(g.gender)}</span></div>
      <div class="detail-item"><span class="lbl">Mobile</span><span class="val">${escHtml(g.mobile)}</span></div>
      <div class="detail-item"><span class="lbl">Email</span><span class="val">${escHtml(g.email)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Help Type</span><span class="val">${escHtml(g.helpType)}</span></div>
      <div class="detail-item"><span class="lbl">Amount Required</span><span class="val">${Rs(g.amount)}</span></div>
      <div class="detail-item detail-full"><span class="lbl">Address</span><span class="val">${escHtml(g.address)}</span></div>
      <div class="detail-item"><span class="lbl">Assigned To</span><span class="val">${escHtml(g.assignedTo)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Team Contact</span><span class="val">${escHtml(g.assignedContact)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Verification</span><span class="val">${escHtml(g.verificationStatus)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Decision</span><span class="val">${escHtml(g.decision)||"—"}</span></div>
    </div>

    ${stLower!=="closed"&&stLower!=="rejected"?`
    <div class="modal-actions" style="display:block">

      ${stLower==="new"||stLower==="assigned"?`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div class="field"><label class="lbl" style="margin-bottom:4px">Assign To (Name)</label>
          <input class="modal-input" id="gAssignName" value="${escHtml(g.assignedTo||"")}" placeholder="Team member name">
        </div>
        <div class="field"><label class="lbl" style="margin-bottom:4px">Contact Number</label>
          <input class="modal-input" id="gAssignContact" value="${escHtml(g.assignedContact||"")}" placeholder="0300-0000000">
        </div>
      </div>
      <button class="btn btn-assign btn-sm" onclick="doAssignGrant(${g.row})"><i class="fa fa-user-tag"></i> Assign Case</button>
      `:""}

      ${stLower==="assigned"||stLower==="completed"?`
      <div style="margin-top:14px">
        <label style="font-size:0.82rem;font-weight:600;color:#8A9A96;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:6px">
          <i class="fa fa-comment-alt"></i> Verification Notes / Comments
        </label>
        <textarea id="verifyComment" rows="3" class="modal-input" style="width:100%;resize:vertical;font-family:'Inter',sans-serif;font-size:0.9rem" 
          placeholder="Write your verification notes here... e.g. Physically visited, documents checked, beneficiary confirmed...">${g.decisionNote&&g.decisionNote.startsWith("Verification Notes:")?g.decisionNote.replace("Verification Notes:","").trim():""}</textarea>
      </div>
      ${stLower==="assigned"?`<button class="btn btn-sm" style="background:#F0EBFF;color:#6D28D9;border:1px solid #C4B5FD;margin-top:10px" onclick="doVerificationComplete(${g.row})">
        <i class="fa fa-clipboard-check"></i> Mark Verification Complete → Case Completed
      </button>`:""}
      `:""}

      ${stLower==="completed"?`
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        <button class="btn btn-approve btn-sm" onclick="doDecision(${g.row},'Approved','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-check-circle"></i> ✅ Case Approved</button>
        <button class="btn btn-reject btn-sm" onclick="doDecision(${g.row},'Rejected','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-times-circle"></i> ❌ Case Rejected</button>
      </div>`:""}

      ${g.verificationStatus==="Completed"&&decLower!==""&&decLower!=="approved"&&decLower!=="rejected"?`
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        <button class="btn btn-approve btn-sm" onclick="doDecision(${g.row},'Approved','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-check-circle"></i> Approve</button>
        <button class="btn btn-reject btn-sm" onclick="doDecision(${g.row},'Rejected','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-times-circle"></i> Reject</button>
      </div>`:""}

      ${decLower==="approved"&&stLower!=="closed"?`
      <button class="btn btn-sm" style="background:#1F2E2B;color:#fff;margin-top:10px" onclick="doCloseGrant(${g.row})">
        <i class="fa fa-lock"></i> Close — Successfully Granted
      </button>`:""}
    </div>`:""}

    ${stLower==="rejected"?`
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
      <button class="btn btn-sm" style="background:#1F2E2B;color:#fff" onclick="doCloseGrant(${g.row})">
        <i class="fa fa-lock"></i> Close Case
      </button>
      <button class="btn btn-assign btn-sm" onclick="doSendBackToCompleted(${g.row})">
        <i class="fa fa-undo"></i> Send Back to Completed
      </button>
    </div>`:""}

    ${stLower==="closed"?`
    <div style="margin-top:16px">
      ${decLower==="rejected"?`
      <button class="btn btn-approve btn-sm" onclick="doReopenGrant(${g.row})">
        <i class="fa fa-redo"></i> Reopen → Case Completed
      </button>`:`
      <p style="color:#8A9A96;font-size:0.88rem;font-style:italic">
        <i class="fa fa-lock"></i> This case was Successfully Granted and cannot be reopened.
      </p>`}
    </div>`:""}

    <p class="form-msg" id="grantActionMsg"></p>

    <!-- CASE EXPENSES SECTION — visible when Approved or Closed -->
    ${(decLower==="approved"||stLower==="closed")?`
    <div style="margin-top:20px;border-top:2px solid var(--line);padding-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <h4 style="font-family:'Fraunces',serif;color:var(--teal);margin:0;display:flex;align-items:center;gap:8px">
          <i class="fa fa-receipt"></i> Case Expenses Ledger
        </h4>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm btn-ghost" onclick="window.print()" title="Print">
            <i class="fa fa-print"></i> Print
          </button>
          <button class="btn btn-sm btn-primary" onclick="downloadCaseReport('${escHtml(g.crn)}')">
            <i class="fa fa-file-pdf"></i> Download PDF
          </button>
        </div>
      </div>

      <!-- Add Expense Form — only when Approved (not closed) -->
      ${stLower!=="closed"?`
      <div style="background:#F5F9F8;border-radius:12px;padding:16px;margin-bottom:16px">
        <p style="font-size:0.82rem;font-weight:600;color:#8A9A96;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">
          <i class="fa fa-plus-circle"></i> Add Expense
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <label style="font-size:0.78rem;font-weight:600;color:#8A9A96;display:block;margin-bottom:4px">Date *</label>
            <input type="date" id="expDate" class="modal-input" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <label style="font-size:0.78rem;font-weight:600;color:#8A9A96;display:block;margin-bottom:4px">Detail *</label>
            <input type="text" id="expDetail" class="modal-input" placeholder="e.g. Cement, Labour...">
          </div>
          <div>
            <label style="font-size:0.78rem;font-weight:600;color:#8A9A96;display:block;margin-bottom:4px">Amount (Rs.) *</label>
            <input type="number" id="expAmount" class="modal-input" placeholder="e.g. 5000" min="1">
          </div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="addCaseExpense('${escHtml(g.crn)}','${escHtml(g.cnic)}','${escHtml(g.dob)}','${escHtml(g.name)}','${escHtml(g.fatherName)}','${escHtml(g.gender)}','${escHtml(g.email)}','${escHtml(g.mobile)}','${escHtml(g.address)}','${escHtml(g.helpType)}')">
          <i class="fa fa-plus"></i> Add Expense & Debit Cash Book
        </button>
        <p class="form-msg" id="expMsg" style="margin-top:8px"></p>
      </div>`:""}

      <!-- Expenses List -->
      <div id="expensesList"></div>
    </div>`:""}
  `;
  document.getElementById("grantModal").classList.remove("hidden");
  // Auto load expenses if case is Approved or Closed
  if(decLower==="approved"||stLower==="closed"){
    setTimeout(()=>loadCaseExpenses(g.crn), 100);
  }
}

function doAssignGrant(row){
  const name=document.getElementById("gAssignName")?.value.trim()||"";
  const contact=document.getElementById("gAssignContact")?.value.trim()||"";
  if(!name||!contact){showMsg("grantActionMsg","Please enter name and contact.","error");return;}
  showMsg("grantActionMsg","Assigning...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(row,{status:"Assigned",assignedTo:name,assignedContact:contact}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case assigned to "+name,"success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error.","error"));
}

function doVerificationComplete(row){
  const comment = document.getElementById("verifyComment")?.value?.trim() || "";
  const btn = document.querySelector(`button[onclick="doVerificationComplete(${row})"]`);
  setLoading(btn, true, "Saving...");
  showMsg("grantActionMsg","Updating...","");
  if(!window.RHS){setLoading(btn,false);showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(row,{
    verificationStatus:"Completed",
    status:"Completed",
    decisionNote: comment ? "Verification Notes: "+comment : ""
  }).then(res=>{
    setLoading(btn, false);
    if(res.success){
      showMsg("grantActionMsg","✅ Case moved to Case Completed tab"+(comment?" with notes.":"."), "success");
      loadGrants(currentGrantFilter); loadAdminStats();
    } else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>{setLoading(btn, false);showMsg("grantActionMsg","Network error.","error");});
}

function doDecision(row,decision,name,crn){
  showMsg("grantActionMsg","Processing...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  const ph=window.NGO.alert||window.NGO.phone;
  const em=window.NGO.email;
  const note=decision==="Approved"
    ?`Dear ${name}, Congratulations! 🎉 Your Charity Case ${crn} has been Successfully Approved. Our team will contact you at your doorstep. Jazak Allah Khair!\n\n📞 ${ph} | 📧 ${em}`
    :`Dear ${name}, Unfortunately your Case ${crn} does not qualify under our current criteria. Your case has been Rejected.\n\nTo appeal, please physically meet our President with Case No: ${crn}.\n\n📞 ${ph} | 📧 ${em}`;
  RHS.updateGrant(row,{decision:decision,decisionNote:note}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Decision recorded: "+decision,"success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error.","error"));
}

function doCloseGrant(row){
  showMsg("grantActionMsg","Closing case...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(row,{status:"Closed",decisionNote:"Successfully Granted & Closed"}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case closed — Successfully Granted.","success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error.","error"));
}

function doSendBackToCompleted(row){
  showMsg("grantActionMsg","Sending back...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(row,{status:"Completed",decision:"",decisionNote:""}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case sent back to Case Completed tab.","success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error.","error"));
}

function doReopenGrant(row){
  showMsg("grantActionMsg","Reopening...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(row,{status:"Completed",decision:"",decisionNote:""}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case reopened → Case Completed tab.","success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error.","error"));
}

// ====== CASE EXPENSES ======
function loadCaseExpenses(crn){
  const wrap = document.getElementById("expensesList");
  if(!wrap) return;
  RHS.getCaseExpenses(crn).then(res=>{
    if(!res.expenses||!res.expenses.length){
      wrap.innerHTML='<div style="text-align:center;color:#8A9A96;font-size:0.88rem;padding:10px;font-style:italic">No expenses recorded yet.</div>';
      return;
    }
    let running=0;
    let html=`<table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin-top:4px">
      <thead><tr style="background:#14534F;color:#fff">
        <th style="padding:8px;text-align:left">#</th>
        <th style="padding:8px;text-align:left">Date</th>
        <th style="padding:8px;text-align:left">Detail</th>
        <th style="padding:8px;text-align:right">Amount</th>
        <th style="padding:8px;text-align:right">Total</th>
      </tr></thead><tbody>`;
    res.expenses.forEach((e,i)=>{
      running+=Number(e.amount)||0;
      html+=`<tr style="background:${i%2?"#F5F9F8":"#fff"}">
        <td style="padding:7px 8px;border-bottom:1px solid #E7DFD2;color:#8A9A96">${i+1}</td>
        <td style="padding:7px 8px;border-bottom:1px solid #E7DFD2">${escHtml(e.date)}</td>
        <td style="padding:7px 8px;border-bottom:1px solid #E7DFD2">${escHtml(e.detail)}</td>
        <td style="padding:7px 8px;border-bottom:1px solid #E7DFD2;text-align:right;color:#D9483A;font-weight:600">${Rs(e.amount)}</td>
        <td style="padding:7px 8px;border-bottom:1px solid #E7DFD2;text-align:right;font-weight:600">${Rs(running)}</td>
      </tr>`;
    });
    html+=`<tr style="background:#FCEFEC">
      <td colspan="3" style="padding:10px 8px;font-weight:700;color:#C5432B">Total Case Expenses</td>
      <td colspan="2" style="padding:10px 8px;text-align:right;font-weight:700;color:#C5432B;font-size:1rem">${Rs(res.total)}</td>
    </tr></tbody></table>`;
    wrap.innerHTML=html;
  }).catch(()=>{
    wrap.innerHTML='<div style="text-align:center;color:#D9483A;font-size:0.88rem">Failed to load expenses.</div>';
  });
}

function addCaseExpense(crn,cnic,dob,name,fatherName,gender,email,mobile,address,helpType){
  const date = document.getElementById("expDate")?.value;
  const detail = document.getElementById("expDetail")?.value?.trim();
  const amount = document.getElementById("expAmount")?.value;
  const msg = document.getElementById("expMsg");
  if(!date||!detail||!amount){
    if(msg){msg.textContent="⚠️ Please fill date, detail and amount.";msg.className="form-msg error";}
    return;
  }
  const btn = document.querySelector('[onclick^="addCaseExpense"]');
  setLoading(btn, true, "Saving...");
  if(msg) msg.textContent="";
  if(!window.RHS){setLoading(btn,false);return;}
  RHS.addCaseExpense({
    date: formatDateForServer(date),
    crn, cnic, dob, name, fatherName, gender, email, mobile, address, helpType,
    detail, amount: Number(amount)
  }).then(res=>{
    setLoading(btn, false);
    if(res.success){
      if(msg){msg.textContent="✅ Expense added & debited from Cash Book!";msg.className="form-msg success";}
      document.getElementById("expDetail").value="";
      document.getElementById("expAmount").value="";
      loadCaseExpenses(crn);
    } else {
      if(msg){msg.textContent="❌ "+(res.message||"Failed");msg.className="form-msg error";}
    }
  }).catch(err=>{
    setLoading(btn, false);
    if(msg){msg.textContent="❌ Network error.";msg.className="form-msg error";}
  });
}

// ====== CASE FULL REPORT PDF ======
function downloadCaseReport(crn){
  const btn = event?.target;
  if(btn) setLoading(btn, true, "Generating...");
  if(!window.RHS){if(btn)setLoading(btn,false);alert("System loading...");return;}
  // Get grant data + expenses from RHS
  Promise.all([
    RHS.getGrants("all"),
    RHS.getCaseExpenses(crn)
  ]).then(([grantsRes, expRes])=>{
    if(btn) setLoading(btn, false);
    const g = grantsRes.grants?.find(x=>x.crn===crn);
    if(!g){alert("Case not found.");return;}
    const expenses = expRes.expenses||[];
    const totalExp = expRes.total||0;
    let running=0;
    let expRows="";
    if(expenses.length){
      expenses.forEach((e,i)=>{
        running+=Number(e.amount)||0;
        expRows+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
          <td style="padding:7px 10px;border-bottom:1px solid #eee">${i+1}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #eee">${e.date}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #eee">${e.detail}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;color:#D9483A;font-weight:600">Rs. ${Number(e.amount).toLocaleString()}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:600">Rs. ${running.toLocaleString()}</td>
        </tr>`;
      });
    } else {
      expRows=`<tr><td colspan="5" style="padding:14px;text-align:center;color:#8A9A96;font-style:italic">No expenses recorded.</td></tr>`;
    }
    const html=`
    <style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}</style>
    <div style="font-family:Georgia,serif;max-width:720px;margin:0 auto">
      <div style="text-align:center;border-bottom:3px double #14534F;padding-bottom:14px;margin-bottom:18px">
        <h2 style="color:#14534F;margin-bottom:4px;font-size:1.4rem">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em;font-size:.8rem;margin:0">CASE REPORT — ${g.crn}</p>
        <p style="color:#8A9A96;font-size:.72rem;margin:4px 0">${window.NGO.address} | ${window.NGO.phone}</p>
      </div>
      <h3 style="color:#14534F;font-size:1rem;margin-bottom:10px;border-left:4px solid #E8A33D;padding-left:10px">Case Information</h3>
      <table style="width:100%;border-collapse:collapse;font-size:.88rem;margin-bottom:20px">
        <tr><td style="padding:6px 10px;background:#F5F9F8;font-weight:700;width:30%">CRN</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.crn}</td><td style="padding:6px 10px;background:#F5F9F8;font-weight:700;width:30%">Status</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.status}</td></tr>
        <tr><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Name</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.name}</td><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Father/Husband</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.fatherName||"—"}</td></tr>
        <tr><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">CNIC</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.cnic}</td><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Mobile</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.mobile}</td></tr>
        <tr><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Help Type</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.helpType}</td><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Amount Requested</td><td style="padding:6px 10px;border-bottom:1px solid #eee">Rs. ${Number(g.amountRequired||g.amount||0).toLocaleString()}</td></tr>
        <tr><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Address</td><td colspan="3" style="padding:6px 10px;border-bottom:1px solid #eee">${g.address}</td></tr>
        <tr><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Assigned To</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.assignedTo||"—"} ${g.assignedContact||""}</td><td style="padding:6px 10px;background:#F5F9F8;font-weight:700">Decision</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${g.decision||"—"}</td></tr>
      </table>
      <h3 style="color:#14534F;font-size:1rem;margin-bottom:10px;border-left:4px solid #D9483A;padding-left:10px">Cost / Expense Ledger</h3>
      <table style="width:100%;border-collapse:collapse;font-size:.88rem;margin-bottom:20px">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px 10px;text-align:left">#</th><th style="padding:8px 10px;text-align:left">Date</th>
          <th style="padding:8px 10px;text-align:left">Detail</th><th style="padding:8px 10px;text-align:right">Amount</th>
          <th style="padding:8px 10px;text-align:right">Cumulative</th>
        </tr></thead>
        <tbody>${expRows}</tbody>
        <tfoot><tr style="background:#FCEFEC">
          <td colspan="3" style="padding:10px;font-weight:700;color:#C5432B">Total Case Expenses</td>
          <td colspan="2" style="padding:10px;text-align:right;font-weight:700;color:#C5432B;font-size:1rem">Rs. ${totalExp.toLocaleString()}</td>
        </tr></tfoot>
      </table>
      <div style="text-align:center;border-top:1px solid #E7DFD2;padding-top:12px;margin-top:8px">
        <p style="color:#8A9A96;font-size:.72rem;font-style:italic">⚠️ Computer-generated case report | ${window.NGO.name} | ${new Date().toLocaleDateString("en-PK")}</p>
      </div>
    </div>`;
    doPrint(html);
  }).catch(()=>{if(btn)setLoading(btn,false);alert("Failed to generate report.");});
}

// ====== ADMIN EXPENSES ======
let adminExpData=[];

function loadAdminExpenses(from="",to=""){
  const wrap=document.getElementById("adminExpWrap");
  if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getAdminExpenses(from, to).then(res=>{
    document.getElementById("ae-total").textContent=Rs(res.total||0);
    adminExpData=res.expenses||[];
    if(!adminExpData.length){
      wrap.innerHTML='<div class="empty-state"><i class="fa fa-receipt"></i><p>No admin expenses found.</p></div>';
      return;
    }
    let running=0;
    let html='<table class="data-table"><thead><tr><th>#</th><th>Date</th><th>Detail</th><th>Amount</th><th>Pay To</th><th>Cumulative</th></tr></thead><tbody>';
    adminExpData.forEach((e,i)=>{
      running+=Number(e.amount)||0;
      html+=`<tr>
        <td>${i+1}</td>
        <td>${escHtml(e.date)}</td>
        <td>${escHtml(e.detail)}</td>
        <td style="color:#D9483A;font-weight:600">${Rs(e.amount)}</td>
        <td>${escHtml(e.payto)||"—"}</td>
        <td style="font-weight:600">${Rs(running)}</td>
      </tr>`;
    });
    html+='</tbody></table>';
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<div class="empty-state">Failed to load.</div>';});
}

function submitAdminExpense(){
  const date=document.getElementById("aeDate")?.value;
  const detail=document.getElementById("aeDetail")?.value?.trim();
  const amount=document.getElementById("aeAmount")?.value;
  const payto=document.getElementById("aePayto")?.value?.trim()||"";
  if(!date||!detail||!amount){showMsg("aeMsg","⚠️ Date, Detail and Amount required.","error");return;}
  const btn=document.querySelector('#tab-adminexp .btn-primary');
  setLoading(btn,true,"Saving...");
  if(!window.RHS){setLoading(btn,false);showMsg("aeMsg","System loading...","error");return;}
  RHS.addAdminExpense({date:formatDateForServer(date),detail,amount:Number(amount),payto}).then(res=>{
    setLoading(btn,false);
    if(res.success){
      showMsg("aeMsg","✅ Expense added & debited from Cash Book!","success");
      document.getElementById("aeDetail").value="";
      document.getElementById("aeAmount").value="";
      document.getElementById("aePayto").value="";
      loadAdminExpenses();
      loadAdminStats();
    } else {
      showMsg("aeMsg",res.message||"Failed.","error");
    }
  }).catch(()=>{setLoading(btn,false);showMsg("aeMsg","Network error.","error");});
}

function filterAdminExpenses(){
  const from=formatDateForServer(document.getElementById("aeFrom")?.value||"");
  const to=formatDateForServer(document.getElementById("aeTo")?.value||"");
  loadAdminExpenses(from,to);
}

function clearAdminExpFilter(){
  document.getElementById("aeFrom").value="";
  document.getElementById("aeTo").value="";
  loadAdminExpenses();
}

function printAdminExpReport(){
  if(!adminExpData.length){alert("No data to print.");return;}
  const from=document.getElementById("aeFrom")?.value||"All";
  const to=document.getElementById("aeTo")?.value||"Dates";
  let running=0;
  let rows="";
  adminExpData.forEach((e,i)=>{
    running+=Number(e.amount)||0;
    rows+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
      <td style="padding:7px 10px;border-bottom:1px solid #eee">${i+1}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #eee">${e.date}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #eee">${e.detail}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;color:#D9483A;font-weight:600">Rs. ${Number(e.amount).toLocaleString()}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #eee">${e.payto||"—"}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:600">Rs. ${running.toLocaleString()}</td>
    </tr>`;
  });
  const html=`
  <style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;}</style>
  <div style="font-family:Georgia,serif;max-width:720px;margin:0 auto">
    <div style="text-align:center;border-bottom:3px double #14534F;padding-bottom:14px;margin-bottom:18px">
      <h2 style="color:#14534F;margin:0">${window.NGO.name}</h2>
      <p style="color:#E8A33D;letter-spacing:.1em;font-size:.8rem;margin:4px 0">ADMIN EXPENSES LEDGER</p>
      <p style="color:#8A9A96;font-size:.72rem;margin:0">Period: ${from} to ${to}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:.88rem">
      <thead><tr style="background:#14534F;color:#fff">
        <th style="padding:8px">#</th><th style="padding:8px">Date</th>
        <th style="padding:8px">Detail</th><th style="padding:8px;text-align:right">Amount</th>
        <th style="padding:8px">Pay To</th><th style="padding:8px;text-align:right">Cumulative</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="background:#FCEFEC">
        <td colspan="3" style="padding:10px;font-weight:700;color:#C5432B">Total Admin Expenses</td>
        <td colspan="3" style="padding:10px;text-align:right;font-weight:700;color:#C5432B;font-size:1rem">Rs. ${running.toLocaleString()}</td>
      </tr></tfoot>
    </table>
    <div style="text-align:center;border-top:1px solid #eee;padding-top:12px;margin-top:16px">
      <p style="color:#8A9A96;font-size:.72rem;font-style:italic">⚠️ Computer Generated Report — ${window.NGO.name} | ${new Date().toLocaleDateString("en-PK")}</p>
    </div>
  </div>`;
  doPrint(html);
}

// ====== CASH BOOK ======
function submitCashEntry(){
  const type=document.getElementById("cbType").value;
  const date=formatDateForServer(document.getElementById("cbDate").value);
  const source=document.getElementById("cbSource").value.trim();
  const amount=document.getElementById("cbAmount").value;
  if(!date||!source||!amount){showMsg("cashMsg","Please fill all required fields.","error");return;}
  const cashBtn = document.querySelector('#tab-cashbook .btn-primary:not([onclick*="print"])');
  setLoading(cashBtn, true, 'Saving...');
  if(!window.RHS){setLoading(cashBtn,false);showMsg("cashMsg","System loading...","error");return;}
  RHS.addCashEntry({type,date,source,amount:Number(amount),note:document.getElementById("cbNote").value||""}).then(res=>{
    setLoading(cashBtn, false);
    if(res.success){showMsg("cashMsg","✅ Entry added.","success");clearCashForm();loadCashBook();}
    else showMsg("cashMsg",res.message||"Failed.","error");
  }).catch(()=>{setLoading(cashBtn, false);showMsg("cashMsg","Network error.","error");});
}

function clearCashForm(){
  ["cbSource","cbAmount","cbNote"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
  document.getElementById("cbDate").value=today();
  document.getElementById("cbType").value="Inflow";
}

function loadCashBook(){
  const wrap=document.getElementById("cashbookWrap");
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getCashBook().then(res=>{
    document.getElementById("cb-inflow").textContent=Rs(res.inflow||0);
    document.getElementById("cb-outflow").textContent=Rs(res.outflow||0);
    document.getElementById("cb-networth").textContent=Rs(res.netWorth||0);
    if(!res.entries||!res.entries.length){wrap.innerHTML='<div class="empty-state"><i class="fa fa-book"></i><p>No cash entries yet.</p></div>';return;}
    const list=[...res.entries].reverse();
    let html='<table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Source / Purpose</th><th>Amount</th><th>Note</th></tr></thead><tbody>';
    let running=0;
    [...res.entries].forEach(e=>{
      const amt=Number(e.amount)||0;
      running+=(e.type==="Inflow"?amt:-amt);
    });
    let runBal=running;
    list.forEach(e=>{
      const amt=Number(e.amount)||0;
      const typeColor=e.type==="Inflow"?"color:var(--green)":"color:var(--red)";
      html+=`<tr>
        <td>${escHtml(e.date)}</td>
        <td><span style="${typeColor};font-weight:700">${e.type==="Inflow"?"💰 Inflow":"💸 Outflow"}</span></td>
        <td>${escHtml(e.source)}</td>
        <td style="${typeColor};font-weight:700">${e.type==="Inflow"?"+":"-"}${Rs(amt)}</td>
        <td>${escHtml(e.note)||"—"}</td>
      </tr>`;
    });
    html+="</tbody></table>";
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<div class="empty-state">Failed to load.</div>';});
}

// ====== REPORTS ======
// ====== REPORT BUSY HANDLER ======
function reportBusy(btn, fnName, param){
  setLoading(btn, true, "Generating...");
  setTimeout(()=>{
    try{
      window[fnName](param);
    }catch(e){console.error(e);}
    setTimeout(()=>setLoading(btn, false), 2500);
  }, 100);
}

// ====== MEMBER REPORTS BY STATUS ======
function printMemberReport(filter){
  RHS.getMembers(currentMemberFilter).then(res=>{
    const filterLabel={all:"All",pending:"Underprocess",active:"Active",expired:"Expired",banned:"Banned"};
    let html=`<style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;}</style>
    <div style="font-family:Georgia,serif;max-width:720px;margin:0 auto">
      <div style="text-align:center;border-bottom:3px double #14534F;padding-bottom:14px;margin-bottom:18px">
        <h2 style="color:#14534F;margin:0">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em;font-size:.8rem;margin:4px 0">MEMBERS REPORT — ${(filterLabel[filter]||filter).toUpperCase()}</p>
        <p style="color:#8A9A96;font-size:.72rem;margin:0">Generated: ${new Date().toLocaleDateString("en-PK")} | Total: ${(res.members||[]).length}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">#</th><th style="padding:8px">Reg No</th>
          <th style="padding:8px">Name</th><th style="padding:8px">CNIC</th>
          <th style="padding:8px">Gender</th><th style="padding:8px">Mobile</th>
          <th style="padding:8px">Status</th><th style="padding:8px">Valid Upto</th>
        </tr></thead><tbody>`;
    (res.members||[]).forEach((m,i)=>{
      html+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee;text-align:center">${i+1}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.registrationNo}</td>
        <td style="padding:7px;border-bottom:1px solid #eee"><strong>${m.fullName}</strong></td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.cnic}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.gender}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.mobile}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;font-weight:700">${m.status}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.validUpto||"—"}</td>
      </tr>`;
    });
    html+=`</tbody></table>
    <div style="text-align:center;margin-top:20px;border-top:1px solid #eee;padding-top:12px">
      <p style="color:#8A9A96;font-size:.72rem;font-style:italic">⚠️ Computer Generated Report — ${window.NGO.name} | ${new Date().toLocaleDateString("en-PK")}</p>
    </div></div>`;
    doPrint(html);
  });
}

// ====== CASE COST REPORT ======
function printCaseCostReport(){
  RHS.getAllCaseExpenses().then(res=>{
    let total=0;
    let rows="";
    (res.expenses||[]).forEach((e,i)=>{
      total+=Number(e.amount)||0;
      rows+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee">${i+1}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.date}</td>
        <td style="padding:7px;border-bottom:1px solid #eee"><strong>${e.crn}</strong></td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.name||""}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.detail}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;text-align:right;color:#D9483A;font-weight:600">Rs. ${Number(e.amount).toLocaleString()}</td>
      </tr>`;
    });
    const html=`<style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;}</style>
    <div style="font-family:Georgia,serif;max-width:720px;margin:0 auto">
      <div style="text-align:center;border-bottom:3px double #14534F;padding-bottom:14px;margin-bottom:18px">
        <h2 style="color:#14534F;margin:0">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em;font-size:.8rem;margin:4px 0">CASE COST / EXPENSES REPORT</p>
        <p style="color:#8A9A96;font-size:.72rem;margin:0">Generated: ${new Date().toLocaleDateString("en-PK")}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">#</th><th style="padding:8px">Date</th>
          <th style="padding:8px">CRN</th><th style="padding:8px">Beneficiary</th>
          <th style="padding:8px">Detail</th><th style="padding:8px;text-align:right">Amount</th>
        </tr></thead><tbody>${rows}</tbody>
        <tfoot><tr style="background:#FCEFEC">
          <td colspan="5" style="padding:10px;font-weight:700;color:#C5432B">Total Case Costs</td>
          <td style="padding:10px;text-align:right;font-weight:700;color:#C5432B;font-size:1rem">Rs. ${total.toLocaleString()}</td>
        </tr></tfoot>
      </table>
      <div style="text-align:center;margin-top:16px;border-top:1px solid #eee;padding-top:12px">
        <p style="color:#8A9A96;font-size:.72rem;font-style:italic">⚠️ Computer Generated — ${window.NGO.name}</p>
      </div></div>`;
    doPrint(html);
  }).catch(()=>alert("Failed to load case costs."));
}

// ====== CASH BOOK FILTERED REPORT ======
function printCashReportFiltered(){
  const from=formatDateForServer(document.getElementById("cbRptFrom")?.value||"");
  const to=formatDateForServer(document.getElementById("cbRptTo")?.value||"");
  RHS.getCashBook().then(res=>{
    let entries=res.entries||[];
    if(from) entries=entries.filter(e=>e.date>=from);
    if(to) entries=entries.filter(e=>e.date<=to);
    let inflow=0,outflow=0,running=0;
    let rows="";
    entries.forEach((e,i)=>{
      const amt=Number(e.amount)||0;
      if(e.type==="Inflow"){inflow+=amt;running+=amt;}else{outflow+=amt;running-=amt;}
      rows+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee">${e.date}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;font-weight:700;color:${e.type==="Inflow"?"#2E9E5B":"#D9483A"}">${e.type}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.source}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:${e.type==="Inflow"?"#2E9E5B":"#D9483A"}">${e.type==="Inflow"?"+":"-"}Rs. ${amt.toLocaleString()}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;text-align:right;font-weight:600">Rs. ${running.toLocaleString()}</td>
      </tr>`;
    });
    const html=`<style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;}</style>
    <div style="font-family:Georgia,serif;max-width:720px;margin:0 auto">
      <div style="text-align:center;border-bottom:3px double #14534F;padding-bottom:14px;margin-bottom:18px">
        <h2 style="color:#14534F;margin:0">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em;font-size:.8rem;margin:4px 0">CASH BOOK REPORT</p>
        <p style="color:#8A9A96;font-size:.72rem;margin:0">Period: ${from||"All"} to ${to||"Date"}</p>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:16px;justify-content:center">
        <div style="text-align:center;padding:10px 18px;background:#EEF8F1;border-radius:8px">
          <div style="color:#2E9E5B;font-weight:700">Rs. ${inflow.toLocaleString()}</div><div style="color:#8A9A96;font-size:.78rem">Inflow</div>
        </div>
        <div style="text-align:center;padding:10px 18px;background:#FCEFEC;border-radius:8px">
          <div style="color:#D9483A;font-weight:700">Rs. ${outflow.toLocaleString()}</div><div style="color:#8A9A96;font-size:.78rem">Outflow</div>
        </div>
        <div style="text-align:center;padding:10px 18px;background:#EEF3FF;border-radius:8px">
          <div style="color:#14534F;font-weight:700">Rs. ${(inflow-outflow).toLocaleString()}</div><div style="color:#8A9A96;font-size:.78rem">Net Balance</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">Date</th><th style="padding:8px">Type</th>
          <th style="padding:8px">Description</th><th style="padding:8px;text-align:right">Amount</th>
          <th style="padding:8px;text-align:right">Balance</th>
        </tr></thead><tbody>${rows}</tbody>
      </table>
      <div style="text-align:center;margin-top:16px;border-top:1px solid #eee;padding-top:12px">
        <p style="color:#8A9A96;font-size:.72rem;font-style:italic">⚠️ Computer Generated — ${window.NGO.name}</p>
      </div></div>`;
    doPrint(html);
  });
}

function printAdminExpFiltered(){
  const from=formatDateForServer(document.getElementById("aeRptFrom")?.value||"");
  const to=formatDateForServer(document.getElementById("aeRptTo")?.value||"");
  RHS.getAdminExpenses(from, to).then(res=>{
    let running=0;
    let rows=(res.expenses||[]).map((e,i)=>{
      running+=Number(e.amount)||0;
      return `<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee">${i+1}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.date}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.detail}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;text-align:right;color:#D9483A;font-weight:600">Rs. ${Number(e.amount).toLocaleString()}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.payto||"—"}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;text-align:right;font-weight:600">Rs. ${running.toLocaleString()}</td>
      </tr>`;
    }).join("");
    const html=`<style>@page{margin:12mm;size:A4;}body{-webkit-print-color-adjust:exact;}</style>
    <div style="font-family:Georgia,serif;max-width:720px;margin:0 auto">
      <div style="text-align:center;border-bottom:3px double #14534F;padding-bottom:14px;margin-bottom:18px">
        <h2 style="color:#14534F;margin:0">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em;font-size:.8rem;margin:4px 0">ADMIN EXPENSES LEDGER</p>
        <p style="color:#8A9A96;font-size:.72rem;margin:0">Period: ${from||"All"} to ${to||"Date"}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">#</th><th style="padding:8px">Date</th>
          <th style="padding:8px">Detail</th><th style="padding:8px;text-align:right">Amount</th>
          <th style="padding:8px">Pay To</th><th style="padding:8px;text-align:right">Cumulative</th>
        </tr></thead><tbody>${rows}</tbody>
        <tfoot><tr style="background:#FCEFEC">
          <td colspan="3" style="padding:10px;font-weight:700;color:#C5432B">Total</td>
          <td colspan="3" style="padding:10px;text-align:right;font-weight:700;color:#C5432B">Rs. ${running.toLocaleString()}</td>
        </tr></tfoot>
      </table>
      <div style="text-align:center;margin-top:16px;border-top:1px solid #eee;padding-top:12px">
        <p style="color:#8A9A96;font-size:.72rem;font-style:italic">⚠️ Computer Generated — ${window.NGO.name}</p>
      </div></div>`;
    doPrint(html);
  });
}

// ====== NET WORTH CERTIFICATE ======
function generateNetWorthCertificate(){
  RHS.getNetWorth().then(res=>{
    const now=new Date();
    const dateStr=now.toLocaleDateString("en-PK",{day:"2-digit",month:"long",year:"numeric"});
    const timeStr=now.toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit"});
    const netWorth=res.netWorth||0;
    const html=`<style>@page{margin:15mm;size:A4;}body{-webkit-print-color-adjust:exact;}</style>
    <div style="font-family:Georgia,serif;max-width:680px;margin:0 auto;border:3px double #14534F;padding:40px;border-radius:8px">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#14534F;margin:0;font-size:1.6rem;letter-spacing:.05em">${window.NGO.name}</h1>
        <p style="color:#E8A33D;margin:6px 0;font-size:.85rem;letter-spacing:.15em">BALANCE CERTIFICATE</p>
        <p style="color:#8A9A96;font-size:.78rem;margin:0">${window.NGO.address}</p>
        <p style="color:#8A9A96;font-size:.78rem;margin:2px 0">${window.NGO.phone} | ${window.NGO.email}</p>
      </div>
      <div style="border:1px solid #E7DFD2;border-radius:8px;padding:24px;margin:24px 0;background:#F5F9F8">
        <p style="margin:0 0 16px;font-size:1rem;line-height:1.8;color:#1F2E2B">
          This is to certify that as of <strong>${dateStr}</strong> at <strong>${timeStr}</strong>, 
          the financial balance of <strong>${window.NGO.name}</strong>, Khairpur Tamewali, Bahawalpur 
          is as follows:
        </p>
        <div style="text-align:center;padding:20px;background:#fff;border-radius:8px;border:2px solid #14534F;margin:16px 0">
          <p style="color:#8A9A96;font-size:.82rem;margin:0 0 6px;text-transform:uppercase;letter-spacing:.1em">Net Available Balance</p>
          <p style="color:#14534F;font-size:2rem;font-weight:700;margin:0">Rs. ${netWorth.toLocaleString()}</p>
          <p style="color:#8A9A96;font-size:.78rem;margin:6px 0 0">Rupees ${numberToWords(netWorth)} Only</p>
        </div>
        <p style="margin:16px 0 0;font-size:.9rem;line-height:1.8;color:#4A5C58">
          This balance represents the net financial position of ${window.NGO.name} after accounting 
          for all inflows (charity received) and outflows (admin expenses, case costs, and other expenditures).
        </p>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:40px;padding-top:20px;border-top:1px solid #E7DFD2">
        <div style="text-align:center">
          <div style="width:120px;border-top:1px solid #1F2E2B;padding-top:8px;font-size:.82rem;color:#1F2E2B">
            <strong>President</strong><br>${window.NGO.name}
          </div>
        </div>
        <div style="text-align:center">
          <p style="font-size:.78rem;color:#8A9A96;margin:0">Date: ${dateStr}</p>
          <p style="font-size:.78rem;color:#8A9A96;margin:4px 0">Time: ${timeStr}</p>
        </div>
      </div>
      <div style="text-align:center;margin-top:20px;padding:10px;background:#FEF8E9;border-radius:6px">
        <p style="color:#8A6A1F;font-size:.75rem;margin:0;font-style:italic">
          ⚠️ This is a computer-generated certificate. No physical signature required. | ${window.NGO.name}
        </p>
      </div>
    </div>`;
    doPrint(html);
  });
}

function numberToWords(n){
  if(!n||n===0) return "Zero";
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if(n<20) return ones[n];
  if(n<100) return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"");
  if(n<1000) return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+numberToWords(n%100):"");
  if(n<100000) return numberToWords(Math.floor(n/1000))+" Thousand"+(n%1000?" "+numberToWords(n%1000):"");
  if(n<10000000) return numberToWords(Math.floor(n/100000))+" Lakh"+(n%100000?" "+numberToWords(n%100000):"");
  return numberToWords(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+numberToWords(n%10000000):"");
}

function printMemberList(){
  RHS.getMembers(currentMemberFilter).then(res=>{
    let html=`<div style="font-family:sans-serif;padding:20px">
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="color:#14534F">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em">MEMBER LIST REPORT</p>
        <p style="color:#8A9A96;font-size:.8rem">Generated: ${new Date().toLocaleDateString("en-PK")}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">#</th><th style="padding:8px">Reg No</th><th style="padding:8px">Name</th>
          <th style="padding:8px">CNIC</th><th style="padding:8px">Gender</th><th style="padding:8px">Mobile</th>
          <th style="padding:8px">Status</th><th style="padding:8px">Valid Upto</th>
        </tr></thead><tbody>`;
    (res.members||[]).forEach((m,i)=>{
      html+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee;text-align:center">${i+1}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.registrationNo}</td>
        <td style="padding:7px;border-bottom:1px solid #eee"><strong>${m.fullName}</strong></td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.cnic}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.gender}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.mobile}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.status}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${m.validUpto||"—"}</td>
      </tr>`;
    });
    html+=`</tbody></table><p style="text-align:center;margin-top:20px;color:#8A9A96;font-size:.75rem">⚠️ Computer Generated Report — ${window.NGO.name}</p></div>`;
    doPrint(html);
  });
}

function printCharityReport(){
  RHS.getAllCharity().then(res=>{
    let total=0;
    let html=`<div style="font-family:sans-serif;padding:20px">
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="color:#14534F">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em">CHARITY REPORT</p>
        <p style="color:#8A9A96;font-size:.8rem">Generated: ${new Date().toLocaleDateString("en-PK")}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">Date</th><th style="padding:8px">Name</th><th style="padding:8px">CNIC</th>
          <th style="padding:8px">Method</th><th style="padding:8px">Amount</th>
        </tr></thead><tbody>`;
    (res.donations||[]).forEach((d,i)=>{
      total+=Number(d.amount)||0;
      html+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee">${d.date}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${d.name}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${d.cnic}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${d.paymentMethod}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;font-weight:700;color:#2E9E5B">Rs. ${Number(d.amount||0).toLocaleString()}</td>
      </tr>`;
    });
    html+=`<tr style="background:#EEF8F1"><td colspan="4" style="padding:10px;font-weight:700">Total Charity Received</td>
      <td style="padding:10px;font-weight:700;color:#14534F;font-size:1rem">Rs. ${total.toLocaleString()}</td></tr>`;
    html+=`</tbody></table><p style="text-align:center;margin-top:20px;color:#8A9A96;font-size:.75rem">⚠️ Computer Generated Report — ${window.NGO.name}</p></div>`;
    doPrint(html);
  });
}

function printCashReport(){
  RHS.getCashBook().then(res=>{
    let html=`<div style="font-family:sans-serif;padding:20px">
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="color:#14534F">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em">CASH BOOK REPORT</p>
        <p style="color:#8A9A96;font-size:.8rem">Generated: ${new Date().toLocaleDateString("en-PK")}</p>
      </div>
      <div style="display:flex;gap:20px;margin-bottom:20px;justify-content:center">
        <div style="text-align:center;padding:12px 20px;background:#EEF8F1;border-radius:8px">
          <div style="color:#2E9E5B;font-weight:700;font-size:1.2rem">Rs. ${(res.inflow||0).toLocaleString()}</div>
          <div style="color:#8A9A96;font-size:.8rem">Total Inflow</div>
        </div>
        <div style="text-align:center;padding:12px 20px;background:#FCEFEC;border-radius:8px">
          <div style="color:#D9483A;font-weight:700;font-size:1.2rem">Rs. ${(res.outflow||0).toLocaleString()}</div>
          <div style="color:#8A9A96;font-size:.8rem">Total Outflow</div>
        </div>
        <div style="text-align:center;padding:12px 20px;background:#EEF3FF;border-radius:8px">
          <div style="color:#14534F;font-weight:700;font-size:1.2rem">Rs. ${(res.netWorth||0).toLocaleString()}</div>
          <div style="color:#8A9A96;font-size:.8rem">Net Worth</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">Date</th><th style="padding:8px">Type</th>
          <th style="padding:8px">Source / Purpose</th><th style="padding:8px">Amount</th>
        </tr></thead><tbody>`;
    (res.entries||[]).forEach((e,i)=>{
      html+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee">${e.date}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;font-weight:700;color:${e.type==="Inflow"?"#2E9E5B":"#D9483A"}">${e.type}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${e.source}</td>
        <td style="padding:7px;border-bottom:1px solid #eee;font-weight:700;color:${e.type==="Inflow"?"#2E9E5B":"#D9483A"}">${e.type==="Inflow"?"+":"-"}Rs. ${Number(e.amount||0).toLocaleString()}</td>
      </tr>`;
    });
    html+=`</tbody></table><p style="text-align:center;margin-top:20px;color:#8A9A96;font-size:.75rem">⚠️ Computer Generated Report — ${window.NGO.name}</p></div>`;
    doPrint(html);
  });
}

function printGrantReport(){
  RHS.getGrants(currentGrantFilter).then(res=>{
    let html=`<div style="font-family:sans-serif;padding:20px">
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="color:#14534F">${window.NGO.name}</h2>
        <p style="color:#E8A33D;letter-spacing:.1em">GRANT CASES REPORT</p>
        <p style="color:#8A9A96;font-size:.8rem">Generated: ${new Date().toLocaleDateString("en-PK")}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#14534F;color:#fff">
          <th style="padding:8px">CRN</th><th style="padding:8px">Name</th>
          <th style="padding:8px">Help Type</th><th style="padding:8px">Amount</th>
          <th style="padding:8px">Status</th><th style="padding:8px">Decision</th>
        </tr></thead><tbody>`;
    (res.grants||[]).forEach((g,i)=>{
      html+=`<tr style="background:${i%2?"#f9f9f9":"#fff"}">
        <td style="padding:7px;border-bottom:1px solid #eee;font-weight:700">${g.crn}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${g.name}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${g.helpType}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">Rs. ${Number(g.amount||0).toLocaleString()}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${g.status}</td>
        <td style="padding:7px;border-bottom:1px solid #eee">${g.decision||"—"}</td>
      </tr>`;
    });
    html+=`</tbody></table><p style="text-align:center;margin-top:20px;color:#8A9A96;font-size:.75rem">⚠️ Computer Generated Report — ${window.NGO.name}</p></div>`;
    doPrint(html);
  });
}

function doPrint(html){
  const pa=document.getElementById("printArea");
  pa.innerHTML=html;
  window.print();
  setTimeout(()=>{pa.innerHTML="";},2000);
}

// ====== MODAL ======
function closeModal(id){document.getElementById(id).classList.add("hidden");}
document.addEventListener("click",e=>{
  if(e.target.classList.contains("modal-overlay"))e.target.classList.add("hidden");
  if(!e.target.closest(".search-live-wrap"))document.getElementById("charitySearchResults")?.classList.add("hidden");
});
