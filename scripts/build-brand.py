"""Brand assets (round 5): clean the 3D logo masters and export the web sizes.

Masters (not deployed): assets-src/brand/logo-3d-glass.png, logo-3d-solid.png (transparent, from the client's
3D glass logo). Writes public/img/brand/logo-3d-{glass,solid}-{256,600,1200}.webp trimmed to the logo,
public/apple-touch-icon.png (180, solid logo on white) and public/og-image.png (1200x630).
Run: python scripts/build-brand.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(ROOT, 'assets-src', 'brand'), os.path.join(ROOT, 'public', 'img', 'brand')

def clean(im):
    """Remove the small 4-point sparkle watermark in the bottom-right corner and isolated specks."""
    a = np.array(im)
    H, W = a.shape[:2]
    a[int(H * .75):, int(W * .85):, 3] = 0
    a[a[:, :, 3] < 6, 3] = 0
    im = Image.fromarray(a)
    return im.crop(im.getbbox())

os.makedirs(OUT, exist_ok=True)
logos = {}
for kind in ('glass', 'solid'):
    im = clean(Image.open(os.path.join(SRC, f'logo-3d-{kind}.png')).convert('RGBA'))
    logos[kind] = im
    for w in (256, 600, 1200):
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(os.path.join(OUT, f'logo-3d-{kind}-{w}.webp'), 'WEBP', quality=86, method=6)
        print(kind, w, r.size)

solid = logos['solid']
# apple-touch-icon: solid logo on white, ~16% padding
ico = Image.new('RGBA', (180, 180), (255, 255, 255, 255))
s = solid.copy(); s.thumbnail((124, 124), Image.LANCZOS)
ico.alpha_composite(s, ((180 - s.width) // 2, (180 - s.height) // 2))
ico.convert('RGB').save(os.path.join(ROOT, 'public', 'apple-touch-icon.png'), optimize=True)

# OG image 1200x630: deep navy, soft blue glow, solid 3D logo left, wordmark + line right
W, H = 1200, 630
og = Image.new('RGBA', (W, H), (0, 9, 21, 255))
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - 330) / 520.0) ** 2 + ((yy - 330) / 420.0) ** 2)
glow = np.clip(1 - d, 0, 1) ** 2
base = np.array([0, 9, 21], float); blue = np.array([3, 97, 219], float)
rgb = base + (blue - base) * (glow[..., None] * .55)
og = Image.fromarray(np.dstack([rgb, np.full((H, W), 255)]).astype('uint8'), 'RGBA')
s = solid.copy(); s.thumbnail((420, 420), Image.LANCZOS)
shadow = Image.new('RGBA', og.size, (0, 0, 0, 0))
sh = Image.new('RGBA', s.size, (0, 0, 0, 0)); sh.putalpha(s.getchannel('A').point(lambda v: v * .55))
shadow.alpha_composite(sh, (120, 120 + 30)); shadow = shadow.filter(ImageFilter.GaussianBlur(28))
og.alpha_composite(shadow); og.alpha_composite(s, (120, (H - s.height) // 2))

def font(size, bold):
    for f in (['C:/Windows/Fonts/segoeuib.ttf', 'C:/Windows/Fonts/arialbd.ttf', '/System/Library/Fonts/Helvetica.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold
              else ['C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/arial.ttf', '/System/Library/Fonts/Helvetica.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']):
        if os.path.exists(f): return ImageFont.truetype(f, size)
    return ImageFont.load_default()

dr = ImageDraw.Draw(og)
x = 610
dr.text((x, 190), 'Passionate', font=font(72, True), fill=(255, 255, 255))
dr.text((x, 268), 'Global', font=font(72, True), fill=(90, 165, 255))
dr.line((x, 375, x + 64, 375), fill=(90, 165, 255), width=3)
dr.text((x, 398), 'Dedicated offshore teams for', font=font(30, False), fill=(207, 227, 255))
dr.text((x, 438), 'Recruitment Businesses', font=font(30, False), fill=(207, 227, 255))
og.convert('RGB').save(os.path.join(ROOT, 'public', 'og-image.png'), optimize=True)
print('apple-touch-icon + og-image written')
