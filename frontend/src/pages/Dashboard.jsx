import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, UserPlus, Ticket, Clock, CheckCircle2 } from 'lucide-react';

const statConfig = [
  { key: 'total_pasien', label: 'Total Pasien', icon: Users, color: 'text-slate-700', bg: 'bg-slate-100' },
  { key: 'total_pasien_hari_ini', label: 'Pasien Hari Ini', icon: UserPlus, color: 'text-teal-600', bg: 'bg-teal-50' },
  { key: 'total_antrean_hari_ini', label: 'Antrean Hari Ini', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'total_pasien_menunggu', label: 'Pasien Menunggu', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'total_pasien_selesai', label: 'Selesai Dilayani', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data.data));
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statConfig.map(({ key, label, icon: Icon, color, bg }) => (
          <div
            key={key}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon size={22} className={color} strokeWidth={2} />
            </div>
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{stats ? stats[key] : '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;