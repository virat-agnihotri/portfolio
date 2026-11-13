import * as THREE from 'three';

// Small locally generated textures: the visual detail needs no remote assets.
let seed=91;
const windTime={value:0};
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function canvasTexture(paint,size=512){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;paint(canvas.getContext('2d'),size);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;return texture;}
const plaster=canvasTexture((c,s)=>{c.fillStyle='#fbf8f1';c.fillRect(0,0,s,s);for(let i=0;i<17000;i++){c.fillStyle=random()>.4?'rgba(110,94,70,.05)':'rgba(255,255,255,.4)';c.fillRect(random()*s,random()*s,random()*2+.5,random()*2+.5);}});
const cobbles=canvasTexture((c,s)=>{c.fillStyle='#67685f';c.fillRect(0,0,s,s);const cols=8,rows=16,w=s/cols,h=s/rows;for(let y=0;y<rows;y++)for(let x=-1;x<=cols;x++){const xx=x*w+(y%2)*w*.5,yy=y*h;let v=140+random()*40;c.fillStyle=`rgb(${v+9},${v+5},${v-8})`;c.beginPath();c.roundRect(xx+2,yy+2,w-4,h-4,5);c.fill();c.strokeStyle='rgba(240,227,204,.25)';c.lineWidth=1;c.stroke();c.fillStyle='rgba(53,62,49,.08)';for(let k=0;k<10;k++)c.fillRect(xx+random()*w,yy+random()*h,1,1);}});
const sidewalk=canvasTexture((c,s)=>{c.fillStyle='#e0d3b9';c.fillRect(0,0,s,s);for(let i=0;i<4;i++)for(let j=0;j<4;j++){c.fillStyle=`rgba(99,91,69,${.02+random()*.06})`;c.fillRect(i*128+2,j*128+2,124,124);c.strokeStyle='#b7ad96';c.lineWidth=1.5;c.strokeRect(i*128,j*128,128,128);}for(let i=0;i<8000;i++){c.fillStyle='rgba(96,88,66,.08)';c.fillRect(random()*s,random()*s,1,1);}});
const wood=canvasTexture((c,s)=>{c.fillStyle='#faf2de';c.fillRect(0,0,s,s);for(let j=0;j<75;j++){c.strokeStyle=`rgba(94,65,41,${random()*.13})`;c.beginPath();const x=random()*s;c.moveTo(x,0);c.bezierCurveTo(x+15,150,x-20,330,x+random()*20,s);c.stroke();}});
export function styleMaterial(material){const name=material.name.toLowerCase().split('.')[0];material.roughness=.9;
 if(name==='road'){material.map=cobbles;material.color.set('#e6dfd1');material.bumpMap=cobbles;material.bumpScale=.045;}
 else if(name==='stone'){material.map=sidewalk;material.bumpMap=sidewalk;material.bumpScale=.012;}
 else if(name==='wood'){material.map=wood;material.bumpMap=wood;material.bumpScale=.012;}
 else if(['cream','paper','pink','teal','blue','yellow','brick'].includes(name)){material.map=plaster;material.bumpMap=plaster;material.bumpScale=.018;}
 if(name==='glass'){material.color.set('#345b58');material.roughness=.28;material.metalness=.14;}
 if(name==='lampglass'){material.emissive=new THREE.Color('#ffbd61');material.emissiveIntensity=1.4;}
 if(['leaf','darkleaf','leaflight'].includes(name)){material.onBeforeCompile=shader=>{shader.uniforms.uWind=windTime;shader.vertexShader='uniform float uWind;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(position.y*1.5 + position.z*.3 + uWind*.6)*.045*smoothstep(1.,4.,position.y);');};material.customProgramCacheKey=()=> 'quarter-canopy-wind-v1';}
 material.needsUpdate=true;
}
export function worldUV(geometry,material){const name=material.name.toLowerCase().split('.')[0],p=geometry.attributes.position,n=geometry.attributes.normal;const uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){let u,v;const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));if(ny>nx&&ny>nz){u=p.getX(i);v=p.getZ(i);}else if(nx>nz){u=p.getZ(i);v=p.getY(i);}else{u=p.getX(i);v=p.getY(i);}const scale=name==='road'?1/3.2:name==='stone'?1/2.4:name==='wood'?1/2:1/1.7;uv[i*2]=u*scale;uv[i*2+1]=v*scale;}geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));}

export function createAtmosphere(scene,renderer,reduced){
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene.background=new THREE.Color('#eacdb1');scene.fog=new THREE.Fog('#dfc9ac',46,118);
 const ambient=new THREE.HemisphereLight('#cbdde7','#9c9472',1.25);scene.add(ambient);
 const sun=new THREE.DirectionalLight('#ffdeb0',3.1);sun.position.set(-24,30,4);sun.target.position.set(0,0,-23);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-34,right:34,top:56,bottom:-56,near:.5,far:110});sun.shadow.bias=-.00018;sun.shadow.normalBias=.035;sun.shadow.radius=3;scene.add(sun,sun.target);
 const fill=new THREE.DirectionalLight('#bfd4df',.5);fill.position.set(12,9,-30);scene.add(fill);
 const sky=new THREE.Mesh(new THREE.SphereGeometry(155,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#75b5d6')},horizon:{value:new THREE.Color('#f5d2af')}},vertexShader:'varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 horizon;varying vec3 vDirection;void main(){vec3 dir=normalize(vDirection);float h=smoothstep(-.06,.5,dir.y);vec3 color=mix(horizon,top,h);float glow=pow(max(dot(dir,normalize(vec3(-.5,.28,-.75))),0.),32.);color+=vec3(.22,.13,.035)*glow;gl_FragColor=vec4(color,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'.replace(';#include',';\n#include')}));sky.frustumCulled=false;scene.add(sky);
 // Painted wayfinding turns the Gallery's exposed end wall into a landmark.
 const muralTexture=canvasTexture((c,s)=>{c.clearRect(0,0,s,s);c.strokeStyle='#f1dec1';c.fillStyle='#f1dec1';c.lineWidth=3;c.beginPath();c.arc(s/2,s*.42,s*.29,Math.PI,0);c.lineTo(s*.79,s*.82);c.lineTo(s*.21,s*.82);c.closePath();c.stroke();c.font='150px Georgia';c.textAlign='center';c.fillText('01',s/2,s*.59);c.font='16px sans-serif';c.fillText('IDEAS LIVE HERE',s/2,s*.71);c.font='13px sans-serif';c.fillText('THE LITTLE QUARTER',s/2,s*.9);});
 const mural=new THREE.Mesh(new THREE.PlaneGeometry(3.8,3.8),new THREE.MeshStandardMaterial({map:muralTexture,transparent:true,roughness:1,depthWrite:false}));mural.position.set(9,3.7,.012);scene.add(mural);
 // Puffy cloud silhouettes have feathered edges and move very slowly.
 const cloudTexture=canvasTexture((c,s)=>{c.clearRect(0,0,s,s);c.filter='blur(12px)';c.fillStyle='#fff7e6';for(let i=0;i<12;i++){c.beginPath();c.ellipse(80+i*31,280-Math.sin(i*.5)*35,65,30+random()*28,0,0,Math.PI*2);c.fill();}});
 cloudTexture.wrapS=cloudTexture.wrapT=THREE.ClampToEdgeWrapping;
 const clouds=[];for(let i=0;i<7;i++){const cloud=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTexture,transparent:true,opacity:.48+random()*.2,depthWrite:false,fog:false}));cloud.position.set(-70+i*24,22+random()*12,-25-random()*75);cloud.scale.set(29+random()*23,15+random()*8,1);scene.add(cloud);clouds.push({sprite:cloud,baseX:cloud.position.x});}
 const shadowTexture=canvasTexture((c,s)=>{c.clearRect(0,0,s,s);const gradient=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);gradient.addColorStop(0,'rgba(25,38,27,.32)');gradient.addColorStop(.5,'rgba(25,38,27,.15)');gradient.addColorStop(1,'rgba(25,38,27,0)');c.fillStyle=gradient;c.fillRect(0,0,s,s);},128);
 shadowTexture.wrapS=shadowTexture.wrapT=THREE.ClampToEdgeWrapping;
 const glowTexture=canvasTexture((c,s)=>{c.clearRect(0,0,s,s);const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(255,212,131,.5)');g.addColorStop(.2,'rgba(255,192,86,.14)');g.addColorStop(1,'rgba(255,192,86,0)');c.fillStyle=g;c.fillRect(0,0,s,s);},128);
 for(const side of [-1,1])for(const d of [-3,13,29,45,57]){
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.9,3.9),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(side*5.65,.153,-d-2);scene.add(shadow);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,opacity:.5,depthWrite:false}));glow.position.set(side*4.7,3.8,-d);glow.scale.set(1.1,1.1,1);scene.add(glow);
 }
 // A few drifting leaves and the fountain's arcing water give the street life.
 const leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(.09,.05),new THREE.MeshStandardMaterial({color:'#ae8e50',side:THREE.DoubleSide,roughness:1}),28);const dummy=new THREE.Object3D();const leafData=Array.from({length:28},()=>({x:(random()-.5)*12,z:12-random()*70,y:1+random()*5,phase:random()*6.28}));scene.add(leaves);
 const sprayGeo=new THREE.BufferGeometry(),spray=new Float32Array(40*3);sprayGeo.setAttribute('position',new THREE.BufferAttribute(spray,3));const water=new THREE.Points(sprayGeo,new THREE.PointsMaterial({color:'#d2eef0',size:.045,transparent:true,opacity:.65}));scene.add(water);
 return{setInterior(active){scene.fog.near=active?1000:46;scene.fog.far=active?1200:118;ambient.intensity=active?.3:1.25;sun.intensity=active?.07:3.1;fill.intensity=active?.08:.5;},update(time){const animationTime=reduced?0:time;windTime.value=animationTime;if(!reduced)clouds.forEach((c,i)=>c.sprite.position.x=c.baseX+Math.sin(time*.025+i)*2);leafData.forEach((l,i)=>{dummy.position.set(l.x+Math.sin(animationTime*.45+l.phase)*.5,reduced?l.y:5-((time*.23+l.y)%4.8),l.z);dummy.rotation.set(animationTime*.5+l.phase,l.phase,animationTime*.3);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);});leaves.instanceMatrix.needsUpdate=true;for(let i=0;i<40;i++){const phase=(animationTime*.8+i/40)%1,angle=i*2.399;const r=phase*1.25;spray[i*3]=Math.cos(angle)*r;spray[i*3+1]=1.85+Math.sin(phase*Math.PI)*.9-phase*.7;spray[i*3+2]=-55+Math.sin(angle)*r;}sprayGeo.attributes.position.needsUpdate=true;}};
}
