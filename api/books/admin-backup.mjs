import {out,requireAdmin,getBooks,getQuestions,respondError} from './_core.mjs';
export async function GET(req){try{requireAdmin(req);let books=await getBooks();let payload=await Promise.all(books.map(async b=>({book:b,questions:await getQuestions(b.id)})));return out({created:new Date().toISOString(),version:1,data:payload})}catch(e){return respondError(e)}}
