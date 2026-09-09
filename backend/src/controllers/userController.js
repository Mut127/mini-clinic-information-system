const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, nama, role, created_at FROM users ORDER BY id ASC'
    );
    return success(res, result.rows, 'Berhasil mengambil data user');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data user', {}, 500);
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, nama, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'User tidak ditemukan', {}, 404);
    }

    return success(res, result.rows[0], 'Berhasil mengambil data user');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data user', {}, 500);
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { username, password, nama, role } = req.body;

    if (!username || !password || !nama || !role) {
      return error(res, 'Semua field wajib diisi', {}, 400);
    }

    const validRoles = ['admin', 'dokter', 'petugas'];
    if (!validRoles.includes(role)) {
      return error(res, 'Role tidak valid', {}, 400);
    }

    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return error(res, 'Username sudah digunakan', {}, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password, nama, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, nama, role, created_at`,
      [username, hashedPassword, nama, role]
    );

    return success(res, result.rows[0], 'User berhasil ditambahkan', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menambah user', {}, 500);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, nama, role } = req.body;

    if (!username || !nama || !role) {
      return error(res, 'Username, nama, dan role wajib diisi', {}, 400);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET username = $1, password = $2, nama = $3, role = $4 WHERE id = $5`,
        [username, hashedPassword, nama, role, id]
      );
    } else {
      await pool.query(
        `UPDATE users SET username = $1, nama = $2, role = $3 WHERE id = $4`,
        [username, nama, role, id]
      );
    }

    const result = await pool.query(
      'SELECT id, username, nama, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return error(res, 'User tidak ditemukan', {}, 404);
    }

    return success(res, result.rows[0], 'User berhasil diubah');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengubah user', {}, 500);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return error(res, 'User tidak ditemukan', {}, 404);
    }

    return success(res, {}, 'User berhasil dihapus');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menghapus user', {}, 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};