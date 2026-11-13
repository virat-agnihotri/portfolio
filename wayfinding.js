import * as THREE from 'three';

export function addWayfinding(rooms,world){
 function label(text,position,width,height,rotation=0){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#f1e6cd';ctx.fillRect(0,0,1536,160);ctx.fillStyle='#34483d';ctx.font='600 66px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,768,80,1460);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map}));mesh.position.set(...position);mesh.rotation.y=rotation;world.add(mesh);
 }
 for(const room of rooms){
  const side=Math.sign(room.x);label(`${room.number} / ${room.name.toUpperCase()}`,[side*6.14,3.86,room.z],6.7,.62,-side*Math.PI/2);
  if(room.id==='gallery')continue; // Leave the center project poster unobstructed.
  label(room.name.toUpperCase(),[room.cx,3.9,-12.23],8,.72);
  label(room.kind,[room.cx,3.22,-12.22],7,.43);
 }
}
