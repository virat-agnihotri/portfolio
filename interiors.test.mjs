import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createInteriors} from './interiors.js';

const rooms=['gallery','about','studio','contact'].map((id,i)=>({id,cx:60+i*22}));
const bytes=await readFile(new URL('./dist/assets/neighborhood.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
const scene=new THREE.Scene(),world=new THREE.Group();scene.add(world);const interiors=createInteriors(rooms,world,scene);
gltf.scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(!interiors.extract(o,g,o.material)){const mesh=new THREE.Mesh(g,o.material);mesh.name=o.name;world.add(mesh);}});world.updateMatrixWorld(true);
for(const room of rooms){
 const origin=new THREE.Vector3(room.cx,1.75,-4);
 for(const direction of [new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1),new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0)]){
  const hit=new THREE.Raycaster(origin,direction,0,18).intersectObject(world,true)[0];assert.ok(hit,`${room.id}: room is enclosed in direction ${direction.toArray()}`);
  if(direction.y===1)assert.ok(hit.object.name.includes('ceiling'),`${room.id}: ceiling stops the view of the sky`);
 }
 const exitHit=new THREE.Raycaster(origin,new THREE.Vector3(0,0,1),0,18).intersectObject(world,true)[0];assert.equal(exitHit.object.userData.exitRoomId,room.id,`${room.id}: visible return door is clickable`);
 assert.ok(interiors.exits.get(room.id).children.length>=4);
 interiors.setActive(room.id);assert.equal(scene.children.filter(o=>o.isPointLight&&o.visible).length,2,'Only active room lights are enabled');
 interiors.hover(true);const door=interiors.exits.get(room.id).children[0];assert.ok(!door.material.emissive.equals(door.userData.originalEmissive));interiors.hover(false);assert.ok(door.material.emissive.equals(door.userData.originalEmissive));
}
interiors.setActive(null);assert.equal(scene.children.filter(o=>o.isPointLight&&o.visible).length,0);
console.log('Passed: four enclosed rooms, ceilings, return-door ray targets, hover reset, and active-room lighting.');
