import {run} from './tasks';import {pack,unpack} from './protocol';
self.onmessage=async({data})=>{try{const {name,args}=unpack(data) as {name:string;args:Record<string,unknown>};const result=await run(name,args,p=>self.postMessage(pack({progress:p})));self.postMessage(pack({result}));}catch(e){self.postMessage(pack({error:e instanceof Error?e.message:String(e)}));}};
