import assert from 'node:assert/strict';
import * as THREE from 'three';
import {projects} from './content.js';
import {galleryLayout,avoidGalleryPlinths} from './gallery-layout.js';
assert.equal(galleryLayout.filter(p=>p.side==='left').length,2);assert.equal(galleryLayout.filter(p=>p.side==='right').length,2);assert.equal(galleryLayout.filter(p=>p.side==='center').length,1);
assert.deepEqual([...galleryLayout.map(p=>p.id)].sort(),[...projects.map(p=>p.id)].sort());
for(const slot of galleryLayout){
 const normal=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),slot.rotation);const toAisle=new THREE.Vector3(60-slot.position[0],0,-5-slot.position[2]).normalize();assert.ok(normal.dot(toAisle)>.6,'Frame faces into the gallery');
 const standOffset=new THREE.Vector3(slot.plinth[0]-slot.position[0],0,slot.plinth[2]-slot.position[2]);assert.ok(standOffset.dot(normal)>1.4,'Model stand sits in front of its own frame');
 const previous=new THREE.Vector3(slot.plinth[0]+1.1,1.75,slot.plinth[2]);const next=new THREE.Vector3(slot.plinth[0]+.8,1.75,slot.plinth[2]);avoidGalleryPlinths(next,previous);assert.ok(Math.abs(next.x-slot.plinth[0])>=.959,'Player cannot walk through the plinth');
}
const clear=new THREE.Vector3(60,1.75,-5);assert.deepEqual(avoidGalleryPlinths(clear.clone(),clear).toArray(),clear.toArray(),'Central viewing aisle remains clear');
console.log('Passed: two-left/two-right/center layout, project mapping, inward-facing frames, model positions, and plinth collisions.');
