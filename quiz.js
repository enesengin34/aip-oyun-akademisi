'use strict';
/* V12.4: Giriş sunucuda doğrulanır; korumalı soru bankası HTML veya statik JS içinde yer almaz. */
const Quiz=(()=>{
const $=id=>document.getElementById(id);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let quiz=[],idx=0,teams=[],revealed=false,seconds=30,tick=null,remaining=30,showChoicesInitially=true,choicesVisible=true;
let protectedBank=[],authorized=false;
function stop(){if(tick)clearInterval(tick);tick=null}
function loginMarkup(message=''){
  stop();
  $('app').innerHTML=`<section class="quiz-hero"><span class="v12-eyebrow">ÖĞRETMENLERE ÖZEL</span><h1>🔐 Korumalı Bilgi Yarışması</h1><p>Bu bölüm yalnızca yetkili öğretmenler içindir. Devam etmek için yöneticinizin verdiği 8 karakterlik (harf ve rakam) kodu giriniz.</p></section><section class="quiz-card quiz-login-card"><h2>Öğretmen Girişi</h2><form id="quiz-login-form"><label for="quiz-login-code">8 karakterlik giriş kodu</label><input id="quiz-login-code" class="quiz-login-input" type="password" inputmode="text" autocomplete="off" pattern="[A-Za-z0-9]{8}" maxlength="8" placeholder="••••••••" required><button class="v12-btn v12-btn-accent" id="quiz-login-button" type="submit">Yarışmaya giriş yap →</button></form><p id="quiz-login-message" class="quiz-meta-note" role="status">${safe(message)}</p></section>`;
  $('quiz-login-form').onsubmit=async event=>{
    event.preventDefault();const code=$('quiz-login-code').value.trim(),messageNode=$('quiz-login-message'),button=$('quiz-login-button');
    if(!/^[A-Za-z0-9]{8}$/.test(code)){messageNode.textContent='Lütfen yalnızca harf ve rakamlardan oluşan 8 karakter girin.';return}
    button.disabled=true;messageNode.textContent='Kod doğrulanıyor…';
    try{
      const r=await fetch('/api/quiz/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({code}),cache:'no-store'});
      const data=await r.json();
      if(!r.ok){messageNode.textContent=data.error||'Giriş yapılamadı.';return}
      $('quiz-login-code').value='';await loadProtectedBank();
    }catch{messageNode.textContent='Bağlantı kurulamadı. Bu sürüm yalnızca Vercel üzerinden çalışır; indirilen HTML dosyasıyla giriş yapılamaz.'}
    finally{if(button.isConnected)button.disabled=false}
  };
}
async function loadProtectedBank(){
  try{
    const r=await fetch('/api/quiz/questions',{credentials:'same-origin',cache:'no-store'});
    const data=await r.json();
    if(!r.ok){authorized=false;loginMarkup(data.error||'Giriş gerekiyor.');return}
    protectedBank=Array.isArray(data.questions)?data.questions:[];
    authorized=true;showLobby(data.invalidLineCount||0);
  }catch{authorized=false;loginMarkup('Sunucuya ulaşılamadı. Korumalı yarışma yalnızca Vercel üzerinden çalışır.')}
}
async function landing(){
  stop();$('app').innerHTML='<section class="quiz-card"><h2>🔐 Korumalı Bilgi Yarışması</h2><p>Giriş kontrol ediliyor…</p></section>';
  try{
    const r=await fetch('/api/quiz/session',{credentials:'same-origin',cache:'no-store'});
    if(!r.ok)throw Error('Sunucu yanıt vermiyor');
    const data=await r.json();
    if(data.authenticated){await loadProtectedBank();return}
    loginMarkup(data.configured?'':'Yönetici henüz gizli giriş bilgilerini Vercel üzerinde tanımlamadı.');
  }catch{loginMarkup('Bu giriş sistemi yerel index.html üzerinde çalışmaz. Önce Vercel test dağıtımına yükleyin.')}
}
function showLobby(invalidLineCount=0){
  stop();
  $('app').innerHTML=`<section class="quiz-hero"><span class="v12-eyebrow">GİRİŞ ONAYLANDI</span><h1>🏆 Sınıf Bilgi Yarışması</h1><p>Takımlarınızı oluşturun ve özel yarışma sorularıyla sınıfta etkinlik başlatın.</p></section><section class="quiz-card"><div class="quiz-inline-actions"><strong>🔓 Öğretmen oturumu açık</strong><button class="secondary" id="quiz-logout">Güvenli çıkış</button></div><h2>Yarışmayı hazırla</h2><div class="puz-option-row"><label>Takım sayısı <select id="quiz-teams">${[2,3,4].map(n=>`<option value="${n}">${n} takım</option>`).join('')}</select></label><label>Soru sayısı <select id="quiz-count">${[5,10,15,20,30].map(n=>`<option value="${n}" ${n===10?'selected':''}>${n} soru</option>`).join('')}</select></label><label>Soru süresi <select id="quiz-duration">${[15,30,45,60,90].map(n=>`<option value="${n}" ${n===30?'selected':''}>${n} saniye</option>`).join('')}</select></label><label>Şıkları göster <select id="quiz-show-choices"><option value="yes">Başlangıçta göster</option><option value="no">Başlangıçta gizle</option></select></label></div><p class="quiz-meta-note">Korumalı soru bankasında ${protectedBank.length} soru kayıtlı.${invalidLineCount?' Hatalı soru satırları: '+invalidLineCount:''} Öğretmenler soruları sadece yarışma sırasında görür.</p><button class="v12-btn v12-btn-accent" id="quiz-begin">Yarışmayı başlat →</button></section>`;
  $('quiz-logout').onclick=logout;
  $('quiz-begin').onclick=()=>{
    if(!protectedBank.length){alert('Korumalı soru bankası boş. Yönetici Vercel ayarlarından soruları eklemelidir.');return}
    const all=[...protectedBank];for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]]}
    quiz=all.slice(0,+$('quiz-count').value);
    teams=Array.from({length:+$('quiz-teams').value},(_,i)=>({name:['Kırmızı','Mavi','Yeşil','Sarı'][i]+' Takım',points:0}));
    seconds=+$('quiz-duration').value;showChoicesInitially=$('quiz-show-choices').value==='yes';idx=0;show();
  };
}
async function logout(){stop();protectedBank=[];authorized=false;try{await fetch('/api/quiz/logout',{method:'POST',credentials:'same-origin',cache:'no-store'})}catch{}loginMarkup('Çıkış yapıldı.')}
function show(){stop();if(idx>=quiz.length){finish();return}remaining=seconds;revealed=false;choicesVisible=showChoicesInitially;render();tick=setInterval(()=>{remaining--;const e=$('quiz-time');if(e)e.textContent=remaining+' sn';if(remaining<=0){stop();const x=$('quiz-time');if(x)x.textContent='Süre doldu'}},1000)}
function answersMarkup(q){
  if(!choicesVisible)return '<div class="quiz-hidden-choices">Şıklar gizli. Öğretmen isterse “Şıkları göster” düğmesine basabilir.</div>';
  return `<div class="quiz-answers">${q.options.map((opt,i)=>`<div class="quiz-answer ${revealed&&opt===q.answer?'is-correct':''}"><b>${'ABCD'[i]}</b>${safe(opt)}</div>`).join('')}</div>`;
}
function render(){
  const q=quiz[idx];
  $('app').innerHTML=`<div class="quiz-layout"><div class="quiz-main"><div class="brain-toolbar"><button class="secondary" id="quiz-exit">← Yarışmayı bitir</button><span class="quiz-counter">Soru ${idx+1} / ${quiz.length}</span><strong id="quiz-time">${remaining} sn</strong></div><section class="quiz-question"><span class="v12-eyebrow">SINIF BİLGİ YARIŞMASI</span><h2>${safe(q.question)}</h2>${answersMarkup(q)}<div class="quiz-actions">${!choicesVisible?'<button class="secondary" id="quiz-show-btn">Şıkları göster</button>':''}<button class="v12-btn v12-btn-accent" id="quiz-reveal">${revealed?'Cevap gösterildi':'✓ Doğru cevabı göster'}</button><button class="secondary" id="quiz-next">${idx===quiz.length-1?'Sonuçları gör':'Sonraki soru →'}</button></div>${revealed?`<p class="quiz-explain">✅ Doğru cevap: <strong>${safe(q.answer)}</strong>${choicesVisible?`. ${safe(q.explanation)}`:''}</p>`:''}</section></div><aside class="quiz-side"><h3>🏅 Puan tablosu</h3>${teams.map((t,i)=>`<div class="quiz-team"><label>${safe(t.name)}</label><strong>${t.points}</strong><div><button class="secondary" data-score="${i},10">+10</button><button class="secondary" data-score="${i},5">+5</button><button class="secondary" data-score="${i},-5">−5</button></div></div>`).join('')}<p class="puz-note">Öğretmen doğru cevaplayan takımın puanını verir. Bir soruda birden fazla takıma puan verebilirsiniz.</p></aside></div>`;
  $('quiz-exit').onclick=()=>{if(confirm('Yarışmayı bitirip ayarlara dönmek istiyor musunuz?'))landing()};
  if($('quiz-show-btn'))$('quiz-show-btn').onclick=()=>{choicesVisible=true;render()};
  $('quiz-reveal').onclick=()=>{if(!revealed){revealed=true;stop();render()}};
  $('quiz-next').onclick=()=>{idx++;show()};
  document.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>{const[i,score]=b.dataset.score.split(',').map(Number);teams[i].points=Math.max(0,teams[i].points+score);render()});
}
function finish(){stop();const order=teams.slice().sort((a,b)=>b.points-a.points);$('app').innerHTML=`<section class="quiz-hero"><h1>🏆 Yarışma tamamlandı!</h1><p>${quiz.length} soru oynandı. Tebrikler!</p></section><section class="quiz-card"><h2>Final puan tablosu</h2>${order.map((t,i)=>`<div class="quiz-final"><span>${['🥇','🥈','🥉','⭐'][i]} ${safe(t.name)}</span><strong>${t.points} puan</strong></div>`).join('')}<button class="v12-btn v12-btn-accent" id="quiz-restart">Yeni yarışma hazırla</button></section>`;$('quiz-restart').onclick=landing}
return {landing};
})();
