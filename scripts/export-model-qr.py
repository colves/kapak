"""Export transparent model QR pairs; pip install qrcode==8.2 zxing-cpp==3.1.1 Pillow."""
import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET

import qrcode
import zxingcpp
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('output', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
rows = json.loads((root / 'docs/kapak-linkleri.json').read_text(encoding='utf-8'))
scale = 24
args.output.mkdir(parents=True, exist_ok=True)
report = []
for row in rows:
    name = row['model'].lower()
    if any(c in name for c in '/\\:*?"<>|'):
        raise ValueError(f'Invalid model filename: {name}')
    folder = args.output / name
    folder.mkdir(exist_ok=True)
    png, svg = folder / f'{name}.png', folder / f'{name}.svg'
    if png.exists() or svg.exists():
        raise FileExistsError(f'Existing QR files: {folder}')
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, border=4)
    qr.add_data(row['url'])
    qr.make(fit=True)
    matrix = qr.get_matrix()
    units = len(matrix)
    image = Image.new('RGBA', (units * scale, units * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    rects = []
    for y, line in enumerate(matrix):
        for x, dark in enumerate(line):
            if dark:
                draw.rectangle((x*scale, y*scale, (x+1)*scale-1, (y+1)*scale-1), fill=(0, 0, 0, 255))
                rects.append(f'<rect x="{x}" y="{y}" width="1" height="1"/>')
    image.save(png, dpi=(600, 600), optimize=True)
    svg.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{units*scale}" height="{units*scale}" viewBox="0 0 {units} {units}" shape-rendering="crispEdges">\n<g fill="#000000">\n' + '\n'.join(rects) + '\n</g>\n</svg>\n', encoding='utf-8')
    # Reopen both saved files. Rasterize the actual SVG rectangles independently.
    saved = Image.open(png).convert('RGBA')
    assert set(saved.getchannel('A').getdata()) == {0, 255}
    vector = ET.parse(svg).getroot()
    svg_image = Image.new('RGBA', saved.size, (0, 0, 0, 0))
    svg_draw = ImageDraw.Draw(svg_image)
    for rect in vector.iter('{http://www.w3.org/2000/svg}rect'):
        x, y = int(rect.attrib['x']), int(rect.attrib['y'])
        svg_draw.rectangle((x*scale, y*scale, (x+1)*scale-1, (y+1)*scale-1), fill=(0,0,0,255))
    assert saved.tobytes() == svg_image.tobytes()
    for candidate in (saved, svg_image):
        for background in ('#FF9900', '#CCCCCC'):
            composite = Image.new('RGBA', saved.size, background)
            composite.alpha_composite(candidate)
            result = zxingcpp.read_barcode(composite.convert('RGB'))
            assert result and result.text == row['url'], f'QR decode mismatch: {name}'
    report.append({'model': row['model'], 'url': row['url'], 'folder': name, 'verified': True})
(args.output / 'baglanti-kontrolu.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
(args.output / 'KULLANIM.txt').write_text('Her model klasöründe şeffaf arka planlı siyah PNG ve SVG bulunur.\nBaskı için SVG önerilir. Kenarlardaki dört modüllük şeffaf boşluğu kesmeyin; bu alanın altında yazı veya desen olmasın.\nAçık, düz renk zemin kullanın. Koyu zemin siyah kodun okunmasını zorlaştırır.\nKodlar turuncu (#FF9900) ve açık gri (#CCCCCC) zemin üzerinde otomatik okutularak doğrulandı.\nBaskıdan önce gerçek boyutta bir örneği telefonla okutun.\n', encoding='utf-8')
print(f'{len(report)} model, {len(report)*2} transparent files, {len(report)*4} successful decode checks: {args.output}')
