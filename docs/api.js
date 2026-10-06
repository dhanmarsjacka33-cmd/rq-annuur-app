/* ==========================================================
   API LAYER v5.3
   ========================================================== */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwfoH9YKufkEz_mbJnI6H-0TTiBCyZS2Ube34UxR_ROHWqyjyXPDKUd6E-Lus-yEzie/exec';

async function gasCall(action, payload) {
  payload = payload || {};
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ action: action }, payload)),
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
  getRekapGaji: (p) => gasCall('getRekapGaji', p),
  getAuditKeuangan: (p) => gasCall('getAuditKeuangan', p)
};

window.showLoading = function(text, percent) {
  const el = document.getElementById('loading-overlay');
  const txt = document.getElementById('loading-text');
  const bar = document.getElementById('loading-bar');
  const pct = document.getElementById('loading-percent');
  if (el) {
    el.classList.remove('is-hidden');
    if (txt) txt.textContent = text || 'Memuat...';
  }
  if (typeof percent === 'number') {
    if (bar) bar.style.width = percent + '%';
    if (pct) pct.textContent = percent + '%';
  } else {
    if (bar) bar.style.width = '30%';
    if (pct) pct.textContent = '';
  }
};

window.updateLoading = function(percent, text) {
  const bar = document.getElementById('loading-bar');
  const pct = document.getElementById('loading-percent');
  const txt = document.getElementById('loading-text');
  if (bar) bar.style.width = percent + '%';
  if (pct) pct.textContent = percent + '%';
  if (txt && text) txt.textContent = text;
};

window.hideLoading = function() {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.add('is-hidden');
  const bar = document.getElementById('loading-bar');
  if (bar) bar.style.width = '0%';
};

window.showToast = function(msg, type, dur) {
  type = type || 'success';
  dur = dur || 2500;
  const c = document.getElementById('toast-container');
  if (!c) return;
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = 'toast-item ' + type;
  el.innerHTML = '<span style="font-size:1.2rem">' + (icons[type] || '💬') + '</span><span>' + msg + '</span>';
  c.appendChild(el);
  setTimeout(function() {
    el.classList.add('hide');
    setTimeout(function() { el.remove(); }, 300);
  }, dur);
};

window.fireConfetti = function(big) {
  if (typeof confetti === 'undefined') return;
  const colors = ['#FFD166', '#06d6a0', '#06AED5', '#FF6B6B', '#A8E06E', '#B794F6'];
  confetti({ particleCount: big ? 120 : 60, spread: big ? 100 : 70, origin: { y: 0.7 }, colors: colors });
  if (big) {
    setTimeout(function() {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: colors });
    }, 200);
    setTimeout(function() {
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: colors });
    }, 200);
  }
};

window.SOUND_ENABLED = localStorage.getItem('sound_enabled') !== 'false';

window.playSound = function(type) {
  type = type || 'success';
  if (!window.SOUND_ENABLED) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = type === 'success' ? [523.25, 659.25, 783.99] : type === 'error' ? [392.00, 329.63] : [523.25, 659.25];
    notes.forEach(function(f, i) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t);
      o.stop(t + 0.35);
    });
  } catch (e) {}
};

window.vibrate = function(p) {
  if (navigator.vibrate) navigator.vibrate(p || [30, 20, 30]);
};

window.celebrate = function(msg, opts) {
  opts = opts || {};
  const c = opts.confetti !== false;
  const s = opts.sound !== false;
  const v = opts.vibrate !== false;
  const big = opts.big === true;
  if (msg) window.showToast(msg, 'success');
  if (c) window.fireConfetti(big);
  if (s) window.playSound('success');
  if (v) window.vibrate();
};