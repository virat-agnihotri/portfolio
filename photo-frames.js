import * as THREE from 'three';

// Botanical entrance artwork; personal exhibits provide their own source.
export const photoFrameSlots={
 'about-entry':'assets/art/flowers-blue.svg','about-left':'assets/art/flowers-gold.svg','about-right':'assets/art/flowers-rose.svg',
 'studio-entry':'assets/art/flowers-gold.svg','studio-left':'assets/art/flowers-rose.svg','studio-right':'assets/art/flowers-blue.svg',
 'contact-entry':'assets/art/flowers-rose.svg','contact-left':'assets/art/flowers-blue.svg','contact-right':'assets/art/flowers-gold.svg'
};

export function addPhotoFrame(parent,slot,{position=[0,0,0],rotation=0,width=1.4,height=1.7,color='#ac8b59',textures=true,source=photoFrameSlots[slot]}={}){
 const group=new THREE.Group();group.name='Photo frame: '+slot;group.userData.photoSlot=slot;group.position.set(...position);group.rotation.y=rotation;parent.add(group);
 const surround=new THREE.Mesh(new THREE.BoxGeometry(width,height,.1),new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.25}));group.add(surround);
 const mat=new THREE.Mesh(new THREE.BoxGeometry(width-.09,height-.09,.035),new THREE.MeshStandardMaterial({color:'#e6e0d3',roughness:.95}));mat.position.z=.06;group.add(mat);
 const art=new THREE.Mesh(new THREE.PlaneGeometry(width-.26,height-.26),new THREE.MeshBasicMaterial({color:'#f5f2eb'}));art.position.z=.081;group.add(art);
 if(textures&&source&&typeof document!=='undefined')new THREE.TextureLoader().load(source,map=>{map.colorSpace=THREE.SRGBColorSpace;art.material.map=map;art.material.color.set('#ffffff');art.material.needsUpdate=true;const aspect=map.image.width/map.image.height,available=(width-.26)/(height-.26);if(aspect>available)art.scale.y=available/aspect;else art.scale.x=aspect/available;});
 return group;
}
