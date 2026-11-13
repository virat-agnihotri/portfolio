import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createEntrances, entrancePose } from './entrances.js';
import { nearbyShop, shopGlance } from './town.js';

const rooms=[{id:'gallery',x:6.25,z:-4},{id:'about',x:-6.25,z:-17},{id:'studio',x:6.25,z:-26},{id:'contact',x:-6.25,z:-39}];
const bytes=await readFile(new URL('./dist/assets/neighborhood.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const world=new THREE.Group(),doors=createEntrances(rooms,world);
const removedFoundations=[];gltf.scene.traverse(object=>{if(!object.isMesh)return;const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);const consumed=doors.extract(object,geometry,object.material);if(object.name.startsWith('foundation')&&rooms.some(room=>room.id===object.parent?.name)){assert.equal(consumed,true,'The original solid foundation must be excluded from the static batch');removedFoundations.push(object.name);}});assert.equal(removedFoundations.length,4);
for(const [id,entry] of doors.entries){assert.ok(entry.material,`${id}: facade must be removed for a real opening`);assert.equal(entry.hinge.children.filter(o=>o.isMesh).length,3,`${id}: panel, glass and handle must all move with hinge`);entry.hinge.rotation.y=1.45;}
doors.finish();doors.reset();for(const entry of doors.entries.values())assert.equal(entry.hinge.rotation.y,0);
for(const entry of doors.entries.values()){
 for(const angle of [0,.4,.9,entry.room.id==='gallery'?1.45:1.58]){
  entry.hinge.rotation.y=angle;world.updateMatrixWorld(true);
  const panel=entry.hinge.children.find(o=>o.isMesh),bounds=new THREE.Box3().setFromObject(panel);
  assert.ok(bounds.min.y>.17,'Door clears the lowered 14cm threshold throughout its swing');
  assert.ok(bounds.max.y<2.675,'Door fits beneath the lintel');
 }
}
doors.reset();
world.updateMatrixWorld(true);
for(const room of rooms){
 const ray=new THREE.Raycaster(new THREE.Vector3(0,1.7,room.z),new THREE.Vector3(Math.sign(room.x),0,0),0,18);
 const hit=ray.intersectObject(world,true)[0];assert.equal(hit?.object.userData.roomId,room.id,`${room.id}: door is clickable from middle of road`);
 const center=new THREE.Vector3(0,1.75,room.z);assert.equal(nearbyShop(rooms,center)?.id,room.id);
 assert.ok(Math.abs(shopGlance(room,center,0)+Math.sign(room.x)*Math.PI/2)<1e-8,`${room.id}: camera faces shop from road center`);
 assert.ok(Math.abs(shopGlance(room,new THREE.Vector3(0,1.75,room.z+6.5),0))<1e-8,'Camera turn blends out at edge');
 const leaf=doors.entries.get(room.id).hinge.children.find(o=>o.isMesh),base=leaf.material.emissive.clone();doors.hover(room.id);assert.ok(!leaf.material.emissive.equals(base),'Hovered door changes appearance');
 const other=rooms.find(r=>r.id!==room.id),otherLeaf=doors.entries.get(other.id).hinge.children.find(o=>o.isMesh);assert.ok(otherLeaf.material.emissive.equals(otherLeaf.userData.baseEmissive),'Other doors retain their appearance');
 doors.hover(null);assert.ok(leaf.material.emissive.equals(base),'Hover restores original appearance');
}
assert.equal(nearbyShop(rooms,new THREE.Vector3(0,1.75,16)),null,'No shop caption at entrance');
assert.equal(entrancePose(0).stage,'approach');assert.equal(entrancePose(1.8).stage,'open');assert.equal(entrancePose(2.8).stage,'walk');assert.equal(entrancePose(3.7).stage,'fade');assert.equal(entrancePose(4).stage,'complete');
for(let t=0;t<4;t+=.01){const p=entrancePose(t);assert.ok(p.door>=0&&p.door<=1);assert.ok(p.opacity>=0&&p.opacity<=1);}
console.log('Passed: all four door assemblies, center-road ray targets, isolated hover/reset, center-road camera turns, and entrance timing.');

const entryPhotoSlots=[];world.traverse(object=>{if(object.userData.photoSlot)entryPhotoSlots.push(object.userData.photoSlot);});assert.deepEqual(entryPhotoSlots.sort(),['about-entry','contact-entry','studio-entry']);

for(const room of rooms){
 const floor=world.getObjectByName(room.id+' doorway floor'),threshold=world.getObjectByName(room.id+' threshold');
 assert.ok(floor&&threshold);world.updateMatrixWorld(true);
 for(const object of [floor,threshold])assert.ok(new THREE.Box3().setFromObject(object).max.y<=.141,'Doorway floor and threshold are lowered');
 const entry=doors.entries.get(room.id);entry.hinge.rotation.y=1.58;world.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(Math.sign(room.x)*6.45,.25,room.z),new THREE.Vector3(Math.sign(room.x),0,0),0,3.8);
 assert.equal(ray.intersectObject(world,true).length,0,'No solid foundation blocks the open doorway at ankle height');
}
doors.reset();
