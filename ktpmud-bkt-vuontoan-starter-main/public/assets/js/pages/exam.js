/* Logic trang Kiểm Tra — viết lại theo dữ liệu thật (Đợt 1):
 * - 20 câu hỏi tải từ server (/api/question-sets/bai-15-kiem-tra/questions, không kèm đáp án)
 * - Chuyển câu bằng nút Trước/Sau + bảng ma trận 20 câu, đánh dấu xem lại
 * - Đồng hồ đếm ngược 35 phút, hết giờ tự nộp; nộp bài server chấm & lưu hồ sơ */
(function initExamEngine() {
  let questions = [];
  let current = 0;
  const answers = {};   // { exam-1: 'B', ... }
  const flagged = new Set();
  let totalSeconds = 35 * 60;
  let submitted = false;

  const timerElement = document.getElementById('exam-timer');
  const submitBtn = document.getElementById('submit-exam-btn');
  const optionCards = [...document.querySelectorAll('.option-card')];

  const setText = (selector, text) => { const el = document.querySelector(selector); if (el) el.textContent = text; };

  function renderQuestion() {
    const q = questions[current];
    if (!q) return;
    // Số câu + chủ đề + điểm
    document.querySelectorAll('span').forEach((el) => {
      if (/^Câu số \d+ \/ \d+$/.test(el.textContent.trim())) el.textContent = `Câu số ${current + 1} / ${questions.length}`;
    });
    const badge = document.querySelector('section .bg-primary\\/10 span, section span.w-9');
    if (badge) badge.textContent = String(current + 1);
    const statement = document.querySelector('section .font-body-lg');
    if (statement) statement.textContent = q.prompt;
    optionCards.forEach((card, i) => {
      const letter = ['A', 'B', 'C', 'D'][i];
      const textEl = card.querySelector('.font-body-md') || card.children[1];
      if (textEl) textEl.textContent = (q.options && q.options[i]) || '';
      paintOption(card, answers[q.id] === letter);
    });
    // Nút câu trước/sau
    document.querySelectorAll('button').forEach((b) => {
      if (/Câu \d+/.test(b.textContent) && b.textContent.includes('arrow_back')) b.innerHTML = `<span class="material-symbols-outlined">arrow_back</span> Câu ${Math.max(1, current)}`;
      if (/Câu \d+/.test(b.textContent) && b.textContent.includes('arrow_forward')) b.innerHTML = `Câu ${Math.min(questions.length, current + 2)} <span class="material-symbols-outlined">arrow_forward</span>`;
    });
    renderMatrix();
    if (submitBtn) submitBtn.querySelector('span:last-child').textContent = `Nộp Bài Thi (${Object.keys(answers).length}/${questions.length} câu)`;
  }

  function paintOption(card, active) {
    const letterEl = card.querySelector('div:first-child');
    const icon = card.querySelector('.radio-icon');
    card.classList.toggle('bg-secondary-container/40', active);
    card.classList.toggle('bg-surface-container-lowest', !active);
    if (letterEl) letterEl.className = active
      ? 'w-12 h-12 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center flex-shrink-0 shadow-sm'
      : 'w-12 h-12 rounded-full bg-surface-container text-on-surface font-headline-sm text-headline-sm flex items-center justify-center flex-shrink-0 transition-colors';
    if (icon) {
      icon.textContent = active ? 'check_circle' : 'radio_button_unchecked';
      icon.classList.toggle('text-primary', active);
      icon.classList.toggle('text-outline', !active);
      icon.style.fontVariationSettings = active ? "'FILL' 1" : "'FILL' 0";
    }
    const textEl = card.querySelector('.font-body-md');
    if (textEl) textEl.classList.toggle('font-bold', active);
  }

  function renderMatrix() {
    document.querySelectorAll('.matrix-btn').forEach((btn, i) => {
      if (i >= questions.length) return;
      const done = answers[questions[i].id];
      btn.classList.toggle('ring-4', i === current);
      btn.classList.toggle('ring-tertiary-fixed-dim', i === current);
      btn.style.opacity = done || i === current ? '1' : '0.75';
      if (flagged.has(i) && !btn.textContent.includes('flag')) btn.innerHTML = `${i + 1} <span class="material-symbols-outlined text-[13px]">flag</span>`;
      if (!flagged.has(i)) btn.textContent = String(i + 1);
    });
  }

  optionCards.forEach((card) => card.addEventListener('click', () => {
    const q = questions[current];
    if (!q || submitted) return;
    answers[q.id] = card.dataset.option;
    renderQuestion();
  }));

  document.querySelectorAll('.matrix-btn').forEach((btn, i) => btn.addEventListener('click', () => {
    if (i < questions.length) { current = i; renderQuestion(); }
  }));
  document.querySelectorAll('button').forEach((b) => {
    if (b.textContent.includes('arrow_back')) b.addEventListener('click', () => { if (current > 0) { current--; renderQuestion(); } });
    if (b.textContent.includes('arrow_forward')) b.addEventListener('click', () => { if (current < questions.length - 1) { current++; renderQuestion(); } });
  });

  const bookmarkBtn = document.getElementById('bookmark-btn');
  if (bookmarkBtn) bookmarkBtn.addEventListener('click', () => {
    flagged.has(current) ? flagged.delete(current) : flagged.add(current);
    renderMatrix();
  });

  async function submitExam(auto = false) {
    if (submitted) return;
    const missing = questions.length - Object.keys(answers).length;
    if (!auto && missing > 0 && !confirm(`Con còn ${missing} câu chưa làm. Có chắc chắn muốn nộp bài ngay không?`)) return;
    submitted = true;
    try {
      const r = await window.MathAPI.post('/api/submissions', {
        setId: 'bai-15-kiem-tra', answers, durationSec: 35 * 60 - totalSeconds,
      });
      alert(`🎉 Đã nộp bài thành công!\nĐiểm của con: ${r.scorePercent}% — đúng ${r.correctCount}/${r.totalCount} câu.` +
        (r.starsEarned ? `\nCon nhận thêm +${r.starsEarned} Sao vàng.` : '') + '\nKết quả đã được lưu vào hồ sơ học tập.');
      location.href = 'leaderboard.html';
    } catch (err) {
      submitted = false;
      alert(`Chưa nộp được bài: ${err.message}`);
    }
  }
  if (submitBtn) submitBtn.addEventListener('click', () => submitExam(false));

  const scratch = document.getElementById('scratchpad-input'); // nháp chỉ lưu tạm trên máy
  if (scratch) {
    scratch.value = localStorage.getItem('exam-scratch') || '';
    scratch.addEventListener('input', () => localStorage.setItem('exam-scratch', scratch.value));
  }

  setInterval(() => {
    if (submitted || !questions.length) return;
    if (totalSeconds <= 0) { if (timerElement) timerElement.textContent = '00:00'; submitExam(true); return; }
    totalSeconds--;
    if (timerElement) timerElement.textContent = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
  }, 1000);

  window.MathAPI.get('/api/question-sets/bai-15-kiem-tra/questions')
    .then(({ questions: qs }) => { questions = qs; renderQuestion(); })
    .catch((err) => { if (timerElement) timerElement.textContent = '--:--'; console.warn('Không tải được đề thi:', err.message); });
})();
