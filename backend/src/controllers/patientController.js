const pool = require('../config/db');
const generateNoRM = require('../utils/generateNoRM');
const validatePatient = require('../validators/patientValidator');
const { success, error } = require('../utils/response');

// GET /patients - dengan search & pagination
const getPatients = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const searchQuery = `%${search}%`;

    const dataResult = await pool.query(
      `SELECT * FROM patients 
       WHERE nama ILIKE $1 OR nik ILIKE $1 OR no_rm ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchQuery, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM patients WHERE nama ILIKE $1 OR nik ILIKE $1 OR no_rm ILIKE $1`,
      [searchQuery]
    );

    const totalData = parseInt(countResult.rows[0].count, 10);

    return success(res, {
      patients: dataResult.rows,
      pagination: {
        total: totalData,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalData / limit),
      },
    }, 'Data pasien berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data pasien', {}, 500);
  }
};

// GET /patients/:id
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return error(res, 'Pasien tidak ditemukan', {}, 404);
    }

    return success(res, result.rows[0], 'Detail pasien berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil detail pasien', {}, 500);
  }
};

// POST /patients
const createPatient = async (req, res) => {
  try {
    const errors = validatePatient(req.body);
    if (Object.keys(errors).length > 0) {
      return error(res, 'Validation Error', errors, 422);
    }

    const { nik, nama, jenis_kelamin, tanggal_lahir, no_telepon, alamat } = req.body;

    // Cek NIK duplikat
    const existing = await pool.query('SELECT id FROM patients WHERE nik = $1', [nik]);
    if (existing.rows.length > 0) {
      return error(res, 'Validation Error', { nik: 'NIK sudah terdaftar' }, 422);
    }

    const no_rm = await generateNoRM();

    const result = await pool.query(
      `INSERT INTO patients (no_rm, nik, nama, jenis_kelamin, tanggal_lahir, no_telepon, alamat)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [no_rm, nik, nama, jenis_kelamin, tanggal_lahir, no_telepon, alamat]
    );

    return success(res, result.rows[0], 'Pasien berhasil ditambahkan', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menambahkan pasien', {}, 500);
  }
};

// PUT /patients/:id
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validatePatient(req.body, true);
    if (Object.keys(errors).length > 0) {
      return error(res, 'Validation Error', errors, 422);
    }

    const existingPatient = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (existingPatient.rows.length === 0) {
      return error(res, 'Pasien tidak ditemukan', {}, 404);
    }

    const { nik, nama, jenis_kelamin, tanggal_lahir, no_telepon, alamat } = req.body;

    // Cek NIK duplikat (kecuali punya sendiri)
    if (nik) {
      const duplicateNik = await pool.query(
        'SELECT id FROM patients WHERE nik = $1 AND id != $2',
        [nik, id]
      );
      if (duplicateNik.rows.length > 0) {
        return error(res, 'Validation Error', { nik: 'NIK sudah terdaftar' }, 422);
      }
    }

    const result = await pool.query(
      `UPDATE patients SET 
        nik = COALESCE($1, nik),
        nama = COALESCE($2, nama),
        jenis_kelamin = COALESCE($3, jenis_kelamin),
        tanggal_lahir = COALESCE($4, tanggal_lahir),
        no_telepon = COALESCE($5, no_telepon),
        alamat = COALESCE($6, alamat),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [nik, nama, jenis_kelamin, tanggal_lahir, no_telepon, alamat, id]
    );

    return success(res, result.rows[0], 'Data pasien berhasil diubah');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengubah data pasien', {}, 500);
  }
};

// DELETE /patients/:id
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPatient = await pool.query('SELECT id FROM patients WHERE id = $1', [id]);
    if (existingPatient.rows.length === 0) {
      return error(res, 'Pasien tidak ditemukan', {}, 404);
    }

    // Cegah hapus pasien yang sudah punya riwayat pendaftaran/kunjungan
    const registrationCheck = await pool.query(
      'SELECT id FROM registrations WHERE patient_id = $1 LIMIT 1',
      [id]
    );
    if (registrationCheck.rows.length > 0) {
      return error(
        res,
        'Pasien tidak bisa dihapus karena sudah memiliki riwayat pendaftaran/kunjungan',
        {},
        422
      );
    }

    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);

    return success(res, {}, 'Pasien berhasil dihapus');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menghapus pasien', {}, 500);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};