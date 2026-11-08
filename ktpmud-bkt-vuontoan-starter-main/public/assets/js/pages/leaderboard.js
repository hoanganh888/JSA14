/* Trang Bảng Xếp Hạng: toàn bộ danh sách học sinh (podium Top 3, danh sách Hạng 4-10,
 * danh sách Hạng 11 trở đi) được render từ dữ liệu thật qua GET /api/leaderboard.
 * Không bao giờ xóa/thay thế (replaceWith) các khung chứa #podium-grid, #ranks-4-to-10,
 * #ranks-11-to-end — chỉ ghi đè innerHTML của chính các khung đó. */
document.addEventListener('DOMContentLoaded', () => {
  initLeaderboard();
});

document.addEventListener('mathapp:user-ready', () => {
  loadAndRenderLeaderboard();
});

function initLeaderboard() {
  // 1. Xử lý Mở Rộng / Thu Gọn danh sách Hạng 11 trở đi
  const btnToggle = document.getElementById('btn-toggle-expand');
  const ranks11ToEnd = document.getElementById('ranks-11-to-end');
  const toggleText = document.getElementById('toggle-expand-text');
  const toggleIcon = document.getElementById('toggle-expand-icon');

  if (btnToggle && ranks11ToEnd) {
    btnToggle.addEventListener('click', () => {
      const isHidden = ranks11ToEnd.classList.contains('hidden');
      if (isHidden) {
        ranks11ToEnd.classList.remove('hidden');
        if (toggleText) toggleText.textContent = 'Thu gọn danh sách';
        if (toggleIcon) toggleIcon.textContent = 'expand_less';
      } else {
        ranks11ToEnd.classList.add('hidden');
        if (toggleText) toggleText.textContent = btnToggle.dataset.expandLabel || 'Xem tiếp các dũng sĩ';
        if (toggleIcon) toggleIcon.textContent = 'expand_more';
        ranks11ToEnd.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // 2. Bộ lọc Thời gian (chưa có dữ liệu lịch sử theo tuần/tháng — chỉ đổi giao diện nút)
  const timeBtns = document.querySelectorAll('#filter-time-group .filter-btn');
  timeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      timeBtns.forEach((b) => {
        b.className = 'py-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-sm text-center transition-colors filter-btn';
      });
      btn.className = 'py-2 rounded-xl bg-primary text-on-primary font-headline-sm text-label-sm shadow-[0_3px_0_0_#005320] transition-transform active:translate-y-0.5 text-center filter-btn active';
    });
  });

  // 3. Bộ lọc Phạm vi (hiện tại toàn bộ học sinh đều ở 1 lớp nên chỉ đổi tiêu đề)
  const scopeBtns = document.querySelectorAll('#filter-scope-group .filter-btn');
  const podiumTitle = document.getElementById('podium-title');
  scopeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      scopeBtns.forEach((b) => {
        b.className = 'py-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-sm text-center transition-colors filter-btn';
      });
      btn.className = 'py-2 rounded-xl bg-primary text-on-primary font-headline-sm text-label-sm shadow-[0_3px_0_0_#005320] transition-transform active:translate-y-0.5 text-center filter-btn active';
      const scopeName = btn.textContent.trim();
      if (podiumTitle) podiumTitle.textContent = `Top 3 Dũng Sĩ Xuất Sắc Nhất ${scopeName}`;
    });
  });

  // Phòng trường hợp mất mạng/API lỗi trước khi có dữ liệu thật: không để lại tên giả.
  showEmptyState();
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function fmtStars(n) {
  return Number(n || 0).toLocaleString('vi-VN');
}

function showEmptyState() {
  const podiumGrid = document.getElementById('podium-grid');
  const ranks4to10 = document.getElementById('ranks-4-to-10');
  const ranks11toEnd = document.getElementById('ranks-11-to-end');
  const toggleWrap = document.getElementById('btn-toggle-expand');
  if (podiumGrid) podiumGrid.innerHTML = `<p class="col-span-1 md:col-span-3 text-center font-body-md text-on-surface-variant py-8">Đang tải bảng xếp hạng...</p>`;
  if (ranks4to10) ranks4to10.innerHTML = '';
  if (ranks11toEnd) ranks11toEnd.innerHTML = '';
  if (toggleWrap) toggleWrap.classList.add('hidden');
}

async function loadAndRenderLeaderboard() {
  try {
    const data = await window.MathAPI.get('/api/leaderboard');
    const list = (data && Array.isArray(data.leaderboard)) ? data.leaderboard : [];
    renderStats(list);
    renderPodium(list.slice(0, 3));
    renderRows('ranks-4-to-10', list.slice(3, 10));
    renderRows('ranks-11-to-end', list.slice(10));
    setupExpandToggle(list.length);
    renderMyRankCard(list);
  } catch (err) {
    console.warn('[Leaderboard] Không tải được dữ liệu thật:', err.message);
    const podiumGrid = document.getElementById('podium-grid');
    if (podiumGrid) podiumGrid.innerHTML = `<p class="col-span-1 md:col-span-3 text-center font-body-md text-on-surface-variant py-8">Chưa tải được bảng xếp hạng. Vui lòng thử lại.</p>`;
  }
}

function renderStats(list) {
  const totalStars = list.reduce((sum, r) => sum + Number(r.total_stars || 0), 0);
  const statStars = document.getElementById('stat-total-stars');
  const statStudents = document.getElementById('stat-total-students');
  if (statStars) statStars.textContent = `${fmtStars(totalStars)} ★`;
  if (statStudents) statStudents.textContent = `${list.length} Bạn`;
}

function setupExpandToggle(total) {
  const toggleWrap = document.getElementById('btn-toggle-expand');
  const toggleText = document.getElementById('toggle-expand-text');
  const extra = Math.max(0, total - 10);
  if (!toggleWrap) return;
  if (extra <= 0) {
    toggleWrap.classList.add('hidden');
    return;
  }
  toggleWrap.classList.remove('hidden');
  const label = `Xem tiếp các dũng sĩ Hạng 11 – ${total}`;
  toggleWrap.dataset.expandLabel = label;
  if (toggleText) toggleText.textContent = label;
}

function podiumPillar(rank, row) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  const heights = { 1: 'min-h-[220px]', 2: 'min-h-[170px]', 3: 'min-h-[140px]' };
  const avgText = (row.avg_score == null) ? 'Chưa có dữ liệu' : `${row.avg_score}%`;
  const meTag = row.isMe
    ? `<div class="mb-2 px-3 py-1 rounded-full bg-primary text-on-primary font-headline-sm text-label-sm shadow-[0_3px_0_0_#005320] flex items-center gap-1">
         <span class="material-symbols-outlined text-[16px]">person</span> Đây là con
       </div>`
    : '';
  const sizeClass = rank === 1 ? 'w-28 h-28' : 'w-24 h-24';
  const nameClass = rank === 1 ? 'font-headline-md text-headline-md text-on-surface' : 'font-headline-md text-headline-sm text-on-surface';
  const starClass = rank === 1 ? 'mt-2 flex items-center justify-center gap-1.5 font-headline-sm text-headline-sm text-tertiary font-bold' : 'mt-2 flex items-center justify-center gap-1.5 font-headline-sm text-label-lg text-primary';
  const pillarBg = rank === 1 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : rank === 2 ? 'bg-surface-container-high' : 'bg-surface-container';
  const pillarShadow = rank === 1 ? 'shadow-[0_10px_0_0_#f7be23]' : rank === 2 ? 'shadow-[0_8px_0_0_#d8dad9]' : 'shadow-[0_8px_0_0_#bfcabb]';
  const crown = rank === 1 ? `<div class="mb-1 text-tertiary"><span class="material-symbols-outlined text-[44px]" style="font-variation-settings: 'FILL' 1;">crown</span></div>` : '<div class="h-6"></div>';
  const order = rank === 1 ? 'order-1 md:order-2 -mt-6' : rank === 2 ? 'order-2 md:order-1' : 'order-3 md:order-3';

  return `
    <div class="${order} flex flex-col items-center relative">
      ${meTag}
      ${crown}
      <div class="relative ${sizeClass} mb-3">
        <img class="w-full h-full rounded-full object-cover ring-4 ring-surface-container-lowest shadow-lg" alt="${esc(row.full_name)}" src="assets/img/ong-vang-hoang-mai.png"/>
        <div class="absolute -bottom-2 right-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-md">
          <span class="font-headline-sm text-label-sm">${medal}</span>
        </div>
      </div>
      <div class="text-center mb-3">
        <h3 class="${nameClass}">${esc(row.full_name)}</h3>
        <span class="font-label-sm text-[12px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">Lớp ${esc(row.class_name || '')}</span>
        <div class="${starClass}">
          <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">star</span> ${fmtStars(row.total_stars)} Sao
        </div>
      </div>
      <div class="w-full ${pillarBg} rounded-t-3xl pt-6 pb-8 px-4 flex flex-col items-center justify-between ${pillarShadow} ${heights[rank]}">
        <span class="font-headline-xl text-[48px] text-outline-variant font-black">${rank}</span>
        <div class="w-full bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl p-2.5 flex flex-col gap-1 text-center">
          <div class="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant">
            <span>Điểm TB:</span><span class="text-primary font-bold">${avgText}</span>
          </div>
          <div class="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant">
            <span>Lượt làm bài:</span><span class="text-on-surface font-semibold">${row.attempts_count || 0}</span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderPodium(top3) {
  const podiumGrid = document.getElementById('podium-grid');
  if (!podiumGrid) return;
  if (!top3.length) {
    podiumGrid.innerHTML = `<p class="col-span-1 md:col-span-3 text-center font-body-md text-on-surface-variant py-8">Chưa có học sinh nào trong bảng xếp hạng.</p>`;
    return;
  }
  // Thiếu hạng (lớp dưới 3 bạn) vẫn hiển thị đúng số bạn có, không bịa thêm.
  const parts = [];
  if (top3[1]) parts.push(podiumPillar(2, top3[1]));
  if (top3[0]) parts.push(podiumPillar(1, top3[0]));
  if (top3[2]) parts.push(podiumPillar(3, top3[2]));
  podiumGrid.innerHTML = parts.join('');
}

function listRow(row) {
  const avgText = (row.avg_score == null) ? '—' : `${row.avg_score}%`;
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:px-6 lg:py-3.5 items-center hover:bg-surface-container-low/60 transition-colors${row.isMe ? ' bg-primary-fixed/15' : ''}">
      <div class="flex items-center justify-between lg:justify-center col-span-1">
        <span class="lg:hidden font-label-sm text-on-surface-variant">Thứ hạng:</span>
        <span class="w-8 h-8 rounded-full bg-surface-container-high font-headline-sm text-label-md flex items-center justify-center text-on-surface font-bold">${row.rank}</span>
      </div>
      <div class="flex items-center gap-3 col-span-3">
        <img class="w-11 h-11 rounded-full object-cover ring-2 ring-primary-fixed shrink-0" alt="${esc(row.full_name)}" src="assets/img/ong-vang-hoang-mai.png"/>
        <div class="flex flex-col">
          <span class="font-headline-sm text-label-md text-on-surface font-bold">${esc(row.full_name)}${row.isMe ? ' <span class="text-primary">(con)</span>' : ''}</span>
          <span class="font-label-sm text-[12px] text-on-surface-variant">Lớp ${esc(row.class_name || '')}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-1.5 col-span-3">
        <span class="font-label-sm text-[12px] text-on-surface-variant">${row.attempts_count || 0} lượt làm bài</span>
      </div>
      <div class="flex items-center justify-between lg:justify-center gap-2 col-span-2 font-label-md text-label-sm">
        <span class="lg:hidden text-on-surface-variant">Điểm TB:</span>
        <div class="text-center"><span class="text-primary font-bold">${avgText}</span></div>
      </div>
      <div class="flex items-center justify-between lg:justify-center col-span-2">
        <span class="lg:hidden font-label-sm text-on-surface-variant">Tổng sao:</span>
        <span class="font-headline-sm text-label-lg text-tertiary flex items-center gap-1 font-bold">
          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span> ${fmtStars(row.total_stars)}
        </span>
      </div>
      <div class="flex items-center justify-between lg:justify-center col-span-1 text-on-surface-variant font-headline-sm text-label-sm">
        <span class="lg:hidden font-label-sm text-on-surface-variant">Xu hướng:</span>
        <span>—</span>
      </div>
    </div>`;
}

function renderRows(containerId, rows) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!rows.length) {
    el.innerHTML = `<p class="text-center font-body-md text-on-surface-variant py-6">Chưa có dữ liệu.</p>`;
    return;
  }
  el.innerHTML = rows.map(listRow).join('');
}

function renderMyRankCard(list) {
  const card = document.getElementById('my-rank-card');
  if (!card) return;
  const me = list.find((r) => r.isMe);
  if (!me) {
    // Giáo viên hoặc người xem không có trong bảng xếp hạng học sinh: ẩn thẻ ghim góc dưới.
    card.style.display = 'none';
    return;
  }
  card.style.display = '';
  const myRankBadge = document.getElementById('my-rank-badge');
  const myRankText = document.getElementById('my-rank-text');
  const myStarsBadge = document.getElementById('my-stars-badge');
  const myRankMsg = document.getElementById('my-rank-message');

  if (myRankBadge) myRankBadge.textContent = `#${me.rank}`;
  if (myRankText) myRankText.textContent = `Vị trí hiện tại: Hạng ${me.rank} (Lớp ${me.class_name || ''})`;
  if (myStarsBadge) myStarsBadge.textContent = `${fmtStars(me.total_stars)} ★`;

  if (myRankMsg) {
    if (me.rank === 1) {
      myRankMsg.innerHTML = `Con đang dẫn đầu bảng xếp hạng! Tiếp tục luyện tập để giữ vững vị trí này nhé!`;
    } else {
      const top1 = list[0];
      const diff = Math.max(0, Number(top1 ? top1.total_stars : 0) - Number(me.total_stars || 0));
      myRankMsg.innerHTML = `Cách Hạng 1 còn <strong class="text-tertiary font-bold">${fmtStars(diff)} Sao</strong>! Làm thêm bài tập hoặc chơi Minigame để vươn lên dẫn đầu!`;
    }
  }
}
