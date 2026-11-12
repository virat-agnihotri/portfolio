import assert from 'node:assert/strict';
import * as THREE from 'three';
import { easeWalking,wrapAngle } from './movement.js';
import { addTown } from './town.js';

function walk(fps,forward=1,side=0){const velocity=new THREE.Vector2();for(let i=0;i<fps;i++)easeWalking(velocity,forward,side,1/fps);return velocity;}
const slow=walk(30),fast=walk(120);assert.ok(slow.distanceTo(fast)<1e-10,'Movement smoothing is independent of frame rate');
const diagonal=walk(60,1,1);assert.ok(diagonal.length()<=1,'Diagonal movement does not exceed straight-line speed');
const velocity=walk(60);const initial=velocity.length();easeWalking(velocity,0,0,1/60);assert.ok(velocity.length()>0&&velocity.length()<initial,'Releasing movement eases to a stop');for(let i=0;i<120;i++)easeWalking(velocity,0,0,1/60);assert.equal(velocity.length(),0);
assert.ok(Math.abs(wrapAngle(Math.PI*10+.3)-.3)<1e-10,'Repeated camera turns preserve their facing direction');
const scene=new THREE.Scene();const town=addTown(scene);assert.equal(town.houseCount,78);scene.traverse(object=>{if(!object.isInstancedMesh)return;assert.ok(Number.isFinite(object.boundingSphere.radius),'Scenery has a finite culling bound');for(let i=0;i<object.count;i++){const matrix=new THREE.Matrix4();object.getMatrixAt(i,matrix);assert.ok(matrix.determinant()>0,'Every scenery instance has a valid transform');}});
console.log('Passed: frame-rate-independent walking, diagonal speed, smooth stopping, angle wrapping, and 78 valid background homes.');
