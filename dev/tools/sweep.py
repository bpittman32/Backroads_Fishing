import asyncio,sys,subprocess,time
from playwright.async_api import async_playwright
src=open('/home/claude/game/index.html').read();hook='function start(data){'
dbg=src.replace(hook,'window.__T={G,S:()=>S,travel,resize,render,LOCS};\n'+hook)
open('/home/claude/shots/s.html','w').write('<!doctype html><meta charset=utf-8><body>'+dbg)
async def main():
  srv=subprocess.Popen([sys.executable,'-m','http.server','8773','--bind','127.0.0.1'],cwd='/home/claude/shots',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.6)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    await pg.goto('http://127.0.0.1:8773/s.html');await pg.evaluate('()=>localStorage.clear()');await pg.reload();await pg.wait_for_timeout(400)
    await pg.click('#mPlay');await pg.fill('#nameInput','Nick');await pg.click('#nameGo');await pg.wait_for_timeout(700)
    r=await pg.evaluate("""async()=>{const T=window.__T,S=T.S(),out={};for(const loc of Object.keys(T.LOCS)){S.unlocked[loc]=true;T.travel(loc);if(S.loc!==loc){S.loc=loc;T.resize();}
      for(const h of [6,12,19,23])for(const w of ['clear','rain','fog']){S.minutes=h*60;S.weather=w;for(let cam=0;cam<1200;cam+=300){T.G.cam=cam;T.render();}}
      S.minutes=12*60;S.weather='clear';let t0=performance.now();for(let i=0;i<60;i++){T.G.cam=(i*20)%800;T.G.t+=.016;T.render();}out[loc]=+((performance.now()-t0)/60).toFixed(2);}return out}""")
    print(r,errs[:5])
  srv.kill()
asyncio.run(main())
