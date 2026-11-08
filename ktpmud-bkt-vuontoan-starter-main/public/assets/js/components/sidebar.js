/**
 * Bản đồ điều hướng dùng chung (trước đây các link trong trang đều là href="#" chết).
 * Mọi nơi cần nối link menu đều tra cứu tại bảng này — sửa đường dẫn chỉ sửa 1 chỗ.
 */
window.MathApp = window.MathApp || {};
window.MathApp.components = window.MathApp.components || {};

window.MathApp.routes = {
  home: 'index.html',
  curriculum: 'muc-luc.html',
  exercise: 'exercise.html',
  exam: 'exam.html',
  games: 'game.html',
  game2: 'game2.html',
  game3: 'game3.html',
  game4: 'game4.html',
  leaderboard: 'leaderboard.html',
  teacher: 'schedule.html',
  introduce: 'introduce.html',
  login: 'login.html',
};

/** Đoán đích đến của 1 link menu dựa trên data-path hoặc nội dung chữ của nó. */
window.MathApp.resolveRoute = function (el) {
  const routes = window.MathApp.routes;
  const path = (el.getAttribute('data-path') || '').toLowerCase();
  const text = (el.textContent || '').toLowerCase();
  const hay = `${path} ${text}`;
  if (hay.includes('giao-vien') || hay.includes('giáo viên') || hay.includes('thay-co') || hay.includes('thầy cô') || hay.includes('goc-thay')) return routes.teacher;
  if (hay.includes('bang-xep-hang') || hay.includes('xếp hạng') || hay.includes('vinh-danh') || hay.includes('vinh danh')) return routes.leaderboard;
  if (hay.includes('dua-xe') || hay.includes('đua xe')) return routes.game2;
  if (hay.includes('lat-the') || hay.includes('lật thẻ') || hay.includes('nối cặp') || hay.includes('trí nhớ')) return routes.game3;
  if (hay.includes('cau-ca') || hay.includes('câu cá')) return routes.game4;
  if (hay.includes('ban-bong') || hay.includes('bắn bóng') || hay.includes('bong-bay')) return routes.games;
  if (hay.includes('dau-truong') || hay.includes('đấu trường') || hay.includes('tro-choi') || hay.includes('trò chơi')) return routes.games;
  if (hay.includes('kiem-tra') || hay.includes('kiểm tra')) return routes.exam;
  if (hay.includes('luyen-tap') || hay.includes('luyện tập')) return routes.exercise;
  if (hay.includes('muc-luc') || hay.includes('mục lục') || hay.includes('sgk')) return routes.curriculum;
  if (hay.includes('trang-chu') || hay.includes('trang chủ')) return routes.home;
  return routes.home;
};

/**
 * VƯỜN TOÁN LỚP 3 - THANH ĐIỀU HƯỚNG DỌC (VERTICAL NAVIGATION RAIL)
 * Chuẩn trang gốc: Sidebar bên trái thanh lịch, bo góc tactile, tooltip sang phải.
 */
window.MathApp.components.Sidebar = {
  container: null,

  navLinks: [
    { id: 'index', label: 'Trang Chủ', href: 'index.html', icon: 'home' },
    { id: 'curriculum', label: 'Mục Lục SGK', href: 'muc-luc.html', icon: 'menu_book' },
    { id: 'exercise', label: 'Phòng Luyện Tập', href: 'exercise.html', icon: 'edit_note' },
    { id: 'games', label: 'Đấu Trường Trò Chơi', href: 'game.html', icon: 'sports_esports' },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', href: 'leaderboard.html', icon: 'emoji_events' },
    { id: 'teacher', label: 'Góc Giáo Viên', href: 'schedule.html', icon: 'school', requireTeacher: true },
  ],

  init(user) {
    const page = document.body.dataset.page || '';
    if (page === 'login') return; // Không hiển thị trên trang đăng nhập

    document.body.classList.add('has-sidebar');
    this.render(user);
  },

  render(user) {
    const page = document.body.dataset.page || '';
    const u = user || window.MathApp.user || {};
    const isTeacher = u.role === 'teacher';

    // Tạo hoặc tìm phần tử aside
    let sidebar = document.getElementById('app-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.id = 'app-sidebar';
      sidebar.className = 'fixed left-0 top-0 bottom-0 z-50 w-16 lg:w-18 bg-surface-container-lowest border-r border-outline-variant/30 hidden md:flex flex-col items-center py-4 justify-between shadow-[2px_0_12px_rgba(0,0,0,0.03)] select-none';
      document.body.insertAdjacentElement('afterbegin', sidebar);
    }
    this.container = sidebar;

    const linksHtml = this.navLinks
      .filter(item => !item.requireTeacher || isTeacher)
      .map(item => {
        const isActive = (page === item.id) || (item.id === 'games' && page.startsWith('game'));
        const activeClass = isActive
          ? 'bg-primary-fixed/20 text-primary border-2 border-primary/40 shadow-sm scale-105 font-bold'
          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60';

        return `
          <a href="${item.href}" 
             title="${item.label}"
             class="sidebar-nav-item w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center relative group transition-all duration-200 cursor-pointer ${activeClass}">
            <span class="material-symbols-outlined text-[24px] lg:text-[26px]">${item.icon}</span>
            
            <!-- Tooltip nổi sang phải khi hover (Desktop) -->
            <span class="hidden md:block absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-headline-sm text-[12px] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50">
              ${item.label}
            </span>
          </a>
        `;
      }).join('');

    sidebar.innerHTML = `
      <!-- 1. Logo tròn Trường Tiểu học Hoàng Mai ở đỉnh Sidebar -->
      <div class="flex flex-col items-center mb-2">
        <a href="index.html" title="Vườn Toán Lớp 3 — Trường Tiểu học Hoàng Mai" class="w-11 h-11 lg:w-12 lg:h-12 rounded-full overflow-hidden p-0.5 border-2 border-primary/30 hover:scale-105 transition-transform shadow-sm flex items-center justify-center bg-white">
          <img alt="Logo Hoàng Mai" class="w-full h-full object-contain" src="assets/img/logo-hoang-mai.png" onerror="this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThBBy5Atw5daAj5mCr2MkSSAVFQ4Rw_JMi4YK1TQQwrA&s=10'"/>
        </a>
      </div>

      <!-- 2. Danh sách Icon Điều Hướng Chính -->
      <nav class="flex flex-col items-center gap-2.5 lg:gap-3.5 w-full my-auto">
        ${linksHtml}
      </nav>

      <!-- 3. Tiện ích Đáy: Huy hiệu sao, Avatar & Đăng xuất -->
      <div class="flex flex-col items-center gap-3 pt-3 border-t border-surface-container-high/60 w-full">
        <!-- Huy hiệu sao tích lũy -->
        <div class="flex items-center justify-center gap-0.5 px-2 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-headline-sm text-[11px] shadow-sm relative group cursor-default" title="Tổng số sao của em">
          <span class="material-symbols-outlined text-[15px] text-tertiary" style="font-variation-settings: 'FILL' 1;">star</span>
          <span id="sidebar-user-stars">${(u.stars || 1250).toLocaleString('vi-VN')}</span>
          <span class="hidden md:block absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-headline-sm text-[12px] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50">
            ⭐ ${u.fullName || 'Học sinh'}: ${(u.stars || 1250).toLocaleString('vi-VN')} sao
          </span>
        </div>

        <!-- Avatar người dùng (Học sinh / Giáo viên) -->
        <div class="relative group cursor-pointer" title="${isTeacher ? (u.fullName || 'Cô Lan Anh (GV Chủ nhiệm minh họa)') : (u.fullName || 'Hồ sơ người dùng')}">
          <img alt="${isTeacher ? (u.fullName || 'Cô Lan Anh (GV Chủ nhiệm minh họa)') : 'Avatar'}" class="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary transition-all" src="${u.avatar || (isTeacher ? 'assets/img/ong-vang-hoang-mai.png' : 'assets/img/ong-vang-hoang-mai.png')}" onerror="this.src='assets/img/ong-vang-hoang-mai.png'"/>
          <span class="hidden md:block absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-headline-sm text-[12px] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50">
            ${isTeacher ? (u.fullName || 'Cô Lan Anh (GV Chủ nhiệm minh họa)') : `${u.fullName || 'Học sinh'} • ${u.className || 'Lớp 3A2'}`}
          </span>
        </div>

        <!-- Nút Đăng xuất -->
        <button id="sidebar-logout-btn" type="button" title="Đăng xuất" class="w-10 h-10 rounded-2xl text-on-surface-variant hover:text-error hover:bg-error-container/40 flex items-center justify-center relative group transition-all">
          <span class="material-symbols-outlined text-[22px]">logout</span>
          <span class="hidden md:block absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-headline-sm text-[12px] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50">
            Đăng xuất
          </span>
        </button>
      </div>
    `;

    // Sự kiện nút đăng xuất
    const logoutBtn = sidebar.querySelector('#sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try { await window.MathAPI.logout(); } catch (e) {}
        location.href = 'login.html';
      });
    }

    // Render thêm thanh điều hướng mobile (Bottom Navigation Rail)
    this.renderMobileNav(page, isTeacher);
  },

  renderMobileNav(page, isTeacher) {
    let mobNav = document.getElementById('app-mobile-nav');
    if (!mobNav) {
      mobNav = document.createElement('nav');
      mobNav.id = 'app-mobile-nav';
      mobNav.className = 'fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface-container-lowest border-t border-outline-variant/30 flex md:hidden items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] select-none';
      document.body.appendChild(mobNav);
    }

    const mobLinks = this.navLinks
      .filter(item => !item.requireTeacher || isTeacher)
      .slice(0, 5) // Tối đa 5 icon trên thanh mobile
      .map(item => {
        const isActive = (page === item.id) || (item.id === 'games' && page.startsWith('game'));
        return `
          <a href="${item.href}" class="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}">
            <span class="material-symbols-outlined text-[22px]">${item.icon}</span>
            <span class="text-[10px] leading-tight font-headline-sm mt-0.5">${item.label.split(' ')[0]}</span>
          </a>
        `;
      }).join('');

    mobNav.innerHTML = mobLinks;
  },

  updateUser(user) {
    if (this.container) {
      this.render(user);
    }
  }
};

