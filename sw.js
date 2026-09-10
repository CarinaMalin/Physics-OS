const CACHE='physics-os-v0.6.1';
const ASSETS=['./','./index.html','./styles.css','./semester1.css','./app.js','./sync.js','./formula-enhancer.js','./semester1.js','./semester1-bootstrap.js','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  self.clients.claim(),
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
])));

async function appWithSemesterBootstrap(request){
  const cache=await caches.open(CACHE);
  try{
    const res=await fetch(request,{cache:'no-store'});
    const text=await res.text();
    const body=text.includes('semester1-bootstrap.js')?text:`${text}\nimport('./semester1-bootstrap.js?v=0.6.1').catch(console.error);`;
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
    e.respondWith(appWithSemesterBootstrap(e.request));
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
