const pool = require('../config/db');
const { success, error } = require('../utils/response');

// POST /medical-records
const createMedicalRecord = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      registration_id,
      patient_id,
      doctor_id,
      keluhan,
      tekanan_darah,
      suhu_tubuh,
      berat_badan,
      tinggi_badan,
      diagnosa,
      rencana_terapi,
      tindakan, 
      resep,    
    } = req.body;

    const errors = {};
    if (!registration_id) errors.registration_id = 'registration_id wajib diisi';
    if (!patient_id) errors.patient_id = 'patient_id wajib diisi';
    if (!diagnosa) errors.diagnosa = 'Diagnosa wajib diisi';

    if (Object.keys(errors).length > 0) {
      return error(res, 'Validation Error', errors, 422);
    }

    const regCheck = await pool.query('SELECT * FROM registrations WHERE id = $1', [registration_id]);
    if (regCheck.rows.length === 0) {
      return error(res, 'Validation Error', { registration_id: 'Data pendaftaran tidak ditemukan' }, 422);
    }

    await client.query('BEGIN');

    // Insert medical record (SOAP)
    const recordResult = await client.query(
      `INSERT INTO medical_records 
        (registration_id, patient_id, doctor_id, keluhan, tekanan_darah, suhu_tubuh, berat_badan, tinggi_badan, diagnosa, rencana_terapi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [registration_id, patient_id, doctor_id, keluhan, tekanan_darah, suhu_tubuh, berat_badan, tinggi_badan, diagnosa, rencana_terapi]
    );

    const medicalRecord = recordResult.rows[0];

    // Insert tindakan medis (kalau ada)
    let insertedActions = [];
    if (Array.isArray(tindakan) && tindakan.length > 0) {
      for (const item of tindakan) {
        const actionResult = await client.query(
          `INSERT INTO medical_actions (medical_record_id, nama_tindakan, keterangan)
           VALUES ($1, $2, $3) RETURNING *`,
          [medicalRecord.id, item.nama_tindakan, item.keterangan || null]
        );
        insertedActions.push(actionResult.rows[0]);
      }
    }

    // Insert resep obat (kalau ada)
    let insertedPrescriptions = [];
    if (Array.isArray(resep) && resep.length > 0) {
      for (const item of resep) {
        const prescResult = await client.query(
          `INSERT INTO prescriptions (medical_record_id, nama_obat, dosis, jumlah, aturan_pakai)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [medicalRecord.id, item.nama_obat, item.dosis || null, item.jumlah || null, item.aturan_pakai || null]
        );
        insertedPrescriptions.push(prescResult.rows[0]);
      }
    }

    // Update status registrasi jadi "selesai"
    await client.query(
      `UPDATE registrations SET status = 'selesai' WHERE id = $1`,
      [registration_id]
    );

    await client.query('COMMIT');

    return success(res, {
      medical_record: medicalRecord,
      tindakan: insertedActions,
      resep: insertedPrescriptions,
    }, 'Pemeriksaan berhasil disimpan', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return error(res, 'Gagal menyimpan pemeriksaan', {}, 500);
  } finally {
    client.release();
  }
};

// GET /medical-records/:patientId - riwayat pemeriksaan pasien
const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const recordsResult = await pool.query(
      `SELECT mr.*, d.nama AS nama_dokter
       FROM medical_records mr
       LEFT JOIN doctors d ON mr.doctor_id = d.id
       WHERE mr.patient_id = $1
       ORDER BY mr.created_at DESC`,
      [patientId]
    );

    const records = recordsResult.rows;

    // Ambil tindakan & resep untuk tiap medical record
    for (const record of records) {
      const actions = await pool.query(
        'SELECT * FROM medical_actions WHERE medical_record_id = $1',
        [record.id]
      );
      const prescriptions = await pool.query(
        'SELECT * FROM prescriptions WHERE medical_record_id = $1',
        [record.id]
      );
      record.tindakan = actions.rows;
      record.resep = prescriptions.rows;
    }

    return success(res, records, 'Riwayat pemeriksaan berhasil diambil');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil riwayat pemeriksaan', {}, 500);
  }
};

module.exports = { createMedicalRecord, getMedicalRecordsByPatient };