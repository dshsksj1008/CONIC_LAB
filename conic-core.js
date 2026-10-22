/* CONIC LAB V4 — mathematical model, unitless normalized coordinates.
  Individual conics are in (x,z) plane: ellipse x²/a²+z²/b²=1,
  parabola z²=4px, hyperbola x²/a²-z²/b²=1.
  Master double cone: x²+z²=k²y², plane y=h+tan(theta)x. */
(()=>{'use strict';
const K=.65,L=1.05,GAMMA=Math.atan(1/K)*180/Math.PI;
const init={ellipse:{a:.48,b:.31,t:45},parabola:{p:.19,t:.31},hyperbola:{a:.31,b:.23,t:.65,branch:1},master:{theta:28,h:.34,dandelin:false}};
const labels={ellipse:'타원',parabola:'포물선',hyperbola:'쌍곡선',master:'종합 원뿔',circle:'원'};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const fmt=(n,p=3)=>Number(n).toFixed(p);
function type(theta){const d=Math.abs(theta-GAMMA);return Math.abs(theta)<1e-6?'circle':d<.00001?'parabola':theta<GAMMA?'ellipse':'hyperbola'}
function point(kind,p){if(kind==='ellipse'){const t=p.t*Math.PI/180;return [p.a*Math.cos(t),p.b*Math.sin(t)]}if(kind==='parabola'){return [p.t*p.t/(4*p.p),p.t]}return [(p.branch||1)*p.a*Math.cosh(p.t),p.b*Math.sinh(p.t)]}
function curves(kind,p,n=240){const paths=[];
 if(kind==='ellipse'){const arr=[];for(let j=0;j<=n;j++){let t=j*2*Math.PI/n;arr.push([p.a*Math.cos(t),p.b*Math.sin(t)])}paths.push(arr)}
 if(kind==='parabola'){const arr=[];for(let j=0;j<=n;j++){let z=-.80+1.60*j/n,x=z*z/(4*p.p);if(x<=.96)arr.push([x,z]);else if(arr.length>2){paths.push(arr.splice(0))}}if(arr.length>2)paths.push(arr)}
 if(kind==='hyperbola')for(const sign of [-1,1]){const arr=[];for(let j=0;j<=n;j++){let t=-1.35+2.7*j/n,x=sign*p.a*Math.cosh(t),z=p.b*Math.sinh(t);if(Math.abs(x)<=1.02&&Math.abs(z)<=.87)arr.push([x,z]);else if(arr.length>2){paths.push(arr.splice(0))}}if(arr.length>2)paths.push(arr)}
 return paths;
}
function focus(kind,p){if(kind==='ellipse'){let c=Math.sqrt(p.a*p.a-p.b*p.b);return [[-c,0],[c,0]]}if(kind==='parabola')return [[p.p,0]];let c=Math.sqrt(p.a*p.a+p.b*p.b);return [[-c,0],[c,0]]}
function vertices(kind,p){if(kind==='ellipse')return [[-p.a,0],[p.a,0],[0,-p.b],[0,p.b]];if(kind==='parabola')return [[0,0]];return [[-p.a,0],[p.a,0]]}
function tangent(kind,p){const [x,z]=point(kind,p);if(kind==='ellipse')return {A:x/(p.a*p.a),B:z/(p.b*p.b),C:1};if(kind==='parabola')return {A:2*p.p,B:-z,C:-2*p.p*x};return {A:x/(p.a*p.a),B:-z/(p.b*p.b),C:1}}
function tangentSegment(kind,p,range=.9){const t=tangent(kind,p);let [A,B,C]=[t.A,t.B,t.C];if(Math.abs(B)>Math.abs(A)){return [[-range,(C+A*range)/B],[range,(C-A*range)/B]]}return [[(C+B*range)/A,-range],[(C-B*range)/A,range]]}
function equation(kind,p){if(kind==='ellipse')return `x² / ${fmt(p.a*p.a)} + y² / ${fmt(p.b*p.b)} = 1`;
if(kind==='parabola')return `y² = ${fmt(4*p.p)}x`;
if(kind==='hyperbola')return `x² / ${fmt(p.a*p.a)} − y² / ${fmt(p.b*p.b)} = 1`;
return `x² + z² = ${fmt(K*K,4)}y²   /   y = ${fmt(p.h,2)} + tan(${fmt(p.theta,1)}°)x`}
function math(kind,p){if(kind==='master'){let e=Math.sin(p.theta*Math.PI/180)/Math.sin(GAMMA*Math.PI/180);return `모선의 수평각 γ = ${fmt(GAMMA,2)}° · 이심률 e = ${fmt(e)} · ${labels[type(p.theta)]}`}let [x,z]=point(kind,p);let T=tangent(kind,p);let c=focus(kind,p);let fx=c.map(v=>`(${fmt(v[0],2)}, ${fmt(v[1],2)})`).join(', ');
let text=kind==='ellipse'?`장축 2a=${fmt(2*p.a,2)} · 단축 2b=${fmt(2*p.b,2)} · 두 초점까지 거리의 합 = ${fmt(2*p.a,2)}`:kind==='parabola'?`초점 (${fmt(p.p,2)},0) · 준선 x=${fmt(-p.p,2)} · 초점거리 p=${fmt(p.p,2)}`:`실축 2a=${fmt(2*p.a,2)} · 두 초점까지 거리 차의 절댓값 = ${fmt(2*p.a,2)} · 점근선 y=±${fmt(p.b/p.a,2)}x`;
return `${text}\n초점 ${fx}\n선택한 점 P=(${fmt(x,3)},${fmt(z,3)})\n접선 ${fmt(T.A)}x ${T.B<0?'−':'+'} ${fmt(Math.abs(T.B))}y = ${fmt(T.C)}`}
/* Returns contiguous clipped line sections on each nappe. Slicing plane is exact, no preset 4-shape swaps. */
function section(theta,h,N=1440){let m=Math.tan(theta*Math.PI/180),res=[];
for(const nappe of [1,-1]){let path=[];const flush=()=>{if(path.length>1)res.push(path);path=[]};for(let i=0;i<=N;i++){let ph=2*Math.PI*i/N,c=Math.cos(ph),s=Math.sin(ph),den=1-nappe*m*K*c;
let y=h/den,x=K*Math.abs(y)*c,z=K*Math.abs(y)*s;
let ok=Number.isFinite(y)&&Math.abs(den)>1e-8&&y*nappe>0&&Math.abs(y)<=L&&Math.abs(x)<=K*L+.001;
if(ok){let pt=[x,y,z];let prev=path[path.length-1];if(prev&&Math.hypot(...pt.map((v,j)=>v-prev[j]))>.13)flush();path.push(pt)}else flush()}
flush();}return res;}
function dandelin(theta,h){if(type(theta)!=='ellipse'&&type(theta)!=='circle')return[];let m=Math.tan(theta*Math.PI/180),sinalpha=K/Math.sqrt(1+K*K),q=sinalpha*Math.sqrt(1+m*m);if(q>=1)return[];return [h/(1+q),h/(1-q)].map(d=>{let radius=d*sinalpha,x=m*(d-h)/(1+m*m),y=d-(d-h)/(1+m*m);return {center:[0,d,0],radius,tangent:[x,y,0],insideFinite:d+radius<L}})}
window.CONIC={K,L,GAMMA,init,labels,clamp,type,point,curves,focus,vertices,tangent,tangentSegment,equation,math,section,dandelin};})();
