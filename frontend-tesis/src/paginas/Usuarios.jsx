import React, { useState, useEffect } from "react";
import UsuariosService from "../servicios/usuarios.service";
import AuthService from "../servicios/auth.service";
import { useAuth } from "../autenticacion/AuthContext"
import { CheckCircle, XCircle, Trash2, Edit, Save, X, UserPlus } from "lucide-react";

const Usuarios = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState({
    id: null,
    nombre_completo: "",
    email: "",
    rol: "estudiante",
    activo: true 
  });
  
  // Seccion crear nuevos usuarios
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre_completo: "",
    email: "",
    password: "",
    rol: "estudiante"
  });

  const fetchUsers = () => {
    setLoading(true);
    UsuariosService.getAll()
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar usuarios:", error);
        setError("No se pudieron cargar los usuarios.");
        setLoading(false);
      });
  };

  useEffect(() => {
  const loadUsers = async () => {
    await fetchUsers();
  };
  loadUsers();
}, []);

  //Logica para crear usuarios
  const handleCreateUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    if (!newUser.nombre_completo || !newUser.email || !newUser.password) {
      alert("Todos los campos son obligatorios para crear un usuario.");
      return;
    }

    AuthService.register(
      newUser.email,
      newUser.password,
      newUser.nombre_completo,
      newUser.rol
    )
      .then(() => {
        alert("Usuario creado correctamente");
        setIsCreateModalOpen(false);
        setNewUser({ nombre_completo: "", email: "", password: "", rol: "estudiante" });
        fetchUsers();
      })
      .catch((error) => {
        alert("Error al crear usuario: " + (error.response?.data?.error || "Email ya existe"));
      });
  };


  // --- Lógica de Actualización 

  const handleOpenEdit = (user) => {
    // Convertir el estado a booleano si viene como string 't'/'f'
    const activoBooleano = user.activo === true || user.activo === 't';
    
    setEditingUser({
      id: user.id,
      nombre_completo: user.nombre_completo,
      email: user.email,
      rol: user.rol,
      activo: activoBooleano 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser({ 
      id: null, 
      nombre_completo: "", 
      email: "", 
      rol: "estudiante",
      activo: true 
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'activo') {
      setEditingUser({
        ...editingUser,
        [name]: value === 'true'
      });
    } else {
      setEditingUser({
        ...editingUser,
        [name]: value
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editingUser.nombre_completo || !editingUser.email) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const data = {
      nombre_completo: editingUser.nombre_completo,
      email: editingUser.email,
      password: editingUser.password,
      rol: editingUser.rol,
      activo: editingUser.activo // AGREGADO: Incluir el estado
    };

    UsuariosService.update(editingUser.id, data)
      .then(() => {
        alert("Usuario actualizado correctamente");
        handleCloseModal();
        fetchUsers();
      })
      .catch((error) => {
        alert("Error al actualizar: " + (error.response?.data?.error || "Error desconocido"));
      });
  };

  // Eliminar y actualizar el estado
  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      UsuariosService.remove(id)
        .then(() => {
          alert("Usuario eliminado correctamente");
          fetchUsers();
        })
        .catch((error) => {
          alert("Error al eliminar");
        });
    }
  };

  const toggleStatus = (user) => {
    const nuevoEstado = !(user.activo === true || user.activo === 't');
    const data = {
      nombre_completo: user.nombre_completo,
      email: user.email,
      rol: user.rol,
      activo: nuevoEstado
    };

    UsuariosService.update(user.id, data)
      .then(() => {
        alert(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`);
        fetchUsers();
      })
      .catch((error) => {
        alert("Error al actualizar estado");
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>

        
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={18} className="mr-2" /> Nuevo Usuario
          </button>
        )}

      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando usuarios...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.nombre_completo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.activo ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle size={16} className="mr-1" /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle size={16} className="mr-1" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                      
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar Datos"
                      >
                        <Edit size={18} />
                      </button>

                      
                      <button
                        onClick={() => handleDelete(user.id, user.nombre_completo)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Crear Nuevo Usuario</h3>
              <button onClick={() => setIsCreateModalOpen(false)}><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" name="nombre_completo" value={newUser.nombre_completo} onChange={handleCreateUserChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={newUser.email} onChange={handleCreateUserChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" name="password" value={newUser.password} onChange={handleCreateUserChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select name="rol" value={newUser.rol} onChange={handleCreateUserChange} className="w-full px-3 py-2 border rounded">
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Actualizar Usuario</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={editingUser.nombre_completo}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={editingUser.password || ''}
                  onChange={handleEditChange}
                  placeholder="Dejar vacío para no cambiar"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select name="rol" value={editingUser.rol} onChange={handleEditChange} className="w-full px-3 py-2 border rounded">
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  name="activo" 
                  value={editingUser.activo} 
                  onChange={handleEditChange} 
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancelar</button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save size={18} className="mr-2" /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;