// V14.3 student-authenticated educational game telemetry (client-reported pilot).
const AIPGameScores=(()=>{
let current=null;
const api=async(action,body)=>{const u='/api/books?action='+encodeURIComponent(action);const r=await fetch(u,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Oturum hatası');return j};
async function ensure(){let s=await api('session');if(s.student)return true;
const code=window.prompt('Oyun performansınızın kaydedilmesi için Kitap Arkadaşım 8 karakterli öğrenci kodunuzu girin.');if(code===null)return false;
if(!/^[A-Za-z0-9]{8}$/.test(code.trim())){alert('8 karakterli öğrenci kodu giriniz.');return false}
try{await api('login',{code:code.trim()});return true}catch(e){alert('Giriş yapılamadı: '+e.message);return false}}
async function begin(gameId){if(!await ensure())return false;try{const r=await api('game-begin',{gameId});current={gameId,ticket:r.ticket};return true}catch(e){alert(e.message);return false}}
async function finish(gameId,score){if(!current||current.gameId!==gameId)return;const ticket=current.ticket;current=null;
try{const r=await api('game-complete',{gameId,ticket,score});const d=document.getElementById('aip-game-score-save');if(d)d.textContent=`✓ Performans kaydedildi · ${r.elapsedSeconds} sn`;await board(gameId);}catch(e){const d=document.getElementById('aip-game-score-save');if(d)d.textContent='Performans kaydedilemedi: '+e.message;}}
async function board(gameId){const host=document.getElementById('aip-game-board');if(!host)return;try{const r=await api('game-board',{gameId});if(!r.visible){host.textContent='';return}host.innerHTML='<h3>🏆 İlk '+r.limit+' (gizli oyuncu adları)</h3>'+(!r.rows.length?'<p>Henüz sonuç yok.</p>':r.rows.map(x=>`<div>${x.rank}. ${x.name} · ${x.score} puan · ${x.elapsedSeconds} sn</div>`).join(''))+'<small>Oyun puanları tarayıcı kaynaklıdır, bağımsız olarak doğrulanmış değildir.</small>'}catch{host.textContent='Sıralama alınamadı.'}}
return {begin,finish,board};
})();
