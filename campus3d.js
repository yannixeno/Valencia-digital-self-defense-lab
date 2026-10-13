import * as THREE from './vendor/three.module.js';

export function mountCampus(host,{onVisit,onSelect,reducedMotion=false}){
 let disposed=false,frame=0,drag=false,moved=false,lastX=0,angle=.48,zoom=1,t=0,walking=false;
 const resources=[],pickables=[],keys=new Set(),target=new THREE.Vector3(0,0,2.5);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#17293e');scene.fog=new THREE.Fog('#17293e',38,85);
 const camera=new THREE.PerspectiveCamera(38,1,.1,120);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#17293e');
 host.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D campus with a puma and three mission portals');
 const ambient=new THREE.HemisphereLight(0xbbe8ff,0x635444,2.4);scene.add(ambient);
 const sun=new THREE.DirectionalLight(0xffdfb1,4);sun.position.set(-8,15,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15});scene.add(sun);
 function mat(color,extra={}){const m=new THREE.MeshStandardMaterial({color,roughness:.85,flatShading:true,...extra});resources.push(m);return m}
 const grass=mat('#5f9c8c'),rock=mat('#445d72'),pathMat=mat('#e0ceb0'),leaf=mat('#45796d'),trunk=mat('#836348');
 function mesh(g,m,parent=scene,x=0,y=0,z=0){resources.push(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function box(w,h,d,m,parent,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z)}
 function ball(r,m,parent,x,y,z,detail=0){return mesh(new THREE.IcosahedronGeometry(r,detail),m,parent,x,y,z)}
 const world=new THREE.Group();scene.add(world);
 mesh(new THREE.CylinderGeometry(10.8,8.8,.65,8),grass,world,0,-.32,0);
 mesh(new THREE.CylinderGeometry(8.8,3,4.8,8),rock,world,0,-3,0);
 const lower=mat('#2c4359');mesh(new THREE.ConeGeometry(3.1,4,7),lower,world,0,-7,0).rotation.z=Math.PI;
 const ground=mesh(new THREE.CylinderGeometry(10.6,10.6,.06,48),new THREE.MeshBasicMaterial({visible:false}),world,0,.01,0);resources.push(ground.material);ground.userData.ground=true;pickables.push(ground);
 box(2.2,.04,15,pathMat,world,0,.025,0);box(15,.04,2.2,pathMat,world,0,.035,0);
 mesh(new THREE.CylinderGeometry(2.4,2.4,.06,32),pathMat,world,0,.055,0);
 // Small campus architecture, shaded courtyards, and faceted trees.
 function building(x,z,color){const g=new THREE.Group();world.add(g);g.position.set(x,0,z);const wall=mat(color),roof=mat('#e7d8bf'),glass=mat('#35596e',{metalness:.25});box(2.8,1.8,2.2,wall,g,0,.95,0);box(3.1,.2,2.5,roof,g,0,1.98,0);for(const a of [-.8,0,.8])box(.42,.65,.04,glass,g,a,1.15,1.12);box(.65,.95,.05,glass,g,0,.52,1.13);return g}
 building(-5,-3.8,'#e5b777');building(4.8,-4,'#829bbb');building(6,2.9,'#d98b76');
 for(const [x,z] of [[-7,1],[-6,5],[-3,6],[3,6.3],[7,-1],[-2,-7],[2,-7]]){box(.2,1.2,.2,trunk,world,x,.6,z);const tree=mesh(new THREE.ConeGeometry(.85,2.3,5),leaf,world,x,2,z);tree.rotation.y=x;ball(.35,grass,world,x+.8,.2,z+.3)}
 const gold=mat('#e6b35a');for(let i=0;i<20;i++){const a=i*2.4,r=8+Math.sin(i)*.5;ball(.13,gold,world,Math.cos(a)*r,.16,Math.sin(a)*r)}
 const portalData=[{id:'signal',name:'Signal Station',x:-5.5,z:1.5,color:'#7dc8ff'},{id:'trust',name:'Trust Commons',x:0,z:-4.5,color:'#ffbe79'},{id:'discovery',name:'Discovery Grove',x:5.3,z:.2,color:'#a0e4b3'}];
 const portals=portalData.map(d=>{const g=new THREE.Group();world.add(g);g.position.set(d.x,0,d.z);g.userData.portal=d.id;const metal=mat('#23384f');mesh(new THREE.CylinderGeometry(1.15,1.35,.22,8),metal,g,0,.15,0);const glow=mat(d.color,{emissive:d.color,emissiveIntensity:.75,metalness:.15,roughness:.3});const ring=mesh(new THREE.TorusGeometry(.9,.105,6,32),glow,g,0,1.3,0);const gem=ball(.32,glow,g,0,1.3,0);const hit=mesh(new THREE.BoxGeometry(2.2,3,1.4),new THREE.MeshBasicMaterial({visible:false}),g,0,1.3,0);resources.push(hit.material);hit.userData.portal=d.id;pickables.push(hit);const l=new THREE.PointLight(d.color,3,5);l.position.y=1.4;g.add(l);return {g,ring,gem,data:d}});
 // Original low-poly puma: muzzle, pointed ears, shoulder haunches, paws, and long curved tail.
 const puma=new THREE.Group();world.add(puma);puma.position.set(0,0,2.5);
 const fur=mat('#ddb17b'),cream=mat('#ffe3b7'),dark=mat('#3b302e'),inner=mat('#aa725b'),scarf=mat('#e04f45');
 const body=ball(.8,fur,puma,0,1.05,0,1);body.scale.set(.78,.82,1.3);const chest=ball(.55,cream,puma,0,1.1,.55);chest.scale.set(.8,1,.65);
 const head=new THREE.Group();puma.add(head);head.position.set(0,1.72,.72);const skull=ball(.62,fur,head,0,0,0,1);skull.scale.set(1,.9,.85);
 for(const x of [-.38,.38]){const ear=mesh(new THREE.ConeGeometry(.23,.45,3),fur,head,x,.49,-.02);ear.rotation.z=x<0?.23:-.23;mesh(new THREE.ConeGeometry(.13,.25,3),inner,head,x,.51,.1);ball(.11,cream,head,x*.72,.05,.47);const eye=ball(.058,dark,head,x*.72,.07,.54);eye.scale.y=1.4;}
 for(const x of [-.15,.15]){const muzzle=ball(.23,cream,head,x,-.17,.45);muzzle.scale.set(1,.75,.8)}const nose=ball(.105,dark,head,0,-.1,.64);nose.scale.set(1.2,.7,.7);
 const neck=mesh(new THREE.CylinderGeometry(.46,.48,.18,8),scarf,puma,0,1.39,.55);neck.rotation.x=.4;const flap=box(.27,.55,.08,scarf,puma,.3,1.02,.72);flap.rotation.z=-.3;
 const legs=[];for(const x of [-.36,.36])for(const z of [-.55,.55]){const leg=new THREE.Group();puma.add(leg);leg.position.set(x,.9,z);box(.23,.62,.26,fur,leg,0,-.31,0);const paw=ball(.2,cream,leg,0,-.68,.07);paw.scale.set(1,.7,1.4);legs.push(leg)}
 const tail=new THREE.Group();puma.add(tail);tail.position.set(0,1,-.8);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.25,.1,-.5),new THREE.Vector3(.65,.5,-.85),new THREE.Vector3(.7,.9,-.65)]);mesh(new THREE.TubeGeometry(curve,12,.1,5,false),fur,tail);ball(.13,dark,tail,.7,.9,-.65);
 const pumaHit=mesh(new THREE.SphereGeometry(1.2,8,8),new THREE.MeshBasicMaterial({visible:false}),puma,0,1,0);resources.push(pumaHit.material);pumaHit.userData.puma=true;pickables.push(pumaHit);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),clock=new THREE.Clock();
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function cameraPose(){const mobile=host.clientWidth<650;camera.position.set(Math.sin(angle)*(mobile?24:23)*zoom, (mobile?20:17)*zoom,Math.cos(angle)*(mobile?24:23)*zoom);camera.lookAt(mobile?0:-1.8,0,0)}
 function pick(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(pickables,false)[0]}
 function down(e){renderer.domElement.focus({preventScroll:true});drag=true;moved=false;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)}
 function move(e){if(drag){const dx=e.clientX-lastX;if(Math.abs(dx)>2)moved=true;angle-=dx*.006;lastX=e.clientX}else{const hit=pick(e);renderer.domElement.style.cursor=hit?'pointer':'grab'}}
 function up(e){drag=false;if(moved)return;const hit=pick(e);if(!hit)return;if(hit.object.userData.portal){onSelect(hit.object.userData.portal);return}if(hit.object.userData.puma){onVisit('Your puma is ready. Choose a glowing portal to start a mission.');if(!reducedMotion)t+=.5;return}target.copy(hit.point);target.y=0;if(target.length()>8.5)target.setLength(8.5);onVisit('On the move. Tap a portal to choose a mission.')}
 function keydown(e){if(document.activeElement!==renderer.domElement)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase())}}
 function keyup(e){keys.delete(e.key.toLowerCase())}
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',()=>drag=false);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
 function animate(){if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(document.hidden)return;t+=dt;
 const direction=new THREE.Vector3((keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),0,(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0));
 if(direction.length()){direction.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),angle);target.copy(puma.position).addScaledVector(direction,1);if(target.length()>8.5)target.setLength(8.5)}
 const delta=target.clone().sub(puma.position);walking=delta.length()>.08;if(walking){const step=Math.min(delta.length(),dt*3.8);puma.position.addScaledVector(delta.normalize(),step);const desired=Math.atan2(delta.x,delta.z);let diff=desired-puma.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));puma.rotation.y+=diff*Math.min(dt*10,1)}
 if(!reducedMotion){body.position.y=1.05+Math.sin(t*(walking?14:2))*(walking?.045:.025);legs.forEach((l,i)=>l.rotation.x=walking?Math.sin(t*14+(i===0||i===3?0:Math.PI))*.5:0);tail.rotation.z=Math.sin(t*2)*.12;head.rotation.y=walking?0:Math.sin(t*.7)*.12;portals.forEach((p,i)=>{p.gem.rotation.y=t*.5;p.gem.position.y=1.3+Math.sin(t*2+i)*.1})}
 cameraPose();renderer.render(scene,camera)}
 animate();host.dataset.ready='true';onVisit('Meet your campus guide. Tap the island to move your puma.');
 return {rotate(d){angle+=d*.35},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove()}};
}
