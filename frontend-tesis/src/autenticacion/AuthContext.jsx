import React, { createContext, useState, useContext, useEffect } from "react";
import AuthService from "../servicios/auth.service.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = AuthService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser(data); // El login se guarda en localStorage
      return { success: true };
    } catch (error) {
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;