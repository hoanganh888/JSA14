#!/usr/bin/env python3
"""
Công cụ tách cấu trúc từ các file HTML gốc (original-backup/) thành project mới:
- Head dùng chung: Tailwind CDN + assets/js/tailwind.config.js + assets/css/app.css
- JS inline cuối mỗi trang -> public/assets/js/pages/<trang>.js
- Đổi tên file sai chính tả: excersise->exercise, leadboard->leaderboard, schudule->schedule
- Gắn thẻ bài học (data-lesson-*) vào thẻ bài ở trang chủ để JS render từ API
Chạy lại:  python3 tools/build-from-original.py   (chỉ cần khi muốn dựng lại từ bản gốc)
LƯU Ý: script này ghi đè public/*.html và bản gốc của pages/*.js — các bản đã
nâng cấp (login/exercise/exam/...) cần được khôi phục từ git hoặc sửa lại sau khi chạy.
"""
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
SRC, PUB = ROOT / "original-backup", ROOT / "public"

PAGES = {  # file gốc -> (file mới, tiêu đề tab, quyền truy cập)
    "index.html":     ("index.html",      "Vườn Toán Lớp 3 — Trang chủ", ""),
    "introduce.html": ("introduce.html",  "Giới thiệu — Vườn Toán Lớp 3", ""),
    "excersise.html": ("exercise.html",   "Luyện tập — Vườn Toán Lớp 3", ""),
    "exam.html":      ("exam.html",       "Kiểm tra — Vườn Toán Lớp 3", ""),
    "game.html":      ("game.html",       "Game Bóng Bay — Vườn Toán Lớp 3", ""),
    "game2.html":     ("game2.html",      "Game Đua Xe — Vườn Toán Lớp 3", ""),
    "game3.html":     ("game3.html",      "Game Nối Cặp — Vườn Toán Lớp 3", ""),
    "game4.html":     ("game4.html",      "Game Câu Cá — Vườn Toán Lớp 3", ""),
    "leadboard.html": ("leaderboard.html", "Bảng xếp hạng — Vườn Toán Lớp 3", ""),
    "schudule.html":  ("schedule.html",   "Góc giáo viên — Vườn Toán Lớp 3", "teacher"),
    "login.html":     ("login.html",      "Đăng nhập — Vườn Toán Lớp 3", ""),
}
FONT_LINKS = [
    '<link href="https://fonts.googleapis.com" rel="preconnect"/>',
    '<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>',
    '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>',
    '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>',
    '<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;1,6..12,400&amp;family=Quicksand:wght@600;700&amp;display=swap" rel="stylesheet"/>',
]

def annotate_lessons(soup):
    """Gắn data-lesson-id vào thẻ bài học ở trang chủ (dựa trên tiêu đề 'Bài N: ...')."""
    for h3 in soup.find_all("h3"):
        m = re.match(r"Bài (\d+):", h3.get_text(strip=True))
        if not m:
            continue
        lesson_id = f"bai-{m.group(1)}"
        h3["data-lesson-title"] = lesson_id
        sib = h3.find_next_sibling("p")
        if sib:
            sib["data-lesson-desc"] = lesson_id
        card = h3.find_parent("div", class_=re.compile(r"rounded-3xl"))
        if card:
            card["data-lesson-card"] = lesson_id
            card["id"] = f"lesson-{m.group(1)}"

for old, (new, title, role) in PAGES.items():
    html = (SRC / old).read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(html, "html.parser")
    page = new.replace(".html", "")

    # 1) Tách script riêng của trang (script inline cuối file) ra assets/js/pages/
    page_js = ""
    for s in soup.find_all("script"):
        if not s.get("src") and s.get("id") != "tailwind-config" and s.get_text(strip=True):
            page_js = s.get_text().strip()
            s.decompose()
    if page_js:
        out = PUB / "assets/js/pages" / f"{page}.js"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(f"/* Logic riêng của trang {new} (tách từ HTML gốc, giữ nguyên hành vi) */\n{page_js}\n", encoding="utf-8")

    if page == "index":
        annotate_lessons(soup)

    body = soup.body
    body_attrs = dict(body.attrs) if body else {}
    if page == "login":  # điền sẵn tài khoản mẫu để test nhanh (xóa được)
        u, p = soup.find(id="studentCodeInput"), soup.find(id="passwordField")
        if u: u["value"] = "hocsinh01"
        if p: p["value"] = "123456"
    if soup.footer:
        soup.footer["data-shared-footer"] = ""

    body_html = "".join(str(c) for c in body.contents) if body else ""
    cls = " ".join(body_attrs.get("class", [])) if isinstance(body_attrs.get("class"), list) else body_attrs.get("class", "")
    role_attr = f' data-require-role="{role}"' if role else ""

    doc = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{title}</title>
{chr(10).join(FONT_LINKS)}
<script src="https://cdn.tailwindcss.com"></script>
<script src="assets/js/tailwind.config.js"></script>
<link href="assets/css/app.css" rel="stylesheet"/>
</head>
<body class="{cls}" data-page="{page}"{role_attr}>
{body_html}
<script src="assets/js/core/api.js"></script>
<script src="assets/js/components/sidebar.js"></script>
<script src="assets/js/components/navbar.js"></script>
<script src="assets/js/components/footer.js"></script>
<script src="assets/js/core/app.js"></script>
{f'<script src="assets/js/pages/{page}.js"></script>' if page_js else ''}
</body>
</html>
"""
    (PUB / new).write_text(doc, encoding="utf-8")
    print(f"{old:18} -> public/{new} (+pages/{page}.js)" if page_js else f"{old:18} -> public/{new}")
print("Xong.")
