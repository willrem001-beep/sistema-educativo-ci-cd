import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../autenticacion/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre_completo, setNombre] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    const result = await register(email, password, nombre_completo, rol);
    if (result.success) {
      navigate("/login");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Registro</h2>
        {message && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{message}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
            <input type="text" className="w-full px-3 py-2 border rounded" value={nombre_completo} onChange={e => setNombre(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <input type="password" className="w-full px-3 py-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Rol</label>
            <select className="w-full px-3 py-2 border rounded" value={rol} onChange={e => setRol(e.target.value)}>
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">Registrarse</button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">Volver a Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;