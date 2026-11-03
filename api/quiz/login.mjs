import {json,hasConfig,noConfiguration,blocked,markFailure,resetFailures,codeAccepted,setSessionCookie} from './_security.mjs';
export async function POST(request){
  if(!hasConfig())return noConfiguration();
  if(await blocked(request))return json({error:'Çok sayıda hatalı deneme. Daha sonra yeniden deneyin.'},429);
  let body={};try{body=await request.json()}catch{return json({error:'Geçersiz istek.'},400)}
  let code=String(body.code||'');
  if(!codeAccepted(code)){await markFailure(request);return json({error:'Kod geçersiz. Lütfen kontrol edin.'},401)}
  await resetFailures(request);
  return json({ok:true},200,{'Set-Cookie':setSessionCookie()});
}
export async function GET(){return json({error:'İzin verilmeyen yöntem.'},405)}
