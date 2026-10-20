import type {Curve} from './ec';import type {Factor} from './zp';
// Verified by prime-field checks, qG=O and Hasse's unique multiple, not assumed from a point count.
export const toyCurve:Curve={p:211n,a:1n,b:1n,q:223n,G:{x:0n,y:1n}};
// Lucas certificate: g^(p-1)=1 and gcd(g^((p-1)/l)-1,p)=1 for every prime l in the complete factorization.
export const smooth={p:291359026238867401266316678014299013121n,g:14n,factors:[{prime:2n,exponent:89},{prime:3n,exponent:23},{prime:5n,exponent:1}] satisfies Factor[]};
// Parameters only from MIT-licensed ZK Arena, Paul Clark, 214c05725a19f8dae7fb2cb0fa4350ee3fcfe031 src/groups.ts:55.
export const arena={p:(1n<<256n)-(1n<<32n)-977n,g:5n,factors:[{prime:2n,exponent:1},{prime:3n,exponent:1},{prime:7n,exponent:1},{prime:13441n,exponent:1},{prime:205115282021455665897114700593932402728804164701536103180137503955397371n,exponent:1}] satisfies Factor[]};
export const safe={p:1019n,g:2n,q:509n};
