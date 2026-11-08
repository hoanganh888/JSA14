/* Mini-game 3: Lật Thẻ Trí Nhớ (Đợt 2 — ghép cặp thật + lưu điểm)
 * 3 cặp thẻ úp trên bàn (phép tính <-> kết quả). Lật đúng cặp +40 điểm.
 * Tìm đủ 3 cặp hoặc hết giờ -> lưu điểm lên server. */
let isSoundOn = true;
let remainingSeconds = 75;
let timerInterval = null;
const memoryStartedAt = Date.now();
let memoryScore = 0, memoryFound = 0, memoryFinished = false;
let flipped = []; // [{btn, value, original}]
const MEMORY_BASE_MATCHED = 4; // 4 cặp đã mở sẵn trên bàn theo thiết kế gốc

const matchedEl = document.getElementById('matchedCount');
const flipEl = document.getElementById('flipCount');
if (matchedEl) matchedEl.textContent = String(MEMORY_BASE_MATCHED);
if (flipEl) flipEl.textContent = '0';

function cardValue(text) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  let m = t.match(/(\d+)\s*×\s*(\d+)/); if (m) return Number(m[1]) * Number(m[2]);
  m = t.match(/(\d+)\s*:\s*(\d+)/); if (m) return Number(m[1]) / Number(m[2]);
  return Number(t);
}

function startCountdown() {
  const timerElem = document.getElementById('timerDisplay');
  if (!timerElem) return;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (memoryFinished) { clearInterval(timerInterval); return; }
    if (remainingSeconds > 0) {
      remainingSeconds--;
      timerElem.textContent = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;
    } else {
      clearInterval(timerInterval);
      finishMemory();
    }
  }, 1000);
}

function toggleAudioState() {
  isSoundOn = !isSoundOn;
  const icon = document.getElementById('audioIcon');
  if (icon) icon.textContent = isSoundOn ? 'volume_up' : 'volume_off';
}

function finishMemory() {
  if (memoryFinished) return; memoryFinished = true;
  const timeBonus = memoryFound === 3 ? Math.max(0, remainingSeconds) : 0; // thưởng tốc độ khi tìm đủ
  window.MathGameScore.finish('game-lat-the', memoryScore + timeBonus, memoryStartedAt);
}

function flipSampleCard(buttonElement, mathText) {
  if (memoryFinished || buttonElement.dataset.done || flipped.some(f => f.btn === buttonElement)) return;
  if (flipEl) flipEl.textContent = String((parseInt(flipEl.textContent, 10) || 0) + 1);
  const original = buttonElement.innerHTML;
  buttonElement.classList.remove('bg-primary', 'shadow-[0_5px_0_0_#005320]');
  buttonElement.classList.add('bg-tertiary-fixed', 'text-on-tertiary-fixed', 'shadow-[0_6px_0_0_#f7be23]', 'ring-4', 'ring-tertiary-fixed-dim/60');
  buttonElement.innerHTML = `
    <div class="w-full flex items-center justify-between">
      <span class="w-5 h-5 rounded-full bg-on-tertiary-fixed/20 text-[10px] font-bold flex items-center justify-center font-headline-sm">?</span>
      <span class="material-symbols-outlined text-[18px] text-tertiary">search</span>
    </div>
    <span class="font-headline-lg text-headline-sm sm:text-headline-lg text-tertiary font-black">${mathText}</span>
    <span class="font-label-sm text-[11px] text-on-tertiary-fixed-variant font-bold bg-white/40 px-2 py-0.5 rounded-full">Vừa lật</span>`;
  flipped.push({ btn: buttonElement, value: cardValue(mathText), original });

  if (flipped.length === 2) {
    const [a, b] = flipped; flipped = [];
    if (a.value === b.value) {
      memoryFound++; memoryScore += 40;
      [a, b].forEach(f => {
        f.btn.dataset.done = '1';
        f.btn.classList.remove('bg-tertiary-fixed', 'ring-4');
        f.btn.classList.add('bg-secondary-fixed', 'shadow-[0_6px_0_0_#6ddd81]');
      });
      if (matchedEl) matchedEl.textContent = String(MEMORY_BASE_MATCHED + memoryFound);
      if (memoryFound === 3) setTimeout(finishMemory, 600);
    } else {
      setTimeout(() => [a, b].forEach(f => {
        f.btn.innerHTML = f.original;
        f.btn.classList.add('bg-primary', 'shadow-[0_5px_0_0_#005320]');
        f.btn.classList.remove('bg-tertiary-fixed', 'text-on-tertiary-fixed', 'shadow-[0_6px_0_0_#f7be23]', 'ring-4', 'ring-tertiary-fixed-dim/60');
      }), 900);
    }
  }
}

function useTool(toolType) {
  if (toolType === 'hourglass') {
    remainingSeconds += 15;
    const timerElem = document.getElementById('timerDisplay');
    if (timerElem) timerElem.textContent = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;
    const toolBtn = document.getElementById('toolHourglass');
    if (toolBtn) { toolBtn.classList.add('scale-105'); setTimeout(() => toolBtn.classList.remove('scale-105'), 300); }
  } else if (toolType === 'magnifier') {
    const toolBtn = document.getElementById('toolMagnifier');
    if (toolBtn) {
      toolBtn.classList.add('opacity-50', 'pointer-events-none');
      toolBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">search_insights</span><span>Đã Soi Thẻ</span><span class="px-1.5 py-0.5 rounded-full bg-white/70 text-tertiary font-bold text-[11px]">0</span>`;
    }
  } else if (toolType === 'shuffle') {
    const matrix = document.getElementById('cardMatrix');
    if (matrix) { matrix.classList.add('animate-pulse'); setTimeout(() => matrix.classList.remove('animate-pulse'), 400); }
  }
}

window.MathGameScore.addFinishButton('game-lat-the', () => memoryScore, memoryStartedAt);
startCountdown();
