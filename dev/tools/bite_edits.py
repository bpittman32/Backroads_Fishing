import sys
p=sys.argv[1];s=open(p).read()
E=[
# nibbles are pecks: the bait keeps falling and the fish rides down with it
("f.state='nibble';f.mouthHold=onFall();","f.state='nibble';f.mouthHold=false;"),
# the take: a short pause as the fish inhales it, then it either swims off with it or sits on it
("f.mouthHold=!(G.input.reel||(!isBait()&&L.moving))&&!(isBait()&&rig().type==='bobber');f.biteAt=G.t;",
 "f.mouthHold=!(G.input.reel||(!isBait()&&L.moving))&&!(isBait()&&rig().type==='bobber');f.holdT=rand(.35,.8);f.carry=Math.random()<.65;f.reelT=0;f.biteAt=G.t;"),
("      if(f.mouthHold){tx=f.x+f.face*30;ty=Math.min(bottomAt(f.x)-f.L*.25,f.y+14);spd=sp.speed*.45;f.aim=.2;f.timer-=dt;if(f.timer<=0)missHook(f,'late');break;} // swims off with it\n",
 "      // Before the hook is set you can still take a bait away from a fish: reel and it comes out of its mouth.\n"
 "      if(isBait()&&G.input.reel){f.reelT=(f.reelT||0)+dt;if(f.reelT>.12){pullAway(f);break;}}else f.reelT=0;\n"
 "      // It inhales the bait and the line goes still for a moment, then it either swims off with it or just sits on it.\n"
 "      if(f.mouthHold){f.holdT-=dt;if(f.holdT>0||!f.carry){tx=f.x;ty=f.y;spd=sp.speed*.05;}else{tx=f.x+f.face*30;ty=Math.min(bottomAt(f.x)-f.L*.25,f.y+14);spd=sp.speed*.45;}f.aim=.2;f.timer-=dt;if(f.timer<=0)missHook(f,'late');break;}\n"),
# pullAway helper next to missHook
("function missHook(f,why){",
 "// Reeling a bait away from a fish that has it but isn't hooked: it comes out of the fish's mouth. A bold fish may come back for it.\n"
 "function pullAway(f){const L=G.lure;f.mouthHold=false;f.reelT=0;L.fish=null;f.state='wander';f.cool=f.mood==='bold'&&!f.wise?rand(3,6):rand(10,18);newWanderTarget(f);L.jig=.25;toast('Pulled it away','The fish let go');refreshControls();}\n"
 "function missHook(f,why){"),
("f.state='fight';G.lure.state='hooked';SFX.hook();","f.state='fight';f.mouthHold=false;G.lure.state='hooked';SFX.hook();"),
]
for a,b in E:
  assert s.count(a)==1,a[:70]; s=s.replace(a,b)
open(sys.argv[2],'w').write(s)
