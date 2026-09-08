const validatePatient = (body, isUpdate = false) => {
  const errors = {};

  // NIK
  if (!isUpdate || body.nik !== undefined) {
    if (!body.nik) {
      errors.nik = 'NIK wajib diisi';
    } else if (!/^\d{16}$/.test(body.nik)) {
      errors.nik = 'NIK harus terdiri dari 16 digit angka';
    }
  }

  // Nama
  if (!isUpdate || body.nama !== undefined) {
    if (!body.nama || body.nama.trim() === '') {
      errors.nama = 'Nama pasien wajib diisi';
    }
  }

  // Jenis kelamin
  if (!isUpdate || body.jenis_kelamin !== undefined) {
    if (!body.jenis_kelamin || !['L', 'P'].includes(body.jenis_kelamin)) {
      errors.jenis_kelamin = 'Jenis kelamin harus L atau P';
    }
  }

  // Tanggal lahir
  if (!isUpdate || body.tanggal_lahir !== undefined) {
    if (!body.tanggal_lahir) {
      errors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    } else if (isNaN(Date.parse(body.tanggal_lahir))) {
      errors.tanggal_lahir = 'Format tanggal lahir tidak valid';
    }
  }

  return errors;
};

module.exports = validatePatient;