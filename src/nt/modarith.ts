export const mod=(a:bigint,n:bigint)=>(a%n+n)%n;
export function gcd(a:bigint,b:bigint):bigint{while(b){[a,b]=[b,a%b];}return a<0n?-a:a;}
export function inverse(a:bigint,n:bigint):bigint{let [r,s,x,y]=[n,mod(a,n),0n,1n];while(s){const q=r/s;[r,s]=[s,r-q*s];[x,y]=[y,x-q*y];}if(r!==1n)throw Error('Non-invertible coefficient');return mod(x,n);}
export function pow(a:bigint,e:bigint,n:bigint):bigint{if(e<0n)return pow(inverse(a,n),-e,n);let r=1n;a=mod(a,n);while(e){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n;}return r;}
export function sqrt(n:bigint):bigint{if(n<0n)throw Error('Negative square root');if(n<2n)return n;let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));for(;;){const y=(x+n/x)/2n;if(y>=x)return x;x=y;}}
export function randomBelow(n:bigint):bigint{if(n<1n)throw Error('Empty random range');const bytes=new Uint8Array(Math.ceil(n.toString(2).length/8)),mask=255>>((8-n.toString(2).length%8)%8);for(;;){crypto.getRandomValues(bytes);bytes[0]&=mask;let x=0n;for(const b of bytes)x=x*256n+BigInt(b);if(x<n)return x;}}
export function crt(rows:{residue:bigint;modulus:bigint}[]):{x:bigint;modulus:bigint}{let x=0n,M=1n;for(const {residue,modulus}of rows){const k=mod((residue-x)*inverse(M,modulus),modulus);x+=M*k;M*=modulus;x=mod(x,M);}return {x,modulus:M};}
