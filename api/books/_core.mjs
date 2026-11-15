import crypto from 'node:crypto';

const ROOT='aip:bookexams:v1';
const COOKIE_STUDENT='aip_book_student';
const COOKIE_ADMIN='aip_book_admin';
const NOW=()=>Math.floor(Date.now()/1000);
const noStore={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private, max-age=0','X-Content-Type-Options':'nosniff'};
export function out(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{...noStore,...headers}})}
export function error(message,status=400){return out({error:message},status)}
export function sameOrigin(req){const origin=req.headers.get('origin');if(!origin)return false;try{return new URL(origin).host===new URL(req.url).host && new URL(origin).protocol==='https:'}catch{return false}}
export async function data(req,limit=250000){const raw=await req.text();if(raw.length>limit)throw new Error('İstek çok büyük.');return JSON.parse(raw)}
function redisConfig(){let url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL,token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;if(!url||!token)throw new Error('Veritabanı bağlantısı kurulmadı.');return {url:url.replace(/\/$/,''),token}}
export async function redis(...command){const {url,token}=redisConfig();let r=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),cache:'no-store'});if(!r.ok)throw Error('Veritabanı erişim hatası');let j=await r.json();if(j.error)throw Error('Veritabanı komut hatası');return j.result}
export const keys={index:`${ROOT}:index`,book:id=>`${ROOT}:book:${id}`,questions:id=>`${ROOT}:questions:${id}`,resultList:`${ROOT}:results`,studentResult:(sub,id)=>`${ROOT}:result:${crypto.createHash('sha256').update(sub+'|'+id).digest('hex')}`,attempt:id=>`${ROOT}:attempt:${id}`,jti:id=>`${ROOT}:assertion:${crypto.createHash('sha256').update(id).digest('hex')}`};
const str=v=>String(v??'');
function mac(s,secret,domain){return crypto.createHmac('sha256',secret).update(domain+'|'+s).digest('base64url')}
const eq=(a,b)=>{let x=Buffer.from(str(a)),y=Buffer.from(str(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
function integrationSecret(){const key=process.env.KITAP_ARKADASIM_INTEGRATION_SECRET;if(!key||key.length<43)throw Error('Entegrasyon güvenlik anahtarı eksik');return key}
function signSession(type,subject,ttl){let exp=NOW()+ttl;let payload=Buffer.from(JSON.stringify({type,subject,exp})).toString('base64url');return `${payload}.${mac(payload,integrationSecret(),'aip:bookexam:session:v1')}`}
function unpackSession(req,type){try{let cookie=req.headers.get('cookie')||'',found=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith((type==='student'?COOKIE_STUDENT:COOKIE_ADMIN)+'='));if(!found)return null;let [payload,tag]=found.slice(found.indexOf('=')+1).split('.');if(!eq(tag,mac(payload,integrationSecret(),'aip:bookexam:session:v1')))return null;let d=JSON.parse(Buffer.from(payload,'base64url').toString());if(d.type!==type||d.exp<NOW()||d.exp>NOW()+6*3600||typeof d.subject!=='string')return null;return d.subject}catch{return null}}
export const student=req=>unpackSession(req,'student');
export const admin=req=>unpackSession(req,'admin')==='administrator';
export function sessionCookie(type,subject,ttl=4*3600){return `${type==='student'?COOKIE_STUDENT:COOKIE_ADMIN}=${signSession(type,subject,ttl)}; HttpOnly; Secure; SameSite=Strict; Path=/api/books; Max-Age=${ttl}`}
export function clearCookie(type){return `${type==='student'?COOKIE_STUDENT:COOKIE_ADMIN}=; HttpOnly; Secure; SameSite=Strict; Path=/api/books; Max-Age=0`}
export async function requireStudent(req){let s=student(req);if(!s)throw Object.assign(new Error('Öğrenci girişi gerekiyor.'),{status:401});return s}
export function requireAdmin(req){if(!admin(req))throw Object.assign(new Error('Yönetici girişi gerekiyor.'),{status:401})}
export function respondError(e){return error(e.status?e.message:'Sunucu işlemi tamamlanamadı.',e.status||503)}
export function safeId(v){return /^[a-z0-9-]{5,55}$/.test(str(v))}
export async function getBook(id){if(!safeId(id))return null;let s=await redis('GET',keys.book(id));return s?JSON.parse(s):null}
export async function getBooks(){let ids=JSON.parse((await redis('GET',keys.index))||'[]');let b=await Promise.all(ids.map(getBook));return b.filter(Boolean)}
export async function getQuestions(id){return JSON.parse((await redis('GET',keys.questions(id)))||'[]')}
export async function attempt(req){let b=await data(req,14000);return b}
export function slug(title){return str(title).toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[ıİ]/g,'i').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,35)+'-'+crypto.randomBytes(4).toString('hex')}
export function validateQuestion(q){if(!q||typeof q!=='object'||!['test','bosluk'].includes(q.type)||str(q.question).trim().length<8||str(q.question).length>450)return false;
 if(q.type==='test')return Array.isArray(q.options)&&q.options.length===4&&q.options.every(o=>str(o).trim().length>=1&&str(o).length<=140)&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4;
 return Array.isArray(q.answers)&&q.answers.length>0&&q.answers.length<=10&&q.answers.every(a=>{let t=str(a).trim();return t.length>0&&t.length<=70&&t.split(/\s+/).length<=2})}
export function parseBulk(text){let parsed=[],errors=[];str(text).split(/\r?\n/).forEach((raw,i)=>{let l=raw.trim();if(!l||l.startsWith('#'))return;let p=l.split(/\s+-\s+/).map(x=>x.trim());let type=(p[0]||'').toUpperCase(),q=null;
  if(type==='TEST'&&p.length===7){let n='ABCD'.indexOf(p[6].toUpperCase());q={type:'test',question:p[1],options:p.slice(2,6),correct:n}}
  if(type==='BOSLUK'&&p.length===3){q={type:'bosluk',question:p[1],answers:p[2].split('/').map(x=>x.trim()).filter(Boolean)}}
  if(!validateQuestion(q))errors.push(i+1);else parsed.push({...q,id:crypto.randomUUID()})});return {parsed,errors}}
function normalize(s){return str(s).normalize('NFC').toLocaleLowerCase('tr-TR').trim().replace(/\s+/g,' ').replace(/[.!?,;:]+$/g,'')}
export function grade(attempt,answers){let n=0;const details=attempt.questions.map((q,i)=>{const a=answers[i];let good=q.type==='test'?Number(a)===q.correct:q.answers.some(v=>normalize(v)===normalize(a));if(good)n++;return {type:q.type,correct:good}});return {correct:n,total:attempt.questions.length,score:Math.round(n/attempt.questions.length*100),details}}
export async function authAssertion(assertion){
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
export async function throttle(key,limit,seconds){const k=`${ROOT}:rate:${crypto.createHash('sha256').update(key).digest('hex')}`;let n=Number(await redis('INCR',k));if(n===1)await redis('EXPIRE',k,seconds);return n<=limit}
