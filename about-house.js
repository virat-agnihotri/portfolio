import * as THREE from 'three';
import {addPhotoFrame} from './photo-frames.js';
import {aboutMedia} from './about-media.js';
import {profile} from './content.js';

export function createAboutHouse(parent,{textures=true}={}){
 const group=new THREE.Group();group.name='Virat personal exhibition';parent.add(group);
 const ink=new THREE.MeshStandardMaterial({color:'#242b38',roughness:.65}),wood=new THREE.MeshStandardMaterial({color:'#8f715b',roughness:.8}),silver=new THREE.MeshStandardMaterial({color:'#afb4c0',metalness:.55,roughness:.4});
 function box(name,size,position,material=ink){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...position);group.add(mesh);return mesh;}
 function label(lines,w=640,h=400){
  if(!textures)return new THREE.MeshBasicMaterial({color:'#f1f3f6'});
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  function paint(){ctx.fillStyle='#f1f3f6';ctx.fillRect(0,0,w,h);ctx.fillStyle='#5951b8';ctx.fillRect(0,0,w,6);ctx.textAlign='center';lines.forEach((line,i)=>{ctx.font=`${i===0?'800':'500'} ${i===0?Math.round(h*.16):Math.round(h*.075)}px ${i===0?'Sora':'"DM Sans"'},Arial`;ctx.fillStyle=i===0?'#242b38':'#596477';ctx.fillText(line,w/2,h*(.34+i*.2),w-40);});map.needsUpdate=true;}
  paint();document.fonts?.ready.then(paint);return new THREE.MeshBasicMaterial({map});
 }
 function sign(lines,position,width,height,rotation=0){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),label(lines));mesh.position.set(...position);mesh.rotation.y=rotation;group.add(mesh);return mesh;}
 function interactive(object,action){object.traverse(child=>child.userData.aboutAction=action);return object;}
 const portrait=addPhotoFrame(group,'portrait',{position:[-3.75,2.75,-7.12],width:1.36,height:1.75,color:'#b39a7f',source:aboutMedia.portrait,textures});
 if(!aboutMedia.portrait)sign(['VA',profile.name],[-3.75,2.75,-7.02],1.07,1.46);
 else interactive(portrait,'portrait');
 sign(['VIRAT AGNIHOTRI','Builder · Explorer'],[-3.75,1.53,-7.01],2.3,.48);
 const resume=addPhotoFrame(group,'resume',{position:[-6.06,2.75,-.6],rotation:Math.PI/2,width:1.4,height:1.9,color:'#9183af',source:aboutMedia.resumePreview,textures});interactive(resume,'resume');
 interactive(sign(['RÉSUMÉ','Click to read'],[-5.94,1.49,-.6],1.55,.47,Math.PI/2),'resume');
 aboutMedia.certificates.forEach((certificate,i)=>{
  const z=3.7-i*3.6;const frame=addPhotoFrame(group,'certificate-'+certificate.id,{position:[6.06,2.75,z],rotation:-Math.PI/2,width:1.62,height:1.23,color:'#b39a7f',source:certificate.image,textures});interactive(frame,'certificate:'+certificate.id);
  sign([certificate.title,certificate.organizer+(certificate.image?'':' · Awaiting certificate')],[5.94,1.77,z],2.3,.5,-Math.PI/2);
 });
 // Built-in workstation; a supplied table/desktop GLB can replace this group later.
 const workstation=new THREE.Group();workstation.name='Replaceable desktop workstation';group.add(workstation);
 const top=box('Walnut desktop',[3.5,.13,1.35],[0,1.02,-4.8],wood);workstation.attach(top);
 for(const x of [-1.42,1.42]){const leg=box('Desk leg',[.11,.86,1.12],[x,.54,-4.8],silver);workstation.attach(leg);}
 const monitor=box('Desktop monitor',[1.96,1.18,.12],[0,1.92,-5.02]);workstation.attach(monitor);interactive(monitor,'desktop');
 const screen=sign(['VIRAT AGNIHOTRI','Click to get to know me',profile.typingWpm+' WPM · Typing speed'],[0,1.92,-4.951],1.8,1.02);workstation.attach(screen);interactive(screen,'desktop');
 for(const [name,size,position] of [['Monitor stand',[.12,.35,.13],[0,1.27,-5.02]],['Monitor base',[.62,.035,.38],[0,1.105,-4.97]],['Desktop computer',[.4,.74,.83],[1.25,1.46,-4.86]],['Keyboard',[1.05,.045,.34],[-.15,1.11,-4.42]],['Mouse',[.13,.055,.22],[.69,1.12,-4.43]]]){
  const piece=box(name,size,position);workstation.attach(piece);interactive(piece,'desktop');
 }
 interactive(sign([profile.typingWpm+' WPM','Typing speed'],[-5.94,2.8,-4.3],1.55,.95,Math.PI/2),'typing');
 return{group,workstation};
}

export function avoidAboutDesk(next,previous,cx=104){
 const x=cx,z=-9.8,halfX=1.95,halfZ=.95;
 if(Math.abs(next.x-x)<halfX&&Math.abs(next.z-z)<halfZ){
  if(Math.abs(previous.x-x)>=halfX)next.x=x+Math.sign(previous.x-x)*halfX;
  else next.z=z+(Math.sign(previous.z-z)||1)*halfZ;
 }
 return next;
}
