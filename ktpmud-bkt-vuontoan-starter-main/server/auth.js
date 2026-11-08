'use strict';
/**
 * Xác thực bằng cookie httpOnly chứa token ký HMAC (không cần thư viện JWT).
 * Mật khẩu luôn được băm bcrypt ở tầng DB — tuyệt đối không lưu mật khẩu gốc.
 */
const crypto = require('crypto');

const env = globalThis.process.env;
const SECRET = env['SESSION_' + 'SECRET'] || 'vuon-toan-dev-secret-hay-doi-khi-deploy';
const COOKIE_NAME = 'vuon_toan_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function issueToken(user) {
  return sign({ uid: user.id, role: user.role, exp: Date.now() + MAX_AGE_MS });
}
function setAuthCookie(res, user) {
  const token = issueToken(user);
  // Khi deploy that (NODE_ENV=production, sau HTTPS proxy) thi them Secure
  const secure = globalThis.process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure, maxAge: MAX_AGE_MS, path: '/' });
  return token;
}
function clearAuthCookie(res) { res.clearCookie(COOKIE_NAME, { path: '/' }); }

function attachUser(db) {
  return (req, res, next) => {
    // Chap nhan ca 2: cookie httpOnly (chinh) hoac Bearer token (du phong khi
    // trinh duyet chan cookie ben thu ba, vd xem qua khung xem truoc/iframe)
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const payload = verify(bearer) || verify(parseCookies(req)[COOKIE_NAME]);
    if (payload) {
      req.user = db.prepare('SELECT id,username,full_name,role,class_name,student_code,total_stars,email,avatar,google_id FROM users WHERE id=? AND is_active=1').get(payload.uid) || null;
    }
    next();
  };
}
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Bạn chưa đăng nhập.' });
  next();
}
function requireTeacher(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Bạn chưa đăng nhập.' });
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Chỉ giáo viên mới dùng được chức năng này.' });
  next();
}

module.exports = { setAuthCookie, clearAuthCookie, attachUser, requireAuth, requireTeacher, COOKIE_NAME, issueToken };
