/**
 * Footer dùng chung: thay nội dung mọi <footer data-shared-footer> bằng 1 mẫu duy nhất,
 * để sau này đổi hotline/bản quyền chỉ sửa tại đây. Giao diện giữ nguyên mẫu gốc.
 */
window.MathApp = window.MathApp || {};
window.MathApp.components = window.MathApp.components || {};

window.MathApp.components.Footer = {
  template: `
    <div class="w-full px-gutter-mobile lg:px-margin max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-md">
      <div class="flex items-center gap-space-sm">
        <div class="w-10 h-10 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-md shadow-[0_3px_0_0_#006e2c]">
          <span class="material-symbols-outlined">school</span>
        </div>
        <div>
          <p class="font-headline-sm text-label-lg text-primary leading-tight">Trường Tiểu học Hoàng Mai - Hà Nội</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Vườn Toán Thông Minh Dành Cho Học Sinh Lớp 3</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-space-md text-on-surface-variant font-label-md text-label-md">
        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[20px]">menu_book</span> Chương trình GDPT 2018</span>
        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[20px]">support_agent</span> Phòng Thiết bị số Hoàng Mai</span>
        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[20px]">call</span> Hotline: (024) 3861 2xxx</span>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant text-center">© 2025 Trường Tiểu học Hoàng Mai. Dành trọn tình yêu thương cho học sinh lớp 3.</p>
    </div>`,
  init() {
    document.querySelectorAll('footer[data-shared-footer]').forEach((f) => { f.innerHTML = this.template; });
  },
};
