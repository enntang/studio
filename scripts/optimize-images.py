#!/usr/bin/env python3
"""把手動放進 public/ 的大圖轉成 WebP 並縮到實際顯示需要的尺寸。

只處理「人工放置」的圖片。public/work-images 與 public/hero-images 是
scripts/notion-sync 從 Notion 下載產生的，動了會在下次同步時被蓋回 PNG，
那些要優化必須改同步腳本本身。

用法：python3 scripts/optimize-images.py
"""
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# (原始檔, 目標最大寬度)。寬度取「版面上最大顯示寬度 × 2」以應付高解析螢幕
TARGETS = [
    ('public/about-illustration.png', 2048),  # About 主視覺，版面上最寬 1024
    ('public/service-images/UIUX.png', 800),
    ('public/service-images/illustration.png', 800),
    ('public/service-images/graphic.png', 800),
]

QUALITY = 82  # 這種帶筆刷質感的插畫在 82 幾乎看不出差異


def human(n):
    return f'{n / 1024 / 1024:.2f} MB' if n > 1024 * 1024 else f'{n / 1024:.0f} KB'


total_before = total_after = 0
print(f'{"檔案":<44}{"原始":>12}{"WebP":>12}{"縮減":>8}')
print('-' * 76)

for rel, max_w in TARGETS:
    src = os.path.join(ROOT, rel)
    if not os.path.exists(src):
        print(f'{rel:<44}{"缺檔，略過":>12}')
        continue

    dst = os.path.splitext(src)[0] + '.webp'
    before = os.path.getsize(src)

    img = Image.open(src)
    # 這些插畫都有透明背景，一律保留 alpha
    if img.mode not in ('RGBA', 'LA'):
        img = img.convert('RGBA')
    if img.width > max_w:
        h = round(img.height * max_w / img.width)
        img = img.resize((max_w, h), Image.LANCZOS)

    img.save(dst, 'WEBP', quality=QUALITY, method=6)
    after = os.path.getsize(dst)
    total_before += before
    total_after += after

    print(f'{rel:<44}{human(before):>12}{human(after):>12}{f"-{round((1 - after / before) * 100)}%":>8}')
    print(f'{"  → " + os.path.relpath(dst, ROOT):<44}{"":>12}{f"{img.width}×{img.height}":>12}')

print('-' * 76)
if total_before:
    print(f'{"合計":<44}{human(total_before):>12}{human(total_after):>12}'
          f'{f"-{round((1 - total_after / total_before) * 100)}%":>8}')
