import * as THREE from 'three';

export class ModelInspector{
 constructor(camera,{reduced=false,onClose=()=>{}}={}){this.camera=camera;this.reduced=reduced;this.onClose=onClose;this.stage='idle';this.paused=false;this.helper=new THREE.PerspectiveCamera();}
 get busy(){return this.stage!=='idle';}
 get active(){return this.stage==='inspect';}
 start(exhibit,index){if(this.busy)return false;const box=new THREE.Box3().setFromObject(exhibit.modelGroup);if(box.isEmpty())return false;this.index=index;this.group=exhibit.modelGroup;this.originalRotation=this.group.rotation.y;this.target=box.getCenter(new THREE.Vector3());this.normal=new THREE.Vector3(Math.sin(exhibit.slot.rotation),0,Math.cos(exhibit.slot.rotation));const radius=box.getSize(new THREE.Vector3()).length()*.5;this.baseDistance=Math.max(1.25,radius/Math.sin(this.camera.fov*Math.PI/360)*1.2);this.distance=this.baseDistance;this.elevation=.2;this.returnPosition=this.camera.position.clone();this.returnRotation=this.camera.quaternion.clone();this.stage='inspect';this.paused=false;return true;}
 rotate(dx,dy=0){if(!this.active)return;this.group.rotation.y+=dx*.008;this.elevation=THREE.MathUtils.clamp(this.elevation+dy*.003,-.12,.8);}
 zoom(delta){if(this.active)this.distance=THREE.MathUtils.clamp(this.distance*Math.exp(delta*.001),this.baseDistance*.65,this.baseDistance*1.8);}
 reset(){if(!this.active)return;this.group.rotation.y=this.originalRotation;this.distance=this.baseDistance;this.elevation=.2;}
 close(){if(!this.active)return;this.group.rotation.y=this.originalRotation;this.stage='return';this.paused=false;}
 update(dt){if(!this.busy)return;const alpha=this.reduced?1:1-Math.exp(-7*dt);let position,rotation;if(this.active){position=this.target.clone().addScaledVector(this.normal,this.distance*Math.cos(this.elevation));position.y=THREE.MathUtils.clamp(position.y+this.distance*Math.sin(this.elevation),.45,4.35);this.helper.position.copy(position);this.helper.lookAt(this.target);rotation=this.helper.quaternion.clone();}else{position=this.returnPosition;rotation=this.returnRotation;}this.camera.position.lerp(position,alpha);this.camera.quaternion.slerp(rotation,alpha);if(this.stage==='return'&&this.camera.position.distanceTo(position)<.002&&this.camera.quaternion.angleTo(rotation)<.002){this.camera.position.copy(position);this.camera.quaternion.copy(rotation);this.stage='idle';this.onClose();}}
}
