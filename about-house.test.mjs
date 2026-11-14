import {aboutFurnitureObstacles} from './about-furnishings.js';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import * as THREE from 'three';
import {createAboutHouse,avoidAboutDesk} from './about-house.js';
import {createFruitMarket} from './fruit-market.js';
import {aboutMedia} from './about-media.js';
import {profile,aboutHTML,aboutFeatureHTML} from './content.js';

const parent=new THREE.Group();parent.position.set(104,0,-5);const about=createAboutHouse(parent,{textures:false});parent.updateMatrixWorld(true);
for(const [action,target] of [['desktop',[103.75,1.75,-9.909]],['resume',[97.98,2.65,-6.3]],...aboutMedia.certificates.map((certificate,i)=>['certificate:'+certificate.id,[110.06,2.75,-1.3-i*3.6]])]){
 const from=new THREE.Vector3(104,1.75,-5),toward=new THREE.Vector3(...target).sub(from).normalize(),ray=new THREE.Raycaster(from,toward);
 const hit=ray.intersectObject(about.group,true)[0];assert.equal(hit?.object.userData.aboutAction,action,'The visible About exhibit resolves to its own action');
}
assert.equal(profile.typingWpm,60);assert.ok(aboutHTML().includes('WPM'));assert.ok(aboutFeatureHTML('desktop').includes('Virat'));
assert.ok(aboutFeatureHTML('resume').includes(profile.resume));assert.ok((await stat(new URL('./dist/'+aboutMedia.resumePreview,import.meta.url))).size>10000);
assert.ok((await stat(new URL('./dist/'+aboutMedia.portrait,import.meta.url))).size>10000,'User-supplied portrait exists');
for(const item of aboutMedia.certificates){assert.ok((await stat(new URL('./dist/'+item.image,import.meta.url))).size>10000);assert.ok(aboutFeatureHTML('certificate:'+item.id).includes(item.image));}
assert.ok((await stat(new URL('./dist/'+aboutMedia.typingEvidence,import.meta.url))).size>10000);assert.ok(aboutFeatureHTML('typing').includes(aboutMedia.typingEvidence));assert.ok(!aboutFeatureHTML('certificates').includes('coming soon'));
const next=new THREE.Vector3(104,1.75,-9.8),previous=new THREE.Vector3(104,1.75,-8);avoidAboutDesk(next,previous);assert.ok(next.z>=-8.53001,'The desktop table blocks walking through it');
const street=new THREE.Group(),market=createFruitMarket(street,{textures:false});street.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(market);
assert.ok(bounds.max.x<-4.65,'Fruit market leaves the walking corridor clear');assert.ok(bounds.min.z>0,'Fruit market is at the street entrance');
assert.ok(market.getObjectByName('Fruit vendor'));assert.equal(market.children.filter(child=>['Apple','Orange','Lemon','Pear'].includes(child.name)).length,36);
console.log('Passed: clickable résumé, desktop and certificate targets, 60 WPM, authentic pending media, desk collision, and off-road fruit tent/vendor.');

assert.ok(!about.group.getObjectByName('Window'));assert.equal(about.group.children.filter(object=>object.name==='Solid gallery wall').length,2);assert.ok(about.group.getObjectByName('Workstation alcove'));

assert.ok(about.group.getObjectByName('Reading armchair'));assert.ok(about.group.getObjectByName('Low bookcase'));assert.ok(about.group.getObjectByName('Certificate sideboard'));
for(const obstacle of aboutFurnitureObstacles){const next=new THREE.Vector3(104+obstacle.x,1.75,-5+obstacle.z),previous=next.clone().add(new THREE.Vector3(0,0,obstacle.halfZ+.5));avoidAboutDesk(next,previous);assert.ok(Math.abs(next.x-104-obstacle.x)>=obstacle.halfX-.00001||Math.abs(next.z+5-obstacle.z)>=obstacle.halfZ-.00001,'Furniture cannot be walked through');}
