/* Logic trang Luyện Tập — tương tác giữ nguyên bản gốc; phần "Kiểm Tra Đáp Án"
 * được nối API: đáp án gửi lên server chấm (server không gửi đáp án xuống),
 * điểm + sao + tiến độ được lưu vào DB nên tải lại trang không mất. */
let activeInputId = 'math-input-3';
  let currentBrush = 'green';
  let hintCount = 2;

  function setActiveInput(id) {
    activeInputId = id;
    ['math-input-1', 'math-input-2', 'math-input-3'].forEach(name => {
      const el = document.getElementById(name);
      if (el) {
        if (name === id) {
          el.classList.add('ring-2', 'ring-tertiary-fixed-dim');
        } else {
          el.classList.remove('ring-2', 'ring-tertiary-fixed-dim');
        }
      }
    });
  }

  function pressKey(val) {
    if (!activeInputId) return;
    const target = document.getElementById(activeInputId);
    if (!target) return;

    if (val === 'OK') {
      if (activeInputId === 'math-input-1') setActiveInput('math-input-2');
      else if (activeInputId === 'math-input-2') setActiveInput('math-input-3');
      return;
    }

    if (target.value === '?' || target.value === '') {
      target.value = val;
    } else if (target.value.length < 2) {
      target.value += val;
    }
  }

  function clearKey() {
    if (!activeInputId) return;
    const target = document.getElementById(activeInputId);
    if (target) {
      target.value = '';
    }
  }

  function setCompare(slotId, sign) {
    const el = document.getElementById(slotId);
    if (el) {
      el.textContent = sign;
      el.classList.add('bg-secondary-container', 'text-on-secondary-container', 'font-bold');
      el.classList.remove('text-primary');
    }
  }

  function selectBrush(color) {
    currentBrush = color;
    const btnGreen = document.getElementById('brush-green');
    const btnYellow = document.getElementById('brush-yellow');

    if (color === 'green') {
      btnGreen.classList.add('ring-2', 'ring-primary');
      btnYellow.classList.remove('ring-2', 'ring-primary');
    } else {
      btnYellow.classList.add('ring-2', 'ring-primary');
      btnGreen.classList.remove('ring-2', 'ring-primary');
    }
  }

  function paintCard(btn) {
    const statusLabel = btn.querySelector('span:nth-child(2)');
    if (currentBrush === 'green') {
      btn.className = "h-24 rounded-2xl bg-secondary-fixed-dim text-on-secondary-fixed p-3 flex flex-col items-center justify-center shadow-[0_4px_0_0_#006e2c] transition-transform active:scale-95 group";
      if (statusLabel) {
        statusLabel.textContent = "Đã tô Xanh lá (=12)";
        statusLabel.className = "text-[12px] font-label-sm text-secondary font-bold mt-1";
      }
    } else {
      btn.className = "h-24 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed p-3 flex flex-col items-center justify-center shadow-[0_4px_0_0_#e6a400] transition-transform active:scale-95 group";
      if (statusLabel) {
        statusLabel.textContent = "Đã tô Vàng (=18)";
        statusLabel.className = "text-[12px] font-label-sm text-tertiary font-bold mt-1";
      }
    }
  }

  function useHint() {
    if (hintCount > 0) {
      hintCount--;
      const btn = document.getElementById('btn-hint');
      if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">help_center</span><span>Xem gợi ý chi tiết (Còn ${hintCount} lần)</span>`;
      }
      alert("Ong Vàng mách nước: 36 : 6 nghĩa là mấy nhân với 6 bằng 36 nhỉ? Đúng rồi, 6 × 6 = 36!");
    } else {
      alert("Em đã dùng hết quyền trợ giúp trong lượt này. Hãy thử tự suy luận nhé!");
    }
  }

  function resetWorksheet() {
    ['slot-1-1', 'slot-1-2', 'slot-1-3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '?';
        el.className = "w-12 h-12 rounded-2xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] font-headline-lg";
      }
    });

    ['math-input-1', 'math-input-2', 'math-input-3'].forEach(id => {
      const inp = document.getElementById(id);
      if (inp) inp.value = '';
    });

    alert("Đã làm mới lại phiếu bài tập. Chúc bé luyện tập vui vẻ!");
  }

  /** Thu thập đáp án trên phiếu theo đúng id câu hỏi trong DB (data/seed.json). */
  function collectAnswers() {
    const answers = {};
    ['slot-1-1', 'slot-1-2', 'slot-1-3'].forEach((id, i) => {
      const el = document.getElementById(id);
      answers[`compare-${i + 1}`] = el && el.textContent.trim() !== '?' ? el.textContent.trim() : '';
    });
    ['math-input-1', 'math-input-2', 'math-input-3'].forEach((id, i) => {
      const el = document.getElementById(id);
      answers[`input-${i + 1}`] = el ? el.value.trim() : '';
    });
    document.querySelectorAll('button[onclick*="paintCard"]').forEach((btn, i) => {
      const label = btn.textContent;
      answers[`paint-${i + 1}`] = label.includes('Xanh') ? 'green' : label.includes('Vàng') ? 'yellow' : '';
    });
    return answers;
  }

  async function submitExam() {
    const modal = document.getElementById('feedback-modal');
    try {
      const result = await window.MathAPI.post('/api/submissions', {
        setId: 'phieu-bai-9-10', answers: collectAnswers(), durationSec: Math.max(0, seconds - 342),
      });
      if (modal) {
        const title = modal.querySelector('h4');
        const desc = modal.querySelector('p');
        if (title) title.textContent = result.scorePercent >= 80 ? 'Xuất sắc quá! 🎉' : result.scorePercent >= 50 ? 'Tốt lắm, cố thêm chút nữa nhé! 💪' : 'Mình cùng ôn lại rồi làm lại nhé! 🌱';
        if (desc) desc.innerHTML = `Em làm đúng <strong>${result.correctCount}/${result.totalCount}</strong> phần, đạt <strong>${result.scorePercent}%</strong>` +
          (result.starsEarned ? ` và nhận thêm <strong class="text-tertiary">+${result.starsEarned} Sao</strong> vàng!` : ' (điểm chưa cao hơn lần tốt nhất nên chưa cộng thêm sao).') +
          `<br/>Điểm đã được lưu vào hồ sơ học tập của em.`;
        modal.classList.remove('hidden');
      }
    } catch (err) {
      alert(err.message === 'Bạn chưa đăng nhập.' ? 'Phiên đăng nhập đã hết, em đăng nhập lại nhé!' : `Chưa nộp được bài: ${err.message}`);
      if (err.message === 'Bạn chưa đăng nhập.') location.href = 'login.html';
    }
  }

  function closeModal() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Gentle timer counter
  let seconds = 342;
  setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('display-timer');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
  }, 1000);
