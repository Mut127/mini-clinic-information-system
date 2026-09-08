const pool = require('../config/db');
const { success, error } = require('../utils/response');

// POST /prescriptions - tambah resep obat terpisah (misal ada tambahan resep susulan)
const createPrescription = async (req, res) => {
  try {
    const { medical_record_id, nama_obat, dosis, jumlah, aturan_pakai } = req.body;

    const errors = {};
    if (!medical_record_id) errors.medical_record_id = 'medical_record_id wajib diisi';
    if (!nama_obat) errors.nama_obat = 'Nama obat wajib diisi';

    if (Object.keys(errors).length > 0) {
      return error(res, 'Validation Error', errors, 422);
    }

    const recordCheck = await pool.query('SELECT id FROM medical_records WHERE id = $1', [medical_record_id]);
    if (recordCheck.rows.length === 0) {
      return error(res, 'Validation Error', { medical_record_id: 'Data pemeriksaan tidak ditemukan' }, 422);
    }

    const result = await pool.query(
      `INSERT INTO prescriptions (medical_record_id, nama_obat, dosis, jumlah, aturan_pakai)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [medical_record_id, nama_obat, dosis || null, jumlah || null, aturan_pakai || null]
    );

    return success(res, result.rows[0], 'Resep obat berhasil ditambahkan', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menambahkan resep obat', {}, 500);
  }
};

// GET /prescriptions/:id - detail satu resep
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM prescriptions WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return error(res, 'Resep tidak ditemukan', {}, 404);
    }

    return success(res, result.rows[0], 'Detail resep berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil detail resep', {}, 500);
  }
};

module.exports = { createPrescription, getPrescriptionById };