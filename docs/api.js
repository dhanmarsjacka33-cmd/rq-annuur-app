/* ==========================================================
   API LAYER v4.0
   ========================================================== */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwfoH9YKufkEz_mbJnI6H-0TTiBCyZS2Ube34UxR_ROHWqyjyXPDKUd6E-Lus-yEzie/exec';

async function gasCall(action, payload = {}) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
    redirect: 'follow'
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

window.gas = {
  login: (u, p) => gasCall('login', { username: u, password: p }),
  getAllAppState: (p) => gasCall('getAllAppState', p),
  saveSheetData: (s, r) => gasCall('saveSheetData', { sheetName: s, record: r }),
  updateSheetData: (s, r) => gasCall('updateSheetData', { sheetName: s, record: r }),
  deleteSheetData: (s, r) => gasCall('deleteSheetData', { sheetName: s, record: r }),
  uploadFoto: (p) => gasCall('uploadFoto', p),
  logAktivitas: (p) => gasCall('logAktivitas', p),
  simpanAbsenGuru: (p) => gasCall('simpanAbsenGuru', p),
  getKalenderGuru: (p) => gasCall('getKalenderGuru', p),
  getRekapGaji: (p) => gasCall('getRekapGaji', p)
};

window.showLoading = (t) => {
  const el = document.getElementById('loading-overlay');
  const txt = document.getElementById('loading-text');
  if (el) { el.classList.remove('is-hidden'); if (txt) txt.textContent = t || 'Memuat...'; }
};
window.hideLoading = () => {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.add('is-hidden');
};

window.showToast = (msg, type = 'success', dur = 2500) => {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.innerHTML = `<span style="font-size:1.2rem">${icons[type]||'💬'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); }, dur);
};

window.fireConfetti = (big = false) => {
  if (typeof confetti === 'undefined') return;
  const colors = ['#FFD166', '#06d6a0', '#06AED5', '#FF6B6B', '#A8E06E', '#B794F6'];
  confetti({ particleCount: big ? 120 : 60, spread: big ? 100 : 70, origin: { y: 0.7 }, colors });
  if (big) {
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors }), 200);
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors }), 200);
  }
};

window.SOUND_ENABLED = localStorage.getItem('sound_enabled') !== 'false';
window.playSound = (type = 'success') => {
  if (!window.SOUND_ENABLED) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = type === 'success' ? [523.25, 659.25, 783.99] : type === 'error' ? [392.00, 329.63] : [523.25, 659.25];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = 'sine';
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.35);
    });
  } catch (e) {}
};

window.vibrate = (p) => { if (navigator.vibrate) navigator.vibrate(p || [30, 20, 30]); };

window.celebrate = (msg, opts = {}) => {
  const { confetti: c = true, sound = true, vibrate: v = true, big = false } = opts;
  if (msg) window.showToast(msg, 'success');
  if (c) window.fireConfetti(big);
  if (sound) window.playSound('success');
  if (v) window.vibrate();
};