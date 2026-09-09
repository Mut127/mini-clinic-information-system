const pool = require('../config/db');
const { success, error } = require('../utils/response');

// GET /registrations
const getRegistrations = async (req, res) => {
  try {
    const { status, tanggal } = req.query;

    let query = `
      SELECT r.*, p.nama AS nama_pasien, p.no_rm, d.nama AS nama_dokter, pl.nama_poli
      FROM registrations r
      JOIN patients p ON r.patient_id = p.id
      LEFT JOIN doctors d ON r.doctor_id = d.id
      LEFT JOIN polies pl ON r.poli_id = pl.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }

    if (tanggal) {
      params.push(tanggal);
      query += ` AND r.tanggal_kunjungan = $${params.length}`;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);
    return success(res, result.rows, 'Data pendaftaran berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data pendaftaran', {}, 500);
  }
};

// POST /registrations
const createRegistration = async (req, res) => {
  const client = await pool.connect();
  try {
    const { patient_id, doctor_id, poli_id, tanggal_kunjungan, jenis_pembayaran, keluhan_awal } = req.body;

    const errors = {};
if (!patient_id) errors.patient_id = 'Pasien wajib dipilih';
if (!poli_id) errors.poli_id = 'Poli wajib dipilih';
if (!doctor_id) errors.doctor_id = 'Dokter wajib dipilih';
if (!tanggal_kunjungan) errors.tanggal_kunjungan = 'Tanggal kunjungan wajib diisi';
if (!jenis_pembayaran) errors.jenis_pembayaran = 'Jenis pembayaran wajib diisi';
if (!keluhan_awal || !keluhan_awal.trim()) errors.keluhan_awal = 'Keluhan awal wajib diisi';

if (Object.keys(errors).length > 0) {
  return error(res, 'Validation Error', errors, 422);
}

    // Cek pasien ada
    const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientCheck.rows.length === 0) {
      return error(res, 'Validation Error', { patient_id: 'Pasien tidak ditemukan' }, 422);
    }

    await client.query('BEGIN');

    // Insert registration
   const regResult = await client.query(
  `INSERT INTO registrations (patient_id, doctor_id, poli_id, tanggal_kunjungan, jenis_pembayaran, keluhan_awal, status)
   VALUES ($1, $2, $3, $4, $5, $6, 'menunggu') RETURNING *`,
  [patient_id, doctor_id, poli_id, tanggal_kunjungan, jenis_pembayaran, keluhan_awal]
);

    const registration = regResult.rows[0];

    // Generate nomor antrean otomatis, format A001, A002, dst (reset per hari)
    const countResult = await client.query(
      `SELECT COUNT(*) FROM queues q 
       JOIN registrations r ON q.registration_id = r.id 
       WHERE r.tanggal_kunjungan = $1`,
      [tanggal_kunjungan]
    );

    const nextNumber = parseInt(countResult.rows[0].count, 10) + 1;
    const nomorAntrean = `A${String(nextNumber).padStart(3, '0')}`;

    const queueResult = await client.query(
      `INSERT INTO queues (registration_id, nomor_antrean, status)
       VALUES ($1, $2, 'menunggu') RETURNING *`,
      [registration.id, nomorAntrean]
    );

    await client.query('COMMIT');

    return success(res, {
      registration,
      queue: queueResult.rows[0],
    }, 'Pendaftaran berhasil, nomor antrean dibuat', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return error(res, 'Gagal melakukan pendaftaran', {}, 500);
  } finally {
    client.release();
  }
};

// PUT /registrations/:id - update status kunjungan
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['menunggu', 'check_in', 'pemeriksaan', 'selesai'];
    if (!status || !validStatuses.includes(status)) {
      return error(res, 'Validation Error', {
        status: `Status harus salah satu dari: ${validStatuses.join(', ')}`,
      }, 422);
    }

    const result = await pool.query(
      `UPDATE registrations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Data pendaftaran tidak ditemukan', {}, 404);
    }

    return success(res, result.rows[0], 'Status pendaftaran berhasil diubah');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengubah status pendaftaran', {}, 500);
  }
};

// PUT /registrations/:id/edit - edit detail pendaftaran (bukan ubah status)
const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id, doctor_id, poli_id, tanggal_kunjungan, jenis_pembayaran, keluhan_awal } = req.body;

    const existing = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return error(res, 'Data pendaftaran tidak ditemukan', {}, 404);
    }

    if (existing.rows[0].status !== 'menunggu') {
      return error(
        res,
        'Pendaftaran tidak bisa diubah karena sudah diproses (bukan status menunggu)',
        {},
        422
      );
    }

    // Validasi semua field wajib diisi, sama seperti createRegistration
    const errors = {};
    if (!patient_id) errors.patient_id = 'Pasien wajib dipilih';
    if (!poli_id) errors.poli_id = 'Poli wajib dipilih';
    if (!doctor_id) errors.doctor_id = 'Dokter wajib dipilih';
    if (!tanggal_kunjungan) errors.tanggal_kunjungan = 'Tanggal kunjungan wajib diisi';
    if (!jenis_pembayaran) errors.jenis_pembayaran = 'Jenis pembayaran wajib diisi';
    if (!keluhan_awal || !keluhan_awal.trim()) errors.keluhan_awal = 'Keluhan awal wajib diisi';

    if (Object.keys(errors).length > 0) {
      return error(res, 'Validation Error', errors, 422);
    }

    // Cek pasien ada
    const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientCheck.rows.length === 0) {
      return error(res, 'Validation Error', { patient_id: 'Pasien tidak ditemukan' }, 422);
    }

    const result = await pool.query(
  `UPDATE registrations SET
    patient_id = $1,
    doctor_id = $2,
    poli_id = $3,
    tanggal_kunjungan = $4,
    jenis_pembayaran = $5,
    keluhan_awal = $6
   WHERE id = $7 RETURNING *`,
  [patient_id, doctor_id, poli_id, tanggal_kunjungan, jenis_pembayaran, keluhan_awal, id]
);

    return success(res, result.rows[0], 'Data pendaftaran berhasil diubah');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengubah data pendaftaran', {}, 500);
  }
};

// DELETE /registrations/:id
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return error(res, 'Data pendaftaran tidak ditemukan', {}, 404);
    }

    if (existing.rows[0].status !== 'menunggu') {
      return error(
        res,
        'Pendaftaran tidak bisa dihapus karena sudah diproses (bukan status menunggu)',
        {},
        422
      );
    }

    // Cek apakah sudah punya antrean yang sudah diproses (dipanggil/selesai)
    const queueCheck = await pool.query(
      `SELECT id FROM queues WHERE registration_id = $1 AND status != 'menunggu'`,
      [id]
    );
    if (queueCheck.rows.length > 0) {
      return error(
        res,
        'Pendaftaran tidak bisa dihapus karena antreannya sudah diproses',
        {},
        422
      );
    }

    // Hapus antrean terkait dulu (kalau masih status menunggu), baru hapus registrasi
    await pool.query('DELETE FROM queues WHERE registration_id = $1', [id]);
    await pool.query('DELETE FROM registrations WHERE id = $1', [id]);

    return success(res, {}, 'Pendaftaran berhasil dihapus');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menghapus pendaftaran', {}, 500);
  }
};

module.exports = {
  getRegistrations,
  createRegistration,
  updateRegistrationStatus,
  updateRegistration,
  deleteRegistration,
};