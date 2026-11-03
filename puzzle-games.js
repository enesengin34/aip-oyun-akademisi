'use strict';
/* AİP Oyun Akademisi — özgün dokunmatik mantık oyunları */
const PuzzleGames=(()=>{
  const types={tangram:['🔺','Tangram','7 geometrik parçayı hedef alanlara uygun yerleştir.'],sudoku:['🔢','Sudoku','4×4, 6×6 veya 9×9 sayı bulmacaları.'],mangala:['🪨','Mangala','48 taş, iki oyuncu, Türk mangalası.'],pentago:['⚫','Pentago','Taşını yerleştir, bir bölgeyi döndür, beşli sırayı oluştur.'],patterns:['🧊','Desen Küpleri','Dokuz desenli karenin yönlerini örneğe benzet.']};
  let type='',state={}, el=()=>document.getElementById('app');
  const rand=n=>Math.floor(Math.random()*n);
  const shuffle=a=>{let b=[...a];for(let i=b.length-1;i>0;i--){let j=rand(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
  function layout(title,intro,html,more=''){
    el().innerHTML=`<div class="brain-toolbar"><button class="secondary" id="puz-back">← Akıl-Zekâ</button><button class="secondary" id="puz-reset">↻ Yeni Oyun</button></div><section class="brain-panel puz-panel"><h1>${types[type][0]} ${title}</h1><p>${intro}</p><div class="puz-status" id="puz-status" role="status" aria-live="polite"></div>${more}${html}</section>`;
    document.getElementById('puz-back').onclick=()=>Brain.list();
    document.getElementById('puz-reset').onclick=()=>type==='sudoku'?initSudoku(state.n,state.difficulty):open(type);
  }
  function status(x){let n=document.getElementById('puz-status');if(n)n.textContent=x;}
  function open(t){clearPuzzleTimer();type=t;if(t==='sudoku')initSudoku(4);else if(t==='mangala')initMangala();else if(t==='pentago')initPentago();else if(t==='patterns')initPatterns();else if(t==='tangram')TangramEngine.start();}
  // Sudoku: unique-solution puzzle generation, selectable complexity and elapsed timer.
  let puzzleTimer=null;
  function clearPuzzleTimer(){if(puzzleTimer){clearInterval(puzzleTimer);puzzleTimer=null}}
  function timerText(seconds){let m=Math.floor(seconds/60),ss=seconds%60;return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`}
  function beginPuzzleTimer(){clearPuzzleTimer();puzzleTimer=setInterval(()=>{if((type!=='sudoku'&&type!=='tangram')||!document.getElementById('puz-clock')){clearPuzzleTimer();return}if(!state.completed){state.elapsed++;const node=document.getElementById('puz-clock');if(node)node.textContent=timerText(state.elapsed)}},1000)}
  function sudokuSolution(n){let bh=n===6?2:n===9?3:2,bw=n/bh;
    let digits=shuffle(Array.from({length:n},(_,i)=>i+1));
    let groups=(len,num)=>shuffle(Array.from({length:num},(_,i)=>i)).flatMap(x=>shuffle(Array.from({length:len},(_,i)=>x*len+i)));
    let rows=groups(bh,n/bh),cols=groups(bw,n/bw);
    return rows.map(r=>cols.map(c=>digits[(r*bw+Math.floor(r/bh)+c)%n]));
  }
  function sudokuCandidates(board,r,c){let n=board.length,bh=n===6?2:n===9?3:2,bw=n/bh,used=new Set([...board[r],...board.map(row=>row[c])]);for(let y=Math.floor(r/bh)*bh;y<Math.floor(r/bh)*bh+bh;y++)for(let x=Math.floor(c/bw)*bw;x<Math.floor(c/bw)*bw+bw;x++)used.add(board[y][x]);return Array.from({length:n},(_,i)=>i+1).filter(v=>!used.has(v));}
  function countSolutions(board,limit=2){let best=null,opts=null,n=board.length;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!board[r][c]){let o=sudokuCandidates(board,r,c);if(!o.length)return 0;if(!opts||o.length<opts.length){best=[r,c];opts=o;if(o.length===1)break;}}if(!best)return 1;let count=0;for(const v of opts){board[best[0]][best[1]]=v;count+=countSolutions(board,limit-count);if(count>=limit)break;}board[best[0]][best[1]]=0;return count;}
  function initSudoku(n=4,difficulty='normal'){
    clearPuzzleTimer();const answer=sudokuSolution(n),board=answer.map(row=>row.slice());
    const ratio={kolay:.62,normal:.48,zor:.36}[difficulty]||.48;
    const target=Math.max(n===4?5:n===6?13:24,Math.round(n*n*ratio));
    let slots=shuffle(Array.from({length:n*n},(_,i)=>i));
    for(const i of slots){if(board.flat().filter(Boolean).length<=target)break;let r=Math.floor(i/n),c=i%n,bak=board[r][c];board[r][c]=0;if(countSolutions(board)>1)board[r][c]=bak;}
    state={n,answer,givens:board.map(row=>row.map(Boolean)),b:board,sel:null,difficulty,elapsed:0,completed:false};drawSudoku();beginPuzzleTimer();
  }
  function drawSudoku(){let s=state,n=s.n,bh=n===6?2:n===9?3:2,bw=n/bh;
    let board=s.b.map((row,r)=>row.map((v,c)=>{const thickLeft=c%bw===0?'border-left:3px solid #111827;':'';const thickTop=r%bh===0?'border-top:3px solid #111827;':'';return `<button class="puz-sudoku-cell ${s.givens[r][c]?'given':''} ${s.sel?.[0]===r&&s.sel?.[1]===c?'sel':''}" style="${thickLeft}${thickTop}" data-r="${r}" data-c="${c}" ${s.givens[r][c]||s.completed?'disabled':''}>${v||''}</button>`}).join('')).join('');
    layout('Sudoku','Her satır, sütun ve kutuda her sayı bir kez bulunmalı. Her bulmacanın tek çözümü vardır.',`<div class="puz-meta">⏱️ Süre: <strong id="puz-clock">${timerText(s.elapsed)}</strong> · Zorluk: <strong>${{kolay:'Kolay',normal:'Orta',zor:'Zor'}[s.difficulty]}</strong></div><div class="puz-sudoku-wrap"><div class="puz-sudoku" style="--puz-size:${n}">${board}</div></div><div class="puz-numberbar">${Array.from({length:n},(_,i)=>`<button class="puz-pill" data-num="${i+1}">${i+1}</button>`).join('')}<button class="puz-pill" data-num="0">Sil</button></div><div class="puz-buttons"><button class="secondary" id="puz-check">Kontrol Et</button><button class="secondary" id="puz-hint">İpucu</button></div><div class="puz-option-row"><label>Tahta <select id="sudoku-size">${[4,6,9].map(x=>`<option value="${x}" ${x===n?'selected':''}>${x}×${x}</option>`).join('')}</select></label><label>Zorluk <select id="sudoku-difficulty">${['kolay','normal','zor'].map(x=>`<option value="${x}" ${x===s.difficulty?'selected':''}>${{kolay:'Kolay',normal:'Orta',zor:'Zor'}[x]}</option>`).join('')}</select></label><button class="secondary" id="sudoku-new">Yeni bulmaca</button></div>`);
    document.querySelectorAll('.puz-sudoku-cell:not(:disabled)').forEach(b=>b.onclick=()=>{s.sel=[+b.dataset.r,+b.dataset.c];drawSudoku()});
    document.querySelectorAll('[data-num]').forEach(b=>b.onclick=()=>{if(!s.sel||s.completed)return;let[r,c]=s.sel;s.b[r][c]=+b.dataset.num;drawSudoku();if(s.b.flat().every(Boolean))checkSudoku()});
    document.getElementById('puz-check').onclick=checkSudoku;document.getElementById('puz-hint').onclick=()=>{if(s.completed)return;let empty=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(s.b[r][c]!==s.answer[r][c]&&!s.givens[r][c])empty.push([r,c]);if(empty.length){let[r,c]=empty[rand(empty.length)];s.b[r][c]=s.answer[r][c];s.givens[r][c]=true;drawSudoku();status('💡 Bir kare için ipucu verildi.')}};
    document.getElementById('sudoku-new').onclick=()=>initSudoku(+document.getElementById('sudoku-size').value,document.getElementById('sudoku-difficulty').value);
  }
  function checkSudoku(){let s=state,wrong=0,filled=0;for(let r=0;r<s.n;r++)for(let c=0;c<s.n;c++){if(s.b[r][c])filled++;if(s.b[r][c]&&s.b[r][c]!==s.answer[r][c])wrong++}if(!wrong&&filled===s.n*s.n){s.completed=true;clearPuzzleTimer();}status(wrong?`🔎 ${wrong} kare yanlış; tekrar düşün.`:s.completed?`🎉 Bulmacayı ${timerText(s.elapsed)} sürede tamamladın!`:'✅ Girilen sayılarda hata yok. Devam et.');}
  // Turkish Mangala: 6 wells + treasury each; one stone remains when selecting 2+; skip opponent treasury.
  function initMangala(){state={board:Array(14).fill(4),turn:0,done:false};state.board[6]=state.board[13]=0;drawMangala();}
  const own=(i,p)=>p===0?(i>=0&&i<=5):(i>=7&&i<=12);
  const store=p=>p===0?6:13;
  function mangalaMove(pit){let s=state,p=s.turn;if(s.done||!own(pit,p)||s.board[pit]===0)return;
    let n=s.board[pit],i=pit;if(n===1){s.board[pit]=0;}else{s.board[pit]=1;n--;}
    while(n>0){i=(i+1)%14;if(i===store(1-p))continue;s.board[i]++;n--;}
    let extra=i===store(p);
    if(!extra&&own(i,1-p)&&s.board[i]===3){s.board[store(p)]+=3;s.board[i]=0;}
    else if(!extra&&own(i,1-p)&&s.board[i]%2===0&&s.board[i]>0){s.board[store(p)]+=s.board[i];s.board[i]=0;}
    let opposite=12-i;
    if(!extra&&own(i,p)&&s.board[i]===1&&opposite>=0&&opposite<=12&&own(opposite,1-p)&&s.board[opposite]>0){s.board[store(p)]+=1+s.board[opposite];s.board[i]=0;s.board[opposite]=0;}
    if([0,1].some(player=>Array.from({length:6},(_,j)=>player?j+7:j).every(j=>s.board[j]===0))){for(let j=0;j<14;j++)if(j!==6&&j!==13){s.board[own(j,0)?6:13]+=s.board[j];s.board[j]=0;}s.done=true;}
    if(!extra&&!s.done)s.turn=1-p;
    drawMangala();
  }
  function drawMangala(){let s=state;const hole=i=>`<button class="puz-pit ${own(i,s.turn)?'active':''}" data-pit="${i}" ${s.done||!own(i,s.turn)?'disabled':''}><span>${s.board[i]}</span><small>${'●'.repeat(Math.min(12,s.board[i]))}</small></button>`;
    const top=Array.from({length:6},(_,j)=>hole(12-j)).join(''),bottom=Array.from({length:6},(_,j)=>hole(j)).join('');
    layout('Mangala','Her oyuncunun altı kuyusu ve bir hazinesi vardır. Sıra sizdeyken kendi kuyunuzdan taş dağıtın.',`<div class="puz-mangala"><div class="puz-store">🔵<b>${s.board[13]}</b><small>2. hazine</small></div><div class="puz-mangala-center"><div class="puz-holes">${top}</div><div class="puz-holes">${bottom}</div></div><div class="puz-store">🔴<b>${s.board[6]}</b><small>1. hazine</small></div></div><div class="puz-note">Sıra geldiğinde taşını seç; taş alma ve tekrar oynama otomatik hesaplanır.</div>`);
    status(s.done?`🏆 Sonuç: Kırmızı ${s.board[6]} — Mavi ${s.board[13]}${s.board[6]===s.board[13]?' • Berabere':s.board[6]>s.board[13]?' • Kırmızı kazandı':' • Mavi kazandı'}`:`Sıra ${s.turn===0?'🔴 Kırmızı (alttaki kuyular)':'🔵 Mavi (üstteki kuyular)'} • Hazineler ${s.board[6]} – ${s.board[13]}`);
    document.querySelectorAll('[data-pit]').forEach(b=>b.onclick=()=>mangalaMove(+b.dataset.pit));
  }
  // Pentago, six by six, place then 90 degree rotate one of four 3x3 quadrants.
  function initPentago(){state={board:Array(36).fill(0),turn:1,phase:'place',done:false};drawPentago();}
  function pWins(b){let got=new Set;for(let r=0;r<6;r++)for(let c=0;c<6;c++)for(const[dr,dc]of [[1,0],[0,1],[1,1],[1,-1]]){let rr=r+4*dr,cc=c+4*dc;if(rr<0||rr>=6||cc<0||cc>=6)continue;let p=b[r*6+c];if(p&&Array.from({length:5},(_,k)=>b[(r+dr*k)*6+c+dc*k]).every(v=>v===p))got.add(p);}return got;}
  function pentagoPlace(i){let s=state;if(s.done||s.phase!=='place'||s.board[i])return;s.board[i]=s.turn;let wins=pWins(s.board);if(wins.size){s.done=true;}else s.phase='rotate';drawPentago();}
  function pentagoRotate(q,dir){let s=state;if(s.done||s.phase!=='rotate')return;let r0=Math.floor(q/2)*3,c0=q%2*3,old=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>s.board[(r0+r)*6+c0+c]));for(let r=0;r<3;r++)for(let c=0;c<3;c++)s.board[(r0+r)*6+c0+c]=dir===1?old[2-c][r]:old[c][2-r];let wins=pWins(s.board);if(wins.size||s.board.every(Boolean))s.done=true;else{s.turn=3-s.turn;s.phase='place';}drawPentago();}
  function drawPentago(){let s=state,wins=pWins(s.board);layout('Pentago','Önce boş kareye taş koy, sonra dört bölgeden birini 90° sağa veya sola döndür.',`<div class="puz-pentago">${s.board.map((v,i)=>`<button class="puz-pent-cell ${(Math.floor(i/6)%3===0)?'toprow':''}" data-cell="${i}" style="${i%6===2?'border-right:4px solid #15254b;':''}${Math.floor(i/6)===2?'border-bottom:4px solid #15254b;':''}">${v===1?'⚫':v===2?'⚪':''}</button>`).join('')}</div><div class="puz-rotate">${[0,1,2,3].map(q=>`<div class="puz-quadrant"><strong>${['Sol üst','Sağ üst','Sol alt','Sağ alt'][q]}</strong><button data-rot="${q},-1">↶</button><button data-rot="${q},1">↷</button></div>`).join('')}</div>`);
    status(s.done?(wins.size===2?'🤝 Aynı anda beşli sıra: berabere!':wins.size?`🏆 ${wins.has(1)?'Siyah':'Beyaz'} kazandı!`:'🤝 Tahta doldu, berabere!'):`${s.turn===1?'⚫ Siyah':'⚪ Beyaz'} • ${s.phase==='place'?'Taşını koy':'Bir bölgeyi döndür'}`);
    document.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>pentagoPlace(+b.dataset.cell));document.querySelectorAll('[data-rot]').forEach(b=>b.onclick=()=>{let[q,d]=b.dataset.rot.split(',').map(Number);pentagoRotate(q,d);});
  }
  // Original 3x3 tile rotation puzzle, inspired by visual reasoning; no protected Q-bitz assets.
  function initPatterns(){let target=Array.from({length:9},()=>rand(4));state={target,cells:Array.from({length:9},()=>rand(4)),done:false};drawPatterns();}
  function tile(k){return `<span class="puz-pattern-tile" style="transform:rotate(${k*90}deg)"><span></span></span>`;}
  function drawPatterns(){let s=state;layout('Desen Küpleri','Sağdaki karışık kartları çevirerek soldaki deseni aynen oluştur. Her karta dokunduğunda 90° döner.',`<div class="puz-pattern-pair"><div><h3>🎯 Hedef desen</h3><div class="puz-pattern-grid">${s.target.map(tile).join('')}</div></div><div><h3>🧩 Senin desenin</h3><div class="puz-pattern-grid">${s.cells.map((v,i)=>`<button class="puz-pattern-button" data-cell="${i}">${tile(v)}</button>`).join('')}</div></div></div><div class="puz-buttons"><button class="primary" id="puz-pattern-check">Deseni Kontrol Et</button></div>`);
    document.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{s.cells[+b.dataset.cell]=(s.cells[+b.dataset.cell]+1)%4;drawPatterns()});document.getElementById('puz-pattern-check').onclick=()=>status(s.cells.every((v,i)=>v===s.target[i])?'🎉 Deseni eksiksiz oluşturdun!':'🔍 Henüz aynı değil; bazı kareleri çevir.');
    status(`Eşleşen kareler: ${s.cells.filter((v,i)=>v===s.target[i]).length}/9`);
  }
  return {has:k=>!!types[k],details:types,open};
})();
