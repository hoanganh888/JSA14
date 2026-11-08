/* Mini-game 4: Câu Cá Đại Dương (Đợt 2 — nhiều vòng phép chia + lưu điểm)
 * Mỗi vòng 1 phép chia, 4 chú cá mang 4 đáp số khác nhau; bấm đúng cá +30 điểm.
 * Đủ 10 vòng hoặc hết giờ -> lưu điểm lên server. */
(function fishingGame() {
  const startedAt = Date.now();
  const TOTAL = 10;
  let round = 0, score = 0, caught = 0, finished = false, answer = null, timeLeft = 60;

  const questionEl = [...document.querySelectorAll('span')].find(e => /^\d+\s*:\s*\d+\s*=\s*\?$/.test(e.textContent.trim()));
  const basketEl = [...document.querySelectorAll('span, div, p')].find(e => /Giỏ cá/.test(e.textContent) && e.children.length <= 3);
  const dropBtn = document.getElementById('btn-drop-hook');

  // Nhận diện 4 chú cá: khối có tên "Cá ..." và 1 nhãn số
  const fishes = [...document.querySelectorAll('div')].filter(d =>
    /Cá (Heo|Hề|Nóc|Vàng)/.test(d.textContent) && d.className.includes('cursor-pointer') &&
    [...d.querySelectorAll('span')].some(s => /^\d+$/.test(s.textContent.trim())));
  function fishNumberEl(fish) { return [...fish.querySelectorAll('span')].find(s => /^\d+$/.test(s.textContent.trim())); }

  function newRound() {
    if (round >= TOTAL) return finish();
    round++;
    const divisor = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
    answer = 2 + Math.floor(Math.random() * 8);
    if (questionEl) questionEl.textContent = `${divisor * answer} : ${divisor} = ?`;
    const options = new Set([answer]);
    while (options.size < 4) options.add(answer + [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)]);
    [...options].sort(() => Math.random() - 0.5).forEach((val, i) => {
      const el = fishes[i] && fishNumberEl(fishes[i]);
      if (el) el.textContent = String(val);
      if (fishes[i]) fishes[i].dataset.value = String(val);
    });
    if (basketEl) basketEl.innerHTML = basketEl.innerHTML.replace(/Giỏ cá[^<]*/, `Giỏ cá ${caught} / ${TOTAL} con • Điểm ${score} • Vòng ${round}/${TOTAL}`);
  }

  function finish() {
    if (finished) return; finished = true;
    window.MathGameScore.finish('game-cau-ca', score, startedAt);
  }

  fishes.forEach(fish => fish.addEventListener('click', () => {
    if (finished) return;
    if (Number(fish.dataset.value) === answer) {
      score += 30; caught++;
      fish.classList.add('scale-125', 'rotate-6');
      setTimeout(() => fish.classList.remove('scale-125', 'rotate-6'), 350);
      setTimeout(newRound, 400);
    } else {
      fish.classList.add('translate-x-2');
      setTimeout(() => fish.classList.remove('translate-x-2'), 150);
    }
  }));

  if (dropBtn) dropBtn.addEventListener('click', () => {
    const target = fishes.find(f => Number(f.dataset.value) === answer);
    if (target) target.click();
  });

  setInterval(() => { if (!finished && --timeLeft <= 0) finish(); }, 1000);
  window.MathGameScore.addFinishButton('game-cau-ca', () => score, startedAt);
  newRound();
})();
