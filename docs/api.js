/* ==========================================================
   API LAYER + UI HELPERS (Toast, Loading, Confetti, Sound)
   ========================================================== */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwfoH9YKufkEz_mbJnI6H-0TTiBCyZS2Ube34UxR_ROHWqyjyXPDKUd6E-Lus-yEzie/exec';

/* ---------- API CALL ---------- */
async function gasCall(action, payload = {}) {
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: body,
    redirect: 'follow'
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

window.gas = {
  login: (username, password) => gasCall('login', { username, password }),
  getAllAppState: (payload) => gasCall('getAllAppState', payload),
  saveSheetData: (sheetName, record) => gasCall('saveSheetData', { sheetName, record }),
  updateSheetData: (sheetName, record) => gasCall('updateSheetData', { sheetName, record }),
  deleteSheetData: (sheetName, record) => gasCall('deleteSheetData', { sheetName, record }),
};

/* ---------- LOADING ---------- */
window.showLoading = function(text) {
  const el = document.getElementById('loading-overlay');
  const t = document.getElementById('loading-text');
  if (el) { el.classList.remove('is-hidden'); if (t) t.textContent = text || 'Memuat data...'; }
};
window.hideLoading = function() {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.add('is-hidden');
};

/* ---------- TOAST NOTIFICATION ---------- */
window.showToast = function(msg, type = 'success', duration = 2500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.innerHTML = `<span style="font-size:1.2rem">${icons[type] || '💬'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  }, duration);
};

/* ---------- CONFETTI ---------- */
window.fireConfetti = function(big = false) {
  if (typeof confetti === 'undefined') return;
  const colors = ['#FFD166', '#06d6a0', '#06AED5', '#FF6B6B', '#A8E06E', '#B794F6'];
  confetti({ particleCount: big ? 120 : 60, spread: big ? 100 : 70,
    origin: { y: 0.7 }, colors });
  if (big) {
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors }), 200);
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors }), 200);
  }
};

/* ---------- SOUND (Web Audio API, no files needed) ---------- */
window.SOUND_ENABLED = localStorage.getItem('sound_enabled') !== 'false';

window.playSound = function(type = 'success') {
  if (!window.SOUND_ENABLED) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = type === 'success' 
      ? [523.25, 659.25, 783.99]  // C5-E5-G5
      : type === 'error'
      ? [392.00, 329.63]          // G4-E4
      : [523.25, 659.25];         // C5-E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch (e) { /* silent */ }
};

/* ---------- VIBRATE ---------- */
window.vibrate = function(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern || [30, 20, 30]);
};

/* ---------- CELEBRATE (combined) ---------- */
window.celebrate = function(msg, opts = {}) {
  const { confetti: c = true, sound = true, vibrate: v = true, big = false } = opts;
  if (msg) window.showToast(msg, 'success');
  if (c) window.fireConfetti(big);
  if (sound) window.playSound('success');
  if (v) window.vibrate();
};