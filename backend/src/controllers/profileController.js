const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { success, error } = require('../utils/response');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, nama, role, avatar FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return error(res, 'User tidak ditemukan', {}, 404);
    }
    return success(res, result.rows[0], 'Profil berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil profil', {}, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nama, password, current_password } = req.body;
    const errors = {};

    if (!nama || nama.trim() === '') {
      errors.nama = 'Nama wajib diisi';
    }

    // Kalau mau ganti password, wajib konfirmasi password lama dulu
    if (password) {
  if (!current_password) {
    errors.current_password = 'Password saat ini wajib diisi untuk mengganti password';
  } else {
    const userCheck = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, userCheck.rows[0].password);
    if (!isMatch) {
      errors.current_password = 'Password saat ini salah';
    }
  }

  const passwordRules = [];
  if (password.length < 8) passwordRules.push('minimal 8 karakter');
  if (!/[A-Z]/.test(password)) passwordRules.push('1 huruf kapital');
  if (!/[a-z]/.test(password)) passwordRules.push('1 huruf kecil');
  if (!/[0-9]/.test(password)) passwordRules.push('1 angka');
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) passwordRules.push('1 simbol');

  if (passwordRules.length > 0) {
    errors.password = `Password harus mengandung: ${passwordRules.join(', ')}`;
  }
}

    if (Object.keys(errors).length > 0) {
      return error(res, 'Validation Error', errors, 422);
    }

    let query, params;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET nama = $1, password = $2 WHERE id = $3 RETURNING id, username, nama, role, avatar`;
      params = [nama, hashedPassword, req.user.id];
    } else {
      query = `UPDATE users SET nama = $1 WHERE id = $2 RETURNING id, username, nama, role, avatar`;
      params = [nama, req.user.id];
    }

    const result = await pool.query(query, params);
    return success(res, result.rows[0], 'Profil berhasil diperbarui');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal memperbarui profil', {}, 500);
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'File tidak ditemukan', {}, 422);
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const result = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, username, nama, role, avatar',
      [avatarPath, req.user.id]
    );

    return success(res, result.rows[0], 'Foto profil berhasil diperbarui');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengunggah foto profil', {}, 500);
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const userResult = await pool.query('SELECT avatar FROM users WHERE id = $1', [req.user.id]);
    const currentAvatar = userResult.rows[0]?.avatar;

    if (!currentAvatar) {
      return error(res, 'Tidak ada foto profil untuk dihapus', {}, 422);
    }

    // Hapus file fisik dari folder uploads
    const filePath = path.join(__dirname, '../..', currentAvatar);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const result = await pool.query(
      'UPDATE users SET avatar = NULL WHERE id = $1 RETURNING id, username, nama, role, avatar',
      [req.user.id]
    );

    return success(res, result.rows[0], 'Foto profil berhasil dihapus');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menghapus foto profil', {}, 500);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, deleteAvatar };