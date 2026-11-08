# Hướng dẫn thêm bài học / câu hỏi mới

> Mục tiêu: thêm nội dung mà **không phải sửa code**. Từ Đợt 2, cách chính là làm
> ngay trên web (Cách 0 dưới đây). Cách sửa `data/seed.json` chỉ còn dùng khi muốn
> thay đổi dữ liệu mẫu ban đầu của hệ thống.

## Cách 0 — Thêm bài & câu hỏi ngay trên web (khuyên dùng)

1. Đăng nhập bằng tài khoản giáo viên (`giaovien01`) -> vào **Góc Giáo Viên**.
2. Khung **Quản Lý Bài Học**: điền Số bài, Tên bài, Mô tả -> bấm **Thêm bài học**
   (chọn "Mở tự do" hoặc bài phải học trước ở ô khóa bài).
3. Khung **Quản Lý Bộ Đề & Câu Hỏi**: tạo bộ đề, nhớ chọn đúng bài vừa tạo ở ô gắn bài.
4. Chọn bộ đề ở ô "Câu hỏi của bộ", thêm từng câu hỏi (trắc nghiệm thì nhập các lựa chọn
   cách nhau bởi dấu phẩy, đáp án đúng là chữ cái A/B/C/D tương ứng).
5. Xong! Học sinh vào trang chủ sẽ thấy bài mới (nếu không bị khóa) và bấm vào làm bài
   ngay tại trang làm bài chung. Muốn sửa/xóa: dùng nút Sửa/Xóa ngay trong 2 khung trên.

## Cách 1 — Thêm bài học mới (hiện ở trang chủ)

Mở `data/seed.json`, thêm 1 phần tử vào mảng `lessons`:

```json
{
  "id": "bai-16",
  "number": 16,
  "title": "Ôn tập bảng nhân, bảng chia",
  "description": "Ôn tập tổng hợp các bảng nhân, chia đã học.",
  "topic": "Chủ đề 2: Bảng nhân & bảng chia",
  "unlockAfter": "bai-15"
}
```

- `id`: viết liền không dấu, không trùng bài khác.
- `unlockAfter`: id của bài phải hoàn thành trước (để trống `null` nếu mở tự do).

Sau đó nạp lại dữ liệu (chỉ làm khi đang phát triển, vì bước này tạo lại CSDL từ đầu):

```bash
npm run reset-db
npm start
```

## Cách 2 — Thêm câu hỏi vào bộ đề có sẵn

Trong `data/seed.json` → `questionSets` → chọn bộ (`phieu-bai-9-10` = phiếu luyện tập,
`bai-15-kiem-tra` = đề kiểm tra 20 câu) → thêm vào `questions`:

```json
{ "id": "exam-21", "type": "multiple-choice", "prompt": "7 × 6 bằng bao nhiêu?",
  "options": ["36", "42", "48", "40"], "correctAnswer": "B", "points": 5, "category": "Tính nhẩm" }
```

- `correctAnswer` là **chữ cái** của đáp án đúng (A/B/C/D) — đáp án này chỉ nằm ở server,
  trình duyệt học sinh không bao giờ nhận được trước khi nộp bài.
- Với phiếu luyện tập, `type` gồm `compare` (điền dấu), `input` (điền số), `paint` (tô màu)
  và `correctAnswer` lần lượt là dấu/số/`green`/`yellow`.

Rồi chạy lại `npm run reset-db && npm start` như trên.

## Lưu ý khi đã có dữ liệu thật

Khi học sinh đã làm bài và có điểm trong `data/vuon-toan.db`, **đừng** `reset-db`
(sẽ mất điểm). Khi đó hãy sao lưu file `.db` trước và nhờ người quản trị chèn dữ liệu
mới trực tiếp, hoặc chờ Đợt 2 dùng trang quản trị trên web.
