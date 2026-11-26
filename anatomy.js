import * as THREE from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {OrbitControls} from './OrbitControls.js';
const stage=document.getElementById('cvw'),cv=document.getElementById('cv');let dirty=true;window.__renders=0;
const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?1.5:2));
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(35,1,.02,30);cam.position.set(0,.95,3.0);
const ctl=new OrbitControls(cam,cv);ctl.target.set(0,.88,0);ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.minDistance=.12;ctl.maxDistance=5;ctl.screenSpacePanning=true;ctl.update();
ctl.addEventListener('change',()=>{dirty=true});
scene.add(new THREE.HemisphereLight(0xcfe2ff,0x0a1a40,1.15));
const d1=new THREE.DirectionalLight(0xffffff,1.9);d1.position.set(1.5,2.5,3);scene.add(d1);
const d2=new THREE.DirectionalLight(0x6aa8ff,1.4);d2.position.set(-2,1.5,-2.5);scene.add(d2);
function size(){const w=stage.clientWidth,h=stage.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();dirty=true}
addEventListener('resize',size);new ResizeObserver(size).observe(stage);size();
const LAY=[
 {k:'skeleton',ar:'العظام والغضاريف',en:'Bones & cartilage',c:0xe3ebf7,mb:3.5,on:1},
 {k:'muscles',ar:'العضلات',en:'Muscles',c:0xb5524f,op:.92,mb:6.5},
 {k:'vessels',ar:'الأوعية الدموية',en:'Blood vessels',c:0xff4d6d,mb:4},
 {k:'nerves',ar:'الأعصاب والدماغ',en:'Nerves & brain',c:0xe6c76a,mb:8.9},
 {k:'lymph',ar:'الجهاز اللمفاوي',en:'Lymphatic',c:0x4fd1b0,mb:1},
 {k:'viscera',ar:'الأحشاء',en:'Organs',c:0xd98b7a,mb:5.4}];
const REG=[
 ['الجسم كامل','Full body',[0,.88,0],3.0],['الرأس والرقبة','Head & neck',[0,1.55,.02],.85],['الصدر','Chest',[0,1.3,0],1.3],['البطن والحوض','Abdomen & pelvis',[0,.98,0],1.4],['الطرف العلوي','Upper limb',[.45,1.1,0],1.6],['الطرف السفلي','Lower limb',[.1,.45,0],2.0]];
let NAMES={};fetch('names.json').then(r=>r.json()).then(j=>{NAMES=j});
const groups={},loaded={},meshes=[];const loader=new GLTFLoader();
const gold=new THREE.MeshStandardMaterial({color:0xffd36b,emissive:0xffa800,emissiveIntensity:.55,roughness:.4});
const loadEl=document.getElementById('load');
function matFor(l,name){let c=l.c;if(l.k=='vessels'){const n=name.toLowerCase();c=/vein|venous|sinus|vena/.test(n)?0x3f8cff:/arter|aorta/.test(n)?0xff4d6d:0xe08a5a}
 return new THREE.MeshStandardMaterial({color:c,roughness:.55,metalness:.05,transparent:(l.op||1)<1,opacity:l.op||1,side:THREE.DoubleSide})}
function loadLayer(l){return new Promise(res=>{
 if(loaded[l.k]){res();return}
 loadEl.style.display='block';loadEl.textContent='… '+(document.documentElement.lang=='ar'?l.ar:l.en);
 loader.load(l.k+'.glb',g=>{const grp=new THREE.Group();grp.name=l.k;
  g.scene.traverse(o=>{if(o.isMesh){const nm=o.userData.name||o.name;o.userData.nm=nm;if(/\.g$/.test(nm)){o.visible=false}
   o.geometry.computeVertexNormals();o.userData.layer=l.k;o.userData.base=matFor(l,nm);o.material=o.userData.base;meshes.push(o)}});
  grp.add(g.scene);scene.add(grp);groups[l.k]=grp;loaded[l.k]=1;loadEl.style.display='none';dirty=true;res()},
  e=>{if(e.total)loadEl.textContent=(document.documentElement.lang=='ar'?l.ar:l.en)+' '+Math.round(e.loaded/e.total*100)+'%'},
  ()=>{loadEl.textContent='Load error';res()})})}
const P=document.getElementById('layers');
LAY.forEach(l=>{const lb=document.createElement('label');lb.className='lay';lb.innerHTML='<input type="checkbox"><i style="background:#'+l.c.toString(16).padStart(6,'0')+'"></i><span><span data-l="ar">'+l.ar+'</span><span data-l="en">'+l.en+'</span></span><small>'+l.mb+' MB</small>';
 const ck=lb.querySelector('input');ck.checked=!!l.on;ck.onchange=async()=>{if(ck.checked){await loadLayer(l)}if(groups[l.k])groups[l.k].visible=ck.checked;dirty=true};P.appendChild(lb)});
loadLayer(LAY[0]);
const RG=document.getElementById('regions');
REG.forEach(r=>{const b=document.createElement('button');b.innerHTML='<span data-l="ar">'+r[0]+'</span><span data-l="en">'+r[1]+'</span>';b.onclick=()=>fly(new THREE.Vector3(...r[2]),r[3]);RG.appendChild(b)});
let anim=null;
function fly(t,dist){const dir=cam.position.clone().sub(ctl.target).normalize();anim={t0:performance.now(),from:cam.position.clone(),ft:ctl.target.clone(),to:t.clone().add(dir.multiplyScalar(dist)),tt:t.clone()}}
const ray=new THREE.Raycaster(),mp=new THREE.Vector2();let sel=null;
function pick(ev){const r=cv.getBoundingClientRect();mp.set((ev.clientX-r.left)/r.width*2-1,-((ev.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mp,cam);
 const vis=meshes.filter(m=>m.visible&&groups[m.userData.layer]&&groups[m.userData.layer].visible);const h=ray.intersectObjects(vis,false);return h.length?h[0].object:null}
const lang=()=>document.documentElement.lang;
function label(n){const i=NAMES[n.userData.nm];if(!i)return n.userData.nm;return lang()=='ar'&&i[2]?i[2]:i[0]}
function select(o){dirty=true;if(sel)sel.material=sel.userData.base;sel=o;const box=document.getElementById('info');
 if(!o){box.classList.remove('on');return}
 o.material=gold;const i=NAMES[o.userData.nm]||[o.userData.nm.replace(/\.[a-z]$/,''),'','','',o.userData.layer];
 document.getElementById('iar').textContent=i[2]||'';document.getElementById('ien').textContent=i[0];document.getElementById('ila').textContent=i[1];
 const sd=i[3]=='L'?['يسار','Left']:i[3]=='R'?['يمين','Right']:null;const ly=LAY.find(l=>l.k==o.userData.layer);
 document.getElementById('imeta').innerHTML=(sd?'<span data-l="ar">'+sd[0]+'</span><span data-l="en">'+sd[1]+'</span> · ':'')+'<span data-l="ar">'+ly.ar+'</span><span data-l="en">'+ly.en+'</span>'+(i[2]?'':' · <span data-l="ar">الاسم العربي قيد الإضافة</span><span data-l="en">Arabic name pending</span>');
 box.classList.add('on')}
document.getElementById('x').onclick=()=>select(null);
let down=null;cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];anim=null});
cv.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6)select(pick(e));down=null});
const tip=document.getElementById('tip');let lt=0;
cv.addEventListener('pointermove',e=>{if(e.pointerType!='mouse'||e.buttons)return;const t=performance.now();if(t-lt<70)return;lt=t;const o=pick(e);
 if(o){tip.style.display='block';tip.textContent=label(o);const r=stage.getBoundingClientRect();tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top+14)+'px';cv.style.cursor='pointer'}else{tip.style.display='none';cv.style.cursor='grab'}});
cv.addEventListener('pointerleave',()=>tip.style.display='none');
// search
const q=document.getElementById('q'),sr=document.getElementById('sres');
q.oninput=()=>{const v=q.value.trim().toLowerCase();sr.innerHTML='';if(v.length<2)return;let c=0;const seen=new Set();
 for(const k in NAMES){const i=NAMES[k];if(((i[0]+' '+i[1]).toLowerCase().includes(v)||i[2].includes(v))&&!seen.has(i[0]+i[3])){seen.add(i[0]+i[3]);const d=document.createElement('div');d.textContent=(lang()=='ar'&&i[2]?i[2]:i[0])+(i[3]?' ('+i[3]+')':'')+'  ·  '+i[1];d.onclick=()=>goTo(k);sr.appendChild(d);if(++c>=8)break}}};
async function goTo(name){const i=NAMES[name];const l=LAY.find(x=>x.k==i[4]);sr.innerHTML='';q.value='';
 await loadLayer(l);groups[l.k].visible=true;P.querySelectorAll('input')[LAY.indexOf(l)].checked=true;
 const o=meshes.find(m=>m.userData.nm==name);if(!o)return;select(o);const b=new THREE.Box3().setFromObject(o),c=b.getCenter(new THREE.Vector3()),s=b.getSize(new THREE.Vector3()).length();fly(c,Math.max(.35,s*2.4))}
function frame(t){requestAnimationFrame(frame);
 if(anim){dirty=true;const k=Math.min(1,(t-anim.t0)/900),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cam.position.lerpVectors(anim.from,anim.to,e);ctl.target.lerpVectors(anim.ft,anim.tt,e);if(k>=1)anim=null}
 const mv=ctl.update();if(mv||dirty||anim){R.render(scene,cam);dirty=false;window.__renders++}}
requestAnimationFrame(frame);

const touchy=matchMedia('(pointer:coarse)').matches,lk=document.getElementById('lock');
function setLock(on){ctl.enabled=!on;cv.style.touchAction=on?'pan-y':'none';if(lk){lk.classList.toggle('open',!on);lk.innerHTML=on?'<span data-l="ar">حرّك الجسم</span><span data-l="en">Move the body</span>':'<span data-l="ar">تمرير الصفحة</span><span data-l="en">Scroll the page</span>'}dirty=true}
if(touchy){setLock(true);lk.onclick=()=>setLock(!ctl.enabled?false:true)}

window.__anat={scene,cam,ctl,meshes,loadLayer,LAY,select,NAMES:()=>NAMES};
