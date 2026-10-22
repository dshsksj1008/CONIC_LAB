/* Shared control panel for marker camera and standalone 3D explorer */
(()=>{'use strict';const C=window.CONIC;
const fields={ellipse:[['a','장반경 a',.26,.62,.01],['b','단반경 b',.15,.53,.01],['t','접점 각도',-180,180,1]],parabola:[['p','초점거리 p',.10,.32,.01],['t','접점 y좌표',-.55,.55,.01]],hyperbola:[['a','실축 반길이 a',.21,.43,.01],['b','허축 반길이 b',.13,.38,.01],['t','접점 매개변수',-1.0,1.0,.01]],master:[['theta','절단각 θ',0,80,.1],['h','절단위치 h',.12,.42,.01]]};
const flagsDef={grid:true,focus:true,vertex:true,tangent:true,labels:true,dandelin:false};
function newState(){return {kind:'master',p:JSON.parse(JSON.stringify(C.init)),flags:{...flagsDef}}}
function build(root,state,redraw,options={}){let currentKind='';const kindP=()=>state.p[state.kind];
function render(rebuild){const k=state.kind,p=kindP();if(rebuild||k!==currentKind){currentKind=k;root.innerHTML='';const title=document.createElement('div');title.className='panel-title';title.innerHTML=`<span class="tag">LIVE PARAMETERS</span><h3>${C.labels[k]} 조절</h3>`;root.append(title);
for(const [key,label,min,max,step] of fields[k]){const wrap=document.createElement('div');wrap.className='range-row';const elid=`v4-${options.prefix||'lab'}-${key}`;wrap.innerHTML=`<div class="range-label"><label for="${elid}">${label}</label><output data-out="${key}"></output></div><input id="${elid}" data-slider="${key}" type="range" min="${min}" max="${max}" step="${step}">`;root.append(wrap);
wrap.querySelector('input').addEventListener('input',e=>{let value=+e.target.value;p[key]=value;if(k==='ellipse'){if(key==='a'&&p.a<=p.b+.02)p.b=Math.max(.15,p.a-.02);if(key==='b'&&p.b>=p.a-.02)p.b=p.a-.02}
redraw();render(false)})}
if(k==='master'){const div=document.createElement('div');div.className='preset-row';div.innerHTML='<button data-set="circle">원 0°</button><button data-set="ellipse">타원 30°</button><button data-set="parabola">포물선 γ</button><button data-set="hyperbola">쌍곡선 70°</button>';root.append(div);div.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{p.theta={circle:0,ellipse:30,parabola:C.GAMMA,hyperbola:70}[b.dataset.set];redraw();render(false)})}
if(k==='hyperbola'){const b=document.createElement('button');b.className='subbutton';b.id='branch';b.onclick=()=>{p.branch*=-1;redraw();render(false)};root.append(b)}
const c=document.createElement('div');c.className='toggles';const enabled=k==='master'?['dandelin','labels']:['grid','focus','vertex','tangent','labels'];const toggles={grid:'격자',focus:'초점',vertex:'꼭짓점',tangent:'접선',labels:'3D 라벨',dandelin:'단델랭 구 (타원)'};for(const flag of enabled){let label=document.createElement('label');label.className='toggle';const cb=document.createElement('input');cb.type='checkbox';cb.checked=state.flags[flag];cb.onchange=e=>{state.flags[flag]=e.target.checked;redraw()};label.append(cb,document.createTextNode(' '+toggles[flag]));c.append(label)}root.append(c);
const math=document.createElement('div');math.className='math-pane';math.innerHTML='<span class="tag">EQUATION</span><div class="formula" id="formula-read"></div><div class="math-details" id="math-details"></div>';root.append(math)}
for(const [key] of fields[k]){const input=root.querySelector(`[data-slider="${key}"]`),out=root.querySelector(`[data-out="${key}"]`);if(input){input.value=p[key];out.textContent=Number(p[key]).toFixed(key==='t'&&k==='ellipse'?0:key==='theta'?1:2)+(key==='theta'||key==='t'&&k==='ellipse'?'°':'')}}
if(k==='hyperbola'){let branch=root.querySelector('#branch');if(branch)branch.textContent=`${p.branch>0?'오른쪽':'왼쪽'} 가지 선택 ↔`}
const eq=root.querySelector('#formula-read');eq.textContent=C.equation(k,p);const detail=root.querySelector('#math-details');detail.textContent=C.math(k,p);if(k==='master'&&state.flags.dandelin&&C.type(p.theta)!=='ellipse'&&C.type(p.theta)!=='circle')detail.textContent+='\n단델랭 구는 이 버전에서 원·타원 단면에만 표시합니다.';
}
return {render};}
window.CONIC_UI={newState,build};})();
