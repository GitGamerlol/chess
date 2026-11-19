const F='abcdefgh',D={N:[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],B:[[-1,-1],[-1,1],[1,-1],[1,1]],R:[[-1,0],[1,0],[0,-1],[0,1]]};D.Q=D.B.concat(D.R);D.K=D.Q;
function init(mode){const b=Array(64).fill(null),o='RNBQKBNR';for(let c=0;c<8;c++){b[c]='b'+o[c];b[8+c]='bP';b[48+c]='wP';b[56+c]='w'+o[c]}return{b,t:'w',cr:mode=='giveaway'?'':'KQkq',ep:-1,mode}}
function att(b,s,by){const r=s>>3,c=s&7,at=(y,x,t)=>{if(y<0||y>7||x<0||x>7)return 0;const p=b[y*8+x];return p&&p[0]==by&&t.includes(p[1])},pr=by=='w'?r+1:r-1;
if(at(pr,c-1,'P')||at(pr,c+1,'P'))return 1;for(const[d,e]of D.N)if(at(r+d,c+e,'N'))return 1;for(const[d,e]of D.K)if(at(r+d,c+e,'K'))return 1;
for(const k of['B','R'])for(const[d,e]of D[k]){let y=r+d,x=c+e;while(y>=0&&y<8&&x>=0&&x<8){const p=b[y*8+x];if(p){if(p[0]==by&&(p[1]=='Q'||p[1]==k))return 1;break}y+=d;x+=e}}return 0}
function pseudo(s){const{b,t,ep,cr,mode}=s,m=[],o=t=='w'?'b':'w',gv=mode=='giveaway';
for(let i=0;i<64;i++){const p=b[i];if(!p||p[0]!=t)continue;const r=i>>3,c=i&7,y=p[1];
const add=(to,x)=>{if(y=='P'&&(to>>3==0||to>>3==7))for(const q of gv?'QRBNK':'QRBN')m.push({f:i,t:to,p:q,...x});else m.push({f:i,t:to,...x})};
if(y=='P'){const dr=t=='w'?-1:1;let n=i+dr*8;if(!b[n]){add(n);if(r==(t=='w'?6:1)&&!b[n+dr*8])add(n+dr*8,{dp:1})}
for(const dc of[-1,1]){if(c+dc<0||c+dc>7)continue;n=i+dr*8+dc;if(b[n]&&b[n][0]==o)add(n,{x:1});else if(n==ep)add(n,{x:1,e:1})}}
else if(y=='N'||y=='K'){for(const[d,e]of D[y]){const y2=r+d,x2=c+e;if(y2<0||y2>7||x2<0||x2>7)continue;const n=y2*8+x2;if(!b[n])add(n);else if(b[n][0]==o)add(n,{x:1})}
if(y=='K'&&!gv&&i==(t=='w'?60:4)){const R=t+'R';
if(cr.includes(t=='w'?'K':'k')&&b[i+3]==R&&!b[i+1]&&!b[i+2]&&![0,1,2].some(k=>att(b,i+k,o)))add(i+2,{c:1});
if(cr.includes(t=='w'?'Q':'q')&&b[i-4]==R&&!b[i-1]&&!b[i-2]&&!b[i-3]&&![0,1,2].some(k=>att(b,i-k,o)))add(i-2,{c:1})}}
else for(const[d,e]of D[y]){let y2=r+d,x2=c+e;while(y2>=0&&y2<8&&x2>=0&&x2<8){const n=y2*8+x2;if(b[n]){if(b[n][0]==o)add(n,{x:1});break}add(n);y2+=d;x2+=e}}}return m}
function make(s,m){const b=s.b.slice(),t=s.t,cap=b[m.t]||m.e;let cr=s.cr;b[m.t]=m.p?t+m.p:b[m.f];b[m.f]=null;
if(m.e)b[m.t+(t=='w'?8:-8)]=null;if(m.c){const q=m.t>m.f,a=q?m.t+1:m.t-2,z=q?m.t-1:m.t+1;b[z]=b[a];b[a]=null}
for(const q of[m.f,m.t])for(const ch of({60:'KQ',63:'K',56:'Q',4:'kq',7:'k',0:'q'})[q]||'')cr=cr.replace(ch,'');
if(s.mode=='atomic'&&cap){const r=m.t>>3,c=m.t&7;for(let y=r-1;y<=r+1;y++)for(let x=c-1;x<=c+1;x++)if(y>=0&&y<8&&x>=0&&x<8){const q=y*8+x;if(q==m.t||(b[q]&&b[q][1]!='P'))b[q]=null}}
return{b,t:t=='w'?'b':'w',cr,ep:m.dp?(m.f+m.t)>>1:-1,mode:s.mode}}
function legal(s){const o=s.t=='w'?'b':'w',md=s.mode,ms=pseudo(s);
if(md=='giveaway'){const c=ms.filter(m=>m.x);return c.length?c:ms}
return ms.filter(m=>{const n=make(s,m),k=n.b.indexOf(s.t+'K');if(k<0)return 0;
if(md=='atomic'){const e=n.b.indexOf(o+'K');if(e<0||(Math.abs((e>>3)-(k>>3))<2&&Math.abs((e&7)-(k&7))<2))return 1}
return!att(n.b,k,o)})}
const V={P:100,N:320,B:330,R:500,Q:900,K:0};
function ev(s){const b=s.b;let x=0,m=0;const B={w:0,b:0},pf={w:Array(8).fill(0),b:Array(8).fill(0)};
for(let i=0;i<64;i++){const p=b[i];if(!p)continue;x+=(p[0]=='w'?1:-1)*V[p[1]];if(p[1]=='P')pf[p[0]][i&7]++;else if(p[1]!='K')m+=V[p[1]];if(p[1]=='B')B[p[0]]++}
if(s.mode=='giveaway')return-x;const eg=m<2800;if(B.w>1)x+=30;if(B.b>1)x-=30;
for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const c=p[0],w=c=='w',y=p[1],r=i>>3,k=i&7,rr=w?7-r:r,cen=7-Math.abs(k-3.5)-Math.abs(r-3.5),dr=w?-1:1;let v=0;
if(y=='P'){v=rr*5+(k>1&&k<6?cen:0);let ps=1;for(let d=-1;d<2;d++){const q=k+d;if(q<0||q>7)continue;for(let y2=r+dr;y2>0&&y2<7;y2+=dr)if(b[y2*8+q]==(w?'bP':'wP'))ps=0}
if(ps)v+=[0,5,12,25,45,80,130][rr];if(pf[c][k]>1)v-=10;if(!pf[c][k-1]&&!pf[c][k+1])v-=10}
else if(y=='N')v=cen*5-(rr==0&&!eg?10:0);else if(y=='B')v=cen*3-(rr==0&&!eg?10:0);
else if(y=='R')v=(!pf[c][k]?(!pf[w?'b':'w'][k]?18:10):0)+(rr==6?15:0);else if(y=='Q')v=cen;
else{let sh=0;for(let d=-1;d<2;d++){const q=k+d,r2=r+dr;if(q>=0&&q<8&&r2>=0&&r2<8&&b[r2*8+q]==c+'P')sh++}v=eg?cen*8:(rr<2?15:-25)+sh*12}
x+=(w?1:-1)*v}return x}
let TT=new Map,KL=[],HS={},T0,TL,AB,N;
const key=s=>s.t+s.cr+s.ep+s.b.join(''),vic=(s,m)=>V[(s.b[m.t]||'wP')[1]],mvv=(s,m)=>(m.x?vic(s,m)*10-V[s.b[m.f][1]]/10+1e4:0)+(m.p?800:0);
const endv=s=>{if(s.mode=='giveaway')return 9000;const k=s.b.indexOf(s.t+'K');return k<0||att(s.b,k,s.t=='w'?'b':'w')?-9000:0};
const tick=()=>{if((++N&1023)==0&&Date.now()>T0+TL)AB=1};
function caps(s){if(s.mode!='standard')return legal(s).filter(m=>m.x);const o=s.t=='w'?'b':'w';return pseudo(s).filter(m=>m.x&&(m.n=make(s,m),!att(m.n.b,m.n.b.indexOf(s.t+'K'),o)))}
function qs(s,a,b){tick();const st=(s.t=='w'?1:-1)*(ev(s)+8);if(AB)return 0;if(st>=b)return b;if(st>a)a=st;
const ms=caps(s);ms.sort((x,y)=>mvv(s,y)-mvv(s,x));
for(const m of ms){if(st+vic(s,m)+200<a)continue;const v=-qs(m.n||make(s,m),-b,-a);if(AB)return 0;if(v>=b)return b;if(v>a)a=v}return a}
function ab(s,d,a,b,pl){tick();if(AB)return 0;const o=s.t=='w'?'b':'w',kk=s.b.indexOf(s.t+'K'),inc=s.mode=='standard'&&kk>=0&&att(s.b,kk,o);
if(inc&&pl<14)d++;if(d<=0)return s.mode=='standard'?qs(s,a,b):(s.t=='w'?1:-1)*(ev(s)+8);
const k=key(s),e=TT.get(k),a0=a;if(e&&e.d>=d){if(e.f==0)return e.v;if(e.f==1&&e.v>=b)return e.v;if(e.f==2&&e.v<=a)return e.v}
const ms=legal(s);if(!ms.length){const v=endv(s);return v>0?v+d:v<0?v-d:0}
const tm=e&&e.m,kl=KL[pl];ms.forEach(m=>m.o=(tm&&m.f==tm.f&&m.t==tm.t&&m.p==tm.p?1e6:0)+mvv(s,m)+(kl&&kl.f==m.f&&kl.t==m.t?5e3:0)+(HS[m.f*64+m.t]||0));ms.sort((x,y)=>y.o-x.o);
let bm=null,bv=-1e9,i=0;
for(const m of ms){const n=make(s,m);let v;
if(i>3&&d>2&&!m.x&&!inc){v=-ab(n,d-2,-a-1,-a,pl+1);if(v>a&&!AB)v=-ab(n,d-1,-b,-a,pl+1)}else v=-ab(n,d-1,-b,-a,pl+1);
i++;if(AB)return 0;if(v>bv){bv=v;bm=m}if(v>a)a=v;if(a>=b){if(!m.x){KL[pl]=m;HS[m.f*64+m.t]=(HS[m.f*64+m.t]||0)+d*d}break}}
TT.set(k,{d,v:bv,f:bv<=a0?2:bv>=b?1:0,m:bm});return bv}
function think(s,maxD,tl,noise,blund){if(TT.size>2e5)TT.clear();KL=[];HS={};N=0;AB=0;T0=Date.now();TL=tl;let ms=legal(s);if(!ms.length)return null;
ms.forEach(m=>m.sc=0);
for(let d=1;d<=maxD;d++){ms.sort((x,y)=>y.sc-x.sc);let ba=-1e9;
for(const m of ms){const v=-ab(make(s,m),d-1,-1e9,-(ba-noise-1),1);if(AB)break;m.s2=v;if(v>ba)ba=v}
if(AB)break;ms.forEach(m=>m.sc=m.s2);if(ba>8000||ba<-8000)break}
ms.sort((x,y)=>y.sc-x.sc);const top=ms[0].sc,c=ms.filter(m=>m.sc>=top-noise);
let m=c[Math.random()**2*c.length|0];if(Math.random()<blund)m=ms[Math.random()*Math.min(5,ms.length)|0];return{m,R:ms}}
