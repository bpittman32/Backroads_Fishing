import asyncio,sys,subprocess,time,json
from playwright.async_api import async_playwright
src=open(sys.argv[1]).read();hook='function start(data){'
dbg=src.replace(hook,'window.__T={G,S:()=>S,travel,isBait,hookDown,rig:()=>rig()};\n'+hook)
open('/home/claude/shots/b.html','w').write('<!doctype html><meta charset=utf-8><body>'+dbg)
SETUP="""(nib)=>{const T=window.__T,G=T.G,S=T.S();S.settings.sound=false;const L=G.lure;
 const f=G.fish.filter(x=>!x.sp.legend&&x.alpha>.5&&!x.sp.turtle&&!x.bed)[0];L.state='water';L.bare=false;L.x=f.x+f.face*f.L*.45;L.y=f.y;f.y=Math.max(f.y,0);L.fish=f;L.moving=false;
 f.state=nib?'nibble':'nibble';f.nib=nib?3:1;f.timer=nib?.6:.02;f.mood='normal';f.mouthHold=false;G.input.reel=false;window.__f=f;return [f.sp.id,T.isBait(),T.rig().type]}"""
SAMPLE="""async(ms)=>{const G=window.__T.G,out=[];const t0=performance.now();while(performance.now()-t0<ms){await new Promise(r=>setTimeout(r,100));out.push([Math.round(G.lure.y),window.__f.state,!!window.__f.mouthHold,G.lure.state,G.lure.fish?1:0]);}return out}"""
async def main():
  srv=subprocess.Popen([sys.executable,'-m','http.server','8774','--bind','127.0.0.1'],cwd='/home/claude/shots',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.6)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    await pg.goto('http://127.0.0.1:8774/b.html');await pg.evaluate('()=>localStorage.clear()');await pg.reload();await pg.wait_for_timeout(400)
    await pg.click('#mPlay');await pg.fill('#nameInput','Sam');await pg.click('#nameGo');await pg.wait_for_timeout(900)
    if await pg.is_visible('#tutSkip'): await pg.click('#tutSkip')
    await pg.wait_for_timeout(500)
    await pg.evaluate("()=>{window.SURF0=window.__T.G.lure.y; }")
    await pg.evaluate("()=>{const L=window.__T.G.lure;window.SURF0=0}")
    await pg.evaluate("()=>{window.SURF0=Math.min(...window.__T.G.fish.map(f=>f.y))-60}")
    for case in ['nibble-fall','bite-then-reel','bite-then-hook']:
      print('==',case, await pg.evaluate(SETUP, case=='nibble-fall'))
      if case=='nibble-fall':
        print(await pg.evaluate(SAMPLE,1500))
      elif case=='bite-then-reel':
        print(await pg.evaluate(SAMPLE,300)); await pg.evaluate("()=>{window.__T.G.input.reel=true}")
        print(await pg.evaluate(SAMPLE,500)); await pg.evaluate("()=>{window.__T.G.input.reel=false}")
        print(await pg.evaluate(SAMPLE,700)); print(await pg.evaluate("()=>document.querySelector('#toast').textContent"))
      else:
        print(await pg.evaluate(SAMPLE,500)); await pg.evaluate("()=>{Math.random=()=>0.001;window.__T.hookDown()}")
        print(await pg.evaluate(SAMPLE,800))
    print('errs',errs)
  srv.kill()
asyncio.run(main())
