---
title: "Tài liệu Kiến trúc & Dữ liệu Chuẩn — Track B (Vườn Toán Lớp 3)"
document_id: "KTPMUD-BKT-TRACKB-ARCHITECTURE-REFERENCE"
author_owner: "Claude, trích xuất trực tiếp từ mã nguồn thật ktpmud-bkt-vuontoan-starter"
version: "1.0.0"
date: "2026-11-02"
status: "Tài liệu tham khảo cung cấp sẵn cho sinh viên — mô tả hệ thống HIỆN CÓ, không phải thiết kế giải pháp"
language: "vi"
target_repository: "fossbk-spec/ktpmud-bkt-vuontoan-starter"
target_path: "docs/architecture-reference.md"
---

# Tài liệu Kiến trúc & Dữ liệu Chuẩn — Track B

> **Mục đích tài liệu này:** mô tả CHÍNH XÁC hệ thống hiện có (trích trực tiếp
> từ mã nguồn, không suy diễn), để nhóm không phải tốn thời gian đọc ngược
> toàn bộ codebase từ đầu. Đây **không phải** thiết kế sẵn cho dạng bài mới —
> việc phân tích "nên mở rộng chỗ nào, theo cách nào" vẫn là phần sinh viên
> phải tự làm và được chấm điểm cao nhất (xem rubric trong đề thi).

## 1. Kiến trúc tổng quan

Express (Node.js) + `better-sqlite3` (đồng bộ, không async driver) + giao diện
tĩnh HTML/CSS/JS thuần (không framework frontend). Server render JSON API,
client gọi `fetch()` và tự dựng DOM. Không có ORM — toàn bộ truy vấn là SQL
thuần qua `db.prepare(...)`.

```text
public/*.html + public/assets/js/pages/*.js   <-- frontend tĩnh
          |  fetch('/api/...')
server/api.js (route handlers)  --->  server/db.js (schema + truy vấn SQLite)
server/auth.js (session/cookie — NGOÀI PHẠM VI, không được sửa)
```

## 2. Data model liên quan (trích nguyên văn `server/db.js`)

Chỉ liệt kê bảng liên quan tới luồng luyện tập/chấm điểm — bỏ qua bảng
`users`/`assignments`/`game_scores` không cần cho dạng bài mới.

```sql
CREATE TABLE IF NOT EXISTS lessons (
  id           TEXT PRIMARY KEY,
  number       INTEGER NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  topic        TEXT DEFAULT '',
  sort_order   INTEGER NOT NULL,
  unlock_after TEXT
);

CREATE TABLE IF NOT EXISTS question_sets (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  kind             TEXT NOT NULL DEFAULT 'exercise',
  lesson_id        TEXT REFERENCES lessons(id),
  star_reward      INTEGER NOT NULL DEFAULT 40,
  duration_minutes INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questions (
  id             TEXT PRIMARY KEY,
  set_id         TEXT NOT NULL,
  lesson_id      TEXT,
  type           TEXT NOT NULL,     -- xem Mục 3: cac gia tri hien co
  prompt         TEXT NOT NULL,
  options_json   TEXT,              -- chi dung cho type='multiple-choice'
  correct_answer TEXT NOT NULL,     -- SO SANH CHUOI, xem Muc 4
  points         INTEGER NOT NULL DEFAULT 1,
  category       TEXT DEFAULT '',
  sort_order     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  kind          TEXT NOT NULL,
  ref_id        TEXT NOT NULL,      -- = question_sets.id
  score_percent INTEGER NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_count   INTEGER NOT NULL DEFAULT 0,
  stars_earned  INTEGER NOT NULL DEFAULT 0,
  duration_sec  INTEGER DEFAULT 0,
  answers_json  TEXT DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS progress (
  user_id     INTEGER NOT NULL REFERENCES users(id),
  lesson_id   TEXT NOT NULL REFERENCES lessons(id),
  best_score  INTEGER NOT NULL DEFAULT 0,
  completed   INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (user_id, lesson_id)
);
```

Dữ liệu khởi tạo (`data/seed.json`) chứa `questionSets` dạng object, mỗi set
có mảng `questions` — ví dụ thật (rút gọn từ seed thật):

```json
{
  "phieu-bai-9-10": {
    "lessonId": "bai-10",
    "title": "Phiếu bài tập: Bảng nhân 6 & Bảng chia 6",
    "kind": "exercise",
    "questions": [
      { "id": "compare-1", "type": "compare", "prompt": "6 × 4 ? 6 × 3 + 6", "correctAnswer": "=", "points": 5 },
      { "id": "input-1", "type": "input", "prompt": "54 : 6 = ?", "correctAnswer": "9", "points": 5 },
      { "id": "paint-1", "type": "paint", "prompt": "6 × 2", "correctAnswer": "green", "points": 3 }
    ]
  }
}
```

## 3. Các `type` câu hỏi đã có (dùng đúng 4 giá trị này trong code hiện tại)

| `type` | Ý nghĩa | `correct_answer` lưu gì |
|---|---|---|
| `multiple-choice` | Trắc nghiệm, có `options` | chữ cái/giá trị đáp án đúng |
| `input` | Điền số | chuỗi số, ví dụ `"9"` |
| `compare` | Điền dấu so sánh | `"="`, `"<"`, hoặc `">"` |
| `paint` | Tô màu theo kết quả | tên màu, ví dụ `"green"` |

**Không có type nào biểu diễn một khoảng/range đáp án** — đây là điểm cần
phân tích/thiết kế cho dạng bài "Ước lượng trước khi tính đúng" (xem Mục 5).

## 4. Luồng nộp bài & chấm điểm (trích nguyên văn `server/api.js`)

```js
router.post('/submissions', requireAuth, (req, res) => {
  const { setId, answers = {}, durationSec = 0 } = req.body || {};
  // ... lấy meta bộ bài + danh sách questions theo set_id ...
  const detail = questions.map(q => {
    const given = answers[q.id] == null ? '' : String(answers[q.id]).trim().toLowerCase();
    const ok = given === String(q.correct_answer).trim().toLowerCase();   // <-- SO SANH CHUOI CHINH XAC
    // ...
  });
  // ghi vao bang attempts + cap nhat progress + cong sao
});
```

**Điểm mấu chốt (bắt buộc đọc kỹ trước khi thiết kế):** chấm điểm hiện tại là
**so sánh chuỗi chính xác** (`given === correct_answer`, đã lowercase + trim).
Không có khái niệm "gần đúng" hay "trong khoảng cho phép". Muốn chấm một câu
trả lời dạng ước lượng (ví dụ "khoảng 40-50") theo đúng tinh thần B-03 trong
đề thi (*"Quy tắc tạo và chấm ước lượng được mô tả rõ, tất định và test
được"*), nhóm cần tự quyết định và thiết kế một trong các hướng (không phải
hướng dẫn, chỉ liệt kê để gợi mở):

- thêm `type` mới (vd `'estimate'`) với cách mã hoá khoảng hợp lệ trong
  `correct_answer` hoặc một cột mới, rồi sửa logic chấm cho type này;
- hay một cách tiếp cận khác nhóm tự đề xuất và giải trình được.

Quyết định này — và lý do chọn nó — chính là phần được chấm điểm cao nhất
trong rubric (Mục "Kiến trúc & quyết định thiết kế"), không phải việc chọn
đúng/sai một đáp án kỹ thuật cụ thể.

## 5. API endpoint liên quan (CHỈ các endpoint cần cho dạng bài mới)

| Method | Path | Việc gì |
|---|---|---|
| GET | `/api/lessons` | Danh sách bài học + tiến độ người dùng |
| GET | `/api/question-sets/:setId/questions` | Lấy câu hỏi của 1 bộ đề (KHÔNG trả đáp án) |
| POST | `/api/submissions` | Nộp đáp án, server chấm, lưu `attempts`+`progress`, cộng sao |
| GET | `/api/me/progress` | Tiến độ của người dùng hiện tại |

**Ngoài phạm vi, không được sửa (B-07 trong đề thi):** mọi route `/api/auth/*`,
`/api/teacher/*`, `/api/admin/*` trong `server/api.js`, và toàn bộ
`server/auth.js`.

## 6. Frontend liên quan

`public/assets/js/pages/exercise.js` (~170 dòng) — dựng giao diện câu hỏi
theo `type`, thu thập đáp án người dùng, gọi `POST /api/submissions` để chấm,
hiển thị kết quả. Đây là nơi cần thêm UI cho dạng bài ước lượng (nhập khoảng,
hoặc UI phù hợp khác do nhóm thiết kế).

## 7. Việc KHÔNG được tự suy diễn

- Không tự đổi nghĩa 4 `type` hiện có — chỉ thêm, không sửa hành vi cũ (tránh
  phá các bộ câu hỏi hiện có).
- Không tự đặt ngưỡng "sai số chấp nhận được" cho ước lượng nếu đề bài chính
  thức đã khoá một con số cụ thể — dùng đúng số trong đề; nếu đề không khoá,
  nhóm phải tự định nghĩa RÕ RÀNG, TẤT ĐỊNH và GIẢI TRÌNH được trong
  `DECISIONS.md`, không phải "có vẻ hợp lý".

## 8. Tài liệu tham khảo gốc

- `server/db.js`, `server/api.js`, `data/seed.json`,
  `public/assets/js/pages/exercise.js` — tất cả trích nguyên văn từ
  `fossbk-spec/ktpmud-bkt-vuontoan-starter` tại commit đã pin trong đề thi
  (`aca3ea934fadc02251c761443405546c7bc02fc7`).
- `HUONG-DAN-THEM-BAI.md` (trong cùng repo) — hướng dẫn thêm NỘI DUNG câu hỏi
  qua giao diện giáo viên (khác với thêm MỘT TYPE câu hỏi mới, là việc của
  BKT-2).
