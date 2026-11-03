'use strict';
/* AİP Tangram V12.5 — seven-piece SVG silhouette game, mouse/touch drag and drop. */
const TangramEngine=(()=>{
  const $=id=>document.getElementById(id);
  const NAMES={L1:'Büyük üçgen 1',L2:'Büyük üçgen 2',M:'Orta üçgen',S1:'Küçük üçgen 1',S2:'Küçük üçgen 2',Q:'Kare',P:'Paralelkenar'};
  const KEYS=['L1','L2','M','S1','S2','Q','P'];
  const COLORS={L1:'#ff6b6b',L2:'#ffa94d',M:'#4dabf7',S1:'#51cf66',S2:'#da77f2',Q:'#ffd43b',P:'#20c997'};
  const LEVELS={kolay:{name:'Kolay',hints:3,tol:29},orta:{name:'Orta',hints:2,tol:19},zor:{name:'Zor',hints:1,tol:12}};
  const family=x=>x.startsWith('L')?'L':x.startsWith('S')?'S':x;
  const random=n=>Math.floor(Math.random()*n);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let game=null,interval=null,drag=null;
  const fmt=t=>String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
  function polygonCenter(pts){const a=pts.reduce((acc,p,i)=>acc+p[0]*pts[(i+1)%pts.length][1]-pts[(i+1)%pts.length][0]*p[1],0)/2;let cx=0,cy=0;for(let i=0;i<pts.length;i++){const n=pts[(i+1)%pts.length],w=pts[i][0]*n[1]-n[0]*pts[i][1];cx+=(pts[i][0]+n[0])*w;cy+=(pts[i][1]+n[1])*w;}return [cx/(6*a),cy/(6*a)];}
  function normal(pts){const c=polygonCenter(pts);return pts.map(p=>[p[0]-c[0],p[1]-c[1]]);}
  function transformed(pts,angle=0,flip=false){const rad=angle*Math.PI/180,co=Math.cos(rad),si=Math.sin(rad);return pts.map(([x,y])=>{if(flip)x=-x;return [x*co-y*si,x*si+y*co]});}
  function coords(pts){return pts.map(p=>p.map(n=>Number(n.toFixed(2))).join(',')).join(' ')}
  function symMatch(a,b){const max=0.65;return a.length===b.length&&a.every(p=>b.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<max));}
  function getScreenPoint(e){const board=$('tg-stage-svg');if(!board)return null;const pt=board.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=board.getScreenCTM();if(!m)return null;const pos=pt.matrixTransform(m.inverse());return [pos.x,pos.y];}
  function cleanup(){if(interval){clearInterval(interval);interval=null}if(drag?.ghost)drag.ghost.remove();drag=null;}
  function saveBest(){try{const k='aip-tangram-v125-bests';const obj=JSON.parse(localStorage.getItem(k)||'{}');const old=obj[game.figure.id];if(!old||game.elapsed<old)obj[game.figure.id]=game.elapsed;localStorage.setItem(k,JSON.stringify(obj));}catch{}}
  function choices(){return TANGRAM_FIGURES.filter(f=>f.level===game.level&&(game.category==='all'||f.category===game.category));}
  function start(level='kolay',category='all',id=null){cleanup();const options=TANGRAM_FIGURES.filter(f=>f.level===level&&(category==='all'||f.category===category));const fig=(id&&options.find(f=>f.id===id))||options[random(options.length)]||TANGRAM_FIGURES[0];let pieces={};KEYS.forEach(k=>{let angle=level==='kolay'?0:[0,90,180,270][random(4)];if(level==='orta'&&random(2)===0)angle=0;pieces[k]={angle,flip:level==='zor'&&k==='P'&&random(2)===0,slot:null}});game={figure:fig,level,category,pieces,selected:'L1',elapsed:0,hints:0,completed:false,timed:true,status:'Parçayı seç, gerekirse döndür ve silüetin üzerine sürükle.',highlight:null};render();interval=setInterval(()=>{if(!game||!$('tg-timer')){cleanup();return}if(game.timed&&!game.completed){game.elapsed++;$('tg-timer').textContent=fmt(game.elapsed)}},1000)}
  function switchLevel(x){start(x,'all')}
  function switchCategory(x){start(game.level,x)}
  function rotatePiece(by){if(!game||game.completed)return;const p=game.pieces[game.selected];if(p.slot)return; p.angle=(p.angle+by+360)%360;render();}
  function flipPiece(){if(!game||game.completed)return;const p=game.pieces[game.selected];if(p.slot)return;p.flip=!p.flip;render();}
  function hint(){if(!game||game.completed)return;const max=LEVELS[game.level].hints;if(game.hints>=max){game.status='Bu seviyedeki ipucu hakkın bitti.';drawStatus();return}const piece=KEYS.find(k=>!game.pieces[k].slot);if(!piece)return;game.hints++;game.selected=piece;game.highlight=piece;game.status='Işıklı hedefe dikkat et; '+NAMES[piece]+' parçasını buraya yerleştirebilirsin.';render();}
  function next(){const opts=choices();if(!opts.length)return;let which=opts[random(opts.length)];if(opts.length>1){while(which.id===game.figure.id)which=opts[random(opts.length)]}start(game.level,game.category,which.id)}
  function drawStatus(){const x=$('tg-status');if(x)x.textContent=game.status}
  function viewPieces(){const f=game.figure;return KEYS.filter(k=>game.pieces[k].slot).map(k=>{const slot=game.pieces[k].slot;return `<polygon points="${coords(f.pieces[slot])}" fill="${COLORS[k]}" stroke="#ffffff" stroke-width="1.3" stroke-linejoin="round"/>`}).join('')}
  function stage(){const f=game.figure,edge=coords(f.outline),highlight=game.highlight&&!game.pieces[game.highlight].slot?`<polygon points="${coords(f.pieces[game.highlight])}" fill="#fbbf24" fill-opacity=".29" stroke="#f59e0b" stroke-width="3.4" stroke-dasharray="7 5"/>`:'';
   return `<div class="tg-stage"><div class="tg-stage-heading"><span>🎯 ${esc(f.name)}</span><span>${KEYS.filter(k=>game.pieces[k].slot).length}/7 parça</span></div><svg id="tg-stage-svg" class="tg-svg" viewBox="0 0 400 320" role="img" aria-label="${esc(f.name)} bütünleşik Tangram silüeti"><polygon points="${edge}" fill="#173262" stroke="#102650" stroke-width="2" stroke-linejoin="round"/>${highlight}${viewPieces()}</svg><div class="tg-stage-caption">Hedef tek parça görünür. Renkli parçaları sürükleyerek tamamla.</div></div>`;
  }
  function source(k){const p=game.pieces[k],pts=normal(game.figure.pieces[k]),trans=transformed(pts,p.angle,p.flip);return `<button type="button" class="tg-piece ${p.slot?'tg-placed':''} ${game.selected===k?'tg-current':''}" data-tangpiece="${k}" ${p.slot?'disabled':''} aria-label="${esc(NAMES[k])} ${p.slot?'yerleştirildi':''}"><svg viewBox="-115 -115 230 230" aria-hidden="true"><polygon points="${coords(trans)}" fill="${COLORS[k]}" stroke="#fff" stroke-width="3"/></svg><small>${esc(NAMES[k])}${p.slot?' ✓':''}</small></button>`}
  function render(){if(!game)return;const level=game.level,f=game.figure,options=choices(),max=LEVELS[level].hints;const cats=[...new Set(TANGRAM_FIGURES.filter(x=>x.level===level).map(x=>x.category))];
    const optionsHtml=TANGRAM_FIGURES.filter(x=>x.level===level&&(game.category==='all'||x.category===game.category)).map(x=>`<option value="${x.id}" ${x.id===f.id?'selected':''}>${esc(x.name)}</option>`).join('');
    const content=`<section class="tg-panel"><div class="brain-toolbar"><button class="secondary" id="tg-back">← Akıl-Zekâ</button><button class="secondary" id="tg-next">↻ Yeni figür</button></div><div class="tg-intro"><span class="v12-eyebrow">7 PARÇA · TEK SİLÜET</span><h1>🧩 Tangram Atölyesi</h1><p>Parçaları döndür, çevir ve bütünleşik figürün üzerine sürükleyip bırak. Her şekil yedi standart Tangram parçasıyla çözülebilir.</p></div><div class="tg-settings"><label>Seviye<select id="tg-level">${['kolay','orta','zor'].map(x=>`<option value="${x}" ${x===level?'selected':''}>${LEVELS[x].name}</option>`).join('')}</select></label><label>Kategori<select id="tg-category"><option value="all">Tüm figürler</option>${cats.map(x=>`<option ${x===game.category?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>Figür<select id="tg-figure">${optionsHtml}</select></label><label>Süre<select id="tg-timed"><option value="yes" ${game.timed?'selected':''}>Açık</option><option value="no" ${!game.timed?'selected':''}>Kapalı</option></select></label></div><div class="tg-metrics"><span>⏱ <strong id="tg-timer">${fmt(game.elapsed)}</strong></span><span>💡 İpucu: <strong>${game.hints}/${max}</strong></span><span>🎯 ${options.length} figür seçeneği</span></div><div class="tg-layout">${stage()}<div class="tg-pieces-panel"><h2>Renkli parçalar</h2><p>Bir parçayı seçin, yönünü ayarlayın ve silüetin üzerine sürükleyin.</p><div class="tg-tray">${KEYS.map(source).join('')}</div><div class="tg-controls"><button type="button" id="tg-left" class="secondary" ${game.pieces[game.selected].slot?'disabled':''}>↶ 45°</button><button type="button" id="tg-right" class="secondary" ${game.pieces[game.selected].slot?'disabled':''}>↷ 45°</button><button type="button" id="tg-flip" class="secondary" ${game.pieces[game.selected].slot?'disabled':''}>⇄ Çevir</button><button type="button" id="tg-hint" class="secondary" ${game.hints>=max?'disabled':''}>💡 İpucu</button></div><div class="tg-keyboard">Klavye: ← / → döndür, F çevir, H ipucu. Fare ve dokunmatik sürükleme desteklenir.</div></div></div><div class="tg-message" id="tg-status" role="status" aria-live="polite">${esc(game.status)}</div>${game.completed?`<div class="tg-win"><h2>🎉 Tebrikler! ${'⭐'.repeat(game.hints===0&&game.elapsed<120?3:game.hints<=1?2:1)}</h2><p>${esc(f.name)} tamamlandı. Süre: ${fmt(game.elapsed)} · Kullanılan ipucu: ${game.hints}</p><button class="v12-btn v12-btn-accent" id="tg-finish-next">Yeni figüre geç →</button></div>`:''}</section>`;
    $('app').innerHTML=content;
    $('tg-back').onclick=()=>{cleanup();Brain.list()};$('tg-next').onclick=next;
    $('tg-level').onchange=e=>switchLevel(e.target.value);
    $('tg-category').onchange=e=>switchCategory(e.target.value);
    $('tg-figure').onchange=e=>start(game.level,game.category,e.target.value);
    $('tg-timed').onchange=e=>{game.timed=e.target.value==='yes';game.status=game.timed?'Süre sayacı açık.':'Süresiz oyun seçildi.';drawStatus()};
    $('tg-left').onclick=()=>rotatePiece(-45);$('tg-right').onclick=()=>rotatePiece(45);$('tg-flip').onclick=flipPiece;$('tg-hint').onclick=hint;
    if($('tg-finish-next'))$('tg-finish-next').onclick=next;
    document.querySelectorAll('[data-tangpiece]').forEach(b=>{b.onclick=()=>{if(drag)return;game.selected=b.dataset.tangpiece;render()};b.addEventListener('pointerdown',onPointerDown)});
  }
  function onPointerDown(e){if(e.button!==0||!game||game.completed)return;const key=e.currentTarget.dataset.tangpiece;if(game.pieces[key].slot)return;game.selected=key;drag={key,fromX:e.clientX,fromY:e.clientY,ghost:null,src:e.currentTarget,pid:e.pointerId,moved:false};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.addEventListener('pointermove',onPointerMove);e.currentTarget.addEventListener('pointerup',onPointerUp,{once:true});e.currentTarget.addEventListener('pointercancel',onPointerCancel,{once:true});}
  // Draw the floating piece in the same SVG coordinate scale as the target board.
  // The source tray uses a fixed-size preview, but the board has a responsive
  // viewBox. Measuring the board's screen matrix avoids a misleading tiny piece
  // until the drop is accepted.
  function updateGhost(e){
    if(!drag?.ghost)return;
    const board=$('tg-stage-svg');
    const rect=board?.getBoundingClientRect();
    const overBoard=!!rect && e.clientX>=rect.left && e.clientX<=rect.right && e.clientY>=rect.top && e.clientY<=rect.bottom;
    let size=100;
    if(overBoard){
      const matrix=board.getScreenCTM();
      if(matrix){
        const svgUnitsToPixels=Math.hypot(matrix.a,matrix.b);
        size=230*svgUnitsToPixels;
      }
    }
    // The SVG is centered on its polygon centroid (viewBox -115 ... 230).
    // Aligning the SVG's center with the pointer keeps the piece at the actual
    // target size while carrying it across the silhouette.
    drag.ghost.style.width=size+'px';
    drag.ghost.style.height=size+'px';
    drag.ghost.style.left=e.clientX+'px';
    drag.ghost.style.top=e.clientY+'px';
  }
  function onPointerMove(e){
    if(!drag||e.pointerId!==drag.pid)return;
    const distance=Math.hypot(e.clientX-drag.fromX,e.clientY-drag.fromY);
    if(distance>7&&!drag.moved){
      drag.moved=true;
      const preview=drag.src.querySelector('svg').cloneNode(true);
      const ghost=document.createElement('div');
      ghost.className='tg-ghost';
      ghost.setAttribute('aria-hidden','true');
      ghost.appendChild(preview);
      document.body.appendChild(ghost);
      drag.ghost=ghost;
    }
    if(drag.ghost){e.preventDefault();updateGhost(e)}
  }
  function onPointerCancel(){if(!drag)return;drag.src.removeEventListener('pointermove',onPointerMove);drag.ghost?.remove();drag=null}
  function onPointerUp(e){if(!drag)return;const d=drag;d.src.removeEventListener('pointermove',onPointerMove);d.ghost?.remove();drag=null;if(!d.moved){game.selected=d.key;render();return}const board=$('tg-stage-svg');const rect=board.getBoundingClientRect();if(e.clientX<rect.left-12||e.clientX>rect.right+12||e.clientY<rect.top-12||e.clientY>rect.bottom+12){game.status='Parçayı karartılmış hedef alanına bırak.';drawStatus();return}const at=getScreenPoint(e);if(!at)return;place(d.key,at)}
  function place(key,point){const f=game.figure,p=game.pieces[key],pts=transformed(normal(f.pieces[key]),p.angle,p.flip),tolerance=LEVELS[game.level].tol;let match=null;let best=Infinity;
    for(const target of KEYS){if(family(target)!==family(key)||KEYS.some(k=>game.pieces[k].slot===target))continue;
      const targetCenter=polygonCenter(f.pieces[target]);const distance=Math.hypot(point[0]-targetCenter[0],point[1]-targetCenter[1]);
      if(distance>tolerance||distance>=best)continue;
      if(symMatch(pts,normal(f.pieces[target]))){best=distance;match=target;}
    }
    if(match){p.slot=match;game.highlight=null;if(KEYS.every(k=>game.pieces[k].slot)){game.completed=true;saveBest();cleanup();game.status='Tüm parçalar doğru yerleştirildi!'}else{game.status='✅ '+NAMES[key]+' doğru yerine yerleşti.';game.selected=KEYS.find(k=>!game.pieces[k].slot)}render();}
    else{game.status='Parça yerine oturmadı. Konumunu veya yönünü kontrol et. İstersen ipucu kullan.';drawStatus()}
  }
  function keyboard(e){if(!game||!$('tg-stage-svg')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowLeft'){e.preventDefault();rotatePiece(-45)}if(e.key==='ArrowRight'){e.preventDefault();rotatePiece(45)}if(e.key.toLowerCase()==='f')flipPiece();if(e.key.toLowerCase()==='h')hint()}
  document.addEventListener('keydown',keyboard);
  return {start,cleanup};
})();
