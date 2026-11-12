"""Contact sheets from qa-frames output.  usage: python scripts/qa-sheet.py <prefix> [per-sheet]"""
import glob, os, sys, tempfile
from PIL import Image

pre = sys.argv[1]; per = int(sys.argv[2]) if len(sys.argv) > 2 else 4
OUT = os.environ.get('QA_OUT', os.path.join(tempfile.gettempdir(), 'pg-qa'))
for f in glob.glob(os.path.join(OUT, f'{pre}_sheet*.png')): os.remove(f)
fs = sorted(glob.glob(os.path.join(OUT, f'{pre}_f*.png')))
for k in range(0, len(fs), per):
    ims = [Image.open(f) for f in fs[k:k + per]]
    w, h = ims[0].size; sw, sh = w // 2, h // 2
    cols = 2 if w > 800 else per
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (sw * cols, sh * rows), 'white')
    for j, im in enumerate(ims): sheet.paste(im.resize((sw, sh)), ((j % cols) * sw, (j // cols) * sh))
    sheet.save(os.path.join(OUT, f'{pre}_sheet{k // per}.png'))
print(len(fs), 'frames ->', OUT)
