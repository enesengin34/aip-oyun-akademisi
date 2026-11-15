import {out,error,requireAdmin,redis,keys,respondError} from './_core.mjs';
export async function GET(req){try{requireAdmin(req);let items=await redis('LRANGE',keys.resultList,0,199);return out({results:(items||[]).map(x=>JSON.parse(x))})}catch(e){return respondError(e)}}
