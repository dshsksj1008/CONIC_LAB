(()=>{'use strict';const C=window.CONIC,UI=window.CONIC_UI,state=UI.newState();const roots={};let active=null,started=false;
const status=document.getElementById('tracking-status'),note=document.getElementById('ar-banner'),controls=document.getElementById('controls'),meta=document.getElementById('active-curve'),panel=document.querySelector('.ar-bottom');
function start(){if(started)return;started=true;if(!window.AFRAME?.THREE){status.textContent='A-Frame 로딩 실패 — 인터넷 연결 확인';return}const THREE=AFRAME.THREE,geometry=window.CONIC_GEOMETRY.make(THREE),ui=UI.build(controls,state,update,{prefix:'ar'});
function make(kind){const g=roots[kind],p=state.p[kind];if(!g)return;if(kind==='master')geometry.makeMaster(g,p,state.flags);else geometry.makeSingle(g,kind,p,state.flags)}
function update(){make(state.kind);ui.render(false);if(active)meta.textContent=state.kind==='master'?`종합 · ${C.labels[C.type(state.p.master.theta)]}`:C.labels[state.kind]}
for(const kind of ['ellipse','parabola','hyperbola','master']){let m=document.getElementById('marker-'+kind);const root=new THREE.Group();m.object3D.add(root);roots[kind]=root;make(kind);
m.addEventListener('markerFound',()=>{active=kind;state.kind=kind;status.classList.add('ok');status.textContent=`● ${C.labels[kind]} 마커 인식됨`;meta.textContent=C.labels[kind];note.classList.add('hidden');ui.render(true);make(kind)});
m.addEventListener('markerLost',()=>{if(active===kind){active=null;status.classList.remove('ok');status.textContent='◎ 마커가 화면에 보이도록 비춰주세요';meta.textContent='마커 추적 대기'}})}
ui.render(true);document.getElementById('fold-controls').onclick=()=>{panel.classList.toggle('collapsed');document.getElementById('fold-controls').textContent=panel.classList.contains('collapsed')?'조작 펼치기':'조작 접기'};
setTimeout(()=>{if(!active)note.classList.add('hidden')},8500);
}
const scene=document.getElementById('scene');if(scene?.hasLoaded)start();else scene?.addEventListener('loaded',start);
if(!['https:','file:'].includes(location.protocol)&&!['localhost','127.0.0.1'].includes(location.hostname)){note.textContent='스마트폰 카메라는 HTTPS로 배포된 사이트에서 실행하세요.'}
window.addEventListener('error',e=>{console.error('CONIC AR',e);});
})();
