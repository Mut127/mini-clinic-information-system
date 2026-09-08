import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  nik: '',
  nama: '',
  jenis_kelamin: 'L',
  tanggal_lahir: '',
  no_telepon: '',
  alamat: '',
};

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const canManage = user?.role === 'admin' || user?.role === 'petugas';
  const canDelete = user?.role === 'admin';

  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/patients', { params: { search, page, limit: 10 } });
      setPatients(res.data.data.patients);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(1);
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (patient) => {
    setForm({
      nik: patient.nik,
      nama: patient.nama,
      jenis_kelamin: patient.jenis_kelamin,
      tanggal_lahir: patient.tanggal_lahir?.split('T')[0] || '',
      no_telepon: patient.no_telepon || '',
      alamat: patient.alamat || '',
    });
    setSelectedPatient(patient);
    setIsEdit(true);
    setFormErrors({});
    setModalOpen(true);
  };

  const openDetailModal = (patient) => {
    setSelectedPatient(patient);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      if (isEdit) {
        await api.put(`/patients/${selectedPatient.id}`, form);
      } else {
        await api.post('/patients', form);
      }
      setModalOpen(false);
      fetchPatients(pagination.page);
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus data pasien ini?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Data Pasien</h1>
        {canManage && (
          <button
            onClick={openAddModal}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Tambah Pasien
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIK, atau no. RM..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Cari
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">No. RM</th>
                <th className="py-2 pr-4">Nama</th>
                <th className="py-2 pr-4">NIK</th>
                <th className="py-2 pr-4">JK</th>
                <th className="py-2 pr-4">No. Telepon</th>
                <th className="py-2 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">Memuat data...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">Belum ada data pasien</td></tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-teal-700">{p.no_rm}</td>
                    <td className="py-3 pr-4">{p.nama}</td>
                    <td className="py-3 pr-4">{p.nik}</td>
                    <td className="py-3 pr-4">{p.jenis_kelamin}</td>
                    <td className="py-3 pr-4">{p.no_telepon || '-'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openDetailModal(p)} className="text-blue-600 hover:underline text-xs">Detail</button>
                        {canManage && (
                          <button onClick={() => openEditModal(p)} className="text-amber-600 hover:underline text-xs">Ubah</button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>Total {pagination.total} data</span>
          <div className="flex gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchPatients(pagination.page - 1)}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-3 py-1">{pagination.page} / {pagination.totalPages || 1}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchPatients(pagination.page + 1)}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Ubah Data Pasien' : 'Tambah Pasien'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">NIK</label>
            <input
              type="text"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              maxLength={16}
            />
            {formErrors.nik && <p className="text-red-500 text-xs mt-1">{formErrors.nik}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nama Pasien</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            {formErrors.nama && <p className="text-red-500 text-xs mt-1">{formErrors.nama}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kelamin</label>
              <select
                value={form.jenis_kelamin}
                onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={form.tanggal_lahir}
                onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
              {formErrors.tanggal_lahir && <p className="text-red-500 text-xs mt-1">{formErrors.tanggal_lahir}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">No. Telepon</label>
            <input
              type="text"
              value={form.no_telepon}
              onChange={(e) => setForm({ ...form, no_telepon: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Alamat</label>
            <textarea
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2.5 rounded-lg mt-2"
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pasien'}
          </button>
        </form>
      </Modal>

      {/* Modal Detail */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail Pasien">
        {selectedPatient && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">No. RM</span><span className="font-medium">{selectedPatient.no_rm}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">NIK</span><span className="font-medium">{selectedPatient.nik}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Nama</span><span className="font-medium">{selectedPatient.nama}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Jenis Kelamin</span><span className="font-medium">{selectedPatient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tanggal Lahir</span><span className="font-medium">{selectedPatient.tanggal_lahir?.split('T')[0]}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">No. Telepon</span><span className="font-medium">{selectedPatient.no_telepon || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Alamat</span><span className="font-medium text-right max-w-[60%]">{selectedPatient.alamat || '-'}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;