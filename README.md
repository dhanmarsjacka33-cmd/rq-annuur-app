# rq-annuur-app
# 📖 Mutaba'ah RQ An-Nuur

Aplikasi web untuk pencatatan mutaba'ah santri, absensi guru, keuangan, dan penggajian RQ An-Nuur.

## 🌐 Arsitektur

- **Frontend**: GitHub Pages (static HTML/CSS/JS)
- **Backend**: Google Apps Script (Web App JSON API)
- **Database**: Google Sheets

## 📂 File

| File | Deskripsi |
|------|-----------|
| `index.html` | Struktur HTML + CSS |
| `app.js` | Semua logika aplikasi |
| `api.js` | Layer komunikasi ke Apps Script |
| `Code.gs` | Backend (upload ke Apps Script) |

## 🚀 Cara Deploy

### A. Backend (Sekali saja)

1. Buka https://script.google.com → project Anda
2. Replace isi `Code.gs` dengan file `Code.gs` di repo ini
3. **Deploy** → **Manage deployments** → **Edit** (ikon ✏️)
4. Version: **New version** → **Deploy**
5. Copy URL `/exec` dan pastikan sudah di-paste di `api.js` baris pertama

### B. Frontend

1. Push `index.html`, `app.js`, `api.js` ke repo ini
2. **Settings** → **Pages** → Source: `main` / `(root)` → **Save**
3. Tunggu 2 menit → akses `https://USERNAME.github.io/REPO_NAME/`

### C. Setiap Edit Backend

Setiap kali Anda edit `Code.gs` di editor Apps Script, **WAJIB redeploy**:
> Deploy → Manage deployments → Edit (✏️) → New version → Deploy

Tanpa ini, perubahan tidak akan terlihat.

## 👥 Akun Default

| Role | Username | Password |
|------|----------|----------|
| Guru | `guru` | `123456` |
| Wali | `wali` | `123456` |
| Bendahara | `bendahara` | `123456` |

⚠️ **Ganti password default segera setelah deploy pertama!**

## 🔧 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Gagal terhubung ke server" | Cek `GAS_URL` di `api.js`, pastikan deployment access = **Anyone** |
| Data tidak muncul | Cek console browser (F12) → Network → lihat request `/exec` |
| Perubahan backend tidak terlihat | Lupa redeploy → lakukan langkah C di atas |
| Sheet `RekapGaji` tidak ada | Backend akan auto-create saat pertama kali dipanggil |

## 📝 Catatan

- Semua waktu menggunakan WIB (UTC+7)
- Data >2 bulan otomatis di-filter untuk performa (kecuali bendahara/admin yang fetch all)
- Password masih plain-text di Sheet — untuk keamanan lebih tinggi, tambahkan hash SHA-256 di backend
