import { useEffect, useState } from 'react';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  registration_id: '',
  patient_id: '',
  doctor_id: '',
  keluhan: '',
  tekanan_darah: '',
  suhu_tubuh: '',
  berat_badan: '',
  tinggi_badan: '',
  diagnosa: '',
  rencana_terapi: '',
  tindakan: [{ nama_tindakan: '', keterangan: '' }],
  resep: [{ nama_obat: '', dosis: '', jumlah: '', aturan_pakai: '' }],
};

const MedicalRecords = () => {
  const { user } = useAuth();
  const isDokter = user?.role === 'dokter';
  const [activeTab, setActiveTab] = useState(isDokter ? 'input' : 'riwayat');

  // --- Input Pemeriksaan ---
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // --- Riwayat ---
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchRegistrations = async () => {
    try {
      // Ambil pendaftaran yang belum selesai, biar dokter tau siapa yang perlu diperiksa
      const res = await api.get('/registrations');
      setRegistrations(res.data.data.filter((r) => r.status !== 'selesai'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients', { params: { limit: 100 } });
      setPatients(res.data.data.patients);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchPatients();
  }, []);

  const handleSelectRegistration = (regId) => {
    const reg = registrations.find((r) => String(r.id) === String(regId));
    setForm({
      ...emptyForm,
      registration_id: regId,
      patient_id: reg?.patient_id || '',
      doctor_id: reg?.doctor_id || '',
      keluhan: reg?.keluhan_awal || '',
    });
    setFormErrors({});
    setSuccessMsg('');
  };

  // --- Handler untuk field dinamis: Tindakan ---
  const addTindakan = () => {
    setForm({ ...form, tindakan: [...form.tindakan, { nama_tindakan: '', keterangan: '' }] });
  };
  const removeTindakan = (index) => {
    setForm({ ...form, tindakan: form.tindakan.filter((_, i) => i !== index) });
  };
  const updateTindakan = (index, field, value) => {
    const updated = [...form.tindakan];
    updated[index][field] = value;
    setForm({ ...form, tindakan: updated });
  };

  // --- Handler untuk field dinamis: Resep ---
  const addResep = () => {
    setForm({ ...form, resep: [...form.resep, { nama_obat: '', dosis: '', jumlah: '', aturan_pakai: '' }] });
  };
  const removeResep = (index) => {
    setForm({ ...form, resep: form.resep.filter((_, i) => i !== index) });
  };
  const updateResep = (index, field, value) => {
    const updated = [...form.resep];
    updated[index][field] = value;
    setForm({ ...form, resep: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        tindakan: form.tindakan.filter((t) => t.nama_tindakan.trim() !== ''),
        resep: form.resep.filter((r) => r.nama_obat.trim() !== ''),
      };
      await api.post('/medical-records', payload);
      setSuccessMsg('Pemeriksaan berhasil disimpan!');
      setForm(emptyForm);
      fetchRegistrations();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = async (patientId) => {
    setSelectedPatientId(patientId);
    if (!patientId) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const res = await api.get(`/medical-records/${patientId}`);
      setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Pemeriksaan Dokter</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {isDokter && (
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
              activeTab === 'input' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Input Pemeriksaan
          </button>
        )}
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
            activeTab === 'riwayat' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Riwayat Pemeriksaan
        </button>
      </div>

      {/* TAB: Input Pemeriksaan */}
      {activeTab === 'input' && isDokter && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          {successMsg && (
            <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-2 mb-4">{successMsg}</div>
          )}

          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">Pilih Pendaftaran Pasien</label>
            <SearchableSelect
              options={registrations}
              value={form.registration_id}
              onChange={handleSelectRegistration}
              placeholder="-- Pilih Pasien yang akan Diperiksa --"
              getLabel={(r) => `${r.nama_pasien} (${r.no_rm}) - ${r.tanggal_kunjungan?.split('T')[0]}`}
              getValue={(r) => r.id}
            />
            {formErrors.registration_id && <p className="text-red-500 text-xs mt-1">{formErrors.registration_id}</p>}
          </div>

          {form.registration_id && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subjective */}
              <div>
                <h3 className="text-sm font-semibold text-teal-700 mb-2">S — Subjective (Keluhan Pasien)</h3>
                <textarea
                  value={form.keluhan}
                  onChange={(e) => setForm({ ...form, keluhan: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Keluhan yang disampaikan pasien..."
                />
              </div>

              {/* Objective */}
              <div>
                <h3 className="text-sm font-semibold text-teal-700 mb-2">O — Objective (Pemeriksaan Fisik)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Tekanan Darah</label>
                    <input
                      type="text"
                      value={form.tekanan_darah}
                      onChange={(e) => setForm({ ...form, tekanan_darah: e.target.value })}
                      placeholder="120/80"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Suhu Tubuh (°C)</label>
                    <input
                      type="text"
                      value={form.suhu_tubuh}
                      onChange={(e) => setForm({ ...form, suhu_tubuh: e.target.value })}
                      placeholder="36.5"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Berat Badan (kg)</label>
                    <input
                      type="text"
                      value={form.berat_badan}
                      onChange={(e) => setForm({ ...form, berat_badan: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Tinggi Badan (cm)</label>
                    <input
                      type="text"
                      value={form.tinggi_badan}
                      onChange={(e) => setForm({ ...form, tinggi_badan: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div>
                <h3 className="text-sm font-semibold text-teal-700 mb-2">A — Assessment (Diagnosa)</h3>
                <textarea
                  value={form.diagnosa}
                  onChange={(e) => setForm({ ...form, diagnosa: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Diagnosa dokter..."
                />
                {formErrors.diagnosa && <p className="text-red-500 text-xs mt-1">{formErrors.diagnosa}</p>}
              </div>

              {/* Plan */}
              <div>
                <h3 className="text-sm font-semibold text-teal-700 mb-2">P — Plan (Rencana Terapi)</h3>
                <textarea
                  value={form.rencana_terapi}
                  onChange={(e) => setForm({ ...form, rencana_terapi: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Rencana terapi..."
                />
              </div>

              {/* Tindakan Medis */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Tindakan Medis</h3>
                  <button type="button" onClick={addTindakan} className="text-teal-600 text-xs font-medium hover:underline">
                    + Tambah Tindakan
                  </button>
                </div>
                <div className="space-y-2">
                  {form.tindakan.map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={t.nama_tindakan}
                        onChange={(e) => updateTindakan(i, 'nama_tindakan', e.target.value)}
                        placeholder="Nama tindakan"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={t.keterangan}
                        onChange={(e) => updateTindakan(i, 'keterangan', e.target.value)}
                        placeholder="Keterangan (opsional)"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                      {form.tindakan.length > 1 && (
                        <button type="button" onClick={() => removeTindakan(i)} className="text-red-500 px-2">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resep Obat */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Resep Obat</h3>
                  <button type="button" onClick={addResep} className="text-teal-600 text-xs font-medium hover:underline">
                    + Tambah Obat
                  </button>
                </div>
                <div className="space-y-2">
                  {form.resep.map((r, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      <input
                        type="text"
                        value={r.nama_obat}
                        onChange={(e) => updateResep(i, 'nama_obat', e.target.value)}
                        placeholder="Nama obat"
                        className="sm:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={r.dosis}
                        onChange={(e) => updateResep(i, 'dosis', e.target.value)}
                        placeholder="Dosis"
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={r.jumlah}
                        onChange={(e) => updateResep(i, 'jumlah', e.target.value)}
                        placeholder="Jumlah"
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={r.aturan_pakai}
                          onChange={(e) => updateResep(i, 'aturan_pakai', e.target.value)}
                          placeholder="Aturan pakai"
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                        {form.resep.length > 1 && (
                          <button type="button" onClick={() => removeResep(i)} className="text-red-500 px-1">×</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg text-sm disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB: Riwayat Pemeriksaan */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="mb-5 max-w-md">
            <label className="block text-xs font-medium text-slate-600 mb-1">Pilih Pasien</label>
            <SearchableSelect
              options={patients}
              value={selectedPatientId}
              onChange={fetchHistory}
              placeholder="-- Cari Pasien --"
              getLabel={(p) => `${p.nama} (${p.no_rm})`}
              getValue={(p) => p.id}
            />
          </div>

          {historyLoading ? (
            <p className="text-slate-400 text-sm">Memuat riwayat...</p>
          ) : !selectedPatientId ? (
            <p className="text-slate-400 text-sm">Pilih pasien untuk melihat riwayat pemeriksaan.</p>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm">Belum ada riwayat pemeriksaan untuk pasien ini.</p>
          ) : (
            <div className="space-y-5">
  {history.map((h) => (
    <div key={h.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
            {new Date(h.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-slate-400 text-xs">
            {new Date(h.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-slate-300 text-xs flex items-center gap-1">
          🩺 Dr. {h.nama_dokter || '-'}
        </span>
      </div>

      <div className="p-5 bg-white">
        {/* Tanda Vital */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-red-500 font-medium mb-0.5">Tekanan Darah</p>
            <p className="text-sm font-bold text-red-700">{h.tekanan_darah || '-'}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-orange-500 font-medium mb-0.5">Suhu Tubuh</p>
            <p className="text-sm font-bold text-orange-700">{h.suhu_tubuh || '-'}°C</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-blue-500 font-medium mb-0.5">Berat Badan</p>
            <p className="text-sm font-bold text-blue-700">{h.berat_badan || '-'} kg</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-purple-500 font-medium mb-0.5">Tinggi Badan</p>
            <p className="text-sm font-bold text-purple-700">{h.tinggi_badan || '-'} cm</p>
          </div>
        </div>

        {/* SOAP Sections */}
        <div className="space-y-3">
          <div className="border-l-4 border-slate-300 pl-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Keluhan</p>
            <p className="text-sm text-slate-700 mt-0.5">{h.keluhan || '-'}</p>
          </div>

          <div className="border-l-4 border-teal-400 pl-3">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Diagnosa</p>
            <p className="text-sm text-slate-700 mt-0.5 font-medium">{h.diagnosa}</p>
          </div>

          <div className="border-l-4 border-blue-400 pl-3">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Rencana Terapi</p>
            <p className="text-sm text-slate-700 mt-0.5">{h.rencana_terapi || '-'}</p>
          </div>
        </div>

        {/* Tindakan & Resep */}
        {(h.tindakan?.length > 0 || h.resep?.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
            {h.tindakan?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  🔧 Tindakan Medis
                </p>
                <ul className="space-y-1.5">
                  {h.tindakan.map((t) => (
                    <li key={t.id} className="text-xs bg-slate-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-slate-700">{t.nama_tindakan}</span>
                      {t.keterangan && <span className="text-slate-500"> - {t.keterangan}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {h.resep?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  💊 Resep Obat
                </p>
                <ul className="space-y-1.5">
                  {h.resep.map((r) => (
                    <li key={r.id} className="text-xs bg-teal-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-teal-800">{r.nama_obat}</span>
                      <span className="text-teal-600"> · {r.dosis}, {r.jumlah}</span>
                      <div className="text-teal-500 mt-0.5">{r.aturan_pakai}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ))}
</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;