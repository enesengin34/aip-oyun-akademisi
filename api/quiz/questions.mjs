import {json,authorized,hasConfig,noConfiguration,secureQuestions} from './_security.mjs';
export async function GET(request){
  if(!hasConfig())return noConfiguration();
  if(!authorized(request))return json({error:'Bu sorular için öğretmen koduyla giriş yapmanız gerekiyor.'},401);
  const {bank,errors}=secureQuestions();
  return json({questions:bank,count:bank.length,invalidLineCount:errors.length});
}
