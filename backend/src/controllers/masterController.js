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

module.exports = { getDoctors, getPolies };