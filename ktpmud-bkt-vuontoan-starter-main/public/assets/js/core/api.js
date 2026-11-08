/**
 * Lớp gọi API dùng chung — mọi trang đều gọi server qua đây.
 * Phiên đăng nhập nằm trong cookie httpOnly nên JS không (và không cần) giữ token.
 */
(function () {
  const TOKEN_KEY = 'vuon_toan_token_client';
  async function request(url, options = {}) {
    let res;
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
        ...options,
      });
    } catch {
      throw new Error('Không kết nối được máy chủ. Bạn hãy mở web bằng bản Live Preview (server đang chạy), không mở trực tiếp file HTML nhé!');
    }
    const data = await res.json().catch(() => ({}));
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token); // nhận token mới khi đăng nhập
    if (!res.ok) {
      if (res.status === 401) localStorage.removeItem(TOKEN_KEY);
      throw new Error(data.error || `Lỗi ${res.status}`);
    }
    return data;
  }
  window.MathAPI = {
    get: (url) => request(url),
    post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body || {}) }),
    put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body || {}) }),
    del: (url) => request(url, { method: 'DELETE' }),
    /** Trả về user hiện tại, hoặc null nếu chưa đăng nhập (không ném lỗi). */
    async me() {
      try { return (await request('/api/auth/me')).user; } catch { return null; }
    },
    logout: async () => { try { await request('/api/auth/logout', { method: 'POST', body: '{}' }); } finally { localStorage.removeItem(TOKEN_KEY); } },
  };
})();
