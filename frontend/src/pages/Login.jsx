import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Stethoscope, Users, ClipboardList, Ticket } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sisi Kiri - Branding, hanya tampil di layar besar */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 relative overflow-hidden">
        {/* Dekorasi lingkaran samar */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -mb-32 -ml-32"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
  <Stethoscope size={22} className="text-white" strokeWidth={2.2} />
</div>
            <div>
              <p className="font-bold text-lg leading-tight">Mini Clinic</p>
              <p className="text-teal-100 text-xs">Information System</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-snug mb-4">
              Kelola operasional klinik Anda dalam satu tempat.
            </h2>
            <p className="text-teal-100 text-sm leading-relaxed max-w-md">
              Dari pendaftaran pasien, antrean, sampai pencatatan hasil pemeriksaan dokter, semua terintegrasi dan mudah diakses.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <Users size={20} className="mb-2 text-teal-200" />
                <p className="text-sm font-medium">Data Pasien</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <ClipboardList size={20} className="mb-2 text-teal-200" />
                <p className="text-sm font-medium">Pendaftaran</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <Ticket size={20} className="mb-2 text-teal-200" />
                <p className="text-sm font-medium">Antrean</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <Stethoscope size={20} className="mb-2 text-teal-200" />
                <p className="text-sm font-medium">Pemeriksaan</p>
              </div>
            </div>
          </div>

          <p className="text-teal-200 text-xs">© 2026 Mini Clinic Information System</p>
        </div>
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Logo tampil di mobile aja, karena sisi kiri disembunyikan */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-teal-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
  <Stethoscope size={26} className="text-white" strokeWidth={2.2} />
</div>
            <h1 className="text-xl font-bold text-slate-800">Mini Clinic Information System</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Selamat datang</h2>
            <p className="text-sm text-slate-500 mt-1">Silakan login untuk melanjutkan</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50 shadow-sm shadow-teal-200 mt-2"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;