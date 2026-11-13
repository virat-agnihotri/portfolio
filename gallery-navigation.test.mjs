import assert from 'node:assert/strict';
import * as THREE from 'three';
import {galleryLayout} from './gallery-layout.js';
import {exhibitView,exhibitRoute,advanceExhibitTravel} from './gallery-navigation.js';

for(const slot of galleryLayout){
 const view=exhibitView(slot);
 assert.ok(view.position.x>=54.2&&view.position.x<=65.8);
 assert.ok(view.position.z>=-11.1&&view.position.z<=1.5);
 const direction=new THREE.Vector3(-Math.sin(view.yaw),0,-Math.cos(view.yaw));
 const toward=new THREE.Vector3(slot.plinth[0],1.75,slot.plinth[2]).sub(view.position).normalize();
 assert.ok(direction.dot(toward)>.999,'Camera faces the selected exhibit');
 const travel={from:new THREE.Vector3(60,1.75,.5),fromYaw:Math.PI*1.9,fromPitch:0,view,elapsed:0};
 let pose;for(let i=0;i<80;i++){
  pose=advanceExhibitTravel(travel,1/60);
  for(const other of galleryLayout)assert.ok(Math.abs(pose.position.x-other.plinth[0])>=.96||Math.abs(pose.position.z-other.plinth[2])>=.96,'Travel stays outside the plinths');
 }
 assert.equal(pose.done,true);assert.ok(pose.position.distanceTo(view.position)<1e-8);
 assert.ok(Math.abs(pose.yaw-travel.fromYaw)<=Math.PI,'Camera takes the shorter rotation');
 const reduced=advanceExhibitTravel({...travel,elapsed:0},0,true);assert.ok(reduced.done);assert.ok(reduced.position.distanceTo(view.position)<1e-8);
}
console.log('Passed: five guided exhibit destinations, clear aisle routes, camera orientation, and reduced motion.');

for(const from of [new THREE.Vector3(60,1.75,-11.1),new THREE.Vector3(54.2,1.75,-11.1),new THREE.Vector3(65.8,1.75,-11.1),...galleryLayout.map(slot=>exhibitView(slot).position)])for(const slot of galleryLayout){const route=exhibitRoute(from,exhibitView(slot).position);for(let i=1;i<route.length;i++)for(let step=0;step<=100;step++){const point=new THREE.Vector3().lerpVectors(route[i-1],route[i],step/100);for(const other of galleryLayout)assert.ok(Math.abs(point.x-other.plinth[0])>=.95998||Math.abs(point.z-other.plinth[2])>=.95998,'All return and corner routes avoid display stands');}}
