import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('./src.js',import.meta.url),'utf8');
const update=source.match(/function updateVisits\(\)\{[^\n]+/)[0];
const badge={textContent:''};
let marked=false;
const mapButton={dataset:{room:'gallery'},classList:{toggle(name,value){marked=value;}},querySelector(){return badge;}};
// The live shop prompt also carries data-room, but has no map badge.
const shopPrompt={dataset:{room:'gallery'},classList:{toggle(){}},querySelector(){return null;}};
const document={querySelectorAll(selector){return selector==='#map-places .map-place[data-room]'?[mapButton]:[mapButton,shopPrompt];}};
runInNewContext(update+';updateVisits();',{document,visited:new Set(['gallery'])});
assert.equal(marked,true);
assert.equal(badge.textContent,'✓');
console.log('Passed: room visits update only map badges and ignore the active shop prompt.');
