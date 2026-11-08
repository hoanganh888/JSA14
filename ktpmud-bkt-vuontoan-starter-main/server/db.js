'use strict';
/**
 * Lớp truy cập dữ liệu SQLite.
 * - DB là 1 file duy nhất tại data/vuon-toan.db (sao lưu = sao chép file này).
 * - Lần chạy đầu tiên sẽ tự tạo bảng + nạp dữ liệu mẫu từ data/seed.json.
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Khi deploy lên hosting có ổ đĩa bền (persistent disk), đặt DB_PATH trỏ vào đó
// để không mất dữ liệu mỗi lần server khởi động lại.
const DB_PATH = globalThis.process.env['DB_' + 'PATH'] || path.join(__dirname, '..', 'data', 'vuon-toan.db');
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student','teacher')),
  class_name    TEXT DEFAULT '',
  student_code  TEXT DEFAULT '',
  total_stars   INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  email         TEXT,
  avatar        TEXT,
  google_id     TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS lessons (
  id           TEXT PRIMARY KEY,
  number       INTEGER NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  topic        TEXT DEFAULT '',
  sort_order   INTEGER NOT NULL,
  unlock_after TEXT
);
CREATE TABLE IF NOT EXISTS questions (
  id            TEXT PRIMARY KEY,
  set_id        TEXT NOT NULL,
  lesson_id     TEXT,
  type          TEXT NOT NULL,
  prompt        TEXT NOT NULL,
  options_json  TEXT,
  correct_answer TEXT NOT NULL,
  points        INTEGER NOT NULL DEFAULT 1,
  category      TEXT DEFAULT '',
  sort_order    INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS attempts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  kind          TEXT NOT NULL,
  ref_id        TEXT NOT NULL,
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
-- ĐỢT 2: bộ câu hỏi thành dữ liệu quản trị được (trước đây fix cứng trong code)
CREATE TABLE IF NOT EXISTS question_sets (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  kind             TEXT NOT NULL DEFAULT 'exercise',
  lesson_id        TEXT REFERENCES lessons(id),
  star_reward      INTEGER NOT NULL DEFAULT 40,
  duration_minutes INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS assignments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  set_id      TEXT NOT NULL REFERENCES question_sets(id),
  class_name  TEXT NOT NULL,
  due_date    TEXT,
  note        TEXT DEFAULT '',
  created_by  INTEGER REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE(set_id, class_name)
);
CREATE TABLE IF NOT EXISTS game_scores (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  game_id       TEXT NOT NULL,
  score         INTEGER NOT NULL DEFAULT 0,
  stars_earned  INTEGER NOT NULL DEFAULT 0,
  duration_sec  INTEGER DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`);

// Migration an toàn cho DB cũ trên máy chủ / persistent disk
try { db.exec('ALTER TABLE users ADD COLUMN email TEXT'); } catch (_) {}
try { db.exec('ALTER TABLE users ADD COLUMN avatar TEXT'); } catch (_) {}
try { db.exec('ALTER TABLE users ADD COLUMN google_id TEXT'); } catch (_) {}

/** Đợt 2: nạp metadata bộ câu hỏi cho cả DB cũ (đã tạo ở Đợt 1) lẫn DB mới. */
function seedQuestionSets() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM question_sets').get();
  if (c > 0) return;
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  const ins = db.prepare(`INSERT OR IGNORE INTO question_sets (id,title,kind,lesson_id,star_reward,duration_minutes) VALUES (?,?,?,?,?,?)`);
  for (const [id, set] of Object.entries(seed.questionSets)) {
    ins.run(id, set.title || id, set.kind || 'exercise', set.lessonId || null,
      set.kind === 'exam' ? 100 : 40, set.durationMinutes || 0);
  }
}

function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM users').get();
  if (c > 0) return;
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  const insertUser = db.prepare(`INSERT INTO users (username,password_hash,full_name,role,class_name,student_code,total_stars)
    VALUES (@username,@passwordHash,@fullName,@role,@className,@studentCode,@totalStars)`);
  const insertLesson = db.prepare(`INSERT INTO lessons (id,number,title,description,topic,sort_order,unlock_after)
    VALUES (@id,@number,@title,@description,@topic,@sortOrder,@unlockAfter)`);
  const insertQuestion = db.prepare(`INSERT INTO questions (id,set_id,lesson_id,type,prompt,options_json,correct_answer,points,category,sort_order)
    VALUES (@id,@setId,@lessonId,@type,@prompt,@optionsJson,@correctAnswer,@points,@category,@sortOrder)`);

  const tx = db.transaction(() => {
    for (const u of seed.users) {
      insertUser.run({ ...u, passwordHash: bcrypt.hashSync(u.password, 10) });
    }
    seed.lessons.forEach((l, i) => insertLesson.run({ ...l, sortOrder: i + 1, unlockAfter: l.unlockAfter || null }));
    for (const [setId, set] of Object.entries(seed.questionSets)) {
      set.questions.forEach((q, i) => insertQuestion.run({
        id: q.id, setId, lessonId: set.lessonId, type: q.type, prompt: q.prompt,
        optionsJson: q.options ? JSON.stringify(q.options) : null,
        correctAnswer: q.correctAnswer, points: q.points || 1,
        category: q.category || '', sortOrder: i + 1,
      }));
    }
    // Tiến độ mẫu khớp giao diện cũ của Bảo Nam (Bài 9: 100đ, Bài 10: 80đ)
    const nam = db.prepare("SELECT id FROM users WHERE username='hocsinh01'").get();
    if (nam) {
      const up = db.prepare(`INSERT INTO progress (user_id,lesson_id,best_score,completed) VALUES (?,?,?,?)
        ON CONFLICT(user_id,lesson_id) DO UPDATE SET best_score=excluded.best_score, completed=excluded.completed`);
      up.run(nam.id, 'bai-9', 100, 1);
      up.run(nam.id, 'bai-10', 80, 0);
    }
  });
  tx();
  console.log('[DB] Đã nạp dữ liệu mẫu từ data/seed.json');
}
seedIfEmpty();
seedQuestionSets();

// Đảm bảo thông tin Cô Lan Anh (GV Chủ nhiệm minh họa) và học sinh luôn được cập nhật chính xác
try {
  db.prepare("UPDATE users SET full_name = 'Cô Lan Anh (GV Chủ nhiệm minh họa)', class_name = '3A2' WHERE username = 'giaovien01'").run();
} catch (e) {}
try {
  db.prepare("UPDATE users SET full_name = 'Học sinh Lớp 3A2', class_name = '3A2' WHERE username = 'hocsinh01' AND (full_name = 'Bảo Nam' OR full_name = 'Nguyễn Bảo Nam')").run();
} catch (e) {}

module.exports = db;
