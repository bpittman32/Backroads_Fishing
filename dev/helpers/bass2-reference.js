// Largemouth bass, approach C v2: painted texture + 3D lighting, deeper body, open jaw, warm palette.
// Units: fish length L = 1 (lower jaw tip at +0.5, tail tip at -0.5), y grows downward. Fish faces right.
(function(){
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function mkNoise(seed){const r=rng(seed),perm=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}
  const p=new Uint8Array(512);for(let i=0;i<512;i++)p[i]=perm[i&255];const g=(i,j)=>p[p[i&255]+(j&255)]/255,sm=t=>t*t*(3-2*t);
  const n2=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=sm(x-i),v=sm(y-j);return(g(i,j)*(1-u)+g(i+1,j)*u)*(1-v)+(g(i,j+1)*(1-u)+g(i+1,j+1)*u)*v;};
  return(x,y,o=4)=>{let a=0,amp=.5,f=1,t=0;for(let k=0;k<o;k++){a+=n2(x*f+k*17.3,y*f+k*9.1)*amp;t+=amp;amp*=.5;f*=2;}return a/t;};}
const hash=(a,b)=>{let h=Math.imul(a*73856093^b*19349663,0x27d4eb2d);h^=h>>>15;return((h>>>0)%10000)/10000;};
function cr(pts,seg=14){const out=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
  for(let k=0;k<seg;k++){const t=k/seg,t2=t*t,t3=t2*t;out.push([0,1].map(d=>.5*((2*p1[d])+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3)));}}
  out.push(pts[pts.length-1]);return out;}
const poly=(c,pts)=>{c.beginPath();c.moveTo(...pts[0]);for(const p of pts)c.lineTo(...p);c.closePath();};

// ---------- anatomy: deep, heavy body, big head ----------
const TOP=cr([[.478,-.004],[.452,-.030],[.416,-.054],[.360,-.088],[.292,-.122],[.215,-.142],[.137,-.152],[.040,-.153],[-.050,-.142],[-.140,-.115],[-.220,-.083],[-.290,-.063],[-.335,-.056],[-.362,-.054]]);
const BOT=cr([[.502,.020],[.470,.044],[.432,.064],[.380,.088],[.320,.106],[.245,.124],[.160,.146],[.060,.158],[-.040,.150],[-.110,.130],[-.180,.104],[-.250,.078],[-.300,.064],[-.335,.058],[-.362,.056]]);
const at=(arr,x)=>{if(x>=arr[0][0])return arr[0][1];for(let i=1;i<arr.length;i++)if(arr[i][0]<=x){const a=arr[i-1],b=arr[i];return lerp(b[1],a[1],(x-b[0])/(a[0]-b[0]));}return arr[arr.length-1][1];};
const topAt=x=>at(TOP,x),botAt=x=>at(BOT,x),bandAt=x=>lerp(topAt(x),botAt(x),.44);
const REAR=cr([[-.362,-.054],[-.373,-.036],[-.378,0],[-.373,.037],[-.362,.056]],6);
function bodyPath(c){c.beginPath();c.moveTo(...TOP[0]);for(const p of TOP)c.lineTo(...p);for(const p of REAR)c.lineTo(...p);for(let i=BOT.length-1;i>=0;i--)c.lineTo(...BOT[i]);c.closePath();}
// outline only along back and belly, so the tail joint has no hard line
function bodyEdge(c){c.beginPath();c.moveTo(...TOP[0]);for(const p of TOP)c.lineTo(...p);c.moveTo(...BOT[0]);for(const p of BOT)c.lineTo(...p);}

function fins(sway){const F={},s=sway||0;
  // tail: broad fan; its base sits under the scaled rear of the body, rays spread from inside the peduncle
  const up=cr([[-.330,-.052],[-.378,-.064],[-.424,-.090],[-.464,-.120+s*.3],[-.488,-.134+s*.32],[-.497,-.128+s*.35]],8),
    edge=cr([[-.497,-.128+s*.35],[-.492,-.096+s*.5],[-.474,-.050+s*.8],[-.457,.001+s],[-.475,.050+s*.8],[-.495,.094+s*.5],[-.501,.120+s*.35]],10),
    lo=cr([[-.501,.120+s*.35],[-.491,.128+s*.32],[-.466,.114+s*.3],[-.424,.086],[-.378,.062],[-.330,.054]],8);
  const tr=[];for(let i=0;i<=20;i++){const t=i/20,e=edge[Math.round(t*(edge.length-1))];tr.push([-.338,lerp(-.040,.042,t),e[0]+.002,e[1]]);}
  F.tail={o:[...up,...edge.slice(1),...lo.slice(1)],rays:tr,base:-.33,tip:-.5};
  // spiny dorsal: stout spines standing past a membrane that dips deep between them
  const H=[.040,.060,.066,.062,.056,.049,.041,.033,.025,.019],n=H.length,sp=[],tips=[];
  for(let i=0;i<n;i++){const bx=lerp(.150,-.030,i/(n-1)),tx=bx-.020,ty=topAt(bx)-H[i];sp.push([bx,topAt(bx)+.004,tx-.003,ty-.008]);tips.push([tx,ty]);}
  const sd=[[.158,topAt(.158)+.004],tips[0]];for(let i=1;i<n;i++){const a=tips[i-1],b=tips[i],dip=Math.min(H[i-1],H[i])*.5;sd.push(...cr([a,[(a[0]+b[0])/2+.004,(a[1]+b[1])/2+dip],b],6).slice(1));}
  sd.push([-.046,topAt(-.046)-.012]);for(let x=-.046;x<=.158;x+=.008)sd.push([x,topAt(x)+.004]);
  F.spiny={o:sd,spines:sp};
  // soft dorsal: tall, rounded, scalloped trailing edge
  const sE=cr([[-.044,topAt(-.044)-.018],[-.075,topAt(-.075)-.074],[-.120,topAt(-.12)-.092],[-.170,topAt(-.17)-.088],[-.215,topAt(-.215)-.062],[-.240,topAt(-.235)-.026],[-.238,topAt(-.238)+.002]],10);
  const soft=[[-.040,topAt(-.04)+.004],...sE];for(let x=-.236;x<=-.04;x+=.008)soft.push([x,topAt(x)+.004]);
  const sr=[];for(let i=0;i<14;i++){const t=(i+.6)/14.4,bx=lerp(-.046,-.232,t),e=sE[Math.min(sE.length-1,Math.round(t*(sE.length-1)))];sr.push([bx,topAt(bx)+.003,e[0]+.001,e[1]+.002]);}
  F.soft={o:soft,rays:sr};
  // anal: three graduated spines form the leading edge, then soft rays
  const aE=cr([[-.094,botAt(-.094)+.008],[-.110,botAt(-.11)+.040],[-.122,botAt(-.122)+.062],[-.160,botAt(-.16)+.078],[-.212,botAt(-.212)+.070],[-.250,botAt(-.248)+.040],[-.246,botAt(-.246)-.002]],8);
  const anal=[[-.090,botAt(-.090)-.004],...aE];for(let x=-.244;x<=-.09;x+=.008)anal.push([x,botAt(x)-.004]);
  const ar=[];for(let i=0;i<10;i++){const t=(i+1)/10.5,bx=lerp(-.112,-.240,t),e=aE[Math.min(aE.length-1,Math.round(lerp(.3,1,t)*(aE.length-1)))];ar.push([bx,botAt(bx)-.003,e[0]+.001,e[1]-.002]);}
  F.anal={o:anal,rays:ar,spines:[[-.094,botAt(-.094),-.100,botAt(-.094)+.016],[-.099,botAt(-.099),-.110,botAt(-.099)+.037],[-.104,botAt(-.104),-.121,botAt(-.104)+.058]]};
  // pelvic: hangs from a rounded base under the pectoral, spine on the leading edge, rays fanning back
  const pb=botAt(.180),pv=[.184,pb-.006];const pel=[...cr([[.204,botAt(.204)-.006],[.196,botAt(.196)+.012],[.172,pb+.042],[.140,pb+.072],[.114,pb+.088],[.100,pb+.084],[.104,pb+.066],[.118,pb+.040],[.132,botAt(.132)+.014],[.140,botAt(.140)-.004]],6)];for(let x=.14;x<=.204;x+=.006)pel.push([x,botAt(x)-.006]);
  const pr=[];for(let i=1;i<7;i++){const t=i/6,bx=lerp(.196,.146,t);pr.push([bx,botAt(bx)-.002,lerp(.108,.130,t),pb+lerp(.086,.022,t)]);}
  F.pelvic={o:pel,rays:pr,spines:[[.200,botAt(.2)-.002,.110,pb+.086]]};
  // pectoral: rounded fan from a fleshy base just behind the gill cover
  const pc=[.212,.036],pe=cr([[.214,.022],[.180,.004],[.130,-.008],[.084,.000],[.056,.022],[.050,.044],[.066,.064],[.110,.074],[.164,.068],[.210,.052]],8);
  const pk=[];for(let i=0;i<14;i++){const t=(i+.5)/14,e=pe[Math.round(lerp(1,pe.length-2,t))];pk.push([pc[0]-.004,pc[1]+lerp(-.010,.012,t),e[0]+.002,e[1]]);}
  F.pect={o:[pc,...pe,pc],rays:pk};
  return F;}

// blotches: separate along the front of the stripe, merging toward the tail; a few scattered above
function blotches(seed){const r=rng(seed),B=[],M=[];let x=.18;
  while(x>-.34){const merge=ss(-.05,-.25,x),d=botAt(x)-topAt(x),w=lerp(.020,.016,merge)+r()*.010,h=d*(lerp(.12,.16,merge)+r()*.05),y=bandAt(x)+(r()-.5)*d*.04,pts=[];
    for(let i=0;i<10;i++){const a=i/10*TAU,rr=.78+r()*.38;pts.push([x+Math.cos(a)*w*rr*(1+.25*Math.abs(Math.cos(a))),y+Math.sin(a)*h*rr*.5]);}B.push(cr([...pts,pts[0]],4));
    x-=lerp(.056,.022,merge)+r()*.012;}
  for(let i=0;i<14;i++){const x=lerp(.18,-.28,r()),t=topAt(x),y=lerp(t+.025,bandAt(x)-.03,r()),w=.010+r()*.012,h=.007+r()*.010,pts=[];
    for(let k=0;k<8;k++){const a=k/8*TAU,rr=.7+r()*.5;pts.push([x+Math.cos(a)*w*rr,y+Math.sin(a)*h*rr]);}M.push(cr([...pts,pts[0]],4));}
  return{B,M};}
const BL=blotches(21);

// colour: bronze-olive back, golden flanks, white belly with a pink edge
function bodyGrad(c){const g=c.createLinearGradient(0,-.15,0,.16);
  [[0,'#3a3812'],[.16,'#5b5a1e'],[.32,'#8c8a2e'],[.46,'#b9b44a'],[.58,'#d2cc66'],[.70,'#e2dc98'],[.82,'#f1eedd'],[1,'#f2e2dc']].forEach(([o,cc])=>g.addColorStop(o,cc));return g;}

const noise=mkNoise(11),noise2=mkNoise(29);
function bodySprite(L){
  const pad=.02,W=Math.ceil(L*(1+pad*2)),H=Math.ceil(L*.36),ox=L*(.5+pad),oy=L*.17;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
  c.setTransform(L,0,0,L,ox,oy);c.fillStyle=bodyGrad(c);bodyPath(c);c.fill();
  // cheek: three dark streaks fanning back from the eye, softened
  const sk=document.createElement('canvas');sk.width=W;sk.height=H;const k=sk.getContext('2d');k.setTransform(L,0,0,L,ox,oy);k.lineCap='round';k.strokeStyle='rgba(58,60,20,.75)';
  for(const [w,pts] of [[.011,[[.462,-.030],[.420,-.030],[.380,-.022],[.320,-.010],[.262,-.004]]],[.009,[[.392,.004],[.350,.020],[.300,.034],[.268,.040]]],[.007,[[.372,-.048],[.330,-.060],[.290,-.072]]]]){k.lineWidth=w;const q=cr(pts,6);k.beginPath();k.moveTo(...q[0]);for(const p of q)k.lineTo(...p);k.stroke();}
  for(const m of BL.M){k.fillStyle='rgba(50,52,16,.40)';poly(k,m);k.fill();}
  for(const q of BL.B){k.fillStyle='rgba(54,58,18,.88)';poly(k,q);k.fill();}
  // stripe joins into a band behind the soft dorsal
  k.fillStyle='rgba(54,58,18,.55)';k.beginPath();for(let x=-.08;x>=-.35;x-=.01)k.lineTo(x,bandAt(x)-(botAt(x)-topAt(x))*.055);for(let x=-.35;x<=-.08;x+=.01)k.lineTo(x,bandAt(x)+(botAt(x)-topAt(x))*.06);k.closePath();k.fill();
  c.setTransform(1,0,0,1,0,0);c.save();c.globalCompositeOperation='source-atop';c.filter=`blur(${Math.max(.4,L*.0028)}px)`;c.drawImage(sk,0,0);c.filter='none';c.restore();
  const id=c.getImageData(0,0,W,H),d=id.data,st=.0135,rh=st*.6;
  for(let py=0;py<H;py++)for(let px=0;px<W;px++){const i=(py*W+px)*4;if(d[i+3]===0)continue;
    const x=(px-ox)/L,y=(py-oy)/L,t=topAt(x),bo=botAt(x),v=cl((y-(t+bo)/2)/((bo-t)/2),-1,1),opx=.209+(y<-.02?7.8:3.4)*(y+.02)*(y+.02),onHead=x>opx-.004;
    let r=d[i],g=d[i+1],b=d[i+2];
    if(!onHead){// overlapping scales: forward scale on top; light rim then dark edge; pigment dot in each scale on the lower flank
      const row=Math.floor(y/rh);let best=-9,bt=1,bk=0,brw=0;
      for(let rr=row-1;rr<=row+1;rr++){const cyy=rr*rh,off=(rr&1)*st*.5,k0=Math.floor((x-off)/st);for(let kk=k0-1;kk<=k0+1;kk++){const cx=kk*st+off,dd=Math.hypot(x-cx,(y-cyy)/.8)/(st*.6);if(dd<1&&cx>best){best=cx;bt=dd;bk=kk;brw=rr;}}}
      const fade=ss(.95,.55,v)*ss(opx+.002,opx-.03,x),edge=ss(.80,.96,bt),rim=ss(.62,.80,bt)*(1-edge);
      let sh=1+(.10*rim-.24*edge)*fade;
      const yc=brw*rh,below=yc>bandAt(x)+.008;
      if(below&&v<.72){const dk=ss(.55,.18,bt)*(.45+.55*hash(bk,brw))*ss(.72,.35,v)*ss(.25,.12,x)*.9;sh*=1-.42*dk;}
      else if(!below){sh*=1-.10*ss(.6,.2,bt)*hash(bk+7,brw);}
      r*=sh;g*=sh;b*=sh;}
    {const hw=ss(.17,.30,x),hk=1-hw*(.1+.06*ss(.2,-.6,v));r*=hk;g*=hk;b*=hk;}
    const n=noise(x*30,y*30,4),n2=noise2(x*110,y*110,2),nm=1+(-.10+.20*n+.06*(n2-.5))*ss(.9,.4,v);r*=nm;g*=nm;b*=nm;
    // round body lighting, light from above and slightly in front
    const z=Math.sqrt(Math.max(0,1-v*v)),ny=v*.85,nz=Math.max(.15,z),nl=Math.hypot(ny,nz);const lx=.25,ly=-.70,lz=.67,ll=Math.hypot(lx,ly,lz);
    const dif=Math.max(0,(ny*ly+nz*lz)/(nl*ll)),hx=lx/ll,hy=ly/ll,hz=lz/ll+1,hl=Math.hypot(hx,hy,hz),spec=Math.pow(Math.max(0,(ny*hy+nz*hz)/(nl*hl)),26)*.5;
    const amb=.76+.36*dif+(v>0?v*.10:0),rimL=.78+.22*Math.sqrt(z);r=r*amb*rimL+250*spec*.32;g=g*amb*rimL+245*spec*.30;b=b*amb*rimL+210*spec*.22;
    if(v>.7){const pk=ss(.7,1,v)*.35;r=lerp(r,236,pk);g=lerp(g,196,pk);b=lerp(b,190,pk);} // pink belly edge
    d[i]=cl(r,0,255);d[i+1]=cl(g,0,255);d[i+2]=cl(b,0,255);}
  c.putImageData(id,0,0);
  c.setTransform(L,0,0,L,ox,oy);
  c.strokeStyle='rgba(50,48,16,.35)';c.lineWidth=Math.max(.6/L,.0018);c.beginPath();for(let x=.21;x>-.34;x-=.01){const y=lerp(topAt(x),botAt(x),.27);x>.205?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();
  c.strokeStyle='rgba(40,36,12,.55)';c.lineWidth=Math.max(.5/L,.0022);bodyEdge(c);c.stroke();
  // soft shadow where the scaled rear lobe overlaps the tail
  c.save();bodyPath(c);c.clip();const sg=c.createLinearGradient(-.34,0,-.378,0);sg.addColorStop(0,'rgba(40,36,12,0)');sg.addColorStop(1,'rgba(40,36,12,.22)');c.fillStyle=sg;c.fillRect(-.38,-.07,.05,.14);c.restore();
  return{cv,ox,oy};}

function head(c){
  // gill cover (opercle) edge with a lit lip, and the preopercle curve
  c.strokeStyle='rgba(44,40,14,.55)';c.lineWidth=.0042;c.beginPath();c.moveTo(.268,-.112);c.bezierCurveTo(.232,-.090,.205,-.050,.205,-.020);c.bezierCurveTo(.206,.030,.230,.080,.262,.110);c.stroke();
  c.strokeStyle='rgba(255,240,200,.28)';c.lineWidth=.003;c.beginPath();c.moveTo(.272,-.106);c.bezierCurveTo(.240,-.086,.214,-.050,.214,-.020);c.bezierCurveTo(.215,.028,.236,.075,.266,.104);c.stroke();
  c.strokeStyle='rgba(220,140,120,.45)';c.lineWidth=.003;c.beginPath();c.moveTo(.214,.040);c.bezierCurveTo(.222,.070,.240,.092,.262,.110);c.stroke();// pinkish gill edge
  c.strokeStyle='rgba(44,40,14,.38)';c.lineWidth=.0034;c.beginPath();c.moveTo(.318,-.098);c.bezierCurveTo(.296,-.050,.288,.010,.300,.060);c.quadraticCurveTo(.310,.085,.345,.090);c.stroke();
  c.strokeStyle='rgba(255,240,200,.2)';c.lineWidth=.0025;c.beginPath();c.moveTo(.324,-.094);c.bezierCurveTo(.304,-.050,.296,.010,.307,.058);c.stroke();
  const MV=window.MOUTH||'full';let g;
  if(MV==='v3'){
  // mouth: slightly open, pink-brown inside, lower jaw out past the upper
  g=c.createLinearGradient(.50,0,.37,0);g.addColorStop(0,'#9a5a4c');g.addColorStop(.45,'#5e3026');g.addColorStop(1,'#26140e');c.fillStyle=g;
  c.beginPath();c.moveTo(.478,.002);c.bezierCurveTo(.452,.012,.412,.030,.368,.050);c.quadraticCurveTo(.362,.054,.368,.057);c.bezierCurveTo(.410,.052,.460,.036,.498,.019);c.closePath();c.fill();
  c.fillStyle='rgba(20,10,6,.45)';c.beginPath();c.moveTo(.476,.004);c.bezierCurveTo(.45,.014,.41,.032,.370,.051);c.bezierCurveTo(.41,.040,.45,.022,.476,.010);c.closePath();c.fill();// shadow under upper lip
  // lower jaw: thick lip, jaw bone line, pale chin
  c.save();bodyPath(c);c.clip();g=c.createLinearGradient(0,.02,0,.09);g.addColorStop(0,'rgba(236,222,170,.0)');g.addColorStop(1,'rgba(240,226,214,.35)');c.fillStyle=g;
  c.filter='blur(3px)';c.beginPath();c.moveTo(.503,.020);c.bezierCurveTo(.46,.040,.41,.056,.368,.060);c.quadraticCurveTo(.345,.07,.33,.10);c.lineTo(.51,.07);c.closePath();c.fill();c.filter='none';c.restore();
  c.strokeStyle='rgba(214,176,150,.85)';c.lineWidth=.0055;c.lineCap='round';c.beginPath();c.moveTo(.499,.022);c.bezierCurveTo(.46,.040,.41,.054,.372,.059);c.stroke();
  c.strokeStyle='rgba(255,240,226,.55)';c.lineWidth=.0018;c.beginPath();c.moveTo(.497,.020);c.bezierCurveTo(.46,.037,.41,.051,.374,.056);c.stroke();
  c.save();bodyPath(c);c.clip();c.strokeStyle='rgba(60,44,22,.35)';c.lineWidth=.0025;c.beginPath();c.moveTo(.494,.030);c.bezierCurveTo(.47,.050,.43,.066,.388,.076);c.quadraticCurveTo(.368,.080,.352,.078);c.stroke();c.restore();
  // maxilla: a long plate in the head colour, rounded end under the back of the eye; thin upper lip in front of it
  c.save();c.filter='blur(2px)';c.fillStyle='rgba(40,34,10,.16)';c.beginPath();c.ellipse(.354,.050,.010,.008,0,0,TAU);c.fill();c.restore();
  g=c.createLinearGradient(0,-.004,0,.054);g.addColorStop(0,'#757028');g.addColorStop(.6,'#7f7a30');g.addColorStop(1,'#8e8840');c.fillStyle=g;
  c.beginPath();c.moveTo(.452,-.004);c.bezierCurveTo(.425,.000,.395,.010,.376,.020);c.bezierCurveTo(.360,.028,.352,.040,.356,.050);c.bezierCurveTo(.360,.058,.372,.057,.380,.052);c.bezierCurveTo(.400,.042,.430,.026,.462,.010);c.closePath();c.fill();
  c.save();c.clip();c.strokeStyle='rgba(40,34,12,.45)';c.lineWidth=.005;c.beginPath();c.moveTo(.47,.02);c.bezierCurveTo(.43,.034,.39,.052,.36,.064);c.stroke();c.restore();
  c.strokeStyle='rgba(40,34,12,.35)';c.lineWidth=.0016;c.beginPath();c.moveTo(.376,.020);c.bezierCurveTo(.360,.028,.352,.040,.356,.050);c.bezierCurveTo(.360,.058,.372,.057,.380,.052);c.stroke();
  c.strokeStyle='rgba(255,246,206,.16)';c.lineWidth=.0014;c.beginPath();c.moveTo(.448,-.002);c.bezierCurveTo(.42,.003,.39,.013,.372,.026);c.stroke();
  // upper lip: a thin pale rim along the top of the gape
  c.strokeStyle='rgba(200,180,120,.75)';c.lineWidth=.0026;c.beginPath();c.moveTo(.478,.002);c.bezierCurveTo(.452,.012,.412,.030,.370,.050);c.stroke();
  }else{
  // closed mouth: one confident mouth line from between the jaws back to a corner below the rear of the eye
  const ML=[[.490,.009],[.466,.020],[.440,.031],[.410,.042],[.384,.050],[.366,.055]];
  const ml=()=>{const q=cr(ML,6);c.beginPath();c.moveTo(...q[0]);for(const p of q)c.lineTo(...p);};
  // lower jaw: olive along the lip fading to a pale chin; protrudes slightly past the snout
  c.save();bodyPath(c);c.clip();g=c.createLinearGradient(0,.012,0,.09);g.addColorStop(0,'rgba(110,104,46,.55)');g.addColorStop(.45,'rgba(150,144,80,.15)');g.addColorStop(1,'rgba(242,232,222,.4)');c.fillStyle=g;
  c.filter='blur(3px)';c.beginPath();c.moveTo(.51,.005);for(const p of ML)c.lineTo(...p);c.quadraticCurveTo(.345,.065,.33,.10);c.lineTo(.51,.07);c.closePath();c.fill();c.filter='none';
  c.strokeStyle='rgba(60,46,22,.30)';c.lineWidth=.0022;c.beginPath();c.moveTo(.492,.032);c.bezierCurveTo(.47,.050,.43,.066,.390,.076);c.quadraticCurveTo(.370,.080,.354,.079);c.stroke();c.restore();
  if(MV==='full'){
    // fleshy lower lip under the line
    c.strokeStyle='rgba(160,152,86,.75)';c.lineWidth=.0065;c.lineCap='round';ml();c.stroke();
    c.save();c.translate(0,.0032);c.strokeStyle='rgba(240,232,200,.45)';c.lineWidth=.0016;ml();c.stroke();c.restore();
  }
  // the mouth line, a touch of pink at the front
  c.strokeStyle='rgba(28,20,10,.85)';c.lineWidth=MV==='full'?.0032:.0028;c.lineCap='round';ml();c.stroke();
  c.strokeStyle='rgba(200,120,110,.6)';c.lineWidth=.0022;c.beginPath();c.moveTo(.489,.011);c.quadraticCurveTo(.478,.016,.468,.021);c.stroke();
  // maxilla: plate from under the nostril widening to a rounded end above the mouth corner, behind the eye
  const mx=[[.462,-.007],[.440,.001],[.416,.011],[.394,.021],[.376,.029],[.362,.037],[.356,.047],[.362,.055],[.378,.053],[.398,.046],[.424,.035],[.450,.023],[.470,.012],[.474,.002]];
  const mq=cr([...mx,mx[0]],5);
  c.save();c.filter='blur(1.5px)';c.fillStyle='rgba(30,26,8,.22)';c.beginPath();c.ellipse(.358,.054,.010,.007,0,0,TAU);c.fill();c.restore();
  if(MV==='full'){g=c.createLinearGradient(.47,-.01,.36,.055);g.addColorStop(0,'#868034');g.addColorStop(.6,'#a09a48');g.addColorStop(1,'#948e3e');c.fillStyle=g;poly(c,mq);c.fill();}
  c.save();poly(c,mq);c.clip();c.strokeStyle='rgba(255,248,214,'+(MV==='full'?.38:.28)+')';c.lineWidth=.0035;c.beginPath();c.moveTo(.460,-.005);c.bezierCurveTo(.430,.006,.398,.020,.374,.032);c.quadraticCurveTo(.360,.040,.359,.052);c.stroke();c.restore();
  c.strokeStyle='rgba(34,28,10,'+(MV==='full'?.62:.5)+')';c.lineWidth=.0019;poly(c,mq);c.stroke();
  if(MV==='full'){c.strokeStyle='rgba(112,104,52,.9)';c.lineWidth=.0036;c.beginPath();c.moveTo(.486,.006);c.bezierCurveTo(.468,.014,.448,.022,.428,.030);c.stroke();}
  }
  // nostrils
  c.fillStyle='rgba(30,26,10,.6)';for(const [x,y] of [[.448,-.030],[.438,-.034]]){c.beginPath();c.ellipse(x,y,.0035,.0025,0,0,TAU);c.fill();}
  // eye: dark pupil, red-brown iris, glossy
  const ex=.397,ey=-.026,er=.019;
  c.fillStyle='rgba(50,44,16,.6)';c.beginPath();c.arc(ex,ey,er*1.22,0,TAU);c.fill();
  g=c.createRadialGradient(ex,ey,er*.4,ex,ey,er);g.addColorStop(0,'#8a4a22');g.addColorStop(.7,'#5a2e14');g.addColorStop(1,'#2a160a');c.fillStyle=g;c.beginPath();c.arc(ex,ey,er,0,TAU);c.fill();
  c.fillStyle='#050403';c.beginPath();c.arc(ex+er*.04,ey+er*.02,er*.6,0,TAU);c.fill();
  g=c.createRadialGradient(ex-er*.35,ey-er*.4,0,ex-er*.35,ey-er*.4,er*.75);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.25,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(ex,ey,er,0,TAU);c.fill();
  c.strokeStyle='rgba(200,170,120,.35)';c.lineWidth=.0018;c.beginPath();c.arc(ex,ey,er*1.02,Math.PI*.15,Math.PI*.85);c.stroke();
  // glossy head highlight
  c.save();bodyPath(c);c.clip();g=c.createRadialGradient(.37,-.075,0,.37,-.075,.09);g.addColorStop(0,'rgba(255,252,220,.20)');g.addColorStop(1,'rgba(255,252,220,0)');c.fillStyle=g;c.fillRect(.26,-.17,.24,.17);c.restore();
}

// fins: warm membranes, tapered rays that fork near the tip, translucent margin, fleshy base
function ray(c,a,b,x,y,w,col,fork){const dx=x-a,dy=y-b,l=Math.hypot(dx,dy)||1,px=-dy/l,py=dx/l,mx=(a+x)/2+px*l*.03,my=(b+y)/2+py*l*.03;
  c.fillStyle=col;c.beginPath();c.moveTo(a+px*w,b+py*w);c.quadraticCurveTo(mx+px*w*.6,my+py*w*.6,x+px*w*.25,y+py*w*.25);c.lineTo(x-px*w*.25,y-py*w*.25);c.quadraticCurveTo(mx-px*w*.6,my-py*w*.6,a-px*w,b-py*w);c.closePath();c.fill();
  if(fork){const fx=lerp(a,x,.72),fy=lerp(b,y,.72);c.strokeStyle=col;c.lineWidth=w*.5;c.beginPath();c.moveTo(fx,fy);c.lineTo(x+px*w*1.6,y+py*w*1.6);c.moveTo(fx,fy);c.lineTo(x-px*w*1.6,y-py*w*1.6);c.stroke();}}
function drawFin(c,f,o){
  const ys=f.o.map(p=>p[1]),xs=f.o.map(p=>p[0]);const g=o.horiz?c.createLinearGradient(f.base,0,f.tip,0):c.createLinearGradient(0,Math.min(...ys),0,Math.max(...ys));
  o.mem.forEach(([k,cc])=>g.addColorStop(k,cc));c.fillStyle=g;poly(c,f.o);c.fill();
  c.save();poly(c,f.o);c.clip();
  if(f.rays){c.lineCap='round';for(const [a,b,x,y] of f.rays){c.strokeStyle=o.shade;c.lineWidth=o.w*5;c.beginPath();c.moveTo(a,b);c.lineTo(x,y);c.stroke();}
    for(const [a,b,x,y] of f.rays)ray(c,a,b,x,y,o.w,o.ray,true);
    c.strokeStyle='rgba(255,244,214,.18)';c.lineWidth=o.w*.5;c.beginPath();for(const [a,b,x,y] of f.rays){c.moveTo(a-o.w*1.2,b);c.lineTo(x-o.w*1.2,y);}c.stroke();}
  // translucent margin
  c.strokeStyle=o.margin||'rgba(255,246,222,.28)';c.lineWidth=.009;poly(c,f.o);c.stroke();
  c.restore();
  if(f.spines){for(const [a,b,x,y] of f.spines)ray(c,a,b,x,y,o.sw||.0028,o.spineCol||'rgba(66,50,20,.9)',false);
    c.strokeStyle='rgba(255,238,196,.45)';c.lineWidth=.0011;c.lineCap='round';c.beginPath();for(const [a,b,x,y] of f.spines){c.moveTo(a+.0012,b);c.lineTo(x+.0006,y);}c.stroke();}
  c.strokeStyle=`rgba(50,38,14,${o.edge})`;c.lineWidth=.0014;poly(c,f.o);c.stroke();
  if(f.lobe){const [lx,ly,rx,ry]=f.lobe,lg=c.createRadialGradient(lx+rx*.3,ly-ry*.3,0,lx,ly,Math.max(rx,ry));lg.addColorStop(0,o.lobe[0]);lg.addColorStop(1,o.lobe[1]);c.fillStyle=lg;c.beginPath();c.ellipse(lx,ly,rx,ry,0,0,TAU);c.fill();
    c.strokeStyle='rgba(50,40,14,.35)';c.lineWidth=.0016;c.beginPath();c.ellipse(lx,ly,rx,ry,0,Math.PI*.4,Math.PI*1.6);c.stroke();}}

const CACHE={};
function drawC2(c,L,sway){c.save();const key='C2'+Math.round(L);const S=CACHE[key]||(CACHE[key]=bodySprite(L));c.scale(L,L);const F=fins(sway);
  const shade='rgba(70,46,16,.10)';
  drawFin(c,F.tail,{horiz:true,mem:[[0,'rgba(84,70,24,.98)'],[.55,'rgba(100,78,28,.94)'],[1,'rgba(138,104,46,.78)']],ray:'rgba(128,64,30,.55)',shade,w:.0019,edge:.45,margin:'rgba(255,236,200,.22)'});
  drawFin(c,F.soft,{mem:[[0,'rgba(178,134,62,.62)'],[.6,'rgba(150,112,44,.86)'],[1,'rgba(118,92,34,.95)']],ray:'rgba(140,64,30,.55)',shade,w:.0018,edge:.4});
  drawFin(c,F.spiny,{mem:[[0,'rgba(150,126,58,.55)'],[1,'rgba(116,96,36,.92)']],ray:'',shade,w:.0016,edge:.35,sw:.0032});
  drawFin(c,F.anal,{mem:[[0,'rgba(226,210,150,.90)'],[1,'rgba(236,220,172,.72)']],ray:'rgba(186,118,60,.5)',shade:'rgba(150,96,40,.08)',w:.0016,edge:.3,margin:'rgba(255,252,240,.55)',sw:.0026,spineCol:'rgba(190,150,100,.95)'});
  c.save();c.setTransform(c.getTransform().scale(1/L,1/L));c.drawImage(S.cv,-S.ox,-S.oy);c.restore();
  drawFin(c,F.pect,{mem:[[0,'rgba(214,186,100,.40)'],[1,'rgba(198,160,80,.48)']],ray:'rgba(160,92,42,.5)',shade:'rgba(120,80,30,.06)',w:.0015,edge:.28,margin:'rgba(255,244,210,.2)'});
  head(c);
  drawFin(c,F.pelvic,{mem:[[0,'rgba(230,216,156,.15)'],[.22,'rgba(230,216,156,.88)'],[1,'rgba(238,226,180,.80)']],ray:'rgba(190,126,66,.45)',shade:'rgba(150,96,40,.07)',w:.0015,edge:.08,margin:'rgba(255,252,242,.35)',sw:.0026,spineCol:'rgba(196,160,110,.95)'});
  c.restore();}
window.BASS2={drawC2};
})();
