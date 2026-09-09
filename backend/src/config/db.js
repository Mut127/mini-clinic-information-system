const { Pool } = require('pg');
const types = require('pg').types;
require('dotenv').config();

// OID 1082 = tipe DATE di PostgreSQL
// Cegah pg mengonversi DATE ke objek JS Date (yang kena geser timezone).
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('Database connected');
});

module.exports = pool;