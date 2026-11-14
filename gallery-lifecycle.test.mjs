import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createExhibitModelQueue} from './exhibit-models.js';
import {createRoomDecor} from './room-decor.js';

const requests=[];const loader={load(path,done){requests.push({path,done});}};const queue=createExhibitModelQueue({assetLoader:loader});const jobs=[];
for(let i=0;i<7;i++)jobs.push(queue.add({path:'model-'+i,group:new THREE.Group(),anchor:[i*20,0,0]}));
queue.update(.1,false,new THREE.Vector3());assert.equal(requests.length,0,'No model requests outside gallery');
queue.update(.1,true,new THREE.Vector3());assert.equal(requests.length,2,'At most two downloads start');assert.equal(jobs.filter(job=>job.state==='queued').length,5,'All gallery models queue on entry, regardless of walking distance');
const model=new THREE.Group(),part=new THREE.Mesh(new THREE.BoxGeometry(1,1,1));part.name='moving';model.add(part);const clip=new THREE.AnimationClip('spin',2,[new THREE.NumberKeyframeTrack('moving.rotation[y]',[0,2],[0,2])]);requests[0].done({scene:model,animations:[clip]});assert.equal(requests.length,3);
queue.update(.2,true,new THREE.Vector3());const before=part.rotation.y;queue.update(1,false,new THREE.Vector3());assert.equal(part.rotation.y,before,'Animation stops outside gallery');
requests[1].done({scene:new THREE.Mesh(new THREE.BoxGeometry(1,1,1)),animations:[]});assert.equal(requests.length,3,'Pending requests do not start after exit');
queue.update(.2,true,new THREE.Vector3());assert.ok(part.rotation.y>before,'Cached animation resumes after re-entry');assert.equal(requests.filter(r=>r.path==='model-0').length,1,'Loaded model is not downloaded again');
const world=new THREE.Group(),rooms=['gallery','about','studio','contact'].map((id,i)=>({id,cx:60+i*22})),decor=createRoomDecor(rooms,world,{textures:false});decor.setActive('about');assert.equal([...decor.groups.values()].filter(g=>g.visible).length,1);decor.setActive(null);assert.ok([...decor.groups.values()].every(g=>!g.visible));
console.log('Passed: entry-only downloads, concurrency limit, all-model queueing, exit pause, cached reuse, and isolated interior finishes.');

for(const [id,group] of decor.groups){const slots=[];group.traverse(object=>{if(object.userData.photoSlot)slots.push(object.userData.photoSlot);});assert.equal(slots.length,id==='gallery'?0:id==='studio'?6:2,'New photo frames are restricted to the three refreshed houses');}
