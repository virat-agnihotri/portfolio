import * as THREE from 'three';
import {wrapAngle} from './movement.js';
import {galleryLayout} from './gallery-layout.js';

export function exhibitView(slot){
 const normal=new THREE.Vector3(Math.sin(slot.rotation),0,Math.cos(slot.rotation));
 const position=new THREE.Vector3(slot.plinth[0],1.75,slot.plinth[2]).addScaledVector(normal,2.35);
 return{position,yaw:slot.rotation,pitch:.12};
}

export function advanceExhibitTravel(travel,dt,reduced=false){
 travel.elapsed+=dt;const t=reduced?1:Math.min(1,travel.elapsed/1.25),ease=t*t*(3-2*t);
 travel.route??=exhibitRoute(travel.from,travel.view.position);
 const points=travel.route,lengths=points.slice(1).map((point,i)=>point.distanceTo(points[i]));
 let remaining=lengths.reduce((sum,length)=>sum+length,0)*ease,segment=0;
 while(segment<lengths.length-1&&remaining>lengths[segment])remaining-=lengths[segment++];
 const position=new THREE.Vector3().lerpVectors(points[segment],points[segment+1],lengths[segment]?Math.min(1,remaining/lengths[segment]):1);
 return{position,yaw:travel.fromYaw+wrapAngle(travel.view.yaw-travel.fromYaw)*ease,pitch:THREE.MathUtils.lerp(travel.fromPitch,travel.view.pitch,ease),done:t===1};
}

// A small visibility graph routes around all five stands from any walkable spot.
export function exhibitRoute(start,end){
 const nodes=[start.clone(),end.clone()];
 for(const slot of galleryLayout)for(const x of [-1.12,1.12])for(const z of [-1.12,1.12]){
  const point=new THREE.Vector3(THREE.MathUtils.clamp(slot.plinth[0]+x,54.2,65.8),1.75,THREE.MathUtils.clamp(slot.plinth[2]+z,-11.1,1.5));
  nodes.push(point);
 }
 function clear(a,b){return galleryLayout.every(slot=>{
  let near=0,far=1;
  for(const axis of ['x','z']){
   const center=slot.plinth[axis==='x'?0:2],low=center-.95999,high=center+.95999,d=b[axis]-a[axis];
   if(Math.abs(d)<1e-9){if(a[axis]<=low||a[axis]>=high)return true;continue;}
   const t1=(low-a[axis])/d,t2=(high-a[axis])/d;near=Math.max(near,Math.min(t1,t2));far=Math.min(far,Math.max(t1,t2));
   if(near>=far)return true;
  }
  return far<=0||near>=1;
 });}
 const distance=nodes.map(()=>Infinity),previous=[],done=new Set();distance[0]=0;
 while(done.size<nodes.length){let i=-1;nodes.forEach((_,j)=>{if(!done.has(j)&&(i===-1||distance[j]<distance[i]))i=j;});if(i===-1||!Number.isFinite(distance[i]))break;if(i===1)break;done.add(i);
  nodes.forEach((point,j)=>{if(done.has(j)||j===i||!clear(nodes[i],point))return;const next=distance[i]+nodes[i].distanceTo(point);if(next<distance[j]){distance[j]=next;previous[j]=i;}});
 }
 if(!Number.isFinite(distance[1]))throw Error('No clear route to exhibit');
 const route=[];for(let i=1;i!==undefined;i=previous[i])route.unshift(nodes[i]);return route;
}
