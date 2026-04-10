import React from "react";
import { useAuth } from "../autenticacion/AuthContext";
import { BookOpen, CheckCircle, Users, Clock } from "lucide-react";

const Dashboard = () => {

  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">¡Bienvenido, {user?.nombre}!</h1>
        <p className="mt-2 opacity-90">Sistema de Gestión Académica con enfoque en Microservicios Automatico version 4.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Mi Rol</p>
            <p className="text-black font-bold capitalize">{user?.rol}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Estado</p>
            <p className="text-black font-bold">Activo</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Microservicios</p>
            <p className="text-black font-bold">4 Online</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Último Acceso</p>
            <p className="text-black font-bold">Ahora</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;