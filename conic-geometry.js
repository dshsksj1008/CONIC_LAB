/* Three.js geometry factory shared by WebAR and standalone 3D explorer.
   ALL visible mathematical curves are regenerated from real equations. */
(()=>{'use strict';const M=window.CONIC;
const COLORS={cyan:0x54ecd4,orange:0xffc568,violet:0xb6a2ff,red:0xff647e,blue:0x67baf5,grid:0x50728a,focus:0xffd66d,vertex:0xff7e9b,tangent:0xfad56b,white:0xe9f6ff};
function make(THREE){
function material(c,op=1){return new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,transparent:op<1,opacity:op,depthWrite:op===1})}
function line(g,pts,color=COLORS.cyan,closed=false,op=1){if(pts.length<2)return;const geom=new THREE.BufferGeometry().setFromPoints(pts.map(a=>new THREE.Vector3(...a)));let obj=new THREE.Line(geom,new THREE.LineBasicMaterial({color,transparent:op<1,opacity:op}));g.add(obj);if(closed&&pts.length>2){line(g,[pts.at(-1),pts[0]],color)}return obj}
function tube(g,pts,color=COLORS.cyan,width=.005,closed=false){if(pts.length<2)return;let positions=pts.map(q=>new THREE.Vector3(...q));if(positions.length>2){let curve=new THREE.CatmullRomCurve3(positions,closed,'centripetal');let geom=new THREE.TubeGeometry(curve,Math.min(280,Math.max(24,positions.length)),width,5,closed);g.add(new THREE.Mesh(geom,material(color)))}else{let a=positions[0],b=positions[1],d=b.clone().sub(a),len=d.length();if(len<1e-6)return;let mesh=new THREE.Mesh(new THREE.CylinderGeometry(width,width,len,5),material(color));mesh.position.copy(a.clone().add(b).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(mesh)}}
function dot(g,p,col=COLORS.focus,r=.016){let s=new THREE.Mesh(new THREE.SphereGeometry(r,12,9),material(col));s.position.set(...p);g.add(s)}
function label(g,word,p,col='#dff6ff',size=.13){const c=document.createElement('canvas');c.width=256;c.height=80;const c2=c.getContext('2d');c2.fillStyle='#061a2acc';c2.fillRect(0,2,256,76);c2.fillStyle=col;c2.font='bold 34px sans-serif';c2.textAlign='center';c2.textBaseline='middle';c2.fillText(word,128,42);const map=new THREE.CanvasTexture(c);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:false}));sprite.position.set(...p);sprite.scale.set(size*2.1,size*.65,1);g.add(sprite);return sprite}
function clear(g){for(const c of [...g.children]){g.remove(c);c.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){for(const m of Array.isArray(obj.material)?obj.material:[obj.material]){if(m.map)m.map.dispose();m.dispose()}}})}}
function grid(g,extent=.78,step=.1){const plane=new THREE.Mesh(new THREE.PlaneGeometry(extent*2,extent*2),material(0x0c2940,.55));plane.rotation.x=-Math.PI/2;plane.position.y=.003;g.add(plane);const E=extent;for(let t=-E;t<E+.001;t+=step){let v=Math.round(t*1000)/1000;line(g,[[-E,.007,v],[E,.007,v]],COLORS.grid,false,v===0?.8:.25);line(g,[[v,.007,-E],[v,.007,E]],COLORS.grid,false,v===0?.8:.25)}tube(g,[[-E,.01,0],[E,.01,0]],COLORS.white,.003);tube(g,[[0,.01,-E],[0,.01,E]],COLORS.white,.003);label(g,'x',[E,.025,-.07]);label(g,'y',[.06,.025,E]);}
function makeSingle(g,kind,p,flags={}){clear(g);const col=kind==='ellipse'?COLORS.cyan:kind==='parabola'?COLORS.orange:COLORS.violet;if(flags.grid!==false)grid(g);
 for(const curve of M.curves(kind,p)){const p3=curve.map(([x,z])=>[x,.038,z]);if(p3.length>2)tube(g,p3,col,.0085)}
 if(flags.focus!==false){M.focus(kind,p).forEach(([x,z],i)=>{dot(g,[x,.04,z]);if(flags.labels!==false)label(g,kind==='parabola'?'F':`F${i+1}`,[x,.105,z],'#ffe29a',.09)})}
 if(flags.vertex!==false){M.vertices(kind,p).forEach(([x,z],i)=>{dot(g,[x,.04,z],COLORS.vertex,.012);if(flags.labels!==false)label(g,`V${i+1}`,[x,.1,z],'#ff9ab4',.08)})}
 if(kind==='parabola'){line(g,[[-p.p,.025,-.78],[-p.p,.025,.78]],COLORS.orange);if(flags.labels!==false)label(g,'준선',[-p.p,.10,-.56],'#f9d99f',.14)}
 if(kind==='hyperbola'){const k=p.b/p.a;line(g,[[-.78,.015,-.78*k],[.78,.015,.78*k]],COLORS.grid);line(g,[[-.78,.015,.78*k],[.78,.015,-.78*k]],COLORS.grid)}
 if(flags.tangent!==false){const [x,z]=M.point(kind,p);dot(g,[x,.06,z],COLORS.white,.012);const [a,b]=M.tangentSegment(kind,p,1); // clip to a reasonable segment around point
 const d=[b[0]-a[0],b[1]-a[1]],norm=Math.hypot(...d);if(norm>1e-6){let ux=d[0]/norm,uz=d[1]/norm;line(g,[[x-ux*.47,.055,z-uz*.47],[x+ux*.47,.055,z+uz*.47]],COLORS.tangent)}if(flags.labels!==false)label(g,'P',[x,.13,z],'#ffffff',.08)}
}
function cone(g,sgn){const N=72,K=M.K,L=M.L,verts=[],inds=[];
 for(const yy of [0.001,L]){for(let j=0;j<N;j++){let phi=2*Math.PI*j/N;verts.push(K*yy*Math.cos(phi),sgn*yy,K*yy*Math.sin(phi))}}
 for(let j=0;j<N;j++){let n=(j+1)%N;inds.push(j,N+j,N+n,j,N+n,n)}let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(inds);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,material(sgn>0?0x51b9e9:0x829cef,.17)));
 for(const y of [.35,.7,L]){const P=[];for(let i=0;i<=N;i++){let f=i*2*Math.PI/N;P.push([K*y*Math.cos(f),sgn*y,K*y*Math.sin(f)])}line(g,P,0x72b5e6)}for(let j=0;j<20;j++){let f=2*Math.PI*j/20;line(g,[[0,0,0],[K*L*Math.cos(f),sgn*L,K*L*Math.sin(f)]],0x75a4da,false,.64)}
}
function makeMaster(g,p,flags={}){clear(g); // anchor the lower tip at the paper marker, otherwise most of cone lies below it
let anchor=new THREE.Group();anchor.position.y=M.L+.05;g.add(anchor);
cone(anchor,+1);cone(anchor,-1);
const T=p.theta*Math.PI/180,co=Math.cos(T),si=Math.sin(T),h=p.h,S=.87;
// Plane local basis U=(cos T,sin T,0), V=(0,0,1); normal=(-sin T,cos T,0)
const corners=[[-S,-S],[S,-S],[S,S],[-S,S]].map(([u,v])=>[u*co,h+u*si,v]);let list=[...corners[0],...corners[1],...corners[2],...corners[0],...corners[2],...corners[3]],geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(list,3));geom.computeVertexNormals();anchor.add(new THREE.Mesh(geom,material(COLORS.orange,.19)));
for(let i=0;i<4;i++)tube(anchor,[corners[i],corners[(i+1)%4]],COLORS.orange,.005);
for(const path of M.section(p.theta,p.h,1600)){tube(anchor,path,COLORS.cyan,.010)}
if(flags.dandelin||p.dandelin){const list=M.dandelin(p.theta,p.h);list.forEach((s,i)=>{const sph=new THREE.Mesh(new THREE.SphereGeometry(s.radius,22,14),material(i===0?0xffd580:0xc2a5fa,.23));sph.position.set(...s.center);anchor.add(sph);dot(anchor,s.tangent,COLORS.focus,.018);label(anchor,`F${i+1}`,[s.tangent[0],s.tangent[1]+.10,s.tangent[2]],'#fff4cf',.12)})}
label(anchor,`${M.labels[M.type(p.theta)]}`,[.1,1.19,0],'#b8fff0',.20);}
return {makeSingle,makeMaster,clear,grid};}
window.CONIC_GEOMETRY={make};})();
