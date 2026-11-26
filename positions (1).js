import * as THREE from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {OrbitControls} from './OrbitControls.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);let dirty=true;window.__renders=0;
const stage=document.getElementById('stage'),cv=document.getElementById('cv'),lbBox=document.getElementById('lbs');
const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?1.5:2));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.02,40);cam.position.set(2.6,1.2,2.4);
const ctl=new OrbitControls(cam,cv);ctl.target.set(0,.9,0);ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.minDistance=.3;ctl.maxDistance=8;ctl.update();
ctl.addEventListener('change',()=>{dirty=true});
scene.add(new THREE.HemisphereLight(0xcfe2ff,0x0a1a40,1.1));
const d1=new THREE.DirectionalLight(0xffffff,1.8);d1.position.set(2,3,3);scene.add(d1);
const d2=new THREE.DirectionalLight(0x6aa8ff,1.2);d2.position.set(-3,1.5,-2);scene.add(d2);
function size(){const w=stage.clientWidth,h=stage.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();dirty=true}addEventListener('resize',size);new ResizeObserver(size).observe(stage);size();
const grid=new THREE.GridHelper(5,50,0x2a4a8a,0x142850);grid.material.transparent=true;grid.material.opacity=.45;scene.add(grid);
const patient=new THREE.Group();scene.add(patient);const world=new THREE.Group();scene.add(world);
const lang=()=>document.documentElement.lang,bi=a=>lang()=='ar'?a[0]:a[1];
let NAMES={},EXAMS=[];
const mat={skin:new THREE.MeshStandardMaterial({color:0x6aa8ff,transparent:true,opacity:.045,roughness:.8,depthWrite:false,side:THREE.DoubleSide}),
 bone:new THREE.MeshStandardMaterial({color:0xe3ebf7,roughness:.55}),organ:new THREE.MeshStandardMaterial({color:0xd98b7a,roughness:.6}),
 ghost:new THREE.MeshStandardMaterial({color:0xaac4ee,transparent:true,opacity:.14,roughness:.8,depthWrite:false}),
 gold:new THREE.MeshStandardMaterial({color:0xffd36b,emissive:0xffa800,emissiveIntensity:.5,roughness:.4})};
const FILES={skin:'skin.glb',skeleton:'skeleton.glb',viscera:'viscera.glb'};const LM={};const meshes=[];const loader=new GLTFLoader();let sL=1;
const loadEl=document.getElementById('load');
function loadLayer(k){if(LM[k])return LM[k];loadEl.style.display='block';
 LM[k]=new Promise(res=>loader.load(FILES[k],g=>{g.scene.traverse(o=>{if(!o.isMesh)return;const nm=o.userData.name||o.name;o.userData.nm=nm;o.userData.layer=k;
   if(/\.g$/.test(nm)||/hair/i.test(nm)){o.visible=false;o.userData.skip=1}
   o.geometry.computeVertexNormals();o.geometry.computeBoundingBox();o.material=k=='skin'?mat.skin:k=='skeleton'?mat.bone:mat.organ;o.userData.base=o.material;meshes.push(o)});
  patient.add(g.scene);if(k=='skeleton'){let s=0,n=0;meshes.forEach(m=>{if(m.userData.layer=='skeleton'&&/\.l$/.test(m.userData.nm)){const c=m.geometry.boundingBox.getCenter(V(0,0,0));s+=c.x;n++}});sL=s>=0?1:-1}
  loadEl.style.display='none';dirty=true;res()},null,()=>{loadEl.textContent='Load error';res()}));return LM[k]}
const eng=n=>NAMES[n]?NAMES[n][0]:n.replace(/\.[a-z]$/,'');
function bodyMeshes(){return meshes.filter(m=>m.userData.layer!='skin'&&!m.userData.skip)}
// poses
function qFrom(h,f){const x=h.clone().cross(f).normalize(),m=new THREE.Matrix4().makeBasis(x,h,f);return new THREE.Quaternion().setFromRotationMatrix(m)}
function poseQ(p){const up=V(0,1,0);
 if(p=='erect')return qFrom(up,V(0,0,1));if(p=='supine')return qFrom(V(0,0,-1),V(0,1,0));if(p=='prone')return qFrom(V(0,0,-1),V(0,-1,0));
 if(p=='lat-L')return qFrom(V(0,0,-1),V(sL,0,0));return qFrom(V(0,0,-1),V(-sL,0,0))}
function structBox(rx,layer){const re=new RegExp(rx),b=new THREE.Box3();let n=0;meshes.forEach(m=>{if(!m.userData.skip&&m.userData.layer!='skin'&&re.test(eng(m.userData.nm))){b.union(m.geometry.boundingBox);n++}});return n?b:null}
// equipment
let eq=null,eqMats=[],labels=[],t0=0,ctState=null;
function clearEq(){if(eq){world.remove(eq);eq.traverse(o=>{if(o.geometry)o.geometry.dispose()})}eq=null;eqMats=[];labels.forEach(l=>l.el.remove());labels=[];ctState=null}
function track(m,op){m.transparent=true;m.userData.op=op;m.opacity=0;eqMats.push(m);return m}
function addLabel(pos,txt,col){const el=document.createElement('div');el.className='lb';el.style.borderColor=col||'';el.innerHTML='<span data-l="ar">'+txt[0]+'</span><span data-l="en">'+txt[1]+'</span>';lbBox.appendChild(el);labels.push({el,pos})}
function orient(o,dir){o.quaternion.setFromUnitVectors(V(0,-1,0),dir)}
function cyl(a,b,r,m){const d=b.clone().sub(a),g=new THREE.CylinderGeometry(r,r,d.length(),10),o=new THREE.Mesh(g,m);o.position.copy(a.clone().add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());return o}
function table(g,tableTop,zc,len){const m=track(new THREE.MeshStandardMaterial({color:0x1b3a73,roughness:.6}),.4);
 const s=new THREE.Mesh(new THREE.BoxGeometry(.6,.05,len||2.2),m);s.position.set(0,tableTop-.025,zc);g.add(s);
 const p=new THREE.Mesh(new THREE.BoxGeometry(.3,tableTop-.05,.8),m);p.position.set(0,(tableTop-.05)/2,zc);g.add(p)}
let cur=null,anim=null,state=null;
async function showExam(ex){cur=ex;clearEq();document.getElementById('pick').classList.remove('on');
 for(const k of ex.layers)await loadLayer(k);await loadLayer('skin');
 // focus materials
 const res=ex.targets.map(t=>new RegExp(t));bodyMeshes().forEach(m=>{const hit=res.some(r=>r.test(eng(m.userData.nm)));m.material=hit?mat.gold:(m.userData.layer=='skeleton'&&!hit&&ex.layers.length?mat.ghost:mat.ghost);m.userData.hit=hit});
 const ARMB=/^(Humerus|Radius|Ulna)$|carpal|^(Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum) bone$|phalanx of .* of hand/,ARMS=/arm$|elbow|forearm|wrist|cubital|bicipital|hand|^palm$|radial foveola|^nail plate$|^perionyx$|deltoid/i;
 meshes.forEach(m=>{if(m.userData.skip){m.visible=false;return}const nm=m.userData.nm.replace(/\.[a-z]$/,'');let v=m.userData.layer=='skin'||ex.layers.includes(m.userData.layer);
  if(v&&ex.hideArms){if(m.userData.layer=='skin'?ARMS.test(nm):ARMB.test(eng(m.userData.nm)))v=false}m.visible=v});
 // compute final pose
 const q=poseQ(ex.pose);const from={q:patient.quaternion.clone(),p:patient.position.clone()};
 patient.quaternion.copy(q);patient.position.set(0,0,0);patient.updateMatrixWorld(true);
 const sk=new THREE.Box3();meshes.filter(m=>m.userData.layer=='skin'&&!m.userData.skip&&m.visible).forEach(m=>sk.union(new THREE.Box3().setFromObject(m)));
 const cb=structBox(ex.cr.s,0)||structBox('Vertebra',0);const cl=cb.getCenter(V(0,0,0));cl.x=0;
 let pos=V(0,0,0);const crW0=cl.clone().applyQuaternion(q);
 const erect=ex.pose=='erect';let tableTop=0;if(!erect){tableTop=.9;pos.y=tableTop-sk.min.y}
 pos.x=-crW0.x;pos.z=-crW0.z;const crW=crW0.clone().add(pos);
 state={q,pos,crW,tableTop,erect,sk:sk.clone().translate(pos),from};patient.quaternion.copy(from.q);patient.position.copy(from.p);
 anim={t0:performance.now(),dur:1100,from,to:{q,p:pos},done:false,ex};
}
function fly(crW,ex,q,erect){let dirB=beamDirBody(ex.beam,ex.tilt);const dirW=dirB.clone().applyQuaternion(q);
 let s=V(0,0,0).crossVectors(dirW,V(0,1,0));if(s.length()<.2)s=V(1,0,0);s.normalize();const dist=ex.type=='ct'?2.3:(ex.pose=='erect'?3.2:2.5);
 camAnim={t0:performance.now(),from:cam.position.clone(),ft:ctl.target.clone(),to:crW.clone().add(s.multiplyScalar(dist)).add(V(0,dist*.28,0)),tt:crW.clone()}}
let camAnim=null;
function beamDirBody(b,tilt){const l=V(sL,0,0);let v=b=='AP'?V(0,0,-1):b=='PA'?V(0,0,1):b=='R-L'?l:l.clone().negate();if(tilt){const a=tilt*Math.PI/180;v=v.multiplyScalar(Math.cos(a)).add(V(0,Math.sin(a),0)).normalize()}return v}
function build(ex){clearEq();eq=new THREE.Group();world.add(eq);const q=state.q,pos=state.pos,crW=state.crW;
 const dirW=beamDirBody(ex.beam,ex.tilt).applyQuaternion(q).normalize();const headW=V(0,1,0).applyQuaternion(q);
 table0(ex);
 if(ex.type=='ct'){buildCT(ex,q,pos,crW,headW);return}
 // entry/exit
 const rc=new THREE.Raycaster(crW.clone().sub(dirW.clone().multiplyScalar(2)),dirW,0,5);
 const hits=rc.intersectObjects(meshes.filter(m=>m.userData.layer=='skin'&&!m.userData.skip&&m.visible),false);let entry,exit,approx=false;
 if(hits.length>=2){entry=hits[0].point.clone();exit=hits[hits.length-1].point.clone()}else{const bh=rc.intersectObjects(bodyMeshes().filter(m=>m.visible),false);if(bh.length>=2){entry=bh[0].point.clone().sub(dirW.clone().multiplyScalar(.04));exit=bh[bh.length-1].point.clone().add(dirW.clone().multiplyScalar(.04))}else{entry=crW.clone().sub(dirW.clone().multiplyScalar(.12));exit=crW.clone().add(dirW.clone().multiplyScalar(.12))}approx=true}
 const horiz=Math.abs(dirW.y)<.5;const D=exit.clone().add(dirW.clone().multiplyScalar(horiz?.03:.065)),T=D.clone().sub(dirW.clone().multiplyScalar(ex.sid));
 state.entry=entry;state.exit=exit;state.D=D;state.T=T;state.approx=approx;
 {const mid=T.clone().lerp(D,.5);let s2=V(0,0,0).crossVectors(dirW,headW);if(s2.length()<.2)s2=V(1,0,0);s2.normalize();let cd;if(Math.abs(s2.y)>.7){if(s2.y<0)s2.negate();cd=s2.clone().add(dirW.clone().multiplyScalar(-.35)).add(headW.clone().multiplyScalar(.5)).normalize()}else{cd=s2.clone().add(V(0,.2,0)).normalize()}const dist=Math.max(2,(ex.sid+.3)*1.85);camAnim={t0:performance.now(),from:cam.position.clone(),ft:ctl.target.clone(),to:mid.clone().add(cd.multiplyScalar(dist)),tt:mid.clone()}}
 let up=headW.clone().sub(dirW.clone().multiplyScalar(headW.dot(dirW)));if(up.length()<.1)up=V(1,0,0);up.normalize();const right=V(0,0,0).crossVectors(up,dirW).normalize();
 const [dw,dh,or]=ex.det;const w=or=='portrait'?dw:dh,h=or=='portrait'?dh:dw;
 // detector
 const dm=track(new THREE.MeshStandardMaterial({color:0x4c8dff,emissive:0x1c4bb5,emissiveIntensity:.6,roughness:.4,metalness:.2}),.95);const det=new THREE.Mesh(new THREE.BoxGeometry(w,h,.014),dm);det.position.copy(D);det.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,dirW));eq.add(det);
 if(horiz){const st=new THREE.Mesh(new THREE.BoxGeometry(w+.1,1.5,.05),track(new THREE.MeshStandardMaterial({color:0x1b3a73,roughness:.6}),.5));st.position.copy(D.clone().add(dirW.clone().multiplyScalar(.04)));st.position.y=.75+.0;st.quaternion.copy(det.quaternion);eq.add(st)}
 // tube
 const tg=new THREE.Group();tg.position.copy(T);tg.quaternion.setFromUnitVectors(V(0,-1,0),dirW);
 const tm=track(new THREE.MeshStandardMaterial({color:0x3a4f7a,roughness:.35,metalness:.55}),1);
 const hs=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.24,28),tm);hs.position.y=.12;tg.add(hs);const col=new THREE.Mesh(new THREE.BoxGeometry(.2,.09,.2),tm);col.position.y=-.045;tg.add(col);eq.add(tg);
 // beam pyramid
 const hf=h/2,wf=w/2,c=[D.clone().add(right.clone().multiplyScalar(-wf)).add(up.clone().multiplyScalar(-hf)),D.clone().add(right.clone().multiplyScalar(wf)).add(up.clone().multiplyScalar(-hf)),D.clone().add(right.clone().multiplyScalar(wf)).add(up.clone().multiplyScalar(hf)),D.clone().add(right.clone().multiplyScalar(-wf)).add(up.clone().multiplyScalar(hf))];
 const pv=[];[[0,1],[1,2],[2,3],[3,0]].forEach(e=>{pv.push(...T.toArray(),...c[e[0]].toArray(),...c[e[1]].toArray())});
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pv,3));
 eq.add(new THREE.Mesh(pg,track(new THREE.MeshBasicMaterial({color:0x8fc4ff,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),.16)));
 const lv=[];c.forEach(p=>{lv.push(...T.toArray(),...p.toArray())});[[0,1],[1,2],[2,3],[3,0]].forEach(e=>lv.push(...c[e[0]].toArray(),...c[e[1]].toArray()));
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lv,3));eq.add(new THREE.LineSegments(lg,track(new THREE.LineBasicMaterial({color:0xbfdcff}),.55)));
 // central ray + arrow
 eq.add(cyl(T,D,.0035,track(new THREE.MeshBasicMaterial({color:0xffffff}),1)));
 const ar=new THREE.Mesh(new THREE.ConeGeometry(.02,.07,16),track(new THREE.MeshBasicMaterial({color:0xffffff}),1));ar.position.copy(T.clone().lerp(entry,.55));ar.quaternion.setFromUnitVectors(V(0,1,0),dirW);eq.add(ar);
 // markers
 [[entry,0x35e08a],[exit,0xff5a5a]].forEach(([p,col])=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.035,.006,10,40),track(new THREE.MeshBasicMaterial({color:col}),1));r.position.copy(p);r.quaternion.setFromUnitVectors(V(0,0,1),dirW);eq.add(r);const s=new THREE.Mesh(new THREE.SphereGeometry(.011,12,12),track(new THREE.MeshBasicMaterial({color:col}),1));s.position.copy(p);eq.add(s)});
 const sidTxt=Math.round(ex.sid*100)+' cm';
 addLabel(T.clone().add(headW.clone().multiplyScalar(.04)),['أنبوب الأشعة','X-ray tube']);
 addLabel(T.clone().lerp(entry,.55).add(up.clone().multiplyScalar(.09)),['الشعاع المركزي','Central ray']);
 addLabel(entry.clone().add(up.clone().multiplyScalar(.13)).sub(dirW.clone().multiplyScalar(.04)),['نقطة الدخول'+(approx?' (تقريبية)':''),'Entry point'+(approx?' (approx.)':'')],'#35e08a');addLabel(exit.clone().sub(up.clone().multiplyScalar(.13)).add(dirW.clone().multiplyScalar(.03)),['نقطة الخروج','Exit point'],'#ff5a5a');
 addLabel(D.clone().add(up.clone().multiplyScalar(h/2+.05)),['الكاسيت '+Math.round(dw*100)+'×'+Math.round(dh*100)+' سم','Detector '+Math.round(dw*100)+'×'+Math.round(dh*100)+' cm']);
 addLabel(T.clone().lerp(D,.38).add(up.clone().multiplyScalar(h/2*.6+.12)),['SID '+sidTxt,'SID '+sidTxt]);
 fade=performance.now();fdone=false}
function table0(ex){if(!state.erect){const c=state.sk.getCenter(V(0,0,0));table(eq,state.tableTop,c.z,Math.max(2.1,state.sk.getSize(V(0,0,0)).z+.5))}}
function buildCT(ex,q,pos,crW,headW){const bot=structBox(ex.range[0],0),top=structBox(ex.range[1],0);const yb=bot?bot.min.y-.01:1.45,yt=top?top.max.y+.01:1.75;
 const c0=V(0,0,crW.clone().sub(pos).applyQuaternion(q.clone().invert()).z);
 const uA=V(0,0,0).crossVectors(headW,V(0,1,0));if(uA.length()<.1)uA.set(1,0,0);uA.normalize();const vA=V(0,0,0).crossVectors(headW,uA).normalize();
 const gm=track(new THREE.MeshStandardMaterial({color:0x2a4a8a,roughness:.35,metalness:.5}),.5);
 const gantry=new THREE.Mesh(new THREE.TorusGeometry(.38,.07,20,72),gm);gantry.quaternion.setFromUnitVectors(V(0,0,1),headW);eq.add(gantry);
 const disc=new THREE.Mesh(new THREE.CircleGeometry(.22,48),track(new THREE.MeshBasicMaterial({color:0xbfe0ff,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),.22));disc.quaternion.copy(gantry.quaternion);eq.add(disc);
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(new Array(9).fill(0),3));const fan=new THREE.Mesh(fg,track(new THREE.MeshBasicMaterial({color:0x8fc4ff,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),.35));fan.frustumCulled=false;eq.add(fan);
 const mk=y=>{const w=V(c0.x,y,c0.z).applyQuaternion(q).add(pos);const r=new THREE.Mesh(new THREE.TorusGeometry(.2,.004,8,48),track(new THREE.MeshBasicMaterial({color:0xffd36b}),.9));r.position.copy(w);r.quaternion.copy(gantry.quaternion);eq.add(r);return w};
 const wb=mk(yb),wt=mk(yt);
 ctState={gantry,disc,fan,yb,yt,c0,q,pos,uA,vA,headW,lab:null};
 addLabel(wb.clone().sub(uA.clone().multiplyScalar(.26)),['بداية المسح (قاعدة الجمجمة)','Scan start (skull base)'],'#ffd36b');addLabel(wt.clone().add(uA.clone().multiplyScalar(.26)),['نهاية المسح (قمة الرأس)','Scan end (vertex)'],'#ffd36b');
 ctState.lab=wb.clone();addLabel(wb.clone().add(vA.clone().multiplyScalar(.5)),['الجهاز (Gantry): يدور 360°','Gantry: rotates 360°']);ctState.gl=labels[labels.length-1];
 state.entry=null;state.exit=null;fade=performance.now();fdone=false;camAnim={t0:performance.now(),from:cam.position.clone(),ft:ctl.target.clone(),to:crW.clone().add(V(1.5,.65,-1.7)),tt:crW.clone()}}
let fade=0,fdone=true;
function updCT(t){const s=ctState;if(!s)return;const p=(Math.sin(t/2600)+1)/2,y=s.yb+(s.yt-s.yb)*p;const c=V(s.c0.x,y,s.c0.z).applyQuaternion(s.q).add(s.pos);
 s.gantry.position.copy(c);s.disc.position.copy(c);const a=t/450,pt=(an,r)=>c.clone().add(s.uA.clone().multiplyScalar(Math.cos(an)*r)).add(s.vA.clone().multiplyScalar(Math.sin(an)*r));
 const S=pt(a,.34),P1=pt(a+Math.PI-.3,.34),P2=pt(a+Math.PI+.3,.34),pa=s.fan.geometry.attributes.position;pa.setXYZ(0,S.x,S.y,S.z);pa.setXYZ(1,P1.x,P1.y,P1.z);pa.setXYZ(2,P2.x,P2.y,P2.z);pa.needsUpdate=true;
 if(s.gl)s.gl.pos=c.clone().add(s.vA.clone().multiplyScalar(.55))}
// interaction
const ray=new THREE.Raycaster(),mp=new THREE.Vector2();let down=null;
function pickAt(ev){const r=cv.getBoundingClientRect();mp.set((ev.clientX-r.left)/r.width*2-1,-((ev.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mp,cam);const h=ray.intersectObjects(bodyMeshes().filter(m=>m.visible),false);return h.length?h[0].object:null}
cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
cv.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const o=pickAt(e);if(o)onPick(o)}down=null});
function onPick(o){const en=eng(o.userData.nm),la=NAMES[o.userData.nm]?NAMES[o.userData.nm][1]:'',ar=NAMES[o.userData.nm]?NAMES[o.userData.nm][2]:'';
 const hits=EXAMS.filter(x=>x.targets.some(t=>new RegExp(t).test(en)));const box=document.getElementById('pick');
 let h='<b>'+(lang()=='ar'&&ar?ar:en)+'</b>'+(la?' <i>'+la+'</i>':'')+'<div class="pl">';
 h+=hits.length?hits.map(x=>'<button data-id="'+x.id+'">'+bi(x.name)+'</button>').join(''):'<span>'+bi(['لا توجد فحوصات مضافة لهذه البنية بعد.','No exams added for this structure yet.'])+'</span>';
 box.innerHTML=h+'</div>';box.classList.add('on');box.querySelectorAll('button').forEach(b=>b.onclick=()=>chooseExam(b.dataset.id))}
// UI
let rf=null;
function renderList(){const R2=[];EXAMS.forEach(x=>{if(!R2.some(r=>r[0]==x.region[0]))R2.push(x.region)});
 const C=document.getElementById('rchips');C.innerHTML='<button data-r="" class="'+(rf?'':'on')+'">'+b('الكل','All')+'</button>'+R2.map(r=>'<button data-r="'+r[0]+'" class="'+(rf==r[0]?'on':'')+'">'+b(r[0],r[1])+'</button>').join('');
 C.querySelectorAll('button').forEach(bt=>bt.onclick=()=>{rf=bt.dataset.r||null;renderList()});
 const L=document.getElementById('exams');L.innerHTML=EXAMS.filter(x=>!rf||x.region[0]==rf).map(x=>'<button class="ex'+(cur&&cur.id==x.id?' on':'')+'" data-id="'+x.id+'"><small>'+(x.mod=='ct'?'CT':'X-ray')+' · '+bi(x.region)+'</small>'+bi(x.name)+'</button>').join('');L.querySelectorAll('button').forEach(bt=>bt.onclick=()=>chooseExam(bt.dataset.id))}
const BM={AP:['من الأمام إلى الخلف (AP)','Anterior to posterior (AP)'],PA:['من الخلف إلى الأمام (PA)','Posterior to anterior (PA)'],'R-L':['من اليمين إلى اليسار (جانبي)','Right to left (lateral)'],'L-R':['من اليسار إلى اليمين (جانبي)','Left to right (lateral)']};
const PS={erect:['واقف','Erect'],supine:['مستلقٍ على الظهر','Supine'],prone:['مستلقٍ على البطن','Prone'],'lat-L':['على الجانب الأيسر','Left lateral decubitus'],'lat-R':['على الجانب الأيمن','Right lateral decubitus']};
function sec(t,body){return '<div class="sec"><h5>'+b(t[0],t[1])+'</h5>'+body+'</div>'}
function ul(a){return '<ul>'+a.map(x=>'<li>'+b(x[0],x[1])+'</li>').join('')+'</ul>'}
function renderDetail(ex){const d=document.getElementById('detail');const ct=ex.type=='ct';
 const rows=[[['الوضعية','Position'],PS[ex.pose]],[['اتجاه الشعاع','Beam'],ct?['دوّار 360°','Rotating 360°']:BM[ex.beam]],[['المسافة SID','SID'],ct?['حسب الجهاز','Per scanner']:[Math.round(ex.sid*100)+' سم',Math.round(ex.sid*100)+' cm']],[['الكاسيت','Detector'],ct?['—','—']:[Math.round(ex.det[0]*100)+'×'+Math.round(ex.det[1]*100)+' سم',Math.round(ex.det[0]*100)+'×'+Math.round(ex.det[1]*100)+' cm']]];
 d.innerHTML='<h4>'+b(ex.name[0],ex.name[1])+'</h4><div class="draft">'+b('مسودة قيد المراجعة','Draft under review')+'</div><table class="kv">'+rows.map(r=>'<tr><th>'+b(r[0][0],r[0][1])+'</th><td>'+b(r[1][0],r[1][1])+'</td></tr>').join('')+'</table>'
 +sec(['خطوات التصوير','Imaging steps'],'<ol>'+ex.steps.map(x=>'<li>'+b(x[0],x[1])+'</li>').join('')+'</ol>')+sec(['مسار الشعاع: الدخول والخروج','Beam path: entry and exit'],'<p>'+b(ex.inout[0],ex.inout[1])+'</p>')
 +sec(['معايير التعريض (إرشادية)','Exposure factors (indicative)'],'<table class="kv"><tr><th>kVp</th><td>'+b(ex.exp.kv[0],ex.exp.kv[1])+'</td></tr><tr><th>mAs / mA</th><td>'+b(ex.exp.mas[0],ex.exp.mas[1])+'</td></tr><tr><th>'+b('مثال','Example')+'</th><td>'+b(ex.exp.ex[0],ex.exp.ex[1])+'</td></tr><tr><th>'+b('الشبكة / AEC','Grid / AEC')+'</th><td>'+b(ex.exp.grid[0]+' · '+ex.exp.aec[0],ex.exp.grid[1]+' · '+ex.exp.aec[1])+'</td></tr></table><p>'+b('القيم تقريبية وتختلف حسب الجهاز والمريض وحجمه. اتبع بروتوكول قسمك ومستويات الجرعة المرجعية المحلية.','Values are approximate and vary with the equipment and patient size. Follow your department protocol and local reference dose levels.')+'</p>')
 +sec(['الاستطباب','Indications'],'<p>'+b(ex.ind[0],ex.ind[1])+'</p>')+sec(['وضعية المريض','Patient position'],'<p>'+b(ex.pos[0],ex.pos[1])+'</p>')+sec(['الشعاع المركزي','Central ray'],'<p>'+b(ex.crt[0],ex.crt[1])+'</p>')+sec(['التنفس','Breathing'],'<p>'+b(ex.br[0],ex.br[1])+'</p>')
 +sec(['معايير قبول الصورة','Image acceptance criteria'],ul(ex.crit))+sec(['الأخطاء الشائعة','Common errors'],ul(ex.err))+sec(['نصائح','Tips'],'<p>'+b(ex.tips[0],ex.tips[1])+(ex.hideArms?' '+b('(الذراعان مخفيتان لوضوح المسار، وعادةً ترفعان عن مجال الشعاع.)','(Arms are hidden for clarity; they are normally raised out of the beam.)'):'')+'</p>')}
async function chooseExam(id){const ex=EXAMS.find(x=>x.id==id);if(!ex)return;cur=ex;renderList();renderDetail(ex);await showExam(ex)}
document.getElementById('reset').onclick=()=>{clearEq();cur=null;meshes.forEach(m=>{if(!m.userData.skip)m.visible=true});renderList();document.getElementById('detail').innerHTML='';bodyMeshes().forEach(m=>{m.material=m.userData.base;m.visible=true});anim={t0:performance.now(),dur:900,from:{q:patient.quaternion.clone(),p:patient.position.clone()},to:{q:new THREE.Quaternion(),p:V(0,0,0)},done:false,ex:null};camAnim={t0:performance.now(),from:cam.position.clone(),ft:ctl.target.clone(),to:V(2.6,1.2,2.4),tt:V(0,.9,0)}};
// loop
const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function frame(t){requestAnimationFrame(frame);
 if(anim&&!anim.done){dirty=true;const k=Math.min(1,(t-anim.t0)/anim.dur),e=ease(k);patient.quaternion.slerpQuaternions(anim.from.q,anim.to.q,e);patient.position.lerpVectors(anim.from.p,anim.to.p,e);if(k>=1){anim.done=true;patient.quaternion.copy(anim.to.q);patient.position.copy(anim.to.p);patient.updateMatrixWorld(true);if(anim.ex)build(anim.ex)}}
 if(camAnim){dirty=true;const k=Math.min(1,(t-camAnim.t0)/1300),e=ease(k);cam.position.lerpVectors(camAnim.from,camAnim.to,e);ctl.target.lerpVectors(camAnim.ft,camAnim.tt,e);if(k>=1)camAnim=null}
 let fd=false;if(eqMats.length&&!fdone){const f=Math.min(1,(t-fade)/600);eqMats.forEach(m=>m.opacity=m.userData.op*f);fd=true;if(f>=1)fdone=true}
 updCT(t);const mv=ctl.update(),cont=mv||dirty||ctState||camAnim||(anim&&!anim.done)||fd;if(!cont)return;dirty=false;window.__renders++;R.render(scene,cam);
 const w=stage.clientWidth,h=stage.clientHeight;labels.forEach(l=>{const p=l.pos.clone().project(cam);const vis=p.z<1&&Math.abs(p.x)<1.1&&Math.abs(p.y)<1.1;l.el.style.display=vis?'block':'none';l.el.style.left=((p.x+1)/2*w)+'px';l.el.style.top=((1-p.y)/2*h)+'px'})}
requestAnimationFrame(frame);
Promise.all([fetch('names.json').then(r=>r.json()),fetch('exams.json').then(r=>r.json())]).then(([n,e])=>{NAMES=n;EXAMS=e;renderList();loadLayer('skeleton').then(()=>loadLayer('skin'))});
new MutationObserver(()=>{renderList()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

const touchy=matchMedia('(pointer:coarse)').matches,lk=document.getElementById('lock');
function setLock(on){ctl.enabled=!on;cv.style.touchAction=on?'pan-y':'none';if(lk){lk.classList.toggle('open',!on);lk.innerHTML=on?'<span data-l="ar">حرّك الجسم</span><span data-l="en">Move the body</span>':'<span data-l="ar">تمرير الصفحة</span><span data-l="en">Scroll the page</span>'}dirty=true}
if(touchy){setLock(true);lk.onclick=()=>setLock(!ctl.enabled?false:true)}

window.__pos={chooseExam,state:()=>state,meshes,scene,cam,labels:()=>labels,EXAMS:()=>EXAMS};
