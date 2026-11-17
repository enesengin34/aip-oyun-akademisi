import crypto from 'node:crypto';
import {GAMES} from '../game-manifest.mjs';
// V13.1 consolidated book exam endpoint. All code is server-side.


const ROOT='aip:bookexams:v1';
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
const keys={index:`${ROOT}:index`,book:id=>`${ROOT}:book:${id}`,questions:id=>`${ROOT}:questions:${id}`,resultList:`${ROOT}:results`,studentResult:(sub,id)=>`${ROOT}:result:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,attempt:id=>`${ROOT}:attempt:${id}`,seen:(sub,id)=>`${ROOT}:seen:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,retake:(sub,id)=>`${ROOT}:retake:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,activeAttempt:(sub,id)=>`${ROOT}:active:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,jti:id=>`${ROOT}:assertion:${crypto.createHash('sha256').update(id).digest('hex')}`};
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
function grade(attempt,answers){let n=0;const details=attempt.questions.map((q,i)=>{const a=answers[i];let good=q.type==='test'?Number(a)===q.correct:q.answers.some(v=>normalize(v)===normalize(a));if(good)n++;return {type:q.type,correct:good}});return {correct:n,total:attempt.questions.length,score:Math.round(n/attempt.questions.length*100),details}}
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


// login
async function handler_login_POST(req){if(!sameOrigin(req))return error('İstek kaynağı kabul edilmedi.',403);try{
 let b=await data(req,2000),code=String(b.code||'');if(!/^[A-Za-z0-9]{8}$/.test(code))return error('Kod geçersiz.',401);
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0];if(!await throttle('student:'+ip,15,900))return error('Çok fazla giriş denemesi.',429);
 const url=process.env.KITAP_ARKADASIM_API_URL,id=process.env.KITAP_ARKADASIM_INTEGRATION_ID,key=process.env.KITAP_ARKADASIM_INTEGRATION_SECRET;
 if(!url||!id||!key)return error('Giriş sistemi yapılandırılmadı.',503);
 const target=new URL(url);if(target.protocol!=='https:'||target.hostname!=='kitaparkadasim.com')return error('Entegrasyon adresi geçersiz.',503);
 const abort=AbortSignal.timeout(10000);
 const r=await fetch(target,{method:'POST',headers:{'Content-Type':'application/json','X-Integration-Id':id,Authorization:`Bearer ${key}`},body:JSON.stringify({code}),signal:abort,cache:'no-store'});
 if(r.status===429)return error('Giriş deneme sınırı aşıldı.',429);
 if(r.status===401||r.status===403)return error('Kod geçersiz.',401);
 if(!r.ok)return error('Kitap Arkadaşım doğrulamasına ulaşılamadı.',503);
 const response=await r.json();const assertion=response.assertion||response.token||response.verification||response.verificationToken||response.proof||response.data?.assertion||response.data?.token;
 if(!assertion)return error('Doğrulama belgesi yanıt içinde bulunamadı. API yanıt şemasını kontrol edin.',502);
 const subject=await authAssertion(assertion);
 return out({ok:true},200,{'Set-Cookie':sessionCookie('student',subject)});
 }catch(e){return respondError(e)}}
async function handler_login_GET(){return error('İzin verilmeyen yöntem.',405)}


// logout
async function handler_logout_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);let type='student';try{let b=await req.json();if(b.type==='admin')type='admin'}catch{}return out({ok:true},200,{'Set-Cookie':clearCookie(type)})}


// session
async function handler_session_GET(req){const sub=student(req);return out({student:!!sub,studentRef:sub?sub.slice(0,12):null,admin:admin(req)})}


// list
async function handler_list_GET(req){if(!student(req)&&!admin(req))return error('Giriş gerekiyor.',401);try{let books=await getBooks();return out({books:books.filter(b=>admin(req)||(b.active&&b.count>=100)).map(b=>({id:b.id,title:b.title,author:b.author,grade:b.grade,active:b.active,count:b.count}))})}catch(e){return respondError(e)}}


// start: one completed exam per book by default; further attempts require a fresh manager grant.
async function handler_start_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,1000),book=await getBook(b.bookId);
 if(!book||!book.active||book.count<100)return error('Bu kitap sınavı aktif değil.',404);
 const completedKey=keys.studentResult(sub,book.id),retakeKey=keys.retake(sub,book.id),lockKey=keys.activeAttempt(sub,book.id);
 let bank=await getQuestions(book.id);if(bank.length<100)return error('Soru havuzu eksik.',409);
 const existing=await redis('GET',lockKey);
 if(existing){const raw=await redis('GET',keys.attempt(existing));if(raw){let old=JSON.parse(raw);if(old.sub===sub&&old.bookId===book.id)return out({attemptId:existing,book:{title:book.title,id:book.id},questions:publicQuestions(old.questions)});}await redis('DEL',lockKey)}
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
  const questions=shuffle([...unseen.slice(0,10),...repeat.slice(0,Math.max(0,10-unseen.length))]);
  await redis('SET',keys.attempt(id),JSON.stringify({bookId:book.id,sub,created:Date.now(),questions}),'EX',3600);
  for(const q of questions)await redis('SADD',seenKey,q.id);
  return out({attemptId:id,book:{title:book.title,id:book.id},questions:publicQuestions(questions)});
 }catch(e){await redis('DEL',lockKey);throw e}
} catch(e){return respondError(e)}}
function publicQuestions(questions){return questions.map(q=>({id:q.id,type:q.type,question:q.question,...q.type==='test'?{options:q.options}:{}}))}

// submit
async function handler_submit_POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,10000);
 if(!/^[a-f0-9-]{36}$/.test(String(b.attemptId||''))||!Array.isArray(b.answers)||b.answers.length!==10)return error('Geçersiz sınav gönderimi.',400);
 // Check owner before consuming. GETDEL atomically consumes an attempt once.
 let first=await redis('GET',keys.attempt(b.attemptId));if(!first)return error('Sınav süresi dolmuş veya sınav gönderilmiş.',410);
 if(JSON.parse(first).sub!==sub)return error('Yetkisiz sınav.',403);
 let raw=await redis('GETDEL',keys.attempt(b.attemptId));if(!raw)return error('Sınav süresi dolmuş veya sınav gönderilmiş.',410);
 let attempt=JSON.parse(raw);if(attempt.sub!==sub)return error('Yetkisiz sınav.',403);
 if(attempt.created>Date.now()||Date.now()-attempt.created>3600000)return error('Sınav süresi dolmuş.',410);
 let result=grade(attempt,b.answers);
 const record={id:crypto.randomUUID(),bookId:attempt.bookId,studentId:sub,created:new Date().toISOString(),score:result.score,correct:result.correct,total:result.total};
 await redis('LPUSH',keys.resultList,JSON.stringify(record));await redis('SET',keys.studentResult(sub,attempt.bookId),JSON.stringify(record));await redis('DEL',keys.activeAttempt(sub,attempt.bookId));return out({score:result.score,correct:result.correct,total:result.total});
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
 let id=slug(title),book={id,title,author,grade,active:false,count:0,created:new Date().toISOString()};
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

// admin-results
async function handler_admin_results_GET(req){try{requireAdmin(req);let items=await redis('LRANGE',keys.resultList,0,199);const results=(items||[]).map(x=>JSON.parse(x));return out({results,usage:await recentUsage()})}catch(e){return respondError(e)}}


// admin-backup
async function handler_admin_backup_GET(req){try{requireAdmin(req);let books=await getBooks();let payload=await Promise.all(books.map(async b=>({book:b,questions:await getQuestions(b.id)})));return out({created:new Date().toISOString(),version:1,data:payload})}catch(e){return respondError(e)}}


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
  'admin-results': {'GET': handler_admin_results_GET},
  'admin-backup': {'GET': handler_admin_backup_GET},
  'admin-retake': {'POST': handler_admin_retake_POST},
  'usage': {'POST': handler_usage_POST},
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
