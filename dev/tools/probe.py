import asyncio,sys,subprocess,time,json
from playwright.async_api import async_playwright
src=open('/home/claude/game/index.html').read();hook='function start(data){'
dbg=src.replace(hook,'window.__T={G,S:()=>S,travel,resize,cb:()=>cboulders,ppf:()=>pxPerFt(),uw:unwarpY,SURF:()=>SURF,GROUND:()=>GROUND,bot:bottomAt};\n'+hook)
open('/home/claude/shots/p.html','w').write('<!doctype html><meta charset=utf-8><body>'+dbg)
async def main():
  srv=subprocess.Popen([sys.executable,'-m','http.server','8772','--bind','127.0.0.1'],cwd='/home/claude/shots',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.6)
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for land in [False,True]:
      pg=await b.new_page(viewport={'width':844,'height':390} if land else {'width':390,'height':844})
      await pg.goto('http://127.0.0.1:8772/p.html');await pg.evaluate('()=>localStorage.clear()');await pg.reload();await pg.wait_for_timeout(400)
      await pg.click('#mPlay');await pg.fill('#nameInput','Nick');await pg.click('#nameGo');await pg.wait_for_timeout(700)
      for loc in ['creek','river','lake','alpine','pier']:
        r=await pg.evaluate("""(loc)=>{const T=window.__T,S=T.S();S.unlocked[loc]=true;T.travel(loc);if(S.loc!==loc){S.loc=loc;T.resize();}const f=T.ppf(),SU=T.SURF();
          return T.cb().filter(k=>!k.log).map(k=>[Math.round(k.r),+((T.uw(k.y-k.r)-SU)/f).toFixed(2),+((T.uw(T.bot(k.x))-SU)/f).toFixed(2)])}""",loc)
        print('land' if land else 'port',loc,r)
  srv.kill()
asyncio.run(main())
