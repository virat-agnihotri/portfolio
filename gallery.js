import * as THREE from 'three';
import { createExhibitModelQueue } from './exhibit-models.js';
import { galleryLayout,galleryModels,galleryScreenshots } from './gallery-layout.js';

const ink='#263d35',cream='#f4ead7';
function texture(paint,w=1024,h=768){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;paint(canvas.getContext('2d'),w,h);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return{map,canvas};}
function wrap(context,text,width){let line='',lines=[];for(const word of text.split(' ')){const test=line?line+' '+word:word;if(context.measureText(test).width>width&&line){lines.push(line);line=word;}else line=test;}lines.push(line);return lines;}
function poster(project,index){
 let screenshot=null;
 const paint=(c,w,h)=>{c.fillStyle=cream;c.fillRect(0,0,w,h);c.fillStyle=project.color;c.fillRect(0,0,14,h);c.fillStyle=ink;c.textAlign='left';c.font='600 18px "DM Sans", Arial, sans-serif';c.fillText('SELECTED WORK / VIRAT AGNIHOTRI',60,62);c.fillStyle='#8a7559';c.textAlign='right';c.fillText(String(index+1).padStart(2,'0'),w-55,62);c.textAlign='left';c.fillStyle=ink;c.font='700 69px "DM Sans", Arial, sans-serif';wrap(c,project.title,w-120).slice(0,2).forEach((line,i)=>c.fillText(line,58,164+i*82));c.fillStyle='#6b795f';c.font='500 19px "DM Sans", Arial, sans-serif';c.fillText(project.category,60,302);
  c.fillStyle=project.color;c.beginPath();c.roundRect(60,345,w-120,258,12);c.fill();c.strokeStyle='#34483d44';c.lineWidth=2;
  if(project.id==='lunar'){c.fillStyle=ink;c.beginPath();c.arc(510,470,76,0,Math.PI*2);c.fill();c.strokeStyle=ink;c.beginPath();c.ellipse(510,470,235,90,-.18,0,Math.PI*2);c.stroke();c.fillRect(705,420,18,18);c.strokeRect(680,422,20,14);c.strokeRect(728,422,20,14);}
  else if(project.id==='tone'){c.fillStyle=ink;for(let i=0;i<55;i++){const height=18+Math.abs(Math.sin(i*.64)*Math.cos(i*.19))*140;c.fillRect(160+i*13,475-height/2,5,height);}}
  else if(project.id==='rocket'){c.strokeStyle=ink;c.lineWidth=3;c.beginPath();c.moveTo(205,555);c.bezierCurveTo(370,550,500,350,825,400);c.stroke();c.fillStyle=ink;c.beginPath();c.moveTo(815,373);c.lineTo(850,396);c.lineTo(810,418);c.closePath();c.fill();c.font='600 18px "DM Sans", Arial';c.fillText('TRAJECTORY / OPTIMIZATION / TELEMETRY',125,405);}
  else{const words=project.id==='knowledge'?['PAGES','DOCUMENTS','KNOWLEDGE']:['PDF','RETRIEVAL','ANSWER'];words.forEach((word,i)=>{const x=125+i*270;c.strokeRect(x,425,225,100);c.font='600 19px "DM Sans", Arial';c.fillStyle=ink;c.fillText(word,x+20,482);if(i<2){c.beginPath();c.moveTo(x+230,475);c.lineTo(x+263,475);c.stroke();}});}
  if(screenshot){c.fillStyle=project.color;c.fillRect(60,345,w-120,258);const scale=Math.min((w-140)/screenshot.naturalWidth,238/screenshot.naturalHeight),iw=screenshot.naturalWidth*scale,ih=screenshot.naturalHeight*scale;c.drawImage(screenshot,(w-iw)/2,355+(238-ih)/2,iw,ih);}
  c.fillStyle=ink;c.font='500 18px "DM Sans", Arial, sans-serif';c.fillText(project.tags.slice(0,4).join('   /   '),60,663);c.fillStyle='#9a7953';c.font='600 16px "DM Sans", Arial, sans-serif';c.fillText('EXPLORE THE PROJECT ↗',60,714);
 };const result=texture(paint);document.fonts?.ready.then(()=>{paint(result.canvas.getContext('2d'),1024,768);result.map.needsUpdate=true;});if(galleryScreenshots[project.id]){const image=new Image();image.onload=()=>{screenshot=image;paint(result.canvas.getContext('2d'),1024,768);result.map.needsUpdate=true;};image.src=galleryScreenshots[project.id];}return result.map;
}
export function createGalleryExhibits(world,projects,{reduced=false}={}){
 const galleryRoot=new THREE.Group();galleryRoot.name='Cached gallery exhibits';galleryRoot.visible=false;world.add(galleryRoot);world=galleryRoot;
 const materials={dark:new THREE.MeshStandardMaterial({color:ink,roughness:.7}),trim:new THREE.MeshStandardMaterial({color:'#b99a65',metalness:.45,roughness:.4}),stone:new THREE.MeshStandardMaterial({color:'#59615a',roughness:.85}),paper:new THREE.MeshStandardMaterial({color:cream,roughness:.85})};
 const exhibits=new Map(),animated=[],colliders=[],modelQueue=createExhibitModelQueue({reduced});
 function mesh(group,geometry,material,position=[0,0,0]){const o=new THREE.Mesh(geometry,material);o.position.set(...position);group.add(o);return o;}
 for(const slot of galleryLayout){const index=projects.findIndex(p=>p.id===slot.id);if(index<0)continue;const project=projects[index],root=new THREE.Group();root.userData.projectIndex=index;root.position.set(...slot.position);root.rotation.y=slot.rotation;world.add(root);
  mesh(root,new THREE.BoxGeometry(3.67,2.82,.09),materials.dark,[0,0,-.10]);mesh(root,new THREE.BoxGeometry(3.55,2.7,.24),materials.trim,[0,0,.025]);mesh(root,new THREE.BoxGeometry(3.42,2.57,.08),materials.dark,[0,0,.18]);
  const posterMap=poster(project,index);const art=mesh(root,new THREE.PlaneGeometry(3.3,2.475),new THREE.MeshStandardMaterial({map:posterMap,emissiveMap:posterMap,emissive:'#fff2d7',emissiveIntensity:.14,roughness:.9}),[0,0,.225]);art.name='project_art_'+index;mesh(root,new THREE.BoxGeometry(1.7,.055,.13),materials.trim,[0,1.53,.16]);
  const stand=new THREE.Group();stand.position.set(...slot.plinth);stand.position.y+=.07;stand.rotation.y=slot.rotation;stand.userData.projectIndex=index;world.add(stand);
  mesh(stand,new THREE.BoxGeometry(1.4,.83,1.4),materials.stone);mesh(stand,new THREE.BoxGeometry(1.52,.07,1.52),materials.dark,[0,.45,0]);mesh(stand,new THREE.BoxGeometry(1.46,.035,1.46),materials.trim,[0,-.43,0]);
  const label=texture((c,w,h)=>{c.fillStyle=ink;c.fillRect(0,0,w,h);c.fillStyle=cream;c.font='600 27px "DM Sans", Arial';c.fillText(`${String(index+1).padStart(2,'0')} / ${project.shortTitle.toUpperCase()}`,22,60);},700,110).map;mesh(stand,new THREE.PlaneGeometry(1.25,.2),new THREE.MeshBasicMaterial({map:label}),[0,.18,.708]);
  const modelGroup=new THREE.Group();modelGroup.position.y=.49;modelGroup.userData.projectIndex=index;stand.add(modelGroup);colliders.push({x:slot.plinth[0],z:slot.plinth[2],half:.96});
  const exhibit={slot,index,modelGroup,jobs:[]};exhibits.set(index,exhibit);const enqueue=(path,group,limits,options={},onReady)=>{const job=modelQueue.add({path,group,anchor:slot.plinth,limits,options,onReady});exhibit.jobs.push(job);return job;};
  if(slot.id==='tone'){
   // Both cars have their long axis along the plinth's depth, at equal scale.
   for(const [path,x] of [[galleryModels.tone,-.34],[galleryModels.mercedes,.34]]){const car=new THREE.Group();car.position.x=x;car.userData.projectIndex=index;modelGroup.add(car);enqueue(path,car,[.58,.65,1.28],{longAxisZ:true});}
  }else if(slot.id==='lunar'){
   let moonReady=false,satelliteReady=false;const moon=new THREE.Group();moon.position.y=.6;moon.userData.projectIndex=index;modelGroup.add(moon);
   const orbit=new THREE.Group();orbit.position.y=.6;orbit.rotation.z=.18;orbit.visible=false;modelGroup.add(orbit);animated.push(orbit);
   const satellite=new THREE.Group();satellite.position.x=.86;satellite.userData.projectIndex=index;orbit.add(satellite);
   enqueue(galleryModels.lunar,moon,[1.05,1.05,1.05],{centered:true},()=>{moonReady=true;orbit.visible=satelliteReady;});
   enqueue(galleryModels.satellite,satellite,[.42,.18,.26],{centered:true},()=>{satelliteReady=true;orbit.visible=moonReady;});
  }else if(slot.id==='rocket')enqueue(galleryModels.rocket,modelGroup,[1.15,2.1,1.15],{upright:true});
  else if(slot.id==='knowledge')enqueue(galleryModels.knowledge,modelGroup,[1.2,1.65,.85]);
  else if(slot.id==='docintel')enqueue(galleryModels.docintel,modelGroup,[1.2,1.5,1.2]);
  root.traverse(o=>o.userData.projectIndex=index);stand.traverse(o=>{o.userData.projectIndex=index;o.userData.isExhibitStand=true;});
 }
 return{colliders,root:galleryRoot,get:index=>exhibits.get(index),update(dt,inGallery,position,paused=false){galleryRoot.visible=inGallery;modelQueue.update(dt,inGallery,position,!paused);if(inGallery&&!reduced&&!paused)animated.forEach(orbit=>orbit.rotation.y+=dt*.35);}};
}
