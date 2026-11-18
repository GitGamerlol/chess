const $=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const IC={flip:'<path d="M7 4v14M3 14l4 4 4-4M17 20V6m-4 4 4-4 4 4"/>',undo:'<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',plus:'<path d="M12 5v14M5 12h14"/>',set:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',snd:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>'};
const ic=n=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const TH={green:['#eeeed2','#769656'],brown:['#f0d9b5','#b58863'],blue:['#dee3e6','#8ca2ad'],purple:['#efefef','#8877b7']};
const PS=['cburnett','merida','alpha','cardinal','staunty','pixel'];
let set={theme:'green',piece:'cburnett',snd:1,hint:1,coord:1,auto:1};try{Object.assign(set,JSON.parse(localStorage.cs))}catch(e){}
const save=()=>{try{localStorage.cs=JSON.stringify(set)}catch(e){}},g={mode:'standard',vs:'bot',side:'w',lvl:2};
let S,H,SAN,sel=-1,L=[],last,over,pl='w',flip=0,busy=0,chk=0;
const U=()=>`https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece/${set.piece}/`;
// sound
let ac;const snd=(f,d,ty='sine',v=.3,t0=0)=>{if(!set.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),k=ac.createGain(),n=ac.currentTime+t0;o.type=ty;o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(f/2,n+d);k.gain.setValueAtTime(v,n);k.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(k).connect(ac.destination);o.start(n);o.stop(n+d)}catch(e){}};
const sfx={sel:()=>snd(800,.05,'sine',.1),move:()=>{snd(240,.09,'triangle',.5);snd(480,.04,'sine',.12)},cap:()=>{snd(190,.14,'triangle',.6);snd(900,.05,'square',.07)},boom:()=>{snd(90,.45,'sawtooth',.4);snd(160,.3,'triangle',.5)},chk:()=>{snd(660,.12,'sine',.3);snd(880,.18,'sine',.3,.1)},end:()=>[523,659,784].forEach((f,i)=>snd(f,.5,'sine',.25,i*.12))};
function theme(){const r=document.documentElement.style;r.setProperty('--l',TH[set.theme][0]);r.setProperty('--d',TH[set.theme][1])}
function modal(t,rows,ok,fn){const m=$('div','mo'),c=$('div','card',`<h2>${t}</h2>`);rows.forEach(([l,e])=>{const r=$('div','row',l?`<label>${l}</label>`:'');r.append(e);c.append(r)});
if(ok){const b=$('button','btn g',ok);b.onclick=()=>{m.remove();fn&&fn()};c.append(b)}m.onclick=e=>e.target==m&&m.remove();m.append(c);document.body.append(m);return m}
function seg(o,k,a,cb){const d=$('div','seg');a.forEach(([v,l])=>{const b=$('button',o[k]==v?'on':'',l);b.onclick=()=>{o[k]=v;[...d.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');sfx.sel();cb&&cb()};d.append(b)});return d}
const OO=[[1,'On'],[0,'Off']],chg=()=>{save();theme();draw()};
function settings(){const s=$('select');PS.forEach(p=>s.add(new Option(p,p,0,p==set.piece)));s.onchange=()=>{set.piece=s.value;chg()};
modal('Settings',[['Board',seg(set,'theme',Object.keys(TH).map(k=>[k,k[0].toUpperCase()+k.slice(1)]),chg)],['Pieces',s],['Sound',seg(set,'snd',OO,save)],['Move hints',seg(set,'hint',OO,chg)],['Coordinates',seg(set,'coord',OO,chg)],['Auto-flip in 2-player',seg(set,'auto',OO,save)]],'Done')}
function newGame(){modal('New game',[['Mode',seg(g,'mode',[['standard','Standard'],['atomic','Atomic'],['giveaway','Giveaway']])],['',$('small','','Atomic: captures explode neighbours, blow up the king to win. Giveaway: captures are forced, lose all your pieces to win.')],['Opponent',seg(g,'vs',[['bot','Bot'],['2p','2 players']])],['Your side (vs bot)',seg(g,'side',[['w','White'],['r','Random'],['b','Black']])],['Bot level',seg(g,'lvl',[[1,'Easy'],[2,'Medium'],[3,'Hard']])]],'Play',start)}
function start(){S=init(g.mode);H=[];SAN=[];sel=-1;over=null;last=null;busy=0;pl=g.side=='r'?'wb'[Math.random()*2|0]:g.side;flip=g.vs=='bot'&&pl=='b';refresh();if(g.vs=='bot'&&pl=='b')bot()}
function refresh(){L=legal(S);const o=S.t=='w'?'b':'w',k=S.b.indexOf(S.t+'K');chk=S.mode!='giveaway'&&(k<0||!!att(S.b,k,o));
if(!L.length)over=S.mode=='giveaway'?(S.t=='w'?'White':'Black')+' wins':chk?(o=='w'?'White':'Black')+' wins by '+(k<0?'explosion':'checkmate'):'Draw by stalemate';
draw();bars();mv.innerHTML=SAN.map((s,i)=>(i%2?'':`<b>${i/2+1}.</b>`)+`<span>${s}</span>`).join('');mv.scrollTop=1e9;
ti.innerHTML=`${g.mode[0].toUpperCase()+g.mode.slice(1)}<small>${g.vs=='bot'?'vs Bot · Level '+g.lvl:'2 players'}</small>`}
function bars(){const t=flip?'w':'b',nm=c=>g.vs=='bot'?(c==pl?'You':'Bot'+(busy?' …':'')):c=='w'?'White':'Black';
[[tb,t],[bb,t=='w'?'b':'w']].forEach(([e,c])=>{e.innerHTML=`<span class=av style="background:${c=='w'?'#fff':'#403d39'}"></span>${nm(c)}`;e.classList.toggle('on',S.t==c&&!over)})}
function draw(){bd.innerHTML='';const k0=S.b.indexOf(S.t+'K');
for(let k=0;k<64;k++){const i=flip?63-k:k,r=i>>3,c=i&7,p=S.b[i],mv=sel>=0&&L.find(m=>m.f==sel&&m.t==i);
const d=$('div','sq '+((r+c)%2?'d':'l')+(last&&(last.f==i||last.t==i)?' last':'')+(i==sel?' sel':'')+(set.hint&&mv?' hint'+(p||mv.e?' x':''):'')+(chk&&i==k0?' chk':''));d.dataset.i=i;
if(p){const im=$('img',last&&last.t==i?'pop':'');im.src=U()+p[0]+p[1]+'.svg';im.draggable=false;d.append(im)}
if(set.coord){if(k%8==0)d.append($('i','r',8-r));if(k>55)d.append($('i','f',F[c]))}bd.append(d)}}
function click(i){if(over||busy||(g.vs=='bot'&&S.t!=pl))return;const p=S.b[i],ms=L.filter(m=>m.f==sel&&m.t==i);
if(ms.length){if(ms[0].p){const r=$('div','seg pr');ms.forEach(m=>{const b=$('button','',`<img src="${U()}${S.t+m.p}.svg">`);b.onclick=()=>{mo.remove();play(m)};r.append(b)});var mo=modal('Promote to',[['',r]])}else play(ms[0]);return}
if(p&&p[0]==S.t&&i!=sel){sel=i;sfx.sel()}else sel=-1;draw()}
function play(m){const pc=S.b[m.f],cap=S.b[m.t]||m.e;
SAN.push(m.c?(m.t>m.f?'O-O':'O-O-O'):(pc[1]!='P'?pc[1]:cap?F[m.f&7]:'')+(cap?'x':'')+F[m.t&7]+(8-(m.t>>3))+(m.p?'='+m.p:''));
H.push(S);S=make(S,m);last=m;sel=-1;refresh();
if(cap&&S.mode=='atomic')bd.children[flip?63-m.t:m.t].classList.add('boom');
over?sfx.end():chk?sfx.chk():cap?(S.mode=='atomic'?sfx.boom():sfx.cap()):sfx.move();
if(over)setTimeout(()=>modal(over,[],'New game',newGame),700);
else if(g.vs=='bot')bot();else if(set.auto)setTimeout(()=>{flip=S.t=='b';draw();bars()},350)}
function bot(){busy=1;bars();setTimeout(()=>{const m=best(S,g.lvl);busy=0;m&&!over?play(m):bars()},400)}
function undo(){if(busy||!H.length)return;let n=Math.min(g.vs=='bot'&&S.t==pl?2:1,H.length);while(n--){S=H.pop();SAN.pop()}over=null;sel=-1;last=null;refresh();if(g.vs=='bot'&&S.t!=pl)bot()}
app.innerHTML='<div id=bw><div id=tb class=bar></div><div id=bd></div><div id=bb class=bar></div></div><div id=sp><div id=ti></div><div id=mv></div><div class=bt></div></div>';
[['flip','Flip',()=>{flip=!flip;draw();bars()}],['undo','Undo',undo],['snd','Sound',function(){set.snd=set.snd?0:1;save();this.style.opacity=set.snd?1:.4}],['set','Settings',settings]].forEach(([i,t,f])=>{const b=$('button','btn',ic(i));b.title=t;b.onclick=f;b.style.opacity=i=='snd'&&!set.snd?.4:1;document.querySelector('.bt').append(b)});
const nb=$('button','btn g',ic('plus')+'New game');nb.style.flexBasis='100%';nb.onclick=newGame;document.querySelector('.bt').append(nb);
bd.onclick=e=>{const s=e.target.closest('.sq');s&&click(+s.dataset.i)};
theme();start();
