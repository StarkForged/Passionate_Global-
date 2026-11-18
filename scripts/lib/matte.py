"""Classical portrait matting for plain studio backgrounds (no ML model needed).

How it works: the background is modelled as a smooth 2nd-order colour field fitted to the top / side borders;
each pixel's CIELAB distance to it gives a trimap. Background = low-distance pixels connected to the top/side
edges (`conn` threshold; the bottom edge is the body). Largest foreground blob, holes filled; a soft alpha ramp
(`lo`..`hi`) in a 3px band at the boundary, ~1px feather, `choke` to kill halos, and colour decontamination
F = (I - (1-a)B) / a so no background tint stays on hair edges.
Lower `conn` if light clothing touching the background gets eaten (e.g. a white collar).
Used by scripts/optimise-images.py when rembg is not installed.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def srgb2lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)

def matte(img, lo=5, hi=28, conn=12, choke=0.2):
    """Cut a person out of a plain studio background. Returns an RGBA PIL image."""
    im = np.asarray(img.convert('RGB')).astype(float)
    H, W = im.shape[:2]
    lab = srgb2lab(im)
    # border samples: top band + side bands down to 60% height (bottom edge = body)
    m = np.zeros((H, W), bool); b = max(6, W // 60)
    m[:b, :] = True; m[:int(H * .6), :b] = True; m[:int(H * .6), -b:] = True
    yy, xx = np.mgrid[0:H, 0:W]; u, v = xx / W, yy / H
    basis = lambda u, v: np.stack([np.ones_like(u), u, v, u * u, v * v, u * v], -1)
    A = basis(u[m], v[m])
    bg = np.zeros_like(im); bgl = np.zeros_like(lab)
    for c in range(3):
        k, *_ = np.linalg.lstsq(A, im[..., c][m], rcond=None); bg[..., c] = basis(u, v) @ k
    bgl = srgb2lab(np.clip(bg, 0, 255))
    d = np.sqrt(((lab - bgl) ** 2 * np.array([1.0, 1.4, 1.4])).sum(-1))
    d = ndi.gaussian_filter(d, 0.7)
    # background = connected to the top / side borders through low-distance pixels
    lowish = d < conn
    seeds = np.zeros_like(lowish); seeds[0, :] = True; seeds[:int(H * .6), 0] = True; seeds[:int(H * .6), -1] = True
    lab_, n = ndi.label(lowish)
    ids = np.unique(lab_[seeds & lowish]); ids = ids[ids > 0]
    bgreg = np.isin(lab_, ids)
    fg = ~bgreg
    # keep the largest foreground blob, fill holes
    l2, n2 = ndi.label(fg)
    if n2 > 1:
        sizes = ndi.sum(fg, l2, range(1, n2 + 1)); fg = l2 == (1 + np.argmax(sizes))
    fg = ndi.binary_fill_holes(fg)
    # soft alpha inside a thin band around the boundary
    alpha = np.clip((d - lo) / (hi - lo), 0, 1)
    edge = ndi.binary_dilation(fg, iterations=3) & ~ndi.binary_erosion(fg, iterations=3)
    a = np.where(fg, 1.0, 0.0)
    a = np.where(edge, alpha * ndi.binary_dilation(fg, iterations=3), a)
    a = ndi.gaussian_filter(a, 0.6)  # ~1px feather
    a = np.clip((a - choke) / (1 - choke), 0, 1)
    # colour decontamination: F = (I - (1-a) B) / a at the edge
    with np.errstate(divide='ignore', invalid='ignore'):
        F = np.where(a[..., None] > 0.05, (im - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 0.05), im)
    F = np.where(edge[..., None], np.clip(F, 0, 255), im)
    rgba = np.dstack([F, a * 255]).round().astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')

