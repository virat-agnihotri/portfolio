import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {fitExhibitModel} from './exhibit-models.js';
import {galleryModels} from './gallery-layout.js';

const manifest=JSON.parse(await readFile(new URL('./model-assets.json',import.meta.url),'utf8'));
for(const [id,path] of Object.entries(galleryModels)){
 const file=await readFile(new URL('./dist/'+path,import.meta.url));assert.equal(file.readUInt32LE(0),0x46546c67,`${id}: valid GLB header`);assert.equal(file.readUInt32LE(8),file.length);
 const json=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)).toString());assert.ok(json.scenes?.length&&json.meshes?.length,`${id}: contains a model`);assert.ok(!(json.images||[]).some(image=>image.uri&&!image.uri.startsWith('data:')),'Textures are self-contained');
 assert.equal(file.length,manifest[id].bytes);assert.equal(createHash('sha256').update(file).digest('hex'),manifest[id].sha256,`${id}: supplied asset preserved`);
 if(id==='rocket')assert.ok(json.extensionsRequired.includes('KHR_draco_mesh_compression'));
}
for(const file of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js'])assert.ok((await stat(new URL('./dist/assets/draco/'+file,import.meta.url))).size>0);
for(const fixture of [{size:[1.92,1.2,5.39],limits:[.58,.65,1.28],options:{longAxisZ:true}},{size:[2,22.4,3.6],limits:[1.15,2.1,1.15],options:{upright:true}},{size:[22,2,3],limits:[1.15,2.1,1.15],options:{upright:true}},{size:[2.54,2.54,2.54],limits:[1.05,1.05,1.05],options:{centered:true}},{size:[3.6,4.3,1.07],limits:[1.2,1.65,.85],options:{}}]){
 const source=new THREE.Mesh(new THREE.BoxGeometry(...fixture.size));source.position.set(3,7,-4);const fitted=fitExhibitModel(source,fixture.limits,fixture.options),box=new THREE.Box3().setFromObject(fitted),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 fixture.limits.forEach((limit,i)=>assert.ok(size.getComponent(i)<=limit+.00001));assert.ok(Math.abs(center.x)<.00001&&Math.abs(center.z)<.00001,'Model centered on stand');assert.ok(Math.abs(fixture.options.centered?center.y:box.min.y)<.00001,'Correct vertical alignment');
}
console.log('Passed: seven supplied GLBs, preserved asset hashes, self-contained textures, local Draco decoder, and fitted car/rocket/Moon/bookshelf bounds.');
