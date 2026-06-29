/* ============================================================
   ADMIN.JS PATCH — Slides / Impact Stories / News Feed Lists
   Sirf yeh functions apne admin.js mein add/replace karo
   ============================================================ */

// ====== 1. loadSetupData() — REPLACE existing function ======
// Is mein loadSlidesList(), loadStoriesList(), loadNewsList() calls add kiye hain

function loadSetupData(){
  if(!window.RHS){setTimeout(loadSetupData,500);return;}

  // NGO Settings
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

  // Content
  RHS.getContent && RHS.getContent().then(res=>{
    if(!res) return;
    const fields={
      "set-heroEyebrow":res.heroEyebrow||"","set-heroHeading":res.heroHeading||"",
      "set-heroText":res.heroText||"","set-aboutTitle":res.aboutTitle||"",
      "set-aboutText":res.aboutText||""
    };
    Object.entries(fields).forEach(([id,val])=>{
      const el=document.getElementById(id); if(el) el.value=val;
    });
  }).catch(()=>{});

  // Statistics
  RHS.getStatistics().then(res=>{
    if(!res) return;
    ["members","families","projects","volunteers"].forEach(k=>{
      const el=document.getElementById("set-"+k);
      if(el) el.value=res[k]||0;
    });
  }).catch(()=>{});

  // Contact
  RHS.getContact().then(res=>{
    if(!res) return;
    ["facebook","instagram","whatsapp","youtube"].forEach(k=>{
      const el=document.getElementById("set-"+k);
      if(el) el.value=res[k]||"";
    });
  }).catch(()=>{});

  // Lists — yeh naye calls hain
  loadTeamList();
  loadSlidesList();
  loadStoriesList();
  loadNewsList();
}


// ====== 2. loadSlidesList() — NAYA FUNCTION ======
function loadSlidesList(){
  if(!window.RHS){setTimeout(loadSlidesList,500);return;}
  const wrap=document.getElementById("slidesListWrap"); if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading slides...</div>';

  RHS.getSlides().then(res=>{
    const slides = res.slides || res || [];
    if(!slides.length){
      wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No slides yet.</p>';
      return;
    }
    // Order ke mutabiq sort
    const sorted = [...slides].sort((a,b)=>(a.order||99)-(b.order||99));

    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    sorted.forEach(s=>{
      html+=`
        <div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          ${s.imageUrl
            ? `<img src="${s.imageUrl}" style="width:80px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0;border:1.5px solid #4CAF8A">`
            : `<div style="width:80px;height:56px;background:#E7DFD2;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-image" style="color:#8A9A96;font-size:1.4rem"></i></div>`
          }
          <div style="flex:1;min-width:140px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div>
                <strong style="color:#14534F">${s.title ? escHtml(s.title) : '<span style="color:#8A9A96;font-style:italic">No title</span>'}</strong>
                <span style="margin-left:8px;background:#EEF8F1;color:#14534F;padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">
                  <i class="fa fa-sort-numeric-asc"></i> Order: ${s.order||'—'}
                </span>
              </div>
              <button class="btn btn-sm btn-reject" onclick="deleteSlideItem('${s.id}')">
                <i class="fa fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(e=>{
    wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load slides.</p>';
  });
}

// Slide delete
function deleteSlideItem(id){
  if(!confirm("Delete this slide?")) return;
  RHS.deleteSlide(id).then(()=>{
    loadSlidesList();
    showMsg("slideMsg","✅ Slide deleted.","success");
  }).catch(()=>showMsg("slideMsg","Failed to delete.","error"));
}

// Slide image preview
function previewSlideImage(input){
  const file=input.files?.[0];
  const preview=document.getElementById("slideImagePreview");
  if(!preview) return;
  if(!file){ preview.innerHTML='<i class="fa fa-image" style="font-size:2rem;color:#4CAF8A;display:block;margin-bottom:8px"></i><span style="color:#14534F;font-size:.9rem">Tap to select slide image</span>'; return; }
  const reader=new FileReader();
  reader.onload=e=>{
    preview.innerHTML=`<img src="${e.target.result}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;display:block">`;
  };
  reader.readAsDataURL(file);
}

// Slide clear form
function clearSlideForm(){
  const titleEl=document.getElementById("slide-title"); if(titleEl) titleEl.value="";
  const orderEl=document.getElementById("slide-order"); if(orderEl) orderEl.value="1";
  const imgEl=document.getElementById("slide-image"); if(imgEl) imgEl.value="";
  const preview=document.getElementById("slideImagePreview");
  if(preview) preview.innerHTML='<i class="fa fa-image" style="font-size:2rem;color:#4CAF8A;display:block;margin-bottom:8px"></i><span style="color:#14534F;font-size:.9rem">Tap to select slide image</span>';
  showMsg("slideMsg","","");
}

// Add Slide
async function addSlide(){
  if(!window.RHS){showMsg("slideMsg","System loading...","error");return;}
  const title  = document.getElementById("slide-title")?.value.trim()||"";
  const order  = Number(document.getElementById("slide-order")?.value)||1;
  const imgFile= document.getElementById("slide-image")?.files?.[0];

  if(!imgFile){showMsg("slideMsg","⚠️ Please select a slide image.","error");return;}

  const btn=document.querySelector('#setup-slides .btn-primary');
  setLoading(btn,true,"Uploading...");

  let imageUrl="";
  try{
    imageUrl = await RHS.uploadImage(imgFile,"rhs/slides");
  }catch(e){
    setLoading(btn,false);
    showMsg("slideMsg","⚠️ Image upload failed: "+e.message,"error");
    return;
  }

  RHS.addSlide({title, order, imageUrl}).then(()=>{
    setLoading(btn,false);
    showMsg("slideMsg","✅ Slide added!","success");
    clearSlideForm();
    loadSlidesList();
  }).catch(()=>{
    setLoading(btn,false);
    showMsg("slideMsg","Failed to save slide.","error");
  });
}


// ====== 3. loadStoriesList() — REPLACE existing (same logic, already theek tha) ======
function loadStoriesList(){
  if(!window.RHS){setTimeout(loadStoriesList,500);return;}
  const wrap=document.getElementById("storiesListWrap"); if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading stories...</div>';

  RHS.getStories().then(res=>{
    const stories = res.stories || res || [];
    if(!stories.length){
      wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No impact stories yet.</p>';
      return;
    }
    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    stories.forEach(s=>{
      html+=`
        <div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap">
          ${s.imageUrl
            ? `<img src="${s.imageUrl}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0">`
            : `<div style="width:64px;height:64px;background:#E7DFD2;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-image" style="color:#8A9A96"></i></div>`
          }
          <div style="flex:1;min-width:160px">
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px">
              <div>
                <strong style="color:#14534F">${escHtml(s.name||"")}</strong>
                ${s.category?`<span style="margin-left:6px;background:#EEF8F1;color:#14534F;padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">${escHtml(s.category)}</span>`:""}
                ${s.location?`<span style="display:block;color:#8A9A96;font-size:.78rem;margin-top:2px"><i class="fa fa-map-marker-alt"></i> ${escHtml(s.location)}</span>`:""}
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm btn-reject" onclick="deleteStoryItem('${s.id}','${escHtml(s.name||"")}')">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
            <p style="color:#4A5C58;font-size:.85rem;margin:0">${escHtml((s.text||"").substring(0,120))}${(s.text||"").length>120?"...":""}</p>
          </div>
        </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(()=>{
    wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load stories.</p>';
  });
}

// Story delete
function deleteStoryItem(id, name){
  if(!confirm(`Delete story of "${name}"?`)) return;
  RHS.deleteStory(id).then(()=>{
    loadStoriesList();
    showMsg("storyMsg","✅ Story deleted.","success");
  }).catch(()=>showMsg("storyMsg","Failed to delete.","error"));
}

// Add Story
async function addStoryItem(){
  if(!window.RHS){showMsg("storyMsg","System loading...","error");return;}
  const name    = document.getElementById("story-name")?.value.trim();
  const text    = document.getElementById("story-text")?.value.trim();
  const category= document.getElementById("story-category")?.value.trim()||"";
  const location= document.getElementById("story-location")?.value.trim()||"";
  if(!name||!text){showMsg("storyMsg","⚠️ Name aur Story required.","error");return;}

  const btn=document.getElementById("addStoryBtn");
  setLoading(btn,true,"Saving...");

  let imageUrl="";
  const imgFile=document.getElementById("story-imageFile")?.files?.[0];
  if(imgFile){
    try{imageUrl=await RHS.uploadImage(imgFile,"rhs/stories");}
    catch(e){setLoading(btn,false);showMsg("storyMsg","⚠️ Upload failed: "+e.message,"error");return;}
  }

  RHS.addStory({name,text,category,location,imageUrl}).then(()=>{
    setLoading(btn,false);
    showMsg("storyMsg","✅ Story added!","success");
    clearStoryForm();
    loadStoriesList();
  }).catch(()=>{setLoading(btn,false);showMsg("storyMsg","Failed to save.","error");});
}

function clearStoryForm(){
  ["story-name","story-text","story-category","story-location"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  const imgEl=document.getElementById("story-imageFile"); if(imgEl) imgEl.value="";
  const prev=document.getElementById("storyImagePreview");
  if(prev) prev.innerHTML='<i class="fa fa-image" style="font-size:1.5rem;color:#4CAF8A;display:block;margin-bottom:6px"></i><span style="color:#14534F;font-size:.88rem">Tap to upload photo</span>';
  showMsg("storyMsg","","");
}


// ====== 4. loadNewsList() — REPLACE existing ======
function loadNewsList(){
  if(!window.RHS){setTimeout(loadNewsList,500);return;}
  const wrap=document.getElementById("newsListWrap"); if(!wrap) return;
  wrap.innerHTML='<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading news...</div>';

  RHS.getNews().then(res=>{
    const news = res.news || res || [];
    if(!news.length){
      wrap.innerHTML='<p style="color:#8A9A96;text-align:center;padding:20px">No news yet.</p>';
      return;
    }
    let html='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
    news.forEach(n=>{
      html+=`
        <div style="background:#F5F9F8;border:1.5px solid #D8E8E5;border-radius:12px;padding:14px;display:flex;gap:12px;flex-wrap:wrap">
          ${n.imageURL
            ? `<img src="${n.imageURL}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0">`
            : `<div style="width:64px;height:64px;background:#E7DFD2;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa fa-newspaper" style="color:#8A9A96"></i></div>`
          }
          <div style="flex:1;min-width:160px">
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px">
              <div>
                <strong style="color:#14534F">${escHtml(n.title||"")}</strong>
                ${n.category?`<span style="margin-left:6px;background:#EEF8F1;color:#14534F;padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">${escHtml(n.category)}</span>`:""}
                ${n.date?`<span style="display:block;color:#8A9A96;font-size:.78rem;margin-top:2px"><i class="fa fa-calendar"></i> ${escHtml(n.date)}</span>`:""}
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm btn-reject" onclick="deleteNewsItem('${n.id}','${escHtml(n.title||"")}')">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
            <p style="color:#4A5C58;font-size:.85rem;margin:0">${escHtml((n.body||"").substring(0,120))}${(n.body||"").length>120?"...":""}</p>
          </div>
        </div>`;
    });
    html+='</div>';
    wrap.innerHTML=html;
  }).catch(()=>{
    wrap.innerHTML='<p style="color:#D9483A;text-align:center;padding:20px">Failed to load news.</p>';
  });
}

// News delete
function deleteNewsItem(id, title){
  if(!confirm(`Delete news "${title}"?`)) return;
  RHS.deleteNews(id).then(()=>{
    loadNewsList();
    showMsg("newsMsg","✅ News deleted.","success");
  }).catch(()=>showMsg("newsMsg","Failed to delete.","error"));
}

// Add News
async function addNewsItem(){
  if(!window.RHS){showMsg("newsMsg","System loading...","error");return;}
  const title   = document.getElementById("news-title")?.value.trim();
  const body    = document.getElementById("news-body")?.value.trim();
  const category= document.getElementById("news-category")?.value.trim()||"";
  const date    = document.getElementById("news-date")?.value.trim()||"";
  const imageURL= document.getElementById("news-imageURL")?.value.trim()||"";
  if(!title||!body){showMsg("newsMsg","⚠️ Title aur Content required.","error");return;}

  const btn=document.getElementById("addNewsBtn");
  setLoading(btn,true,"Saving...");

  let finalImageURL=imageURL;
  const imgFile=document.getElementById("news-imageFile")?.files?.[0];
  if(imgFile){
    try{finalImageURL=await RHS.uploadImage(imgFile,"rhs/news");}
    catch(e){setLoading(btn,false);showMsg("newsMsg","⚠️ Upload failed: "+e.message,"error");return;}
  }

  RHS.addNews({title,body,category,date,imageURL:finalImageURL}).then(()=>{
    setLoading(btn,false);
    showMsg("newsMsg","✅ News added!","success");
    clearNewsForm();
    loadNewsList();
  }).catch(()=>{setLoading(btn,false);showMsg("newsMsg","Failed to save.","error");});
}

function clearNewsForm(){
  ["news-title","news-body","news-category","news-date","news-imageURL"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  const imgEl=document.getElementById("news-imageFile"); if(imgEl) imgEl.value="";
  const prev=document.getElementById("newsImagePreview"); if(prev) prev.innerHTML="";
  showMsg("newsMsg","","");
}
