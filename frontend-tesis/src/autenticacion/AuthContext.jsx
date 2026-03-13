import React, { createContext, useState, useContext, useEffect } from "react";
import AuthService from "../servicios/auth.service.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para saber si estamos verificando el token al inicio

    useEffect(() => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error("Error cargando usuario desde LocalStorage:", error);
      localStorage.removeItem("user"); // Limpiamos el dato corrupto
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      return { 
        success: false, 
        message: error.response?.data?.error || "Error al iniciar sesión" 
      };
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const register = async (email, password, nombre_completo, rol) => {
    try {
      await AuthService.register(email, password, nombre_completo, rol);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || "Error al registrar usuario" 
      };
    }
  };

  // Funciones auxiliares para proteger rutas según rol
  const isEstudiante = () => user?.rol === 'estudiante';
  const isDocente = () => user?.rol === 'docente';
  const isAdmin = () => user?.rol === 'administrador';

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isEstudiante,
    isDocente,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;