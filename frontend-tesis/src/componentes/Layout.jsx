import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../autenticacion/AuthContext";
import {
  LayoutDashboard, UserCheck, BookOpen,
  ClipboardList, Calendar, LogOut, Menu, X
} from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Configuración del menú
  const menuItems = [
    { name: "Dashboard", path: ".", icon: LayoutDashboard },
    { name: "Usuarios", path: "usuarios", icon: UserCheck, roles: ['administrador'] },
    { name: "Materias", path: "materias", icon: BookOpen, roles: ['administrador', 'docente'] },
    { name: "Tareas", path: "tareas", icon: BookOpen },
    { name: "Notas", path: "notas", icon: ClipboardList },
    { name: "Asistencia", path: "asistencia", icon: Calendar },
  ];

  // Filtrar menú según rol
  const filteredMenu = menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.rol);
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <h1 className={`${!sidebarOpen && 'hidden'} font-bold text-xl tracking-wider`}>TESIS K8s</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-300 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-4 p-3 mb-2">
            <div className={`w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold`}>
              {user?.nombre_completo?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.nombre_completo}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 w-full p-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {/* Aquí se renderizará la página seleccionada (Dashboard, Usuarios, etc.) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;