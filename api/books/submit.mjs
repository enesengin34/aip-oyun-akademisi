import crypto from 'node:crypto';
import {out,error,sameOrigin,data,requireStudent,keys,redis,grade,respondError} from './_core.mjs';
export async function POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
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
 let stored=await redis('SET',keys.studentResult(sub,attempt.bookId),JSON.stringify(record),'NX');
 if(stored!=='OK')return error('Bu sınav daha önce tamamlanmış.',409);
 await redis('LPUSH',keys.resultList,JSON.stringify(record));return out({score:result.score,correct:result.correct,total:result.total});
 }catch(e){return respondError(e)}}
