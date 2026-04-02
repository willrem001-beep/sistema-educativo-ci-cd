import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_TAREAS;

const getAll = (email) => {
  if (!email) {
    return Promise.reject(new Error("Email es requerido"));
  }

  return axios.get(`${API_URL}/tareas`, {
    headers: authHeader(),
    params: {
      usuario_id: email
    }
  });
};
const createWithFile = (formData) => {
  return axios.post(`${API_URL}/tareas`, formData, {
    headers: {
      ...authHeader(),
      'Content-Type': 'multipart/form-data'
    }
  });
};
const get = (id) => {
  if (!id) {
    return Promise.reject(new Error("ID es requerido"));
  }
  return axios.get(`${API_URL}/tareas/${id}`, { headers: authHeader() });
};

const create = (data) => {
  if (!data.titulo || !data.materia || !data.fecha_entrega || !data.usuario_id) {
    return Promise.reject(new Error("Faltan campos requeridos"));
  }

  return axios.post(`${API_URL}/tareas`, data, { headers: authHeader() });
};

const update = (id, data) => {
  if (!id) {
    return Promise.reject(new Error("ID es requerido"));
  }


  const datosActualizables = {
    titulo: data.titulo,
    descripcion: data.descripcion,
    estado: data.estado
  };

  return axios.put(`${API_URL}/tareas/${id}`, datosActualizables, { headers: authHeader() });
};

const remove = (id) => {
  if (!id) {
    return Promise.reject(new Error("ID es requerido"));
  }
  return axios.delete(`${API_URL}/tareas/${id}`, { headers: authHeader() });
};
const getAllMaterias = () => {
  return axios.get(`${API_URL}/materias`, { headers: authHeader() });
};

const createMateria = (data) => {
  return axios.post(`${API_URL}/materias`, data, { headers: authHeader() });
};

const updateMateria = (id, data) => {
  return axios.put(`${API_URL}/materias/${id}`, data, { headers: authHeader() });
};



const TareasService = {
  getAll,
  get,
  create,
  createWithFile,
  update,
  remove,
  getAllMaterias,
  createMateria,
  updateMateria
};

export default TareasService;