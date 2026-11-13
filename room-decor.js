import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createSkillsExhibition} from './skills-exhibition.js';
import {createContactCrates} from './contact-crates.js';

function floorTexture(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#887358';x.fillRect(0,0,512,512);for(let col=0;col<8;col++)for(let row=-1;row<3;row++){const y=row*256+(col%2)*128;x.fillStyle=['#998466','#8e795d','#a18c6f','#938064'][(col+row+4)%4];x.fillRect(col*64+1,y+1,62,254);x.strokeStyle='#b4a18455';for(let i=0;i<7;i++){x.beginPath();x.moveTo(col*64+7+i*7,y);x.bezierCurveTo(col*64+10+i*7,y+80,col*64+2+i*7,y+160,col*64+8+i*7,y+254);x.stroke();}}const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(3,4);return map;}

export function createRoomDecor(rooms,world,{textures=true,reduced=false,onContactReveal=()=>{}}={}){
 let skillsExhibition,contactCrates;const groups=new Map(),woodMap=textures?floorTexture():null;
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.9});const wood=new THREE.MeshStandardMaterial({color:'#8e7354',map:woodMap,roughness:.8}),brass=new THREE.MeshStandardMaterial({color:'#b49a6a',metalness:.4,roughness:.5}),dark=mat('#37483f');
 for(const room of rooms){const group=new THREE.Group();group.name=room.id+' fitted interior';group.position.set(room.cx,0,-5);group.visible=false;world.add(group);groups.set(room.id,group);
  const palette={gallery:{wall:'#48534d',accent:'#5b665c',fabric:'#817965'},about:{wall:'#c9bca5',accent:'#9d7e69',fabric:'#b09a80'},studio:{wall:'#b7bfae',accent:'#57706a',fabric:'#8a9b8d'},contact:{wall:'#414843',accent:'#28332e',fabric:'#a64836'}}[room.id];
  const accent=mat(palette.accent),fabric=mat(palette.fabric),wall=mat(palette.wall);
  function box(size,position,material=wood,round=false,parent=group){const mesh=new THREE.Mesh(round?new RoundedBoxGeometry(...size,2,.065):new THREE.BoxGeometry(...size),material);mesh.position.set(...position);parent.add(mesh);return mesh;}
  function chair(x,z,rotation,width=1.7){const chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=rotation;group.add(chair);box([width,.29,1.4],[0,.5,0],fabric,true,chair);box([width,.95,.25],[0,.94,-.58],fabric,true,chair);for(const side of [-1,1]){box([.19,.5,1.4],[side*(width/2-.06),.78,0],accent,true,chair);for(const y of [-.44,.44])box([.09,.32,.09],[side*(width/2-.15),.17,y],dark,false,chair);}return chair;}
  if(room.id!=='gallery'){
   box([12.65,.035,14.7],[0,.09,0],new THREE.MeshStandardMaterial({color:room.id==='contact'?'#424843':'#c8b48f',map:room.id==='contact'?null:woodMap,roughness:.8}));
   for(const side of [-1,1]){box([.05,4.5,14.7],[side*6.29,2.5,0],wall);box([.075,1.15,14.7],[side*6.24,.71,0],accent);box([.09,.065,14.7],[side*6.18,1.32,0],brass);box([.11,.15,14.7],[side*6.18,.2,0],wood);
    if(!['about','contact'].includes(room.id))for(const z of [-3.4,2.1]){box([.12,2.05,2.0],[side*6.17,3.13,z],wood);box([.025,1.8,1.75],[side*6.09,3.13,z],new THREE.MeshBasicMaterial({color:'#afc4c4'}));box([.06,1.84,.045],[side*6.06,3.13,z],brass);box([.06,.045,1.78],[side*6.06,3.13,z],brass);}}
   box([12.55,4.5,.045],[0,2.5,-7.32],wall);
  }
  if(room.id==='gallery'){
   // Acoustic walnut strips frame the displays without hiding their posters.
   for(const side of [-1,1])for(const z of [-6.8,6])for(let i=0;i<7;i++)box([.06,3.7,.055],[side*6.22,2.55,z+i*.1],wood);
   box([2.65,.2,.76],[3,.55,5.9],fabric,true);for(const x of [1.95,4.05])box([.1,.48,.53],[x,.27,5.9],brass);
  }else if(room.id==='about'){
   skillsExhibition=createSkillsExhibition(group,{textures});
  }else if(room.id==='studio'){
   chair(4.6,1.8,-Math.PI/2);box([2.3,.025,2.2],[3,.119,1.8],mat('#97a294'));
   for(const z of [-5.5,-4.3,-3.1]){box([.18,.7,.6],[-6.13,2.9,z],wood);box([.025,.45,.4],[-6.02,2.9,z],mat('#cbd2bf'));}
   box([.9,.045,.65],[.35,1.06,.6],mat('#d8d7bf'));box([.45,.08,.45],[1.1,1.04,.6],dark,true);
  }else{
   box([12.6,.025,14.7],[0,4.76,0],mat('#303b34'));
   for(const side of [-1,1])box([5.3,4.5,.035],[side*3.65,2.5,7.28],wall);
   box([2,1.7,.035],[0,3.95,7.28],wall);
   contactCrates=createContactCrates(group,{textures,reduced,onReveal:onContactReveal});
  }
 }
 return{groups,contactCrates,update(dt){contactCrates?.update(dt);},setActive(id){groups.forEach((group,key)=>group.visible=key===id);if(id==='about')skillsExhibition?.activate();contactCrates?.setActive(id==='contact');}};
}
