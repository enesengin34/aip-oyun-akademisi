import crypto from 'node:crypto';
import {GAMES} from '../game-manifest.mjs';
// V13.1 consolidated book exam endpoint. All code is server-side.


const ROOT='aip:bookexams:v1';
const SKILLS={understanding:'Olayları anlama',characters:'Karakterleri yorumlama',causality:'Neden-sonuç kurma',inference:'Çıkarım yapma',mainidea:'Ana fikir ve kişisel yorum'};
const validSkill=v=>Object.hasOwn(SKILLS,String(v||''));
const COOKIE_STUDENT='aip_book_student';
const COOKIE_ADMIN='aip_book_admin';
const NOW=()=>Math.floor(Date.now()/1000);
const noStore={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private, max-age=0','X-Content-Type-Options':'nosniff'};
function out(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{...noStore,...headers}})}
function error(message,status=400){return out({error:message},status)}
function sameOrigin(req){const origin=req.headers.get('origin');if(!origin)return false;try{return new URL(origin).host===new URL(req.url).host && new URL(origin).protocol==='https:'}catch{return false}}
async function data(req,limit=250000){const raw=await req.text();if(raw.length>limit)throw new Error('İstek çok büyük.');return JSON.parse(raw)}
function redisConfig(){let url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL,token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;if(!url||!token)throw new Error('Veritabanı bağlantısı kurulmadı.');return {url:url.replace(/\/$/,''),token}}
async function redis(...command){const {url,token}=redisConfig();let r=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),cache:'no-store'});if(!r.ok)throw Error('Veritabanı erişim hatası');let j=await r.json();if(j.error)throw Error('Veritabanı komut hatası');return j.result}
const keys={index:`${ROOT}:index`,book:id=>`${ROOT}:book:${id}`,questions:id=>`${ROOT}:questions:${id}`,resultList:`${ROOT}:results`,resultDetail:id=>`${ROOT}:result-detail:${id}`,studentLabel:sub=>`${ROOT}:student-label:${crypto.createHash('sha256').update(sub).digest('hex')}`,studentResult:(sub,id)=>`${ROOT}:result:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,attempt:id=>`${ROOT}:attempt:${id}`,seen:(sub,id)=>`${ROOT}:seen:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,retake:(sub,id)=>`${ROOT}:retake:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,activeAttempt:(sub,id)=>`${ROOT}:active:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,jti:id=>`${ROOT}:assertion:${crypto.createHash('sha256').update(id).digest('hex')}`};
const str=v=>String(v??'');
function mac(s,secret,domain){return crypto.createHmac('sha256',secret).update(domain+'|'+s).digest('base64url')}
const eq=(a,b)=>{let x=Buffer.from(str(a)),y=Buffer.from(str(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
function integrationSecret(){const key=process.env.KITAP_ARKADASIM_INTEGRATION_SECRET;if(!key||key.length<43)throw Error('Entegrasyon güvenlik anahtarı eksik');return key}
function signSession(type,subject,ttl){let exp=NOW()+ttl;let payload=Buffer.from(JSON.stringify({type,subject,exp})).toString('base64url');return `${payload}.${mac(payload,integrationSecret(),'aip:bookexam:session:v1')}`}
function unpackSession(req,type){try{let cookie=req.headers.get('cookie')||'',found=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith((type==='student'?COOKIE_STUDENT:COOKIE_ADMIN)+'='));if(!found)return null;let [payload,tag]=found.slice(found.indexOf('=')+1).split('.');if(!eq(tag,mac(payload,integrationSecret(),'aip:bookexam:session:v1')))return null;let d=JSON.parse(Buffer.from(payload,'base64url').toString());if(d.type!==type||d.exp<NOW()||d.exp>NOW()+6*3600||typeof d.subject!=='string')return null;return d.subject}catch{return null}}
const student=req=>unpackSession(req,'student');
const admin=req=>unpackSession(req,'admin')==='administrator';
function sessionCookie(type,subject,ttl=4*3600){return `${type==='student'?COOKIE_STUDENT:COOKIE_ADMIN}=${signSession(type,subject,ttl)}; HttpOnly; Secure; SameSite=Strict; Path=/api/books; Max-Age=${ttl}`}
function clearCookie(type){return `${type==='student'?COOKIE_STUDENT:COOKIE_ADMIN}=; HttpOnly; Secure; SameSite=Strict; Path=/api/books; Max-Age=0`}
async function requireStudent(req){let s=student(req);if(!s)throw Object.assign(new Error('Öğrenci girişi gerekiyor.'),{status:401});return s}
function requireAdmin(req){if(!admin(req))throw Object.assign(new Error('Yönetici girişi gerekiyor.'),{status:401})}
function respondError(e){return error(e.status?e.message:'Sunucu işlemi tamamlanamadı.',e.status||503)}
function safeId(v){return /^[a-z0-9-]{5,55}$/.test(str(v))}
function examTimer(book){const v=Number(book?.timerSeconds);return book?.timed===true&&Number.isInteger(v)&&v>=10&&v<=3599?v:null}
// All pre-existing books default to 20 until the manager chooses otherwise.
function examCount(book){const n=Number(book?.examQuestionCount);return Number.isInteger(n)&&n>=5&&n<=30?n:20}
function publicBook(b){return {id:b.id,title:b.title,author:b.author,grade:b.grade,active:b.active,count:b.count,examQuestionCount:examCount(b),timed:examTimer(b)!==null,timerSeconds:examTimer(b)||0}}
async function getBook(id){if(!safeId(id))return null;let s=await redis('GET',keys.book(id));return s?JSON.parse(s):null}
async function getBooks(){let ids=JSON.parse((await redis('GET',keys.index))||'[]');let b=await Promise.all(ids.map(getBook));return b.filter(Boolean)}
async function getQuestions(id){return JSON.parse((await redis('GET',keys.questions(id)))||'[]')}
async function attempt(req){let b=await data(req,14000);return b}
function slug(title){return str(title).toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[ıİ]/g,'i').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,35)+'-'+crypto.randomBytes(4).toString('hex')}
function validateQuestion(q){if(!q||typeof q!=='object'||!['test','bosluk'].includes(q.type)||str(q.question).trim().length<8||str(q.question).length>450)return false;
 if(q.type==='test')return Array.isArray(q.options)&&q.options.length===4&&q.options.every(o=>str(o).trim().length>=1&&str(o).length<=140)&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4;
 return Array.isArray(q.answers)&&q.answers.length>0&&q.answers.length<=10&&q.answers.every(a=>{let t=str(a).trim();return t.length>0&&t.length<=70&&t.split(/\s+/).length<=2})}
function parseBulk(text){let parsed=[],errors=[];str(text).split(/\r?\n/).forEach((raw,i)=>{let l=raw.trim();if(!l||l.startsWith('#'))return;let p=l.split(/\s+-\s+/).map(x=>x.trim());let type=(p[0]||'').toUpperCase(),q=null;
  if(type==='TEST'&&p.length===7){let n='ABCD'.indexOf(p[6].toUpperCase());q={type:'test',question:p[1],options:p.slice(2,6),correct:n}}
  if(type==='BOSLUK'&&p.length===3){q={type:'bosluk',question:p[1],answers:p[2].split('/').map(x=>x.trim()).filter(Boolean)}}
  if(!validateQuestion(q))errors.push(i+1);else parsed.push({...q,id:crypto.randomUUID()})});return {parsed,errors}}
function normalize(s){return str(s).normalize('NFC').toLocaleLowerCase('tr-TR').trim().replace(/\s+/g,' ').replace(/[.!?,;:]+$/g,'')}
// Turkish number words and digit strings have the same meaning in short answers.
// Only recognise unambiguous nonnegative integer expressions, not arbitrary words.
const TR_ONES={sıfır:0,bir:1,iki:2,üç:3,dört:4,beş:5,altı:6,yedi:7,sekiz:8,dokuz:9};
const TR_TENS={on:10,yirmi:20,otuz:30,kırk:40,elli:50,altmış:60,yetmiş:70,seksen:80,doksan:90};
function turkishNumber(value){
 const text=normalize(value);
 if(/^\d{1,9}$/.test(text))return Number(text);
 const words=text.split(' ');
 if(words.length>2)return null;
 if(words.length===1){if(Object.hasOwn(TR_ONES,words[0]))return TR_ONES[words[0]];if(Object.hasOwn(TR_TENS,words[0]))return TR_TENS[words[0]];if(words[0]==='yüz')return 100;if(words[0]==='bin')return 1000;return null}
 if(Object.hasOwn(TR_TENS,words[0])&&Object.hasOwn(TR_ONES,words[1])&&TR_ONES[words[1]]>0)return TR_TENS[words[0]]+TR_ONES[words[1]];
 if(words[0]==='yüz'&&Object.hasOwn(TR_ONES,words[1])&&TR_ONES[words[1]]>0)return 100+TR_ONES[words[1]];
 if(Object.hasOwn(TR_ONES,words[0])&&TR_ONES[words[0]]>0&&words[1]==='yüz')return TR_ONES[words[0]]*100;
 return null;
}
function equivalentShortAnswer(a,b){
 if(a===null||a===undefined||normalize(a)==='')return false;
 if(normalize(a)===normalize(b))return true;
 const x=turkishNumber(a),y=turkishNumber(b);
 return x!==null&&y!==null&&x===y;
}
function grade(attempt,answers){let n=0;const details=attempt.questions.map((q,i)=>{const a=answers[i];let good=q.type==='test'?(a!==null&&a!==undefined&&Number(a)===q.correct):q.answers.some(v=>equivalentShortAnswer(a,v));if(good)n++;return {type:q.type,correct:good}});return {correct:n,total:attempt.questions.length,score:Math.round(n/attempt.questions.length*100),details}}
async function authAssertion(assertion){
 const secret=integrationSecret();if(!/^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(str(assertion)))throw Object.assign(new Error('Geçersiz doğrulama yanıtı.'),{status:401});
 const [v,p,sig]=assertion.split('.');
 const derived=crypto.createHmac('sha256',secret).update('kitaparkadasim:aip:assertion:v1').digest();
 const expected=crypto.createHmac('sha256',derived).update(`${v}.${p}`).digest('base64url');
 if(!eq(expected,sig))throw Object.assign(new Error('Doğrulama imzası geçersiz.'),{status:401});
 const claim=JSON.parse(Buffer.from(p,'base64url').toString());let now=NOW();
 if(claim.iss!=='kitaparkadasim'||claim.aud!==(process.env.KITAP_ARKADASIM_INTEGRATION_ID||'aip-oyun-akademisi-prod')||!Number.isInteger(claim.exp)||claim.exp<=now||claim.exp>now+65||typeof claim.jti!=='string'||claim.jti.length<8||claim.jti.length>200||typeof claim.sub!=='string'||!claim.sub||claim.sub.length>200)throw Object.assign(new Error('Doğrulama belgesi geçersiz.'),{status:401});
 // Fail closed when Redis unavailable. Atomic SET NX prevents token replay across instances.
 let result=await redis('SET',keys.jti(claim.jti),'1','EX',120,'NX');
 if(result!=='OK')throw Object.assign(new Error('Doğrulama belgesi daha önce kullanılmış.'),{status:401});
 return claim.sub;
}
async function throttle(key,limit,seconds){const k=`${ROOT}:rate:${crypto.createHash('sha256').update(key).digest('hex')}`;let n=Number(await redis('INCR',k));if(n===1)await redis('EXPIRE',k,seconds);return n<=limit}


// The 8-character access code is checked only against the existing Kitap Arkadasim service.
// It is never stored in Redis, results, logs or the browser after submitting this form.
async function verifyStudentCode(code){
 const url=process.env.KITAP_ARKADASIM_API_URL,id=process.env.KITAP_ARKADASIM_INTEGRATION_ID,key=process.env.KITAP_ARKADASIM_INTEGRATION_SECRET;
 if(!url||!id||!key)throw Object.assign(new Error('Giriş sistemi yapılandırılmadı.'),{status:503});
 const target=new URL(url);if(target.protocol!=='https:'||target.hostname!=='kitaparkadasim.com')throw Object.assign(new Error('Entegrasyon adresi geçersiz.'),{status:503});
 const r=await fetch(target,{method:'POST',headers:{'Content-Type':'application/json','X-Integration-Id':id,Authorization:`Bearer ${key}`},body:JSON.stringify({code}),signal:AbortSignal.timeout(10000),cache:'no-store'});
 if(r.status===429)throw Object.assign(new Error('Giriş deneme sınırı aşıldı.'),{status:429});
 if(r.status===401||r.status===403)throw Object.assign(new Error('Öğrenci kodu doğrulanamadı.'),{status:401});
 if(!r.ok)throw Object.assign(new Error('Kitap Arkadaşım doğrulamasına ulaşılamadı.'),{status:503});
 const response=await r.json();const assertion=response.assertion||response.token||response.verification||response.verificationToken||response.proof||response.data?.assertion||response.data?.token;
 if(!assertion)throw Object.assign(new Error('Doğrulama yanıtı eksik.'),{status:502});
 return authAssertion(assertion);
}

// login
async function handler_login_POST(req){if(!sameOrigin(req))return error('İstek kaynağı kabul edilmedi.',403);try{
 let b=await data(req,2000),code=String(b.code||'');if(!/^[A-Za-z0-9]{8}$/.test(code))return error('Kod geçersiz.',401);
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0];if(!await throttle('student:'+ip,15,900))return error('Çok fazla giriş denemesi.',429);
 const subject=await verifyStudentCode(code);
 return out({ok:true},200,{'Set-Cookie':sessionCookie('student',subject)});
 }catch(e){return respondError(e)}}
async function handler_login_GET(){return error('İzin verilmeyen yöntem.',405)}


// logout
async function handler_logout_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);let type='student';try{let b=await req.json();if(b.type==='admin')type='admin'}catch{}return out({ok:true},200,{'Set-Cookie':clearCookie(type)})}


// session
async function handler_session_GET(req){const sub=student(req);return out({student:!!sub,studentRef:sub?sub.slice(0,12):null,admin:admin(req)})}


// list
async function handler_list_GET(req){if(!student(req)&&!admin(req))return error('Giriş gerekiyor.',401);try{let books=await getBooks();return out({books:books.filter(b=>admin(req)||(b.active&&b.count>=100)).map(publicBook)})}catch(e){return respondError(e)}}


// start: one completed exam per book by default; further attempts require a fresh manager grant.
async function handler_start_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,1000),book=await getBook(b.bookId);
 if(!book||!book.active||book.count<100)return error('Bu kitap sınavı aktif değil.',404);
 const completedKey=keys.studentResult(sub,book.id),retakeKey=keys.retake(sub,book.id),lockKey=keys.activeAttempt(sub,book.id);
 let bank=await getQuestions(book.id);if(bank.length<100)return error('Soru havuzu eksik.',409);const questionCount=examCount(book);if(bank.length<questionCount)return error('Seçilen sınav için yeterli soru yok.',409);
 const existing=await redis('GET',lockKey);
 if(existing){const raw=await redis('GET',keys.attempt(existing));if(raw){let old=JSON.parse(raw);if(old.sub===sub&&old.bookId===book.id)return out({attemptId:existing,book:publicBook(book),questions:publicQuestions(old.questions),startedAt:old.created,deadlineAt:old.deadlineAt||null});}await redis('DEL',lockKey)}
 const id=crypto.randomUUID();
 // Atomic reservation blocks concurrent attempts from the same student for the same book.
 if(await redis('SET',lockKey,id,'EX',3600,'NX')!=='OK')return error('Açık bir sınavınız var. Biraz sonra tekrar deneyin.',409);
 try{
  if(await redis('EXISTS',completedKey)){
   const permission=await redis('GETDEL',retakeKey);
   if(permission!=='1')throw Object.assign(new Error('Bu kitabın sınavını daha önce tamamladınız. Tekrar sınavı için yönetici izni gereklidir.'),{status:403});
  }
  const seenKey=keys.seen(sub,book.id),seen=new Set(await redis('SMEMBERS',seenKey)||[]);
  const shuffle=arr=>{for(let i=arr.length-1;i>0;i--){let j=crypto.randomInt(i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
  let unseen=shuffle(bank.filter(q=>!seen.has(q.id))),repeat=shuffle(bank.filter(q=>seen.has(q.id)));
  if(unseen.length===0){await redis('DEL',seenKey);unseen=shuffle([...bank]);repeat=[]}
  // Prefer never-before-seen questions; when all five skill pools allow it,
  // distribute any selected length (5..30) as evenly as possible among skills.
  let picked=[];
  const skillKeys=shuffle(Object.keys(SKILLS));
  const need=Object.fromEntries(skillKeys.map((k,i)=>[k,Math.floor(questionCount/skillKeys.length)+(i<questionCount%skillKeys.length?1:0)]));
  if(skillKeys.every(k=>unseen.filter(q=>q.skill===k).length>=need[k])){
   for(const k of skillKeys)picked.push(...unseen.filter(q=>q.skill===k).slice(0,need[k]));
  }else picked=unseen.slice(0,questionCount);
  if(picked.length<questionCount)picked.push(...repeat.slice(0,questionCount-picked.length));
  const questions=shuffle(picked);
  const created=Date.now(),seconds=examTimer(book),deadlineAt=seconds?created+seconds*1000:null;
  await redis('SET',keys.attempt(id),JSON.stringify({bookId:book.id,sub,created,deadlineAt,questions}),'EX',3600);
  for(const q of questions)await redis('SADD',seenKey,q.id);
  return out({attemptId:id,book:publicBook(book),questions:publicQuestions(questions),startedAt:created,deadlineAt});
 }catch(e){await redis('DEL',lockKey);throw e}
} catch(e){return respondError(e)}}
function publicQuestions(questions){return questions.map(q=>({id:q.id,type:q.type,question:q.question,...q.type==='test'?{options:q.options}:{}}))}

// submit
async function handler_submit_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,10000);
 if(!/^[a-f0-9-]{36}$/.test(String(b.attemptId||''))||!Array.isArray(b.answers)||b.answers.length<5||b.answers.length>30)return error('Geçersiz sınav gönderimi.',400);
 // Check owner before consuming. GETDEL atomically consumes an attempt once.
 let first=await redis('GET',keys.attempt(b.attemptId));if(!first)return error('Sınav süresi dolmuş veya sınav gönderilmiş.',410);
 if(JSON.parse(first).sub!==sub)return error('Yetkisiz sınav.',403);
 if(JSON.parse(first).questions?.length!==b.answers.length)return error('Cevap sayısı sınavın soru sayısıyla eşleşmiyor.',400);
 let raw=await redis('GETDEL',keys.attempt(b.attemptId));if(!raw)return error('Sınav süresi dolmuş veya sınav gönderilmiş.',410);
 let attempt=JSON.parse(raw);if(attempt.sub!==sub)return error('Yetkisiz sınav.',403);
 if(attempt.created>Date.now()||Date.now()-attempt.created>3600000)return error('Sınav süresi dolmuş.',410);
 const finished=Date.now(),limitMs=attempt.deadlineAt?Math.max(0,attempt.deadlineAt-attempt.created):null;
 const timedOut=limitMs!==null&&finished>=attempt.deadlineAt;
 // Client countdown is informational; only server timestamps decide whether answers may be scored.
 // Small network grace prevents a zero score from a submission dispatched at the deadline.
 const lateBeyondGrace=limitMs!==null&&finished>attempt.deadlineAt+10000;
 const elapsedSeconds=Math.max(0,Math.min(3600,Math.ceil((finished-attempt.created)/1000)));
 const result=grade(attempt,lateBeyondGrace?Array(attempt.questions.length).fill(null):b.answers);
 const record={id:crypto.randomUUID(),bookId:attempt.bookId,studentId:sub,created:new Date(finished).toISOString(),score:result.score,correct:result.correct,total:result.total,elapsedSeconds,timedOut,timerSeconds:limitMs===null?null:Math.floor(limitMs/1000)};
 // V13.6: Keep answers on the server only, never in the student response.
 // Question snapshots survive later replacement of the book's question bank.
 const markedAnswers=lateBeyondGrace?Array(attempt.questions.length).fill(null):b.answers;
 const details=attempt.questions.map((q,i)=>({
  questionId:q.id,type:q.type,question:q.question,skill:validSkill(q.skill)?q.skill:null,
  options:q.type==='test'?q.options:undefined,
  studentAnswer:q.type==='test'?(Number.isInteger(Number(markedAnswers[i]))&&markedAnswers[i]!==null&&markedAnswers[i]!==''&&Number(markedAnswers[i])>=0&&Number(markedAnswers[i])<4?Number(markedAnswers[i]):null):String(markedAnswers[i]??'').slice(0,200),
  correctAnswer:q.type==='test'?q.correct:q.answers,
  correct:result.details[i].correct
 }));
 await redis('SET',keys.resultDetail(record.id),JSON.stringify({result:record,questions:details}));
 await redis('LPUSH',keys.resultList,JSON.stringify(record));await redis('SET',keys.studentResult(sub,attempt.bookId),JSON.stringify(record));await redis('DEL',keys.activeAttempt(sub,attempt.bookId));return out({score:result.score,correct:result.correct,total:result.total,elapsedSeconds,timedOut,lateBeyondGrace});
 }catch(e){return respondError(e)}}


// admin-login
async function handler_admin_login_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const password=process.env.BOOK_EXAM_ADMIN_PASSWORD;if(!password||password.length<16)return error('Kitap sınavları yönetici parolası henüz ayarlanmadı.',503);
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0];if(!await throttle('admin:'+ip,5,900))return error('Giriş sınırı aşıldı.',429);
 const b=await data(req,2000),candidate=String(b.password||'');const h=x=>crypto.createHash('sha256').update(x).digest();
 if(!crypto.timingSafeEqual(h(candidate),h(password)))return error('Giriş bilgileri geçersiz.',401);
 return out({ok:true},200,{'Set-Cookie':sessionCookie('admin','administrator',2*3600)});
 }catch(e){return respondError(e)}}


// admin-create
async function handler_admin_create_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,5000);const title=String(b.title||'').trim(),author=String(b.author||'').trim();let grade=Number(b.grade)||0;
 if(title.length<2||title.length>130||author.length>100||grade<0||grade>4)return error('Kitap bilgileri geçersiz.',400);
 let id=slug(title),book={id,title,author,grade,active:false,count:0,examQuestionCount:20,created:new Date().toISOString()};
 await redis('SET',keys.book(id),JSON.stringify(book));await redis('SET',keys.questions(id),'[]');
 let all=JSON.parse((await redis('GET',keys.index))||'[]');all.push(id);await redis('SET',keys.index,JSON.stringify(all));return out({book});
 }catch(e){return respondError(e)}}


// admin-import
async function handler_admin_import_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,200000),book=await getBook(b.bookId);if(!book)return error('Kitap bulunamadı.',404);
 const {parsed,errors}=parseBulk(b.text);if(errors.length)return out({error:'Bazı satırlar hatalı. Hiç soru kaydedilmedi.',invalidLines:errors},422);
 if(!parsed.length)return error('İçe aktarılacak geçerli soru bulunamadı.',400);
 let bank=b.replace===true?[]:await getQuestions(book.id);if(bank.length+parsed.length>2000)return error('Bir kitap için en çok 2000 soru destekleniyor.',413);
 bank.push(...parsed);await redis('SET',keys.questions(book.id),JSON.stringify(bank));book.count=bank.length;
 if(book.active&&book.count<100)book.active=false;
 await redis('SET',keys.book(book.id),JSON.stringify(book));return out({ok:true,count:book.count,imported:parsed.length,active:book.active});
 }catch(e){return respondError(e)}}


// admin-toggle
async function handler_admin_toggle_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{requireAdmin(req);const b=await data(req,1000),book=await getBook(b.bookId);if(!book)return error('Kitap bulunamadı.',404);if(b.active===true&&book.count<100)return error('Sınavı açmak için en az 100 soru gerekiyor.',409);book.active=b.active===true;await redis('SET',keys.book(book.id),JSON.stringify(book));return out({ok:true,book});}catch(e){return respondError(e)}}


// Admin-only per-book question count. Never retroactively changes an active attempt.
async function handler_admin_question_count_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,1200),book=await getBook(b.bookId);
 if(!book)return error('Kitap bulunamadı.',404);
 if(!Number.isInteger(b.count)||b.count<5||b.count>30)return error('Soru sayısı 5 ile 30 arasında tam sayı olmalıdır.',400);
 book.examQuestionCount=b.count;await redis('SET',keys.book(book.id),JSON.stringify(book));
 return out({ok:true,book:publicBook(book)});
}catch(e){return respondError(e)}}

// Per-book timer settings. Changes affect future attempts; existing attempts retain their original deadline.
async function handler_admin_timer_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,1200),book=await getBook(b.bookId);if(!book)return error('Kitap bulunamadı.',404);
 if(typeof b.timed!=='boolean')return error('Süre ayarı geçersiz.',400);
 let seconds=0;
 if(b.timed){if(!Number.isInteger(b.minutes)||!Number.isInteger(b.seconds)||b.minutes<0||b.minutes>59||b.seconds<0||b.seconds>59)return error('Dakika ve saniye değerleri geçersiz.',400);seconds=b.minutes*60+b.seconds;if(seconds<10||seconds>3599)return error('Süre 10 saniye ile 59 dakika 59 saniye arasında olmalıdır.',400)}
 book.timed=b.timed;book.timerSeconds=seconds;await redis('SET',keys.book(book.id),JSON.stringify(book));return out({ok:true,book:publicBook(book)});
}catch(e){return respondError(e)}}

// Anonymous aggregated usage. No student code, cookie ID, IP or user agent is stored.
// Every event is constrained to a short safe label and an active time <= 60 seconds.
const usageKey=day=>`aip:usage:v1:${day}`;
const validUsageLabel=v=>typeof v==='string'&&/^[\p{L}\p{N} .:()_-]{2,75}$/u.test(v);
async function handler_usage_POST(req){
 if(!sameOrigin(req))return error('İstek kaynağı reddedildi.',403);
 try{
  const b=await data(req,700),label=b.label,mode=b.mode;
  if(!validUsageLabel(label)||!['view','active'].includes(mode))return error('Geçersiz kullanım kaydı.',400);
  const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0];if(!await throttle('usage:'+ip,2500,86400))return error('Kullanım sınırı.',429);
  const day=new Date().toISOString().slice(0,10);
  const k=usageKey(day),field=`${mode==='view'?'v':'s'}:${label}`;
  if(mode==='active'&&(!Number.isInteger(b.seconds)||b.seconds<1||b.seconds>60))return error('Geçersiz süre.',400);
  await redis('HINCRBY',k,field,mode==='view'?1:b.seconds);
  await redis('EXPIRE',k,9*86400);
  return out({ok:true});
 }catch(e){return respondError(e)}
}
function usageMap(raw){if(!raw)return {};if(Array.isArray(raw)){const o={};for(let i=0;i<raw.length;i+=2)o[raw[i]]=Number(raw[i+1]||0);return o}if(typeof raw==='object'){return Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Number(v||0)]))}return {}}
async function recentUsage(){
 const days=[];const totals=new Map();
 for(let offset=6;offset>=0;offset--){const dt=new Date();dt.setUTCHours(12,0,0,0);dt.setUTCDate(dt.getUTCDate()-offset);const day=dt.toISOString().slice(0,10);const obj=usageMap(await redis('HGETALL',usageKey(day)));let visits=0,seconds=0;
 for(const [key,value] of Object.entries(obj)){const type=key.slice(0,2),label=key.slice(2);if(!validUsageLabel(label))continue;let item=totals.get(label)||{name:label,views:0,seconds:0};if(type==='v:'){item.views+=value;visits+=value}else if(type==='s:'){item.seconds+=value;seconds+=value}totals.set(label,item)}days.push({day,views:visits,seconds})}
 return {days,items:[...totals.values()].sort((a,b)=>b.views-a.views).slice(0,100)};
}

// Manager-controlled retakes: one single-use permission for an individual student and book.
async function handler_admin_retake_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,1500),sub=b.studentId,book=await getBook(b.bookId);
 if(!book||typeof sub!=='string'||sub.length<8||sub.length>200)return error('Öğrenci veya kitap bilgisi geçersiz.',400);
 const prior=await redis('GET',keys.studentResult(sub,book.id));
 if(!prior)return error('Bu öğrenci için tamamlanmış bir kitap sınavı bulunamadı.',409);
 if(b.allow===true){await redis('SET',keys.retake(sub,book.id),'1');return out({ok:true,allowed:true})}
 if(b.allow===false){await redis('DEL',keys.retake(sub,book.id));return out({ok:true,allowed:false})}
 return error('İşlem geçersiz.',400);
}catch(e){return respondError(e)}}

// V13.4 centralized game switches — public status + authenticated management.
// Redis set mutations are atomic, and no client-supplied game IDs outside the canonical manifest are accepted.
const GAME_DISABLED_KEY='aip:games:v1:disabled';
const GAME_IDS=new Set(GAMES.map(g=>g.id));
async function gameDisabled(){
 const result=await redis('SMEMBERS',GAME_DISABLED_KEY);
 return (Array.isArray(result)?result:[]).filter(id=>GAME_IDS.has(id));
}
async function handler_games_status_GET(){try{
 return out({disabled:await gameDisabled()});
}catch(e){return respondError(e)}}
async function handler_admin_games_GET(req){try{
 requireAdmin(req);
 const disabled=new Set(await gameDisabled());
 return out({games:GAMES.map(g=>({...g,active:!disabled.has(g.id)}))});
}catch(e){return respondError(e)}}
async function handler_admin_games_set_POST(req){
 if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);
 try{
  requireAdmin(req);
  const b=await data(req,5000);
  if(typeof b.active!=='boolean'||!Array.isArray(b.ids)||b.ids.length===0||b.ids.length>GAMES.length||b.ids.some(id=>typeof id!=='string'||!GAME_IDS.has(id)))return error('Geçersiz oyun seçimi.',400);
  const ids=[...new Set(b.ids)];
  await redis(b.active?'SREM':'SADD',GAME_DISABLED_KEY,...ids);
  return out({ok:true,updated:ids.length,disabled:await gameDisabled()});
 }catch(e){return respondError(e)}
}

// Admin-managed student names/15-digit references, resolved from a verified student code.
async function handler_admin_student_bind_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,3000),code=str(b.code).trim(),name=str(b.name).trim(),externalId=str(b.externalId).trim();
 if(!/^[A-Za-z0-9]{8}$/.test(code))return error('8 karakterli öğrenci kodu gerekli.',400);
 if(name.length>90||/[\x00-\x1F\x7F<>]/.test(name)||externalId&&!/^\d{15}$/.test(externalId))return error('Öğrenci adı veya 15 haneli numara geçersiz.',400);
 if(!name&&!externalId)return error('Öğrenci adı veya 15 haneli numara girin.',400);
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0];
 if(!await throttle('admin-student-bind:v2:'+ip,200,900))return error('Çok fazla eşleştirme denemesi. Daha sonra yeniden deneyin.',429);
 const sub=await verifyStudentCode(code);const label={name,externalId,updated:new Date().toISOString()};
 await redis('SET',keys.studentLabel(sub),JSON.stringify(label));
 return out({ok:true,studentRef:sub.slice(0,12),label});
 }catch(e){return respondError(e)}}
async function handler_admin_student_clear_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,1000),sub=str(b.studentId);
 if(sub.length<8||sub.length>200)return error('Öğrenci kimliği geçersiz.',400);
 await redis('DEL',keys.studentLabel(sub));return out({ok:true});
 }catch(e){return respondError(e)}}
async function studentLabels(subs){const unique=[...new Set(subs)].filter(s=>typeof s==='string'&&s.length>=8&&s.length<=200);if(!unique.length)return {};
 const raw=await redis('MGET',...unique.map(keys.studentLabel));const labels={};
 unique.forEach((sub,i)=>{if(raw[i]){try{const val=JSON.parse(raw[i]);labels[sub]={name:str(val.name),externalId:str(val.externalId)}}catch{}}});return labels;
}

// Admin-only roster of all stored mappings, including students without exam results.
// The mapping keys are hashed; we intentionally never store or expose access codes.
async function handler_admin_student_roster_GET(req){try{
 requireAdmin(req);
 const pattern=`${ROOT}:student-label:*`;
 let cursor='0',scanned=0,stored=[],complete=false;
 do{
  const page=await redis('SCAN',cursor,'MATCH',pattern,'COUNT',200);
  if(!Array.isArray(page)||page.length<2||!Array.isArray(page[1]))throw new Error('Liste okunamadı.');
  cursor=String(page[0]);
  stored.push(...page[1]);
  scanned++;
  if(cursor==='0'){complete=true;break}
 }while(scanned<30&&stored.length<2500);
 const unique=[...new Set(stored)].slice(0,2500),students=[];
 // Redis MGET in moderate chunks to avoid oversized requests.
 for(let i=0;i<unique.length;i+=100){
  const raw=await redis('MGET',...unique.slice(i,i+100));
  raw.forEach(value=>{if(!value)return;try{
   const d=JSON.parse(value);
   if(typeof d.name==='string'||typeof d.externalId==='string')students.push({name:str(d.name).slice(0,90),externalId:str(d.externalId).slice(0,15),updated:str(d.updated).slice(0,30)});
  }catch{}});
 }
 students.sort((a,b)=>a.name.localeCompare(b.name,'tr'));
 return out({students,total:students.length,complete});
}catch(e){return respondError(e)}}

// admin-results
async function handler_admin_results_GET(req){try{requireAdmin(req);let items=await redis('LRANGE',keys.resultList,0,199);const results=(items||[]).map(x=>JSON.parse(x));return out({results,studentLabels:await studentLabels(results.map(r=>r.studentId)),usage:await recentUsage()})}catch(e){return respondError(e)}}


// V13.6: Admin-only question details and analysis. Older results have no recoverable answers.
async function handler_admin_detail_GET(req){try{
 requireAdmin(req);const id=new URL(req.url).searchParams.get('id')||'';
 if(!/^[a-f0-9-]{36}$/.test(id))return error('Sonuç kimliği geçersiz.',400);
 const raw=await redis('GET',keys.resultDetail(id));
 if(!raw)return error('Bu sınavın soru bazlı kaydı bulunmuyor. V13.6 öncesi sonuç olabilir.',404);
 return out(JSON.parse(raw));
}catch(e){return respondError(e)}}

async function handler_admin_analysis_GET(req){try{
 requireAdmin(req);
 const params=new URL(req.url).searchParams;
 const id=params.get('bookId')||'',filterStudent=params.get('studentId')||'';
 if(id&&!safeId(id))return error('Kitap seçimi geçersiz.',400);
 if(filterStudent&&(filterStudent.length>200||!/^[A-Za-z0-9_\-]+$/.test(filterStudent)))return error('Öğrenci kimliği geçersiz.',400);
 const raw=await redis('LRANGE',keys.resultList,0,199);
 const all=(raw||[]).map(x=>JSON.parse(x));
 const selected=all.filter(r=>(!id||r.bookId===id)&&(!filterStudent||r.studentId===filterStudent));
 const detailed=selected.filter(r=>/^[a-f0-9-]{36}$/.test(r.id));
 const rawDetails=detailed.length?await redis('MGET',...detailed.map(r=>keys.resultDetail(r.id))):[];
 const banks=new Map();
 for(const bookId of new Set(selected.map(r=>r.bookId))){
  const questions=await getQuestions(bookId);
  banks.set(bookId,new Map(questions.map(q=>[q.id,q])));
 }
 const questions=new Map(),typeStats={test:{answered:0,correct:0},bosluk:{answered:0,correct:0}};
 const skillStats=Object.fromEntries(Object.keys(SKILLS).map(k=>[k,{asked:0,correct:0,attempts:0}]));
 const studentStats=new Map(), studentTimeline=new Map();
 let analyzedAttempts=0,unclassified=0;
 for(const text of rawDetails||[]){if(!text)continue;let detail;try{detail=JSON.parse(text)}catch{continue}
  if(!Array.isArray(detail.questions)||!detail.result)continue;analyzedAttempts++;
  const record=detail.result;
  let studentRow=studentStats.get(record.studentId);
  if(!studentRow){studentRow={studentId:record.studentId,tests:0,skills:Object.fromEntries(Object.keys(SKILLS).map(k=>[k,{asked:0,correct:0}]))};studentStats.set(record.studentId,studentRow)}
  studentRow.tests++;
  const examSkill={};
  for(const q of detail.questions){if(!['test','bosluk'].includes(q.type)||typeof q.question!=='string')continue;
   const key=record.bookId+'|'+q.questionId;
   const row=questions.get(key)||{bookId:record.bookId,questionId:q.questionId,question:q.question,type:q.type,asked:0,correct:0};
   row.asked++;if(q.correct)row.correct++;questions.set(key,row);
   typeStats[q.type].answered++;if(q.correct)typeStats[q.type].correct++;
   // Prefer the latest human-reviewed bank tag for historical detail. Snapshot is a fallback.
   const bankQ=banks.get(record.bookId)?.get(q.questionId);
   const skill=validSkill(bankQ?.skill)?bankQ.skill:(validSkill(q.skill)?q.skill:null);
   if(!skill){unclassified++;continue}
   row.skill=skill;
   skillStats[skill].asked++;if(q.correct)skillStats[skill].correct++;
   studentRow.skills[skill].asked++;if(q.correct)studentRow.skills[skill].correct++;
   examSkill[skill]??={asked:0,correct:0};examSkill[skill].asked++;if(q.correct)examSkill[skill].correct++;
  }
  const list=studentTimeline.get(record.studentId)||[];
  list.push({id:record.id,bookId:record.bookId,date:record.created,score:record.score,elapsedSeconds:record.elapsedSeconds,skills:examSkill});
  studentTimeline.set(record.studentId,list);
 }
 const count=selected.length;
 const labels=await studentLabels([...studentStats.keys()]);
 return out({scope:'last_200_results',totalResults:count,analyzedAttempts,oldResultsWithoutDetail:count-analyzedAttempts,
  averageScore:count?Math.round(selected.reduce((n,r)=>n+(Number(r.score)||0),0)/count*10)/10:null,
  averageSeconds:(()=>{const values=selected.map(r=>r.elapsedSeconds).filter(Number.isFinite);return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):null})(),
  timedOut:selected.filter(r=>r.timedOut===true).length,typeStats,unclassified,skillNames:SKILLS,skillStats,
  questions:[...questions.values()].map(q=>({...q,rate:Math.round(100*q.correct/q.asked)})).sort((a,b)=>a.correct/a.asked-b.correct/b.asked||b.asked-a.asked).slice(0,250),
  students:[...studentStats.values()].map(s=>({...s,name:labels[s.studentId]?.name||'',externalId:labels[s.studentId]?.externalId||'',timeline:(studentTimeline.get(s.studentId)||[]).sort((a,b)=>a.date.localeCompare(b.date))})).sort((a,b)=>(a.name||a.studentId).localeCompare(b.name||b.studentId,'tr')),
  books:[...new Set(all.map(r=>r.bookId))]
 });
}catch(e){return respondError(e)}}

// V13.7: Admin-only, explicit human-reviewed skill classification of question banks.
// Never disclose answer keys to students; skill labels are only in admin endpoints.
async function handler_admin_skills_GET(req){try{
 requireAdmin(req);const id=new URL(req.url).searchParams.get('bookId')||'';
 if(!safeId(id))return error('Kitap seçiniz.',400);
 const book=await getBook(id);if(!book)return error('Kitap bulunamadı.',404);
 const bank=await getQuestions(id);
 return out({bookId:id,skills:SKILLS,questions:bank.map(q=>({id:q.id,type:q.type,question:q.question,skill:validSkill(q.skill)?q.skill:null})),count:bank.length});
}catch(e){return respondError(e)}}
async function handler_admin_skills_set_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,65000);
 if(!safeId(b.bookId)||!Array.isArray(b.changes)||b.changes.length<1||b.changes.length>500)return error('Geçersiz soru grubu.',400);
 const bank=await getQuestions(b.bookId),book=await getBook(b.bookId);if(!book)return error('Kitap bulunamadı.',404);
 const byId=new Map(bank.map(q=>[q.id,q]));const found=new Set();
 for(const item of b.changes){if(!item||typeof item.id!=='string'||!byId.has(item.id)||found.has(item.id)||!(item.skill===null||validSkill(item.skill)))return error('Hatalı soru veya beceri etiketi.',400);found.add(item.id)}
 for(const item of b.changes){const q=byId.get(item.id);if(item.skill===null)delete q.skill;else q.skill=item.skill}
 await redis('SET',keys.questions(b.bookId),JSON.stringify(bank));
 return out({ok:true,updated:b.changes.length,total:bank.length});
}catch(e){return respondError(e)}}

// V14.1: Edit a single question without replacing the question bank.
// Earlier exam snapshots remain immutable. The same ID keeps reviewed skill tags.
async function handler_admin_question_edit_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,4500);
 if(!safeId(b.bookId)||typeof b.questionId!=='string')return error('Kitap veya soru kimliği geçersiz.',400);
 const book=await getBook(b.bookId);if(!book)return error('Kitap bulunamadı.',404);
 const bank=await getQuestions(b.bookId),index=bank.findIndex(q=>q.id===b.questionId);
 if(index<0)return error('Soru bulunamadı.',404);
 const old=bank[index];const q={...old,question:str(b.question||'').trim()};
 if(old.type==='test'){
  q.options=Array.isArray(b.options)?b.options.map(x=>str(x).trim()):[];
  q.correct=Number(b.correct);
 }else q.answers=Array.isArray(b.answers)?b.answers.map(x=>str(x).trim()).filter(Boolean):[];
 if(!validateQuestion(q))return error('Soru biçimi veya cevap seçenekleri geçersiz.',400);
 if(b.difficulty!==undefined){if(!['easy','medium','hard','unset'].includes(b.difficulty))return error('Zorluk etiketi geçersiz.',400);if(b.difficulty==='unset')delete q.difficulty;else q.difficulty=b.difficulty}
 bank[index]=q;await redis('SET',keys.questions(b.bookId),JSON.stringify(bank));
 return out({ok:true,questionId:q.id});
}catch(e){return respondError(e)}}
// Read-only admin question editor: never send answer keys to student endpoints.
async function handler_admin_question_bank_GET(req){try{
 requireAdmin(req);const bookId=new URL(req.url).searchParams.get('bookId')||'';
 if(!safeId(bookId)||!await getBook(bookId))return error('Kitap bulunamadı.',404);
 return out({questions:await getQuestions(bookId)});
}catch(e){return respondError(e)}}

// V14.1: audited manual review of a single answer. This is restricted to the admin.
// The response retains the original student answer; only the marking decision changes.
async function handler_admin_answer_review_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,1800);
 if(!/^[a-f0-9-]{36}$/.test(str(b.resultId))||!Number.isInteger(b.index)||b.index<0||b.index>29||typeof b.correct!=='boolean'||typeof b.reason!=='string'||b.reason.trim().length<5||b.reason.length>250)return error('İnceleme bilgileri eksik.',400);
 const raw=await redis('GET',keys.resultDetail(b.resultId));if(!raw)return error('Sınav ayrıntısı bulunamadı.',404);
 const detail=JSON.parse(raw);if(!Array.isArray(detail.questions)||!detail.questions[b.index]||detail.result?.id!==b.resultId)return error('Soru bulunamadı.',404);
 const list=await redis('LRANGE',keys.resultList,0,1999);
 const pos=list.findIndex(x=>{try{return JSON.parse(x).id===b.resultId}catch{return false}});
 if(pos<0)return error('Sonuç listede bulunamadı; elle düzeltilmedi.',409);
 const q=detail.questions[b.index];const previous=q.correct===true;
 if(previous===b.correct)return error('Seçilen cevap zaten bu şekilde değerlendirilmiş.',409);
 const oldCorrect=detail.result.correct,oldScore=detail.result.score;
 const nextCorrect=detail.questions.reduce((n,item,i)=>n+((i===b.index?b.correct:item.correct)===true?1:0),0);
 const nextScore=Math.round(nextCorrect/detail.questions.length*100);
 const edit={at:new Date().toISOString(),questionIndex:b.index,questionId:q.questionId,oldCorrect:previous,newCorrect:b.correct,oldScore,newScore:nextScore,reason:b.reason.trim()};
 q.correct=b.correct;detail.result.correct=nextCorrect;detail.result.score=nextScore;
 detail.reviews=[...(detail.reviews||[]),edit].slice(-100);
 // Save the full details first so the audit trail is never lost if result list update fails.
 await redis('SET',keys.resultDetail(b.resultId),JSON.stringify(detail));
 await redis('LSET',keys.resultList,pos,JSON.stringify(detail.result));
 const latest=await redis('GET',keys.studentResult(detail.result.studentId,detail.result.bookId));
 if(latest){try{if(JSON.parse(latest).id===b.resultId)await redis('SET',keys.studentResult(detail.result.studentId,detail.result.bookId),JSON.stringify(detail.result))}catch{}}
 return out({ok:true,result:detail.result,review:edit});
}catch(e){return respondError(e)}}

// V14.2: preview/apply number-word regrading, without overwriting manual reviews.
// The original student answer and every review note remain immutable.
async function handler_admin_regrade_numbers_POST(req){
 if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);
 try{
  requireAdmin(req);
  const b=await data(req,1000);
  if(b.apply!==true&&b.apply!==false)return error('İşlem türü geçersiz.',400);
  const rows=await redis('LRANGE',keys.resultList,0,199);
  let eligible=0,changedExams=0,changedAnswers=0,manualSkipped=0,oldWithoutDetails=0,failed=0;
  // Restrict to 200 results in line with the existing dashboard and Vercel execution limits.
  for(let pos=0;pos<rows.length;pos++){
   let record,detail;
   try{record=JSON.parse(rows[pos]);const raw=await redis('GET',keys.resultDetail(record.id));if(!raw){oldWithoutDetails++;continue}detail=JSON.parse(raw)}catch{failed++;continue}
   if(!Array.isArray(detail.questions)||detail.result?.id!==record.id){failed++;continue}
   let changes=0;
   const manuallyReviewed=new Set((detail.reviews||[]).map(r=>r.questionIndex));
   for(let i=0;i<detail.questions.length;i++){
    const q=detail.questions[i];if(q.type!=='bosluk'||q.correct===true)continue;
    if(manuallyReviewed.has(i)){manualSkipped++;continue}
    if(!Array.isArray(q.correctAnswer)||!q.correctAnswer.some(expected=>equivalentShortAnswer(q.studentAnswer,expected)))continue;
    eligible++;changes++;
    if(b.apply){q.correct=true;detail.reviews=[...(detail.reviews||[]),{at:new Date().toISOString(),questionIndex:i,questionId:q.questionId,oldCorrect:false,newCorrect:true,reason:'V14.2: Türkçe sayı ve rakam eşdeğerliğiyle otomatik yeniden değerlendirme',kind:'automatic-number-equivalence'}].slice(-100)}
   }
   if(!changes)continue;
   changedExams++;changedAnswers+=changes;
   if(!b.apply)continue;
   const newCorrect=detail.questions.reduce((n,q)=>n+(q.correct===true?1:0),0);
   detail.result.correct=newCorrect;detail.result.score=Math.round(newCorrect/detail.questions.length*100);
   // Preserve previously stored metadata (elapsed time, book/student refs, etc.).
   await redis('SET',keys.resultDetail(record.id),JSON.stringify(detail));
   await redis('LSET',keys.resultList,pos,JSON.stringify(detail.result));
   const latest=await redis('GET',keys.studentResult(record.studentId,record.bookId));
   if(latest){try{if(JSON.parse(latest).id===record.id)await redis('SET',keys.studentResult(record.studentId,record.bookId),JSON.stringify(detail.result))}catch{}}
  }
  return out({ok:true,mode:b.apply?'applied':'preview',examCount:changedExams,answerCount:changedAnswers,manualSkipped,oldWithoutDetails,failed,scanned:rows.length});
 }catch(e){return respondError(e)}
}

// admin-backup
async function handler_admin_backup_GET(req){try{requireAdmin(req);let books=await getBooks();let payload=await Promise.all(books.map(async b=>({book:b,questions:await getQuestions(b.id)})));return out({created:new Date().toISOString(),version:1,data:payload})}catch(e){return respondError(e)}}



// V14.3 — Pilot: only the 49 five-question educational games use this flow.
// Scores are client-reported and are NOT cryptographically verified gameplay.
const GAME_SESSION_PREFIX='aip:games:v143:session:';
const GAME_RESULTS='aip:games:v143:results';
const GAME_BOARD_SETTINGS='aip:games:v143:leaderboard:settings';
const educationalGame=id=>GAMES.find(g=>g.id===id&&g.group==='Eğitici Oyunlar');
const gameSessionKey=id=>GAME_SESSION_PREFIX+id;
async function gameSettings(){const raw=await redis('GET',GAME_BOARD_SETTINGS);try{const d=JSON.parse(raw);return {visible:!!d.visible,limit:d.limit===10?10:5}}catch{return {visible:false,limit:5}}}
async function handler_game_begin_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,400),game=educationalGame(b.gameId);
 if(!game)return error('Bu oyun henüz performans takibini desteklemiyor.',400);
 if((await gameDisabled()).includes(game.id))return error('Oyun pasif.',403);
 const ticket=crypto.randomUUID(),start=NOW();
 await redis('SET',gameSessionKey(ticket),JSON.stringify({sub,gameId:game.id,start}),'EX',3600);
 return out({ticket,startedAt:start});
}catch(e){return respondError(e)}}
async function handler_game_complete_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,600),ticket=str(b.ticket),game=educationalGame(b.gameId);
 if(!/^[a-f0-9-]{36}$/.test(ticket)||!game)return error('Oyun oturumu geçersiz.',400);
 const raw=await redis('GETDEL',gameSessionKey(ticket));if(!raw)return error('Oyun kaydı daha önce işlendi veya zaman aşımına uğradı.',409);
 const session=JSON.parse(raw),elapsed=NOW()-session.start,score=Number(b.score);
 if(session.sub!==sub||session.gameId!==game.id||elapsed<5||elapsed>3600||!Number.isInteger(score)||score<0||score>100||score%20!==0)return error('Sonuç doğrulanamadı.',400);
 const entry={id:crypto.randomUUID(),studentId:sub,gameId:game.id,score,elapsedSeconds:elapsed,created:new Date().toISOString(),verification:'client-reported'};
 await redis('LPUSH',GAME_RESULTS,JSON.stringify(entry));await redis('LTRIM',GAME_RESULTS,0,1999);
 return out({ok:true,score,elapsedSeconds:elapsed});
}catch(e){return respondError(e)}}
async function handler_admin_game_performance_GET(req){try{
 requireAdmin(req);const raw=await redis('LRANGE',GAME_RESULTS,0,1999),results=raw.map(x=>JSON.parse(x));
 return out({results,studentLabels:await studentLabels(results.map(x=>x.studentId)),games:GAMES.filter(g=>g.group==='Eğitici Oyunlar'),settings:await gameSettings(),limited:true});
}catch(e){return respondError(e)}}
async function handler_admin_game_board_settings_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,300);if(typeof b.visible!=='boolean'||![5,10].includes(b.limit))return error('Skor tablosu ayarları geçersiz.',400);
 await redis('SET',GAME_BOARD_SETTINGS,JSON.stringify({visible:b.visible,limit:b.limit}));return out({ok:true,settings:await gameSettings()});
}catch(e){return respondError(e)}}
async function handler_game_board_GET(req){try{
 const settings=await gameSettings();if(!settings.visible)return out({visible:false,limit:settings.limit,rows:[]});
 const gameId=new URL(req.url).searchParams.get('gameId')||'',game=educationalGame(gameId);
 if(!game)return error('Oyun seçiniz.',400);
 const raw=await redis('LRANGE',GAME_RESULTS,0,1999),best=new Map();
 for(const item of raw){let r;try{r=JSON.parse(item)}catch{continue}if(r.gameId!==gameId)continue;const old=best.get(r.studentId);if(!old||r.score>old.score||(r.score===old.score&&r.elapsedSeconds<old.elapsedSeconds))best.set(r.studentId,r)}
 const rows=[...best.values()].sort((a,b)=>b.score-a.score||a.elapsedSeconds-b.elapsedSeconds).slice(0,settings.limit);
 // Public boards deliberately contain no actual names, student references, or login codes.
 return out({visible:true,limit:settings.limit,rows:rows.map((r,i)=>({rank:i+1,name:`Oyuncu #${crypto.createHash('sha256').update('public-board:v1|'+r.studentId).digest('hex').slice(0,6).toUpperCase()}`,score:r.score,elapsedSeconds:r.elapsedSeconds}))});
}catch(e){return respondError(e)}}

// V14.4 — Initial Akıl-Zekâ tracking: OXO, Reversi and Sudoku only.
// Results are reported by the browser; NOT suitable for official competition rankings.
const BRAIN_TYPES={oxo:'OXO',reversi:'Reversi',sudoku:'Sudoku'};
const BRAIN_LEVELS=['easy','normal','hard'];
const BRAIN_DIFFICULTY=['kolay','normal','zor'];
const brainRunKey=t=>`aip:brain:v144:run:${t}`;
const BRAIN_RESULTS='aip:brain:v144:results';
const BRAIN_PUBLIC='aip:brain:v144:public';
function brainValid(gameId,level,shape){return Object.hasOwn(BRAIN_TYPES,gameId)&&(gameId==='sudoku'?BRAIN_DIFFICULTY.includes(level)&&[4,6,9].includes(Number(shape)):BRAIN_LEVELS.includes(level)&&!shape)}
async function brainSettings(){try{const d=JSON.parse(await redis('GET',BRAIN_PUBLIC));return {visible:!!d.visible,limit:d.limit===10?10:5}}catch{return {visible:false,limit:5}}}
async function handler_brain_begin_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,300),gameId=str(b.gameId),level=str(b.level),shape=Number(b.shape||0);
 if(!brainValid(gameId,level,shape))return error('Bu oyun veya seviye henüz desteklenmiyor.',400);
 if((await gameDisabled()).includes('brain:'+gameId))return error('Oyun pasif.',403);
 if(!await throttle(`brain-start:${sub}`,90,3600))return error('Çok fazla oyun başlatıldı.',429);
 const ticket=crypto.randomUUID(),started=NOW();
 await redis('SET',brainRunKey(ticket),JSON.stringify({sub,gameId,level,shape,started}),'EX',7200);
 return out({ticket,startedAt:started});
}catch(e){return respondError(e)}}
async function handler_brain_complete_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,400),ticket=str(b.ticket);
 if(!/^[a-f0-9-]{36}$/.test(ticket))return error('Oyun bileti geçersiz.',400);
 const raw=await redis('GETDEL',brainRunKey(ticket));if(!raw)return error('Bu oyun daha önce kaydedilmiş veya zaman aşımına uğramış.',409);
 const run=JSON.parse(raw),seconds=NOW()-run.started;
 if(run.sub!==sub||run.gameId!==str(b.gameId)||run.level!==str(b.level)||seconds<2||seconds>7200)return error('Oyun sonucu doğrulanamadı.',400);
 if(run.gameId==='sudoku'&&(!Number.isInteger(b.elapsed)||b.elapsed<1||b.elapsed>seconds+4||run.shape!==Number(b.shape)))return error('Sudoku süresi doğrulanamadı.',400);
 if(run.gameId!=='sudoku'&&!['win','loss','draw'].includes(b.outcome))return error('Oyun sonucu geçersiz.',400);
 const result={id:crypto.randomUUID(),studentId:sub,gameId:run.gameId,level:run.level,shape:run.shape||null,outcome:run.gameId==='sudoku'?'complete':b.outcome,seconds:run.gameId==='sudoku'?seconds:null,created:new Date().toISOString(),verification:'client-reported'};
 await redis('LPUSH',BRAIN_RESULTS,JSON.stringify(result));await redis('LTRIM',BRAIN_RESULTS,0,4999);
 return out({ok:true,seconds:result.seconds,reported:true});
}catch(e){return respondError(e)}}
async function brainAll(){return (await redis('LRANGE',BRAIN_RESULTS,0,4999)).flatMap(x=>{try{return [JSON.parse(x)]}catch{return []}})}
async function handler_brain_board_GET(req){try{
 const u=new URL(req.url),gameId=u.searchParams.get('gameId')||'',level=u.searchParams.get('level')||'',shape=Number(u.searchParams.get('shape')||0);
 if(!brainValid(gameId,level,shape))return error('Oyun seçimi geçersiz.',400);
 const settings=await brainSettings();if(!settings.visible)return out({visible:false,limit:settings.limit,rows:[]});
 const results=(await brainAll()).filter(r=>r.gameId===gameId&&r.level===level&&(gameId!=='sudoku'||r.shape===shape));
 const best=new Map();for(const r of results){let p=best.get(r.studentId);if(!p){p={...r,wins:0,losses:0,draws:0,seconds:null};best.set(r.studentId,p)}if(gameId==='sudoku'){if(p.seconds===null||r.seconds<p.seconds)p.seconds=r.seconds}else if(r.outcome==='win')p.wins++;else if(r.outcome==='loss')p.losses++;else if(r.outcome==='draw')p.draws++}
 const rows=[...best.values()].sort((a,b)=>gameId==='sudoku'?a.seconds-b.seconds:b.wins-a.wins||b.draws-a.draws||a.losses-b.losses).slice(0,settings.limit);
 return out({visible:true,limit:settings.limit,rows:rows.map((r,i)=>({rank:i+1,name:`Oyuncu #${crypto.createHash('sha256').update('public-brain:v1|'+r.studentId).digest('hex').slice(0,6).toUpperCase()}`,seconds:r.seconds,wins:r.wins,losses:r.losses,draws:r.draws}))});
}catch(e){return respondError(e)}}
async function handler_admin_brain_performance_GET(req){try{requireAdmin(req);const results=await brainAll();return out({results,studentLabels:await studentLabels(results.map(r=>r.studentId)),settings:await brainSettings(),games:BRAIN_TYPES,limited:true})}catch(e){return respondError(e)}}
async function handler_admin_brain_settings_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{requireAdmin(req);const b=await data(req,300);if(typeof b.visible!=='boolean'||![5,10].includes(b.limit))return error('Sıralama ayarları geçersiz.',400);await redis('SET',BRAIN_PUBLIC,JSON.stringify({visible:b.visible,limit:b.limit}));return out({ok:true})}catch(e){return respondError(e)}}

const handlers = {
  'login': {'GET': handler_login_GET, 'POST': handler_login_POST},
  'logout': {'POST': handler_logout_POST},
  'session': {'GET': handler_session_GET},
  'list': {'GET': handler_list_GET},
  'start': {'POST': handler_start_POST},
  'submit': {'POST': handler_submit_POST},
  'admin-login': {'POST': handler_admin_login_POST},
  'admin-create': {'POST': handler_admin_create_POST},
  'admin-import': {'POST': handler_admin_import_POST},
  'admin-toggle': {'POST': handler_admin_toggle_POST},
  'admin-timer': {'POST': handler_admin_timer_POST},
  'admin-question-count': {'POST': handler_admin_question_count_POST},
  'admin-results': {'GET': handler_admin_results_GET},
  'admin-student-bind': {'POST': handler_admin_student_bind_POST},
  'admin-student-roster': {'GET': handler_admin_student_roster_GET},
  'admin-student-clear': {'POST': handler_admin_student_clear_POST},
  'admin-detail': {'GET': handler_admin_detail_GET},
  'admin-analysis': {'GET': handler_admin_analysis_GET},
  'admin-skills': {'GET': handler_admin_skills_GET},
  'admin-skills-set': {'POST': handler_admin_skills_set_POST},
  'admin-backup': {'GET': handler_admin_backup_GET},
  'admin-question-bank': {'GET': handler_admin_question_bank_GET},
  'admin-question-edit': {'POST': handler_admin_question_edit_POST},
  'admin-answer-review': {'POST': handler_admin_answer_review_POST},
  'admin-regrade-numbers': {'POST': handler_admin_regrade_numbers_POST},
  'admin-retake': {'POST': handler_admin_retake_POST},
  'usage': {'POST': handler_usage_POST},
  'brain-begin': {'POST': handler_brain_begin_POST},
  'brain-complete': {'POST': handler_brain_complete_POST},
  'brain-board': {'GET': handler_brain_board_GET},
  'admin-brain-performance': {'GET': handler_admin_brain_performance_GET},
  'admin-brain-settings': {'POST': handler_admin_brain_settings_POST},
  'game-begin': {'POST': handler_game_begin_POST},
  'game-complete': {'POST': handler_game_complete_POST},
  'game-board': {'GET': handler_game_board_GET},
  'admin-game-performance': {'GET': handler_admin_game_performance_GET},
  'admin-game-board-settings': {'POST': handler_admin_game_board_settings_POST},
  'games-status': {'GET': handler_games_status_GET},
  'admin-games': {'GET': handler_admin_games_GET},
  'admin-games-set': {'POST': handler_admin_games_set_POST},
};

async function route(req,method) {
  const action=new URL(req.url).searchParams.get('action');
  if(!action || !Object.hasOwn(handlers,action)) return error('İşlem bulunamadı.',404);
  const fn=handlers[action][method];
  return fn ? fn(req) : error('İzin verilmeyen yöntem.',405);
}
export async function GET(req){return route(req,'GET')}
export async function POST(req){return route(req,'POST')}
