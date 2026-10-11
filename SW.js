self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).catch(()=>new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;padding:32px;background:#17233F;color:#EEF1EF"><h1>TraceBook</h1><p>You are offline. Reconnect and refresh to continue.</p></body>',{headers:{'Content-Type':'text/html; charset=utf-8'}})));
 }
});
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
  if(l.length)return l[0].focus();
  return self.clients.openWindow('/')}))});
