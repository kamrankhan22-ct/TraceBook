import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithPopup,GoogleAuthProvider,createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile,signOut,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,addDoc,onSnapshot,query,orderBy,limit} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

const $=i=>document.getElementById(i);
const app=$('app'),gate=$('gate'),log=$('log'),t=$('t'),s=$('s');
const hm=ts=>new Date(ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
const esc=x=>{const d=document.createElement('div');d.textContent=x;return d.innerHTML};
const dayLabel=ts=>{const d=new Date(ts),n=new Date(),y=new Date(Date.now()-864e5);
 return d.toDateString()===n.toDateString()?'Today':d.toDateString()===y.toDateString()?'Yesterday':d.toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'})};

const fb=initializeApp(firebaseConfig),auth=getAuth(fb),db=getFirestore(fb);
let me=null,rooms=[],cur=null,msgs=[],unsubR=null,unsubM=null,creating=false;

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

function chip(){const a=$('acct'),n=me.displayName||me.email||'You';
 a.innerHTML=(me.photoURL?'<img class="av" alt="" referrerpolicy="no-referrer" src="'+esc(me.photoURL)+'">':'<span class="av">'+esc(n.charAt(0).toUpperCase())+'</span>')+'<div><b>'+esc(n)+'</b><small>'+esc(me.email||'')+'</small></div><button id="so" type="button">Sign out</button>';
 $('so').onclick=()=>signOut(auth)}
function renderRooms(){
 $('rooms').innerHTML=rooms.map(r=>{const m=r.id===cur?msgs[msgs.length-1]:null;
  return '<button class="room'+(r.id===cur?' on':'')+'" data-id="'+r.id+'"><b><span>'+esc(r.name)+'</span><i>'+(m?hm(m.ts):'')+'</i></b><p>'+(m?esc((m.uid===me.uid?'':m.name+': ')+m.text):'Shared trace')+'</p></button>'}).join('')}
const line=(m,n)=>{const mine=m.uid===me.uid;
 return '<div class="msg'+(mine?' me':'')+(n?' new':'')+'"><time>'+hm(m.ts)+'</time><span class="rule"></span><div class="body"><span class="who">'+esc(m.name||'Someone')+'</span>'+esc(m.text)+'</div></div>'};
function renderLog(){const r=rooms.find(x=>x.id===cur);if(!r)return;
 $('rt').textContent=r.name;$('rs').textContent='Shared with everyone signed in';
 let last='',h=msgs.length?'':'<div class="day">Empty page. Write the first line below.</div>';
 msgs.forEach(m=>{const d=dayLabel(m.ts);if(d!==last){h+='<div class="day">'+d+'</div>';last=d}h+=line(m)});
 log.innerHTML=h;log.scrollTop=log.scrollHeight}
function open(id){cur=id;msgs=[];renderRooms();renderLog();app.classList.add('chatting');
 unsubM&&unsubM();
 unsubM=onSnapshot(query(collection(db,'rooms',id,'messages'),orderBy('ts'),limit(200)),snap=>{
  msgs=snap.docs.map(d=>d.data());renderRooms();renderLog()},()=>{$('rs').textContent='Cannot load messages. Check your Firestore rules.'})}
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

onAuthStateChanged(auth,u=>{
 unsubR&&unsubR();unsubM&&unsubM();
 if(u){me=u;gate.style.display='none';chip();start();
  if(matchMedia('(max-width:760px)').matches)app.classList.remove('chatting')}
 else{me=null;rooms=[];cur=null;gate.style.display='flex';$('gp').textContent='Sign in to join the conversation.'}});