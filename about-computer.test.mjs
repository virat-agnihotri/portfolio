import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {prepareAboutComputer,createAboutComputer,aboutComputerPath} from './about-computer.js';

globalThis.ProgressEvent??=class extends Event{constructor(type,init={}){super(type);Object.assign(this,init);}};

const bytes=await readFile(new URL('./dist/'+aboutComputerPath,import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'ec49e8e56ccec61d44609fcff2889288ccf9777788ade4e4d6ea6d0fee2db807','Supplied GLB remains unchanged');
const jsonLength=bytes.readUInt32LE(12),document=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
assert.ok(document.images.every(image=>image.bufferView!==undefined),'PC textures are embedded');
// Preserve every real mesh/material assignment, but omit image decoding in Node.
const binaryOffset=20+jsonLength,binLength=bytes.readUInt32LE(binaryOffset);
document.buffers[0].uri='data:application/octet-stream;base64,'+bytes.subarray(binaryOffset+8,binaryOffset+8+binLength).toString('base64');
document.images=[];document.textures=[];document.samplers=[];document.extensionsUsed=[];delete document.extensionsRequired;
document.materials=document.materials.map(material=>({name:material.name,pbrMetallicRoughness:{baseColorFactor:[.5,.5,.5,1]}}));
const gltf=await new GLTFLoader().parseAsync(JSON.stringify(document),'');let before=0;gltf.scene.traverse(object=>{if(object.isMesh)before++;});
const fitted=prepareAboutComputer(gltf.scene);fitted.updateMatrixWorld(true);let after=0;fitted.traverse(object=>{if(object.isMesh){after++;assert.equal(object.userData.aboutAction,'desktop');}});
const bounds=new THREE.Box3().setFromObject(fitted),size=bounds.getSize(new THREE.Vector3());
assert.ok(size.x<=3.80001&&size.y<=1.75001&&size.z<=1.85001,'Real computer fits the desktop bay');assert.ok(Math.abs(bounds.min.y)<.00001,'Model rests on its base');
assert.ok(after<before/3,'Static mesh batching materially reduces draw calls');
const requests=[],fallback=new THREE.Group(),parent=new THREE.Group(),asset=createAboutComputer(parent,fallback,{loader:{load(path,done){requests.push({path,done});}}});
assert.equal(requests.length,0,'No request during room construction');asset.activate();asset.activate();assert.equal(requests.length,1,'Repeated entry while loading does not duplicate requests');
const fixture=new THREE.Group();fixture.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial()));requests[0].done({scene:fixture});assert.equal(asset.state,'ready');assert.equal(fallback.visible,false);asset.activate();assert.equal(requests.length,1,'Cached computer is reused on revisit');
console.log(`Passed: unchanged PC GLB, embedded textures, fitting, ${before}→${after} mesh batching, click tagging, entry-only loading, and cached reuse.`);
