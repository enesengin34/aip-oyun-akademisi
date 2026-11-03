import {json,clearSessionCookie} from './_security.mjs';
export async function POST(){return json({ok:true},200,{'Set-Cookie':clearSessionCookie()})}
