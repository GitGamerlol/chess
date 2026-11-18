const BASE=document.currentScript.src.replace(/app\.js.*/,'');let dead=0;
if(window.name!='chessTab')addEventListener('pointerdown',e=>{const w=open('about:blank','_blank');if(!w)return;e.stopPropagation();w.name='chessTab';w.document.open();
w.document.write(`<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Chess</title><link rel=stylesheet href="${BASE}style.css"></head><body><div id=app></div><script src="${BASE}chess.js"><\/script><script src="${BASE}app.js"><\/script></body></html>`);w.document.close();dead=1;document.body.innerHTML='';document.body.style.background='#000'},{once:true,capture:true});
const $=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const IC={flip:'<path d="M7 4v14M3 14l4 4 4-4M17 20V6m-4 4 4-4 4 4"/>',undo:'<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',plus:'<path d="M12 5v14M5 12h14"/>',set:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',snd:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>',flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',prev:'<path d="M15 6l-6 6 6 6"/>',next:'<path d="M9 6l6 6-6 6"/>',first:'<path d="M18 6l-6 6 6 6M6 6v12"/>',last:'<path d="M6 6l6 6-6 6M18 6v12"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>'};
const ic=n=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const TH={green:['#eeeed2','#769656'],brown:['#f0d9b5','#b58863'],blue:['#dee3e6','#8ca2ad'],purple:['#efefef','#8877b7']},PS=['cburnett','merida','alpha','cardinal','staunty','pixel'];
const NM=['Liam_K','Sofia88','ChessWolf','Aarav','Noah_B','Mia_Rook','Kasper','Elena_G','Tomas','Yuki','Oscar_7','Lena','Marco','Priya','Ivan_D','Zoe_Q'];
let set={theme:'green',piece:'cburnett',snd:1,hint:1,coord:1,auto:1,elo:{standard:800,atomic:800,giveaway:800}};try{Object.assign(set,JSON.parse(localStorage.cs))}catch(e){}
const save=()=>{try{localStorage.cs=JSON.stringify(set)}catch(e){}},g={mode:'standard',vs:'bot',side:'w'};
let S,H,SAN,MV,sel=-1,L=[],last,over,res,pl='w',flip=0,busy=0,chk=0,gid=0,bR=800,bN='Bot',rev=0,rv=0,STs,AN,CL=[],dr=null;
const U=()=>`https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece/${set.piece}/`,wp=v=>1/(1+Math.exp(-v/400));
let ac;const snd=(f,d,ty='sine',v=.3,t0=0)=>{if(!set.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),k=ac.createGain(),n=ac.currentTime+t0;o.type=ty;o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(f/2,n+d);k.gain.setValueAtTime(v,n);k.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(k).connect(ac.destination);o.start(n);o.stop(n+d)}catch(e){}};
const sfx={sel:()=>snd(800,.05,'sine',.1),move:()=>{snd(240,.09,'triangle',.5);snd(480,.04,'sine',.12)},cap:()=>{snd(190,.14,'triangle',.6);snd(900,.05,'square',.07)},boom:()=>{snd(90,.45,'sawtooth',.4);snd(160,.3,'triangle',.5)},chk:()=>{snd(660,.12,'sine',.3);snd(880,.18,'sine',.3,.1)},end:()=>[523,659,784].forEach((f,i)=>snd(f,.5,'sine',.25,i*.12))};
const theme=()=>{const r=document.documentElement.style;r.setProperty('--l',TH[set.theme][0]);r.setProperty('--d',TH[set.theme][1])};
function modal(t,rows,ok,fn){const m=$('div','mo'),c=$('div','card',`<h2>${t}</h2>`);rows.forEach(([l,e])=>{const r=$('div','row',l?`<label>${l}</label>`:'');r.append(e);c.append(r)});
if(ok){const b=$('button','btn g',ok);b.onclick=()=>{m.remove();fn&&fn()};c.append(b)}m.onclick=e=>e.target==m&&m.remove();m.append(c);document.body.append(m);return m}
function seg(o,k,a,cb){const d=$('div','seg');a.forEach(([v,l])=>{const b=$('button',o[k]==v?'on':'',l);b.onclick=()=>{o[k]=v;[...d.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');sfx.sel();cb&&cb()};d.append(b)});return d}
const OO=[[1,'On'],[0,'Off']],chg=()=>{save();theme();draw()};
function settings(){const s=$('select');PS.forEach(p=>s.add(new Option(p,p,0,p==set.piece)));s.onchange=()=>{set.piece=s.value;chg()};
modal('Settings',[['Board',seg(set,'theme',Object.keys(TH).map(k=>[k,k[0].toUpperCase()+k.slice(1)]),chg)],['Pieces',s],['Sound',seg(set,'snd',OO,save)],['Move hints',seg(set,'hint',OO,chg)],['Coordinates',seg(set,'coord',OO,chg)],['Auto-flip in 2-player',seg(set,'auto',OO,save)]],'Done')}
function newGame(){const e=set.elo;modal('New game',[['Mode',seg(g,'mode',[['standard','Standard'],['atomic','Atomic'],['giveaway','Giveaway']])],['',$('small','','Atomic: captures explode neighbours, blow up the king to win. Giveaway: captures are forced, lose all your pieces to win.')],['Opponent',seg(g,'vs',[['bot','Rated bot'],['2p','2 players']])],['Your side (vs bot)',seg(g,'side',[['w','White'],['r','Random'],['b','Black']])],['',$('small','',`Ratings: Standard ${e.standard} · Atomic ${e.atomic} · Giveaway ${e.giveaway}. Bots are matched to your rating (max strength about 1600).`)]],'Play',start)}
function start(){gid++;rev=0;document.body.classList.remove('rv');S=init(g.mode);H=[];SAN=[];MV=[];sel=-1;over=null;last=null;busy=0;pl=g.side=='r'?'wb'[Math.random()*2|0]:g.side;flip=g.vs=='bot'&&pl=='b';
bR=Math.max(250,Math.min(1600,set.elo[g.mode]+Math.round((Math.random()-.5)*120)));bN=NM[Math.random()*NM.length|0];refresh();if(g.vs=='bot'&&pl=='b')bot()}
const ischk=s=>{const k=s.b.indexOf(s.t+'K');return s.mode!='giveaway'&&(k<0||!!att(s.b,k,s.t=='w'?'b':'w'))};
const san=(s,m)=>{const pc=s.b[m.f],cap=s.b[m.t]||m.e;return m.c?(m.t>m.f?'O-O':'O-O-O'):(pc[1]!='P'?pc[1]:cap?F[m.f&7]:'')+(cap?'x':'')+F[m.t&7]+(8-(m.t>>3))+(m.p?'='+m.p:'')};
function refresh(){L=legal(S);const o=S.t=='w'?'b':'w';chk=ischk(S);
if(!L.length){const k=S.b.indexOf(S.t+'K');res=S.mode=='giveaway'?S.t:chk?o:'d';over=res=='d'?'Draw by stalemate':(res=='w'?'White':'Black')+' wins'+(S.mode=='giveaway'?'':k<0?' by explosion':' by checkmate')}
draw();bars();if(!rev)mv.innerHTML=SAN.map((s,i)=>(i%2?'':`<b>${i/2+1}.</b>`)+`<span>${s}</span>`).join('');mv.scrollTop=1e9;
ti.innerHTML=`${g.mode[0].toUpperCase()+g.mode.slice(1)}<small>${g.vs=='bot'?'Rated vs bot':'2 players'}</small>`}
function bars(){const t=flip?'w':'b',nm=c=>g.vs=='bot'?(c==pl?`You (${set.elo[g.mode]})`:`${bN} (${bR})${busy?' …':''}`):c=='w'?'White':'Black';
[[tb,t],[bb,t=='w'?'b':'w']].forEach(([e,c])=>{e.innerHTML=`<span class=av style="background:${c=='w'?'#fff':'#403d39'}"></span>${nm(c)}`;e.classList.toggle('on',S.t==c&&!over)})}
function draw(){const s=rev?STs[rv]:S,lm=rev?MV[rv-1]:last,c0=rev?ischk(s):chk,k0=s.b.indexOf(s.t+'K');bd.innerHTML='';
for(let k=0;k<64;k++){const i=flip?63-k:k,r=i>>3,c=i&7,p=s.b[i],mv=!rev&&sel>=0&&L.find(m=>m.f==sel&&m.t==i);
const d=$('div','sq '+((r+c)%2?'d':'l')+(lm&&(lm.f==i||lm.t==i)?' last':'')+(i==sel?' sel':'')+(set.hint&&mv?' hint'+(p||mv.e?' x':''):'')+(c0&&i==k0?' chk':''));d.dataset.i=i;
if(p){const im=$('img',lm&&lm.t==i?'pop':'');im.src=U()+p[0]+p[1]+'.svg';im.draggable=false;d.append(im)}
if(rev&&lm&&lm.t==i&&CL[rev-1])d.insertAdjacentHTML('beforeend',badge(CL[rev-1]));
if(set.coord){if(k%8==0)d.append($('i','r',8-r));if(k>55)d.append($('i','f',F[c]))}bd.append(d)}}
function click(i){const ms=L.filter(m=>m.f==sel&&m.t==i);if(!ms.length)return;
if(ms[0].p){const r=$('div','seg pr'),mo=modal('Promote to',[['',r]]);ms.forEach(m=>{const b=$('button','',`<img src="${U()}${S.t+m.p}.svg">`);b.onclick=()=>{mo.remove();play(m)};r.append(b)})}else play(ms[0])}
bd.onpointerdown=e=>{if(dead||rev)return;const q=e.target.closest('.sq');if(!q||over||busy||(g.vs=='bot'&&S.t!=pl))return;const i=+q.dataset.i,p=S.b[i];
if(sel>=0&&L.some(m=>m.f==sel&&m.t==i)){click(i);return}
if(p&&p[0]==S.t){const was=i==sel;if(!was){sel=i;sfx.sel();draw()}const im=bd.children[flip?63-i:i].querySelector('img'),gh=im.cloneNode(),w=q.offsetWidth;
gh.style.cssText=`position:fixed;width:${w}px;height:${w}px;pointer-events:none;z-index:20;left:${e.clientX-w/2}px;top:${e.clientY-w/2}px`;document.body.append(gh);im.style.opacity=.35;dr={i,gh,w,was,x:e.clientX,y:e.clientY,mv:0}}else{sel=-1;draw()}};
addEventListener('pointermove',e=>{if(!dr)return;dr.gh.style.left=e.clientX-dr.w/2+'px';dr.gh.style.top=e.clientY-dr.w/2+'px';if(Math.hypot(e.clientX-dr.x,e.clientY-dr.y)>5)dr.mv=1});
addEventListener('pointerup',e=>{if(!dr)return;const d=dr;dr=null;d.gh.remove();const t=document.elementFromPoint(e.clientX,e.clientY),q=t&&t.closest('.sq'),j=q&&bd.contains(q)?+q.dataset.i:-1;
if(j>=0&&j!=d.i&&L.some(m=>m.f==d.i&&m.t==j)){sel=d.i;click(j)}else{if(!d.mv&&d.was)sel=-1;draw()}});
function play(m){const cap=S.b[m.t]||m.e,id=gid;SAN.push(san(S,m));MV.push(m);H.push(S);S=make(S,m);last=m;sel=-1;refresh();
if(cap&&S.mode=='atomic')bd.children[flip?63-m.t:m.t].classList.add('boom');
over?0:chk?sfx.chk():cap?(S.mode=='atomic'?sfx.boom():sfx.cap()):sfx.move();
if(over)fin();else if(g.vs=='bot')bot();else if(set.auto)setTimeout(()=>{if(id==gid){flip=S.t=='b';draw();bars()}},350)}
function fin(){sfx.end();const rt=[];if(g.vs=='bot'){const e=set.elo[g.mode],sc=res==pl?1:res=='d'?.5:0,d=Math.round(32*(sc-1/(1+10**((bR-e)/400))));rt.push(['',$('div','',`Rating ${e} → ${Math.max(100,e+d)} (${d>=0?'+':''}${d})`)]);set.elo[g.mode]=Math.max(100,e+d);save()}
const rb=$('button','btn',ic('chart')+'Game review');rb.onclick=()=>{rb.closest('.mo').remove();review()};setTimeout(()=>modal(over,rt.concat([['',rb]]),'New game',newGame),700)}
function bot(){busy=1;bars();const id=gid;setTimeout(()=>{if(dead||id!=gid)return;const r=bR,o=think(S,r<600?1:r<900?2:r<1200?3:r<1450?4:8,r<600?150:r<900?400:r<1200?800:r<1450?1400:2200,Math.max(8,(1700-r)/6),Math.max(0,(900-r)/1700));
busy=0;if(id==gid&&o&&!over&&S.t!=pl)play(o.m);else bars()},350)}
function undo(){if(busy||!H.length||over)return;let n=Math.min(g.vs=='bot'&&S.t==pl?2:1,H.length);while(n--){S=H.pop();SAN.pop();MV.pop()}sel=-1;last=MV[MV.length-1]||null;refresh();if(g.vs=='bot'&&S.t!=pl)bot()}
function resign(){if(over||!MV.length||rev)return;res=g.vs=='bot'?(pl=='w'?'b':'w'):(S.t=='w'?'b':'w');over=(res=='w'?'White':'Black')+' wins by resignation';bars();fin()}
// review
const CT={br:['!!','#1baca6','Brilliant'],gr:['!','#5c8bb0','Great'],be:['★','#81b64c','Best'],ex:['✓','#96bc4b','Excellent'],go:['✓','#96af8b','Good'],bk:['B','#a88865','Book'],in:['?!','#f7c631','Inaccuracy'],mi:['?','#e58f2a','Mistake'],bl:['??','#ca3431','Blunder']};
const badge=c=>`<span class=bg style="background:${CT[c][1]}">${CT[c][0]}</span>`,mt=(s,c)=>s.b.reduce((a,p)=>a+(p&&p[1]!='K'?(p[0]==c?1:-1)*V[p[1]]:0),0);
function review(){if(rev||!MV.length)return;rev=1;STs=H.concat([S]);AN=[];CL=[];rv=STs.length-1;document.body.classList.add('rv');ti.innerHTML='Game review<small id=pg></small>';sl.max=rv;let i=0;
const step=()=>{if(!rev)return;if(i>=STs.length){classify();show();return}pg.textContent=`Analyzing ${i+1}/${STs.length}`;const s=STs[i],o=think(s,3,250,0,0),w=s.t=='w'?1:-1;AN[i]={v:w*(o?o.R[0].sc:endv(s)),R:o?o.R:[]};i++;setTimeout(step,0)};step()}
function classify(){CL=MV.map((m,i)=>{const A=AN[i],B=AN[i+1],s=STs[i],w=s.t=='w'?1:-1,ls=100*w*(wp(A.v)-wp(B.v)),r=A.R,bm=r[0]&&r[0].f==m.f&&r[0].t==m.t&&r[0].p==m.p;
const sac=STs[i+2]&&mt(STs[i+2],s.t)-mt(s,s.t)<=-200;
return sac&&ls<=3&&w*A.v>-300?'br':bm&&r[1]&&r[0].sc-r[1].sc>=150&&Math.abs(A.v)<600?'gr':i<6&&g.mode=='standard'&&ls<3?'bk':bm||ls<=.5?'be':ls<=2?'ex':ls<=5?'go':ls<=10?'in':ls<=20?'mi':'bl'});pg.textContent='';mv.onclick=e=>{const t=e.target.closest('[data-k]');t&&rev&&go(+t.dataset.k)}}
function go(k){rv=Math.max(0,Math.min(STs.length-1,k));show()}
function show(){const A=AN[rv],c=CL[rv-1],p=AN[rv-1]&&AN[rv-1].R[0];draw();ef.style.height=wp(A.v)*100+'%';eb.style.transform=flip?'rotate(180deg)':'';
inf.innerHTML=(Math.abs(A.v)>8000?'Mate':(A.v>0?'+':'')+(A.v/100).toFixed(1))+' &nbsp;'+(rv?`${badge(c)}<b>${SAN[rv-1]}</b> ${CT[c][2]}`+(p&&!['be','br','gr','bk'].includes(c)?`<small>Best was ${san(STs[rv-1],p)}</small>`:''):'Start position');
sl.value=rv;mv.innerHTML=SAN.map((s,i)=>(i%2?'':`<b>${i/2+1}.</b>`)+`<span data-k=${i+1} class="${i+1==rv?'cur':''}">${CL[i]?badge(CL[i]):''}${s}</span>`).join('')}
function exit(){rev=0;document.body.classList.remove('rv');refresh()}
addEventListener('keydown',e=>{if(rev&&CL.length){if(e.key=='ArrowLeft')go(rv-1);if(e.key=='ArrowRight')go(rv+1)}});
app.innerHTML='<div id=eb><div id=ef></div></div><div id=bw><div id=tb class=bar></div><div id=bd></div><div id=bb class=bar></div></div><div id=sp><div id=ti></div><div id=mv></div><div id=rp><div id=inf></div><input id=sl type=range min=0 value=0><div class=bt id=nv></div></div><div class=bt id=gb></div></div>';
const mk=(box,i,t,f)=>{const b=$('button','btn',ic(i));b.title=t;b.onclick=f;box.append(b);return b};
mk(gb,'flip','Flip',()=>{flip=!flip;draw();bars()});mk(gb,'undo','Undo',undo);mk(gb,'flag','Resign',resign);mk(gb,'chart','Review',review);
mk(gb,'snd','Sound',function(){set.snd=set.snd?0:1;save();this.style.opacity=set.snd?1:.4}).style.opacity=set.snd?1:.4;mk(gb,'set','Settings',settings);
const nb=$('button','btn g',ic('plus')+'New game');nb.style.flexBasis='100%';nb.onclick=newGame;gb.append(nb);
mk(nv,'first','Start',()=>go(0));mk(nv,'prev','Back',()=>go(rv-1));mk(nv,'next','Next',()=>go(rv+1));mk(nv,'last','End',()=>go(1e3));mk(nv,'x','Exit review',exit);sl.oninput=()=>go(+sl.value);
theme();start();
