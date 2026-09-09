const CACHE='physics-os-v0.5';
const ASSETS=['./','./index.html','./styles.css','./app.js','./sync.js','./formula-enhancer.js','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  self.clients.claim(),
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
])));

async function appWithEnhancer(request){
  const cache=await caches.open(CACHE);
  try{
    const res=await fetch(request);
    const text=await res.text();
    const body=text.includes("formula-enhancer.js")?text:`${text}\nimport('./formula-enhancer.js?v=0.5');`;
    const headers=new Headers(res.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.set('content-type','text/javascript; charset=utf-8');
    const out=new Response(body,{status:res.status,statusText:res.statusText,headers});
    cache.put(request,out.clone());
    return out;
  }catch{
    return (await cache.match(request)) || new Response('',{status:503});
  }
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.pathname.endsWith('/app.js')){
    e.respondWith(appWithEnhancer(e.request));
    return;
  }
  e.respondWith(fetch(e.request).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
