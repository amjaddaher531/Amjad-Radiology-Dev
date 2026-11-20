var CFG={phone:'+971 58 543 6940',wa:'https://wa.me/971585436940?text=Hello%20Amjad%20Radiology',ig:'https://instagram.com/amjaddaher2',li:'https://linkedin.com/in/amjaddaher2',fb:'https://www.facebook.com/share/1AdfPMabND/',botUrl:'https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/01/25/23/20250125230347-DC8S01WC.json',email:'amjaddaher68@gmail.com'};
function b(a,e){return '<span data-l="ar">'+a+'</span><span data-l="en">'+e+'</span>'}
var HDR="<header>\n<a class=\"logo\" href=\"index.html\" aria-label=\"Amjad Radiology\"><img src=\"logo.png\" alt=\"Amjad\"></a>\n<nav class=\"hn\"><a href=\"positions.html\" data-p=\"positions\"><span data-l=\"ar\">الوضعيات</span><span data-l=\"en\">Positioning</span></a><a href=\"anatomy.html\" data-p=\"anatomy\"><span data-l=\"ar\">التشريح</span><span data-l=\"en\">Anatomy</span></a><a href=\"diseases.html\" data-p=\"diseases\"><span data-l=\"ar\">الأمراض</span><span data-l=\"en\">Diseases</span></a><a href=\"doses.html\" data-p=\"doses\"><span data-l=\"ar\">الجرعات</span><span data-l=\"en\">Doses</span></a><a href=\"articles.html\" data-p=\"articles\"><span data-l=\"ar\">المقالات</span><span data-l=\"en\">Articles</span></a></nav>\n<div class=\"right\"><button class=\"lang\" id=\"lg\">English</button><a class=\"brand\" href=\"index.html\">Amjad Radiology</a></div>\n</header>",FTR="<footer><div class=\"wrap\">\n<div class=\"fgrid\">\n<div><h3>Amjad Radiology</h3><p><span data-l=\"ar\">مرجع عربي وإنجليزي لفنيي الأشعة. للأغراض التعليمية وليس للتشخيص.</span><span data-l=\"en\">An Arabic and English reference for radiographers. Educational use only, not for diagnosis.</span></p></div>\n<div><h3><span data-l=\"ar\">تواصل</span><span data-l=\"en\">Contact</span></h3><div class=\"fl\"><a id=\"ph\" href=\"#\" dir=\"ltr\">+971 00 000 0000</a><a href=\"mailto:amjaddaher68@gmail.com\">✉ amjaddaher68@gmail.com</a></div></div>\n<div><h3><span data-l=\"ar\">حساباتي</span><span data-l=\"en\">Follow</span></h3><div class=\"soc\"><a data-k=\"ig\" href=\"#\" target=\"_blank\" rel=\"noopener\">Instagram</a><a data-k=\"wa\" href=\"#\" target=\"_blank\" rel=\"noopener\">WhatsApp</a><a data-k=\"li\" href=\"#\" target=\"_blank\" rel=\"noopener\">LinkedIn</a><a data-k=\"fb\" href=\"#\" target=\"_blank\" rel=\"noopener\">Facebook</a></div></div>\n</div>\n<div class=\"copy\"><span>© 2026 Amjad Radiology</span><span><span data-l=\"ar\">إعداد وإشراف: أمجد ضاهر</span><span data-l=\"en\">Created and supervised by Amjad Daher</span></span></div>\n</div></footer><div class=\"pop\" id=\"pop\"><span data-l=\"ar\">مساعد Amjad Bot قيد الإعداد. سيجاوب من محتوى الموقع فقط.</span><span data-l=\"en\">Amjad Bot is being set up. It will answer from the site content only.</span></div><div class=\"fab\"><a class=\"wa\" id=\"wa\" href=\"#\" target=\"_blank\" rel=\"noopener\" aria-label=\"WhatsApp\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 20l1.3-4.2A8 8 0 1 1 8.4 19z\"/><path d=\"M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7c-1-.4-1.8-1.2-2.2-2.2l.7-1-1-2z\"/></svg><span>WhatsApp</span></a><button class=\"bot\" id=\"bot\" aria-label=\"Amjad Bot\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z\"/><path d=\"M19 16v4M17 18h4\"/></svg><span>Amjad Bot</span></button></div>";
document.body.insertAdjacentHTML('afterbegin','<canvas id="pt" aria-hidden="true"></canvas>'+HDR);
document.body.insertAdjacentHTML('beforeend',FTR);
var pg=document.body.dataset.page;document.querySelectorAll('.hn a').forEach(function(a){if(a.dataset.p==pg)a.classList.add('on')});
function setLang(l){document.documentElement.lang=l;document.documentElement.dir=l=='ar'?'rtl':'ltr';var g=document.getElementById('lg');if(g)g.textContent=l=='ar'?'English':'العربية';try{localStorage.setItem('lang',l)}catch(e){}}
(function(){var l='ar';try{l=localStorage.getItem('lang')||'ar'}catch(e){}setLang(l);document.getElementById('lg').onclick=function(){setLang(document.documentElement.lang=='ar'?'en':'ar')}})();
var wa=document.getElementById('wa');wa.href=CFG.wa||'https://wa.me/';
document.querySelectorAll('.soc a').forEach(function(a){var u=CFG[a.dataset.k];if(a.dataset.k=='wa')u=CFG.wa;if(u)a.href=u});
if(CFG.phone){var p=document.getElementById('ph');p.textContent=CFG.phone;p.href='tel:'+CFG.phone.replace(/\s/g,'')}
document.getElementById('bot').onclick=function(){if(CFG.botUrl)window.open(CFG.botUrl,'_blank');else document.getElementById('pop').classList.toggle('on')};
var cv=document.getElementById('pt'),cx=cv.getContext('2d'),W,H;
function rz(){W=cv.width=innerWidth;H=cv.height=innerHeight}rz();addEventListener('resize',rz);
var LITE=innerWidth<800||/^(anatomy|positions)$/.test(document.body.dataset.page||'');
function dots(t){cx.clearRect(0,0,W,H);var NR=LITE?2:3,NJ=LITE?5:9,SX=LITE?22:10,GM=LITE?2.1:1;
// gold flowing ribbons
for(var r=0;r<NR;r++){var by=H*(.40+.13*r),ph=r*2.1;
for(var j=0;j<NJ;j++){cx.beginPath();
for(var x=-10;x<=W+10;x+=SX){var spread=j*(2.2+1.6*Math.sin(x*.0032+ph+t*.00012)),
y=by+Math.sin(x*.0042+ph+t*.00028)*(46+r*10)+Math.sin(x*.011-t*.0002+ph)*14+spread;
if(x<=-10)cx.moveTo(x,y);else cx.lineTo(x,y)}
var g=cx.createLinearGradient(0,0,W,0),al=(.34-j*.028)*(r==1?1:.75);
g.addColorStop(0,'rgba(214,178,92,0)');g.addColorStop(.3,'rgba(214,178,92,'+al+')');g.addColorStop(.7,'rgba(230,196,110,'+al+')');g.addColorStop(1,'rgba(214,178,92,0)');
cx.strokeStyle=g;cx.lineWidth=j==0?1.6:1;cx.stroke()}}
// cyan dotted wave field
var rows=LITE?10:24,top=H*.36;
for(var k=0;k<rows;k++){var u=k/(rows-1),y0=top+Math.pow(u,1.55)*(H-top),amp=7+u*34,gap=(11+u*7)*GM,sz=1.1+u*1.5;
for(var x=0;x<W;x+=gap){var y=y0+Math.sin(x*.0055+k*.32+t*.00042)*amp+Math.sin(x*.013-t*.00031+k*.9)*amp*.38,
e=Math.sin(Math.PI*Math.min(1,Math.max(0,x/W))),a=(.42+.58*u)*(.45+.55*e)*(.7+.3*Math.sin(x*.05+k+t*.0012));
cx.fillStyle=((x/gap+k)%9<1)?'rgba(222,190,110,'+a+')':'rgba(125,215,255,'+a+')';
cx.fillRect(x,y,sz,sz)}}}
var lastT=0;function pf(t){if(t-lastT>(LITE?100:0)){lastT=t;dots(t)}if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&innerWidth>=800)requestAnimationFrame(pf)}requestAnimationFrame(pf);addEventListener('resize',function(){if(innerWidth<800)dots(0)});
function lst(c,bd,A){var i=0,C=document.getElementById(c),B=document.getElementById(bd);
function dr(){C.innerHTML=A.map(function(x,k){return '<button data-i="'+k+'" class="'+(k==i?'on':'')+'">'+b(x[0],x[1])+'</button>'}).join('');var x=A[i];B.innerHTML='<div class="box"><h3>'+b(x[0],x[1])+'</h3><ul>'+x[2].map(function(t){return '<li>'+b(t[0],t[1])+'</li>'}).join('')+'</ul></div>'}
C.onclick=function(e){var t=e.target.closest('button');if(t){i=+t.dataset.i;dr()}};dr()}
