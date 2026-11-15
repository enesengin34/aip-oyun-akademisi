import {out,error,sameOrigin,clearCookie} from './_core.mjs';
export async function POST(req){if(!sameOrigin(req))return error('İstek kaynağı geçersiz.',403);let type='student';try{let b=await req.json();if(b.type==='admin')type='admin'}catch{}return out({ok:true},200,{'Set-Cookie':clearCookie(type)})}
