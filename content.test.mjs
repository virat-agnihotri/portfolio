import {galleryScreenshots} from './gallery-layout.js';
import assert from 'node:assert/strict';
import { readFile,stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { profile,projects,galleryHTML,projectHTML,aboutHTML,skillsHTML,contactHTML } from './content.js';

assert.equal(profile.name,'Virat Agnihotri');assert.equal(projects.length,5);assert.equal(new Set(projects.map(p=>p.id)).size,5);
assert.equal((galleryHTML().match(/data-project=/g)||[]).length,5);
for(let i=0;i<projects.length;i++){
 const project=projects[i],html=projectHTML(i);assert.ok(html.includes(project.title));assert.ok(!/EXAMPLE PROJECT|Illustrative content|Weather Station|Supply Studio/.test(html));
 if(project.image)assert.ok((await stat(new URL('./dist/'+project.image,import.meta.url))).size>0);
 for(const url of [project.source,profile.github,profile.linkedin].filter(Boolean))assert.equal(new URL(url).protocol,'https:');
}
assert.ok(aboutHTML().includes('8.1 / 10'));assert.ok(skillsHTML().includes('SQL (basic)'));assert.ok(contactHTML().includes('mailto:'+profile.email));assert.ok(contactHTML().includes('tel:+917275629454'));
assert.ok(projectHTML(3).includes('heuristic'));assert.ok(projectHTML(4).includes('AmanRajSharma001'));
const resume=await readFile(new URL('./dist/'+profile.resume,import.meta.url));assert.equal(resume.subarray(0,5).toString(),'%PDF-');
assert.equal(createHash('sha256').update(resume).digest('hex'),'b96fb9897e4ceee173196b18281683046411e5e994b25f0e7ec074c60cc0a90f','Original résumé preserved');
const app=await readFile(new URL('./src.js',import.meta.url),'utf8');assert.ok(app.includes('createGalleryExhibits(world,projects'));assert.ok(!app.includes('Personal biography placeholder'));
console.log('Passed: five real project entries, contact and education content, presentation assets, source links, and unchanged résumé download.');

assert.ok(contactHTML().includes('https://www.instagram.com/virat_.a.g/'));assert.ok(contactHTML().includes('https://x.com/ViratAgnihotrii'));assert.ok(contactHTML().includes('id="contact-form"'));assert.ok(aboutHTML().includes('IIIT Delhi'));assert.ok(aboutHTML().includes('Adobe Hackathon'));assert.ok(aboutHTML().includes('What I’m working toward'));

for(const id of ['lunar','tone','knowledge','docintel'])assert.equal(projects.find(project=>project.id===id).image,galleryScreenshots[id],'Wall poster and reading page use the same supplied image');assert.equal(galleryScreenshots.rocket,null);assert.equal(projects.find(project=>project.id==='rocket').image,null);

const expectedRepositories={rocket:'Rocket_Simulator',lunar:'Lunar_Vision',knowledge:'Knowledege_Vault_AI',tone:'Tone-Analyser',docintel:'ai-powerednpdf-summarizer'};for(const project of projects){assert.equal(project.source,'https://github.com/virat-agnihotri/'+expectedRepositories[project.id]);assert.ok(!projectHTML(projects.indexOf(project)).includes('supplied by Virat Agnihotri'));}
