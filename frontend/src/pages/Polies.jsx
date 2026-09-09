import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { getPolies, createPoli, updatePoli, deletePoli } from '../services/poliService';

const Polies = () => {
  const [polies, setPolies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [namaPoli, setNamaPoli] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formError, setFormError] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchPolies = async () => {
    setLoading(true);
    try {
      const data = await getPolies();
      setPolies(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data poli', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolies();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setNamaPoli('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    setNamaPoli(p.nama_poli);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await updatePoli(editingId, { nama_poli: namaPoli });
        showToast('Poli berhasil diubah');
      } else {
        await createPoli({ nama_poli: namaPoli });
        showToast('Poli berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchPolies();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormError(err.response.data.errors?.nama_poli || 'Terjadi kesalahan');
      } else {
        showToast(err.response?.data?.message || 'Gagal menyimpan poli', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (poli) => {
    try {
      await deletePoli(poli.id);
      showToast('Poli berhasil dihapus');
      fetchPolies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus poli', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Poli</h2>
          <p className="text-sm text-slate-400 mt-0.5">Kelola daftar poli klinik</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-teal-200"
        >
          <Plus size={16} />
          Tambah Poli
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Nama Poli</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={2} className="px-6 py-10 text-center text-slate-400">Memuat data...</td></tr>
            ) : polies.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-slate-400">
                  <Building2 size={28} className="mx-auto mb-2 text-slate-300" />
                  Belum ada data poli.
                </td>
              </tr>
            ) : (
              polies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-3 font-medium text-slate-700">{p.nama_poli}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        title="Ubah"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p)}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Ubah Poli' : 'Tambah Poli'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Nama Poli</label>
            <input
              value={namaPoli}
              onChange={(e) => setNamaPoli(e.target.value)}
              placeholder="Contoh: Poli Mata"
              required
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
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
        title="Hapus Poli?"
        message={`Poli "${confirmDelete?.nama_poli}" akan dihapus secara permanen.`}
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

export default Polies;