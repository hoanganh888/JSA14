/* Logic riêng của trang schedule.html (tách từ HTML gốc, giữ nguyên hành vi) */
// Filter student rows by group
  function setGroupFilter(group, btnElement) {
    // Update button styles
    document.querySelectorAll('.filter-tag').forEach(el => {
      el.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
      el.classList.add('text-on-surface-variant');
    });
    btnElement.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
    btnElement.classList.remove('text-on-surface-variant');

    // Filter table
    const rows = document.querySelectorAll('.student-row');
    rows.forEach(row => {
      if (group === 'all' || row.dataset.group === group) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // Live Search filter
  function filterStudentTable() {
    const query = document.getElementById('studentSearchInput').value.toLowerCase().trim();
    const rows = document.querySelectorAll('.student-row');
    rows.forEach(row => {
      const name = row.dataset.name || '';
      if (name.includes(query)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // JSON Modal Logic
  const jsonModal = document.getElementById('jsonModal');
  const btnOpenJson = document.getElementById('btnOpenJsonModal');
  const btnCloseJson = document.getElementById('btnCloseJsonModal');
  const btnCancelJson = document.getElementById('btnCancelJson');

  btnOpenJson.addEventListener('click', () => {
    jsonModal.classList.remove('hidden');
    jsonModal.classList.add('flex');
  });

  const closeModal = () => {
    jsonModal.classList.add('hidden');
    jsonModal.classList.remove('flex');
  };

  btnCloseJson.addEventListener('click', closeModal);
  btnCancelJson.addEventListener('click', closeModal);

  // Copy JSON
  function copyJsonData() {
    const text = document.getElementById('jsonContent').innerText;
    navigator.clipboard.writeText(text).then(() => {
      const copyBtn = document.getElementById('copyBtn');
      copyBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">done</span> Đã chép!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">content_copy</span> Sao chép mã JSON';
      }, 2000);
    });
  }

  // Export Excel Notification Toast
  function triggerExportNotice() {
    const toast = document.getElementById('toastNotification');
    toast.classList.remove('translate-y-32');
    toast.classList.add('translate-y-0');
    setTimeout(() => {
      toast.classList.remove('translate-y-0');
      toast.classList.add('translate-y-32');
    }, 3500);
  }

  // Student history modal trigger mock
  function openStudentModal(name, score, status) {
    alert(`Mở Sổ Học Bạ Điện Tử: ${name}\n- Điểm TB Tháng 10: ${score}\n- Xếp loại: ${status}\n- Giáo viên có thể xem từng lượt giải bài chi tiết của học sinh.`);
  }

  // Send encouragement trigger mock
  function openFeedbackModal(studentName, parentName) {
    const note = prompt(`Nhập lời nhắn gửi tới ${parentName} (Học sinh: ${studentName}):`, `Thưa phụ huynh, tuần này bé ${studentName} đang rèn luyện rất tích cực môn Toán...`);
    if (note) {
      alert(`Đã gửi tin nhắn thông báo thành công đến Zalo/Sổ liên lạc của ${parentName}!`);
    }
  }

/* --- NÂNG CẤP ĐỢT 1 (Góc Giáo Viên nối dữ liệu thật) ---
 * - Bảng học sinh render từ /api/teacher/students (điểm TB tính từ lượt làm bài thật)
 * - Form tạo tài khoản học sinh -> /api/teacher/students (giáo viên cấp tài khoản) */
(function teacherEnhancements() {
  const tbody = document.getElementById('studentTableBody');
  if (!tbody) return;

  function groupOf(avg) {
    if (avg == null) return 'khá';
    if (avg >= 90) return 'xuat-sac';
    if (avg < 60) return 'can-ho-tro';
    return 'khá';
  }
  function rowHtml(s) {
    const avg = s.avg_score;
    const jsArg = value => JSON.stringify(String(value ?? '')).replace(/"/g, '&quot;');
    const initials = s.full_name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    const status = avg == null ? 'Chưa có lượt làm bài' : avg >= 90 ? 'Xuất sắc' : avg < 60 ? 'Cần bồi dưỡng' : 'Đạt chuẩn';
    const note = avg == null ? 'Chưa có dữ liệu' : avg < 60 ? 'Cần theo dõi thêm' : avg >= 90 ? 'Nắm vững kiến thức' : 'Tiếp tục rèn luyện';
    return `<td class="py-3 px-4"><div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-headline-sm flex items-center justify-center font-bold text-label-md">${initials}</div>
        <div><p class="font-headline-sm text-label-md text-on-surface">${s.full_name}</p>
        <span class="text-on-surface-variant font-label-sm text-[12px] font-bold">${s.username} • Lớp ${s.class_name || ''} • ${s.total_stars} sao</span></div></div></td>
      <td class="py-3 px-3"><span class="inline-flex px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm font-bold">${status}</span></td>
      <td class="py-3 px-3 text-center"><span class="font-headline-sm text-label-lg font-extrabold">${avg == null ? '—' : avg}</span></td>
      <td class="py-3 px-3 text-center font-bold text-on-surface-variant">${s.attempts_count} lượt</td>
      <td class="py-3 px-4"><span class="inline-block px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-[13px]">${note}</span></td>
      <td class="py-3 px-4 text-center"><div class="flex justify-center gap-2"><button type="button" class="px-3 py-1.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold"
        onclick="resetStudentPassword(${s.id}, ${jsArg(s.full_name)})">Đặt lại MK</button><button type="button" class="px-3 py-1.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold"
        onclick="window.editStudent(${s.id}, ${jsArg(s.full_name)}, ${jsArg(s.username)}, ${jsArg(s.student_code)})">Sửa</button><button type="button" class="px-3 py-1.5 rounded-xl bg-error text-on-error font-label-sm text-label-sm font-bold"
        onclick="window.deleteStudent(${s.id}, ${jsArg(s.full_name)})">Xóa</button></div></td>`;
  }

  async function loadStudents() {
    try {
      const { students } = await window.MathAPI.get('/api/teacher/students');
      tbody.innerHTML = students.map(s => {
        const tr = document.createElement('tr');
        tr.className = 'student-row hover:bg-surface-container-low/60 transition-colors';
        tr.dataset.group = groupOf(s.avg_score); tr.dataset.name = s.full_name.toLowerCase();
        tr.innerHTML = rowHtml(s);
        return tr.outerHTML;
      }).join('');
    } catch (err) { console.warn('Không tải được danh sách học sinh:', err.message); }
  }

  window.resetStudentPassword = async function (id, name) {
    const pw = prompt(`Đặt mật khẩu mới cho ${name} (ít nhất 4 ký tự):`);
    if (!pw) return;
    try { await window.MathAPI.post(`/api/teacher/students/${id}/reset-password`, { password: pw }); alert('Đã đặt lại mật khẩu.'); }
    catch (err) { alert(err.message); }
  };

  window.editStudent = async function (id, fullName, username, studentCode) {
    const newFullName = prompt('Họ tên mới:', fullName);
    if (newFullName === null) return;
    const newUsername = prompt('Tên đăng nhập mới:', username);
    if (newUsername === null) return;
    const newStudentCode = prompt('Mã học sinh mới:', studentCode || '');
    if (newStudentCode === null) return;
    try {
      await window.MathAPI.put(`/api/teacher/students/${id}`, {
        fullName: newFullName,
        username: newUsername,
        studentCode: newStudentCode,
      });
      alert('Đã cập nhật thông tin học sinh.');
      loadStudents();
    } catch (err) { alert(err.message); }
  };

  window.deleteStudent = async function (id, fullName) {
    if (!confirm(`Xóa tài khoản của ${fullName}? Học sinh sẽ không đăng nhập được nữa.`)) return;
    try {
      await window.MathAPI.del(`/api/teacher/students/${id}`);
      alert('Đã xóa tài khoản học sinh.');
      loadStudents();
    } catch (err) { alert(err.message); }
  };

  // Form tạo tài khoản — chèn ngay phía trên bảng danh sách học sinh
  const panel = document.createElement('div');
  panel.className = 'mx-gutter-mobile lg:mx-margin max-w-7xl xl:mx-auto mb-6 p-5 rounded-3xl bg-surface-container-lowest shadow-sm';
  panel.innerHTML = `<h3 class="font-headline-md text-headline-md text-primary flex items-center gap-2 mb-3">
      <span class="material-symbols-outlined">person_add</span> Cấp tài khoản học sinh mới</h3>
    <form id="create-student-form" class="grid grid-cols-1 md:grid-cols-5 gap-3">
      <input required name="fullName" placeholder="Họ tên học sinh" class="h-12 px-3 rounded-xl bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"/>
      <input required name="username" placeholder="Tên đăng nhập (VD: hocsinh08)" class="h-12 px-3 rounded-xl bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"/>
      <input required name="password" placeholder="Mật khẩu (≥4 ký tự)" class="h-12 px-3 rounded-xl bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"/>
      <input name="className" placeholder="Lớp (VD: 3A2)" value="3A2" class="h-12 px-3 rounded-xl bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"/>
      <button class="h-12 rounded-xl bg-primary text-on-primary font-headline-sm shadow-[0_3px_0_0_#005320] active:translate-y-0.5 transition-all">Tạo tài khoản</button>
    </form><p id="create-student-msg" class="mt-2 font-label-md text-label-md"></p>`;
  tbody.closest('table')?.parentElement?.prepend(panel);
  panel.querySelector('#create-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    const msg = panel.querySelector('#create-student-msg');
    try {
      const { student } = await window.MathAPI.post('/api/teacher/students', fd);
      msg.textContent = `✅ Đã tạo tài khoản ${student.username} cho ${student.fullName}.`;
      e.target.reset();
      loadStudents();
    } catch (err) { msg.textContent = `⚠️ ${err.message}`; }
  });

  document.addEventListener('mathapp:user-ready', loadStudents);
})();

/* --- ĐỢT 2: QUẢN TRỊ BÀI HỌC & CÂU HỎI NGAY TRÊN WEB (chỉ giáo viên vào được trang này) ---
 * Giáo viên thêm/sửa/xóa bài học, tạo bộ đề, thêm câu hỏi -> học sinh thấy và làm ngay
 * qua trang lesson.html, không cần sửa code hay động vào file dữ liệu nữa. */
(function adminPanel() {
  const tbody = document.getElementById('studentTableBody');
  if (!tbody) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inputCls = 'h-11 px-3 rounded-xl bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary w-full';
  const btnCls = 'px-4 h-11 rounded-xl bg-primary text-on-primary font-headline-sm shadow-[0_3px_0_0_#005320] active:translate-y-0.5 transition-all whitespace-nowrap';
  const smallBtn = 'px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary-fixed font-label-sm text-label-sm font-bold transition-all';

  const wrap = document.createElement('div');
  wrap.className = 'mx-gutter-mobile lg:mx-margin max-w-7xl xl:mx-auto mb-6 space-y-6';
  wrap.innerHTML = `
  <div class="p-5 rounded-3xl bg-surface-container-lowest shadow-sm">
    <h3 class="font-headline-md text-headline-md text-primary flex items-center gap-2 mb-3"><span class="material-symbols-outlined">menu_book</span> Quản Lý Bài Học</h3>
    <form id="lesson-form" class="grid grid-cols-1 md:grid-cols-6 gap-3">
      <input name="number" type="number" min="1" placeholder="Số bài (VD: 16)" class="${inputCls}" required/>
      <input name="title" placeholder="Tên bài (VD: Ôn tập bảng nhân)" class="${inputCls} md:col-span-2" required/>
      <input name="topic" placeholder="Chủ đề" class="${inputCls}"/>
      <select name="unlockAfter" class="${inputCls}"><option value="">Mở tự do</option></select>
      <button class="${btnCls}" id="lesson-submit-btn">Thêm bài học</button>
      <input name="description" placeholder="Mô tả ngắn cho học sinh..." class="${inputCls} md:col-span-5"/>
      <button type="button" id="lesson-cancel" class="hidden ${smallBtn}">Hủy sửa</button>
    </form>
    <p id="lesson-msg" class="mt-2 font-label-md text-label-md"></p>
    <div id="lesson-list" class="mt-3 divide-y divide-surface-container-low"></div>
  </div>
  <div class="p-5 rounded-3xl bg-surface-container-lowest shadow-sm">
    <h3 class="font-headline-md text-headline-md text-primary flex items-center gap-2 mb-3"><span class="material-symbols-outlined">quiz</span> Quản Lý Bộ Đề &amp; Câu Hỏi</h3>
    <form id="set-form" class="grid grid-cols-1 md:grid-cols-6 gap-3">
      <input name="id" placeholder="Mã bộ đề (vd: bai-16-luyen-tap)" class="${inputCls} md:col-span-2" required/>
      <input name="title" placeholder="Tên bộ đề" class="${inputCls} md:col-span-2" required/>
      <select name="kind" class="${inputCls}"><option value="exercise">Luyện tập</option><option value="exam">Kiểm tra</option></select>
      <button class="${btnCls}">Tạo bộ đề</button>
      <select name="lessonId" class="${inputCls} md:col-span-2"><option value="">Không gắn bài nào</option></select>
      <input name="starReward" type="number" value="40" min="0" placeholder="Sao tối đa" class="${inputCls}"/>
      <input name="durationMinutes" type="number" value="0" min="0" placeholder="Phút (kiểm tra)" class="${inputCls}"/>
    </form>
    <p id="set-msg" class="mt-2 font-label-md text-label-md"></p>
    <div id="set-list" class="mt-3 flex flex-wrap gap-2"></div>
    <hr class="my-4 border-surface-container"/>
    <div class="flex flex-wrap items-center gap-3">
      <label class="font-headline-sm text-label-md">Câu hỏi của bộ:</label>
      <select id="question-set-select" class="${inputCls} max-w-xs"></select>
    </div>
    <form id="question-form" class="grid grid-cols-1 md:grid-cols-6 gap-3 mt-3">
      <select name="type" class="${inputCls}"><option value="multiple-choice">Trắc nghiệm</option><option value="input">Điền số</option><option value="compare">Điền dấu &gt; &lt; =</option><option value="paint">Tô màu</option></select>
      <input name="prompt" placeholder="Nội dung câu hỏi (VD: 7 × 6 = ?)" class="${inputCls} md:col-span-3" required/>
      <input name="points" type="number" value="5" min="1" class="${inputCls}"/>
      <button class="${btnCls}" id="question-submit-btn">Thêm câu hỏi</button>
      <input name="options" placeholder="Các lựa chọn, cách nhau bởi dấu phẩy (trắc nghiệm): 36, 42, 48, 40" class="${inputCls} md:col-span-3"/>
      <input name="correctAnswer" placeholder="Đáp án đúng: A/B/C/D, số, dấu, green/yellow" class="${inputCls} md:col-span-2" required/>
      <button type="button" id="question-cancel" class="hidden ${smallBtn}">Hủy sửa</button>
    </form>
    <p id="question-msg" class="mt-2 font-label-md text-label-md"></p>
    <div id="question-list" class="mt-3 space-y-2"></div>
  </div>
  <div class="p-5 rounded-3xl bg-surface-container-lowest shadow-sm">
    <h3 class="font-headline-md text-headline-md text-primary flex items-center gap-2 mb-3"><span class="material-symbols-outlined">assignment_turned_in</span> Giao Bài Tập Cho Lớp</h3>
    <form id="assignment-form" class="grid grid-cols-1 md:grid-cols-5 gap-3">
      <select name="setId" id="assignment-set-select" class="${inputCls} md:col-span-2" required></select>
      <select name="className" id="assignment-class-select" class="${inputCls}" required><option value="">Chọn lớp</option></select>
      <input name="dueDate" type="date" class="${inputCls}"/>
      <button class="${btnCls}">Giao bài</button>
      <input name="note" placeholder="Ghi chú cho học sinh" class="${inputCls} md:col-span-4"/>
    </form>
    <p id="assignment-msg" class="mt-2 font-label-md text-label-md"></p>
    <div id="assignment-list" class="mt-3 divide-y divide-surface-container-low"></div>
  </div>`;
  tbody.closest('table')?.parentElement?.prepend(wrap);

  let editingLesson = null, editingQuestion = null, lessonsCache = [], setsCache = [];
  const $ = (id) => wrap.querySelector('#' + id);

  async function loadLessons() {
    const { lessons } = await window.MathAPI.get('/api/teacher/lessons');
    lessonsCache = lessons;
    $('lesson-list').innerHTML = lessons.map(l => `
      <div class="py-2.5 flex flex-wrap items-center gap-2">
        <span class="font-headline-sm text-label-md text-primary w-40">Bài ${l.number}: ${esc(l.title)}</span>
        <span class="flex-1 min-w-[180px] text-on-surface-variant font-body-sm">${esc(l.description || '')}</span>
        <span class="font-label-sm">${l.set_count} bộ đề</span>
        <button class="${smallBtn}" data-edit-lesson="${l.id}">Sửa</button>
        <button class="${smallBtn}" data-del-lesson="${l.id}">Xóa</button>
      </div>`).join('');
    const opts = lessons.map(l => `<option value="${l.id}">Sau Bài ${l.number}: ${esc(l.title)}</option>`).join('');
    wrap.querySelector('[name="unlockAfter"]').innerHTML = '<option value="">Mở tự do</option>' + opts;
    wrap.querySelector('[name="lessonId"]').innerHTML = '<option value="">Không gắn bài nào</option>' + lessons.map(l => `<option value="${l.id}">Bài ${l.number}: ${esc(l.title)}</option>`).join('');
  }
  async function loadSets() {
    const { questionSets } = await window.MathAPI.get('/api/teacher/question-sets');
    setsCache = questionSets;
    $('set-list').innerHTML = questionSets.map(s => `
      <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container font-label-md text-label-sm">
        <strong>${esc(s.title)}</strong> (${s.question_count} câu${s.lesson_number ? ` • Bài ${s.lesson_number}` : ''})
        <button class="${smallBtn}" data-del-set="${s.id}" title="Xóa bộ đề">✕</button></span>`).join('');
    $('question-set-select').innerHTML = questionSets.map(s => `<option value="${s.id}">${esc(s.title)}</option>`).join('');
    $('assignment-set-select').innerHTML = setsCache.map(s => `<option value="${s.id}">${esc(s.title)}</option>`).join('');
    loadQuestions();
  }
  async function loadAssignClasses() {
    const { students } = await window.MathAPI.get('/api/teacher/students');
    const classes = [...new Set(students.map(s => s.class_name).filter(Boolean))].sort();
    $('assignment-class-select').innerHTML = '<option value="">Chọn lớp</option>' + classes.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }
  async function loadAssignments() {
    const { assignments } = await window.MathAPI.get('/api/teacher/assignments');
    $('assignment-list').innerHTML = assignments.map(a => `
      <div class="py-2.5 flex flex-wrap items-center gap-2">
        <span class="font-headline-sm text-label-md text-primary flex-1 min-w-[180px]">${esc(a.set_title)}</span>
        <span class="font-label-md text-label-sm">Lớp ${esc(a.class_name)}${a.due_date ? ` • Hạn ${esc(a.due_date)}` : ''}</span>
        <span class="font-label-md text-label-sm">${a.done_students}/${a.total_students} đã làm</span>
        <button class="${smallBtn}" data-del-assign="${a.id}">Hủy giao</button>
      </div>`).join('');
  }
  async function loadQuestions() {
    const setId = $('question-set-select').value;
    if (!setId) { $('question-list').innerHTML = ''; return; }
    const { questions } = await window.MathAPI.get(`/api/teacher/question-sets/${encodeURIComponent(setId)}/questions`);
    $('question-list').innerHTML = questions.map((q, i) => `
      <div class="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low">
        <span class="font-headline-sm text-label-sm text-primary">Câu ${i + 1}</span>
        <span class="flex-1 min-w-[200px] font-body-sm">${esc(q.prompt)}${q.options ? ` <em class="text-on-surface-variant">[${q.options.map(esc).join(' / ')}]</em>` : ''}</span>
        <span class="font-label-sm">Đáp án: <strong>${esc(q.correct_answer)}</strong> • ${q.points}đ</span>
        <button class="${smallBtn}" data-edit-question='${esc(JSON.stringify({ id: q.id, type: q.type, prompt: q.prompt, options: q.options || [], correctAnswer: q.correct_answer, points: q.points }))}'>Sửa</button>
        <button class="${smallBtn}" data-del-question="${q.id}">Xóa</button>
      </div>`).join('');
  }

  $('lesson-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (editingLesson) {
        await window.MathAPI.put(`/api/teacher/lessons/${editingLesson}`, fd);
        $('lesson-msg').textContent = '✅ Đã cập nhật bài học.';
      } else {
        await window.MathAPI.post('/api/teacher/lessons', fd);
        $('lesson-msg').textContent = '✅ Đã thêm bài học mới. Tạo thêm bộ đề ở khung dưới để học sinh làm bài nhé!';
      }
      editingLesson = null; e.target.reset(); e.target.number.disabled = false; $('lesson-submit-btn').textContent = 'Thêm bài học'; $('lesson-cancel').classList.add('hidden');
      loadLessons();
    } catch (err) { $('lesson-msg').textContent = `⚠️ ${err.message}`; }
  });
  $('lesson-cancel').addEventListener('click', () => { editingLesson = null; $('lesson-form').number.disabled = false; $('lesson-form').reset(); $('lesson-submit-btn').textContent = 'Thêm bài học'; $('lesson-cancel').classList.add('hidden'); });

  $('set-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    try { await window.MathAPI.post('/api/teacher/question-sets', fd); $('set-msg').textContent = '✅ Đã tạo bộ đề. Chọn bộ đề ở dưới để thêm câu hỏi.'; e.target.reset(); loadSets(); loadLessons(); }
    catch (err) { $('set-msg').textContent = `⚠️ ${err.message}`; }
  });

  $('question-set-select').addEventListener('change', loadQuestions);
  $('question-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    fd.options = fd.options ? fd.options.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    if (fd.type !== 'multiple-choice') fd.options = undefined;
    try {
      if (editingQuestion) {
        await window.MathAPI.put(`/api/teacher/questions/${editingQuestion}`, fd);
        $('question-msg').textContent = '✅ Đã cập nhật câu hỏi.';
      } else {
        await window.MathAPI.post(`/api/teacher/question-sets/${encodeURIComponent($('question-set-select').value)}/questions`, fd);
        $('question-msg').textContent = '✅ Đã thêm câu hỏi.';
      }
      editingQuestion = null; e.target.reset(); e.target.points.value = 5; $('question-submit-btn').textContent = 'Thêm câu hỏi'; $('question-cancel').classList.add('hidden');
      loadQuestions(); loadSets();
    } catch (err) { $('question-msg').textContent = `⚠️ ${err.message}`; }
  });
  $('question-cancel').addEventListener('click', () => { editingQuestion = null; $('question-form').reset(); $('question-submit-btn').textContent = 'Thêm câu hỏi'; $('question-cancel').classList.add('hidden'); });

  $('assignment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    try {
      await window.MathAPI.post('/api/teacher/assignments', fd);
      $('assignment-msg').textContent = '✅ Đã giao bài cho lớp.';
      e.target.reset();
      loadAssignments();
    } catch (err) { $('assignment-msg').textContent = `⚠️ ${err.message}`; }
  });

  wrap.addEventListener('click', async (e) => {
    const editL = e.target.closest('[data-edit-lesson]');
    const delL = e.target.closest('[data-del-lesson]');
    const delS = e.target.closest('[data-del-set]');
    const editQ = e.target.closest('[data-edit-question]');
    const delQ = e.target.closest('[data-del-question]');
    const delA = e.target.closest('[data-del-assign]');
    try {
      if (editL) {
        const l = lessonsCache.find(x => x.id === editL.dataset.editLesson);
        if (!l) return;
        editingLesson = l.id;
        const f = $('lesson-form');
        f.number.value = l.number; f.number.disabled = true; f.title.value = l.title;
        f.description.value = l.description || ''; f.topic.value = l.topic || ''; f.unlockAfter.value = l.unlock_after || '';
        $('lesson-submit-btn').textContent = 'Lưu thay đổi'; $('lesson-cancel').classList.remove('hidden');
        f.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (delL && confirm('Xóa bài học này?')) { await window.MathAPI.del(`/api/teacher/lessons/${delL.dataset.delLesson}`); loadLessons(); }
      if (delS && confirm('Xóa bộ đề và toàn bộ câu hỏi trong đó?')) { await window.MathAPI.del(`/api/teacher/question-sets/${delS.dataset.delSet}`); loadSets(); loadLessons(); }
      if (editQ) {
        const q = JSON.parse(editQ.dataset.editQuestion);
        editingQuestion = q.id;
        const f = $('question-form');
        f.type.value = q.type; f.prompt.value = q.prompt; f.points.value = q.points;
        f.options.value = (q.options || []).join(', '); f.correctAnswer.value = q.correctAnswer;
        $('question-submit-btn').textContent = 'Lưu thay đổi'; $('question-cancel').classList.remove('hidden');
      }
      if (delQ && confirm('Xóa câu hỏi này?')) { await window.MathAPI.del(`/api/teacher/questions/${delQ.dataset.delQuestion}`); loadQuestions(); loadSets(); }
      if (delA && confirm('Hủy giao bài tập này?')) { await window.MathAPI.del(`/api/teacher/assignments/${delA.dataset.delAssign}`); loadAssignments(); }
    } catch (err) { alert(err.message); }
  });

  // Nút xuất báo cáo: tải CSV thật thay cho thông báo mẫu cũ
  document.querySelectorAll('button').forEach((b) => {
    if (/Xuất Báo Cáo|Xuất.*Excel/i.test(b.textContent)) {
      b.removeAttribute('onclick');
      b.addEventListener('click', () => { const a = document.createElement('a'); a.href = '/api/teacher/export.csv'; a.download = 'bao-cao-lop.csv'; a.click(); });
    }
  });

  document.addEventListener('mathapp:user-ready', async () => {
    try { await loadLessons(); await loadSets(); await loadAssignClasses(); await loadAssignments(); } catch (err) { console.warn('Không tải được dữ liệu quản trị:', err.message); }
  });
})();

/* --- ĐỢT 3: THỐNG KÊ THẬT — thay số liệu mẫu trên trang bằng dữ liệu từ /api/teacher/analytics --- */
(function analyticsPanel() {
  const tbody = document.getElementById('studentTableBody');
  if (!tbody) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const panel = document.createElement('div');
  panel.className = 'mx-gutter-mobile lg:mx-margin max-w-7xl xl:mx-auto mb-6 p-5 rounded-3xl bg-surface-container-lowest shadow-sm';
  panel.innerHTML = `<h3 class="font-headline-md text-headline-md text-primary flex items-center gap-2 mb-1">
      <span class="material-symbols-outlined">monitoring</span> Thống Kê Học Tập Thật
      <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px]">Tự động từ dữ liệu hệ thống</span></h3>
    <p class="font-body-sm text-body-sm text-on-surface-variant mb-4">Số liệu dưới đây (và 4 thẻ chỉ số phía trên) được tính trực tiếp từ lượt làm bài của học sinh — không phải số mẫu.</p>
    <div id="analytics-body" class="font-body-md text-on-surface-variant">Đang tải thống kê...</div>`;
  tbody.closest('table')?.parentElement?.prepend(panel);

  function render(a) {
    const maxDay = Math.max(1, ...a.last7.map(d => d.c));
    const bars = a.last7.length ? a.last7.map(d => `
      <div class="flex-1 flex flex-col items-center gap-1">
        <span class="font-label-sm text-label-sm font-bold">${d.c}</span>
        <div class="w-full max-w-[44px] rounded-t-xl bg-primary/80" style="height:${Math.max(8, Math.round(d.c / maxDay * 72))}px"></div>
        <span class="font-label-sm text-[11px] text-on-surface-variant">${d.day.slice(5)}</span>
      </div>`).join('') : '<p class="font-body-sm">Chưa có lượt làm bài nào trong 7 ngày qua.</p>';
    const mistakes = a.topMistakes.length ? a.topMistakes.map((m, i) => `
      <div class="flex items-start gap-3 py-2">
        <span class="w-8 h-8 shrink-0 rounded-full bg-error-container text-on-error-container font-headline-sm flex items-center justify-center">${i + 1}</span>
        <div class="flex-1"><p class="font-headline-sm text-label-md">${esc(m.label)}</p>
        <p class="font-body-sm text-on-surface-variant">Sai ${m.wrong}/${m.total} lần trả lời (${m.wrongRate}%)</p></div>
      </div>`).join('') : '<p class="font-body-sm">Chưa đủ dữ liệu (cần học sinh làm bài trước).</p>';
    const perLesson = a.perLesson.map(l => `
      <div class="py-1.5">
        <div class="flex justify-between font-label-md text-label-sm"><span>Bài ${l.number}: ${esc(l.title)}</span><span>${l.completed}/${a.students} em hoàn thành • TB ${l.avgBest}%</span></div>
        <div class="h-2.5 mt-1 rounded-full bg-surface-container overflow-hidden"><div class="h-full bg-secondary rounded-full" style="width:${a.students ? Math.round(l.completed / a.students * 100) : 0}%"></div></div>
      </div>`).join('');
    panel.querySelector('#analytics-body').innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div><h4 class="font-headline-sm text-label-md text-primary mb-2">Lượt làm bài 7 ngày gần nhất</h4>
          <div class="flex items-end gap-2 h-[120px]">${bars}</div></div>
        <div><h4 class="font-headline-sm text-label-md text-primary mb-2">Dạng bài hay sai nhất</h4>${mistakes}</div>
        <div><h4 class="font-headline-sm text-label-md text-primary mb-2">Tiến độ theo bài học</h4>${perLesson}</div>
      </div>`;

    // Điền số thật vào 4 thẻ KPI mẫu ở đầu trang
    const kpiSection = [...document.querySelectorAll('span')].find(s => s.textContent.trim() === 'Tỉ lệ hoàn thành')?.closest('section');
    if (kpiSection) {
      const values = kpiSection.querySelectorAll('span.font-headline-xl');
      if (values[0]) values[0].textContent = `${a.completionRate}%`;
      if (values[1]) values[1].textContent = (a.avgScore / 10).toFixed(1);
      if (values[2]) values[2].textContent = String(a.excellent);
      if (values[3]) values[3].textContent = String(a.needSupport).padStart(2, '0');
    }
    // Ẩn 2 khối biểu đồ/chẩn đoán mẫu cũ để tránh nhầm với số thật
    ['Tiến Độ Làm Bài Theo Tuần', 'Chẩn Đoán Sư Phạm'].forEach((label) => {
      const head = [...document.querySelectorAll('h2,h3,div,span')].find(el => el.textContent.trim().startsWith(label) && el.children.length <= 3);
      const sec = head && head.closest('section');
      if (sec) sec.style.display = 'none';
    });
  }

  document.addEventListener('mathapp:user-ready', async () => {
    try { render(await window.MathAPI.get('/api/teacher/analytics')); }
    catch (err) { panel.querySelector('#analytics-body').textContent = `Chưa tải được thống kê: ${err.message}`; }
  });
})();
