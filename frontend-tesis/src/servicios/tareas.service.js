import axios from "axios";
import authHeader from "./auth-header";

const API_URL = import.meta.env.VITE_API_TAREAS;

// CORREGIDO: El backend espera usuario_id como query param
const getAll = (email) => {
  // Validación
  if (!email) {
    console.error("Error: Email es requerido para obtener tareas");
    return Promise.reject(new Error("Email es requerido"));
  }

  console.log("Obteniendo tareas para email:", email);

  // IMPORTANTE: El backend usa 'usuario_id' como nombre del parámetro
  return axios.get(`${API_URL}/tareas`, {
    headers: authHeader(),
    params: {
      usuario_id: email  // ← Cambiado de 'email' a 'usuario_id'
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

  // El backend solo actualiza titulo, descripcion y estado
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