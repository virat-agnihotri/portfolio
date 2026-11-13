import * as THREE from 'three';
import {addPhotoFrame} from './photo-frames.js';

const smooth=t=>t*t*(3-2*t);
const heights={gallery:7.5,about:8.4,studio:6.9,contact:8};
// The exported neighborhood is batched for performance. Door leaves remain
// separate, and the four solid building blocks become shells with real openings.
export function createEntrances(rooms,world){
 const entries=new Map();
 for(const room of rooms){const side=Math.sign(room.x),hinge=new THREE.Group();hinge.position.set(side*6.3,0,room.z-side*.61);world.add(hinge);entries.set(room.id,{room,side,hinge,material:null});}
 function owner(object){for(let p=object.parent;p;p=p.parent)if(entries.has(p.name))return entries.get(p.name);return null;}
 function extract(object,geometry,material){const entry=owner(object);if(!entry)return false;const name=object.name;
  // The original solid 60cm foundation intersected the opening door.
  if(name.startsWith('foundation')||name.startsWith('door_step')){geometry.dispose();return true;}
  if(name===entry.room.id+'_body'){entry.material=material;geometry.dispose();return true;}
  if(name.startsWith('door_frame')){entry.frameMaterial=material;geometry.dispose();return true;}
  if(name==='door_'+entry.room.id||name.startsWith('door_glass')||name.startsWith('brass_handle')){
   // Keep the leaf above the lowered 14cm threshold and below the lintel.
   geometry.scale(1,.96,1);geometry.translate(-entry.hinge.position.x,.065,-entry.hinge.position.z);const leaf=new THREE.Mesh(geometry,material.clone());leaf.userData.roomId=entry.room.id;leaf.userData.baseEmissive=leaf.material.emissive.clone();leaf.userData.baseEmissiveIntensity=leaf.material.emissiveIntensity;leaf.castShadow=true;leaf.receiveShadow=true;entry.hinge.add(leaf);const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),new THREE.LineBasicMaterial({color:'#344335',transparent:true,opacity:.3}));outline.raycast=()=>{};entry.hinge.add(outline);return true;
  }return false;
 }
 function finish(){for(const {room,side,material,frameMaterial} of entries.values()){
  if(!material)continue;const h=heights[room.id],front=side*6.5,back=side*11.5;
  const box=(size,position,mat=material,name='')=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;world.add(mesh);return mesh;};
  // Front wall has a 1.5m by 2.85m opening; all other walls remain solid.
  for(const sign of [-1,1])box([.22,2.85,3.25],[front,1.425,room.z+sign*2.375]);
  box([.22,h-2.85,8],[front,(h+2.85)/2,room.z]);box([.22,h,8],[back,h/2,room.z]);
  for(const sign of [-1,1])box([5,h,.22],[side*9,h/2,room.z+sign*3.95]);
  const trim=frameMaterial||material;for(const sign of [-1,1])box([.2,2.75,.13],[side*6.43,1.45,room.z+sign*.7],trim);box([.2,.15,1.5],[side*6.43,2.75,room.z],trim);
  // A short dark vestibule provides depth during the move through the doorway.
  const vestibule=new THREE.MeshStandardMaterial({color:({about:'#293c55',studio:'#ad826c',contact:'#20434a'})[room.id]||'#38483d',roughness:1});box([4.6,.08,1.6],[side*8.7,.1,room.z],vestibule,room.id+' doorway floor');box([.7,.08,1.6],[side*6.1,.1,room.z],frameMaterial||material,room.id+' threshold');
  for(const sign of [-1,1])box([4.4,2.8,.1],[side*8.7,1.4,room.z+sign*.84],vestibule);
  if(room.id!=='gallery'){box([.035,2.8,1.58],[side*11.34,1.4,room.z],vestibule);addPhotoFrame(world,room.id+'-entry',{position:[side*11.28,1.7,room.z],rotation:-side*Math.PI/2,width:.82,height:1.16,color:room.id==='contact'?'#b38166':'#b69a6c'});}
 }}
 function reset(){for(const entry of entries.values())entry.hinge.rotation.y=0;}
 function hover(id){for(const entry of entries.values()){const active=entry.room.id===id;for(const object of entry.hinge.children){if(object.isMesh){object.material.emissive.copy(active?new THREE.Color('#b9904d'):object.userData.baseEmissive);object.material.emissiveIntensity=active?.42:object.userData.baseEmissiveIntensity;}else if(object.isLineSegments){object.material.color.set(active?'#f5d69a':'#344335');object.material.opacity=active?.95:.3;}}}}
 return{entries,extract,finish,reset,hover};
}

// Deterministic stages also make reduced-motion behavior and timing testable.
export function entrancePose(elapsed,duration=1){
 const approach=1.65*duration,opening=.95*duration,walk=1.05*duration,fade=.22*duration;
 if(elapsed<approach)return{stage:'approach',t:smooth(Math.max(0,elapsed/approach)),door:0,opacity:1};
 if(elapsed<approach+opening){const t=smooth((elapsed-approach)/opening);return{stage:'open',t,door:t,opacity:1};}
 if(elapsed<approach+opening+walk){const t=smooth((elapsed-approach-opening)/walk);return{stage:'walk',t,door:1,opacity:1};}
 if(elapsed<approach+opening+walk+fade)return{stage:'fade',t:1,door:1,opacity:1-(elapsed-approach-opening-walk)/fade};
 return{stage:'complete',t:1,door:1,opacity:0};
}
