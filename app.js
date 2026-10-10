import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,getAdditionalUserInfo,GoogleAuthProvider,createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile,signOut,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,addDoc,onSnapshot,query,orderBy,limit,doc,getDoc,setDoc,deleteDoc,getDocs,writeBatch,where,updateDoc,arrayUnion,arrayRemove} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

const $=i=>document.getElementById(i);
const app=$('app'),gate=$('gate'),log=$('log'),t=$('t'),s=$('s');
const hm=ts=>new Date(ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
const esc=x=>{const d=document.createElement('div');d.textContent=x;return d.innerHTML};
const dayLabel=ts=>{const d=new Date(ts),n=new Date(),y=new Date(Date.now()-864e5);
 return d.toDateString()===n.toDateString()?'Today':d.toDateString()===y.toDateString()?'Yesterday':d.toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'})};

if(!firebaseConfig.apiKey||firebaseConfig.apiKey.startsWith('YOUR_')){
 $('gp').textContent='Setup needed: paste your Firebase keys into firebase-config.js (see README.md).';
 $('gb').style.display='none';throw new Error('Missing Firebase config');
}
const fb=initializeApp(firebaseConfig),auth=getAuth(fb),db=getFirestore(fb);
let me=null,rooms=[],cur=null,msgs=[],unsubR=null,unsubM=null,creating=false,dms=[],curKind='room',unsubD=null,unsubO=null,unsubB=null,blocked=new Set(),replyTo=null,unread={},watch={},notified=new Set(),started=Date.now(),swreg=null,ws='',myWs=[],unsubW=null,roomQ='',msgQ='';
const rq=()=>roomQ.trim().toLowerCase(),mqs=()=>msgQ.trim().toLowerCase();
const rcol=()=>ws?collection(db,'workspaces',ws,'rooms'):collection(db,'rooms');
const rdoc=id=>doc(rcol(),id);
const mcol=(id,k)=>k==='dm'?collection(db,'dms',id,'messages'):collection(rdoc(id),'messages');
const wsInfo=()=>myWs.find(w=>w.id===ws);
const canDelRoom=r=>!!r&&((!!r.by&&r.by===me.uid)||(!!ws&&(wsInfo()||{}).owner===me.uid));
/* ---------- settings ---------- */
let prefs={theme:'system',size:'m',enter:true};
try{prefs={...prefs,...JSON.parse(localStorage.getItem('tb.prefs')||'{}')}}catch(e){}
function applyPrefs(){const r=document.documentElement;
 if(prefs.theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',prefs.theme);
 r.style.setProperty('--mfs',({s:'16px',m:'18px',l:'21px'})[prefs.size]||'18px')}
function savePrefs(){try{localStorage.setItem('tb.prefs',JSON.stringify(prefs))}catch(e){}applyPrefs()}
document.head.insertAdjacentHTML('beforeend','<style>:root[data-theme="light"]{--paper:#EEF1EF;--paper2:#E2E8E6;--ink:#17233F;--pencil:#6A778C;--margin:#C8473B;--line:#C9D3D6;--me:#2B4C9B}:root[data-theme="dark"]{--paper:#141B2B;--paper2:#1B2438;--ink:#E7ECF4;--pencil:#8E9BB3;--margin:#E26A5D;--line:#26314A;--me:#8FB0FF}.msg .body{font-size:var(--mfs,18px)!important}.seg{display:flex;gap:6px}.seg button{flex:1;border:1px solid var(--line);background:var(--paper);color:inherit;border-radius:4px;font:inherit;padding:8px;cursor:pointer}.seg button.on{border-color:var(--ink);background:var(--ink);color:var(--paper)}#pc h4{margin:8px 0 0;font:800 12px var(--ui);color:var(--pencil);letter-spacing:.06em;text-transform:uppercase}#pc label.chk{display:flex;gap:8px;align-items:flex-start;color:var(--ink);font-size:14px}#pc label.chk input{width:auto;margin-top:3px}</style>');
applyPrefs();
const box=()=>$('hubc')||$('pc');
const HCSS=`#pc:has(.hubw){max-width:580px;padding:0;gap:0;overflow:hidden;display:flex;flex-direction:column;max-height:92vh;border-radius:22px!important}
.hubw{display:flex;flex-direction:column;min-height:0;max-height:92vh}
.hbanner{position:relative;display:flex;gap:18px;align-items:center;padding:28px 26px 22px 34px;border-bottom:1px solid var(--line);background:radial-gradient(120% 140% at 0% 0%,var(--wash1),transparent 60%),radial-gradient(90% 120% at 100% 100%,var(--wash2),transparent 65%),repeating-linear-gradient(transparent 0 33px,color-mix(in srgb,var(--line) 70%,transparent) 33px 34px)}
.hbanner::before{content:"";position:absolute;left:18px;top:0;bottom:0;width:2px;background:var(--margin);opacity:.5}
.hav{flex:none}.hav .pav{width:86px;height:86px;font-size:36px;box-shadow:0 0 0 4px var(--paper),0 0 0 6px var(--margin)}
.hid{min-width:0}#pc .hid h3{margin:0;font-size:34px;line-height:1.05;overflow:hidden;text-overflow:ellipsis}
.hid p{margin:3px 0 10px;color:var(--pencil);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hchips{display:flex;gap:6px;flex-wrap:wrap}.hchips span{border:1px solid var(--line);background:color-mix(in srgb,var(--paper) 82%,transparent);border-radius:99px;padding:3px 10px;font-size:12px;font-weight:600;display:inline-flex;align-items:center}
.hx{position:absolute;right:12px;top:8px;border:0;background:none;color:inherit;font-size:30px;line-height:1;cursor:pointer;opacity:.7}
.htabs{display:flex;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--line);overflow-x:auto;background:var(--paper2)}
.htabs button{border:0;background:none;color:var(--pencil);font:inherit;font-weight:600;padding:11px 14px;cursor:pointer;border-bottom:3px solid transparent;white-space:nowrap}
.htabs button.on{color:var(--ink);border-bottom-color:var(--margin)}
.hbody{display:grid;gap:12px;padding:16px 20px 22px;overflow:auto;flex:1;min-height:0;align-content:start}
.hcard{display:grid;gap:10px;border:1px solid var(--line);border-radius:16px;padding:14px 16px;background:color-mix(in srgb,var(--paper) 72%,transparent);box-shadow:0 12px 24px -22px rgba(23,35,63,.6)}
.gcard{display:flex;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid var(--line);padding-top:10px}.gcard:first-of-type{border-top:0;padding-top:0}.gcard small{display:block;color:var(--pencil);font-size:12px}.gact{display:flex;gap:6px}.gact .btn{padding:7px 12px;font-size:13px}
.tips{margin:0;padding:0;list-style:none;display:grid;gap:8px}.tips li{display:flex;gap:10px;align-items:center;font-size:14px}.tips b{min-width:52px;text-align:center;border:1px solid var(--line);border-radius:8px;padding:2px 6px;background:var(--paper);font-size:13px}
@media (max-width:520px){.hbanner{flex-direction:column;align-items:flex-start;gap:12px;padding-left:30px}.hav .pav{width:72px;height:72px;font-size:30px}}`;
document.head.insertAdjacentHTML('beforeend','<style>'+HCSS+'</style>');
let hubTab='profile';
const HTABS=[['profile','Profile'],['settings','Settings'],['privacy','Privacy'],['groups','Groups'],['about','About']];
function openHub(tab){
 hubTab=tab||hubTab;const p=prof||{},n=me.displayName||p.name||'You';
 const joined=p.joined?'<span>Joined '+esc(new Date(p.joined).toLocaleDateString([],{month:'short',year:'numeric'}))+'</span>':'';
 $('pc').innerHTML='<div class="hubw"><div class="hbanner"><button class="hx" id="hx" type="button" aria-label="Close">\u00d7</button><div class="hav">'+avatar({name:n,color:p.color,photoURL:me.photoURL,pic:p.pic})+'</div><div class="hid"><h3>'+esc(n)+(p.mood?' '+esc(p.mood):'')+'</h3><p>'+esc(p.bio||me.email||'')+'</p><div class="hchips"><span>'+(p.hideOnline?'\u25CB Status hidden':'<i class="dot-on" style="margin:0 6px 0 0"></i>Online')+'</span>'+joined+'<span>'+myWs.length+' group'+(myWs.length===1?'':'s')+'</span></div></div></div>'
  +'<nav class="htabs" role="tablist">'+HTABS.map(t=>'<button type="button" role="tab" data-t="'+t[0]+'" class="'+(t[0]===hubTab?'on':'')+'">'+t[1]+'</button>').join('')+'</nav><div class="hbody" id="hubc"></div></div>';
 $('pm').style.display='flex';$('hx').onclick=closePm;
 $('pc').querySelector('.htabs').onclick=e=>{const b=e.target.closest('button');if(b)openHub(b.dataset.t)};
 if(hubTab==='profile')editProfile();else if(hubTab==='groups')renderGroups();else if(hubTab==='about')renderAbout();else renderSettings(hubTab)}
function renderSettings(part){const B=box();
 const seg=(key,opts)=>'<div class="seg" data-k="'+key+'">'+opts.map(o=>'<button type="button" data-v="'+o[0]+'"'+(String(prefs[key])===o[0]?' class="on"':'')+'>'+o[1]+'</button>').join('')+'</div>';
 if(part==='settings'){
  const notif=!('Notification' in window)?'Not supported on this browser':Notification.permission==='granted'?'On':Notification.permission==='denied'?'Blocked in browser settings':'Off';
  B.innerHTML='<div class="hcard"><h4>Appearance</h4><label>Theme</label>'+seg('theme',[['system','Auto'],['light','Light'],['dark','Dark']])+'<label>Message text size</label>'+seg('size',[['s','Small'],['m','Medium'],['l','Large']])+'</div>'
   +'<div class="hcard"><h4>Chat</h4><label class="chk"><input type="checkbox" id="sen"> Press Enter to send (Shift+Enter makes a new line)</label></div>'
   +'<div class="hcard"><h4>Notifications</h4><p class="pb">Browser notifications: <b id="snt">'+esc(notif)+'</b></p><button class="btn" id="snb" type="button"'+(notif==='Off'?'':' hidden')+'>Turn on notifications</button></div>';
 }else{
  B.innerHTML='<div class="hcard"><h4>Who can see you</h4><label class="chk"><input type="checkbox" id="shd"> Hide my online status</label><p class="pb">When this is on, others will not see you in Online now.</p></div>'
   +'<div class="hcard"><h4>Blocked people</h4><div id="sbl" class="pb">Loading...</div></div>';
 }
 B.querySelectorAll('.seg').forEach(g=>{g.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  prefs[g.dataset.k]=b.dataset.v;savePrefs();g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))}});
 if($('sen')){$('sen').checked=prefs.enter!==false;$('sen').onchange=()=>{prefs.enter=$('sen').checked;savePrefs()}}
 if($('snb'))$('snb').onclick=async()=>{try{await Notification.requestPermission()}catch(e){}
  $('snt').textContent=Notification.permission==='granted'?'On':'Blocked in browser settings';$('snb').hidden=true;if($('nt'))$('nt').hidden=true};
 if($('shd')){$('shd').checked=!!prof.hideOnline;
  $('shd').onchange=()=>{prof.hideOnline=$('shd').checked;pcache[me.uid]=prof;
   setDoc(doc(db,'users',me.uid),{hideOnline:prof.hideOnline},{merge:true}).then(()=>{beat();openHub('privacy')}).catch(()=>toast('Could not save that setting.'))}}
 if($('sbl')){
  const drawBlocked=async()=>{const el=$('sbl');if(!el)return;const ids=[...blocked];
   if(!ids.length){el.textContent='No one is blocked.';return}
   await Promise.all(ids.map(async u=>{if(!pcache[u]){try{const d=await getDoc(doc(db,'users',u));pcache[u]=d.exists()?d.data():{}}catch(e){pcache[u]={}}}}));
   const el2=$('sbl');if(!el2)return;
   el2.innerHTML=ids.map(u=>'<div class="prow" style="align-items:center;margin:4px 0"><span style="flex:1">'+esc((pcache[u]||{}).name||'Someone')+'</span><button class="btn ub" data-u="'+esc(u)+'" type="button" style="flex:none">Unblock</button></div>').join('')};
  drawBlocked();
  $('sbl').onclick=async e=>{const b=e.target.closest('.ub');if(!b)return;
   try{await deleteDoc(doc(db,'blocks',me.uid+'_'+b.dataset.u));setTimeout(drawBlocked,400)}catch(x){alert('Could not unblock: '+(x.code||x.message))}}}}
function renderGroups(){const B=box();
 const card=(id,name,sub,extra)=>'<div class="gcard"><div><b>'+esc(name)+'</b><small>'+esc(sub)+'</small></div><div class="gact">'+extra+'<button class="btn go" type="button" data-id="'+esc(id)+'">Open</button></div></div>';
 B.innerHTML='<div class="hcard"><h4>Your spaces</h4>'+card('','Public (everyone)','Open to everyone who is signed in','')
  +myWs.map(w=>card(w.id,w.name,w.members.length+' member'+(w.members.length===1?'':'s')+(w.owner===me.uid?' \u00b7 You own this':''),'<button class="btn mg" type="button" data-id="'+esc(w.id)+'">Manage</button>')).join('')+'</div>'
  +'<button class="btn primary" id="gnew" type="button">+ Create or join a group</button>';
 B.onclick=e=>{const g=e.target.closest('.go'),m=e.target.closest('.mg');
  if(g){switchWs(g.dataset.id);closePm();return}
  if(m){switchWs(m.dataset.id);closePm();setTimeout(()=>$('wset').click(),60);return}
  if(e.target.closest('#gnew')){closePm();setTimeout(()=>$('wnew').click(),60)}}}
function renderAbout(){const B=box();
 B.innerHTML='<div class="hcard"><h4>Account</h4><p class="pb">'+esc(me.email||'')+'</p><button class="btn" id="sso" type="button" style="color:var(--margin)">Sign out</button></div>'
  +'<div class="hcard"><h4>Quick tips</h4><ul class="tips"><li><b>\u263A</b> React to a message</li><li><b>\u21A9</b> Reply to a message</li><li><b>\u{1F50D}</b> Search inside a chat</li><li><b>+ Group</b> Make a private space and invite people</li></ul></div>'
  +'<div class="hcard"><h4>Install on your phone</h4><p class="pb">Open your browser menu and choose <b>Add to Home screen</b>. TraceBook then opens like an app.</p></div>'
  +'<div class="hcard"><h4>About</h4><p class="pb">TraceBook \u00b7 Conversations, kept on the page.<br>Built on a phone.</p></div>';
 $('sso').onclick=()=>{closePm();doSignOut()}}

/* ---------- sign in ---------- */
const err=m=>{$('ger').textContent=m||''};
const friendly=e=>({
 'auth/invalid-credential':'Email or password is wrong.','auth/wrong-password':'Email or password is wrong.',
 'auth/user-not-found':'No account with that email. Choose Create an account.','auth/email-already-in-use':'That email already has an account. Sign in instead.',
 'auth/weak-password':'Use a password with at least 6 characters.','auth/popup-closed-by-user':'Google sign-in was closed before it finished.',
 'auth/unauthorized-domain':'Add this site to Authentication > Settings > Authorized domains in Firebase.','auth/invalid-email':'Enter a valid email address.','auth/account-exists-with-different-credential':'This email is already registered another way. Sign in with your email and password instead.'
}[e.code]||'Something went wrong ('+(e.code||'unknown')+').');
document.head.insertAdjacentHTML('beforeend','<style>#gg{display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#1f1f1f;border-color:#dadce0}#toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--paper);padding:12px 18px;border-radius:4px;z-index:20;max-width:90%;text-align:center}</style>');
function toast(m){const d=document.createElement('div');d.id='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),5000)}
const gprov=new GoogleAuthProvider();gprov.setCustomParameters({prompt:'select_account'});
$('gg').innerHTML='<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg><span>Continue with Google</span>';
$('gg').insertAdjacentHTML('afterend','<small style="text-align:center;color:var(--pencil);font-size:13px">New or returning: Google creates your account from your email automatically.</small>');
function handleNew(r){const i=getAdditionalUserInfo(r);if(i&&i.isNewUser)toast('Account created with '+(r.user.email||'Google')+'. Welcome!')}
$('gg').onclick=async()=>{err();
 try{handleNew(await signInWithPopup(auth,gprov))}
 catch(e){if(e.code==='auth/cancelled-popup-request')return;if(e.code==='auth/popup-blocked'){signInWithRedirect(auth,gprov);return}err(friendly(e))}};
getRedirectResult(auth).then(r=>{if(r)handleNew(r)}).catch(e=>err(friendly(e)));
$('gm').onclick=()=>{creating=!creating;err();
 $('gn').style.display=creating?'':'none';$('gn').required=creating;
 $('gs').textContent=creating?'Create account':'Sign in with email';
 $('gm').textContent=creating?'Have an account? Sign in':'New here? Create an account';
 $('gw').autocomplete=creating?'new-password':'current-password'};
$('ef').onsubmit=async e=>{e.preventDefault();err();const em=$('ge').value.trim(),pw=$('gw').value;
 try{
  if(creating){const c=await createUserWithEmailAndPassword(auth,em,pw);await updateProfile(c.user,{displayName:$('gn').value.trim()||em.split('@')[0]});location.reload()}
  else await signInWithEmailAndPassword(auth,em,pw)
 }catch(x){err(friendly(x))}};
$('gr').onclick=async()=>{const em=$('ge').value.trim();if(!em){err('Type your email first, then choose Forgot password.');return}
 try{await sendPasswordResetEmail(auth,em);err('');$('gp').textContent='Password reset email sent to '+em+'.'}catch(x){err(friendly(x))}};

/* ---------- chat ---------- */
function chip(){const a=$('acct'),n=me.displayName||me.email||'You';
 a.innerHTML=((prof.pic||me.photoURL)?'<img class="av" alt="" referrerpolicy="no-referrer" src="'+esc(prof.pic||me.photoURL)+'">':'<span class="av" style="background:'+esc(prof.color||'')+'">'+esc(n.charAt(0).toUpperCase())+'</span>')+'<div><b>'+esc(n)+'</b><small>'+esc((prof.mood?prof.mood+' ':'')+(prof.bio||me.email||''))+'</small></div><div class="ab"><button id="hub" type="button">My space</button></div>';
 $('hub').onclick=()=>openHub('profile')}
async function doSignOut(){try{await setDoc(doc(db,'users',me.uid),{lastSeen:0},{merge:true})}catch(e){}signOut(auth)}
const shown=()=>msgs.filter(m=>!blocked.has(m.uid));
function renderRooms(){
 const item=(r,k)=>{const on=r.id===cur&&curKind===k,m=on?shown().slice(-1)[0]:null;
  return '<button class="room'+(on?' on':'')+'" data-id="'+r.id+'" data-k="'+k+'"><b><span>'+(k==='dm'?'\u{1F512} ':'')+esc(r.name)+(k==='dm'&&isOn(r.other)?'<span class="dot-on"></span>':'')+(unread[k+'|'+r.id]?'<span class="badge">'+unread[k+'|'+r.id]+'</span>':'')+'</span><i>'+(m?hm(m.ts):'')+'</i></b><p>'+(m?esc((m.uid===me.uid?'':m.name+': ')+m.text):(k==='dm'?'Private chat':'Shared trace'))+'</p></button>'};
 const vd=()=>dms.filter(d=>!blocked.has(d.other)&&(!rq()||d.name.toLowerCase().includes(rq())));
 $('rooms').innerHTML=rooms.filter(r=>!rq()||r.name.toLowerCase().includes(rq())).map(r=>item(r,'room')).join('')+'<div class="sec">Private chats<button id="np" type="button">+ New</button></div>'+(vd().length?vd().map(r=>item(r,'dm')).join(''):'<p class="pb" style="padding:4px 20px">No private chats yet.</p>')
  +(()=>{const o=Object.keys(seen).filter(u=>u!==me.uid&&isOn(u)&&!blocked.has(u)&&(!rq()||((pcache[u]||{}).name||'').toLowerCase().includes(rq())));
   return '<div class="sec">Online now ('+o.length+')</div>'+(o.length?o.map(u=>'<button class="room onl" data-u="'+esc(u)+'"><span class="dot-on" style="margin:0 8px 0 0"></span>'+esc((pcache[u]||{}).name||'Someone')+'</button>').join(''):'<p class="pb" style="padding:4px 20px">No one else right now.</p>')})()}
const escRe=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function hl(text){const q=msgQ.trim();text=text||'';if(!q)return esc(text);
 return text.split(new RegExp('('+escRe(q)+')','ig')).map((p,i)=>i%2?'<mark>'+esc(p)+'</mark>':esc(p)).join('')}
const REACTS=['👍','❤️','😂','😮','🙏','🔥'];
const line=(m,n)=>{const mine=m.uid===me.uid,rx=m.reacts||{};
 const chips=REACTS.map((e,i)=>{const a=rx['r'+i]||[];return a.length?'<button class="chip'+(a.includes(me.uid)?' on':'')+'" data-id="'+esc(m.id||'')+'" data-i="'+i+'">'+e+' '+a.length+'</button>':''}).join('');
 return '<div class="msg'+(mine?' me':'')+(n?' new':'')+'"><time>'+hm(m.ts)+'</time><span class="rule"></span><div class="body">'
  +(m.reply?'<div class="quote">\u21A9 '+esc(m.reply.name||'')+': '+esc(m.reply.text||'')+'</div>':'')
  +mav(m)+'<span class="who" data-uid="'+esc(m.uid||'')+'" data-n="'+esc(m.name||'')+'">'+esc(m.name||'Someone')+'</span>'+hl(m.text)
  +(m.id?'<button class="act" data-a="react" data-id="'+esc(m.id)+'" title="React" aria-label="React">\u263A</button><button class="act" data-a="reply" data-id="'+esc(m.id)+'" title="Reply" aria-label="Reply">\u21A9</button>':'')
  +(mine&&m.id?'<button class="del" data-id="'+esc(m.id)+'" aria-label="Delete message" title="Delete">\u00d7</button>':'')
  +(chips?'<div class="rxs">'+chips+'</div>':'')+'</div></div>'};
function renderLog(){const r=(curKind==='dm'?dms:rooms).find(x=>x.id===cur);if(!r)return;
 $('dt').hidden=curKind==='dm'?false:!canDelRoom(r);$('dt').textContent=curKind==='dm'?'Delete chat':'Delete trace';
 $('rt').textContent=(curKind==='dm'?'\u{1F512} ':'')+r.name;$('rs').textContent=curKind==='dm'?'Private. Only you two can see this.':'Shared with everyone signed in';
 const q=mqs(),vis=shown().filter(m=>!q||((m.text||'')+' '+(m.name||'')).toLowerCase().includes(q));let last='',h=vis.length?'':'<div class="day">'+(q?'No messages match "'+esc(msgQ.trim())+'".':'Empty page. Write the first line below.')+'</div>';
 if($('mc'))$('mc').textContent=q?vis.length+' found':'';
 vis.forEach(m=>{const d=dayLabel(m.ts);if(d!==last){h+='<div class="day">'+d+'</div>';last=d}h+=line(m)});
 const atBottom=log.scrollHeight-log.scrollTop-log.clientHeight<80;
 log.innerHTML=h;if(atBottom)log.scrollTop=log.scrollHeight}
function open(id,k='room'){cur=id;curKind=k;msgs=[];replyTo=null;showReply();delete unread[k+'|'+id];setTitle();msgQ='';if($('mq')){$('mq').value='';$('msb').hidden=true}renderRooms();renderLog();app.classList.add('chatting');
 unsubM&&unsubM();
 unsubM=onSnapshot(query(mcol(id,k),orderBy('ts'),limit(200)),snap=>{
  msgs=snap.docs.map(d=>({...d.data(),id:d.id}));renderRooms();renderLog();ensureProfiles(msgs)},()=>{$('rs').textContent='Cannot load messages. Check your Firestore rules.'})}
function start(){
 unsubD=onSnapshot(query(collection(db,'dms'),where('members','array-contains',me.uid)),snap=>{
  dms=snap.docs.map(d=>{const m=d.data(),o=(m.members||[]).find(x=>x!==me.uid);return{id:d.id,other:o,name:(m.names&&m.names[o])||'Someone'}});
  syncWatch();
  if(curKind==='dm'&&!dms.some(x=>x.id===cur)&&rooms[0]){open(rooms[0].id);return}
  renderRooms();if(curKind==='dm')renderLog()},()=>{});
 unsubB=onSnapshot(query(collection(db,'blocks'),where('by','==',me.uid)),snap=>{
  blocked=new Set(snap.docs.map(d=>d.data().target));renderRooms();renderLog()},()=>{});
 unsubO=onSnapshot(query(collection(db,'users'),orderBy('lastSeen','desc'),limit(30)),snap=>{
  snap.docs.forEach(d=>{const x=d.data();seen[d.id]=x.lastSeen||0;pcache[d.id]=x;asked.add(d.id)});
  renderRooms();renderLog()},()=>{});
 subRooms();subWsList()}
function subRooms(){unsubR&&unsubR();const w=ws;
 unsubR=onSnapshot(query(rcol(),orderBy('ts')),snap=>{
  if(w!==ws)return;
  if(snap.empty){if(!w)addDoc(collection(db,'rooms'),{name:'General',ts:Date.now()});
   rooms=[];syncWatch();renderRooms();
   if(curKind==='room'){cur=null;msgs=[];log.innerHTML='';$('rt').textContent=wsInfo()?wsInfo().name:'TraceBook';$('rs').textContent='No traces here yet. Add one on the left.';$('dt').hidden=true}
   return}
  rooms=snap.docs.map(d=>({id:d.id,name:d.data().name,by:d.data().by||''}));syncWatch();
  if(curKind==='room'&&!rooms.some(r=>r.id===cur))open(rooms[0].id);else{renderRooms();renderLog()}},()=>{$('rs').textContent='Cannot load traces. Check your Firestore rules.'})}
function subWsList(){
 unsubW=onSnapshot(query(collection(db,'workspaces'),where('members','array-contains',me.uid)),snap=>{
  myWs=snap.docs.map(d=>({id:d.id,...d.data()}));
  if(ws&&!wsInfo()&&!snap.metadata.hasPendingWrites)switchWs('');
  renderWs()},()=>{})}
function switchWs(id){ws=id;cur=null;msgs=[];rooms=[];curKind='room';
 unsubM&&unsubM();Object.keys(watch).forEach(k=>{if(k.startsWith('room|')){watch[k]();delete watch[k]}});
 Object.keys(unread).forEach(k=>{if(k.startsWith('room|'))delete unread[k]});setTitle();
 renderRooms();log.innerHTML='';renderWs();subRooms()}
function renderWs(){const sel=$('wsel');if(!sel)return;
 sel.innerHTML='<option value="">Public (everyone)</option>'+myWs.map(w=>'<option value="'+esc(w.id)+'">'+esc(w.name)+'</option>').join('');
 sel.value=ws;$('wset').hidden=!ws}
const genCode=()=>{const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789',b=crypto.getRandomValues(new Uint8Array(10));return [...b].map(x=>A[x%A.length]).join('')};
async function createWs(name){const code=genCode(),ref=doc(collection(db,'workspaces'));
 await setDoc(ref,{name,owner:me.uid,members:[me.uid],code,ts:Date.now()});
 await setDoc(doc(db,'invites',code),{wid:ref.id,name,owner:me.uid});
 switchWs(ref.id);
 await addDoc(collection(db,'workspaces',ref.id,'rooms'),{name:'General',ts:Date.now(),by:me.uid})}
async function joinWs(code){code=code.trim().toUpperCase();
 const inv=await getDoc(doc(db,'invites',code));if(!inv.exists())throw new Error('bad');
 const wid=inv.data().wid;let member=false;
 try{const d=await getDoc(doc(db,'workspaces',wid));member=d.exists()&&d.data().members.includes(me.uid)}catch(e){}
 if(!member)await updateDoc(doc(db,'workspaces',wid),{members:arrayUnion(me.uid)});
 switchWs(wid)}
async function deleteWs(w){
 const rs=await getDocs(collection(db,'workspaces',w.id,'rooms'));
 for(const r of rs.docs){const ms=await getDocs(collection(r.ref,'messages'));
  for(let i=0;i<ms.docs.length;i+=400){const b=writeBatch(db);ms.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit()}
  await deleteDoc(r.ref)}
 await deleteDoc(doc(db,'invites',w.code));await deleteDoc(doc(db,'workspaces',w.id))}
async function handleJoin(){const c=new URLSearchParams(location.search).get('join');if(!c)return;
 history.replaceState({},'',location.pathname);
 try{const inv=await getDoc(doc(db,'invites',c.trim().toUpperCase()));
  if(!inv.exists()){toast('That invite link is not valid.');return}
  const d=inv.data();
  $('pc').innerHTML='<h3>Join "'+esc(d.name)+'"?</h3><p class="pb">You will see the traces and messages in this group.</p><div class="prow"><button class="btn" id="jx" type="button">Not now</button><button class="btn primary" id="jy" type="button">Join</button></div>';
  $('pm').style.display='flex';$('jx').onclick=closePm;
  $('jy').onclick=async()=>{try{await joinWs(c);closePm()}catch(e){alert('Could not join: '+(e.code||e.message))}}
 }catch(e){toast('Could not open that invite.')}}
$('rooms').insertAdjacentHTML('beforebegin','<div class="wsbar"><select id="wsel" aria-label="Group"></select><button id="wset" type="button" hidden title="Group settings">\u2699</button><button id="wnew" type="button" title="Create or join a group">+ Group</button></div>');
$('wsel').onchange=e=>switchWs(e.target.value);
$('rooms').insertAdjacentHTML('beforebegin','<div class="rsb"><input id="rq" type="search" placeholder="Search traces and people" aria-label="Search traces and people"></div>');
$('rq').oninput=e=>{roomQ=e.target.value;renderRooms()};
$('wnew').onclick=()=>{
 $('pc').innerHTML='<h3>Groups</h3><p class="pb">A group is a private space. Only people you invite can see its traces.</p><label>New group name<input id="wn" maxlength="30" placeholder="Class 12 notes"></label><button class="btn primary" id="wc" type="button">Create group</button><label>Or join with an invite code<input id="wj" maxlength="20" placeholder="Invite code"></label><button class="btn" id="wjb" type="button">Join</button><button class="btn" id="wx" type="button">Close</button>';
 $('pm').style.display='flex';$('wx').onclick=closePm;
 $('wc').onclick=async()=>{const n=$('wn').value.trim();if(!n)return;$('wc').disabled=true;try{await createWs(n.slice(0,30));closePm()}catch(e){$('wc').disabled=false;alert('Could not create group: '+(e.code||e.message))}};
 $('wjb').onclick=async()=>{const c=$('wj').value;if(!c.trim())return;try{await joinWs(c);closePm()}catch(e){alert(e.message==='bad'?'That invite code was not found.':'Could not join: '+(e.code||e.message))}}};
$('wset').onclick=async()=>{const w=wsInfo();if(!w)return;
 const owner=w.owner===me.uid,link=location.origin+'/?join='+w.code;
 $('pc').innerHTML='<h3>'+esc(w.name)+'</h3><p class="pb">'+w.members.length+' member'+(w.members.length===1?'':'s')+'</p><div id="wm" class="pb">Loading...</div><label>Invite code<input id="wcode" readonly></label><button class="btn" id="wcp" type="button">Copy invite link</button><button class="btn" id="wlv" type="button" style="color:var(--margin)">'+(owner?'Delete group':'Leave group')+'</button><button class="btn" id="wx" type="button">Close</button>';
 $('wcode').value=w.code;$('pm').style.display='flex';$('wx').onclick=closePm;
 $('wcp').onclick=async()=>{try{await navigator.clipboard.writeText(link);toast('Invite link copied.')}catch(e){prompt('Copy this link:',link)}};
 $('wlv').onclick=async()=>{
  if(owner){if(!confirm('Delete "'+w.name+'" with all its traces and messages for everyone? This cannot be undone.'))return;
   $('wlv').disabled=true;try{await deleteWs(w);closePm();switchWs('')}catch(e){$('wlv').disabled=false;alert('Could not delete: '+(e.code||e.message))}}
  else{if(!confirm('Leave "'+w.name+'"?'))return;
   try{await updateDoc(doc(db,'workspaces',w.id),{members:arrayRemove(me.uid)});closePm();switchWs('')}catch(e){alert('Could not leave: '+(e.code||e.message))}}};
 const names=await Promise.all(w.members.map(async u=>{if(!pcache[u]){try{const d=await getDoc(doc(db,'users',u));pcache[u]=d.exists()?d.data():{}}catch(e){pcache[u]={}}}return((pcache[u]||{}).name||'Someone')+(u===w.owner?' (owner)':'')}));
 if($('wm'))$('wm').textContent=names.join(', ')};
function send(){const v=t.value.trim();if(!v||!cur)return;
 const data={uid:me.uid,name:me.displayName||me.email||'Someone',text:v,ts:Date.now()};if(replyTo)data.reply=replyTo;
 addDoc(mcol(cur,curKind),data).catch(()=>toast('Message could not be sent.'));replyTo=null;showReply();
 t.value='';grow();s.disabled=true}
function grow(){t.style.height='auto';t.style.height=Math.min(t.scrollHeight,140)+'px'}
t.addEventListener('input',()=>{s.disabled=!t.value.trim();grow()});
t.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&prefs.enter!==false){e.preventDefault();send()}});
$('f').addEventListener('submit',e=>{e.preventDefault();send()});
$('rooms').addEventListener('click',e=>{if(e.target.closest('#np')){openPeople();return}const o=e.target.closest('.onl');if(o){showCard(o.dataset.u,'');return}const b=e.target.closest('.room');if(b)open(b.dataset.id,b.dataset.k)});
$('back').addEventListener('click',()=>app.classList.remove('chatting'));
$('nf').addEventListener('submit',e=>{e.preventDefault();const v=$('nr').value.trim();if(!v)return;$('nr').value='';
 addDoc(rcol(),{name:v.slice(0,30),ts:Date.now(),by:me.uid}).then(r=>open(r.id))});
document.querySelector('header.top').insertAdjacentHTML('beforeend','<button id="dt" type="button" hidden>Delete trace</button>');
log.insertAdjacentHTML('beforebegin','<div id="msb" hidden><input id="mq" type="search" placeholder="Search this chat" aria-label="Search this chat"><span id="mc"></span><button id="mx" type="button" aria-label="Close search">\u00d7</button></div>');
$('dt').insertAdjacentHTML('beforebegin','<button id="sb" type="button" title="Search this chat" aria-label="Search this chat">\u{1F50D}</button>');
$('sb').onclick=()=>{const b=$('msb');b.hidden=!b.hidden;if(b.hidden){msgQ='';$('mq').value='';renderLog()}else $('mq').focus()};
$('mq').oninput=e=>{msgQ=e.target.value;renderLog()};
$('mx').onclick=()=>{$('msb').hidden=true;msgQ='';$('mq').value='';renderLog()};
$('dt').onclick=async()=>{
 if(curKind==='dm'){const id=cur;if(!confirm('Delete this private chat and all its messages for both of you? This cannot be undone.'))return;
  $('dt').disabled=true;
  try{const snap=await getDocs(mcol(id,'dm'));
   for(let i=0;i<snap.docs.length;i+=400){const b=writeBatch(db);snap.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit()}
   await deleteDoc(doc(db,'dms',id));curKind='room';if(rooms[0])open(rooms[0].id)}
  catch(e){alert('Could not delete: '+(e.code||e.message))}
  $('dt').disabled=false;return}
 const r=rooms.find(x=>x.id===cur);if(curKind!=='room'||!canDelRoom(r))return;
 if(!confirm('Delete the trace "'+r.name+'" and all its messages? This cannot be undone.'))return;
 $('dt').disabled=true;
 try{const snap=await getDocs(mcol(r.id,'room'));
  for(let i=0;i<snap.docs.length;i+=400){const b=writeBatch(db);snap.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit()}
  await deleteDoc(rdoc(r.id))}
 catch(e){alert('Could not delete: '+(e.code||e.message))}
 $('dt').disabled=false};

/* ---------- reactions, replies, notifications ---------- */
$('f').insertAdjacentHTML('beforebegin','<div id="rp" hidden></div>');
document.head.insertAdjacentHTML('beforeend','<style>#rp{padding:8px 20px;background:var(--paper2);border-top:1px solid var(--line);font-size:14px;color:var(--pencil);display:flex;justify-content:space-between;gap:10px;align-items:center}#rp[hidden]{display:none}#rp span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#rp button{border:0;background:none;color:inherit;font-size:20px;cursor:pointer}.quote{height:34px;line-height:34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--pencil);font:14px/34px var(--ui);border-left:3px solid var(--line);padding-left:8px}.rxs{display:flex;gap:6px;height:34px;align-items:center;overflow-x:auto}.chip{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:99px;padding:0 10px;font:inherit;font-size:14px;height:26px;cursor:pointer;flex:none}.chip.on{border-color:var(--me)}.act{border:0;background:none;color:var(--pencil);font-size:16px;cursor:pointer;margin-left:6px;padding:0 4px;line-height:inherit;opacity:.65}.badge{display:inline-block;background:var(--margin);color:#fff;border-radius:99px;font-size:11px;font-weight:800;padding:1px 7px;margin-left:8px}</style>');
const msgRef=id=>doc(mcol(cur,curKind),id);
function toggleReact(id,i){const m=msgs.find(x=>x.id===id);if(!m)return;
 const has=((m.reacts||{})['r'+i]||[]).includes(me.uid);
 updateDoc(msgRef(id),{['reacts.r'+i]:has?arrayRemove(me.uid):arrayUnion(me.uid)}).catch(()=>toast('Could not react.'))}
function pickReact(id){
 $('pc').innerHTML='<h3>React</h3><div class="em" id="rpk">'+REACTS.map((e,i)=>'<button type="button" data-i="'+i+'">'+e+'</button>').join('')+'</div><button class="btn" id="rcx" type="button">Close</button>';
 $('pm').style.display='flex';$('rcx').onclick=closePm;
 $('rpk').onclick=e=>{const b=e.target.closest('button');if(!b)return;toggleReact(id,+b.dataset.i);closePm()}}
function showReply(){const r=$('rp');if(!replyTo){r.hidden=true;return}
 r.hidden=false;r.innerHTML='<span>\u21A9 Replying to '+esc(replyTo.name)+': '+esc(replyTo.text)+'</span><button type="button" id="rpx" aria-label="Cancel reply">\u00d7</button>';
 $('rpx').onclick=()=>{replyTo=null;showReply()}}
function startReply(id){const m=msgs.find(x=>x.id===id);if(!m)return;
 replyTo={id,name:m.name||'Someone',text:(m.text||'').slice(0,80)};showReply();t.focus()}
function setTitle(){const n=Object.values(unread).reduce((a,b)=>a+b,0);document.title=(n?'('+n+') ':'')+'TraceBook'}
function notify(m,k,kind,id){
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 const chat=(kind==='dm'?dms:rooms).find(x=>x.id===id),title=(m.name||'Someone')+(chat?' \u00b7 '+chat.name:''),opts={body:(m.text||'').slice(0,100),tag:k};
 try{if(swreg)swreg.showNotification(title,opts);else new Notification(title,opts)}catch(e){}}
function syncWatch(){
 const want=new Set();rooms.forEach(r=>want.add('room|'+r.id));dms.forEach(d=>want.add('dm|'+d.id));
 Object.keys(watch).forEach(k=>{if(!want.has(k)){watch[k]();delete watch[k]}});
 want.forEach(k=>{if(watch[k])return;const parts=k.split('|'),kind=parts[0],id=parts[1];
  watch[k]=onSnapshot(query(mcol(id,kind),orderBy('ts','desc'),limit(1)),snap=>{
   const d=snap.docs[0];if(!d||snap.metadata.hasPendingWrites)return;const m=d.data();
   if(m.ts<started||m.uid===me.uid||blocked.has(m.uid))return;
   const nk=k+'|'+d.id;if(notified.has(nk))return;notified.add(nk);
   if(cur===id&&curKind===kind&&document.visibilityState==='visible')return;
   unread[k]=(unread[k]||0)+1;renderRooms();setTitle();
   if(document.visibilityState!=='visible')notify(m,k,kind,id)},()=>{})})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&cur){delete unread[(curKind==='dm'?'dm':'room')+'|'+cur];renderRooms();setTitle()}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(r=>{swreg=r}).catch(()=>{});
$('acct').insertAdjacentHTML('beforebegin','<button class="btn" id="nt" type="button" hidden>\u{1F514} Turn on notifications</button>');
if('Notification' in window&&Notification.permission==='default')$('nt').hidden=false;
$('nt').onclick=async()=>{try{await Notification.requestPermission()}catch(e){}$('nt').hidden=true;toast(Notification.permission==='granted'?'Notifications are on.':'Notifications are blocked in your browser settings.')};

/* ---------- profile ---------- */
document.head.insertAdjacentHTML('beforeend','<style>#pm{position:fixed;inset:0;z-index:11;background:rgba(10,15,30,.6);display:none;align-items:center;justify-content:center;padding:20px}#pc{max-width:360px;width:100%;background:var(--paper2);color:var(--ink);border:1px solid var(--line);border-left:4px solid var(--margin);border-radius:4px;padding:24px;display:grid;gap:12px;max-height:100%;overflow:auto}#pc h3{margin:0;font-family:"Cormorant Garamond",Georgia,serif;font-size:28px}#pc label{display:grid;gap:4px;font-size:13px;color:var(--pencil)}.pav{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:28px;font-weight:800;color:#fff;object-fit:cover}.pb{margin:0;line-height:1.5;color:var(--pencil)}.sws{display:flex;gap:10px;flex-wrap:wrap}.sw{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer}.sw.on{border-color:var(--ink)}.prow{display:flex;gap:10px}.prow .btn{flex:1}.who{cursor:pointer}.acct .ab{display:grid;gap:4px;flex:none}.tg{display:flex;gap:6px;flex-wrap:wrap}.tg span{border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-size:13px}.em{display:flex;gap:6px;flex-wrap:wrap}.em button{font-size:20px;border:2px solid transparent;background:var(--paper);border-radius:6px;padding:2px 6px;cursor:pointer}.em button.on{border-color:var(--ink)}#pc a{color:var(--me)}.rsb{padding:8px 20px 0}.rsb input{width:100%}#msb{display:flex;gap:8px;align-items:center;padding:8px 20px;border-bottom:1px solid var(--line);background:var(--paper2)}#msb[hidden]{display:none}#msb input{flex:1}#mc{font-size:13px;color:var(--pencil);white-space:nowrap}#msb button{border:0;background:none;color:inherit;font-size:22px;cursor:pointer}mark{background:#F4E26B;color:#17233F;border-radius:2px}#sb{margin-left:auto;border:1px solid var(--line);background:none;color:inherit;border-radius:4px;font-size:16px;padding:4px 10px;cursor:pointer}#sb+#dt{margin-left:8px}.wsbar{display:flex;gap:6px;padding:10px 20px;border-bottom:1px solid var(--line)}.wsbar select{flex:1;min-width:0;font:inherit;color:inherit;background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:8px}.wsbar button{border:1px solid var(--line);background:var(--paper);color:inherit;border-radius:4px;font:inherit;font-size:13px;padding:0 10px;cursor:pointer}.wsbar button[hidden]{display:none}.dot-on{display:inline-block;width:8px;height:8px;border-radius:50%;background:#2E9E5B;margin-left:6px}.mav.on{box-shadow:0 0 0 2px var(--paper),0 0 0 4px #2E9E5B}.mav{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;font:800 12px var(--ui);color:#fff;position:relative;top:-2px}img.mav{display:inline-block}.sec{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 4px;font-size:13px;font-weight:800;color:var(--pencil)}#np{border:1px solid var(--line);background:var(--paper);color:inherit;border-radius:4px;font:inherit;font-size:12px;padding:3px 8px;cursor:pointer}.pr{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:8px 0;color:inherit;font:inherit;cursor:pointer}.pr small{display:block;color:var(--pencil);font-size:12px}.pav.sm{width:36px;height:36px;font-size:16px;flex:none}.pl{max-height:50vh;overflow:auto}#dt{margin-left:auto;border:1px solid var(--line);background:none;color:var(--margin);font:inherit;font-size:13px;padding:6px 10px;border-radius:4px;cursor:pointer}.del{border:0;background:none;color:var(--pencil);font-size:20px;cursor:pointer;margin-left:8px;padding:0 6px;line-height:inherit;opacity:.65}.del:hover{color:var(--margin);opacity:1}</style>');
document.body.insertAdjacentHTML('beforeend','<div id="pm" role="dialog" aria-label="Profile"><div id="pc"></div></div>');
const pcache={},asked=new Set(),seen={};
const isOn=u=>!!seen[u]&&Date.now()-seen[u]<300000;
const ago=ts=>{const m=Math.floor((Date.now()-ts)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.floor(m/60)+' h ago':Math.floor(m/1440)+' d ago'};
function beat(){if(!me||document.visibilityState!=='visible')return;
 setDoc(doc(db,'users',me.uid),{lastSeen:prof.hideOnline?0:Date.now()},{merge:true}).catch(()=>{})}
setInterval(beat,120000);document.addEventListener('visibilitychange',beat);
setInterval(()=>{if(me)renderRooms()},60000);
const mav=m=>{const p=pcache[m.uid]||{},src=p.pic||p.photoURL;
 return src?'<img class="mav'+(isOn(m.uid)&&m.uid!==me.uid?' on':'')+'" alt="" referrerpolicy="no-referrer" src="'+esc(src)+'">':'<span class="mav'+(isOn(m.uid)&&m.uid!==me.uid?' on':'')+'" style="background:'+esc(p.color||COLORS[0])+'">'+esc((m.name||'?').charAt(0).toUpperCase())+'</span>'};
async function ensureProfiles(list){
 const need=[...new Set(list.map(m=>m.uid))].filter(u=>u&&!asked.has(u));if(!need.length)return;
 need.forEach(u=>asked.add(u));
 await Promise.all(need.map(async u=>{try{const d=await getDoc(doc(db,'users',u));pcache[u]=d.exists()?d.data():{}}catch(e){pcache[u]={}}}));
 renderLog()}
const COLORS=['#2B4C9B','#C8473B','#2E7D5B','#8A5BB5','#C98A1B','#3B7F9E'];
let prof={};
const closePm=()=>{$('pm').style.display='none'};
$('pm').addEventListener('click',e=>{if(e.target.id==='pm')closePm()});
const avatar=p=>(p.pic||p.photoURL)?'<img class="pav" alt="" referrerpolicy="no-referrer" src="'+esc(p.pic||p.photoURL)+'">':'<span class="pav" style="background:'+esc(p.color||COLORS[0])+'">'+esc((p.name||'?').charAt(0).toUpperCase())+'</span>';
const MOODS=['😀','😎','📚','☕','🎧','🌙','🔥','🌱'];
const safeLink=u=>/^https:\/\/[^\s"'<>]+$/i.test(u||'')?u:'';
async function loadProf(){
 try{const r=doc(db,'users',me.uid),d=await getDoc(r);
  if(d.exists())prof=d.data();
  else{prof={name:me.displayName||(me.email||'').split('@')[0]||'Someone',bio:'',color:COLORS[0],photoURL:me.photoURL||'',pic:'',mood:'',pronouns:'',city:'',link:'',tags:'',joined:Date.now()};await setDoc(r,prof)}
 }catch(e){prof={}}
 pcache[me.uid]=prof;asked.add(me.uid);chip();renderLog();beat()}
async function showCard(uid,fallback){
 if(uid===me.uid)return openHub('profile');
 $('pc').innerHTML='<p class="pb">Loading...</p>';$('pm').style.display='flex';
 let p={};try{const d=await getDoc(doc(db,'users',uid));if(d.exists())p=d.data()}catch(e){}
 p.name=p.name||fallback||'Someone';
 const tags=(p.tags||'').split(',').map(x=>x.trim()).filter(Boolean),link=safeLink(p.link);
 $('pc').innerHTML=avatar(p)+'<h3>'+esc(p.name)+(p.mood?' '+esc(p.mood):'')+'</h3>'
  +(p.pronouns?'<small class="pb">'+esc(p.pronouns)+'</small>':'')
  +'<p class="pb">'+(esc(p.bio||'')||'No status yet.')+'</p>'
  +(p.city?'<p class="pb">\u{1F4CD} '+esc(p.city)+'</p>':'')
  +(tags.length?'<div class="tg">'+tags.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':'')
  +(link?'<p class="pb"><a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">'+esc(link.replace(/^https:\/\//i,''))+'</a></p>':'')
  +(isOn(uid)?'<small class="pb" style="color:#2E9E5B">Online now</small>':(p.lastSeen>0?'<small class="pb">Last seen '+ago(p.lastSeen)+'</small>':''))
  +(p.joined?'<small class="pb">Joined '+new Date(p.joined).toLocaleDateString([],{month:'long',year:'numeric'})+'</small>':'')
  +'<div class="prow"><button class="btn" id="pbk" type="button">'+(blocked.has(uid)?'Unblock':'Block')+'</button><button class="btn" id="pcl" type="button">Close</button></div>';
 $('pcl').onclick=closePm;
 $('pbk').onclick=async()=>{try{
  if(blocked.has(uid)){await deleteDoc(doc(db,'blocks',me.uid+'_'+uid))}
  else{if(!confirm('Block '+p.name+'? You will not see their messages, and they cannot send you private messages.'))return;
   await setDoc(doc(db,'blocks',me.uid+'_'+uid),{by:me.uid,target:uid,ts:Date.now()});
   if(curKind==='dm'&&(dms.find(x=>x.id===cur)||{}).other===uid&&rooms[0])open(rooms[0].id)}
  closePm()}catch(e){alert('Could not update: '+(e.code||e.message))}}}
function editProfile(){
 const B=box();let col=prof.color||COLORS[0],mood=prof.mood||'',pic=prof.pic||'';const n=me.displayName||prof.name||'';
 B.innerHTML='<div class="hcard"><h4>Photo and name</h4><div id="pvw"></div><div class="prow"><button class="btn" id="pup" type="button">Choose photo</button><button class="btn" id="prm" type="button">Remove</button></div><input id="pfile" type="file" accept="image/*" hidden>'
  +'<label>Name<input id="pn" maxlength="30"></label><label>Status<input id="pbio" maxlength="80" placeholder="A few words about you"></label></div>'
  +'<div class="hcard"><h4>About you</h4><label>Mood</label><div class="em">'+MOODS.map(m=>'<button type="button" data-m="'+m+'"'+(m===mood?' class="on"':'')+'>'+m+'</button>').join('')+'</div>'
  +'<label>Pronouns<input id="ppr" maxlength="20" placeholder="she/her, he/him, they/them"></label>'
  +'<label>City<input id="pci" maxlength="30" placeholder="Where you are"></label>'
  +'<label>Interests (up to 3, separated by commas)<input id="ptg" maxlength="60" placeholder="music, books, cricket"></label>'
  +'<label>Link (starts with https://)<input id="pli" maxlength="100" placeholder="https://"></label></div>'
  +'<div class="hcard"><h4>Colour</h4><label>Used when you have no photo</label><div class="sws">'+COLORS.map(c=>'<button type="button" class="sw'+(c===col?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="Colour"></button>').join('')+'</div></div>'
  +'<div class="prow"><button class="btn" id="pcx" type="button">Cancel</button><button class="btn primary" id="psv" type="button">Save changes</button></div>';
 $('pn').value=n;$('pbio').value=prof.bio||'';$('ppr').value=prof.pronouns||'';$('pci').value=prof.city||'';$('ptg').value=prof.tags||'';$('pli').value=prof.link||'';
 $('pm').style.display='flex';
 const pv=()=>{$('pvw').innerHTML=avatar({name:n,color:col,photoURL:me.photoURL,pic})};pv();
 $('pup').onclick=()=>$('pfile').click();
 $('prm').onclick=()=>{pic='';pv()};
 $('pfile').onchange=e=>{const f=e.target.files[0];if(!f)return;
  if(!/^image\//.test(f.type)){alert('Please choose an image.');return}
  const im=new Image(),u=URL.createObjectURL(f);
  im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d'),m=Math.min(im.width,im.height);
   x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,160,160);URL.revokeObjectURL(u);pic=c.toDataURL('image/jpeg',0.82);pv()};
  im.onerror=()=>{URL.revokeObjectURL(u);alert('Could not read that image.')};im.src=u};
 B.querySelector('.sws').onclick=e=>{const b=e.target.closest('.sw');if(!b)return;col=b.dataset.c;
  B.querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b));
  pv()};
 B.querySelector('.em').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  mood=mood===b.dataset.m?'':b.dataset.m;
  B.querySelectorAll('.em button').forEach(x=>x.classList.toggle('on',x.dataset.m===mood))};
 $('pcx').onclick=closePm;
 $('psv').onclick=async()=>{
  const name=$('pn').value.trim()||n||'Someone',bio=$('pbio').value.trim().slice(0,80),
   pronouns=$('ppr').value.trim().slice(0,20),city=$('pci').value.trim().slice(0,30),
   tags=$('ptg').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,3).join(', ').slice(0,60),
   link=$('pli').value.trim();
  if(link&&!safeLink(link)){alert('The link must start with https:// and have no spaces.');return}
  $('psv').disabled=true;
  try{await updateProfile(auth.currentUser,{displayName:name});
   prof={name,bio,color:col,photoURL:me.photoURL||'',pic,mood,pronouns,city,link,tags,hideOnline:!!prof.hideOnline,joined:prof.joined||Date.now()};
   await setDoc(doc(db,'users',me.uid),prof,{merge:true});
   pcache[me.uid]=prof;beat();me=auth.currentUser;chip();renderRooms();renderLog();toast('Profile saved.');openHub('profile')}
  catch(e){$('psv').disabled=false;alert('Could not save: '+(e.code||e.message))}}}
async function openPeople(){
 $('pc').innerHTML='<h3>New private chat</h3><input id="pq" placeholder="Search by name"><div id="pl" class="pl"><p class="pb">Loading...</p></div><button class="btn" id="ppx" type="button">Close</button>';
 $('pm').style.display='flex';$('ppx').onclick=closePm;
 let all=[];
 try{const snap=await getDocs(query(collection(db,'users'),limit(200)));all=snap.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.uid!==me.uid)}catch(e){}
 const draw=()=>{const q=$('pq').value.trim().toLowerCase(),l=all.filter(u=>!blocked.has(u.uid)&&(!q||(u.name||'').toLowerCase().includes(q))),bl=all.filter(u=>blocked.has(u.uid));
  $('pl').innerHTML=(l.length?l.map(u=>'<button class="pr" type="button" data-u="'+esc(u.uid)+'" data-n="'+esc(u.name||'Someone')+'">'+avatar(u).replace('class="pav"','class="pav sm"')+'<span><b>'+esc(u.name||'Someone')+'</b><small>'+esc(u.bio||'')+'</small></span></button>').join(''):'<p class="pb">No one found yet. People show up here after they open TraceBook once.</p>')+(bl.length?'<p class="pb" style="padding-top:12px"><b>Blocked</b></p>'+bl.map(u=>'<div class="pr"><span style="flex:1"><b>'+esc(u.name||'Someone')+'</b></span><button class="btn ub" type="button" data-u="'+esc(u.uid)+'">Unblock</button></div>').join(''):'')};
 draw();$('pq').oninput=draw;
 $('pl').onclick=async e=>{const ub=e.target.closest('.ub');if(ub){try{await deleteDoc(doc(db,'blocks',me.uid+'_'+ub.dataset.u));setTimeout(draw,300)}catch(x){alert('Could not unblock: '+(x.code||x.message))}return}const b=e.target.closest('.pr[data-u]');if(b)startDm(b.dataset.u,b.dataset.n)}}
async function startDm(uid,name){
 const id=[me.uid,uid].sort().join('_'),r=doc(db,'dms',id);
 try{const d=await getDoc(r);
  if(!d.exists())await setDoc(r,{members:[me.uid,uid],names:{[me.uid]:me.displayName||me.email||'Someone',[uid]:name},ts:Date.now()});
  closePm();if(!dms.some(x=>x.id===id))dms.push({id,other:uid,name});open(id,'dm')}
 catch(e){alert('Could not start chat: '+(e.code||e.message))}}
log.addEventListener('click',e=>{
 const c=e.target.closest('.chip');if(c){toggleReact(c.dataset.id,+c.dataset.i);return}
 const a=e.target.closest('.act');if(a){if(a.dataset.a==='reply')startReply(a.dataset.id);else pickReact(a.dataset.id);return}
 const x=e.target.closest('.del');
 if(x){if(confirm('Delete this message?'))deleteDoc(doc(mcol(cur,curKind),x.dataset.id)).catch(z=>alert('Could not delete: '+(z.code||z.message)));return}
 const w=e.target.closest('.who');if(w&&w.dataset.uid)showCard(w.dataset.uid,w.dataset.n)});

onAuthStateChanged(auth,u=>{
 unsubR&&unsubR();unsubM&&unsubM();unsubD&&unsubD();unsubO&&unsubO();unsubB&&unsubB();unsubW&&unsubW();ws='';myWs=[];Object.keys(watch).forEach(k=>{watch[k]();delete watch[k]});unread={};setTitle();blocked=new Set();dms=[];curKind='room';started=Date.now();
 if(u){me=u;prof={};gate.style.display='none';chip();loadProf();start();handleJoin();
  if(matchMedia('(max-width:760px)').matches)app.classList.remove('chatting')}
 else{me=null;rooms=[];cur=null;gate.style.display='flex';$('gp').textContent='Sign in to join the conversation.'}});
