/* Real-camera verification overlay. Does NOT simulate tracking or invent success. */
(function(){'use strict';
  const $=id=>document.getElementById('qa-'+id);
  function show(key,value,ok=null){const n=$(key);if(!n)return;n.textContent=value;n.className='val '+(ok===true?'yes':ok===false?'bad':'neutral')}
  let found=false;let updates=0;let lastRoot=null;
  document.getElementById('qa-fold').onclick=()=>{
    const p=document.getElementById('qa-board');p.classList.toggle('compact');
    document.getElementById('qa-fold').textContent=p.classList.contains('compact')?'AR 실기기 검증 ⌄':'AR 실기기 검증 ⌃';
  };
  function inspect(){
    const scene=document.getElementById('scene');
    show('engine',window.AFRAME&&scene&&scene.components&&scene.components.arjs?'AR.js 장면 실행됨':'AR.js 로딩 확인 필요',!!(window.AFRAME&&scene?.components?.arjs));
    const video=[...document.querySelectorAll('video')].find(v=>v.videoWidth>0);
    show('camera',video?'영상 '+video.videoWidth+'×'+video.videoHeight:'영상 없음 / 권한 확인',!!video);
    if(!found)return;
    const marker=document.getElementById('marker-master');
    const root=marker?.object3D?.children?.[0];
    if(!root){show('model','3D 루트 없음',false);return;}
    let cone=0,plane=0;let trans=[];let curves=0;
    root.traverse(o=>{
      const m=o.material;
      if(m && m.opacity<1){trans.push(m.opacity);if(m.opacity===.17)cone++;if(m.opacity===.19)plane++;}
      if(o.geometry && o.geometry.type==='TubeGeometry')curves++;
    });
    show('model',cone>=2&&plane>=1&&curves>=1?'원뿔 2개·절단면·교선 있음':'3D 구성 확인 필요',cone>=2&&plane>=1&&curves>=1);
    show('alpha',cone>=2&&plane>=1?'원뿔 17% / 평면 19%':'투명도 확인 필요',cone>=2&&plane>=1);
    lastRoot=root.children[0];
  }
  const m=document.getElementById('marker-master');
  m?.addEventListener('markerFound',()=>{found=true;show('master','실제 감지 이벤트 수신',true);requestAnimationFrame(inspect)});
  m?.addEventListener('markerLost',()=>{found=false;show('master','인식 해제 · 마커 다시 비추기',null)});
  document.addEventListener('input',e=>{
    if(!found||e.target?.dataset?.slider!=='theta')return;
    let root=m?.object3D?.children?.[0];const before=root?.children?.[0];
    requestAnimationFrame(()=>{
      const after=root?.children?.[0];let changed=Boolean(after&&before&&after!==before);
      if(changed)updates++;
      show('change',changed?'형상 재생성 확인 · '+updates+'회':'조작 반영 확인 필요',changed);
      if(window.CONIC){const a=+e.target.value;show('theta',`${a.toFixed(1)}° / ${window.CONIC.labels[window.CONIC.type(a)]}`,true)}
      inspect();
    });
  },true);
  window.addEventListener('camera-error',()=>show('camera','카메라 오류',false));
  window.addEventListener('error',e=>{if(e.target?.tagName==='SCRIPT')$('exceptions').textContent='외부 AR 라이브러리 불러오기 실패 가능성이 있습니다.';},true);
  setInterval(inspect,1500);inspect();
})();
