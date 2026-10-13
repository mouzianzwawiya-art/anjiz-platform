(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='anjiz_projects_v2';let active={title:'',desc:''},toastTimer;
const toast=m=>{const el=$('#toast');if(!el)return;el.textContent=m;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)};
const open=id=>{const d=document.getElementById(id);if(d?.showModal)d.showModal();else if(d)d.setAttribute('open','')};
const close=d=>{if(d?.close)d.close();else d?.removeAttribute('open')};
const hideSplash=()=>$('#splash')?.classList.add('hide');
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function save(items){try{localStorage.setItem(KEY,JSON.stringify(items));render();return true}catch{toast('تعذّر الحفظ. تحققي من مساحة المتصفح.');return false}}
function add(title,details=''){title=String(title||'').trim();if(!title){toast('اكتبي عنوان المشروع أولًا.');return}const items=read();items.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:title.slice(0,100),details:String(details||'').trim().slice(0,1000),createdAt:new Date().toISOString()});if(save(items))toast('تم حفظ المشروع على هذا الجهاز ✓')}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cards(){const grid=$('#allServices');if(grid)grid.innerHTML=$$('#serviceGrid .service-card').map(c=>c.outerHTML).join('')}
function projectMarkup(items){if(!items.length)return '<div class="empty-state"><b>مساحة عملك تنتظرك</b><p>أضيفي أول مشروع من خلال زر إنشاء مشروع جديد.</p></div>';return items.map(p=>{const d=new Date(p.createdAt);return `<article class="project-card"><div class="project-top"><h3>${esc(p.title)}</h3><button class="delete-project" data-delete="${esc(p.id)}" aria-label="حذف المشروع">×</button></div><p>${esc(p.details||'لا توجد ملاحظات إضافية.')}</p><small>حُفظ على هذا الجهاز · ${Number.isNaN(d.getTime())?'':esc(d.toLocaleDateString())}</small></article>`}).join('')}
function render(){const items=read();const all=projectMarkup(items);if($('#projectList'))$('#projectList').innerHTML=all;if($('#recentProjects'))$('#recentProjects').innerHTML=projectMarkup(items.slice(0,2))}
function showApp(){ $('#welcome').hidden=true;$('#appShell').hidden=false;hideSplash();render()}
function page(id){$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'})}
function initialize(){hideSplash();if(sessionStorage.getItem('anjiz_entered')){$('#welcome').hidden=true;$('#appShell').hidden=false;render()}else{$('#welcome').hidden=false;$('#appShell').hidden=true}}window.addEventListener('load',()=>setTimeout(initialize,650),{once:true});setTimeout(initialize,1800);
$('#startBtn')?.addEventListener('click',()=>{sessionStorage.setItem('anjiz_entered','1');showApp()});
$('#welcomeAccount')?.addEventListener('click',()=>open('accountDialog'));
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.page)));
$$('a[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();page(a.dataset.page)}));
$('#createProject')?.addEventListener('click',()=>{page('projectsPage');$('#quickTitle')?.focus()});
$('#smartCreate')?.addEventListener('click',()=>{page('projectsPage');$('#quickTitle')?.focus()});
$('#profileBtn')?.addEventListener('click',()=>page('profilePage'));
function setTheme(dark){document.body.classList.toggle('dark',dark);try{localStorage.setItem('anjiz_theme',dark?'dark':'light')}catch{}}
try{setTheme(localStorage.getItem('anjiz_theme')==='dark')}catch{}
const toggle=()=>setTheme(!document.body.classList.contains('dark'));
$('#themeToggle')?.addEventListener('click',toggle);$('#profileTheme')?.addEventListener('click',()=>{toggle();toast('تم تغيير المظهر.')});
$('#languageSelect')?.addEventListener('change',e=>{const l=e.target.value;document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';toast(l==='ar'?'تم اختيار العربية.':l==='fr'?'La traduction française complète sera ajoutée plus tard.':'Full English translation will be added later.')});
$('#aboutBtn')?.addEventListener('click',()=>$('#aboutText').hidden=!$('#aboutText').hidden);
$('#accountBtn')?.addEventListener('click',()=>open('accountDialog'));$('#marketInfo')?.addEventListener('click',()=>open('infoDialog'));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>close(b.closest('dialog'))));
function openService(card){active={title:card.dataset.title||'خدمة',desc:card.dataset.desc||''};$('#serviceTitle').textContent=active.title;$('#serviceDesc').textContent=active.desc;$('#serviceNote').value='';open('serviceDialog')}
document.addEventListener('click',e=>{const c=e.target.closest('.service-card');if(c)openService(c);const d=e.target.closest('[data-delete]');if(d&&confirm('هل تريدين حذف هذا المشروع؟')){save(read().filter(p=>p.id!==d.dataset.delete));toast('تم حذف المشروع.')}});
$('#serviceSearch')?.addEventListener('input',e=>{const term=e.target.value.trim().toLocaleLowerCase();$$('.service-card').forEach(c=>c.hidden=!(`${c.dataset.title||''} ${c.textContent}`.toLocaleLowerCase().includes(term)));});
$('#serviceSaveForm')?.addEventListener('submit',e=>{e.preventDefault();add(active.title,$('#serviceNote').value);close($('#serviceDialog'))});
$('#quickForm')?.addEventListener('submit',e=>{e.preventDefault();add($('#quickTitle').value,$('#quickDetails').value);$('#quickTitle').value='';$('#quickDetails').value=''});
$('#exportProjects')?.addEventListener('click',()=>{const projects=read();if(!projects.length){toast('لا توجد مشاريع لتصديرها.');return}const blob=new Blob([JSON.stringify({app:'ANJIZ',exportedAt:new Date().toISOString(),projects},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='anjiz-projects-backup.json';a.click();URL.revokeObjectURL(url);toast('تم تجهيز النسخة الاحتياطية.')});
$('#year').textContent=new Date().getFullYear();cards();render();
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)close(d)}));
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}),{once:true});
})();