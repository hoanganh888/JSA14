#!/usr/bin/env node
/**
 * Đóng gói Tailwind thành CSS tĩnh (Đợt 3) để web chạy được khi không có Internet.
 * Theme được lấy từ chính public/assets/js/tailwind.config.js (1 nguồn duy nhất),
 * quét toàn bộ class trong thư mục public (HTML + JS, kể cả class sinh bằng JS).
 * Chạy: npm run build:css  (cần chạy lại khi thêm class Tailwind mới vào giao diện)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const cfgSource = fs.readFileSync(path.join(ROOT, 'public/assets/js/tailwind.config.js'), 'utf8');
const theme = eval('(' + cfgSource.replace(/^[\s\S]*?tailwind\.config\s*=\s*/, '').replace(/;\s*$/, '') + ')');

const tmpConfig = path.join(ROOT, 'tailwind.build.config.js');
fs.writeFileSync(tmpConfig, `module.exports = ${JSON.stringify({
  content: ['./public/**/*.html', './public/**/*.js'],
  darkMode: theme.darkMode || 'class',
  theme: theme.theme,
}, null, 2)};\n`);

const inputCss = path.join(ROOT, 'tools/tailwind.input.css');
fs.writeFileSync(inputCss, `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n` +
  fs.readFileSync(path.join(ROOT, 'public/assets/css/app.css'), 'utf8'));

const out = path.join(ROOT, 'public/assets/css/tailwind.build.css');
execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tailwindcss', '-c', tmpConfig, '-i', inputCss, '-o', out, '--minify'],
  { cwd: ROOT, stdio: 'inherit' });
fs.rmSync(tmpConfig, { force: true }); fs.rmSync(inputCss, { force: true });
console.log(`Đã tạo ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
