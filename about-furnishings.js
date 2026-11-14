import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export const aboutFurnitureObstacles=[
 {x:-4.2,z:2.8,halfX:.8,halfZ:.85},
 {x:-2.95,z:2.8,halfX:.46,halfZ:.46},
 {x:-5.35,z:-.6,halfX:.57,halfZ:1.65},
 {x:5.35,z:.1,halfX:.6,halfZ:1.85},
 {x:-5.15,z:-5.8,halfX:.65,halfZ:.65},
 {x:5.15,z:-5.8,halfX:.65,halfZ:.65}
];

export function addAboutFurnishings(parent){
 const group=new THREE.Group();group.name='Studio reading corner and furnishings';parent.add(group);
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.85});
 const oak=mat('#96806a'),navy=mat('#34455d'),fabric=mat('#8b9db6'),ivory=mat('#d8d8cf'),brass=new THREE.MeshStandardMaterial({color:'#bca178',metalness:.4,roughness:.5});
 function box(name,size,position,material=oak,parent=group,rounded=false){const mesh=new THREE.Mesh(rounded?new RoundedBoxGeometry(...size,2,.05):new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...position);parent.add(mesh);return mesh;}
 function cylinder(name,r1,r2,height,position,material=oak,parent=group){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,height,16),material);mesh.name=name;mesh.position.set(...position);parent.add(mesh);return mesh;}
 function plant(x,z,scale=1){
  const plant=new THREE.Group();plant.name='Potted studio plant';plant.position.set(x,0,z);plant.scale.setScalar(scale);group.add(plant);
  cylinder('Ceramic planter',.32,.25,.48,[0,.36,0],ivory,plant);cylinder('Soil',.29,.29,.025,[0,.607,0],mat('#433b34'),plant);
  cylinder('Plant stem',.025,.035,1.14,[0,1.17,0],mat('#52634c'),plant);
  const leafGeo=new THREE.SphereGeometry(1,7,5),green=[mat('#546e54'),mat('#6e865e')];
  for(let i=0;i<10;i++){const angle=i*2.399,leaf=new THREE.Mesh(leafGeo,green[i%2]);leaf.scale.set(.15,.43,.075);leaf.position.set(Math.cos(angle)*.28,.87+i*.105,Math.sin(angle)*.28);leaf.rotation.set(Math.sin(angle)*.6,angle,Math.cos(angle)*-.65);plant.add(leaf);}
  return plant;
 }
 // Reading corner stays off the central walking aisle and below the portrait.
 box('Reading nook rug',[2.85,.016,3.1],[-4.2,.14,2.75],mat('#777f91'));
 const chair=new THREE.Group();chair.name='Reading armchair';chair.position.set(-4.2,0,2.8);chair.rotation.y=Math.PI/2;group.add(chair);
 box('Reading chair seat',[1.1,.19,1.08],[0,.61,0],fabric,chair,true);box('Reading chair back',[1.1,1.02,.2],[0,1.02,-.44],fabric,chair,true);
 for(const side of [-1,1]){box('Chair arm',[.15,.35,1.08],[side*.52,.8,0],navy,chair,true);for(const z of [-.36,.36])box('Chair foot',[.065,.4,.065],[side*.4,.32,z],brass,chair);}
 cylinder('Reading side table',.36,.36,.075,[-2.95,.66,2.8],oak);cylinder('Side table pedestal',.055,.065,.48,[-2.95,.39,2.8],brass);cylinder('Side table base',.23,.23,.045,[-2.95,.17,2.8],navy);
 box('Open reading book',[.37,.035,.29],[-3,.72,2.82],ivory);box('Book cover',[.4,.02,.31],[-3,.695,2.82],navy);
 cylinder('Reading mug',.075,.065,.12,[-2.78,.76,2.68],ivory);
 cylinder('Floor lamp base',.24,.24,.05,[-5.25,.17,4],brass);cylinder('Floor lamp stem',.025,.025,1.65,[-5.25,1.02,4],brass);
 cylinder('Floor lamp shade',.18,.34,.35,[-5.25,1.99,4],ivory);
 const lamp=new THREE.PointLight('#ffe5be',3,3.5,2);lamp.position.set(-5.25,1.82,4);lamp.castShadow=false;group.add(lamp);

 // Low furniture leaves the résumé and certificate frames completely exposed.
 box('Low bookcase',[.82,1.02,2.8],[-5.35,.65,-.6],navy);
 for(const y of [.36,.73,1.11])box('Open oak shelf',[.87,.055,2.86],[-5.32,y,-.6],oak);
 const bookColors=['#b7a38b','#788da2','#9a7973','#bfc6c5','#576a83'].map(mat);
 const books=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({roughness:.9}),24),dummy=new THREE.Object3D();books.name='Reading collection';
 for(let i=0;i<24;i++){const row=Math.floor(i/12),height=.19+(i%4)*.027;dummy.position.set(-4.88,.39+row*.37+height/2,-1.82+(i%12)*.22);dummy.scale.set(.27,height,.12+(i%3)*.018);dummy.rotation.set(0,0,i%7===0?.1:0);dummy.updateMatrix();books.setMatrixAt(i,dummy.matrix);books.setColorAt(i,bookColors[i%bookColors.length].color);}books.instanceMatrix.needsUpdate=true;group.add(books);
 box('Certificate sideboard',[.95,.82,3.3],[5.35,.57,.1],oak);box('Sideboard top',[1.02,.07,3.4],[5.35,1.015,.1],navy);
 for(const z of [-.73,.93]){box('Sideboard door',[.035,.61,1.47],[4.856,.58,z],ivory);box('Sideboard handle',[.025,.045,.19],[4.824,.62,z],brass);}
 const vase=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.12,0),new THREE.Vector2(.19,.1),new THREE.Vector2(.16,.3),new THREE.Vector2(.07,.46),new THREE.Vector2(.07,.5)],16),ivory);vase.name='Ceramic vase';vase.position.set(5.28,1.05,1.05);group.add(vase);
 for(let i=0;i<3;i++)box('Sideboard books',[.52,.045,.65],[5.25,1.08+i*.048,-.8],bookColors[i]);
 // Small back-wall shelves balance the computer alcove.
 for(const y of [2.02,3.05]){box('Alcove floating shelf',[1.2,.055,.34],[-2.72,y,-6.89],oak);for(let i=0;i<5;i++)box('Alcove shelf book',[.13,.29+i%2*.08,.22],[-3.12+i*.18,y+.18,-6.88],bookColors[i]);}
 box('Alcove display shelf',[1.22,.055,.36],[2.72,2.12,-6.89],oak);box('Sculptural bookend',[.2,.35,.18],[2.42,2.32,-6.84],brass);
 for(let i=0;i<3;i++)box('Stacked journals',[.57,.06,.23],[2.91,2.19+i*.06,-6.85],bookColors[i]);
 plant(-5.15,-5.8);plant(5.15,-5.8);
 return group;
}
