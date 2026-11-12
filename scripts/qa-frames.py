"""Viewport frames down the whole page.  usage: python scripts/qa-frames.py <width> <prefix> [#section]
With a section id, only that section is captured (in viewport-height steps) — faster for iteration.
Frames go to $QA_OUT (default: <system temp>/pg-qa)."""
import asyncio, os, shutil, sys, tempfile, glob
from playwright.async_api import async_playwright

W = int(sys.argv[1]); pre = sys.argv[2]; only = sys.argv[3] if len(sys.argv) > 3 else None
OUT = os.environ.get('QA_OUT', os.path.join(tempfile.gettempdir(), 'pg-qa'))
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, f'{pre}_f*.png')): os.remove(f)

def chrome():
    for p in [os.environ.get('CHROME'), '/usr/bin/google-chrome',
              r'C:\Program Files\Google\Chrome\Application\chrome.exe',
              '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', shutil.which('chrome')]:
        if p and os.path.exists(p): return p
    return None

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chrome(), args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        H = 900 if W > 800 else 844
        pg = await b.new_page(viewport={'width': W, 'height': H})
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)[:300]))
        pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' else None)
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3000)
        y, end = 0, await pg.evaluate('document.documentElement.scrollHeight')
        if only:
            y, end = await pg.evaluate(f'(() => {{ const r = document.querySelector("{only}").getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; }})()')
            y = int(y)
        i = 0
        while y < end:
            await pg.evaluate(f'window.scrollTo(0,{y})'); await pg.wait_for_timeout(1100)
            await pg.screenshot(path=os.path.join(OUT, f'{pre}_f{i:02d}.png')); i += 1
            y += H
            if not only: end = await pg.evaluate('document.documentElement.scrollHeight')
        print('frames', i, 'height', end, 'out', OUT); print('\n'.join(errs[:10]))
        await b.close()

asyncio.run(main())
