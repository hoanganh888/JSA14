'use strict';
/** Điểm vào server: API tại /api/*, giao diện tĩnh tại public/. */
const path = require('path');
const express = require('express');
const db = require('./db'); // khởi tạo DB + seed (chạy 1 lần khi require)
const { attachUser } = require('./auth');
const api = require('./api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '256kb' }));
app.use(attachUser(db));
app.use('/api', api);
app.use(express.static(path.join(__dirname, '..', 'public')));

// Trang gốc -> trang chủ
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.get('/muc-luc', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'muc-luc.html')));
app.get('/curriculum', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'muc-luc.html')));

app.use((req, res) => res.status(404).json({ error: 'Không tìm thấy.' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌱 Vườn Toán Lớp 3 đang chạy tại http://localhost:${PORT}`);
  console.log('   Tài khoản mẫu: hocsinh01 / 123456  •  giaovien01 / 123456');
});
