import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './autenticacion/AuthContext'

import Login from './paginas/Login'
import Layout from './componentes/Layout'
import Dashboard from './paginas/Dashboard'
import Usuarios from './paginas/Usuarios'
import Tareas from './paginas/Tareas'
import Materias from './paginas/Materias'
import Notas from './paginas/Notas'
import Asistencia from './paginas/Asistencia'
import './index.css'

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const isLoginPage = location.pathname === '/login';
    
    if (!user && !isLoginPage) {
      navigate('/login', { replace: true });
    }
    
    if (user && isLoginPage) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-bold text-gray-600">Verificando sesión...</div>
      </div>
    );
  }

  return user ? children : null;
};

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-bold text-gray-600">Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tareas" element={<Navigate to="/dashboard/tareas" replace />} />
      <Route path="/notas" element={<Navigate to="/dashboard/notas" replace />} />
      <Route path="/asistencia" element={<Navigate to="/dashboard/asistencia" replace />} />
      <Route path="/usuarios" element={<Navigate to="/dashboard/usuarios" replace />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="materias" element={<Materias />} />
        <Route path="notas" element={<Notas />} />
        <Route path="asistencia" element={<Asistencia />} />
      </Route>

      {/* Ruta para manejar 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App