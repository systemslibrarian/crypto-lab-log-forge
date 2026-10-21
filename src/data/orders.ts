import type {Factor} from '../group/zp';
import {pow} from '../nt/modarith';

export type RealOrder={id:string;label:string;order:bigint;orderSource:string;minusFactors:Factor[];plusFactors:Factor[]};
const f=(prime:bigint,exponent=1):Factor=>({prime,exponent});
const curveOrder=(1n<<252n)+27742317777372353535851937790883648493n;
const p256Order=BigInt('0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551');
const secpOrder=BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

export const realOrders:RealOrder[]=[
 {id:'curve25519',label:'Curve25519 / ristretto255',order:curveOrder,orderSource:'RFC 7748 §4.1',minusFactors:[f(2n,2),f(3n),f(11n),f(198211423230930754013084525763697n),f(276602624281642239937218680557139826668747n)],plusFactors:[f(2n),f(5n),f(7n),f(103n),f(684245902131068969n),f(1466936914520620440380580414586728830413895967152734051n)]},
 {id:'p256',label:'P-256',order:p256Order,orderSource:'SEC 2 v2 §2.4.2',minusFactors:[f(2n,4),f(3n),f(71n),f(131n),f(373n),f(3407n),f(17449n),f(38189n),f(187019741n),f(622491383n),f(1002328039319n),f(2624747550333869278416773953n)],plusFactors:[f(2n),f(5n),f(1879n),f(176337611n),f(34946779280882916835155272231706129710560967816144871596921775673n)]},
 {id:'secp256k1',label:'secp256k1',order:secpOrder,orderSource:'SEC 2 v2 §2.4.1',minusFactors:[f(2n,6),f(3n),f(149n),f(631n),f(107361793816595537n),f(174723607534414371449n),f(341948486974166000522343609283189n)],plusFactors:[f(2n),f(13n),f(83n),f(45751n),f(509879n),f(2300168931843757888934889794142140465088020300168077349902139959n)]}
];

export function factorProduct(factors:Factor[]):bigint{return factors.reduce((n,x)=>n*x.prime**BigInt(x.exponent),1n);}
export function fixedBaseMillerRabin(n:bigint):boolean{if(n<2n)return false;const bases=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];for(const p of bases){if(n%p===0n)return n===p;}let d=n-1n,s=0;while(d%2n===0n){d/=2n;s++;}for(const a of bases){if(a>=n)continue;let x=pow(a,d,n);if(x===1n||x===n-1n)continue;let witness=true;for(let i=1;i<s;i++){x=x*x%n;if(x===n-1n){witness=false;break;}}if(witness)return false;}return true;}
export function validateRealOrder(order:RealOrder):void{if(factorProduct(order.minusFactors)!==order.order-1n||factorProduct(order.plusFactors)!==order.order+1n)throw Error(order.label+' factorization does not multiply back');for(const side of [order.minusFactors,order.plusFactors])for(const factor of side)if(!fixedBaseMillerRabin(factor.prime))throw Error(order.label+' factor failed fixed-base Miller–Rabin');}
export function bestDivisor(factors:Factor[],limit:bigint):bigint{let best=1n;const walk=(index:number,value:bigint)=>{if(value>limit)return;if(index===factors.length){if(value>best)best=value;return;}const {prime,exponent}=factors[index];let power=1n;for(let e=0;e<=exponent;e++){walk(index+1,value*power);power*=prime;}};walk(0,1n);return best;}
export function log2BigInt(n:bigint):number{if(n<=0n)throw Error('log₂ needs a positive integer');const bits=n.toString(2),take=Math.min(52,bits.length),head=Number(BigInt('0b'+bits.slice(0,take)));return bits.length-take+Math.log2(head);}
export const formatFactors=(factors:Factor[])=>factors.map(x=>x.prime+(x.exponent===1?'':'^'+x.exponent)).join(' × ');
