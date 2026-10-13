import * as THREE from './vendor/three.module.js';

export function mountCampus(host,{onVisit,onSelect,reducedMotion=false}){
 let disposed=false,frame=0,drag=false,moved=false,lastX=0,angle=.48,zoom=1,t=0,walking=false;
 const resources=[],pickables=[],keys=new Set(),target=new THREE.Vector3(0,0,2.5);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#17293e');scene.fog=new THREE.Fog('#17293e',38,85);
 const camera=new THREE.PerspectiveCamera(38,1,.1,120);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#17293e');
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
 // Original upright mascot, modeled from the Valencia reference.
 const puma=new THREE.Group();world.add(puma);puma.position.set(0,0,2.5);puma.rotation.y=.48;
 const fur=mat('#ad2947'),cream=mat('#fff3de'),dark=mat('#242438'),pink=mat('#f28ba7'),inner=mat('#d85370'),shirt=mat('#fff8e8'),goldCloth=mat('#efae30'),navy=mat('#172d4a'),blue=mat('#5597b3');
 let greetingAt=0;
 function ellipsoid(r,m,parent,x,y,z,sx=1,sy=1,sz=1,detail=1){const o=ball(r,m,parent,x,y,z,detail);o.scale.set(sx,sy,sz);return o}
 function label(text,color,bg,w,h){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,512,256)}ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 145px Georgia, serif';if(text==='VC'){ctx.fillText('V',195,137);ctx.fillStyle='#efae30';ctx.fillText('C',310,137)}else if(text==='VALENCIA'){ctx.font='bold 65px Georgia, serif';ctx.fillText('VALENCIA',256,95);ctx.font='bold 55px Georgia, serif';ctx.fillText('COLLEGE',256,166)}else ctx.fillText(text,256,137);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;resources.push(texture);const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});resources.push(m);return mesh(new THREE.PlaneGeometry(w,h),m)}
 const body=new THREE.Group();puma.add(body);
 mesh(new THREE.CylinderGeometry(.65,.56,1.05,10),shirt,body,0,2.02,0);
 ellipsoid(.61,shirt,body,0,2.38,0,1.18,.65,.8);
 const monogram=label('VC','#b52d43',null,.75,.4);scene.remove(monogram);body.add(monogram);monogram.position.set(0,2.1,.66);
 // Gold shorts and two independently animated legs.
 const legs=[];
 for(const x of [-.32,.32]){const leg=new THREE.Group();puma.add(leg);leg.position.set(x,1.43,0);mesh(new THREE.CylinderGeometry(.31,.32,.56,8),goldCloth,leg,0,-.1,0);mesh(new THREE.CylinderGeometry(.23,.2,.83,8),fur,leg,0,-.75,0);ellipsoid(.35,goldCloth,leg,0,-1.13,.18,1,.7,1.55);box(.62,.14,.92,navy,leg,0,-1.33,.17);box(.36,.05,.48,goldCloth,leg,0,-1.34,.35);for(const z of [.13,.27,.41])box(.37,.045,.035,cream,leg,0,-.98,z);legs.push(leg)}
 box(.9,.18,.57,goldCloth,body,0,1.53,0);
 const arms=[];
 for(const x of [-.72,.72]){const arm=new THREE.Group();body.add(arm);arm.position.set(x,2.38,0);ellipsoid(.32,shirt,arm,0,-.12,0,1.05,1.1,1);mesh(new THREE.CylinderGeometry(.23,.21,.61,8),fur,arm,0,-.6,0);const paw=ellipsoid(.28,fur,arm,0,-1.01,.03,1.05,1.05,.85);for(const dx of [-.12,0,.12])ellipsoid(.06,inner,arm,dx,-1.05,.26,.75,1.2,.4,0);arm.rotation.z=x<0?-.12:.12;arms.push(arm)}
 const head=new THREE.Group();body.add(head);head.position.set(0,3.16,.04);
 ellipsoid(.87,fur,head,0,0,0,1.08,.99,.92);
 for(const x of [-.74,.74]){ellipsoid(.3,fur,head,x,.59,-.03,.85,1.1,.55);ellipsoid(.2,inner,head,x,.61,.11,.85,1.1,.4)}
 ellipsoid(.67,cream,head,0,-.33,.42,1.1,.73,.72);
 const mouth=ellipsoid(.36,dark,head,0,-.38,.83,1,.75,.16);
 ellipsoid(.2,pink,head,0,-.55,.9,1,.25,.3);
 for(const x of [-.16,.16]){const tooth=mesh(new THREE.ConeGeometry(.07,.17,5),cream,head,x,-.27,.93);tooth.rotation.z=Math.PI}
 for(const x of [-.23,.23]){ellipsoid(.29,cream,head,x,-.08,.81,1.15,.8,.57);for(const [dx,dy] of [[-.05,.04],[.07,.07],[.04,-.07]])ellipsoid(.019,dark,head,x+dx,-.08+dy,.97,1,1,.5,0)}
 ellipsoid(.24,pink,head,0,.06,.97,1.2,.72,.65);
 for(const x of [-.38,.38]){ellipsoid(.21,cream,head,x,.29,.68,1.2,.85,.5);ellipsoid(.12,blue,head,x,.29,.79,1,1,.38);ellipsoid(.062,dark,head,x,.29,.83,1,1.2,.4);ellipsoid(.023,cream,head,x-.02,.33,.86,1,1,.5,0);const brow=box(.35,.08,.09,dark,head,x,.55,.65);brow.rotation.z=x<0?.12:-.12}
 // Navy baseball cap with a red Valencia badge and broad forward bill.
 const cap=mesh(new THREE.SphereGeometry(.76,12,6,0,Math.PI*2,0,Math.PI/2),navy,head,0,.57,-.01);cap.scale.set(1.04,.68,1.02);
 ellipsoid(.66,navy,head,0,.6,.52,1.18,.1,.9);
 const capLabel=label('VALENCIA','#fff2d8','#b52d43',.58,.24);scene.remove(capLabel);head.add(capLabel);capLabel.position.set(0,.85,.64);capLabel.rotation.x=-.12;
 const tail=new THREE.Group();puma.add(tail);tail.position.set(0,1.4,-.4);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.35,-.15,-.6),new THREE.Vector3(.8,.05,-.9),new THREE.Vector3(.9,.35,-.75)]);mesh(new THREE.TubeGeometry(curve,12,.1,5,false),fur,tail);
 const pumaHit=mesh(new THREE.BoxGeometry(2,4.3,1.8),new THREE.MeshBasicMaterial({visible:false}),puma,0,2,0);resources.push(pumaHit.material);pumaHit.userData.puma=true;pickables.push(pumaHit);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),clock=new THREE.Clock();
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function cameraPose(){const mobile=host.clientWidth<650;camera.position.set(Math.sin(angle)*(mobile?24:23)*zoom, (mobile?20:17)*zoom,Math.cos(angle)*(mobile?24:23)*zoom);camera.lookAt(mobile?0:-1.8,0,0)}
 function pick(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(pickables,false)[0]}
 function down(e){renderer.domElement.focus({preventScroll:true});drag=true;moved=false;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)}
 function move(e){if(drag){const dx=e.clientX-lastX;if(Math.abs(dx)>2)moved=true;angle-=dx*.006;lastX=e.clientX}else{const hit=pick(e);renderer.domElement.style.cursor=hit?'pointer':'grab'}}
 function up(e){drag=false;if(moved)return;const hit=pick(e);if(!hit)return;if(hit.object.userData.portal){onSelect(hit.object.userData.portal);return}if(hit.object.userData.puma){onVisit('Hey, Puma! Let’s find your next mission. Choose a glowing portal.');greetingAt=t;return}target.copy(hit.point);target.y=0;if(target.length()>8.5)target.setLength(8.5);onVisit('On the move. Tap a portal to choose a mission.')}
 function keydown(e){if(document.activeElement!==renderer.domElement)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase())}}
 function keyup(e){keys.delete(e.key.toLowerCase())}
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',()=>drag=false);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
 function animate(){if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(document.hidden)return;t+=dt;
 const direction=new THREE.Vector3((keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),0,(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0));
 if(direction.length()){direction.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),angle);target.copy(puma.position).addScaledVector(direction,1);if(target.length()>8.5)target.setLength(8.5)}
 const delta=target.clone().sub(puma.position);walking=delta.length()>.08;if(walking){const step=Math.min(delta.length(),dt*3.8);puma.position.addScaledVector(delta.normalize(),step);const desired=Math.atan2(delta.x,delta.z);let diff=desired-puma.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));puma.rotation.y+=diff*Math.min(dt*10,1)}
 if(!reducedMotion){body.position.y=Math.sin(t*(walking?10:2))*(walking?.06:.025);legs.forEach((l,i)=>l.rotation.x=walking?Math.sin(t*10+i*Math.PI)*.45:0);arms.forEach((arm,i)=>{arm.rotation.x=walking?-Math.sin(t*10+i*Math.PI)*.4:0;arm.rotation.z=i===0?-.12:.12});if(!walking&&t-greetingAt<2.7){arms[0].rotation.z=-2.35+Math.sin((t-greetingAt)*9)*.2;arms[0].rotation.x=-.25;}tail.rotation.z=Math.sin(t*2)*.12;head.rotation.y=walking?0:Math.sin(t*.7)*.12;portals.forEach((p,i)=>{p.gem.rotation.y=t*.5;p.gem.position.y=1.3+Math.sin(t*2+i)*.1})}
 cameraPose();renderer.render(scene,camera)}
 animate();host.dataset.ready='true';onVisit('Meet your Valencia puma! Tap the mascot for a wave, or tap the island to explore.');
 return {rotate(d){angle+=d*.35},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove()}};
}
