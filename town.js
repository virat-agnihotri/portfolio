import * as THREE from 'three';

// Instanced scenery fills the side views without adding dozens of GLB assets.
// The portfolio rooms stay on the main street; these houses form its backdrop.
export function addTown(scene){
 let seed=739;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const houses=[];for(const side of [-1,1])for(let row=0;row<3;row++)for(let i=0;i<13;i++)houses.push({x:side*(19+row*14+random()*3),z:22-i*8.8+(row%2)*3,w:5+random()*2.5,d:5+random()*2,h:5+random()*6,row});
 const material=color=>{const m=new THREE.MeshStandardMaterial({color,roughness:1});m.onBeforeCompile=shader=>{shader.vertexShader='varying float vTownX;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTownX=abs((modelMatrix*instanceMatrix*vec4(position,1.)).x);');shader.fragmentShader='varying float vTownX;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\ngl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,smoothstep(12.,63.,vTownX)*.8);');};m.customProgramCacheKey=()=> 'foggy-town-v1';return m;};
 const unit=new THREE.BoxGeometry(1,1,1),wallMaterial=material('#ffffff'),roofMaterial=material('#a77e67'),windowMaterial=material('#657f79'),trimMaterial=material('#e2d3b8');
 const roofGeometry=new THREE.BufferGeometry();roofGeometry.setAttribute('position',new THREE.Float32BufferAttribute([
 -.5,0,.5,.5,0,.5,0,1,.5, -.5,0,-.5,0,1,-.5,.5,0,-.5,
 -.5,0,-.5,-.5,0,.5,0,1,.5, -.5,0,-.5,0,1,.5,0,1,-.5,
 .5,0,.5,.5,0,-.5,0,1,-.5, .5,0,.5,0,1,-.5,0,1,.5
 ],3));roofGeometry.computeVertexNormals();
 const walls=new THREE.InstancedMesh(unit,wallMaterial,houses.length),roofs=new THREE.InstancedMesh(roofGeometry,roofMaterial,houses.length),windows=new THREE.InstancedMesh(unit,windowMaterial,houses.length*24),trims=new THREE.InstancedMesh(unit,trimMaterial,houses.length*5),doors=new THREE.InstancedMesh(unit,windowMaterial,houses.length*4);
 const palettes=['#ba9884','#c6b799','#a2b0a0','#c3aaa0','#a7adb1','#d2bea0'];let wi=0,ti=0,di=0;const dummy=new THREE.Object3D();
 function place(mesh,index,x,y,z,sx,sy,sz){dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);}
 houses.forEach((h,i)=>{place(walls,i,h.x,h.h/2,h.z,h.w,h.h,h.d);walls.setColorAt(i,new THREE.Color(palettes[i%palettes.length]));place(roofs,i,h.x,h.h,h.z,h.w+.6,1.5+random(),h.d+.6);roofs.setColorAt(i,new THREE.Color(i%3===0?'#7f8883':'#aa7c65'));
 for(const side of [-1,1]){
 for(let row=0;row<2;row++)for(let col=0;col<3;col++){const y=row?h.h-1.5:2.1;place(windows,wi++,h.x+side*(h.w/2+.012),y,h.z+(col-1)*h.d*.28,.06,1.1,.8);place(windows,wi++,h.x+(col-1)*h.w*.28,y,h.z+side*(h.d/2+.012),.8,1.1,.06);}
 place(doors,di++,h.x+side*(h.w/2+.02),.95,h.z,.07,1.9,.7);place(doors,di++,h.x,.95,h.z+side*(h.d/2+.02),.7,1.9,.07);
 }
 place(trims,ti++,h.x+h.w*.25,h.h+.9,h.z+.7,.45,1.8,.55);
 for(const zside of [-1,1]){place(trims,ti++,h.x,h.h-.2,h.z+zside*h.d/2,h.w+.2,.16,.15);place(trims,ti++,h.x,.25,h.z+zside*h.d/2,h.w+.1,.4,.12);}
 });
 for(const mesh of [walls,roofs,windows,trims,doors]){mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=false;mesh.receiveShadow=false;mesh.computeBoundingSphere();scene.add(mesh);}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,150),new THREE.MeshStandardMaterial({color:'#b6b29d',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(0,-.09,-25);scene.add(ground);
 // Side lanes and low garden walls break up the empty strips between rows.
 const lanes=new THREE.InstancedMesh(unit,new THREE.MeshStandardMaterial({color:'#c3b79e',roughness:1}),8);let li=0;
 for(const side of [-1,1])for(const z of [13,-10,-33,-58])place(lanes,li++,side*31,-.035,z,49,.05,2.5);lanes.computeBoundingSphere();scene.add(lanes);
 const gardens=new THREE.InstancedMesh(unit,material('#7d8c70'),30);let gi=0;for(const side of [-1,1])for(let i=0;i<15;i++)place(gardens,gi++,side*14,.45,17-i*6.5,1.1,.9,3.4);gardens.computeBoundingSphere();scene.add(gardens);
 return{houseCount:houses.length};
}

// A gentle glance never changes the movement heading or takes control while
// the visitor drags to look. Names only appear within one storefront's width.
export function nearbyShop(rooms,position){return rooms.reduce((best,room)=>{const dz=Math.abs(position.z-room.z);if(dz>6.5)return best;return !best||dz<Math.abs(position.z-best.z)?room:best;},null);}
export function shopGlance(room,position,yaw){if(!room)return 0;const proximity=Math.max(0,1-Math.abs(position.z-room.z)/6.5),strength=proximity*proximity*(3-2*proximity);let angle=Math.atan2(-(room.x-position.x),-(room.z-position.z))-yaw;angle=Math.atan2(Math.sin(angle),Math.cos(angle));return angle*strength;}
