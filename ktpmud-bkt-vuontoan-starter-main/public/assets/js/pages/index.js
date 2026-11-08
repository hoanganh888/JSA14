/* Logic riêng của trang index.html (tách từ HTML gốc, giữ nguyên hành vi) */
document.addEventListener('DOMContentLoaded', function () {
      const soundBtn = document.getElementById('soundToggle');
      let soundEnabled = true;

      if (soundBtn) {
        soundBtn.addEventListener('click', function () {
          soundEnabled = !soundEnabled;
          const icon = soundBtn.querySelector('.material-symbols-outlined');
          if (icon) {
            icon.textContent = soundEnabled ? 'volume_up' : 'volume_off';
          }
        });
      }

      // Add tactile audio/visual click response to chunky 3D buttons
      const buttons = document.querySelectorAll('button:not([disabled]), a[class*="shadow-"]');
      buttons.forEach(btn => {
        btn.addEventListener('click', function () {
          if (soundEnabled && window.AudioContext) {
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(520, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
              gain.gain.setValueAtTime(0.12, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.08);
            } catch (e) {
              // Graceful fallback if audio context is blocked
            }
          }
        });
      });
    });

/* --- NÂNG CẤP ĐỢT 1: Thẻ bài học render từ API (/api/lessons) ---
 * Dữ liệu bài (tiêu đề, mô tả, điểm cao nhất, khóa/mở) lấy từ server + DB.
 * Thêm bài mới trong DB là trang chủ tự hiện, không cần sửa HTML này. */
document.addEventListener('mathapp:user-ready', async () => {
  try {
    const { lessons } = await window.MathAPI.get('/api/lessons');
    lessons.forEach((lesson) => {
      const card = document.querySelector(`[data-lesson-card="${lesson.id}"]`);
      if (!card) return;
      const title = card.querySelector('[data-lesson-title]');
      const desc = card.querySelector('[data-lesson-desc]');
      if (title) title.textContent = `Bài ${lesson.number}: ${lesson.title}`;
      if (desc) desc.textContent = lesson.description;
      // Cập nhật dòng điểm trong thẻ (nếu có)
      card.querySelectorAll('span, p').forEach((el) => {
        if (/^(Điểm|Điểm hiện tại):/.test(el.textContent.trim())) {
          el.innerHTML = el.innerHTML.replace(/Điểm( hiện tại)?:\s*[^<]*/, `Điểm${el.textContent.includes('hiện') ? ' hiện tại' : ''}: ${lesson.bestScore}/100`);
        }
      });
      const btn = [...card.querySelectorAll('button, a')].find((b) => /Bắt đầu học|Tiếp tục|Ôn lại|Chưa thể vào/.test(b.textContent));
      if (!btn) return;
      const set = (lesson.questionSets || [])[0];
      const go = () => {
        if (lesson.number === 15) location.href = 'exam.html';
        else if (set && set.id === 'phieu-bai-9-10') location.href = 'exercise.html';
        else if (set) location.href = `lesson.html?lesson=${lesson.id}&set=${set.id}`;
        else location.href = 'exercise.html';
      };
      if (lesson.locked) {
        btn.setAttribute('disabled', '');
        btn.classList.add('cursor-not-allowed');
      } else {
        btn.removeAttribute('disabled');
        btn.classList.remove('cursor-not-allowed', 'opacity-80');
        const label = btn.querySelector('span:last-child') || btn;
        if (/Chưa thể vào/.test(label.textContent)) label.textContent = 'Bắt đầu học';
        btn.addEventListener('click', go);
      }
    });
    // Tiến độ chủ đề trên banner
    const done = lessons.filter((l) => l.completed).length;
    document.querySelectorAll('span, p, div').forEach((el) => {
      if (/^\d+\/7 bài học$/.test(el.textContent.trim())) el.textContent = `${done}/7 bài học`;
    });
  } catch (err) { console.warn('Không tải được danh sách bài học:', err.message); }
});

/* --- ĐỢT 4: BÀI TẬP GIÁO VIÊN GIAO CHO LỚP --- */
document.addEventListener('mathapp:user-ready', async () => {
  try {
    const { assignments } = await window.MathAPI.get('/api/me/assignments');
    if (!assignments || !assignments.length) return;

    // Tìm vị trí chèn: Ưu tiên trước khối Mục lục SGK hoặc trước lưới bài học
    const roadmapSec = document.getElementById('muc-luc-sgk-section') || [...document.querySelectorAll('section')].find(s => s.textContent.includes('Lộ Trình Bản Đồ'));
    const anchor = roadmapSec || document.querySelector('[data-lesson-card]')?.closest('section');
    if (!anchor) return;

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const card = document.createElement('section');
    card.className = 'w-full px-gutter-mobile lg:px-margin max-w-7xl mx-auto py-3';
    card.innerHTML = `
      <div class="rounded-3xl bg-surface-container-lowest p-5 lg:p-6 shadow-[0_6px_0_0_#d5e5d7,0_16px_28px_-6px_rgba(0,97,39,0.1)] border-2 border-primary/20 flex flex-col gap-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span class="material-symbols-outlined text-[26px]">assignment</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-headline-md text-headline-sm text-primary font-bold">📋 Bài Được Giao</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-headline-sm text-[12px]">${assignments.length} nhiệm vụ</span>
              </div>
              <p class="font-body-md text-label-sm text-on-surface-variant mt-0.5">Nhiệm vụ giáo viên giao cho lớp — hoàn thành đúng hạn để nhận thêm sao thưởng!</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
          ${assignments.map(a => {
            const due = a.dueDate ? a.dueDate.split('-').reverse().join('/') : '';
            const isDone = Boolean(a.done);
            return `
              <div class="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-lowest transition-all border border-outline-variant/30 hover:border-primary/40 shadow-sm hover:shadow-md">
                <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div class="w-10 h-10 rounded-xl ${isDone ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span class="material-symbols-outlined text-[22px]">${isDone ? 'task_alt' : 'edit_document'}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="font-headline-sm text-label-lg text-on-surface font-bold group-hover:text-primary transition-colors">${esc(a.setTitle)}</h3>
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-headline-sm text-[11px] ${isDone ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-tertiary text-on-tertiary'}">
                        ${isDone ? `✓ Đã làm (${a.bestScore}%)` : 'Chưa làm'}
                      </span>
                    </div>
                    ${due ? `
                      <p class="font-label-sm text-[12px] text-on-surface-variant flex items-center gap-1 mt-1">
                        <span class="material-symbols-outlined text-[14px] text-tertiary">calendar_clock</span>
                        <span>Hạn hoàn thành: <strong class="text-on-surface">${due}</strong></span>
                      </p>
                    ` : ''}
                  </div>
                </div>

                <button type="button" data-assignment-set="${esc(a.setId)}" data-assignment-lesson="${esc(a.lessonId)}" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl ${isDone ? 'bg-surface-container hover:bg-surface-container-high text-on-surface shadow-[0_3px_0_0_#bfcabb]' : 'bg-primary hover:bg-primary-container text-on-primary shadow-[0_3px_0_0_#00471c]'} active:translate-y-0.5 active:shadow-none font-headline-sm text-label-sm whitespace-nowrap transition-all cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">${isDone ? 'refresh' : 'play_arrow'}</span>
                  <span>${isDone ? 'Làm lại bài' : 'Vào làm bài'}</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-assignment-set]');
      if (btn) {
        location.href = 'lesson.html?' + (btn.dataset.assignmentLesson ? 'lesson=' + btn.dataset.assignmentLesson + '&' : '') + 'set=' + btn.dataset.assignmentSet;
      }
    });

    anchor.insertAdjacentElement('beforebegin', card);
  } catch (err) { console.warn('Không tải được bài tập đã giao:', err.message); }
});
