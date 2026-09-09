const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Pemetaan status antrean -> status registrasi, supaya dua tabel selalu konsisten
const queueToRegistrationStatus = {
  menunggu: 'menunggu',
  dipanggil: 'check_in',
  selesai: 'selesai',
};

const getQueues = async (req, res) => {
  try {
    const { tanggal, status } = req.query;
    const filterDate = tanggal || getLocalDateString();
    let query = `
      SELECT q.*, r.tanggal_kunjungan, r.status AS status_kunjungan,
             p.nama AS nama_pasien, p.no_rm,
             d.nama AS nama_dokter, pl.nama_poli
      FROM queues q
      JOIN registrations r ON q.registration_id = r.id
      JOIN patients p ON r.patient_id = p.id
      LEFT JOIN doctors d ON r.doctor_id = d.id
      LEFT JOIN polies pl ON r.poli_id = pl.id
      WHERE r.tanggal_kunjungan = $1
    `;
    const params = [filterDate];

    if (status) {
      params.push(status);
      query += ` AND q.status = $${params.length}`;
    }

    query += ' ORDER BY q.nomor_antrean ASC';

    const result = await pool.query(query, params);
    return success(res, result.rows, 'Data antrean berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data antrean', {}, 500);
  }
};

// POST /queues - buat antrean manual
const createQueue = async (req, res) => {
  try {
    const { registration_id } = req.body;

    if (!registration_id) {
      return error(res, 'Validation Error', { registration_id: 'registration_id wajib diisi' }, 422);
    }

    const regCheck = await pool.query('SELECT * FROM registrations WHERE id = $1', [registration_id]);
    if (regCheck.rows.length === 0) {
      return error(res, 'Data pendaftaran tidak ditemukan', {}, 404);
    }

    const existingQueue = await pool.query('SELECT id FROM queues WHERE registration_id = $1', [registration_id]);
    if (existingQueue.rows.length > 0) {
      return error(res, 'Validation Error', { registration_id: 'Antrean untuk pendaftaran ini sudah ada' }, 422);
    }

    const tanggal = regCheck.rows[0].tanggal_kunjungan;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM queues q 
       JOIN registrations r ON q.registration_id = r.id 
       WHERE r.tanggal_kunjungan = $1`,
      [tanggal]
    );

    const nextNumber = parseInt(countResult.rows[0].count, 10) + 1;
    const nomorAntrean = `A${String(nextNumber).padStart(3, '0')}`;

    const result = await pool.query(
      `INSERT INTO queues (registration_id, nomor_antrean, status) VALUES ($1, $2, 'menunggu') RETURNING *`,
      [registration_id, nomorAntrean]
    );

    return success(res, result.rows[0], 'Antrean berhasil dibuat', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal membuat antrean', {}, 500);
  }
};

// PUT /queues/:id/call - panggil antrean ini
const callQueue = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    const queueResult = await client.query(
      `UPDATE queues SET status = 'dipanggil', called_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (queueResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return error(res, 'Antrean tidak ditemukan', {}, 404);
    }

    const queue = queueResult.rows[0];

    // Sinkronkan status registrasi supaya konsisten dengan antrean
    await client.query(
      `UPDATE registrations SET status = $1 WHERE id = $2`,
      [queueToRegistrationStatus['dipanggil'], queue.registration_id]
    );

    await client.query('COMMIT');
    return success(res, queue, 'Antrean berhasil dipanggil');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return error(res, 'Gagal memanggil antrean', {}, 500);
  } finally {
    client.release();
  }
};

// PUT /queues/:id/status - ubah status antrean manual
const updateQueueStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['menunggu', 'dipanggil', 'selesai'];
    if (!status || !validStatuses.includes(status)) {
      return error(res, 'Validation Error', {
        status: `Status harus salah satu dari: ${validStatuses.join(', ')}`,
      }, 422);
    }

    await client.query('BEGIN');

    const queueResult = await client.query(
      `UPDATE queues SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (queueResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return error(res, 'Antrean tidak ditemukan', {}, 404);
    }

    const queue = queueResult.rows[0];

    // Sinkronkan status registrasi supaya konsisten dengan antrean
    await client.query(
      `UPDATE registrations SET status = $1 WHERE id = $2`,
      [queueToRegistrationStatus[status], queue.registration_id]
    );

    await client.query('COMMIT');
    return success(res, queue, 'Status antrean berhasil diubah');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return error(res, 'Gagal mengubah status antrean', {}, 500);
  } finally {
    client.release();
  }
};

module.exports = { getQueues, createQueue, callQueue, updateQueueStatus };