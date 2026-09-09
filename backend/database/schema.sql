CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'dokter', 'petugas')),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE polies (
    id SERIAL PRIMARY KEY,
    nama_poli VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    nama VARCHAR(100) NOT NULL,
    poli_id INT REFERENCES polies(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    no_rm VARCHAR(20) UNIQUE NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    jenis_kelamin VARCHAR(10) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    tanggal_lahir DATE NOT NULL,
    no_telepon VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    poli_id INT REFERENCES polies(id) ON DELETE SET NULL,
    tanggal_kunjungan DATE NOT NULL,
    jenis_pembayaran VARCHAR(50) NOT NULL,
    keluhan_awal TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'menunggu'
        CHECK (status IN ('menunggu', 'check_in', 'pemeriksaan', 'selesai')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE queues (
    id SERIAL PRIMARY KEY,
    registration_id INT REFERENCES registrations(id) ON DELETE CASCADE,
    nomor_antrean VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'menunggu'
        CHECK (status IN ('menunggu', 'dipanggil', 'selesai')),
    called_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    registration_id INT REFERENCES registrations(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    keluhan TEXT,
    tekanan_darah VARCHAR(20),
    suhu_tubuh VARCHAR(10),
    berat_badan VARCHAR(10),
    tinggi_badan VARCHAR(10),
    diagnosa TEXT,
    rencana_terapi TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medical_actions (
    id SERIAL PRIMARY KEY,
    medical_record_id INT REFERENCES medical_records(id) ON DELETE CASCADE,
    nama_tindakan VARCHAR(150) NOT NULL,
    keterangan TEXT
);

CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    medical_record_id INT REFERENCES medical_records(id) ON DELETE CASCADE,
    nama_obat VARCHAR(150) NOT NULL,
    dosis VARCHAR(50),
    jumlah VARCHAR(50),
    aturan_pakai TEXT
);