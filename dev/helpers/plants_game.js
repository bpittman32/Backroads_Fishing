// ---------- realistic aquatic plants: which plants grow where, and drawing them from the PLANTS library ----------
// Each area gets the plants that really grow there. Weed positions and heights still come from the world layout above.
const PLANTSET={pond:{bed:[['tapegrass',.3],['coontail',.2],['milfoil',.2],['elodea',.15],['cabbage',.15]],carpet:.1},
  creek:{bed:[['crowfoot',1]],flip:true},
  lake:{bed:[['tapegrass',.4],['cabbage',.45],['milfoil',.15]],carpet:.15,deep:[['milfoil',.55],['coontail',.45]]},
  bayou:{bed:[['hydrilla',.45],['fanwort',.3],['coontail',.25]]},
  river:{bed:[['sago',.6],['tapegrass',.4]],keep:.4},
  alpine:{bed:[['quillwort',.75],['chara',.25]]},
  amazon:{bed:[['fanwort',1]],red:true,keep:.5},
  pier:{bed:[['turtlegrass',.55],['shoalgrass',.25],['manateegrass',.2]],tall:1.5},
  congo:{bed:[]}};
const SHOREKIND={pond:'cattail',lake:'bulrush',river:'waterwillow',congo:'papyrus'};
let floats=[];
function plantRng(){let z=(LOC().seed*7477+31)%233280;return()=>(z=(z*9301+49297)%233280)/233280;}
function assignPlants(){const Lc=LOC(),P=PLANTSET[S.loc]||PLANTSET.pond,q=plantRng();
  const pick=list=>{let u=q(),a=0;for(const [k,w] of list){a+=w;if(u<=a)return k;}return list[0][0];};
  if(!P.bed.length)weeds=[];
  else{weeds=weeds.filter(w=>w.deep||P.keep==null||q()<P.keep);
    for(const w of weeds){const room=bottomAt(w.x)-SURF,hmax=Math.max(...w.blades.map(b=>b.h));
      const k=w.deep&&P.deep?pick(P.deep):(P.carpet&&q()<P.carpet?'chara':pick(P.bed));let H=hmax*1.15*(P.tall||1);
      if(k==='chara')H=14+q()*8;else if(k==='quillwort')H=10+q()*10;else if(k==='crowfoot')H=Math.min(room*(.75+.23*q()),50+q()*45);
      w.pk=k;w.pH=Math.max(8,Math.min(H,room-3));w.pseed=1+Math.floor(q()*5);w.pflip=!!P.flip;w.pred=P.red&&k==='fanwort'?1:k==='crowfoot'&&H>=room*.85?1:undefined;}}
  // floating plants
  floats=[];
  if(Lc.cypress)for(const p of pads)floats.push({x:p.x,k:q()<.68?'hyacinth':'waterlettuce',H:p.r*3.1,seed:1+Math.floor(q()*4),a:p.a});
  if(Lc.jungle&&!Lc.congo)for(let x=DOCKX+70;x<WX;x+=60+q()*110){const n=2+Math.floor(q()*3);for(let i=0;i<n;i++)floats.push({x:x+i*(9+q()*6),k:q()<.6?'waterlettuce':'hyacinth',H:18+q()*12,seed:1+Math.floor(q()*4),a:q()*6});}
  if(Lc.congo)for(const u of [.42,.47,.68,1.3,1.36])floats.push({x:u*TW,k:'hyacinth',H:26+q()*12,seed:1+Math.floor(q()*4),a:q()*6});
  if(Lc.salt)for(const u of [.5,.72,1.15,1.6])floats.push({x:u*TW,k:'sargassum',H:22+q()*10,seed:1+Math.floor(q()*4),a:q()*6});
  // papyrus along the Congo bank
  if(Lc.congo)for(let i=0;i<7;i++){const cx=60+q()*(WX*.5+W);for(let k=0;k<3;k++)reeds.push({x:cx+(q()-.5)*18,h:14+q()*12,ph:q()*6,head:false,lean:0});}
  // build the sprites now so nothing stalls while panning
  for(const w of weeds)plantSprite(w.pk,w.pH,w.pseed,w.pred);}
// sprites are painted at screen resolution, heights rounded to steps of 4 so similar plants share one
function plantSprite(kind,H,seed,extra){const k=DPR*SC,Hb=Math.max(6,Math.round(H/4)*4);return PLANTS.sprite(kind,Hb*k,seed,extra);}
// night and off-season tints are blended into cached copies (8 darkness steps, 6 browning steps) so each plant is drawn in one pass
function plantTinted(S,dk,brown){const dl=Math.round(Math.min(1,dk)*8),bl=Math.round(Math.min(1,brown)*6);if(!dl&&!bl)return S.cv;const key='t'+dl+'_'+bl;if(S[key])return S[key];
  const cv=document.createElement('canvas');cv.width=S.cv.width;cv.height=S.cv.height;const x=cv.getContext('2d');x.drawImage(S.cv,0,0);x.globalCompositeOperation='source-atop';
  if(bl){x.globalAlpha=bl/6*.85;x.fillStyle='#6a5a30';x.fillRect(0,0,cv.width,cv.height);}if(dl){x.globalAlpha=dl/8;x.fillStyle='#10241a';x.fillRect(0,0,cv.width,cv.height);}return S[key]=cv;}
// draw a plant bent from the root by `sway` (world units); o: {flip, extra, sy (height scale), brown, dk, whole}
function drawPlant(c,kind,H,seed,x,y,sway,o){const k=DPR*SC,S=plantSprite(kind,H,seed,o.extra),sc=1/k,sy=o.sy||1,img=plantTinted(S,o.dk||0,o.brown||0);
  c.save();c.translate(x,y);c.scale(o.flip?-sc:sc,sc*sy);const W0=S.cv.width;
  if(o.whole)c.drawImage(img,-S.ox,-S.oy);
  else{const n=H<20?5:10,bh=Math.ceil(S.oy/n),sw=(o.flip?-sway:sway)*k;
    for(let y0=0;y0<S.oy;y0+=bh){const h=Math.min(bh,S.oy-y0),t=1-(y0+h/2)/S.oy,dx=sw*t*t;c.drawImage(img,0,y0,W0,h,-S.ox+dx,y0-S.oy,W0,h);}
    if(S.cv.height>S.oy)c.drawImage(img,0,S.oy,W0,S.cv.height-S.oy,-S.ox,0,W0,S.cv.height-S.oy);}
  c.restore();}
// floating plants (bayou hyacinth and water lettuce, Amazon meadows, Congo rafts, Gulf sargassum) and the bayou duckweed
function drawFloaters(c,dk,vx0,vx1){const Zp=sea(),g=.6+.4*Math.min(1,Zp.pads+.2);
  for(const d of duck){if(d.x+d.w<vx0||d.x>vx1)continue;drawPlant(c,'duckweed',d.w/2.9,1+(d.x|0)%3,d.x+d.w/2,SURF+.3,0,{whole:true,dk:dk*.88});}
  for(const f of floats){const x=f.x+Math.sin(G.t*.4+f.a)*2;if(x<vx0-40||x>vx1+40)continue;drawPlant(c,f.k,f.H*(f.k==='sargassum'?1:g),f.seed,x,SURF+.5,0,{whole:true,dk:dk*.88});}}
