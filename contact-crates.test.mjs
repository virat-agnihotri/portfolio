import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {contactAccounts,contactAccountHTML,contactCratePickerHTML} from './content.js';
import {createContactCrates,contactCrateLayout,avoidContactCrates} from './contact-crates.js';

const accounts=contactAccounts(),revealed=[];
assert.deepEqual(new Set(accounts.map(account=>account.id)),new Set(contactCrateLayout.map(slot=>slot.id)));
const parent=new THREE.Group();parent.position.set(126,0,-5);const room=createContactCrates(parent,{textures:false,onReveal:id=>revealed.push(id)});
assert.equal(room.detonate('github'),false,'No interactions outside the room');
room.setActive(true);assert.equal(room.detonate('github'),true);assert.equal(room.detonate('email'),false,'Only one reusable burst runs at a time');
room.update(.3);assert.ok(room.effects.visible);assert.equal(room.entries.get('github').shell.visible,false);assert.equal(revealed.length,0);
room.update(.6);assert.equal(room.busy,false);assert.equal(room.effects.visible,false);assert.ok(room.entries.get('github').card.visible);assert.deepEqual(revealed,['github']);
room.detonate('github');assert.deepEqual(revealed,['github','github'],'A revealed card reopens without another animation');
room.detonate('email');room.update(.3);room.setActive(false);room.update(5);assert.equal(revealed.length,2,'Leaving cancels a pending reveal');assert.equal(room.entries.get('email').state,'sealed');assert.equal(room.effects.visible,false);
room.setActive(true);assert.ok(room.entries.get('github').card.visible,'Unlocked cards stay cached on re-entry');
const reduced=[];const quiet=createContactCrates(new THREE.Group(),{textures:false,reduced:true,onReveal:id=>reduced.push(id)});quiet.setActive(true);quiet.detonate('message');assert.deepEqual(reduced,['message']);assert.equal(quiet.busy,false);assert.equal(quiet.effects.visible,false);
parent.updateMatrixWorld(true);
for(const slot of contactCrateLayout){
 const target=new THREE.Vector3(126+slot.position[0],1.1,-5+slot.position[2]);
 const origin=new THREE.Vector3(126,1.75,-5),ray=new THREE.Raycaster(origin,target.clone().sub(origin).normalize());
 const hit=ray.intersectObject(room.group,true).find(hit=>{for(let object=hit.object;object;object=object.parent)if(!object.visible)return false;return true;});
 assert.equal(hit?.object.userData.contactId,slot.id,'Each crate/card can be picked from the center aisle');
 const previous=target.clone().add(new THREE.Vector3(slot.position[0]>0?-1.3:1.3,0,0)),next=target.clone();avoidContactCrates(next,previous);assert.ok(Math.abs(next.x-target.x)>=1.079||Math.abs(next.z-target.z)>=1.079,'Walking stays outside the crate');
 const account=accounts.find(item=>item.id===slot.id),html=contactAccountHTML(slot.id);assert.ok(html.includes(slot.id==='message'?'contact-form':account.value));
 if(account.href)assert.ok(html.includes(account.href));
}
assert.equal((contactCratePickerHTML().match(/data-contact-crate=/g)||[]).length,7,'All crates have keyboard/touch button alternatives');
console.log('Passed: seven contact crates, burst lifecycle, cached reveals, exit cancellation, reduced motion, picking, collisions, and account links.');

const app=readFileSync(new URL('./src.js',import.meta.url),'utf8'),revealCode=app.match(/function openContactAccount\(id\)\{[\s\S]*?\n\}/)[0];
const nodes=new Map();const $=selector=>{if(!nodes.has(selector))nodes.set(selector,{hidden:true,removeAttribute(){}});return nodes.get(selector);};
runInNewContext(revealCode+";openContactAccount('github');",{$,contactAccounts,currentRoom:{id:'contact'},transition:false});
assert.equal($('#contact-reveal').hidden,false);assert.equal($('#contact-reveal-link').href,'https://github.com/virat-agnihotri');assert.equal($('#contact-reveal-name').textContent,'GitHub');
assert.ok(!/showModal|openRoomDetails/.test(revealCode),'A contact reveal must not open a popup or message form automatically');
