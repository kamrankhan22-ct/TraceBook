// TraceBook team.js (team workspace), build 2026-10-14 r1
export function initTeam(c){
 const {$,esc,box,db,doc,collection,getDoc,updateDoc,addDoc,deleteDoc,onSnapshot,query,orderBy,toast,closePm,copyText}=c,ME=c.me;
 const CSS='.tcd{border:1px solid var(--line);border-left:5px solid var(--me);border-radius:14px;padding:12px;background:var(--paper);display:grid;gap:6px}.tcd.p3{border-left-color:var(--margin)}.tcd.p1{border-left-color:#2E7D5B}.tcd.od .tcm b{color:var(--margin)}.tct{display:flex;justify-content:space-between;gap:8px}.tct b{overflow-wrap:anywhere}.tcm{font-size:12px;color:var(--pencil)}.tca{display:flex;gap:6px;flex-wrap:wrap}.sm{padding:6px 10px!important;font-size:13px!important;border-radius:10px!important;flex:none!important}.nrow{display:grid;gap:4px;border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--paper);text-align:left;color:inherit;font:inherit;cursor:pointer;width:100%}.nrow b{overflow-wrap:anywhere}.nrow small{color:var(--pencil)}.nrow span{color:var(--pencil);font-size:13px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.upd{border:1px solid var(--line);border-left:5px solid var(--margin);border-radius:14px;padding:12px;background:var(--paper);display:grid;gap:6px}.upd.pin{background:color-mix(in srgb,var(--hi) 22%,var(--paper))}.upd p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.mem{display:flex;gap:10px;align-items:center;border-top:1px solid var(--line);padding-top:10px}.mem:first-of-type{border-top:0;padding-top:0}.mem div{flex:1;min-width:0}.mem small{display:block;color:var(--pencil);font-size:12px}.tag{border:1px solid var(--line);border-radius:99px;padding:1px 8px;font-size:11px;font-weight:700;color:var(--pencil)}';
 document.head.insertAdjacentHTML('beforeend','<style>'+CSS+'</style>');
 const STAT=[['todo','To do'],['doing','In progress'],['done','Done']],PRI={1:'Low',2:'Normal',3:'High'};
 let wid='',tab='board',stat='todo',tasks=[],notes=[],ups=[],unsubs=[],P={},editTask='',noteEdit='';
 const wsd=()=>c.wsList().find(x=>x.id===wid);
 const col=s=>collection(db,'workspaces',wid,s);
 const nm=u=>u===ME().uid?'You':((P[u]&&P[u].name)||'Someone');
 const when=ts=>{const d=new Date(ts),t=new Date();return (d.toDateString()===t.toDateString()?'Today':d.toLocaleDateString([],{day:'numeric',month:'short'}))+' '+d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})};
 const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const isOwner=()=>{const w=wsd();return !!w&&w.owner===ME().uid};
 function stop(){unsubs.forEach(u=>{try{u()}catch(e){}});unsubs=[];editTask='';noteEdit=''}
 async function people(){
  const w=wsd();if(!w)return;
  await Promise.all((w.members||[]).map(async u=>{
   const k=c.pget&&c.pget(u);if(k&&k.name){P[u]=k;return}
   if(P[u])return;
   try{const d=await getDoc(doc(db,'users',u));P[u]=d.exists()?d.data():{}}catch(e){P[u]={}}}))}
 async function open(id,t){
  stop();wid=id||wid;tab=t||tab;
  const w=wsd();if(!w){toast('That group was not found.');return}
  $('pc').innerHTML='<p class="pb">Loading...</p>';$('pm').style.display='flex';
  await people();frame();subscribe();paint()}
 function subscribe(){
  unsubs.push(onSnapshot(query(col('tasks'),orderBy('ts')),s=>{tasks=s.docs.map(d=>({id:d.id,...d.data()}));chips();paint()},()=>{}));
  unsubs.push(onSnapshot(query(col('notes'),orderBy('ts','desc')),s=>{notes=s.docs.map(d=>({id:d.id,...d.data()}));paint()},()=>{}));
  unsubs.push(onSnapshot(query(col('updates'),orderBy('ts','desc')),s=>{ups=s.docs.map(d=>({id:d.id,...d.data()}));paint()},()=>{}))}
 function chips(){
  const w=wsd(),el=$('tmc');if(!w||!el)return;
  const open=tasks.filter(t=>t.status!=='done').length;
  el.innerHTML='<span>\u{1F465} '+(w.members||[]).length+' members</span><span>\u2705 '+open+' open tasks</span><span>'+(isOwner()?'Owner':'Member')+'</span>'}
 function frame(){
  const w=wsd(),T=[['board','Board'],['notes','Notes'],['updates','Updates'],['people','People']];
  $('pc').innerHTML='<div class="hubw"><div class="hbanner"><button class="hx" id="hx" type="button" aria-label="Close">\u00d7</button><div class="hav"><span class="pav" style="background:linear-gradient(135deg,#2B4C9B,#17233F)">\u{1F4BC}</span></div><div class="hid"><h3>'+esc(w.name)+'</h3><p>Team workspace</p><div class="hchips" id="tmc"></div></div></div>'
   +'<nav class="htabs" role="tablist">'+T.map(x=>'<button type="button" data-t="'+x[0]+'" class="'+(x[0]===tab?'on':'')+'">'+x[1]+'</button>').join('')+'</nav><div class="hbody" id="hubc"></div></div>';
  $('pm').style.display='flex';$('hx').onclick=()=>{stop();closePm()};
  $('pc').querySelector('.htabs').onclick=e=>{const b=e.target.closest('button');if(b){tab=b.dataset.t;editTask='';noteEdit='';frame();chips();paint()}};
  chips()}
 let drawn='';
 function paint(){
  if(!$('hubc'))return;
  if(drawn!==tab||!$('tklist')&&tab==='board'||!$('nlist')&&tab==='notes'&&!noteEdit||!$('ulist')&&tab==='updates'){drawn=tab;shell()}
  list()}
 function shell(){
  const B=box(),w=wsd();
  if(tab==='board'){
   B.innerHTML='<div class="hcard"><h4>New task</h4><label>Task<input id="tkt" maxlength="100" placeholder="What needs doing?"></label><div class="prow"><label style="flex:1">Assign to<select id="tka"><option value="">Anyone</option>'+(w.members||[]).map(u=>'<option value="'+esc(u)+'">'+esc(nm(u))+'</option>').join('')+'</select></label><label style="flex:1">Due date<input id="tkd" type="date"></label></div><button class="btn primary" id="tkadd" type="button">Add task</button></div>'
    +'<div class="seg" id="tks"></div><div id="tklist" style="display:grid;gap:10px"></div>';
   $('tkadd').onclick=async()=>{const t=$('tkt').value.trim();if(!t)return;
    try{await addDoc(col('tasks'),{title:t,notes:'',status:'todo',assignee:$('tka').value||'',due:$('tkd').value||'',prio:2,by:ME().uid,byName:nm(ME().uid),ts:Date.now()});$('tkt').value='';toast('Task added.')}catch(e){alert('Could not add: '+(e.code||e.message))}};
   $('tks').onclick=e=>{const b=e.target.closest('button');if(b){stat=b.dataset.s;list()}};
   $('tklist').onclick=taskClick}
  else if(tab==='notes'){
   if(noteEdit){noteForm();return}
   B.innerHTML='<button class="btn primary" id="nnew" type="button">+ New note</button><div id="nlist" style="display:grid;gap:10px"></div>';
   $('nnew').onclick=()=>{noteEdit='new';shell()};
   $('nlist').onclick=e=>{const r=e.target.closest('.nrow');if(r){noteEdit=r.dataset.id;shell()}}}
  else if(tab==='updates'){
   B.innerHTML=(isOwner()?'<div class="hcard"><h4>Post an update</h4><textarea id="utx" rows="3" maxlength="500" style="max-height:none" placeholder="Share news with your team"></textarea><label class="chk"><input type="checkbox" id="upin"> Pin to the top</label><button class="btn primary" id="upost" type="button">Post update</button></div>':'<p class="pb">Updates from the group owner show up here.</p>')+'<div id="ulist" style="display:grid;gap:10px"></div>';
   if($('upost'))$('upost').onclick=async()=>{const t=$('utx').value.trim();if(!t)return;
    try{await addDoc(col('updates'),{text:t.slice(0,500),pin:$('upin').checked,by:ME().uid,byName:nm(ME().uid),ts:Date.now()});$('utx').value='';toast('Update posted.')}catch(e){alert('Could not post: '+(e.code||e.message))}};
   $('ulist').onclick=async e=>{const r=e.target.closest('[data-u]');if(!r)return;const u=ups.find(x=>x.id===r.dataset.u);if(!u)return;
    try{if(e.target.closest('.upn'))await updateDoc(doc(db,'workspaces',wid,'updates',u.id),{pin:!u.pin});
     else if(e.target.closest('.udl')){if(confirm('Delete this update?'))await deleteDoc(doc(db,'workspaces',wid,'updates',u.id))}}catch(x){alert('Could not update: '+(x.code||x.message))}}}
  else people_view()}
 function list(){
  if(tab==='board'&&$('tklist')){
   const cnt=s=>tasks.filter(t=>t.status===s).length;
   $('tks').innerHTML=STAT.map(s=>'<button type="button" data-s="'+s[0]+'" class="'+(stat===s[0]?'on':'')+'">'+s[1]+' ('+cnt(s[0])+')</button>').join('');
   const l=tasks.filter(t=>t.status===stat).sort((a,b)=>(b.prio||2)-(a.prio||2)||(a.due||'9999').localeCompare(b.due||'9999'));
   $('tklist').innerHTML=l.length?l.map(card).join(''):'<p class="pb">Nothing here yet.</p>'}
  else if(tab==='notes'&&$('nlist')){
   $('nlist').innerHTML=notes.length?notes.map(n=>'<button type="button" class="nrow" data-id="'+esc(n.id)+'"><b>'+esc(n.title||'Untitled')+'</b><span>'+esc(n.body||'')+'</span><small>Edited by '+esc(nm(n.updBy||n.by))+' \u00b7 '+esc(when(n.upd||n.ts))+'</small></button>').join(''):'<p class="pb">No notes yet. Write meeting notes, plans or links your team needs.</p>'}
  else if(tab==='updates'&&$('ulist')){
   const l=ups.slice().sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.ts-a.ts);
   $('ulist').innerHTML=l.length?l.map(u=>'<div class="upd'+(u.pin?' pin':'')+'" data-u="'+esc(u.id)+'"><div class="tcm"><b>'+(u.pin?'\u{1F4CC} ':'')+esc(nm(u.by))+'</b> \u00b7 '+esc(when(u.ts))+'</div><p>'+esc(u.text)+'</p>'+(isOwner()?'<div class="tca"><button class="btn sm upn" type="button">'+(u.pin?'Unpin':'Pin')+'</button><button class="btn sm udl" type="button" style="color:var(--margin)">Delete</button></div>':'')+'</div>').join(''):'<p class="pb">No updates yet.</p>'}}
 function card(t){
  const od=t.status!=='done'&&t.due&&t.due<today();
  if(editTask===t.id){
   const w=wsd();
   return '<div class="tcd p'+(t.prio||2)+'" data-id="'+esc(t.id)+'"><label>Task<input class="e1" maxlength="100"></label><label>Details<textarea class="e2" rows="3" maxlength="1000" style="max-height:none"></textarea></label><div class="prow"><label style="flex:1">Assign to<select class="e3"><option value="">Anyone</option>'+(w.members||[]).map(u=>'<option value="'+esc(u)+'"'+(u===t.assignee?' selected':'')+'>'+esc(nm(u))+'</option>').join('')+'</select></label><label style="flex:1">Due date<input class="e4" type="date" value="'+esc(t.due||'')+'"></label></div><label>Priority<select class="e5">'+[1,2,3].map(p=>'<option value="'+p+'"'+(p===(t.prio||2)?' selected':'')+'>'+PRI[p]+'</option>').join('')+'</select></label><div class="tca"><button class="btn primary sm" data-a="save" type="button">Save</button><button class="btn sm" data-a="cancel" type="button">Cancel</button><button class="btn sm" data-a="del" type="button" style="color:var(--margin)">Delete</button></div></div>'}
  const idx=STAT.findIndex(s=>s[0]===t.status);
  return '<div class="tcd p'+(t.prio||2)+(od?' od':'')+'" data-id="'+esc(t.id)+'"><div class="tct"><b>'+esc(t.title)+'</b><span class="tag">'+PRI[t.prio||2]+'</span></div>'
   +(t.notes?'<div class="tcm" style="white-space:pre-wrap">'+esc(t.notes)+'</div>':'')
   +'<div class="tcm">'+(t.assignee?'\u{1F464} '+esc(nm(t.assignee)):'\u{1F464} Anyone')+(t.due?' \u00b7 <b>'+(od?'Overdue: ':'Due ')+esc(t.due)+'</b>':'')+'</div>'
   +'<div class="tca">'+(idx>0?'<button class="btn sm" data-a="prev" type="button">\u2190 '+STAT[idx-1][1]+'</button>':'')+(idx<2?'<button class="btn sm" data-a="next" type="button">'+STAT[idx+1][1]+' \u2192</button>':'')+'<button class="btn sm" data-a="edit" type="button">Edit</button></div></div>'}
 async function taskClick(e){
  const b=e.target.closest('[data-a]'),row=e.target.closest('.tcd');if(!b||!row)return;
  const t=tasks.find(x=>x.id===row.dataset.id);if(!t)return;
  const ref=doc(db,'workspaces',wid,'tasks',t.id),a=b.dataset.a,idx=STAT.findIndex(s=>s[0]===t.status);
  try{
   if(a==='prev'||a==='next'){const n=STAT[idx+(a==='next'?1:-1)][0];await updateDoc(ref,{status:n,upd:Date.now()});stat=n;list()}
   else if(a==='edit'){editTask=t.id;list();const r2=$('tklist').querySelector('.tcd[data-id="'+t.id+'"]');if(r2){r2.querySelector('.e1').value=t.title;r2.querySelector('.e2').value=t.notes||''}}
   else if(a==='cancel'){editTask='';list()}
   else if(a==='del'){if(confirm('Delete this task?')){editTask='';await deleteDoc(ref)}}
   else if(a==='save'){const v=x=>row.querySelector(x).value;const title=v('.e1').trim();if(!title)return;
    editTask='';await updateDoc(ref,{title:title.slice(0,100),notes:v('.e2').trim().slice(0,1000),assignee:v('.e3'),due:v('.e4'),prio:+v('.e5'),upd:Date.now()})}
  }catch(x){alert('Could not update: '+(x.code||x.message))}}
 function noteForm(){
  const B=box(),n=noteEdit==='new'?null:notes.find(x=>x.id===noteEdit);
  if(noteEdit!=='new'&&!n){noteEdit='';shell();return}
  const can=!n||n.by===ME().uid||isOwner();
  B.innerHTML='<button class="btn" id="nbk" type="button" style="justify-self:start">\u2190 All notes</button><div class="hcard"><label>Title<input id="nti" maxlength="100" placeholder="Note title"></label><label>Note<textarea id="nbd" rows="10" maxlength="5000" style="max-height:none" placeholder="Write here. Everyone in the group can edit."></textarea></label><div class="prow"><button class="btn primary" id="nsv" type="button">Save note</button>'+(n&&can?'<button class="btn" id="ndl" type="button" style="color:var(--margin)">Delete</button>':'')+'</div>'+(n?'<p class="pb">Created by '+esc(nm(n.by))+'. Last edited by '+esc(nm(n.updBy||n.by))+' \u00b7 '+esc(when(n.upd||n.ts))+'</p>':'')+'</div>';
  if(n){$('nti').value=n.title||'';$('nbd').value=n.body||''}
  $('nbk').onclick=()=>{noteEdit='';shell();list()};
  $('nsv').onclick=async()=>{const title=$('nti').value.trim()||'Untitled',body=$('nbd').value.slice(0,5000);
   try{if(n)await updateDoc(doc(db,'workspaces',wid,'notes',n.id),{title:title.slice(0,100),body,upd:Date.now(),updBy:ME().uid});
    else await addDoc(col('notes'),{title:title.slice(0,100),body,by:ME().uid,byName:nm(ME().uid),ts:Date.now(),upd:Date.now(),updBy:ME().uid});
    toast('Note saved.');noteEdit='';shell();list()}catch(e){alert('Could not save: '+(e.code||e.message))}};
  if($('ndl'))$('ndl').onclick=async()=>{if(!confirm('Delete this note?'))return;
   try{await deleteDoc(doc(db,'workspaces',wid,'notes',n.id));noteEdit='';shell();list()}catch(e){alert('Could not delete: '+(e.code||e.message))}}}
 function people_view(){
  const B=box(),w=wsd(),mem=w.members||[];
  B.innerHTML='<div class="hcard"><h4>People ('+mem.length+')</h4>'+mem.map(u=>{const open=tasks.filter(t=>t.assignee===u&&t.status!=='done').length;return '<div class="mem">'+c.avatar(Object.assign({name:nm(u)},P[u]||{})).replace('class="pav"','class="pav sm"')+'<div><b>'+esc(nm(u))+'</b><small>'+open+' open task'+(open===1?'':'s')+'</small></div>'+(u===w.owner?'<span class="tag">Owner</span>':'')+'</div>'}).join('')+'</div>'
   +'<div class="hcard"><h4>Invite people</h4><label>Invite code<input id="tic" readonly></label><button class="btn" id="tcp" type="button">Copy invite link</button></div>';
  $('tic').value=w.code||'';
  $('tcp').onclick=()=>copyText(location.origin+'/?join='+w.code,'Invite link copied.')}
 return {open,stop,setTab:t=>{tab=t;noteEdit='';shell();list()},state:()=>({tab,tasks,notes,ups,wid}),shell,list,card,people_view,noteForm,frame}
}
