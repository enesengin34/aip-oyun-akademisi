import {out,student,admin} from './_core.mjs';
export async function GET(req){return out({student:!!student(req),admin:admin(req)})}
