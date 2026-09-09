import { useEffect, useState } from 'react';
import { Plus, Pencil, Eye, EyeOff, Trash2, UserCog } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';

const roleLabels = {
  admin: 'Administrator',
  dokter: 'Dokter',
  petugas: 'Petugas Pendaftaran',
};

const roleBadgeStyle = {
  admin: 'bg-purple-50 text-purple-600',
  dokter: 'bg-teal-50 text-teal-600',
  petugas: 'bg-amber-50 text-amber-600',
};

const emptyForm = { username: '', nama: '', password: '', role: 'petugas' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null); 
  const [detailModalOpen, setDetailModalOpen] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [showPassword, setShowPassword] = useState(false);
const [search, setSearch] = useState('');

const passwordChecks = [
  { label: 'Minimal 8 karakter', valid: form.password.length >= 8 },
  { label: 'Mengandung huruf kapital (A-Z)', valid: /[A-Z]/.test(form.password) },
  { label: 'Mengandung huruf kecil (a-z)', valid: /[a-z]/.test(form.password) },
  { label: 'Mengandung angka (0-9)', valid: /[0-9]/.test(form.password) },
  { label: 'Mengandung simbol (!@#$%...)', valid: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password) },
];

const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchUsers = async () => {
  setLoading(true);
  try {
    const data = await getUsers();
    setUsers(data);
  } catch (err) {
    console.error(err);
    showToast('Gagal memuat data user', 'error');
  } finally {
    setLoading(false);
  }
};

const filteredData = users.filter((item) =>
  item.nama.toLowerCase().includes(search.toLowerCase()) ||
  item.username.toLowerCase().includes(search.toLowerCase())
);

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const openAddModal = () => {
  setEditingId(null);
  setForm(emptyForm);
  setShowPassword(false);
  setIsModalOpen(true);
};

  const openDetailModal = (u) => {
  setSelectedUser(u);
  setDetailModalOpen(true);
};

  const openEditModal = (u) => {
  setEditingId(u.id);
  setForm({ username: u.username, nama: u.nama, password: '', role: u.role });
  setShowPassword(false);
  setIsModalOpen(true);
};

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateUser(editingId, form);
        showToast('User berhasil diubah');
      } else {
        await createUser(form);
        showToast('User berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Gagal menyimpan user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    try {
      await deleteUser(user.id);
      showToast('User berhasil dihapus');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Gagal menghapus user', 'error');
    }
  };

  const getInitials = (nama = '') =>
    nama.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola User</h2>
          <p className="text-sm text-slate-400 mt-0.5">Kelola akun pengguna sistem</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-teal-200"
        >
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Cari nama atau username..."
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Nama</th>
              <th className="px-6 py-3 font-medium">Username</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  Memuat data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  <UserCog size={28} className="mx-auto mb-2 text-slate-300" />
                  Belum ada user.
                </td>
              </tr>
            ) : (
              filteredData.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(u.nama)}
                      </div>
                      <span className="text-slate-700 font-medium">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{u.username}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        roleBadgeStyle[u.role] || 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
  <div className="flex justify-end gap-1.5">
    <button
      onClick={() => openDetailModal(u)}
      title="Detail"
      className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
    >
      <Eye size={15} />
    </button>
    <button
      onClick={() => openEditModal(u)}
      title="Ubah"
      className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition"
    >
      <Pencil size={15} />
    </button>
    <button
      onClick={() => setConfirmDelete(u)}
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

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail User">
  {selectedUser && (
    <div>
      <div className="flex items-center gap-4 pb-5 mb-5 border-b border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {getInitials(selectedUser.nama)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-lg truncate">{selectedUser.nama}</p>
          <span
            className={`inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full ${
              roleBadgeStyle[selectedUser.role] || 'bg-slate-100 text-slate-500'
            }`}
          >
            {roleLabels[selectedUser.role] || selectedUser.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Username</p>
          <p className="text-sm font-medium text-slate-800">{selectedUser.username}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Role</p>
          <p className="text-sm font-medium text-slate-800">{roleLabels[selectedUser.role] || selectedUser.role}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-slate-400 mb-1">Dibuat pada</p>
          <p className="text-sm font-medium text-slate-800">
            {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
          </p>
        </div>
      </div>
    </div>
  )}
</Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit User' : 'Tambah User'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Nama</label>
            <input
              name="nama"
              value={form.nama}
              placeholder="Nama lengkap"
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Username</label>
            <input
              name="username"
              value={form.username}
              placeholder="Username"
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
  <div>
  <label className="text-xs font-medium text-slate-500 mb-1 block">Password</label>
  <div className="relative">
    <input
      name="password"
      value={form.password}
      type={showPassword ? 'text' : 'password'}
      placeholder={editingId ? 'Kosongkan jika tidak diubah' : 'Password'}
      onChange={handleChange}
      required={!editingId}
      className="w-full border border-slate-200 rounded-lg p-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>

  {form.password && (
    <div className="mt-2 bg-slate-50 rounded-lg p-3 space-y-1.5">
      {passwordChecks.map((check, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
              check.valid ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
            }`}
          >
            {check.valid ? '✓' : '·'}
          </span>
          <span className={check.valid ? 'text-green-700' : 'text-slate-500'}>{check.label}</span>
        </div>
      ))}
    </div>
  )}
</div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="petugas">Petugas Pendaftaran</option>
              <option value="dokter">Dokter</option>
              <option value="admin">Administrator</option>
            </select>
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
        title="Hapus User?"
        message={`User "${confirmDelete?.nama}" akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.`}
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

export default Users;