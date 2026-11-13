import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createAtmosphere, styleMaterial, worldUV } from './environment.js';
import { createEntrances, entrancePose } from './entrances.js';
import { addTown, nearbyShop, shopGlance } from './town.js';
import { easeWalking, wrapAngle } from './movement.js';

import { profile, projects, galleryHTML, projectHTML, aboutHTML, skillsHTML, contactHTML } from './content.js';
import { createGalleryExhibits } from './gallery.js';
import { avoidGalleryPlinths } from './gallery-layout.js';
import { createInteriors } from './interiors.js';
import { ModelInspector } from './model-inspector.js';
import { createGalleryRoom } from './gallery-room.js';
import { createRoomDecor } from './room-decor.js';
import { exhibitView, exhibitRoute, advanceExhibitTravel } from './gallery-navigation.js';
import { addWayfinding } from './wayfinding.js';

const rooms=[
 {id:'gallery',name:'The Projects House',kind:'PROJECTS & SELECTED WORK',number:'01',x:6.25,z:-4,cx:60,title:'A few things<br>I made.',description:'Five projects in scientific simulation, computer vision, and applied AI. Select a frame to explore the build.',action:'Discover the work ↗'},
 {id:'about',name:'The Skills House',kind:'TOOLS & SKILLS',number:'02',x:-6.25,z:-17,cx:82,title:'The tools<br>behind the ideas.',description:'Follow the red carpet through framed technologies, AI tools, and engineering techniques.',action:'Open the skills guide ↗'},
 {id:'studio',name:'The About House',kind:'MY STORY & RÉSUMÉ',number:'03',x:6.25,z:-26,cx:104,title:'A little<br>about me.',description:'My story, approach, education, and résumé.',action:'Open my journal ↗'},
 {id:'contact',name:'The Contact House',kind:'LET’S MAKE SOMETHING',number:'04',x:-6.25,z:-39,cx:126,title:'The next<br>chapter.',description:'A project, a collaboration, or a technical conversation. Find my email, GitHub, LinkedIn, and résumé here.',action:'Write a little hello ↗'}
];
const $=s=>document.querySelector(s);
let scene,camera,renderer,world,atmosphere,entrances,interiors,galleryExhibits,galleryRoom,roomDecor,inspection,entrance=null,started=false,currentRoom=null,nearRoom=null,auto=false,transition=false,ready=false;
let yaw=0,pitch=0,drag=false,pointerDistance=0,lastPointer={x:0,y:0},position=new THREE.Vector3(0,1.75,16),returnPosition=position.clone(),returnYaw=0;
let keys=new Set(),visited=new Set(),time=0,lastTime=performance.now(),audio=null,toastTimer;
let exhibitTravel=null,nearestExhibit=null;
let glance=0,lastManualLook=-10,hoveredDoor=null,pressedDoor=null,pointerKnown=false;
const walkVelocity=new THREE.Vector2(),nextPosition=new THREE.Vector3();let hoverClock=0;
try{visited=new Set(JSON.parse(localStorage.getItem('little-quarter-places')||'[]').filter(id=>rooms.some(r=>r.id===id)));}catch{}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const map=$('#map'),details=$('#details'),modals=()=>map.open||details.open;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function updateVisits(){document.querySelectorAll('#map-places .map-place[data-room]').forEach(button=>{const seen=visited.has(button.dataset.room);button.classList.toggle('visited',seen);button.querySelector('b').textContent=seen?'✓':'↗';});}
function saveVisit(room){visited.add(room.id);try{localStorage.setItem('little-quarter-places',JSON.stringify([...visited]));}catch{}updateVisits();}
function begin(){if(!ready){openMap();return;}started=true;document.body.classList.add('exploring');$('#crosshair').hidden=false;}
function stopWalking(){keys.clear();walkVelocity.set(0,0);scrollImpulse=0;drag=false;pressedDoor=null;}
function openMap(){if(transition||inspection?.busy)return;stopWalking();if(!map.open)map.showModal();}
function closeDialogs(){map.close();details.close();stopWalking();}
$('#map-button').onclick=openMap;
$('#controls-help').onclick=()=>{if(transition||inspection?.busy)return;stopWalking();$('#detail-content').innerHTML='<div class="eyebrow">A QUICK GUIDE</div><h2>Make yourself<br>at home.</h2><div class="control-guide"><p><kbd>W A S D</kbd><span>Walk around</span></p><p><kbd>Drag</kbd><span>Look around</span></p><p><kbd>Scroll</kbd><span>Walk forward or backward</span></p><p><kbd>E</kbd><span>Enter a nearby building</span></p><p><kbd>M</kbd><span>Open the map</span></p><p><kbd>Esc</kbd><span>Close a view or leave a room</span></p></div><p class="detail-body">Click a model to rotate and zoom it. Click a poster to read the project.</p><button class="secondary-button" id="help-tour">Take an automatic stroll ↗</button>';$('#help-tour').onclick=()=>{details.close();$('#tour').click();};details.showModal();};
$('#stamps').onclick=()=>{openMap();toast(visited.size===4?'All four places discovered. Make yourself at home.':`${4-visited.size} more places to discover.`);};
$('#map-places').innerHTML=rooms.map(r=>`<button class="map-place" data-room="${r.id}"><span>${r.number}</span><div><strong>${r.name}</strong><small>${r.kind}</small></div><b>↗</b></button>`).join('');
document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>enterRoom(rooms.find(r=>r.id===b.dataset.room)));updateVisits();
document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',stopWalking);d.addEventListener('click',e=>{if(e.target!==d)return;const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();});});
function updateTour(){$('#tour').textContent=auto?'Ⅱ Pause stroll':'▷ Take a stroll';}

$('#tour').onclick=()=>{if(transition)return;begin();if(currentRoom)leaveRoom();auto=!auto;updateTour();};
$('#compass').onclick=()=>{if(transition)return;yaw=0;pitch=0;glance=0;lastManualLook=time;toast('Facing north. Follow the street.');};
$('#home').onclick=()=>{if(transition)return;closeDialogs();roomDecor?.setActive(null);interiors?.setActive(null);atmosphere?.setInterior(false);entrances?.reset();entrances?.hover(null);hoveredDoor=null;pointerKnown=false;glance=0;canvas.style.cursor='';auto=false;updateTour();currentRoom=null;started=true;position.set(0,1.75,16);yaw=0;pitch=0;document.body.classList.add('exploring');document.body.classList.remove('room-open','gallery-room');$('#room-info').hidden=true;$('#back-street').hidden=true;$('#crosshair').hidden=true;};
function fadeMove(fn){if(transition)return;transition=true;const canvas=$('#world');canvas.style.transition=reduced?'none':'opacity .2s';canvas.style.opacity='0';setTimeout(()=>{fn();canvas.style.opacity='1';transition=false;},reduced?0:200);}
function revealRoom(room){roomDecor.setActive(room.id);document.body.classList.toggle('gallery-room',room.id==='gallery');interiors.setActive(room.id);atmosphere.setInterior(true);currentRoom=room;position.set(room.cx,1.75,.5);yaw=0;pitch=0;saveVisit(room);document.body.classList.add('room-open');$('#room-info').hidden=false;$('#back-street').hidden=false;$('#room-number').textContent=`${room.number} / ${room.name.toUpperCase()}`;$('#room-title').innerHTML=room.title;$('#room-description').textContent=room.description;$('#room-action').textContent=room.action;$('#location').textContent=room.name;$('#interaction').hidden=true;}
function enterRoom(room){if(transition||!room)return;closeDialogs();if(!ready){openRoomDetails(room);return;}roomDecor?.setActive(null);interiors.setActive(null);atmosphere.setInterior(false);yaw=wrapAngle(yaw+glance);glance=0;entrances.hover(null);hoveredDoor=null;pointerKnown=false;canvas.style.cursor='';auto=false;updateTour();begin();
 const side=Math.sign(room.x),doorway=new THREE.Vector3(side*6.3,1.65,room.z),approach=new THREE.Vector3(side*3.5,1.75,room.z),faceYaw=-side*Math.PI/2;
 returnPosition.copy(approach);returnYaw=faceYaw;if(currentRoom){position.set(0,1.75,room.z+7);yaw=0;pitch=0;currentRoom=null;document.body.classList.remove('room-open');$('#room-info').hidden=true;$('#back-street').hidden=true;}
 entrances.reset();if(reduced){fadeMove(()=>revealRoom(room));return;}
 transition=true;document.body.classList.add('entering');$('#location').textContent='Approaching '+room.name;$('#interaction').hidden=true;
 let targetYaw=faceYaw;while(targetYaw-yaw>Math.PI)targetYaw-=Math.PI*2;while(targetYaw-yaw<-Math.PI)targetYaw+=Math.PI*2;
 entrance={room,elapsed:0,from:position.clone(),fromYaw:yaw,fromPitch:pitch,targetYaw,approach,doorway,inside:new THREE.Vector3(side*7.65,1.7,room.z)};
 $('#world').style.transition='none';
}
function updateEntrance(dt){if(!entrance)return;const shot=entrance;shot.elapsed+=dt;const pose=entrancePose(shot.elapsed);const entry=entrances.entries.get(shot.room.id);entry.hinge.rotation.y=pose.door*1.45;renderer.shadowMap.needsUpdate=true;
 if(pose.stage==='approach'){position.lerpVectors(shot.from,shot.approach,pose.t);yaw=THREE.MathUtils.lerp(shot.fromYaw,shot.targetYaw,pose.t);pitch=THREE.MathUtils.lerp(shot.fromPitch,-.025,pose.t);}
 else if(pose.stage==='walk'){position.lerpVectors(shot.approach,shot.inside,pose.t);}
 $('#location').textContent=(pose.stage==='approach'?'Approaching ':pose.stage==='open'?'Opening the door · ':'Entering ')+shot.room.name;
 if(pose.stage==='fade')$('#world').style.opacity=String(pose.opacity);
 if(pose.stage==='complete'){entrance=null;revealRoom(shot.room);entrances.reset();renderer.shadowMap.needsUpdate=true;$('#world').style.transition='opacity .3s';$('#world').style.opacity='1';transition=false;document.body.classList.remove('entering');keys.clear();}
}
function leaveRoom(){if(!currentRoom||transition)return;auto=false;updateTour();stopWalking();fadeMove(()=>{currentRoom=null;document.body.classList.remove('gallery-room');roomDecor?.setActive(null);interiors.setActive(null);atmosphere.setInterior(false);entrances.reset();position.copy(returnPosition);yaw=returnYaw;pitch=0;lastManualLook=time;document.body.classList.remove('room-open');$('#room-info').hidden=true;$('#back-street').hidden=true;});}
$('#back-street').onclick=leaveRoom;
$('#room-action').onclick=()=>openRoomDetails(currentRoom);
function startInspection(index){
 if(inspection.busy||currentRoom?.id!=='gallery')return;
 const exhibit=galleryExhibits.get(index);
 if(!exhibit||!inspection.start(exhibit,index)){toast('This model is still loading. Try again shortly.');return;}
 stopWalking();$('#inspect-title').textContent=projects[index].title;$('#inspect-model').hidden=false;$('#room-info').hidden=true;$('#inspect-pause').textContent='Pause motion';
 document.body.classList.add('inspecting-model');document.querySelector('header').inert=true;document.querySelector('footer').inert=true;$('#back-street').disabled=true;canvas.style.cursor='grab';$('#inspect-close').focus();
}
$('#inspect-close').onclick=()=>inspection.close();
$('#inspect-left').onclick=()=>inspection.rotate(-24);$('#inspect-right').onclick=()=>inspection.rotate(24);
$('#inspect-in').onclick=()=>inspection.zoom(-170);$('#inspect-out').onclick=()=>inspection.zoom(170);
$('#inspect-reset').onclick=()=>inspection.reset();
$('#inspect-pause').onclick=()=>{inspection.paused=!inspection.paused;$('#inspect-pause').textContent=inspection.paused?'Resume motion':'Pause motion';};
$('#inspect-project').onclick=()=>{const index=inspection.index;inspection.close();openProject(index);};

function openRoomDetails(room){
 if(!room)return;stopWalking();
 const render={gallery:galleryHTML,about:skillsHTML,studio:aboutHTML,contact:contactHTML};
 $('#detail-content').innerHTML=render[room.id]();
 document.querySelectorAll('[data-project]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.project);if(currentRoom?.id==='gallery')goToExhibit(index);else openProject(index);});
 const form=$('#contact-form');if(form)form.onsubmit=event=>{event.preventDefault();const data=new FormData(form);const subject=String(data.get('subject')||'Portfolio enquiry');const body=`From: ${data.get('name')} <${data.get('email')}>\n\n${data.get('message')}`;location.href=`mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;};
 const back=$('#contact-back');if(back)back.onclick=()=>details.close();
 if(!details.open)details.showModal();
}
function goToExhibit(index){
 const exhibit=galleryExhibits?.get(index);if(!exhibit||currentRoom?.id!=='gallery'||inspection?.busy)return;
 const view=exhibitView(exhibit.slot);let route;try{route=exhibitRoute(position,view.position);}catch{toast('Step away from the stand and try again.');return;}closeDialogs();stopWalking();exhibitTravel={from:position.clone(),fromYaw:yaw,fromPitch:pitch,view,route,elapsed:0};transition=true;$('#exhibit-actions').hidden=true;
}
$('#exhibit-inspect').onclick=()=>{if(nearestExhibit!==null)startInspection(nearestExhibit);};
$('#exhibit-read').onclick=()=>{if(nearestExhibit!==null)openProject(nearestExhibit);};
function updateExhibitActions(){
 const active=currentRoom?.id==='gallery'&&!transition&&!inspection?.busy&&!modals();$('#exhibit-actions').hidden=!active;if(!active)return;
 let distance=Infinity;nearestExhibit=null;projects.forEach((project,index)=>{const exhibit=galleryExhibits.get(index);if(!exhibit)return;const d=Math.hypot(position.x-exhibit.slot.plinth[0],position.z-exhibit.slot.plinth[2]);if(d<distance){distance=d;nearestExhibit=index;}});
 const exhibit=galleryExhibits.get(nearestExhibit);$('#exhibit-name').textContent=projects[nearestExhibit].shortTitle;const loaded=exhibit.jobs.some(job=>job.state==='loaded');$('#exhibit-inspect').disabled=!loaded;$('#exhibit-inspect').textContent=loaded?'Inspect model ↔':'Model loading…';
}
function openProject(index){
 if(!projects[index])return;stopWalking();$('#detail-content').innerHTML=projectHTML(index);
 $('#all-work').onclick=()=>openRoomDetails(rooms[0]);$('#close-project').onclick=()=>details.close();
 if(!details.open)details.showModal();
}

// The Blender file is the source of the geometry. This renderer adds ink edges,
// movement, interaction, and the interface; no paid services or remote models.
// Shop names live in one compact edge caption, rather than floating over the road.
function fallback(message){$('#loading').innerHTML=`<span>The street is taking a rest.</span><small>${message}</small><button class="fallback-button" id="fallback-map">Explore the portfolio map ↗</button>`;$('#fallback-map').onclick=()=>{$('#loading').hidden=true;openMap();};}
try{
 renderer=new THREE.WebGLRenderer({canvas:$('#world'),antialias:true,powerPreference:'high-performance'});
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 scene=new THREE.Scene();atmosphere=createAtmosphere(scene,renderer,reduced);addTown(scene);
 camera=new THREE.PerspectiveCamera(innerWidth<650?67:62,innerWidth/innerHeight,.08,180);camera.rotation.order='YXZ';
 inspection=new ModelInspector(camera,{reduced,onClose:()=>{
  document.body.classList.remove('inspecting-model');document.querySelector('header').inert=false;document.querySelector('footer').inert=false;$('#back-street').disabled=false;
  $('#inspect-model').hidden=true;$('#room-info').hidden=!currentRoom;stopWalking();canvas.style.cursor='';
 }});
 const edgeMaterial=new THREE.LineBasicMaterial({color:'#354335',transparent:true,opacity:.19});
 new GLTFLoader().load('assets/neighborhood.glb',gltf=>{
   // Batch the static Blender meshes by material to avoid thousands of draw
   // calls. Keep the six gallery targets separate for ray picking.
   gltf.scene.updateMatrixWorld(true);world=new THREE.Group();entrances=createEntrances(rooms,world);interiors=createInteriors(rooms,world,scene);galleryRoom=createGalleryRoom(world,scene);roomDecor=createRoomDecor(rooms,world);addWayfinding(rooms,world);const batches=new Map(),edgeParts=[],styled=new Set();
   gltf.scene.traverse(o=>{if(!o.isMesh||/^sign_(gallery|about|studio|contact)$/.test(o.name)||/^(room_title|room_subtitle)/.test(o.name)||(/^board_label/.test(o.name)&&rooms.some(r=>r.id===o.parent?.name))||/^project_(frame|art|label)_?/.test(o.name)||/^(display_pedestal|exhibit|gallery_viewing_bench|gallery_bench_leg|gallery_picture_light|about_armchair|about_armrest|about_reading_rug|about_bookcase|about_shelf|about_spine|about_journal|about_entry_mat)/.test(o.name))return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);/* Set the decorative café back so Projects is the first street entrance. */if(o.parent?.name==='cafe')g.translate(-14,0,0);if(/^(journal_table|table_support)/.test(o.name)){g.computeBoundingBox();if(g.boundingBox.min.x>75.5&&g.boundingBox.max.x<88.5){g.dispose();return;}}for(const attr of Object.keys(g.attributes))if(!['position','normal'].includes(attr))g.deleteAttribute(attr);if(!g.attributes.normal)g.computeVertexNormals();
   worldUV(g,o.material);if(!styled.has(o.material.uuid)){styleMaterial(o.material);styled.add(o.material.uuid);}
   if(interiors.extract(o,g,o.material)||entrances.extract(o,g,o.material))return;
   const n=o.name.toLowerCase();if(!n.includes('foliage')&&!n.includes('plant')&&!n.includes('sign_')&&!n.includes('label')&&!n.includes('text')&&!n.includes('seam')&&!n.includes('joint')&&!n.includes('wire')&&!n.includes('bulb')&&g.attributes.position.count<5000)edgeParts.push(new THREE.EdgesGeometry(g,35));
   if(/^project_(?:frame|art)_/.test(o.name)){const target=new THREE.Mesh(g,o.material);target.name=o.name;world.add(target);}else{if(!batches.has(o.material.uuid))batches.set(o.material.uuid,{material:o.material,parts:[]});batches.get(o.material.uuid).parts.push(g);}});
   entrances.finish();galleryExhibits=createGalleryExhibits(world,projects,{reduced});batches.forEach(b=>{const combined=mergeGeometries(b.parts);if(combined){const batch=new THREE.Mesh(combined,b.material);batch.castShadow=!['road','stone','paper','cream'].includes(b.material.name);batch.receiveShadow=true;world.add(batch);}b.parts.forEach(g=>g.dispose());});const inkGeometry=mergeGeometries(edgeParts);if(inkGeometry){const outlines=new THREE.LineSegments(inkGeometry,edgeMaterial);outlines.raycast=()=>{};world.add(outlines);}edgeParts.forEach(g=>g.dispose());scene.add(world);renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;ready=true;$('#load-progress').style.width='100%';$('#loading').hidden=true;begin();requestAnimationFrame(frame);
 },event=>{if(event.total){let p=Math.round(event.loaded/event.total*100);$('#load-progress').style.width=p+'%';$('#load-label').textContent=`Unfolding the street · ${p}%`;}},error=>{console.error('Neighborhood model failed to load',error);fallback('The scene could not load. All portfolio sections are available from the map.');});
}catch(error){console.error(error);fallback('3D is unavailable in this browser. You can still explore the portfolio sections.');}

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),projected=new THREE.Vector3();
function pointerHits(){raycaster.setFromCamera(pointer,camera);return raycaster.intersectObject(world,true).filter(hit=>hit.distance<18);}
function updateDoorHover(){let id=null;if(ready&&started&&!transition&&!modals()&&!drag&&!inspection?.busy&&pointerKnown){raycaster.setFromCamera(pointer,camera);const groups=currentRoom?[interiors.exits.get(currentRoom.id)]:[...entrances.entries.values()].map(entry=>entry.hinge);const candidates=raycaster.intersectObjects(groups,true);if(candidates[0]?.distance<18){const hit=pointerHits()[0];id=currentRoom?(hit?.object.userData.exitRoomId===currentRoom.id?'exit':null):hit?.object.userData.roomId||null;}}if(hoveredDoor!==id){hoveredDoor=id;entrances?.hover(id);interiors?.hover(id==='exit');canvas.style.cursor=id?'pointer':'';canvas.title=id==='exit'?'Click to return to the street':'';$('#crosshair').classList.toggle('door-target',!!id);}}
function pick(event){if(!ready||!started||transition||modals()||pointerDistance>6)return;pointer.set(event.clientX/innerWidth*2-1,-event.clientY/innerHeight*2+1);const hits=pointerHits();if(currentRoom&&hits[0]?.object.userData.exitRoomId===currentRoom.id){leaveRoom();return;}if(!currentRoom){const id=pressedDoor||hits[0]?.object.userData.roomId;pressedDoor=null;if(id)enterRoom(rooms.find(room=>room.id===id));return;}if(currentRoom.id!=='gallery')return;const hit=hits[0];const match=hit?.object.name.match(/^project_(?:frame|art)_(\d)/);const index=hit?.object.userData.projectIndex??(match?Number(match[1]):null);if(Number.isInteger(index)){if(hit.object.userData.isExhibitModel||hit.object.userData.isExhibitStand)startInspection(index);else openProject(index);}}
const canvas=$('#world');canvas.addEventListener('pointerdown',e=>{if(modals()||transition||e.button!==0)return;if(inspection?.active){drag=true;lastPointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);return;}pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);pressedDoor=ready&&started&&!currentRoom?pointerHits()[0]?.object.userData.roomId:null;drag=true;pointerDistance=0;lastPointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{pointerKnown=true;pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);if(!drag||!started||modals()||transition)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;if(inspection?.active){inspection.rotate(dx,dy);lastPointer={x:e.clientX,y:e.clientY};return;}pointerDistance+=Math.abs(dx)+Math.abs(dy);if(Math.abs(dx)+Math.abs(dy)>1){yaw+=glance;glance=0;yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.003,-.62,.62);lastManualLook=time;}lastPointer={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerleave',()=>{pointerKnown=false;});
canvas.addEventListener('pointerup',e=>{if(!drag)return;drag=false;if(inspection?.busy)return;pick(e);pressedDoor=null;});canvas.addEventListener('pointercancel',()=>{drag=false;pressedDoor=null;});
addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(inspection?.busy){if(key==='escape'){e.preventDefault();inspection.close();}return;}if(e.repeat&&['m','e','escape'].includes(key))return;if(modals()||transition||e.ctrlKey||e.metaKey||e.altKey)return;if(key==='m'){e.preventDefault();openMap();return;}if(key==='escape'&&currentRoom){leaveRoom();return;}if(key==='e'&&(hoveredDoor||nearRoom)&&!currentRoom){enterRoom(rooms.find(r=>r.id===hoveredDoor)||nearRoom);return;}if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();if(!started)begin();keys.add(key);auto=false;updateTour();}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{stopWalking();pointerKnown=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopWalking();audio?.suspend();}else{lastTime=performance.now();audio?.resume().catch(()=>{});}});
document.querySelectorAll('[data-move]').forEach(b=>{const k={forward:'w',backward:'s',left:'a',right:'d'}[b.dataset.move];b.onpointerdown=e=>{e.preventDefault();if(transition||modals()||inspection?.busy)return;b.setPointerCapture(e.pointerId);begin();keys.add(k);auto=false;updateTour();};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(k);});
let scrollImpulse=0;addEventListener('wheel',e=>{if(inspection?.active){e.preventDefault();inspection.zoom(e.deltaY);return;}if(modals()||!ready||transition||inspection?.busy)return;e.preventDefault();begin();auto=false;updateTour();scrollImpulse=THREE.MathUtils.clamp(scrollImpulse+e.deltaY*.012,-9,9);},{passive:false});
$('#interaction').onclick=()=>{if(nearRoom)enterRoom(nearRoom);};
function collide(next,previous){if(currentRoom){next.x=THREE.MathUtils.clamp(next.x,currentRoom.cx-5.8,currentRoom.cx+5.8);next.z=THREE.MathUtils.clamp(next.z,-11.1,1.5);if(currentRoom.id==='gallery')avoidGalleryPlinths(next,previous);}else{next.x=THREE.MathUtils.clamp(next.x,-4.65,4.65);next.z=THREE.MathUtils.clamp(next.z,-60,17);const dx=next.x,dz=next.z+55,d=Math.hypot(dx,dz);if(d<2.85){if(d>.01){next.x=dx/d*2.85;next.z=-55+dz/d*2.85;}else next.copy(previous);}}return next;}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;time+=dt;
 updateEntrance(dt);
 if(exhibitTravel){const pose=advanceExhibitTravel(exhibitTravel,dt,reduced);position.copy(pose.position);yaw=pose.yaw;pitch=pose.pitch;if(pose.done){exhibitTravel=null;transition=false;lastManualLook=time;}}
 if(started&&!transition&&!modals()&&!inspection?.busy){
   let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
   if(auto&&!currentRoom){forward=.6;yaw=THREE.MathUtils.damp(yaw,0,4,dt);if(position.z<-47){auto=false;updateTour();toast('You’ve reached the square. Open the map to step inside a building.');}}
   easeWalking(walkVelocity,forward,side,dt);const distance=walkVelocity.y*dt*3.4+scrollImpulse*dt,strafe=walkVelocity.x*dt*3.4;scrollImpulse=THREE.MathUtils.damp(scrollImpulse,0,5,dt);
   const next=nextPosition.copy(position);next.x+=-Math.sin(yaw)*distance+Math.cos(yaw)*strafe;next.z+=-Math.cos(yaw)*distance-Math.sin(yaw)*strafe;collide(next,position);position.copy(next);
 }
 if(!inspection?.busy)camera.position.copy(position);if(!reduced&&started&&!transition&&!modals()&&!inspection?.busy)camera.position.y+=Math.sin(time*9)*.016*Math.min(1,walkVelocity.length());
 const shop=started&&!currentRoom&&!transition&&!modals()?nearbyShop(rooms,position):null;
 const desiredGlance=!reduced&&time-lastManualLook>3?shopGlance(shop,position,yaw):0;
 glance=THREE.MathUtils.damp(glance,desiredGlance,3,dt);if(transition||currentRoom)glance=0;
 if(inspection?.busy)inspection.update(dt);else camera.rotation.set(pitch,yaw+glance,0);camera.updateMatrixWorld();galleryRoom?.update(currentRoom?.id==='gallery',camera.position);galleryExhibits?.update(dt,currentRoom?.id==='gallery',position,inspection?.paused||false);hoverClock+=dt;if(hoverClock>.05){updateDoorHover();hoverClock=0;}atmosphere.update(time);updateExhibitActions();renderer.render(scene,camera);
 if(!currentRoom&&!transition){nearRoom=shop;$('#location').textContent=!started?'The south entrance':position.z>-3?'Café corner':position.z>-12?'Gallery lane':position.z>-23?'Explorer’s row':position.z>-34?'The makers’ district':position.z>-47?'Post office lane':'The fountain square';}
 const interaction=$('#interaction');interaction.hidden=!shop;if(shop){interaction.classList.toggle('shop-left',shop.x<0);interaction.classList.toggle('shop-right',shop.x>0);interaction.classList.toggle('door-hovered',hoveredDoor===shop.id);interaction.setAttribute('aria-label','Enter '+shop.name);if(interaction.dataset.room!==shop.id){interaction.dataset.room=shop.id;interaction.innerHTML=`<span class="shop-caption">${shop.x<0?'← ON YOUR LEFT':'ON YOUR RIGHT →'}</span><strong>${shop.name}</strong><small>E · Step inside ↗</small>`;}interaction.querySelector('small').textContent=hoveredDoor===shop.id?'Click the door to enter ↗':'E · Step inside ↗';}
}
addEventListener('resize',()=>{if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<650?67:62;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
// Gentle sound is opt-in and generated locally. No autoplay or audio downloads.
$('#sound').onclick=async()=>{try{if(audio){await audio.close();audio=null;$('#sound').textContent='♫';$('#sound').setAttribute('aria-label','Enable ambient sound');toast('Ambient sound off.');return;}const Context=window.AudioContext||window.webkitAudioContext;audio=new Context();const output=audio.createGain();output.gain.value=.025;output.connect(audio.destination);[130.81,196,261.63].forEach((frequency,i)=>{const osc=audio.createOscillator();osc.type='sine';osc.frequency.value=frequency;const gain=audio.createGain();gain.gain.value=.23/(i+1);osc.connect(gain);gain.connect(output);osc.start();});await audio.resume();$('#sound').textContent='♪';$('#sound').setAttribute('aria-label','Disable ambient sound');toast('A quiet soundtrack for your walk.');}catch{toast('Audio is unavailable in this browser.');}};
