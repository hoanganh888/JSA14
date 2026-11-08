/* Logic trang Đăng nhập — hỗ trợ học sinh & Google OAuth 2.0 cho giáo viên.
 * Tài khoản mẫu để test:
 * Học sinh: hocsinh01 / 123456  •  Giáo viên: giaovien01 / 123456 hoặc Đăng nhập Google */
let selectedRole = 'student';
const GOOGLE_CLIENT_ID = '90028108182-nt0tr6dam9d3qvt5akq4v4rr6lpp3h4p.apps.googleusercontent.com';
let googleInited = false;

// Chuyển đổi qua lại giữa Học sinh và Giáo viên
const btnRoleStudent = document.getElementById('btnRoleStudent');
const btnRoleTeacher = document.getElementById('btnRoleTeacher');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const studentCodeInput = document.getElementById('studentCodeInput');
const teacherGoogleSection = document.getElementById('teacherGoogleSection');

btnRoleStudent.addEventListener('click', () => {
  btnRoleStudent.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md transition-all shadow-sm';
  btnRoleTeacher.className = 'flex items-center gap-2 px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all';
  formTitle.textContent = 'Sẵn sàng làm toán nào! 🌟';
  formSubtitle.textContent = 'Chọn đúng lớp và điền mã của em để bước vào đảo học tập nhé.';
  selectedRole = 'student';
  studentCodeInput.value = 'hocsinh01';
  if (teacherGoogleSection) teacherGoogleSection.classList.add('hidden');
});

btnRoleTeacher.addEventListener('click', () => {
  btnRoleTeacher.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md transition-all shadow-sm';
  btnRoleStudent.className = 'flex items-center gap-2 px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all';
  formTitle.textContent = 'Cổng Quản Trị Giáo Viên 📚';
  formSubtitle.textContent = 'Kính mời thầy cô đăng nhập bằng Google hoặc tài khoản sư phạm trường Hoàng Mai.';
  selectedRole = 'teacher';
  studentCodeInput.value = 'giaovien01';
  if (teacherGoogleSection) teacherGoogleSection.classList.remove('hidden');
  initGoogleAuth();
});

// Chuyển đổi tab Đăng nhập / Tạo tài khoản
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
tabLogin.addEventListener('click', () => {
  tabLogin.className = 'px-3.5 py-1.5 rounded-xl font-label-md text-label-md text-primary font-bold bg-primary-fixed/40';
  tabRegister.className = 'px-3.5 py-1.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:text-on-surface';
});
tabRegister.addEventListener('click', () => {
  tabRegister.className = 'px-3.5 py-1.5 rounded-xl font-label-md text-label-md text-primary font-bold bg-primary-fixed/40';
  tabLogin.className = 'px-3.5 py-1.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:text-on-surface';
  showToast('Liên hệ Thầy/Cô chủ nhiệm để nhận tài khoản cấp mới.');
});

// Ẩn hiện mật khẩu
const passField = document.getElementById('passwordField');
const togglePassBtn = document.getElementById('togglePasswordBtn');
const eyeIcon = document.getElementById('eyeIcon');
let isShown = false;

togglePassBtn.addEventListener('click', () => {
  isShown = !isShown;
  passField.type = isShown ? 'text' : 'password';
  eyeIcon.textContent = isShown ? 'visibility_off' : 'visibility';
});

// Gợi ý bấm số nhanh
function appendPin(num) {
  if (passField.value.length < 20) {
    passField.value += num;
  }
}

function clearPin() {
  passField.value = '';
}

// QR Modal Handlers
const qrModal = document.getElementById('qrModal');
function openQrModal() {
  qrModal.classList.remove('hidden');
}

function closeQrModal() {
  qrModal.classList.add('hidden');
}

function simulateQrSuccess() {
  closeQrModal();
  studentCodeInput.value = "hocsinh01";
  showToast('Nhận diện thẻ thông minh thành công! Đang vào học...');
}

// Xử lý nộp form mật khẩu thông thường
async function handleLoginSubmit() {
  const username = studentCodeInput.value.trim();
  const password = passField.value;
  if (!username || !password) { showToast('Vui lòng điền tên đăng nhập và mật khẩu nhé!'); return; }
  showToast('Đang mở cánh cổng Vườn Toán Lớp 3...');
  try {
    const { user } = await window.MathAPI.post('/api/auth/login', { username, password, role: selectedRole });
    showToast(`Chào ${user.fullName}! Đang vào Vườn Toán...`);
    setTimeout(() => { location.href = user.role === 'teacher' ? 'schedule.html' : 'index.html'; }, 500);
  } catch (err) {
    showToast(err.message);
  }
}

// Khởi tạo Google Identity Services
async function initGoogleAuth() {
  const wrapper = document.getElementById('googleBtnWrapper');
  if (!wrapper) return;
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
    setTimeout(initGoogleAuth, 180);
    return;
  }
  if (googleInited) return;

  try {
    let clientId = GOOGLE_CLIENT_ID;
    try {
      const cfg = await window.MathAPI.get('/api/auth/google/client-id');
      if (cfg && cfg.clientId) clientId = cfg.clientId;
    } catch (_) {}

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleLoginSuccess,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    wrapper.innerHTML = '';
    google.accounts.id.renderButton(wrapper, {
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      logo_alignment: 'left',
      width: 280,
    });
    googleInited = true;
  } catch (err) {
    console.error('[Google Sign-In Init Error]', err);
  }
}

// Xử lý khi Google trả về JWT credential
async function handleGoogleLoginSuccess(response) {
  if (!response || !response.credential) {
    showToast('Không nhận được mã xác thực từ Google.');
    return;
  }
  showToast('Đang xác thực tài khoản Google với trường Hoàng Mai...');
  try {
    const res = await window.MathAPI.post('/api/auth/google', { credential: response.credential });
    if (res && res.user) {
      showToast(`Chào mừng ${res.user.fullName}! Đang vào Góc Giáo Viên...`);
      setTimeout(() => {
        location.href = 'schedule.html';
      }, 500);
    }
  } catch (err) {
    showToast(err.message || 'Đăng nhập Google thất bại. Thầy cô vui lòng thử lại!');
  }
}

// Toast Functionality
function showToast(message) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
  toast.querySelector('p').textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3200);
}

// Tự động kiểm tra URL query hoặc sẵn sàng Google Auth
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('role') === 'teacher') {
    btnRoleTeacher.click();
  }
});
window.addEventListener('load', () => {
  // Chuẩn bị trước GIS client
  initGoogleAuth();
});
