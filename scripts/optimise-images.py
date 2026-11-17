"""Optimise photos for the site.  usage: python scripts/optimise-images.py
Sources (kept, never deployed, git-ignored): assets-src/team/*.pdf|jpg|png, assets-src/gallery/*.jpg|png
Outputs: public/img/team/<slug>.webp, public/img/gallery/<slug>.webp and src/data/images.json ({path: [w, h]}),
which the components use for width/height attributes.
- Team ID-card PDFs: only the portrait image (largest embedded image + its transparency mask) is extracted, so the
  card's personal details are never published. Blank/corrupt images are skipped with a warning.
- Gallery: EXIF-rotated, longest edge capped at GALLERY_MAX, WebP q76. Team: no upscaling, WebP q85 with alpha.
Needs: Pillow, PyMuPDF (pip install pillow pymupdf).
"""
import io, json, os, re, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, PUB = os.path.join(ROOT, 'assets-src'), os.path.join(ROOT, 'public', 'img')
GALLERY_MAX, TEAM_MAX = 1000, 900  # gallery cards render at most 380x340 (760x680 @2x)
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def blank(im):
    """True if the image carries no picture (corrupt streams decode to flat white)."""
    g = im.convert('L')
    lo, hi = g.getextrema()
    return hi - lo < 8

def pdf_portrait(path):
    import pymupdf
    doc = pymupdf.open(path)
    best = None
    for page in doc:
        for img in page.get_images(full=True):
            xref, smask, w, h = img[0], img[1], img[2], img[3]
            if best is None or w * h > best[2] * best[3]:
                best = (xref, smask, w, h)
        break  # portrait is on the front of the card
    if not best: return None
    base = pymupdf.Pixmap(doc, best[0])
    if base.colorspace and base.colorspace.n == 4: base = pymupdf.Pixmap(pymupdf.csRGB, base)
    if best[1]:
        base = pymupdf.Pixmap(base, pymupdf.Pixmap(doc, best[1]))
    return Image.open(io.BytesIO(base.tobytes('png')))

def save(im, out, q, maxe):
    im = ImageOps.exif_transpose(im)
    im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
    if max(im.size) > maxe: im.thumbnail((maxe, maxe), Image.LANCZOS)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, 'WEBP', quality=q, method=6)
    return im.size

def main():
    sizes, skipped = {}, []
    for kind, q, maxe in [('team', 85, TEAM_MAX), ('gallery', 76, GALLERY_MAX)]:
        d = os.path.join(SRC, kind)
        if not os.path.isdir(d): continue
        for f in sorted(os.listdir(d)):
            name, ext = os.path.splitext(f); ext = ext.lower()
            try:
                if ext == '.pdf': im = pdf_portrait(os.path.join(d, f))
                elif ext in ('.jpg', '.jpeg', '.png', '.webp'): im = Image.open(os.path.join(d, f))
                else: continue
            except Exception as e:
                skipped.append(f'{f} ({e})'); continue
            if im is None or blank(im):
                skipped.append(f'{f} (no usable image: blank or corrupt)'); continue
            s = slug(name)
            if kind == 'gallery':  # Award_Ceramony_2 -> award-ceremony-2 ; first photo gets -1
                s = s.replace('ceramony', 'ceremony')
                if not re.search(r'-\d+$', s): s += '-1'
            rel = f'img/{kind}/{s}.webp'
            w, h = save(im, os.path.join(PUB, kind, f'{s}.webp'), q, maxe)
            sizes[rel] = [w, h]
            print(f'{rel:45} {w}x{h}  {os.path.getsize(os.path.join(PUB, kind, s + ".webp")) // 1024} KB')
    with open(os.path.join(ROOT, 'src', 'data', 'images.json'), 'w', encoding='utf-8') as fh:
        json.dump(sizes, fh, indent=2)
    for s in skipped: print('SKIPPED', s, file=sys.stderr)

if __name__ == '__main__':
    main()
