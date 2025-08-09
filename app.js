(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); tg.MainButton.hide(); tg.setHeaderColor('#0D0D0D'); tg.setBackgroundColor('#0D0D0D'); }
  const qs = (s, r=document)=>r.querySelector(s); const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const screens = qsa('.screen'); const show = (n)=>{ screens.forEach(s=>s.classList.toggle('hidden', s.dataset.screen!==n)); };
  qsa('[data-nav]').forEach(b=> b.addEventListener('click', ()=> show(b.dataset.nav)));
  qsa('[data-back]').forEach(b=> b.addEventListener('click', ()=> show('home')));

  // Загружаем контент локально (статическая сборка): возьмём встроенные дефолты из script tag, если нужно — можно инлайнить
  let content = window.__CONTENT__ || {};
  function apply(){ renderHome(); renderProjects(); renderServices(); renderReviews(); renderContacts(); }

  function renderHome(){
    const sc=qs('.screen[data-screen="home"]'); if(!sc) return;
    qs('.title',sc).textContent = content.home?.title || 'Разработчик iOS и Android';
    qs('.subtitle',sc).textContent = content.home?.subtitle || '';
    const av = qs('.avatar',sc);
    if (content.home?.avatar){
      av.style.backgroundImage = `url(${content.home.avatar})`;
      av.style.backgroundRepeat='no-repeat';
      const fit=content.home.avatarFit; if (fit==='zoom') av.style.backgroundSize=`${content.home.avatarZoom||100}% auto`; else av.style.backgroundSize=(fit==='contain')?'contain':'cover';
      av.style.backgroundPosition = `${content.home.avatarPosX??50}% ${content.home.avatarPosY??50}%`;
    }
  }
  function renderProjects(){
    const list = qs('#projects-list'); if(!list) return; list.innerHTML='';
    (content.projects||[]).forEach(p=>{
      const a=document.createElement('article'); a.className='card project'; a.dataset.projectId=p.id; a.innerHTML=`<div class="preview"></div><div class="card-body"><div class="card-title">${p.title}</div><div class="tag">${p.platforms||''}</div><div class="card-desc">${p.desc||''}</div><button class="chip chip-blue" data-open-project>Подробнее</button></div>`;
      const prev = qs('.preview',a);
      if (p.preview){ prev.style.backgroundImage=`url(${p.preview})`; prev.style.backgroundRepeat='no-repeat'; if(p.previewFit==='zoom') prev.style.backgroundSize=`${p.previewZoom||100}% auto`; else prev.style.backgroundSize=(p.previewFit==='contain')?'contain':'cover'; prev.style.backgroundPosition=`${p.previewPosX??50}% ${p.previewPosY??50}%`; }
      else prev.classList.add('gradient-blue');
      list.appendChild(a);
    });
    list.onclick=(e)=>{ const host=e.target.closest('.project'); if(!host) return; openProject(host.dataset.projectId); };
  }
  function openProject(id){
    const d=(content.projects||[]).find(x=>x.id===id); if(!d) return; show('project-detail');
    qs('#pd-title').textContent=d.title||'Детали проекта'; const prev=qs('#pd-preview'); prev.className='pd-preview';
    if (d.preview){ prev.style.backgroundImage=`url(${d.preview})`; prev.style.backgroundRepeat='no-repeat'; if(d.previewFit==='zoom') prev.style.backgroundSize=`${d.previewZoom||100}% auto`; else prev.style.backgroundSize=(d.previewFit==='contain')?'contain':'cover'; prev.style.backgroundPosition=`${d.previewPosX??50}% ${d.previewPosY??50}%`; } else { prev.classList.add('gradient-blue'); }
    qs('#pd-platforms').textContent = `Платформа: ${d.platforms||''}`; qs('#pd-desc').textContent=`Описание: ${d.desc||''}`; qs('#pd-tech').textContent=d.tech?`Технологии: ${d.tech}`:'';
  }
  function renderServices(){ const list=qs('.service-list'); if(!list) return; list.innerHTML=''; (content.services||[]).forEach(s=>{ const r=document.createElement('article'); r.className='service'; r.innerHTML=`<div class="service-icon">${s.icon||'🔧'}</div><div class="service-body"><div class="service-title">${s.title}</div><div class="service-sub">${s.sub||''}</div><div class="price tag">${s.price||''}</div></div><button class="chip chip-blue" data-order="${s.id}">Заказать</button>`; list.appendChild(r); }); qsa('[data-order]').forEach(b=> b.onclick=()=> openModal(b.dataset.order)); }
  function renderReviews(){ /* можно инлайнить базовую версию без слайдера */ }
  function renderContacts(){ const tgBtn=qs('[data-contact="tg"]'); const waBtn=qs('[data-contact="wa"]'); const emBtn=qs('[data-contact="email"]'); if(tgBtn) tgBtn.dataset.link=content.contacts?.tg||'https://t.me/'; if(waBtn) waBtn.dataset.link=content.contacts?.wa||'https://wa.me/'; if(emBtn) emBtn.dataset.link=content.contacts?.email?`mailto:${content.contacts.email}`:'mailto:'; }

  // Модалка заказа → открываем диалог с @ilgar_x
  const modal = qs('#modal'); const modalClose=qs('#modal-close'); const orderForm=qs('#order-form');
  function openModal(serviceId){ if (modal){ modal.classList.remove('hidden'); modal.dataset.serviceId=serviceId||''; } }
  function closeModal(){ if (modal) modal.classList.add('hidden'); }
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e)=>{ if (e.target===modal) closeModal(); });
  orderForm?.addEventListener('submit', (e)=>{
    e.preventDefault(); const fd=new FormData(orderForm); const payload=Object.fromEntries(fd.entries()); const sid=modal?.dataset?.serviceId; const text = `Заявка на услугу${sid?` (${sid})`:''}%0AИмя: ${encodeURIComponent(payload.name||'')}%0AКонтакт: ${encodeURIComponent(payload.contact||'')}%0AЗадача: ${encodeURIComponent(payload.details||'')}`;
    const url=`https://t.me/ilgar_x?text=${text}`;
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank');
    closeModal(); orderForm.reset();
  });

  // Контакты → тоже в личку
  const cForm = qs('#contact-form');
  cForm?.addEventListener('submit', (e)=>{
    e.preventDefault(); const fd=new FormData(cForm); const pl=Object.fromEntries(fd.entries()); const text=`Контакт%0AИмя: ${encodeURIComponent(pl.name||'')}%0AEmail: ${encodeURIComponent(pl.email||'')}%0AСообщение: ${encodeURIComponent(pl.message||'')}`; const url=`https://t.me/ilgar_x?text=${text}`; if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url,'_blank'); cForm.reset();
  });

  // старт
  show('home'); apply();
})(); 