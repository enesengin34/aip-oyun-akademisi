import {out,error,sameOrigin,data,requireAdmin,slug,keys,redis,respondError} from './_core.mjs';
export async function POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,5000);const title=String(b.title||'').trim(),author=String(b.author||'').trim();let grade=Number(b.grade)||0;
 if(title.length<2||title.length>130||author.length>100||grade<0||grade>4)return error('Kitap bilgileri geçersiz.',400);
 let id=slug(title),book={id,title,author,grade,active:false,count:0,created:new Date().toISOString()};
 await redis('SET',keys.book(id),JSON.stringify(book));await redis('SET',keys.questions(id),'[]');
 let all=JSON.parse((await redis('GET',keys.index))||'[]');all.push(id);await redis('SET',keys.index,JSON.stringify(all));return out({book});
 }catch(e){return respondError(e)}}
