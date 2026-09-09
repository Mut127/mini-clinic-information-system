import api from './api';

export const getPolies = async () => {
  const res = await api.get('/master/polies');
  return res.data.data;
};

export const createPoli = async (data) => {
  const res = await api.post('/master/polies', data);
  return res.data.data;
};

export const updatePoli = async (id, data) => {
  const res = await api.put(`/master/polies/${id}`, data);
  return res.data.data;
};

export const deletePoli = async (id) => {
  const res = await api.delete(`/master/polies/${id}`);
  return res.data.data;
};