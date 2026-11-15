import crypto from 'node:crypto';
import {out,error,sameOrigin,data,throttle,sessionCookie,respondError} from './_core.mjs';
export async function POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const password=process.env.BOOK_EXAM_ADMIN_PASSWORD;if(!password||password.length<16)return error('Kitap sınavları yönetici parolası henüz ayarlanmadı.',503);
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0];if(!await throttle('admin:'+ip,5,900))return error('Giriş sınırı aşıldı.',429);
 const b=await data(req,2000),candidate=String(b.password||'');const h=x=>crypto.createHash('sha256').update(x).digest();
 if(!crypto.timingSafeEqual(h(candidate),h(password)))return error('Giriş bilgileri geçersiz.',401);
 return out({ok:true},200,{'Set-Cookie':sessionCookie('admin','administrator',2*3600)});
 }catch(e){return respondError(e)}}
