import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ModelInspector} from './model-inspector.js';
import {createGalleryRoom} from './gallery-room.js';

const camera=new THREE.PerspectiveCamera(62,1.6,.08,180);camera.position.set(60,1.75,0);const original=camera.position.clone(),rotation=camera.quaternion.clone();let closed=0;
const group=new THREE.Group();group.position.set(55.35,.95,-3.1);group.add(new THREE.Mesh(new THREE.BoxGeometry(1,1.5,1)));group.updateMatrixWorld(true);
const inspector=new ModelInspector(camera,{onClose:()=>closed++});assert.ok(inspector.start({modelGroup:group,slot:{rotation:Math.PI/2}},1));assert.equal(inspector.start({modelGroup:group,slot:{rotation:0}},0),false,'Cannot open another inspector mid-view');
for(let i=0;i<150;i++)inspector.update(1/60);const forward=camera.getWorldDirection(new THREE.Vector3()),toward=inspector.target.clone().sub(camera.position).normalize();assert.ok(forward.dot(toward)>.999,'Inspection camera faces the model');
inspector.rotate(80,90);assert.ok(group.rotation.y>0);inspector.zoom(-100000);assert.equal(inspector.distance,inspector.baseDistance*.65);inspector.zoom(100000);assert.equal(inspector.distance,inspector.baseDistance*1.8);inspector.update(1);assert.ok(camera.position.y<=4.35,'Zoom cannot put camera through ceiling');
inspector.reset();assert.equal(group.rotation.y,0);assert.equal(inspector.distance,inspector.baseDistance);inspector.rotate(30);inspector.close();for(let i=0;i<160;i++)inspector.update(1/60);assert.equal(inspector.busy,false);assert.equal(closed,1);assert.ok(camera.position.distanceTo(original)<.001);assert.ok(camera.quaternion.angleTo(rotation)<.001);assert.equal(group.rotation.y,0);
const scene=new THREE.Scene(),world=new THREE.Group();scene.add(world);const lighting=createGalleryRoom(world,scene);lighting.update(true,new THREE.Vector3(60,1.75,-5));assert.equal(lighting.spots.filter(light=>light.visible).length,4);assert.ok(lighting.spots.every(light=>!light.castShadow));lighting.update(false,new THREE.Vector3());assert.equal(lighting.spots.filter(light=>light.visible).length,0);
console.log('Passed: model focus, rotation, zoom limits, reset, camera return, ceiling clearance, and bounded gallery spotlights.');
