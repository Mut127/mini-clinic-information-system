const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total pasien keseluruhan
    const totalPatients = await pool.query('SELECT COUNT(*) FROM patients');

    // Total pasien yang daftar hari ini (registrasi baru hari ini)
    const totalPatientsToday = await pool.query(
      `SELECT COUNT(*) FROM registrations WHERE tanggal_kunjungan = $1`,
      [today]
    );

    // Total antrean hari ini
    const totalQueuesToday = await pool.query(
      `SELECT COUNT(*) FROM queues q
       JOIN registrations r ON q.registration_id = r.id
       WHERE r.tanggal_kunjungan = $1`,
      [today]
    );

    // Total pasien menunggu (status registrasi = menunggu, hari ini)
    const totalWaiting = await pool.query(
      `SELECT COUNT(*) FROM registrations 
       WHERE tanggal_kunjungan = $1 AND status = 'menunggu'`,
      [today]
    );

    // Total pasien selesai dilayani hari ini
    const totalDone = await pool.query(
      `SELECT COUNT(*) FROM registrations 
       WHERE tanggal_kunjungan = $1 AND status = 'selesai'`,
      [today]
    );

    return success(res, {
      total_pasien: parseInt(totalPatients.rows[0].count, 10),
      total_pasien_hari_ini: parseInt(totalPatientsToday.rows[0].count, 10),
      total_antrean_hari_ini: parseInt(totalQueuesToday.rows[0].count, 10),
      total_pasien_menunggu: parseInt(totalWaiting.rows[0].count, 10),
      total_pasien_selesai: parseInt(totalDone.rows[0].count, 10),
    }, 'Statistik dashboard berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil statistik dashboard', {}, 500);
  }
};

module.exports = { getDashboardStats };