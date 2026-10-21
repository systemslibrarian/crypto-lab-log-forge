import type {Group} from '../../group/types';
import {inverse,pow,sqrt} from '../../nt/modarith';

export type CheonPass={order:bigint;tableSize:number;giantSteps:number;trace:{phase:string;index:bigint;element:string}[]};
export type CheonResult={alpha:bigint|null;reason:string;u:bigint|null;v:bigint|null;step1:CheonPass;step2:CheonPass;steps:number;tableEntries:number};

const ceilSqrt=(n:bigint)=>{const s=sqrt(n);return s*s===n?s:s+1n;};
function blank(order:bigint):CheonPass{return {order,tableSize:Number(ceilSqrt(order)),giantSteps:0,trace:[]};}

function exponentBsgs<T>(G:Group<T>,g:T,target:T,base:bigint,scalarModulus:bigint,searchOrder:bigint,label:string):{x:bigint|null;pass:CheonPass}{
 const m=ceilSqrt(searchOrder);if(m>100000n)throw Error(label+' table exceeds the teaching cap');
 const baby=new Map<string,bigint>(),trace:CheonPass['trace']=[];let scalar=1n;
 for(let j=0n;j<m;j++){const value=G.pow(g,scalar),key=G.encode(value);if(!baby.has(key))baby.set(key,j);if(j<3n||j===m-1n)trace.push({phase:label+' baby',index:j,element:key});scalar=scalar*base%scalarModulus;}
 const stride=inverse(pow(base,m,scalarModulus),scalarModulus);let cursor=target,giants=0;
 for(let i=0n;i<m;i++){giants++;const match=baby.get(G.encode(cursor));if(i<3n||match!==undefined)trace.push({phase:label+' giant',index:i,element:G.encode(cursor)});if(match!==undefined)return {x:(i*m+match)%searchOrder,pass:{order:searchOrder,tableSize:Number(m),giantSteps:giants,trace}};cursor=G.pow(cursor,stride);}
 return {x:null,pass:{order:searchOrder,tableSize:Number(m),giantSteps:giants,trace}};
}

export function validateCheonDivisor(q:bigint,d:bigint):void{if(d<2n||(q-1n)%d!==0n)throw Error('d must divide q − 1; choose one of the offered powers of two');}

export function cheon<T>(G:Group<T>,g:T,gAlpha:T,gAlphaD:T,zeta:bigint,d:bigint):CheonResult{
 const q=G.order;validateCheonDivisor(q,d);const r=(q-1n)/d;
 const xi=pow(zeta,d,q);
 const first=exponentBsgs(G,g,gAlphaD,xi,q,r,'step 1');
 if(first.x===null)return {alpha:null,reason:'Step 1 found no u; no exponent is guessed',u:null,v:null,step1:first.pass,step2:blank(d),steps:first.pass.tableSize+first.pass.giantSteps,tableEntries:first.pass.tableSize+Number(ceilSqrt(d))};
 const u=first.x,offsetInverse=inverse(pow(zeta,u,q),q),normalized=G.pow(gAlpha,offsetInverse),beta=pow(zeta,r,q);
 const second=exponentBsgs(G,g,normalized,beta,q,d,'step 2');
 if(second.x===null)return {alpha:null,reason:'Step 2 found no v; no exponent is guessed',u,v:null,step1:first.pass,step2:second.pass,steps:first.pass.tableSize+first.pass.giantSteps+second.pass.tableSize+second.pass.giantSteps,tableEntries:first.pass.tableSize+second.pass.tableSize};
 const v=second.x;
 const alpha=pow(zeta,u+v*r,q);
 return {alpha,reason:'Both exponent-subgroup searches met',u,v,step1:first.pass,step2:second.pass,steps:first.pass.tableSize+first.pass.giantSteps+second.pass.tableSize+second.pass.giantSteps,tableEntries:first.pass.tableSize+second.pass.tableSize};
}
