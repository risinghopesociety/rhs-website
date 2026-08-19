/* ============================================================
   RISING HOPE SOCIETY — ADMIN.JS — Firebase Mode
   ============================================================ */

// NGO Settings defaults
window.NGO = {
  name: "Rising Hope Society",
  phone: "0308-8919628",
  address: "Khairpur Tamewali, Bahawalpur, Punjab, Pakistan",
  email: "risinghopesociety@gmail.com",
  bank: "111111111111111",
  alert: "0308-8919628",
  logoUrl: "",
  signatureUrl: ""
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
      alert:   res.alertNumber|| res.ngoPhone || window.NGO.alert,
      logoUrl: res.logoUrl || "",
      signatureUrl: res.presidentSignatureUrl || ""
    };
    document.querySelectorAll(".ngo-name").forEach(el => el.textContent = window.NGO.name);
    document.querySelectorAll(".ngo-address").forEach(el => el.textContent = window.NGO.address);
    const logoPrev = document.getElementById("currentLogoPreview");
    if (logoPrev && window.NGO.logoUrl) logoPrev.src = window.NGO.logoUrl;
    const sigPrev = document.getElementById("currentSignaturePreview");
    if (sigPrev) {
      if (window.NGO.signatureUrl) { sigPrev.src = window.NGO.signatureUrl; sigPrev.style.display = "block"; }
      else { sigPrev.style.display = "none"; }
    }
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
function closeSidebar(){
  document.getElementById("sidebar").classList.remove("open");
  const ov=document.getElementById("sidebarOverlay");
  if(ov) ov.style.display="none";
}
function openSidebar(){
  document.getElementById("sidebar").classList.add("open");
  const ov=document.getElementById("sidebarOverlay");
  if(ov) ov.style.display="block";
}
function toggleSidebar(){
  const sb=document.getElementById("sidebar");
  if(sb.classList.contains("open")) closeSidebar();
  else openSidebar();
}

// ====== TABS ======
function switchTab(name){
  document.querySelectorAll(".tab-content").forEach(t=>t.classList.add("hidden"));
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
  const tabEl = document.getElementById("tab-"+name);
  if(tabEl){
    tabEl.classList.remove("hidden");
    window.scrollTo(0,0);
    document.querySelector(".main-content")?.scrollTo(0,0);
  }
  const navEl = document.getElementById("nav-"+name);
  if(navEl) navEl.classList.add("active");
  const titles={home:"Dashboard",members:"Members Management",charity:"Charity Entry",donate:"Donate Us",grants:"Charity Help",cashbook:"Cash Book",adminexp:"Admin Expenses",reports:"Reports",messages:"Messages",setup:"Setup"};
  document.getElementById("pageTitle").textContent=titles[name]||"Dashboard";
  if(name==="members") loadMembers("all");
  if(name==="charity"){loadCharityList();setDefaultDates();}
  if(name==="donate") loadDonateAdmin();
  if(name==="grants") loadGrants("all");
  if(name==="cashbook"){loadCashBook();setDefaultDates();}
  if(name==="adminexp"){loadAdminExpenses();setDefaultDates();}
  if(name==="messages") loadMessages();
  if(name==="setup") loadSetupData();
  closeSidebar();
}

// ====== SETUP SECTION TOGGLE ======
function showSetupSection(section, btn){
  document.querySelectorAll(".setup-section").forEach(s=>s.classList.add("hidden"));
  document.querySelectorAll("#tab-setup .filter-btn").forEach(b=>b.classList.remove("active"));
  const el = document.getElementById("setup-"+section);
  if(el) el.classList.remove("hidden");
  if(btn) btn.classList.add("active");
  if(section==="stories") loadStoriesList();
  if(section==="news") loadNewsList();
  if(section==="home") loadSlidesList();
  if(section==="team") loadTeamList();
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
  // Load Home Page Content (hero + slides heading + about)
  RHS.getContent().then(res=>{
    if(!res) return;
    const fields = {
      "set-heroEyebrow":res.heroEyebrow||"","set-heroHeading":res.heroHeading||"",
      "set-heroText":res.heroText||"","set-slidesHeading":res.slidesHeading||"",
      "set-aboutTitle":res.aboutTitle||"","set-aboutText":res.aboutText||""
    };
    Object.entries(fields).forEach(([id,val])=>{
      const el=document.getElementById(id);
      if(el) el.value=val;
    });
  }).catch(()=>{});
}

// ====== SAVE HOME PAGE CONTENT ======
function saveContent(){
  if(!window.RHS){return;}
  const data={
    heroEyebrow:document.getElementById("set-heroEyebrow")?.value||"",
    heroHeading:document.getElementById("set-heroHeading")?.value||"",
    heroText:document.getElementById("set-heroText")?.value||"",
    slidesHeading:document.getElementById("set-slidesHeading")?.value||"",
    aboutTitle:document.getElementById("set-aboutTitle")?.value||"",
    aboutText:document.getElementById("set-aboutText")?.value||""
  };
  const btn=document.querySelector('#setup-home .btn-primary[onclick="saveContent()"]');
  setLoading(btn,true,"Saving...");
  RHS.saveContent(data).then(()=>{
    setLoading(btn,false);
    showMsg("contentMsg","✅ Home page content saved!","success");
  }).catch(()=>{setLoading(btn,false);showMsg("contentMsg","Failed to save.","error");});
}

// ====== LOGO / SIGNATURE UPLOAD (Cloudinary) ======
let __pendingLogoUrl = null;
let __pendingSignatureUrl = null;

function previewLogo(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const preview = document.getElementById("currentLogoPreview");
  // Instant local preview
  const localUrl = URL.createObjectURL(file);
  if(preview) preview.src = localUrl;
  if(!window.RHS){ return; }
  showMsg("adminSettingsMsg","Uploading logo...","");
  RHS.uploadImage(file, "rhs/settings").then(url=>{
    __pendingLogoUrl = url;
    showMsg("adminSettingsMsg","✅ Logo uploaded. Click 'Save Settings' to apply.","success");
  }).catch(()=>{
    showMsg("adminSettingsMsg","⚠️ Logo upload failed. Please try again.","error");
  });
}

function previewSignature(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const preview = document.getElementById("currentSignaturePreview");
  const localUrl = URL.createObjectURL(file);
  if(preview){ preview.src = localUrl; preview.style.display = "block"; }
  if(!window.RHS){ return; }
  showMsg("adminSettingsMsg","Uploading signature...","");
  RHS.uploadImage(file, "rhs/settings").then(url=>{
    __pendingSignatureUrl = url;
    showMsg("adminSettingsMsg","✅ Signature uploaded. Click 'Save Settings' to apply.","success");
  }).catch(()=>{
    showMsg("adminSettingsMsg","⚠️ Signature upload failed. Please try again.","error");
  });
}

function removeSignature(){
  __pendingSignatureUrl = "";
  const preview = document.getElementById("currentSignaturePreview");
  if(preview){ preview.src=""; preview.style.display="none"; }
  showMsg("adminSettingsMsg","Signature will be removed on next Save.","");
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
  if(__pendingLogoUrl !== null) data.logoUrl = __pendingLogoUrl;
  if(__pendingSignatureUrl !== null) data.presidentSignatureUrl = __pendingSignatureUrl;
  const btn=document.querySelector('#setup-adminSettings .btn-primary');
  setLoading(btn,true,"Saving...");
  RHS.saveNGOSettings(data).then(()=>{
    setLoading(btn,false);
    showMsg("adminSettingsMsg","✅ Settings saved!","success");
    __pendingLogoUrl = null;
    __pendingSignatureUrl = null;
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

function clearTeamForm(){
  ["team-name","team-designation","team-bio","team-order"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  const prev=document.getElementById("team-photo-preview");
  if(prev) prev.innerHTML='<i class="fa fa-camera" style="color:#4CAF8A;font-size:1.5rem;display:block;margin-bottom:6px"></i><span style="color:#14534F;font-size:.88rem">Tap to select photo</span>';
  const inp=document.getElementById("team-photo");
  if(inp) inp.value="";
  showMsg("teamMsg","","");
}

function openEditTeam(id,name,designation,order,bio,photo){
  const old=document.getElementById("teamEditModal"); if(old) old.remove();
  const modal=document.createElement("div");
  modal.id="teamEditModal";
  modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
  modal.innerHTML=`
    <div style="background:#fff;border-radius:12px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="color:#14534F;margin:0"><i class="fa fa-edit"></i> Edit Team Member</h3>
        <button onclick="document.getElementById('teamEditModal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#8A9A96">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Name *</label>
          <input id="et-name" value="${name}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;font-size:.95rem;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Designation *</label>
          <input id="et-desig" value="${designation}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;font-size:.95rem;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Order No</label>
          <input id="et-order" type="number" value="${order}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;font-size:.95rem;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Bio</label>
          <textarea id="et-bio" rows="3" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;font-size:.95rem;box-sizing:border-box;resize:vertical">${bio}</textarea>
        </div>
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:6px">Photo (change optional)</label>
          ${photo?`<img src="${RHS.imgUrl?RHS.imgUrl(photo,150):photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:8px;border:2px solid #14534F;display:block">`:""}
          <input type="file" id="et-photo" accept="image/*" style="display:block;width:100%;padding:10px;border:2px dashed #4CAF8A;border-radius:8px;background:#F5F9F8;cursor:pointer;box-sizing:border-box">
          <div id="et-preview" style="margin-top:6px"></div>
        </div>
        <p id="editTeamMsg" style="margin:0;font-size:.85rem;color:#D9483A"></p>
        <div style="display:flex;gap:10px">
          <button id="editTeamSaveBtn" class="btn btn-primary" style="flex:1" onclick="saveEditTeam('${id}','${photo}')">
            <i class="fa fa-save"></i> Save Changes
          </button>
          <button class="btn btn-ghost" onclick="document.getElementById('teamEditModal').remove()">Cancel</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById("et-photo").addEventListener("change",function(){
    const file=this.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{document.getElementById("et-preview").innerHTML=`<img src="${e.target.result}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #14534F">`;};
    reader.readAsDataURL(file);
  });
}

async function saveEditTeam(id, existingPhoto){
  const name  = document.getElementById("et-name")?.value.trim();
  const desig = document.getElementById("et-desig")?.value.trim();
  const order = Number(document.getElementById("et-order")?.value)||99;
  const bio   = document.getElementById("et-bio")?.value.trim()||"";
  const imgFile = document.getElementById("et-photo")?.files?.[0];
  const msgEl = document.getElementById("editTeamMsg");
  const saveBtn = document.getElementById("editTeamSaveBtn");
  if(!name||!desig){ if(msgEl) msgEl.textContent="⚠️ Name aur Designation required."; return; }
  setLoading(saveBtn,true,"Saving...");
  if(msgEl) msgEl.textContent="";
  let photo=existingPhoto;
  if(imgFile){
    try{
      const fd=new FormData();
      fd.append("file",imgFile);
      fd.append("upload_preset","rhs-upload");
      fd.append("folder","rhs/team");
      const resp=await fetch("https://api.cloudinary.com/v1_1/dt9yspaw7/image/upload",{method:"POST",body:fd});
      const data=await resp.json();
      if(data.secure_url) photo=data.secure_url;
      else throw new Error(data.error?.message||"Upload failed");
    }catch(err){
      setLoading(saveBtn,false);
      if(msgEl) msgEl.textContent="⚠️ Photo upload failed: "+err.message;
      return;
    }
  }
  RHS.updateTeamMember(id,{name,designation:desig,order,bio,photo}).then(()=>{
    setLoading(saveBtn,false);
    document.getElementById("teamEditModal")?.remove();
    showMsg("teamMsg","✅ Team member updated!","success");
    loadTeamList();
  }).catch(()=>{ setLoading(saveBtn,false); if(msgEl) msgEl.textContent="⚠️ Failed to save."; });
}

// ====== NEWS FEED MANAGEMENT ======
window._newsCache = {};
window._storiesCache = {};

function previewNewsImage(input){
  const file=input.files?.[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{document.getElementById("newsImagePreview").innerHTML=`<img src="${e.target.result}" style="max-height:100px;border-radius:8px;object-fit:cover">`;};
  reader.readAsDataURL(file);
}

function clearNewsForm(){
  ["news-title","news-category","news-date","news-body","news-imageURL"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  const inp=document.getElementById("news-imageFile"); if(inp) inp.value="";
  const prev=document.getElementById("newsImagePreview"); if(prev) prev.innerHTML="";
  showMsg("newsMsg","","");
}

async function addNewsItem(){
  if(!window.RHS) return;
  const title=document.getElementById("news-title")?.value.trim()||"";
  const category=document.getElementById("news-category")?.value.trim()||"";
  const date=document.getElementById("news-date")?.value.trim()||"";
  const body=document.getElementById("news-body")?.value.trim()||"";
  let imageURL=document.getElementById("news-imageURL")?.value.trim()||"";
  const imgFile=document.getElementById("news-imageFile")?.files?.[0];
  if(!title||!body){showMsg("newsMsg","⚠️ Title and Content required.","error");return;}
  const btn=document.getElementById("addNewsBtn");
  setLoading(btn,true,"Saving...");
  if(imgFile){
    try{ imageURL=await RHS.uploadImage(imgFile,"rhs/news"); }
    catch(err){ setLoading(btn,false); showMsg("newsMsg","⚠️ "+err.message,"error"); return; }
  }
  RHS.addNews({title,category,date,body,imageURL}).then(()=>{
    setLoading(btn,false); showMsg("newsMsg","✅ News added!","success");
    clearNewsForm(); loadNewsList();
  }).catch(()=>{setLoading(btn,false);showMsg("newsMsg","❌ Failed.","error");});
}

function openEditNews(id){
  const n=window._newsCache[id]; if(!n) return;
  const old=document.getElementById("newsEditModal"); if(old) old.remove();
  const modal=document.createElement("div");
  modal.id="newsEditModal";
  modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
  modal.innerHTML=`<div style="background:#fff;border-radius:12px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="color:#14534F;margin:0"><i class="fa fa-edit"></i> Edit News</h3>
      <button onclick="document.getElementById('newsEditModal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#8A9A96">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div><label style="font-size:.85rem;color:#4A5C58">Title</label>
        <input id="edit-news-title" value="${escHtml(n.title||"")}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Category</label>
        <input id="edit-news-category" value="${escHtml(n.category||"")}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Date</label>
        <input id="edit-news-date" value="${escHtml(n.date||"")}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Content</label>
        <textarea id="edit-news-body" rows="4" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box">${escHtml(n.body||"")}</textarea></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Replace Image (optional)</label>
        <input type="file" id="edit-news-image" accept="image/*" style="display:block;width:100%;padding:10px;border:2px dashed #4CAF8A;border-radius:8px;background:#F5F9F8;cursor:pointer;box-sizing:border-box">
        <div id="edit-news-preview" style="margin-top:6px"></div></div>
      <p id="editNewsMsg" style="margin:0;font-size:.85rem;color:#D9483A"></p>
      <div style="display:flex;gap:10px">
        <button id="editNewsSaveBtn" class="btn btn-primary" style="flex:1" onclick="saveEditNews('${id}')"><i class="fa fa-save"></i> Save</button>
        <button class="btn btn-ghost" onclick="document.getElementById('newsEditModal').remove()">Cancel</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById("edit-news-image").addEventListener("change",function(){
    const file=this.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{document.getElementById("edit-news-preview").innerHTML=`<img src="${e.target.result}" style="width:100%;height:80px;object-fit:cover;border-radius:8px">`;};
    reader.readAsDataURL(file);
  });
}

async function saveEditNews(id){
  const title=document.getElementById("edit-news-title")?.value.trim()||"";
  const category=document.getElementById("edit-news-category")?.value.trim()||"";
  const date=document.getElementById("edit-news-date")?.value.trim()||"";
  const body=document.getElementById("edit-news-body")?.value.trim()||"";
  const imgFile=document.getElementById("edit-news-image")?.files?.[0];
  const msgEl=document.getElementById("editNewsMsg");
  const saveBtn=document.getElementById("editNewsSaveBtn");
  setLoading(saveBtn,true,"Saving...");
  const data={title,category,date,body};
  if(imgFile){
    try{ data.imageURL=await RHS.uploadImage(imgFile,"rhs/news"); }
    catch(err){ setLoading(saveBtn,false); if(msgEl) msgEl.textContent=err.message; return; }
  }
  RHS.updateNews(id,data).then(()=>{
    setLoading(saveBtn,false); document.getElementById("newsEditModal")?.remove();
    showMsg("newsMsg","✅ News updated!","success"); loadNewsList();
  }).catch(()=>{setLoading(saveBtn,false); if(msgEl) msgEl.textContent="Failed to update.";});
}

function deleteNewsItem(id,title){
  if(!confirm(`Delete "${title}"?`)) return;
  RHS.deleteNews(id).then(()=>{loadNewsList();showMsg("newsMsg","✅ News deleted.","success");})
    .catch(()=>showMsg("newsMsg","❌ Failed.","error"));
}

// ====== IMPACT STORIES MANAGEMENT ======
function previewStoryImage(input){
  const file=input.files?.[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{document.getElementById("storyImagePreview").innerHTML=`<img src="${e.target.result}" style="max-height:120px;border-radius:8px;object-fit:cover">`;};
  reader.readAsDataURL(file);
}

function clearStoryForm(){
  ["story-name","story-category","story-location","story-text"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  const inp=document.getElementById("story-imageFile"); if(inp) inp.value="";
  const prev=document.getElementById("storyImagePreview");
  if(prev) prev.innerHTML=`<i class="fa fa-image" style="font-size:1.5rem;color:#4CAF8A;display:block;margin-bottom:6px"></i><span style="color:#14534F;font-size:.88rem">Tap to upload photo</span>`;
  showMsg("storyMsg","","");
}

async function addStoryItem(){
  if(!window.RHS) return;
  const name=document.getElementById("story-name")?.value.trim()||"";
  const category=document.getElementById("story-category")?.value.trim()||"";
  const location=document.getElementById("story-location")?.value.trim()||"";
  const text=document.getElementById("story-text")?.value.trim()||"";
  const imgFile=document.getElementById("story-imageFile")?.files?.[0];
  if(!name||!text){showMsg("storyMsg","⚠️ Person Name and Story required.","error");return;}
  const btn=document.getElementById("addStoryBtn");
  setLoading(btn,true,"Saving...");
  let imageUrl="";
  if(imgFile){
    try{ imageUrl=await RHS.uploadImage(imgFile,"rhs/stories"); }
    catch(err){ setLoading(btn,false); showMsg("storyMsg","⚠️ "+err.message,"error"); return; }
  }
  RHS.addStory({name,category,location,text,imageUrl}).then(()=>{
    setLoading(btn,false); showMsg("storyMsg","✅ Story added!","success");
    clearStoryForm(); loadStoriesList();
  }).catch(()=>{setLoading(btn,false);showMsg("storyMsg","❌ Failed.","error");});
}

function openEditStory(id){
  const s=window._storiesCache[id]; if(!s) return;
  const old=document.getElementById("storyEditModal"); if(old) old.remove();
  const modal=document.createElement("div");
  modal.id="storyEditModal";
  modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
  modal.innerHTML=`<div style="background:#fff;border-radius:12px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="color:#14534F;margin:0"><i class="fa fa-edit"></i> Edit Story</h3>
      <button onclick="document.getElementById('storyEditModal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#8A9A96">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div><label style="font-size:.85rem;color:#4A5C58">Person Name</label>
        <input id="edit-story-name" value="${escHtml(s.name||"")}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Category</label>
        <input id="edit-story-category" value="${escHtml(s.category||"")}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Location</label>
        <input id="edit-story-location" value="${escHtml(s.location||"")}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Story</label>
        <textarea id="edit-story-text" rows="4" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box">${escHtml(s.text||"")}</textarea></div>
      <div><label style="font-size:.85rem;color:#4A5C58">Replace Image (optional)</label>
        <input type="file" id="edit-story-image" accept="image/*" style="display:block;width:100%;padding:10px;border:2px dashed #4CAF8A;border-radius:8px;background:#F5F9F8;cursor:pointer;box-sizing:border-box">
        <div id="edit-story-preview" style="margin-top:6px"></div></div>
      <p id="editStoryMsg" style="margin:0;font-size:.85rem;color:#D9483A"></p>
      <div style="display:flex;gap:10px">
        <button id="editStorySaveBtn" class="btn btn-primary" style="flex:1" onclick="saveEditStory('${id}')"><i class="fa fa-save"></i> Save</button>
        <button class="btn btn-ghost" onclick="document.getElementById('storyEditModal').remove()">Cancel</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById("edit-story-image").addEventListener("change",function(){
    const file=this.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{document.getElementById("edit-story-preview").innerHTML=`<img src="${e.target.result}" style="width:100%;height:80px;object-fit:cover;border-radius:8px">`;};
    reader.readAsDataURL(file);
  });
}

async function saveEditStory(id){
  const name=document.getElementById("edit-story-name")?.value.trim()||"";
  const category=document.getElementById("edit-story-category")?.value.trim()||"";
  const location=document.getElementById("edit-story-location")?.value.trim()||"";
  const text=document.getElementById("edit-story-text")?.value.trim()||"";
  const imgFile=document.getElementById("edit-story-image")?.files?.[0];
  const msgEl=document.getElementById("editStoryMsg");
  const saveBtn=document.getElementById("editStorySaveBtn");
  setLoading(saveBtn,true,"Saving...");
  const data={name,category,location,text};
  if(imgFile){
    try{ data.imageUrl=await RHS.uploadImage(imgFile,"rhs/stories"); }
    catch(err){ setLoading(saveBtn,false); if(msgEl) msgEl.textContent=err.message; return; }
  }
  RHS.updateStory(id,data).then(()=>{
    setLoading(saveBtn,false); document.getElementById("storyEditModal")?.remove();
    showMsg("storyMsg","✅ Story updated!","success"); loadStoriesList();
  }).catch(()=>{setLoading(saveBtn,false); if(msgEl) msgEl.textContent="Failed to update.";});
}

function deleteStoryItem(id,name){
  if(!confirm(`Delete "${name}"?`)) return;
  RHS.deleteStory(id).then(()=>{loadStoriesList();showMsg("storyMsg","✅ Story deleted.","success");})
    .catch(()=>showMsg("storyMsg","❌ Failed.","error"));
}

function loadStoriesList(){
  if(!window.RHS){setTimeout(loadStoriesList,500);return;}
  const wrap=document.getElementById("storiesListWrap"); if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getStories().then(res=>{
    if(!res.stories||!res.stories.length){wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No stories yet.</p>';return;}
    window._storiesCache={};
    res.stories.forEach(s=>{ window._storiesCache[s.id]=s; });
    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    res.stories.forEach(s=>{
      html+=`<div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap">
        ${s.imageUrl?`<img src="${RHS.imgUrl?RHS.imgUrl(s.imageUrl,160):s.imageUrl}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0">`:`<div style="width:64px;height:64px;background:#E7DFD2;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-image" style="color:#8A9A96"></i></div>`}
        <div style="flex:1;min-width:160px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px">
            <div><strong style="color:#14534F">${escHtml(s.name)}</strong>
              ${s.category?`<span style="margin-left:6px;background:#EEF8F1;color:#14534F;padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">${escHtml(s.category)}</span>`:""}
              ${s.location?`<span style="display:block;color:#8A9A96;font-size:.78rem;margin-top:2px"><i class="fa fa-map-marker-alt"></i> ${escHtml(s.location)}</span>`:""}
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm" style="background:#14534F;color:#fff;border:none" onclick="openEditStory('${s.id}')"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-reject" onclick="deleteStoryItem('${s.id}','${escHtml(s.name)}')"><i class="fa fa-trash"></i></button>
            </div>
          </div>
          <p style="color:#4A5C58;font-size:.85rem;margin:0">${escHtml((s.text||"").substring(0,120))}${(s.text||"").length>120?"...":""}</p>
        </div>
      </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load.</p>';});
}

function loadNewsList(){
  if(!window.RHS){setTimeout(loadNewsList,500);return;}
  const wrap=document.getElementById("newsListWrap"); if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getNews().then(res=>{
    if(!res.news||!res.news.length){wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No news yet.</p>';return;}
    window._newsCache={};
    res.news.forEach(n=>{ window._newsCache[n.id]=n; });
    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    res.news.forEach(n=>{
      html+=`<div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap">
        ${n.imageURL?`<img src="${RHS.imgUrl?RHS.imgUrl(n.imageURL,160):n.imageURL}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0">`:`<div style="width:64px;height:64px;background:#E7DFD2;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-newspaper" style="color:#8A9A96"></i></div>`}
        <div style="flex:1;min-width:160px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px">
            <div><strong style="color:#14534F">${escHtml(n.title||"")}</strong>
              ${n.category?`<span style="margin-left:6px;background:#EEF8F1;color:#14534F;padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">${escHtml(n.category)}</span>`:""}
              ${n.date?`<span style="display:block;color:#8A9A96;font-size:.78rem;margin-top:2px"><i class="fa fa-calendar"></i> ${escHtml(n.date)}</span>`:""}
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm" style="background:#14534F;color:#fff;border:none" onclick="openEditNews('${n.id}')"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-reject" onclick="deleteNewsItem('${n.id}','${escHtml(n.title||"")}')"><i class="fa fa-trash"></i></button>
            </div>
          </div>
          <p style="color:#4A5C58;font-size:.85rem;margin:0">${escHtml((n.body||"").substring(0,120))}${(n.body||"").length>120?"...":""}</p>
        </div>
      </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load.</p>';});
}

function loadTeamList(){
  if(!window.RHS){setTimeout(loadTeamList,500);return;}
  const wrap=document.getElementById("teamListWrap");
  if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getTeam().then(res=>{
    if(!res.team||!res.team.length){wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No team members yet.</p>';return;}
    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    res.team.forEach(m=>{
      html+=`<div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap">
        ${m.photo?`<img src="${RHS.imgUrl?RHS.imgUrl(m.photo,160):m.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid #4CAF8A">`:`<div style="width:64px;height:64px;background:#E7DFD2;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-user" style="color:#8A9A96;font-size:1.4rem"></i></div>`}
        <div style="flex:1;min-width:160px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px">
            <div>
              <strong style="color:#14534F">${escHtml(m.name)}</strong>
              <span style="margin-left:6px;background:#EEF8F1;color:#14534F;padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">${escHtml(m.designation)}</span>
              ${m.order?`<span style="display:block;color:#8A9A96;font-size:.78rem;margin-top:2px"><i class="fa fa-sort-numeric-asc"></i> Order: ${m.order}</span>`:""}
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm" style="background:#14534F;color:#fff;border:none" onclick="openEditTeam('${m.id}','${escHtml(m.name)}','${escHtml(m.designation)}','${m.order||1}','${escHtml(m.bio||"")}','${m.photo||""}')"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-reject" onclick="deleteTeamMember('${m.id}','${escHtml(m.name)}')"><i class="fa fa-trash"></i></button>
            </div>
          </div>
          ${m.bio?`<p style="color:#4A5C58;font-size:.85rem;margin:0">${escHtml(m.bio)}</p>`:""}
        </div>
      </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load team.</p>';});
}

function deleteTeamMember(id,name){
  if(!confirm(`Delete "${name}" from team?`)) return;
  RHS.deleteTeamMember(id).then(()=>{
    loadTeamList();
    showMsg("teamMsg","✅ Member deleted.","success");
  }).catch(()=>showMsg("teamMsg","Failed to delete.","error"));
}

// ====== SLIDES ======
function previewSlideImage(input){
  const file=input.files?.[0]; if(!file) return;
  const isVideo = file.type && file.type.startsWith("video/");
  const url = URL.createObjectURL(file);
  const prev = document.getElementById("slideImagePreview");
  if (isVideo) {
    prev.innerHTML = `<video src="${url}" muted autoplay loop playsinline style="max-height:120px;border-radius:8px;object-fit:cover"></video>`;
  } else {
    prev.innerHTML = `<img src="${url}" style="max-height:120px;border-radius:8px;object-fit:cover">`;
  }
}

function clearSlideForm(){
  const titleEl=document.getElementById("slide-title"); if(titleEl) titleEl.value="";
  const orderEl=document.getElementById("slide-order"); if(orderEl) orderEl.value="1";
  const inp=document.getElementById("slide-image"); if(inp) inp.value="";
  const prev=document.getElementById("slideImagePreview");
  if(prev) prev.innerHTML=`<i class="fa fa-image" style="font-size:2rem;color:#4CAF8A;display:block;margin-bottom:8px"></i><span style="color:#14534F;font-size:.9rem">Tap to select slide image</span>`;
  showMsg("slideMsg","","");
}

async function addSlide(){
  if(!window.RHS) return;
  const title=document.getElementById("slide-title")?.value.trim()||"";
  const order=Number(document.getElementById("slide-order")?.value)||1;
  const mediaFile=document.getElementById("slide-image")?.files?.[0];
  const btn=document.querySelector('#setup-slides .btn-primary');
  if(!mediaFile){showMsg("slideMsg","⚠️ Slide Image/Video required.","error");return;}
  setLoading(btn,true,"Uploading...");
  let imageUrl="", type="image";
  try{
    const result = await RHS.uploadMedia(mediaFile,"rhs/slides");
    imageUrl = result.url; type = result.type;
  }catch(err){setLoading(btn,false);showMsg("slideMsg","⚠️ "+err.message,"error");return;}
  RHS.addSlide({title,imageUrl,type,order}).then(()=>{
    setLoading(btn,false);showMsg("slideMsg","✅ Slide added!","success");
    clearSlideForm();loadSlidesList();
  }).catch(()=>{setLoading(btn,false);showMsg("slideMsg","❌ Failed.","error");});
}

function loadSlidesList(){
  if(!window.RHS) return;
  const wrap=document.getElementById("slidesListWrap"); if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getSlides().then(res=>{
    if(!res.slides||!res.slides.length){wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No slides yet.</p>';return;}
    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    res.slides.forEach(s=>{
      html+=`<div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
        ${s.imageUrl
          ?`<div style="position:relative;width:90px;height:60px;flex-shrink:0">
              <img src="${RHS.imgUrl?RHS.imgUrl(s.imageUrl,220):s.imageUrl}" style="width:90px;height:60px;border-radius:8px;object-fit:cover;display:block">
              ${s.type==='video'?`<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25);border-radius:8px"><i class="fa fa-circle-play" style="color:#fff;font-size:1.3rem"></i></span>`:""}
            </div>`
          :`<div style="width:90px;height:60px;background:#E7DFD2;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-image" style="color:#8A9A96;font-size:1.5rem"></i></div>`}
        <div style="flex:1;min-width:160px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:flex-start">
            <div>
              <strong style="color:#14534F">${escHtml(s.title||s.heading||"No Title")}</strong>
              <span style="display:block;color:#8A9A96;font-size:.78rem;margin-top:2px"><i class="fa fa-sort-numeric-asc"></i> Order: ${s.order||1} ${s.type==='video'?' · <i class="fa fa-video"></i> Video':' · <i class=\"fa fa-image\"></i> Image'}</span>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm" style="background:#14534F;color:#fff;border:none" onclick="openEditSlide('${s.id}','${escHtml(s.title||s.heading||"")}','${s.order||1}','${s.imageUrl||""}','${s.type||"image"}')"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-reject" onclick="deleteSlideItem('${s.id}')"><i class="fa fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load.</p>';});
}

function deleteSlideItem(id){
  if(!confirm("Delete this slide?")) return;
  RHS.deleteSlide(id).then(()=>{loadSlidesList();showMsg("slideMsg","✅ Slide deleted.","success");})
    .catch(()=>showMsg("slideMsg","❌ Failed.","error"));
}

function openEditSlide(id,title,order,imageUrl,type){
  type = type || "image";
  const old=document.getElementById("slideEditModal"); if(old) old.remove();
  const modal=document.createElement("div");
  modal.id="slideEditModal";
  modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
  const currentPreview = imageUrl
    ? (type==='video'
        ? `<video src="${imageUrl}" muted autoplay loop playsinline style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px"></video>`
        : `<img src="${RHS.imgUrl?RHS.imgUrl(imageUrl,300):imageUrl}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px">`)
    : "";
  modal.innerHTML=`<div style="background:#fff;border-radius:12px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h3 style="color:#14534F;margin:0"><i class="fa fa-edit"></i> Edit Slide</h3>
      <button onclick="document.getElementById('slideEditModal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#8A9A96">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div><label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Title</label>
        <input id="edit-slide-title" value="${title}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Order No</label>
        <input id="edit-slide-order" type="number" value="${order}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:6px">Image/Video (change optional)</label>
        ${currentPreview}
        <input type="file" id="edit-slide-image" accept="image/*,video/*" style="display:block;width:100%;padding:10px;border:2px dashed #4CAF8A;border-radius:8px;background:#F5F9F8;cursor:pointer;box-sizing:border-box">
        <div id="edit-slide-preview" style="margin-top:6px"></div>
      </div>
      <p id="editSlideMsg" style="margin:0;font-size:.85rem;color:#D9483A"></p>
      <div style="display:flex;gap:10px">
        <button id="editSlideSaveBtn" class="btn btn-primary" style="flex:1" onclick="saveEditSlide('${id}','${imageUrl}','${type}')"><i class="fa fa-save"></i> Save</button>
        <button class="btn btn-ghost" onclick="document.getElementById('slideEditModal').remove()">Cancel</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById("edit-slide-image").addEventListener("change",function(){
    const file=this.files[0]; if(!file) return;
    const isVideo = file.type && file.type.startsWith("video/");
    const url = URL.createObjectURL(file);
    const prev = document.getElementById("edit-slide-preview");
    if (isVideo) {
      prev.innerHTML = `<video src="${url}" muted autoplay loop playsinline style="width:100%;height:80px;object-fit:cover;border-radius:8px"></video>`;
    } else {
      prev.innerHTML = `<img src="${url}" style="width:100%;height:80px;object-fit:cover;border-radius:8px">`;
    }
  });
}

async function saveEditSlide(id,existingImage,existingType){
  const title=document.getElementById("edit-slide-title")?.value.trim()||"";
  const order=Number(document.getElementById("edit-slide-order")?.value)||1;
  const mediaFile=document.getElementById("edit-slide-image")?.files?.[0];
  const msgEl=document.getElementById("editSlideMsg");
  const saveBtn=document.getElementById("editSlideSaveBtn");
  setLoading(saveBtn,true,"Saving...");if(msgEl)msgEl.textContent="";
  let imageUrl=existingImage, type=existingType||"image";
  if(mediaFile){
    try{
      const result = await RHS.uploadMedia(mediaFile,"rhs/slides");
      imageUrl = result.url; type = result.type;
    }catch(err){setLoading(saveBtn,false);if(msgEl)msgEl.textContent="⚠️ "+err.message;return;}
  }
  RHS.updateSlide(id,{title,imageUrl,type,order}).then(()=>{
    setLoading(saveBtn,false);document.getElementById("slideEditModal")?.remove();
    showMsg("slideMsg","✅ Slide updated!","success");loadSlidesList();
  }).catch(()=>{setLoading(saveBtn,false);if(msgEl)msgEl.textContent="⚠️ Failed.";});
}

// ====== DONATE US (Content + Bank Accounts) ======
function loadDonateAdmin(){
  if(!window.RHS){setTimeout(loadDonateAdmin,500);return;}
  RHS.getDonateContent().then(res=>{
    if(!res) return;
    const e=document.getElementById("donate-eyebrow"); if(e) e.value=res.eyebrow||"";
    const h=document.getElementById("donate-heading"); if(h) h.value=res.heading||"";
    const s=document.getElementById("donate-subheading"); if(s) s.value=res.subheading||"";
    const d=document.getElementById("donate-detail"); if(d) d.value=res.detail||"";
  }).catch(()=>{});
  loadBankAccountsAdmin();
}

function saveDonateContentAdmin(){
  if(!window.RHS) return;
  const eyebrow=document.getElementById("donate-eyebrow")?.value.trim()||"";
  const heading=document.getElementById("donate-heading")?.value.trim()||"";
  const subheading=document.getElementById("donate-subheading")?.value.trim()||"";
  const detail=document.getElementById("donate-detail")?.value.trim()||"";
  const btn=document.querySelector('#tab-donate .card:nth-child(1) .btn-primary');
  setLoading(btn,true,"Saving...");
  RHS.saveDonateContent({eyebrow,heading,subheading,detail}).then(()=>{
    setLoading(btn,false);
    showMsg("donateContentMsg","✅ Donate page content saved!","success");
  }).catch(()=>{
    setLoading(btn,false);
    showMsg("donateContentMsg","❌ Failed to save.","error");
  });
}

function clearBankForm(){
  ["bank-name","bank-title","bank-accno"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  showMsg("bankMsg","","");
}

function addBankAccountAdmin(){
  if(!window.RHS) return;
  const bankName=document.getElementById("bank-name")?.value.trim()||"";
  const accountTitle=document.getElementById("bank-title")?.value.trim()||"";
  const accountNo=document.getElementById("bank-accno")?.value.trim()||"";
  if(!bankName||!accountTitle||!accountNo){
    showMsg("bankMsg","⚠️ Bank Name, Title of Account and Account No are required.","error");
    return;
  }
  const btn=document.querySelector('#tab-donate .card:nth-child(2) .btn-primary');
  setLoading(btn,true,"Adding...");
  RHS.addBankAccount({bankName,accountTitle,accountNo}).then(()=>{
    setLoading(btn,false);
    showMsg("bankMsg","✅ Bank account added!","success");
    clearBankForm();loadBankAccountsAdmin();
  }).catch(()=>{
    setLoading(btn,false);
    showMsg("bankMsg","❌ Failed to add.","error");
  });
}

function loadBankAccountsAdmin(){
  if(!window.RHS) return;
  const wrap=document.getElementById("bankListWrap"); if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';
  RHS.getBankAccounts().then(res=>{
    if(!res.banks||!res.banks.length){
      wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No bank accounts added yet.</p>';
      return;
    }
    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    res.banks.forEach(b=>{
      html+=`<div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:10px;background:#14534F;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-building-columns"></i></div>
          <div>
            <strong style="color:#14534F;display:block">${escHtml(b.bankName||"")}</strong>
            <span style="display:block;color:#4A5C58;font-size:.82rem;margin-top:2px">${escHtml(b.accountTitle||"")}</span>
            <span style="display:block;color:#8A9A96;font-size:.8rem;margin-top:2px"><i class="fa fa-hashtag"></i> ${escHtml(b.accountNo||"")}</span>
          </div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" style="background:#14534F;color:#fff;border:none" onclick="openEditBank('${b.id}','${escHtml(b.bankName||"")}','${escHtml(b.accountTitle||"")}','${escHtml(b.accountNo||"")}')"><i class="fa fa-edit"></i></button>
          <button class="btn btn-sm btn-reject" onclick="deleteBankAccountAdmin('${b.id}')"><i class="fa fa-trash"></i></button>
        </div>
      </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load.</p>';});
}

function deleteBankAccountAdmin(id){
  if(!confirm("Delete this bank account?")) return;
  RHS.deleteBankAccount(id).then(()=>{
    loadBankAccountsAdmin();
    showMsg("bankMsg","✅ Bank account deleted.","success");
  }).catch(()=>showMsg("bankMsg","❌ Failed to delete.","error"));
}

function openEditBank(id,bankName,accountTitle,accountNo){
  const old=document.getElementById("bankEditModal"); if(old) old.remove();
  const modal=document.createElement("div");
  modal.id="bankEditModal";
  modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
  modal.innerHTML=`<div style="background:#fff;border-radius:12px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h3 style="color:#14534F;margin:0"><i class="fa fa-edit"></i> Edit Bank Account</h3>
      <button onclick="document.getElementById('bankEditModal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#8A9A96">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div><label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Bank Name</label>
        <input id="edit-bank-name" value="${bankName}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Title of Account</label>
        <input id="edit-bank-title" value="${accountTitle}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <div><label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Account No</label>
        <input id="edit-bank-accno" value="${accountNo}" style="width:100%;padding:10px;border:1px solid #E7DFD2;border-radius:8px;box-sizing:border-box"></div>
      <p id="editBankMsg" style="margin:0;font-size:.85rem;color:#D9483A"></p>
      <div style="display:flex;gap:10px">
        <button id="editBankSaveBtn" class="btn btn-primary" style="flex:1" onclick="saveEditBank('${id}')"><i class="fa fa-save"></i> Save</button>
        <button class="btn btn-ghost" onclick="document.getElementById('bankEditModal').remove()">Cancel</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function saveEditBank(id){
  const bankName=document.getElementById("edit-bank-name")?.value.trim()||"";
  const accountTitle=document.getElementById("edit-bank-title")?.value.trim()||"";
  const accountNo=document.getElementById("edit-bank-accno")?.value.trim()||"";
  const msgEl=document.getElementById("editBankMsg");
  const saveBtn=document.getElementById("editBankSaveBtn");
  if(!bankName||!accountTitle||!accountNo){ if(msgEl) msgEl.textContent="⚠️ All fields are required."; return; }
  setLoading(saveBtn,true,"Saving...");if(msgEl)msgEl.textContent="";
  RHS.updateBankAccount(id,{bankName,accountTitle,accountNo}).then(()=>{
    setLoading(saveBtn,false);document.getElementById("bankEditModal")?.remove();
    showMsg("bankMsg","✅ Bank account updated!","success");loadBankAccountsAdmin();
  }).catch(()=>{setLoading(saveBtn,false);if(msgEl)msgEl.textContent="⚠️ Failed.";});
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
      html+=`<div class="message-card" id="msg-${m.id}">
        <div class="msg-header">
          <span class="msg-name"><i class="fa fa-user"></i> ${escHtml(m.name||"")}</span>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="msg-date">${date}</span>
            <button class="btn btn-sm btn-reject" title="Delete" onclick="deleteMessage('${m.id}','${escHtml(m.name||"")}')">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="msg-email"><i class="fa fa-envelope"></i> ${escHtml(m.email||"")}</div>
        <div class="msg-text">${escHtml(m.message||"")}</div>
      </div>`;
    });
    wrap.innerHTML=html;
  }).catch(()=>{wrap.innerHTML='<div class="empty-state">Failed to load messages.</div>';});
}

function deleteMessage(id,name){
  if(!confirm(`"${name}" ka message delete karein?`)) return;
  if(!window.RHS?.deleteContactMessage){alert("Delete function not available.");return;}
  RHS.deleteContactMessage(id).then(()=>{
    const card=document.getElementById("msg-"+id);
    if(card) card.remove();
    const wrap=document.getElementById("messagesWrap");
    if(wrap&&!wrap.querySelector(".message-card")){
      wrap.innerHTML='<div class="empty-state"><i class="fa fa-envelope"></i><p>No messages yet.</p></div>';
    }
  }).catch(()=>alert("Failed to delete message."));
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
function quickStatus(id, status, name){
  if(!confirm(`Change ${name} status to "${status}"?`)) return;
  if(!window.RHS) return;
  RHS.updateMemberStatus(id, status).then(res=>{
    if(res.success){ loadMembers(currentMemberFilter); loadAdminStats(); }
    else alert(res.message||"Failed to update status.");
  }).catch(()=>alert("Network error. Please check your connection."));
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
  const photoHtml = m.photo
    ? `<img src="${RHS.imgUrl?RHS.imgUrl(m.photo,220):m.photo}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #14534F;display:block;margin:0 auto 16px" onerror="this.style.display='none'">`
    : `<div style="width:90px;height:90px;border-radius:50%;background:#EEF8F1;border:3px solid #14534F;display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><i class="fa fa-user" style="font-size:2rem;color:#8A9A96"></i></div>`;
  document.getElementById("memberModalBody").innerHTML=`
    ${photoHtml}
    <div class="detail-grid">
      <div class="detail-item"><span class="lbl">Registration No</span><span class="val">${escHtml(m.registrationNo)}</span></div>
      <div class="detail-item"><span class="lbl">Status</span><span class="val">${statusBadge(m.status)}</span></div>
      <div class="detail-item"><span class="lbl">CNIC</span><span class="val">${escHtml(m.cnic)}</span></div>
      <div class="detail-item"><span class="lbl">Date of Birth</span><span class="val">${escHtml(m.dob)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Full Name</span><span class="val">${escHtml(m.fullName)}</span></div>
      <div class="detail-item"><span class="lbl">Father / Husband</span><span class="val">${escHtml(m.fatherName)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Gender</span><span class="val">${escHtml(m.gender)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Profession</span><span class="val">${escHtml(m.profession)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Mobile</span><span class="val">${escHtml(m.mobile)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Email</span><span class="val">${escHtml(m.email)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Province</span><span class="val">${escHtml(m.province)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Membership Type</span><span class="val">${escHtml(m.membershipType)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Designation</span><span class="val">${escHtml(m.designation)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Registration Date</span><span class="val">${escHtml(m.timestamp)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Valid Upto</span><span class="val">${escHtml(m.validUpto)||"—"}</span></div>
      <div class="detail-item"><span class="lbl">Admin Comment</span><span class="val">${escHtml(m.adminComments)||"—"}</span></div>
      <div class="detail-item detail-full"><span class="lbl">Address</span><span class="val">${escHtml(m.address)||"—"}</span></div>
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
    <div style="margin-top:12px">
      <button class="btn btn-sm btn-ghost" style="border-color:var(--teal);color:var(--teal)" onclick="saveMembershipDetails('${m.id || m.row}')">
        <i class="fa fa-save"></i> Save Membership Type / Designation / Comment
      </button>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
      ${(()=>{
        const s=(m.status||"").toLowerCase();
        const docId = m.id || m.row;
        let btns="";
        if(s==="underprocess"||s==="under process"||s==="pending"){
          btns+=`<button class="btn btn-approve btn-sm" onclick="changeMemberStatus('${docId}','Active')"><i class="fa fa-check"></i> Approve → Active</button>`;
          btns+=`<button class="btn btn-ban btn-sm" onclick="changeMemberStatus('${docId}','Expired')"><i class="fa fa-clock"></i> Mark Expired</button>`;
          btns+=`<button class="btn btn-reject btn-sm" onclick="changeMemberStatus('${docId}','Banned')"><i class="fa fa-ban"></i> Ban</button>`;
        } else if(s==="active"){
          btns+=`<button class="btn btn-ban btn-sm" onclick="changeMemberStatus('${docId}','Expired')"><i class="fa fa-clock"></i> Mark Expired</button>`;
          btns+=`<button class="btn btn-reject btn-sm" onclick="changeMemberStatus('${docId}','Banned')"><i class="fa fa-ban"></i> Ban</button>`;
        } else if(s==="expired"){
          btns+=`<button class="btn btn-approve btn-sm" onclick="changeMemberStatus('${docId}','Active')"><i class="fa fa-check"></i> Activate</button>`;
          btns+=`<button class="btn btn-reject btn-sm" onclick="changeMemberStatus('${docId}','Banned')"><i class="fa fa-ban"></i> Ban</button>`;
        } else if(s==="banned"){
          btns+=`<button class="btn btn-approve btn-sm" onclick="changeMemberStatus('${docId}','Active')"><i class="fa fa-check"></i> Activate</button>`;
          btns+=`<button class="btn btn-ban btn-sm" onclick="changeMemberStatus('${docId}','Expired')"><i class="fa fa-clock"></i> Mark Expired</button>`;
        }
        return btns;
      })()}
    </div>
    <p class="form-msg" id="memberActionMsg"></p>`;
  document.getElementById("memberModal").classList.remove("hidden");
}

function changeMemberStatus(id, status){
  showMsg("memberActionMsg","Updating...","");
  if(!window.RHS){showMsg("memberActionMsg","System loading...","error");return;}
  // Carry over Membership Type / Designation / Admin Comment set in this modal at approval time
  const extra = {};
  const memType = document.getElementById("mMemType")?.value;
  const desig   = document.getElementById("mDesig")?.value?.trim();
  const comment = document.getElementById("mComment")?.value;
  if(memType) extra.membershipType = memType;
  if(desig)   extra.designation = desig;
  if(comment !== undefined && comment !== null) extra.adminComments = comment.trim();
  RHS.updateMemberStatus(id, status, extra).then(res=>{
    if(res.success){
      showMsg("memberActionMsg","✅ Status updated to: "+status,"success");
      loadMembers(currentMemberFilter);
      loadAdminStats();
    } else {
      showMsg("memberActionMsg",res.message||"Failed.","error");
    }
  }).catch(()=>showMsg("memberActionMsg","Network error. Please check connection.","error"));
}

// Save Membership Type / Designation / Admin Comment without changing status
function saveMembershipDetails(id){
  if(!window.RHS){showMsg("memberActionMsg","System loading...","error");return;}
  const data = {
    membershipType: document.getElementById("mMemType")?.value || "",
    designation:    document.getElementById("mDesig")?.value?.trim() || "",
    adminComments:  document.getElementById("mComment")?.value?.trim() || ""
  };
  showMsg("memberActionMsg","Saving...","");
  RHS.updateMemberDetails(id, data).then(res=>{
    if(res.success){
      showMsg("memberActionMsg","✅ Membership details saved!","success");
      loadMembers(currentMemberFilter);
    } else {
      showMsg("memberActionMsg",res.message||"Failed.","error");
    }
  }).catch(()=>showMsg("memberActionMsg","Network error. Please check connection.","error"));
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

function memberInitials(name){
  const parts = (name || "?").trim().split(/\s+/);
  return ((parts[0]?.[0]||"") + (parts[1]?.[0]||"")).toUpperCase() || "?";
}

function renderMembersTable(members, q = "") {
  const wrap = document.getElementById("membersTableWrap");
  if (!members.length) {
    wrap.innerHTML = '<div class="empty-state"><i class="fa fa-users"></i><p>No members found.</p></div>';
    return;
  }
  let html = '<div class="member-list">';
  members.forEach((m, i) => {
    const sb = statusBadge(m.status);
    const s = (m.status || "").toLowerCase();
    const docId = m.id || m.row;
    const mJson = JSON.stringify(m).replace(/'/g, "&#39;");
    let actionBtns = "";
    if (s === "underprocess" || s === "under process" || s === "pending") {
      actionBtns = `
        <button class="btn btn-sm btn-approve" onclick='quickStatus("${docId}","Active","${escHtml(m.fullName)}")' title="Approve"><i class="fa fa-check"></i></button>
        <button class="btn btn-sm btn-ban" onclick='quickStatus("${docId}","Expired","${escHtml(m.fullName)}")' title="Expired"><i class="fa fa-clock"></i></button>
        <button class="btn btn-sm btn-reject" onclick='quickStatus("${docId}","Banned","${escHtml(m.fullName)}")' title="Ban"><i class="fa fa-ban"></i></button>`;
    } else if (s === "active") {
      actionBtns = `
        <button class="btn btn-sm btn-ban" onclick='quickStatus("${docId}","Expired","${escHtml(m.fullName)}")' title="Mark Expired"><i class="fa fa-clock"></i></button>
        <button class="btn btn-sm btn-reject" onclick='quickStatus("${docId}","Banned","${escHtml(m.fullName)}")' title="Ban"><i class="fa fa-ban"></i></button>`;
    } else if (s === "expired") {
      actionBtns = `
        <button class="btn btn-sm btn-approve" onclick='quickStatus("${docId}","Active","${escHtml(m.fullName)}")' title="Activate"><i class="fa fa-check"></i></button>
        <button class="btn btn-sm btn-reject" onclick='quickStatus("${docId}","Banned","${escHtml(m.fullName)}")' title="Ban"><i class="fa fa-ban"></i></button>`;
    } else if (s === "banned") {
      actionBtns = `
        <button class="btn btn-sm btn-approve" onclick='quickStatus("${docId}","Active","${escHtml(m.fullName)}")' title="Activate"><i class="fa fa-check"></i></button>
        <button class="btn btn-sm btn-ban" onclick='quickStatus("${docId}","Expired","${escHtml(m.fullName)}")' title="Mark Expired"><i class="fa fa-clock"></i></button>`;
    }
    html += `
    <div class="member-card">
      <div class="member-card-top">
        ${m.photo
          ? `<img src="${RHS.imgUrl?RHS.imgUrl(m.photo,120):m.photo}" class="member-avatar" style="object-fit:cover;border-radius:50%;background:#EEF8F1" onerror="this.outerHTML='<div class=\\'member-avatar\\'>${memberInitials(m.fullName)}</div>'">`
          : `<div class="member-avatar">${memberInitials(m.fullName)}</div>`}
        <div class="member-card-info">
          <div class="member-card-name">${highlight(m.fullName, q)}</div>
          <div class="member-card-sub"><code>${highlight(m.cnic, q)}</code> &nbsp;·&nbsp; ${escHtml(m.gender)||"—"}</div>
        </div>
        <div class="member-card-status">${sb}</div>
      </div>
      <div class="member-card-meta">
        <div><i class="fa fa-hashtag"></i> ${highlight(m.registrationNo, q)}</div>
        <div><i class="fa fa-phone"></i> ${highlight(m.mobile, q)}</div>
        <div><i class="fa fa-calendar-check"></i> ${m.validUpto || "—"}</div>
      </div>
      <div class="member-card-actions">
        ${actionBtns}
        <button class="btn btn-sm btn-ghost" onclick='viewMember(${mJson})' title="View Detail"><i class="fa fa-eye"></i> View</button>
        <button class="btn btn-sm btn-edit" onclick='editMember(${mJson})' title="Edit Member"><i class="fa fa-pen"></i> Edit</button>
      </div>
    </div>`;
  });
  html += "</div>";
  wrap.innerHTML = html;
}

// ====== EDIT MEMBER (full field editor) ======
function editMember(m){
  const id = m.id || m.row;
  document.getElementById("modalMemberName").textContent = "Edit Member — " + (m.fullName || "");
  document.getElementById("memberModalBody").innerHTML = `
    <div class="field detail-full" style="margin-bottom:16px">
      <label class="lbl" style="margin-bottom:6px">Member Photo</label>
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div id="em-photo-preview" style="width:64px;height:64px;border-radius:50%;flex-shrink:0;overflow:hidden;background:#F5F9F8;border:2px solid var(--teal);display:flex;align-items:center;justify-content:center">
          ${m.photo ? `<img src="${RHS.imgUrl?RHS.imgUrl(m.photo,120):m.photo}" style="width:100%;height:100%;object-fit:cover">` : `<i class="fa fa-user" style="color:#8A9A96;font-size:1.4rem"></i>`}
        </div>
        <div style="flex:1;min-width:180px">
          <label for="em-photoFile" style="display:block;padding:10px 14px;background:#F5F9F8;border:2px dashed #4CAF8A;border-radius:8px;cursor:pointer;text-align:center;font-size:.85rem;color:#14534F">
            <i class="fa fa-camera"></i> Tap to change photo
            <input type="file" id="em-photoFile" accept="image/*" style="display:none" onchange="previewEditMemberPhoto(this)">
          </label>
          <p style="font-size:.75rem;color:#8A9A96;margin-top:4px">Leave empty to keep the current photo.</p>
        </div>
      </div>
    </div>
    <div class="detail-grid">
      <div class="field"><label class="lbl" style="margin-bottom:4px">Full Name</label>
        <input class="modal-input" id="em-fullName" value="${escHtml(m.fullName||"")}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">CNIC</label>
        <input class="modal-input" id="em-cnic" value="${escHtml(m.cnic||"")}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Date of Birth</label>
        <input class="modal-input" type="date" id="em-dob" value="${escHtml(toInputDate(m.dob))}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Gender</label>
        <select class="modal-input" id="em-gender">
          <option value="Male" ${m.gender==="Male"?"selected":""}>Male</option>
          <option value="Female" ${m.gender==="Female"?"selected":""}>Female</option>
          <option value="Other" ${m.gender==="Other"?"selected":""}>Other</option>
        </select></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Profession</label>
        <input class="modal-input" id="em-profession" value="${escHtml(m.profession||"")}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Mobile</label>
        <input class="modal-input" id="em-mobile" value="${escHtml(m.mobile||"")}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Email</label>
        <input class="modal-input" id="em-email" value="${escHtml(m.email||"")}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Father / Husband</label>
        <input class="modal-input" id="em-fatherName" value="${escHtml(m.fatherName||"")}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Province</label>
        <input class="modal-input" id="em-province" value="${escHtml(m.province||"")}"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Valid Upto</label>
        <input class="modal-input" type="date" id="em-validUpto" value="${escHtml(toInputDate(m.validUpto))}"></div>
      <div class="field detail-full"><label class="lbl" style="margin-bottom:4px">Address</label>
        <textarea class="modal-input" id="em-address" rows="2">${escHtml(m.address||"")}</textarea></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Membership Type</label>
        <select class="modal-input" id="em-membershipType">
          <option value="">— Select —</option>
          <option value="Executive Body Member" ${m.membershipType==="Executive Body Member"?"selected":""}>Executive Body Member</option>
          <option value="General Body Member" ${m.membershipType==="General Body Member"?"selected":""}>General Body Member</option>
          <option value="Associate Member" ${m.membershipType==="Associate Member"?"selected":""}>Associate Member</option>
        </select></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Designation</label>
        <input class="modal-input" id="em-designation" value="${escHtml(m.designation||"")}" placeholder="e.g. President"></div>
      <div class="field"><label class="lbl" style="margin-bottom:4px">Status</label>
        <select class="modal-input" id="em-status">
          ${["Underprocess","Active","Expired","Banned"].map(s=>`<option value="${s}" ${m.status===s?"selected":""}>${s}</option>`).join("")}
        </select></div>
      <div class="field detail-full"><label class="lbl" style="margin-bottom:4px">Admin Comment</label>
        <input class="modal-input" id="em-adminComments" value="${escHtml(m.adminComments||"")}" placeholder="Optional note"></div>
    </div>
    <div style="margin-top:20px">
      <button class="btn btn-primary w-full" onclick="saveMemberEdit('${id}')"><i class="fa fa-save"></i> Save Changes</button>
    </div>
    <p class="form-msg" id="memberActionMsg"></p>`;
  document.getElementById("memberModal").classList.remove("hidden");
}

function previewEditMemberPhoto(input){
  const file = input.files?.[0];
  if(!file) return;
  const preview = document.getElementById("em-photo-preview");
  if(!preview) return;
  const reader = new FileReader();
  reader.onload = e => { preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover">`; };
  reader.readAsDataURL(file);
}

async function saveMemberEdit(id){
  if(!window.RHS){showMsg("memberActionMsg","System loading...","error");return;}
  const val = (k)=>document.getElementById("em-"+k)?.value?.trim() || "";
  const data = {
    fullName: val("fullName"), cnic: val("cnic"), dob: formatDateForServer(val("dob")), gender: val("gender"),
    profession: val("profession"), mobile: val("mobile"), email: val("email"),
    fatherName: val("fatherName"), province: val("province"), address: val("address"),
    membershipType: val("membershipType"), designation: val("designation"),
    validUpto: formatDateForServer(val("validUpto")), status: val("status"), adminComments: val("adminComments")
  };
  if(!data.fullName || !data.cnic){ showMsg("memberActionMsg","Full Name and CNIC are required.","error"); return; }

  const saveBtn = document.querySelector('#memberModalBody .btn-primary');
  const photoFile = document.getElementById("em-photoFile")?.files?.[0];

  showMsg("memberActionMsg", photoFile ? "Uploading photo..." : "Saving...", "");
  setLoading(saveBtn, true, "Saving...");

  if (photoFile) {
    try {
      data.photo = await RHS.uploadImage(photoFile, "rhs/members");
    } catch (e) {
      setLoading(saveBtn, false);
      showMsg("memberActionMsg", "⚠️ Photo upload failed: " + (e.message || "please try again."), "error");
      return;
    }
  }

  RHS.updateMemberDetails(id, data).then(res=>{
    setLoading(saveBtn, false);
    if(res.success){
      showMsg("memberActionMsg","✅ Member updated successfully!","success");
      loadMembers(currentMemberFilter);
      loadAdminStats();
      setTimeout(()=>closeModal("memberModal"), 900);
    } else {
      showMsg("memberActionMsg",res.message||"Failed to update.","error");
    }
  }).catch(()=>{
    setLoading(saveBtn, false);
    showMsg("memberActionMsg","Network error. Please check connection.","error");
  });
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

// Converts a stored dd-mm-yyyy date string to yyyy-mm-dd so native <input type="date">
// fields can display it correctly. Native date inputs only accept/emit yyyy-mm-dd.
function toInputDate(dmy){
  if(!dmy)return"";
  const p=dmy.split("-");
  if(p.length===3 && p[0].length===2 && p[2].length===4)return p[2]+"-"+p[1]+"-"+p[0];
  return dmy; // already yyyy-mm-dd or unrecognized, leave as-is
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
      <button class="btn btn-assign btn-sm" onclick="doAssignGrant('${g.id}')"  ><i class="fa fa-user-tag"></i> Assign Case</button>
      `:""}

      ${stLower==="assigned"||stLower==="completed"?`
      <div style="margin-top:14px">
        <label style="font-size:0.82rem;font-weight:600;color:#8A9A96;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:6px">
          <i class="fa fa-comment-alt"></i> Verification Notes / Comments
        </label>
        <textarea id="verifyComment" rows="3" class="modal-input" style="width:100%;resize:vertical;font-family:'Inter',sans-serif;font-size:0.9rem" 
          placeholder="Write your verification notes here... e.g. Physically visited, documents checked, beneficiary confirmed...">${g.decisionNote&&g.decisionNote.startsWith("Verification Notes:")?g.decisionNote.replace("Verification Notes:","").trim():""}</textarea>
      </div>
      ${stLower==="assigned"?`<button class="btn btn-sm" style="background:#F0EBFF;color:#6D28D9;border:1px solid #C4B5FD;margin-top:10px" onclick="doVerificationComplete('${g.id}')"  >
        <i class="fa fa-clipboard-check"></i> Mark Verification Complete → Case Completed
      </button>`:""}
      `:""}

      ${stLower==="completed"?`
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        <button class="btn btn-approve btn-sm" onclick="doDecision('${g.id}','Approved','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-check-circle"></i> ✅ Case Approved</button>
        <button class="btn btn-reject btn-sm" onclick="doDecision('${g.id}','Rejected','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-times-circle"></i> ❌ Case Rejected</button>
      </div>`:""}

      ${g.verificationStatus==="Completed"&&decLower!==""&&decLower!=="approved"&&decLower!=="rejected"?`
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        <button class="btn btn-approve btn-sm" onclick="doDecision('${g.id}','Approved','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-check-circle"></i> Approve</button>
        <button class="btn btn-reject btn-sm" onclick="doDecision('${g.id}','Rejected','${escHtml(g.name)}','${escHtml(g.crn)}')"><i class="fa fa-times-circle"></i> Reject</button>
      </div>`:""}

      ${decLower==="approved"&&stLower!=="closed"?`
      <button class="btn btn-sm" style="background:#1F2E2B;color:#fff;margin-top:10px" onclick="doCloseGrant('${g.id}')"  >
        <i class="fa fa-lock"></i> Close — Successfully Granted
      </button>`:""}
    </div>`:""}

    ${stLower==="rejected"?`
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
      <button class="btn btn-sm" style="background:#1F2E2B;color:#fff" onclick="doCloseGrant('${g.id}')"  >
        <i class="fa fa-lock"></i> Close Case
      </button>
      <button class="btn btn-assign btn-sm" onclick="doSendBackToCompleted('${g.id}')"  >
        <i class="fa fa-undo"></i> Send Back to Completed
      </button>
    </div>`:""}

    ${stLower==="closed"?`
    <div style="margin-top:16px">
      ${decLower==="rejected"?`
      <button class="btn btn-approve btn-sm" onclick="doReopenGrant('${g.id}')"  >
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
      <div style="background:#F5F9F8;border-radius:14px;padding:20px;margin-bottom:18px;border:1.5px solid #D8E8E5">
        <p style="font-size:0.82rem;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:.07em;margin-bottom:14px;display:flex;align-items:center;gap:7px">
          <i class="fa fa-plus-circle"></i> Add New Expense
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:0.82rem;font-weight:600;color:#4A5C58;display:block;margin-bottom:6px">📅 Date <span style='color:#D9483A'>*</span></label>
            <input type="date" id="expDate" style="width:100%;padding:11px 13px;border:1.5px solid #C8D5D3;border-radius:10px;font-size:0.95rem;box-sizing:border-box;background:#fff" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <label style="font-size:0.82rem;font-weight:600;color:#4A5C58;display:block;margin-bottom:6px">💰 Amount (Rs.) <span style='color:#D9483A'>*</span></label>
            <input type="number" id="expAmount" style="width:100%;padding:11px 13px;border:1.5px solid #C8D5D3;border-radius:10px;font-size:0.95rem;box-sizing:border-box;background:#fff" placeholder="e.g. 5000" min="1">
          </div>
        </div>
        <div style="margin-bottom:14px">
          <label style="font-size:0.82rem;font-weight:600;color:#4A5C58;display:block;margin-bottom:6px">📝 Expense Detail <span style='color:#D9483A'>*</span></label>
          <textarea id="expDetail" rows="3" style="width:100%;padding:11px 13px;border:1.5px solid #C8D5D3;border-radius:10px;font-size:0.95rem;box-sizing:border-box;background:#fff;resize:vertical;font-family:inherit;line-height:1.5" placeholder="e.g. Cement 10 bags, Labour charges, Material transport, Plumbing work..."></textarea>
        </div>
        <button id="addExpenseBtn" class="btn btn-primary" style="width:100%;padding:13px;font-size:1rem" onclick="addCaseExpense('${escHtml(g.crn)}','${escHtml(g.cnic)}','${escHtml(g.dob)}','${escHtml(g.name)}','${escHtml(g.fatherName)}','${escHtml(g.gender)}','${escHtml(g.email)}','${escHtml(g.mobile)}','${escHtml(g.address)}','${escHtml(g.helpType)}')">
          <i class="fa fa-plus"></i> Add Expense & Debit Cash Book
        </button>
        <p class="form-msg" id="expMsg" style="margin-top:10px;font-size:0.9rem"></p>
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

function doAssignGrant(id){
  const name=document.getElementById("gAssignName")?.value.trim()||"";
  const contact=document.getElementById("gAssignContact")?.value.trim()||"";
  if(!name||!contact){showMsg("grantActionMsg","Please enter name and contact.","error");return;}
  showMsg("grantActionMsg","Assigning...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(id,{status:"Assigned",assignedTo:name,assignedContact:contact}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case assigned to "+name,"success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error. Please check connection.","error"));
}

function doVerificationComplete(id){
  const comment = document.getElementById("verifyComment")?.value?.trim() || "";
  const btn = document.querySelector(`button[onclick="doVerificationComplete('${id}')"]`);
  setLoading(btn, true, "Saving...");
  showMsg("grantActionMsg","Updating...","");
  if(!window.RHS){setLoading(btn,false);showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(id,{
    verificationStatus:"Completed",
    status:"Completed",
    decisionNote: comment ? "Verification Notes: "+comment : ""
  }).then(res=>{
    setLoading(btn, false);
    if(res.success){
      showMsg("grantActionMsg","✅ Case moved to Case Completed tab"+(comment?" with notes.":"."), "success");
      loadGrants(currentGrantFilter); loadAdminStats();
    } else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>{setLoading(btn, false);showMsg("grantActionMsg","Network error. Please check connection.","error");});
}

function doDecision(id,decision,name,crn){
  showMsg("grantActionMsg","Processing...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  const ph=window.NGO.alert||window.NGO.phone;
  const em=window.NGO.email;
  const note=decision==="Approved"
    ?`Dear ${name}, Congratulations! 🎉 Your Charity Case ${crn} has been Successfully Approved. Our team will contact you at your doorstep. Jazak Allah Khair!\n\n📞 ${ph} | 📧 ${em}`
    :`Dear ${name}, Unfortunately your Case ${crn} does not qualify under our current criteria. Your case has been Rejected.\n\nTo appeal, please physically meet our President with Case No: ${crn}.\n\n📞 ${ph} | 📧 ${em}`;
  RHS.updateGrant(id,{decision:decision,decisionNote:note}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Decision recorded: "+decision,"success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error. Please check connection.","error"));
}

function doCloseGrant(id){
  showMsg("grantActionMsg","Closing case...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(id,{status:"Closed",decisionNote:"Successfully Granted & Closed"}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case closed — Successfully Granted.","success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error. Please check connection.","error"));
}

function doSendBackToCompleted(id){
  showMsg("grantActionMsg","Sending back...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(id,{status:"Completed",decision:"",decisionNote:""}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case sent back to Case Completed tab.","success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error. Please check connection.","error"));
}

function doReopenGrant(id){
  showMsg("grantActionMsg","Reopening...","");
  if(!window.RHS){showMsg("grantActionMsg","System loading...","error");return;}
  RHS.updateGrant(id,{status:"Completed",decision:"",decisionNote:""}).then(res=>{
    if(res.success){showMsg("grantActionMsg","✅ Case reopened → Case Completed tab.","success");loadGrants(currentGrantFilter);loadAdminStats();}
    else showMsg("grantActionMsg",res.message||"Failed.","error");
  }).catch(()=>showMsg("grantActionMsg","Network error. Please check connection.","error"));
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
  const btn = document.getElementById("addExpenseBtn");
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

/* ============================================================
   VALIDATION RULES — Admin Panel
   ============================================================ */

function loadValidationRules() {
  const wrap = document.getElementById("validationRulesWrap");
  if (!wrap) return;
  if (!window.RHS) { setTimeout(loadValidationRules, 600); return; }
  RHS.getValidationRules().then(res => {
    if (!res.success || !res.rules || !res.rules.length) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:24px;color:#8A9A96;border:2px dashed var(--line);border-radius:10px">
          <i class="fa fa-shield-halved" style="font-size:2rem;display:block;margin-bottom:8px"></i>
          No rules added yet. Add your first rule below.
        </div>`;
      return;
    }
    let html = `
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch">
      <table style="width:100%;min-width:560px;border-collapse:collapse;font-family:sans-serif;font-size:.9rem">
        <thead>
          <tr style="background:#14534F;color:#fff">
            <th style="padding:10px 14px;text-align:left">Amount Range (Rs.)</th>
            <th style="padding:10px 14px;text-align:left">Validity Days</th>
            <th style="padding:10px 14px;text-align:left">Effective Date</th>
            <th style="padding:10px 14px;text-align:left">Added By</th>
            <th style="padding:10px 14px;text-align:center">Action</th>
          </tr>
        </thead>
        <tbody>`;
    res.rules.forEach((r, i) => {
      html += `
        <tr style="background:${i%2?"#F5F9F8":"#fff"};border-bottom:1px solid #E7DFD2">
          <td style="padding:10px 14px;font-weight:600;color:#14534F">
            Rs. ${Number(r.minAmount).toLocaleString()} – Rs. ${Number(r.maxAmount).toLocaleString()}
          </td>
          <td style="padding:10px 14px">
            <span style="background:#EEF8F1;color:#2E9E5B;font-weight:700;padding:3px 10px;border-radius:20px;font-size:.85rem">
              ${r.days} Days
            </span>
          </td>
          <td style="padding:10px 14px;color:#555">${r.effectiveDate || "—"}</td>
          <td style="padding:10px 14px;color:#8A9A96;font-size:.82rem">${r.addedBy || "Admin"}</td>
          <td style="padding:10px 14px;text-align:center">
            <button class="btn btn-sm btn-reject" onclick="deleteValidationRule('${r.id}')" title="Delete Rule">
              <i class="fa fa-trash"></i> Delete
            </button>
          </td>
        </tr>`;
    });
    html += `</tbody></table></div>
      <p style="font-size:.78rem;color:#8A9A96;margin-top:8px;font-style:italic">
        <i class="fa fa-info-circle"></i> ${res.rules.length} rule(s) active. New donations will use the matching range rule.
      </p>`;
    wrap.innerHTML = html;
  }).catch(() => {
    if (wrap) wrap.innerHTML = `<div style="color:#D9483A;padding:12px">Failed to load rules. Please refresh.</div>`;
  });
}

function addValidationRule() {
  const minA = parseInt(document.getElementById("vr-minAmount")?.value || 0);
  const maxA = parseInt(document.getElementById("vr-maxAmount")?.value || 0);
  const days = parseInt(document.getElementById("vr-days")?.value || 0);
  const msg  = document.getElementById("vrMsg");
  if (!minA || !maxA || !days) { if(msg){msg.textContent="⚠️ All fields are required.";msg.className="form-msg error";} return; }
  if (minA >= maxA) { if(msg){msg.textContent="⚠️ Min Amount must be less than Max Amount.";msg.className="form-msg error";} return; }
  if (days < 1)    { if(msg){msg.textContent="⚠️ Validity Days must be at least 1.";msg.className="form-msg error";} return; }
  if(msg){msg.textContent="Saving...";msg.className="form-msg";}
  const addBtn = document.querySelector("#setup-validationRules .btn-primary");
  setLoading(addBtn, true, "Adding...");
  if (!window.RHS) { setLoading(addBtn, false); return; }
  RHS.addValidationRule({ minAmount: minA, maxAmount: maxA, days }).then(res => {
    setLoading(addBtn, false);
    if (res.success) {
      if(msg){msg.textContent="✅ Rule added successfully!";msg.className="form-msg success";}
      document.getElementById("vr-minAmount").value = "";
      document.getElementById("vr-maxAmount").value = "";
      document.getElementById("vr-days").value = "";
      loadValidationRules();
      setTimeout(() => { if(msg) msg.textContent=""; }, 3000);
    } else {
      if(msg){msg.textContent=res.message||"Failed.";msg.className="form-msg error";}
    }
  }).catch(() => {
    setLoading(addBtn, false);
    if(msg){msg.textContent="Network error.";msg.className="form-msg error";}
  });
}

function deleteValidationRule(id) {
  if (!confirm("Delete this validation rule?")) return;
  if (!window.RHS) return;
  RHS.deleteValidationRule(id).then(res => {
    if (res.success) loadValidationRules();
    else alert("Failed to delete: " + (res.message || ""));
  }).catch(() => alert("Network error."));
}

// Load rules when setup tab opens
const _origShowSetupSection = window.showSetupSection;
window.showSetupSection = function(name, btn) {
  if (_origShowSetupSection) _origShowSetupSection(name, btn);
  if (name === "validationRules") loadValidationRules();
};
