import type {Group} from './types';import {pow,inverse} from '../nt/modarith';
export type Factor={prime:bigint;exponent:number};
export function multiplicative(p:bigint,order:bigint):Group<bigint>{return {identity:1n,order,op:(a,b)=>a*b%p,inverse:a=>inverse(a,p),pow:(a,e)=>pow(a,e,p),equals:(a,b)=>a===b,encode:a=>a.toString()};}
export function orderOf(g:bigint,p:bigint,factors:Factor[]):bigint{if(g<=0n||g>=p)throw Error('Generator must be a nonzero field element');if(factors.reduce((a,f)=>a*f.prime**BigInt(f.exponent),1n)!==p-1n)throw Error('Complete factorization required');let n=p-1n;for(const {prime:l,exponent:e}of factors)for(let i=0;i<e&&pow(g,n/l,p)===1n;i++)n/=l;return n;}
export function member(h:bigint,p:bigint,order:bigint):boolean{return h>0n&&h<p&&pow(h,order,p)===1n;}
