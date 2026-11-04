#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Résumés et planches lisibles des captures, sans remplacer les originaux."""
import portable_io
import base64
from io import BytesIO
import json
import os
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(os.environ["THOT_EVIDENCE"])
audit = ROOT / "after/audit-browser.json"
if audit.exists():
    report = json.loads(audit.read_text(encoding="utf-8"))
    print("AUDIT_RESULT_JSON " + json.dumps(report, ensure_ascii=True))
    # Six pages par planche ; captures du début, du milieu et du pied conservées.
    number = 0
    for suffix, tile in [("-390-top.png", (390, 900)), ("-390-middle.png", (390, 900)),
                         ("-390-footer.png", (390, 900)), ("-1440-top.png", (480, 300))]:
        images = sorted((ROOT / "after").glob("*" + suffix))
        for group in range(0, len(images), 6):
            batch = images[group:group + 6]
            width, height = tile
            sheet = Image.new("RGB", (width * 3, (height + 30) * 2), "white")
            draw = ImageDraw.Draw(sheet)
            for index, filename in enumerate(batch):
                x, y = (index % 3) * width, (index // 3) * (height + 30)
                with Image.open(filename) as source:
                    sheet.paste(source.convert("RGB").resize(tile), (x, y + 30))
                draw.text((x + 5, y + 8), filename.name, fill="black")
            output = ROOT / ("planche-" + str(number) + ".jpg")
            number += 1
            sheet.save(output, quality=70)
            data = base64.b64encode(output.read_bytes()).decode("ascii")
            print("THOT_IMAGE_BEGIN " + output.name)
            for index in range(0, len(data), 6000):
                print("THOT_IMAGE_DATA " + data[index:index + 6000])
            print("THOT_IMAGE_END")
    for filename in sorted((ROOT / "after").glob("roubaix-contrast-*.png")):
        print("THOT_IMAGE_BEGIN " + filename.name)
        print("THOT_IMAGE_DATA " + base64.b64encode(filename.read_bytes()).decode("ascii"))
        print("THOT_IMAGE_END")
functional = ROOT / "functional/recette-site.json"
if functional.exists():
    print("FUNCTIONAL_RESULT_JSON " + functional.read_text(encoding="utf-8").replace("\n", " "))
perf = ROOT / "performance/lighthouse-summary.json"
if perf.exists():
    print("PERFORMANCE_RESULT_JSON " + perf.read_text(encoding="utf-8").replace("\n", " "))
