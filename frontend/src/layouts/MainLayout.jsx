import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/patients', label: 'Data Pasien', icon: '🧑‍🤝‍🧑' },
  { path: '/registrations', label: 'Pendaftaran', icon: '📝' },
  { path: '/queues', label: 'Antrean', icon: '🎫' },
  { path: '/medical-records', label: 'Pemeriksaan', icon: '🩺' },
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <h2 className="font-bold text-lg">Mini Clinic</h2>
          <p className="text-xs text-slate-400">Information System</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium">{user?.nama}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;