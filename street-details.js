import * as THREE from 'three';

export function omitStreetProp(name,parent,center){
 if(/^(a_board|board_label)/.test(name)||name==='sign_bookshop')return true;
 return /^(tree_trunk|tree_grate|branch|foliage)/.test(name)&&center.x>3&&center.x<9&&center.z>-51&&center.z< -43;
}

export function addDevelopmentHouse(world,{textures=true}={}){
 const group=new THREE.Group();group.name='Future house construction barrier';world.add(group);
 const dark=new THREE.MeshStandardMaterial({color:'#343c3e',roughness:.8}),gold=new THREE.MeshStandardMaterial({color:'#d6ad5b',roughness:.8});
 function box(name,size,position,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...position);group.add(mesh);return mesh;}
 function sign(lines,position,width,height,background='#f1e6cd',ink='#34483d'){
  let material=new THREE.MeshBasicMaterial({color:background});
  if(textures){const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=384;const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,1536,384);ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((line,i)=>{ctx.font=`700 ${lines.length===1?100:i===0?87:46}px Arial`;ctx.fillText(line,768,lines.length===1?192:145+i*115,1420);});const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;material=new THREE.MeshBasicMaterial({map});}
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);mesh.name=lines.join(' / ');mesh.position.set(...position);mesh.rotation.y=-Math.PI/2;group.add(mesh);
 }
 sign(['THE NEXT CHAPTER'],[6.14,3.86,-47],6.7,.62);
 for(const z of [-48.35,-45.65]){box('Barrier upright',[.16,1.3,.16],[5.5,.77,z],dark);box('Barrier foot',[.8,.12,.5],[5.5,.2,z],dark);}
 for(const y of [.65,1.15]){
  box('Barrier rail',[.15,.26,3.15],[5.5,y,-47],gold);
  for(let i=0;i<10;i++){const stripe=box('Barrier hazard stripe',[.015,.27,.12],[5.415,y,-48.4+i*.3],dark);stripe.rotation.x=-.38;}
 }
 sign(['UNDER DEVELOPMENT','Something new is taking shape.'],[5.39,1.8,-47],2.85,.72,'#343c3e','#f0ce83');
 return group;
}
