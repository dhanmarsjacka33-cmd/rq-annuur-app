/* ==========================================================
   API LAYER — Pengganti google.script.run
   Kirim request ke Google Apps Script Web App via fetch
   ========================================================== */

// ⚠️ GANTI DENGAN URL WEB APP APPS SCRIPT ANDA (yang sudah di-deploy ulang)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwfoH9YKufkEz_mbJnI6H-0TTiBCyZS2Ube34UxR_ROHWqyjyXPDKUd6E-Lus-yEzie/exec';

/**
 * Panggil endpoint Apps Script
 * Menggunakan Content-Type: text/plain agar tidak trigger CORS preflight
 */
async function gasCall(action, payload = {}, options = {}) {
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: body,
    redirect: 'follow'
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + res.statusText);
  return res.json();
}

/**
 * Wrapper API — semua method mengembalikan Promise
 */
window.gas = {
  login: (username, password) => gasCall('login', { username, password }),
  getAllAppState: (payload) => gasCall('getAllAppState', payload),
  saveSheetData: (sheetName, record) => gasCall('saveSheetData', { sheetName, record }),
  updateSheetData: (sheetName, record) => gasCall('updateSheetData', { sheetName, record }),
  deleteSheetData: (sheetName, record) => gasCall('deleteSheetData', { sheetName, record }),
};

/* ==========================================================
   LOADING OVERLAY helper
   ========================================================== */
window.showLoading = function(text) {
  const el = document.getElementById('loading-overlay');
  const t = document.getElementById('loading-text');
  if (el) { el.classList.remove('is-hidden'); if(t) t.textContent = text || 'Memuat data...'; }
};
window.hideLoading = function() {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.add('is-hidden');
};
