#!/usr/bin/env python3
"""PNG fra scripts/nettsidebilder.mjs -> WebP i public/nettsted/, uten metadata.

  python3 -I scripts/til-webp.py <mappe med PNG> public/nettsted

Bredden er den sidene allerede bruker (2x for skarphet); høyden følger bildet. Skriptet skriver ut målene, så
width/height i sidene kan rettes. Ingen EXIF, XMP, ICC eller kommentarer (test/seo/nettsted.test.js sjekker det).
"""
import sys
from pathlib import Path
from PIL import Image

BREDDE = {'i-legg-til': 640, 'f-flere': 640, 'f-filtre': 1320, 'j-svar': 900, 'j-onsker': 1060,
          'p-metoder': 680, 'm-fordeling': 620, 'm-godkjenning': 620, 'j-verdi': 900}

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
for navn, bredde in BREDDE.items():
    p = src / f'{navn}.png'
    if not p.exists():
        print(f'mangler {p}')
        continue
    im = Image.open(p).convert('RGB')  # RGB uten alfa og uten ICC-profil
    hoyde = round(im.height * bredde / im.width)
    im = im.resize((bredde, hoyde), Image.LANCZOS)
    ren = Image.new('RGB', im.size)
    ren.paste(im)  # nytt bilde: ingenting av originalens info-felt følger med
    ren.save(dst / f'{navn}.webp', 'WEBP', quality=84, method=6)
    print(f'{navn}.webp {bredde}x{hoyde}')
