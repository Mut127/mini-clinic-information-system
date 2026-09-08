const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return error(res, 'Validation Error', {
      username: !username ? 'Username wajib diisi' : undefined,
      password: !password ? 'Password wajib diisi' : undefined,
    }, 422);
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return error(res, 'Username atau password salah', {}, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, 'Username atau password salah', {}, 401);
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    return success(res, {
      token,
      user: { id: user.id, username: user.username, nama: user.nama, role: user.role },
    }, 'Login berhasil');
  } catch (err) {
    return error(res, 'Terjadi kesalahan server', {}, 500);
  }
};

const logout = (req, res) => {
  // JWT stateless: logout cukup dihandle di sisi client (hapus token dari storage)
  return success(res, {}, 'Logout berhasil');
};

module.exports = { login, logout };