import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {fitExhibitModel} from './exhibit-models.js';

export const aboutComputerPath='assets/models/gaming-desktop-pc.glb';

export function prepareAboutComputer(model){
 model.rotation.y-=Math.PI/2;model.updateMatrixWorld(true);
 const root=new THREE.Group(),buckets=new Map();root.name='Supplied Gaming Desktop PC';
 model.traverse(object=>{
  if(!object.isMesh)return;
  const geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();geometry.applyMatrix4(object.matrixWorld);
  if(!geometry.attributes.normal)geometry.computeVertexNormals();
  if(Array.isArray(object.material)){root.add(new THREE.Mesh(geometry,object.material));return;}
  const signature=Object.keys(geometry.attributes).sort().map(name=>name+geometry.attributes[name].itemSize).join(',');
  const key=object.material.uuid+'|'+signature;if(!buckets.has(key))buckets.set(key,{material:object.material,parts:[]});buckets.get(key).parts.push(geometry);
 });
 for(const {material,parts} of buckets.values()){
  const merged=mergeGeometries(parts);if(merged){root.add(new THREE.Mesh(merged,material));parts.forEach(part=>part.dispose());}else parts.forEach(part=>root.add(new THREE.Mesh(part,material)));
 }
 const fitted=fitExhibitModel(root,[3.8,1.75,1.85]);fitted.name='Fitted gaming computer and tabletop';
 fitted.traverse(object=>{object.userData.aboutAction='desktop';if(object.isMesh){object.castShadow=false;object.receiveShadow=false;}});
 return fitted;
}

export function createAboutComputer(parent,fallback,{loader=null,enabled=true}={}){
 const group=new THREE.Group();group.name='Cached About computer';group.position.set(0,.97,-4.65);parent.add(group);let state='idle';
 function activate(){
  if(!enabled||state!=='idle')return;state='loading';
  (loader||new GLTFLoader()).load(aboutComputerPath,gltf=>{
   try{group.add(prepareAboutComputer(gltf.scene));fallback.visible=false;state='ready';}
   catch(error){state='failed';console.warn('Computer model could not be prepared',error);}
  },undefined,error=>{state='failed';console.warn('Computer model could not load',error);});
 }
 return{group,activate,get state(){return state;}};
}
