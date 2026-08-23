(function(){
  function addShell(){
    if(document.querySelector('.mobile-top')) return;
    const top=document.createElement('div');
    top.className='mobile-top';
    top.innerHTML=`<button id="mobileMenuBtn" aria-label="Menu"><i class="fa-solid fa-bars"></i></button><div class="m-logo"><img src="assets/CuffiCreatesNeon.png" alt="Cuffi Creates"></div><button id="mobileBellBtn" class="bell-wrap" aria-label="Njoftime"><i class="fa-regular fa-bell"></i><span class="bell-dot"></span></button>`;
    document.body.prepend(top);
    const search=document.querySelector('.topbar .search');
    if(search){const clone=search.cloneNode(true);clone.classList.add('mobile-search');clone.querySelector('input').id='mobileAppSearch';top.after(clone);clone.querySelector('input').addEventListener('input',e=>{const src=document.getElementById('appSearch');if(src){src.value=e.target.value;src.dispatchEvent(new Event('input',{bubbles:true}))}})}
    const scrim=document.createElement('div');scrim.className='mobile-scrim';document.body.appendChild(scrim);
    const dock=document.createElement('nav');dock.className='mobile-dock';dock.innerHTML=`
      <button class="active" data-view="dashboard"><i class="fa-solid fa-house"></i><span>Dashboard</span></button>
      <button id="dockPrograms"><i class="fa-solid fa-grip"></i><span>Programet</span></button>
      <button class="dock-plus" id="dockPlus"><i class="fa-solid fa-plus"></i><span>Shto</span></button>
      <button data-view="appointments"><i class="fa-regular fa-calendar"></i><span>Terminat</span></button>
      <button data-view="settings"><i class="fa-solid fa-ellipsis"></i><span>Më shumë</span></button>`;
    document.body.appendChild(dock);
    const open=()=>document.body.classList.add('drawer-open');const close=()=>document.body.classList.remove('drawer-open');
    document.getElementById('mobileMenuBtn').onclick=open;document.getElementById('dockPrograms').onclick=open;document.getElementById('dockPlus').onclick=open;scrim.onclick=close;
    document.querySelectorAll('.sidebar [data-view],.sidebar [data-app]').forEach(el=>el.addEventListener('click',()=>{if(innerWidth<700)close()}));
    document.getElementById('mobileBellBtn').onclick=()=>document.getElementById('notificationButton')?.click();
    dock.addEventListener('click',e=>{const b=e.target.closest('button[data-view]');if(!b)return;dock.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addShell);else addShell();
})();
