import * as THREE from 'three';
import {galleryLayout} from './gallery-layout.js';

export function createGalleryRoom(world,scene){
 const group=new THREE.Group();group.name='Gallery evening finishes';world.add(group);
 const wall=new THREE.MeshStandardMaterial({color:'#444e49',roughness:1}),floor=new THREE.MeshStandardMaterial({color:'#51473b',roughness:.85}),trim=new THREE.MeshStandardMaterial({color:'#b99a65',roughness:.45,metalness:.4}),ceiling=new THREE.MeshStandardMaterial({color:'#555a51',roughness:1});
 function box(size,position,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...position);group.add(mesh);return mesh;}
 box([12.7,.03,14.9],[60,.087,-5],floor);box([12.7,.025,14.9],[60,4.765,-5],ceiling);
 for(const x of [53.66,66.34]){box([.035,4.5,14.7],[x,2.5,-5],wall);box([.075,.07,14.7],[x,1.45,-5],trim);box([.075,.12,14.7],[x,.21,-5],trim);}
 box([12.6,4.5,.035],[60,2.5,-12.36],wall);
 // A fine inlaid floor border and ceiling tracks give the room a gallery rhythm.
 for(const x of [54.1,65.9]){box([.025,.01,13.6],[x,.108,-5],trim);box([.07,.09,13.5],[x,4.68,-5],trim);}
 for(const z of [1.75,-11.75])box([11.8,.01,.025],[60,.109,z],trim);
 const strips=new THREE.MeshBasicMaterial({color:'#e8c889'});for(const slot of galleryLayout){const normal=new THREE.Vector3(Math.sin(slot.rotation),0,Math.cos(slot.rotation));const mesh=box([3.3,.025,.025],[slot.position[0]+normal.x*.26,slot.position[1]+1.37,slot.position[2]+normal.z*.26],strips);mesh.rotation.y=slot.rotation;}
 // Four unshadowed spots illuminate the nearest two exhibits, keeping the
 // lighting budget fixed even when all five model groups have loaded.
 const spots=[];for(let i=0;i<4;i++){const light=new THREE.SpotLight(i%2?'#dce9ef':'#ffe3af',i%2?38:30,8,.7,.85,2);light.visible=false;light.castShadow=false;scene.add(light,light.target);spots.push(light);}
 return{spots,update(active,position){group.visible=active;spots.forEach(light=>light.visible=active);if(!active)return;const nearest=[...galleryLayout].sort((a,b)=>Math.hypot(a.plinth[0]-position.x,a.plinth[2]-position.z)-Math.hypot(b.plinth[0]-position.x,b.plinth[2]-position.z)).slice(0,2);nearest.forEach((slot,index)=>{const normal=new THREE.Vector3(Math.sin(slot.rotation),0,Math.cos(slot.rotation));const poster=spots[index*2],model=spots[index*2+1];poster.position.set(slot.position[0]+normal.x*.95,4.47,slot.position[2]+normal.z*.95);poster.target.position.set(slot.position[0],2.8,slot.position[2]);model.position.set(slot.plinth[0]+normal.x*.65,4.25,slot.plinth[2]+normal.z*.65);model.target.position.set(slot.plinth[0],1.5,slot.plinth[2]);poster.target.updateMatrixWorld();model.target.updateMatrixWorld();});}};
}
