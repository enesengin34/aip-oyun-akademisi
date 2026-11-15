import {out,error,sameOrigin,data,redis,throttle,authAssertion,sessionCookie,respondError} from './_core.mjs';
export async function POST(req){if(!sameOrigin(req))return error('İstek kaynağı kabul edilmedi.',403);try{
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
export async function GET(){return error('İzin verilmeyen yöntem.',405)}
