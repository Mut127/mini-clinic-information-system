import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/SearchableSelect';

const statusColors = {
  menunggu: 'bg-amber-100 text-amber-700',
  check_in: 'bg-blue-100 text-blue-700',
  pemeriksaan: 'bg-purple-100 text-purple-700',
  selesai: 'bg-green-100 text-green-700',
};

const statusLabels = {
  menunggu: 'Menunggu',
  check_in: 'Check In',
  pemeriksaan: 'Pemeriksaan',
  selesai: 'Selesai',
};

const emptyForm = {
  patient_id: '',
  doctor_id: '',
  poli_id: '',
  tanggal_kunjungan: new Date().toISOString().split('T')[0],
  jenis_pembayaran: 'Umum',
  keluhan_awal: '',
};

const Registrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [polies, setPolies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const canManage = user?.role === 'admin' || user?.role === 'petugas';

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get('/registrations', { params });
      setRegistrations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [patientsRes, doctorsRes, poliesRes] = await Promise.all([
        api.get('/patients', { params: { limit: 100 } }),
        api.get('/master/doctors'),
        api.get('/master/polies'),
      ]);
      setPatients(patientsRes.data.data.patients);
      setDoctors(doctorsRes.data.data);
      setPolies(poliesRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openAddModal = () => {
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      await api.post('/registrations', form);
      setModalOpen(false);
      fetchRegistrations();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/registrations/${id}`, { status: newStatus });
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pendaftaran Pasien</h1>
        {canManage && (
          <button
            onClick={openAddModal}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Pendaftaran Baru
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex gap-2 mb-4">
          {['', 'menunggu', 'check_in', 'pemeriksaan', 'selesai'].map((s) => (
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
                <th className="py-2 pr-4">Pasien</th>
                <th className="py-2 pr-4">Dokter</th>
                <th className="py-2 pr-4">Poli</th>
                <th className="py-2 pr-4">Tgl Kunjungan</th>
                <th className="py-2 pr-4">Pembayaran</th>
                <th className="py-2 pr-4">Status</th>
                {canManage && <th className="py-2 pr-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-6 text-center text-slate-400">Memuat data...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-slate-400">Belum ada data pendaftaran</td></tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{r.nama_pasien}</div>
                      <div className="text-xs text-slate-400">{r.no_rm}</div>
                    </td>
                    <td className="py-3 pr-4">{r.nama_dokter || '-'}</td>
                    <td className="py-3 pr-4">{r.nama_poli || '-'}</td>
                    <td className="py-3 pr-4">{r.tanggal_kunjungan?.split('T')[0]}</td>
                    <td className="py-3 pr-4">{r.jenis_pembayaran}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 pr-4">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          className="text-xs border border-slate-300 rounded-md px-2 py-1"
                        >
                          <option value="menunggu">Menunggu</option>
                          <option value="check_in">Check In</option>
                          <option value="pemeriksaan">Pemeriksaan</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Pendaftaran Baru">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
  <label className="block text-xs font-medium text-slate-600 mb-1">Pasien</label>
  <SearchableSelect
    options={patients}
    value={form.patient_id}
    onChange={(val) => setForm({ ...form, patient_id: val })}
    placeholder="-- Pilih Pasien --"
    getLabel={(p) => `${p.nama} (${p.no_rm})`}
    getValue={(p) => p.id}
  />
  {formErrors.patient_id && <p className="text-red-500 text-xs mt-1">{formErrors.patient_id}</p>}
</div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Poli</label>
            <select
              value={form.poli_id}
              onChange={(e) => setForm({ ...form, poli_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Poli --</option>
              {polies.map((p) => (
                <option key={p.id} value={p.id}>{p.nama_poli}</option>
              ))}
            </select>
            {formErrors.poli_id && <p className="text-red-500 text-xs mt-1">{formErrors.poli_id}</p>}
          </div>

          <div>
  <label className="block text-xs font-medium text-slate-600 mb-1">Dokter</label>
  <SearchableSelect
    options={doctors}
    value={form.doctor_id}
    onChange={(val) => setForm({ ...form, doctor_id: val })}
    placeholder="-- Pilih Dokter --"
    getLabel={(d) => `${d.nama} (${d.nama_poli})`}
    getValue={(d) => d.id}
  />
</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Kunjungan</label>
              <input
                type="date"
                value={form.tanggal_kunjungan}
                onChange={(e) => setForm({ ...form, tanggal_kunjungan: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
              {formErrors.tanggal_kunjungan && <p className="text-red-500 text-xs mt-1">{formErrors.tanggal_kunjungan}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Pembayaran</label>
              <select
                value={form.jenis_pembayaran}
                onChange={(e) => setForm({ ...form, jenis_pembayaran: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="Umum">Umum</option>
                <option value="BPJS">BPJS</option>
                <option value="Asuransi">Asuransi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Keluhan Awal</label>
            <textarea
              value={form.keluhan_awal}
              onChange={(e) => setForm({ ...form, keluhan_awal: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2.5 rounded-lg mt-2"
          >
            Daftarkan Pasien
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Registrations;