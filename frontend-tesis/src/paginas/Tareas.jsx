import React, { useState, useEffect } from "react";
import TareasService from "../servicios/tareas.service";
import UsuariosService from "../servicios/usuarios.service";
import { useAuth } from "../autenticacion/AuthContext";
import { Plus, Trash2, Edit, X, Calendar, Download, Users, Search, XCircle } from "lucide-react";

const Tareas = () => {
  const { user, isDocente, isEstudiante, isAdmin } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para lista de estudiantes
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  // Filtro para buscar estudiantes
  const [filtroEstudiantes, setFiltroEstudiantes] = useState("");

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);

  // Estado para nueva tarea
  const [newTarea, setNewTarea] = useState({
    titulo: "",
    descripcion: "",
    materia: "",
    fecha_entrega: "",
    asignados: []
  });
  const [archivo, setArchivo] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [materias, setMaterias] = useState([]);

    const fetchTareas = () => {
    setLoading(true);
    setError("");

    TareasService.getAll(user.email)
      .then((response) => {
        setTareas(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar tareas:", error);
        setError("No se pudieron cargar las tareas.");
        setLoading(false);
      });
  };

  const fetchEstudiantes = () => {
    setLoadingEstudiantes(true);
    UsuariosService.getAll()
      .then(res => {
        const soloEstudiantes = res.data.filter(u => u.rol === 'estudiante');
        setEstudiantes(soloEstudiantes);
        setLoadingEstudiantes(false);
      })
      .catch(err => {
        console.error("Error cargando estudiantes:", err);
        setLoadingEstudiantes(false);
      });
  };

  //CARGAR DATOS 
  useEffect(() => {
  const loadData = async () => {
    if (!user?.email) return;

    await fetchTareas();

    if (isDocente() || isAdmin()) {
      await fetchEstudiantes();
    }
  };

  loadData();
}, [user]);

  // MANEJO DE ESTUDIANTES 
  const handleStudentToggle = (email) => {
    setNewTarea(prev => {
      const current = prev.asignados || [];
      if (current.includes(email)) {
        return { ...prev, asignados: current.filter(e => e !== email) };
      } else {
        return { ...prev, asignados: [...current, email] };
      }
    });
  };

  // casilla para seleccionar estudiantes
  const handleSelectAll = () => {
    const visibleEstudiantes = estudiantes.filter(est =>
      est.nombre_completo.toLowerCase().includes(filtroEstudiantes.toLowerCase()) ||
      est.email.toLowerCase().includes(filtroEstudiantes.toLowerCase())
    );

    const visibleEmails = visibleEstudiantes.map(est => est.email);

    setNewTarea(prev => {
      const current = prev.asignados || [];
      const allVisibleSelected = visibleEmails.every(email => current.includes(email));

      // Si todos los visibles están seleccionados, los quitamos. Si no, los añadimos.
      // Mantenemos los que no están visibles en la lista.
      let nuevosAsignados;

      if (allVisibleSelected) {
        nuevosAsignados = current.filter(email => !visibleEmails.includes(email));
      } else {
        // Añadir visibles (evitando duplicados)
        nuevosAsignados = [...new Set([...current, ...visibleEmails])];
      }

      return { ...prev, asignados: nuevosAsignados };
    });
  };

  //CREAR TAREA
  const handleCreateSubmit = (e) => {
    e.preventDefault();

    if (!user?.email) {
      alert("Usuario no autenticado");
      return;
    }

    if (!newTarea.titulo || !newTarea.titulo.trim()) {
      alert("El título es obligatorio");
      return;
    }

    if (!newTarea.materia || !newTarea.materia.trim()) {
      alert("La materia es obligatoria");
      return;
    }

    if (!newTarea.fecha_entrega) {
      alert("La fecha de entrega es obligatoria");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", newTarea.titulo.trim());
    formData.append("descripcion", newTarea.descripcion?.trim() || "");
    formData.append("materia", newTarea.materia.trim());

    const fecha = new Date(newTarea.fecha_entrega);
    if (isNaN(fecha.getTime())) {
      alert("Fecha de entrega inválida");
      return;
    }
    formData.append("fecha_entrega", fecha.toISOString());
    formData.append("usuario_id", user.email);

    const asignadosStr = newTarea.asignados?.length > 0
      ? newTarea.asignados.join(',')
      : '';
    formData.append("asignados", asignadosStr);

    if (archivo) {
      formData.append("archivo", archivo);
    }

    setLoading(true);
    TareasService.createWithFile(formData)
      .then((response) => {
        alert("Tarea creada y asignada correctamente");
        setIsCreateModalOpen(false);
        resetForm();
        fetchTareas();
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.error || error.message;
        alert("Error: " + errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const resetForm = () => {
    setNewTarea({ titulo: "", descripcion: "", materia: "", fecha_entrega: "", asignados: [] });
    setArchivo(null);
    setSelectedFileName("");
    setFiltroEstudiantes(""); // Resetear filtro
  };

  //EDITAR TAREA
  const handleOpenEdit = (tarea) => {
    setEditingTarea({
      ...tarea,
      fecha_entrega: formatDateForInput(tarea.fecha_entrega)
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditingTarea({ ...editingTarea, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const dataToUpdate = {
      titulo: editingTarea.titulo,
      descripcion: editingTarea.descripcion || "",
      estado: editingTarea.estado
    };

    setLoading(true);
    TareasService.update(editingTarea._id, dataToUpdate)
      .then(() => {
        alert("Tarea actualizada correctamente");
        setIsEditModalOpen(false);
        setEditingTarea(null);
        fetchTareas();
      })
      .catch((error) => {
        console.error("Error al actualizar:", error);
        alert("Error al actualizar tarea");
        setLoading(false);
      });
  };

  //ELIMINAR TAREA
  const handleDelete = (id, titulo) => {
    if (window.confirm(`¿Estás seguro de eliminar la tarea "${titulo}"?`)) {
      setLoading(true);
      TareasService.remove(id)
        .then(() => {
          fetchTareas(); // fetchTareas maneja el estado de carga
        })
        .catch((error) => {
          console.error("Error al eliminar:", error);
          alert("Error al eliminar la tarea");
          setLoading(false);
        });
    }
  };

  //FUNCIONES AUXILIARES
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    try {
      return new Date(dateString).toLocaleString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "entregado": return "bg-green-100 text-green-800 border-green-200";
      case "en progreso": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const handleDownload = (filename) => {
    if (!filename) return;
    // Codificamos el nombre para manejar espacios y caracteres especiales en la URL
    const safeFilename = encodeURIComponent(filename);
    const fileUrl = `${import.meta.env.VITE_API_TAREAS}/uploads/${safeFilename}`;
    window.open(fileUrl, '_blank');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    setSelectedFileName(file ? file.name : "");
  };

  // Filtro de estudiantes para renderizado
  const estudiantesFiltrados = estudiantes.filter(est =>
    est.nombre_completo.toLowerCase().includes(filtroEstudiantes.toLowerCase()) ||
    est.email.toLowerCase().includes(filtroEstudiantes.toLowerCase())
  );

  if (!user) return <div className="p-8 text-center text-red-600">Debes iniciar sesión</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEstudiante ? "Mis Tareas Asignadas" : "Gestión de Tareas"}
        </h2>
        {(isDocente || isAdmin) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} className="mr-2" /> Nueva Tarea
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchTareas} className="px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300">Reintentar</button>
        </div>
      )}

      {loading && <div className="text-center py-10 text-gray-500">Cargando tareas...</div>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {tareas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay tareas disponibles.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Entrega</th>
                    {(isDocente || isAdmin) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignado a</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tareas.map((tarea) => (
                    <tr key={tarea._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tarea.titulo}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{tarea.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tarea.materia}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                        <Calendar size={14} className="mr-2 text-gray-400" /> {formatDate(tarea.fecha_entrega)}
                      </td>
                      {(isDocente || isAdmin) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center"><Users size={14} className="mr-1 text-gray-400" /> {tarea.asignados?.length || 0} estudiantes</div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tarea.archivo ? (
                          <button onClick={() => handleDownload(tarea.archivo)} className="text-blue-600 hover:text-blue-800 flex items-center">
                            <Download size={14} className="mr-1" /> Ver PDF
                          </button>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(tarea.estado)}`}>
                          {tarea.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        {(tarea.usuario_id === user.email || isAdmin) && (
                          <>
                            <button onClick={() => handleOpenEdit(tarea)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Editar"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(tarea._id, tarea.titulo)} className="text-red-600 hover:text-red-900 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/*boton para crear nuevas tareas */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Crear Nueva Tarea</h3>
              <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={newTarea.titulo} onChange={e => setNewTarea({ ...newTarea, titulo: e.target.value })} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={newTarea.descripcion} onChange={e => setNewTarea({ ...newTarea, descripcion: e.target.value })} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
                <select
                  name="materia"
                  value={newTarea.materia}
                  onChange={e => setNewTarea({ ...newTarea, materia: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">-- Seleccionar Materia --</option>
                  {materias.map(m => (
                    <option key={m._id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega *</label>
                <input type="datetime-local" value={newTarea.fecha_entrega} onChange={e => setNewTarea({ ...newTarea, fecha_entrega: e.target.value })} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
              </div>

              {/* asignamos a estudiantes especificos la tarea */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Asignar a Estudiantes</label>
                  <button type="button" onClick={handleSelectAll} disabled={loadingEstudiantes} className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400">
                    {loadingEstudiantes ? "Cargando..." : (newTarea.asignados?.length === estudiantes.length ? "Deseleccionar todos" : "Seleccionar todos")}
                  </button>
                </div>
                
                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={filtroEstudiantes}
                    onChange={(e) => setFiltroEstudiantes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="border rounded-lg p-2 h-48 overflow-y-auto bg-gray-50 space-y-2">
                  {loadingEstudiantes ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Cargando estudiantes...
                    </div>
                  ) : estudiantesFiltrados.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No se encontraron estudiantes.
                    </p>
                  ) : (
                    estudiantesFiltrados.map((est) => (
                      <label
                        key={est.id || est.email}
                        className="grid grid-cols-[32px_1fr] items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition"
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={(newTarea.asignados || []).includes(est.email)}
                            onChange={() => handleStudentToggle(est.email)}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-green-600 focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 leading-tight">
                            {est.nombre_completo}
                          </p>
                          <p className="text-sm text-gray-500 break-all leading-tight">
                            {est.email}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{(newTarea.asignados || []).length} estudiantes seleccionados.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF (Opcional)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {selectedFileName && (
                    <button
                      type="button"
                      onClick={() => { setArchivo(null); setSelectedFileName(""); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      title="Eliminar archivo"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </div>
                {selectedFileName && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {selectedFileName}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={loading}>{loading ? "Creando..." : "Crear y Asignar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* seccion para editar */}
      {isEditModalOpen && editingTarea && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Editar Tarea</h3>
              <button onClick={() => { setIsEditModalOpen(false); setEditingTarea(null); }} className="hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" name="titulo" value={editingTarea.titulo || ""} onChange={handleEditChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="descripcion" value={editingTarea.descripcion || ""} onChange={handleEditChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select name="estado" value={editingTarea.estado || "pendiente"} onChange={handleEditChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500">
                  <option value="pendiente">Pendiente</option>
                  <option value="en progreso">En Progreso</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600"><span className="font-medium">Materia:</span> {editingTarea.materia}</p>
                <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Fecha:</span> {formatDate(editingTarea.fecha_entrega)}</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingTarea(null); }} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>{loading ? "Actualizando..." : "Actualizar Tarea"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tareas;