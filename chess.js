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
function ev(s){let x=0;for(let i=0;i<64;i++){const p=s.b[i];if(!p)continue;const r=i>>3,c=i&7,y=p[1];
let v=V[y]+(y=='P'?(p[0]=='w'?7-r:r)*8:y=='K'?(s.mode=='giveaway'?300:0):(7-Math.abs(c-3.5)-Math.abs(r-3.5))*4);x+=p[0]=='w'?v:-v}return s.mode=='giveaway'?-x:x}
function ab(s,d,a,b){const ms=legal(s);if(!ms.length){if(s.mode=='giveaway')return 9999+d;const k=s.b.indexOf(s.t+'K');return k<0||att(s.b,k,s.t=='w'?'b':'w')?-9999-d:0}
if(!d)return(s.t=='w'?1:-1)*ev(s);ms.sort((x,y)=>(y.x?1:0)-(x.x?1:0));
for(const m of ms){const v=-ab(make(s,m),d-1,-b,-a);if(v>=b)return b;if(v>a)a=v}return a}
function best(s,d){let bm=null,ba=-1e9;for(const m of legal(s)){const v=-ab(make(s,m),d-1,-1e9,1e9)+Math.random()*(d<2?150:12);if(v>ba){ba=v;bm=m}}return bm}
