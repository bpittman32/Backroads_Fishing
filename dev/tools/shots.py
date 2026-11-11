# usage: python3 shots.py <html> <outdir> [locs...] [--hour H] [--land]
import asyncio, sys, os, subprocess, time, json
from playwright.async_api import async_playwright
src_path, out = sys.argv[1], sys.argv[2]; args=sys.argv[3:]
hour = 12
if '--hour' in args: i=args.index('--hour'); hour=float(args[i+1]); del args[i:i+2]
land = '--land' in args; args=[a for a in args if a!='--land']
locs = args or ['creek','lake','river','alpine','pier','congo']
os.makedirs(out, exist_ok=True)
src = open(src_path).read(); hook='function start(data){'
assert src.count(hook)==1
dbg = src.replace(hook,'window.__T={G,S:()=>S,travel,LOCS,resize,cb:()=>cboulders,W:()=>W,SURF:()=>SURF,SC:()=>SC};\n'+hook)
d=os.path.abspath(out); open(f'{d}/dbg.html','w').write('<!doctype html><html><head><meta charset="utf-8"></head><body>'+dbg+'</body></html>')
async def main():
  PORT=8771; srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=d,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.7)
  try:
    async with async_playwright() as p:
      b=await p.chromium.launch(); vw,vh=(844,390) if land else (390,844)
      pg=await b.new_page(viewport={'width':vw,'height':vh},device_scale_factor=2,has_touch=True)
      errs=[]; pg.on('pageerror',lambda e:errs.append(str(e).split('\n')[0]))
      await pg.goto(f'http://127.0.0.1:{PORT}/dbg.html'); await pg.evaluate('()=>localStorage.clear()'); await pg.reload(); await pg.wait_for_timeout(500)
      await pg.click('#mPlay'); await pg.wait_for_timeout(250); await pg.fill('#nameInput','Nick'); await pg.click('#nameGo'); await pg.wait_for_timeout(900)
      if await pg.is_visible('#tutSkip'): await pg.click('#tutSkip')
      await pg.wait_for_timeout(300)
      if await pg.is_visible('#stNo'): await pg.click('#stNo')
      for loc in locs:
        await pg.evaluate(f"()=>{{const S=window.__T.S();S.unlocked['{loc}']=true;window.__T.travel('{loc}');if(S.loc!=='{loc}'){{S.loc='{loc}';window.__T.resize();}}S.minutes={hour}*60;S.weather='clear';S.settings.sound=false}}")
        await pg.wait_for_timeout(4500)
        cb=await pg.evaluate("()=>window.__T.cb().map(k=>({x:k.x,r:k.r,y:k.y,log:!!k.log}))")
        W=await pg.evaluate("()=>window.__T.W()")
        xs=sorted(set(round(k['x']/ (W*.8)) for k in cb if not k['log'])) or [0]
        for i,g in enumerate(xs[:4]):
          cx=g*W*.8
          await pg.evaluate(f"()=>{{const G=window.__T.G;G.fish=[];G.pan=Math.max(0,{cx}-window.__T.W()/2);G.panHold=999;}}")
          await pg.wait_for_timeout(700)
          if await pg.is_visible('#stNo'): await pg.click('#stNo'); await pg.wait_for_timeout(300)
          await pg.screenshot(path=f'{out}/{loc}-{i}.png')
          rects=await pg.evaluate("()=>{const T=window.__T,G=T.G,sc=T.SC();return T.cb().filter(k=>!k.log).map(k=>[(k.x-G.cam)*sc,(k.y)*sc,k.r*sc]).filter(q=>q[0]>-10&&q[0]<innerWidth+10)}")
          from PIL import Image
          im=Image.open(f'{out}/{loc}-{i}.png')
          for j,(x,y,r) in enumerate(rects[:3]):
            pad=max(r*2.3,36); box=[int(2*(x-pad)),int(2*(y-pad*1.2)),int(2*(x+pad)),int(2*(y+pad*.8))]
            box=[max(0,box[0]),max(0,box[1]),min(im.size[0],box[2]),min(im.size[1],box[3])]
            if box[2]-box[0]<pad*2.4: continue
            im.crop(box).resize((360,int(360*(box[3]-box[1])/max(1,box[2]-box[0])))).save(f'{out}/z-{loc}-{i}-{j}.png')
      print(json.dumps({'errs':errs}))
  finally: srv.kill()
asyncio.run(main())
