import * as THREE from 'three';

export function createFruitMarket(world,{textures=true}={}){
 const group=new THREE.Group();group.name='Fruit tent and vendor';group.position.set(-7.8,0,7.4);group.rotation.y=Math.PI/2;world.add(group);
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.9});const wood=mat('#977555'),green=mat('#53705c'),cream=mat('#e9ddc6'),skin=mat('#b98662'),dark=mat('#303b34');
 function box(name,size,position,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...position);group.add(mesh);return mesh;}
 for(const x of [-2.12,2.12])for(const z of [-1.5,1.5])box('Tent pole',[.075,2.68,.075],[x,1.4,z],wood);
 for(let i=0;i<8;i++){
  const x=-2.4+i*.6,geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([x,2.76,1.75,x+.6,2.76,1.75,x+.6,3.3,0,x,2.76,1.75,x+.6,3.3,0,x,3.3,0,x,3.3,0,x+.6,3.3,0,x+.6,2.76,-1.75,x,3.3,0,x+.6,2.76,-1.75,x,2.76,-1.75],3));geometry.computeVertexNormals();const cloth=(i%2?cream:green).clone();cloth.side=THREE.DoubleSide;group.add(new THREE.Mesh(geometry,cloth));box('Striped valance',[.6,.23,.04],[x+.3,2.66,1.75],i%2?cream:green);
 }
 box('Fruit counter',[3.85,.15,.95],[0,.98,1.05],wood);box('Counter front',[3.85,.65,.09],[0,.59,1.5],green);
 for(const x of [-1.65,1.65])box('Counter support',[.12,.83,.7],[x,.52,1.04],wood);
 const fruitGeo=new THREE.IcosahedronGeometry(1,1),fruitMaterials=['#9f3f35','#d18c38','#e3be53','#66804b'].map(mat);
 for(let bin=0;bin<4;bin++){
  const x=-1.44+bin*.96;box('Fruit crate base',[.86,.1,.78],[x,1.1,1.04],wood);for(const z of [.64,1.44])box('Crate rim',[.88,.19,.04],[x,1.2,z],wood);
  for(let i=0;i<9;i++){const fruit=new THREE.Mesh(fruitGeo,fruitMaterials[bin]);fruit.name=['Apple','Orange','Lemon','Pear'][bin];fruit.position.set(x+(i%3-1)*.25,1.25+(i%2)*.025,.81+Math.floor(i/3)*.22);fruit.scale.set(.115,bin===3?.16:.12,.115);group.add(fruit);}
 }
 const vendor=new THREE.Group();vendor.name='Fruit vendor';vendor.position.set(.3,0,-.1);group.add(vendor);
 function personPart(name,size,position,material){const part=box(name,size,position,material);vendor.attach(part);return part;}
 personPart('Vendor shirt',[.48,.62,.3],[.3,1.43,-.1],cream);personPart('Vendor apron',[.38,.6,.035],[.3,1.37,.072],green);
 for(const x of [.15,.45])personPart('Vendor leg',[.13,.9,.17],[x,.6,-.1],dark);
 personPart('Vendor waistband',[.46,.15,.28],[.3,1.1,-.1],dark);for(const x of [.15,.45])personPart('Vendor shoe',[.18,.1,.28],[x,.19,-.035],dark);
 for(const [x,angle] of [[-.015,-.22],[.615,.22]]){const arm=personPart('Vendor arm',[.12,.55,.13],[x,1.36,.06],cream);arm.rotation.x=-.4;arm.rotation.z=angle;personPart('Vendor hand',[.115,.14,.115],[x,1.1,.18],skin);}
 const head=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),skin);head.name='Vendor head';head.position.set(.3,1.94,-.1);group.add(head);vendor.attach(head);
 personPart('Vendor cap',[.4,.09,.36],[.3,2.09,-.1],green);personPart('Cap visor',[.39,.035,.2],[.3,2.05,.1],green);
 for(const x of [.24,.36])personPart('Vendor eye',[.018,.021,.015],[x,1.96,.08],dark);
 personPart('Vendor smile',[.075,.012,.015],[.3,1.86,.08],dark);
 let signMaterial=cream;if(textures){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#f2e8d4';ctx.fillRect(0,0,1024,128);ctx.textAlign='center';ctx.fillStyle='#34483d';ctx.font='700 42px "DM Sans",Arial';ctx.fillText('THE QUARTER FRUIT STALL',512,55);ctx.font='19px "DM Sans",Arial';ctx.fillText('Fresh fruit · A little street-side stop',512,98);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;signMaterial=new THREE.MeshBasicMaterial({map});}
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.45),signMaterial);sign.name='Fruit stall sign';sign.position.set(0,2.46,1.55);group.add(sign);
 return group;
}
