import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './autenticacion/AuthContext'

import Login from './paginas/Login'
import Layout from './componentes/Layout'
import Dashboard from './paginas/Dashboard'

// Importamos los placeholders
import Usuarios from './paginas/Usuarios'
import Tareas from './paginas/Tareas'
import Materias from './paginas/Materias'
import Notas from './paginas/Notas'
import Asistencia from './paginas/Asistencia'

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Redirecciones de rutas cortas a dashboard */}
        <Route path="/tareas" element={<Navigate to="/dashboard/tareas" />} />
        <Route path="/notas" element={<Navigate to="/dashboard/notas" />} />
        <Route path="/asistencia" element={<Navigate to="/dashboard/asistencia" />} />
        <Route path="/usuarios" element={<Navigate to="/dashboard/usuarios" />} />

        {/* Dashboard principal */}
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
      </Routes>
    </BrowserRouter>
  )
}

export default App