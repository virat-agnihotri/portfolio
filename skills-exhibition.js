import * as THREE from 'three';
import {profile} from './content.js';

const logos={Python:'python','C++':'cplusplus',JavaScript:'javascript',TypeScript:'typescript',HTML:'html5',CSS:'css3',React:'react',FastAPI:'fastapi',PostgreSQL:'postgresql',SQLite:'sqlite',SQLAlchemy:'sqlalchemy',Supabase:'supabase',PyTorch:'pytorch','Hugging Face Transformers':'huggingface',Wav2Vec2:'huggingface',MiniLM:'huggingface',OpenCV:'opencv',NumPy:'numpy','Three.js':'threejs','React Three Fiber':'react',Git:'git',pytest:'pytest'};

export function skillsExhibitionLayout(skills=profile.skills){
 const items=skills.flatMap(category=>category.items.map(name=>({name,category:category.name,logo:logos[name]||null})));
 return items.map((item,index)=>{
  let wall,column,position,rotation;
  if(index<12){wall='left';column=Math.floor(index/2);position=[-6.08,index%2?1.95:3.65,5.65-column*2.15];rotation=Math.PI/2;}
  else if(index<22){wall='front';column=Math.floor((index-12)/2);position=[-4.3+column*2.15,index%2?1.95:3.65,-7.17];rotation=0;}
  else{wall='right';column=Math.floor((index-22)/2);position=[6.08,index%2?1.95:3.65,-5.1+column*2.15];rotation=-Math.PI/2;}
  // All positions are relative to the room's center at z=-5.
  return{...item,index,wall,position,rotation};
 });
}

function createAtlas(items){
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1440;const ctx=canvas.getContext('2d');
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 const loaded=new Map();let requested=false;
 function paint(item){
  const x=item.index%6*256,y=Math.floor(item.index/6)*240;ctx.save();ctx.translate(x,y);ctx.fillStyle='#f4efdf';ctx.fillRect(0,0,256,240);
  ctx.fillStyle='#a0804b';ctx.font='10px Arial';ctx.textAlign='left';ctx.fillText(String(item.index+1).padStart(2,'0'),17,23);
  const image=loaded.get(item.logo);
  if(image){const scale=110/Math.max(image.naturalWidth,image.naturalHeight);ctx.drawImage(image,128-image.naturalWidth*scale/2,89-image.naturalHeight*scale/2,image.naturalWidth*scale,image.naturalHeight*scale);}
  else{ctx.fillStyle='#344a45';ctx.textAlign='center';ctx.font=`600 ${item.name.length>12?25:34}px Arial`;const title=item.name==='Hugging Face Transformers'?'Hugging Face':item.name;ctx.fillText(title,128,95,218);}
  ctx.strokeStyle='#c4b493';ctx.beginPath();ctx.moveTo(25,157);ctx.lineTo(231,157);ctx.stroke();ctx.textAlign='center';ctx.fillStyle='#263e37';ctx.font='600 17px Arial';
  const words=item.name.split(' '),lines=[''];for(const word of words){const i=lines.length-1;if(ctx.measureText(lines[i]+word).width>216&&lines[i])lines.push(word+' ');else lines[i]+=word+' ';}
  lines.slice(0,2).forEach((line,i)=>ctx.fillText(line.trim(),128,185+i*19,220));ctx.fillStyle='#7c806e';ctx.font='9px Arial';ctx.fillText(item.category.toUpperCase(),128,225,225);ctx.restore();map.needsUpdate=true;
 }
 items.forEach(paint);
 return{map,load(){if(requested)return;requested=true;for(const slug of new Set(items.map(item=>item.logo).filter(Boolean))){const image=new Image();image.onload=()=>{loaded.set(slug,image);items.filter(item=>item.logo===slug).forEach(paint);};image.src=`assets/technology-logos/${slug}.svg`;}}};
}

export function createSkillsExhibition(parent,{textures=true}={}){
 const group=new THREE.Group();group.name='Skills exhibition';parent.add(group);const items=skillsExhibitionLayout();
 const brass=new THREE.MeshStandardMaterial({color:'#b99a60',metalness:.65,roughness:.4}),frame=new THREE.MeshStandardMaterial({color:'#233b34',roughness:.7}),paper=new THREE.MeshStandardMaterial({color:'#efe9d6',roughness:.9}),red=new THREE.MeshStandardMaterial({color:'#8c2036',roughness:1});
 function box(name,size,position,material,parent=group){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...position);parent.add(mesh);return mesh;}
 box('Burgundy central runner',[2.85,.035,12.9],[0,.14,-.1],red);
 for(const x of [-1.34,1.34])box('Carpet gold piping',[.025,.006,12.65],[x,.161,-.1],brass);
 for(const z of [-6.43,6.23])box('Carpet end border',[2.7,.006,.025],[0,.161,z],brass);
 const atlas=textures?createAtlas(items):null,artMaterial=atlas?new THREE.MeshStandardMaterial({map:atlas.map,emissiveMap:atlas.map,emissive:'#fff5df',emissiveIntensity:.32,roughness:.9}):paper;
 const lightMaterial=new THREE.MeshBasicMaterial({color:'#ffe3a1'});
 for(const item of items){
  const display=new THREE.Group();display.name='Skill frame: '+item.name;display.position.set(...item.position);display.rotation.y=item.rotation;display.userData.skill=item.name;display.userData.wall=item.wall;group.add(display);
  box('Raised dark frame',[1.72,1.57,.13],[0,0,0],frame,display);box('Brass frame edge',[1.64,1.49,.035],[0,0,.075],brass,display);box('Ivory mat',[1.57,1.42,.025],[0,0,.1],paper,display);
  const geometry=new THREE.PlaneGeometry(1.46,1.33),uv=geometry.attributes.uv;const col=item.index%6,row=Math.floor(item.index/6);for(let i=0;i<uv.count;i++)uv.setXY(i,(col+uv.getX(i))/6,1-(row+1-uv.getY(i))/6);
  const art=new THREE.Mesh(geometry,artMaterial);art.position.z=.116;display.add(art);
  box('Picture light bracket',[.04,.12,.22],[0,.85,.1],brass,display);box('Picture light',[.78,.055,.12],[0,.9,.2],brass,display);box('Warm light strip',[.69,.015,.09],[0,.868,.2],lightMaterial,display);
 }
 return{group,items,activate(){atlas?.load();}};
}
