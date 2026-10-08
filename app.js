import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,getAdditionalUserInfo,GoogleAuthProvider,createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile,signOut,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,addDoc,onSnapshot,query,orderBy,limit,doc,getDoc,setDoc,deleteDoc,getDocs,writeBatch,where} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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
let me=null,rooms=[],cur=null,msgs=[],unsubR=null,unsubM=null,creating=false,dms=[],curKind='room',unsubD=null,unsubO=null;
const mcol=(id,k)=>collection(db,k==='dm'?'dms':'rooms',id,'messages');

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
 a.innerHTML=((prof.pic||me.photoURL)?'<img class="av" alt="" referrerpolicy="no-referrer" src="'+esc(prof.pic||me.photoURL)+'">':'<span class="av" style="background:'+esc(prof.color||'')+'">'+esc(n.charAt(0).toUpperCase())+'</span>')+'<div><b>'+esc(n)+'</b><small>'+esc((prof.mood?prof.mood+' ':'')+(prof.bio||me.email||''))+'</small></div><div class="ab"><button id="pe" type="button">Profile</button><button id="so" type="button">Sign out</button></div>';
 $('so').onclick=async()=>{try{await setDoc(doc(db,'users',me.uid),{lastSeen:0},{merge:true})}catch(e){}signOut(auth)};$('pe').onclick=editProfile}
function renderRooms(){
 const item=(r,k)=>{const on=r.id===cur&&curKind===k,m=on?msgs[msgs.length-1]:null;
  return '<button class="room'+(on?' on':'')+'" data-id="'+r.id+'" data-k="'+k+'"><b><span>'+(k==='dm'?'\u{1F512} ':'')+esc(r.name)+(k==='dm'&&isOn(r.other)?'<span class="dot-on"></span>':'')+'</span><i>'+(m?hm(m.ts):'')+'</i></b><p>'+(m?esc((m.uid===me.uid?'':m.name+': ')+m.text):(k==='dm'?'Private chat':'Shared trace'))+'</p></button>'};
 $('rooms').innerHTML=rooms.map(r=>item(r,'room')).join('')+'<div class="sec">Private chats<button id="np" type="button">+ New</button></div>'+(dms.length?dms.map(r=>item(r,'dm')).join(''):'<p class="pb" style="padding:4px 20px">No private chats yet.</p>')
  +(()=>{const o=Object.keys(seen).filter(u=>u!==me.uid&&isOn(u));
   return '<div class="sec">Online now ('+o.length+')</div>'+(o.length?o.map(u=>'<button class="room onl" data-u="'+esc(u)+'"><span class="dot-on" style="margin:0 8px 0 0"></span>'+esc((pcache[u]||{}).name||'Someone')+'</button>').join(''):'<p class="pb" style="padding:4px 20px">No one else right now.</p>')})()}
const line=(m,n)=>{const mine=m.uid===me.uid;
 return '<div class="msg'+(mine?' me':'')+(n?' new':'')+'"><time>'+hm(m.ts)+'</time><span class="rule"></span><div class="body">'+mav(m)+'<span class="who" data-uid="'+esc(m.uid||'')+'" data-n="'+esc(m.name||'')+'">'+esc(m.name||'Someone')+'</span>'+esc(m.text)+(mine&&m.id?'<button class="del" data-id="'+esc(m.id)+'" aria-label="Delete message" title="Delete">\u00d7</button>':'')+'</div></div>'};
function renderLog(){const r=(curKind==='dm'?dms:rooms).find(x=>x.id===cur);if(!r)return;
 $('dt').hidden=!(curKind==='room'&&r.by&&me&&r.by===me.uid);
 $('rt').textContent=(curKind==='dm'?'\u{1F512} ':'')+r.name;$('rs').textContent=curKind==='dm'?'Private. Only you two can see this.':'Shared with everyone signed in';
 let last='',h=msgs.length?'':'<div class="day">Empty page. Write the first line below.</div>';
 msgs.forEach(m=>{const d=dayLabel(m.ts);if(d!==last){h+='<div class="day">'+d+'</div>';last=d}h+=line(m)});
 const atBottom=log.scrollHeight-log.scrollTop-log.clientHeight<80;
 log.innerHTML=h;if(atBottom)log.scrollTop=log.scrollHeight}
function open(id,k='room'){cur=id;curKind=k;msgs=[];renderRooms();renderLog();app.classList.add('chatting');
 unsubM&&unsubM();
 unsubM=onSnapshot(query(mcol(id,k),orderBy('ts'),limit(200)),snap=>{
  msgs=snap.docs.map(d=>({...d.data(),id:d.id}));renderRooms();renderLog();ensureProfiles(msgs)},()=>{$('rs').textContent='Cannot load messages. Check your Firestore rules.'})}
function start(){
 unsubD=onSnapshot(query(collection(db,'dms'),where('members','array-contains',me.uid)),snap=>{
  dms=snap.docs.map(d=>{const m=d.data(),o=(m.members||[]).find(x=>x!==me.uid);return{id:d.id,other:o,name:(m.names&&m.names[o])||'Someone'}});
  renderRooms();if(curKind==='dm')renderLog()},()=>{});
 unsubO=onSnapshot(query(collection(db,'users'),orderBy('lastSeen','desc'),limit(30)),snap=>{
  snap.docs.forEach(d=>{const x=d.data();seen[d.id]=x.lastSeen||0;pcache[d.id]=x;asked.add(d.id)});
  renderRooms();renderLog()},()=>{});
 unsubR=onSnapshot(query(collection(db,'rooms'),orderBy('ts')),snap=>{
  if(snap.empty){addDoc(collection(db,'rooms'),{name:'General',ts:Date.now()});return}
  rooms=snap.docs.map(d=>({id:d.id,name:d.data().name,by:d.data().by||''}));
  if(curKind==='room'&&!rooms.some(r=>r.id===cur))open(rooms[0].id);else{renderRooms();renderLog()}},()=>{$('rs').textContent='Cannot load traces. Check your Firestore rules.'})}
function send(){const v=t.value.trim();if(!v||!cur)return;
 addDoc(mcol(cur,curKind),{uid:me.uid,name:me.displayName||me.email||'Someone',text:v,ts:Date.now()});
 t.value='';grow();s.disabled=true}
function grow(){t.style.height='auto';t.style.height=Math.min(t.scrollHeight,140)+'px'}
t.addEventListener('input',()=>{s.disabled=!t.value.trim();grow()});
t.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
$('f').addEventListener('submit',e=>{e.preventDefault();send()});
$('rooms').addEventListener('click',e=>{if(e.target.closest('#np')){openPeople();return}const o=e.target.closest('.onl');if(o){showCard(o.dataset.u,'');return}const b=e.target.closest('.room');if(b)open(b.dataset.id,b.dataset.k)});
$('back').addEventListener('click',()=>app.classList.remove('chatting'));
$('nf').addEventListener('submit',e=>{e.preventDefault();const v=$('nr').value.trim();if(!v)return;$('nr').value='';
 addDoc(collection(db,'rooms'),{name:v.slice(0,30),ts:Date.now(),by:me.uid}).then(r=>open(r.id))});
document.querySelector('header.top').insertAdjacentHTML('beforeend','<button id="dt" type="button" hidden>Delete trace</button>');
$('dt').onclick=async()=>{const r=rooms.find(x=>x.id===cur);if(curKind!=='room'||!r||r.by!==me.uid)return;
 if(!confirm('Delete the trace "'+r.name+'" and all its messages? This cannot be undone.'))return;
 $('dt').disabled=true;
 try{const snap=await getDocs(collection(db,'rooms',r.id,'messages'));
  for(let i=0;i<snap.docs.length;i+=400){const b=writeBatch(db);snap.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit()}
  await deleteDoc(doc(db,'rooms',r.id))}
 catch(e){alert('Could not delete: '+(e.code||e.message))}
 $('dt').disabled=false};

/* ---------- profile ---------- */
document.head.insertAdjacentHTML('beforeend','<style>#pm{position:fixed;inset:0;z-index:11;background:rgba(10,15,30,.6);display:none;align-items:center;justify-content:center;padding:20px}#pc{max-width:360px;width:100%;background:var(--paper2);color:var(--ink);border:1px solid var(--line);border-left:4px solid var(--margin);border-radius:4px;padding:24px;display:grid;gap:12px;max-height:100%;overflow:auto}#pc h3{margin:0;font-family:"Cormorant Garamond",Georgia,serif;font-size:28px}#pc label{display:grid;gap:4px;font-size:13px;color:var(--pencil)}.pav{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:28px;font-weight:800;color:#fff;object-fit:cover}.pb{margin:0;line-height:1.5;color:var(--pencil)}.sws{display:flex;gap:10px;flex-wrap:wrap}.sw{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer}.sw.on{border-color:var(--ink)}.prow{display:flex;gap:10px}.prow .btn{flex:1}.who{cursor:pointer}.acct .ab{display:grid;gap:4px;flex:none}.tg{display:flex;gap:6px;flex-wrap:wrap}.tg span{border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-size:13px}.em{display:flex;gap:6px;flex-wrap:wrap}.em button{font-size:20px;border:2px solid transparent;background:var(--paper);border-radius:6px;padding:2px 6px;cursor:pointer}.em button.on{border-color:var(--ink)}#pc a{color:var(--me)}.dot-on{display:inline-block;width:8px;height:8px;border-radius:50%;background:#2E9E5B;margin-left:6px}.mav.on{box-shadow:0 0 0 2px var(--paper),0 0 0 4px #2E9E5B}.mav{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;font:800 12px var(--ui);color:#fff;position:relative;top:-2px}img.mav{display:inline-block}.sec{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 4px;font-size:13px;font-weight:800;color:var(--pencil)}#np{border:1px solid var(--line);background:var(--paper);color:inherit;border-radius:4px;font:inherit;font-size:12px;padding:3px 8px;cursor:pointer}.pr{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:8px 0;color:inherit;font:inherit;cursor:pointer}.pr small{display:block;color:var(--pencil);font-size:12px}.pav.sm{width:36px;height:36px;font-size:16px;flex:none}.pl{max-height:50vh;overflow:auto}#dt{margin-left:auto;border:1px solid var(--line);background:none;color:var(--margin);font:inherit;font-size:13px;padding:6px 10px;border-radius:4px;cursor:pointer}.del{border:0;background:none;color:var(--pencil);font-size:20px;cursor:pointer;margin-left:8px;padding:0 6px;line-height:inherit;opacity:.65}.del:hover{color:var(--margin);opacity:1}</style>');
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
 if(uid===me.uid)return editProfile();
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
  +'<button class="btn" id="pcl" type="button">Close</button>';
 $('pcl').onclick=closePm}
function editProfile(){
 let col=prof.color||COLORS[0],mood=prof.mood||'',pic=prof.pic||'';const n=me.displayName||prof.name||'';
 $('pc').innerHTML='<h3>Your profile</h3><div id="pvw"></div><div class="prow"><button class="btn" id="pup" type="button">Choose photo</button><button class="btn" id="prm" type="button">Remove</button></div><input id="pfile" type="file" accept="image/*" hidden>'
  +'<label>Name<input id="pn" maxlength="30"></label>'
  +'<label>Status<input id="pbio" maxlength="80" placeholder="A few words about you"></label>'
  +'<label>Mood</label><div class="em">'+MOODS.map(m=>'<button type="button" data-m="'+m+'"'+(m===mood?' class="on"':'')+'>'+m+'</button>').join('')+'</div>'
  +'<label>Pronouns<input id="ppr" maxlength="20" placeholder="she/her, he/him, they/them"></label>'
  +'<label>City<input id="pci" maxlength="30" placeholder="Where you are"></label>'
  +'<label>Interests (up to 3, separated by commas)<input id="ptg" maxlength="60" placeholder="music, books, cricket"></label>'
  +'<label>Link (starts with https://)<input id="pli" maxlength="100" placeholder="https://"></label>'
  +'<label style="display:flex;gap:8px;align-items:center"><input id="phd" type="checkbox" style="width:auto"> Hide my online status</label>'
  +'<label>Colour (used when you have no photo)</label><div class="sws">'+COLORS.map(c=>'<button type="button" class="sw'+(c===col?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="Colour"></button>').join('')+'</div>'
  +'<small class="pb">'+esc(me.email||'')+'</small><div class="prow"><button class="btn" id="pcx" type="button">Cancel</button><button class="btn primary" id="psv" type="button">Save</button></div>';
 $('pn').value=n;$('pbio').value=prof.bio||'';$('ppr').value=prof.pronouns||'';$('pci').value=prof.city||'';$('ptg').value=prof.tags||'';$('pli').value=prof.link||'';$('phd').checked=!!prof.hideOnline;
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
 $('pc').querySelector('.sws').onclick=e=>{const b=e.target.closest('.sw');if(!b)return;col=b.dataset.c;
  $('pc').querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b));
  pv()};
 $('pc').querySelector('.em').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  mood=mood===b.dataset.m?'':b.dataset.m;
  $('pc').querySelectorAll('.em button').forEach(x=>x.classList.toggle('on',x.dataset.m===mood))};
 $('pcx').onclick=closePm;
 $('psv').onclick=async()=>{
  const name=$('pn').value.trim()||n||'Someone',bio=$('pbio').value.trim().slice(0,80),
   pronouns=$('ppr').value.trim().slice(0,20),city=$('pci').value.trim().slice(0,30),
   tags=$('ptg').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,3).join(', ').slice(0,60),
   link=$('pli').value.trim();
  if(link&&!safeLink(link)){alert('The link must start with https:// and have no spaces.');return}
  $('psv').disabled=true;
  try{await updateProfile(auth.currentUser,{displayName:name});
   prof={name,bio,color:col,photoURL:me.photoURL||'',pic,mood,pronouns,city,link,tags,hideOnline:$('phd').checked,joined:prof.joined||Date.now()};
   await setDoc(doc(db,'users',me.uid),prof,{merge:true});
   pcache[me.uid]=prof;beat();me=auth.currentUser;chip();closePm();renderRooms();renderLog()}
  catch(e){$('psv').disabled=false;alert('Could not save: '+(e.code||e.message))}}}
async function openPeople(){
 $('pc').innerHTML='<h3>New private chat</h3><input id="pq" placeholder="Search by name"><div id="pl" class="pl"><p class="pb">Loading...</p></div><button class="btn" id="ppx" type="button">Close</button>';
 $('pm').style.display='flex';$('ppx').onclick=closePm;
 let all=[];
 try{const snap=await getDocs(query(collection(db,'users'),limit(200)));all=snap.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.uid!==me.uid)}catch(e){}
 const draw=()=>{const q=$('pq').value.trim().toLowerCase(),l=all.filter(u=>!q||(u.name||'').toLowerCase().includes(q));
  $('pl').innerHTML=l.length?l.map(u=>'<button class="pr" type="button" data-u="'+esc(u.uid)+'" data-n="'+esc(u.name||'Someone')+'">'+avatar(u).replace('class="pav"','class="pav sm"')+'<span><b>'+esc(u.name||'Someone')+'</b><small>'+esc(u.bio||'')+'</small></span></button>').join(''):'<p class="pb">No one found yet. People show up here after they open TraceBook once.</p>'};
 draw();$('pq').oninput=draw;
 $('pl').onclick=e=>{const b=e.target.closest('.pr');if(b)startDm(b.dataset.u,b.dataset.n)}}
async function startDm(uid,name){
 const id=[me.uid,uid].sort().join('_'),r=doc(db,'dms',id);
 try{const d=await getDoc(r);
  if(!d.exists())await setDoc(r,{members:[me.uid,uid],names:{[me.uid]:me.displayName||me.email||'Someone',[uid]:name},ts:Date.now()});
  closePm();if(!dms.some(x=>x.id===id))dms.push({id,other:uid,name});open(id,'dm')}
 catch(e){alert('Could not start chat: '+(e.code||e.message))}}
log.addEventListener('click',e=>{const x=e.target.closest('.del');
 if(x){if(confirm('Delete this message?'))deleteDoc(doc(db,curKind==='dm'?'dms':'rooms',cur,'messages',x.dataset.id)).catch(z=>alert('Could not delete: '+(z.code||z.message)));return}
 const w=e.target.closest('.who');if(w&&w.dataset.uid)showCard(w.dataset.uid,w.dataset.n)});

onAuthStateChanged(auth,u=>{
 unsubR&&unsubR();unsubM&&unsubM();unsubD&&unsubD();unsubO&&unsubO();dms=[];curKind='room';
 if(u){me=u;prof={};gate.style.display='none';chip();loadProf();start();
  if(matchMedia('(max-width:760px)').matches)app.classList.remove('chatting')}
 else{me=null;rooms=[];cur=null;gate.style.display='flex';$('gp').textContent='Sign in to join the conversation.'}});