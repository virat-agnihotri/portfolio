import * as THREE from 'three';

export function createInteriors(rooms,world,scene){
 const exits=new Map(),lights=new Map();let active=null;
 for(const room of rooms){const group=new THREE.Group();world.add(group);exits.set(room.id,group);const roomLights=[];for(const z of [-2.1,-7.4]){const light=new THREE.PointLight(room.id==='studio'?'#e6edff':'#ffe5b4',room.id==='gallery'?5:16,11,2);light.position.set(room.cx,3.62,z);light.visible=false;scene.add(light);roomLights.push(light);}lights.set(room.id,roomLights);}
 function extract(object,geometry,material){const room=rooms.find(r=>object.name.startsWith('interior_exit_'+r.id));if(!room)return false;const mesh=new THREE.Mesh(geometry,material.clone());mesh.name=object.name;mesh.userData.exitRoomId=room.id;mesh.userData.originalEmissive=mesh.material.emissive.clone();mesh.userData.originalIntensity=mesh.material.emissiveIntensity;exits.get(room.id).add(mesh);return true;}
 function setActive(id){active=id;lights.forEach((items,key)=>items.forEach(light=>light.visible=key===id));hover(false);}
 function hover(enabled){exits.forEach((group,id)=>group.children.forEach(mesh=>{const highlighted=enabled&&id===active;mesh.material.emissive.copy(highlighted?new THREE.Color('#c1a26b'):mesh.userData.originalEmissive);mesh.material.emissiveIntensity=highlighted?.35:mesh.userData.originalIntensity;}));}
 return{exits,extract,setActive,hover,get active(){return active;}};
}
