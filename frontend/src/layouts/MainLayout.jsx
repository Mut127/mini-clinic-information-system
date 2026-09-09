import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Ticket,
  Stethoscope,
  LogOut,
  Plus,
  UserCog,
  Building2,
  Stethoscope as StethoscopeIcon ,
} from 'lucide-react';


const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Data Pasien', icon: Users },
  { path: '/registrations', label: 'Pendaftaran', icon: ClipboardList },
  { path: '/queues', label: 'Antrean', icon: Ticket },
  { path: '/medical-records', label: 'Pemeriksaan', icon: Stethoscope },
  { path: '/users', label: 'Kelola User', icon: UserCog, adminOnly: true }, 
  { path: '/polies', label: 'Kelola Poli', icon: Building2 },
  { path: '/doctors', label: 'Kelola Dokter', icon: StethoscopeIcon },
];

const roleLabels = {
  admin: 'Administrator',
  dokter: 'Dokter',
  petugas: 'Petugas Pendaftaran',
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentPage = menuItems.find((item) => item.path === location.pathname);
  const initials = user?.nama?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col fixed h-screen">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
            +
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">Mini Clinic</h2>
            <p className="text-xs text-slate-400">Information System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavLink
  to="/profile"
  className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg hover:bg-white/5 transition"
>
  <div className="w-9 h-9 rounded-full bg-teal-500 overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
    {user?.avatar ? (
      <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
    ) : (
      initials
    )}
  </div>
  <div className="min-w-0">
    <p className="text-sm font-medium truncate">{user?.nama}</p>
    <p className="text-xs text-slate-400">{roleLabels[user?.role] || user?.role}</p>
  </div>
</NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{currentPage?.label || 'Mini Clinic'}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;