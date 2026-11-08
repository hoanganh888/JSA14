/**
 * Lưu điểm mini-game dùng chung (Đợt 2).
 * Cách dùng trong từng game: MathGameScore.finish('game-bong-bay', score, startTime)
 * Server cộng sao theo phần điểm vượt kỷ lục cũ của chính học sinh đó.
 */
window.MathGameScore = {
  async finish(gameId, score, startedAt) {
    const durationSec = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    try {
      const r = await window.MathAPI.post('/api/game-scores', { gameId, score, durationSec });
      this.showResult(r);
      return r;
    } catch (err) {
      this.showResult({ score, error: err.message });
      return null;
    }
  },
  showResult(r) {
    document.getElementById('game-result-panel')?.remove();
    const panel = document.createElement('div');
    panel.id = 'game-result-panel';
    panel.className = 'fixed inset-x-0 bottom-0 z-[90] flex justify-center p-4 pointer-events-none';
    panel.innerHTML = `
      <div class="pointer-events-auto w-full max-w-xl rounded-3xl bg-surface-container-lowest shadow-[0_16px_40px_rgba(0,97,39,0.25)] border-4 border-tertiary-fixed p-5 text-center">
        <div class="text-4xl mb-1">🏆</div>
        <h3 class="font-headline-md text-headline-md text-primary">Kết thúc trò chơi!</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1">
          ${r.error ? `Chưa lưu được điểm (${r.error}). Em kiểm tra đăng nhập nhé!`
            : `Điểm của em: <strong class="text-on-surface">${r.score}</strong> • Kỷ lục: <strong class="text-on-surface">${r.bestScore}</strong>` +
              (r.starsEarned ? `<br/>⭐ Em nhận thêm <strong class="text-tertiary">+${r.starsEarned} Sao</strong> (tổng: ${r.totalStars} Sao)` : '<br/>Chưa phá kỷ lục cũ nên chưa cộng thêm sao — cố lên nhé!')}
        </p>
        <div class="flex justify-center gap-3 mt-4">
          <button onclick="location.reload()" class="px-5 py-2.5 rounded-2xl bg-primary text-on-primary font-headline-sm shadow-[0_3px_0_0_#005320] active:translate-y-0.5 transition-all">Chơi lại</button>
          <a href="leaderboard.html" class="px-5 py-2.5 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-headline-sm shadow-[0_3px_0_0_#e6a400] active:translate-y-0.5 transition-all inline-flex items-center">Xem Bảng Xếp Hạng</a>
          <a href="game.html" class="px-5 py-2.5 rounded-2xl bg-surface-container font-headline-sm inline-flex items-center">Đổi trò chơi</a>
        </div>
      </div>`;
    document.body.appendChild(panel);
  },
  /** Nút kết thúc thủ công (dự phòng khi học sinh muốn dừng sớm). */
  addFinishButton(gameId, getScore, startedAt) {
    const btn = document.createElement('button');
    btn.className = 'fixed bottom-4 right-4 z-[80] px-4 py-2.5 rounded-full bg-tertiary text-on-tertiary font-headline-sm text-label-md shadow-lg active:translate-y-0.5 transition-all';
    btn.innerHTML = '<span class="material-symbols-outlined align-middle text-[18px]">flag</span> Kết thúc & Lưu điểm';
    btn.addEventListener('click', () => { btn.disabled = true; window.MathGameScore.finish(gameId, getScore(), startedAt); });
    document.body.appendChild(btn);
  },
};
