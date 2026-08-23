(function(){
  function labelTables(){
    document.querySelectorAll('table').forEach(function(table){
      var heads=Array.from(table.querySelectorAll('thead th')).map(function(th){return th.textContent.trim()});
      table.querySelectorAll('tbody tr').forEach(function(tr){
        Array.from(tr.children).forEach(function(td,i){if(heads[i]&&!td.dataset.label)td.dataset.label=heads[i]});
      });
    });
  }
  function boot(){labelTables();new MutationObserver(labelTables).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
