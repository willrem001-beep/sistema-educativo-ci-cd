import axios from "axios";

const API_URL = import.meta.env.VITE_API_USUARIOS;

const login = (email, password) => {
  return axios
    .post(`${API_URL}/login`, { email, password })
    .then((response) => {
      const data = response.data;
      
      if (data.token) {
        const fullUser = {
          ...data.usuario,
          token: data.token 
        };
        localStorage.setItem("user", JSON.stringify(fullUser));
        return fullUser; 
      }
      return data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const register = (email, password, nombre_completo, rol) => {
  return axios.post(`${API_URL}/register`, {
    email,
    password,
    nombre_completo,
    rol,
  });
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};

const AuthService = {
  login,
  logout,
  register,
  getCurrentUser,
};

export default AuthService;