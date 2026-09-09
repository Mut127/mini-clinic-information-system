import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchableSelect from '../components/SearchableSelect';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../services/doctorService';
import { getPolies } from '../services/poliService';

const emptyForm = { nama: '', poli_id: '' };

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [polies, setPolies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsData, poliesData] = await Promise.all([getDoctors(), getPolies()]);
      setDoctors(doctorsData);
      setPolies(poliesData);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data dokter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = doctors.filter((item) =>
  item.nama.toLowerCase().includes(search.toLowerCase())
);

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingId(d.id);
    setForm({ nama: d.nama, poli_id: d.poli_id ? String(d.poli_id) : '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSaving(true);
    try {
      if (editingId) {
        await updateDoctor(editingId, form);
        showToast('Dokter berhasil diubah');
      } else {
        await createDoctor(form);
        showToast('Dokter berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        showToast(err.response?.data?.message || 'Gagal menyimpan dokter', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor) => {
    try {
      await deleteDoctor(doctor.id);
      showToast('Dokter berhasil dihapus');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus dokter', 'error');
    }
  };

  const getInitials = (nama = '') =>
    nama.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Dokter</h2>
          <p className="text-sm text-slate-400 mt-0.5">Kelola data dokter dan penempatan poli</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-teal-200"
        >
          <Plus size={16} />
          Tambah Dokter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100">
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Cari nama dokter..."
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Nama Dokter</th>
              <th className="px-6 py-3 font-medium">Poli</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">Memuat data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                  <Stethoscope size={28} className="mx-auto mb-2 text-slate-300" />
                  Belum ada data dokter.
                </td>
              </tr>
            ) : (
              filteredData.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(d.nama)}
                      </div>
                      <span className="text-slate-700 font-medium">{d.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{d.nama_poli || '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(d)}
                        title="Ubah"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(d)}
                        title="Hapus"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Ubah Dokter' : 'Tambah Dokter'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Nama Dokter</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Dr. Andi Saputra"
              required
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            {formErrors.nama && <p className="text-red-500 text-xs mt-1">{formErrors.nama}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Poli</label>
            <SearchableSelect
              options={polies}
              value={form.poli_id}
              onChange={(val) => setForm({ ...form, poli_id: val })}
              placeholder="-- Pilih Poli --"
              getLabel={(p) => p.nama_poli}
              getValue={(p) => p.id}
            />
          </div>

          <button
            disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition mt-2"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Hapus Dokter?"
        message={`Data dokter "${confirmDelete?.nama}" akan dihapus secara permanen.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Doctors;