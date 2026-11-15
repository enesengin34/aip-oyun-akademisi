import crypto from 'node:crypto';
import {out,error,sameOrigin,data,requireStudent,getBook,getQuestions,keys,redis,respondError} from './_core.mjs';
export async function POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 const sub=await requireStudent(req),b=await data(req,1000),book=await getBook(b.bookId);
 if(!book||!book.active||book.count<100)return error('Bu kitap sınavı aktif değil.',404);
 if(await redis('EXISTS',keys.studentResult(sub,book.id)))return error('Bu kitabın sınavını daha önce tamamladınız.',409);
 let bank=await getQuestions(book.id);if(bank.length<100)return error('Soru havuzu eksik.',409);
 for(let i=bank.length-1;i>0;i--){let j=crypto.randomInt(i+1);[bank[i],bank[j]]=[bank[j],bank[i]]}
 const questions=bank.slice(0,10),id=crypto.randomUUID();await redis('SET',keys.attempt(id),JSON.stringify({bookId:book.id,sub,created:Date.now(),questions}),'EX',3600);
 return out({attemptId:id,book:{title:book.title,id:book.id},questions:questions.map(q=>({id:q.id,type:q.type,question:q.question,...q.type==='test'?{options:q.options}:{}}))});
 }catch(e){return respondError(e)}}
