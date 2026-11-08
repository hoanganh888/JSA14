> **Đây là bản sao đóng băng (starter) dùng cho Bài kiểm tra Hackathon (BKT-2 /
> Track B) môn Kỹ thuật Phần mềm Ứng dụng (KTPMUD) — KHÔNG phải ứng dụng thật
> đang vận hành, không kết nối tới dữ liệu/CSDL production thật.** Toàn bộ tên
> người và ảnh thật trong bản gốc đã được thay bằng dữ liệu hư cấu trước khi
> công khai repo này. Sinh viên làm việc trên fork của repo NÀY, nộp bài qua
> `ktpmud-project` theo đúng hướng dẫn `nop_bai.md` của KTPMUD — không PR vào
> ứng dụng Vườn Toán thật.

---

# 🌱 Vườn Toán Lớp 3 — Trường Tiểu học Hoàng Mai

Web học Toán lớp 3 gồm giao diện học sinh (bài học, luyện tập, kiểm tra, trò chơi, bảng xếp hạng)
và khu vực giáo viên (theo dõi lớp, cấp tài khoản). Đợt 1 đã nối **backend thật**:
đăng nhập/đăng xuất, chấm điểm trên server, lưu điểm & tiến độ vào cơ sở dữ liệu SQLite.

## 1. Cách chạy

Yêu cầu: máy có **Node.js 18+**.

```bash
npm install     # chỉ cần chạy 1 lần đầu
npm start       # mở http://localhost:3000
```

Lần chạy đầu, server tự tạo `data/vuon-toan.db` và nạp dữ liệu mẫu từ `data/seed.json`.

### Tài khoản mẫu

| Vai trò | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| Học sinh | `hocsinh01` … `hocsinh99` | `123456` | 99 tài khoản giả lập lớp 3A2, dùng cho test/demo hackathon — không phải học sinh thật |
| Giáo viên | `giaovien01` | `123456` | Vào thẳng Góc Giáo Viên |

> Khi đưa lên Internet thật: đổi mật khẩu các tài khoản mẫu, và đặt biến môi trường
> `SESSION_SECRET` bằng một chuỗi bí mật dài trước khi chạy `npm start`.

## 2. Cấu trúc thư mục

```
vuon-toan-lop-3/
├─ public/                    # Giao diện (server phục vụ thư mục này)
│  ├─ *.html                  # Mỗi trang 1 file, CHỈ chứa nội dung trang
│  └─ assets/
│     ├─ css/app.css          # CSS nền dùng chung (trước đây lặp trong 11 file)
│     └─ js/
│        ├─ tailwind.config.js  # Cấu hình Tailwind dùng chung 1 chỗ duy nhất
│        ├─ core/  (api.js = gọi API, app.js = đăng nhập + nối link, game-score.js = lưu điểm game)
│        ├─ components/ (navbar.js, sidebar.js=bản đồ link, footer.js dùng chung)
│        └─ pages/  (logic riêng từng trang: login.js, exercise.js, exam.js,...)
├─ public/lesson.html       # Trang làm bài chung cho bộ đề giáo viên tự tạo
├─ server/
│  ├─ index.js   # Điểm vào: API /api/* + phục vụ giao diện
│  ├─ db.js      # Tạo bảng + nạp dữ liệu mẫu vào SQLite
│  ├─ auth.js    # Cookie đăng nhập httpOnly, băm mật khẩu bcrypt
│  └─ api.js     # Toàn bộ API (đăng nhập, bài học, nộp bài, giáo viên...)
├─ data/
│  ├─ seed.json      # DỮ LIỆU GỐC: tài khoản mẫu, bài học, câu hỏi
│  └─ vuon-toan.db   # CSDL SQLite (tự sinh khi chạy; sao lưu = chép file này)
├─ tools/build-from-original.py  # Dựng lại giao diện từ bản gốc khi cần
├─ original-backup/  # NGUYÊN BẢN code cũ trước khi sửa (để đối chiếu/khôi phục)
└─ HUONG-DAN-THEM-BAI.md  # Cách thêm bài học/câu hỏi mới
```

## 3. API chính

| Method | Đường dẫn | Mô tả |
|---|---|---|
| POST | `/api/auth/login` · `/api/auth/logout` | Đăng nhập (cookie httpOnly) / đăng xuất |
| GET | `/api/auth/me` | Thông tin người đang đăng nhập |
| GET | `/api/lessons`, `/api/me/progress` | Bài học kèm tiến độ, khóa/mở theo thứ tự |
| GET | `/api/question-sets/:id/questions` | Câu hỏi — **không kèm đáp án** |
| POST | `/api/submissions` | Nộp bài; server chấm, lưu điểm, cộng sao theo tiến bộ |
| GET | `/api/leaderboard` | Bảng xếp hạng tính từ sao thật trong DB |
| GET/POST | `/api/teacher/students` | Giáo viên xem / cấp tài khoản học sinh |
| POST | `/api/teacher/students/:id/reset-password` | Giáo viên đặt lại mật khẩu |

## 4. Đã làm ở Đợt 1 (cốt lõi)

- Tách cấu hình Tailwind + CSS + JS dùng chung (trước: sao chép vào cả 11 file HTML);
  sửa tên file sai chính tả (`excersise→exercise`, `leadboard→leaderboard`, `schudule→schedule`).
- Nối lại toàn bộ link menu từng là `href="#"` sang trang thật.
- Backend Node.js + Express + SQLite; mật khẩu băm bcrypt; phân quyền học sinh/giáo viên.
- Trang chủ render bài học từ API; luyện tập & kiểm tra (20 câu, đếm giờ, tự nộp khi hết giờ)
  chấm điểm trên server và lưu tiến độ — tải lại trang không mất điểm.
- Góc Giáo Viên: xem danh sách lớp với điểm trung bình thật, **cấp tài khoản + đặt lại mật khẩu** cho học sinh.

## 5. Đợt 2 (đã hoàn thành)

- **4 mini-game chơi thật & lưu điểm**: Bắn Bóng (10 vòng phép nhân), Đua Xe (chọn cổng đáp án),
  Lật Thẻ Trí Nhớ (ghép cặp phép tính–kết quả), Câu Cá (10 vòng phép chia). Điểm gửi lên server,
  sao chỉ cộng theo phần vượt kỷ lục cũ của từng em.
- **Bảng xếp hạng render 100% từ dữ liệu thật** (`/api/leaderboard`): hạng, lượt làm bài, điểm TB, tổng sao.
- **Trang làm bài chung `lesson.html`**: mọi bộ đề giáo viên tạo đều làm được tại đây
  (`lesson.html?lesson=bai-16&set=...`), hỗ trợ trắc nghiệm / điền số / điền dấu / tô màu.
- **Quản trị trên web (Góc Giáo Viên)**: thêm/sửa/xóa bài học, tạo bộ đề, thêm/sửa/xóa câu hỏi,
  xuất báo cáo lớp ra CSV mở bằng Excel. Học sinh không vào được khu vực này.

## 6. Đợt 3 (đã hoàn thành)

- **Đăng nhập dự phòng 2 lớp**: cookie httpOnly + Bearer token trong trình duyệt
  (tự động dùng khi cookie bị chặn, ví dụ xem qua khung iframe/xem trước).
- **Thống kê lớp thật** (`/api/teacher/analytics`): 4 thẻ KPI đầu trang Góc Giáo Viên đã là số thật,
  thêm biểu đồ lượt làm bài 7 ngày, top 3 dạng bài hay sai nhất, tiến độ từng bài học.
  Hai khối biểu đồ/chẩn đoán mẫu cũ được ẩn để tránh nhầm số liệu.
- **CSS Tailwind tĩnh** (`assets/css/tailwind.build.css`, chạy `npm run build:css` để gói lại):
  phòng máy mất Internet giao diện vẫn giữ nguyên; CDN chỉ còn là lớp dự phòng.
- **Sẵn sàng deploy**: endpoint `/api/health`, hỗ trợ `DB_PATH` cho ổ đĩa bền,
  `Dockerfile` + `DEPLOY.md` (VPS/Render/Railway, việc cần làm với `SESSION_SECRET` và mật khẩu mẫu).

## 7. Nếu muốn làm tiếp

- Nhúng font/icon tại chỗ để offline 100% cả chữ và biểu tượng.
- Thực hiện deploy thật (cần tài khoản hosting/tên miền của trường).
- Thêm biểu đồ theo tuần/tháng và xuất phiếu bồi dưỡng PDF theo dạng bài hay sai.
