import {json,authorized,hasConfig} from './_security.mjs';
export async function GET(request){return json({authenticated:authorized(request),configured:hasConfig()})}
