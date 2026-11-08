/**
 * Khởi động chung cho mọi trang:
 * 1) Nối lại toàn bộ link menu từng là href="#" sang trang thật.
 * 2) Kiểm tra đăng nhập: trang nội bộ chưa đăng nhập -> về login.html;
 *    trang Góc Giáo Viên chỉ dành cho role teacher.
 * 3) Hiển thị người dùng thật trên header + render footer dùng chung.
 */
(function () {
  const PUBLIC_PAGES = ['login', 'introduce'];
  const page = document.body.dataset.page || '';
  const requireRole = document.body.dataset.requireRole || '';

  function fixNavigation() {
    document.querySelectorAll('a[href="#"], a[href="#lesson-10"]').forEach((a) => {
      a.href = window.MathApp.resolveRoute(a);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    fixNavigation();
    if (window.MathApp.components.Sidebar) window.MathApp.components.Sidebar.init();
    if (window.MathApp.components.Footer) window.MathApp.components.Footer.init();

    const user = await window.MathAPI.me();
    if (!user) {
      if (!PUBLIC_PAGES.includes(page)) location.href = 'login.html';
      return;
    }
    if (page === 'login') { location.href = user.role === 'teacher' ? 'schedule.html' : 'index.html'; return; }
    if (requireRole && user.role !== requireRole) { location.href = 'index.html'; return; }

    window.MathApp.user = user;
    if (window.MathApp.components.Sidebar) window.MathApp.components.Sidebar.updateUser(user);
    if (window.MathApp.components.Navbar) window.MathApp.components.Navbar.updateUser(user);
    document.dispatchEvent(new CustomEvent('mathapp:user-ready', { detail: user }));
  });
})();
