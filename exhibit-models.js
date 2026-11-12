import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

export function fitExhibitModel(model,limits,{centered=false,upright=false,longAxisZ=false}={}){
 model.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
 if(!size.toArray().every(Number.isFinite)||Math.max(...size.toArray())<=0)throw Error('Model has no finite geometry');
 if(upright){if(size.z>size.y&&size.z>=size.x)model.rotateX(-Math.PI/2);else if(size.x>size.y)model.rotateZ(Math.PI/2);}
 if(longAxisZ&&size.x>size.z)model.rotateY(Math.PI/2);
 model.updateMatrixWorld(true);box.setFromObject(model);size=box.getSize(new THREE.Vector3());
 const scale=Math.min(...limits.map((limit,i)=>limit/Math.max(size.getComponent(i),.00001)));const wrapper=new THREE.Group();wrapper.add(model);wrapper.scale.setScalar(scale);wrapper.updateMatrixWorld(true);
 box.setFromObject(wrapper);const center=box.getCenter(new THREE.Vector3());wrapper.position.set(-center.x,centered?-center.y:-box.min.y,-center.z);wrapper.updateMatrixWorld(true);return wrapper;
}

// Models start loading when the visitor enters the gallery.
// Two concurrent loads limit decoding/memory pressure; revisits reuse the scene.
export function createExhibitModelQueue({reduced=false,assetLoader=null}={}){
 const loader=assetLoader||new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('assets/draco/').setWorkerLimit(1));
 const jobs=[],mixers=[];let active=false,running=0;
 function pump(){if(!active)return;while(running<2){const job=jobs.filter(j=>j.state==='queued').sort((a,b)=>a.distance-b.distance)[0];if(!job)return;job.state='loading';running++;loader.load(job.path,gltf=>{
   try{const model=fitExhibitModel(gltf.scene,job.limits,job.options);model.traverse(o=>{o.userData.projectIndex=job.group.userData.projectIndex;o.userData.isExhibitModel=true;});job.group.add(model);if(!reduced&&gltf.animations.length){const mixer=new THREE.AnimationMixer(gltf.scene);gltf.animations.forEach(clip=>mixer.clipAction(clip).play());mixers.push(mixer);}job.state='loaded';job.onReady?.(model);}
   catch(error){job.state='failed';console.warn('Could not fit exhibit model:',job.path,error);}finally{running--;pump();}
  },undefined,error=>{job.state='failed';running--;console.warn('Could not load exhibit model:',job.path,error);pump();});}}
 function add({path,group,anchor,limits=[1.4,1.6,1.4],options={},onReady}){const job={path,group,anchor:new THREE.Vector3(...anchor),limits,options,onReady,state:'idle',distance:Infinity};jobs.push(job);return job;}
 return{add,update(dt,inGallery,position,animate=true){active=inGallery;if(active){jobs.forEach(job=>{job.distance=position.distanceTo(job.anchor);if(job.state==='idle')job.state='queued';});if(animate)mixers.forEach(mixer=>mixer.update(dt));pump();}}};
}

