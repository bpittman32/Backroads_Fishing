// Realistic aquatic plants for Backroads Fishing — prototype.
// Each plant is drawn once into a sprite (base at bottom centre, grows up), then drawn bent each frame for sway.
(function(){
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixc=(a,b,t,al=1)=>{const A=hex(a),B=hex(b);return`rgba(${A.map((v,i)=>Math.round(lerp(v,B[i],t))).join(',')},${al})`;};
// a stem path from base (0,0) upward: returns points [x,y] with t 0..1
function stemPts(len,lean,wave,ph,n=24,x0=0){const p=[];for(let i=0;i<=n;i++){const t=i/n;p.push([x0+lean*len*t*t+Math.sin(t*3.2+ph)*wave*t,-len*t]);}return p;}
const at=(p,t)=>{const f=t*(p.length-1),i=Math.min(p.length-2,Math.floor(f)),u=f-i;return[lerp(p[i][0],p[i+1][0],u),lerp(p[i][1],p[i+1][1],u)];};
const dirAt=(p,t)=>{const a=at(p,Math.max(0,t-.02)),b=at(p,Math.min(1,t+.02));const l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return[(b[0]-a[0])/l,(b[1]-a[1])/l];};
function strokePts(c,p,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(...p[0]);for(const q of p)c.lineTo(...q);c.stroke();}
// tapered stroke along points
function taper(c,p,w0,w1,col){c.fillStyle=col;const L=[],R=[];for(let i=0;i<p.length;i++){const t=i/(p.length-1),d=dirAt(p,t),w=lerp(w0,w1,t)/2;L.push([p[i][0]-d[1]*w,p[i][1]+d[0]*w]);R.push([p[i][0]+d[1]*w,p[i][1]-d[0]*w]);}
  c.beginPath();c.moveTo(...L[0]);for(const q of L)c.lineTo(...q);for(let i=R.length-1;i>=0;i--)c.lineTo(...R[i]);c.closePath();c.fill();}
// a leaf (lance/oval) at (x,y), angle a, length l, width w; colours top->tip
function leaf(c,x,y,a,l,w,col,vein,curl=0){c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(0,0);
  c.bezierCurveTo(l*.25,-w*.9+curl*l*.1,l*.7,-w*.8+curl*l*.25,l,curl*l*.3);c.bezierCurveTo(l*.7,w*.8+curl*l*.25,l*.25,w*.9+curl*l*.1,0,0);c.closePath();
  c.fillStyle=col;c.fill();if(vein){c.strokeStyle=vein;c.lineWidth=Math.max(.4,w*.12);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(l*.5,curl*l*.15,l*.96,curl*l*.29);c.stroke();}c.restore();}

// ---------- plant painters: (c, H, seed) draw with base at (0,0) ----------
const P={};
// Tape grass / wild celery (Vallisneria americana): long translucent ribbons from a basal rosette, tips trail over near the surface
P.tapegrass=(c,H,seed)=>{const r=rng(seed),n=11+Math.floor(r()*8);
  for(let k=0;k<n;k++){const len=H*(.35+.65*r()),lean=(r()-.5)*.55,w=H*(.024+.014*r()),ph=r()*6,tw=2+r()*3,tp=r()*6;
    const p=stemPts(len,lean,H*.03,ph,40,(r()-.5)*H*.12);if(len>H*.85){for(let i=30;i<=40;i++){const u=(i-30)/10;p[i][0]+=Math.sign(lean||1)*u*u*H*.12;p[i][1]+=u*u*H*.05;}}
    const Lp=[],Rp=[],shade=[];for(let i=0;i<p.length;i++){const t=i/(p.length-1),d=dirAt(p,t),tws=Math.abs(Math.cos(t*tw+tp)),ww=w*(1-.25*t)*(t>.96?(1-t)/.04*.8+.2:1)*(.22+.78*tws)/2;
      Lp.push([p[i][0]-d[1]*ww,p[i][1]+d[0]*ww]);Rp.push([p[i][0]+d[1]*ww,p[i][1]-d[0]*ww]);shade.push(tws);}
    const g=c.createLinearGradient(0,0,0,-len);g.addColorStop(0,'rgba(58,78,34,.95)');g.addColorStop(.35,'rgba(86,122,48,.9)');g.addColorStop(.8,'rgba(128,160,66,.85)');g.addColorStop(1,'rgba(156,180,84,.8)');
    c.fillStyle=g;c.beginPath();c.moveTo(...Lp[0]);for(const q of Lp)c.lineTo(...q);for(let i=Rp.length-1;i>=0;i--)c.lineTo(...Rp[i]);c.closePath();c.fill();
    // darker where the ribbon twists edge-on, light midline and fine veins
    for(let i=1;i<p.length;i++)if(shade[i]<.45){c.strokeStyle=`rgba(30,44,20,${(.45-shade[i])*.9})`;c.lineWidth=w*.35;c.beginPath();c.moveTo(...p[i-1]);c.lineTo(...p[i]);c.stroke();}
    strokePts(c,p,Math.max(.4,w*.12),'rgba(210,230,150,.35)');
    c.strokeStyle='rgba(40,60,26,.35)';c.lineWidth=Math.max(.3,w*.05);c.beginPath();c.moveTo(...Lp[0]);for(const q of Lp)c.lineTo(...q);c.stroke();
    // a little silt and algae on the older lower blade
    c.fillStyle='rgba(110,96,60,.25)';for(let i=0;i<6;i++){const q=at(p,r()*.3);c.beginPath();c.arc(q[0]+(r()-.5)*w*.6,q[1],w*(.15+.2*r()),0,TAU);c.fill();}}};
// Coontail (Ceratophyllum demersum): stiff whorls of forked needle leaves, crowding into a bushy "raccoon tail" at the tip
P.coontail=(c,H,seed)=>{const r=rng(seed),stems=3+Math.floor(r()*3);
  for(let s=0;s<stems;s++){const len=H*(.45+.55*r()),p=stemPts(len,(r()-.5)*.6,H*.05,r()*6,30,(r()-.5)*H*.16);strokePts(c,p,Math.max(.6,H*.008),'rgba(60,70,36,.9)');
    let t=.04;while(t<1){const q=at(p,t),d=dirAt(p,t),crowd=t>.7?(t-.7)/.3:0,l=H*lerp(.12,.085,t)*(1-crowd*.25),N=10;
      const col=mixc('#34502a','#6a8c3c',t*.9,.9);c.strokeStyle=col;c.lineWidth=Math.max(.5,H*.0042);c.lineCap='round';c.beginPath();
      for(let k=0;k<N;k++){const a=k/N*TAU+t*7,ux=Math.cos(a),side=ux*(.55+.45*Math.abs(Math.sin(a))),up=-.35-crowd*.4;
        const ex=q[0]+side*l,ey=q[1]+up*l+Math.sin(a)*l*.25,mx=q[0]+side*l*.55,my=q[1]+up*l*.4;
        c.moveTo(q[0],q[1]);c.lineTo(mx,my);c.lineTo(ex,ey);c.moveTo(mx,my);c.lineTo(ex+side*l*.15,ey-l*.25);}
      c.stroke();t+=lerp(.045,.018,crowd)+r()*.01;}}};
// Eurasian / northern milfoil (Myriophyllum): whorls of 4 feather-like leaves, reddish growing tips
P.milfoil=(c,H,seed)=>{const r=rng(seed),stems=3+Math.floor(r()*3);
  for(let s=0;s<stems;s++){const len=H*(.45+.55*r()),p=stemPts(len,(r()-.5)*.55,H*.06,r()*6,30,(r()-.5)*H*.16);
    const sg=c.createLinearGradient(0,0,0,-len);sg.addColorStop(0,'rgba(90,70,40,.9)');sg.addColorStop(.7,'rgba(110,80,46,.9)');sg.addColorStop(1,'rgba(160,70,50,.9)');strokePts(c,p,Math.max(.6,H*.007),sg);
    for(let t=.05;t<1;t+=.038+r()*.01){const q=at(p,t),l=H*lerp(.11,.06,t),tipred=cl((t-.86)/.14,0,1)*.7;
      const col=tipred>0?mixc('#62803a','#9a5a40',tipred,.85):mixc('#3e5a2a','#76963e',t,.82);c.strokeStyle=col;c.lineWidth=Math.max(.35,H*.0028);c.beginPath();
      for(let k=0;k<4;k++){const a=k*Math.PI/2+t*3,side=Math.cos(a),dep=Math.sin(a)*.3,ex=q[0]+side*l*.9,ey=q[1]+l*.45*Math.abs(side)+dep*l*.2+l*.1;
        c.moveTo(q[0],q[1]);c.quadraticCurveTo(q[0]+side*l*.55,q[1]-l*.18,ex,ey);
        for(let j=1;j<=10;j++){const u=j/11,bx=(1-u)*(1-u)*q[0]+2*(1-u)*u*(q[0]+side*l*.55)+u*u*ex,by=(1-u)*(1-u)*q[1]+2*(1-u)*u*(q[1]-l*.18)+u*u*ey,fl=l*.24*(1-u*.6);c.moveTo(bx,by);c.lineTo(bx+side*fl*.25,by-fl*.8);c.moveTo(bx,by);c.lineTo(bx+side*fl*.3,by+fl*.7);}}
      c.stroke();}}};
// Large-leaf pondweed / "cabbage" (Potamogeton amplifolius): broad arched leaves with wavy edges on a stout stem
P.cabbage=(c,H,seed)=>{const r=rng(seed),stems=1+Math.floor(r()*2);
  for(let s=0;s<stems;s++){const len=H*(.6+.4*r()),p=stemPts(len,(r()-.5)*.3,H*.04,r()*6,30);strokePts(c,p,Math.max(.8,H*.011),'rgba(96,88,44,.95)');
    let side=r()<.5?1:-1;for(let t=.12;t<1;t+=.09+r()*.03){const q=at(p,t),l=H*lerp(.17,.11,t),w=l*.36,a=side>0?-.5-r()*.4:Math.PI+.5+r()*.4,
      col=mixc('#4a5a26','#86a046',t*.8+r()*.1,.88);c.save();c.translate(q[0],q[1]);c.rotate(a);
      // arched, wavy-edged blade with parallel veins
      c.beginPath();c.moveTo(0,0);const N=10;for(let i=1;i<=N;i++){const u=i/N,x=l*u,y=-w*Math.sin(Math.PI*Math.pow(u,.8))+Math.sin(u*14)*w*.06+l*.18*u*u;c.lineTo(x,y);}
      for(let i=N;i>=0;i--){const u=i/N,x=l*u,y=w*Math.sin(Math.PI*Math.pow(u,.8))*.85+Math.sin(u*14+1)*w*.06+l*.18*u*u;c.lineTo(x,y);}c.closePath();
      const g=c.createLinearGradient(0,-w,0,w);g.addColorStop(0,col);g.addColorStop(1,mixc('#3a4620','#6a7a36',t,.9));c.fillStyle=g;c.fill();
      c.strokeStyle='rgba(220,230,160,.3)';c.lineWidth=Math.max(.3,w*.06);c.beginPath();for(const v of[-.45,0,.45]){c.moveTo(0,0);c.quadraticCurveTo(l*.5,v*w*.8+l*.06,l*.98,l*.17);}c.stroke();
      c.strokeStyle='rgba(30,36,14,.35)';c.lineWidth=Math.max(.3,w*.05);c.stroke();c.restore();side=-side;}
    // the newest leaf folded at the tip
    const q=at(p,1);leaf(c,q[0],q[1],-Math.PI/2+(r()-.5)*.5,H*.07,H*.018,'rgba(120,140,60,.9)','rgba(220,230,160,.4)');}};
// Elodea / waterweed: crowded whorls of three small bright leaves
P.elodea=(c,H,seed)=>{const r=rng(seed),stems=6+Math.floor(r()*4);
  for(let s=0;s<stems;s++){const len=H*(.3+.6*r()),p=stemPts(len,(r()-.5)*.8,H*.05,r()*6,24,(r()-.5)*H*.18);strokePts(c,p,Math.max(.5,H*.005),'rgba(70,96,40,.9)');
    for(let t=.04;t<1;t+=.028){const q=at(p,t),l=H*lerp(.05,.034,t);for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*1.1+Math.sin(t*20)*.2+(k===1?(r()-.5)*.6:0);
      leaf(c,q[0],q[1],a,l,l*.28,mixc('#36602a','#7aae4a',t*.8+r()*.2,.9),null,.15);}}}};
// Muskgrass / chara: a low gray-green meadow of whorled branchlets on the bottom
P.chara=(c,H,seed)=>{const r=rng(seed),n=26+Math.floor(r()*10),W=H*1.5;
  for(let s=0;s<n;s++){const x0=(r()-.5)*W*(.4+.6*r()),len=H*(.35+.6*r()),p=stemPts(len,(r()-.5)*.5,H*.02,r()*6,12).map(q=>[q[0]+x0,q[1]]);strokePts(c,p,Math.max(.4,H*.006),'rgba(96,120,80,.85)');
    for(let t=.12;t<1;t+=.11){const q=at(p,t),l=H*.08*(1-t*.4);c.strokeStyle=mixc('#5a7a4a','#9ab47e',t,.82);c.lineWidth=Math.max(.35,H*.004);c.beginPath();
      for(let k=0;k<7;k++){const a=-Math.PI/2+(k/6-.5)*2.6;c.moveTo(q[0],q[1]);c.quadraticCurveTo(q[0]+Math.cos(a)*l*.5,q[1]+Math.sin(a)*l*.5-l*.1,q[0]+Math.cos(a)*l,q[1]+Math.sin(a)*l*.7);}c.stroke();}}};
// White water lily (Nymphaea odorata): long red-brown stalks from a rhizome up to floating pads (pads/flowers drawn at the surface separately)
P.lilystems=(c,H,seed,targets)=>{const r=rng(seed);c.fillStyle='rgba(80,64,40,.95)';c.beginPath();c.ellipse(0,-H*.01,H*.07,H*.022,0,0,TAU);c.fill();
  for(const tx of targets){const x0=(r()-.5)*H*.08,bow=(r()-.5)*H*.12,p=[];for(let i=0;i<=24;i++){const t=i/24;p.push([lerp(x0,tx,t*t*(3-2*t))+Math.sin(t*Math.PI)*bow,-H*t]);}
    strokePts(c,p,Math.max(.8,H*.009),'rgba(120,70,46,.85)');strokePts(c,p,Math.max(.3,H*.003),'rgba(220,170,140,.3)');}
  // a few submerged young leaves still unrolling
  for(let i=0;i<2;i++){const q=[(r()-.5)*H*.1,-H*(.1+r()*.15)];leaf(c,q[0],q[1],-Math.PI/2+(r()-.5),H*.06,H*.03,'rgba(120,80,60,.8)',null,.4);}};
// Water hyacinth (bayou, Amazon, Congo): floats; drawn with waterline at (0,0): glossy leaves and swollen stalks above, dark feathery roots hanging below
P.hyacinth=(c,H,seed)=>{const r=rng(seed),RL=H*.42;
  // roots
  for(let k=0;k<22;k++){const x0=(r()-.5)*H*.2,len=RL*(.35+.5*r()),bw=(r()-.5)*H*.08,p=[];for(let i=0;i<=14;i++){const t=i/14;p.push([x0+Math.sin(t*Math.PI)*bw+Math.sin(t*6+k)*H*.006,H*.01+len*t]);}
    strokePts(c,p,Math.max(.6,H*.008),'rgba(48,28,40,.85)');c.strokeStyle='rgba(70,40,60,.55)';c.lineWidth=Math.max(.3,H*.0025);c.beginPath();
    for(let i=2;i<14;i+=1){const q=p[i],l=H*.03*(1-i/16);c.moveTo(q[0],q[1]);c.lineTo(q[0]-l,q[1]+l*.6);c.moveTo(q[0],q[1]);c.lineTo(q[0]+l,q[1]+l*.6);}c.stroke();}
  // swollen spongy leaf stalks and upright, glossy, broadly oval leaves
  const N=7+Math.floor(r()*3);for(let k=0;k<N;k++){const a=(k/(N-1)-.5)*1.9+(r()-.5)*.25,sx=Math.sin(a)*H*.04,bx=Math.sin(a)*H*.10,by=-H*(.07+.03*r()),tx=Math.sin(a)*H*.15,ty=-H*(.17+.10*r()*Math.cos(a));
    let g=c.createRadialGradient(bx-H*.01,by-H*.012,0,bx,by,H*.04);g.addColorStop(0,'rgba(170,200,100,1)');g.addColorStop(1,'rgba(90,130,50,1)');c.fillStyle=g;c.beginPath();c.ellipse(bx,by,H*.026,H*.038,a*.5,0,TAU);c.fill();
    c.strokeStyle='rgba(100,140,56,1)';c.lineWidth=Math.max(.8,H*.012);c.beginPath();c.moveTo(sx,-H*.005);c.quadraticCurveTo(bx*.6,by*.4,bx,by);c.quadraticCurveTo(lerp(bx,tx,.5),lerp(by,ty,.5)-H*.02,tx,ty);c.stroke();
    c.save();c.translate(tx,ty);c.rotate(a*.55+(r()-.5)*.2);const lw=H*(.085+.03*r()),lh=H*(.12+.03*r()),turn=.45+.55*r();
    g=c.createLinearGradient(-lw*turn,0,lw*turn,0);g.addColorStop(0,'rgba(44,96,34,1)');g.addColorStop(.45,'rgba(96,150,56,1)');g.addColorStop(1,'rgba(52,104,38,1)');c.fillStyle=g;
    c.beginPath();c.moveTo(0,0);c.bezierCurveTo(lw*turn,-lh*.1,lw*turn*1.05,-lh*.9,0,-lh);c.bezierCurveTo(-lw*turn*1.05,-lh*.9,-lw*turn,-lh*.1,0,0);c.closePath();c.fill();
    c.strokeStyle='rgba(30,60,24,.5)';c.lineWidth=Math.max(.3,H*.002);c.stroke();
    c.strokeStyle='rgba(200,230,150,.35)';c.lineWidth=Math.max(.25,H*.0018);c.beginPath();for(const v of[-.6,-.25,.25,.6]){c.moveTo(0,-lh*.05);c.quadraticCurveTo(v*lw*turn,-lh*.5,v*lw*turn*.3,-lh*.95);}c.stroke();
    c.fillStyle='rgba(255,255,235,.38)';c.beginPath();c.ellipse(-lw*turn*.35,-lh*.62,lw*turn*.18,lh*.22,-.3,0,TAU);c.fill();c.restore();}
  // a lavender flower spike
  if(r()<.7){const fx=(r()-.5)*H*.06,fy=-H*.34;c.strokeStyle='rgba(90,130,50,1)';c.lineWidth=Math.max(.6,H*.008);c.beginPath();c.moveTo(fx,-H*.05);c.lineTo(fx,fy);c.stroke();
    for(let i=0;i<9;i++){const q=[fx+(r()-.5)*H*.06,fy-H*.02-i*H*.016];c.fillStyle=i%3?'rgba(178,150,220,.95)':'rgba(150,120,205,.95)';c.beginPath();c.ellipse(q[0],q[1],H*.024,H*.016,(r()-.5),0,TAU);c.fill();
      if(i%2===0){c.fillStyle='rgba(60,50,140,.9)';c.beginPath();c.arc(q[0],q[1]-H*.004,H*.006,0,TAU);c.fill();c.fillStyle='rgba(250,210,60,.95)';c.beginPath();c.arc(q[0],q[1]-H*.004,H*.0025,0,TAU);c.fill();}}}};
// Lily pad at the surface, seen from a low angle: an ellipse with the V notch, a glossy top, purple-red edge; optional white flower
function lilyPad(c,x,y,R,ang,flower){c.save();c.translate(x,y);const sy=.28;
  c.fillStyle='rgba(20,40,20,.25)';c.beginPath();c.ellipse(0,R*sy*.35,R*1.02,R*sy*1.05,0,0,TAU);c.fill();
  c.beginPath();const n=ang;c.moveTo(0,0);c.ellipse(0,0,R,R*sy,0,n+.18,n+TAU-.18);c.closePath();
  const g=c.createLinearGradient(0,-R*sy,0,R*sy);g.addColorStop(0,'#7aa648');g.addColorStop(1,'#3e6a2a');c.fillStyle=g;c.fill();
  c.strokeStyle='rgba(140,50,50,.6)';c.lineWidth=Math.max(.5,R*.04);c.stroke();
  c.strokeStyle='rgba(200,230,150,.35)';c.lineWidth=Math.max(.3,R*.015);c.beginPath();for(let k=1;k<10;k++){const a=n+.18+k/10*(TAU-.36);c.moveTo(0,0);c.lineTo(Math.cos(a)*R*.9,Math.sin(a)*R*sy*.9);}c.stroke();
  c.fillStyle='rgba(255,255,240,.25)';c.beginPath();c.ellipse(-R*.3,-R*sy*.3,R*.35,R*sy*.25,0,0,TAU);c.fill();
  if(flower){const fx=R*.25,fy=-R*sy*.4;for(let ring=0;ring<3;ring++){const k=8,rr=R*(.42-ring*.11);for(let i=0;i<k;i++){const a=i/k*TAU+ring*.4,px=fx+Math.cos(a)*rr*.5,py=fy+Math.sin(a)*rr*.18-ring*R*.07;
      c.fillStyle=ring===2?'rgba(255,255,255,1)':'rgba(240,236,232,1)';c.beginPath();c.ellipse(px,py-rr*.25,rr*.16,rr*.42,Math.cos(a)*.6,0,TAU);c.fill();c.strokeStyle='rgba(200,180,200,.5)';c.lineWidth=.5;c.stroke();}}
    c.fillStyle='#f2c838';c.beginPath();c.ellipse(fx,fy-R*.22,R*.09,R*.05,0,0,TAU);c.fill();}
  c.restore();}

// ---------- set 2: shore plants, creek, bayou, river, alpine, Amazon, Gulf, Congo ----------
// strap leaf: flat ribbon from base along points with twist shading
function strap(c,p,w,cols,tipRound){const Lp=[],Rp=[],sh=[];for(let i=0;i<p.length;i++){const t=i/(p.length-1),d=dirAt(p,t),tw=.35+.65*Math.abs(Math.cos(t*2.2+w*7)),
  ww=w*(1-.3*t)*(t>.93?(tipRound?Math.sqrt(Math.max(0,(1-t)/.07)):(1-t)/.07):1)*tw/2;Lp.push([p[i][0]-d[1]*ww,p[i][1]+d[0]*ww]);Rp.push([p[i][0]+d[1]*ww,p[i][1]-d[0]*ww]);sh.push(tw);}
  const y0=p[0][1],y1=p[p.length-1][1],g=c.createLinearGradient(0,y0,0,y1);cols.forEach(([o,cc])=>g.addColorStop(o,cc));c.fillStyle=g;
  c.beginPath();c.moveTo(...Lp[0]);for(const q of Lp)c.lineTo(...q);for(let i=Rp.length-1;i>=0;i--)c.lineTo(...Rp[i]);c.closePath();c.fill();
  for(let i=1;i<p.length;i++)if(sh[i]<.55){c.strokeStyle=`rgba(20,30,14,${(.55-sh[i])*.7})`;c.lineWidth=w*.3;c.beginPath();c.moveTo(...p[i-1]);c.lineTo(...p[i]);c.stroke();}
  strokePts(c,p,Math.max(.3,w*.1),'rgba(230,240,190,.25)');return{Lp,Rp};}
// Cattail (shore): flat blue-green leaves taller than the brown cigar-shaped heads
P.cattail=(c,H,seed)=>{const r=rng(seed),n=14+Math.floor(r()*6);
  for(let k=0;k<n;k++){const len=H*(.7+.3*r()),p=stemPts(len,(r()-.5)*.35,H*.02,r()*6,30,(r()-.5)*H*.18);if(r()<.4)for(let i=22;i<=30;i++){const u=(i-22)/8;p[i][0]+=u*u*H*.12*(p[30][0]>0?1:-1);p[i][1]+=u*u*H*.06;}
    strap(c,p,H*(.03+.012*r()),[[0,'rgba(90,96,60,.95)'],[.3,'rgba(96,128,70,.95)'],[1,'rgba(140,164,96,.9)']]);}
  for(let k=0;k<2+Math.floor(r()*3);k++){const len=H*(.7+.16*r()),x0=(r()-.5)*H*.14,p=stemPts(len,(r()-.5)*.12,H*.01,r()*6,20,x0);strokePts(c,p,Math.max(.8,H*.008),'rgba(110,128,70,1)');
    const q=at(p,.86),e=at(p,1),hl=H*.13,hw=H*.028;c.save();c.translate(q[0],q[1]);const g=c.createLinearGradient(-hw,0,hw,0);g.addColorStop(0,'#3a2412');g.addColorStop(.4,'#7a4e2a');g.addColorStop(1,'#3a2412');c.fillStyle=g;
    c.beginPath();c.ellipse(0,0,hw,hl/2,0,0,TAU);c.fill();c.restore();strokePts(c,[[q[0],q[1]-hl/2],[e[0],e[1]-H*.06]],Math.max(.5,H*.004),'rgba(150,130,90,1)');}};
// Hardstem bulrush (lake shore): many round dark-green stems, brown spikelet clusters near the tip
P.bulrush=(c,H,seed)=>{const r=rng(seed),n=18+Math.floor(r()*10);
  for(let k=0;k<n;k++){const len=H*(.55+.45*r()),p=stemPts(len,(r()-.5)*.3,H*.015,r()*6,20,(r()-.5)*H*.2);taper(c,p,Math.max(1,H*.012),Math.max(.3,H*.002),mixc('#2e4426','#5a7a3c',r()*.6,.95));
    strokePts(c,p.slice(0,18),Math.max(.3,H*.003),'rgba(200,220,160,.22)');
    if(r()<.45){const q=at(p,.86);c.fillStyle='rgba(110,70,36,.95)';for(let j=0;j<4;j++){c.beginPath();c.ellipse(q[0]+H*.012+j*H*.004,q[1]+j*H*.012,H*.007,H*.013,.4,0,TAU);c.fill();}}}};
// Water crowfoot (creek): stems streaming in the current with tufts of hair-fine leaves; white buttercup flowers at the surface
P.crowfoot=(c,H,seed,extra)=>{const r=rng(seed),n=3+Math.floor(r()*3);
  for(let k=0;k<n;k++){const len=H*(.6+.4*r()),p=stemPts(len,.18+r()*.25,H*.04,r()*6,26,(r()-.5)*H*.1);strokePts(c,p,Math.max(.5,H*.005),'rgba(70,96,46,.9)');
    for(let t=.1;t<1;t+=.08){const q=at(p,t),d=dirAt(p,t),l=H*.08;c.strokeStyle=mixc('#3a6a30','#7aa858',t,.75);c.lineWidth=Math.max(.3,H*.0022);c.beginPath();
      for(let j=0;j<12;j++){const a=Math.atan2(d[1],d[0])+(r()-.5)*1.6,ll=l*(.5+.5*r());c.moveTo(q[0],q[1]);c.quadraticCurveTo(q[0]+Math.cos(a)*ll*.5,q[1]+Math.sin(a)*ll*.5,q[0]+Math.cos(a)*ll+ll*.3,q[1]+Math.sin(a)*ll*.6);}c.stroke();}
    if(extra&&r()<.8){const e=at(p,1);for(let f=0;f<5;f++){const a=f/5*TAU;c.fillStyle='rgba(250,250,245,.98)';c.beginPath();c.ellipse(e[0]+Math.cos(a)*H*.016,e[1]+Math.sin(a)*H*.007,H*.013,H*.008,a,0,TAU);c.fill();}
      c.fillStyle='#f0c830';c.beginPath();c.arc(e[0],e[1],H*.007,0,TAU);c.fill();}}};
// Water moss (Fontinalis) on creek rocks: dark trailing strands clothed in tiny overlapping leaves
P.watermoss=(c,H,seed)=>{const r=rng(seed),n=26+Math.floor(r()*10);
  for(let k=0;k<n;k++){const x0=(r()-.5)*H*.9,y0=-Math.cos(x0/(H*.5))*H*.06,len=H*(.3+.5*r()),p=[];for(let i=0;i<=16;i++){const t=i/16;p.push([x0+len*t,y0-H*.04*Math.sin(t*Math.PI)*r()+len*.55*t*t]);}
    strokePts(c,p,Math.max(1,H*.026*(1-r()*.3)),mixc('#1c2c16','#3a5226',r(),.88));c.strokeStyle='rgba(96,126,64,.5)';c.lineWidth=Math.max(.3,H*.005);c.beginPath();
    for(let i=1;i<16;i++){const q=p[i],l=H*.018;c.moveTo(q[0]-l*.4,q[1]-l*.35);c.lineTo(q[0]+l*.35,q[1]+l*.15);}c.stroke();}};
// Watercress at the creek edge: sprawling stems, round leaflets, little white flower clusters
P.watercress=(c,H,seed)=>{const r=rng(seed),n=6+Math.floor(r()*4);
  for(let k=0;k<n;k++){const len=H*(.4+.5*r()),p=stemPts(len,(r()-.5)*1.4,H*.04,r()*6,16,(r()-.5)*H*.5);strokePts(c,p,Math.max(.6,H*.009),'rgba(110,150,70,.95)');
    for(let t=.2;t<1;t+=.18){const q=at(p,t),side=r()<.5?-1:1;for(let j=0;j<5;j++){const u=j/4,lx=q[0]+side*H*(.03+u*.07),ly=q[1]-H*(.01+u*.02);
      c.fillStyle=mixc('#2f6a2a','#6aa64a',r(),.95);c.beginPath();c.ellipse(lx,ly,H*(j===4?.03:.022),H*(j===4?.026:.018),0,0,TAU);c.fill();}}
    if(r()<.5){const e=at(p,1);c.fillStyle='rgba(255,255,250,.95)';for(let j=0;j<6;j++){c.beginPath();c.arc(e[0]+(r()-.5)*H*.04,e[1]-H*.02-r()*H*.03,H*.007,0,TAU);c.fill();}}}};
// Hydrilla (bayou): dense branching stems with whorls of small toothed leaves, matting out at the top
P.hydrilla=(c,H,seed)=>{const r=rng(seed),n=5+Math.floor(r()*4);
  for(let k=0;k<n;k++){const len=H*(.55+.45*r()),p=stemPts(len,(r()-.5)*.6,H*.05,r()*6,24,(r()-.5)*H*.2);if(len>H*.8){for(let i=18;i<=24;i++){const u=(i-18)/6;p[i][0]+=u*u*H*.25*(k%2?1:-1);p[i][1]+=u*u*H*.12;}}
    strokePts(c,p,Math.max(.5,H*.005),'rgba(70,90,40,.9)');
    for(let t=.04;t<1;t+=.03){const q=at(p,t),l=H*.028;for(let j=0;j<5;j++){const a=j/5*TAU+t*9;leaf(c,q[0],q[1],a,l,l*.22,mixc('#2e5022','#5e8a38',t,.88),null,0);}}}};
// Fanwort / cabomba: opposite fan-shaped, finely forked leaves; red variety for the Amazon (Cabomba furcata)
P.fanwort=(c,H,seed,red)=>{const r=rng(seed),n=4+Math.floor(r()*3),c0=red?'#7a2a30':'#2e5a2a',c1=red?'#d0506a':'#7ab04a';
  for(let k=0;k<n;k++){const len=H*(.5+.5*r()),p=stemPts(len,(r()-.5)*.5,H*.05,r()*6,24,(r()-.5)*H*.18);strokePts(c,p,Math.max(.5,H*.005),red?'rgba(120,50,50,.9)':'rgba(70,100,46,.9)');
    for(let t=.06;t<1;t+=.07){const q=at(p,t),l=H*lerp(.07,.045,t);c.strokeStyle=mixc(c0,c1,t,.85);c.lineWidth=Math.max(.3,H*.0026);c.beginPath();
      for(const side of[-1,1]){const cx=q[0]+side*l*.25,cy=q[1];for(let j=0;j<7;j++){const a=-Math.PI/2+side*(.4+j*.28),ex=cx+Math.cos(a)*l,ey=cy+Math.sin(a)*l*.8,mx=cx+Math.cos(a)*l*.55,my=cy+Math.sin(a)*l*.45;
        c.moveTo(q[0],q[1]);c.lineTo(mx,my);c.lineTo(ex-Math.sin(a)*l*.12,ey);c.moveTo(mx,my);c.lineTo(ex+Math.sin(a)*l*.12,ey);}}c.stroke();}}};
// Duckweed: a film of tiny floating fronds with single hair roots (waterline at y=0)
P.duckweed=(c,H,seed)=>{const r=rng(seed),W=H*2.9;
  for(let i=0;i<Math.floor(W*.55);i++){const x=(r()-.5)*W,y=(r()-.5)*H*.03,s=H*(.025+.02*r());c.strokeStyle='rgba(200,210,180,.35)';c.lineWidth=.5;c.beginPath();c.moveTo(x,y+s*.3);c.lineTo(x+(r()-.5)*2,y+H*(.03+.06*r()));c.stroke();
    c.fillStyle=mixc('#5a9a2a','#a8d050',r(),.95);c.beginPath();c.ellipse(x,y,s,s*.45,0,0,TAU);c.fill();}};
// Water lettuce: a rosette of thick, ridged, pale velvety leaves; dense feathery pale roots below (waterline at y=0)
P.waterlettuce=(c,H,seed)=>{const r=rng(seed),RL=H*.42;
  for(let k=0;k<26;k++){const x0=(r()-.5)*H*.16,len=RL*(.4+.6*r()),bw=(r()-.5)*H*.06,p=[];for(let i=0;i<=12;i++){const t=i/12;p.push([x0+Math.sin(t*Math.PI)*bw,H*.01+len*t]);}
    strokePts(c,p,Math.max(.4,H*.004),'rgba(200,190,160,.7)');c.strokeStyle='rgba(220,210,180,.45)';c.lineWidth=Math.max(.25,H*.0018);c.beginPath();for(let i=1;i<12;i++){const q=p[i],l=H*.02;c.moveTo(q[0],q[1]);c.lineTo(q[0]-l,q[1]+l*.4);c.moveTo(q[0],q[1]);c.lineTo(q[0]+l,q[1]+l*.4);}c.stroke();}
  const N=9;for(let k=0;k<N;k++){const a=(k/(N-1)-.5)*2.4,back=k%2===0;c.save();c.translate(Math.sin(a)*H*.03,-H*.01);c.rotate(a*.75);const lw=H*.09,lh=H*.22*(back?1:.85);
    const g=c.createLinearGradient(0,0,0,-lh);g.addColorStop(0,'rgba(150,180,110,1)');g.addColorStop(1,back?'rgba(140,186,96,1)':'rgba(170,208,120,1)');c.fillStyle=g;
    c.beginPath();c.moveTo(0,0);c.bezierCurveTo(lw*.5,-lh*.2,lw*.7,-lh*.8,lw*.3,-lh);c.quadraticCurveTo(0,-lh*1.06,-lw*.3,-lh);c.bezierCurveTo(-lw*.7,-lh*.8,-lw*.5,-lh*.2,0,0);c.closePath();c.fill();
    c.strokeStyle='rgba(90,120,60,.55)';c.lineWidth=Math.max(.3,H*.003);c.beginPath();for(const v of[-.5,-.25,0,.25,.5]){c.moveTo(0,-lh*.05);c.quadraticCurveTo(v*lw*.7,-lh*.5,v*lw*.6,-lh*.98);}c.stroke();
    c.strokeStyle='rgba(240,250,220,.4)';c.lineWidth=Math.max(.3,H*.003);c.beginPath();c.moveTo(-lw*.3,-lh);c.quadraticCurveTo(0,-lh*1.06,lw*.3,-lh);c.stroke();c.restore();}};
// Sago pondweed (river): thread-fine leaves on repeatedly forking stems, a loose fan
P.sago=(c,H,seed)=>{const r=rng(seed);const grow=(x,y,a,len,d)=>{const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;c.strokeStyle=mixc('#5a6a30','#9aa85a',1-d/5,.8);c.lineWidth=Math.max(.3,H*.003*(d+1)/3);
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+ex)/2+(r()-.5)*len*.2,(y+ey)/2,ex,ey);c.stroke();
    if(d>0){const n=2+(r()<.4?1:0);for(let i=0;i<n;i++)grow(ex,ey,a+(i-(n-1)/2)*.45+(r()-.5)*.2,len*(.6+.25*r()),d-1);}
    else if(r()<.3){c.fillStyle='rgba(130,120,70,.9)';for(let j=0;j<4;j++){c.beginPath();c.arc(ex,ey-j*H*.01,H*.005,0,TAU);c.fill();}}};
  for(let k=0;k<4;k++)grow((r()-.5)*H*.08,0,-Math.PI/2+(r()-.5)*.6,H*.22,4);};
// Water willow (river gravel bar, emergent): upright stems with narrow willow-like leaves and small pale-violet flowers
P.waterwillow=(c,H,seed)=>{const r=rng(seed),n=6+Math.floor(r()*5);
  for(let k=0;k<n;k++){const len=H*(.6+.4*r()),p=stemPts(len,(r()-.5)*.3,H*.02,r()*6,20,(r()-.5)*H*.3);strokePts(c,p,Math.max(.6,H*.008),'rgba(90,100,60,1)');
    for(let t=.25;t<.98;t+=.11){const q=at(p,t),l=H*.11;leaf(c,q[0],q[1],-Math.PI/2-.9+(r()-.5)*.3,l,l*.13,mixc('#3a5a2a','#6a8a40',r(),.95),'rgba(200,220,150,.3)',-.1);leaf(c,q[0],q[1],-Math.PI/2+.9+(r()-.5)*.3,l,l*.13,mixc('#3a5a2a','#6a8a40',r(),.95),'rgba(200,220,150,.3)',.1);}
    if(r()<.5){const e=at(p,1);c.fillStyle='rgba(230,220,240,1)';c.beginPath();c.ellipse(e[0],e[1]-H*.02,H*.015,H*.01,0,0,TAU);c.fill();c.fillStyle='rgba(150,110,180,1)';c.beginPath();c.arc(e[0],e[1]-H*.02,H*.005,0,TAU);c.fill();}}};
// Quillwort (alpine): a low rosette of stiff, quill-like, gently curving leaves from a swollen base
P.quillwort=(c,H,seed)=>{const r=rng(seed),n=30+Math.floor(r()*10);c.fillStyle='rgba(90,90,60,.9)';c.beginPath();c.ellipse(0,-H*.03,H*.07,H*.04,0,0,TAU);c.fill();
  for(let k=0;k<n;k++){const a=(r()-.5)*1.7,len=H*(.55+.45*r()),p=[];for(let i=0;i<=12;i++){const t=i/12;p.push([Math.sin(a)*len*t*(.6+.4*t),-len*t*Math.cos(a*.6)+Math.abs(Math.sin(a))*len*t*t*.35]);}
    taper(c,p,Math.max(.8,H*.034),Math.max(.3,H*.004),mixc('#2a4a26','#5a7e40',r()*.7+.1,.95));strokePts(c,p.slice(0,10),Math.max(.25,H*.004),'rgba(200,220,170,.22)');}};
// Turtle grass (Gulf): dense flat strap blades with rounded tips, browning tips and white epiphyte crusts
P.turtlegrass=(c,H,seed)=>{const r=rng(seed),n=12+Math.floor(r()*8);
  for(let k=0;k<n;k++){const len=H*(.45+.55*r()),p=stemPts(len,(r()-.5)*.4,H*.04,r()*6,26,(r()-.5)*H*.6);
    strap(c,p,H*.05,[[0,'rgba(70,92,44,.97)'],[.25,'rgba(84,130,56,.97)'],[.8,'rgba(120,150,70,.95)'],[.93,'rgba(150,140,80,.95)'],[1,'rgba(150,120,70,.9)']],true);
    c.fillStyle='rgba(235,230,215,.55)';for(let j=0;j<4;j++){const q=at(p,.45+r()*.5);c.beginPath();c.ellipse(q[0]+(r()-.5)*H*.02,q[1],H*.008,H*.004,0,0,TAU);c.fill();}}
  c.strokeStyle='rgba(60,52,30,.6)';c.lineWidth=Math.max(.5,H*.008);c.beginPath();c.moveTo(-H*.3,0);c.lineTo(H*.3,0);c.stroke();};
// Shoal grass: thin flat blades; Manatee grass: taller round, wiry blades
P.shoalgrass=(c,H,seed)=>{const r=rng(seed),n=24+Math.floor(r()*12);for(let k=0;k<n;k++){const len=H*(.3+.5*r()),p=stemPts(len,(r()-.5)*.5,H*.03,r()*6,16,(r()-.5)*H*.6);taper(c,p,Math.max(.8,H*.012),Math.max(.6,H*.008),mixc('#4a6a34','#86a456',r(),.92));}};
P.manateegrass=(c,H,seed)=>{const r=rng(seed),n=16+Math.floor(r()*10);for(let k=0;k<n;k++){const len=H*(.5+.5*r()),p=stemPts(len,(r()-.5)*.6,H*.05,r()*6,22,(r()-.5)*H*.6);
  taper(c,p,Math.max(.8,H*.01),Math.max(.4,H*.004),mixc('#3e6a36','#7aa860',r(),.9));strokePts(c,p,Math.max(.25,H*.0025),'rgba(220,240,200,.3)');}};
// Sargassum (Gulf): floating golden-brown weed: branched stems, small toothed blades and berry-like air bladders (waterline at y=0)
P.sargassum=(c,H,seed)=>{const r=rng(seed);const br=(x,y,a,len,d)=>{const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;c.strokeStyle='rgba(120,84,30,.95)';c.lineWidth=Math.max(.4,H*.004*(d+1));c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();
    for(let j=0;j<3;j++){const u=r(),bx=lerp(x,ex,u),by=lerp(y,ey,u);if(r()<.55){leaf(c,bx,by,a+(r()<.5?-1:1)*(.6+r()*.5),H*.06,H*.012,mixc('#9a6a22','#d4a440',r(),.95),'rgba(90,60,20,.5)');}
      else{c.fillStyle=mixc('#a07428','#e0b850',r(),1);c.beginPath();c.arc(bx+(r()-.5)*H*.02,by+(r()-.5)*H*.02,H*.011,0,TAU);c.fill();c.fillStyle='rgba(255,240,200,.6)';c.beginPath();c.arc(bx-H*.003,by-H*.004,H*.003,0,TAU);c.fill();}}
    if(d>0)for(let i=0;i<2;i++)br(ex,ey,a+(i?.5:-.5)+(r()-.5)*.4,len*.75,d-1);};
  for(let k=0;k<8;k++){const a=k<5?Math.PI*(.12+r()*.76):(r()<.5?.05:Math.PI-.05)+(r()-.5)*.1;br((r()-.5)*H*.3,H*.01+r()*H*.02,a,H*.11,3);}};
// Riverweed (Podostemaceae) clinging to rocks in the Congo rapids: flat lobed crusts with short leafy tufts, olive to wine-red (base line = rock top)
P.riverweed=(c,H,seed)=>{const r=rng(seed),W=H*2;
  for(let i=0;i<40;i++){const x=(r()-.5)*W,y=-H*.02*r(),rw=H*(.06+.08*r()),rh=H*(.025+.03*r());c.fillStyle=mixc('#3a4a1e','#7a3a30',r()*.7,.9);c.beginPath();
    for(let k=0;k<=10;k++){const a=Math.PI+k/10*Math.PI,rr=1+.25*Math.sin(k*2.7+i);c.lineTo(x+Math.cos(a)*rw*rr,y+Math.sin(a)*rh*rr);}c.closePath();c.fill();}
  for(let i=0;i<30;i++){const x=(r()-.5)*W*.9,y=-H*.03,n=5;c.strokeStyle=mixc('#4a6a2a','#a04a3a',r()*.6,.85);c.lineWidth=Math.max(.4,H*.006);c.beginPath();
    for(let k=0;k<n;k++){const a=-Math.PI/2+(k/(n-1)-.5)*1.3+.4,l=H*(.08+.12*r());c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5,y+Math.sin(a)*l*.6,x+Math.cos(a)*l+l*.3,y+Math.sin(a)*l*.7);}c.stroke();}};
// Papyrus (Congo bank): tall triangular stems topped by starburst heads of fine rays, brown sheaths at the base
P.papyrus=(c,H,seed)=>{const r=rng(seed),n=6+Math.floor(r()*5);
  for(let k=0;k<n;k++){const len=H*(.65+.35*r()),p=stemPts(len,(r()-.5)*.3,H*.02,r()*6,20,(r()-.5)*H*.25);taper(c,p,Math.max(1,H*.016),Math.max(.6,H*.006),mixc('#4a6a2a','#7a9a40',r(),1));
    strokePts(c,p.slice(0,4),Math.max(1.2,H*.02),'rgba(120,90,50,1)');const e=at(p,1);c.strokeStyle=mixc('#5a8a30','#9ac050',r(),.9);c.lineWidth=Math.max(.3,H*.0028);c.beginPath();
    for(let j=0;j<40;j++){const a=-Math.PI/2+(r()-.5)*2.6,l=H*(.08+.08*r());c.moveTo(e[0],e[1]);c.quadraticCurveTo(e[0]+Math.cos(a)*l*.5,e[1]+Math.sin(a)*l*.5,e[0]+Math.cos(a)*l,e[1]+Math.sin(a)*l+l*.35*Math.abs(Math.cos(a)));}c.stroke();
    c.fillStyle='rgba(140,110,60,.9)';c.beginPath();c.ellipse(e[0],e[1],H*.012,H*.008,0,0,TAU);c.fill();}};

// Giant Amazon water lily (Victoria): huge pad with an upturned rim, red spiny underside showing at the rim; low-angle view at the surface
function victoria(c,x,y,R,flower,stalkDepth){c.save();c.translate(x,y);const sy=.22,rim=R*.09;
  if(stalkDepth){const sg=c.createLinearGradient(0,0,0,stalkDepth);sg.addColorStop(0,'rgba(110,44,34,.8)');sg.addColorStop(.15,'rgba(100,42,32,.4)');sg.addColorStop(.35,'rgba(90,40,30,0)');c.strokeStyle=sg;c.lineWidth=Math.max(.8,R*.035);c.beginPath();c.moveTo(R*.1,rim*.6);c.bezierCurveTo(R*.25,stalkDepth*.4,-R*.15,stalkDepth*.7,-R*.05,stalkDepth);c.stroke();}
  c.fillStyle='rgba(20,30,20,.25)';c.beginPath();c.ellipse(0,rim*.5,R*1.03,R*sy*1.05,0,0,TAU);c.fill();
  // pad top
  let g=c.createLinearGradient(0,-R*sy,0,R*sy);g.addColorStop(0,'#7aa246');g.addColorStop(1,'#3e6826');c.fillStyle=g;c.beginPath();c.ellipse(0,-rim*.4,R*.97,R*sy*.95,0,0,TAU);c.fill();
  c.strokeStyle='rgba(40,70,24,.45)';c.lineWidth=Math.max(.4,R*.01);c.beginPath();for(let k=0;k<16;k++){const a=k/16*TAU;c.moveTo(0,-rim*.4);c.lineTo(Math.cos(a)*R*.95,-rim*.4+Math.sin(a)*R*sy*.93);}
  for(const f of[.35,.6,.82]){c.moveTo(R*f*.97,-rim*.4);c.ellipse(0,-rim*.4,R*f*.97,R*sy*.93*f,0,0,TAU);}c.stroke();
  // upturned rim: front band shows the maroon outer wall
  g=c.createLinearGradient(0,0,0,rim*1.2);g.addColorStop(0,'#9a3a34');g.addColorStop(1,'#5a1e1c');c.fillStyle=g;c.beginPath();c.ellipse(0,0,R,R*sy,0,0,Math.PI);c.lineTo(-R,-rim);c.ellipse(0,-rim,R,R*sy,0,Math.PI,0,true);c.closePath();c.fill();
  c.strokeStyle='rgba(255,210,190,.5)';c.lineWidth=Math.max(.4,R*.008);c.beginPath();c.ellipse(0,-rim,R,R*sy,0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(220,150,130,.6)';c.lineWidth=Math.max(.3,R*.004);c.beginPath();for(let k=0;k<40;k++){const a=k/40*Math.PI,px=Math.cos(a)*R,py=Math.sin(a)*R*sy;c.moveTo(px,py-rim*.2);c.lineTo(px+Math.cos(a)*R*.012,py+rim*.4);}c.stroke();
  // back rim
  c.strokeStyle='#8a3430';c.lineWidth=Math.max(.8,rim*.8);c.beginPath();c.ellipse(0,-rim,R*.985,R*sy*.98,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
  if(flower){const fx=R*.5,fy=-R*sy*.9;for(let ring=0;ring<4;ring++){const k=10,rr=R*(.2-ring*.035);for(let i=0;i<k;i++){const a=i/k*TAU+ring*.3,px=fx+Math.cos(a)*rr*.6,py=fy+Math.sin(a)*rr*.2-ring*R*.03;
      c.fillStyle=ring>=2?'rgba(255,250,250,1)':'rgba(255,236,240,1)';c.beginPath();c.ellipse(px,py-rr*.2,rr*.18,rr*.48,Math.cos(a)*.6,0,TAU);c.fill();c.strokeStyle='rgba(220,180,200,.6)';c.lineWidth=.5;c.stroke();}}}
  c.restore();}
// Growth on salt-water pilings: green sea lettuce and fuzz near the waterline, a white barnacle band, oysters lower down
function fouling(c,x,w,surf,bottom,seed){const r=rng(seed);c.save();c.beginPath();c.rect(x-w/2-3,surf-6,w+6,bottom-surf+6);c.clip();
  // barnacle band (intertidal) just above and below the waterline
  for(let i=0;i<w*1.6;i++){const bx=x+(r()-.5)*w,by=surf-5+r()*16,s=1+r()*2.2;c.fillStyle='rgba(220,214,196,.95)';c.beginPath();c.moveTo(bx-s,by+s*.5);c.lineTo(bx,by-s);c.lineTo(bx+s,by+s*.5);c.closePath();c.fill();c.fillStyle='rgba(90,80,70,.8)';c.beginPath();c.arc(bx,by-s*.2,s*.25,0,TAU);c.fill();}
  // green algae fringe and sea lettuce sheets hanging in the water
  c.fillStyle='rgba(70,110,50,.55)';c.fillRect(x-w/2,surf+2,w,38);for(let i=0;i<w*1.4;i++){const bx=x+(r()-.5)*w*1.1,by=surf+4+r()*40,l=5+r()*16;c.fillStyle=mixc('#3a7a3a','#8ac860',r(),.75);c.beginPath();c.moveTo(bx,by);c.bezierCurveTo(bx+l*.5,by+l*.3,bx+l*.2,by+l*.9,bx+(r()-.5)*l*.6,by+l);c.bezierCurveTo(bx-l*.4,by+l*.6,bx-l*.3,by+l*.3,bx,by);c.fill();}
  // oysters and dark fuzz further down
  c.fillStyle='rgba(60,60,40,.35)';c.fillRect(x-w/2,surf+40,w,bottom-surf-40);for(let i=0;i<w*1.2;i++){const bx=x+(r()-.5)*w*.95,by=surf+30+r()*(bottom-surf-30);c.fillStyle=mixc('#5a5a4a','#8a8476',r(),.8);c.beginPath();c.ellipse(bx,by,.8+r()*1.2,.5+r()*.7,(r()-.5)*1.4,0,TAU);c.fill();}
  c.restore();}

// ---------- sprite cache + bending ----------
const CACHE={};
// sprite bounds per kind: [width, height, base line from top] as fractions of H. Floaters put the base line at the waterline.
const BOUNDS={hyacinth:[1.0,.95,.5],waterlettuce:[.9,.9,.42],duckweed:[3,.24,.1],sargassum:[1.5,.75,.16],riverweed:[2.2,.55,.53],watermoss:[2.2,1.1,.3],
  cattail:[1.1,1.12,1.1],bulrush:[.9,1.1,1.08],papyrus:[1.3,1.12,1.1],waterwillow:[1.1,1.1,1.08],watercress:[1.6,1,.98],turtlegrass:[1.8,1.12,1.1],shoalgrass:[1.6,1.12,1.1],manateegrass:[1.6,1.12,1.1],quillwort:[1.5,1.1,1.08],sago:[1.4,1.15,1.13]};
function sprite(kind,H,seed,extra){const key=kind+'|'+Math.round(H)+'|'+seed+'|'+(extra||'');if(CACHE[key])return CACHE[key];
  const B=BOUNDS[kind]||[1.4,1.15,null],W=Math.ceil(H*B[0]),Ht=Math.ceil(H*B[1]);const cv=document.createElement('canvas');cv.width=W;cv.height=Ht;const c=cv.getContext('2d');
  const by=B[2]==null?Ht-2:Math.ceil(H*B[2]);c.translate(W/2,by);P[kind](c,H,seed,extra);return CACHE[key]={cv,ox:W/2,oy:by,H};}
// draw a rooted plant bent by sway: sliced in horizontal bands, each shifted more toward the top
function drawBent(c,S,x,y,sway,bands=16){const {cv,ox,oy}=S,bh=Math.ceil(oy/bands);
  for(let i=0;i<bands;i++){const y0=oy-(i+1)*bh,t=(i+.5)/bands,dx=sway*t*t;c.drawImage(cv,0,Math.max(0,y0),cv.width,bh+1,x-ox+dx,y-oy+Math.max(0,y0),cv.width,bh+1);}
  if(cv.height>oy)c.drawImage(cv,0,oy,cv.width,cv.height-oy,x-ox,y,cv.width,cv.height-oy);}
// riverweed (Congo rapids) wrapped over the top of a boulder: cx,cy centre, rx,ry radii
function riverweedOnRock(c,cx,cy,rx,ry,seed){const r=rng(seed);
  for(let i=0;i<Math.round(rx*.9);i++){const a=Math.PI*(1.12+.76*r()),x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry,n=Math.atan2(Math.sin(a)/ry,Math.cos(a)/rx),rw=rx*(.05+.06*r()),rh=rx*(.025+.03*r());
    c.save();c.translate(x,y);c.rotate(n+Math.PI/2);c.fillStyle=mixc('#3a4a1e','#7a3a30',r()*.7,.92);c.beginPath();for(let k=0;k<=10;k++){const b=Math.PI+k/10*Math.PI,rr=1+.3*Math.sin(k*2.7+i);c.lineTo(Math.cos(b)*rw*rr,Math.sin(b)*rh*rr);}c.closePath();c.fill();
    if(r()<.6){c.strokeStyle=mixc('#4a6a2a','#a04a3a',r()*.6,.85);c.lineWidth=Math.max(.4,rx*.008);c.beginPath();for(let k=0;k<4;k++){const b=-Math.PI/2+(k/3-.5)*1.2+.5,l=rx*(.06+.08*r());c.moveTo(0,-rh*.5);c.quadraticCurveTo(Math.cos(b)*l*.5,Math.sin(b)*l*.6,Math.cos(b)*l+l*.4,Math.sin(b)*l*.6);}c.stroke();}
    c.restore();}}
window.PLANTS={P,sprite,drawBent,lilyPad,victoria,fouling,riverweedOnRock};
})();
