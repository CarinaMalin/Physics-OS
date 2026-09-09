/** Physics OS Sync Worker. Bind an R2 bucket as PHYSICS_OS_BUCKET. */
const CORS={
  'access-control-allow-origin':'*',
  'access-control-allow-methods':'GET,PUT,OPTIONS',
  'access-control-allow-headers':'content-type',
  'cache-control':'no-store'
};
function response(body,status=200,extra={}){return new Response(body,{status,headers:{...CORS,...extra}})}
export default{async fetch(request,env){
  if(request.method==='OPTIONS')return response('',204);
  const url=new URL(request.url),match=url.pathname.match(/^\/sync\/([A-Za-z0-9_-]{20,128})$/);
  if(!match)return response('Not found',404);
  const slot=match[1],key=`sync/${slot}.json`;
  if(request.method==='GET'){
    const object=await env.PHYSICS_OS_BUCKET.get(key);
    if(!object)return response('Not found',404);
    return response(object.body,200,{'content-type':'application/json; charset=utf-8','etag':object.httpEtag||''});
  }
  if(request.method==='PUT'){
    const text=await request.text();let payload;
    try{payload=JSON.parse(text)}catch{return response('Invalid JSON',400)}
    if(payload?.protocol!==1||!payload?.envelope?.data||!payload?.envelope?.iv||!payload?.envelope?.salt)return response('Invalid sync envelope',400);
    const stored=JSON.stringify({...payload,serverUpdatedAt:new Date().toISOString()});
    await env.PHYSICS_OS_BUCKET.put(key,stored,{httpMetadata:{contentType:'application/json; charset=utf-8'}});
    return response(JSON.stringify({ok:true,serverUpdatedAt:new Date().toISOString()}),200,{'content-type':'application/json; charset=utf-8'});
  }
  return response('Method not allowed',405);
}};
