# Hướng dẫn đưa Vườn Toán lên Internet

> Trạng thái hiện tại: web đã chạy hoàn chỉnh trên máy/localhost. Để học sinh vào được
> từ nhà, cần đặt server Node.js này lên một máy chủ có địa chỉ công khai.
> **Không** dùng được GitHub Pages/Netlify tĩnh vì web cần backend + CSDL.

## Việc bắt buộc trước khi public

1. Đặt biến môi trường `SESSION_SECRET` = một chuỗi bí mật dài, ngẫu nhiên (ký cookie đăng nhập).
2. Đăng nhập `giaovien01/123456` và tạo tài khoản giáo viên thật, sau đó nhờ quản trị vô hiệu
   tài khoản mẫu trong CSDL (hoặc đổi mật khẩu bằng cách đặt lại trong DB).
   Học sinh mẫu `hocsinh01` cũng nên đổi mật khẩu nếu giữ lại.
3. Chọn nơi chứa file CSDL **bền vững** (không bị xóa khi server khởi động lại):
   - Docker/VPS: gắn volume vào `/data` (Dockerfile đã cấu hình sẵn `DB_PATH=/data/vuon-toan.db`).
   - Render/Railway: gắn Persistent Disk/Volume và đặt biến `DB_PATH` trỏ vào thư mục đó.
   - Nếu không gắn ổ bền, mỗi lần deploy lại sẽ mất hết điểm học sinh.

## Cách A — VPS (ổn định nhất cho trường học)

```bash
# Trên VPS Ubuntu có Docker:
docker build -t vuon-toan .
docker run -d --name vuon-toan -p 3000:3000 \
  -e SESSION_SECRET="chuoi-bi-mat-cua-ban" \
  -v vuon-toan-data:/data vuon-toan
```

Sau đó trỏ tên miền về VPS và dùng Caddy/Nginx làm HTTPS (cookie đăng nhập cần HTTPS).

## Cách B — Render / Railway (dễ, không quản server)

1. Đưa thư mục này lên GitHub.
2. Tạo Web Service từ repo, môi trường Docker (repo đã có Dockerfile) hoặc Node:
   - Build: `npm ci` — Start: `npm start`
3. Thêm Persistent Disk (ví dụ mount tại `/data`) và đặt các biến:
   - `SESSION_SECRET` = chuỗi bí mật
   - `DB_PATH=/data/vuon-toan.db`
   - `NODE_ENV=production`
4. Kiểm tra `https://ten-mien-cua-ban/api/health` trả về `{"ok":true}` là server sống.

## Kiểm tra sau khi deploy

- Mở trang, đăng nhập `hocsinh01/123456` (trước khi đổi mật khẩu mẫu).
- Làm 1 bài luyện tập, tải lại trang — điểm vẫn còn là CSDL bền vững đã đúng.
- Tắt/bật lại service một lần và kiểm tra lại điểm để chắc chắn volume hoạt động.

## Chạy offline trong phòng máy (không Internet)

- Giao diện đã có CSS tĩnh `public/assets/css/tailwind.build.css` nên không cần CDN Tailwind.
- Chỉ còn font chữ/icon của Google Fonts cần Internet; mất mạng thì web vẫn dùng được,
  font sẽ lùi về font hệ thống và một số icon có thể hiển thị thành chữ — nên ưu tiên
  có mạng, hoặc cân nhắc nhúng font tại chỗ ở đợt sau.
- Sau khi sửa giao diện có thêm class Tailwind mới, chạy `npm run build:css` để gói lại CSS.
