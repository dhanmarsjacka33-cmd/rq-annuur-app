/* ==========================================================
   MUTABA'AH RQ AN-NUUR — APP LOGIC v5.3
   ========================================================== */

let activeUser = {};
let records = [];
let recordsKeu = [];
let recordsKas = [];
let recordsKategori = [];
let recordsFoto = [];
let recordsPencapaian = [];
let recordsAbsensiGuru = [];
let dataReady = false;
let editingRuleId = null;
let editingRecord = null;
let appKontakWali = {};
let activeMutabaahTab = 'jilid';
let currentMasterType = '';
let editingMasterId = null;
let waliChartInstance = null;
let kasChartInstance = null;
let gajiChartInstance = null;
let modalAbsenState = { sesi: '', posisiPilihan: [] };
let kalenderState = { guru: '', month: '' };
let kalenderSelectedDate = '';

const POSISI_OPTIONS = [
  { peran: 'Wali PAUDQU', tarif: 30000, adaKelas: true },
  { peran: 'Pendamping PAUDQU', tarif: 20000, adaKelas: true },
  { peran: 'TKQ', tarif: 20000, adaKelas: true },
  { peran: 'TPQ', tarif: 20000, adaKelas: true },
  { peran: 'RTQ', tarif: 20000, adaKelas: true },
  { peran: 'Bimbel', tarif: 10000, adaKelas: false }
];

const BADGE_LIST = [
  { id: 'poin100', icon: '👑', label: 'Sultan Poin', check: function(s) { return s.poin >= 100; } },
  { id: 'poin50', icon: '⭐', label: 'Bintang Kelas', check: function(s) { return s.poin >= 50; } },
  { id: 'hadir20', icon: '🔥', label: 'Rajin Hadir', check: function(s) { return s.hadirBulanIni >= 20; } },
  { id: 'hadir10', icon: '💪', label: 'Semangat', check: function(s) { return s.hadirBulanIni >= 10; } },
  { id: 'setoran10', icon: '📚', label: 'Kutu Buku', check: function(s) { return s.totalSetoran >= 10; } },
  { id: 'setoran50', icon: '🕌', label: 'Hafiz Kecil', check: function(s) { return s.totalSetoran >= 50; } },
  { id: 'jilid3', icon: '🎓', label: 'Naik Jilid', check: function(s) { return s.jilidMax >= 3; } },
  { id: 'jilid6', icon: '🏅', label: 'Jilid Master', check: function(s) { return s.jilidMax >= 6; } }
];

const ONBOARD_STEPS = [
  { icon: '🎉', title: 'Selamat Datang!', desc: "Aplikasi untuk mencatat mutaba'ah santri, absensi guru, dan keuangan RQ An-Nuur." },
  { icon: '📖', title: 'Catat Setoran', desc: 'Klik menu "Catat Mutaba\'ah" untuk input setoran Jilid, Surah, Doa, atau Hadits.' },
  { icon: '⚡', title: 'Poin Cepat', desc: 'Klik tombol ⚡ melayang untuk beri poin instan ke banyak murid sekaligus.' },
  { icon: '📍', title: 'Absen Multi-Posisi', desc: 'Guru bisa absen hingga 2 posisi per sesi, plus catat penggantian.' },
  { icon: '📅', title: 'Kalender & Edit', desc: 'Klik tanggal di kalender untuk lihat detail dan edit absen.' },
  { icon: '🎨', title: 'Personalisasi', desc: 'Ganti tema, matikan suara, atau install ke home screen.' }
];
let onboardIdx = 0;

const surahData = [{"name":"1. Al-Fatihah","verses":7},{"name":"2. Al-Baqarah","verses":286},{"name":"3. Ali 'Imran","verses":200},{"name":"4. An-Nisa'","verses":176},{"name":"5. Al-Ma'idah","verses":120},{"name":"6. Al-An'am","verses":165},{"name":"7. Al-A'raf","verses":206},{"name":"8. Al-Anfal","verses":75},{"name":"9. At-Taubah","verses":129},{"name":"10. Yunus","verses":109},{"name":"11. Hud","verses":123},{"name":"12. Yusuf","verses":111},{"name":"13. Ar-Ra'd","verses":43},{"name":"14. Ibrahim","verses":52},{"name":"15. Al-Hijr","verses":99},{"name":"16. An-Nahl","verses":128},{"name":"17. Al-Isra'","verses":111},{"name":"18. Al-Kahf","verses":110},{"name":"19. Maryam","verses":98},{"name":"20. Taha","verses":135},{"name":"21. Al-Anbiya'","verses":112},{"name":"22. Al-Hajj","verses":78},{"name":"23. Al-Mu'minun","verses":118},{"name":"24. An-Nur","verses":64},{"name":"25. Al-Furqan","verses":77},{"name":"26. Asy-Syu'ara'","verses":227},{"name":"27. An-Naml","verses":93},{"name":"28. Al-Qasas","verses":88},{"name":"29. Al-'Ankabut","verses":69},{"name":"30. Ar-Rum","verses":60},{"name":"31. Luqman","verses":34},{"name":"32. As-Sajdah","verses":30},{"name":"33. Al-Ahzab","verses":73},{"name":"34. Saba'","verses":54},{"name":"35. Fatir","verses":45},{"name":"36. Yasin","verses":83},{"name":"37. As-Saffat","verses":182},{"name":"38. Sad","verses":88},{"name":"39. Az-Zumar","verses":75},{"name":"40. Ghafir","verses":85},{"name":"41. Fussilat","verses":54},{"name":"42. Asy-Syura","verses":53},{"name":"43. Az-Zukhruf","verses":89},{"name":"44. Ad-Dukhan","verses":59},{"name":"45. Al-Jasiyah","verses":37},{"name":"46. Al-Ahqaf","verses":35},{"name":"47. Muhammad","verses":38},{"name":"48. Al-Fath","verses":29},{"name":"49. Al-Hujurat","verses":18},{"name":"50. Qaf","verses":45},{"name":"51. Az-Zariyat","verses":60},{"name":"52. At-Tur","verses":49},{"name":"53. An-Najm","verses":62},{"name":"54. Al-Qamar","verses":55},{"name":"55. Ar-Rahman","verses":78},{"name":"56. Al-Waqi'ah","verses":96},{"name":"57. Al-Hadid","verses":29},{"name":"58. Al-Mujadilah","verses":22},{"name":"59. Al-Hasyr","verses":24},{"name":"60. Al-Mumtahanah","verses":13},{"name":"61. As-Saff","verses":14},{"name":"62. Al-Jumu'ah","verses":11},{"name":"63. Al-Munafiqun","verses":11},{"name":"64. At-Tagabun","verses":18},{"name":"65. At-Talaq","verses":12},{"name":"66. At-Tahrim","verses":12},{"name":"67. Al-Mulk","verses":30},{"name":"68. Al-Qalam","verses":52},{"name":"69. Al-Haqqah","verses":52},{"name":"70. Al-Ma'arij","verses":44},{"name":"71. Nuh","verses":28},{"name":"72. Al-Jinn","verses":28},{"name":"73. Al-Muzzammil","verses":20},{"name":"74. Al-Muddatstsir","verses":56},{"name":"75. Al-Qiyamah","verses":40},{"name":"76. Al-Insan","verses":31},{"name":"77. Al-Mursalat","verses":50},{"name":"78. An-Naba'","verses":40},{"name":"79. An-Nazi'at","verses":46},{"name":"80. 'Abasa","verses":42},{"name":"81. At-Takwir","verses":29},{"name":"82. Al-Infitar","verses":19},{"name":"83. Al-Mutaffifin","verses":36},{"name":"84. Al-Insyiqaq","verses":25},{"name":"85. Al-Buruj","verses":22},{"name":"86. At-Tariq","verses":17},{"name":"87. Al-A'la","verses":19},{"name":"88. Al-Ghasyiyah","verses":26},{"name":"89. Al-Fajr","verses":30},{"name":"90. Al-Balad","verses":20},{"name":"91. Asy-Syams","verses":15},{"name":"92. Al-Lail","verses":21},{"name":"93. Ad-Duha","verses":11},{"name":"94. Asy-Syarh","verses":8},{"name":"95. At-Tin","verses":8},{"name":"96. Al-'Alaq","verses":19},{"name":"97. Al-Qadr","verses":5},{"name":"98. Al-Bayyinah","verses":8},{"name":"99. Az-Zalzalah","verses":8},{"name":"100. Al-'Adiyat","verses":11},{"name":"101. Al-Qari'ah","verses":11},{"name":"102. At-Takatsur","verses":8},{"name":"103. Al-'Asr","verses":3},{"name":"104. Al-Humazah","verses":9},{"name":"105. Al-Fil","verses":5},{"name":"106. Quraisy","verses":4},{"name":"107. Al-Ma'un","verses":7},{"name":"108. Al-Kautsar","verses":3},{"name":"109. Al-Kafirun","verses":6},{"name":"110. An-Nasr","verses":3},{"name":"111. Al-Lahab","verses":5},{"name":"112. Al-Ikhlas","verses":4},{"name":"113. Al-Falaq","verses":5},{"name":"114. An-Nas","verses":6}];

const juzMap = [[],[{s:0,b:[1,7]},{s:1,b:[1,141]}],[{s:1,b:[142,252]}],[{s:1,b:[253,286]},{s:2,b:[1,92]}],[{s:2,b:[93,200]},{s:3,b:[1,23]}],[{s:3,b:[24,147]}],[{s:3,b:[148,176]},{s:4,b:[1,81]}],[{s:4,b:[82,120]},{s:5,b:[1,110]}],[{s:5,b:[111,165]},{s:6,b:[1,87]}],[{s:6,b:[88,206]},{s:7,b:[1,40]}],[{s:7,b:[41,75]},{s:8,b:[1,92]}],[{s:8,b:[93,129]},{s:9,b:[1,109]},{s:10,b:[1,5]}],[{s:10,b:[6,123]},{s:11,b:[1,52]}],[{s:11,b:[53,111]},{s:12,b:[1,43]},{s:13,b:[1,52]}],[{s:14,b:[1,99]},{s:15,b:[1,128]}],[{s:16,b:[1,111]},{s:17,b:[1,74]}],[{s:17,b:[75,110]},{s:18,b:[1,98]},{s:19,b:[1,135]}],[{s:20,b:[1,112]},{s:21,b:[1,78]}],[{s:22,b:[1,118]},{s:23,b:[1,64]},{s:24,b:[1,20]}],[{s:24,b:[21,77]},{s:25,b:[1,227]},{s:26,b:[1,55]}],[{s:26,b:[56,93]},{s:27,b:[1,88]},{s:28,b:[1,45]}],[{s:28,b:[46,69]},{s:29,b:[1,60]},{s:30,b:[1,34]},{s:31,b:[1,30]},{s:32,b:[1,30]}],[{s:32,b:[31,73]},{s:33,b:[1,54]},{s:34,b:[1,45]},{s:35,b:[1,27]}],[{s:35,b:[28,83]},{s:36,b:[1,182]},{s:37,b:[1,88]},{s:38,b:[1,31]}],[{s:38,b:[32,75]},{s:39,b:[1,85]},{s:40,b:[1,46]}],[{s:40,b:[47,54]},{s:41,b:[1,53]},{s:42,b:[1,89]},{s:43,b:[1,59]},{s:44,b:[1,37]}],[{s:45,b:[1,35]},{s:46,b:[1,38]},{s:47,b:[1,29]},{s:48,b:[1,18]},{s:49,b:[1,45]},{s:50,b:[1,30]}],[{s:50,b:[31,60]},{s:51,b:[1,49]},{s:52,b:[1,62]},{s:53,b:[1,55]},{s:54,b:[1,78]},{s:55,b:[1,96]},{s:56,b:[1,29]}],[{s:57,b:[1,22]},{s:58,b:[1,24]},{s:59,b:[1,13]},{s:60,b:[1,14]},{s:61,b:[1,11]},{s:62,b:[1,11]},{s:63,b:[1,18]},{s:64,b:[1,12]},{s:65,b:[1,12]}],[{s:66,b:[1,30]},{s:67,b:[1,52]},{s:68,b:[1,52]},{s:69,b:[1,44]},{s:70,b:[1,28]},{s:71,b:[1,28]},{s:72,b:[1,20]},{s:73,b:[1,56]},{s:74,b:[1,40]},{s:75,b:[1,31]},{s:76,b:[1,50]}]];
const juz30 = [];
for (let i = 77; i <= 113; i++) juz30.push({ s: i, b: [1, surahData[i].verses] });
juzMap.push(juz30);

function getWIBISOString() {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const wib = new Date(utc + (3600000 * 7));
  const pad = function(n) { return String(n).padStart(2, '0'); };
  return wib.getFullYear() + '-' + pad(wib.getMonth() + 1) + '-' + pad(wib.getDate()) + 'T' + pad(wib.getHours()) + ':' + pad(wib.getMinutes()) + ':' + pad(wib.getSeconds()) + '+07:00';
}

function getLocalDateString() {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const wib = new Date(utc + (3600000 * 7));
  const pad = function(n) { return String(n).padStart(2, '0'); };
  return wib.getFullYear() + '-' + pad(wib.getMonth() + 1) + '-' + pad(wib.getDate());
}

function normalizeName(str) {
  if (!str) return '';
  let s = str.trim().replace(/\s+/g, ' ').toLowerCase();
  if (s.startsWith('m ')) s = 'muhammad ' + s.substring(2);
  else if (s.startsWith('m. ')) s = 'muhammad ' + s.substring(3);
  return s.split(' ').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
}

function formatMonthYear(ym) {
  if (!ym) return '';
  const parts = ym.split('-');
  const y = parts[0];
  const m = parts[1];
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return months[parseInt(m) - 1] + ' ' + y;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch (e) {
    return iso;
  }
}

function detectSesi() {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  if (totalMinutes >= 450 && totalMinutes <= 600) return 'Sesi 1';
  if (totalMinutes >= 630 && totalMinutes <= 720) return 'Sesi 2';
  if (totalMinutes >= 930 && totalMinutes <= 1020) return 'Sesi 3';
  return '';
}

function getChildAvatar(name) {
  const foto = recordsFoto.find(function(f) { return f.child_name === name; });
  if (foto && foto.url) {
    return { initial: (name || '?').charAt(0).toUpperCase(), color: '#FFD166', url: foto.url };
  }
  const colors = ['#FFD166', '#06d6a0', '#06AED5', '#B794F6', '#FF6B6B', '#A8E06E', '#FFB085', '#0f7fa1'];
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const idx = (name || '?').split('').reduce(function(a, c) { return a + c.charCodeAt(0); }, 0) % colors.length;
  return { initial: initial, color: colors[idx], url: null };
}

function setAvatar(el, name, size) {
  if (!el) return;
  const av = getChildAvatar(name);
  if (size) {
    el.style.width = size + 'px';
    el.style.height = size + 'px';
  }
  if (av.url) {
    el.style.background = "url('" + av.url + "') center/cover";
    el.textContent = '';
  } else {
    el.style.background = av.color;
    el.textContent = av.initial;
  }
}

function applyTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = saved === 'dark' ? '<i data-lucide="sun" width="18"></i>' : '<i data-lucide="moon" width="18"></i>';
    if (window.lucide) lucide.createIcons();
  }
}

function showOnboarding() {
  if (localStorage.getItem('onboarded_v53') === 'true') return;
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
    localStorage.setItem('onboarded_v53', 'true');
    document.getElementById('onboarding-overlay').classList.add('is-hidden');
    return;
  }
  updateOnboardingUI();
};

window.skipOnboarding = function() {
  localStorage.setItem('onboarded_v53', 'true');
  document.getElementById('onboarding-overlay').classList.add('is-hidden');
};

window.getTunggakan = function(childName, unit) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = new Date();
  const cMonth = d.getMonth();
  const cYear = d.getFullYear();
  const absCurrent = cYear * 12 + cMonth;
  const startAbs = (cMonth >= 6 ? cYear : cYear - 1) * 12 + 6;
  const paidSPP = new Set();
  let totalTagihanTambahan = 0;
  let totalPelunasanTambahan = 0;
  const rincianTambahan = [];
  const cKeu = recordsKeu.filter(function(r) { return r.child_name === childName; });

  cKeu.forEach(function(r) {
    const kat = (r.kategori || '').trim();
    const nom = parseFloat(r.nominal) || 0;
    if (kat === 'Iuran Bulanan' && r.iuran_range) {
      const parts = r.iuran_range.toLowerCase().split(' s/d ');
      const parseYM = function(str) {
        let m = -1, y = -1;
        months.forEach(function(mn, idx) { if (str.includes(mn.toLowerCase())) m = idx; });
        const ym = str.match(/\d{4}/);
        if (ym) y = parseInt(ym[0]);
        return (m !== -1 && y !== -1) ? (y * 12 + m) : null;
      };
      const st = parseYM(parts[0]);
      const en = parts.length > 1 ? parseYM(parts[1]) : st;
      if (st && en) { for (let i = st; i <= en; i++) paidSPP.add(i); }
      else if (st) paidSPP.add(st);
    }
    if (kat === 'Tagihan Tambahan') {
      totalTagihanTambahan += nom;
      if (r.keterangan) rincianTambahan.push(r.keterangan);
    }
    if (kat === 'Pelunasan Tagihan Tambahan') totalPelunasanTambahan += nom;
  });

  const missingSPPMonths = [];
  for (let i = startAbs; i <= absCurrent; i++) {
    if (!paidSPP.has(i)) missingSPPMonths.push(months[i % 12] + ' ' + Math.floor(i / 12));
  }

  let sppTotalHutang = 0;
  if (missingSPPMonths.length > 0) {
    let lastNominal = 0;
    const pTarif = cKeu.filter(function(r) { return (r.kategori || '').trim() === 'Tarif SPP'; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    const pIuran = cKeu.filter(function(r) { return (r.kategori || '').trim() === 'Iuran Bulanan'; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    if (pTarif.length > 0 && parseFloat(pTarif[0].nominal) > 0) lastNominal = parseFloat(pTarif[0].nominal);
    else if (pIuran.length > 0 && parseFloat(pIuran[0].nominal) > 0) lastNominal = parseFloat(pIuran[0].nominal);
    else {
      if (unit === 'PAUDQU') lastNominal = 200000;
      else if (unit === 'Bimbel') lastNominal = 100000;
      else if (unit === 'TPQ') lastNominal = 50000;
      else if (unit === 'TKQ') lastNominal = 20000;
    }
    sppTotalHutang = missingSPPMonths.length * lastNominal;
  }

  let sisaTambahan = totalTagihanTambahan - totalPelunasanTambahan;
  if (sisaTambahan < 0) sisaTambahan = 0;
  const finalMissingArr = missingSPPMonths.slice();
  let finalTotalHutang = sppTotalHutang;
  if (sisaTambahan > 0) {
    finalTotalHutang += sisaTambahan;
    const info = rincianTambahan.length > 0 ? ' (' + rincianTambahan.join(', ') + ')' : '';
    finalMissingArr.push('Tagihan Lainnya' + info);
  }
  return { missing: finalMissingArr, total: finalTotalHutang, sppMissing: missingSPPMonths, sppTotal: sppTotalHutang, tambahanTotal: sisaTambahan };
};

function renderIuran1Tahun(childName, recordsKeuArr, isDark) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = new Date();
  const cYear = d.getFullYear();
  const cMonth = d.getMonth();
  const sy = cMonth >= 6 ? cYear : cYear - 1;
  const targetMonths = [];
  for (let i = 0; i < 12; i++) {
    const mIdx = (6 + i) % 12;
    const y = (6 + i) >= 12 ? sy + 1 : sy;
    targetMonths.push({ mName: months[mIdx], y: y, abs: y * 12 + mIdx, short: months[mIdx].substring(0, 3) });
  }
  const paid = new Set();
  const cKeu = recordsKeuArr.filter(function(r) { return r.child_name === childName && (r.kategori || '').trim() === 'Iuran Bulanan' && r.iuran_range; });
  cKeu.forEach(function(r) {
    const parts = r.iuran_range.toLowerCase().split(' s/d ');
    const parseYM = function(str) {
      let m = -1, y = -1;
      months.forEach(function(mn, idx) { if (str.includes(mn.toLowerCase())) m = idx; });
      const ym = str.match(/\d{4}/);
      if (ym) y = parseInt(ym[0]);
      return (m !== -1 && y !== -1) ? (y * 12 + m) : null;
    };
    const start = parseYM(parts[0]);
    const end = parts.length > 1 ? parseYM(parts[1]) : start;
    if (start && end) { for (let i = start; i <= end; i++) paid.add(i); }
    else if (start) paid.add(start);
  });
  let html = '<div class="grid grid-cols-6 gap-1 mt-2 w-full">';
  targetMonths.forEach(function(tm) {
    const isPaid = paid.has(tm.abs);
    let boxClass, textClass, nameClass;
    if (isDark) {
      boxClass = isPaid ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10';
      textClass = isPaid ? 'text-emerald-400' : 'text-white/20';
      nameClass = 'text-white/90';
    } else {
      boxClass = isPaid ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200';
      textClass = isPaid ? 'text-emerald-600' : 'text-gray-300';
      nameClass = 'text-gray-700';
    }
    const icon = isPaid ? '✓' : '✗';
    html += '<div class="text-[9px] font-bold ' + boxClass + ' px-1 py-1 rounded text-center leading-tight flex flex-col items-center justify-center"><span class="' + nameClass + ' mb-0.5">' + tm.short + '</span><span class="' + textClass + '">' + icon + '</span></div>';
  });
  return html + '</div>';
}

function computeStatsForChild(childName) {
  const cRec = records.filter(function(r) { return r.child_name === childName; });
  const cMon = getLocalDateString().slice(0, 7);
  const poin = cRec.filter(function(r) { return r.type === 'Poin'; }).reduce(function(s, r) { return s + (+r.points || 0); }, 0);
  const hadirBulanIni = cRec.filter(function(r) { return r.type === 'Absensi' && r.attendance_status === 'Hadir' && r.date.startsWith(cMon); }).length;
  const totalSetoran = cRec.filter(function(r) { return ['Setoran Jilid','Setoran Jilid & Tilawah','Setoran Hafalan','Setoran Buku','Setoran Doa','Setoran Hadits'].includes(r.type); }).length;
  let jilidMax = 0;
  cRec.forEach(function(r) { if (r.jilid_number) jilidMax = Math.max(jilidMax, +r.jilid_number || 0); });
  return { poin: poin, hadirBulanIni: hadirBulanIni, totalSetoran: totalSetoran, jilidMax: jilidMax };
}

function getBadgesForChild(childName) {
  const stats = computeStatsForChild(childName);
  return BADGE_LIST.map(function(b) { return Object.assign({}, b, { earned: b.check(stats) }); });
}

const screens = document.querySelectorAll('.screen');

window.showScreen = function(id) {
  screens.forEach(function(s) { s.classList.toggle('active', s.id === id); });
  if (window.lucide) lucide.createIcons();
  window.scrollTo(0, 0);
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.toggle('active', n.dataset.nav === id); });
  updateFabVisibility();
};

function setStatus(id, msg, error) {
  const e = document.getElementById(id);
  if (!e) return;
  e.textContent = msg;
  e.style.color = error ? '#c83252' : '#087a61';
}

function setSaving(b, on) {
  if (!b) return;
  b.disabled = on;
  b.style.opacity = on ? '.65' : '1';
}

function updateFabVisibility() {
  const fab = document.getElementById('fab-point');
  if (!fab) return;
  const role = (activeUser.role || '').toLowerCase();
  const allowed = ['guru', 'bendahara', 'admin'].includes(role);
  const loginActive = document.getElementById('login-screen').classList.contains('active');
  fab.style.display = (allowed && !loginActive) ? 'flex' : 'none';
}

function setupBottomNav(role) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const r = (role || '').toLowerCase();
  nav.querySelectorAll('.nav-item').forEach(function(item) {
    const roles = (item.dataset.roles || '').split(',').map(function(x) { return x.trim(); }).filter(function(x) { return x; });
    const allowed = roles.length === 0 || roles.includes(r);
    item.style.display = allowed ? 'flex' : 'none';
  });
  nav.classList.add('visible');
  nav.querySelectorAll('.nav-item').forEach(function(item) {
    if (item.onclick) return;
    item.onclick = function() {
      const target = item.dataset.nav;
      if (target === 'kas-screen') { renderKasDashboard(); populateKasKategori(); renderKasChart(); }
      if (target === 'report-screen') updateReportChildList();
      if (target === 'penagihan-screen') renderPenagihanDashboard();
      window.showScreen(target);
    };
  });
}

function processRoleUI(role) {
  ['menu-container','guru-attendance-card','open-bendahara','open-kas','open-keu-santri','open-penagihan','open-fotoupload','open-audit','report-filters','history-section','wali-dashboard'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('is-hidden');
  });
  if (role === 'wali') {
    document.getElementById('wali-dashboard').classList.remove('is-hidden');
    document.getElementById('history-section').classList.remove('is-hidden');
  } else {
    ['menu-container','report-filters','history-section'].forEach(function(id) { document.getElementById(id).classList.remove('is-hidden'); });
    if (role === 'guru') document.getElementById('guru-attendance-card').classList.remove('is-hidden');
    else if (role === 'bendahara' || role === 'admin') {
      ['open-bendahara','open-kas','open-keu-santri','open-penagihan','open-fotoupload','open-audit','guru-attendance-card'].forEach(function(id) { document.getElementById(id).classList.remove('is-hidden'); });
      const tLocal = getLocalDateString();
      ['izin-guru-tanggal','keu-tanggal','kas-tanggal'].forEach(function(id) {
        const e = document.getElementById(id);
        if (e) e.value = tLocal;
      });
    }
  }
  try { setupBottomNav(role); } catch (e) {}
  try { updateFabVisibility(); } catch (e) {}
}

window.appSdk = {
  init: async function(handler, fetchAll) {
    fetchAll = fetchAll || false;
    const role = activeUser.role ? activeUser.role.toLowerCase() : '';
    const names = role === 'wali' ? (activeUser.nama_terkait || '').split(',').map(function(n) { return normalizeName(n); }) : [];
    const guru = role === 'guru' ? normalizeName(activeUser.nama_terkait || activeUser.username) : '';
    try {
      window.showLoading('Memuat data...', 30);
      const res = await window.gas.getAllAppState({ fetchAll: fetchAll, role: role, names: names, guru: guru });
      window.updateLoading(80, 'Memproses...');
      handler.onDataChanged(res);
      window.updateLoading(100, 'Selesai');
      setTimeout(function() { window.hideLoading(); }, 300);
      return { isOk: true };
    } catch (err) {
      console.error(err);
      window.hideLoading();
      window.showToast('Gagal memuat data.', 'error');
      return { isOk: false };
    }
  },
  create: async function(sheetName, record) {
    record.record_id = 'ID_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    record.__backendId = record.record_id;
    try {
      const res = await window.gas.saveSheetData(sheetName, record);
      if (res && res.error === 'VALIDASI') return { isOk: false, validasi: res.messages };
      window.gas.logAktivitas({ user: activeUser.username || '', aksi: 'CREATE', sheet: sheetName, detail: JSON.stringify(record).substring(0, 200) }).catch(function() {});
      return { isOk: !!res };
    } catch (e) {
      return { isOk: false };
    }
  },
  update: async function(sheetName, record) {
    record.__backendId = record.record_id || record.__backendId;
    try {
      const res = await window.gas.updateSheetData(sheetName, record);
      if (res && res.error === 'VALIDASI') return { isOk: false, validasi: res.messages };
      window.gas.logAktivitas({ user: activeUser.username || '', aksi: 'UPDATE', sheet: sheetName, detail: record.record_id }).catch(function() {});
      return { isOk: res === true || res === 'true' };
    } catch (e) {
      return { isOk: false };
    }
  },
  delete: async function(sheetName, record) {
    try {
      const res = await window.gas.deleteSheetData(sheetName, record);
      window.gas.logAktivitas({ user: activeUser.username || '', aksi: 'DELETE', sheet: sheetName, detail: record.record_id }).catch(function() {});
      return { isOk: res === true || res === 'true' };
    } catch (e) {
      return { isOk: false };
    }
  }
};

const todayObj = new Date();
document.getElementById('cal-day').textContent = todayObj.getDate();
document.getElementById('cal-month').textContent = todayObj.toLocaleString('id-ID', { month: 'short' });
document.getElementById('today-date').textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(todayObj);
applyTheme();
window.addEventListener('DOMContentLoaded', function() {
  lucide.createIcons();
  applyTheme();

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      const cur = localStorage.getItem('theme') || 'light';
      localStorage.setItem('theme', cur === 'light' ? 'dark' : 'light');
      applyTheme();
      window.showToast(cur === 'light' ? 'Tema gelap aktif 🌙' : 'Tema terang aktif ☀️', 'info', 1500);
    });
  }

  const sBtn = document.getElementById('sound-toggle');
  if (sBtn) {
    const updateIcon = function() {
      sBtn.innerHTML = window.SOUND_ENABLED ? '<i data-lucide="volume-2" width="18"></i>' : '<i data-lucide="volume-x" width="18"></i>';
      if (window.lucide) lucide.createIcons();
    };
    updateIcon();
    sBtn.addEventListener('click', function() {
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
      if (!parsedUser || !parsedUser.role) throw new Error('Sesi tidak valid');
      activeUser = parsedUser;
      processRoleUI(activeUser.role.toLowerCase());
      document.getElementById('user-greeting').textContent = activeUser.nama_terkait || activeUser.username;
      window.showScreen('dashboard-screen');
      window.appSdk.init(handler, false);
    } else {
      setTimeout(showOnboarding, 500);
    }
  } catch (e) {
    localStorage.removeItem('mutabaah_session');
    window.showScreen('login-screen');
  }

  document.querySelectorAll('.back-button').forEach(function(b) {
    b.addEventListener('click', function() {
      editingRecord = null;
      editingRuleId = null;
      const btn = document.getElementById('add-rule-button');
      if (btn) btn.textContent = '➕ Tambah Aturan';
      closeMasterManage();
      window.showScreen('dashboard-screen');
    });
  });

  ['open-mutabaah','open-bimbel','open-absen','open-points','open-manage','open-report','open-bendahara','open-leaderboard','open-hall','open-kas','open-keu-santri','open-penagihan','open-fotoupload','open-kalender-guru','open-audit'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function() {
        const target = id.replace('open-', '') + '-screen';
        const form = document.querySelector('#' + target + ' form');
        if (form) form.reset();
        if (target === 'mutabaah-screen') {
          document.querySelector('.tab-btn[data-target="jilid"]').click();
          closeMasterManage();
        }
        if (target === 'absen-screen') document.getElementById('absen-date').value = getLocalDateString();
        if (target === 'report-screen') updateReportChildList();
        if (target === 'kas-screen') { renderKasDashboard(); populateKasKategori(); renderKasChart(); }
        if (target === 'keu-santri-screen') document.getElementById('keu-kategori').dispatchEvent(new Event('change'));
        if (target === 'bendahara-screen') {
          const td = new Date();
          document.getElementById('salary-end').value = getLocalDateString();
          document.getElementById('salary-start').value = td.getFullYear() + '-' + String(td.getMonth() + 1).padStart(2, '0') + '-01';
        }
        if (target === 'penagihan-screen') renderPenagihanDashboard();
        if (target === 'hall-screen') renderHallOfFame();
        if (target === 'fotoupload-screen') renderPencapaianList();
        if (target === 'kalender-guru-screen') initKalenderGuru();
        if (target === 'audit-screen') loadAuditKeuangan();
        window.showScreen(target);
      });
    }
  });

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      document.querySelectorAll('.tab-btn').forEach(function(b) {
        b.classList.remove('active', 'bg-[#0d5563]', 'text-white');
        b.style.background = 'var(--bg)';
        b.style.color = 'var(--text-muted)';
      });
      e.target.style.background = '#0d5563';
      e.target.style.color = '#ffffff';
      activeMutabaahTab = e.target.dataset.target;
      document.querySelectorAll('.mutabaah-panel').forEach(function(p) { p.classList.add('is-hidden'); });
      document.getElementById('panel-' + activeMutabaahTab).classList.remove('is-hidden');
      closeMasterManage();
      checkAnomali();
    });
  });

  const childSel = document.getElementById('mutabaah-child-select');
  if (childSel) childSel.addEventListener('change', function() { renderRiwayatCard(); checkAnomali(); });

  const openMut = document.getElementById('open-mutabaah');
  if (openMut) openMut.addEventListener('click', function() { setTimeout(loadFormPreference, 50); });

  const fab = document.getElementById('fab-point');
  if (fab) fab.addEventListener('click', openQuickPoint);

  const searchEl = document.getElementById('qp-search');
  if (searchEl) searchEl.addEventListener('input', function(e) { renderQpMuridList(e.target.value); });

  const customAmt = document.getElementById('qp-custom-amount');
  if (customAmt) customAmt.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') applyCustomPoint();
  });

  const qpList = document.getElementById('qp-murid-list');
  if (qpList) qpList.addEventListener('click', function(e) {
    const btn = e.target.closest('.qp-murid-btn');
    if (!btn) return;
    const name = btn.dataset.qpname;
    if (name) toggleQpMurid(name);
  });

  const qpRecent = document.getElementById('qp-recent');
  if (qpRecent) qpRecent.addEventListener('click', function(e) {
    const btn = e.target.closest('.qp-murid-btn');
    if (!btn) return;
    const name = btn.dataset.qpname;
    if (name) toggleQpMurid(name);
  });

  setTimeout(function() {
    const today = getLocalDateString();
    ['absen-date','keu-tanggal','kas-tanggal','izin-guru-tanggal','gp-tanggal'].forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.max = today;
    });
  }, 100);
});

document.getElementById('form-login').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  const msg = document.getElementById('login-pesan');
  btn.textContent = 'Memeriksa...';
  btn.disabled = true;
  msg.textContent = '';
  window.gas.login(document.getElementById('login-username').value, document.getElementById('login-password').value)
    .then(function(res) {
      btn.textContent = 'Masuk →';
      btn.disabled = false;
      if (res.sukses) {
        activeUser = res;
        localStorage.setItem('mutabaah_session', JSON.stringify(activeUser));
        document.getElementById('user-greeting').textContent = res.nama_terkait || res.username;
        processRoleUI(res.role.toLowerCase());
        window.showScreen('dashboard-screen');
        window.celebrate('Selamat datang, ' + (res.nama_terkait || res.username) + '! 👋');
        window.appSdk.init(handler, false);
      } else {
        msg.textContent = res.pesan || 'Login gagal';
        window.playSound('error');
      }
    })
    .catch(function(err) {
      console.error(err);
      btn.textContent = 'Masuk →';
      btn.disabled = false;
      msg.textContent = 'Gagal terhubung ke server.';
      window.playSound('error');
    });
});

window.logout = function() {
  if (!confirm('Keluar dari aplikasi?')) return;
  localStorage.removeItem('mutabaah_session');
  document.getElementById('form-login').reset();
  window.showScreen('login-screen');
  records = [];
  recordsKeu = [];
  recordsKas = [];
  recordsKategori = [];
  recordsFoto = [];
  recordsPencapaian = [];
  recordsAbsensiGuru = [];
  activeUser = {};
  appKontakWali = {};
  document.getElementById('bottom-nav').classList.remove('visible');
  document.getElementById('fab-point').style.display = 'none';
};

const handler = {
  onDataChanged: function(payload) {
    records = (payload.data || []).map(function(r) {
      return Object.assign({}, r, {
        guru: r.guru ? normalizeName(r.guru) : '',
        child_name: r.child_name ? normalizeName(r.child_name) : ''
      });
    });
    recordsKeu = payload.keuSantri || [];
    recordsKas = payload.bukuKas || [];
    recordsKategori = payload.masterKategori || [];
    recordsFoto = payload.fotoSantri || [];
    recordsPencapaian = payload.pencapaian || [];
    recordsAbsensiGuru = payload.absensiGuru || [];
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
    ['mutabaah', 'bimbel'].forEach(function(p) { refreshNames(p); });
    if (document.getElementById('manage-screen').classList.contains('active')) updateManageListsAndDropdowns();
    if (activeUser.role && activeUser.role.toLowerCase() === 'wali') renderWaliDashboard();
    try { updateFabVisibility(); } catch (e) {}
  }
};

function renderWaliDashboard() {
  const children = (activeUser.nama_terkait || '').split(',').map(function(s) { return normalizeName(s); });
  let wPts = 0, wHadir = 0;
  const cMon = getLocalDateString().slice(0, 7);
  const childRecords = records.filter(function(r) { return children.includes(r.child_name); });
  childRecords.forEach(function(r) {
    wPts += (+r.points || 0);
    if (r.type === 'Absensi' && r.attendance_status === 'Hadir' && r.date.startsWith(cMon)) wHadir++;
  });
  document.getElementById('wali-child-name').textContent = children.join(', ') || '-';
  document.getElementById('wali-poin').textContent = wPts;
  document.getElementById('wali-hadir').textContent = wHadir;
  if (children.length > 0) setAvatar(document.getElementById('wali-child-avatar'), children[0], 48);
  document.getElementById('wali-poin-bar').style.width = Math.min(100, (wPts / 100) * 100) + '%';
  document.getElementById('wali-hadir-bar').style.width = Math.min(100, (wHadir / 20) * 100) + '%';
  if (children.length > 0) {
    const badges = getBadgesForChild(children[0]);
    document.getElementById('wali-badges').innerHTML = badges.map(function(b) {
      return '<span class="badge-item ' + (b.earned ? '' : 'locked') + '">' + b.icon + ' ' + b.label + '</span>';
    }).join('');
  }
  renderStreakCalendar(children, childRecords);
  renderWaliChart(children);
  let keuHtml = '';
  let pengingatHtml = '';
  children.forEach(function(c) {
    let tabungan = 0;
    const cKeu = recordsKeu.filter(function(r) { return r.child_name === c; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    cKeu.forEach(function(r) {
      const kat = (r.kategori || '').trim();
      const nom = parseFloat(r.nominal) || 0;
      if (kat === 'Tabungan Masuk') tabungan += nom;
      if (kat === 'Tarik Tabungan') tabungan -= nom;
    });
    const iuranGrid = renderIuran1Tahun(c, recordsKeu, true);
    const cData = records.find(function(r) { return r.child_name === c; }) || { unit: '' };
    const tung = window.getTunggakan(c, cData.unit);
    if (tung.missing.length > 0) {
      const textN = tung.total > 0 ? 'Rp ' + tung.total.toLocaleString('id-ID') : 'Menyesuaikan';
      pengingatHtml += '<div class="bg-red-50/95 border border-red-300 p-3 rounded-xl mb-3 shadow-sm"><p class="text-xs font-bold text-red-700 uppercase mb-1">⚠️ Tagihan: ' + c + '</p><p class="text-[11px] text-red-600">' + tung.missing.join(', ') + '</p><p class="text-sm font-extrabold text-red-700 mt-1">Total: ' + textN + '</p></div>';
    }
    const av = getChildAvatar(c);
    const avStyle = av.url ? "background:url('" + av.url + "') center/cover" : 'background:' + av.color;
    keuHtml += '<div class="bg-white/10 rounded-xl p-3 border border-white/20"><div class="flex items-center gap-2 mb-2"><div class="avatar" style="' + avStyle + '">' + (av.url ? '' : av.initial) + '</div><p class="font-extrabold text-sm text-[#FFD166]">' + c + '</p></div><div class="flex justify-between items-center border-b border-white/10 pb-2 mb-2"><span class="text-[10px] text-white/80">💰 Tabungan:</span><span class="font-extrabold text-sm text-white">Rp ' + tabungan.toLocaleString('id-ID') + '</span></div><div><span class="text-[10px] text-white/80 block mb-1">📅 Status Iuran:</span>' + iuranGrid + '</div></div>';
  });
  document.getElementById('wali-tagihan-container').innerHTML = pengingatHtml;
  document.getElementById('wali-keuangan-container').innerHTML = keuHtml || '<p class="text-xs text-white/50 italic">Belum ada data anak.</p>';
  const myCaps = recordsPencapaian.filter(function(p) { return children.includes(p.child_name); }).sort(function(a, b) { return new Date(b.tanggal) - new Date(a.tanggal); }).slice(0, 3);
  if (myCaps.length > 0) {
    const capsHtml = '<h4 class="font-bold text-xs text-[#FFD166] mb-2 border-t border-white/10 pt-3">📸 Pencapaian Terbaru</h4><div class="grid grid-cols-3 gap-2">' + myCaps.map(function(p) {
      return '<div class="text-center"><div style="width:100%;aspect-ratio:1;background:url(\'' + p.url + '\') center/cover;border-radius:10px;border:2px solid #FFD166"></div><p class="text-[9px] font-bold mt-1 text-white/90 line-clamp-2">' + escapeHtml(p.keterangan || '') + '</p></div>';
    }).join('') + '</div>';
    document.getElementById('wali-tagihan-container').innerHTML += capsHtml;
  }
}

function renderStreakCalendar(children, childRecords) {
  const container = document.getElementById('streak-calendar');
  if (!container) return;
  const today = new Date();
  const days = [];
  let hadirCount = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const hadir = childRecords.some(function(r) { return r.type === 'Absensi' && r.attendance_status === 'Hadir' && r.date.startsWith(ds) && children.includes(r.child_name); });
    if (hadir) hadirCount++;
    days.push({ date: ds, dayNum: d.getDate(), hadir: hadir, isToday: i === 0 });
  }
  document.getElementById('streak-count').textContent = hadirCount + ' hari';
  container.innerHTML = days.map(function(d) {
    return '<div class="streak-cell ' + (d.hadir ? 'hadir' : '') + ' ' + (d.isToday ? 'today' : '') + '" title="' + d.date + '">' + d.dayNum + '</div>';
  }).join('');
}

function renderWaliChart(children) {
  const canvas = document.getElementById('wali-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  const months = [], poinData = [], hadirData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    months.push(d.toLocaleString('id-ID', { month: 'short' }));
    const recs = records.filter(function(r) { return children.includes(r.child_name) && r.date.startsWith(ym); });
    poinData.push(recs.filter(function(r) { return r.type === 'Poin'; }).reduce(function(s, r) { return s + (+r.points || 0); }, 0));
    hadirData.push(recs.filter(function(r) { return r.type === 'Absensi' && r.attendance_status === 'Hadir'; }).length);
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

const PREF_KEY = 'mutabaah_form_pref';

function saveFormPreference() {
  const pref = {
    unit: document.getElementById('mutabaah-unit') ? document.getElementById('mutabaah-unit').value : '',
    kelas: document.getElementById('mutabaah-kelas') ? document.getElementById('mutabaah-kelas').value : '',
    guru: document.getElementById('mutabaah-guru-select') ? document.getElementById('mutabaah-guru-select').value : ''
  };
  if (pref.unit) localStorage.setItem(PREF_KEY, JSON.stringify(pref));
}

function loadFormPreference() {
  try {
    const pref = JSON.parse(localStorage.getItem(PREF_KEY) || 'null');
    if (!pref || !pref.unit) return;
    const unitEl = document.getElementById('mutabaah-unit');
    if (unitEl) {
      unitEl.value = pref.unit;
      updateKelasOptions('mutabaah');
      setTimeout(function() {
        const kelasEl = document.getElementById('mutabaah-kelas');
        if (kelasEl && pref.kelas) kelasEl.value = pref.kelas;
        refreshNames('mutabaah');
        setTimeout(function() {
          const guruEl = document.getElementById('mutabaah-guru-select');
          if (guruEl && pref.guru) guruEl.value = pref.guru;
        }, 100);
      }, 100);
    }
  } catch (e) {}
}

function refreshMasterDoaHaditsSelects() {
  const doaData = records.filter(function(r) { return r.type === 'Master Doa'; }).sort(function(a, b) { return (a.subject || '').localeCompare(b.subject || '', 'id'); });
  const haditsData = records.filter(function(r) { return r.type === 'Master Hadits'; }).sort(function(a, b) { return (a.subject || '').localeCompare(b.subject || '', 'id'); });
  document.getElementById('mutabaah-doa-select').innerHTML = '<option value="">Pilih doa harian...</option>' + doaData.map(function(d) { return '<option value="' + escapeHtml(d.subject) + '">' + escapeHtml(d.subject) + '</option>'; }).join('');
  document.getElementById('mutabaah-hadits-select').innerHTML = '<option value="">Pilih hafalan hadits...</option>' + haditsData.map(function(d) { return '<option value="' + escapeHtml(d.subject) + '">' + escapeHtml(d.subject) + '</option>'; }).join('');
}

window.toggleMasterManage = function(type) {
  currentMasterType = type;
  editingMasterId = null;
  document.getElementById('master-new-input').value = '';
  document.getElementById('master-manage-title').textContent = 'Kelola ' + type;
  document.getElementById('master-manage-box').classList.remove('is-hidden');
  renderMasterManageList();
};

window.closeMasterManage = function() {
  document.getElementById('master-manage-box').classList.add('is-hidden');
};

function renderMasterManageList() {
  const data = records.filter(function(r) { return r.type === 'Master ' + currentMasterType; }).sort(function(a, b) { return (a.subject || '').localeCompare(b.subject || '', 'id'); });
  const listEl = document.getElementById('master-manage-list');
  listEl.innerHTML = data.length ? data.map(function(r) {
    return '<div class="flex justify-between items-center bg-gray-50 border-b p-1.5 rounded"><span class="text-[11px] font-bold">' + escapeHtml(r.subject) + '</span><div class="flex gap-2"><button type="button" class="text-blue-500 font-bold text-[10px]" onclick="editMaster(\'' + r.__backendId + '\', \'' + (r.subject || '').replace(/'/g, "\\'") + '\')">Edit</button><button type="button" class="text-red-500 font-bold text-[10px]" onclick="deleteMaster(\'' + r.__backendId + '\')">Hapus</button></div></div>';
  }).join('') : '<p class="text-[10px] text-gray-500 text-center">Belum ada data.</p>';
}

window.editMaster = function(id, name) {
  editingMasterId = id;
  document.getElementById('master-new-input').value = name;
  document.getElementById('btn-save-master').textContent = 'Update';
};

window.deleteMaster = async function(id) {
  if (!confirm('Yakin hapus data master ini?')) return;
  const target = records.find(function(x) { return x.__backendId === id; });
  if (target) {
    await window.appSdk.delete('Data', target);
    window.showToast('Data master dihapus', 'success');
    window.appSdk.init(handler, false).then(function() { renderMasterManageList(); });
  }
};

document.getElementById('btn-save-master').addEventListener('click', async function() {
  const val = document.getElementById('master-new-input').value.trim();
  if (!val) return setStatus('master-manage-status', 'Isi nama!', true);
  const btn = document.getElementById('btn-save-master');
  setSaving(btn, true);
  let res;
  if (editingMasterId) {
    const target = records.find(function(x) { return x.__backendId === editingMasterId; });
    if (target) {
      target.subject = val;
      res = await window.appSdk.update('Data', target);
    }
  } else {
    res = await window.appSdk.create('Data', { child_name: '', unit: '', kelas: '', guru: '', type: 'Master ' + currentMasterType, subject: val, date: getWIBISOString(), points_rule_active: true });
  }
  setSaving(btn, false);
  if (res && res.isOk) {
    document.getElementById('master-new-input').value = '';
    editingMasterId = null;
    btn.textContent = 'Simpan';
    window.celebrate('Data master tersimpan!');
    window.appSdk.init(handler, false).then(function() { renderMasterManageList(); });
  }
});

function renderRiwayatCard() {
  const card = document.getElementById('riwayat-card');
  const warnEl = document.getElementById('riwayat-warning');
  const content = document.getElementById('riwayat-content');
  const childName = nameValue('mutabaah', 'child');
  if (!childName) { card.classList.add('is-hidden'); return; }
  card.classList.remove('is-hidden');
  const cRec = records.filter(function(r) { return r.child_name === childName && r.type && r.type.startsWith('Setoran'); }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  if (cRec.length === 0) {
    content.innerHTML = '<p class="text-xs italic" style="color:var(--text-muted)">Belum ada setoran. Ini setoran pertama! 🎉</p>';
    warnEl.classList.add('is-hidden');
    return;
  }
  const last = cRec[0];
  const diffDays = Math.floor((Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 3) {
    warnEl.classList.remove('is-hidden');
    warnEl.textContent = '⚠️ ' + diffDays + ' hari tidak setor';
    warnEl.style.background = '#FFB0B0';
    warnEl.style.color = '#7a1010';
  } else warnEl.classList.add('is-hidden');
  const getLast = function(types) { return cRec.find(function(r) { return types.some(function(t) { return r.type.includes(t); }); }); };
  const lastJilid = getLast(['Setoran Jilid']);
  const lastHafalan = getLast(['Setoran Hafalan']);
  const lastDoa = getLast(['Setoran Doa']);
  const lastHadits = getLast(['Setoran Hadits']);
  let html = '<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">📚 Jilid:</span><span>' + (lastJilid ? 'Jilid ' + lastJilid.jilid_number + ', Hal ' + lastJilid.page_from + ' <span class="text-[10px] opacity-60">(' + formatDate(lastJilid.date) + ')</span>' : 'Belum ada') + '</span></div>';
  html += '<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">🕌 Hafalan:</span><span>' + (lastHafalan ? escapeHtml(lastHafalan.surah_number) + ' (Ay.' + lastHafalan.ayat_count + ') <span class="text-[10px] opacity-60">(' + formatDate(lastHafalan.date) + ')</span>' : 'Belum ada') + '</span></div>';
  if (lastDoa) html += '<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">🤲 Doa:</span><span>' + escapeHtml(lastDoa.subject) + ' <span class="text-[10px] opacity-60">(' + formatDate(lastDoa.date) + ')</span></span></div>';
  if (lastHadits) html += '<div class="flex items-start gap-2"><span class="font-bold min-w-[60px]">📜 Hadits:</span><span>' + escapeHtml(lastHadits.subject) + ' <span class="text-[10px] opacity-60">(' + formatDate(lastHadits.date) + ')</span></span></div>';
  content.innerHTML = html;
}

function checkAnomali() {
  const alertEl = document.getElementById('anomali-alert');
  const childName = nameValue('mutabaah', 'child');
  if (!childName) { alertEl.classList.add('is-hidden'); return; }
  const today = getLocalDateString();
  const warnings = [];
  const cRec = records.filter(function(r) { return r.child_name === childName && r.date.startsWith(today) && r.type && r.type.startsWith('Setoran'); });
  const tabTypes = { jilid: 'Setoran Jilid', surah: 'Setoran Hafalan', buku: 'Setoran Buku', doa: 'Setoran Doa', hadits: 'Setoran Hadits' };
  const currentType = tabTypes[activeMutabaahTab];
  if (cRec.some(function(r) { return r.type === currentType || r.type === currentType + ' & Tilawah'; })) {
    warnings.push('Sudah ada ' + currentType + ' hari ini untuk ' + childName);
  }
  if (warnings.length > 0) {
    alertEl.classList.remove('is-hidden');
    alertEl.innerHTML = '⚠️ ' + warnings.join('<br>⚠️ ');
  } else {
    alertEl.classList.add('is-hidden');
  }
}

async function saveForm(record, button, statusId, formToClearIds) {
  if (!dataReady) return setStatus(statusId, 'Menyiapkan data...', true);
  setSaving(button, true);
  if (editingRecord) {
    record.__backendId = editingRecord.__backendId;
    record.record_id = editingRecord.record_id;
    record.date = editingRecord.date;
  }
  const res = editingRecord ? await window.appSdk.update('Data', record) : await window.appSdk.create('Data', record);
  if (res.isOk) {
    if (editingRecord) {
      const idx = records.findIndex(function(r) { return r.__backendId === record.__backendId; });
      if (idx > -1) records[idx] = record;
      editingRecord = null;
      button.textContent = '💾 Simpan Data';
    } else {
      records.push(record);
    }
    handler.onDataChanged({ data: records, keuSantri: recordsKeu, bukuKas: recordsKas, kontakWali: appKontakWali, masterKategori: recordsKategori, fotoSantri: recordsFoto, pencapaian: recordsPencapaian, absensiGuru: recordsAbsensiGuru });
    if (formToClearIds) formToClearIds.forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    setSaving(button, false);
    setStatus(statusId, '');
    window.celebrate('Alhamdulillah, tersimpan! 🎉');
    try { saveFormPreference(); } catch (e) {}
    renderRiwayatCard();
  } else {
    setSaving(button, false);
    if (res.validasi) {
      setStatus(statusId, res.validasi.join('. '), true);
      window.showToast(res.validasi.join('. '), 'error', 3500);
    } else {
      setStatus(statusId, 'Gagal koneksi', true);
      window.showToast('Gagal menyimpan.', 'error');
    }
    window.playSound('error');
  }
}

document.getElementById('mutabaah-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const baseRec = {
    child_name: nameValue('mutabaah', 'child'),
    unit: document.getElementById('mutabaah-unit').value,
    kelas: document.getElementById('mutabaah-kelas').value,
    guru: nameValue('mutabaah', 'guru'),
    date: getWIBISOString(),
    status: document.getElementById('mutabaah-status-select').value
  };
  let finalRec = Object.assign({}, baseRec);
  let clearIds = [];
  if (activeMutabaahTab === 'jilid') {
    const t = document.getElementById('jilid-tilawah-toggle').checked;
    finalRec = Object.assign({}, finalRec, {
      type: t ? 'Setoran Jilid & Tilawah' : 'Setoran Jilid',
      jilid_number: document.getElementById('mutabaah-jilid-number').value,
      page_from: document.getElementById('mutabaah-page-from').value,
      juz: t ? document.getElementById('jilid-juz').value : '',
      tilawah_surah: t ? document.getElementById('jilid-tilawah-surah').value : '',
      tilawah_ayat: t ? document.getElementById('jilid-tilawah-ayat').value : ''
    });
    clearIds = ['mutabaah-page-from'];
  } else if (activeMutabaahTab === 'surah') {
    finalRec = Object.assign({}, finalRec, {
      type: 'Setoran Hafalan',
      surah_number: document.getElementById('mutabaah-surah-number').value,
      ayat_count: document.getElementById('mutabaah-ayat-count').value,
      juz: document.getElementById('mutabaah-surah-juz').value,
      fluency_stars: 0
    });
    clearIds = ['mutabaah-ayat-count'];
  } else if (activeMutabaahTab === 'buku') {
    finalRec = Object.assign({}, finalRec, { type: 'Setoran Buku', page_from: document.getElementById('mutabaah-buku-page').value });
    clearIds = ['mutabaah-buku-page'];
  } else if (activeMutabaahTab === 'doa') {
    finalRec = Object.assign({}, finalRec, { type: 'Setoran Doa', subject: document.getElementById('mutabaah-doa-select').value });
    if (!finalRec.subject) { window.showToast('Pilih Doa dulu ya!', 'error'); return; }
  } else if (activeMutabaahTab === 'hadits') {
    finalRec = Object.assign({}, finalRec, { type: 'Setoran Hadits', subject: document.getElementById('mutabaah-hadits-select').value });
    if (!finalRec.subject) { window.showToast('Pilih Hadits dulu ya!', 'error'); return; }
  }
  saveForm(finalRec, document.getElementById('mutabaah-save'), 'mutabaah-status', clearIds);
});

document.getElementById('bimbel-form').addEventListener('submit', function(e) {
  e.preventDefault();
  saveForm({
    child_name: nameValue('bimbel', 'child'),
    unit: document.getElementById('bimbel-unit').value,
    kelas: document.getElementById('bimbel-kelas').value,
    guru: nameValue('bimbel', 'guru'),
    type: 'Bimbel',
    jilid_number: '',
    page_from: document.getElementById('bimbel-material').value,
    surah_number: '',
    ayat_count: '',
    fluency_stars: 0,
    date: getWIBISOString(),
    status: document.getElementById('bimbel-status-select').value,
    juz: '',
    tilawah_surah: '',
    tilawah_ayat: '',
    attendance_type: '',
    attendance_status: '',
    subject: document.getElementById('bimbel-subject').value,
    points: 0,
    points_note: '',
    points_rule_name: '',
    points_rule_active: true
  }, document.getElementById('bimbel-save'), 'bimbel-status', ['bimbel-material']);
});

function updateCustomRules() {
  const rules = records.filter(function(r) { return r.type === 'Aturan Poin'; }).sort(function(a, b) { return (a.points_rule_name || '').localeCompare(b.points_rule_name || '', 'id'); });
  const list = document.getElementById('custom-rules-list');
  list.innerHTML = rules.length ? rules.map(function(r) {
    const nama = r.points_rule_name || r.points_note || 'Aturan Tanpa Nama';
    return '<div class="flex justify-between bg-white rounded-lg px-2 py-2 text-xs border"><span class="font-bold">' + escapeHtml(nama) + ' (' + (r.points > 0 ? '+' : '') + r.points + ')</span><div class="flex gap-2"><button type="button" class="text-blue-500 font-bold" onclick="window.populateRuleEdit(\'' + r.__backendId + '\', \'' + nama.replace(/'/g, "\\'") + '\', \'' + r.points + '\')">Edit</button><button type="button" class="text-[#ef476f] font-bold" onclick="window.deleteRule(\'' + r.__backendId + '\')">Hapus</button></div></div>';
  }).join('') : '<p class="text-xs" style="color:var(--text-muted)">Belum ada aturan custom.</p>';
  const dropSelect = document.getElementById('points-rule');
  if (dropSelect) {
    let html = '<option value="">Pilih aturan poin...</option>';
    rules.forEach(function(r) {
      html += '<option value="' + r.points + '|' + escapeHtml(r.points_rule_name || r.points_note || 'Tanpa Nama') + '">' + escapeHtml(r.points_rule_name || r.points_note || 'Tanpa Nama') + ' (' + (r.points > 0 ? '+' : '') + r.points + ')</option>';
    });
    dropSelect.innerHTML = html + '<option value="custom">Custom Manual</option>';
  }
}

window.populateRuleEdit = function(id, name, amount) {
  editingRuleId = id;
  document.getElementById('new-rule-name').value = name;
  document.getElementById('new-rule-amount').value = amount;
  document.getElementById('add-rule-button').textContent = '💾 Simpan Perubahan';
};

window.deleteRule = async function(id) {
  if (confirm('Hapus aturan ini?')) {
    const rule = records.find(function(x) { return x.__backendId === id; });
    if (rule) {
      await window.appSdk.delete('Data', rule);
      records = records.filter(function(x) { return x.__backendId !== id; });
      handler.onDataChanged({ data: records, keuSantri: recordsKeu, bukuKas: recordsKas, kontakWali: appKontakWali, masterKategori: recordsKategori, fotoSantri: recordsFoto, pencapaian: recordsPencapaian, absensiGuru: recordsAbsensiGuru });
      window.showToast('Aturan dihapus', 'success');
    }
  }
};

document.getElementById('add-rule-button').addEventListener('click', async function() {
  const name = document.getElementById('new-rule-name').value.trim();
  const amount = parseInt(document.getElementById('new-rule-amount').value);
  if (!name || isNaN(amount)) return alert('Isi nama dan poin!');
  setSaving(document.getElementById('add-rule-button'), true);
  let res;
  if (editingRuleId) {
    const target = records.find(function(x) { return x.__backendId === editingRuleId; });
    if (target) {
      target.points_rule_name = name;
      target.points_note = name;
      target.points = amount;
      res = await window.appSdk.update('Data', target);
    }
  } else {
    res = await window.appSdk.create('Data', {
      child_name: '', unit: '', kelas: '', guru: '', type: 'Aturan Poin',
      jilid_number: '', page_from: '', surah_number: '', ayat_count: '', fluency_stars: 0,
      date: getWIBISOString(), status: '', juz: '', tilawah_surah: '', tilawah_ayat: '',
      attendance_type: '', attendance_status: '', subject: '',
      points: amount, points_note: name, points_rule_name: name, points_rule_active: true
    });
  }
  setSaving(document.getElementById('add-rule-button'), false);
  if (res && res.isOk) {
    document.getElementById('new-rule-name').value = '';
    document.getElementById('new-rule-amount').value = '';
    editingRuleId = null;
    document.getElementById('add-rule-button').textContent = '➕ Tambah Aturan';
    window.celebrate('Aturan poin tersimpan! ⭐');
    window.appSdk.init(handler, false);
  }
});

document.getElementById('points-rule').addEventListener('change', function(e) {
  const c = e.target.value === 'custom';
  document.getElementById('custom-points-fields').classList.toggle('is-hidden', !c);
  if (!c && e.target.value !== '') {
    const parts = e.target.value.split('|');
    document.getElementById('points-amount').value = parts[0] || '';
    document.getElementById('points-note').value = parts[1] || '';
  } else if (e.target.value === '') {
    document.getElementById('points-amount').value = '';
    document.getElementById('points-note').value = '';
  }
});

function updatePointsChildList() {
  const u = document.getElementById('points-unit').value;
  const k = document.getElementById('points-kelas').value;
  const ch = Array.from(new Set(records.filter(function(r) { return r.unit === u && r.kelas === k && r.child_name; }).map(function(r) { return r.child_name; }))).sort();
  document.getElementById('points-child-select').innerHTML = '<option value="">Pilih murid...</option>' + ch.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
  document.getElementById('selected-points-children').innerHTML = ch.map(function(c) { return '<label class="flex items-center gap-2 text-xs"><input type="checkbox" value="' + c + '" class="point-child-check">' + c + '</label>'; }).join('');
}

document.getElementById('bulk-points').addEventListener('change', function(e) {
  const v = e.target.value;
  document.getElementById('selected-points-children').classList.toggle('is-hidden', v !== 'selected');
  document.getElementById('points-single-child-container').classList.toggle('is-hidden', v !== '');
  document.getElementById('points-child-select').required = (v === '');
});

document.getElementById('points-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u = document.getElementById('points-unit').value;
  const k = document.getElementById('points-kelas').value;
  const bulk = document.getElementById('bulk-points').value;
  const amt = parseInt(document.getElementById('points-amount').value);
  const nte = document.getElementById('points-note').value.trim();
  const tDateStr = getLocalDateString();
  let chList = [];
  if (bulk === 'selected') {
    chList = Array.from(document.querySelectorAll('.point-child-check:checked')).map(function(x) { return x.value; });
  } else if (bulk === 'present') {
    const allChildren = Array.from(new Set(records.filter(function(r) { return r.unit === u && r.kelas === k && r.child_name; }).map(function(r) { return r.child_name; })));
    chList = allChildren.filter(function(c) {
      return records.some(function(r) { return r.type === 'Absensi' && r.child_name === c && r.date.startsWith(tDateStr) && r.attendance_status === 'Hadir'; });
    });
    if (chList.length === 0) return setStatus('points-status', 'Belum ada murid hadir hari ini!', true);
  } else {
    chList = [document.getElementById('points-child-select').value];
  }
  if (!u || !k || !chList[0] || isNaN(amt)) return setStatus('points-status', 'Lengkapi data!', true);
  const btn = document.getElementById('points-save');
  setSaving(btn, true);
  let ok = 0;
  for (const c of chList) {
    const res = await window.appSdk.create('Data', {
      child_name: c, unit: u, kelas: k, guru: '', type: 'Poin',
      jilid_number: '', page_from: '', surah_number: '', ayat_count: '', fluency_stars: 0,
      date: getWIBISOString(), status: '', juz: '', tilawah_surah: '', tilawah_ayat: '',
      attendance_type: '', attendance_status: '', subject: '',
      points: amt, points_note: nte, points_rule_name: nte, points_rule_active: true
    });
    if (res.isOk) ok++;
  }
  setSaving(btn, false);
  document.getElementById('points-amount').value = '';
  document.getElementById('points-note').value = '';
  window.celebrate(ok + ' poin tersimpan! ⭐');
  window.appSdk.init(handler, false);
});

function updateAbsenLists() {
  const u = document.getElementById('absen-unit').value;
  const k = document.getElementById('absen-kelas').value;
  const m = Array.from(new Set(records.filter(function(r) { return r.unit === u && r.kelas === k && r.child_name; }).map(function(r) { return r.child_name; }))).sort();
  const opts = '<option value="Hadir">Hadir</option><option value="Izin">Izin</option><option value="Sakit">Sakit</option><option value="Alpha">Alpha</option>';
  document.getElementById('absen-murid-list').innerHTML = m.length ? m.map(function(n) {
    const av = getChildAvatar(n);
    const style = av.url ? "background:url('" + av.url + "') center/cover" : 'background:' + av.color;
    return '<div class="att-row"><div class="flex items-center gap-2 min-w-0 flex-1"><div class="avatar" style="' + style + ';width:28px;height:28px;font-size:12px">' + (av.url ? '' : av.initial) + '</div><span class="text-sm font-bold truncate">' + n + '</span></div><select data-name="' + n + '" data-type="murid" class="att-select">' + opts + '</select></div>';
  }).join('') : '<p class="text-xs">Kosong / Pilih Lembaga</p>';
}

document.getElementById('absen-save').addEventListener('click', async function() {
  const u = document.getElementById('absen-unit').value;
  const k = document.getElementById('absen-kelas').value;
  const d = document.getElementById('absen-date').value;
  if (!u || !k || !d) return setStatus('absen-status', 'Lengkapi data', true);
  const btn = document.getElementById('absen-save');
  setSaving(btn, true);
  let ok = 0;
  for (const sel of document.querySelectorAll('#absen-screen .att-select')) {
    const res = await window.appSdk.create('Data', {
      child_name: sel.dataset.type === 'murid' ? sel.dataset.name : '',
      unit: u, kelas: k, guru: sel.dataset.type === 'guru' ? sel.dataset.name : '',
      type: 'Absensi', jilid_number: '', page_from: '', surah_number: '', ayat_count: '', fluency_stars: 0,
      date: d + 'T12:00:00+07:00', status: '', juz: '', tilawah_surah: '', tilawah_ayat: '',
      attendance_type: sel.dataset.type, attendance_status: sel.value,
      subject: '', points: 0, points_note: '', points_rule_name: '', points_rule_active: true
    });
    if (res.isOk) ok++;
  }
  setSaving(btn, false);
  window.celebrate(ok + ' murid tercatat! ✅');
  window.appSdk.init(handler, false);
});

function updateBendaharaTeacherDropdown() {
  const tList = Array.from(new Set(records.filter(function(r) { return r.guru; }).map(function(r) { return r.guru; }))).sort();
  const html = '<option value="">-- Pilih Guru --</option>' + tList.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
  const a = document.getElementById('salary-teacher-select');
  if (a) a.innerHTML = html;
  const b = document.getElementById('izin-guru-nama');
  if (b) b.innerHTML = html;
  const c = document.getElementById('gp-guru-nama');
  if (c) c.innerHTML = html;
}

document.getElementById('btn-absen-masuk-guru').addEventListener('click', function() {
  const sesi = detectSesi();
  const lbl = document.getElementById('guru-live-status-absen');
  if (!sesi) {
    lbl.innerHTML = '<span class="text-red-300 font-extrabold block leading-tight py-1">Di luar jam absen<br><span class="text-[9px] font-bold">07.30-10.00 | 10.30-12.00 | 15.30-17.00 WIB</span></span>';
    return;
  }
  const guruName = normalizeName(activeUser.nama_terkait || activeUser.username);
  const today = getLocalDateString();
  const already = recordsAbsensiGuru.some(function(a) { return a.guru === guruName && a.date.startsWith(today) && a.sesi === sesi; });
  if (already) {
    lbl.innerHTML = '<span class="text-red-300 font-extrabold">Sudah absen ' + sesi + ' hari ini.</span>';
    return;
  }
  modalAbsenState = { sesi: sesi, posisiPilihan: [] };
  document.getElementById('modal-absen-sesi').textContent = sesi;
  document.getElementById('modal-absen-tanggal').textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  document.getElementById('modal-absen-total').textContent = '0';
  const container = document.getElementById('modal-posisi-list');
  container.innerHTML = POSISI_OPTIONS.map(function(p, idx) {
    const kelasOpts = p.adaKelas ? ['A', 'B', 'C'].map(function(k) { return '<option value="' + k + '">' + k + '</option>'; }).join('') : '';
    const kelasField = p.adaKelas ? '<select class="modal-kelas-select ml-2 border rounded px-1 py-0.5 text-[10px]" data-idx="' + idx + '">' + kelasOpts + '</select>' : '';
    return '<label class="flex items-center gap-2 p-2 rounded-lg border-2 border-transparent hover:bg-gray-50 cursor-pointer"><input type="checkbox" class="modal-posisi-cb" data-idx="' + idx + '" data-peran="' + p.peran + '" data-tarif="' + p.tarif + '"><span class="flex-1 text-xs font-bold">' + p.peran + '</span>' + kelasField + '<span class="text-[10px] font-extrabold text-[#06d6a0]">' + (p.tarif / 1000) + 'k</span></label>';
  }).join('');
  container.querySelectorAll('.modal-posisi-cb').forEach(function(cb) {
    cb.addEventListener('change', function(e) {
      const checked = container.querySelectorAll('.modal-posisi-cb:checked');
      if (checked.length > 2) {
        e.target.checked = false;
        window.showToast('Maksimal 2 posisi per sesi', 'error');
        return;
      }
      updateModalTotal();
    });
  });
  document.getElementById('modal-pengganti-toggle').checked = false;
  document.getElementById('modal-pengganti-fields').classList.add('is-hidden');
  const guruList = Array.from(new Set(records.filter(function(r) { return r.guru; }).map(function(r) { return r.guru; }))).sort();
  document.getElementById('modal-pengganti-guru').innerHTML = '<option value="">Pilih guru yang digantikan...</option>' + guruList.map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
  document.getElementById('modal-pengganti-peran').innerHTML = POSISI_OPTIONS.map(function(p) { return '<option value="' + p.peran + '" data-tarif="' + p.tarif + '">' + p.peran + ' (' + (p.tarif / 1000) + 'k)</option>'; }).join('');
  const m = document.getElementById('modal-absen');
  m.classList.remove('is-hidden');
  m.style.display = 'flex';
});

function updateModalTotal() {
  let total = 0;
  document.querySelectorAll('.modal-posisi-cb:checked').forEach(function(cb) { total += parseInt(cb.dataset.tarif) || 0; });
  if (document.getElementById('modal-pengganti-toggle').checked) {
    const sel = document.getElementById('modal-pengganti-peran');
    const opt = sel.selectedOptions[0];
    if (opt) total += parseInt(opt.dataset.tarif) || 0;
  }
  document.getElementById('modal-absen-total').textContent = total.toLocaleString('id-ID');
}

const penggantiToggle = document.getElementById('modal-pengganti-toggle');
if (penggantiToggle) {
  penggantiToggle.addEventListener('change', function(e) {
    document.getElementById('modal-pengganti-fields').classList.toggle('is-hidden', !e.target.checked);
    updateModalTotal();
  });
}

const penggantiPeran = document.getElementById('modal-pengganti-peran');
if (penggantiPeran) penggantiPeran.addEventListener('change', updateModalTotal);

const modalAbsenClose = document.getElementById('modal-absen-close');
if (modalAbsenClose) {
  modalAbsenClose.addEventListener('click', function() {
    document.getElementById('modal-absen').classList.add('is-hidden');
  });
}

const modalAbsenKonfirmasi = document.getElementById('modal-absen-konfirmasi');
if (modalAbsenKonfirmasi) {
  modalAbsenKonfirmasi.addEventListener('click', async function() {
    const btn = document.getElementById('modal-absen-konfirmasi');
    const checked = Array.from(document.querySelectorAll('.modal-posisi-cb:checked'));
    if (checked.length === 0 && !document.getElementById('modal-pengganti-toggle').checked) {
      return window.showToast('Pilih minimal 1 posisi', 'error');
    }
    const guruName = normalizeName(activeUser.nama_terkait || activeUser.username);
    const rec = {
      date: getWIBISOString(), guru: guruName, sesi: modalAbsenState.sesi,
      posisi_1_peran: '', posisi_1_kelas: '', posisi_1_tarif: '',
      posisi_2_peran: '', posisi_2_kelas: '', posisi_2_tarif: '',
      pengganti_untuk: '', pengganti_peran: '', pengganti_kelas: '', pengganti_tarif: '',
      latitude: '', longitude: '', status_geofence: 'Manual', input_by: activeUser.username, catatan: ''
    };
    if (checked[0]) {
      rec.posisi_1_peran = checked[0].dataset.peran;
      const sel = document.querySelector('.modal-kelas-select[data-idx="' + checked[0].dataset.idx + '"]');
      rec.posisi_1_kelas = sel ? sel.value : '';
      rec.posisi_1_tarif = checked[0].dataset.tarif;
    }
    if (checked[1]) {
      rec.posisi_2_peran = checked[1].dataset.peran;
      const sel = document.querySelector('.modal-kelas-select[data-idx="' + checked[1].dataset.idx + '"]');
      rec.posisi_2_kelas = sel ? sel.value : '';
      rec.posisi_2_tarif = checked[1].dataset.tarif;
    }
    if (document.getElementById('modal-pengganti-toggle').checked) {
      const guruTujuan = document.getElementById('modal-pengganti-guru').value;
      const peranSel = document.getElementById('modal-pengganti-peran');
      if (!guruTujuan) return window.showToast('Pilih guru yang digantikan', 'error');
      rec.pengganti_untuk = guruTujuan;
      rec.pengganti_peran = peranSel.value;
      rec.pengganti_tarif = peranSel.selectedOptions[0].dataset.tarif;
      rec.pengganti_kelas = '';
    }
    setSaving(btn, true);
    try {
      const res = await window.gas.simpanAbsenGuru({ record: rec });
      if (!res.sukses) {
        setSaving(btn, false);
        if (res.error === 'SUDAH_ABSEN' || res.error === 'DUPLIKAT') {
          if (confirm('⚠️ ' + res.message + '\n\nTetap absen (override)?')) {
            rec.force_override = true;
            const res2 = await window.gas.simpanAbsenGuru({ record: rec });
            if (res2.sukses) afterAbsenSuccess();
            else { window.showToast('Gagal: ' + (res2.error || ''), 'error'); setSaving(btn, false); }
          } else setSaving(btn, false);
        } else {
          window.showToast('Gagal: ' + (res.error || ''), 'error');
          setSaving(btn, false);
        }
        return;
      }
      afterAbsenSuccess();
    } catch (e) {
      setSaving(btn, false);
      window.showToast('Gagal absen.', 'error');
    }
  });
}

function afterAbsenSuccess() {
  document.getElementById('modal-absen').classList.add('is-hidden');
  document.getElementById('guru-live-status-absen').innerHTML = '<span class="text-green-300 font-extrabold">Absen ' + modalAbsenState.sesi + ' berhasil! 🎯</span>';
  window.celebrate('Alhamdulillah, absen ' + modalAbsenState.sesi + '!');
  window.appSdk.init(handler, false);
}

function initKalenderGuru() {
  const role = activeUser.role.toLowerCase();
  kalenderState.month = new Date().toISOString().slice(0, 7);
  if (role === 'bendahara' || role === 'admin') {
    const guruList = Array.from(new Set(records.filter(function(r) { return r.guru; }).map(function(r) { return r.guru; }))).sort();
    const sel = document.getElementById('kalender-guru-select');
    if (sel) {
      sel.innerHTML = '<option value="">-- Semua Guru --</option>' + guruList.map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
      sel.classList.remove('is-hidden');
      sel.onchange = function() { kalenderState.guru = sel.value; renderKalenderGuru(); };
    }
    kalenderState.guru = '';
  } else {
    kalenderState.guru = normalizeName(activeUser.nama_terkait || activeUser.username);
    const sel = document.getElementById('kalender-guru-select');
    if (sel) sel.classList.add('is-hidden');
  }
  renderKalenderGuru();
}

function renderKalenderGuru() {
  const guru = kalenderState.guru;
  const month = kalenderState.month || new Date().toISOString().slice(0, 7);
  document.getElementById('kalender-guru-title').textContent = guru || 'Semua Guru';
  document.getElementById('kalender-guru-month').textContent = new Date(month + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const data = recordsAbsensiGuru.filter(function(a) {
    if (guru && a.guru !== guru) return false;
    return a.date.startsWith(month);
  });
  const statusMap = {};
  data.forEach(function(a) {
    const day = a.date.slice(0, 10);
    if (!statusMap[day]) statusMap[day] = { count: 0, total: 0, sesi: [] };
    statusMap[day].count++;
    statusMap[day].total += parseInt(a.total_fee) || 0;
    statusMap[day].sesi.push(a.sesi);
  });
  const parts = month.split('-');
  const year = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const firstDay = new Date(year, m - 1, 1);
  const lastDay = new Date(year, m, 0);
  const startWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  let html = '<div class="grid grid-cols-7 gap-1 mb-2">' + dayNames.map(function(d) { return '<div class="text-center text-[9px] font-bold py-1" style="color:var(--text-muted)">' + d + '</div>'; }).join('') + '</div><div class="grid grid-cols-7 gap-1">';
  for (let i = 0; i < startWeekday; i++) html += '<div></div>';
  const today = getLocalDateString();
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = year + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const st = statusMap[dateStr];
    const isToday = dateStr === today;
    const isFuture = dateStr > today;
    let bg, text, detail = '';
    if (st) {
      bg = 'bg-gradient-to-br from-[#A8E06E] to-[#06d6a0]';
      text = 'text-white';
      detail = '<p class="text-[8px] font-bold opacity-90">' + st.count + '× ' + (st.total / 1000) + 'k</p>';
    } else if (isFuture) {
      bg = 'bg-gray-50';
      text = 'text-gray-300';
    } else {
      bg = 'bg-gray-100';
      text = 'text-gray-400';
    }
    const ring = isToday ? 'ring-2 ring-[#FFD166]' : '';
    html += '<div class="' + bg + ' ' + text + ' ' + ring + ' rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80 active:scale-95 transition-transform" onclick="showKalenderDetail(\'' + dateStr + '\')"><p class="text-xs font-extrabold">' + d + '</p>' + detail + '</div>';
  }
  html += '</div>';
  const totalSesi = data.length;
  const totalFee = data.reduce(function(s, a) { return s + (parseInt(a.total_fee) || 0); }, 0);
  html += '<div class="mt-4 grid grid-cols-2 gap-3"><div class="bg-gradient-to-br from-[#E2F4E8] to-[#C1EBD1] p-3 rounded-xl text-center"><p class="text-[10px] font-bold text-[#267152]">Total Sesi</p><p class="text-2xl font-extrabold text-[#267152]">' + totalSesi + '</p></div><div class="bg-gradient-to-br from-[#FFF3CE] to-[#FFE599] p-3 rounded-xl text-center"><p class="text-[10px] font-bold text-[#916912]">Estimasi Fee</p><p class="text-lg font-extrabold text-[#916912]">Rp ' + totalFee.toLocaleString('id-ID') + '</p></div></div>';
  document.getElementById('kalender-guru-grid').innerHTML = html;
}

window.showKalenderDetail = function(dateStr) {
  kalenderSelectedDate = dateStr;
  const guruFilter = kalenderState.guru;
  const data = recordsAbsensiGuru.filter(function(a) {
    return a.date.startsWith(dateStr) && (!guruFilter || a.guru === guruFilter);
  });
  document.getElementById('kal-detail-date').textContent = formatDate(dateStr);
  const listEl = document.getElementById('kal-detail-list');
  if (data.length === 0) {
    listEl.innerHTML = '<p class="text-xs text-center italic py-4" style="color:var(--text-muted)">Belum ada absen di tanggal ini</p>';
  } else {
    listEl.innerHTML = data.map(function(a) {
      const pos = [];
      if (a.posisi_1_peran) pos.push(a.posisi_1_peran + (a.posisi_1_kelas ? ' ' + a.posisi_1_kelas : ''));
      if (a.posisi_2_peran) pos.push(a.posisi_2_peran + (a.posisi_2_kelas ? ' ' + a.posisi_2_kelas : ''));
      if (a.pengganti_peran) pos.push('Ganti ' + (a.pengganti_untuk || '') + ': ' + a.pengganti_peran);
      return '<div class="p-3 rounded-xl border" style="background:var(--card);border-color:var(--border)"><div class="flex justify-between items-start gap-2 mb-1"><div class="flex-1 min-w-0"><p class="font-bold text-xs truncate">' + escapeHtml(a.guru) + '</p><p class="text-[10px]" style="color:var(--text-muted)">' + escapeHtml(a.sesi || '-') + '</p></div><span class="text-xs font-extrabold" style="color:#06d6a0">Rp ' + (parseInt(a.total_fee) || 0).toLocaleString('id-ID') + '</span></div><p class="text-[10px] mb-2" style="color:var(--text-muted)">' + (escapeHtml(pos.join(' + ')) || 'Tanpa posisi') + '</p><div class="flex gap-2"><button onclick="openEditAbsen(\'' + a.__backendId + '\')" class="flex-1 bg-blue-500 text-white rounded-lg py-1.5 text-[10px] font-bold">✏️ Edit</button><button onclick="deleteAbsenFromDetail(\'' + a.__backendId + '\')" class="flex-1 bg-red-500 text-white rounded-lg py-1.5 text-[10px] font-bold">🗑️ Hapus</button></div></div>';
    }).join('');
  }
  const modal = document.getElementById('modal-kalender-detail');
  modal.classList.remove('is-hidden');
  modal.style.display = 'flex';
};

window.closeKalenderDetail = function() {
  const m = document.getElementById('modal-kalender-detail');
  m.classList.add('is-hidden');
  m.style.display = 'none';
};

window.openEditAbsen = function(recordId) {
  const guruList = Array.from(new Set(records.filter(function(r) { return r.guru; }).map(function(r) { return r.guru; }))).sort();
  document.getElementById('edit-absen-guru').innerHTML = guruList.map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
  const posOpts = POSISI_OPTIONS.map(function(p) { return '<option value="' + p.peran + '" data-tarif="' + p.tarif + '">' + p.peran + ' (' + (p.tarif / 1000) + 'k)</option>'; }).join('');
  document.getElementById('edit-p1-peran').innerHTML = '<option value="">-</option>' + posOpts;
  document.getElementById('edit-p2-peran').innerHTML = '<option value="">-</option>' + posOpts;
  document.getElementById('edit-pg-peran').innerHTML = posOpts;
  if (recordId) {
    const rec = recordsAbsensiGuru.find(function(a) { return a.__backendId === recordId; });
    if (!rec) return;
    document.getElementById('edit-absen-title').textContent = '✏️ Edit Absen';
    document.getElementById('edit-absen-recordid').value = rec.__backendId;
    document.getElementById('edit-absen-date').value = rec.date.split('T')[0];
    document.getElementById('edit-absen-guru').value = rec.guru;
    document.getElementById('edit-absen-sesi').value = rec.sesi || 'Manual';
    document.getElementById('edit-p1-peran').value = rec.posisi_1_peran || '';
    document.getElementById('edit-p1-kelas').value = rec.posisi_1_kelas || '';
    document.getElementById('edit-p1-tarif').value = rec.posisi_1_tarif || '';
    document.getElementById('edit-p2-peran').value = rec.posisi_2_peran || '';
    document.getElementById('edit-p2-kelas').value = rec.posisi_2_kelas || '';
    document.getElementById('edit-p2-tarif').value = rec.posisi_2_tarif || '';
    const hasPg = !!rec.pengganti_peran;
    document.getElementById('edit-pg-toggle').checked = hasPg;
    document.getElementById('edit-pg-fields').classList.toggle('is-hidden', !hasPg);
    document.getElementById('edit-pg-untuk').value = rec.pengganti_untuk || '';
    if (rec.pengganti_peran) document.getElementById('edit-pg-peran').value = rec.pengganti_peran;
    document.getElementById('edit-pg-tarif').value = rec.pengganti_tarif || '';
    document.getElementById('edit-absen-catatan').value = rec.catatan || '';
    document.getElementById('btn-delete-absen').classList.remove('is-hidden');
  } else {
    document.getElementById('edit-absen-title').textContent = '➕ Tambah Absen Manual';
    document.getElementById('edit-absen-recordid').value = '';
    document.getElementById('edit-absen-date').value = kalenderSelectedDate || getLocalDateString();
    document.getElementById('edit-absen-sesi').value = 'Manual';
    document.getElementById('edit-p1-peran').value = '';
    document.getElementById('edit-p1-kelas').value = '';
    document.getElementById('edit-p1-tarif').value = '';
    document.getElementById('edit-p2-peran').value = '';
    document.getElementById('edit-p2-kelas').value = '';
    document.getElementById('edit-p2-tarif').value = '';
    document.getElementById('edit-pg-toggle').checked = false;
    document.getElementById('edit-pg-fields').classList.add('is-hidden');
    document.getElementById('edit-pg-untuk').value = '';
    document.getElementById('edit-pg-tarif').value = '';
    document.getElementById('edit-absen-catatan').value = '';
    document.getElementById('btn-delete-absen').classList.add('is-hidden');
  }
  const modal = document.getElementById('modal-edit-absen');
  modal.classList.remove('is-hidden');
  modal.style.display = 'flex';
};

window.closeEditAbsen = function() {
  const m = document.getElementById('modal-edit-absen');
  m.classList.add('is-hidden');
  m.style.display = 'none';
};

const editP1 = document.getElementById('edit-p1-peran');
if (editP1) editP1.addEventListener('change', function(e) {
  const opt = e.target.selectedOptions[0];
  if (opt && opt.dataset.tarif) document.getElementById('edit-p1-tarif').value = opt.dataset.tarif;
});

const editP2 = document.getElementById('edit-p2-peran');
if (editP2) editP2.addEventListener('change', function(e) {
  const opt = e.target.selectedOptions[0];
  if (opt && opt.dataset.tarif) document.getElementById('edit-p2-tarif').value = opt.dataset.tarif;
});

const editPg = document.getElementById('edit-pg-peran');
if (editPg) editPg.addEventListener('change', function(e) {
  const opt = e.target.selectedOptions[0];
  if (opt && opt.dataset.tarif) document.getElementById('edit-pg-tarif').value = opt.dataset.tarif;
});

const editPgToggle = document.getElementById('edit-pg-toggle');
if (editPgToggle) editPgToggle.addEventListener('change', function(e) {
  document.getElementById('edit-pg-fields').classList.toggle('is-hidden', !e.target.checked);
});

window.saveEditAbsen = async function() {
  const btn = document.getElementById('btn-save-absen');
  const statusEl = document.getElementById('edit-absen-status');
  const recordId = document.getElementById('edit-absen-recordid').value;
  const dateVal = document.getElementById('edit-absen-date').value;
  const guru = document.getElementById('edit-absen-guru').value;
  const sesi = document.getElementById('edit-absen-sesi').value;
  if (!dateVal || !guru) { statusEl.textContent = 'Lengkapi tanggal & guru!'; statusEl.style.color = '#c83252'; return; }
  const p1p = document.getElementById('edit-p1-peran').value;
  const p1k = document.getElementById('edit-p1-kelas').value;
  const p1t = parseInt(document.getElementById('edit-p1-tarif').value) || 0;
  const p2p = document.getElementById('edit-p2-peran').value;
  const p2k = document.getElementById('edit-p2-kelas').value;
  const p2t = parseInt(document.getElementById('edit-p2-tarif').value) || 0;
  const pgOn = document.getElementById('edit-pg-toggle').checked;
  const pgUntuk = pgOn ? document.getElementById('edit-pg-untuk').value : '';
  const pgPeran = pgOn ? document.getElementById('edit-pg-peran').value : '';
  const pgTarif = pgOn ? (parseInt(document.getElementById('edit-pg-tarif').value) || 0) : 0;
  if (!p1p && !pgPeran) { statusEl.textContent = 'Isi minimal 1 posisi!'; statusEl.style.color = '#c83252'; return; }
  const totalFee = p1t + p2t + pgTarif;
  const record = {
    record_id: recordId || ('AG_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
    date: dateVal + 'T12:00:00+07:00', guru: guru, sesi: sesi,
    posisi_1_peran: p1p, posisi_1_kelas: p1k, posisi_1_tarif: p1t,
    posisi_2_peran: p2p, posisi_2_kelas: p2k, posisi_2_tarif: p2t,
    pengganti_untuk: pgUntuk, pengganti_peran: pgPeran, pengganti_kelas: '', pengganti_tarif: pgTarif,
    total_fee: totalFee, latitude: '', longitude: '', status_geofence: 'Edit Manual',
    input_by: activeUser.username, catatan: document.getElementById('edit-absen-catatan').value || ''
  };
  setSaving(btn, true);
  statusEl.textContent = 'Menyimpan...';
  statusEl.style.color = '#087a61';
  try {
    let ok = false;
    if (recordId) {
      record.__backendId = recordId;
      const r = await window.gas.updateSheetData('AbsensiGuru', record);
      ok = r === true || r === 'true';
    } else {
      const r = await window.gas.simpanAbsenGuru({ record: record, force_override: true });
      ok = r && (r.sukses === true || r === true);
    }
    setSaving(btn, false);
    if (ok) {
      statusEl.textContent = '';
      window.celebrate(recordId ? 'Absen diperbarui! ✏️' : 'Absen ditambahkan! ➕');
      closeEditAbsen();
      closeKalenderDetail();
      await window.appSdk.init(handler, false);
      renderKalenderGuru();
    } else {
      statusEl.textContent = 'Gagal menyimpan.';
      statusEl.style.color = '#c83252';
    }
  } catch (e) {
    setSaving(btn, false);
    statusEl.textContent = 'Error: ' + e.message;
    statusEl.style.color = '#c83252';
  }
};

window.deleteAbsenFromDetail = async function(recordId) {
  if (!confirm('Hapus absen ini?')) return;
  const rec = recordsAbsensiGuru.find(function(a) { return a.__backendId === recordId; });
  if (!rec) return;
  try {
    await window.gas.deleteSheetData('AbsensiGuru', rec);
    window.showToast('Absen dihapus ✅', 'success');
    closeKalenderDetail();
    await window.appSdk.init(handler, false);
    renderKalenderGuru();
  } catch (e) {
    window.showToast('Gagal hapus: ' + e.message, 'error');
  }
};

window.deleteAbsenFromModal = async function() {
  const recordId = document.getElementById('edit-absen-recordid').value;
  if (!recordId) return;
  if (!confirm('Hapus absen ini?')) return;
  const rec = recordsAbsensiGuru.find(function(a) { return a.__backendId === recordId; });
  if (!rec) return;
  try {
    await window.gas.deleteSheetData('AbsensiGuru', rec);
    window.showToast('Absen dihapus ✅', 'success');
    closeEditAbsen();
    closeKalenderDetail();
    await window.appSdk.init(handler, false);
    renderKalenderGuru();
  } catch (e) {
    window.showToast('Gagal hapus: ' + e.message, 'error');
  }
};

window.kalenderPrevMonth = function() {
  const parts = kalenderState.month.split('-');
  const y = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const d = new Date(y, m - 2, 1);
  kalenderState.month = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  renderKalenderGuru();
};

window.kalenderNextMonth = function() {
  const parts = kalenderState.month.split('-');
  const y = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const d = new Date(y, m, 1);
  kalenderState.month = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  renderKalenderGuru();
};

async function hitungRekapGaji() {
  const t = document.getElementById('salary-teacher-select').value;
  const sDate = document.getElementById('salary-start').value;
  const eDate = document.getElementById('salary-end').value;
  if (!t || !sDate || !eDate) return alert('Pilih guru & rentang tanggal!');
  window.showLoading('Menghitung...', 40);
  try {
    const res = await window.gas.getRekapGaji({ guru: t, startDate: sDate, endDate: eDate });
    window.updateLoading(90, 'Menyusun slip...');
    if (!res.sukses) { window.hideLoading(); return alert('Gagal mengambil rekap.'); }
    const fRp = function(val) { return 'Rp ' + val.toLocaleString('id-ID'); };
    document.getElementById('salary-output-box').classList.remove('is-hidden');
    document.getElementById('slip-periode').textContent = formatDate(sDate) + ' s.d ' + formatDate(eDate);
    document.getElementById('slip-nama-guru').textContent = t;
    document.getElementById('sv-hadir').textContent = res.totalSesi + ' Sesi';
    document.getElementById('info-sistem-hadir').textContent = res.totalSesi + ' Sesi';
    const posContainer = document.getElementById('dynamic-insentif-container');
    const posisiEntries = Object.values(res.perPosisi).sort(function(a, b) { return b.total - a.total; });
    posContainer.innerHTML = posisiEntries.map(function(p) {
      return '<div class="flex justify-between"><span>' + escapeHtml(p.peran) + ' (' + p.count + '×):</span><span>' + fRp(p.total) + '</span></div>';
    }).join('') || '<p class="text-xs italic" style="color:var(--text-muted)">Belum ada data</p>';
    document.getElementById('sv-bersih').textContent = fRp(res.totalFee);
    const detailEl = document.getElementById('slip-detail-sesi');
    if (detailEl && res.sesiDetail.length > 0) {
      detailEl.innerHTML = '<p class="font-bold mt-2 mb-1">📋 Detail per Sesi:</p>' + res.sesiDetail.slice(0, 100).map(function(d) {
        const items = [];
        if (d.posisi_1) items.push(d.posisi_1.peran + ' ' + (d.posisi_1.kelas || ''));
        if (d.posisi_2) items.push(d.posisi_2.peran + ' ' + (d.posisi_2.kelas || ''));
        if (d.pengganti) items.push('Ganti ' + d.pengganti.untuk);
        return '<div class="flex justify-between border-b py-0.5"><span>' + formatDate(d.date) + ' ' + d.sesi + ': ' + items.join(' + ') + '</span><span>Rp ' + d.total.toLocaleString('id-ID') + '</span></div>';
      }).join('');
    } else if (detailEl) {
      detailEl.innerHTML = '';
    }
    renderGajiChart(res.perPosisi);
    window.updateLoading(100, 'Selesai');
    setTimeout(function() { window.hideLoading(); }, 300);
    window.fireConfetti();
  } catch (e) {
    window.hideLoading();
    alert('Gagal: ' + e.message);
  }
}

document.getElementById('btn-calculate-salary').addEventListener('click', hitungRekapGaji);

document.getElementById('btn-simpan-slip').addEventListener('click', async function() {
  const btn = document.getElementById('btn-simpan-slip');
  const stat = document.getElementById('slip-save-status');
  btn.disabled = true;
  const arr = [];
  document.querySelectorAll('#slip-gaji-printout .flex.justify-between').forEach(function(el) {
    const txt = el.innerText.replace(/\n/g, ' ').trim();
    if (txt && !txt.includes('TAKE HOME PAY') && !txt.includes('Total Sesi')) arr.push(txt);
  });
  const res = await window.appSdk.create('RekapGaji', {
    date: getWIBISOString(),
    guru: document.getElementById('slip-nama-guru').textContent,
    periode: document.getElementById('slip-periode').textContent,
    hadir_sistem: document.getElementById('sv-hadir').textContent,
    rincian_gaji: arr.join(' | '),
    total_gaji: document.getElementById('sv-bersih').textContent
  });
  btn.disabled = false;
  if (res.isOk) {
    stat.textContent = '';
    window.celebrate('Slip tersimpan! 💰');
  } else {
    stat.textContent = '❌ Gagal.';
    stat.style.color = '#ef476f';
  }
});

function renderGajiChart(perPosisi) {
  const canvas = document.getElementById('gaji-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (gajiChartInstance) gajiChartInstance.destroy();
  const labels = Object.keys(perPosisi);
  const data = Object.values(perPosisi).map(function(p) { return p.total; });
  const colors = ['#FFD166','#06d6a0','#06AED5','#FF6B6B','#A8E06E','#B794F6','#FFB085','#0f7fa1'];
  gajiChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: { labels: labels, datasets: [{ data: data, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e8f4f6' : '#0d5563', font: { size: 10, weight: '700' }, padding: 8 } } }
    }
  });
}

function renderKasChart() {
  const canvas = document.getElementById('kas-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (kasChartInstance) kasChartInstance.destroy();
  const labels = [], masuk = [], keluar = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    labels.push(d.toLocaleString('id-ID', { month: 'short' }));
    let m = 0, k = 0;
    recordsKas.forEach(function(r) {
      if (!r.date.startsWith(ym)) return;
      if (r.jenis === 'Pemasukan') m += parseInt(r.nominal || 0);
      else k += parseInt(r.nominal || 0);
    });
    masuk.push(m);
    keluar.push(k);
  }
  kasChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Masuk', data: masuk, backgroundColor: '#06d6a0', borderRadius: 6 },
        { label: 'Keluar', data: keluar, backgroundColor: '#FF6B6B', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e8f4f6' : '#0d5563', font: { size: 10 } } } },
      scales: {
        x: { ticks: { color: '#8aa9b3', font: { size: 9 } } },
        y: { ticks: { color: '#8aa9b3', font: { size: 9 } } }
      }
    }
  });
}

document.getElementById('btn-simpan-izin').addEventListener('click', async function() {
  const nm = document.getElementById('izin-guru-nama').value;
  const tgl = document.getElementById('izin-guru-tanggal').value;
  const stat = document.getElementById('izin-guru-status').value;
  const ket = document.getElementById('izin-guru-ket').value;
  if (!nm || !tgl || !stat) return setStatus('izin-status', 'Isi nama & tanggal!', true);
  const btn = document.getElementById('btn-simpan-izin');
  setSaving(btn, true);
  const res = await window.appSdk.create('Data', {
    child_name: '', unit: 'Pusat', kelas: 'Guru', guru: nm, type: 'Absensi Guru Manual',
    jilid_number: '', page_from: '', surah_number: '', ayat_count: '', fluency_stars: 0,
    date: tgl + 'T12:00:00+07:00', status: '', juz: '', tilawah_surah: '', tilawah_ayat: '',
    attendance_type: 'guru', attendance_status: stat, subject: '', points: 0,
    points_note: '', points_rule_name: '', points_rule_active: true,
    latitude: '', longitude: '', status_geofence: 'Input Bendahara' + (ket ? ': ' + ket : '')
  });
  setSaving(btn, false);
  if (res.isOk) {
    document.getElementById('izin-guru-ket').value = '';
    window.celebrate('Absen tersimpan!');
    window.appSdk.init(handler, false);
  } else {
    setStatus('izin-status', 'Gagal.', true);
  }
});

const btnSimpanGp = document.getElementById('btn-simpan-gp');
if (btnSimpanGp) {
  btnSimpanGp.addEventListener('click', async function() {
    const nm = document.getElementById('gp-guru-nama').value;
    const tgl = document.getElementById('gp-tanggal').value;
    const unt = document.getElementById('gp-unit').value;
    const kls = document.getElementById('gp-kelas').value;
    const nom = parseInt(document.getElementById('gp-nominal').value);
    if (!nm || !tgl || !unt || !kls || isNaN(nom)) return setStatus('gp-status', 'Lengkapi!', true);
    setSaving(btnSimpanGp, true);
    const rec = {
      date: tgl + 'T12:00:00+07:00', guru: nm, sesi: 'Manual',
      posisi_1_peran: '', posisi_1_kelas: '', posisi_1_tarif: '',
      posisi_2_peran: '', posisi_2_kelas: '', posisi_2_tarif: '',
      pengganti_untuk: unt, pengganti_peran: unt, pengganti_kelas: kls, pengganti_tarif: nom,
      latitude: '', longitude: '', status_geofence: 'Input Bendahara',
      input_by: activeUser.username, catatan: 'GP manual'
    };
    const res = await window.gas.simpanAbsenGuru({ record: rec, force_override: true });
    setSaving(btnSimpanGp, false);
    const isOk = res && (res.sukses === true || res === true);
    if (isOk) {
      document.getElementById('gp-nominal').value = '';
      window.celebrate('Guru pengganti tersimpan! 🎯');
      window.appSdk.init(handler, false);
      if (kalenderSelectedDate) renderKalenderGuru();
    } else {
      setStatus('gp-status', 'Gagal: ' + (res && res.message ? res.message : ''), true);
    }
  });
}

const gpUnit = document.getElementById('gp-unit');
if (gpUnit) {
  gpUnit.addEventListener('change', function(e) {
    const unit = e.target.value;
    let fee = 0;
    if (unit === 'Wali PAUDQU') fee = 30000;
    else if (['Pendamping PAUDQU', 'TKQ', 'TPQ', 'RTQ'].includes(unit)) fee = 20000;
    else if (unit === 'Bimbel') fee = 10000;
    const inp = document.getElementById('gp-nominal');
    if (inp) inp.value = fee > 0 ? fee : '';
  });
}

document.getElementById('keu-kategori').addEventListener('change', function(e) {
  document.getElementById('iuran-range-container').classList.toggle('is-hidden', e.target.value !== 'Iuran Bulanan');
});

document.getElementById('btn-simpan-keu').addEventListener('click', async function() {
  const u = document.getElementById('keu-unit').value;
  const k = document.getElementById('keu-kelas').value;
  const c = document.getElementById('keu-child-select').value;
  const d = document.getElementById('keu-tanggal').value;
  const kat = document.getElementById('keu-kategori').value;
  const ket = document.getElementById('keu-ket').value;
  const nom = parseInt(document.getElementById('keu-nominal').value);
  if (!u || !k || !c || !d || isNaN(nom)) return setStatus('keu-status', 'Lengkapi form!', true);
  let iuranRange = '';
  if (kat === 'Iuran Bulanan') {
    const mStart = document.getElementById('keu-iuran-start').value;
    const mEnd = document.getElementById('keu-iuran-end').value;
    if (!mStart || !mEnd) return setStatus('keu-status', 'Pilih bulan awal & akhir!', true);
    iuranRange = mStart === mEnd ? formatMonthYear(mStart) : formatMonthYear(mStart) + ' s/d ' + formatMonthYear(mEnd);
  }
  const btn = document.getElementById('btn-simpan-keu');
  setSaving(btn, true);
  const res = await window.appSdk.create('KeuanganSantri', {
    date: d + 'T12:00:00+07:00', unit: u, kelas: k, child_name: c, kategori: kat,
    nominal: nom, keterangan: ket, iuran_range: iuranRange, input_by: activeUser.username
  });
  setSaving(btn, false);
  if (res.isOk) {
    document.getElementById('keu-nominal').value = '';
    document.getElementById('keu-ket').value = '';
    window.celebrate('Transaksi tersimpan! 💵');
    window.appSdk.init(handler, false);
  } else {
    setStatus('keu-status', 'Gagal.', true);
  }
});

document.getElementById('btn-simpan-tarif').addEventListener('click', async function() {
  const u = document.getElementById('tarif-unit').value;
  const k = document.getElementById('tarif-kelas').value;
  const c = document.getElementById('tarif-child-select').value;
  const nom = parseInt(document.getElementById('tarif-nominal').value);
  if (!u || !k || !c || isNaN(nom)) return setStatus('tarif-status', 'Lengkapi!', true);
  const btn = document.getElementById('btn-simpan-tarif');
  setSaving(btn, true);
  const d = getLocalDateString();
  const res = await window.appSdk.create('KeuanganSantri', {
    date: d + 'T12:00:00+07:00', unit: u, kelas: k, child_name: c,
    kategori: 'Tarif SPP', nominal: nom, keterangan: 'Set Tarif Khusus',
    iuran_range: '', input_by: activeUser.username
  });
  setSaving(btn, false);
  if (res.isOk) {
    document.getElementById('tarif-nominal').value = '';
    window.celebrate('Tarif tersimpan! 📌');
    window.appSdk.init(handler, false);
  } else {
    setStatus('tarif-status', 'Gagal.', true);
  }
});

document.getElementById('btn-simpan-tagihan').addEventListener('click', async function() {
  const u = document.getElementById('tagihan-unit').value;
  const k = document.getElementById('tagihan-kelas').value;
  const c = document.getElementById('tagihan-child-select').value;
  const nom = parseInt(document.getElementById('tagihan-nominal').value);
  const ket = document.getElementById('tagihan-ket').value;
  if (!u || !k || !c || isNaN(nom) || !ket) return setStatus('tagihan-status', 'Lengkapi!', true);
  const btn = document.getElementById('btn-simpan-tagihan');
  setSaving(btn, true);
  const d = getLocalDateString();
  const res = await window.appSdk.create('KeuanganSantri', {
    date: d + 'T12:00:00+07:00', unit: u, kelas: k, child_name: c,
    kategori: 'Tagihan Tambahan', nominal: nom, keterangan: ket,
    iuran_range: '', input_by: activeUser.username
  });
  setSaving(btn, false);
  if (res.isOk) {
    document.getElementById('tagihan-nominal').value = '';
    document.getElementById('tagihan-ket').value = '';
    window.celebrate('Tagihan dicatat! 📝');
    window.appSdk.init(handler, false);
  } else {
    setStatus('tagihan-status', 'Gagal.', true);
  }
});

document.getElementById('btn-cek-keu').addEventListener('click', function() {
  const c = document.getElementById('cek-keu-child-select').value;
  if (!c) return alert('Pilih murid!');
  const fRp = function(v) { return 'Rp ' + Math.abs(v).toLocaleString('id-ID'); };
  const fData = recordsKeu.filter(function(r) { return r.child_name === c; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  let saldoTabungan = 0;
  fData.forEach(function(r) {
    const kat = (r.kategori || '').trim();
    const nom = parseFloat(r.nominal) || 0;
    if (kat === 'Tabungan Masuk') saldoTabungan += nom;
    if (kat === 'Tarik Tabungan') saldoTabungan -= nom;
  });
  document.getElementById('info-keuangan-panel').classList.remove('is-hidden');
  document.getElementById('saldo-tabungan').textContent = 'Rp ' + saldoTabungan.toLocaleString('id-ID');
  document.getElementById('status-iuran-text').innerHTML = renderIuran1Tahun(c, recordsKeu, false);
  const tbody = document.getElementById('tbody-keu-santri');
  if (fData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="text-2xl mb-1">💸</div><p class="text-[10px]">Belum ada riwayat</p></td></tr>';
    return;
  }
  tbody.innerHTML = fData.map(function(r) {
    const val = parseFloat(r.nominal) || 0;
    const kat = (r.kategori || '').trim();
    const col = (kat === 'Tarik Tabungan' || kat === 'Tagihan Tambahan') ? 'text-red-600' : (kat === 'Tarif SPP') ? 'text-amber-600' : 'text-green-600';
    const sign = (kat === 'Tarik Tabungan' || kat === 'Tagihan Tambahan') ? '-' : '';
    const infoExtra = (kat === 'Iuran Bulanan') ? r.iuran_range : (r.keterangan || '-');
    return '<tr><td class="text-[9px]">' + formatDate(r.date) + '</td><td class="text-[10px] font-bold">' + escapeHtml(r.kategori) + '</td><td class="text-[10px] font-extrabold ' + col + '">' + sign + ' ' + fRp(val) + '</td><td class="text-[9px]">' + escapeHtml(infoExtra) + '</td></tr>';
  }).join('');
});

function renderKasDashboard() {
  let saldo = 0;
  recordsKas.forEach(function(r) {
    if (r.jenis === 'Pemasukan') saldo += parseInt(r.nominal || 0);
    else if (r.jenis === 'Pengeluaran') saldo -= parseInt(r.nominal || 0);
  });
  document.getElementById('kas-saldo-total').textContent = 'Rp ' + saldo.toLocaleString('id-ID');
  const tbody = document.getElementById('tbody-kas');
  const lastRecords = recordsKas.slice().sort(function(a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 10);
  if (lastRecords.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4"><div class="text-3xl mb-2">🏦</div><p class="text-[10px]">Belum ada transaksi</p></td></tr>';
  } else {
    tbody.innerHTML = lastRecords.map(function(r) {
      const color = r.jenis === 'Pemasukan' ? 'text-teal-600' : 'text-red-600';
      const sign = r.jenis === 'Pemasukan' ? '+' : '-';
      return '<tr><td class="text-[9px]">' + formatDate(r.date) + '</td><td class="text-[10px] font-bold">' + escapeHtml(r.kategori) + '</td><td class="text-[10px] font-extrabold ' + color + '">' + sign + ' Rp ' + parseInt(r.nominal || 0).toLocaleString('id-ID') + '</td></tr>';
    }).join('');
  }
}

function populateKasKategori() {
  const jenis = document.getElementById('kas-jenis') ? document.getElementById('kas-jenis').value : 'Pemasukan';
  const sel = document.getElementById('kas-kategori');
  if (!sel) return;
  const cats = recordsKategori.filter(function(k) { return k.jenis === jenis && (k.aktif === true || k.aktif === 'TRUE' || k.aktif === 'true'); });
  sel.innerHTML = cats.map(function(c) { return '<option value="' + escapeHtml(c.kategori) + '">' + escapeHtml(c.kategori) + '</option>'; }).join('') || '<option value="">-</option>';
}

const kasJenis = document.getElementById('kas-jenis');
if (kasJenis) kasJenis.addEventListener('change', populateKasKategori);

document.getElementById('btn-simpan-kas').addEventListener('click', async function() {
  const d = document.getElementById('kas-tanggal').value;
  const j = document.getElementById('kas-jenis').value;
  const k = document.getElementById('kas-kategori').value;
  const n = parseInt(document.getElementById('kas-nominal').value);
  const ket = document.getElementById('kas-ket').value;
  if (!d || !j || !k || isNaN(n)) return setStatus('kas-status', 'Lengkapi semua data!', true);
  const btn = document.getElementById('btn-simpan-kas');
  setSaving(btn, true);
  const res = await window.appSdk.create('BukuKas', {
    date: d + 'T12:00:00+07:00', jenis: j, kategori: k, nominal: n, keterangan: ket, input_by: activeUser.username
  });
  setSaving(btn, false);
  if (res.isOk) {
    document.getElementById('kas-nominal').value = '';
    document.getElementById('kas-ket').value = '';
    window.celebrate('Transaksi kas tersimpan! 💰');
    window.appSdk.init(handler, false).then(function() { renderKasDashboard(); renderKasChart(); });
  } else {
    setStatus('kas-status', 'Gagal.', true);
  }
});

function renderKategoriManage() {
  const pemasukan = recordsKategori.filter(function(k) { return k.jenis === 'Pemasukan'; });
  const pengeluaran = recordsKategori.filter(function(k) { return k.jenis === 'Pengeluaran'; });
  const renderList = function(arr) {
    return arr.map(function(k) {
      const isActive = k.aktif === true || k.aktif === 'TRUE' || k.aktif === 'true';
      return '<div class="flex justify-between items-center bg-gray-50 border rounded p-2 text-xs mb-1"><span class="font-bold ' + (isActive ? '' : 'line-through opacity-50') + '">' + escapeHtml(k.kategori) + '</span><div class="flex gap-1"><button type="button" class="text-blue-500 font-bold text-[10px]" onclick="window.toggleKategori(\'' + k.__backendId + '\')">' + (isActive ? 'Nonaktif' : 'Aktif') + '</button><button type="button" class="text-red-500 font-bold text-[10px]" onclick="window.deleteKategori(\'' + k.__backendId + '\')">Hapus</button></div></div>';
    }).join('') || '<p class="text-[10px] italic" style="color:var(--text-muted)">Belum ada kategori</p>';
  };
  const p = document.getElementById('kategori-list-pemasukan');
  const q = document.getElementById('kategori-list-pengeluaran');
  if (p) p.innerHTML = '<p class="text-[10px] font-bold mb-1">⬆️ Pemasukan:</p>' + renderList(pemasukan);
  if (q) q.innerHTML = '<p class="text-[10px] font-bold mb-1 mt-2">⬇️ Pengeluaran:</p>' + renderList(pengeluaran);
}

window.toggleKategori = async function(id) {
  const k = recordsKategori.find(function(x) { return x.__backendId === id; });
  if (!k) return;
  const wasActive = k.aktif === true || k.aktif === 'TRUE' || k.aktif === 'true';
  k.aktif = !wasActive;
  await window.appSdk.update('MasterKategori', k);
  window.showToast('Kategori diubah', 'success');
  window.appSdk.init(handler, false);
};

window.deleteKategori = async function(id) {
  if (!confirm('Hapus kategori ini?')) return;
  const k = recordsKategori.find(function(x) { return x.__backendId === id; });
  if (k) {
    await window.appSdk.delete('MasterKategori', k);
    window.showToast('Kategori dihapus', 'success');
    window.appSdk.init(handler, false);
  }
};

const btnAddKat = document.getElementById('btn-add-kat');
if (btnAddKat) {
  btnAddKat.addEventListener('click', async function() {
    const jenis = document.getElementById('new-kat-jenis').value;
    const nama = document.getElementById('new-kat-nama').value.trim();
    if (!nama) return;
    setSaving(btnAddKat, true);
    await window.appSdk.create('MasterKategori', { jenis: jenis, kategori: nama, aktif: true });
    setSaving(btnAddKat, false);
    document.getElementById('new-kat-nama').value = '';
    window.celebrate('Kategori ditambahkan!');
    window.appSdk.init(handler, false);
  });
}

function renderPenagihanDashboard() {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const now = new Date();
  const cMon = now.getMonth();
  const cYear = now.getFullYear();
  const allStudents = Array.from(new Set(records.filter(function(r) { return r.child_name && r.unit; }).map(function(r) { return { name: r.child_name, unit: r.unit }; })));
  const unique = [];
  const seen = new Set();
  for (const s of allStudents) {
    if (!seen.has(s.name)) {
      seen.add(s.name);
      unique.push(s);
    }
  }
  let totalHutang = 0, totalLunas = 0;
  const belumBayar = [];
  unique.forEach(function(s) {
    const tung = window.getTunggakan(s.name, s.unit);
    const cKeu = recordsKeu.filter(function(r) { return r.child_name === s.name; });
    const lunasBulanIni = cKeu.find(function(r) {
      return (r.kategori || '').trim() === 'Iuran Bulanan' && r.iuran_range && r.iuran_range.toLowerCase().includes(months[cMon].toLowerCase()) && r.iuran_range.includes(String(cYear));
    });
    if (lunasBulanIni) totalLunas += parseFloat(lunasBulanIni.nominal) || 0;
    if (tung.total > 0 || tung.missing.length > 0) {
      totalHutang += tung.total;
      belumBayar.push(Object.assign({}, s, { tung: tung }));
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
    listEl.innerHTML = '<div class="text-center py-8 bg-green-50 rounded-2xl border-2 border-green-200"><div class="text-5xl mb-2">🎉</div><p class="text-sm font-bold text-green-700">Alhamdulillah, semua lunas!</p></div>';
    return;
  }
  listEl.innerHTML = belumBayar.map(function(s) {
    const av = getChildAvatar(s.name);
    const style = av.url ? "background:url('" + av.url + "') center/cover" : 'background:' + av.color;
    const noHp = appKontakWali[s.name];
    const waBtn = noHp ? '<button onclick="previewWA(\'' + s.name.replace(/'/g, "\\'") + '\',\'' + noHp + '\')" class="bg-green-500 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold">💬 WA</button>' : '<span class="text-[9px] italic" style="color:var(--text-muted)">No WA -</span>';
    return '<div class="p-3 rounded-xl border-2 border-red-100 shadow-sm flex items-center gap-2" style="background:var(--card)"><div class="avatar" style="' + style + ';width:36px;height:36px;font-size:14px">' + (av.url ? '' : av.initial) + '</div><div class="flex-1 min-w-0"><p class="font-bold text-xs text-red-700 truncate">' + escapeHtml(s.name) + '</p><p class="text-[9px] truncate" style="color:var(--text-muted)">' + s.tung.missing.join(', ') + '</p><p class="text-[10px] font-extrabold text-red-600">Rp ' + s.tung.total.toLocaleString('id-ID') + '</p></div>' + waBtn + '</div>';
  }).join('');
}

window.previewWA = function(name, noHp) {
  const rec = records.find(function(r) { return r.child_name === name; });
  const tung = window.getTunggakan(name, rec ? rec.unit : '');
  const phone = noHp.toString().trim().replace(/^0/, '62');
  let pesan = "Assalamu'alaikum Ayah/Bunda.\n\nMengingatkan bahwa terdapat tagihan untuk ananda *" + name.toUpperCase() + '* yang belum tercatat lunas:\n';
  if (tung.sppTotal > 0) pesan += '- SPP: ' + tung.sppMissing.join(', ') + ' (Rp ' + tung.sppTotal.toLocaleString('id-ID') + ')\n';
  if (tung.tambahanTotal > 0) pesan += '- Tagihan Lainnya (Rp ' + tung.tambahanTotal.toLocaleString('id-ID') + ')\n';
  pesan += '\n*Total Tagihan: Rp ' + tung.total.toLocaleString('id-ID') + '*\n\nMohon untuk menyelesaikan pembayaran sebelum tanggal 10.\n\nTerima kasih,\nBendahara RQ An-Nuur';
  if (confirm('Preview pesan WA:\n\n' + pesan + '\n\nKirim sekarang?')) {
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(pesan), '_blank');
  }
};

const penagihanBlast = document.getElementById('penagihan-blast');
if (penagihanBlast) {
  penagihanBlast.addEventListener('click', function() {
    const students = Array.from(new Set(records.filter(function(r) { return r.child_name && r.unit; }).map(function(r) { return r.child_name; })));
    const belum = students.filter(function(s) {
      const rec = records.find(function(r) { return r.child_name === s; });
      const u = rec ? rec.unit : '';
      return window.getTunggakan(s, u).total > 0 && appKontakWali[s];
    });
    if (belum.length === 0) return alert('Tidak ada santri yang perlu diingatkan.');
    if (!confirm('Akan membuka ' + belum.length + ' tab WhatsApp?')) return;
    belum.forEach(function(name, idx) {
      setTimeout(function() {
        const noHp = appKontakWali[name];
        const rec = records.find(function(r) { return r.child_name === name; });
        const u = rec ? rec.unit : '';
        const tung = window.getTunggakan(name, u);
        const phone = noHp.toString().trim().replace(/^0/, '62');
        let pesan = "Assalamu'alaikum Ayah/Bunda.\n\nMengingatkan bahwa terdapat tagihan untuk ananda *" + name.toUpperCase() + '*:\n';
        if (tung.sppTotal > 0) pesan += '- SPP: ' + tung.sppMissing.join(', ') + ' (Rp ' + tung.sppTotal.toLocaleString('id-ID') + ')\n';
        if (tung.tambahanTotal > 0) pesan += '- Lainnya (Rp ' + tung.tambahanTotal.toLocaleString('id-ID') + ')\n';
        pesan += '\n*Total: Rp ' + tung.total.toLocaleString('id-ID') + '*\n\nMohon diselesaikan sebelum tgl 10.\n\nTerima kasih,\nBendahara RQ An-Nuur';
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(pesan), '_blank');
      }, idx * 500);
    });
  });
}

const penagihanExport = document.getElementById('penagihan-export');
if (penagihanExport) {
  penagihanExport.addEventListener('click', function() {
    const students = Array.from(new Set(records.filter(function(r) { return r.child_name && r.unit; }).map(function(r) { return r.child_name; })));
    let csv = 'Nama,Unit,Kelas,SPP Tertunggak,Tagihan Lainnya,Grand Total,No WA\n';
    students.forEach(function(s) {
      const rec = records.find(function(r) { return r.child_name === s; });
      const u = rec ? rec.unit : '';
      const k = rec ? rec.kelas : '';
      const tung = window.getTunggakan(s, u);
      const wa = appKontakWali[s] || '';
      csv += '"' + s + '","' + u + '","' + k + '",' + tung.sppTotal + ',' + tung.tambahanTotal + ',' + tung.total + ',"' + wa + '"\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'penagihan_' + getLocalDateString() + '.csv';
    a.click();
    window.showToast('CSV terunduh! 📥', 'success');
  });
}

function readFileAsBase64(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const fotoFile = document.getElementById('foto-file');
if (fotoFile) {
  fotoFile.addEventListener('change', async function(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return alert('File >2MB. Kompres dulu.');
    const base64 = await readFileAsBase64(f);
    const prev = document.getElementById('foto-preview');
    prev.style.background = "url('data:image/jpeg;base64," + base64 + "') center/cover";
    prev.textContent = '';
    prev.dataset.base64 = base64;
  });
}

const btnUploadFoto = document.getElementById('btn-upload-foto');
if (btnUploadFoto) {
  btnUploadFoto.addEventListener('click', async function() {
    const child = document.getElementById('foto-child-select').value;
    const prev = document.getElementById('foto-preview');
    if (!child) return setStatus('foto-status', 'Pilih murid!', true);
    if (!prev.dataset.base64) return setStatus('foto-status', 'Pilih foto dulu!', true);
    setSaving(btnUploadFoto, true);
    setStatus('foto-status', 'Mengupload...');
    try {
      const res = await window.gas.uploadFoto({
        fileName: child + '_' + Date.now() + '.jpg',
        base64: prev.dataset.base64,
        folderName: 'FotoSantri',
        childName: child,
        jenis: 'foto'
      });
      setSaving(btnUploadFoto, false);
      if (res.sukses) {
        setStatus('foto-status', '');
        window.celebrate('Foto tersimpan! 📸');
        window.appSdk.init(handler, false);
      } else {
        setStatus('foto-status', 'Gagal: ' + (res.error || '?'), true);
      }
    } catch (err) {
      setSaving(btnUploadFoto, false);
      setStatus('foto-status', 'Gagal.', true);
    }
  });
}

const capFile = document.getElementById('cap-file');
if (capFile) {
  capFile.addEventListener('change', async function(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return alert('File >2MB.');
    const base64 = await readFileAsBase64(f);
    const prev = document.getElementById('cap-preview');
    prev.style.background = "url('data:image/jpeg;base64," + base64 + "') center/cover";
    prev.textContent = '';
    prev.dataset.base64 = base64;
  });
}

const btnUploadCap = document.getElementById('btn-upload-cap');
if (btnUploadCap) {
  btnUploadCap.addEventListener('click', async function() {
    const child = document.getElementById('cap-child-select').value;
    const caption = document.getElementById('cap-caption').value.trim();
    const prev = document.getElementById('cap-preview');
    if (!child || !prev.dataset.base64) return setStatus('cap-status', 'Pilih murid & foto!', true);
    setSaving(btnUploadCap, true);
    setStatus('cap-status', 'Mengupload...');
    try {
      const res = await window.gas.uploadFoto({
        fileName: 'pencapaian_' + child + '_' + Date.now() + '.jpg',
        base64: prev.dataset.base64,
        folderName: 'Pencapaian',
        childName: child,
        caption: caption,
        jenis: 'pencapaian'
      });
      setSaving(btnUploadCap, false);
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
      setSaving(btnUploadCap, false);
      setStatus('cap-status', 'Gagal.', true);
    }
  });
}

function renderPencapaianList() {
  const list = document.getElementById('cap-list');
  if (!list) return;
  const data = recordsPencapaian.slice().sort(function(a, b) { return new Date(b.tanggal) - new Date(a.tanggal); }).slice(0, 20);
  if (data.length === 0) {
    list.innerHTML = '<p class="text-[10px] italic text-center py-3" style="color:var(--text-muted)">Belum ada pencapaian</p>';
    return;
  }
  list.innerHTML = data.map(function(p) {
    return '<div class="flex items-center gap-2 border-b pb-2"><div style="width:40px;height:40px;background:url(\'' + p.url + '\') center/cover;border-radius:8px"></div><div class="flex-1 min-w-0"><p class="font-bold text-xs truncate">' + escapeHtml(p.child_name) + '</p><p class="text-[10px] truncate" style="color:var(--text-muted)">' + escapeHtml(p.keterangan || '') + '</p></div><button type="button" class="text-red-500 text-[10px] font-bold" onclick="delPencapaian(\'' + p.__backendId + '\')">✕</button></div>';
  }).join('');
}

window.delPencapaian = async function(id) {
  if (!confirm('Hapus pencapaian ini?')) return;
  const p = recordsPencapaian.find(function(x) { return x.__backendId === id; });
  if (p) {
    await window.appSdk.delete('Pencapaian', p);
    window.appSdk.init(handler, false);
  }
};

function renderHallOfFame() {
  const jilidNaik = recordsPencapaian.filter(function(p) { return p.keterangan && p.keterangan.toLowerCase().includes('jilid'); }).slice(0, 6);
  const njEl = document.getElementById('hall-naikjilid');
  if (njEl) {
    if (jilidNaik.length === 0) njEl.innerHTML = '<p class="text-[10px] italic text-center py-3" style="color:var(--text-muted)">Belum ada. Upload pencapaian naik jilid nanti.</p>';
    else njEl.innerHTML = jilidNaik.map(function(p) {
      return '<div class="bg-white rounded-xl p-2 text-center border"><div style="width:100%;aspect-ratio:1;background:url(\'' + p.url + '\') center/cover;border-radius:10px;margin-bottom:4px"></div><p class="text-[10px] font-bold truncate">' + escapeHtml(p.child_name) + '</p><p class="text-[9px] truncate" style="color:var(--text-muted)">' + escapeHtml(p.keterangan || '') + '</p></div>';
    }).join('');
  }
  const galeri = recordsPencapaian.slice(0, 9);
  const galEl = document.getElementById('hall-galeri');
  if (galEl) {
    if (galeri.length === 0) galEl.innerHTML = '<p class="text-[10px] italic text-center py-3 col-span-3" style="color:var(--text-muted)">Belum ada galeri</p>';
    else galEl.innerHTML = galeri.map(function(p) {
      return '<div style="aspect-ratio:1;background:url(\'' + p.url + '\') center/cover;border-radius:10px;border:2px solid #FFD166" title="' + escapeHtml(p.child_name) + ': ' + escapeHtml(p.keterangan || '') + '"></div>';
    }).join('');
  }
  const students = Array.from(new Set(records.filter(function(r) { return r.child_name; }).map(function(r) { return r.child_name; })));
  const streaks = students.map(function(s) {
    const hadirDates = new Set(records.filter(function(r) { return r.child_name === s && r.type === 'Absensi' && r.attendance_status === 'Hadir'; }).map(function(r) { return r.date.slice(0, 10); }));
    const sorted = Array.from(hadirDates).sort();
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
  }).filter(function(x) { return x.streak > 0; }).sort(function(a, b) { return b.streak - a.streak; }).slice(0, 5);
  const sEl = document.getElementById('hall-streak');
  if (sEl) {
    sEl.innerHTML = streaks.length ? streaks.map(function(s, i) {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐';
      const av = getChildAvatar(s.name);
      const style = av.url ? "background:url('" + av.url + "') center/cover" : 'background:' + av.color;
      return '<div class="flex items-center gap-3 bg-white p-2 rounded-xl mb-1 shadow-sm"><span class="text-xl">' + medal + '</span><div class="avatar" style="' + style + ';width:30px;height:30px;font-size:12px">' + (av.url ? '' : av.initial) + '</div><span class="font-bold text-sm flex-1">' + escapeHtml(s.name) + '</span><span class="text-xs font-extrabold text-[#267152] bg-green-100 px-2 py-1 rounded">' + s.streak + ' hari</span></div>';
    }).join('') : '<p class="text-xs italic text-center" style="color:var(--text-muted)">Belum ada data</p>';
  }
}

function updateLeaderboard() {
  const u = document.getElementById('lb-unit').value;
  const k = document.getElementById('lb-kelas').value;
  const ptMap = {}, hafMap = {}, jilMap = {}, tilMap = {};
  records.forEach(function(r) {
    if (!r.child_name || (u && r.unit !== u) || (k && r.kelas !== k)) return;
    const c = r.child_name;
    ptMap[c] = (ptMap[c] || 0) + (+r.points || 0);
    if (r.type === 'Setoran Hafalan' || r.type === 'Setoran Doa' || r.type === 'Setoran Hadits') hafMap[c] = (hafMap[c] || 0) + 1;
    if (r.jilid_number) {
      const jVal = (+r.jilid_number * 100) + (+r.page_from || 0);
      if (!jilMap[c] || jVal > jilMap[c].val) jilMap[c] = { val: jVal, text: 'Jilid ' + r.jilid_number + ' (Hal ' + r.page_from + ')' };
    }
    if (r.juz) {
      const jz = +r.juz || 0;
      const sNum = r.tilawah_surah ? parseInt(r.tilawah_surah.split('.')[0]) || 0 : 0;
      const ayt = +r.tilawah_ayat || 0;
      const tVal = (jz * 10000) + (sNum * 100) + ayt;
      if (!tilMap[c] || tVal > tilMap[c].val) tilMap[c] = { val: tVal, text: 'Juz ' + jz + ' - ' + ((r.tilawah_surah || '').split('.')[1] || '') + ' (Ay.' + ayt + ')' };
    }
  });
  const renderPodium = function(mapObj, containerId) {
    const sorted = Object.entries(mapObj).map(function(entry) {
      const name = entry[0];
      const v = entry[1];
      return { name: name, val: (v && v.val !== undefined) ? v.val : v, text: (v && v.text !== undefined) ? v.text : v + 'x / poin' };
    }).filter(function(x) { return x.val > 0; }).sort(function(a, b) { return b.val - a.val; }).slice(0, 3);
    const container = document.getElementById(containerId);
    if (sorted.length === 0) {
      container.innerHTML = '<div class="text-center py-5"><div class="text-4xl mb-1">🌱</div><p class="text-xs font-bold opacity-70">Belum ada data</p></div>';
      return;
    }
    const order = [];
    if (sorted[1]) order.push(Object.assign({}, sorted[1], { rank: 2 }));
    if (sorted[0]) order.push(Object.assign({}, sorted[0], { rank: 1 }));
    if (sorted[2]) order.push(Object.assign({}, sorted[2], { rank: 3 }));
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    container.innerHTML = '<div class="podium-wrap">' + order.map(function(p) {
      const av = getChildAvatar(p.name);
      const style = av.url ? "background:url('" + av.url + "') center/cover;color:white" : 'background:' + av.color + ';color:white';
      return '<div class="podium-step podium-' + p.rank + ' animate"><span class="podium-medal">' + medals[p.rank] + '</span><div class="podium-avatar" style="' + style + '">' + (av.url ? '' : av.initial) + '</div><div class="podium-name">' + escapeHtml(p.name) + '</div><div class="podium-value">' + p.text + '</div></div>';
    }).join('') + '</div>';
  };
  renderPodium(ptMap, 'lb-points');
  renderPodium(hafMap, 'lb-hafalan');
  renderPodium(jilMap, 'lb-jilid');
  renderPodium(tilMap, 'lb-tilawah');
}

function updateHistory(data) {
  let histData = data.filter(function(r) {
    return r.type && ['Setoran Jilid','Setoran Jilid & Tilawah','Setoran Hafalan','Setoran Doa','Setoran Hadits','Absensi Guru Mandiri','Absensi Guru Manual','Poin'].includes(r.type);
  }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  if (activeUser.role && activeUser.role.toLowerCase() === 'wali') {
    const children = (activeUser.nama_terkait || '').split(',').map(function(s) { return normalizeName(s); });
    histData = histData.filter(function(r) { return children.includes(r.child_name); });
  }
  const l = document.getElementById('history-list');
  l.innerHTML = '';
  if (histData.length === 0) {
    l.innerHTML = '<div class="text-center py-6 rounded-2xl" style="background:var(--card)"><div class="text-5xl mb-2">🌱</div><p class="text-sm font-bold" style="color:var(--text-muted)">Belum ada riwayat</p></div>';
    return;
  }
  const now = new Date();
  histData.slice(0, 10).forEach(function(r) {
    const i = document.getElementById('history-template').content.firstElementChild.cloneNode(true);
    const nameForAvatar = r.child_name || r.guru || '?';
    setAvatar(i.querySelector('.history-avatar'), nameForAvatar);
    i.querySelector('.history-name').textContent = nameForAvatar + ' · ' + r.type;
    let subTitle = '';
    if (r.type === 'Absensi Guru Mandiri') subTitle = r.status_geofence;
    else if (r.type === 'Absensi Guru Manual') subTitle = 'Manual: ' + r.attendance_status;
    else if (r.type === 'Setoran Jilid & Tilawah') subTitle = 'Jilid ' + r.jilid_number + ' + Juz ' + r.juz;
    else if (r.type === 'Setoran Doa' || r.type === 'Setoran Hadits') subTitle = r.subject;
    else subTitle = (r.points_rule_name || r.surah_number || 'Jilid ' + r.jilid_number);
    i.querySelector('.history-detail').textContent = subTitle;
    i.querySelector('.history-date').textContent = formatDate(r.date);
    const recordDate = new Date(r.date);
    const hDate = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
    const tDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((tDate - hDate) / (1000 * 60 * 60 * 24));
    if (activeUser.role && activeUser.role.toLowerCase() === 'wali') {
      i.querySelector('.action-buttons').innerHTML = '';
    } else if (diff <= 2) {
      i.querySelector('.action-buttons').innerHTML = '<button type="button" class="edit-btn text-blue-500"><i data-lucide="edit" width="16"></i></button><button type="button" class="delete-btn text-red-500"><i data-lucide="trash-2" width="16"></i></button>';
      i.querySelector('.edit-btn').onclick = function() {
        editingRecord = r;
        const targetId = r.type.includes('Setoran') ? 'open-mutabaah' : 'open-points';
        document.getElementById(targetId).click();
      };
      i.querySelector('.delete-btn').onclick = async function() {
        if (confirm('Hapus data ini?')) {
          await window.appSdk.delete('Data', r);
          window.showToast('Data dihapus', 'success');
          window.appSdk.init(handler, false);
        }
      };
    } else {
      i.querySelector('.action-buttons').innerHTML = '<span class="text-[9px] font-bold px-2 py-1 rounded-full" style="color:var(--text-muted);background:var(--bg)">🔒 Terkunci</span>';
    }
    l.appendChild(i);
  });
  lucide.createIcons();
}

function updateReportChildList() {
  if (activeUser.role && activeUser.role.toLowerCase() === 'wali') {
    const children = (activeUser.nama_terkait || '').split(',').map(function(s) { return normalizeName(s); });
    document.getElementById('report-child').innerHTML = children.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
    return;
  }
  const u = document.getElementById('report-unit').value;
  const k = document.getElementById('report-kelas').value;
  const ch = Array.from(new Set(records.filter(function(r) {
    return r.child_name && (u === '' || r.unit === u) && (k === '' || r.kelas === k);
  }).map(function(r) { return r.child_name; }))).sort();
  document.getElementById('report-child').innerHTML = '<option value="">Pilih murid...</option>' + ch.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
}

document.getElementById('generate-report-btn').addEventListener('click', function() {
  const c = document.getElementById('report-child').value;
  if (!c) return document.getElementById('report-output').classList.add('is-hidden');
  document.getElementById('report-output').classList.remove('is-hidden');
  const f = records.filter(function(r) { return r.child_name === c && r.type; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  document.getElementById('report-child-name').textContent = c;
  document.getElementById('rpt-total').textContent = f.filter(function(r) {
    return ['Setoran Jilid','Setoran Jilid & Tilawah','Setoran Hafalan','Setoran Buku','Setoran Doa','Setoran Hadits','Bimbel'].includes(r.type);
  }).length;
  const totalPoin = f.filter(function(r) { return r.type === 'Poin'; }).reduce(function(s, r) { return s + (+r.points || 0); }, 0);
  document.getElementById('rpt-points').textContent = totalPoin;
  const att = f.filter(function(r) { return r.type === 'Absensi' && r.attendance_type === 'murid'; });
  const hadirPersen = att.length ? Math.round((att.filter(function(r) { return r.attendance_status === 'Hadir'; }).length / att.length) * 100) : 0;
  document.getElementById('rpt-attendance').textContent = att.length ? hadirPersen + '%' : '—';
  const jRec = f.find(function(r) { return r.type && r.type.includes('Setoran Jilid'); });
  let labelJilid = '—';
  if (jRec) {
    if (jRec.type === 'Setoran Jilid & Tilawah') labelJilid = 'Jld ' + (jRec.jilid_number || '-') + ' & Jz ' + (jRec.juz || '-');
    else labelJilid = 'Jilid ' + jRec.jilid_number + ', Hal ' + jRec.page_from;
  }
  document.getElementById('rpt-jilid').innerText = labelJilid;
  const hRec = f.find(function(r) { return r.type === 'Setoran Hafalan'; });
  document.getElementById('rpt-hafalan').innerText = hRec ? hRec.surah_number + ' (Ay.' + hRec.ayat_count + ')' : '—';
  let stars = 3;
  if (totalPoin >= 100 && hadirPersen >= 90) stars = 5;
  else if (totalPoin >= 50 || hadirPersen >= 80) stars = 4;
  else if (totalPoin >= 20 || hadirPersen >= 60) stars = 3;
  else if (totalPoin >= 5) stars = 2;
  else stars = 1;
  document.getElementById('raport-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  const starLabels = ['', 'Ayo Semangat!', 'Terus Berusaha!', 'Bagus Sekali!', 'Hebat!', 'MasyaAllah, Luar Biasa!'];
  document.getElementById('raport-stars-label').textContent = starLabels[stars];
  const sD = document.getElementById('report-start') ? document.getElementById('report-start').value : '';
  const eD = document.getElementById('report-end') ? document.getElementById('report-end').value : '';
  const periodeEl = document.getElementById('raport-periode');
  if (periodeEl) periodeEl.textContent = sD && eD ? 'Periode: ' + formatDate(sD) + ' - ' + formatDate(eD) : 'Dicetak: ' + formatDate(new Date().toISOString());
  const rAv = document.getElementById('raport-avatar');
  if (rAv) {
    const av = getChildAvatar(c);
    if (av.url) {
      rAv.style.background = "url('" + av.url + "') center/cover";
      rAv.textContent = '';
    } else {
      rAv.style.background = 'linear-gradient(135deg,#FFD166,#FF6B6B)';
      rAv.textContent = av.initial;
    }
  }
  const bEl = document.getElementById('rpt-badges');
  if (bEl) {
    const bgs = getBadgesForChild(c).filter(function(b) { return b.earned; });
    bEl.innerHTML = bgs.length ? bgs.map(function(b) { return '<span class="raport-badge">' + b.icon + ' ' + b.label + '</span>'; }).join('') : '<span class="raport-badge empty">Belum ada badge</span>';
  }
  const cEl = document.getElementById('raport-catatan');
  const notes = {
    5: '"MasyaAllah, ananda luar biasa! Konsisten rajin, semangat tinggi, dan akhlaknya mulia. Pertahankan ya!"',
    4: '"Hebat! Ananda menunjukkan kemajuan yang baik. Sedikit lagi menuju sempurna, terus semangat!"',
    3: '"Bagus! Ananda sudah berusaha dengan baik. Yuk tingkatkan lagi supaya makin hebat!"',
    2: '"Ananda perlu lebih semangat lagi. Ayah/Bunda di rumah mohon bantu motivasi ya!"',
    1: '"Yuk semangat! Ananda pasti bisa kalau rajin. Mohon bimbingan lebih dari Ayah/Bunda di rumah."'
  };
  cEl.textContent = notes[stars] || notes[3];
  document.getElementById('report-table-body').innerHTML = f.map(function(r) {
    let d = '';
    if (r.type === 'Setoran Jilid') d = 'Jilid ' + r.jilid_number + ', Hal. ' + r.page_from;
    else if (r.type === 'Setoran Jilid & Tilawah') d = 'Jilid ' + (r.jilid_number || '-') + ' + Juz ' + (r.juz || '-') + ': ' + (r.tilawah_surah || '-');
    else if (r.type === 'Setoran Hafalan') d = r.surah_number + ', Ay.' + r.ayat_count;
    else if (r.type === 'Setoran Doa' || r.type === 'Setoran Hadits' || r.type === 'Bimbel') d = r.subject || '-';
    else if (r.type === 'Setoran Buku') d = 'Hal. ' + r.page_from;
    else if (r.type === 'Absensi') d = r.attendance_type + ': ' + r.attendance_status;
    else if (r.type === 'Poin') d = (+r.points > 0 ? '+' : '') + r.points;
    return '<tr><td>' + formatDate(r.date) + '</td><td>' + escapeHtml(r.type) + '</td><td>' + escapeHtml(d) + '</td><td>' + escapeHtml(r.status || '—') + '</td></tr>';
  }).join('');
});

document.getElementById('btn-print-raport').addEventListener('click', function() {
  const c = document.getElementById('report-child').value;
  if (!c) return alert('Pilih murid dulu!');
  window.print();
});

function updateManageListsAndDropdowns() {
  const u = document.getElementById('manage-unit').value;
  const k = document.getElementById('manage-kelas').value;
  if (!u || !k) {
    ['guru-list', 'murid-list'].forEach(function(id) {
      const e = document.getElementById(id);
      if (e) e.innerHTML = '<p class="text-xs">Pilih lembaga/kelas</p>';
    });
    return;
  }
  const f = records.filter(function(r) { return r.unit === u && r.kelas === k && (!r.type || r.type.trim() === ''); });
  const gMap = new Map();
  const mMap = new Map();
  f.filter(function(r) { return r.guru; }).forEach(function(r) {
    if (!gMap.has(r.guru)) gMap.set(r.guru, []);
    gMap.get(r.guru).push(r.__backendId);
  });
  f.filter(function(r) { return r.child_name; }).forEach(function(r) {
    if (!mMap.has(r.child_name)) mMap.set(r.child_name, []);
    mMap.get(r.child_name).push(r.__backendId);
  });
  document.getElementById('guru-list').innerHTML = gMap.size ? Array.from(gMap.keys()).sort().map(function(g) {
    return '<div class="flex justify-between items-center text-sm border-b py-1"><span>' + escapeHtml(g) + '</span><button type="button" class="text-red-500 font-bold" onclick="window.delManage(\'' + gMap.get(g).join(',') + '\',\'guru-status\')">Hapus</button></div>';
  }).join('') : '<p class="text-xs">Kosong</p>';
  document.getElementById('murid-list').innerHTML = mMap.size ? Array.from(mMap.keys()).sort().map(function(m) {
    const av = getChildAvatar(m);
    const style = av.url ? "background:url('" + av.url + "') center/cover" : 'background:' + av.color;
    return '<div class="flex justify-between items-center text-sm border-b py-1"><div class="flex items-center gap-2"><div class="avatar" style="' + style + ';width:24px;height:24px;font-size:11px">' + (av.url ? '' : av.initial) + '</div><span>' + escapeHtml(m) + '</span></div><button type="button" class="text-red-500 font-bold" onclick="window.delManage(\'' + mMap.get(m).join(',') + '\',\'murid-status\')">Hapus</button></div>';
  }).join('') : '<p class="text-xs">Kosong</p>';
}

window.delManage = async function(ids, sId) {
  setStatus(sId, 'Menghapus...');
  const idArr = ids.split(',');
  for (const id of idArr) {
    const t = records.find(function(x) { return x.__backendId === id || x.record_id === id; });
    if (t) await window.appSdk.delete('Data', t);
  }
  setStatus(sId, 'Dihapus');
  window.showToast('Data dihapus', 'success');
  window.appSdk.init(handler, false).then(function() { updateManageListsAndDropdowns(); });
};

document.getElementById('add-guru-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u = document.getElementById('manage-unit').value;
  const k = document.getElementById('manage-kelas').value;
  const n = normalizeName(document.getElementById('add-guru-input').value);
  if (!u || !k || !n) return;
  setSaving(e.target.querySelector('button'), true);
  await window.appSdk.create('Data', {
    child_name: '', unit: u, kelas: k, guru: n, type: '',
    jilid_number: '', page_from: '', surah_number: '', ayat_count: '', fluency_stars: 0,
    date: getWIBISOString(), status: '', juz: '', tilawah_surah: '', tilawah_ayat: '',
    attendance_type: '', attendance_status: '', subject: '',
    points: 0, points_note: '', points_rule_name: '', points_rule_active: true
  });
  setSaving(e.target.querySelector('button'), false);
  document.getElementById('add-guru-input').value = '';
  window.celebrate('Guru ditambahkan! 👨‍🏫');
  window.appSdk.init(handler, false);
});

document.getElementById('add-murid-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u = document.getElementById('manage-unit').value;
  const k = document.getElementById('manage-kelas').value;
  const n = normalizeName(document.getElementById('add-murid-input').value);
  if (!u || !k || !n) return;
  setSaving(e.target.querySelector('button'), true);
  await window.appSdk.create('Data', {
    child_name: n, unit: u, kelas: k, guru: '', type: '',
    jilid_number: '', page_from: '', surah_number: '', ayat_count: '', fluency_stars: 0,
    date: getWIBISOString(), status: '', juz: '', tilawah_surah: '', tilawah_ayat: '',
    attendance_type: '', attendance_status: '', subject: '',
    points: 0, points_note: '', points_rule_name: '', points_rule_active: true
  });
  setSaving(e.target.querySelector('button'), false);
  document.getElementById('add-murid-input').value = '';
  window.celebrate('Murid ditambahkan! 👦');
  window.appSdk.init(handler, false);
});

async function loadAuditKeuangan() {
  const list = document.getElementById('audit-list');
  list.innerHTML = '<div class="text-center py-4"><div class="spinner mx-auto" style="border-top-color:#0d5563"></div></div>';
  try {
    const res = await window.gas.getAuditKeuangan({ limit: 100 });
    if (!res.sukses) {
      list.innerHTML = '<p class="text-xs text-center text-red-500">Gagal memuat audit</p>';
      return;
    }
    if (res.data.length === 0) {
      list.innerHTML = '<p class="text-xs text-center py-4 italic" style="color:var(--text-muted)">Belum ada aktivitas</p>';
      return;
    }
    list.innerHTML = res.data.map(function(a) {
      const isUpdate = a.aksi === 'UPDATE';
      const isDelete = a.aksi === 'DELETE';
      const color = isDelete ? '#FF6B6B' : isUpdate ? '#FFD166' : '#06AED5';
      let detail = '';
      try {
        if (isDelete) {
          const old = JSON.parse(a.data_lama || '{}');
          detail = 'Hapus: ' + (old.kategori || '') + ' Rp ' + (parseInt(old.nominal) || 0).toLocaleString('id-ID') + ' - ' + (old.child_name || '');
        } else if (isUpdate) {
          const old = JSON.parse(a.data_lama || '{}');
          const nw = JSON.parse(a.data_baru || '{}');
          detail = 'Ubah: ' + (old.kategori || '') + ' Rp ' + (parseInt(old.nominal) || 0).toLocaleString('id-ID') + ' → Rp ' + (parseInt(nw.nominal) || 0).toLocaleString('id-ID');
        }
      } catch (e) {
        detail = a.aksi;
      }
      return '<div class="p-3 rounded-xl border" style="background:var(--card);border-color:var(--border)"><div class="flex justify-between items-start gap-2 mb-1"><span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style="background:' + color + '">' + a.aksi + '</span><span class="text-[9px] font-bold" style="color:var(--text-muted)">' + new Date(a.timestamp).toLocaleString('id-ID') + '</span></div><p class="text-xs font-bold">' + escapeHtml(detail) + '</p><p class="text-[10px] mt-1" style="color:var(--text-muted)">👤 ' + escapeHtml(a.user) + ' · 📄 ' + escapeHtml(a.sheet) + '</p></div>';
    }).join('');
  } catch (e) {
    list.innerHTML = '<p class="text-xs text-center text-red-500">Error: ' + e.message + '</p>';
  }
}

document.getElementById('btn-refresh-audit').addEventListener('click', loadAuditKeuangan);

/* ==========================================================
   ⚡ POIN CEPAT (FAB) v5.3
   ========================================================== */

const QP_PRESETS_DEFAULT = [
  { name: 'Baca Lancar', amount: 1 },
  { name: 'Setoran Baru', amount: 3 },
  { name: 'Naik Jilid', amount: 5 },
  { name: 'Adab Baik', amount: 2 },
  { name: 'Bantu Teman', amount: 2 },
  { name: 'Terlambat', amount: -1 },
  { name: 'Gaduh/Kribo', amount: -2 },
  { name: 'Tidak Bawa Buku', amount: -3 },
  { name: 'Tidak Fokus', amount: -2 },
  { name: 'Melanggar Aturan', amount: -5 }
];

function getQpPresets() {
  const rules = records.filter(function(r) { return r.type === 'Aturan Poin'; });
  if (rules.length === 0) return QP_PRESETS_DEFAULT;
  return rules.map(function(r) {
    return {
      name: r.points_rule_name || r.points_note || 'Tanpa Nama',
      amount: parseInt(r.points) || 0
    };
  }).filter(function(r) { return r.amount !== 0; }).sort(function(a, b) {
    if (a.amount > 0 && b.amount < 0) return -1;
    if (a.amount < 0 && b.amount > 0) return 1;
    if (a.amount > 0 && b.amount > 0) return b.amount - a.amount;
    return a.amount - b.amount;
  });
}

let qpActivePreset = null;
let qpSelectedMurid = new Set();
let qpRecentMurid = [];
try {
  qpRecentMurid = JSON.parse(localStorage.getItem('qp_recent') || '[]');
} catch (e) {
  qpRecentMurid = [];
}
let qpAllMurid = [];
let qpActiveTab = 'hadir';

function openQuickPoint() {
  if (!dataReady) return window.showToast('Memuat data...', 'info');
  qpAllMurid = Array.from(new Set(records.filter(function(r) { return r.child_name && r.unit; }).map(function(r) { return r.child_name; }))).sort();
  window.qpMuridMap = {};
  records.forEach(function(r) {
    if (r.child_name && r.unit && !qpMuridMap[r.child_name]) {
      qpMuridMap[r.child_name] = { unit: r.unit, kelas: r.kelas || '' };
    }
  });
  qpActivePreset = null;
  qpSelectedMurid = new Set();
  document.getElementById('qp-search').value = '';
  document.getElementById('qp-status').textContent = '';
  document.getElementById('qp-save-btn').disabled = true;
  document.getElementById('qp-custom-name').value = '';
  document.getElementById('qp-custom-amount').value = '';
  const hadirCount = getQpHadirList().length;
  qpActiveTab = hadirCount > 0 ? 'hadir' : 'semua';
  renderQpPresets();
  renderQpRecent();
  renderQpMuridList('');
  renderQpTabs();
  updateQpActiveInfo();
  updateQpSaveBtn();
  const m = document.getElementById('modal-quickpoint');
  m.classList.remove('is-hidden');
  m.style.display = 'flex';
}

function closeQuickPoint() {
  const m = document.getElementById('modal-quickpoint');
  m.classList.add('is-hidden');
  m.style.display = 'none';
}

function getQpHadirList() {
  const today = getLocalDateString();
  const hadirSet = new Set();
  records.forEach(function(r) {
    if (r.type === 'Absensi' && r.attendance_type === 'murid' && r.attendance_status === 'Hadir') {
      if (r.date && r.date.startsWith(today) && r.child_name) {
        hadirSet.add(r.child_name);
      }
    }
  });
  return Array.from(hadirSet).sort();
}

function switchQpTab(tab) {
  qpActiveTab = tab;
  renderQpTabs();
  const f = document.getElementById('qp-search').value;
  renderQpMuridList(f);
  if (window.vibrate) window.vibrate(15);
}

function renderQpTabs() {
  const hadirBtn = document.getElementById('qp-tab-hadir');
  const semuaBtn = document.getElementById('qp-tab-semua');
  const hadirList = getQpHadirList();
  document.getElementById('qp-hadir-count').textContent = hadirList.length;
  document.getElementById('qp-semua-count').textContent = qpAllMurid.length;
  const activeStyle = 'background:linear-gradient(135deg,#06d6a0,#0f7fa1);color:white;border-color:#06d6a0';
  const inactiveHadir = 'background:#E8FBF2;color:#087a61;border-color:#A8E0C0';
  const inactiveSemua = 'background:var(--bg);color:var(--text-muted);border-color:var(--border)';
  hadirBtn.style.cssText = qpActiveTab === 'hadir' ? activeStyle : inactiveHadir;
  semuaBtn.style.cssText = qpActiveTab === 'semua' ? activeStyle : inactiveSemua;
  const lbl = document.getElementById('qp-list-label');
  if (lbl) {
    lbl.textContent = qpActiveTab === 'hadir' ? '✅ Murid yang hadir hari ini (' + hadirList.length + '):' : '📋 Semua Murid (' + qpAllMurid.length + '):';
  }
}

function renderQpPresets() {
  const container = document.getElementById('qp-presets');
  const presets = getQpPresets();
  if (presets.length === 0) {
    container.innerHTML = '<p class="text-[10px] italic w-full text-center py-2" style="color:var(--text-muted)">Belum ada aturan. Tambah di menu "Beri Poin".</p>';
    return;
  }
  container.innerHTML = presets.map(function(p, i) {
    const isPos = p.amount > 0;
    const isActive = qpActivePreset && qpActivePreset.name === p.name && qpActivePreset.amount === p.amount;
    const bg = isActive ? (isPos ? 'linear-gradient(135deg,#06d6a0,#0f7fa1)' : 'linear-gradient(135deg,#FF6B6B,#c83252)') : (isPos ? '#E8FBF2' : '#FFF0F0');
    const color = isActive ? 'white' : (isPos ? '#087a61' : '#c83252');
    const border = isPos ? '#A8E0C0' : '#FFB0B0';
    return '<button type="button" class="qp-preset-btn px-2.5 py-1 rounded-full text-[11px] font-extrabold border-2" style="background:' + bg + ';color:' + color + ';border-color:' + border + '" onclick="selectQpPreset(' + i + ')">' + (p.amount > 0 ? '+' : '') + p.amount + ' ' + escapeHtml(p.name) + '</button>';
  }).join('');
}

function selectQpPreset(idx) {
  const presets = getQpPresets();
  const p = presets[idx];
  if (!p) return;
  qpActivePreset = { name: p.name, amount: p.amount };
  renderQpPresets();
  updateQpActiveInfo();
  updateQpSaveBtn();
  if (window.vibrate) window.vibrate([20, 10, 20]);
}

function applyCustomPoint() {
  const name = document.getElementById('qp-custom-name').value.trim();
  const amount = parseInt(document.getElementById('qp-custom-amount').value);
  if (!name || isNaN(amount)) return window.showToast('Isi nama & angka poin', 'error');
  if (amount === 0) return window.showToast('Angka tidak boleh 0', 'error');
  qpActivePreset = { name: name, amount: amount };
  renderQpPresets();
  updateQpActiveInfo();
  updateQpSaveBtn();
  window.showToast('Preset: ' + (amount > 0 ? '+' : '') + amount + ' ' + name, 'success', 1500);
}

function updateQpActiveInfo() {
  const el = document.getElementById('qp-active-info');
  const label = document.getElementById('qp-active-preset');
  if (qpActivePreset) {
    el.classList.remove('is-hidden');
    const sign = qpActivePreset.amount > 0 ? '+' : '';
    label.textContent = sign + qpActivePreset.amount + ' ' + qpActivePreset.name;
    label.style.color = qpActivePreset.amount > 0 ? '#087a61' : '#c83252';
  } else {
    el.classList.add('is-hidden');
  }
}

function renderQpRecent() {
  const wrap = document.getElementById('qp-recent-wrap');
  const container = document.getElementById('qp-recent');
  qpRecentMurid = qpRecentMurid.filter(function(n) { return qpAllMurid.includes(n); }).slice(0, 6);
  if (qpRecentMurid.length === 0) {
    wrap.classList.add('is-hidden');
    return;
  }
  wrap.classList.remove('is-hidden');
  container.innerHTML = qpRecentMurid.map(function(n) { return renderQpMuridBtn(n); }).join('');
}

function renderQpMuridList(filter) {
  const container = document.getElementById('qp-murid-list');
  const f = (filter || '').toLowerCase();
  const source = qpActiveTab === 'hadir' ? getQpHadirList() : qpAllMurid;
  if (qpActiveTab === 'hadir' && source.length === 0) {
    container.innerHTML = '<div class="col-span-2 text-center py-6"><div class="text-4xl mb-2">🤔</div><p class="text-xs font-bold" style="color:var(--text-muted)">Belum ada murid yang diabsensi hari ini</p><p class="text-[10px] mt-1" style="color:var(--text-muted)">Coba tab "Semua" atau absensi dulu</p></div>';
    return;
  }
  const list = f ? source.filter(function(n) { return n.toLowerCase().includes(f); }) : source;
  if (list.length === 0) {
    container.innerHTML = '<p class="text-xs italic text-center py-3 col-span-2" style="color:var(--text-muted)">Tidak ada murid</p>';
    return;
  }
  container.innerHTML = list.map(function(n) { return renderQpMuridBtn(n); }).join('');
}

function renderQpMuridBtn(name) {
  const isSelected = qpSelectedMurid.has(name);
  const av = getChildAvatar(name);
  const avStyle = av.url ? "background:url('" + av.url + "') center/cover" : 'background:' + av.color;
  const bg = isSelected ? 'linear-gradient(135deg,#FFD166,#FFB085)' : 'var(--bg)';
  const border = isSelected ? '#FFD166' : 'var(--border)';
  const safeName = escapeHtml(name);
  return '<button type="button" data-qpname="' + safeName + '" class="qp-murid-btn flex items-center gap-2 p-2 rounded-xl border-2 text-left" style="background:' + bg + ';border-color:' + border + '"><div class="avatar" style="' + avStyle + ';width:28px;height:28px;font-size:12px">' + (av.url ? '' : av.initial) + '</div><span class="text-xs font-bold flex-1 truncate">' + safeName + '</span>' + (isSelected ? '<span class="text-sm">✓</span>' : '') + '</button>';
}

function toggleQpMurid(name) {
  if (qpSelectedMurid.has(name)) qpSelectedMurid.delete(name);
  else qpSelectedMurid.add(name);
  renderQpRecent();
  const f = document.getElementById('qp-search').value;
  renderQpMuridList(f);
  updateQpSaveBtn();
  if (window.vibrate) window.vibrate(15);
}

function updateQpSaveBtn() {
  const btn = document.getElementById('qp-save-btn');
  const canSave = qpActivePreset && qpSelectedMurid.size > 0;
  btn.disabled = !canSave;
  btn.style.opacity = canSave ? '1' : '0.5';
  if (canSave) {
    const sign = qpActivePreset.amount > 0 ? '+' : '';
    btn.textContent = '💾 Simpan untuk ' + qpSelectedMurid.size + ' murid (' + sign + qpActivePreset.amount + ' ' + qpActivePreset.name + ')';
  } else if (!qpActivePreset) {
    btn.textContent = '1️⃣ Pilih preset poin dulu';
  } else {
    btn.textContent = '2️⃣ Pilih murid yang diberi poin';
  }
}

async function saveQuickPoint() {
  if (!qpActivePreset || qpSelectedMurid.size === 0) return;
  const btn = document.getElementById('qp-save-btn');
  const statusEl = document.getElementById('qp-status');
  btn.disabled = true;
  statusEl.textContent = 'Menyimpan...';
  statusEl.style.color = '#087a61';
  const muridArr = Array.from(qpSelectedMurid);
  let ok = 0, fail = 0;
  const presetSnapshot = qpActivePreset;
  for (const name of muridArr) {
    const info = window.qpMuridMap[name] || { unit: '', kelas: '' };
    const res = await window.appSdk.create('Data', {
      child_name: name,
      unit: info.unit,
      kelas: info.kelas,
      guru: normalizeName(activeUser.nama_terkait || activeUser.username),
      type: 'Poin',
      jilid_number: '', page_from: '', surah_number: '', ayat_count: '', fluency_stars: 0,
      date: getWIBISOString(),
      status: '', juz: '', tilawah_surah: '', tilawah_ayat: '',
      attendance_type: '', attendance_status: '', subject: '',
      points: presetSnapshot.amount,
      points_note: presetSnapshot.name,
      points_rule_name: presetSnapshot.name,
      points_rule_active: true
    });
    if (res.isOk) ok++;
    else fail++;
  }
  muridArr.forEach(function(n) {
    qpRecentMurid = [n].concat(qpRecentMurid.filter(function(x) { return x !== n; })).slice(0, 6);
  });
  localStorage.setItem('qp_recent', JSON.stringify(qpRecentMurid));
  statusEl.textContent = '✅ ' + ok + ' murid tersimpan' + (fail > 0 ? ' (' + fail + ' gagal)' : '');
  const sign = presetSnapshot.amount > 0 ? '+' : '';
  if (presetSnapshot.amount > 0) {
    window.celebrate(ok + ' murid dapat ' + sign + presetSnapshot.amount + ' poin! ⭐');
  } else {
    window.showToast(ok + ' murid: ' + sign + presetSnapshot.amount + ' ' + presetSnapshot.name, 'info', 2500);
    if (window.playSound) window.playSound('info');
    if (window.vibrate) window.vibrate([40, 30, 40]);
  }
  qpSelectedMurid.clear();
  qpActivePreset = null;
  setTimeout(function() {
    renderQpPresets();
    renderQpRecent();
    renderQpTabs();
    const f = document.getElementById('qp-search').value;
    renderQpMuridList(f);
    updateQpActiveInfo();
    updateQpSaveBtn();
    statusEl.textContent = '';
    btn.disabled = false;
  }, 500);
  window.appSdk.init(handler, false);
}

/* ---------- SURAH DROPDOWN SETUP ---------- */
const juzOptions = '<option value="">Semua Juz...</option>' + Array.from({ length: 30 }, function(_, i) { return i + 1; }).map(function(j) { return '<option value="' + j + '">Juz ' + j + '</option>'; }).join('');
document.getElementById('mutabaah-surah-juz').innerHTML = juzOptions;
document.getElementById('jilid-juz').innerHTML = juzOptions;
document.getElementById('mutabaah-jilid-number').innerHTML = '<option value="">Jilid...</option>' + [1,2,3,4,5,6].map(function(j) { return '<option value="' + j + '">Jilid ' + j + '</option>'; }).join('');
document.getElementById('mutabaah-page-from').innerHTML = '<option value="">Halaman...</option>' + Array.from({ length: 40 }, function(_, i) { return i + 1; }).map(function(p) { return '<option value="' + p + '">Hal. ' + p + '</option>'; }).join('');

function setupDynamicSurahDropdown(juzDropId, surahDropId, ayatDropId) {
  document.getElementById(juzDropId).addEventListener('change', function(e) {
    const j = parseInt(e.target.value);
    const sDrop = document.getElementById(surahDropId);
    const aDrop = document.getElementById(ayatDropId);
    aDrop.innerHTML = '<option value="">Pilih ayat...</option>';
    if (!j) {
      sDrop.innerHTML = '<option value="">Pilih Surat...</option>' + surahData.map(function(s) { return '<option value="' + s.name + '" data-s="1" data-e="' + s.verses + '">' + s.name + '</option>'; }).join('');
      return;
    }
    const bounds = juzMap[j];
    let html = '<option value="">Pilih Surat (Juz ' + j + ')...</option>';
    bounds.forEach(function(b) {
      const s = surahData[b.s];
      html += '<option value="' + s.name + '" data-s="' + b.b[0] + '" data-e="' + b.b[1] + '">' + s.name + ' (Ayat ' + b.b[0] + '-' + b.b[1] + ')</option>';
    });
    sDrop.innerHTML = html;
  });
  document.getElementById(surahDropId).addEventListener('change', function(e) {
    const opt = e.target.selectedOptions[0];
    const aDrop = document.getElementById(ayatDropId);
    if (!opt || !opt.value) {
      aDrop.innerHTML = '<option value="">Pilih ayat...</option>';
      return;
    }
    const st = parseInt(opt.getAttribute('data-s'));
    const en = parseInt(opt.getAttribute('data-e'));
    let h = '<option value="">Pilih ayat...</option>';
    for (let i = st; i <= en; i++) h += '<option value="' + i + '">' + i + '</option>';
    aDrop.innerHTML = h;
  });
  document.getElementById(surahDropId).innerHTML = '<option value="">Pilih Surat...</option>' + surahData.map(function(s) { return '<option value="' + s.name + '" data-s="1" data-e="' + s.verses + '">' + s.name + '</option>'; }).join('');
}
setupDynamicSurahDropdown('mutabaah-surah-juz', 'mutabaah-surah-number', 'mutabaah-ayat-count');
setupDynamicSurahDropdown('jilid-juz', 'jilid-tilawah-surah', 'jilid-tilawah-ayat');
document.getElementById('jilid-tilawah-toggle').addEventListener('change', function(e) {
  document.getElementById('tilawah-fields').classList.toggle('is-hidden', !e.target.checked);
});

/* ---------- KELAS & DROPDOWN BINDING ---------- */
const kelasOptions = { PAUDQU: ['A', 'B'], TPQ: ['A', 'B', 'C'], TKQ: ['A', 'B'], Bimbel: ['Calistung', 'B. Inggris', 'Matematika'] };

function updateKelasOptions(prefix) {
  const el = document.getElementById(prefix + '-unit');
  if (!el) return;
  const unit = el.value;
  const opts = unit ? kelasOptions[unit] || [] : [];
  const kEl = document.getElementById(prefix + '-kelas');
  if (kEl) kEl.innerHTML = opts.length ? opts.map(function(k) { return '<option value="' + k + '">' + k + '</option>'; }).join('') : '<option value="">Pilih kelas...</option>';
  if (!['manage','report','absen','points','lb','hall','keu','cek-keu','tarif','tagihan','foto','cap'].includes(prefix)) refreshNames(prefix);
  if (prefix === 'manage') updateManageListsAndDropdowns();
  if (prefix === 'report') updateReportChildList();
  if (prefix === 'absen') updateAbsenLists();
  if (prefix === 'points') updatePointsChildList();
  if (prefix === 'lb') updateLeaderboard();
  if (prefix === 'hall') renderHallOfFame();
  if (['keu','cek-keu','tarif','tagihan','foto','cap'].includes(prefix)) updateNameDropdown(prefix, 'child');
}

['mutabaah','bimbel','manage','report','absen','points','lb','hall','keu','cek-keu','tarif','tagihan','foto','cap'].forEach(function(p) {
  const uEl = document.getElementById(p + '-unit');
  if (uEl) uEl.addEventListener('change', function() { updateKelasOptions(p); });
  const kEl = document.getElementById(p + '-kelas');
  if (kEl) kEl.addEventListener('change', function() {
    if (!['manage','report','absen','points','lb','hall','keu','cek-keu','tarif','tagihan','foto','cap'].includes(p)) refreshNames(p);
    if (p === 'manage') updateManageListsAndDropdowns();
    if (p === 'report') updateReportChildList();
    if (p === 'absen') updateAbsenLists();
    if (p === 'points') updatePointsChildList();
    if (p === 'lb') updateLeaderboard();
    if (p === 'hall') renderHallOfFame();
    if (['keu','cek-keu','tarif','tagihan','foto','cap'].includes(p)) updateNameDropdown(p, 'child');
  });
});

function updateNameDropdown(prefix, type) {
  const uEl = document.getElementById(prefix + '-unit');
  const kEl = document.getElementById(prefix + '-kelas');
  if (!uEl || !kEl) return;
  const unit = uEl.value;
  const kelas = kEl.value;
  const select = document.getElementById(prefix + '-' + type + '-select');
  if (!select) return;
  const key = type === 'child' ? 'child_name' : 'guru';
  const values = Array.from(new Set(records.filter(function(r) {
    return r.unit === unit && r.kelas === kelas && r[key] && r[key].trim();
  }).map(function(r) { return r[key]; }))).sort(function(a, b) { return a.localeCompare(b, 'id'); });
  select.innerHTML = '<option value="">' + (unit && kelas ? 'Pilih nama...' : 'Pilih lembaga & kelas...') + '</option>' + values.map(function(v) { return '<option value="' + v + '">' + v + '</option>'; }).join('');
}

function refreshNames(prefix) {
  updateNameDropdown(prefix, 'guru');
  updateNameDropdown(prefix, 'child');
}

function nameValue(prefix, type) {
  const el = document.getElementById(prefix + '-' + type + '-select');
  return el ? el.value : '';
}