import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_USUARIOS;

const getAll = () => {
  return axios.get(`${API_URL}/usuarios`, { headers: authHeader() });
};

const get = (id) => {
  return axios.get(`${API_URL}/usuarios/${id}`, { headers: authHeader() });
};

const update = (id, data) => {
  return axios.put(`${API_URL}/usuarios/${id}`, data, { headers: authHeader() });
};

const remove = (id) => {
  return axios.delete(`${API_URL}/usuarios/${id}`, { headers: authHeader() });
};

const UsuariosService = {
  getAll,
  get,
  update,
  remove,
};

export default UsuariosService;