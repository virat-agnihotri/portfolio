import * as THREE from 'three';
import {contactAccounts} from './content.js';

export const contactCrateLayout=[
 {id:'linkedin',position:[-4.6,1.1,3.7],rotation:Math.PI/2},
 {id:'github',position:[-4.6,1.1,0],rotation:Math.PI/2},
 {id:'twitter',position:[-4.6,1.1,-3.7],rotation:Math.PI/2},
 {id:'instagram',position:[4.6,1.1,3.7],rotation:-Math.PI/2},
 {id:'email',position:[4.6,1.1,0],rotation:-Math.PI/2},
 {id:'phone',position:[4.6,1.1,-3.7],rotation:-Math.PI/2},
 {id:'message',position:[0,1.1,-5.8],rotation:0}
];

export function avoidContactCrates(next,previous,cx=126){
 for(const slot of contactCrateLayout){const x=cx+slot.position[0],z=-5+slot.position[2],half=1.08,dx=next.x-x,dz=next.z-z;
  if(Math.abs(dx)>=half||Math.abs(dz)>=half)continue;
  if(Math.abs(previous.x-x)>=half)next.x=x+Math.sign(previous.x-x)*half;
  else if(Math.abs(previous.z-z)>=half)next.z=z+Math.sign(previous.z-z)*half;
  else if(half-Math.abs(dx)<half-Math.abs(dz))next.x=x+(Math.sign(dx)||1)*half;
  else next.z=z+(Math.sign(dz)||1)*half;
 }
 return next;
}

function labelMap(account,revealed){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');
 ctx.fillStyle=revealed?'#233d39':'#b73931';ctx.fillRect(0,0,512,512);
 if(!revealed){ctx.fillStyle='#de5545';for(let x=0;x<512;x+=64){ctx.fillRect(x,0,4,512);ctx.fillStyle='#842925';ctx.fillRect(x+58,0,6,512);ctx.fillStyle='#de5545';}ctx.fillStyle='#f5e8cb';ctx.fillRect(0,150,512,174);ctx.fillStyle='#292e29';ctx.textAlign='center';ctx.font='900 125px monospace';ctx.fillText('TNT',256,282);}
 ctx.textAlign='center';ctx.fillStyle=revealed?'#e7c680':'#f5e8cb';ctx.font='600 20px Arial';ctx.fillText(revealed?'CONTACT UNLOCKED':'CLICK TO REVEAL',256,revealed?75:63);
 ctx.fillStyle='#fff0d7';ctx.font='600 43px Arial';ctx.fillText(account.label,256,revealed?174:398,460);
 ctx.font='23px Arial';ctx.fillStyle='#c7d1bd';if(revealed){ctx.fillText(account.value,256,260,460);ctx.font='20px Arial';ctx.fillText('Tap to open contact card',256,403,460);}else{ctx.fillStyle='#f0cda6';ctx.fillText('Tap the crate',256,459);}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
}

export function createContactCrates(parent,{textures=true,reduced=false,onReveal=()=>{}}={}){
 const group=new THREE.Group();group.name='TNT contact vault';parent.add(group);const entries=new Map(),accounts=contactAccounts();let active=false,burst=null;
 const red=new THREE.MeshStandardMaterial({color:'#b33d32',roughness:.85}),dark=new THREE.MeshStandardMaterial({color:'#242b28',roughness:.8}),gold=new THREE.MeshStandardMaterial({color:'#d2ad61',metalness:.35,roughness:.6}),paper=new THREE.MeshStandardMaterial({color:'#f0dfba',roughness:.85});
 const cube=new THREE.BoxGeometry(1,1,1);
 function box(name,size,position,material,parent=group){const mesh=new THREE.Mesh(cube,material);mesh.name=name;mesh.scale.set(...size);mesh.position.set(...position);parent.add(mesh);return mesh;}
 // A clear central aisle, with small hazard pads below each exhibit.
 for(const x of [-1.65,1.65])box('Aisle edge',[.045,.012,12.5],[x,.125,0],gold);
 for(const side of [-1,1])for(let i=0;i<9;i++)box('Vault wall rib',[.07,3.8,.06],[side*6.19,2.55,-6.4+i*1.55],dark);
 for(const slot of contactCrateLayout){
  const account=accounts.find(item=>item.id===slot.id),root=new THREE.Group();root.name=account.label+' TNT crate';root.position.set(...slot.position);root.rotation.y=slot.rotation;group.add(root);
  box('Hazard pad',[2.1,.05,2.1],[0,-.95,0],dark,root);
  for(let i=0;i<7;i++)box('Hazard marking',[.17,.012,.28],[-.88+i*.29,-.918,.88],gold,root);
  const shell=new THREE.Group();shell.name='Explodable shell';root.add(shell);
  box('TNT body',[1.65,1.6,1.65],[0,0,0],red,shell);
  for(const y of [-.69,.69])box('Crate strap',[1.7,.095,1.7],[0,y,0],dark,shell);
  for(const x of [-.73,.73])box('Crate corner',[.07,1.56,1.71],[x,0,0],dark,shell);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(1.48,1.48),textures?new THREE.MeshStandardMaterial({map:labelMap(account,false),emissive:'#ffdbc0',emissiveIntensity:.13,roughness:.9}):paper);label.position.set(0,0,.858);shell.add(label);
  const fuse=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.8,0),new THREE.Vector3(.07,1.03,.02),new THREE.Vector3(.3,1.14,.02)]),8,.025,5,false),gold);shell.add(fuse);
  const spark=box('Fuse ember',[.09,.09,.09],[.3,1.14,.02],new THREE.MeshBasicMaterial({color:'#ffb45e'}),shell);
  const card=new THREE.Group();card.name='Revealed '+account.label;card.visible=false;root.add(card);
  box('Contact card backing',[1.7,1.7,.1],[0,.05,.04],gold,card);
  const art=new THREE.Mesh(new THREE.PlaneGeometry(1.58,1.58),textures?new THREE.MeshBasicMaterial({map:labelMap(account,true)}):paper);art.position.set(0,.05,.1);card.add(art);
  root.traverse(object=>object.userData.contactId=account.id);
  entries.set(account.id,{root,shell,card,spark,account,state:'sealed'});
 }
 const effects=new THREE.Group();effects.name='Reusable contact burst';effects.visible=false;group.add(effects);
 const materials=['#cc513c','#d9ab60','#525b51','#efd5a3'].map(color=>new THREE.MeshBasicMaterial({color,transparent:true,opacity:1,depthWrite:false}));
 const particles=[];for(let i=0;i<28;i++){
  const mesh=new THREE.Mesh(cube,materials[i%materials.length]);mesh.scale.setScalar(i%4===2?.18:.095);mesh.raycast=()=>{};effects.add(mesh);
  const angle=i*2.39996323;particles.push({mesh,velocity:new THREE.Vector3(Math.cos(angle)*(1+i%3*.3),.8+i%5*.38,Math.sin(angle)*(1+i%3*.3))});
 }
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.65,.025,5,36),new THREE.MeshBasicMaterial({color:'#e5bc7c',transparent:true,opacity:0,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.raycast=()=>{};effects.add(ring);
 function finish(entry){entry.shell.visible=false;entry.card.visible=true;entry.state='revealed';effects.visible=false;burst=null;onReveal(entry.account.id);}
 function detonate(id){
  const entry=entries.get(id);if(!active||!entry||burst)return false;
  if(entry.state==='revealed'){onReveal(id);return true;}
  if(reduced){finish(entry);return true;}
  entry.state='ignited';burst={entry,elapsed:0};effects.position.copy(entry.root.position);return true;
 }
 function setActive(value){active=value;if(!active){hover(null);effects.visible=false;if(burst){burst.entry.shell.rotation.set(0,0,0);burst.entry.shell.visible=true;burst.entry.state='sealed';burst=null;}}}
 function hover(id){for(const [key,entry] of entries){entry.root.scale.setScalar(key===id?1.035:1);entry.spark.visible=key===id||entry.state==='ignited';}}
 function update(dt){
  if(!active||!burst)return;burst.elapsed+=Math.max(0,dt);const {entry,elapsed}=burst;
  if(elapsed<.2){entry.shell.rotation.z=Math.sin(elapsed*65)*.025;return;}
  entry.shell.rotation.z=0;entry.shell.visible=false;effects.visible=true;
  const age=elapsed-.2,fade=Math.max(0,1-age/.65);materials.forEach(material=>material.opacity=fade);
  for(const {mesh,velocity} of particles){mesh.position.copy(velocity).multiplyScalar(age*1.7);mesh.position.y-=2.8*age*age;mesh.rotation.set(age*4,age*3,age*2);}
  ring.scale.setScalar(1+age*2.5);ring.material.opacity=fade*.6;
  if(elapsed>=.85)finish(entry);
 }
 return{group,entries,effects,detonate,setActive,hover,update,get busy(){return!!burst;},get active(){return active;}};
}
