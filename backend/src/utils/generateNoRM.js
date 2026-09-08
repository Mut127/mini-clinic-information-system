const pool = require('../config/db');

const generateNoRM = async () => {
  const year = new Date().getFullYear();
  const prefix = `RM${year}`;

  const result = await pool.query(
    `SELECT no_rm FROM patients WHERE no_rm LIKE $1 ORDER BY no_rm DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNumber = 1;

  if (result.rows.length > 0) {
    const lastNoRM = result.rows[0].no_rm; // contoh: RM20260001
    const lastNumber = parseInt(lastNoRM.slice(prefix.length), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${prefix}${paddedNumber}`; // contoh: RM20260001
};

module.exports = generateNoRM;