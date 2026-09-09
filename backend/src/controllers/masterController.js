const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.nama, d.poli_id, pl.nama_poli 
       FROM doctors d 
       LEFT JOIN polies pl ON d.poli_id = pl.id
       ORDER BY d.nama ASC`
    );
    return success(res, result.rows, 'Data dokter berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data dokter', {}, 500);
  }
};

const getPolies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM polies ORDER BY nama_poli ASC');
    return success(res, result.rows, 'Data poli berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data poli', {}, 500);
  }
};

const createPoli = async (req, res) => {
  try {
    const { nama_poli } = req.body;
    if (!nama_poli || nama_poli.trim() === '') {
      return error(res, 'Validation Error', { nama_poli: 'Nama poli wajib diisi' }, 422);
    }

    const existing = await pool.query('SELECT id FROM polies WHERE nama_poli = $1', [nama_poli]);
    if (existing.rows.length > 0) {
      return error(res, 'Validation Error', { nama_poli: 'Nama poli sudah ada' }, 422);
    }

    const result = await pool.query(
      'INSERT INTO polies (nama_poli) VALUES ($1) RETURNING *',
      [nama_poli]
    );
    return success(res, result.rows[0], 'Poli berhasil ditambahkan', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menambahkan poli', {}, 500);
  }
};

const updatePoli = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_poli } = req.body;

    if (!nama_poli || nama_poli.trim() === '') {
      return error(res, 'Validation Error', { nama_poli: 'Nama poli wajib diisi' }, 422);
    }

    const existing = await pool.query(
      'SELECT id FROM polies WHERE nama_poli = $1 AND id != $2',
      [nama_poli, id]
    );
    if (existing.rows.length > 0) {
      return error(res, 'Validation Error', { nama_poli: 'Nama poli sudah ada' }, 422);
    }

    const result = await pool.query(
      'UPDATE polies SET nama_poli = $1 WHERE id = $2 RETURNING *',
      [nama_poli, id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Poli tidak ditemukan', {}, 404);
    }

    return success(res, result.rows[0], 'Poli berhasil diubah');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengubah poli', {}, 500);
  }
};

const deletePoli = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah poli ini masih dipakai dokter/pendaftaran, biar nggak bikin data nyangkut
    const doctorCheck = await pool.query('SELECT id FROM doctors WHERE poli_id = $1', [id]);
    if (doctorCheck.rows.length > 0) {
      return error(res, 'Poli tidak bisa dihapus karena masih digunakan oleh dokter', {}, 422);
    }

    const result = await pool.query('DELETE FROM polies WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return error(res, 'Poli tidak ditemukan', {}, 404);
    }

    return success(res, {}, 'Poli berhasil dihapus');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menghapus poli', {}, 500);
  }
};

module.exports = { getDoctors, getPolies, createPoli, updatePoli, deletePoli };
