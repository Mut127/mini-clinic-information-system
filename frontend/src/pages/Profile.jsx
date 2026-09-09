import { useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, Loader2, Trash2, Eye, EyeOff } from 'lucide-react';

const roleLabels = {
  admin: 'Administrator',
  dokter: 'Dokter',
  petugas: 'Petugas Pendaftaran',
};

const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const fileInputRef = useRef(null);

  const [nama, setNama] = useState(user?.nama || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
const [deletingAvatar, setDeletingAvatar] = useState(false);
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);

const handleDeleteAvatar = async () => {
  if (!confirm('Yakin ingin menghapus foto profil?')) return;
  setDeletingAvatar(true);
  try {
    const res = await api.delete('/profile/avatar');
    updateUserData(res.data.data);
    setSuccessMsg('Foto profil berhasil dihapus');
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus foto');
  } finally {
    setDeletingAvatar(false);
  }
};

const passwordChecks = [
  { label: 'Minimal 8 karakter', valid: newPassword.length >= 8 },
  { label: 'Mengandung huruf kapital (A-Z)', valid: /[A-Z]/.test(newPassword) },
  { label: 'Mengandung huruf kecil (a-z)', valid: /[a-z]/.test(newPassword) },
  { label: 'Mengandung angka (0-9)', valid: /[0-9]/.test(newPassword) },
  { label: 'Mengandung simbol (!@#$%...)', valid: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(newPassword) },
];

  const avatarUrl = user?.avatar ? `${API_BASE}${user.avatar}` : null;
  const initials = user?.nama?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUserData(res.data.data);
      setSuccessMsg('Foto profil berhasil diperbarui!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah foto');
    } finally {
      setUploadingAvatar(false);
    }
  };
  
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setSuccessMsg('');

  // Validasi password di sisi frontend dulu sebelum kirim ke server
  if (newPassword) {
    const allValid = passwordChecks.every((c) => c.valid);
    if (!allValid) {
      setErrors({ password: 'Password belum memenuhi semua syarat di atas' });
      return;
    }
  }

    setSaving(true);

    try {
      const payload = { nama };
      if (newPassword) {
        payload.password = newPassword;
        payload.current_password = currentPassword;
      }
      const res = await api.put('/profile', payload);
      updateUserData(res.data.data);
      setSuccessMsg('Profil berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-5">
        <div className="relative">
            <button
            type="button"
            onClick={handleAvatarClick}
            className="w-20 h-20 rounded-2xl overflow-hidden bg-teal-500 flex items-center justify-center text-white text-2xl font-bold relative group"
            >
            {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                initials
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                {uploadingAvatar ? <Loader2 size={20} className="animate-spin text-white" /> : <Camera size={20} className="text-white" />}
            </div>
            </button>
            <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
            />
        </div>
        <div className="flex-1">
            <p className="text-lg font-bold text-slate-800">{user?.nama}</p>
            <p className="text-sm text-slate-500">{roleLabels[user?.role]}</p>
            <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-slate-400">Klik foto untuk mengganti (maks. 2MB)</p>
            {avatarUrl && (
                <button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={deletingAvatar}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-50"
                >
                <Trash2 size={12} />
                {deletingAvatar ? 'Menghapus...' : 'Hapus foto'}
                </button>
            )}
            </div>
            </div>
        </div>
        </div>
        

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Edit Profil</h2>

        {successMsg && (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-2 mb-4">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
            <input
              type="text"
              value={user?.username}
              disabled
              className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-3">Ganti Password (opsional)</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password Saat Ini</label>
                <div className="relative">
                        <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm"
                        placeholder="Kosongkan jika tidak ingin ganti password"
                        />
                        <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                </div>
                {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
            </div>
              <div>
  <label className="block text-xs font-medium text-slate-600 mb-1">Password Baru</label>
  <div className="relative">
    <input
      type={showNewPassword ? 'text' : 'password'}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm"
    />
    <button
      type="button"
      onClick={() => setShowNewPassword(!showNewPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

  {newPassword && (
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
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;