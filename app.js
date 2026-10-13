(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = 'anjiz_projects_v1';
  let activeService = {title:'', desc:''};
  let toastTimer;
  const toast = (message) => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  };
  const openDialog = (id) => {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  const closeDialog = (id) => {
    const dialog = document.getElementById(id);
    if (dialog && typeof dialog.close === 'function') dialog.close();
    else if (dialog) dialog.removeAttribute('open');
  };
  const readProjects = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  };
  const saveProjects = (projects) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      renderProjects();
      return true;
    } catch (_) {
      toast('تعذّر الحفظ على هذا الجهاز. تحققي من مساحة المتصفح.');
      return false;
    }
  };
  const addProject = (title, details='') => {
    const cleanTitle = String(title || '').trim();
    if (!cleanTitle) { toast('اكتبي عنوان المشروع أولًا.'); return; }
    const projects = readProjects();
    projects.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      title: cleanTitle.slice(0,100),
      details: String(details || '').trim().slice(0,1000),
      createdAt: new Date().toISOString()
    });
    if (saveProjects(projects)) toast('تم حفظ المشروع على هذا الجهاز ✓');
  };
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
  const renderProjects = () => {
    const list = $('#projectList');
    if (!list) return;
    const projects = readProjects();
    if (!projects.length) {
      list.innerHTML = '<div class="empty-state"><span>▤</span><b>مساحة عملك تنتظرك</b><p>أضف أول مشروع من خلال نموذج الأدوات الذكية أعلاه.</p></div>';
      return;
    }
    list.innerHTML = projects.map(project => {
      const date = new Date(project.createdAt);
      const dateLabel = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
      return `<article class="project-card"><div class="project-top"><h3>${escapeHTML(project.title)}</h3><button class="delete-project" data-delete="${escapeHTML(project.id)}" aria-label="حذف المشروع">×</button></div><p>${escapeHTML(project.details || 'لا توجد ملاحظات إضافية.')}</p><small>حُفظ في هذا الجهاز · ${escapeHTML(dateLabel)}</small></article>`;
    }).join('');
  };

  // Splash always disappears even if another script or feature fails.
  const hideSplash = () => {
    const splash = $('#splash');
    if (splash) splash.classList.add('splash-hide');
  };
  window.addEventListener('load', () => setTimeout(hideSplash, 1100), {once:true});
  setTimeout(hideSplash, 2400);

  $('#year').textContent = new Date().getFullYear();
  renderProjects();

  const menuToggle = $('#menuToggle');
  menuToggle?.addEventListener('click', () => {
    const nav = $('#mainNav');
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  $$('#mainNav a').forEach(link => link.addEventListener('click', () => {
    $('#mainNav')?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  const setTheme = (dark) => {
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem('anjiz_theme', dark ? 'dark' : 'light'); } catch (_) {}
  };
  try { setTheme(localStorage.getItem('anjiz_theme') === 'dark'); } catch (_) {}
  const toggleTheme = () => setTheme(!document.body.classList.contains('dark'));
  $('#themeToggle')?.addEventListener('click', toggleTheme);
  $('#profileTheme')?.addEventListener('click', () => { toggleTheme(); toast('تم تغيير المظهر.'); });
  $('#profileBtn')?.addEventListener('click', () => openDialog('profileDialog'));

  // Language control changes document direction and provides a safe notice.
  const setLanguage = (lang) => {
    const config = {
      ar: {dir:'rtl', title:'ANJIZ | أَنْجِز', notice:'تم اختيار اللغة العربية.'},
      fr: {dir:'ltr', title:'ANJIZ | Outil académique', notice:'La langue est sélectionnée. La traduction complète sera ajoutée dans une prochaine version.'},
      en: {dir:'ltr', title:'ANJIZ | Academic workspace', notice:'Language selected. Full translation will be added in a future version.'}
    };
    const chosen = config[lang] || config.ar;
    document.documentElement.lang = lang;
    document.documentElement.dir = chosen.dir;
    document.title = chosen.title;
    $('#languageSelect').value = lang;
    $('#settingsLanguage').value = lang;
    if (lang !== 'ar') toast(chosen.notice);
  };
  $('#languageSelect')?.addEventListener('change', e => setLanguage(e.target.value));
  $('#settingsLanguage')?.addEventListener('change', e => setLanguage(e.target.value));

  $('#aboutBtn')?.addEventListener('click', () => {
    const about = $('#aboutText');
    about.hidden = !about.hidden;
  });
  $('#accountBtn')?.addEventListener('click', () => { closeDialog('profileDialog'); openDialog('accountDialog'); });
  $('#accountClose')?.addEventListener('click', () => closeDialog('accountDialog'));
  $('#joinProBtn')?.addEventListener('click', () => openDialog('joinDialog'));
  $('#joinClose')?.addEventListener('click', () => closeDialog('joinDialog'));

  $$('.service-card').forEach(card => card.addEventListener('click', () => {
    activeService = {title:card.dataset.service || 'خدمة', desc:card.dataset.desc || ''};
    $('#serviceTitle').textContent = activeService.title;
    $('#serviceDesc').textContent = activeService.desc;
    $('#serviceNote').value = '';
    openDialog('serviceDialog');
  }));
  $('#serviceSearch')?.addEventListener('input', e => {
    const term = e.target.value.trim().toLocaleLowerCase();
    $$('.service-card').forEach(card => {
      card.hidden = !(`${card.dataset.service || ''} ${card.textContent}`.toLocaleLowerCase().includes(term));
    });
  });
  $('#serviceSaveForm')?.addEventListener('submit', e => {
    e.preventDefault();
    addProject(activeService.title, $('#serviceNote').value);
    closeDialog('serviceDialog');
  });
  $('#quickForm')?.addEventListener('submit', e => {
    e.preventDefault();
    addProject($('#quickTitle').value, $('#quickDetails').value);
    $('#quickTitle').value = '';
    $('#quickDetails').value = '';
  });
  $('#projectList')?.addEventListener('click', e => {
    const button = e.target.closest('[data-delete]');
    if (!button) return;
    const projects = readProjects().filter(p => p.id !== button.dataset.delete);
    if (saveProjects(projects)) toast('تم حذف المشروع من هذا الجهاز.');
  });
  $('#exportProjects')?.addEventListener('click', () => {
    const projects = readProjects();
    if (!projects.length) { toast('لا توجد مشاريع لتصديرها بعد.'); return; }
    const blob = new Blob([JSON.stringify({app:'ANJIZ', exportedAt:new Date().toISOString(), projects}, null, 2)], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'anjiz-projects-backup.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('تم تجهيز النسخة الاحتياطية.');
  });

  // Dismiss a dialog by tapping its backdrop.
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  }));

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }, {once:true});
  }
})();