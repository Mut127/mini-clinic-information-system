import { useEffect, useState } from 'react';
import api from '../services/api';

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Pasien" value={stats?.total_pasien ?? '-'} color="text-slate-800" />
        <StatCard label="Pasien Hari Ini" value={stats?.total_pasien_hari_ini ?? '-'} color="text-teal-600" />
        <StatCard label="Antrean Hari Ini" value={stats?.total_antrean_hari_ini ?? '-'} color="text-blue-600" />
        <StatCard label="Pasien Menunggu" value={stats?.total_pasien_menunggu ?? '-'} color="text-amber-600" />
        <StatCard label="Selesai Dilayani" value={stats?.total_pasien_selesai ?? '-'} color="text-green-600" />
      </div>
    </div>
  );
};

export default Dashboard;