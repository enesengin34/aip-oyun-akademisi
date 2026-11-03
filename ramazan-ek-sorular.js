'use strict';
/*
  AİP RAMAZAN KÖŞESİ — GITHUB TOPLU SORU BANKASI
  Satır biçimi:
  KONU - SINIF - SORU - A ŞIKKI - B ŞIKKI - C ŞIKKI - D ŞIKKI - DOĞRU HARF - AÇIKLAMA
  D şıkkı isteğe bağlıdır. Açıklama önerilir, isteğe bağlıdır.
  Konular: hayat, kuran, namaz, oruc, kultur, ahlak
  Sınıf: 0=Ana sınıfı, 1, 2, 3, 4
  ÖNEMLİ: Alanlar arasında boşluk-tire-boşluk kullanın:  -
  Bu dosya öğrencilerin de okuyabileceği AÇIK soruları içerir; gizli yarışma sorusu koymayın.
  ` (ters tek tırnak) karakterlerini ve const ifadesini silmeyin.
*/
const AIP_RAMAZAN_EK_TEXT = `
oruc - 2 - İftar vaktinde ne yapılır? - Oruç açılır - Sahura kalkılır - Uykuya yatılır - A - İftar, orucun akşam vakti açılmasıdır.
ahlak - 1 - İhtiyacı olan bir arkadaşımıza nasıl davranmalıyız? - Yardım etmeliyiz - Görmezden gelmeliyiz - Alay etmeliyiz - A - Yardımlaşmak güzel ahlakın bir parçasıdır.
kuran - 3 - Kur’an-ı Kerim kaç cüze ayrılmıştır? - 20 - 30 - 40 - B - Kur’an-ı Kerim geleneksel olarak 30 cüze ayrılır.
`;

const RAMADAN_EXTRA_PARSE = (() => {
  const known = new Set(RAMADAN_TOPICS.map(t => t.id));
  const questions = [], errors = [];
  const text = typeof AIP_RAMAZAN_EK_TEXT === 'string' ? AIP_RAMAZAN_EK_TEXT : '';
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+-\s+/).map(x=>x.trim());
    const cat = parts[0], grade = Number(parts[1]);
    const hasExplanation = !/^[ABCDabcd]$/.test(parts[parts.length-1]);
    const correctKey = (hasExplanation ? parts[parts.length-2] : parts[parts.length-1] || '').toUpperCase();
    const explanation = hasExplanation ? parts[parts.length-1] : '';
    const question = parts[2] || '';
    const optionEnd = hasExplanation ? parts.length-2 : parts.length-1;
    const options = parts.slice(3, optionEnd);
    const correctIndex = 'ABCD'.indexOf(correctKey);
    const valid = known.has(cat) && /^[0-4]$/.test(parts[1]) && question.length>=8 && options.length>=3 && options.length<=4 && options.every(Boolean) && correctIndex>=0 && correctIndex<options.length && new Set(options.map(v=>v.toLocaleLowerCase('tr'))).size===options.length && parts.length>5 && (!hasExplanation || explanation.length>0);
    if (!valid) { errors.push(i+1); continue; }
    questions.push({id:'ramazan-ek-'+(i+1),category:cat,grade,question,options,answer:options[correctIndex],explanation:explanation||'Doğru cevap: '+options[correctIndex]+'.'});
  }
  return {questions,errors};
})();
const RAMADAN_ALL_QUESTIONS = (()=>{
  const seen = new Set(RAMADAN_QUESTIONS.map(q=>q.category+'|'+q.question.trim().toLocaleLowerCase('tr')));
  const extra = RAMADAN_EXTRA_PARSE.questions.filter(q=>{
    const key=q.category+'|'+q.question.trim().toLocaleLowerCase('tr');
    if(seen.has(key))return false;
    seen.add(key);return true;
  });
  return [...RAMADAN_QUESTIONS,...extra];
})();
