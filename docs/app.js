/* ==========================================================
   MUTABA'AH RQ AN-NUUR — APP LOGIC v3.0
   ========================================================== */

let activeUser = {};
let records = [];
let recordsKeu = [];
let recordsKas = [];
let recordsKategori = [];
let recordsFoto = [];
let recordsPencapaian = [];
let dataReady = false;
let editingRuleId = null;
let editingRecord = null;
let appKontakWali = {};
let activeMutabaahTab = 'jilid';
let currentMasterType = '';
let editingMasterId = null;
let currentInsentifList = [];
let waliChartInstance = null;

/* ---------- BADGE DEFINITIONS ---------- */
const BADGE_LIST = [
  { id: 'poin100', icon: '👑', label: 'Sultan Poin', check: (stats) => stats.poin >= 100 },
  { id: 'poin50', icon: '⭐', label: 'Bintang Kelas', check: (stats) => stats.poin >= 50 },
  { id: 'hadir20', icon: '🔥', label: 'Rajin Hadir', check: (stats) => stats.hadirBulanIni >= 20 },
  { id: 'hadir10', icon: '💪', label: 'Semangat', check: (stats) => stats.hadirBulanIni >= 10 },
  { id: 'hafalan10', icon: '📚', label: 'Kutu Buku', check: (stats) => stats.totalSetoran >= 10 },
  { id: 'hafalan50', icon: '🕌', label: 'Hafiz Kecil', check: (stats) => stats.totalSetoran >= 50 },
  { id: 'jilid3', icon: '🎓', label: 'Naik Jilid', check: (stats) => stats.jilidMax >= 3 },
  { id: 'jilid6', icon: '🏅', label: 'Jilid Master', check: (stats) => stats.jilidMax >= 6 },
];

/* ---------- THEME ---------- */
function applyTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = saved === 'dark' 
      ? '<i data-lucide="sun" width="18"></i>' 
      : '<i data-lucide="moon" width="18"></i>';
    if (window.lucide) lucide.createIcons();
  }
}

/* ---------- ONBOARDING ---------- */
const ONBOARD_STEPS = [
  { icon: '🎉', title: 'Selamat Datang!', desc: `Aplikasi ini untuk mencatat mutaba'ah santri, absensi, dan keuangan RQ An-Nuur.` },
  { icon: '📖', title: 'Catat Setoran', desc: `Klik menu "Catat Mutaba'ah" untuk input setoran Jilid, Surah, Doa, atau Hadits.` },
  { icon: '📋', title: 'Lihat Riwayat Anak', desc: `Setelah pilih murid, otomatis muncul riwayat terakhir — memudahkan jika santri lupa bawa mutaba'ah.` },
  { icon: '⭐', title: 'Beri Poin', desc: 'Beri poin untuk kebaikan santri. Poin muncul di leaderboard dan dashboard wali.' },
  { icon: '🎨', title: 'Personalisasi', desc: 'Ganti tema 🌙, matikan suara 🔇, atau install ke home screen HP untuk akses cepat.' }
];
let onboardIdx = 0;
function showOnboarding() {
  if (localStorage.getItem('onboarded_v3') === 'true') return;
  onboardIdx = 0;
  document.getElementById('onboarding-overlay').classList.remove('is-hidden');
  updateOnboardingUI();
}
function updateOnboardingUI() {
  const s = ONBOARD_STEPS[onboardIdx];
  document.getElementById('onboard-icon').textContent = s.icon;
  document.getElementById('onboard-title').textContent = s.title;
  document.getElementById('onboard-desc').textContent = s.desc;
  document.getElementById('onboard-step').textContent = onboardIdx + 1;
  document.getElementById('onboard-btn').textContent = onboardIdx === ONBOARD_STEPS.length - 1 ? '✅ Mulai Pakai!' : 'Lanjut →';
}
window.nextOnboarding = function() {
  onboardIdx++;
  if (onboardIdx >= ONBOARD_STEPS.length) {
    localStorage.setItem('onboarded_v3', 'true');
    document.getElementById('onboarding-overlay').classList.add('is-hidden');
    return;
  }
  updateOnboardingUI();
}
window.skipOnboarding = function() {
  localStorage.setItem('onboarded_v3', 'true');
  document.getElementById('onboarding-overlay').classList.add('is-hidden');
}

/* ---------- AVATAR (pakai foto kalau ada) ---------- */
function getChildAvatar(name) {
  const foto = recordsFoto.find(f => f.child_name === name);
  if (foto && foto.url) return { initial: (name||'?').charAt(0).toUpperCase(), color: '#FFD166', url: foto.url };
  const colors = ['#FFD166', '#06d6a0', '#06AED5', '#B794F6', '#FF6B6B', '#A8E06E', '#FFB085', '#0f7fa1'];
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const idx = (name || '?').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return { initial, color: colors[idx], url: null };
}
window.getChildAvatar = getChildAvatar;

function setAvatar(el, name, size) {
  const av = getChildAvatar(name);
  if (size) { el.style.width = size + 'px'; el.style.height = size + 'px'; }
  if (av.url) {
    el.style.background = `url('${av.url}') center/cover`;
    el.textContent = '';
  } else {
    el.style.background = av.color;
    el.textContent = av.initial;
  }
}

/* ---------- WAKTU ---------- */
function getWIBISOString() {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const wib = new Date(utc + (3600000 * 7));
  const pad = n => String(n).padStart(2, '0');
  return `${wib.getFullYear()}-${pad(wib.getMonth()+1)}-${pad(wib.getDate())}T${pad(wib.getHours())}:${pad(wib.getMinutes())}:${pad(wib.getSeconds())}+07:00`;
}
function getLocalDateString() {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const wib = new Date(utc + (3600000 * 7));
  const pad = n => String(n).padStart(2, '0');
  return `${wib.getFullYear()}-${pad(wib.getMonth() + 1)}-${pad(wib.getDate())}`;
}
function normalizeName(str) {
  if (!str) return "";
  let s = str.trim().replace(/\s+/g, ' ').toLowerCase();
  if (s.startsWith('m ')) s = 'muhammad ' + s.substring(2);
  else if (s.startsWith('m. ')) s = 'muhammad ' + s.substring(3);
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function formatMonthYear(ym) {
  if (!ym) return "";
  const [y, m] = ym.split('-');
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  return `${months[parseInt(m)-1]} ${y}`;
}
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ---------- TUNGGAKAN ---------- */
window.getTunggakan = function(childName, unit) {
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const d = new Date(); const cMonth = d.getMonth(); const cYear = d.getFullYear();
  const absCurrent = cYear * 12 + cMonth;
  const startAbs = (cMonth >= 6 ? cYear : cYear - 1) * 12 + 6;
  let paidSPP = new Set();
  let totalTagihanTambahan = 0, totalPelunasanTambahan = 0, rincianTambahan = [];
  const cKeu = recordsKeu.filter(r => r.child_name === childName);
  cKeu.forEach(r => {
    let kat = (r.kategori||"").trim(); let nom = parseFloat(r.nominal) || 0;
    if (kat === "Iuran Bulanan" && r.iuran_range) {
      let parts = r.iuran_range.toLowerCase().split(' s/d ');
      let parseYM = (str) => {
        let m = -1, y = -1;
        months.forEach((mn, idx) => { if (str.includes(mn.toLowerCase())) m = idx; });
        let ym = str.match(/\d{4}/); if (ym) y = parseInt(ym[0]);
        return (m !== -1 && y !== -1) ? (y * 12 + m) : null;
      };
      let st = parseYM(parts[0]), en = parts.length > 1 ? parseYM(parts[1]) : st;
      if (st && en) { for (let i = st; i <= en; i++) paidSPP.add(i); }
      else if (st) paidSPP.add(st);
    }
    if (kat === "Tagihan Tambahan") { totalTagihanTambahan += nom; if (r.keterangan) rincianTambahan.push(r.keterangan); }
    if (kat === "Pelunasan Tagihan Tambahan") { totalPelunasanTambahan += nom; }
  });
  let missingSPPMonths = [];
  for (let i = startAbs; i <= absCurrent; i++) { if (!paidSPP.has(i)) missingSPPMonths.push(`${months[i%12]} ${Math.floor(i/12)}`); }
  let sppTotalHutang = 0;
  if (missingSPPMonths.length > 0) {
    let lastNominal = 0;
    let pTarif = cKeu.filter(r => (r.kategori||"").trim() === "Tarif SPP").sort((a,b)=>new Date(b.date)-new Date(a.date));
    let pIuran = cKeu.filter(r => (r.kategori||"").trim() === "Iuran Bulanan").sort((a,b)=>new Date(b.date)-new Date(a.date));
    if (pTarif.length > 0 && parseFloat(pTarif[0].nominal) > 0) lastNominal = parseFloat(pTarif[0].nominal);
    else if (pIuran.length > 0 && parseFloat(pIuran[0].nominal) > 0) lastNominal = parseFloat(pIuran[0].nominal);
    else { if (unit === "PAUDQU") lastNominal = 200000; else if (unit === "Bimbel") lastNominal = 100000; else if (unit === "TPQ") lastNominal = 50000; else if (unit === "TKQ") lastNominal = 20000; }
    sppTotalHutang = missingSPPMonths.length * lastNominal;
  }
  let sisaTambahan = totalTagihanTambahan - totalPelunasanTambahan;
  if (sisaTambahan < 0) sisaTambahan = 0;
  let finalMissingArr = [...missingSPPMonths];
  let finalTotalHutang = sppTotalHutang;
  if (sisaTambahan > 0) {
    finalTotalHutang += sisaTambahan;
    let info = rincianTambahan.length > 0 ? ` (${rincianTambahan.join(", ")})` : "";
    finalMissingArr.push(`Tagihan Lainnya${info}`);
  }
  return { missing: finalMissingArr, total: finalTotalHutang, sppMissing: missingSPPMonths, sppTotal: sppTotalHutang, tambahanTotal: sisaTambahan };
};

function renderIuran1Tahun(childName, recordsKeu, isDark = true) {
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const d = new Date(); const cYear = d.getFullYear(); const cMonth = d.getMonth();
  let sy = cMonth >= 6 ? cYear : cYear - 1;
  let targetMonths = [];
  for (let i = 0; i < 12; i++) {
    let mIdx = (6 + i) % 12;
    let y = (6 + i) >= 12 ? sy + 1 : sy;
    targetMonths.push({ mName: months[mIdx], y, abs: y * 12 + mIdx, short: months[mIdx].substring(0,3) });
  }
  let paid = new Set();
  const cKeu = recordsKeu.filter(r => r.child_name === childName && (r.kategori||"").trim() === "Iuran Bulanan" && r.iuran_range);
  cKeu.forEach(r => {
    let parts = r.iuran_range.toLowerCase().split(' s/d ');
    let parseYM = (str) => {
      let m = -1, y = -1;
      months.forEach((mn, idx) => { if (str.includes(mn.toLowerCase())) m = idx; });
      let ym = str.match(/\d{4}/); if (ym) y = parseInt(ym[0]);
      return (m !== -1 && y !== -1) ? (y * 12 + m) : null;
    };
    let start = parseYM(parts[0]); let end = parts.length > 1 ? parseYM(parts[1]) : start;
    if (start && end) { for (let i = start; i <= end; i++) paid.add(i); }
    else if (start) paid.add(start);
  });
  let html = `<div class="grid grid-cols-6 gap-1 mt-2 w-full">`;
  targetMonths.forEach(tm => {
    let isPaid = paid.has(tm.abs), boxClass, textClass, nameClass;
    if (isDark) {
      boxClass = isPaid ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10";
      textClass = isPaid ? "text-emerald-400" : "text-white/20";
      nameClass = "text-white/90";
    } else {
      boxClass = isPaid ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50 border border-gray-200";
      textClass = isPaid ? "text-emerald-600" : "text-gray-300";
      nameClass = "text-gray-700";
    }
    let icon = isPaid ? "✓" : "✗";
    html += `<div class="text-[9px] font-bold ${boxClass} px-1 py-1 rounded text-center leading-tight flex flex-col items-center justify-center"><span class="${nameClass} mb-0.5">${tm.short}</span><span class="${textClass}">${icon}</span></div>`;
  });
  return html + `</div>`;
}

/* ---------- BADGE CALC ---------- */
function computeStatsForChild(childName) {
  const cRec = records.filter(r => r.child_name === childName);
  const cMon = getLocalDateString().slice(0, 7);
  const poin = cRec.filter(r => r.type === "Poin").reduce((s, r) => s + (+r.points||0), 0);
  const hadirBulanIni = cRec.filter(r => r.type === "Absensi" && r.attendance_status === "Hadir" && r.date.startsWith(cMon)).length;
  const totalSetoran = cRec.filter(r => ["Setoran Jilid","Setoran Jilid & Tilawah","Setoran Hafalan","Setoran Buku","Setoran Doa","Setoran Hadits"].includes(r.type)).length;
  let jilidMax = 0;
  cRec.forEach(r => { if (r.jilid_number) jilidMax = Math.max(jilidMax, +r.jilid_number || 0); });
  return { poin, hadirBulanIni, totalSetoran, jilidMax };
}
function getBadgesForChild(childName) {
  const stats = computeStatsForChild(childName);
  return BADGE_LIST.map(b => ({ ...b, earned: b.check(stats) }));
}

/* ---------- ANOMALY DETECTION ---------- */
function detectAnomalies(childName, newRecord) {
  if (!childName) return [];
  const cRec = records.filter(r => r.child_name === childName);
  const warnings = [];
  const today = getLocalDateString();
  // Setoran ganda hari ini
  if (newRecord.type && newRecord.type.startsWith("Setoran")) {
    const dup = cRec.find(r => r.date.startsWith(today) && r.type === newRecord.type);
    if (dup) warnings.push(`⚠️ Sudah ada ${newRecord.type} hari ini untuk ${childName}`);
  }
  // Jilid mundur
  if (newRecord.type === "Setoran Jilid" || newRecord.type === "Setoran Jilid & Tilawah") {
    const lastJilid = cRec.filter(r => r.jilid_number).sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    if (lastJilid && +newRecord.jilid_number < +lastJilid.jilid_number) {
      warnings.push(`⚠️ Jilid ${newRecord.jilid_number} lebih rendah dari terakhir (Jilid ${lastJilid.jilid_number})`);
    }
  }
  return warnings;
}

/* ---------- INIT ---------- */
const todayObj = new Date();
document.getElementById("cal-day").textContent = todayObj.getDate();
document.getElementById("cal-month").textContent = todayObj.toLocaleString('id-ID', { month: 'short' });
document.getElementById("today-date").textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(todayObj);
applyTheme();

window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  applyTheme();
  
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const cur = localStorage.getItem('theme') || 'light';
    localStorage.setItem('theme', cur === 'light' ? 'dark' : 'light');
    applyTheme();
    window.showToast(cur === 'light' ? 'Tema gelap aktif 🌙' : 'Tema terang aktif ☀️', 'info', 1500);
  });
  
  // Sound toggle
  const sBtn = document.getElementById('sound-toggle');
  if (sBtn) {
    const updateIcon = () => {
      sBtn.innerHTML = window.SOUND_ENABLED ? '<i data-lucide="volume-2" width="18"></i>' : '<i data-lucide="volume-x" width="18"></i>';
      if (window.lucide) lucide.createIcons();
    };
    updateIcon();
    sBtn.addEventListener('click', () => {
      window.SOUND_ENABLED = !window.SOUND_ENABLED;
      localStorage.setItem('sound_enabled', window.SOUND_ENABLED);
      updateIcon();
      window.showToast(window.SOUND_ENABLED ? 'Suara aktif 🔔' : 'Suara mati 🔇', 'info', 1500);
    });
  }
  
  try {
    const savedSession = localStorage.getItem('mutabaah_session');
    if (savedSession) {
      const parsedUser = JSON.parse(savedSession);
      if (!parsedUser || !parsedUser.role) throw new Error("Sesi tidak valid");
      activeUser = parsedUser;
      processRoleUI(activeUser.role.toLowerCase());
      document.getElementById('user-greeting').textContent = activeUser.nama_terkait || activeUser.username;
      showScreen('dashboard-screen');
      window.appSdk.init(handler, false);
    } else {
      setTimeout(showOnboarding, 500);
    }
  } catch (e) {
    localStorage.removeItem('mutabaah_session');
    showScreen('login-screen');
  }

  document.querySelectorAll(".back-button").forEach(b => {
    b.addEventListener("click", () => {
      editingRecord = null; editingRuleId = null;
      const btn = document.getElementById("add-rule-button");
      if (btn) btn.textContent = "➕ Tambah Aturan";
      closeMasterManage();
      showScreen("dashboard-screen");
    });
  });

  ["open-mutabaah","open-bimbel","open-absen","open-points","open-manage","open-report","open-bendahara","open-leaderboard","open-hall","open-kas","open-keu-santri","open-penagihan","open-fotoupload"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        const target = id.replace("open-", "") + "-screen";
        const form = document.querySelector(`#${target} form`);
        if (form) form.reset();
        if (target === "mutabaah-screen") { document.querySelector('.tab-btn[data-target="jilid"]').click(); closeMasterManage(); }
        if (target === "absen-screen") document.getElementById("absen-date").value = getLocalDateString();
        if (target === "report-screen") updateReportChildList();
        if (target === "kas-screen") { renderKasDashboard(); populateKasKategori(); }
        if (target === "keu-santri-screen") { document.getElementById("keu-kategori").dispatchEvent(new Event('change')); }
        if (target === "bendahara-screen") {
          const td = new Date();
          document.getElementById("salary-end").value = getLocalDateString();
          document.getElementById("salary-start").value = `${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,'0')}-01`;
        }
        if (target === "penagihan-screen") renderPenagihanDashboard();
        if (target === "hall-screen") renderHallOfFame();
        if (target === "fotoupload-screen") renderPencapaianList();
        showScreen(target);
      });
    }
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active', 'bg-[#0d5563]', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-500');
      });
      e.target.classList.remove('bg-gray-100', 'text-gray-500');
      e.target.classList.add('active', 'bg-[#0d5563]', 'text-white');
      activeMutabaahTab = e.target.dataset.target;
      document.querySelectorAll('.mutabaah-panel').forEach(p => p.classList.add('is-hidden'));
      document.getElementById(`panel-${activeMutabaahTab}`).classList.remove('is-hidden');
      closeMasterManage();
      checkAnomali();
    });
  });
  
  // Riwayat otomatis saat pilih murid
  document.getElementById('mutabaah-child-select')?.addEventListener('change', () => {
    renderRiwayatCard();
    checkAnomali();
  });
});

/* ---------- SDK ---------- */
window.appSdk = {
  init: async function(handler, fetchAll = false) {
    const role = activeUser.role ? activeUser.role.toLowerCase() : '';
    const names = role === 'wali' ? (activeUser.nama_terkait||"").split(',').map(n=>normalizeName(n)) : [];
    try {
      window.showLoading('Memuat data...');
      const res = await window.gas.getAllAppState({ fetchAll, role, names });
      handler.onDataChanged(res);
      window.hideLoading();
      return { isOk: true };
    } catch (err) {
      console.error(err);
      window.hideLoading();
      window.showToast('Gagal memuat data.', 'error');
      return { isOk: false };
    }
  },
  create: async function(sheetName, record) {
    record.record_id = "ID_" + Date.now() + "_" + Math.floor(Math.random()*10000);
    record.__backendId = record.record_id;
    try {
      const res = await window.gas.saveSheetData(sheetName, record);
      // Log
      window.gas.logAktivitas({ user: activeUser.username || '', aksi: 'CREATE', sheet: sheetName, detail: JSON.stringify(record).substring(0, 200) }).catch(()=>{});
      return { isOk: !!res };
    } catch (e) { return { isOk: false }; }
  },
  update: async function(sheetName, record) {
    record.__backendId = record.record_id || record.__backendId;
    try {
      const res = await window.gas.updateSheetData(sheetName, record);
      window.gas.logAktivitas({ user: activeUser.username || '', aksi: 'UPDATE', sheet: sheetName, detail: record.record_id }).catch(()=>{});
      return { isOk: res };
    } catch (e) { return { isOk: false }; }
  },
  delete: async function(sheetName, record) {
    try {
      const res = await window.gas.deleteSheetData(sheetName, record);
      window.gas.logAktivitas({ user: activeUser.username || '', aksi: 'DELETE', sheet: sheetName, detail: record.record_id }).catch(()=>{});
      return { isOk: res };
    } catch (e) { return { isOk: false }; }
  }
};

/* ---------- UI HELPERS ---------- */
const screens = document.querySelectorAll(".screen");
const showScreen = id => {
  screens.forEach(s => s.classList.toggle("active", s.id === id));
  lucide.createIcons();
  window.scrollTo(0, 0);
};
const setStatus = (id, msg, error = false) => {
  const e = document.getElementById(id);
  if (!e) return;
  e.textContent = msg;
  e.style.color = error ? "#c83252" : "#087a61";
};
const setSaving = (b, on) => { if (!b) return; b.disabled = on; b.style.opacity = on ? ".65" : "1"; };
const formatDate = iso => {
  try { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)); }
  catch (e) { return iso; }
};

/* ---------- ROLE UI ---------- */
function processRoleUI(role) {
  ['menu-container','guru-attendance-card','open-bendahara','open-kas','open-keu-santri','open-penagihan','open-fotoupload','report-filters','history-section','wali-dashboard'].forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.add('is-hidden');
  });
  if (role === 'wali') {
    document.getElementById('wali-dashboard').classList.remove('is-hidden');
    document.getElementById('history-section').classList.remove('is-hidden');
  } else {
    ['menu-container','report-filters','history-section'].forEach(id => document.getElementById(id).classList.remove('is-hidden'));
    if (role === 'guru') document.getElementById('guru-attendance-card').classList.remove('is-hidden');
    else if (role === 'bendahara' || role === 'admin') {
      ['open-bendahara','open-kas','open-keu-santri','open-penagihan','open-fotoupload','guru-attendance-card'].forEach(id => document.getElementById(id).classList.remove('is-hidden'));
      const tLocal = getLocalDateString();
      ['izin-guru-tanggal','keu-tanggal','kas-tanggal'].forEach(id => { const e = document.getElementById(id); if (e) e.value = tLocal; });
    }
  }
}

/* ---------- LOGIN ---------- */
document.getElementById('form-login').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  const msg = document.getElementById('login-pesan');
  btn.textContent = "Memeriksa..."; btn.disabled = true; msg.textContent = "";
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  window.gas.login(username, password)
    .then(res => {
      btn.textContent = "Masuk →"; btn.disabled = false;
      if (res.sukses) {
        activeUser = res;
        localStorage.setItem('mutabaah_session', JSON.stringify(activeUser));
        document.getElementById('user-greeting').textContent = res.nama_terkait || res.username;
        processRoleUI(res.role.toLowerCase());
        showScreen('dashboard-screen');
        window.celebrate('Selamat datang, ' + (res.nama_terkait || res.username) + '! 👋');
        window.appSdk.init(handler, false);
      } else {
        msg.textContent = res.pesan || "Login gagal";
        window.playSound('error');
      }
    })
    .catch(err => {
      console.error(err);
      btn.textContent = "Masuk →"; btn.disabled = false;
      msg.textContent = "Gagal terhubung ke server.";
      window.playSound('error');
    });
});

function logout() {
  if (!confirm("Keluar dari aplikasi?")) return;
  localStorage.removeItem('mutabaah_session');
  document.getElementById('form-login').reset();
  showScreen('login-screen');
  records = []; recordsKeu = []; recordsKas = []; recordsKategori = []; recordsFoto = []; recordsPencapaian = [];
  activeUser = {}; appKontakWali = {};
}
window.logout = logout;

/* ---------- SURAH DATA ---------- */
const surahData = [{"name":"1. Al-Fatihah","verses":7},{"name":"2. Al-Baqarah","verses":286},{"name":"3. Ali 'Imran","verses":200},{"name":"4. An-Nisa'","verses":176},{"name":"5. Al-Ma'idah","verses":120},{"name":"6. Al-An'am","verses":165},{"name":"7. Al-A'raf","verses":206},{"name":"8. Al-Anfal","verses":75},{"name":"9. At-Taubah","verses":129},{"name":"10. Yunus","verses":109},{"name":"11. Hud","verses":123},{"name":"12. Yusuf","verses":111},{"name":"13. Ar-Ra'd","verses":43},{"name":"14. Ibrahim","verses":52},{"name":"15. Al-Hijr","verses":99},{"name":"16. An-Nahl","verses":128},{"name":"17. Al-Isra'","verses":111},{"name":"18. Al-Kahf","verses":110},{"name":"19. Maryam","verses":98},{"name":"20. Taha","verses":135},{"name":"21. Al-Anbiya'","verses":112},{"name":"22. Al-Hajj","verses":78},{"name":"23. Al-Mu'minun","verses":118},{"name":"24. An-Nur","verses":64},{"name":"25. Al-Furqan","verses":77},{"name":"26. Asy-Syu'ara'","verses":227},{"name":"27. An-Naml","verses":93},{"name":"28. Al-Qasas","verses":88},{"name":"29. Al-'Ankabut","verses":69},{"name":"30. Ar-Rum","verses":60},{"name":"31. Luqman","verses":34},{"name":"32. As-Sajdah","verses":30},{"name":"33. Al-Ahzab","verses":73},{"name":"34. Saba'","verses":54},{"name":"35. Fatir","verses":45},{"name":"36. Yasin","verses":83},{"name":"37. As-Saffat","verses":182},{"name":"38. Sad","verses":88},{"name":"39. Az-Zumar","verses":75},{"name":"40. Ghafir","verses":85},{"name":"41. Fussilat","verses":54},{"name":"42. Asy-Syura","verses":53},{"name":"43. Az-Zukhruf","verses":89},{"name":"44. Ad-Dukhan","verses":59},{"name":"45. Al-Jasiyah","verses":37},{"name":"46. Al-Ahqaf","verses":35},{"name":"47. Muhammad","verses":38},{"name":"48. Al-Fath","verses":29},{"name":"49. Al-Hujurat","verses":18},{"name":"50. Qaf","verses":45},{"name":"51. Az-Zariyat","verses":60},{"name":"52. At-Tur","verses":49},{"name":"53. An-Najm","verses":62},{"name":"54. Al-Qamar","verses":55},{"name":"55. Ar-Rahman","verses":78},{"name":"56. Al-Waqi'ah","verses":96},{"name":"57. Al-Hadid","verses":29},{"name":"58. Al-Mujadilah","verses":22},{"name":"59. Al-Hasyr","verses":24},{"name":"60. Al-Mumtahanah","verses":13},{"name":"61. As-Saff","verses":14},{"name":"62. Al-Jumu'ah","verses":11},{"name":"63. Al-Munafiqun","verses":11},{"name":"64. At-Tagabun","verses":18},{"name":"65. At-Talaq","verses":12},{"name":"66. At-Tahrim","verses":12},{"name":"67. Al-Mulk","verses":30},{"name":"68. Al-Qalam","verses":52},{"name":"69. Al-Haqqah","verses":52},{"name":"70. Al-Ma'arij","verses":44},{"name":"71. Nuh","verses":28},{"name":"72. Al-Jinn","verses":28},{"name":"73. Al-Muzzammil","verses":20},{"name":"74. Al-Muddatstsir","verses":56},{"name":"75. Al-Qiyamah","verses":40},{"name":"76. Al-Insan","verses":31},{"name":"77. Al-Mursalat","verses":50},{"name":"78. An-Naba'","verses":40},{"name":"79. An-Nazi'at","verses":46},{"name":"80. 'Abasa","verses":42},{"name":"81. At-Takwir","verses":29},{"name":"82. Al-Infitar","verses":19},{"name":"83. Al-Mutaffifin","verses":36},{"name":"84. Al-Insyiqaq","verses":25},{"name":"85. Al-Buruj","verses":22},{"name":"86. At-Tariq","verses":17},{"name":"87. Al-A'la","verses":19},{"name":"88. Al-Ghasyiyah","verses":26},{"name":"89. Al-Fajr","verses":30},{"name":"90. Al-Balad","verses":20},{"name":"91. Asy-Syams","verses":15},{"name":"92. Al-Lail","verses":21},{"name":"93. Ad-Duha","verses":11},{"name":"94. Asy-Syarh","verses":8},{"name":"95. At-Tin","verses":8},{"name":"96. Al-'Alaq","verses":19},{"name":"97. Al-Qadr","verses":5},{"name":"98. Al-Bayyinah","verses":8},{"name":"99. Az-Zalzalah","verses":8},{"name":"100. Al-'Adiyat","verses":11},{"name":"101. Al-Qari'ah","verses":11},{"name":"102. At-Takatsur","verses":8},{"name":"103. Al-'Asr","verses":3},{"name":"104. Al-Humazah","verses":9},{"name":"105. Al-Fil","verses":5},{"name":"106. Quraisy","verses":4},{"name":"107. Al-Ma'un","verses":7},{"name":"108. Al-Kautsar","verses":3},{"name":"109. Al-Kafirun","verses":6},{"name":"110. An-Nasr","verses":3},{"name":"111. Al-Lahab","verses":5},{"name":"112. Al-Ikhlas","verses":4},{"name":"113. Al-Falaq","verses":5},{"name":"114. An-Nas","verses":6}];
const juzMap = [[],[{s:0, b:[1,7]}, {s:1, b:[1,141]}],[{s:1, b:[142,252]}],[{s:1, b:[253,286]}, {s:2, b:[1,92]}],[{s:2, b:[93,200]}, {s:3, b:[1,23]}],[{s:3, b:[24,147]}],[{s:3, b:[148,176]}, {s:4, b:[1,81]}],[{s:4, b:[82,120]}, {s:5, b:[1,110]}],[{s:5, b:[111,165]}, {s:6, b:[1,87]}],[{s:6, b:[88,206]}, {s:7, b:[1,40]}],[{s:7, b:[41,75]}, {s:8, b:[1,92]}],[{s:8, b:[93,129]}, {s:9, b:[1,109]}, {s:10, b:[1,5]}],[{s:10, b:[6,123]}, {s:11, b:[1,52]}],[{s:11, b:[53,111]}, {s:12, b:[1,43]}, {s:13, b:[1,52]}],[{s:14, b:[1,99]}, {s:15, b:[1,128]}],[{s:16, b:[1,111]}, {s:17, b:[1,74]}],[{s:17, b:[75,110]}, {s:18, b:[1,98]}, {s:19, b:[1,135]}],[{s:20, b:[1,112]}, {s:21, b:[1,78]}],[{s:22, b:[1,118]}, {s:23, b:[1,64]}, {s:24, b:[1,20]}],[{s:24, b:[21,77]}, {s:25, b:[1,227]}, {s:26, b:[1,55]}],[{s:26, b:[56,93]}, {s:27, b:[1,88]}, {s:28, b:[1,45]}],[{s:28, b:[46,69]}, {s:29, b:[1,60]}, {s:30, b:[1,34]}, {s:31, b:[1,30]}, {s:32, b:[1,30]}],[{s:32, b:[31,73]}, {s:33, b:[1,54]}, {s:34, b:[1,45]}, {s:35, b:[1,27]}],[{s:35, b:[28,83]}, {s:36, b:[1,182]}, {s:37, b:[1,88]}, {s:38, b:[1,31]}],[{s:38, b:[32,75]}, {s:39, b:[1,85]}, {s:40, b:[1,46]}],[{s:40, b:[47,54]}, {s:41, b:[1,53]}, {s:42, b:[1,89]}, {s:43, b:[1,59]}, {s:44, b:[1,37]}],[{s:45, b:[1,35]}, {s:46, b:[1,38]}, {s:47, b:[1,29]}, {s:48, b:[1,18]}, {s:49, b:[1,45]}, {s:50, b:[1,30]}],[{s:50, b:[31,60]}, {s:51, b:[1,49]}, {s:52, b:[1,62]}, {s:53, b:[1,55]}, {s:54, b:[1,78]}, {s:55, b:[1,96]}, {s:56, b:[1,29]}],[{s:57, b:[1,22]}, {s:58, b:[1,24]}, {s:59, b:[1,13]}, {s:60, b:[1,14]}, {s:61, b:[1,11]}, {s:62, b:[1,11]}, {s:63, b:[1,18]}, {s:64, b:[1,12]}, {s:65, b:[1,12]}],[{s:66, b:[1,30]}, {s:67, b:[1,52]}, {s:68, b:[1,52]}, {s:69, b:[1,44]}, {s:70, b:[1,28]}, {s:71, b:[1,28]}, {s:72, b:[1,20]}, {s:73, b:[1,56]}, {s:74, b:[1,40]}, {s:75, b:[1,31]}, {s:76, b:[1,50]}]];
const juz30 = []; for (let i = 77; i <= 113; i++) juz30.push({ s: i, b: [1, surahData[i].verses] }); juzMap.push(juz30);
const juzOptions = '<option value="">Semua Juz...</option>' + Array.from({ length: 30 }, (_, i) => i + 1).map(j => `<option value="${j}">Juz ${j}</option>`).join("");

document.getElementById("mutabaah-surah-juz").innerHTML = juzOptions;
document.getElementById("jilid-juz").innerHTML = juzOptions;
document.getElementById("mutabaah-jilid-number").innerHTML = '<option value="">Jilid...</option>' + [1,2,3,4,5,6].map(j => `<option value="${j}">Jilid ${j}</option>`).join("");
document.getElementById("mutabaah-page-from").innerHTML = '<option value="">Halaman...</option>' + Array.from({ length: 40 }, (_, i) => i + 1).map(p => `<option value="${p}">Hal. ${p}</option>`).join("");

function setupDynamicSurahDropdown(juzDropId, surahDropId, ayatDropId) {
  document.getElementById(juzDropId).addEventListener("change", (e) => {
    const j = parseInt(e.target.value);
    const sDrop = document.getElementById(surahDropId), aDrop = document.getElementById(ayatDropId);
    aDrop.innerHTML = '<option value="">Pilih ayat...</option>';
    if (!j) {
      sDrop.innerHTML = '<option value="">Pilih Surat...</option>' + surahData.map(s => `<option value="${s.name}" data-s="1" data-e="${s.verses}">${s.name}</option>`).join("");
      return;
    }
    const bounds = juzMap[j];
    let html = '<option value="">Pilih Surat (Juz ' + j + ')...</option>';
    bounds.forEach(b => {
      const s = surahData[b.s];
      html += `<option value="${s.name}" data-s="${b.b[0]}" data-e="${b.b[1]}">${s.name} (Ayat ${b.b[0]}-${b.b[1]})</option>`;
    });
    sDrop.innerHTML = html;
  });
  document.getElementById(surahDropId).addEventListener("change", (e) => {
    const opt = e.target.selectedOptions[0];
    const aDrop = document.getElementById(ayatDropId);
    if (!opt || !opt.value) return aDrop.innerHTML = '<option value="">Pilih ayat...</option>';
    const st = parseInt(opt.getAttribute('data-s')), en = parseInt(opt.getAttribute('data-e'));
    let h = '<option value="">Pilih ayat...</option>';
    for (let i = st; i <= en; i++) h += `<option value="${i}">${i}</option>`;
    aDrop.innerHTML = h;
  });
  document.getElementById(surahDropId).innerHTML = '<option value="">Pilih Surat...</option>' + surahData.map(s => `<option value="${s.name}" data-s="1" data-e="${s.verses}">${s.name}</option>`).join("");
}
setupDynamicSurahDropdown("mutabaah-surah-juz", "mutabaah-surah-number", "mutabaah-ayat-count");
setupDynamicSurahDropdown("jilid-juz", "jilid-tilawah-surah", "jilid-tilawah-ayat");
document.getElementById("jilid-tilawah-toggle").addEventListener("change", e => {
  document.getElementById("tilawah-fields").classList.toggle("is-hidden", !e.target.checked);
});

/* ---------- KELAS ---------- */
const kelasOptions = { PAUDQU: ["A","B"], TPQ: ["A","B","C"], TKQ: ["A","B"], Bimbel: ["Calistung","B. Inggris","Matematika"] };
function updateKelasOptions(prefix) {
  const el = document.getElementById(`${prefix}-unit`);
  if (!el) return;
  const unit = el.value;
  const opts = unit ? kelasOptions[unit] || [] : [];
  const kEl = document.getElementById(`${prefix}-kelas`);
  if (kEl) kEl.innerHTML = opts.length ? opts.map(k => `<option value="${k}">${k}</option>`).join('') : '<option value="">Pilih kelas...</option>';
  if (!["manage","report","absen","points","lb","hall","keu","cek-keu","tarif","tagihan","foto","cap"].includes(prefix)) refreshNames(prefix);
  if (prefix === "manage") updateManageListsAndDropdowns();
  if (prefix === "report") updateReportChildList();
  if (prefix === "absen") updateAbsenLists();
  if (prefix === "points") updatePointsChildList();
  if (prefix === "lb") updateLeaderboard();
  if (prefix === "hall") renderHallOfFame();
  if (["keu","cek-keu","tarif","tagihan","foto","cap"].includes(prefix)) updateNameDropdown(prefix, "child");
}
["mutabaah","bimbel","manage","report","absen","points","lb","hall","keu","cek-keu","tarif","tagihan","foto","cap"].forEach(p => {
  const uEl = document.getElementById(`${p}-unit`);
  if (uEl) uEl.addEventListener("change", () => updateKelasOptions(p));
  const kEl = document.getElementById(`${p}-kelas`);
  if (kEl) kEl.addEventListener("change", () => {
    if (!["manage","report","absen","points","lb","hall","keu","cek-keu","tarif","tagihan","foto","cap"].includes(p)) refreshNames(p);
    if (p === "manage") updateManageListsAndDropdowns();
    if (p === "report") updateReportChildList();
    if (p === "absen") updateAbsenLists();
    if (p === "points") updatePointsChildList();
    if (p === "lb") updateLeaderboard();
    if (p === "hall") renderHallOfFame();
    if (["keu","cek-keu","tarif","tagihan","foto","cap"].includes(p)) updateNameDropdown(p, "child");
  });
});
function updateNameDropdown(prefix, type) {
  const uEl = document.getElementById(`${prefix}-unit`), kEl = document.getElementById(`${prefix}-kelas`);
  if (!uEl || !kEl) return;
  const unit = uEl.value, kelas = kEl.value;
  const select = document.getElementById(`${prefix}-${type}-select`);
  if (!select) return;
  const key = type === "child" ? "child_name" : "guru";
  const values = [...new Set(records.filter(r => r.unit === unit && r.kelas === kelas && r[key] && r[key].trim()).map(r => r[key]))].sort((a, b) => a.localeCompare(b, "id"));
  select.innerHTML = `<option value="">${unit && kelas ? "Pilih nama..." : "Pilih lembaga & kelas..."}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join("");
}
function refreshNames(prefix) { updateNameDropdown(prefix, "guru"); updateNameDropdown(prefix, "child"); }
function nameValue(prefix, type) { const el = document.getElementById(`${prefix}-${type}-select`); return el ? el.value : ""; }

/* ---------- RIWAYAT CARD ---------- */
function renderRiwayatCard() {
  const card = document.getElementById('riwayat-card');
  const warnEl = document.getElementById('riwayat-warning');
  const content = document.getElementById('riwayat-content');
  const childName = nameValue("mutabaah", "child");
  if (!childName) { card.classList.add('is-hidden'); return; }
  card.classList.remove('is-hidden');
  
  const cRec = records.filter(r => r.child_name === childName && r.type && r.type.startsWith("Setoran"))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (cRec.length === 0) {
    content.innerHTML = `<p class="text-xs italic text-[#5a8c9a]">Belum ada setoran. Ini setoran pertama! 🎉</p>`;
    warnEl.classList.add('is-hidden');
    return;
  }
  
  const last = cRec[0];
  const lastDate = new Date(last.date);
  const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Warning kalau >3 hari
  if (diffDays >= 3) {
    warnEl.classList.remove('is-hidden');
    warnEl.textContent = `⚠️ ${diffDays} hari tidak setor`;
    warnEl.style.background = '#FFB0B0';
    warnEl.style.color = '#7a1010';
  } else {
    warnEl.classList.add('is-hidden');
  }
  
  // Data terakhir per kategori
  const getLast = (types) => cRec.find(r => types.some(t => r.type.includes(t)));
  const lastJilid = getLast(['Setoran Jilid']);
  const lastHafalan = getLast(['Setoran Hafalan']);
  const lastDoa = getLast(['Setoran Doa']);
  const lastHadits = getLast(['Setoran Hadits']);
  
  let html = `<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">📚 Jilid:</span><span>${lastJilid ? `Jilid ${lastJilid.jilid_number}, Hal ${lastJilid.page_from} <span class="text-[10px] opacity-60">(${formatDate(lastJilid.date)})</span>` : 'Belum ada'}</span></div>`;
  html += `<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">🕌 Hafalan:</span><span>${lastHafalan ? `${escapeHtml(lastHafalan.surah_number)} (Ay.${lastHafalan.ayat_count}) <span class="text-[10px] opacity-60">(${formatDate(lastHafalan.date)})</span>` : 'Belum ada'}</span></div>`;
  if (lastDoa) html += `<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">🤲 Doa:</span><span>${escapeHtml(lastDoa.subject)} <span class="text-[10px] opacity-60">(${formatDate(lastDoa.date)})</span></span></div>`;
  if (lastHadits) html += `<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">📜 Hadits:</span><span>${escapeHtml(lastHadits.subject)} <span class="text-[10px] opacity-60">(${formatDate(lastHadits.date)})</span></span></div>`;
  content.innerHTML = html;
}

/* ---------- ANOMALI ---------- */
function checkAnomali() {
  const alertEl = document.getElementById('anomali-alert');
  const childName = nameValue("mutabaah", "child");
  if (!childName) { alertEl.classList.add('is-hidden'); return; }
  const today = getLocalDateString();
  const warnings = [];
  // Setoran sama tipe hari ini
  const cRec = records.filter(r => r.child_name === childName && r.date.startsWith(today) && r.type && r.type.startsWith("Setoran"));
  const tabTypes = { jilid: 'Setoran Jilid', surah: 'Setoran Hafalan', buku: 'Setoran Buku', doa: 'Setoran Doa', hadits: 'Setoran Hadits' };
  const currentType = tabTypes[activeMutabaahTab];
  if (cRec.some(r => r.type === currentType || r.type === currentType + ' & Tilawah')) {
    warnings.push(`Sudah ada ${currentType} hari ini untuk ${childName}`);
  }
  if (warnings.length > 0) {
    alertEl.classList.remove('is-hidden');
    alertEl.innerHTML = '⚠️ ' + warnings.join('<br>⚠️ ');
  } else {
    alertEl.classList.add('is-hidden');
  }
}

/* ---------- MASTER DOA/HADITS ---------- */
function refreshMasterDoaHaditsSelects() {
  const doaData = records.filter(r => r.type === "Master Doa").sort((a, b) => (a.subject||"").localeCompare(b.subject||"", "id"));
  const haditsData = records.filter(r => r.type === "Master Hadits").sort((a, b) => (a.subject||"").localeCompare(b.subject||"", "id"));
  document.getElementById("mutabaah-doa-select").innerHTML = '<option value="">Pilih doa harian...</option>' + doaData.map(d => `<option value="${escapeHtml(d.subject)}">${escapeHtml(d.subject)}</option>`).join("");
  document.getElementById("mutabaah-hadits-select").innerHTML = '<option value="">Pilih hafalan hadits...</option>' + haditsData.map(d => `<option value="${escapeHtml(d.subject)}">${escapeHtml(d.subject)}</option>`).join("");
}
window.toggleMasterManage = function(type) {
  currentMasterType = type; editingMasterId = null;
  document.getElementById('master-new-input').value = "";
  document.getElementById('master-manage-title').textContent = "Kelola " + type;
  document.getElementById('master-manage-box').classList.remove('is-hidden');
  renderMasterManageList();
}
window.closeMasterManage = function() { document.getElementById('master-manage-box').classList.add('is-hidden'); }
function renderMasterManageList() {
  const data = records.filter(r => r.type === `Master ${currentMasterType}`).sort((a, b) => (a.subject||"").localeCompare(b.subject||"", "id"));
  const listEl = document.getElementById("master-manage-list");
  listEl.innerHTML = data.length ? data.map(r => `<div class="flex justify-between items-center bg-gray-50 border-b p-1.5 rounded"><span class="text-[11px] font-bold">${escapeHtml(r.subject)}</span><div class="flex gap-2"><button type="button" class="text-blue-500 font-bold text-[10px]" onclick="editMaster('${r.__backendId}', '${(r.subject||'').replace(/'/g, "\\'")}')">Edit</button><button type="button" class="text-red-500 font-bold text-[10px]" onclick="deleteMaster('${r.__backendId}')">Hapus</button></div></div>`).join("") : `<p class="text-[10px] text-gray-500 text-center">Belum ada data.</p>`;
}
window.editMaster = function(id, name) {
  editingMasterId = id;
  document.getElementById('master-new-input').value = name;
  document.getElementById('btn-save-master').textContent = "Update";
}
window.deleteMaster = async function(id) {
  if (!confirm("Yakin hapus data master ini?")) return;
  const target = records.find(x => x.__backendId === id);
  if (target) {
    await window.appSdk.delete('Data', target);
    window.showToast('Data master dihapus', 'success');
    window.appSdk.init(handler, false).then(() => renderMasterManageList());
  }
}
document.getElementById("btn-save-master").addEventListener("click", async () => {
  const val = document.getElementById("master-new-input").value.trim();
  if (!val) return setStatus("master-manage-status", "Isi nama!", true);
  const btn = document.getElementById("btn-save-master");
  setSaving(btn, true);
  let res;
  if (editingMasterId) {
    const target = records.find(x => x.__backendId === editingMasterId);
    if (target) { target.subject = val; res = await window.appSdk.update('Data', target); }
  } else {
    res = await window.appSdk.create('Data', {
      child_name:"", unit:"", kelas:"", guru:"", type:`Master ${currentMasterType}`,
      subject:val, date:getWIBISOString(), points_rule_active:true
    });
  }
  setSaving(btn, false);
  if (res && res.isOk) {
    document.getElementById("master-new-input").value = "";
    editingMasterId = null;
    btn.textContent = "Simpan";
    window.celebrate('Data master tersimpan!');
    window.appSdk.init(handler, false).then(() => renderMasterManageList());
  }
});

/* ---------- HANDLER ---------- */
const handler = {
  onDataChanged: payload => {
    records = payload.data.map(r => ({ ...r, guru: r.guru ? normalizeName(r.guru) : "", child_name: r.child_name ? normalizeName(r.child_name) : "" }));
    recordsKeu = payload.keuSantri || [];
    recordsKas = payload.bukuKas || [];
    recordsKategori = payload.masterKategori || [];
    recordsFoto = payload.fotoSantri || [];
    recordsPencapaian = payload.pencapaian || [];
    if (payload.kontakWali) appKontakWali = payload.kontakWali;

    dataReady = true;
    updateHistory(records);
    updateCustomRules();
    updateBendaharaTeacherDropdown();
    updateLeaderboard();
    refreshMasterDoaHaditsSelects();
    renderKategoriManage();
    renderPencapaianList();
    populateKasKategori();
    ["mutabaah","bimbel"].forEach(p => refreshNames(p));
    if (document.getElementById('manage-screen').classList.contains('active')) updateManageListsAndDropdowns();

    if (activeUser.role && activeUser.role.toLowerCase() === 'wali') {
      renderWaliDashboard();
    }
  }
};

/* ---------- WALI DASHBOARD ---------- */
function renderWaliDashboard() {
  const children = (activeUser.nama_terkait||"").split(',').map(s => normalizeName(s));
  let wPts = 0, wHadir = 0;
  const cMon = getLocalDateString().slice(0, 7);
  const childRecords = records.filter(r => children.includes(r.child_name));
  childRecords.forEach(r => {
    wPts += (+r.points || 0);
    if (r.type === "Absensi" && r.attendance_status === "Hadir" && r.date.startsWith(cMon)) wHadir++;
  });
  document.getElementById("wali-child-name").textContent = children.join(", ") || "-";
  document.getElementById("wali-poin").textContent = wPts;
  document.getElementById("wali-hadir").textContent = wHadir;
  
  // Avatar
  if (children.length > 0) setAvatar(document.getElementById("wali-child-avatar"), children[0], 48);
  
  document.getElementById("wali-poin-bar").style.width = Math.min(100, (wPts/100)*100) + '%';
  document.getElementById("wali-hadir-bar").style.width = Math.min(100, (wHadir/20)*100) + '%';
  
  // Badges
  if (children.length > 0) {
    const badges = getBadgesForChild(children[0]);
    document.getElementById("wali-badges").innerHTML = badges.map(b => 
      `<span class="badge-item ${b.earned ? '' : 'locked'}">${b.icon} ${b.label}</span>`
    ).join('');
  }
  
  renderStreakCalendar(children, childRecords);
  renderWaliChart(children);
  
  let keuHtml = ""; let pengingatHtml = "";
  children.forEach(c => {
    let tabungan = 0;
    const cKeu = recordsKeu.filter(r => r.child_name === c).sort((a,b)=>new Date(b.date)-new Date(a.date));
    cKeu.forEach(r => {
      let kat = (r.kategori||"").trim();
      let nom = parseFloat(r.nominal) || 0;
      if (kat === "Tabungan Masuk") tabungan += nom;
      if (kat === "Tarik Tabungan") tabungan -= nom;
    });
    const iuranGrid = renderIuran1Tahun(c, recordsKeu, true);
    const cData = records.find(r => r.child_name === c) || { unit: "" };
    const tung = window.getTunggakan(c, cData.unit);
    if (tung.missing.length > 0) {
      let textN = tung.total > 0 ? `Rp ${tung.total.toLocaleString('id-ID')}` : "Menyesuaikan";
      pengingatHtml += `<div class="bg-red-50/95 border border-red-300 p-3 rounded-xl mb-3 shadow-sm"><p class="text-xs font-bold text-red-700 uppercase mb-1">⚠️ Tagihan: ${c}</p><p class="text-[11px] text-red-600">${tung.missing.join(", ")}</p><p class="text-sm font-extrabold text-red-700 mt-1">Total: ${textN}</p></div>`;
    }
    const av = getChildAvatar(c);
    keuHtml += `<div class="bg-white/10 rounded-xl p-3 border border-white/20"><div class="flex items-center gap-2 mb-2"><div class="avatar" style="${av.url?`background:url('${av.url}') center/cover`: `background:${av.color}`}">${av.url?'':av.initial}</div><p class="font-extrabold text-sm text-[#FFD166]">${c}</p></div><div class="flex justify-between items-center border-b border-white/10 pb-2 mb-2"><span class="text-[10px] text-white/80">💰 Tabungan:</span><span class="font-extrabold text-sm text-white">Rp ${tabungan.toLocaleString('id-ID')}</span></div><div><span class="text-[10px] text-white/80 block mb-1">📅 Status Iuran:</span>${iuranGrid}</div></div>`;
  });
  document.getElementById("wali-tagihan-container").innerHTML = pengingatHtml;
  document.getElementById("wali-keuangan-container").innerHTML = keuHtml || '<p class="text-xs text-white/50 italic">Belum ada data anak.</p>';
  
  // Pencapaian terbaru anak
  const myCaps = recordsPencapaian.filter(p => children.includes(p.child_name)).sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 3);
  if (myCaps.length > 0) {
    const capsHtml = `<h4 class="font-bold text-xs text-[#FFD166] mb-2 border-t border-white/10 pt-3">📸 Pencapaian Terbaru</h4><div class="grid grid-cols-3 gap-2">${myCaps.map(p => `<div class="text-center"><div style="width:100%;aspect-ratio:1;background:url('${p.url}') center/cover;border-radius:10px;border:2px solid #FFD166"></div><p class="text-[9px] font-bold mt-1 text-white/90 line-clamp-2">${escapeHtml(p.keterangan || '')}</p></div>`).join('')}</div>`;
    document.getElementById("wali-tagihan-container").innerHTML += capsHtml;
  }
}

function renderStreakCalendar(children, childRecords) {
  const container = document.getElementById("streak-calendar");
  if (!container) return;
  const today = new Date();
  const days = [];
  let hadirCount = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const hadir = childRecords.some(r => r.type === "Absensi" && r.attendance_status === "Hadir" && r.date.startsWith(ds) && children.includes(r.child_name));
    if (hadir) hadirCount++;
    days.push({ date: ds, dayNum: d.getDate(), hadir, isToday: i === 0 });
  }
  document.getElementById("streak-count").textContent = `${hadirCount} hari`;
  container.innerHTML = days.map(d => `<div class="streak-cell ${d.hadir ? 'hadir' : ''} ${d.isToday ? 'today' : ''}" title="${d.date}">${d.dayNum}</div>`).join("");
}

function renderWaliChart(children) {
  const canvas = document.getElementById('wali-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  
  // Last 6 months
  const months = [];
  const poinData = [];
  const hadirData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    months.push(d.toLocaleString('id-ID', { month: 'short' }));
    const recs = records.filter(r => children.includes(r.child_name) && r.date.startsWith(ym));
    poinData.push(recs.filter(r => r.type === "Poin").reduce((s, r) => s + (+r.points||0), 0));
    hadirData.push(recs.filter(r => r.type === "Absensi" && r.attendance_status === "Hadir").length);
  }
  
  if (waliChartInstance) waliChartInstance.destroy();
  
  waliChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Poin', data: poinData, borderColor: '#FFD166', backgroundColor: 'rgba(255,209,102,.2)', tension: 0.4, fill: true },
        { label: 'Hadir', data: hadirData, borderColor: '#A8E06E', backgroundColor: 'rgba(168,224,110,.2)', tension: 0.4, fill: true }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#fff', font: { size: 10 } } } },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,.7)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,.1)' } },
        y: { ticks: { color: 'rgba(255,255,255,.7)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,.1)' } }
      }
    }
  });
}

/* ---------- SAVE FORM ---------- */
async function saveForm(record, button, statusId, formToClearIds) {
  if (!dataReady) return setStatus(statusId, "Menyiapkan data...", true);
  setSaving(button, true);
  if (editingRecord) {
    record.__backendId = editingRecord.__backendId;
    record.record_id = editingRecord.record_id;
    record.date = editingRecord.date;
  }
  const res = editingRecord ? await window.appSdk.update('Data', record) : await window.appSdk.create('Data', record);
  if (res.isOk) {
    if (editingRecord) {
      const idx = records.findIndex(r => r.__backendId === record.__backendId);
      if (idx > -1) records[idx] = record;
      editingRecord = null;
      button.textContent = "💾 Simpan Data";
    } else records.push(record);
    handler.onDataChanged({ data: records, keuSantri: recordsKeu, bukuKas: recordsKas, kontakWali: appKontakWali, masterKategori: recordsKategori, fotoSantri: recordsFoto, pencapaian: recordsPencapaian });
    if (formToClearIds) formToClearIds.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    setSaving(button, false);
    setStatus(statusId, "");
    window.celebrate('Alhamdulillah, tersimpan! 🎉');
    // Refresh riwayat card
    renderRiwayatCard();
  } else {
    setSaving(button, false);
    setStatus(statusId, "Gagal koneksi", true);
    window.playSound('error');
  }
}

/* ---------- MUTABA'AH FORM ---------- */
document.getElementById("mutabaah-form").addEventListener("submit", e => {
  e.preventDefault();
  const baseRec = {
    child_name: nameValue("mutabaah","child"),
    unit: document.getElementById("mutabaah-unit").value,
    kelas: document.getElementById("mutabaah-kelas").value,
    guru: nameValue("mutabaah","guru"),
    date: getWIBISOString(),
    status: document.getElementById("mutabaah-status-select").value
  };
  let finalRec = { ...baseRec };
  let clearIds = [];
  if (activeMutabaahTab === 'jilid') {
    const t = document.getElementById("jilid-tilawah-toggle").checked;
    finalRec = { ...finalRec, type: t ? "Setoran Jilid & Tilawah" : "Setoran Jilid",
      jilid_number: document.getElementById("mutabaah-jilid-number").value,
      page_from: document.getElementById("mutabaah-page-from").value,
      juz: t ? document.getElementById("jilid-juz").value : "",
      tilawah_surah: t ? document.getElementById("jilid-tilawah-surah").value : "",
      tilawah_ayat: t ? document.getElementById("jilid-tilawah-ayat").value : "" };
    clearIds = ["mutabaah-page-from"];
  } else if (activeMutabaahTab === 'surah') {
    finalRec = { ...finalRec, type: "Setoran Hafalan",
      surah_number: document.getElementById("mutabaah-surah-number").value,
      ayat_count: document.getElementById("mutabaah-ayat-count").value,
      juz: document.getElementById("mutabaah-surah-juz").value, fluency_stars: 0 };
    clearIds = ["mutabaah-ayat-count"];
  } else if (activeMutabaahTab === 'buku') {
    finalRec = { ...finalRec, type: "Setoran Buku", page_from: document.getElementById("mutabaah-buku-page").value };
    clearIds = ["mutabaah-buku-page"];
  } else if (activeMutabaahTab === 'doa') {
    finalRec = { ...finalRec, type: "Setoran Doa", subject: document.getElementById("mutabaah-doa-select").value };
    if (!finalRec.subject) { window.showToast('Pilih Doa dulu ya!', 'error'); return; }
  } else if (activeMutabaahTab === 'hadits') {
    finalRec = { ...finalRec, type: "Setoran Hadits", subject: document.getElementById("mutabaah-hadits-select").value };
    if (!finalRec.subject) { window.showToast('Pilih Hadits dulu ya!', 'error'); return; }
  }
  saveForm(finalRec, document.getElementById("mutabaah-save"), "mutabaah-status", clearIds);
});

/* ---------- BIMBEL ---------- */
document.getElementById("bimbel-form").addEventListener("submit", e => {
  e.preventDefault();
  saveForm({
    child_name: nameValue("bimbel","child"), unit: document.getElementById("bimbel-unit").value,
    kelas: document.getElementById("bimbel-kelas").value, guru: nameValue("bimbel","guru"),
    type: "Bimbel", jilid_number: "", page_from: document.getElementById("bimbel-material").value,
    surah_number: "", ayat_count: "", fluency_stars: 0, date: getWIBISOString(),
    status: document.getElementById("bimbel-status-select").value,
    juz: "", tilawah_surah: "", tilawah_ayat: "", attendance_type: "", attendance_status: "",
    subject: document.getElementById("bimbel-subject").value,
    points: 0, points_note: "", points_rule_name: "", points_rule_active: true
  }, document.getElementById("bimbel-save"), "bimbel-status", ["bimbel-material"]);
});

/* ---------- CUSTOM RULES ---------- */
function updateCustomRules() {
  const rules = records.filter(r => r.type === "Aturan Poin").sort((a, b) => (a.points_rule_name||"").localeCompare(b.points_rule_name||"", "id"));
  const list = document.getElementById("custom-rules-list");
  list.innerHTML = rules.length ? rules.map(r => {
    const nama = r.points_rule_name || r.points_note || "Aturan Tanpa Nama";
    return `<div class="flex justify-between bg-white rounded-lg px-2 py-2 text-xs border"><span class="font-bold">${escapeHtml(nama)} (${r.points>0?"+":""}${r.points})</span><div class="flex gap-2"><button type="button" class="text-blue-500 font-bold" onclick="window.populateRuleEdit('${r.__backendId}', '${nama.replace(/'/g, "\\'")}', '${r.points}')">Edit</button><button type="button" class="text-[#ef476f] font-bold" onclick="window.deleteRule('${r.__backendId}')">Hapus</button></div></div>`;
  }).join("") : "<p class=\"text-xs text-[#5a8c9a]\">Belum ada aturan custom.</p>";
  const dropSelect = document.getElementById("points-rule");
  if (dropSelect) {
    let html = '<option value="">Pilih aturan poin...</option>';
    rules.forEach(r => html += `<option value="${r.points}|${escapeHtml(r.points_rule_name || r.points_note || 'Tanpa Nama')}">${escapeHtml(r.points_rule_name || r.points_note || 'Tanpa Nama')} (${r.points>0?"+":""}${r.points})</option>`);
    dropSelect.innerHTML = html + '<option value="custom">Custom Manual</option>';
  }
}
window.populateRuleEdit = function(id, name, amount) {
  editingRuleId = id;
  document.getElementById("new-rule-name").value = name;
  document.getElementById("new-rule-amount").value = amount;
  document.getElementById("add-rule-button").textContent = "💾 Simpan Perubahan";
};
window.deleteRule = async function(id) {
  if (confirm("Hapus aturan ini?")) {
    const rule = records.find(x => x.__backendId === id);
    if (rule) {
      await window.appSdk.delete('Data', rule);
      records = records.filter(x => x.__backendId !== id);
      handler.onDataChanged({ data: records, keuSantri: recordsKeu, bukuKas: recordsKas, kontakWali: appKontakWali });
      window.showToast('Aturan dihapus', 'success');
    }
  }
};
document.getElementById("add-rule-button").addEventListener("click", async () => {
  const name = document.getElementById("new-rule-name").value.trim(), amount = parseInt(document.getElementById("new-rule-amount").value);
  if (!name || isNaN(amount)) return alert("Isi nama dan poin!");
  setSaving(document.getElementById("add-rule-button"), true);
  let res;
  if (editingRuleId) {
    const target = records.find(x => x.__backendId === editingRuleId);
    if (target) { target.points_rule_name = name; target.points_note = name; target.points = amount; res = await window.appSdk.update('Data', target); }
  } else {
    res = await window.appSdk.create('Data', {
      child_name:"",unit:"",kelas:"",guru:"",type:"Aturan Poin",
      jilid_number:"",page_from:"",surah_number:"",ayat_count:"",fluency_stars:0,
      date:getWIBISOString(),status:"",juz:"",tilawah_surah:"",tilawah_ayat:"",
      attendance_type:"",attendance_status:"",subject:"",
      points:amount,points_note:name,points_rule_name:name,points_rule_active:true
    });
  }
  setSaving(document.getElementById("add-rule-button"), false);
  if (res && res.isOk) {
    document.getElementById("new-rule-name").value = "";
    document.getElementById("new-rule-amount").value = "";
    editingRuleId = null;
    document.getElementById("add-rule-button").textContent = "➕ Tambah Aturan";
    window.celebrate('Aturan poin tersimpan! ⭐');
    window.appSdk.init(handler, false);
  }
});
document.getElementById("points-rule").addEventListener("change", e => {
  const c = e.target.value === "custom";
  document.getElementById("custom-points-fields").classList.toggle("is-hidden", !c);
  if (!c && e.target.value !== "") {
    const [amt, nte] = e.target.value.split("|");
    document.getElementById("points-amount").value = amt || "";
    document.getElementById("points-note").value = nte || "";
  } else if (e.target.value === "") {
    document.getElementById("points-amount").value = "";
    document.getElementById("points-note").value = "";
  }
});
function updatePointsChildList() {
  const u = document.getElementById("points-unit").value, k = document.getElementById("points-kelas").value;
  const ch = [...new Set(records.filter(r => r.unit === u && r.kelas === k && r.child_name).map(r => r.child_name))].sort();
  document.getElementById("points-child-select").innerHTML = '<option value="">Pilih murid...</option>' + ch.map(c => `<option value="${c}">${c}</option>`).join("");
  document.getElementById("selected-points-children").innerHTML = ch.map(c => `<label class="flex items-center gap-2 text-xs"><input type="checkbox" value="${c}" class="point-child-check">${c}</label>`).join("");
}
document.getElementById("bulk-points").addEventListener("change", e => {
  const v = e.target.value;
  document.getElementById("selected-points-children").classList.toggle("is-hidden", v !== "selected");
  document.getElementById("points-single-child-container").classList.toggle("is-hidden", v !== "");
  document.getElementById("points-child-select").required = (v === "");
});
document.getElementById("points-form").addEventListener("submit", async e => {
  e.preventDefault();
  const u = document.getElementById("points-unit").value, k = document.getElementById("points-kelas").value, bulk = document.getElementById("bulk-points").value;
  let amt = parseInt(document.getElementById("points-amount").value), nte = document.getElementById("points-note").value.trim();
  const tDateStr = getLocalDateString();
  let chList = [];
  if (bulk === "selected") chList = [...document.querySelectorAll(".point-child-check:checked")].map(x => x.value);
  else if (bulk === "present") {
    const allChildren = [...new Set(records.filter(r => r.unit === u && r.kelas === k && r.child_name).map(r => r.child_name))];
    chList = allChildren.filter(c => records.some(r => r.type === "Absensi" && r.child_name === c && r.date.startsWith(tDateStr) && r.attendance_status === "Hadir"));
    if (chList.length === 0) return setStatus("points-status", "Belum ada murid hadir hari ini!", true);
  } else chList = [document.getElementById("points-child-select").value];
  if (!u || !k || !chList[0] || isNaN(amt)) return setStatus("points-status", "Lengkapi data!", true);
  const btn = document.getElementById("points-save");
  setSaving(btn, true);
  let ok = 0;
  for (const c of chList) {
    const res = await window.appSdk.create('Data', {
      child_name: c, unit: u, kelas: k, guru: "", type: "Poin",
      jilid_number: "", page_from: "", surah_number: "", ayat_count: "", fluency_stars: 0,
      date: getWIBISOString(), status: "", juz: "", tilawah_surah: "", tilawah_ayat: "",
      attendance_type: "", attendance_status: "", subject: "",
      points: amt, points_note: nte, points_rule_name: nte, points_rule_active: true
    });
    if (res.isOk) ok++;
  }
  setSaving(btn, false);
  document.getElementById("points-amount").value = "";
  document.getElementById("points-note").value = "";
  window.celebrate(`${ok} poin tersimpan! ⭐`);
  window.appSdk.init(handler, false);
});

/* ---------- ABSEN GURU ---------- */
document.getElementById("btn-absen-masuk-guru").addEventListener("click", async () => {
  const lbl = document.getElementById("guru-live-status-absen");
  const now = new Date();
  const jktDateStr = getLocalDateString();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  let sessionName = "";
  if (totalMinutes >= 450 && totalMinutes <= 600) sessionName = "Sesi 1";
  else if (totalMinutes >= 630 && totalMinutes <= 720) sessionName = "Sesi 2";
  else if (totalMinutes >= 930 && totalMinutes <= 1020) sessionName = "Sesi 3";
  else return lbl.innerHTML = `<span class="text-red-300 font-extrabold block leading-tight py-1">Gagal: Di luar jam<br><span class="text-[9px] font-bold">07.30-10.00 | 10.30-12.00 | 15.30-17.00 WIB</span></span>`;
  const guruName = normalizeName(activeUser.nama_terkait || activeUser.username);
  const isAlreadyAttended = records.some(r => r.guru === guruName && r.type === "Absensi Guru Mandiri" && r.date.startsWith(jktDateStr) && r.status_geofence === `Hadir (${sessionName})`);
  if (isAlreadyAttended) return lbl.innerHTML = `<span class="text-red-300 font-extrabold">Sudah absen ${sessionName} hari ini.</span>`;
  lbl.textContent = "Mencatat...";
  const res = await window.appSdk.create('Data', {
    child_name: "", unit: "Pusat", kelas: "Guru", guru: guruName, type: "Absensi Guru Mandiri",
    jilid_number: "", page_from: "", surah_number: "", ayat_count: "", fluency_stars: 0,
    date: getWIBISOString(), status: "", juz: "", tilawah_surah: "", tilawah_ayat: "",
    attendance_type: "guru", attendance_status: "Hadir", subject: "", points: 0,
    points_note: "", points_rule_name: "", points_rule_active: true,
    latitude: "", longitude: "", status_geofence: `Hadir (${sessionName})`
  });
  if (res.isOk) {
    lbl.innerHTML = `<span class="text-green-300 font-extrabold">Berhasil Hadir di ${sessionName}!</span>`;
    window.celebrate(`Alhamdulillah, absen ${sessionName}! 🎯`);
    window.appSdk.init(handler, false);
  } else { lbl.textContent = "Koneksi gagal."; }
});

/* ---------- ABSEN MURID ---------- */
function updateAbsenLists() {
  const u = document.getElementById("absen-unit").value, k = document.getElementById("absen-kelas").value;
  const m = [...new Set(records.filter(r => r.unit === u && r.kelas === k && r.child_name).map(r => r.child_name))].sort();
  const opts = '<option value="Hadir">Hadir</option><option value="Izin">Izin</option><option value="Sakit">Sakit</option><option value="Alpha">Alpha</option>';
  document.getElementById("absen-murid-list").innerHTML = m.length ? m.map(n => {
    const av = getChildAvatar(n);
    const style = av.url ? `background:url('${av.url}') center/cover` : `background:${av.color}`;
    return `<div class="att-row"><div class="flex items-center gap-2 min-w-0 flex-1"><div class="avatar" style="${style};width:28px;height:28px;font-size:12px">${av.url?'':av.initial}</div><span class="text-sm font-bold truncate">${n}</span></div><select data-name="${n}" data-type="murid" class="att-select">${opts}</select></div>`;
  }).join("") : '<p class="text-xs">Kosong / Pilih Lembaga</p>';
}
document.getElementById("absen-save").addEventListener("click", async () => {
  const u = document.getElementById("absen-unit").value, k = document.getElementById("absen-kelas").value, d = document.getElementById("absen-date").value;
  if (!u || !k || !d) return setStatus("absen-status", "Lengkapi data", true);
  const btn = document.getElementById("absen-save");
  setSaving(btn, true);
  let ok = 0;
  for (const sel of document.querySelectorAll("#absen-screen .att-select")) {
    const res = await window.appSdk.create('Data', {
      child_name: sel.dataset.type === "murid" ? sel.dataset.name : "", unit: u, kelas: k,
      guru: sel.dataset.type === "guru" ? sel.dataset.name : "", type: "Absensi",
      jilid_number: "", page_from: "", surah_number: "", ayat_count: "", fluency_stars: 0,
      date: d + "T12:00:00+07:00", status: "", juz: "", tilawah_surah: "", tilawah_ayat: "",
      attendance_type: sel.dataset.type, attendance_status: sel.value,
      subject: "", points: 0, points_note: "", points_rule_name: "", points_rule_active: true
    });
    if (res.isOk) ok++;
  }
  setSaving(btn, false);
  window.celebrate(`${ok} murid tercatat! ✅`);
  window.appSdk.init(handler, false);
});

/* ---------- BENDAHARA ---------- */
function updateBendaharaTeacherDropdown() {
  const tList = [...new Set(records.filter(r => r.guru).map(r => r.guru))].sort();
  const html = '<option value="">-- Pilih Guru --</option>' + tList.map(t => `<option value="${t}">${t}</option>`).join("");
  const a = document.getElementById("salary-teacher-select"); if (a) a.innerHTML = html;
  const b = document.getElementById("izin-guru-nama"); if (b) b.innerHTML = html;
  const c = document.getElementById("gp-guru-nama"); if (c) c.innerHTML = html;
}
function renderKasDashboard() {
  let saldo = 0;
  recordsKas.forEach(r => {
    if (r.jenis === "Pemasukan") saldo += parseInt(r.nominal||0);
    else if (r.jenis === "Pengeluaran") saldo -= parseInt(r.nominal||0);
  });
  document.getElementById("kas-saldo-total").textContent = "Rp " + saldo.toLocaleString('id-ID');
  const tbody = document.getElementById("tbody-kas");
  const lastRecords = [...recordsKas].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  if (lastRecords.length === 0) tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4"><div class="text-3xl mb-2">🏦</div><p class="text-[10px] text-gray-500">Belum ada transaksi</p></td></tr>`;
  else tbody.innerHTML = lastRecords.map(r => {
    const color = r.jenis === "Pemasukan" ? "text-teal-600" : "text-red-600";
    const sign = r.jenis === "Pemasukan" ? "+" : "-";
    return `<tr><td class="text-[9px]">${formatDate(r.date)}</td><td class="text-[10px] font-bold">${escapeHtml(r.kategori)}</td><td class="text-[10px] font-extrabold ${color}">${sign} Rp ${parseInt(r.nominal||0).toLocaleString('id-ID')}</td></tr>`;
  }).join("");
}
function populateKasKategori() {
  const jenis = document.getElementById("kas-jenis")?.value || "Pemasukan";
  const sel = document.getElementById("kas-kategori");
  if (!sel) return;
  const cats = recordsKategori.filter(k => k.jenis === jenis && (k.aktif === true || k.aktif === 'TRUE' || k.aktif === 'true'));
  sel.innerHTML = cats.map(c => `<option value="${escapeHtml(c.kategori)}">${escapeHtml(c.kategori)}</option>`).join("") || '<option value="">-</option>';
}
document.getElementById("kas-jenis")?.addEventListener("change", populateKasKategori);
document.getElementById("btn-simpan-kas").addEventListener("click", async () => {
  const d = document.getElementById("kas-tanggal").value, j = document.getElementById("kas-jenis").value, k = document.getElementById("kas-kategori").value, n = parseInt(document.getElementById("kas-nominal").value), ket = document.getElementById("kas-ket").value;
  if (!d || !j || !k || isNaN(n)) return setStatus("kas-status", "Lengkapi semua data!", true);
  const btn = document.getElementById("btn-simpan-kas");
  setSaving(btn, true);
  const res = await window.appSdk.create('BukuKas', { date: d + "T12:00:00+07:00", jenis: j, kategori: k, nominal: n, keterangan: ket, input_by: activeUser.username });
  setSaving(btn, false);
  if (res.isOk) {
    document.getElementById("kas-nominal").value = "";
    document.getElementById("kas-ket").value = "";
    window.celebrate('Transaksi kas tersimpan! 💰');
    window.appSdk.init(handler, false).then(() => renderKasDashboard());
  } else { setStatus("kas-status", "Gagal.", true); }
});

/* ---------- MASTER KATEGORI ---------- */
function renderKategoriManage() {
  const pemasukan = recordsKategori.filter(k => k.jenis === 'Pemasukan');
  const pengeluaran = recordsKategori.filter(k => k.jenis === 'Pengeluaran');
  const renderList = (arr) => arr.map(k => {
    const isActive = k.aktif === true || k.aktif === 'TRUE' || k.aktif === 'true';
    return `<div class="flex justify-between items-center bg-gray-50 border rounded p-2 text-xs mb-1">
      <span class="font-bold ${isActive ? '' : 'line-through opacity-50'}">${escapeHtml(k.kategori)}</span>
      <div class="flex gap-1">
        <button type="button" class="text-blue-500 font-bold text-[10px]" onclick="window.toggleKategori('${k.__backendId}')">${isActive ? 'Nonaktif' : 'Aktifkan'}</button>
        <button type="button" class="text-red-500 font-bold text-[10px]" onclick="window.deleteKategori('${k.__backendId}')">Hapus</button>
      </div>
    </div>`;
  }).join('') || '<p class="text-[10px] text-gray-400 italic">Belum ada kategori</p>';
  const p = document.getElementById('kategori-list-pemasukan');
  const q = document.getElementById('kategori-list-pengeluaran');
  if (p) p.innerHTML = '<p class="text-[10px] font-bold mb-1">⬆️ Pemasukan:</p>' + renderList(pemasukan);
  if (q) q.innerHTML = '<p class="text-[10px] font-bold mb-1 mt-2">⬇️ Pengeluaran:</p>' + renderList(pengeluaran);
}
window.toggleKategori = async function(id) {
  const k = recordsKategori.find(x => x.__backendId === id);
  if (!k) return;
  const wasActive = k.aktif === true || k.aktif === 'TRUE' || k.aktif === 'true';
  k.aktif = !wasActive;
  await window.appSdk.update('MasterKategori', k);
  window.showToast('Kategori diubah', 'success');
  window.appSdk.init(handler, false);
};
window.deleteKategori = async function(id) {
  if (!confirm("Hapus kategori ini?")) return;
  const k = recordsKategori.find(x => x.__backendId === id);
  if (k) { await window.appSdk.delete('MasterKategori', k); window.showToast('Kategori dihapus', 'success'); window.appSdk.init(handler, false); }
};
document.getElementById('btn-add-kat')?.addEventListener('click', async () => {
  const jenis = document.getElementById('new-kat-jenis').value;
  const nama = document.getElementById('new-kat-nama').value.trim();
  if (!nama) return;
  setSaving(document.getElementById('btn-add-kat'), true);
  await window.appSdk.create('MasterKategori', { jenis, kategori: nama, aktif: true });
  setSaving(document.getElementById('btn-add-kat'), false);
  document.getElementById('new-kat-nama').value = '';
  window.celebrate('Kategori ditambahkan!');
  window.appSdk.init(handler, false);
});

/* ---------- KEUANGAN SANTRI ---------- */
document.getElementById("keu-kategori").addEventListener("change", (e) => {
  document.getElementById("iuran-range-container").classList.toggle("is-hidden", e.target.value !== "Iuran Bulanan");
});
document.getElementById("btn-simpan-keu").addEventListener("click", async () => {
  const u = document.getElementById("keu-unit").value, k = document.getElementById("keu-kelas").value, c = document.getElementById("keu-child-select").value, d = document.getElementById("keu-tanggal").value, kat = document.getElementById("keu-kategori").value, ket = document.getElementById("keu-ket").value, nom = parseInt(document.getElementById("keu-nominal").value);
  if (!u || !k || !c || !d || isNaN(nom)) return setStatus("keu-status", "Lengkapi form!", true);
  let iuranRange = "";
  if (kat === "Iuran Bulanan") {
    const mStart = document.getElementById("keu-iuran-start").value, mEnd = document.getElementById("keu-iuran-end").value;
    if (!mStart || !mEnd) return setStatus("keu-status", "Pilih bulan awal & akhir!", true);
    if (mStart === mEnd) iuranRange = formatMonthYear(mStart);
    else iuranRange = `${formatMonthYear(mStart)} s/d ${formatMonthYear(mEnd)}`;
  }
  const btn = document.getElementById("btn-simpan-keu");
  setSaving(btn, true);
  const res = await window.appSdk.create('KeuanganSantri', { date: d + "T12:00:00+07:00", unit: u, kelas: k, child_name: c, kategori: kat, nominal: nom, keterangan: ket, iuran_range: iuranRange, input_by: activeUser.username });
  setSaving(btn, false);
  if (res.isOk) {
    document.getElementById("keu-nominal").value = "";
    document.getElementById("keu-ket").value = "";
    window.celebrate('Transaksi tersimpan! 💵');
    window.appSdk.init(handler, false);
  } else { setStatus("keu-status", "Gagal.", true); }
});
document.getElementById("btn-simpan-tarif").addEventListener("click", async () => {
  const u = document.getElementById("tarif-unit").value, k = document.getElementById("tarif-kelas").value, c = document.getElementById("tarif-child-select").value, nom = parseInt(document.getElementById("tarif-nominal").value);
  if (!u || !k || !c || isNaN(nom)) return setStatus("tarif-status", "Lengkapi!", true);
  const btn = document.getElementById("btn-simpan-tarif");
  setSaving(btn, true);
  const d = getLocalDateString();
  const res = await window.appSdk.create('KeuanganSantri', { date: d + "T12:00:00+07:00", unit: u, kelas: k, child_name: c, kategori: "Tarif SPP", nominal: nom, keterangan: "Set Tarif Khusus", iuran_range: "", input_by: activeUser.username });
  setSaving(btn, false);
  if (res.isOk) { document.getElementById("tarif-nominal").value = ""; window.celebrate('Tarif tersimpan! 📌'); window.appSdk.init(handler, false); }
  else setStatus("tarif-status", "Gagal.", true);
});
document.getElementById("btn-simpan-tagihan").addEventListener("click", async () => {
  const u = document.getElementById("tagihan-unit").value, k = document.getElementById("tagihan-kelas").value, c = document.getElementById("tagihan-child-select").value, nom = parseInt(document.getElementById("tagihan-nominal").value), ket = document.getElementById("tagihan-ket").value;
  if (!u || !k || !c || isNaN(nom) || !ket) return setStatus("tagihan-status", "Lengkapi!", true);
  const btn = document.getElementById("btn-simpan-tagihan");
  setSaving(btn, true);
  const d = getLocalDateString();
  const res = await window.appSdk.create('KeuanganSantri', { date: d + "T12:00:00+07:00", unit: u, kelas: k, child_name: c, kategori: "Tagihan Tambahan", nominal: nom, keterangan: ket, iuran_range: "", input_by: activeUser.username });
  setSaving(btn, false);
  if (res.isOk) { document.getElementById("tagihan-nominal").value = ""; document.getElementById("tagihan-ket").value = ""; window.celebrate('Tagihan dicatat! 📝'); window.appSdk.init(handler, false); }
  else setStatus("tagihan-status", "Gagal.", true);
});
document.getElementById("btn-cek-keu").addEventListener("click", () => {
  const c = document.getElementById("cek-keu-child-select").value;
  if (!c) return alert("Pilih murid!");
  const fRp = (v) => "Rp " + Math.abs(v).toLocaleString('id-ID');
  const fData = recordsKeu.filter(r => r.child_name === c).sort((a, b) => new Date(b.date) - new Date(a.date));
  let saldoTabungan = 0;
  fData.forEach(r => {
    let kat = (r.kategori || "").trim(); let nom = parseFloat(r.nominal) || 0;
    if (kat === "Tabungan Masuk") saldoTabungan += nom;
    if (kat === "Tarik Tabungan") saldoTabungan -= nom;
  });
  document.getElementById("info-keuangan-panel").classList.remove("is-hidden");
  document.getElementById("saldo-tabungan").textContent = "Rp " + saldoTabungan.toLocaleString('id-ID');
  document.getElementById("status-iuran-text").innerHTML = renderIuran1Tahun(c, recordsKeu, false);
  const tbody = document.getElementById("tbody-keu-santri");
  if (fData.length === 0) { tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4"><div class="text-2xl mb-1">💸</div><p class="text-[10px]">Belum ada riwayat</p></td></tr>`; return; }
  tbody.innerHTML = fData.map(r => {
    const val = parseFloat(r.nominal) || 0;
    const kat = (r.kategori||"").trim();
    const col = (kat === "Tarik Tabungan" || kat === "Tagihan Tambahan") ? 'text-red-600' : (kat === "Tarif SPP") ? 'text-amber-600' : 'text-green-600';
    const sign = (kat === "Tarik Tabungan" || kat === "Tagihan Tambahan") ? '-' : '';
    const infoExtra = (kat === "Iuran Bulanan") ? r.iuran_range : (r.keterangan || '-');
    return `<tr><td class="text-[9px]">${formatDate(r.date)}</td><td class="text-[10px] font-bold">${escapeHtml(r.kategori)}</td><td class="text-[10px] font-extrabold ${col}">${sign} ${fRp(val)}</td><td class="text-[9px]">${escapeHtml(infoExtra)}</td></tr>`;
  }).join('');
});

/* ---------- PENAGIHAN ---------- */
function renderPenagihanDashboard() {
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const now = new Date();
  const cMon = now.getMonth(); const cYear = now.getFullYear();
  const absCurrent = cYear * 12 + cMon;
  const bulanIniLabel = `${months[cMon]} ${cYear}`;
  
  let allStudents = [...new Set(records.filter(r => r.child_name && r.unit).map(r => ({ name: r.child_name, unit: r.unit })))];
  let unique = []; let seen = new Set();
  for (let s of allStudents) if (!seen.has(s.name)) { seen.add(s.name); unique.push(s); }
  
  let totalHutang = 0, totalLunas = 0;
  let belumBayar = [];
  let sudahLunas = [];
  
  unique.forEach(s => {
    const tung = window.getTunggakan(s.name, s.unit);
    const cKeu = recordsKeu.filter(r => r.child_name === s.name);
    // Cek lunas bulan ini
    const lunasBulanIni = cKeu.find(r => {
      if ((r.kategori||'').trim() !== 'Iuran Bulanan' || !r.iuran_range) return false;
      return r.iuran_range.toLowerCase().includes(months[cMon].toLowerCase()) && r.iuran_range.includes(String(cYear));
    });
    if (lunasBulanIni) {
      totalLunas += parseFloat(lunasBulanIni.nominal) || 0;
      sudahLunas.push(s);
    }
    if (tung.total > 0 || tung.missing.length > 0) {
      totalHutang += tung.total;
      belumBayar.push({ ...s, tung });
    }
  });
  
  document.getElementById('penagihan-total-hutang').textContent = 'Rp ' + totalHutang.toLocaleString('id-ID');
  document.getElementById('penagihan-total-lunas').textContent = 'Rp ' + totalLunas.toLocaleString('id-ID');
  
  const totalTarget = totalHutang + totalLunas;
  const progress = totalTarget > 0 ? Math.round((totalLunas / totalTarget) * 100) : 0;
  document.getElementById('penagihan-progress-label').textContent = progress + '%';
  document.getElementById('penagihan-progress-bar').style.width = progress + '%';
  
  const listEl = document.getElementById('penagihan-list');
  if (belumBayar.length === 0) {
    listEl.innerHTML = `<div class="text-center py-8 bg-green-50 rounded-2xl border-2 border-green-200"><div class="text-5xl mb-2">🎉</div><p class="text-sm font-bold text-green-700">Alhamdulillah, semua lunas!</p></div>`;
    return;
  }
  
  listEl.innerHTML = belumBayar.map(s => {
    const av = getChildAvatar(s.name);
    const style = av.url ? `background:url('${av.url}') center/cover` : `background:${av.color}`;
    const noHp = appKontakWali[s.name];
    const waBtn = noHp ? `<a href="javascript:void(0)" onclick="previewWA('${s.name.replace(/'/g,"\\'")}','${noHp}')" class="bg-green-500 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold">💬 WA Preview</a>` : `<span class="text-[9px] text-gray-400 italic">WA belum ada</span>`;
    return `<div class="bg-white p-3 rounded-xl border-2 border-red-100 shadow-sm flex items-center gap-2">
      <div class="avatar" style="${style};width:36px;height:36px;font-size:14px">${av.url?'':av.initial}</div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-xs text-red-700 truncate">${escapeHtml(s.name)}</p>
        <p class="text-[9px] text-gray-500 truncate">${s.tung.missing.join(', ')}</p>
        <p class="text-[10px] font-extrabold text-red-600">Rp ${s.tung.total.toLocaleString('id-ID')}</p>
      </div>
      ${waBtn}
    </div>`;
  }).join('');
}
window.previewWA = function(name, noHp) {
  const tung = window.getTunggakan(name, records.find(r => r.child_name === name)?.unit || '');
  let phone = noHp.toString().trim().replace(/^0/, '62');
  let pesan = `Assalamu'alaikum Ayah/Bunda.\n\nMengingatkan bahwa terdapat tagihan untuk ananda *${name.toUpperCase()}* yang belum tercatat lunas:\n`;
  if (tung.sppTotal > 0) pesan += `- SPP Bulan ${tung.sppMissing.join(', ')} (Rp ${tung.sppTotal.toLocaleString('id-ID')})\n`;
  if (tung.tambahanTotal > 0) pesan += `- Tagihan Lainnya (Rp ${tung.tambahanTotal.toLocaleString('id-ID')})\n`;
  pesan += `\n*Total Tagihan: Rp ${tung.total.toLocaleString('id-ID')}*\n\nMohon untuk menyelesaikan pembayaran sebelum tanggal 10.\n\nTerima kasih,\nBendahara RQ An-Nuur`;
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(pesan)}`;
  // Preview modal
  const preview = confirm(`Preview pesan WA:\n\n${pesan}\n\nKirim sekarang?`);
  if (preview) window.open(waLink, '_blank');
};
document.getElementById('penagihan-blast')?.addEventListener('click', () => {
  const students = [...new Set(records.filter(r => r.child_name && r.unit).map(r => r.child_name))];
  const belum = students.filter(s => {
    const u = records.find(r => r.child_name === s)?.unit || '';
    return window.getTunggakan(s, u).total > 0 && appKontakWali[s];
  });
  if (belum.length === 0) return alert("Tidak ada santri yang perlu diingatkan (atau nomor WA belum ada).");
  if (!confirm(`Akan membuka ${belum.length} tab WhatsApp?\n\nTips: izinkan popup di browser.`)) return;
  belum.forEach((name, idx) => {
    setTimeout(() => {
      const noHp = appKontakWali[name];
      const u = records.find(r => r.child_name === name)?.unit || '';
      const tung = window.getTunggakan(name, u);
      let phone = noHp.toString().trim().replace(/^0/, '62');
      let pesan = `Assalamu'alaikum Ayah/Bunda.\n\nMengingatkan bahwa terdapat tagihan untuk ananda *${name.toUpperCase()}* yang belum tercatat lunas:\n`;
      if (tung.sppTotal > 0) pesan += `- SPP: ${tung.sppMissing.join(', ')} (Rp ${tung.sppTotal.toLocaleString('id-ID')})\n`;
      if (tung.tambahanTotal > 0) pesan += `- Lainnya (Rp ${tung.tambahanTotal.toLocaleString('id-ID')})\n`;
      pesan += `\n*Total: Rp ${tung.total.toLocaleString('id-ID')}*\n\nMohon diselesaikan sebelum tgl 10.\n\nTerima kasih,\nBendahara RQ An-Nuur`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(pesan)}`, '_blank');
    }, idx * 500);
  });
});
document.getElementById('penagihan-export')?.addEventListener('click', () => {
  const students = [...new Set(records.filter(r => r.child_name && r.unit).map(r => r.child_name))];
  let csv = "Nama,Unit,Kelas,SPP Tertunggak,Total Tagihan Lainnya,Grand Total,No WA\n";
  students.forEach(s => {
    const u = records.find(r => r.child_name === s)?.unit || '';
    const k = records.find(r => r.child_name === s)?.kelas || '';
    const tung = window.getTunggakan(s, u);
    const wa = appKontakWali[s] || '';
    csv += `"${s}","${u}","${k}",${tung.sppTotal},${tung.tambahanTotal},${tung.total},"${wa}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `penagihan_${getLocalDateString()}.csv`;
  a.click();
  window.showToast('CSV terunduh! 📥', 'success');
});

/* ---------- FOTO UPLOAD ---------- */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
document.getElementById('foto-file')?.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 2 * 1024 * 1024) return alert("File terlalu besar (max 2MB). Kompres dulu ya.");
  const base64 = await readFileAsBase64(f);
  const prev = document.getElementById('foto-preview');
  prev.style.background = `url('data:image/jpeg;base64,${base64}') center/cover`;
  prev.textContent = '';
  prev.dataset.base64 = base64;
});
document.getElementById('btn-upload-foto')?.addEventListener('click', async () => {
  const child = document.getElementById('foto-child-select').value;
  const prev = document.getElementById('foto-preview');
  if (!child) return setStatus('foto-status', 'Pilih murid!', true);
  if (!prev.dataset.base64) return setStatus('foto-status', 'Pilih foto dulu!', true);
  setSaving(document.getElementById('btn-upload-foto'), true);
  setStatus('foto-status', 'Mengupload...');
  try {
    const res = await window.gas.uploadFoto({
      fileName: `${child}_${Date.now()}.jpg`,
      base64: prev.dataset.base64,
      folderName: 'FotoSantri',
      childName: child,
      jenis: 'foto'
    });
    setSaving(document.getElementById('btn-upload-foto'), false);
    if (res.sukses) {
      setStatus('foto-status', '');
      window.celebrate('Foto tersimpan! 📸');
      window.appSdk.init(handler, false);
    } else {
      setStatus('foto-status', 'Gagal: ' + (res.error || '?'), true);
    }
  } catch (err) {
    setSaving(document.getElementById('btn-upload-foto'), false);
    setStatus('foto-status', 'Gagal upload.', true);
  }
});
document.getElementById('cap-file')?.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 2 * 1024 * 1024) return alert("File >2MB. Kompres dulu.");
  const base64 = await readFileAsBase64(f);
  const prev = document.getElementById('cap-preview');
  prev.style.background = `url('data:image/jpeg;base64,${base64}') center/cover`;
  prev.textContent = '';
  prev.dataset.base64 = base64;
});
document.getElementById('btn-upload-cap')?.addEventListener('click', async () => {
  const child = document.getElementById('cap-child-select').value;
  const caption = document.getElementById('cap-caption').value.trim();
  const prev = document.getElementById('cap-preview');
  if (!child || !prev.dataset.base64) return setStatus('cap-status', 'Pilih murid & foto!', true);
  setSaving(document.getElementById('btn-upload-cap'), true);
  setStatus('cap-status', 'Mengupload...');
  try {
    const res = await window.gas.uploadFoto({
      fileName: `pencapaian_${child}_${Date.now()}.jpg`,
      base64: prev.dataset.base64,
      folderName: 'Pencapaian',
      childName: child,
      caption: caption,
      jenis: 'pencapaian'
    });
    setSaving(document.getElementById('btn-upload-cap'), false);
    if (res.sukses) {
      document.getElementById('cap-caption').value = '';
      prev.style.background = 'linear-gradient(135deg,#FFD166,#FFB085)';
      prev.textContent = '📸';
      delete prev.dataset.base64;
      document.getElementById('cap-file').value = '';
      setStatus('cap-status', '');
      window.celebrate('Pencapaian diupload! 🏆', { big: true });
      window.appSdk.init(handler, false);
    } else {
      setStatus('cap-status', 'Gagal: ' + (res.error || '?'), true);
    }
  } catch (err) {
    setSaving(document.getElementById('btn-upload-cap'), false);
    setStatus('cap-status', 'Gagal upload.', true);
  }
});
function renderPencapaianList() {
  const list = document.getElementById('cap-list');
  if (!list) return;
  const data = [...recordsPencapaian].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 20);
  if (data.length === 0) { list.innerHTML = '<p class="text-[10px] text-gray-400 italic text-center py-3">Belum ada pencapaian</p>'; return; }
  list.innerHTML = data.map(p => `<div class="flex items-center gap-2 border-b pb-2">
    <div style="width:40px;height:40px;background:url('${p.url}') center/cover;border-radius:8px"></div>
    <div class="flex-1 min-w-0"><p class="font-bold text-xs truncate">${escapeHtml(p.child_name)}</p><p class="text-[10px] text-gray-500 truncate">${escapeHtml(p.keterangan || '')}</p></div>
    <button type="button" class="text-red-500 text-[10px] font-bold" onclick="delPencapaian('${p.__backendId}')">✕</button>
  </div>`).join('');
}
window.delPencapaian = async function(id) {
  if (!confirm("Hapus pencapaian ini?")) return;
  const p = recordsPencapaian.find(x => x.__backendId === id);
  if (p) { await window.appSdk.delete('Pencapaian', p); window.appSdk.init(handler, false); }
};

/* ---------- HALL OF FAME ---------- */
function renderHallOfFame() {
  const u = document.getElementById('hall-unit')?.value || '';
  const k = document.getElementById('hall-kelas')?.value || '';
  // Naik jilid terbaru
  const jilidNaik = [...recordsPencapaian].filter(p => p.keterangan && p.keterangan.toLowerCase().includes('jilid')).slice(0, 6);
  const njEl = document.getElementById('hall-naikjilid');
  if (njEl) {
    if (jilidNaik.length === 0) njEl.innerHTML = '<p class="text-[10px] text-gray-400 italic text-center py-3">Belum ada. Upload pencapaian naik jilid nanti.</p>';
    else njEl.innerHTML = jilidNaik.map(p => `<div class="bg-white rounded-xl p-2 text-center border"><div style="width:100%;aspect-ratio:1;background:url('${p.url}') center/cover;border-radius:10px;margin-bottom:4px"></div><p class="text-[10px] font-bold truncate">${escapeHtml(p.child_name)}</p><p class="text-[9px] text-gray-500 truncate">${escapeHtml(p.keterangan || '')}</p></div>`).join('');
  }
  // Galeri
  const galeri = [...recordsPencapaian].slice(0, 9);
  const galEl = document.getElementById('hall-galeri');
  if (galEl) {
    if (galeri.length === 0) galEl.innerHTML = '<p class="text-[10px] text-gray-400 italic text-center py-3 col-span-3">Belum ada galeri</p>';
    else galEl.innerHTML = galeri.map(p => `<div style="aspect-ratio:1;background:url('${p.url}') center/cover;border-radius:10px;border:2px solid #FFD166" title="${escapeHtml(p.child_name)}: ${escapeHtml(p.keterangan || '')}"></div>`).join('');
  }
  // Streak terpanjang
  const students = [...new Set(records.filter(r => r.child_name).map(r => r.child_name))];
  const streaks = students.map(s => {
    const hadirDates = new Set(records.filter(r => r.child_name === s && r.type === "Absensi" && r.attendance_status === "Hadir").map(r => r.date.slice(0, 10)));
    const sorted = [...hadirDates].sort();
    let max = 0, cur = 0, prev = null;
    for (const d of sorted) {
      if (prev) {
        const diff = (new Date(d) - new Date(prev)) / 86400000;
        cur = diff === 1 ? cur + 1 : 1;
      } else cur = 1;
      max = Math.max(max, cur);
      prev = d;
    }
    return { name: s, streak: max };
  }).filter(x => x.streak > 0).sort((a, b) => b.streak - a.streak).slice(0, 5);
  const sEl = document.getElementById('hall-streak');
  if (sEl) {
    sEl.innerHTML = streaks.length ? streaks.map((s, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐';
      const av = getChildAvatar(s.name);
      const style = av.url ? `background:url('${av.url}') center/cover` : `background:${av.color}`;
      return `<div class="flex items-center gap-3 bg-white p-2 rounded-xl mb-1 shadow-sm"><span class="text-xl">${medal}</span><div class="avatar" style="${style};width:30px;height:30px;font-size:12px">${av.url?'':av.initial}</div><span class="font-bold text-sm flex-1">${escapeHtml(s.name)}</span><span class="text-xs font-extrabold text-[#267152] bg-green-100 px-2 py-1 rounded">${s.streak} hari</span></div>`;
    }).join('') : '<p class="text-xs text-gray-400 italic text-center">Belum ada data</p>';
  }
}

/* ---------- ABSEN GURU MANUAL & GP ---------- */
document.getElementById("btn-simpan-izin").addEventListener("click", async () => {
  const nm = document.getElementById("izin-guru-nama").value, tgl = document.getElementById("izin-guru-tanggal").value, stat = document.getElementById("izin-guru-status").value, ket = document.getElementById("izin-guru-ket").value;
  if (!nm || !tgl || !stat) return setStatus("izin-status", "Isi nama & tanggal!", true);
  const btn = document.getElementById("btn-simpan-izin");
  setSaving(btn, true);
  const res = await window.appSdk.create('Data', {
    child_name: "", unit: "Pusat", kelas: "Guru", guru: nm, type: "Absensi Guru Manual",
    jilid_number: "", page_from: "", surah_number: "", ayat_count: "", fluency_stars: 0,
    date: tgl + "T12:00:00+07:00", status: "", juz: "", tilawah_surah: "", tilawah_ayat: "",
    attendance_type: "guru", attendance_status: stat, subject: "", points: 0,
    points_note: "", points_rule_name: "", points_rule_active: true,
    latitude: "", longitude: "", status_geofence: "Input Bendahara" + (ket ? ": " + ket : "")
  });
  setSaving(btn, false);
  if (res.isOk) { document.getElementById("izin-guru-ket").value = ""; window.celebrate('Absen tersimpan!'); window.appSdk.init(handler, false); }
  else setStatus("izin-status", "Gagal.", true);
});
const btnSimpanGp = document.getElementById("btn-simpan-gp");
if (btnSimpanGp) {
  btnSimpanGp.addEventListener("click", async () => {
    const nm = document.getElementById("gp-guru-nama").value, tgl = document.getElementById("gp-tanggal").value, unt = document.getElementById("gp-unit").value, kls = document.getElementById("gp-kelas").value, nom = parseInt(document.getElementById("gp-nominal").value);
    if (!nm || !tgl || !unt || !kls || isNaN(nom)) return setStatus("gp-status", "Lengkapi!", true);
    setSaving(btnSimpanGp, true);
    const res = await window.appSdk.create('Data', {
      child_name: "", unit: unt, kelas: kls, guru: nm, type: "Guru Pengganti",
      jilid_number: "", page_from: "", surah_number: "", ayat_count: "", fluency_stars: 0,
      date: tgl + "T12:00:00+07:00", status: "", juz: "", tilawah_surah: "", tilawah_ayat: "",
      attendance_type: "guru", attendance_status: "Hadir", subject: "",
      points: nom, points_note: `Pengganti: ${unt}`, points_rule_name: "", points_rule_active: true,
      latitude: "", longitude: "", status_geofence: ""
    });
    setSaving(btnSimpanGp, false);
    if (res.isOk) { document.getElementById("gp-nominal").value = ""; window.celebrate('Guru pengganti tersimpan!'); window.appSdk.init(handler, false); }
    else setStatus("gp-status", "Gagal.", true);
  });
}
document.getElementById("gp-unit")?.addEventListener("change", (e) => {
  const unit = e.target.value;
  let fee = 0;
  if (unit === "Wali PAUDQU") fee = 30000;
  else if (["Pendamping PAUDQU", "TKQ", "TPQ", "RTQ"].includes(unit)) fee = 20000;
  else if (unit === "Bimbel") fee = 10000;
  const inp = document.getElementById("gp-nominal");
  if (inp) inp.value = fee > 0 ? fee : "";
});

/* ---------- INSENTIF ---------- */
document.getElementById("btn-add-insentif").addEventListener("click", () => {
  const nama = document.getElementById("insentif-nama").value.trim();
  const nom = parseInt(document.getElementById("insentif-nominal").value);
  if (nama && !isNaN(nom)) {
    currentInsentifList.push({ nama, nominal: nom });
    document.getElementById("insentif-nama").value = '';
    document.getElementById("insentif-nominal").value = '';
    renderInsentifList();
  }
});
window.removeInsentif = function(idx) { currentInsentifList.splice(idx, 1); renderInsentifList(); };
function renderInsentifList() {
  document.getElementById("insentif-list").innerHTML = currentInsentifList.map((ins, idx) => `
    <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100 text-[10px]">
      <span class="font-bold text-emerald-800">${escapeHtml(ins.nama)} (Rp ${ins.nominal.toLocaleString('id-ID')})</span>
      <button type="button" class="text-red-500 font-bold bg-red-50 px-2 py-1 rounded" onclick="window.removeInsentif(${idx})">✕</button>
    </div>`).join('');
}

/* ---------- GAJI ---------- */
function updateInfoSistemHadir() {
  const t = document.getElementById("salary-teacher-select").value;
  const sDate = document.getElementById("salary-start").value;
  const eDate = document.getElementById("salary-end").value;
  ["sal-hadir-wali","sal-hadir-pendamping","sal-hadir-tkq","sal-hadir-tpq","sal-hadir-rtq","sal-hadir-bimbel","sal-transport","sal-bonus"].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  currentInsentifList = []; renderInsentifList();
  if (!t || !sDate || !eDate) { document.getElementById("info-sistem-hadir").textContent = "0 Sesi"; return; }
  const recordsGuru = records.filter(r => (r.guru === t) && (r.type === "Absensi Guru Mandiri" || r.type === "Absensi Guru Manual") && r.date.split('T')[0] >= sDate && r.date.split('T')[0] <= eDate);
  let tHadir = 0;
  recordsGuru.forEach(r => { if (r.attendance_status === "Hadir") tHadir++; });
  document.getElementById("info-sistem-hadir").textContent = `${tHadir} Sesi`;
}
["salary-teacher-select", "salary-start", "salary-end"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", updateInfoSistemHadir);
});
document.getElementById("btn-calculate-salary").addEventListener("click", () => {
  const t = document.getElementById("salary-teacher-select").value;
  const sDate = document.getElementById("salary-start").value;
  const eDate = document.getElementById("salary-end").value;
  if (!t || !sDate || !eDate) return alert("Pilih guru & rentang!");
  const fRp = (val) => "Rp " + val.toLocaleString('id-ID');
  const cWali = parseInt(document.getElementById("sal-hadir-wali").value) || 0;
  const cPendamping = parseInt(document.getElementById("sal-hadir-pendamping").value) || 0;
  const cTkq = parseInt(document.getElementById("sal-hadir-tkq").value) || 0;
  const cTpq = parseInt(document.getElementById("sal-hadir-tpq").value) || 0;
  const cRtq = parseInt(document.getElementById("sal-hadir-rtq").value) || 0;
  const cBimbel = parseInt(document.getElementById("sal-hadir-bimbel").value) || 0;
  const vWali = cWali * 30000, vPend = cPendamping * 20000, vTkq = cTkq * 20000, vTpq = cTpq * 20000, vRtq = cRtq * 20000, vBim = cBimbel * 10000;
  const transport = parseFloat(document.getElementById("sal-transport").value) || 0;
  const bonus = parseFloat(document.getElementById("sal-bonus").value) || 0;
  let totalIns = 0; let insHtml = "";
  currentInsentifList.forEach(ins => { totalIns += ins.nominal; insHtml += `<div class="flex justify-between"><span>${escapeHtml(ins.nama)}:</span><span>${fRp(ins.nominal)}</span></div>`; });
  const recordsGP = records.filter(r => r.guru === t && r.type === "Guru Pengganti" && r.date.split('T')[0] >= sDate && r.date.split('T')[0] <= eDate);
  let gpNominal = 0, gpKet = [];
  recordsGP.forEach(r => { gpNominal += (parseFloat(r.points) || 0); gpKet.push(`${r.unit} ${r.kelas}`); });
  const finalGp = gpKet.length > 0 ? gpKet.join(", ") : "-";
  const total = vWali + vPend + vTkq + vTpq + vRtq + vBim + gpNominal + transport + bonus + totalIns;
  document.getElementById("salary-output-box").classList.remove("is-hidden");
  document.getElementById("slip-periode").textContent = `${formatDate(sDate)} s.d ${formatDate(eDate)}`;
  document.getElementById("slip-nama-guru").textContent = t;
  const setVis = (id, show) => document.getElementById(id).classList.toggle("is-hidden", !show);
  const set = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
  set("sv-c-wali", cWali); set("sv-wali", fRp(vWali)); setVis("sr-wali", cWali > 0);
  set("sv-c-pendamping", cPendamping); set("sv-pendamping", fRp(vPend)); setVis("sr-pendamping", cPendamping > 0);
  set("sv-c-tkq", cTkq); set("sv-tkq", fRp(vTkq)); setVis("sr-tkq", cTkq > 0);
  set("sv-c-tpq", cTpq); set("sv-tpq", fRp(vTpq)); setVis("sr-tpq", cTpq > 0);
  set("sv-c-rtq", cRtq); set("sv-rtq", fRp(vRtq)); setVis("sr-rtq", cRtq > 0);
  set("sv-c-bimbel", cBimbel); set("sv-bimbel", fRp(vBim)); setVis("sr-bimbel", cBimbel > 0);
  set("sv-gp-ket", finalGp); set("sv-gp", fRp(gpNominal)); setVis("sr-gp", gpNominal > 0);
  set("sv-transport", fRp(transport)); setVis("sr-transport", transport > 0);
  set("sv-bonus", fRp(bonus)); setVis("sr-bonus", bonus > 0);
  document.getElementById("dynamic-insentif-container").innerHTML = insHtml;
  set("sv-hadir", document.getElementById("info-sistem-hadir").textContent);
  set("sv-bersih", fRp(total));
  window.fireConfetti();
});
document.getElementById("btn-simpan-slip").addEventListener("click", async () => {
  const btn = document.getElementById("btn-simpan-slip");
  const stat = document.getElementById("slip-save-status");
  btn.disabled = true;
  let arr = [];
  document.querySelectorAll("#slip-gaji-printout .flex.justify-between:not(.is-hidden)").forEach(el => {
    const txt = el.innerText.replace(/\n/g, ' ').trim();
    if (txt && !txt.includes("TAKE HOME PAY") && !txt.includes("Total Hadir")) arr.push(txt);
  });
  const res = await window.appSdk.create('RekapGaji', {
    date: getWIBISOString(),
    guru: document.getElementById("slip-nama-guru").textContent,
    periode: document.getElementById("slip-periode").textContent,
    hadir_sistem: document.getElementById("sv-hadir").textContent,
    rincian_gaji: arr.join(" | "),
    total_gaji: document.getElementById("sv-bersih").textContent
  });
  btn.disabled = false;
  if (res.isOk) { stat.textContent = ""; window.celebrate('Slip tersimpan! 💰'); }
  else { stat.textContent = "❌ Gagal."; stat.style.color = "#ef476f"; }
});

/* ---------- MANAGE ---------- */
function updateManageListsAndDropdowns() {
  const u = document.getElementById("manage-unit").value, k = document.getElementById("manage-kelas").value;
  if (!u || !k) return ["guru-list","murid-list"].forEach(id => { const e = document.getElementById(id); if (e) e.innerHTML = '<p class="text-xs">Pilih lembaga/kelas</p>'; });
  const f = records.filter(r => r.unit === u && r.kelas === k && (!r.type || r.type.trim() === ""));
  const gMap = new Map(), mMap = new Map();
  f.filter(r => r.guru).forEach(r => { if (!gMap.has(r.guru)) gMap.set(r.guru, []); gMap.get(r.guru).push(r.__backendId); });
  f.filter(r => r.child_name).forEach(r => { if (!mMap.has(r.child_name)) mMap.set(r.child_name, []); mMap.get(r.child_name).push(r.__backendId); });
  document.getElementById("guru-list").innerHTML = gMap.size ? Array.from(gMap.keys()).sort().map(g => `<div class="flex justify-between items-center text-sm border-b py-1"><span>${escapeHtml(g)}</span><button type="button" class="text-red-500 font-bold" onclick="window.delManage('${gMap.get(g).join(',')}','guru-status')">Hapus</button></div>`).join("") : '<p class="text-xs">Kosong</p>';
  document.getElementById("murid-list").innerHTML = mMap.size ? Array.from(mMap.keys()).sort().map(m => {
    const av = getChildAvatar(m);
    const style = av.url ? `background:url('${av.url}') center/cover` : `background:${av.color}`;
    return `<div class="flex justify-between items-center text-sm border-b py-1"><div class="flex items-center gap-2"><div class="avatar" style="${style};width:24px;height:24px;font-size:11px">${av.url?'':av.initial}</div><span>${escapeHtml(m)}</span></div><button type="button" class="text-red-500 font-bold" onclick="window.delManage('${mMap.get(m).join(',')}','murid-status')">Hapus</button></div>`;
  }).join("") : '<p class="text-xs">Kosong</p>';
}
window.delManage = async function(ids, sId) {
  setStatus(sId, "Menghapus...");
  const idArr = ids.split(',');
  for (const id of idArr) {
    const t = records.find(x => x.__backendId === id || x.record_id === id);
    if (t) await window.appSdk.delete('Data', t);
  }
  setStatus(sId, "Dihapus");
  window.showToast('Data dihapus', 'success');
  window.appSdk.init(handler, false).then(() => updateManageListsAndDropdowns());
};
document.getElementById("add-guru-form").addEventListener("submit", async e => {
  e.preventDefault();
  const u = document.getElementById("manage-unit").value, k = document.getElementById("manage-kelas").value, n = normalizeName(document.getElementById("add-guru-input").value);
  if (!u || !k || !n) return;
  setSaving(e.target.querySelector('button'), true);
  await window.appSdk.create('Data', {
    child_name: "", unit: u, kelas: k, guru: n, type: "",
    jilid_number: "", page_from: "", surah_number: "", ayat_count: "", fluency_stars: 0,
    date: getWIBISOString(), status: "", juz: "", tilawah_surah: "", tilawah_ayat: "",
    attendance_type: "", attendance_status: "", subject: "",
    points: 0, points_note: "", points_rule_name: "", points_rule_active: true
  });
  setSaving(e.target.querySelector('button'), false);
  document.getElementById("add-guru-input").value = "";
  window.celebrate('Guru ditambahkan! 👨‍🏫');
  window.appSdk.init(handler, false);
});
document.getElementById("add-murid-form").addEventListener("submit", async e => {
  e.preventDefault();
  const u = document.getElementById("manage-unit").value, k = document.getElementById("manage-kelas").value, n = normalizeName(document.getElementById("add-murid-input").value);
  if (!u || !k || !n) return;
  setSaving(e.target.querySelector('button'), true);
  await window.appSdk.create('Data', {
    child_name: n, unit: u, kelas: k, guru: "", type: "",
    jilid_number: "", page_from: "", surah_number: "", ayat_count: "", fluency_stars: 0,
    date: getWIBISOString(), status: "", juz: "", tilawah_surah: "", tilawah_ayat: "",
    attendance_type: "", attendance_status: "", subject: "",
    points: 0, points_note: "", points_rule_name: "", points_rule_active: true
  });
  setSaving(e.target.querySelector('button'), false);
  document.getElementById("add-murid-input").value = "";
  window.celebrate('Murid ditambahkan! 👦');
  window.appSdk.init(handler, false);
});

/* ---------- REPORT ---------- */
function updateReportChildList() {
  if (activeUser.role && activeUser.role.toLowerCase() === 'wali') {
    const children = (activeUser.nama_terkait||"").split(',').map(s => normalizeName(s));
    document.getElementById("report-child").innerHTML = children.map(c => `<option value="${c}">${c}</option>`).join("");
    return;
  }
  const u = document.getElementById("report-unit").value, k = document.getElementById("report-kelas").value;
  const ch = [...new Set(records.filter(r => r.child_name && (u === "" || r.unit === u) && (k === "" || r.kelas === k)).map(r => r.child_name))].sort();
  document.getElementById("report-child").innerHTML = '<option value="">Pilih murid...</option>' + ch.map(c => `<option value="${c}">${c}</option>`).join("");
}
document.getElementById("generate-report-btn").addEventListener("click", () => {
  const c = document.getElementById("report-child").value;
  if (!c) return document.getElementById("report-output").classList.add("is-hidden");
  document.getElementById("report-output").classList.remove("is-hidden");
  const f = records.filter(r => r.child_name === c && r.type).sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById("report-child-name").textContent = c;
  document.getElementById("rpt-total").textContent = f.filter(r => ["Setoran Jilid","Setoran Jilid & Tilawah","Setoran Hafalan","Setoran Buku","Setoran Doa","Setoran Hadits","Bimbel"].includes(r.type)).length;
  document.getElementById("rpt-points").textContent = f.filter(r => r.type === "Poin").reduce((s, r) => s + (+r.points||0), 0);
  const att = f.filter(r => r.type === "Absensi" && r.attendance_type === "murid");
  document.getElementById("rpt-attendance").textContent = att.length ? Math.round((att.filter(r => r.attendance_status === "Hadir").length / att.length) * 100) + "%" : "—";
  const jRec = f.find(r => r.type && r.type.includes("Setoran Jilid"));
  let labelJilid = "—";
  if (jRec) {
    if (jRec.type === "Setoran Jilid & Tilawah") labelJilid = `Jld ${jRec.jilid_number||'-'} & Jz ${jRec.juz||'-'}\n${jRec.tilawah_surah||'-'}`;
    else labelJilid = `Jilid ${jRec.jilid_number}, Hal. ${jRec.page_from}`;
  }
  document.getElementById("rpt-jilid").innerText = labelJilid;
  const hRec = f.find(r => r.type === "Setoran Hafalan");
  document.getElementById("rpt-hafalan").innerText = hRec ? `${hRec.surah_number}\nAyat ${hRec.ayat_count}` : "—";
  // Set periode
  const sD = document.getElementById("report-start")?.value;
  const eD = document.getElementById("report-end")?.value;
  const periodeEl = document.getElementById("raport-periode");
  if (periodeEl) periodeEl.textContent = sD && eD ? `Periode: ${formatDate(sD)} - ${formatDate(eD)}` : `Dicetak: ${formatDate(new Date().toISOString())}`;
  // Avatar
  const rAv = document.getElementById("raport-avatar");
  if (rAv) setAvatar(rAv, c, 56);
  // Badges
  const bEl = document.getElementById("rpt-badges");
  if (bEl) {
    const bgs = getBadgesForChild(c);
    bEl.innerHTML = bgs.map(b => `<span class="badge-item ${b.earned ? '' : 'locked'}">${b.icon} ${b.label}</span>`).join('');
  }
  document.getElementById("report-table-body").innerHTML = f.map(r => {
    let d = "";
    if (r.type === "Setoran Jilid") d = `Jilid ${r.jilid_number}, Hal. ${r.page_from}`;
    else if (r.type === "Setoran Jilid & Tilawah") d = `Jilid ${r.jilid_number||'-'} + Juz ${r.juz||'-'}: ${r.tilawah_surah||'-'}`;
    else if (r.type === "Setoran Hafalan") d = `${r.surah_number}, Ay.${r.ayat_count}`;
    else if (r.type === "Setoran Doa" || r.type === "Setoran Hadits" || r.type === "Bimbel") d = r.subject || "-";
    else if (r.type === "Setoran Buku") d = `Hal. ${r.page_from}`;
    else if (r.type === "Absensi") d = `${r.attendance_type}: ${r.attendance_status}`;
    else if (r.type === "Poin") d = `${+r.points>0?"+":""}${r.points}`;
    return `<tr><td>${formatDate(r.date)}</td><td>${escapeHtml(r.type)}</td><td>${escapeHtml(d)}</td><td>${escapeHtml(r.status||"—")}</td></tr>`;
  }).join("");
});
document.getElementById("btn-print-raport")?.addEventListener("click", () => {
  const c = document.getElementById("report-child").value;
  if (!c) return alert("Pilih murid dulu!");
  window.print();
});

/* ---------- HISTORY ---------- */
function updateHistory(data) {
  let histData = data.filter(r => r.type && ["Setoran Jilid","Setoran Jilid & Tilawah","Setoran Hafalan","Setoran Doa","Setoran Hadits","Absensi Guru Mandiri","Absensi Guru Manual","Poin"].includes(r.type)).sort((a, b) => new Date(b.date) - new Date(a.date));
  if (activeUser.role && activeUser.role.toLowerCase() === 'wali') {
    const children = (activeUser.nama_terkait||"").split(',').map(s => normalizeName(s));
    histData = histData.filter(r => children.includes(r.child_name));
  }
  const l = document.getElementById("history-list");
  l.innerHTML = "";
  if (histData.length === 0) {
    l.innerHTML = `<div class="text-center py-6 rounded-2xl" style="background:var(--card)"><div class="text-5xl mb-2">🌱</div><p class="text-sm font-bold text-[#5a8c9a]">Belum ada riwayat</p><p class="text-xs text-[#5a8c9a] mt-1">Ayo mulai catat setoran!</p></div>`;
    return;
  }
  const now = new Date();
  histData.slice(0, 10).forEach(r => {
    const i = document.getElementById("history-template").content.firstElementChild.cloneNode(true);
    const nameForAvatar = r.child_name || r.guru || '?';
    setAvatar(i.querySelector(".history-avatar"), nameForAvatar);
    i.querySelector(".history-name").textContent = `${nameForAvatar} · ${r.type}`;
    let subTitle = "";
    if (r.type === "Absensi Guru Mandiri") subTitle = r.status_geofence;
    else if (r.type === "Absensi Guru Manual") subTitle = `Manual: ${r.attendance_status}`;
    else if (r.type === "Setoran Jilid & Tilawah") subTitle = `Jilid ${r.jilid_number} + Juz ${r.juz}`;
    else if (r.type === "Setoran Doa" || r.type === "Setoran Hadits") subTitle = r.subject;
    else subTitle = (r.points_rule_name || r.surah_number || `Jilid ${r.jilid_number}`);
    i.querySelector(".history-detail").textContent = subTitle;
    i.querySelector(".history-date").textContent = formatDate(r.date);
    const recordDate = new Date(r.date), hDate = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()), tDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()), diff = Math.round((tDate - hDate) / (1000 * 60 * 60 * 24));
    if (activeUser.role && activeUser.role.toLowerCase() === 'wali') i.querySelector(".action-buttons").innerHTML = "";
    else if (diff <= 2) {
      i.querySelector(".action-buttons").innerHTML = `<button type="button" class="edit-btn text-blue-500"><i data-lucide="edit" width="16"></i></button><button type="button" class="delete-btn text-red-500"><i data-lucide="trash-2" width="16"></i></button>`;
      i.querySelector(".edit-btn").onclick = () => { editingRecord = r; document.getElementById("open-" + (r.type.includes("Setoran") ? "mutabaah" : "points")).click(); };
      i.querySelector(".delete-btn").onclick = async () => {
        if (confirm("Hapus data ini?")) { await window.appSdk.delete('Data', r); window.showToast('Data dihapus', 'success'); window.appSdk.init(handler, false); }
      };
    } else {
      i.querySelector(".action-buttons").innerHTML = `<span class="text-[9px] text-gray-400 font-bold px-2 py-1 rounded-full" style="background:var(--bg)">🔒 Terkunci</span>`;
    }
    l.appendChild(i);
  });
  lucide.createIcons();
}

/* ---------- LEADERBOARD ---------- */
function updateLeaderboard() {
  const u = document.getElementById("lb-unit").value, k = document.getElementById("lb-kelas").value;
  const ptMap = {}, hafMap = {}, jilMap = {}, tilMap = {};
  records.forEach(r => {
    if (!r.child_name || (u && r.unit !== u) || (k && r.kelas !== k)) return;
    const c = r.child_name;
    ptMap[c] = (ptMap[c]||0) + (+r.points||0);
    if (r.type === "Setoran Hafalan" || r.type === "Setoran Doa" || r.type === "Setoran Hadits") hafMap[c] = (hafMap[c]||0) + 1;
    if (r.jilid_number) {
      const jVal = (+r.jilid_number * 100) + (+r.page_from || 0);
      if (!jilMap[c] || jVal > jilMap[c].val) jilMap[c] = { val: jVal, text: `Jilid ${r.jilid_number} (Hal ${r.page_from})` };
    }
    if (r.juz) {
      const jz = +r.juz || 0, sNum = r.tilawah_surah ? parseInt(r.tilawah_surah.split('.')[0]) || 0 : 0, ayt = +r.tilawah_ayat || 0, tVal = (jz * 10000) + (sNum * 100) + ayt;
      if (!tilMap[c] || tVal > tilMap[c].val) tilMap[c] = { val: tVal, text: `Juz ${jz} - ${(r.tilawah_surah||'').split('.')[1]||''} (Ay.${ayt})` };
    }
  });
  const renderPodium = (mapObj, containerId) => {
    const sorted = Object.entries(mapObj).map(([name, v]) => ({ name, val: (v && v.val !== undefined) ? v.val : v, text: (v && v.text !== undefined) ? v.text : `${v}x / poin` })).filter(x => x.val > 0).sort((a, b) => b.val - a.val).slice(0, 3);
    const container = document.getElementById(containerId);
    if (sorted.length === 0) { container.innerHTML = `<div class="text-center py-5"><div class="text-4xl mb-1">🌱</div><p class="text-xs font-bold opacity-70">Belum ada data</p></div>`; return; }
    const order = [];
    if (sorted[1]) order.push({ ...sorted[1], rank: 2 });
    if (sorted[0]) order.push({ ...sorted[0], rank: 1 });
    if (sorted[2]) order.push({ ...sorted[2], rank: 3 });
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    container.innerHTML = `<div class="podium-wrap">${order.map(p => {
      const av = getChildAvatar(p.name);
      const style = av.url ? `background:url('${av.url}') center/cover;color:white` : `background:${av.color};color:white`;
      return `<div class="podium-step podium-${p.rank} animate"><span class="podium-medal">${medals[p.rank]}</span><div class="podium-avatar" style="${style}">${av.url?'':av.initial}</div><div class="podium-name">${escapeHtml(p.name)}</div><div class="podium-value">${p.text}</div></div>`;
    }).join('')}</div>`;
  };
  renderPodium(ptMap, "lb-points");
  renderPodium(hafMap, "lb-hafalan");
  renderPodium(jilMap, "lb-jilid");
  renderPodium(tilMap, "lb-tilawah");
}