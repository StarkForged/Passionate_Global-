"""Favicon + web-app icons (launch 3.2). Run after build-brand.py: python scripts/build-icons.py

Writes to public/:
  favicon.ico            16/32/48, the FLAT logo mark (the 3D logo is too detailed at favicon sizes)
  icon-192.png, icon-512.png   the solid 3D logo on white, ~22% padding so it also works as a maskable icon
Sources (not deployed): assets-src/brand/logo-mark.png (flat mark), assets-src/brand/logo-3d-solid.png (3D master).
Replace the flat mark with the official SVG when the client supplies it (then also add public/favicon.svg).
"""
import os
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, PUB = os.path.join(ROOT, 'assets-src', 'brand'), os.path.join(ROOT, 'public')

# favicon.ico: flat mark, square canvas, transparent
mark = Image.open(os.path.join(SRC, 'logo-mark.png')).convert('RGBA')
mark = mark.crop(mark.getbbox())
side = max(mark.size)
sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
sq.alpha_composite(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
sq.save(os.path.join(PUB, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])

# 192/512: same treatment as apple-touch-icon (build-brand.py), white background
solid = Image.open(os.path.join(SRC, 'logo-3d-solid.png')).convert('RGBA')
a = np.array(solid)
H, W = a.shape[:2]
a[int(H * .75):, int(W * .85):, 3] = 0  # sparkle watermark in the source (see build-brand.py)
a[a[:, :, 3] < 6, 3] = 0
solid = Image.fromarray(a)
solid = solid.crop(solid.getbbox())
for n in (192, 512):
    ico = Image.new('RGBA', (n, n), (255, 255, 255, 255))
    s = solid.copy()
    s.thumbnail((round(n * .56), round(n * .56)), Image.LANCZOS)
    ico.alpha_composite(s, ((n - s.width) // 2, (n - s.height) // 2))
    ico.convert('RGB').save(os.path.join(PUB, f'icon-{n}.png'), optimize=True)
print('favicon.ico, icon-192.png, icon-512.png written')
