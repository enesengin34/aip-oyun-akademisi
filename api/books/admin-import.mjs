import {out,error,sameOrigin,data,requireAdmin,getBook,getQuestions,parseBulk,keys,redis,respondError} from './_core.mjs';
export async function POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);try{
 requireAdmin(req);const b=await data(req,200000),book=await getBook(b.bookId);if(!book)return error('Kitap bulunamadı.',404);
 const {parsed,errors}=parseBulk(b.text);if(errors.length)return out({error:'Bazı satırlar hatalı. Hiç soru kaydedilmedi.',invalidLines:errors},422);
 if(!parsed.length)return error('İçe aktarılacak geçerli soru bulunamadı.',400);
 let bank=b.replace===true?[]:await getQuestions(book.id);if(bank.length+parsed.length>2000)return error('Bir kitap için en çok 2000 soru destekleniyor.',413);
 bank.push(...parsed);await redis('SET',keys.questions(book.id),JSON.stringify(bank));book.count=bank.length;
 if(book.active&&book.count<100)book.active=false;
 await redis('SET',keys.book(book.id),JSON.stringify(book));return out({ok:true,count:book.count,imported:parsed.length,active:book.active});
 }catch(e){return respondError(e)}}
