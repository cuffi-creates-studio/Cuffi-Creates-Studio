(function(){
  function detect(){
    const p=(location.pathname||'').toLowerCase();
    let cls='';
    if(p.includes('menager%20tufting')||p.includes('menager tufting')) cls='module-manager-tufting';
    else if(p.includes('inventar%20tufting')||p.includes('inventar tufting')) cls='module-inventory';
    else if(p.endsWith('/ngjyrat.html')||p.endsWith('ngjyrat.html')) cls='module-colors';
    else if(p.includes('fleta%20e%20projektit')||p.includes('fleta e projektit')) cls='module-project-sheet';
    else if(p.includes('menager%20shitje%20modern')||p.includes('menager shitje modern')) cls='module-sales-manager';
    else if(p.includes('kontrolli%20i%20shitjeve')||p.includes('kontrolli i shitjeve')) cls='module-sales-control';
    else if(p.includes('/fatura/')) cls='module-invoice';
    else if(p.endsWith('/calculator.html')||p.endsWith('calculator.html')) cls='module-calculator';
    if(cls) document.body.classList.add(cls);
  }
  function yarnTabs(){
    if(!document.body.classList.contains('module-colors')) return;
    const controls=document.querySelector('.top-controls');
    const yarnBox=document.querySelector('.section-box');
    const materialBox=document.querySelectorAll('.section-box')[1];
    if(!controls||!yarnBox||!materialBox||controls.querySelector('[data-ui-materials]')) return;
    const mat=document.createElement('button');mat.className='btn-filter';mat.textContent='Materiale';mat.dataset.uiMaterials='1';
    const list=document.createElement('button');list.className='btn-filter';list.textContent='☷ Lista';list.dataset.uiList='1';
    controls.append(mat,list);
    const yarn500=document.getElementById('yarn500Container'), yarn50=document.getElementById('yarn50Container');
    function activate(btn){controls.querySelectorAll('.btn-filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}
    mat.addEventListener('click',()=>{activate(mat); yarn500&&(yarn500.style.display='none'); yarn50&&(yarn50.style.display='none'); materialBox.style.display='block'; materialBox.scrollIntoView({behavior:'smooth',block:'start'});});
    list.addEventListener('click',()=>{activate(list); yarn500&&(yarn500.style.display='block'); yarn50&&(yarn50.style.display='block'); materialBox.style.display='block'; document.querySelector('.dashboard-container')?.classList.add('ui-list-mode');});
    controls.querySelectorAll('.btn-filter:not([data-ui-materials]):not([data-ui-list])').forEach(b=>b.addEventListener('click',()=>{materialBox.style.display='none'; document.querySelector('.dashboard-container')?.classList.remove('ui-list-mode');}));
    materialBox.style.display='none';
  }
  function addTableLabels(){
    document.querySelectorAll('table').forEach(table=>{
      const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
      table.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{if(heads[i]&&!td.dataset.label)td.dataset.label=heads[i]}));
    });
  }
  const boot=()=>{detect();addTableLabels();yarnTabs();new MutationObserver(addTableLabels).observe(document.body,{subtree:true,childList:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
