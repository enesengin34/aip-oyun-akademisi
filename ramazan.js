/* Ramazan Köşesi — veri toplamayan, yerel tarayıcı etkinliği */
const Ramadan=(()=>{
 let grade='all',topic='all',session=[],step=0,points=0,locked=false;
 const $=()=>document.getElementById('app');
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function history(){try{let h=JSON.parse(localStorage.getItem('aip-ramazan-seen')||'{}');for(const q of RAMADAN_ALL_QUESTIONS)if(h[q.id]&&!h[key(q)])h[key(q)]=h[q.id];return h}catch{return {}}}
 function store(v){try{localStorage.setItem('aip-ramazan-seen',JSON.stringify(v))}catch{}}
 function shuffle(a){let b=a.slice();for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b}
 function key(q){return q.category+'|'+q.answer.trim().toLocaleLowerCase('tr')+'|'+q.explanation.trim().toLocaleLowerCase('tr')}
 function pool(){const used=new Set();return RAMADAN_ALL_QUESTIONS.filter(q=>(grade==='all'||q.grade<=Number(grade))&&(topic==='all'||q.category===topic)).filter(q=>{const k=key(q);if(used.has(k))return false;used.add(k);return true;})}
 function availableCount(){return pool().length}

 function landing(){
  const list=pool();
  $().innerHTML=`<section class="ram-hero"><span class="v12-eyebrow">YENİ ÖĞRENME ALANI</span><h1>🌙 Ramazan Köşesi</h1><p>Ramazan, güzel ahlak, İslam tarihi ve temel dinî kavramlar üzerine yaşa uygun etkinlikler.</p><div class="ram-tags"><span>📚 ${RAMADAN_ALL_QUESTIONS.length} kayıt · ${new Set(RAMADAN_ALL_QUESTIONS.map(key)).size} farklı bilgi grubu</span><span>🎒 Ana sınıfı – 4. sınıf</span><span>🔐 Hesap gerektirmez</span></div></section>
  <div class="ram-controls"><label>Sınıf düzeyi <select id="ram-grade"><option value="all">Tüm düzeyler</option>${[0,1,2,3,4].map(n=>`<option value="${n}" ${grade===String(n)?'selected':''}>${n===0?'Ana sınıfı':n+'. sınıf'}</option>`).join('')}</select></label><label>Konu <select id="ram-topic"><option value="all">Tüm konular</option>${RAMADAN_TOPICS.map(t=>`<option value="${t.id}" ${topic===t.id?'selected':''}>${escape(t.title)}</option>`).join('')}</select></label><button class="v12-btn v12-btn-accent" id="ram-start" ${!list.length?'disabled':''}>${list.length?'10 soruluk oyuna başla →':'Uygun soru yok'}</button></div>
  <p class="ram-note">Seçili filtreyle ${list.length} farklı soru grubu mevcut. Soruların zorluk düzeyi seçilen sınıfı aşmaz. Bu bölüm isteğe bağlıdır; öğrenci kişisel bilgisi istenmez.</p>
  <div class="ram-topic-grid">${RAMADAN_TOPICS.map(t=>`<button class="ram-topic" data-topic="${t.id}"><span class="ram-topic-emoji">${t.icon}</span><strong>${escape(t.title)}</strong><span>${new Set(RAMADAN_ALL_QUESTIONS.filter(q=>q.category===t.id).map(key)).size} farklı bilgi grubu</span></button>`).join('')}</div>
  <p class="ram-note">İçerikler öğretmen incelemesi için önizleme niteliğindedir. Eğitim kurumunun tercihleri ve yaş uygunluğu doğrultusunda gözden geçirilmelidir.</p>`;
  document.getElementById('ram-grade').onchange=e=>{grade=e.target.value;landing()};
  document.getElementById('ram-topic').onchange=e=>{topic=e.target.value;landing()};
  document.getElementById('ram-start').onclick=start;
  $().querySelectorAll('[data-topic]').forEach(btn=>btn.onclick=()=>{topic=btn.dataset.topic;landing()});
 }
 function statusMessage(s){window.alert(s)}
 function start(){
  const all=pool(),seen=history();
  const unseen=shuffle(all.filter(q=>!seen[key(q)]));
  if(!unseen.length){statusMessage('Bu filtrede bütün farklı soruları gördün. Yeniden başlamak için soru geçmişin sıfırlandı.');for(const q of all)delete seen[key(q)];store(seen);}
  const order=unseen.length?unseen:shuffle(all);
  session=order.slice(0,Math.min(10,order.length));
  if(!session.length)return;
  step=0;points=0;locked=false;show();
 }
 function show(){
  if(step>=session.length){finish();return;}
  locked=false;const q=session[step];const seen=history();seen[key(q)]=(seen[key(q)]||0)+1;store(seen);
  $().innerHTML=`<div class="ram-play"><div class="ram-progress"><button class="secondary" id="ram-back">← Ramazan Köşesi</button><span>Soru ${step+1}/${session.length} · ${points} doğru</span></div><div class="ram-meter"><span style="width:${(step/session.length)*100}%"></span></div><section class="ram-question"><span class="v12-eyebrow">${escape(RAMADAN_TOPICS.find(t=>t.id===q.category)?.title||'Bilgi')}</span><h2>${escape(q.question)}</h2><div class="ram-answers">${shuffle(q.options).map(a=>`<button class="ram-answer" data-answer="${escape(a)}">${escape(a)}</button>`).join('')}</div><div class="ram-feedback" id="ram-feedback" aria-live="polite"></div></section></div>`;
  document.getElementById('ram-back').onclick=landing;
  $().querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>respond(b.dataset.answer));
 }
 function respond(choice){
  if(locked)return;locked=true;const q=session[step],correct=choice===q.answer;if(correct)points++;
  $().querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;if(b.dataset.answer===q.answer)b.classList.add('ram-correct');else if(b.dataset.answer===choice)b.classList.add('ram-wrong')});
  document.getElementById('ram-feedback').innerHTML=`<strong>${correct?'✅ Doğru!':'🔎 Doğru cevap: '+escape(q.answer)}</strong><p>${escape(q.explanation)}</p><button class="v12-btn v12-btn-accent" id="ram-next">${step+1===session.length?'Sonucu gör':'Sonraki soru'} →</button>`;
  document.getElementById('ram-next').onclick=()=>{step++;show()};
 }
 function finish(){ $().innerHTML=`<section class="ram-finish"><div class="ram-trophy">🏅</div><h1>Harika, tamamladın!</h1><p>${session.length} sorudan <strong>${points}</strong> doğru cevap verdin.</p><p>Yeni sorular denemek için tekrar oynayabilirsin.</p><button class="v12-btn v12-btn-accent" id="ram-again">Yeni oyun</button><button class="secondary" id="ram-home">Konu seçimine dön</button></section>`;document.getElementById('ram-again').onclick=start;document.getElementById('ram-home').onclick=landing;}
 return {landing};
})();
