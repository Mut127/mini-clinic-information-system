const validatePatient = (body, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || body.nik !== undefined) {
    if (!body.nik) {
      errors.nik = 'NIK wajib diisi';
    } else if (!/^\d{16}$/.test(body.nik)) {
      errors.nik = 'NIK harus terdiri dari 16 digit angka';
    }
  }

  if (!body.nama || body.nama.trim() === '') {
    errors.nama = 'Nama pasien wajib diisi';
  }

  if (!body.jenis_kelamin || !['L', 'P'].includes(body.jenis_kelamin)) {
    errors.jenis_kelamin = 'Jenis kelamin harus L atau P';
  }

  if (!body.tanggal_lahir) {
    errors.tanggal_lahir = 'Tanggal lahir wajib diisi';
  } else if (isNaN(Date.parse(body.tanggal_lahir))) {
    errors.tanggal_lahir = 'Format tanggal lahir tidak valid';
  }

  return errors;
};

module.exports = validatePatient;