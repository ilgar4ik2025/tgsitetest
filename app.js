(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); tg.MainButton.hide(); tg.setHeaderColor('#0D0D0D'); tg.setBackgroundColor('#0D0D0D'); }
  const qs = (s, r=document)=>r.querySelector(s); const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const screens = qsa('.screen'); const show = (n)=>{ screens.forEach(s=>s.classList.toggle('hidden', s.dataset.screen!==n)); };
  qsa('[data-nav]').forEach(b=> b.addEventListener('click', ()=> show(b.dataset.nav)));
  qsa('[data-back]').forEach(b=> b.addEventListener('click', ()=> show('home')));

  // helper: normalize url for static hosting (drop leading /)
  const nu = (u)=> (typeof u==='string' && u.startsWith('/')) ? u.slice(1) : u;

  let content = null;
  function apply(){ renderHome(); renderProjects(); renderServices(); renderReviews(); renderContacts(); }
  async function boot(){
    if (window.__CONTENT__) content = window.__CONTENT__;
    else content = await fetch('content.json').then(r=>r.json()).catch(()=>({}));
    show('home');
    apply();
  }

  function renderHome(){
    const sc=qs('.screen[data-screen="home"]'); if(!sc) return;
    qs('.title',sc).textContent = content.home?.title || 'Разработчик iOS и Android';
    qs('.subtitle',sc).textContent = content.home?.subtitle || '';
    const av = qs('.avatar',sc);
    if (content.home?.avatar){
      av.innerHTML = ''; // убрать эмодзи
      av.style.backgroundImage = `url(${nu(content.home.avatar)})`;
      av.style.backgroundRepeat='no-repeat';
      const fit=content.home.avatarFit; if (fit==='zoom') av.style.backgroundSize=`${content.home.avatarZoom||100}% auto`; else av.style.backgroundSize=(fit==='contain')?'contain':'cover';
      av.style.backgroundPosition = `${content.home.avatarPosX??50}% ${content.home.avatarPosY??50}%`;
    }
    const blocksWrap = qs('#home-blocks', sc);
    if (blocksWrap){
      blocksWrap.innerHTML = '';
      for (const b of (content.home?.blocks || [])){
        const node = document.createElement('div'); node.className = 'home-block'; node.dataset.id = b.id;
        const imgHtml = b.image ? `<div class="hb-img" style="height:${b.height||140}px;background-image:url(${nu(b.image)});background-repeat:no-repeat;background-size:${b.fit==='contain'?'contain':(b.fit==='zoom'?(b.zoom||100)+'% auto':'cover')};background-position:${b.posX??50}% ${b.posY??50}%"></div>` : '';
        const titleHtml = b.title ? `<div class="hb-title">${b.title}</div>` : '';
        const textHtml = b.text ? `<div class="hb-text">${b.text}</div>` : '';
        const btnsHtml = Array.isArray(b.buttons)&&b.buttons.length? `<div class="hb-btns">${b.buttons.map(btn=>`<button class="chip" data-href="${btn.href||'#'}">${btn.text||'Подробнее'}</button>`).join('')}</div>`:'';
        let inner = '';
        switch(b.variant){
          case 'image-only': inner = `${imgHtml}`; break;
          case 'text': inner = `<div class="hb-body">${titleHtml}${textHtml}</div>`; break;
          case 'cta': inner = `<div class="hb-body">${titleHtml}${textHtml}${btnsHtml}</div>`; break;
          case 'card':
          default: inner = `${imgHtml}<div class="hb-body">${titleHtml}${textHtml}${btnsHtml}</div>`;
        }
        node.innerHTML = inner;
        node.addEventListener('click', (e)=>{ const btn=e.target.closest('[data-href]'); if(!btn) return; const href=btn.dataset.href; if(!href) return; if (tg&&tg.openLink) tg.openLink(href); else window.open(href,'_blank'); });
        blocksWrap.appendChild(node);
      }
    }
  }

  // generic slider init
  function initSlider(host){
    const slides = qs('.slides', host); if (!slides) return;
    const dots = qs('.dots', host);
    const total = qsa('.slide', slides).length; let idx=0;
    const renderDots=()=>{ if(!dots) return; dots.innerHTML=''; for(let i=0;i<total;i++){ const d=document.createElement('div'); d.className='dot'+(i===idx?' active':''); d.onclick=()=>go(i); dots.appendChild(d);} };
    const go=(i)=>{ idx=(i+total)%total; slides.style.transform=`translateX(${-idx*100}%)`; renderDots(); };
    let sx=0,cx=0,drag=false; slides.addEventListener('touchstart',e=>{drag=true;sx=e.touches[0].clientX;},{passive:true}); slides.addEventListener('touchmove',e=>{if(!drag)return; cx=e.touches[0].clientX;},{passive:true}); slides.addEventListener('touchend',()=>{if(!drag)return; drag=false; const dx=cx-sx; if(Math.abs(dx)>30){ go(idx+(dx<0?1:-1)); }});
    const prev=qs('.arrow.left', host); const next=qs('.arrow.right', host); if(prev&&next){ prev.onclick=()=>go(idx-1); next.onclick=()=>go(idx+1); }
    renderDots();
  }

  function renderProjects(){
    const list = qs('#projects-list'); if(!list) return; list.innerHTML='';
    (content.projects||[]).forEach(p=>{
      const a=document.createElement('article'); a.className='card project'; a.dataset.projectId=p.id; a.innerHTML=`<div class="preview"></div><div class="card-body"><div class="card-title">${p.title}</div><div class="tag">${p.platforms||''}</div><div class="card-desc">${p.desc||''}</div><button class="chip chip-blue" data-open-project>Подробнее</button></div>`;
      const prev = qs('.preview',a);
      if (p.preview){ prev.style.backgroundImage=`url(${nu(p.preview)})`; prev.style.backgroundRepeat='no-repeat'; if(p.previewFit==='zoom') prev.style.backgroundSize=`${p.previewZoom||100}% auto`; else prev.style.backgroundSize=(p.previewFit==='contain')?'contain':'cover'; prev.style.backgroundPosition=`${p.previewPosX??50}% ${p.previewPosY??50}%`; }
      else prev.classList.add('gradient-blue');
      list.appendChild(a);
    });
    list.onclick=(e)=>{ const host=e.target.closest('.project'); const more=e.target.closest('[data-open-project]'); if(!host&&!more) return; openProject((host||more.closest('.project')).dataset.projectId); };
  }
  function openProject(id){
    const d=(content.projects||[]).find(x=>x.id===id); if(!d) return; show('project-detail');
    qs('#pd-title').textContent=d.title||'Детали проекта'; const prev=qs('#pd-preview'); prev.className='pd-preview';
    if (d.preview){ prev.style.backgroundImage=`url(${nu(d.preview)})`; prev.style.backgroundRepeat='no-repeat'; if(d.previewFit==='zoom') prev.style.backgroundSize=`${d.previewZoom||100}% auto`; else prev.style.backgroundSize=(d.previewFit==='contain')?'contain':'cover'; prev.style.backgroundPosition=`${d.previewPosX??50}% ${d.previewPosY??50}%`; } else { prev.classList.add('gradient-blue'); }
    qs('#pd-platforms').textContent = `Платформа: ${d.platforms||''}`; qs('#pd-desc').textContent=`Описание: ${d.desc||''}`; qs('#pd-tech').textContent=d.tech?`Технологии: ${d.tech}`:'';
    const pdMore = qs('#pd-more'); pdMore.onclick = ()=>{ const url='https://t.me/ilgar_x'; if (tg&&tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url,'_blank'); };

    // Галерея
    let wrap = qs('#pg-slider'); if (!wrap){ wrap=document.createElement('div'); wrap.className='slider'; wrap.id='pg-slider'; wrap.innerHTML='<div class="slides"></div><div class="dots"></div><div class="slider-arrows"><button class="arrow left">‹</button><button class="arrow right">›</button></div>'; qs('.pd-meta')?.insertAdjacentElement('afterend', wrap); }
    const slides = qs('.slides', wrap); slides.innerHTML=''; (d.images||[]).forEach(url=>{ const s=document.createElement('div'); s.className='slide'; s.innerHTML = `<div class="img-slide" style="background:#111;border-radius:12px;height:220px;background-position:center;background-repeat:no-repeat;background-size:contain;background-image:url(${nu(url)})"></div>`; slides.appendChild(s); });
    initSlider(wrap);
  }

  function renderServices(){ const list=qs('.service-list'); if(!list) return; list.innerHTML=''; (content.services||[]).forEach(s=>{ const r=document.createElement('article'); r.className='service'; r.innerHTML=`<div class="service-icon">${s.icon||'🔧'}</div><div class="service-body"><div class="service-title">${s.title}</div><div class="service-sub">${s.sub||''}</div><div class="price tag">${s.price||''}</div></div><button class="chip chip-blue" data-order="${s.id}">Заказать</button>`; list.appendChild(r); }); qsa('[data-order]').forEach(b=> b.onclick=()=> openModal(b.dataset.order)); }

  function renderReviews(){
    const slider = qs('#reviews-slider'); if (!slider) return; const slidesWrap = qs('.slides', slider); const dots = qs('#review-dots', slider); slidesWrap.innerHTML='';
    for (const r of (content.reviews||[])){
      const slide=document.createElement('div'); slide.className='slide';
      slide.innerHTML=`<div class="review-card"><div class="review-head"><div class="avatar-sm" style="background:${r.avatar?'#1a1a1a':'linear-gradient(135deg,var(--blue),#1b64ff)'};${r.avatar?`background-image:url(${nu(r.avatar)});background-repeat:no-repeat;background-size:${r.avatarFit==='contain'?'contain':'cover'};background-position:${r.avatarPosX??50}% ${r.avatarPosY??50}%`:''}">${r.avatar?'':'👤'}</div><div><div class="review-name">${r.name}</div><div class="stars">${'⭐'.repeat(r.stars||5)}</div></div></div><div class="review-text">${r.text||''}</div></div>`;
      slidesWrap.appendChild(slide);
    }
    // инициализация
    const total = qsa('.slide', slidesWrap).length; let idx=0; const renderDots=()=>{ dots.innerHTML=''; for(let i=0;i<total;i++){ const d=document.createElement('div'); d.className='dot'+(i===idx?' active':''); d.onclick=()=>go(i); dots.appendChild(d);} }; const go=(i)=>{ idx=(i+total)%total; slidesWrap.style.transform=`translateX(${-idx*100}%)`; renderDots(); };
    let sx=0,cx=0,drag=false; slidesWrap.addEventListener('touchstart',e=>{drag=true;sx=e.touches[0].clientX;},{passive:true}); slidesWrap.addEventListener('touchmove',e=>{if(!drag)return; cx=e.touches[0].clientX;},{passive:true}); slidesWrap.addEventListener('touchend',()=>{if(!drag)return; drag=false; const dx=cx-sx; if(Math.abs(dx)>30){ go(idx+(dx<0?1:-1)); }});
    const prev=qs('#reviews-prev'); const next=qs('#reviews-next'); if(prev&&next){ prev.onclick=()=>go(idx-1); next.onclick=()=>go(idx+1); }
    renderDots();
  }

  function renderContacts(){ const tgBtn=qs('[data-contact="tg"]'); const waBtn=qs('[data-contact="wa"]'); const emBtn=qs('[data-contact="email"]'); if(tgBtn) tgBtn.dataset.link=content.contacts?.tg||'https://t.me/'; if(waBtn) waBtn.dataset.link=content.contacts?.wa||'https://wa.me/'; if(emBtn) emBtn.dataset.link=content.contacts?.email?`mailto:${content.contacts.email}`:'mailto:'; qsa('[data-contact]').forEach(btn=> btn.onclick=()=>{ const href=btn.dataset.link; if(!href) return; if (tg&&tg.openLink) tg.openLink(href); else window.open(href,'_blank'); }); }

  // Модалка заказа → открываем диалог с @ilgar_x
  const modal = qs('#modal'); const modalClose=qs('#modal-close'); const orderForm=qs('#order-form');
  function openModal(serviceId){ if (modal){ modal.classList.remove('hidden'); modal.dataset.serviceId=serviceId||''; } }
  function closeModal(){ if (modal) modal.classList.add('hidden'); }
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e)=>{ if (e.target===modal) closeModal(); });
  orderForm?.addEventListener('submit', (e)=>{
    e.preventDefault(); const fd=new FormData(orderForm); const payload=Object.fromEntries(fd.entries()); const sid=modal?.dataset?.serviceId; const text = `Заявка на услугу${sid?` (${sid})`:''}%0AИмя: ${encodeURIComponent(payload.name||'')}%0AКонтакт: ${encodeURIComponent(payload.contact||'')}%0AЗадача: ${encodeURIComponent(payload.details||'')}`;
    const url=`https://t.me/ilgar_x?text=${text}`; if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank'); closeModal(); orderForm.reset();
  });

  // Контакты → тоже в личку
  const cForm = qs('#contact-form');
  cForm?.addEventListener('submit', (e)=>{ e.preventDefault(); const fd=new FormData(cForm); const pl=Object.fromEntries(fd.entries()); const text=`Контакт%0AИмя: ${encodeURIComponent(pl.name||'')}%0AEmail: ${encodeURIComponent(pl.email||'')}%0AСообщение: ${encodeURIComponent(pl.message||'')}`; const url=`https://t.me/ilgar_x?text=${text}`; if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url,'_blank'); cForm.reset(); });

  // старт
  boot();
})(); 