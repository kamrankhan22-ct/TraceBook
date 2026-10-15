// TraceBook iq.js (brain test), build 2026-10-14 r1
export function initIQ(c){
 const {$,esc,box,db,doc,getDoc,setDoc,toast,closePm,copyText}=c,ME=c.me;
 const CSS='.iqo{display:flex;gap:10px;align-items:center;width:100%;text-align:left;padding:13px 14px;border:1px solid var(--line);border-radius:14px;background:var(--paper);color:inherit;font:600 16px var(--ui);cursor:pointer;transition:transform .12s,border-color .12s}.iqo:hover{transform:translateY(-1px);border-color:var(--me)}.iqo b{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--paper2);flex:none;font-size:13px}.iqo.ok{border-color:#2E7D5B;background:color-mix(in srgb,#2E7D5B 12%,var(--paper))}.iqo.bad{border-color:var(--margin);background:color-mix(in srgb,var(--margin) 10%,var(--paper))}.iqq{display:grid;gap:10px}.qbar{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.qbar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#8A5BB5,var(--me))}.qbar.tm i{background:linear-gradient(90deg,#2E7D5B,#C98A1B,var(--margin));transition:width .2s linear}.iqc{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-size:12px;font-weight:700;color:var(--pencil);background:var(--paper)}.iqtxt{font:600 24px/1.35 var(--serif);overflow-wrap:anywhere}.ring{width:132px;height:132px;border-radius:50%;display:grid;place-items:center;margin:0 auto;background:conic-gradient(var(--margin) calc(var(--p)*1%),var(--line) 0)}.ring i{display:grid;place-items:center;width:102px;height:102px;border-radius:50%;background:var(--paper2);font:700 40px var(--serif);font-style:normal}.cbar{display:grid;grid-template-columns:96px 1fr 44px;gap:8px;align-items:center;font-size:13px}.cbar .qbar{height:10px}.rvq{display:grid;gap:8px;border-top:1px solid var(--line);padding-top:12px}.rvq:first-of-type{border-top:0;padding-top:0}.rvq small{color:var(--pencil)}';
 document.head.insertAdjacentHTML('beforeend','<style>'+CSS+'</style>');
 const CATS={num:'Numbers',ver:'Words',odd:'Odd one out',log:'Logic',qua:'Maths',pat:'Patterns'};
 const B=(c,d,q,a,w,e)=>({c,d,q,a,w,e});
 const BANK=[
  B('num',1,'2, 4, 8, 16, ?','32',['24','30','20'],'Each number doubles.'),
  B('num',1,'5, 10, 15, 20, ?','25',['30','22','35'],'Add 5 each time.'),
  B('num',2,'1, 4, 9, 16, 25, ?','36',['30','49','32'],'These are square numbers: 6 x 6 = 36.'),
  B('num',2,'3, 6, 11, 18, ?','27',['24','26','30'],'The gaps grow by 2: +3, +5, +7, +9.'),
  B('num',2,'100, 91, 82, 73, ?','64',['66','63','60'],'Subtract 9 each time.'),
  B('num',3,'2, 6, 12, 20, 30, ?','42',['40','36','44'],'The gaps grow: +4, +6, +8, +10, +12.'),
  B('num',3,'4, 9, 19, 39, ?','79',['59','78','69'],'Double and add 1: 39 x 2 + 1 = 79.'),
  B('num',3,'1, 1, 2, 3, 5, 8, ?','13',['11','12','15'],'Fibonacci: add the last two numbers.'),
  B('ver',1,'Bird is to nest as bee is to ?','hive',['honey','flower','sting'],'A nest is where a bird lives. A hive is where bees live.'),
  B('ver',1,'Pen is to write as knife is to ?','cut',['sharp','kitchen','steel'],'A pen is used to write. A knife is used to cut.'),
  B('ver',1,'Day is to night as light is to ?','dark',['lamp','sun','bright'],'They are opposites.'),
  B('ver',2,'Finger is to hand as toe is to ?','foot',['shoe','leg','nail'],'A finger is part of a hand. A toe is part of a foot.'),
  B('ver',2,'Doctor is to hospital as teacher is to ?','school',['student','book','class'],'It is the place where each person works.'),
  B('ver',2,'Cow is to calf as dog is to ?','puppy',['kitten','cub','lamb'],'A young cow is a calf. A young dog is a puppy.'),
  B('ver',3,'Which word means the OPPOSITE of "scarce"?','plentiful',['rare','tiny','costly'],'Scarce means hard to find. Plentiful means there is lots of it.'),
  B('ver',3,'Which word is closest in meaning to "reluctant"?','unwilling',['eager','careful','tired'],'Reluctant means not wanting to do something.'),
  B('odd',1,'Which one does not belong? Apple, Banana, Carrot, Mango','Carrot',['Apple','Banana','Mango'],'Carrot is a vegetable. The others are fruits.'),
  B('odd',1,'Which one does not belong? Delhi, Mumbai, Chennai, Nepal','Nepal',['Delhi','Mumbai','Chennai'],'Nepal is a country. The others are Indian cities.'),
  B('odd',2,'Which one does not belong? Sparrow, Eagle, Parrot, Bat','Bat',['Sparrow','Eagle','Parrot'],'A bat is a mammal. The others are birds.'),
  B('odd',2,'Which one does not belong? Triangle, Square, Circle, Cube','Cube',['Triangle','Square','Circle'],'A cube is 3D. The others are flat shapes.'),
  B('odd',2,'Which one does not belong? Mercury, Venus, Moon, Mars','Moon',['Mercury','Venus','Mars'],'The Moon is not a planet.'),
  B('odd',3,'Which one does not belong? 16, 25, 36, 48','48',['16','25','36'],'16, 25 and 36 are square numbers. 48 is not.'),
  B('odd',3,'Which one does not belong? 3, 7, 9, 11','9',['3','7','11'],'3, 7 and 11 are prime numbers. 9 is 3 x 3.'),
  B('odd',3,'Which one does not belong? January, March, June, July','June',['January','March','July'],'June has 30 days. The others have 31.'),
  B('log',1,'A is taller than B. B is taller than C. Who is the shortest?','C',['A','B','Cannot tell'],'A > B > C, so C is the shortest.'),
  B('log',1,'How many months of the year have at least 28 days?','12',['1','2','6'],'Every month has at least 28 days.'),
  B('log',2,'Today is Wednesday. What day will it be 10 days from now?','Saturday',['Friday','Sunday','Thursday'],'10 days is 1 week and 3 days. Wednesday plus 3 days is Saturday.'),
  B('log',2,'Ravi is older than Sam. Sam is older than Tina. Tina is older than Uma. Who is the second oldest?','Sam',['Ravi','Tina','Uma'],'The order from oldest is Ravi, Sam, Tina, Uma.'),
  B('log',2,'If 5 machines make 5 items in 5 minutes, how long do 100 machines take to make 100 items?','5 minutes',['100 minutes','20 minutes','1 minute'],'Each machine makes 1 item in 5 minutes, so 100 machines make 100 items in 5 minutes.'),
  B('log',3,'A bat and a ball cost Rs 110 together. The bat costs Rs 100 more than the ball. How much is the ball?','Rs 5',['Rs 10','Rs 15','Rs 1'],'If the ball is Rs 5, the bat is Rs 105. Together that is Rs 110.'),
  B('log',3,'All roses are flowers. Some flowers fade quickly. Which statement MUST be true?','Roses are flowers',['All roses fade quickly','No roses fade quickly','Some roses fade quickly'],'Only the first statement is certain. We do not know which flowers fade quickly.'),
  B('log',3,'The clock shows 3:15. What is the angle between the two hands?','7.5 degrees',['0 degrees','15 degrees','30 degrees'],'The minute hand is at 90 degrees. The hour hand is at 97.5 degrees. The gap is 7.5 degrees.'),
  B('qua',1,'What is 15% of 240?','36',['24','30','40'],'10% is 24 and 5% is 12, so 15% is 36.'),
  B('qua',1,'What is the average of 12, 18 and 30?','20',['18','24','22'],'(12 + 18 + 30) / 3 = 60 / 3 = 20.'),
  B('qua',1,'If 3x + 7 = 28, what is x?','7',['6','8','9'],'3x = 21, so x = 7.'),
  B('qua',2,'A car goes 60 km every hour. How far does it go in 45 minutes?','45 km',['40 km','50 km','30 km'],'45 minutes is three quarters of an hour. 60 x 0.75 = 45.'),
  B('qua',2,'What is the next prime number after 23?','29',['25','27','31'],'25 and 27 can be divided by smaller numbers. 29 is prime.'),
  B('qua',2,'What is the least common multiple of 4 and 6?','12',['24','10','8'],'12 is the smallest number that both 4 and 6 divide into.'),
  B('qua',3,'A shirt price rises by 20%, then falls by 20%. Compared with the start, the price is:','4% lower',['the same','4% higher','20% lower'],'100 becomes 120, then 120 x 0.8 = 96. That is 4% lower.'),
  B('qua',3,'How many different 2-digit numbers can you make from the digits 1, 2 and 3 if no digit repeats?','6',['9','3','8'],'There are 3 choices for the first digit and 2 for the second: 3 x 2 = 6.'),
  B('pat',1,'A, C, E, G, ?','I',['H','J','K'],'Skip one letter each time.'),
  B('pat',1,'Monday, Wednesday, Friday, ?','Sunday',['Saturday','Tuesday','Monday'],'Skip one day each time.'),
  B('pat',2,'B, E, H, K, ?','N',['M','O','L'],'Move forward 3 letters each time.'),
  B('pat',2,'AZ, BY, CX, ?','DW',['DV','EW','CW'],'The first letter goes forward and the second letter goes backward.'),
  B('pat',2,'2, 4, 3, 6, 5, 10, ?','9',['8','11','12'],'The pattern is double, then subtract 1.'),
  B('pat',3,'A, C, F, J, ?','O',['N','M','P'],'The jumps grow by 1: +2, +3, +4, +5.'),
  B('pat',3,'Z, X, U, Q, ?','L',['M','N','K'],'Going backward with growing jumps: -2, -3, -4, -5.'),
  B('pat',3,'J, F, M, A, M, ?','J',['A','S','O'],'These are the first letters of the months: January to June.')
 ];
 const PLAN={num:4,ver:3,odd:2,log:2,qua:2,pat:2},SEC=45;
 const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 let data={best:0,attempts:0,history:[]},loaded=false,tab='test',run=null,tick=null;
 async function load(){
  if(loaded)return;
  try{const s=await getDoc(doc(db,'users',ME().uid,'study','iq'));if(s.exists())data={...data,...s.data()}}catch(e){}
  loaded=true}
 function save(){setDoc(doc(db,'users',ME().uid,'study','iq'),data).catch(()=>toast('Could not save your result.'))}
 const level=p=>p<30?'Just warming up':p<50?'Solid thinker':p<70?'Sharp mind':p<85?'Brilliant':'Puzzle master';
 const NOTE='This is a fun puzzle game. It cannot measure your real IQ. A real IQ test is given by a trained psychologist and compares you with thousands of people.';
 function stop(){if(tick){clearInterval(tick);tick=null}}
 async function open(t){
  tab=t||tab;stop();
  if(!loaded){$('pc').innerHTML='<p class="pb">Loading...</p>';$('pm').style.display='flex';await load()}
  run=null;
  $('pc').innerHTML='<div class="hubw"><div class="hbanner"><button class="hx" id="hx" type="button" aria-label="Close">\u00d7</button><div class="hav"><span class="pav" style="background:linear-gradient(135deg,#8A5BB5,#3F2A5C)">\u{1F9E9}</span></div><div class="hid"><h3>Brain Test</h3><p>15 quick puzzles. Just for fun.</p><div class="hchips"><span>\u{1F3C6} Best '+(data.best||0)+'</span><span>\u{1F4DD} '+(data.attempts||0)+' tries</span></div></div></div>'
   +'<nav class="htabs" role="tablist"><button type="button" data-t="test" class="'+(tab==='test'?'on':'')+'">Test</button><button type="button" data-t="history" class="'+(tab==='history'?'on':'')+'">My results</button></nav><div class="hbody" id="hubc"></div></div>';
  $('pm').style.display='flex';$('hx').onclick=()=>{stop();closePm()};
  $('pc').querySelector('.htabs').onclick=e=>{const b=e.target.closest('button');if(b)open(b.dataset.t)};
  if(tab==='history')history();else intro()}
 function intro(){
  const Bx=box();
  Bx.innerHTML='<div class="hcard"><h4>How it works</h4><ul class="tips"><li><b>15</b> questions on numbers, words, logic, patterns and maths</li><li><b>45 s</b> for each question</li><li><b>1</b> Pick the best answer. You cannot go back.</li></ul><button class="btn primary" id="iqs" type="button">Start the test</button></div>'
   +'<div class="hcard"><h4>Please note</h4><p class="pb">'+NOTE+'</p></div>';
  $('iqs').onclick=start}
 function pick(){
  let qs=[];
  Object.keys(PLAN).forEach(k=>{
   const pool=BANK.filter(q=>q.c===k),easy=shuffle(pool.filter(q=>q.d===1)),mid=shuffle(pool.filter(q=>q.d===2)),hard=shuffle(pool.filter(q=>q.d===3));
   const order=[easy[0],mid[0],hard[0],mid[1],hard[1],easy[1],mid[2],hard[2]].filter(Boolean);
   qs=qs.concat(order.slice(0,PLAN[k]))});
  qs=shuffle(qs).sort((a,b)=>a.d-b.d);
  return qs.map(q=>{const opts=shuffle([q.a].concat(q.w));return{...q,opts,ans:opts.indexOf(q.a),pick:-1}})}
 function start(){run={qs:pick(),i:0,t0:0};show()}
 function show(){
  stop();
  if(run.i>=run.qs.length)return finish();
  const q=run.qs[run.i],Bx=box();
  Bx.innerHTML='<div class="iqq"><div class="qbar"><i style="width:'+Math.round(run.i/run.qs.length*100)+'%"></i></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="iqc">'+esc(CATS[q.c])+'</span><span class="pb">Question '+(run.i+1)+' of '+run.qs.length+'</span></div><div class="qbar tm"><i id="iqt" style="width:100%"></i></div>'
   +'<div class="fcard"><div class="iqtxt">'+esc(q.q)+'</div></div>'
   +'<div class="iqq" id="iqo">'+q.opts.map((o,i)=>'<button type="button" class="iqo" data-i="'+i+'"><b>'+'ABCD'[i]+'</b>'+esc(o)+'</button>').join('')+'</div></div>';
  run.t0=Date.now();
  const done=pk=>{stop();q.pick=pk;run.i++;setTimeout(show,200)};
  $('iqo').onclick=e=>{const b=e.target.closest('.iqo');if(b)done(+b.dataset.i)};
  tick=setInterval(()=>{
   const bar=$('iqt');if(!bar||!run){stop();return}
   const left=Math.max(0,1-(Date.now()-run.t0)/(SEC*1000));
   bar.style.width=Math.round(left*100)+'%';
   if(left<=0)done(-1)},200)}
 function finish(){
  stop();
  const qs=run.qs,w={1:1,2:2,3:3};let got=0,tot=0,right=0;const cat={};
  qs.forEach(q=>{const ok=q.pick===q.ans;tot+=w[q.d];if(ok){got+=w[q.d];right++}
   const k=cat[q.c]||(cat[q.c]={r:0,n:0});k.n++;if(ok)k.r++});
  const score=Math.round(got/tot*100);
  data.attempts=(data.attempts||0)+1;data.best=Math.max(data.best||0,score);
  data.history=[{ts:Date.now(),score,right,total:qs.length,cats:Object.fromEntries(Object.keys(cat).map(k=>[k,cat[k].r+'/'+cat[k].n]))}].concat(data.history||[]).slice(0,10);
  save();
  run.score=score;run.right=right;run.cat=cat;
  result()}
 function result(){
  const Bx=box(),s=run.score,lv=level(s);
  Bx.innerHTML='<div class="hcard thx" style="justify-items:stretch"><div class="ring" style="--p:'+s+'"><i>'+s+'</i></div><h4 style="text-align:center;font-size:26px">'+esc(lv)+'</h4><p class="pb" style="text-align:center">You got '+run.right+' of '+run.qs.length+' right. Score out of 100.</p></div>'
   +'<div class="hcard"><h4>By skill</h4>'+Object.keys(run.cat).map(k=>{const x=run.cat[k];return '<div class="cbar"><span>'+esc(CATS[k])+'</span><div class="qbar"><i style="width:'+Math.round(x.r/x.n*100)+'%"></i></div><b>'+x.r+'/'+x.n+'</b></div>'}).join('')+'</div>'
   +'<div class="prow"><button class="btn" id="iqr" type="button">Review answers</button><button class="btn" id="iqc" type="button">Copy my result</button><button class="btn primary" id="iqa" type="button">Try again</button></div>'
   +'<p class="pb">'+NOTE+'</p>';
  $('iqr').onclick=review;$('iqa').onclick=()=>open('test');
  $('iqc').onclick=()=>copyText('I scored '+s+'/100 ('+lv+') on the TraceBook Brain Test. It is just a fun puzzle game. Try it and beat me!','Result copied. Paste it in a chat.')}
 function review(){
  const Bx=box();
  Bx.innerHTML='<button class="btn" id="iqb2" type="button" style="justify-self:start">\u2190 Back to result</button>'
   +'<div class="hcard">'+run.qs.map((q,n)=>'<div class="rvq"><span class="iqc">'+(n+1)+'. '+esc(CATS[q.c])+'</span><div class="iqtxt" style="font-size:19px">'+esc(q.q)+'</div>'
    +q.opts.map((o,i)=>'<div class="iqo '+(i===q.ans?'ok':(i===q.pick?'bad':''))+'" style="cursor:default"><b>'+'ABCD'[i]+'</b>'+esc(o)+(i===q.ans?' \u2713':'')+(i===q.pick&&i!==q.ans?' (your answer)':'')+'</div>').join('')
    +(q.pick===-1?'<small>You ran out of time.</small>':'')+'<small>'+esc(q.e)+'</small></div>').join('')+'</div>';
  $('iqb2').onclick=result}
 function history(){
  const Bx=box(),h=data.history||[];
  Bx.innerHTML='<div class="hcard"><h4>Your best</h4><div class="bigs"><div><b>'+(data.best||0)+'</b><span>best score</span></div><div><b>'+(data.attempts||0)+'</b><span>tries</span></div></div></div>'
   +'<div class="hcard"><h4>Recent tries</h4>'+(h.length?h.map(x=>'<div class="gcard"><div><b>'+x.score+' / 100</b><small>'+esc(level(x.score))+' \u00b7 '+x.right+' of '+x.total+' right</small></div><div class="pb" style="font-size:12px">'+esc(new Date(x.ts).toLocaleDateString([],{day:'numeric',month:'short'}))+'</div></div>').join(''):'<p class="pb">No tries yet. Take the test to see your results here.</p>')+'</div>'
   +'<div class="hcard"><h4>Please note</h4><p class="pb">'+NOTE+'</p></div>'}
 return {open,load,bank:()=>BANK,plan:()=>PLAN,state:()=>({run,data}),start,show,finish,review,result,history,intro}
}
