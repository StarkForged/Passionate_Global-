"""Optimise photos for the site.  usage: python scripts/optimise-images.py
Sources (kept, never deployed, git-ignored): assets-src/team/*.pdf|jpg|png, assets-src/gallery/*.jpg|png
Outputs: public/img/team/<slug>.webp, public/img/gallery/<slug>.webp and src/data/images.json ({path: [w, h]}),
which the components use for width/height attributes.
- Team ID-card PDFs: only the portrait image (largest embedded image + its transparency mask) is extracted, so the
  card's personal details are never published. Blank/corrupt images are skipped with a warning.
- Gallery: EXIF-rotated, longest edge capped at GALLERY_MAX, WebP q76.
- Team (round 5 portrait treatment): every person becomes a transparent cut-out (rembg if installed, else the
  classical matte in scripts/lib/matte.py; photos that already have alpha are kept), framed identically from the
  landmarks in TEAM (eye line at EYE_Y of the frame, pupil distance = IPD of the frame height, 4:4.6 like the
  cards), then written as <slug>.webp (2x, max 960 wide) + <slug>-480.webp (1x). Never upscaled: a small source
  just gives a smaller file. The full-size cut-out is kept in assets-src/team/cutout/<slug>.png for inspection.
  New person: add the photo, add a TEAM entry (pupil midpoint x/y and pupil distance in source pixels; read them off the
  cut-out PNG),
  run this script, then set `photo: 'img/team/<slug>.webp'` in content.ts. Without an entry the head is framed
  from the cut-out's bounding box (good enough to preview).
Needs: Pillow, PyMuPDF, numpy, scipy (pip install pillow pymupdf numpy scipy). Optional: rembg[cpu].
"""
import io, json, os, re, sys
from PIL import Image, ImageOps
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, PUB = os.path.join(ROOT, 'assets-src'), os.path.join(ROOT, 'public', 'img')
GALLERY_MAX, TEAM_MAX = 1000, 900  # gallery cards render at most 380x340 (760x680 @2x)
# Team framing (round 5). eye = (x, y) midpoint between the pupils, ipd = pupil-to-pupil distance, source pixels
# (pupil distance, not head/chin: beards and hair volume would make the men look smaller).
# matte = (lo, hi, conn, choke) for scripts/lib/matte.py (see there). Hitesh comes from his ID card with alpha.
# IPD 11.5% of the frame height = the tightest scale that keeps every frame inside its photo (Anand is closest
# to the camera); with the eyes at 35% every head top lands at 11-12% of the frame.
EYE_Y, IPD, ASPECT = 0.35, 0.115, 4 / 4.6
TEAM_W = (480, 960)
TEAM = {
    'hitesh-vaishnav': dict(eye=(257, 149), ipd=53),
    'heena-vaishnav': dict(eye=(640, 393), ipd=102, matte=(5, 28, 12, .2)),
    'dixita-rajput': dict(eye=(559, 356), ipd=110, matte=(5, 30, 12, .25)),
    'anand-malhotra': dict(eye=(654, 391), ipd=152, matte=(4, 24, 7, .2)),
}
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

def cutout(im, cfg):
    im = ImageOps.exif_transpose(im)
    if 'A' in im.getbands() and im.convert('RGBA').getchannel('A').getextrema()[0] < 250:
        return im.convert('RGBA')  # already transparent (e.g. the ID-card portrait)
    try:
        from rembg import remove, new_session
        return remove(im.convert('RGB'), session=new_session('u2net_human_seg')).convert('RGBA')
    except ImportError:
        from matte import matte
        return matte(im, *cfg.get('matte', (5, 28, 12, .2)))

def frame(im, cfg):
    """Crop the cut-out to the shared portrait frame (transparent padding where the frame leaves the photo)."""
    W, H = im.size
    if 'eye' in cfg:
        (ex, ey), fh = cfg['eye'], cfg['ipd'] / IPD
        top = ey - EYE_Y * fh
    else:  # no landmarks: head top at 10%, body width = frame width
        l, t, r, b = im.getbbox(); fh = (r - l) / ASPECT; ex, top = (l + r) / 2, t - .1 * fh
    fw = fh * ASPECT
    box = tuple(round(v) for v in (ex - fw / 2, top, ex + fw / 2, top + fh))
    if box[3] > H + 2: print(f'  warning: frame runs {box[3] - H}px past the bottom of the photo (transparent strip)')
    return im.crop(box)

def team_portrait(im, s, sizes):
    cfg = TEAM.get(s, {})
    cut = cutout(im, cfg)
    os.makedirs(os.path.join(SRC, 'team', 'cutout'), exist_ok=True)
    cut.save(os.path.join(SRC, 'team', 'cutout', f'{s}.png'))
    fr = frame(cut, cfg)
    native = fr.width
    for i, w in enumerate(TEAM_W):
        w = min(w, native)  # never upscale
        if i == 0 and w == native and native <= TEAM_W[0]: continue  # source too small for two sizes
        out = fr.resize((w, round(fr.height * w / fr.width)), Image.LANCZOS)
        rel = f'img/team/{s}.webp' if i == len(TEAM_W) - 1 else f'img/team/{s}-{w}.webp'
        out.save(os.path.join(PUB, 'team', os.path.basename(rel)), 'WEBP', quality=82, method=6)
        sizes[rel] = list(out.size)
        print(f'{rel:45} {out.width}x{out.height}  {os.path.getsize(os.path.join(PUB, "team", os.path.basename(rel))) // 1024} KB')

def main():
    sizes, skipped, done_team = {}, [], set()
    for f in os.listdir(os.path.join(PUB, 'team')) if os.path.isdir(os.path.join(PUB, 'team')) else []:
        if f.endswith('.webp'): os.remove(os.path.join(PUB, 'team', f))  # stale sizes
    for kind, q, maxe in [('team', 85, TEAM_MAX), ('gallery', 76, GALLERY_MAX)]:
        d = os.path.join(SRC, kind)
        if not os.path.isdir(d): continue
        for f in sorted(os.listdir(d)):
            if os.path.isdir(os.path.join(d, f)): continue
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
            if kind == 'team':
                if s.replace('anandkumar', 'anand') in done_team or (ext == '.pdf' and any(
                        os.path.splitext(g)[0] == name and g != f for g in os.listdir(d))):
                    continue  # a photo beats the ID-card PDF of the same person
                s = s.replace('anandkumar', 'anand'); done_team.add(s)
                team_portrait(im, s, sizes); continue
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
