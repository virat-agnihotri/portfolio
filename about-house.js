import * as THREE from 'three';
import {addPhotoFrame} from './photo-frames.js';
import {aboutMedia} from './about-media.js';
import {profile} from './content.js';
import {createAboutComputer} from './about-computer.js';

export const aboutDisplayLayout={
 portrait:{position:[-6.02,2.65,2.5],rotation:Math.PI/2,width:1.25,height:1.6},
 resume:{position:[-6.02,2.65,-1.3],rotation:Math.PI/2,width:1.25,height:1.7},
 certificates:aboutMedia.certificates.map((item,i)=>({position:[6.02,2.7,3.7-i*3.6],rotation:-Math.PI/2,width:1.58,height:1.13}))
};

export function createAboutHouse(parent,{textures=true,computerLoader=null}={}){
 const group=new THREE.Group();group.name='About House — personal studio';parent.add(group);
 const material=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
 const plaster=material('#d4d9de'),ceiling=material('#bfc7cf'),floor=material('#6d7883'),navy=material('#26344b'),wood=material('#847462'),ink=material('#242b38'),silver=new THREE.MeshStandardMaterial({color:'#939fac',metalness:.55,roughness:.45}),fabric=material('#788598');
 function box(name,size,position,mat=ink,parent=group){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.name=name;mesh.position.set(...position);parent.add(mesh);return mesh;}
 function text(lines,position,width,height,rotation=0,{filled=false}={}){
  let mat=new THREE.MeshBasicMaterial({color:filled?'#f1f3f6':'#596477'});
  if(textures){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=lines.length>1?256:128;const ctx=canvas.getContext('2d'),map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
   function paint(){ctx.clearRect(0,0,canvas.width,canvas.height);if(filled){ctx.fillStyle='#f1f3f6';ctx.fillRect(0,0,canvas.width,canvas.height);}ctx.textAlign='center';lines.forEach((line,i)=>{ctx.fillStyle=i===0?'#242b38':'#596477';ctx.font=`${i===0?'700':'500'} ${i===0?46:30}px ${i===0?'Sora':'"DM Sans"'},Arial`;ctx.fillText(line,512,lines.length>1?96+i*75:80,970);});map.needsUpdate=true;}
   paint();document.fonts?.ready.then(paint);mat=new THREE.MeshBasicMaterial({map,transparent:!filled,depthWrite:filled});
  }
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);mesh.position.set(...position);mesh.rotation.y=rotation;mesh.name=lines.join(' / ');group.add(mesh);return mesh;
 }
 function interactive(object,action){object.traverse(child=>child.userData.aboutAction=action);return object;}

 // A complete window-free inner shell replaces the previous mixed finishes.
 box('Studio floor',[12.65,.05,14.7],[0,.09,0],floor);
 for(const side of [-1,1]){
  box('Solid gallery wall',[.09,4.45,14.55],[side*6.18,2.35,0],plaster);
  box('Shadow-gap skirting',[.11,.11,14.55],[side*6.12,.2,0],navy);
  box('Entry wall',[5.25,4.45,.06],[side*3.6,2.35,7.25],plaster);
 }
 box('Return door header',[2,1.8,.06],[0,4,7.25],plaster);
 box('Back wall',[12.55,4.45,.09],[0,2.35,-7.25],plaster);
 box('Quiet flat ceiling',[12.65,.12,14.65],[0,4.58,0],ceiling);
 box('Workstation alcove',[7.1,3.3,.1],[0,2.25,-7.14],navy);
 for(const side of [-1,1])for(let i=0;i<9;i++)box('Oak acoustic batten',[.065,3.3,.055],[side*(3.78+i*.19),2.25,-7.06],wood);
 const glow=new THREE.MeshBasicMaterial({color:'#e4e8ff'});
 for(const side of [-1,1])box('Cove light',[.025,.025,13.7],[side*5.98,4.39,0],glow);
 box('Alcove light',[6.7,.028,.04],[0,4.08,-7.02],glow);
 box('Studio rug',[4.5,.02,7.3],[0,.13,.4],material('#b0b8c4'));
 const fill=new THREE.PointLight('#dfe6ff',7,6,2);fill.position.set(0,3.7,-4.2);fill.castShadow=false;group.add(fill);

 const portrait=addPhotoFrame(group,'portrait',{...aboutDisplayLayout.portrait,color:'#7c8595',source:aboutMedia.portrait,textures});
 if(!aboutMedia.portrait)text(['VA'],[-5.91,2.65,2.5],.88,.8,Math.PI/2,{filled:true});else interactive(portrait,'portrait');
 text([profile.name],[-5.9,1.67,2.5],1.55,.19,Math.PI/2);
 const resume=addPhotoFrame(group,'resume',{...aboutDisplayLayout.resume,color:'#7c8595',source:aboutMedia.resumePreview,textures});interactive(resume,'resume');
 interactive(text(['RÉSUMÉ · CLICK TO READ'],[-5.9,1.62,-1.3],1.55,.2,Math.PI/2),'resume');
 text(['THE PERSON BEHIND THE WORK'],[-6.08,3.95,.6],4.4,.32,Math.PI/2);
 text(['HACKATHONS & CERTIFICATES'],[6.08,3.95,0],4.4,.32,-Math.PI/2);
 aboutMedia.certificates.forEach((certificate,i)=>{
  const slot=aboutDisplayLayout.certificates[i],z=slot.position[2];
  const frame=addPhotoFrame(group,'certificate-'+certificate.id,{...slot,color:'#7c8595',source:certificate.image,textures});interactive(frame,'certificate:'+certificate.id);
  interactive(text([certificate.title,certificate.organizer],[5.9,1.87,z],1.7,.36,-Math.PI/2),'certificate:'+certificate.id);
 });

 const workstation=new THREE.Group();workstation.name='Gaming workstation';group.add(workstation);
 for(const x of [-1.28,1.28])box('Desk trestle',[.14,.82,1.28],[x,.55,-4.65],silver,workstation);
 box('Desk crossbar',[2.7,.09,.12],[0,.79,-5.1],silver,workstation);
 const fallback=new THREE.Group();fallback.name='Computer loading fallback';workstation.add(fallback);
 box('Fallback tabletop',[3.35,.09,1.68],[0,1.015,-4.65],material('#d9dce3'),fallback);
 box('Fallback monitor',[1.65,.96,.1],[-.25,1.75,-4.97],ink,fallback);
 box('Fallback monitor stand',[.1,.26,.1],[-.25,1.17,-4.97],silver,fallback);
 const screen=text(['VIRAT AGNIHOTRI','Click the computer to explore'],[-.25,1.75,-4.909],1.47,.81,0,{filled:true});fallback.attach(screen);interactive(fallback,'desktop');
 const computer=createAboutComputer(workstation,fallback,{loader:computerLoader,enabled:textures||!!computerLoader});
 interactive(text(['CLICK THE COMPUTER TO GET TO KNOW ME'],[0,1.13,-3.73],2.5,.2),'desktop');

 box('Task chair seat',[.66,.12,.65],[0,.62,-2.7],fabric);
 box('Task chair back',[.66,.72,.1],[0,1,-2.39],fabric);
 box('Chair stem',[.08,.44,.08],[0,.34,-2.7],silver);
 box('Chair base',[.73,.06,.09],[0,.15,-2.7],silver);box('Chair base',[.09,.06,.73],[0,.15,-2.7],silver);
 const stat=interactive(text([profile.typingWpm+' WPM','Typing speed'],[-5.94,2.65,-4.8],1.25,.6,Math.PI/2,{filled:true}),'typing');stat.name='Typing speed display';
 return{group,workstation,computer,activate(){computer.activate();}};
}

export function avoidAboutDesk(next,previous,cx=104){
 const x=cx,z=-9.65,halfX=2.05,halfZ=1.12;
 if(Math.abs(next.x-x)<halfX&&Math.abs(next.z-z)<halfZ){if(Math.abs(previous.x-x)>=halfX)next.x=x+Math.sign(previous.x-x)*halfX;else next.z=z+(Math.sign(previous.z-z)||1)*halfZ;}
 return next;
}
