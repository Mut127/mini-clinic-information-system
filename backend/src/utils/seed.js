const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const seedUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      { username: 'admin', nama: 'Administrator', role: 'admin' },
      { username: 'dokter1', nama: 'Dr. Budi Santoso', role: 'dokter' },
      { username: 'dokter2', nama: 'Dr. Rina Wijaya', role: 'dokter' },
      { username: 'petugas1', nama: 'Siti Petugas', role: 'petugas' },
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (username, password, nama, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (username) DO NOTHING`,
        [user.username, hashedPassword, user.nama, user.role]
      );
      console.log(`User ${user.username} berhasil dibuat`);
    }

    // Seed Poli
    const polies = ['Poli Umum', 'Poli Gigi', 'Poli Anak'];
    for (const nama_poli of polies) {
      await pool.query(
        `INSERT INTO polies (nama_poli) VALUES ($1) ON CONFLICT DO NOTHING`,
        [nama_poli]
      );
    }
    console.log('Data poli berhasil dibuat');

    // Ambil user dokter yang baru dibuat buat dihubungkan ke tabel doctors
    const dokter1 = await pool.query(`SELECT id FROM users WHERE username = 'dokter1'`);
    const dokter2 = await pool.query(`SELECT id FROM users WHERE username = 'dokter2'`);
    const poliUmum = await pool.query(`SELECT id FROM polies WHERE nama_poli = 'Poli Umum'`);
    const poliGigi = await pool.query(`SELECT id FROM polies WHERE nama_poli = 'Poli Gigi'`);

    const doctors = [
      { user_id: dokter1.rows[0].id, nama: 'Dr. Budi Santoso', poli_id: poliUmum.rows[0].id },
      { user_id: dokter2.rows[0].id, nama: 'Dr. Rina Wijaya', poli_id: poliGigi.rows[0].id },
    ];

    for (const doctor of doctors) {
      const existing = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [doctor.user_id]);
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO doctors (user_id, nama, poli_id) VALUES ($1, $2, $3)`,
          [doctor.user_id, doctor.nama, doctor.poli_id]
        );
      }
    }
    console.log('Data dokter berhasil dibuat');

    console.log('Seeding selesai!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding gagal:', err);
    process.exit(1);
  }
};

seedUsers();