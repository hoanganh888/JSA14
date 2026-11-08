/* Mini-game 1: Bắn Bóng Phép Tính (Đợt 2 — chơi thật nhiều vòng + lưu điểm)
 * Giữ nguyên giao diện/bóng bay gốc; mỗi vòng sinh phép nhân mới, đáp án xáo trộn.
 * Điểm: đúng +30. Hết 10 vòng hoặc hết 60 giây -> gửi điểm lên server. */
(function balloonGame() {
  const startedAt = Date.now();
  const TOTAL_ROUNDS = 10;
  let round = 0, score = 0, finished = false, timeLeft = 60;
  let currentAnswer = null;

  const balloons = [...document.querySelectorAll('button[onclick*="handleBalloonClick"]')];
  const scoreVal = document.getElementById('score-val');
  const toast = document.getElementById('game-toast');
  const countdown = document.getElementById('countdown-val');
  if (scoreVal) scoreVal.innerText = '0';

  const questionEl = [...document.querySelectorAll('span, div, p')].find(e => /^\d+\s*×\s*\d+\s*=\s*\?$/.test(e.textContent.trim()) && e.children.length === 0);
  const roundEl = [...document.querySelectorAll('span, div, p')].find(e => /^Vòng \d+\/10$/.test(e.textContent.trim()));

  function newRound() {
    if (round >= TOTAL_ROUNDS) return finish();
    round++;
    const a = 6 + Math.floor(Math.random() * 4);       // bảng 6..9
    const b = 2 + Math.floor(Math.random() * 8);       // ×2..×9
    currentAnswer = a * b;
    if (questionEl) questionEl.textContent = `${a} × ${b} = ?`;
    if (roundEl) roundEl.textContent = `Vòng ${round}/${TOTAL_ROUNDS}`;
    const options = new Set([currentAnswer]);
    while (options.size < 4) options.add(currentAnswer + [-12, -6, -3, 3, 6, 12][Math.floor(Math.random() * 6)]);
    [...options].sort(() => Math.random() - 0.5).forEach((val, i) => {
      const btn = balloons[i];
      if (!btn) return;
      btn.style.opacity = '1'; btn.style.pointerEvents = 'auto';
      btn.removeAttribute('onclick');
      const numSpan = [...btn.querySelectorAll('span')].find(s => /^\d+$/.test(s.textContent.trim()));
      if (numSpan) numSpan.textContent = String(val); else btn.textContent = String(val);
      btn.dataset.value = String(val);
    });
    if (toast) { toast.classList.add('hidden'); toast.classList.remove('flex'); }
  }

  // Giữ tên hàm cũ để tương thích, nhưng logic dùng dataset mới
  window.handleBalloonClick = function (btn) {
    if (finished) return;
    const correct = Number(btn.dataset.value) === currentAnswer;
    if (correct) {
      score += 30;
      if (scoreVal) scoreVal.innerText = String(score);
      btn.classList.add('scale-125');
      setTimeout(() => btn.classList.remove('scale-125'), 150);
      if (toast) { toast.classList.remove('hidden'); toast.classList.add('flex'); }
      setTimeout(newRound, 650);
    } else {
      btn.classList.add('translate-x-2');
      setTimeout(() => btn.classList.remove('translate-x-2'), 120);
    }
  };
  balloons.forEach(btn => btn.addEventListener('click', () => window.handleBalloonClick(btn)));
  window.nextMathRound = newRound;

  function finish() {
    if (finished) return; finished = true;
    window.MathGameScore.finish('game-bong-bay', score, startedAt);
  }
  setInterval(() => {
    if (finished) return;
    if (countdown && timeLeft > 0) { timeLeft--; countdown.textContent = `${timeLeft} giây`; if (timeLeft === 0) finish(); }
  }, 1000);
  window.MathGameScore.addFinishButton('game-bong-bay', () => score, startedAt);
  newRound();
})();
