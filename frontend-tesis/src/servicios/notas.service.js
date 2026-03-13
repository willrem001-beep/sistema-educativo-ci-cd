import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_NOTAS;

const getAll = (usuario_id) => {
  return axios.get(`${API_URL}/notas`, { 
    headers: authHeader(),
    params: { usuario_id }
  });
};

const get = (id) => {
  return axios.get(`${API_URL}/notas/${id}`, { headers: authHeader() });
};

const create = (data) => {
  return axios.post(`${API_URL}/notas`, data, { headers: authHeader() });
};

const update = (id, data) => {
  return axios.put(`${API_URL}/notas/${id}`, data, { headers: authHeader() });
};

const remove = (id) => {
  return axios.delete(`${API_URL}/notas/${id}`, { headers: authHeader() });
};

const NotasService = {
  getAll,
  get,
  create,
  update,
  remove,
};

export default NotasService;