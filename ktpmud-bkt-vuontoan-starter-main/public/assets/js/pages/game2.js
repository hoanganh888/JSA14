/* Mini-game 2: Đua Xe Vượt Chướng Ngại (Đợt 2 — cổng đáp án sinh mới + lưu điểm)
 * Cách chơi giữ nguyên: lái xe (A/D hoặc nút) vào làn có cổng đáp án đúng rồi bấm Turbo.
 * Qua đúng cổng +100 điểm & +100m; sai cổng -20 điểm. Hết 45 giây -> lưu điểm. */
let currentLane = 1; // 0: Trái, 1: Giữa, 2: Phải
const car = document.getElementById('race-car-container');
const raceStartedAt = Date.now();
let raceScore = 0, raceDistance = 0, raceFinished = false, correctLane = 1;

const gateBox = document.querySelector('.absolute.top-10.inset-x-4');
const gateEls = gateBox ? [...gateBox.querySelectorAll('span')].filter(s => /^\d+$/.test(s.textContent.trim())) : [];
const operandEls = [...document.querySelectorAll('span')].filter(s => /^\d+$/.test(s.textContent.trim()) && s.className.includes('text-[44px]') && !gateBox?.contains(s));
const distanceEl = [...document.querySelectorAll('span, div, p')].find(e => /^\d+\s*\/1000m$/.test(e.textContent.trim()));
const comboEl = [...document.querySelectorAll('span, div')].find(e => /Combo x\d+/.test(e.textContent) && e.children.length <= 2);

function updateCarPosition() {
  if (!car) return;
  car.classList.remove('-translate-x-32', 'sm:-translate-x-40', 'translate-x-0', 'translate-x-32', 'sm:translate-x-40');
  if (currentLane === 0) car.classList.add('-translate-x-32', 'sm:-translate-x-40');
  else if (currentLane === 2) car.classList.add('translate-x-32', 'sm:translate-x-40');
  else car.classList.add('translate-x-0');
}
function steerLeft() { if (currentLane > 0) { currentLane--; updateCarPosition(); } }
function steerRight() { if (currentLane < 2) { currentLane++; updateCarPosition(); } }

function newGate() {
  const a = 6 + Math.floor(Math.random() * 4), b = 2 + Math.floor(Math.random() * 8);
  const answer = a * b;
  if (operandEls[0]) operandEls[0].textContent = String(a);
  if (operandEls[1]) operandEls[1].textContent = String(b);
  correctLane = Math.floor(Math.random() * 3);
  const options = [answer];
  while (options.length < 3) { const v = answer + [-8, -6, -2, 2, 6, 8][Math.floor(Math.random() * 6)]; if (!options.includes(v)) options.push(v); }
  // Đặt đáp án đúng vào làn đã chọn, 2 đáp án sai vào 2 làn còn lại
  const lanes = [0, 1, 2].filter(l => l !== correctLane);
  gateEls.forEach((el, i) => { if (gateEls.length >= 3) el.textContent = String(i === correctLane ? answer : options[lanes.indexOf(i) + 1] || answer + i + 2); });
  if (distanceEl) distanceEl.textContent = `${raceDistance} /1000m`;
  if (comboEl) comboEl.innerHTML = `<span class="material-symbols-outlined text-[18px]">local_fire_department</span> Điểm: ${raceScore}`;
}

function triggerTurbo() {
  if (!car || raceFinished) return;
  car.classList.add('scale-110');
  setTimeout(() => car.classList.remove('scale-110'), 400);
  if (currentLane === correctLane) {
    raceScore += 100; raceDistance = Math.min(1000, raceDistance + 100);
    newGate();
  } else {
    raceScore = Math.max(0, raceScore - 20);
    car.classList.add('translate-x-2'); setTimeout(() => car.classList.remove('translate-x-2'), 150);
    if (comboEl) comboEl.innerHTML = `<span class="material-symbols-outlined text-[18px]">warning</span> Sai cổng! Điểm: ${raceScore}`;
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') steerLeft();
  else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') steerRight();
  else if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); triggerTurbo(); }
});

let timeLeft = 45;
const timerElem = document.getElementById('timer-display');
setInterval(() => {
  if (raceFinished) return;
  if (timeLeft > 0 && timerElem) { timeLeft--; timerElem.textContent = timeLeft + 's'; }
  if (timeLeft === 0) { raceFinished = true; window.MathGameScore.finish('game-dua-xe', raceScore, raceStartedAt); }
}, 1000);
window.MathGameScore.addFinishButton('game-dua-xe', () => raceScore, raceStartedAt);
newGate();
