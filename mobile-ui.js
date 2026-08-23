(function(){
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const shell=q('#mpShell'); if(!shell) return;

  const openDrawer=()=>{ document.body.classList.remove('mp-notifications-open'); document.body.classList.add('mp-drawer-open'); };
  const closeDrawer=()=>document.body.classList.remove('mp-drawer-open');
  const closeNotifications=()=>document.body.classList.remove('mp-notifications-open');

  q('#mpMenuBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openDrawer()});
  q('#mpDrawerClose')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeDrawer()});
  q('#mpDrawerOverlay')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeDrawer()});

  function clickOriginal(selector){ const el=q(selector); if(el) el.click(); }
  function openOriginalApp(key){
    closeDrawer(); closeNotifications();
    const el=q(`.side-nav [data-app="${key}"]`);
    if(el) el.click();
  }
  function openOriginalView(view){
    closeDrawer(); closeNotifications();
    const el=q(`.side-nav [data-view="${view}"]`) || q(`.topbar [data-view="${view}"]`);
    if(el) el.click();
  }

  // Drawer items: prevent the app-wide click delegate from firing twice.
  qa('#mpDrawerList [data-app]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openOriginalApp(b.dataset.app)}));
  qa('#mpDrawerList [data-view]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openOriginalView(b.dataset.view)}));

  // Bottom navigation: every button has one explicit job; none opens the drawer except Programet/Më shumë.
  q('.mp-bottom [data-view="dashboard"]')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openOriginalView('dashboard')});
  q('#mpProgramsBottom')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openDrawer()});
  q('#mpPlus')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openQuickSheet()});
  q('.mp-bottom [data-view="appointments"]')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openOriginalView('appointments')});
  q('#mpMore')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openMoreSheet()});

  q('#mpAddAppointment')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clickOriginal('#heroAddEvent')});
  q('#mpQuickAppointment')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clickOriginal('#heroAddEvent')});
  qa('.mp-quick [data-app]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openOriginalApp(b.dataset.app)}));
  q('#mpStart')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clickOriginal('#startTimer')});
  q('#mpStop')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clickOriginal('#stopTimer')});

  // Search opens the program drawer only when the user actually starts typing/focuses search.
  q('#mpSearch')?.addEventListener('focus',openDrawer);
  q('#mpSearch')?.addEventListener('input',e=>{const v=e.target.value.toLowerCase().trim();qa('#mpDrawerList button').forEach(b=>b.style.display=!v||b.innerText.toLowerCase().includes(v)?'grid':'none')});

  function syncMobileNotifications(){
    const out=q('#mpMobileNotificationsList'); if(!out) return;
    const src=q('#notificationList');
    if(!src || !src.children.length){ out.innerHTML='<div class="mp-mobile-notifications-empty">Nuk ka njoftime.</div>'; return; }
    const entries=[...src.children].filter(x=>x.textContent.trim());
    if(!entries.length){ out.innerHTML='<div class="mp-mobile-notifications-empty">Nuk ka njoftime.</div>'; return; }
    out.innerHTML=entries.map((el,i)=>{
      const lines=el.innerText.split('\n').map(x=>x.trim()).filter(Boolean);
      const title=lines[0]||'Njoftim'; const detail=lines.slice(1).join(' · ');
      return `<div class="mp-notification-item"><div class="mp-notification-icon"><i class="fa-regular fa-bell"></i></div><div class="mp-notification-copy"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div></div>`;
    }).join('');
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  q('#mpBellBtn')?.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();closeDrawer();
    // Ask existing notification logic to refresh first, then mirror its real content in a mobile panel.
    q('#notificationButton')?.click();
    setTimeout(()=>{syncMobileNotifications();document.body.classList.toggle('mp-notifications-open')},30);
  });
  q('#mpMobileNotificationsClose')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeNotifications()});
  q('#mpNotificationOverlay')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeNotifications()});

  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeNotifications()}});

  function syncView(){
    const active=q('.main-area .view.active');
    const dash=active?.id==='dashboardView';
    document.body.classList.toggle('mp-dashboard-active',dash);
    shell.setAttribute('aria-hidden',dash?'false':'true');
  }
  const main=q('.main-area'); if(main) new MutationObserver(syncView).observe(main,{subtree:true,attributes:true,attributeFilter:['class']}); syncView();

  function copyText(from,to){const a=q(from),b=q(to); if(a&&b&&b.textContent!==a.textContent)b.textContent=a.textContent}
  function syncGreeting(){const t=q('#greeting')?.textContent?.trim()||'Mirëmbrëma, Jimmi 👋';const i=t.indexOf(',');q('#mpGreetingPart').textContent=i>=0?t.slice(0,i+1):t;q('#mpGreetingName').textContent=i>=0?t.slice(i+1).trim():''}
  function syncData(){syncGreeting();copyText('#timerDisplay','#mpTimer');copyText('#todayTotal','#mpTodayTotal');copyText('#metricRevenue','#mpRevenue');copyText('#metricOrders','#mpOrders');copyText('#metricProjects','#mpProjects');copyText('#metricClients','#mpClients');syncUpcoming()}
  function syncUpcoming(){const out=q('#mpUpcomingBody'),src=q('#upcomingAppointments'); if(!out||!src)return; const item=src.querySelector('.upcoming-item'); if(!item){out.innerHTML='<span class="mp-empty">Nuk ka termine të ardhshme.</span>';return} const text=item.innerText.split('\n').map(x=>x.trim()).filter(Boolean); out.innerHTML='<div class="mp-upcoming-card"><div class="mp-upcoming-date"><strong>'+new Date().getDate()+'</strong><span>TERMIN</span></div><div class="mp-upcoming-copy"><strong>'+(text[0]||'Termin')+'</strong><span>'+(text.slice(1,3).join(' · ')||'')+'</span></div><div class="mp-upcoming-time">'+(text.find(x=>/^\d{1,2}:\d{2}/.test(x))||'')+'</div></div>'}
  setInterval(syncData,500); syncData();

  function clock(){const n=new Date(),s=n.getSeconds(),m=n.getMinutes()+s/60,h=(n.getHours()%12)+m/60;q('#mpSecond').style.transform=`translateX(-50%) rotate(${s*6}deg)`;q('#mpMinute').style.transform=`translateX(-50%) rotate(${m*6}deg)`;q('#mpHour').style.transform=`translateX(-50%) rotate(${h*30}deg)`}
  setInterval(clock,1000);clock();


  function ensureActionSheets(){
    if(q('#mpActionOverlay')) return;
    const overlay=document.createElement('div'); overlay.id='mpActionOverlay'; overlay.className='mp-action-overlay';
    const quick=document.createElement('div'); quick.id='mpQuickSheet'; quick.className='mp-action-sheet'; quick.innerHTML=`<div class="mp-sheet-handle"></div><div class="mp-sheet-title">Shto</div><div class="mp-sheet-grid"><button data-sheet-view="appointments"><i class="fa-regular fa-calendar-plus"></i><span>Termin</span></button><button data-sheet-app="managerTufting"><i class="fa-regular fa-folder-open"></i><span>Projekt</span></button><button data-sheet-app="invoice"><i class="fa-regular fa-file-lines"></i><span>Faturë</span></button><button data-sheet-app="inventory"><i class="fa-solid fa-cube"></i><span>Inventar</span></button></div>`;
    const more=document.createElement('div'); more.id='mpMoreSheet'; more.className='mp-action-sheet'; more.innerHTML=`<div class="mp-sheet-handle"></div><div class="mp-sheet-title">Më shumë</div><div class="mp-more-list"><button data-sheet-view="workhours"><i class="fa-regular fa-clock"></i><span>Orët e Punës</span><i class="fa-solid fa-chevron-right"></i></button><button data-sheet-view="statistics"><i class="fa-solid fa-chart-column"></i><span>Statistikat</span><i class="fa-solid fa-chevron-right"></i></button><button data-sheet-view="gallery"><i class="fa-regular fa-images"></i><span>Galeria</span><i class="fa-solid fa-chevron-right"></i></button><button data-sheet-view="backup"><i class="fa-solid fa-cloud-arrow-down"></i><span>Backup & Restore</span><i class="fa-solid fa-chevron-right"></i></button><button data-sheet-view="settings"><i class="fa-solid fa-gear"></i><span>Cilësimet</span><i class="fa-solid fa-chevron-right"></i></button></div>`;
    document.body.append(overlay,quick,more);
    overlay.addEventListener('click',closeSheets);
    [quick,more].forEach(sheet=>{
      sheet.addEventListener('click',e=>{
        const app=e.target.closest('[data-sheet-app]'); const view=e.target.closest('[data-sheet-view]');
        if(app){closeSheets();openOriginalApp(app.dataset.sheetApp)}
        if(view){closeSheets(); if(view.dataset.sheetView==='appointments'){clickOriginal('#heroAddEvent')} else openOriginalView(view.dataset.sheetView)}
      });
    });
  }
  function closeSheets(){document.body.classList.remove('mp-quick-open','mp-more-open')}
  function openQuickSheet(){closeDrawer();closeNotifications();ensureActionSheets();document.body.classList.remove('mp-more-open');document.body.classList.add('mp-quick-open')}
  function openMoreSheet(){closeDrawer();closeNotifications();ensureActionSheets();document.body.classList.remove('mp-quick-open');document.body.classList.add('mp-more-open')}
  ensureActionSheets();
})();
