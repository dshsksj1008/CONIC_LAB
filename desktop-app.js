/* CONIC LAB V6 / self-contained Canvas 3D teaching renderer.
   No CDN, WebGL, camera, HTTP server or external package required for laptop demo.
   Geometry and tangents use the same conic-core.js as the marker AR pages. */
(()=>{'use strict';
 const C=window.CONIC;
 const $=id=>document.getElementById(id);
 if(!C){$('detailText').textContent='conic-core.js를 읽지 못했습니다. 전체 압축을 해제하고 같은 폴더에서 실행해 주세요.';return;}
 const settings={kind:'master',pars:JSON.parse(JSON.stringify(C.init)),view:{yaw:-.85,pitch:.53,zoom:1},flags:{grid:true,focus:true,vertex:true,tangent:true,labels:true},playing:false,dir:1,last:0};
 const colors={mint:'#60ecd4',gold:'#ffd18c',purple:'#c5b6ff',blue:'#75c4f7',pink:'#ff93b0',ink:'#d8f2ff',muted:'#789eaf',grid:'#47677a'};
 const titles={ellipse:'타원',parabola:'포물선',hyperbola:'쌍곡선',master:'종합 원뿔 절단'};
 const descriptions={ellipse:'두 초점까지의 거리의 합이 일정한 곡선. a와 b를 바꾸어 크기·모양을 확인해.',parabola:'한 초점과 준선까지의 거리가 같은 점의 집합. p를 움직이면 곡선이 변해.',hyperbola:'두 초점까지 거리 차의 절댓값이 일정한 곡선. 실축과 허축을 조절해.',master:'이중 원뿔과 평면의 정확한 교선. θ를 연속적으로 변경하면 원·타원·포물선·쌍곡선으로 이어져.'};
 const fields={ellipse:[['a','장반경 a',.26,.80,.01],['b','단반경 b',.10,.68,.01],['t','접점 각도',-180,180,1]],parabola:[['p','초점거리 p',.09,.35,.01],['t','접점 y좌표',-.65,.65,.01]],hyperbola:[['a','실축 반길이 a',.18,.52,.01],['b','허축 반길이 b',.11,.50,.01],['t','접점 매개변수',-1.05,1.05,.01]],master:[['theta','절단각 θ',0,80,.1],['h','절단 위치 h',.11,.48,.01]]};
 const cv=$('threeView'),gv=$('graphView'),ct=cv.getContext('2d'),gt=gv.getContext('2d');let cw=800,ch=500,gw=760,gh=235,displayScale=1;
 const clone3=a=>[...a];
 const rad=d=>d*Math.PI/180;
 const fmt=(v,n=2)=>Number(v).toFixed(n);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function toast(txt){const el=$('toast');el.textContent=txt;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),2500)}
 function fitCanvas(canvas,ctx){const box=canvas.getBoundingClientRect();let scale=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,Math.round(box.width)),h=Math.max(1,Math.round(box.height));canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);ctx.setTransform(scale,0,0,scale,0,0);return [w,h]}
 function resize(){[cw,ch]=fitCanvas(cv,ct);[gw,gh]=fitCanvas(gv,gt);drawAll()}
 function transform(v){let [x,y,z]=v,cy=Math.cos(settings.view.yaw),sy=Math.sin(settings.view.yaw),cp=Math.cos(settings.view.pitch),sp=Math.sin(settings.view.pitch);const xr=x*cy+z*sy;const zr=-x*sy+z*cy;const yr=y*cp-zr*sp;const depth=y*sp+zr*cp;return [xr,yr,depth]}
 function project(v){const [x,y,d]=transform(v);let s=Math.min(cw*.36,ch*.36)*settings.view.zoom;return [cw*.50+x*s,ch*.52-y*s,d]}
 function linePath(ctx,pts,stroke,width=1,alpha=1,glow=false){if(pts.length<2)return;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';if(glow){ctx.shadowBlur=14;ctx.shadowColor=stroke}ctx.beginPath();pts.forEach((v,i)=>{if(i===0)ctx.moveTo(v[0],v[1]);else ctx.lineTo(v[0],v[1])});ctx.stroke();ctx.restore()}
 function polygon(ctx,pts,color,alpha,stroke){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();pts.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}ctx.restore()}
 function badge(ctx,txt,pos,accent=colors.ink){if(!settings.flags.labels)return;let [x,y]=project(pos);ctx.save();ctx.font='700 12px system-ui';const w=ctx.measureText(txt).width+15;ctx.fillStyle='#081925e8';ctx.strokeStyle='#396074';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(x+7,y-22,w,23,7);ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.fillText(txt,x+14,y-7);ctx.restore()}
 function dot(ctx,pos,color,label,size=5){let [x,y]=project(pos);ctx.save();ctx.beginPath();ctx.fillStyle=color;ctx.shadowBlur=10;ctx.shadowColor=color;ctx.arc(x,y,size,0,2*Math.PI);ctx.fill();ctx.restore();if(label)badge(ctx,label,pos,color)}
 function drawCone(ctx){const K=C.K,L=C.L,N=60;let polys=[];
  for(const sign of [-1,1])for(let i=0;i<N;i++){let f1=2*Math.PI*i/N,f2=2*Math.PI*(i+1)/N;let verts=[[0,0,0],[K*L*Math.cos(f1),sign*L,K*L*Math.sin(f1)],[K*L*Math.cos(f2),sign*L,K*L*Math.sin(f2)]];let depth=verts.reduce((a,v)=>a+transform(v)[2],0)/3;polys.push({depth,verts,sign})}
  polys.sort((a,b)=>a.depth-b.depth);for(const poly of polys){polygon(ctx,poly.verts.map(project),poly.sign===1?'#3a97d0':'#687edd',.075)}
  const axis=[[-1.22,[0,-1.22,0]],[1.22,[0,1.22,0]]];linePath(ctx,[[0,-1.22,0],[0,1.22,0]].map(project),'#b9cce5',1,.6);
  for(const sign of [-1,1]){for(let i=0;i<=4;i++){let y=L*i/4;if(y<.05)continue;const pts=[];for(let n=0;n<=N;n++){const a=2*Math.PI*n/N;pts.push([K*y*Math.cos(a),sign*y,K*y*Math.sin(a)])}linePath(ctx,pts.map(project),colors.blue,1,.23)}for(let n=0;n<16;n++){const a=2*Math.PI*n/16;linePath(ctx,[[0,0,0],[K*L*Math.cos(a),sign*L,K*L*Math.sin(a)]].map(project),'#81b9ec',1,.3)}}
  badge(ctx,'원뿔',[K*L*.70,L*.7,0],colors.blue);
 }
 function drawPlane(ctx,p){const theta=rad(p.theta),w=.82,v=.82,h=p.h;
  const xyz=(u,z)=>[u*Math.cos(theta),h+u*Math.sin(theta),z];const corners=[xyz(-w,-v),xyz(w,-v),xyz(w,v),xyz(-w,v)];polygon(ctx,corners.map(project),'#f5be65',.19);
  const P=corners.map(project);linePath(ctx,[...P,P[0]],colors.gold,1.45,.84);
  linePath(ctx,[xyz(-w,0),xyz(w,0)].map(project),colors.gold,1,.33);
  badge(ctx,`절단 평면 θ=${fmt(p.theta,1)}°`,xyz(-w,.62),colors.gold)
 }
 function drawMaster(ctx,p){drawCone(ctx);drawPlane(ctx,p);const segs=C.section(p.theta,p.h,1440);
  for(const seg of segs){const points=seg.map(project);linePath(ctx,points,colors.mint,5,.45,true);linePath(ctx,points,colors.mint,2.9,1)}
  dot(ctx,[0,0,0],colors.pink,'O',3.4);
 }
 function drawGround(ctx){const E=1.03;polygon(ctx,[[-E,-.025,-E],[E,-.025,-E],[E,-.025,E],[-E,-.025,E]].map(project),'#1c4865',.12);
  if(settings.flags.grid){for(let i=-10;i<=10;i++){let v=i/10;linePath(ctx,[[v,0,-E],[v,0,E]].map(project),colors.grid,i===0?1.15:.7,i===0?.74:.23);linePath(ctx,[[-E,0,v],[E,0,v]].map(project),colors.grid,i===0?1.15:.7,i===0?.74:.23)}}
  linePath(ctx,[[-E,0,0],[E,0,0]].map(project),colors.ink,1.4,.68);linePath(ctx,[[0,0,-E],[0,0,E]].map(project),colors.ink,1.4,.68);badge(ctx,'x',[E,0,0]);badge(ctx,'y',[0,0,E]);
 }
 function drawSingle(ctx,kind,p){drawGround(ctx);const paths=C.curves(kind,p,260);const color=kind==='ellipse'?colors.mint:kind==='parabola'?colors.gold:colors.purple;
  if(kind==='hyperbola'){const slope=p.b/p.a;for(const s of [-1,1])linePath(ctx,[[-1.0,.017,-s*slope],[1,.017,s*slope]].map(project),colors.muted,1,.54)}
  if(kind==='parabola'){linePath(ctx,[[-p.p,.020,-1],[-p.p,.020,1]].map(project),colors.gold,1.4,.7);badge(ctx,'준선',[-p.p,.02,-.68],colors.gold)}
  for(const path of paths){linePath(ctx,path.map(([x,y])=>project([x,.029,y])),color,6,.28,true);linePath(ctx,path.map(([x,y])=>project([x,.029,y])),color,3.2,1)}
  if(settings.flags.focus)C.focus(kind,p).forEach(([x,y],i)=>dot(ctx,[x,.046,y],colors.gold,kind==='parabola'?'F':`F${i+1}`));
  if(settings.flags.vertex)C.vertices(kind,p).forEach(([x,y],i)=>dot(ctx,[x,.046,y],colors.pink,`V${i+1}`,3.8));
  if(settings.flags.tangent){const [x,y]=C.point(kind,p);const [A,B]=C.tangentSegment(kind,p,.9),dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;linePath(ctx,[[x-ux*.42,.05,y-uy*.42],[x+ux*.42,.05,y+uy*.42]].map(project),colors.gold,2.4,.98);dot(ctx,[x,.07,y],colors.ink,'P',4.3)}
 }
 function draw3D(){ct.clearRect(0,0,cw,ch);let grad=ct.createRadialGradient(cw*.5,ch*.48,25,cw*.5,ch*.54,Math.max(cw,ch)*.76);grad.addColorStop(0,'#173c52');grad.addColorStop(.57,'#0b1e2d');grad.addColorStop(1,'#071524');ct.fillStyle=grad;ct.fillRect(0,0,cw,ch);
  const k=settings.kind,p=settings.pars[k];if(k==='master')drawMaster(ct,p);else drawSingle(ct,k,p);
  ct.save();ct.fillStyle='#89b3c7';ct.font='11px system-ui';ct.textAlign='right';ct.fillText('CONIC LAB · LIVE GEOMETRY',cw-18,ch-15);ct.restore();
 }
 function drawGraph(){const ctx=gt,w=gw,h=gh;ctx.clearRect(0,0,w,h);ctx.fillStyle='#091724';ctx.fillRect(0,0,w,h);
  const k=settings.kind,p=settings.pars[k];let chart=[];
  if(k==='master'){const theta=rad(p.theta);chart=C.section(p.theta,p.h,1440).map(seg=>seg.map(([x,y,z])=>[x/Math.cos(theta),z]));}else chart=C.curves(k,p,300);
  let xlim=1.08,ylim=.9;if(k==='master'){let limx=.2,limy=.2;for(const seg of chart)for(const [x,y] of seg){limx=Math.max(limx,Math.abs(x));limy=Math.max(limy,Math.abs(y))}xlim=Math.max(.23,limx*1.18);ylim=Math.max(.22,limy*1.18)}
  const pad=27,scale=Math.min((w-2*pad)/(2*xlim),(h-2*pad)/(2*ylim)),center=[w*.50,h*.53];const xy=([x,y])=>[center[0]+x*scale,center[1]-y*scale];
  ctx.save();ctx.strokeStyle='#28495c';ctx.lineWidth=.7;let interval=k==='master'?xlim/6:.2;for(let x=-xlim;x<=xlim+.001;x+=interval){let X=xy([x,0])[0];ctx.beginPath();ctx.moveTo(X,10);ctx.lineTo(X,h-9);ctx.stroke()}for(let y=-ylim;y<=ylim+.001;y+=interval){let Y=xy([0,y])[1];ctx.beginPath();ctx.moveTo(10,Y);ctx.lineTo(w-10,Y);ctx.stroke()}
  ctx.strokeStyle='#789eb0';ctx.lineWidth=1.2;linePath(ctx,[xy([-xlim,0]),xy([xlim,0])],'#95afbe',1,.65);linePath(ctx,[xy([0,-ylim]),xy([0,ylim])],'#95afbe',1,.65);
  ctx.fillStyle='#a6c1ce';ctx.font='11px system-ui';ctx.fillText('x',w-16,xy([0,0])[1]-7);ctx.fillText('y',xy([0,ylim])[0]+7,14);
  if(k==='hyperbola'){for(const sign of [-1,1])linePath(ctx,[xy([-xlim,-sign*xlim*p.b/p.a]),xy([xlim,sign*xlim*p.b/p.a])],colors.muted,1,.65)}
  if(k==='parabola'){linePath(ctx,[xy([-p.p,-ylim]),xy([-p.p,ylim])],colors.gold,1,.7)}
  for(const seg of chart)linePath(ctx,seg.map(xy),k==='ellipse'||k==='master'?colors.mint:k==='parabola'?colors.gold:colors.purple,2.7,1,true);
  function disc(pos,col,caption){let [x,y]=xy(pos);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,4.5,0,Math.PI*2);ctx.fill();if(caption){ctx.font='10px system-ui';ctx.fillStyle=col;ctx.fillText(caption,x+7,y-9)}}
  if(k!=='master'){if(settings.flags.focus)C.focus(k,p).forEach((pt,i)=>disc(pt,colors.gold,k==='parabola'?'F':`F${i+1}`));if(settings.flags.vertex)C.vertices(k,p).forEach((pt,i)=>disc(pt,colors.pink,`V${i+1}`));if(settings.flags.tangent){const A=C.tangentSegment(k,p,2);linePath(ctx,A.map(xy),colors.gold,1.4,.9);disc(C.point(k,p),'#f7ffff','P')}}
  ctx.restore();
 }
 function drawAll(){draw3D();drawGraph()}
 function setupControls(){let k=settings.kind,p=settings.pars[k];$('controlTitle').textContent=titles[k];$('controlDesc').textContent=descriptions[k];$('viewerTitle').textContent=k==='master'?`04 · ${C.labels[C.type(p.theta)]} · 이중 원뿔의 절단`:`${{ellipse:'01',parabola:'02',hyperbola:'03'}[k]} · ${titles[k]} · 모눈 좌표계`;
  $('graphTitle').textContent=k==='master'?'2D SECTION · 절단 평면의 실제 교선':'2D GRAPH · 방정식과 수학적 요소';
  $('graphNote').textContent=k==='master'?'3D 원뿔의 교선을 절단 평면에 펼쳐 그린 그래프야. 유한한 원뿔이라 곡선이 중간에 잘릴 수 있어.':'황금색 점은 초점, 분홍색 점은 꼭짓점, 노란색 직선은 선택한 점의 접선이야.';
  document.querySelectorAll('[data-kind]').forEach(b=>{const selected=b.dataset.kind===k;b.classList.toggle('selected',selected);b.setAttribute('aria-selected',String(selected))});
  let root=$('sliderPanel');root.innerHTML='';for(const [key,title,min,max,step] of fields[k]){let wrap=document.createElement('div');wrap.className='sliderbox';let head=document.createElement('div');head.className='sliderhead';let lab=document.createElement('label');lab.textContent=title;lab.htmlFor=`control-${key}`;let out=document.createElement('output');out.id=`out-${key}`;head.append(lab,out);let slider=document.createElement('input');slider.type='range';slider.id=`control-${key}`;slider.min=min;slider.max=max;slider.step=step;wrap.append(head,slider);root.append(wrap);slider.addEventListener('input',()=>{p[key]=+slider.value;if(k==='ellipse'){if(key==='a')p.b=Math.min(p.b,p.a-.02);if(key==='b')p.a=Math.max(p.a,p.b+.02)}syncSliders();updateMath();drawAll()})}syncSliders();
  const pr=$('presets');pr.innerHTML='';if(k==='master'){pr.className='presetbar';for(const [name,angle] of [['원 · 0°',0],['타원 · 30°',30],['포물선 · γ',C.GAMMA],['쌍곡선 · 70°',70]]){let b=document.createElement('button');b.textContent=name;b.addEventListener('click',()=>{p.theta=angle;syncSliders();updateMath();drawAll()});pr.append(b)}}else{pr.className='';if(k==='hyperbola'){let b=document.createElement('button');b.className='tiny-button';b.style.width='100%';b.textContent='선택된 쌍곡선 가지 전환 ↔';b.onclick=()=>{p.branch*=-1;updateMath();drawAll()};pr.append(b)}}
  const f=$('flagsPanel');f.innerHTML='';let opts=k==='master'?[]:[['grid','좌표 격자'],['focus','초점'],['vertex','꼭짓점'],['tangent','접선'],['labels','3D 라벨']];if(k==='master')opts=[['labels','3D 라벨']];for(const [key,label] of opts){let row=document.createElement('label');row.className='checkitem';let cb=document.createElement('input');cb.type='checkbox';cb.checked=settings.flags[key];cb.addEventListener('change',()=>{settings.flags[key]=cb.checked;drawAll()});row.append(cb,document.createTextNode(label));f.append(row)}
  $('notice').textContent=k==='master'?'수학적 기준: θ=0° → 원, 0°<θ<γ → 타원, θ=γ → 포물선, θ>γ → 쌍곡선. γ≈'+fmt(C.GAMMA,2)+'° (이 모형 기준).':'3D와 2D는 같은 방정식을 사용해. 매개변수를 바꾸면 초점·꼭짓점·접선도 다시 계산돼.';
  updateMath();drawAll();
 }
 function syncSliders(){let k=settings.kind,p=settings.pars[k];for(const [key] of fields[k]){let s=$(`control-${key}`),o=$(`out-${key}`);if(s){s.value=p[key];o.textContent=(key==='theta'&&Math.abs(p[key]-C.GAMMA)<1e-5)?'γ = '+fmt(C.GAMMA,2)+'°':fmt(p[key],key==='t'&&k==='ellipse'?0:key==='theta'?1:2)+(key==='theta'||(key==='t'&&k==='ellipse')?'°':'')}}}
 function updateMath(){let k=settings.kind,p=settings.pars[k];$('eqText').textContent=C.equation(k,p);$('detailText').textContent=C.math(k,p);if(k==='master')$('viewerTitle').textContent=`04 · ${C.labels[C.type(p.theta)]} · 이중 원뿔의 절단`}
 function switchMode(kind){if(!settings.pars[kind])return;settings.playing=false;$('animBtn').textContent='▶ 각도 변화';settings.kind=kind;settings.view={yaw:kind==='master'?-.85:-.45,pitch:kind==='master'?.53:.72,zoom:kind==='master'?1:1.04};setupControls()}
 document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>switchMode(b.dataset.kind)));
 $('resetBtn').addEventListener('click',()=>{settings.view={yaw:settings.kind==='master'?-.85:-.45,pitch:settings.kind==='master'?.53:.72,zoom:1};drawAll()});
 $('wideBtn').onclick=()=>{$('appRoot').classList.toggle('wide');$('wideBtn').textContent=$('appRoot').classList.contains('wide')?'⊟ 기본 화면':'⛶ 발표 모드';setTimeout(resize,50)};
 $('captureBtn').onclick=()=>{const a=document.createElement('a');a.download=`CONIC_LAB_${settings.kind}.png`;a.href=cv.toDataURL('image/png');a.click();toast('3D 장면 이미지를 저장했어')};
 $('animBtn').onclick=()=>{if(settings.kind!=='master')switchMode('master');settings.playing=!settings.playing;settings.last=performance.now();settings.dir=1;$('animBtn').textContent=settings.playing?'❚❚ 일시정지':'▶ 각도 변화';if(settings.playing)requestAnimationFrame(animate)};
 function animate(now){if(!settings.playing)return;let dt=Math.min(.1,(now-settings.last)/1000||.016);settings.last=now;let p=settings.pars.master;p.theta+=settings.dir*18*dt;if(p.theta>78){p.theta=78;settings.dir=-1}else if(p.theta<0){p.theta=0;settings.dir=1}syncSliders();updateMath();drawAll();requestAnimationFrame(animate)}
 const pointers=new Map();let previous=null;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});previous=null;cv.classList.add('dragging')});
 cv.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;let before=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){settings.view.yaw+=(e.clientX-before.x)*.008;settings.view.pitch=clamp(settings.view.pitch+(e.clientY-before.y)*.006,-1.2,1.2)}else if(pointers.size===2){let now=[...pointers.values()],distance=Math.hypot(now[0].x-now[1].x,now[0].y-now[1].y);if(previous)settings.view.zoom=clamp(settings.view.zoom*distance/previous,.45,3);previous=distance}draw3D()});
 const release=e=>{pointers.delete(e.pointerId);previous=null;if(!pointers.size)cv.classList.remove('dragging')};cv.addEventListener('pointerup',release);cv.addEventListener('pointercancel',release);cv.addEventListener('dblclick',()=>$('resetBtn').click());
 cv.addEventListener('wheel',e=>{e.preventDefault();settings.view.zoom=clamp(settings.view.zoom*Math.exp(-e.deltaY*.0012),.45,3);draw3D()},{passive:false});
 window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(['1','2','3','4'].includes(e.key)){switchMode({1:'ellipse',2:'parabola',3:'hyperbola',4:'master'}[e.key])}if(e.key===' '){e.preventDefault();$('animBtn').click()}if(e.key==='Escape'&&$('appRoot').classList.contains('wide'))$('wideBtn').click()});
 window.addEventListener('resize',resize);if(window.ResizeObserver){const observer=new ResizeObserver(()=>resize());observer.observe(cv.parentElement);observer.observe(gv)}
 setupControls();resize();
})();
