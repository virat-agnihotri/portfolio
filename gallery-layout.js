export const galleryLayout=[
 {id:'lunar',side:'left',position:[53.86,2.95,-3.1],rotation:Math.PI/2,plinth:[55.35,.46,-3.1]},
 {id:'tone',side:'left',position:[53.86,2.95,-8.6],rotation:Math.PI/2,plinth:[55.35,.46,-8.6]},
 {id:'knowledge',side:'right',position:[66.14,2.95,-3.1],rotation:-Math.PI/2,plinth:[64.65,.46,-3.1]},
 {id:'docintel',side:'right',position:[66.14,2.95,-8.6],rotation:-Math.PI/2,plinth:[64.65,.46,-8.6]},
 {id:'rocket',side:'center',position:[60,2.95,-12.04],rotation:0,plinth:[60,.46,-10.1]}
];
export const galleryModels={
 rocket:'assets/models/rocket.glb',lunar:'assets/models/moon.glb',satellite:'assets/models/satellite.glb',
 tone:'assets/models/redbull.glb',mercedes:'assets/models/mercedes.glb',
 knowledge:'assets/models/bookshelf.glb',docintel:'assets/models/brain-hologram.glb'
};

// User-supplied project visuals, shared by wall posters and reading panels.
// The Rocket overview combines the supplied frontend captures.
export const galleryScreenshots={rocket:'assets/projects/rocket-mission-showcase.png',lunar:'assets/projects/lunar-vision-interface.png',tone:'assets/projects/tone-analyser-interface.png',knowledge:'assets/projects/knowledge-vault-presentation.jpg',docintel:'assets/projects/docintel-ai-interface.png'};

export function avoidGalleryPlinths(next,previous){
 for(const slot of galleryLayout){const x=slot.plinth[0],z=slot.plinth[2],half=.96,dx=next.x-x,dz=next.z-z;if(Math.abs(dx)>=half||Math.abs(dz)>=half)continue;
  if(Math.abs(previous.x-x)>=half)next.x=x+Math.sign(previous.x-x)*half;
  else if(Math.abs(previous.z-z)>=half)next.z=z+Math.sign(previous.z-z)*half;
  else if(half-Math.abs(dx)<half-Math.abs(dz))next.x=x+(Math.sign(dx)||1)*half;
  else next.z=z+(Math.sign(dz)||1)*half;
 }return next;
}
