import * as THREE from 'three';

// Walking space is independent of the sightseeing camera.
export function easeWalking(velocity,forward,side,dt){
 const length=Math.hypot(forward,side);if(length>1){forward/=length;side/=length;}
 velocity.x=THREE.MathUtils.damp(velocity.x,side,10,dt);velocity.y=THREE.MathUtils.damp(velocity.y,forward,10,dt);
 if(Math.abs(velocity.x)<.0001)velocity.x=0;if(Math.abs(velocity.y)<.0001)velocity.y=0;return velocity;
}
export function wrapAngle(angle){return Math.atan2(Math.sin(angle),Math.cos(angle));}
