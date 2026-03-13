import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_ASISTENCIA;

const getAll = (usuario_id) => {
  return axios.get(`${API_URL}/asistencia`, { 
    headers: authHeader(),
    params: { usuario_id }
  });
};

const create = (data) => {
  return axios.post(`${API_URL}/asistencia`, data, { headers: authHeader() });
};

const update = (id, data) => {
  return axios.put(`${API_URL}/asistencia/${id}`, data, { headers: authHeader() });
};

const remove = (id) => {
  return axios.delete(`${API_URL}/asistencia/${id}`, { headers: authHeader() });
};

const AsistenciaService = {
  getAll,
  create,
  update,
  remove,
};

export default AsistenciaService;