(()=>{'use strict';const C=window.CONIC,UI=window.CONIC_UI,state=UI.newState(),THREE=AFRAME.THREE,geo=window.CONIC_GEOMETRY.make(THREE);
const cvs=document.getElementById('three-canvas'),graph=document.getElementById('graph-canvas'),gc=graph.getContext('2d'),host=document.getElementById('controls');
const renderer=new THREE.WebGLRenderer({canvas:cvs,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(44,1,.01,80),root=new THREE.Group();scene.add(root);let az=.8,el=.37,zoom=3.5,down=null;
const ctrl=UI.build(host,state,update,{prefix:'explore'});
const resetView=()=>{if(state.kind==='master'){az=.85;el=.32;zoom=5.2}else{az=.45;el=.72;zoom=2.75}};
function resize(){const rect=cvs.parentElement.getBoundingClientRect();renderer.setSize(Math.max(100,rect.width),Math.max(100,rect.height),false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();graph.width=Math.round(graph.clientWidth*(devicePixelRatio||1));graph.height=Math.round(graph.clientHeight*(devicePixelRatio||1));drawGraph()}
function frame(){const target=new THREE.Vector3(0,state.kind==='master'?C.L+.05:0,0);let cx=zoom*Math.cos(el)*Math.sin(az),cy=zoom*Math.sin(el),cz=zoom*Math.cos(el)*Math.cos(az);camera.position.set(cx,cy+target.y,cz);camera.lookAt(target);renderer.render(scene,camera);requestAnimationFrame(frame)}
cvs.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY,az,el];cvs.setPointerCapture(e.pointerId)});cvs.addEventListener('pointermove',e=>{if(!down)return;az=down[2]+(e.clientX-down[0])*.008;el=C.clamp(down[3]+(e.clientY-down[1])*.006,-1.15,1.30)});cvs.addEventListener('pointerup',()=>down=null);cvs.addEventListener('pointercancel',()=>down=null);cvs.addEventListener('wheel',e=>{e.preventDefault();zoom=C.clamp(zoom*(1+Math.sign(e.deltaY)*.09),1.1,9)},{passive:false});
function update(){let k=state.kind,p=state.p[k];if(k==='master')geo.makeMaster(root,p,state.flags);else geo.makeSingle(root,k,p,state.flags);ctrl.render(false);document.getElementById('view-title').textContent=C.labels[k]+' · 실시간 3D';document.getElementById('graph-title').textContent=k==='master'?'절단 평면의 실제 교선':'교과서 방정식 좌표 그래프';drawGraph()}
function drawGraph(){let cssW=graph.clientWidth,cssH=graph.clientHeight;if(!cssW||!cssH)return;let W=graph.width,H=graph.height,ratio=W/cssW;gc.setTransform(ratio,0,0,ratio,0,0);let w=cssW,h=cssH;gc.clearRect(0,0,w,h);gc.fillStyle='#081b2d';gc.fillRect(0,0,w,h);
let kind=state.kind,p=state.p[kind],paths=[],bound=kind==='master'?1.10:0.90,note='';
if(kind==='master'){let co=Math.cos(p.theta*Math.PI/180);paths=C.section(p.theta,p.h).map(v=>v.map(([x,y,z])=>[x/Math.max(co,.01),z]));let b=Math.max(.45,...paths.flatMap(a=>a.flatMap(([x,z])=>[Math.abs(x),Math.abs(z)])));bound=Math.max(.8,b*1.08);note='교선의 실제 단면 좌표 · 화면 스케일 자동 조정';}else{paths=C.curves(kind,p);note='격자 1칸 = 상대 좌표 0.2';}
const scale=Math.min(w,h)*.43/bound,map=(x,z)=>[w*.5+x*scale,h*.5-z*scale];gc.lineWidth=1;gc.strokeStyle='#1c4258';let step=bound>1.9?.5:.2;for(let a=-Math.ceil(bound/step);a<=Math.ceil(bound/step);a++){let v=a*step;gc.beginPath();gc.moveTo(...map(-bound,v));gc.lineTo(...map(bound,v));gc.moveTo(...map(v,-bound));gc.lineTo(...map(v,bound));gc.stroke()}
gc.strokeStyle='#86a6b9';gc.lineWidth=1.5;gc.beginPath();gc.moveTo(...map(-bound,0));gc.lineTo(...map(bound,0));gc.moveTo(...map(0,-bound));gc.lineTo(...map(0,bound));gc.stroke();
function path(pts,color='#61ead1',width=3,dash=[]){if(pts.length<2)return;gc.strokeStyle=color;gc.lineWidth=width;gc.setLineDash(dash);gc.beginPath();pts.forEach(([x,z],i)=>{let q=map(x,z);if(i===0)gc.moveTo(...q);else gc.lineTo(...q)});gc.stroke();gc.setLineDash([])}
function point(x,z,text,color='#ffcb77'){const [X,Y]=map(x,z);gc.fillStyle=color;gc.beginPath();gc.arc(X,Y,4.5,0,2*Math.PI);gc.fill();gc.font='12px sans-serif';gc.fillText(text,X+8,Y-8)}
for(let pts of paths)path(pts,kind==='ellipse'?'#57e6cf':kind==='parabola'?'#ffcc7d':kind==='hyperbola'?'#c1adff':'#57e6cf',3);
if(kind!=='master'){
if(state.flags.focus)C.focus(kind,p).forEach(([x,z],i)=>point(x,z,kind==='parabola'?'F':`F${i+1}`));
if(state.flags.vertex)C.vertices(kind,p).forEach(([x,z],i)=>point(x,z,`V${i+1}`,'#ff8ea2'));
if(kind==='parabola')path([[-p.p,-bound],[-p.p,bound]],'#ffbe69',1.8,[5,5]);
if(kind==='hyperbola'){let q=p.b/p.a;path([[-bound,-bound*q],[bound,bound*q]],'#69899e',1,[7,5]);path([[-bound,bound*q],[bound,-bound*q]],'#69899e',1,[7,5])}
if(state.flags.tangent){const [x,z]=C.point(kind,p);const [a,b]=C.tangentSegment(kind,p,bound);path([a,b],'#ffdf7b',1.7);point(x,z,'P','#ebf7ff')}}
gc.font='11px system-ui';gc.fillStyle='#a8c9d9';gc.fillText('x',w-14,h*.5-9);gc.fillText('y',w*.5+8,14);gc.fillStyle='#7ba6be';gc.fillText(note,14,h-12);
}
for(const tab of document.querySelectorAll('[data-kind]'))tab.addEventListener('click',()=>{state.kind=tab.dataset.kind;document.querySelectorAll('[data-kind]').forEach(b=>b.classList.toggle('active',b===tab));resetView();ctrl.render(true);update()});
document.getElementById('reset-view').onclick=resetView;
window.addEventListener('resize',resize);resetView();ctrl.render(true);update();resize();frame();
})();
