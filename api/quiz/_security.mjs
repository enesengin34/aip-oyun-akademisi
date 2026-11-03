import crypto from 'node:crypto';

const COOKIE_NAME='aip_quiz_session';
const SESSION_SECONDS=3*60*60;
const MAX_ATTEMPTS=5;
const WINDOW_SECONDS=15*60;
const fallbackAttempts=new Map();

function bytes(v){return Buffer.from(String(v),'utf8')}
function sign(payload){return crypto.createHmac('sha256',process.env.QUIZ_SESSION_SECRET).update(payload).digest('base64url')}
function timingSafeEqual(a,b){const x=bytes(a),y=bytes(b);return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function configured(){return !!(process.env.QUIZ_CODES&&process.env.QUIZ_SESSION_SECRET&&process.env.QUIZ_BANK_TEXT)&&bytes(process.env.QUIZ_SESSION_SECRET).length>=32}
function parseCodes(){return String(process.env.QUIZ_CODES||'').split(/[\s,;]+/).map(x=>x.trim()).filter(x=>/^[A-Za-z0-9]{8}$/.test(x))}
function ipFor(request){const forwarded=request.headers.get('x-forwarded-for')||'';return forwarded.split(',')[0].trim()||'unknown'}
function defaultHeaders(){return {'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Content-Type':'application/json; charset=utf-8'}}
export function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{...defaultHeaders(),...headers}})}
export function noConfiguration(){return json({error:'Yarışma yönetici tarafından henüz etkinleştirilmedi.'},503)}
export function hasConfig(){return configured()}
export function cookieHeader(request){return request.headers.get('cookie')||''}
export function authorized(request){if(!configured())return false;let cookie=cookieHeader(request).split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE_NAME+'='));if(!cookie)return false;try{let token=cookie.slice(COOKIE_NAME.length+1),[issued,nonce,signature]=token.split('.');if(!issued||!nonce||!signature)return false;let expires=Number(issued);if(!Number.isSafeInteger(expires)||expires<=Math.floor(Date.now()/1000)||expires>Math.floor(Date.now()/1000)+SESSION_SECONDS)return false;return timingSafeEqual(signature,sign(`${issued}.${nonce}`));}catch{return false}}
export function setSessionCookie(){let issued=Math.floor(Date.now()/1000)+SESSION_SECONDS,nonce=crypto.randomBytes(16).toString('base64url'),body=`${issued}.${nonce}`,token=`${body}.${sign(body)}`;return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/quiz; Max-Age=${SESSION_SECONDS}`}
export function clearSessionCookie(){return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/api/quiz; Max-Age=0`}
export function codeAccepted(candidate){if(!/^[A-Za-z0-9]{8}$/.test(candidate))return false;let hash=crypto.createHash('sha256').update(candidate).digest();let accepted=false;for(const code of parseCodes()){let other=crypto.createHash('sha256').update(code).digest();accepted=crypto.timingSafeEqual(hash,other)||accepted;}return accepted}

// Upstash REST Redis provides a cross-instance rate limiter when configured.
// Without it, per-instance backoff is only a safeguard; do not claim distributed protection.
function limiterConfigured(){return !!(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN)}
async function redisCommand(parts){
  const url=process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/,'');
  const res=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(parts),cache:'no-store'});
  if(!res.ok)throw Error('Rate limiter unreachable');let body=await res.json();if(body.error)throw Error('Rate limiter error');return body.result;
}
function key(request){return `aip:quiz:failed:${crypto.createHash('sha256').update(ipFor(request)).digest('hex')}`}
export async function blocked(request){
  if(limiterConfigured()){
    try{return Number(await redisCommand(['GET',key(request)]))>=MAX_ATTEMPTS}catch{return true} // fail closed
  }
  let now=Date.now(),k=key(request),entry=fallbackAttempts.get(k);if(!entry||entry.expiry<now){fallbackAttempts.delete(k);return false}return entry.count>=MAX_ATTEMPTS;
}
export async function markFailure(request){
  if(limiterConfigured()){
    try{let k=key(request);await redisCommand(['INCR',k]);await redisCommand(['EXPIRE',k,WINDOW_SECONDS])}catch{}return;
  }
  let k=key(request),now=Date.now(),entry=fallbackAttempts.get(k);if(!entry||entry.expiry<now)entry={count:0,expiry:now+WINDOW_SECONDS*1000};entry.count++;fallbackAttempts.set(k,entry);if(fallbackAttempts.size>2000)fallbackAttempts.clear();
}
export async function resetFailures(request){if(limiterConfigured()){try{await redisCommand(['DEL',key(request)])}catch{}}else fallbackAttempts.delete(key(request))}
export function secureQuestions(){
  const lines=String(process.env.QUIZ_BANK_TEXT||'').split(/\r?\n/),bank=[],errors=[];
  for(let i=0;i<lines.length;i++){
    let line=lines[i].trim();if(!line||line.startsWith('#'))continue;
    let parts=line.split(/\s+-\s+/).map(x=>x.trim());
    if(parts.length!==5&&parts.length!==6){errors.push(i+1);continue}
    let question=parts[0],options=parts.slice(1,-1),correct='ABCD'.indexOf(parts[parts.length-1].toUpperCase());
    if(question.length<6||options.length<3||options.length>4||correct<0||correct>=options.length||options.some(x=>!x)||new Set(options.map(x=>x.toLocaleLowerCase('tr'))).size!==options.length){errors.push(i+1);continue}
    bank.push({id:`private-${i+1}`,question,options,answer:options[correct],explanation:'Doğru cevap: '+options[correct]+'.'});
  }
  return {bank,errors};
}
