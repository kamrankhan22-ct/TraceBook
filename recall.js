// TraceBook recall.js (study tool), build 2026-10-14 r2
export function initRecall(c){
 const {$,esc,box,db,doc,collection,getDocs,getDoc,setDoc,deleteDoc,toast,closePm,copyText}=c,ME=c.me;
 document.head.insertAdjacentHTML('beforeend','<style>select{font:inherit;color:inherit;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:10px 12px;width:100%}.prow{flex-wrap:wrap}.prow .btn{flex:1 1 auto}.bigs{display:flex;gap:8px}.bigs div{flex:1;text-align:center;border:1px solid var(--line);border-radius:14px;padding:10px 4px;background:var(--paper)}.bigs b{display:block;font:700 32px/1 var(--serif);color:var(--margin)}.bigs span{font-size:12px;color:var(--pencil)}.fcard{border:1px solid var(--line);border-left:5px solid var(--me);border-radius:16px;padding:18px 18px 20px;background:var(--paper);box-shadow:0 14px 26px -20px rgba(23,35,63,.6)}.fcard.ans{border-left-color:#2E7D5B;background:color-mix(in srgb,#2E7D5B 8%,var(--paper))}.flab{font:800 11px var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--pencil);margin-bottom:8px}.ftxt{font:600 24px/1.35 var(--serif);white-space:pre-wrap;overflow-wrap:anywhere}.rates{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.rates button{display:grid;gap:2px;justify-items:center;padding:10px 4px;border-radius:14px;border:1px solid var(--line);background:var(--paper);color:var(--ink);font:700 14px var(--ui);cursor:pointer}.rates button small{font:500 11px var(--ui);color:var(--pencil)}.rates .r0{border-color:var(--margin)}.rates .r3{border-color:#2E7D5B}.sbars{display:flex;gap:6px;align-items:flex-end;height:110px}.sbars div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;height:100%;font-size:11px;color:var(--pencil)}.sbars i{display:block;width:100%;min-height:3px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,var(--me),color-mix(in srgb,var(--me) 55%,var(--paper)))}.crow{display:grid;gap:6px;border-top:1px solid var(--line);padding-top:10px}.crow:first-of-type{border-top:0;padding-top:0}.crow b,.crow span{overflow-wrap:anywhere}</style>');
let decks=[],study={streak:0,best:0,lastDay:'',hist:{},total:0,correct:0},studyLoaded=false,studyTab='today',SS=null,statsDirty=false,prefillA='',deckView='',lastDeck='';
const pend=new Set(),saveT={};
const dayKey=t=>{const d=new Date(t||Date.now());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const rid=()=>Math.random().toString(36).slice(2,10);
const isDue=(c,n)=>(c.reps>0||c.learn)&&c.due<=n;
const isNew=c=>!c.reps&&!c.learn;
const dueN=list=>{const n=Date.now();let k=0;list.forEach(d=>(d.cards||[]).forEach(c=>{if(isDue(c,n))k++}));return k};
const newN=list=>{let k=0;list.forEach(d=>(d.cards||[]).forEach(c=>{if(isNew(c))k++}));return k};
function refreshDue(){const n=dueN(decks),b=$('stn');if(b){b.textContent=n;b.hidden=!n}}
async function loadStudy(force){
 if(studyLoaded&&!force)return;
 try{const s=await getDocs(collection(db,'users',ME().uid,'decks'));
  decks=s.docs.map(d=>({id:d.id,...d.data()}));
  const st=await getDoc(doc(db,'users',ME().uid,'study','stats'));if(st.exists())study={...study,...st.data()};
  studyLoaded=true}catch(e){toast('Could not load your study cards.')}
 refreshDue()}
function queueSave(d){pend.add(d.id);clearTimeout(saveT.x);saveT.x=setTimeout(flushStudy,2500)}
function flushStudy(){
 clearTimeout(saveT.x);if(!ME())return;
 const ids=[...pend];pend.clear();
 ids.forEach(id=>{const d=decks.find(x=>x.id===id);if(d)setDoc(doc(db,'users',ME().uid,'decks',id),{name:d.name,ts:d.ts||Date.now(),cards:d.cards||[]}).catch(()=>toast('Could not save your cards.'))});
 if(statsDirty){statsDirty=false;setDoc(doc(db,'users',ME().uid,'study','stats'),study).catch(()=>{})}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushStudy()});
addEventListener('pagehide',flushStudy);
async function addDeck(name){
 if(decks.length>=30){toast('You can have up to 30 decks.');return null}
 const ref=doc(collection(db,'users',ME().uid,'decks')),d={id:ref.id,name:name.slice(0,40),ts:Date.now(),cards:[]};
 decks.push(d);
 try{await setDoc(ref,{name:d.name,ts:d.ts,cards:[]})}catch(e){decks.pop();toast('Could not create the deck.');return null}
 return d}
function addCard(d,q,a){
 d.cards=d.cards||[];if(d.cards.length>=400){toast('A deck can hold up to 400 cards.');return false}
 d.cards.push({id:rid(),q:q.slice(0,400),a:a.slice(0,500),reps:0,ivl:0,ef:2.5,due:Date.now(),learn:0,lapses:0});
 queueSave(d);refreshDue();return true}
function sched(c,q){
 let reps=c.reps||0,ivl=c.ivl||0,ef=c.ef||2.5;
 if(q===0){c.reps=0;c.learn=1;c.lapses=(c.lapses||0)+1;c.ef=Math.max(1.3,ef-.2);c.ivl=0;c.due=Date.now()+10*60000;return}
 if(q===1){ivl=reps?Math.max(1,Math.round(ivl*1.2)):1;ef=Math.max(1.3,ef-.15)}
 else if(q===2){ivl=!reps?1:reps===1?3:Math.round(ivl*ef)}
 else{ivl=!reps?3:Math.round(Math.max(ivl,1)*ef*1.3)+1;ef+=.15}
 c.reps=reps+1;c.learn=0;c.ivl=ivl;c.ef=ef;c.due=Date.now()+ivl*864e5}
const nextTxt=(c,q)=>{if(q===0)return '10 min';const t={...c};sched(t,q);const d=t.ivl;return d>=60?Math.round(d/30)+' mo':d>=30?'1 mo':d+' d'};
function bumpStats(q){
 const t=dayKey(),y=dayKey(Date.now()-864e5);
 study.total=(study.total||0)+1;if(q>=2)study.correct=(study.correct||0)+1;
 study.hist=study.hist||{};study.hist[t]=(study.hist[t]||0)+1;
 if(study.lastDay!==t){study.streak=study.lastDay===y?(study.streak||0)+1:1;study.lastDay=t}
 study.best=Math.max(study.best||0,study.streak||0);
 const keys=Object.keys(study.hist).sort();while(keys.length>30)delete study.hist[keys.shift()];
 statsDirty=true}
function startSession(deckId){
 const n=Date.now(),rev=[],nw=[];
 (deckId?decks.filter(d=>d.id===deckId):decks).forEach(d=>(d.cards||[]).forEach(c=>{const r={d:d.id,c:c.id};if(isDue(c,n))rev.push(r);else if(isNew(c))nw.push(r)}));
 nw.sort(()=>Math.random()-.5);
 const q=rev.concat(nw.slice(0,20));
 if(!q.length){toast('Nothing to study right now.');return}
 SS={q,i:0,done:0,again:0,correct:0};showStudyCard()}
const getC=r=>{const d=decks.find(x=>x.id===r.d);return{d,c:d&&(d.cards||[]).find(x=>x.id===r.c)}};
function showStudyCard(){
 if(SS.i>=SS.q.length)return finishSession();
 const{d,c}=getC(SS.q[SS.i]);if(!c){SS.i++;return showStudyCard()}
 const B=$('hubc')||$('pc');
 B.innerHTML='<div class="pbar"><i style="width:'+Math.round(SS.i/SS.q.length*100)+'%"></i></div><p class="pb">Card '+(SS.i+1)+' of '+SS.q.length+' \u00b7 '+esc(d.name)+'</p>'
  +'<div class="fcard"><div class="flab">Question</div><div class="ftxt">'+esc(c.q)+'</div></div>'
  +'<label>Try to recall first (optional)<textarea id="srt" rows="3" placeholder="Type what you remember..." style="max-height:none"></textarea></label>'
  +'<button class="btn primary" id="ssh" type="button">Show answer</button><button class="btn" id="sxe" type="button">End session</button>';
 $('sxe').onclick=()=>finishSession();
 $('ssh').onclick=()=>{
  const typed=$('srt').value.trim();
  B.innerHTML='<div class="pbar"><i style="width:'+Math.round(SS.i/SS.q.length*100)+'%"></i></div><p class="pb">Card '+(SS.i+1)+' of '+SS.q.length+' \u00b7 '+esc(d.name)+'</p>'
   +'<div class="fcard"><div class="flab">Question</div><div class="ftxt">'+esc(c.q)+'</div></div>'
   +(typed?'<div class="hcard"><h4>You wrote</h4><div style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(typed)+'</div></div>':'')
   +'<div class="fcard ans"><div class="flab">Answer</div><div class="ftxt">'+esc(c.a)+'</div></div>'
   +'<p class="pb">How well did you remember? Be honest, it helps.</p>'
   +'<div class="rates" id="rts">'+[['Again','r0'],['Hard','r1'],['Good','r2'],['Easy','r3']].map((r,i)=>'<button type="button" class="'+r[1]+'" data-q="'+i+'">'+r[0]+'<small>'+nextTxt(c,i)+'</small></button>').join('')+'</div>';
  $('rts').onclick=e=>{const b=e.target.closest('button');if(b)rateCard(+b.dataset.q)}}}
function rateCard(q){
 const{d,c}=getC(SS.q[SS.i]);if(!c)return;
 sched(c,q);SS.done++;if(q>=2)SS.correct++;
 if(q===0){SS.again++;SS.q.push(SS.q[SS.i])}
 bumpStats(q);queueSave(d);refreshDue();SS.i++;showStudyCard()}
function finishSession(){
 flushStudy();refreshDue();
 const s=SS||{done:0,correct:0,again:0},acc=s.done?Math.round(s.correct/s.done*100):0;
 const B=$('hubc')||$('pc');
 B.innerHTML='<div class="hcard thx"><div class="big">'+(s.done?'\u{1F389}':'\u{1F44B}')+'</div><h4>'+(s.done?'Session complete':'Session ended')+'</h4>'
  +'<div class="bigs" style="width:100%"><div><b>'+s.done+'</b><span>reviewed</span></div><div><b>'+acc+'%</b><span>remembered</span></div><div><b>'+(study.streak||0)+'</b><span>day streak</span></div></div>'
  +'<p class="pb">'+(dueN(decks)?dueN(decks)+' more cards are due.':'Nothing else is due right now.')+'</p><button class="btn primary" id="sdn" type="button">Done</button></div>';
 SS=null;$('sdn').onclick=()=>openStudy('today')}
document.addEventListener('keydown',e=>{
 if(!SS||!$('pm')||$('pm').style.display!=='flex')return;
 const tg=e.target.tagName;
 if($('ssh')&&e.key==='Enter'&&(e.ctrlKey||e.metaKey)){$('ssh').click();return}
 if(tg==='TEXTAREA'||tg==='INPUT')return;
 if($('ssh')&&(e.key===' '||e.key==='Enter')){e.preventDefault();$('ssh').click();return}
 const k=+e.key;if($('rts')&&k>=1&&k<=4)rateCard(k-1)});
const STABS=[['today','Today'],['decks','Decks'],['add','Add cards'],['stats','Stats']];
async function openStudy(tab){
 studyTab=tab||studyTab;
 if(!studyLoaded){$('pc').innerHTML='<p class="pb">Loading your cards...</p>';$('pm').style.display='flex';await loadStudy()}
 SS=null;
 const total=decks.reduce((n,d)=>n+(d.cards||[]).length,0);
 $('pc').innerHTML='<div class="hubw"><div class="hbanner"><button class="hx" id="hx" type="button" aria-label="Close">\u00d7</button><div class="hav"><span class="pav" style="background:linear-gradient(135deg,#2E7D5B,#17402F)">\u{1F9E0}</span></div><div class="hid"><h3>Recall</h3><p>Test yourself. Remember more.</p><div class="hchips"><span>\u{1F4C5} '+dueN(decks)+' due</span><span>\u{1F525} '+(study.streak||0)+' day streak</span><span>\u{1F0CF} '+total+' cards</span></div></div></div>'
  +'<nav class="htabs" role="tablist">'+STABS.map(t=>'<button type="button" role="tab" data-t="'+t[0]+'" class="'+(t[0]===studyTab?'on':'')+'">'+t[1]+'</button>').join('')+'</nav><div class="hbody" id="hubc"></div></div>';
 $('pm').style.display='flex';$('hx').onclick=closePm;
 $('pc').querySelector('.htabs').onclick=e=>{const b=e.target.closest('button');if(b){deckView='';openStudy(b.dataset.t)}};
 refreshDue();
 if(studyTab==='today')studyToday();else if(studyTab==='decks')studyDecks();else if(studyTab==='add')studyAdd();else studyStats()}
function studyToday(){
 const B=box(),due=dueN(decks),nw=Math.min(20,newN(decks));
 B.innerHTML='<div class="hcard"><h4>Today</h4><div class="bigs"><div><b>'+due+'</b><span>to review</span></div><div><b>'+nw+'</b><span>new cards</span></div><div><b>'+(study.streak||0)+'</b><span>day streak</span></div></div>'
  +(due+nw?'<button class="btn primary" id="sgo" type="button">Start studying</button>':(decks.length?'<p class="pb">All done for today. Come back tomorrow! \u{1F389}</p>':''))+'</div>'
  +(decks.length?'<div class="hcard"><h4>By deck</h4>'+decks.map(d=>'<div class="gcard"><div><b>'+esc(d.name)+'</b><small>'+dueN([d])+' due \u00b7 '+newN([d])+' new</small></div><div class="gact"><button class="btn sd" data-d="'+esc(d.id)+'" type="button">Study</button></div></div>').join('')+'</div>'
   :'<div class="hcard"><h4>Start here</h4><p class="pb">Make a deck, then add cards: a question on the front and the answer on the back. Test yourself instead of rereading. This is called active recall.</p><button class="btn primary" id="smk" type="button">Create your first deck</button></div>')
  +'<div class="hcard"><h4>How it works</h4><ul class="tips"><li><b>1</b> Read the question and try to answer from memory</li><li><b>2</b> Show the answer and rate how well you knew it</li><li><b>3</b> Easy cards come back later, hard ones come back sooner</li></ul></div>';
 if($('sgo'))$('sgo').onclick=()=>startSession('');
 if($('smk'))$('smk').onclick=()=>openStudy('add');
 B.onclick=e=>{const b=e.target.closest('.sd');if(b)startSession(b.dataset.d)}}
function studyDecks(){
 const B=box();
 if(deckView){const d=decks.find(x=>x.id===deckView);if(d)return studyDeck(d);deckView=''}
 B.innerHTML='<div class="hcard"><h4>New deck</h4><div class="prow"><input id="ndk" maxlength="40" placeholder="e.g. Biology chapter 4"><button class="btn primary" id="ndb" type="button" style="flex:none">Create</button></div></div>'
  +'<div class="hcard"><h4>Your decks ('+decks.length+')</h4>'+(decks.length?decks.map(d=>'<div class="gcard"><div><b>'+esc(d.name)+'</b><small>'+(d.cards||[]).length+' cards \u00b7 '+dueN([d])+' due</small></div><div class="gact"><button class="btn op" data-d="'+esc(d.id)+'" type="button">Open</button></div></div>').join(''):'<p class="pb">No decks yet.</p>')+'</div>';
 $('ndb').onclick=async()=>{const n=$('ndk').value.trim();if(!n)return;const d=await addDeck(n);if(d){deckView=d.id;openStudy('decks')}};
 B.onclick=e=>{const o=e.target.closest('.op');if(o){deckView=o.dataset.d;openStudy('decks')}}}
function studyDeck(d){
 const B=box(),cs=d.cards||[];
 B.innerHTML='<button class="btn" id="dbk" type="button" style="justify-self:start">\u2190 All decks</button>'
  +'<div class="hcard"><h4>'+esc(d.name)+'</h4><p class="pb">'+cs.length+' cards \u00b7 '+dueN([d])+' due</p><div class="prow"><button class="btn primary" id="dst" type="button">Study this deck</button><button class="btn" id="dcp" type="button">Copy as text</button></div><button class="btn" id="ddel" type="button" style="color:var(--margin)">Delete deck</button></div>'
  +'<div class="hcard"><h4>Add a card</h4><label>Front (question)<textarea id="dq" rows="2" maxlength="400" style="max-height:none"></textarea></label><label>Back (answer)<textarea id="da" rows="2" maxlength="500" style="max-height:none"></textarea></label><button class="btn" id="dadd" type="button">Add card</button></div>'
  +'<div class="hcard"><h4>Cards</h4>'+(cs.length?cs.map(c=>'<div class="crow" data-c="'+esc(c.id)+'"><b>'+esc(c.q)+'</b><span>'+esc(c.a)+'</span><div class="gact"><button class="btn ced" type="button">Edit</button><button class="btn cdl" type="button" style="color:var(--margin)">Delete</button></div></div>').join(''):'<p class="pb">No cards yet.</p>')+'</div>';
 $('dbk').onclick=()=>{deckView='';openStudy('decks')};
 $('dst').onclick=()=>startSession(d.id);
 $('dcp').onclick=()=>copyText(cs.map(c=>c.q.replace(/\n/g,' ')+' :: '+c.a.replace(/\n/g,' ')).join('\n'),'Deck copied. Paste it in a chat to share.');
 $('ddel').onclick=async()=>{if(!confirm('Delete "'+d.name+'" and all its cards?'))return;
  try{await deleteDoc(doc(db,'users',ME().uid,'decks',d.id));decks=decks.filter(x=>x.id!==d.id);deckView='';refreshDue();openStudy('decks')}catch(e){alert('Could not delete: '+(e.code||e.message))}};
 $('dadd').onclick=()=>{const q=$('dq').value.trim(),a=$('da').value.trim();if(!q||!a){toast('Write both the question and the answer.');return}
  if(addCard(d,q,a)){studyDeck(d);refreshDue()}};
 B.onclick=e=>{
  const row=e.target.closest('.crow');if(!row)return;const c=(d.cards||[]).find(x=>x.id===row.dataset.c);if(!c)return;
  if(e.target.closest('.cdl')){d.cards=d.cards.filter(x=>x.id!==c.id);queueSave(d);refreshDue();studyDeck(d);return}
  if(e.target.closest('.ced')){
   row.innerHTML='<textarea class="eq" rows="2" maxlength="400" style="max-height:none"></textarea><textarea class="ea" rows="2" maxlength="500" style="max-height:none"></textarea><div class="gact"><button class="btn esv" type="button">Save</button><button class="btn ecx" type="button">Cancel</button></div>';
   row.querySelector('.eq').value=c.q;row.querySelector('.ea').value=c.a;return}
  if(e.target.closest('.esv')){const q=row.querySelector('.eq').value.trim(),a=row.querySelector('.ea').value.trim();if(!q||!a)return;c.q=q;c.a=a;queueSave(d);studyDeck(d);return}
  if(e.target.closest('.ecx'))studyDeck(d)}}
function studyAdd(){
 const B=box();
 B.innerHTML='<div class="hcard"><h4>New card</h4><label>Deck<select id="adk">'+decks.map(d=>'<option value="'+esc(d.id)+'"'+(d.id===lastDeck?' selected':'')+'>'+esc(d.name)+'</option>').join('')+'<option value="__new"'+(decks.length?'':' selected')+'>+ New deck...</option></select></label>'
  +'<label id="ndw" hidden>New deck name<input id="ndn" maxlength="40" placeholder="e.g. Chemistry"></label>'
  +'<label>Front (question)<textarea id="aq" rows="3" maxlength="400" style="max-height:none"></textarea></label><label>Back (answer)<textarea id="aa" rows="3" maxlength="500" style="max-height:none"></textarea></label><button class="btn primary" id="aad" type="button">Add card</button></div>'
  +'<div class="hcard"><h4>Add many at once</h4><p class="pb">One card per line, like <b>Question :: Answer</b>. You can paste a deck a friend shared.</p><textarea id="abk" rows="5" style="max-height:none" placeholder="Capital of France :: Paris"></textarea><button class="btn" id="abb" type="button">Add all</button></div>';
 const sync=()=>{$('ndw').hidden=$('adk').value!=='__new'};$('adk').onchange=sync;sync();
 if(prefillA){$('aa').value=prefillA;prefillA=''}
 const target=async()=>{if($('adk').value==='__new'){const n=$('ndn').value.trim();if(!n){toast('Name the new deck.');return null}return await addDeck(n)}return decks.find(x=>x.id===$('adk').value)||null};
 $('aad').onclick=async()=>{const q=$('aq').value.trim(),a=$('aa').value.trim();if(!q||!a){toast('Write both the question and the answer.');return}
  const d=await target();if(!d)return;
  if(addCard(d,q,a)){lastDeck=d.id;toast('Card added to '+d.name+'.');openStudy('add')}};
 $('abb').onclick=async()=>{const lines=$('abk').value.split('\n').map(x=>x.trim()).filter(Boolean);
  const pairs=lines.map(l=>{const i=l.indexOf('::');return i>0?[l.slice(0,i).trim(),l.slice(i+2).trim()]:null}).filter(p=>p&&p[0]&&p[1]);
  if(!pairs.length){toast('Use the format Question :: Answer on each line.');return}
  const d=await target();if(!d)return;
  let n=0;pairs.forEach(p=>{if(addCard(d,p[0],p[1]))n++});
  lastDeck=d.id;toast(n+' card'+(n===1?'':'s')+' added to '+d.name+'.');openStudy('add')}}
function studyStats(){
 const B=box(),all=decks.flatMap(d=>d.cards||[]);
 const mastered=all.filter(c=>c.ivl>=21).length,learning=all.filter(c=>(c.reps>0||c.learn)&&!(c.ivl>=21)).length,fresh=all.filter(isNew).length;
 const acc=study.total?Math.round(study.correct/study.total*100):0;
 const days=[];for(let i=6;i>=0;i--){const t=Date.now()-i*864e5;days.push([study.hist&&study.hist[dayKey(t)]||0,new Date(t).toLocaleDateString([],{weekday:'short'}).slice(0,2)])}
 const mx=Math.max(1,...days.map(x=>x[0]));
 const fc=[];for(let i=0;i<7;i++){const s0=new Date();s0.setHours(0,0,0,0);const a=s0.getTime()+i*864e5,b=a+864e5;fc.push([all.filter(c=>(c.reps>0||c.learn)&&(i===0?c.due<b:(c.due>=a&&c.due<b))).length,new Date(a).toLocaleDateString([],{weekday:'short'}).slice(0,2)])}
 const fm=Math.max(1,...fc.map(x=>x[0]));
 const bars=(arr,m)=>'<div class="sbars">'+arr.map(x=>'<div><span>'+x[0]+'</span><i style="height:'+Math.round(x[0]/m*70)+'%"></i><span>'+x[1]+'</span></div>').join('')+'</div>';
 B.innerHTML='<div class="hcard"><h4>Your cards</h4><div class="bigs"><div><b>'+all.length+'</b><span>total</span></div><div><b>'+fresh+'</b><span>new</span></div><div><b>'+learning+'</b><span>learning</span></div><div><b>'+mastered+'</b><span>mastered</span></div></div></div>'
  +'<div class="hcard"><h4>Progress</h4><div class="bigs"><div><b>'+(study.total||0)+'</b><span>reviews</span></div><div><b>'+acc+'%</b><span>remembered</span></div><div><b>'+(study.streak||0)+'</b><span>streak</span></div><div><b>'+(study.best||0)+'</b><span>best</span></div></div></div>'
  +'<div class="hcard"><h4>Reviews, last 7 days</h4>'+bars(days,mx)+'</div>'
  +'<div class="hcard"><h4>Due, next 7 days</h4>'+bars(fc,fm)+'<p class="pb">Mastered means a card comes back after 3 weeks or more.</p></div>'}

 return {open:openStudy,load:loadStudy,flush:flushStudy,prefill:v=>{prefillA=v}};
}
