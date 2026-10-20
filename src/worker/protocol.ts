// Decimal strings cross the worker boundary; no precision is lost through Number.
export const pack=(value:unknown):string=>JSON.stringify(value,(_k,v)=>typeof v==='bigint'?{$bigint:v.toString()}:v);
export const unpack=(value:string):unknown=>JSON.parse(value,(_k,v)=>v&&typeof v==='object'&&Object.keys(v).length===1&&typeof v.$bigint==='string'?BigInt(v.$bigint):v);
