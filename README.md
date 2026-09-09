# Mini Clinic Information System

Aplikasi web untuk membantu proses administrasi dan pelayanan pasien di klinik pratama secara terintegrasi — mulai dari pengelolaan data pasien, pendaftaran kunjungan, pengelolaan antrean, hingga pencatatan hasil pemeriksaan dokter.

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | React.js (Vite) + Tailwind CSS |
| Backend | Node.js (Express.js) |
| Database | PostgreSQL (raw SQL, tanpa ORM) |
| Authentication | JSON Web Token (JWT) |
| State Management | React Context API |
| Version Control | Git |

## Fitur Utama

- **Authentication** — Login/logout dengan JWT, role-based authorization (Admin, Dokter, Petugas Pendaftaran)
- **Master Data Pasien** — CRUD lengkap, nomor rekam medis auto-generate, validasi NIK unik, pencarian, pagination
- **Pendaftaran Pasien** — Pendaftaran kunjungan dengan relasi pasien-dokter-poli, tracking status kunjungan
- **Antrean** — Nomor antrean auto-generate (format A001, A002, dst), panggil antrean, ubah status
- **Pemeriksaan Dokter (SOAP)** — Subjective, Objective, Assessment, Plan, tindakan medis, resep obat, riwayat pemeriksaan pasien
- **Dashboard** — Statistik total pasien, pasien hari ini, antrean hari ini, pasien menunggu, pasien selesai dilayani
- **Kelola User** *(tambahan)* — Admin dapat mengelola akun pengguna sistem beserta role-nya
- **Kelola Dokter** *(tambahan)* — Admin dapat mengelola data dokter beserta penempatan poli
- **Kelola Poli** *(tambahan)* — Admin dapat mengelola daftar poli klinik
- **Profil Pengguna** *(tambahan)* — Setiap pengguna dapat mengubah nama, password, dan foto profil sendiri

## Struktur Project

```
mini_clinic_information_system/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # skema seluruh tabel database
│   │   └── seed.sql            # data awal (opsional, seed utama lewat script Node.js)
│   ├── src/
│   │   ├── config/             # koneksi database
│   │   ├── controllers/        # logic tiap endpoint
│   │   ├── middlewares/        # autentikasi JWT, role guard, error handler, upload
│   │   ├── routes/             # definisi endpoint Express
│   │   ├── utils/              # helper (generate no. RM, JWT, response format, seed)
│   │   ├── validators/         # validasi input
│   │   └── app.js
│   ├── uploads/                 # folder penyimpanan foto profil (auto-generate, tidak di-commit)
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # komponen reusable (Modal, Toast, ConfirmDialog, SearchableSelect)
│   │   ├── context/             # AuthContext (state login & user)
│   │   ├── layouts/             # MainLayout (sidebar + topbar)
│   │   ├── pages/                # halaman tiap modul
│   │   ├── services/             # kumpulan fungsi pemanggil API backend
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── Mini_Clinic_API.postman_collection.json
├── Mini_Clinic_API.postman_environment.json
├── ERD.png
└── README.md
```

## Cara Instalasi

### Prasyarat

- Node.js (LTS, v18 ke atas)
- PostgreSQL (v14 ke atas)
- Git

### 1. Clone Repository

```bash
git clone <url-repository-anda>
cd mini_clinic_information_system
```

### 2. Setup Database

Buat database baru di PostgreSQL:

```sql
CREATE DATABASE mini_clinic;
```

Import skema tabel. Bisa lewat terminal:

```bash
psql -U postgres -d mini_clinic -f backend/database/schema.sql
```

Atau lewat pgAdmin: buka Query Tool pada database `mini_clinic`, buka file `backend/database/schema.sql`, lalu jalankan (Execute/F5).

### 3. Setup Backend

```bash
cd backend
npm install
```

Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya:

```bash
cp .env.example .env
```

Isi `.env`:
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=password_postgres_anda
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_clinic
JWT_SECRET=isi_dengan_string_acak_yang_panjang
JWT_EXPIRES_IN=1d
```

Jalankan seed data awal (membuat akun login default beserta data poli & dokter):

```bash
npm run seed
```

Jalankan server backend:

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`.

### 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
```

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Jalankan frontend:

```bash
npm run dev
```

Aplikasi dapat diakses di `http://localhost:5173`.

## Cara Menjalankan Aplikasi

1. Pastikan PostgreSQL sudah berjalan.
2. Jalankan backend: `cd backend && npm run dev` (port 5000).
3. Jalankan frontend: `cd frontend && npm run dev` (port 5173).
4. Buka `http://localhost:5173` di browser, login menggunakan salah satu akun pada tabel di bawah.

## Cara Migrasi Database

Project ini tidak menggunakan tool migration (seperti Prisma Migrate atau Sequelize Migrations), melainkan file SQL murni sebagai representasi skema database.

- **Instalasi baru**: jalankan `backend/database/schema.sql` untuk membuat seluruh tabel dari awal.
- **Perubahan skema**: jika terdapat perubahan struktur tabel di kemudian hari, perubahan dilakukan secara manual melalui `ALTER TABLE` dan didokumentasikan langsung di dalam file `schema.sql` agar tetap menjadi satu sumber kebenaran (source of truth) struktur database.
- **Data awal**: dijalankan melalui script `npm run seed` di folder backend, bukan file `seed.sql` statis, karena proses seeding memerlukan hashing password menggunakan bcrypt yang tidak dapat dilakukan lewat SQL murni.

## Akun Login Default

Setelah menjalankan `npm run seed`, akun berikut tersedia:

| Role | Username | Password |
|---|---|---|
| Administrator | admin | password123 |
| Dokter | dokter1 | password123 |
| Dokter | dokter2 | password123 |
| Petugas Pendaftaran | petugas1 | password123 |

## Konfigurasi File .env

Terdapat dua file `.env` terpisah karena backend dan frontend adalah dua aplikasi/proses yang berjalan independen:

**`backend/.env`** — berisi konfigurasi sensitif (kredensial database, JWT secret) yang hanya diakses di sisi server dan tidak boleh terekspos ke publik.

**`frontend/.env`** — hanya berisi alamat API backend (`VITE_API_URL`), karena variabel environment pada aplikasi React/Vite akan ikut ter-bundle ke kode yang dikirim ke browser saat build produksi.

Kedua file `.env` tidak disertakan dalam repository (masuk `.gitignore`). Gunakan `.env.example` di masing-masing folder sebagai acuan konfigurasi yang dibutuhkan.

## Asumsi dan Penyederhanaan Proses Bisnis

Beberapa keputusan desain berikut diambil untuk menyederhanakan proses bisnis dalam lingkup pengerjaan tes ini:

1. **Logout bersifat stateless** — JWT tidak disimpan di server (tanpa blacklist token), sehingga proses logout hanya menghapus token pada sisi client (localStorage). Endpoint `POST /logout` tersedia untuk mencatat aksi logout, namun tidak menonaktifkan token secara paksa di server.

2. **Nomor Rekam Medis** dibuat otomatis dengan format `RM{tahun}{4 digit urut}`, contoh: `RM20260001`. Penomoran direset setiap pergantian tahun.

3. **Nomor Antrean** dibuat otomatis saat proses pendaftaran (format `A001`, `A002`, dst), dihitung ulang per hari berdasarkan tanggal kunjungan. Endpoint `POST /queues` tersedia sebagai jalur manual/fallback, namun tidak diekspos di antarmuka karena alur normal sudah tercakup melalui modul Pendaftaran.

4. **Status kunjungan otomatis "Selesai"** setelah dokter menyimpan hasil pemeriksaan (SOAP) melalui `POST /medical-records`, tanpa perlu pembaruan status manual terpisah.

5. **Resep Obat** dapat diinput melalui dua jalur: (a) bersamaan dengan input pemeriksaan SOAP (alur normal), atau (b) melalui endpoint terpisah `POST /prescriptions` untuk kebutuhan resep susulan tanpa perlu mengubah data pemeriksaan yang sudah ada.

6. **Kunjungan yang telah lewat tanggal atau berstatus "Selesai"** tidak dapat diubah statusnya lagi melalui antarmuka (bersifat final/read-only), untuk menjaga konsistensi data riwayat. Pembatasan ini diterapkan pada sisi frontend.

7. **Role dan otorisasi endpoint**:
   - Admin & Petugas Pendaftaran: dapat mengelola data pasien dan pendaftaran.
   - Hanya Admin: dapat menghapus data pasien serta mengelola user, dokter, dan poli.
   - Hanya Dokter: dapat menginput hasil pemeriksaan (SOAP) dan resep.
   - Semua role yang sudah login dapat melihat data pasien, pendaftaran, antrean, dan riwayat pemeriksaan.

8. **Data Dokter dan Poli dikelola terpisah dari akun User login.** Tabel `doctors` menyimpan data dokter yang tampil pada dropdown pendaftaran/pemeriksaan beserta penempatan polinya, sementara tabel `users` mengatur akses login ke sistem. Kedua data dapat saling terhubung melalui kolom `user_id` yang bersifat opsional, namun pengelolaannya dilakukan melalui dua halaman terpisah (Kelola User dan Kelola Dokter) agar lebih fleksibel.

9. **Validasi kekuatan password** (minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol) diterapkan saat mengganti password melalui halaman Profil maupun saat admin membuat/mengubah akun user.

10. **Foto profil** disimpan sebagai file pada folder `backend/uploads/avatars` (bukan database) dengan referensi path yang disimpan di kolom `avatar` pada tabel `users`. Folder ini tidak disertakan dalam repository.

## Endpoint API

Dokumentasi lengkap tersedia dalam file `Mini_Clinic_API.postman_collection.json`. Endpoint minimum sesuai spesifikasi:

| Modul | Endpoint |
|---|---|
| Authentication | `POST /api/auth/login`, `POST /api/auth/logout` |
| Patient | `GET/POST /api/patients`, `GET/PUT/DELETE /api/patients/:id` |
| Registration | `GET/POST /api/registrations`, `PUT /api/registrations/:id` |
| Queue | `GET/POST /api/queues`, `PUT /api/queues/:id/call`, `PUT /api/queues/:id/status` |
| Medical Record | `POST /api/medical-records`, `GET /api/medical-records/:patientId` |
| Prescription | `POST /api/prescriptions`, `GET /api/prescriptions/:id` |

Endpoint tambahan di luar spesifikasi minimum:

| Modul | Endpoint | Keterangan |
|---|---|---|
| Dashboard | `GET /api/dashboard` | Statistik ringkasan |
| Master Data | `GET/POST/PUT/DELETE /api/master/doctors` | Kelola data dokter |
| Master Data | `GET/POST/PUT/DELETE /api/master/polies` | Kelola data poli |
| User Management | `GET/POST/PUT/DELETE /api/users` | Kelola akun pengguna |
| Profile | `GET/PUT /api/profile`, `POST/DELETE /api/profile/avatar` | Profil pengguna & foto profil |

## Format Response

Seluruh endpoint menggunakan format response yang konsisten:

**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": {}
}
```