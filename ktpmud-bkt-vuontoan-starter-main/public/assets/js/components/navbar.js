/**
 * Tiện ích cho thanh header có sẵn trong từng trang (giữ nguyên thiết kế gốc):
 * - Cập nhật tên/lớp/số sao của người đang đăng nhập vào header.
 * - Gắn nút Đăng xuất vào header.
 * (Bản cũ phụ thuộc vào window.MathApp.store không hề tồn tại nên không chạy được;
 *  bản này dùng trực tiếp dữ liệu thật từ /api/auth/me.)
 */
window.MathApp = window.MathApp || {};
window.MathApp.components = window.MathApp.components || {};

window.MathApp.components.Navbar = {
  updateUser(user) {
    if (!user) return;
    const isTeacher = user.role === 'teacher';
    const teacherName = user.fullName || 'Cô Lan Anh (GV Chủ nhiệm minh họa)';

    // Thay tên mẫu "Bảo Nam" hoặc "Học sinh" bằng tên thật trong vùng header/footer
    document.querySelectorAll('header span, header p, footer span, footer p').forEach((el) => {
      const text = el.textContent.trim();
      if (text === 'Bảo Nam' || text === 'Nguyễn Bảo Nam' || text === 'Học sinh') {
        el.textContent = isTeacher ? teacherName : (user.fullName || 'Học sinh Lớp 3A2');
      }
      if (isTeacher && (text.includes('Lớp 3A') || text.includes('Lớp 3A2'))) {
        el.textContent = user.className ? `GV ${user.className}` : 'GV Khối 3';
      } else if (!isTeacher && text === 'Lớp 3A') {
        el.textContent = user.className ? `Lớp ${user.className}` : 'Lớp 3A2';
      }
    });

    // Cập nhật slogan linh vật Ong Vàng Hoàng Mai
    const mascotSlogan = document.getElementById('mascot-slogan');
    if (mascotSlogan) {
      mascotSlogan.textContent = 'Đồng hành cùng học sinh';
    }

    // Cập nhật avatar giáo viên trên Header nếu đang đăng nhập là giáo viên
    if (isTeacher) {
      const avatarUrl = user.avatar || 'assets/img/ong-vang-hoang-mai.png';
      document.querySelectorAll('header img').forEach((img) => {
        if (img.alt && (img.alt.includes('Hồ sơ') || img.alt.includes('Profile') || img.alt.includes('học sinh') || img.alt.includes('Cô Lan Anh'))) {
          img.src = avatarUrl;
          img.alt = teacherName;
        }
      });
    }

    const header = document.querySelector('header');
    if (!header || header.querySelector('#btn-logout')) return;
    const btn = document.createElement('button');
    btn.id = 'btn-logout';
    btn.type = 'button';
    btn.title = `Đăng xuất (${isTeacher ? teacherName : user.fullName})`;
    btn.className = 'ml-1 w-10 h-10 shrink-0 rounded-full bg-surface-container hover:bg-error-container text-on-surface-variant hover:text-on-error-container flex items-center justify-center transition-all';
    btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">logout</span>';
    btn.addEventListener('click', async () => {
      await window.MathAPI.logout();
      location.href = 'login.html';
    });
    (header.querySelector('.flex.items-center.gap-space-sm:last-of-type') || header.firstElementChild || header).appendChild(btn);
  },
};
