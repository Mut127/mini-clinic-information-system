import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  menunggu: 'bg-amber-100 text-amber-700 border-amber-200',
  dipanggil: 'bg-blue-100 text-blue-700 border-blue-200',
  selesai: 'bg-green-100 text-green-700 border-green-200',
};

const statusLabels = {
  menunggu: 'Menunggu',
  dipanggil: 'Dipanggil',
  selesai: 'Selesai',
};

const Queues = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const canManage = user?.role === 'admin' || user?.role === 'petugas';

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get('/queues', { params });
      setQueues(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCall = async (id) => {
    try {
      await api.put(`/queues/${id}/call`);
      fetchQueues();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memanggil antrean');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/queues/${id}/status`, { status: newStatus });
      fetchQueues();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const currentlyCalled = queues.find((q) => q.status === 'dipanggil');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Antrean Hari Ini</h1>

      {/* Panel nomor yang sedang dipanggil, biar kelihatan kayak papan antrean klinik beneran */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl shadow-sm p-6 mb-6 text-white">
        <p className="text-teal-100 text-sm mb-1">Nomor Sedang Dipanggil</p>
        <p className="text-5xl font-bold tracking-wider">
          {currentlyCalled ? currentlyCalled.nomor_antrean : '-'}
        </p>
        {currentlyCalled && (
          <p className="text-teal-100 text-sm mt-2">
            {currentlyCalled.nama_pasien} · {currentlyCalled.nama_poli}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex gap-2 mb-4">
          {['', 'menunggu', 'dipanggil', 'selesai'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                statusFilter === s
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === '' ? 'Semua' : statusLabels[s]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">No. Antrean</th>
                <th className="py-2 pr-4">Pasien</th>
                <th className="py-2 pr-4">Dokter</th>
                <th className="py-2 pr-4">Poli</th>
                <th className="py-2 pr-4">Status</th>
                {canManage && <th className="py-2 pr-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">Memuat data...</td></tr>
              ) : queues.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">Belum ada antrean hari ini</td></tr>
              ) : (
                queues.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <span className="font-bold text-lg text-slate-800">{q.nomor_antrean}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{q.nama_pasien}</div>
                      <div className="text-xs text-slate-400">{q.no_rm}</div>
                    </td>
                    <td className="py-3 pr-4">{q.nama_dokter || '-'}</td>
                    <td className="py-3 pr-4">{q.nama_poli || '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${statusColors[q.status]}`}>
                        {statusLabels[q.status]}
                      </span>
                    </td>
                    {canManage && (
  <td className="py-3 pr-4">
    <div className="flex justify-end gap-2">
      {q.status === 'menunggu' && (
        <button
          onClick={() => handleCall(q.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md transition"
        >
          📢 Panggil
        </button>
      )}
      {q.status === 'dipanggil' && (
        <>
          <button
            onClick={() => handleCall(q.id)}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md transition"
          >
            🔁 Panggil Ulang
          </button>
          <button
            onClick={() => handleStatusChange(q.id, 'selesai')}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-md transition"
          >
            ✓ Selesai
          </button>
        </>
      )}
    </div>
  </td>
)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Queues;