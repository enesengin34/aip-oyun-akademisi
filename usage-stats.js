/* AİP V13.2 – anonymous daily usage counters. No personal data. */
const AIPUsage=(()=>{
  let label='',lastActivity=Date.now(),since=Date.now(),sentAt=Date.now();
  const send=(mode,seconds)=>{if(!label)return;const payload={label,mode,...(mode==='active'?{seconds}:{} )};
    fetch('/api/books?action=usage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',keepalive:true}).catch(()=>{});
  };
  function flush(){const now=Date.now();if(!label||document.visibilityState!=='visible'||now-lastActivity>60000){sentAt=now;return}const sec=Math.min(30,Math.max(0,Math.floor((now-sentAt)/1000)));sentAt=now;if(sec>=1)send('active',sec)}
  function view(name){if(!name||name===label)return;flush();label=String(name).slice(0,75);lastActivity=Date.now();sentAt=Date.now();send('view')}
  ['pointerdown','keydown','pointermove','scroll','touchstart'].forEach(type=>document.addEventListener(type,()=>{lastActivity=Date.now()},{passive:true}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){flush()}else{sentAt=Date.now()}});
  setInterval(flush,30000);
  return {view};
})();
