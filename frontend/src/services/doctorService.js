import api from './api';

export const getDoctors = async () => {
  const res = await api.get('/master/doctors');
  return res.data.data;
};

export const createDoctor = async (data) => {
  const res = await api.post('/master/doctors', data);
  return res.data.data;
};

export const updateDoctor = async (id, data) => {
  const res = await api.put(`/master/doctors/${id}`, data);
  return res.data.data;
};

export const deleteDoctor = async (id) => {
  const res = await api.delete(`/master/doctors/${id}`);
  return res.data.data;
};