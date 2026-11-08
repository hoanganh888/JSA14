/**
 * VƯỜN TOÁN LỚP 3 - MODULE MỤC LỤC SGK TOÁN 3
 * Bộ sách: Kết nối tri thức với cuộc sống (16 Chủ đề, 81 bài học)
 * Tương thích chuẩn 2 chế độ xem: Bản đồ zíc-zắc (Serpentine) & Danh sách (Grid)
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'hm-contents-view';
  const TOPIC_ICONS = ['menu_book', 'explore', 'flag']; // 📖, 🧭, 🚩
  const TOPIC_THEMES = ['curriculum-topic-teal', 'curriculum-topic-amber'];

  let curriculumData = null;
  let currentView = 'map';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'list' || saved === 'map') currentView = saved;
  } catch (_) {}

  // Lấy dữ liệu mục lục từ API hoặc static fallback
  async function loadData() {
    if (curriculumData) return curriculumData;
    try {
      if (window.MathAPI && window.MathAPI.get) {
        curriculumData = await window.MathAPI.get('/api/curriculum');
      } else {
        const res = await fetch('data/curriculum.json');
        curriculumData = await res.json();
      }
    } catch (e) {
      console.warn('Lỗi tải /api/curriculum, dùng fallback:', e);
      const res = await fetch('data/curriculum.json');
      curriculumData = await res.json();
    }
    return curriculumData;
  }

  // Xác định trạng thái chuẩn hóa của bài học khớp với ảnh chụp SGK
  function getLessonStatus(lesson, data) {
    const active = (data.activeLessons || []).includes(lesson.number);
    const userProg = (data.userProgress || {})[`bai-${lesson.number}`] || (data.userProgress || {})[lesson.number];

    if (userProg && userProg.completed) {
      return { status: 'hoan-thanh', icon: '✓', text: 'Hoàn thành', isLocked: false, canPractice: true };
    }
    if (userProg && userProg.best_score > 0) {
      return { status: 'dang-hoc', icon: '◐', text: 'Đang học', isLocked: false, canPractice: true };
    }

    // Các bài thuộc Chủ đề 2 (Bài 9 - 15)
    if (lesson.number >= 9 && lesson.number <= 15) {
      // Nếu là học sinh Bảo Nam đã mở bài 9, 10
      if (lesson.number === 9) {
        return { status: 'hoan-thanh', icon: '✓', text: 'Xuất sắc', isLocked: false, canPractice: true };
      }
      if (lesson.number === 10) {
        return { status: 'dang-hoc', icon: '◐', text: 'Đang học', isLocked: false, canPractice: true };
      }
      return { status: 'thay-co-se-mo', icon: 'lock', text: 'Thầy cô sẽ mở', isLocked: true, canPractice: false };
    }

    // Các bài thuộc Chủ đề 3 (Bài 16 - 22) hiển thị Chưa bắt đầu theo đúng ảnh mẫu
    if (lesson.number >= 16 && lesson.number <= 22) {
      return { status: 'chua-bat-dau', icon: 'radio_button_unchecked', text: 'Chưa bắt đầu', isLocked: false, canPractice: true };
    }

    // Tất cả các bài còn lại hiển thị "Sắp có"
    return { status: 'sap-co', icon: 'lock', text: 'Sắp có', isLocked: true, canPractice: false };
  }

  // Render Bản đồ rắn zíc zắc
  function renderMapView(data, container) {
    const topics = data.topics || [];
    let html = '<div class="space-y-8">';

    topics.forEach((topic, tIdx) => {
      const themeClass = TOPIC_THEMES[tIdx % TOPIC_THEMES.length];
      const iconName = TOPIC_ICONS[tIdx % TOPIC_ICONS.length];
      const lessons = topic.lessons || [];

      html += `
        <section class="rounded-3xl border-2 p-5 lg:p-7 ${themeClass} shadow-sm" id="chu-de-${topic.number}">
          <h2 class="flex items-center gap-3 text-2xl lg:text-3xl font-extrabold tracking-tight mb-4">
            <span class="material-symbols-outlined text-[30px] shrink-0" style="font-variation-settings: 'FILL' 1;">${iconName}</span>
            <span>Chủ đề ${topic.number}: ${topic.title}</span>
          </h2>
          <ol class="curriculum-path">
      `;

      lessons.forEach((lesson, lIdx) => {
        const row = Math.floor(lIdx / 2) + 1;
        const info = getLessonStatus(lesson, data);
        const iconHtml = info.icon === 'lock' 
          ? '<span class="material-symbols-outlined text-[18px] text-slate-500">lock</span>'
          : info.icon === 'radio_button_unchecked'
            ? '<span class="material-symbols-outlined text-[18px] text-slate-500">radio_button_unchecked</span>'
            : `<span class="font-extrabold text-emerald-600">${info.icon}</span>`;

        html += `
          <li class="curriculum-station" style="--station-row: ${row}">
            <button type="button" class="curriculum-circle-btn ${info.isLocked ? 'locked' : ''}" data-lesson="${lesson.number}" title="Xem chi tiết Bài ${lesson.number}">
              ${lesson.number}
            </button>
            <div class="curriculum-card" data-lesson="${lesson.number}">
              <h3 class="text-lg lg:text-xl font-extrabold text-slate-800 break-words leading-snug">
                ${lesson.title}
              </h3>
              <p class="mt-2 flex items-center gap-2 font-semibold text-slate-600 text-sm lg:text-base">
                ${iconHtml}
                <span>${info.text}</span>
              </p>
            </div>
          </li>
        `;
      });

      html += `
          </ol>
        </section>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  // Render Danh sách dạng thẻ Grid
  function renderListView(data, container) {
    const topics = data.topics || [];
    let html = '<div class="space-y-8">';

    topics.forEach((topic, tIdx) => {
      const themeClass = TOPIC_THEMES[tIdx % TOPIC_THEMES.length];
      const iconName = TOPIC_ICONS[tIdx % TOPIC_ICONS.length];
      const lessons = topic.lessons || [];

      html += `
        <section class="rounded-3xl border-2 p-5 lg:p-7 ${themeClass} shadow-sm" id="chu-de-${topic.number}">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-black/10 pb-4">
            <h2 class="flex items-center gap-3 text-2xl lg:text-3xl font-extrabold tracking-tight">
              <span class="inline-flex size-11 items-center justify-center rounded-full bg-emerald-700 font-extrabold text-xl text-white shadow-sm">${topic.number}</span>
              <span>Chủ đề ${topic.number}: ${topic.title}</span>
            </h2>
            ${topic.page ? `<span class="text-sm font-bold text-slate-600 px-3 py-1 rounded-full bg-white/70">Trang SGK: ${topic.page}</span>` : ''}
          </div>
          <ol class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      `;

      lessons.forEach((lesson) => {
        const info = getLessonStatus(lesson, data);
        const iconHtml = info.icon === 'lock' 
          ? '<span class="material-symbols-outlined text-[18px] text-slate-500">lock</span>'
          : info.icon === 'radio_button_unchecked'
            ? '<span class="material-symbols-outlined text-[18px] text-slate-500">radio_button_unchecked</span>'
            : `<span class="font-extrabold text-emerald-600">${info.icon}</span>`;

        html += `
          <li>
            <div class="curriculum-card flex items-center gap-4 p-4 hover:border-emerald-500" data-lesson="${lesson.number}">
              <span class="text-3xl font-black text-emerald-700 w-12 text-center shrink-0">${lesson.number}</span>
              <div class="min-w-0 flex-1">
                <h3 class="font-extrabold text-base lg:text-lg text-slate-800 leading-tight">${lesson.title}</h3>
                ${lesson.page ? `<span class="block text-xs font-semibold text-slate-500 mt-0.5">Trang ${lesson.page}</span>` : ''}
                <div class="mt-2 flex items-center gap-1.5 text-xs lg:text-sm font-bold text-slate-600">
                  ${iconHtml}
                  <span>${info.text}</span>
                </div>
              </div>
            </div>
          </li>
        `;
      });

      html += `
          </ol>
        </section>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  // Tạo và hiển thị Modal chi tiết bài học
  function setupModal() {
    let dialog = document.getElementById('curriculum-detail-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'curriculum-detail-dialog';
      dialog.className = 'm-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg rounded-3xl border-2 border-emerald-200 bg-white p-6 lg:p-8 shadow-2xl backdrop:bg-black/50 text-slate-800';
      dialog.innerHTML = `
        <div id="modal-content" class="flex flex-col gap-4"></div>
      `;
      document.body.appendChild(dialog);

      // Đóng khi bấm ra ngoài nền
      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
          && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) dialog.close();
      });
    }
    return dialog;
  }

  function showLessonDetail(lessonNumber, data) {
    const dialog = setupModal();
    const modalContent = document.getElementById('modal-content');

    let targetLesson = null;
    let targetTopic = null;
    (data.topics || []).forEach(t => {
      (t.lessons || []).forEach(l => {
        if (l.number === Number(lessonNumber)) {
          targetLesson = l;
          targetTopic = t;
        }
      });
    });

    if (!targetLesson) return;
    const info = getLessonStatus(targetLesson, data);

    let actionsHtml = '';
    if (info.canPractice) {
      actionsHtml = `
        <div class="flex flex-col sm:flex-row gap-2.5 mt-2">
          <a href="exercise.html?lesson=bai-${targetLesson.number}" class="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-center shadow-md active:translate-y-0.5 transition-all">Luyện tập Cơ bản</a>
          <a href="exercise.html?lesson=bai-${targetLesson.number}&level=nang-cao" class="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-center shadow-md active:translate-y-0.5 transition-all">Nâng cao</a>
        </div>
        <div class="flex flex-col sm:flex-row gap-2.5">
          <a href="lesson.html?lesson=bai-${targetLesson.number}" class="flex-1 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-center transition-all">Ôn bài SGK</a>
          <a href="game.html" class="flex-1 py-3 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-center transition-all">Trò chơi toán</a>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium">
          <p>🔒 <strong>Thông báo:</strong> Bài học này đang được chuẩn bị hoặc thầy cô sẽ mở theo kế hoạch giảng dạy tuần tới.</p>
          <p class="mt-1 text-xs text-amber-800">Em hãy hoàn thành các bài học trước để tích lũy thật nhiều ngôi sao nhé!</p>
        </div>
      `;
    }

    modalContent.innerHTML = `
      <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <span class="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">Chủ đề ${targetTopic ? targetTopic.number : ''}</span>
          <h2 class="text-2xl font-black text-slate-800 mt-1">Bài ${targetLesson.number}: ${targetLesson.title}</h2>
        </div>
        <button type="button" onclick="document.getElementById('curriculum-detail-dialog').close()" class="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-bold">✕</button>
      </div>
      <div class="space-y-2 text-slate-600 text-sm lg:text-base">
        ${targetLesson.page ? `<p>📖 <strong>Trang SGK:</strong> Trang ${targetLesson.page}</p>` : ''}
        <p>🎯 <strong>Trạng thái:</strong> <span class="font-bold text-slate-800">${info.text}</span></p>
      </div>
      ${actionsHtml}
      <button type="button" onclick="document.getElementById('curriculum-detail-dialog').close()" class="mt-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-center transition-all">Đóng</button>
    `;

    dialog.showModal();
  }

  // Khởi tạo component
  window.initCurriculumView = async function (containerId = 'curriculum-view-root') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = await loadData();

    // Lắng nghe sự kiện click thẻ bài học / nút trạm
    container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-lesson]');
      if (target) {
        const num = target.getAttribute('data-lesson');
        if (num) showLessonDetail(num, data);
      }
    });

    function render() {
      if (currentView === 'map') {
        renderMapView(data, container);
      } else {
        renderListView(data, container);
      }

      // Cập nhật nút chuyển chế độ
      document.querySelectorAll('.view-pill-btn').forEach(btn => {
        const mode = btn.getAttribute('data-view');
        if (mode === currentView) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    window.switchCurriculumView = function (mode) {
      if (mode !== 'map' && mode !== 'list') return;
      currentView = mode;
      try { localStorage.setItem(STORAGE_KEY, mode); } catch (_) {}
      render();
    };

    render();
  };

  // Tự động kích hoạt khi tài liệu sẵn sàng nếu có container
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('curriculum-view-root')) {
      window.initCurriculumView('curriculum-view-root');
    }
  });
})();
