'use strict';
/* AİP Oyun Akademisi — Hedef 5, 8 sütun x 7 satır, ilk beşliyi tamamlayan kazanır. */
const Hedef5 = (() => {
  const ROWS = 7, COLS = 8, TARGET = 5;
  let match = null;
  const $ = id => document.getElementById(id);
  const players = { 1: 'Kırmızı', 2: 'Mavi' };
  const at = (r,c) => r * COLS + c;

  function winningLine(board, player) {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
      if(board[at(r,c)] !== player) continue;
      for(const [dr,dc] of directions) {
        const rr = r + (TARGET-1)*dr, cc = c + (TARGET-1)*dc;
        if(rr<0||rr>=ROWS||cc<0||cc>=COLS) continue;
        const cells = Array.from({length:TARGET}, (_,i)=>at(r+i*dr,c+i*dc));
        if(cells.every(i => board[i] === player)) return cells;
      }
    }
    return null;
  }
  function newGame() {
    match = {board: Array(ROWS*COLS).fill(0), current: 1, moves:0,
      winner:0, winningCells:[], finished:false, last:-1, message:''};
    render();
  }
  function drop(col) {
    if(!match || match.finished || !Number.isInteger(col) || col<0 || col>=COLS) return false;
    let row=ROWS-1;
    while(row>=0 && match.board[at(row,col)]!==0) row--;
    if(row<0) {match.message='Bu sütun dolu. Başka bir sütun seçin.';updateStatus();return false;}
    const player=match.current, index=at(row,col);
    match.board[index]=player;
    match.last=index;
    match.moves++;
    match.message='';
    const line=winningLine(match.board,player);
    if(line) {match.finished=true;match.winner=player;match.winningCells=line;}
    else if(match.moves===ROWS*COLS) {match.finished=true;match.winner=0;}
    else match.current=player===1?2:1;
    render();
    return true;
  }
  function updateStatus() {
    const msg=$('h5-status'); if(!msg||!match)return;
    msg.textContent = match.message || (match.finished
      ? match.winner ? `🏆 ${players[match.winner]} oyuncu beşliyi tamamladı ve kazandı!` : '🤝 Tahta doldu. Oyun berabere bitti.'
      : `Sıra: ${players[match.current]} oyuncuda. Taş bırakmak için üstteki sütun okuna dokunun.`);
    const title=$('h5-turn'); if(title) title.textContent=match.finished ? (match.winner ? `🏆 ${players[match.winner]} kazandı`:'🤝 Berabere'):`${match.current===1?'🔴':'🔵'} ${players[match.current]} oynuyor`;
    const count=$('h5-count');if(count)count.textContent=`${match.moves} / ${ROWS*COLS} taş`;
  }
  function render() {
    const app=$('app'); if(!app||!match)return;
    const used = [0,1,2].map(p=>match.board.filter(x=>x===p).length);
    const arrows=Array.from({length:COLS},(_,c)=>{
      const disabled=match.finished||match.board[at(0,c)]!==0;
      return `<button type="button" class="h5-column" data-col="${c}" ${disabled?'disabled':''} aria-label="${c+1}. sütuna taş bırak" title="${c+1}. sütun">${disabled?'×':'↓'}<small>${c+1}</small></button>`;
    }).join('');
    const board=match.board.map((p,i)=>`<div class="h5-slot ${match.winningCells.includes(i)?'h5-winning':''} ${match.last===i?'h5-last':''}" role="gridcell" aria-label="${Math.floor(i/COLS)+1}. satır ${i%COLS+1}. sütun: ${p?players[p]:'boş'}"><span class="h5-disc ${p===1?'h5-red':p===2?'h5-blue':''}"></span></div>`).join('');
    app.innerHTML=`<section class="h5-panel"><div class="brain-toolbar"><button type="button" class="secondary" id="h5-back">← Akıl-Zekâ</button><button type="button" class="secondary" id="h5-new">↻ Yeni oyun</button></div>
      <div class="h5-heading"><div><span class="v12-eyebrow">STRATEJİ OYUNU · İKİ OYUNCU</span><h1>🎯 Hedef 5</h1><p>Bir sütun seç, taşın en alt boş yere düşsün. Yatay, dikey veya çapraz <strong>ilk 5 taşı</strong> yan yana getiren kazanır.</p></div><div class="h5-current" id="h5-turn"></div></div>
      <div class="h5-score"><span>🔴 Kırmızı: <strong>${used[1]}/28</strong></span><span>🔵 Mavi: <strong>${used[2]}/28</strong></span><span id="h5-count"></span></div>
      <div class="h5-wrap"><div class="h5-game" aria-label="8 sütunlu 7 satırlı Hedef 5 tahtası"><div class="h5-drops">${arrows}</div><div class="h5-grid" role="grid" aria-label="Taşların bulunduğu oyun tahtası">${board}</div></div></div>
      <div class="h5-status" id="h5-status" role="status" aria-live="polite"></div>
      <details class="h5-rules"><summary>📖 Nasıl oynanır?</summary><p>İki oyuncu aynı cihazda sırayla oynar. Sırası gelen oyuncu, üstteki sekiz sütundan birini seçer. Taşı o sütundaki en alt boş yere yerleşir. Yatay, dikey veya çapraz art arda ilk beş taşını oluşturan oyuncu hemen kazanır. Dolu sütuna taş bırakılamaz. Tahta dolarsa ve beşli oluşmamışsa oyun berabere biter.</p></details>
      </section>`;
    app.querySelectorAll('[data-col]').forEach(btn=>btn.addEventListener('click',()=>drop(Number(btn.dataset.col))));
    $('h5-back').addEventListener('click',()=>Brain.list());
    $('h5-new').addEventListener('click',newGame);
    updateStatus();
  }
  return {open:newGame,drop,winningLine,dimensions:{rows:ROWS,cols:COLS,target:TARGET}};
})();
