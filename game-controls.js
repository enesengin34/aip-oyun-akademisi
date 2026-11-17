/* V13.4 centralized live game visibility. Public status only; admin mutations require server auth. */
'use strict';
const AIPGameControl=(()=>{
 let disabled=new Set(),loaded=false,error=null;
 let lastFetch=0, inflight=null, listeners=[];
 function isEnabled(id){return loaded&&!disabled.has(id)}
 function notify(){for(const fn of listeners){try{fn()}catch{}}}
 async function refresh(force=false){
  if(inflight)return inflight;
  if(!force&&loaded&&Date.now()-lastFetch<12000)return true;
  inflight=(async()=>{
    try{
      const r=await fetch('/api/books?action=games-status',{cache:'no-store',credentials:'omit'});
      if(!r.ok)throw Error('HTTP '+r.status);
      const j=await r.json();if(!Array.isArray(j.disabled)||j.disabled.some(x=>typeof x!=='string'))throw Error('Geçersiz yanıt');
      const changed=!loaded||JSON.stringify([...disabled].sort())!==JSON.stringify([...j.disabled].sort());
      disabled=new Set(j.disabled);loaded=true;error=null;lastFetch=Date.now();
      if(changed)notify();return true;
    }catch(e){error='Oyunların güncel erişim durumu alınamadı.';if(!loaded){notify()}return false}
    finally{inflight=null}
  })();return inflight;
 }
 async function require(id){const ok=await refresh(true);if(!ok||!isEnabled(id)){
   alert(ok?'Bu oyun şu anda yönetici tarafından kullanıma kapatılmıştır.':'Oyun erişimi kontrol edilemedi. Lütfen bağlantınızı kontrol ederek yeniden deneyin.');return false;
 }return true}
 function onChange(fn){listeners.push(fn)}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true)});
 setInterval(()=>{if(!document.hidden)refresh(true)},60000);
 const ready=refresh(true);
 return {isEnabled,refresh,require,onChange,ready,get loaded(){return loaded},get error(){return error}};
})();
