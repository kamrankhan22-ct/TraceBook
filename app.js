import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithPopup,GoogleAuthProvider,createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile,signOut,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,addDoc,onSnapshot,query,orderBy,limit,doc,getDoc,setDoc,deleteDoc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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
let me=null,rooms=[],cur=null,msgs=[],unsubR=null,unsubM=null,creating=false;

/* ---------- sign in ---------- */
const err=m=>{$('ger').textContent=m||''};
const friendly=e=>({
 'auth/invalid-credential':'Email or password is wrong.','auth/wrong-password':'Email or password is wrong.',
 'auth/user-not-found':'No account with that email. Choose Create an account.','auth/email-already-in-use':'That email already has an account. Sign in instead.',
 'auth/weak-password':'Use a password with at least 6 characters.','auth/popup-closed-by-user':'Google sign-in was closed before it finished.',
 'auth/unauthorized-domain':'Add this site to Authentication > Settings > Authorized domains in Firebase.','auth/invalid-email':'Enter a valid email address.'
}[e.code]||'Something went wrong ('+(e.code||'unknown')+').');
$('gg').onclick=()=>{err();signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>err(friendly(e)))};
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
 $('so').onclick=()=>signOut(auth);$('pe').onclick=editProfile}
function renderRooms(){
 $('rooms').innerHTML=rooms.map(r=>{const m=r.id===cur?msgs[msgs.length-1]:null;
  return '<button class="room'+(r.id===cur?' on':'')+'" data-id="'+r.id+'"><b><span>'+esc(r.name)+'</span><i>'+(m?hm(m.ts):'')+'</i></b><p>'+(m?esc((m.uid===me.uid?'':m.name+': ')+m.text):'Shared trace')+'</p></button>'}).join('')}
const line=(m,n)=>{const mine=m.uid===me.uid;
 return '<div class="msg'+(mine?' me':'')+(n?' new':'')+'"><time>'+hm(m.ts)+'</time><span class="rule"></span><div class="body"><span class="who" data-uid="'+esc(m.uid||'')+'" data-n="'+esc(m.name||'')+'">'+esc(m.name||'Someone')+'</span>'+esc(m.text)+(mine&&m.id?'<button class="del" data-id="'+esc(m.id)+'" aria-label="Delete message" title="Delete">\u00d7</button>':'')+'</div></div>'};
function renderLog(){const r=rooms.find(x=>x.id===cur);if(!r)return;
 $('rt').textContent=r.name;$('rs').textContent='Shared with everyone signed in';
 let last='',h=msgs.length?'':'<div class="day">Empty page. Write the first line below.</div>';
 msgs.forEach(m=>{const d=dayLabel(m.ts);if(d!==last){h+='<div class="day">'+d+'</div>';last=d}h+=line(m)});
 log.innerHTML=h;log.scrollTop=log.scrollHeight}
function open(id){cur=id;msgs=[];renderRooms();renderLog();app.classList.add('chatting');
 unsubM&&unsubM();
 unsubM=onSnapshot(query(collection(db,'rooms',id,'messages'),orderBy('ts'),limit(200)),snap=>{
  msgs=snap.docs.map(d=>({...d.data(),id:d.id}));renderRooms();renderLog()},()=>{$('rs').textContent='Cannot load messages. Check your Firestore rules.'})}
function start(){
 unsubR=onSnapshot(query(collection(db,'rooms'),orderBy('ts')),snap=>{
  if(snap.empty){addDoc(collection(db,'rooms'),{name:'General',ts:Date.now()});return}
  rooms=snap.docs.map(d=>({id:d.id,name:d.data().name}));
  if(!rooms.some(r=>r.id===cur))open(rooms[0].id);else{renderRooms();renderLog()}},()=>{$('rs').textContent='Cannot load traces. Check your Firestore rules.'})}
function send(){const v=t.value.trim();if(!v||!cur)return;
 addDoc(collection(db,'rooms',cur,'messages'),{uid:me.uid,name:me.displayName||me.email||'Someone',text:v,ts:Date.now()});
 t.value='';grow();s.disabled=true}
function grow(){t.style.height='auto';t.style.height=Math.min(t.scrollHeight,140)+'px'}
t.addEventListener('input',()=>{s.disabled=!t.value.trim();grow()});
t.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
$('f').addEventListener('submit',e=>{e.preventDefault();send()});
$('rooms').addEventListener('click',e=>{const b=e.target.closest('.room');if(b)open(b.dataset.id)});
$('back').addEventListener('click',()=>app.classList.remove('chatting'));
$('nf').addEventListener('submit',e=>{e.preventDefault();const v=$('nr').value.trim();if(!v)return;$('nr').value='';
 addDoc(collection(db,'rooms'),{name:v.slice(0,30),ts:Date.now()}).then(r=>open(r.id))});

/* ---------- profile ---------- */
document.head.insertAdjacentHTML('beforeend','<style>#pm{position:fixed;inset:0;z-index:11;background:rgba(10,15,30,.6);display:none;align-items:center;justify-content:center;padding:20px}#pc{max-width:360px;width:100%;background:var(--paper2);color:var(--ink);border:1px solid var(--line);border-left:4px solid var(--margin);border-radius:4px;padding:24px;display:grid;gap:12px;max-height:100%;overflow:auto}#pc h3{margin:0;font-family:"Cormorant Garamond",Georgia,serif;font-size:28px}#pc label{display:grid;gap:4px;font-size:13px;color:var(--pencil)}.pav{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:28px;font-weight:800;color:#fff;object-fit:cover}.pb{margin:0;line-height:1.5;color:var(--pencil)}.sws{display:flex;gap:10px;flex-wrap:wrap}.sw{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer}.sw.on{border-color:var(--ink)}.prow{display:flex;gap:10px}.prow .btn{flex:1}.who{cursor:pointer}.acct .ab{display:grid;gap:4px;flex:none}.tg{display:flex;gap:6px;flex-wrap:wrap}.tg span{border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-size:13px}.em{display:flex;gap:6px;flex-wrap:wrap}.em button{font-size:20px;border:2px solid transparent;background:var(--paper);border-radius:6px;padding:2px 6px;cursor:pointer}.em button.on{border-color:var(--ink)}#pc a{color:var(--me)}.del{border:0;background:none;color:var(--pencil);font-size:20px;cursor:pointer;margin-left:8px;padding:0 6px;line-height:inherit;opacity:.65}.del:hover{color:var(--margin);opacity:1}</style>');
document.body.insertAdjacentHTML('beforeend','<div id="pm" role="dialog" aria-label="Profile"><div id="pc"></div></div>');
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
 chip()}
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
  +'<label>Colour (used when you have no photo)</label><div class="sws">'+COLORS.map(c=>'<button type="button" class="sw'+(c===col?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="Colour"></button>').join('')+'</div>'
  +'<small class="pb">'+esc(me.email||'')+'</small><div class="prow"><button class="btn" id="pcx" type="button">Cancel</button><button class="btn primary" id="psv" type="button">Save</button></div>';
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
   prof={name,bio,color:col,photoURL:me.photoURL||'',pic,mood,pronouns,city,link,tags,joined:prof.joined||Date.now()};
   await setDoc(doc(db,'users',me.uid),prof);
   me=auth.currentUser;chip();closePm();renderRooms();renderLog()}
  catch(e){$('psv').disabled=false;alert('Could not save: '+(e.code||e.message))}}}
log.addEventListener('click',e=>{const x=e.target.closest('.del');
 if(x){if(confirm('Delete this message?'))deleteDoc(doc(db,'rooms',cur,'messages',x.dataset.id)).catch(z=>alert('Could not delete: '+(z.code||z.message)));return}
 const w=e.target.closest('.who');if(w&&w.dataset.uid)showCard(w.dataset.uid,w.dataset.n)});

onAuthStateChanged(auth,u=>{
 unsubR&&unsubR();unsubM&&unsubM();
 if(u){me=u;prof={};gate.style.display='none';chip();loadProf();start();
  if(matchMedia('(max-width:760px)').matches)app.classList.remove('chatting')}
 else{me=null;rooms=[];cur=null;gate.style.display='flex';$('gp').textContent='Sign in to join the conversation.'}});