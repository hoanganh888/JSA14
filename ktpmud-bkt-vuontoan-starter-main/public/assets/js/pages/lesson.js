/* Trang làm bài chung (Đợt 2): dùng cho MỌI bộ câu hỏi giáo viên tạo trên web.
 * Mở bằng: lesson.html?lesson=bai-16&set=bo-de-moi — render câu hỏi từ API,
 * nộp lên server chấm giống phiếu luyện tập/đề kiểm tra chuyên biệt. */
(function lessonPlayer() {
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const setId = params.get('set');
  const startedAt = Date.now();
  const answers = {};
  let questions = [];

  const container = document.getElementById('questions-container');
  const progressBar = document.getElementById('lesson-progress');
  const progressText = document.getElementById('lesson-progress-text');

  function updateProgress() {
    const done = questions.filter(q => answers[q.id] != null && String(answers[q.id]).trim() !== '').length;
    if (progressBar) progressBar.style.width = questions.length ? `${Math.round(done / questions.length * 100)}%` : '0%';
    if (progressText) progressText.textContent = `Đã trả lời ${done}/${questions.length} câu`;
  }

  function render() {
    container.innerHTML = questions.map((q, idx) => {
      let body = '';
      if (q.type === 'multiple-choice' && q.options) {
        body = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">${q.options.map((op, i) => `
          <button type="button" data-q="${q.id}" data-val="${['A', 'B', 'C', 'D'][i]}" class="opt-btn text-left px-4 py-3 rounded-2xl bg-surface-container-low hover:bg-secondary-container/60 font-body-md transition-all">
            <strong class="text-primary">${['A', 'B', 'C', 'D'][i]}.</strong> ${op}</button>`).join('')}</div>`;
      } else if (q.type === 'paint') {
        body = `<div class="flex gap-2.5 mt-3">
          <button type="button" data-q="${q.id}" data-val="green" class="opt-btn px-5 py-3 rounded-2xl bg-secondary-fixed text-on-secondary-fixed font-headline-sm">Tô Xanh lá</button>
          <button type="button" data-q="${q.id}" data-val="yellow" class="opt-btn px-5 py-3 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-headline-sm">Tô Vàng</button></div>
          <p class="mt-2 font-label-sm text-label-sm text-on-surface-variant">Chọn màu đúng theo kết quả của phép tính.</p>`;
      } else if (q.type === 'compare') {
        body = `<div class="flex gap-2.5 mt-3">${['>', '<', '='].map(s => `
          <button type="button" data-q="${q.id}" data-val="${s}" class="opt-btn w-14 h-14 rounded-2xl bg-surface-container-low font-headline-lg text-primary">${s}</button>`).join('')}</div>`;
      } else {
        body = `<input data-q="${q.id}" type="text" inputmode="numeric" placeholder="Điền đáp số..." class="mt-3 w-56 h-14 text-center rounded-2xl bg-surface-container-low text-primary font-headline-lg focus:outline-none focus:ring-4 focus:ring-primary-fixed"/>`;
      }
      return `<article class="rounded-3xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(0,97,39,0.06)] p-6">
        <p class="font-label-sm text-label-sm text-tertiary font-bold">Câu ${idx + 1} • ${q.points} điểm${q.category ? ' • ' + q.category : ''}</p>
        <h3 class="font-headline-md text-headline-md mt-1">${q.prompt}</h3>${body}</article>`;
    }).join('');

    container.querySelectorAll('.opt-btn').forEach(btn => btn.addEventListener('click', () => {
      answers[btn.dataset.q] = btn.dataset.val;
      container.querySelectorAll(`.opt-btn[data-q="${btn.dataset.q}"]`).forEach(b =>
        b.classList.toggle('ring-4', b === btn));
      if (btn.dataset.val) container.querySelectorAll(`.opt-btn[data-q="${btn.dataset.q}"]`).forEach(b =>
        b.classList.toggle('ring-primary-fixed-dim', b === btn));
      updateProgress();
    }));
    container.querySelectorAll('input[data-q]').forEach(inp => inp.addEventListener('input', () => { answers[inp.dataset.q] = inp.value.trim(); updateProgress(); }));
    updateProgress();
  }

  async function init() {
    if (!setId) { container.innerHTML = '<p class="font-body-md">Thiếu mã bộ bài. Em quay lại Mục Lục chọn bài nhé!</p>'; return; }
    try {
      if (lessonId) {
        const { lessons } = await window.MathAPI.get('/api/lessons');
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
          document.getElementById('lesson-title').textContent = `Bài ${lesson.number}: ${lesson.title}`;
          document.getElementById('lesson-desc').textContent = lesson.description || '';
        }
      }
      const data = await window.MathAPI.get(`/api/question-sets/${encodeURIComponent(setId)}/questions`);
      questions = data.questions;
      document.getElementById('set-kind').textContent = `Bộ bài: ${setId} • ${questions.length} câu`;
      render();
    } catch (err) { container.innerHTML = `<p class="font-body-md">Chưa tải được bài: ${err.message}</p>`; }
  }

  document.getElementById('btn-submit-lesson').addEventListener('click', async () => {
    const missing = questions.length - Object.keys(answers).filter(k => String(answers[k]).trim() !== '').length;
    if (missing > 0 && !confirm(`Em còn ${missing} câu chưa trả lời. Vẫn nộp bài nhé?`)) return;
    try {
      const r = await window.MathAPI.post('/api/submissions', { setId, answers, durationSec: Math.round((Date.now() - startedAt) / 1000) });
      const box = document.getElementById('lesson-result');
      box.classList.remove('hidden');
      box.innerHTML = `<div class="text-4xl mb-1">${r.scorePercent >= 80 ? '🎉' : r.scorePercent >= 50 ? '💪' : '🌱'}</div>
        <h3 class="font-headline-md text-headline-md">Em đạt ${r.scorePercent}% — đúng ${r.correctCount}/${r.totalCount} câu!</h3>
        <p class="font-body-md mt-1">${r.starsEarned ? `Nhận thêm ⭐ +${r.starsEarned} Sao vàng.` : 'Điểm chưa vượt lần tốt nhất nên chưa cộng thêm sao.'} Kết quả đã được lưu vào hồ sơ.</p>`;
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) { alert(`Chưa nộp được bài: ${err.message}`); }
  });

  document.addEventListener('mathapp:user-ready', init);
})();
