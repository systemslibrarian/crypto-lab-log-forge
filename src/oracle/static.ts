import type {Group} from '../group/types';
import {member} from '../group/zp';
import {pow} from '../nt/modarith';

export type StaticOracle={readonly publicKey:bigint;readonly queryCount:number;readonly validationChecks:number;readonly oracleOperations:number;answer(v:bigint):bigint};

function exponentiationCost(e:bigint):number{let bits=0,ones=0;while(e){bits++;if(e&1n)ones++;e>>=1n;}return bits+ones;}

export function createStaticOracle(raw:Group<bigint>,p:bigint,g:bigint,secret:bigint):StaticOracle{
 if(secret<=0n||secret>=raw.order)throw Error('The static exponent must be in [1, q − 1]');
 let queries=0,checks=0,work=0;
 const publicKey=raw.pow(g,secret);
 return {publicKey,get queryCount(){return queries;},get validationChecks(){return checks;},get oracleOperations(){return work;},answer(v:bigint){queries++;checks++;if(v>0n&&v<p)work+=exponentiationCost(raw.order);if(!member(v,p,raw.order))throw Error('Membership refused: oracle input is outside the order-q subgroup');work+=exponentiationCost(secret);return raw.pow(v,secret);}};
}

// Kept in the oracle module: the attacker receives the public key and answers,
// never this exponent. Its discrete log is not deliberately short.
const q=1099512938497n,zeta=10n,defaultD=65536n;
const labSecret=pow(zeta,1000n+100n*((q-1n)/defaultD),q);
export function createLabStaticOracle(raw:Group<bigint>,p:bigint,g:bigint):StaticOracle{return createStaticOracle(raw,p,g,labSecret);}
