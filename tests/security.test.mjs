import test from 'node:test';
import assert from 'node:assert/strict';
import {GET as questions} from '../api/quiz/questions.mjs';
import {GET as session} from '../api/quiz/session.mjs';
import {POST as login} from '../api/quiz/login.mjs';
import {POST as logout} from '../api/quiz/logout.mjs';

process.env.QUIZ_CODES='12345678\n98765432';
process.env.QUIZ_SESSION_SECRET='this-is-a-local-test-secret-not-production-2026';
process.env.QUIZ_BANK_TEXT='Türkiye’nin başkenti? - Ankara - İstanbul - İzmir - A\nGökkuşağında kaç renk vardır? - 5 - 6 - 7 - C';
const url='https://www.oyunakademisi.org/api/quiz/';
function req(path,method='GET',body=null,cookie='') {return new Request(url+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined})}

test('unauthorized request cannot download private bank',async()=>{
  const r=await questions(req('questions'));assert.equal(r.status,401);assert.ok(!(await r.text()).includes('Ankara'));
});
test('session is not authenticated without cookie',async()=>{
  const d=await (await session(req('session'))).json();assert.equal(d.authenticated,false);
});
test('bad code rejected',async()=>{
  const r=await login(req('login','POST',{code:'00000000'}));assert.equal(r.status,401);
});
test('valid code gives httpOnly secure cookie and protected questions only with cookie',async()=>{
  const r=await login(req('login','POST',{code:'12345678'}));assert.equal(r.status,200);
  const set=r.headers.get('set-cookie');assert.match(set,/HttpOnly/);assert.match(set,/Secure/);assert.match(set,/SameSite=Strict/);
  const cookie=set.split(';')[0];
  const validSession=await (await session(req('session','GET',null,cookie))).json();assert.equal(validSession.authenticated,true);
  const q=await questions(req('questions','GET',null,cookie));assert.equal(q.status,200);
  const data=await q.json();assert.equal(data.count,2);assert.equal(data.questions[0].answer,'Ankara');
  const out=await logout(req('logout','POST',null,cookie));assert.equal(out.status,200);assert.match(out.headers.get('set-cookie'),/Max-Age=0/);
});
test('five wrong codes get temporarily blocked',async()=>{
  const ip='203.0.113.42';
  for(let i=0;i<5;i++){
    const request=req('login','POST',{code:'00000001'});
    request.headers.set('x-forwarded-for',ip);
    const r=await login(request);assert.equal(r.status,401);
  }
  const final=req('login','POST',{code:'12345678'});final.headers.set('x-forwarded-for',ip);
  const r=await login(final);assert.equal(r.status,429);
});
