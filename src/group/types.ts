export interface Group<T>{readonly identity:T;readonly order:bigint;op(a:T,b:T):T;inverse(a:T):T;pow(a:T,e:bigint):T;equals(a:T,b:T):boolean;encode(a:T):string;}
export interface Answer{x:bigint|null;reason:string;memory:number;trace:Record<string,string>[];tail?:number;cycle?:number;}
