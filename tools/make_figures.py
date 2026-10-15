"""Rebuild images/ from the paper PDF (design-space.pdf, arXiv:2306.06043v2).

Raster panels are pulled out at their embedded resolution; Fig. 4, Fig. 5,
and Table 1 are vector, so they are rendered from the page.
Run from the repository root:  python3 tools/make_figures.py
Needs PyMuPDF (fitz) and Pillow.
"""
import io
import fitz
from PIL import Image

PDF = "design-space.pdf"
OUT = "images/"

# xref of each embedded panel, matched to its sub-figure by position on the page
PANELS = {
    "fig1a": 159, "fig1b": 162, "fig1c": 161, "fig1d": 160, "fig1e": 163, "fig1f": 164,
    "fig2a": 217, "fig2b": 216, "fig2c": 215, "fig2d": 214,
    "fig6a": 742, "fig6b": 741, "fig6c": 740, "fig6d": 739,
    "fig7a": 776, "fig7b": 774, "fig7c": 775, "fig7d": 773,
}
# page index, clip rectangle in points, zoom
RENDERS = {
    "fig4": (3, (44, 44, 286, 204), 8),
    "fig5": (4, (60, 47, 560, 368), 4),
}


def save(name, im):
    im = im.convert("RGB")
    if im.width > 1800:
        im = im.resize((1800, round(im.height * 1800 / im.width)), Image.LANCZOS)
    im.save(f"{OUT}{name}.webp", "WEBP", quality=88, method=6)
    print(name, im.size)


doc = fitz.open(PDF)
for name, xref in PANELS.items():
    pix = fitz.Pixmap(doc, xref)
    if pix.alpha or pix.n > 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    save(name, Image.open(io.BytesIO(pix.tobytes("png"))))

for name, (page, clip, zoom) in RENDERS.items():
    pix = doc[page].get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=fitz.Rect(*clip), alpha=False)
    save(name, Image.open(io.BytesIO(pix.tobytes("png"))))
