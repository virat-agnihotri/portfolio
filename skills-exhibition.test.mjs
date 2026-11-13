import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import * as THREE from 'three';
import {profile} from './content.js';
import {skillsExhibitionLayout,createSkillsExhibition} from './skills-exhibition.js';

const items=skillsExhibitionLayout();
assert.deepEqual(items.map(item=>item.name),profile.skills.flatMap(category=>category.items),'Every résumé skill appears once, in reading order');
assert.deepEqual(['left','front','right'].map(wall=>items.filter(item=>item.wall===wall).length),[12,10,12]);
const manifest=JSON.parse(await readFile(new URL('./dist/assets/technology-logos/sources.json',import.meta.url)));
for(const item of items){
 const [x,y,z]=item.position;
 assert.ok(Math.abs(x)<6.3&&y>.8&&y<4.5&&z>-7.3&&z<7.3,'All frames are within the closed room');
 const normal=new THREE.Vector3(Math.sin(item.rotation),0,Math.cos(item.rotation));
 assert.ok(normal.dot(new THREE.Vector3(-x,0,-z))>0,'Artwork faces into the room');
 if(item.logo){assert.ok(manifest[item.logo]);const svg=await readFile(new URL(`./dist/assets/technology-logos/${item.logo}.svg`,import.meta.url),'utf8');assert.ok(svg.includes('<svg'));assert.ok(!/<script|https?:\/\/[^"']+\.(png|jpg)/i.test(svg),'Logo artwork is self contained');}
}
for(const wall of ['left','front','right']){
 const upper=items.filter(item=>item.wall===wall&&item.position[1]===3.65);
 for(let i=1;i<upper.length;i++)assert.ok(new THREE.Vector3(...upper[i].position).distanceTo(new THREE.Vector3(...upper[i-1].position))>1.72,'Adjacent frames do not overlap');
}
const parent=new THREE.Group(),exhibition=createSkillsExhibition(parent,{textures:false});
const carpet=exhibition.group.getObjectByName('Burgundy central runner');assert.equal(carpet.position.x,0);assert.ok(carpet.geometry.parameters.width>2.5);assert.ok(carpet.geometry.parameters.depth>12);assert.ok(carpet.position.y-carpet.geometry.parameters.height/2>.1075,'Carpet sits above finished floor');
assert.equal(exhibition.group.children.filter(child=>child.userData.skill).length,items.length);
exhibition.activate();assert.ok((await stat(new URL('./dist/assets/technology-logos/DEVICON-LICENSE.txt',import.meta.url))).size>0);
console.log('Passed: all 34 skills, left/front/right order, inward frames, local logo assets, spacing, and raised central carpet.');
