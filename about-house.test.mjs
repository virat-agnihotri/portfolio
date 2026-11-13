import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import * as THREE from 'three';
import {createAboutHouse,avoidAboutDesk} from './about-house.js';
import {createFruitMarket} from './fruit-market.js';
import {aboutMedia} from './about-media.js';
import {profile,aboutHTML,aboutFeatureHTML} from './content.js';

const parent=new THREE.Group();parent.position.set(104,0,-5);const about=createAboutHouse(parent,{textures:false});parent.updateMatrixWorld(true);
for(const [action,target] of [['desktop',[104,1.92,-9.95]],['resume',[97.94,2.75,-5.6]],...aboutMedia.certificates.map((certificate,i)=>['certificate:'+certificate.id,[110.06,2.75,-1.3-i*3.6]])]){
 const from=new THREE.Vector3(104,1.75,-5),toward=new THREE.Vector3(...target).sub(from).normalize(),ray=new THREE.Raycaster(from,toward);
 const hit=ray.intersectObject(about.group,true)[0];assert.equal(hit?.object.userData.aboutAction,action,'The visible About exhibit resolves to its own action');
}
assert.equal(profile.typingWpm,60);assert.ok(aboutHTML().includes('WPM'));assert.ok(aboutFeatureHTML('desktop').includes('Virat'));
assert.ok(aboutFeatureHTML('resume').includes(profile.resume));assert.ok((await stat(new URL('./dist/'+aboutMedia.resumePreview,import.meta.url))).size>10000);
assert.equal(aboutMedia.portrait,null,'No substitute portrait is invented');assert.ok(aboutMedia.certificates.every(certificate=>certificate.image===null));assert.ok(aboutFeatureHTML('certificates').includes('coming soon'));
const next=new THREE.Vector3(104,1.75,-9.8),previous=new THREE.Vector3(104,1.75,-8);avoidAboutDesk(next,previous);assert.ok(next.z>=-8.85001,'The desktop table blocks walking through it');
const street=new THREE.Group(),market=createFruitMarket(street,{textures:false});street.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(market);
assert.ok(bounds.max.x<-4.65,'Fruit market leaves the walking corridor clear');assert.ok(bounds.min.z>0,'Fruit market is at the street entrance');
assert.ok(market.getObjectByName('Fruit vendor'));assert.equal(market.children.filter(child=>['Apple','Orange','Lemon','Pear'].includes(child.name)).length,36);
console.log('Passed: clickable résumé, desktop and certificate targets, 60 WPM, authentic pending media, desk collision, and off-road fruit tent/vendor.');
