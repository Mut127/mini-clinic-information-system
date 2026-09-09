# Mini Clinic Information System

Aplikasi web sederhana untuk membantu administrasi klinik: mulai dari data pasien, pendaftaran kunjungan, antrean, hingga catatan pemeriksaan dokter. Sistem ini dibangun agar saling terhubung, sehingga petugas tidak perlu menginput data yang sama secara berulang di tempat berbeda.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js dengan Express
- **Database**: PostgreSQL
- **Auth**: JWT
- **Version Control**: Git

## Fitur

Fitur-fitur yang tersedia pada sistem ini:

- Login/logout menggunakan JWT Authentication, dengan 3 role: Admin, Dokter, dan Petugas Pendaftaran
- Master data pasien: CRUD, nomor rekam medis auto-generate, validasi NIK agar tidak duplikat, dilengkapi pencarian & pagination
- Pendaftaran kunjungan, terhubung ke data pasien, dokter, dan poli, sekaligus tracking status kunjungan
- Antrean otomatis (format A001, A002, dst.), dapat dipanggil dan diubah statusnya
- Pemeriksaan dokter menggunakan format SOAP, termasuk tindakan medis, resep, dan riwayat pemeriksaan tiap pasien
- Dashboard ringkas: total pasien, pasien hari ini, antrean, dan statistik lainnya

Selain itu, terdapat beberapa fitur tambahan di luar spesifikasi awal yang dinilai perlu untuk mendukung operasional sistem:

- **Kelola User**: admin dapat mengatur akun & role pengguna sistem
- **Kelola Dokter** & **Kelola Poli**: agar data dokter/poli tidak perlu di-hardcode
- **Profil Pengguna**: setiap user dapat mengubah nama, password, dan foto profil masing-masing

## Struktur Folder

```
mini_clinic_information_system/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # skema seluruh tabel
│   │   └── seed.sql            # opsional, seed utama tetap melalui script Node
│   ├── src/
│   │   ├── config/             # koneksi db
│   │   ├── controllers/
│   │   ├── middlewares/        # auth JWT, role guard, error handler, upload
│   │   ├── routes/
│   │   ├── utils/               # generate no. RM, JWT helper, format response, seed
│   │   ├── validators/
│   │   └── app.js
│   ├── uploads/                 # foto profil, auto-generate, tidak ikut di-commit
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Modal, Toast, ConfirmDialog, SearchableSelect, dst.
│   │   ├── context/              # AuthContext
│   │   ├── layouts/              # MainLayout (sidebar + topbar)
│   │   ├── pages/
│   │   ├── services/              # pemanggil API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── Mini_Clinic_API.postman_collection.json
├── Mini_Clinic_API.postman_environment.json
├── ERD.png
└── README.md
```

## Instalasi

Yang perlu disiapkan terlebih dahulu: Node.js LTS (v18+), PostgreSQL v14+, dan Git.

### 1. Clone Repository

```bash
git clone https://github.com/Mut127/mini-clinic-information-system.git
cd mini_clinic_information_system
```

### 2. Database

Buat database baru:

```sql
CREATE DATABASE mini_clinic;
```

Kemudian import skema database. Melalui terminal:

```bash
psql -U postgres -d mini_clinic -f backend/database/schema.sql
```

Atau bila lebih nyaman menggunakan pgAdmin, buka Query Tool pada database `mini_clinic`, load file `schema.sql`, lalu Execute.

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Isi file `.env`:
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

Jalankan seed terlebih dahulu (untuk membuat akun login default beserta data poli/dokter awal):
```bash
npm run seed
```

Kemudian jalankan server:
```bash
npm run dev
```
Secara default akan berjalan di `http://localhost:5000`.

### 4. Frontend

Buka terminal baru (biarkan backend tetap berjalan):

```bash
cd frontend
npm install
cp .env.example .env
```

Isi file `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Akses aplikasi melalui `http://localhost:5173`.

## Migrasi Database

Proyek ini tidak menggunakan tool migration seperti Prisma Migrate, melainkan file `.sql` biasa. Apabila terdapat perubahan skema di kemudian hari, perubahan dilakukan secara manual menggunakan `ALTER TABLE` dan langsung diperbarui pada `schema.sql`, sehingga file tersebut tetap menjadi acuan tunggal struktur database.

Data awal dijalankan melalui `npm run seed`, bukan `seed.sql` biasa, karena password perlu di-hash menggunakan bcrypt terlebih dahulu.

## Akun Default

Setelah `npm run seed` dijalankan:

| Role | Username | Password |
|---|---|---|
| Administrator | admin | password123 |
| Dokter | dokter1 | password123 |
| Dokter | dokter2 | password123 |
| Petugas Pendaftaran | petugas1 | password123 |

## File .env

File `.env` sengaja dipisah menjadi dua karena backend dan frontend merupakan proses yang berbeda dan berjalan secara terpisah:

- `backend/.env`: berisi kredensial database dan JWT secret, bersifat sensitif dan hanya digunakan di sisi server.
- `frontend/.env`: hanya berisi `VITE_API_URL`, karena environment variable pada Vite/React akan ikut terbundle ke dalam kode yang dikirim ke browser saat build.

Keduanya terdaftar pada `.gitignore`, sehingga saat melakukan clone project ini, pastikan untuk menyalin dari `.env.example` pada masing-masing folder terlebih dahulu.

File `.env.example` disediakan pada folder sebagai acuan variabel yang dibutuhkan. Konfigurasi database, JWT secret, dan hal sensitif lainnya tidak ditulis langsung pada source code maupun ikut ke repository, seluruhnya hanya dibaca dari `.env`.

## Keputusan & Penyederhanaan

Beberapa hal berikut sengaja disederhanakan mengingat lingkup pengerjaan:

1. Logout bersifat stateless: token JWT tidak diblacklist di server, sehingga logout hanya menghapus token dari localStorage di sisi client. Endpoint `POST /logout` tetap disediakan untuk mencatat aksi tersebut, bukan untuk menonaktifkan token secara paksa.

2. Nomor antrean di-generate otomatis saat pendaftaran (`A001`, `A002`, dst.), dihitung ulang setiap hari sesuai tanggal kunjungan. Tersedia juga `POST /queues` sebagai jalur manual, namun tidak diekspos pada UI karena alur normal sudah melalui modul Pendaftaran.

3. Status kunjungan otomatis berubah menjadi "Selesai" begitu dokter menyimpan data SOAP melalui `POST /medical-records`, sehingga tidak diperlukan update status secara manual.

4. Resep hanya dapat diinput bersamaan dengan pemeriksaan dokter (SOAP) melalui `POST /prescriptions`, tidak disediakan jalur input resep secara terpisah di luar sesi pemeriksaan. Pembatasan ini sengaja diterapkan untuk menghindari potensi penyalahgunaan obat.

5. Kunjungan yang sudah melewati tanggal atau berstatus "Selesai" tidak dapat diubah lagi melalui UI. Pembatasan ini diterapkan pada sisi frontend untuk menjaga konsistensi riwayat data.

6. Terkait role & hak akses:
   - Admin & Petugas: dapat mengelola data pasien dan pendaftaran
   - Hanya Admin: dapat menghapus pasien, mengelola user, dokter, dan poli
   - Hanya Dokter: dapat menginput SOAP dan resep
   - Seluruh role yang sudah login dapat melihat data pasien, pendaftaran, antrean, dan riwayat pemeriksaan

7. Perubahan password (baik melalui halaman Profil maupun saat admin membuat/mengubah akun) divalidasi dengan minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol.

8. Foto profil disimpan sebagai file pada `backend/uploads/avatars`, bukan di dalam database, kolom `avatar` hanya menyimpan path file tersebut. Folder ini tidak ikut dicommit.

## Endpoint API

Dokumentasi lengkap tersedia pada `Mini_Clinic_API.postman_collection.json`. Berikut endpoint minimum sesuai spesifikasi:

| Modul | Endpoint |
|---|---|
| Authentication | `POST /api/auth/login`, `POST /api/auth/logout` |
| Patient | `GET/POST /api/patients`, `GET/PUT/DELETE /api/patients/:id` |
| Registration | `GET/POST /api/registrations`, `PUT /api/registrations/:id` |
| Queue | `GET/POST /api/queues`, `PUT /api/queues/:id/call`, `PUT /api/queues/:id/status` |
| Medical Record | `POST /api/medical-records`, `GET /api/medical-records/:patientId` |
| Prescription | `POST /api/prescriptions`, `GET /api/prescriptions/:id` |
| Dashboard | `GET /api/dashboard` — statistik ringkasan |
| Master Data | `GET/POST/PUT/DELETE /api/master/doctors` — kelola dokter |
| Master Data | `GET/POST/PUT/DELETE /api/master/polies` — kelola poli |
| User Management | `GET/POST/PUT/DELETE /api/users` — kelola akun |
| Profile | `GET/PUT /api/profile`, `POST/DELETE /api/profile/avatar` — profil & foto |

## Format Response

Seluruh endpoint menggunakan format response yang konsisten.

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