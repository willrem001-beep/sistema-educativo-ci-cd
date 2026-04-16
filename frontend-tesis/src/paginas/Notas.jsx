import React, { useState, useEffect, useCallback } from "react";
import NotasService from "../servicios/notas.service";
import UsuariosService from "../servicios/usuarios.service";
import TareasService from "../servicios/tareas.service";
import { useAuth } from "../autenticacion/AuthContext"; 
import { Plus, Trash2, Edit, Save, X, Search, GraduationCap } from "lucide-react";

const Notas = () => {
  const { user, isDocente, isEstudiante, isAdmin } = useAuth();
  const [notas, setNotas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modales
  const [materias, setMaterias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    materia: "",
    calificacion: "",
    observacion: "",
    usuario_id: "" 
  });

  const [filtroEstudiantes, setFiltroEstudiantes] = useState("");
  const fetchNotas = () => {
    setLoading(true);
    const filterId = isEstudiante() ? user.email : ""; 
    
    NotasService.getAll(filterId)
      .then((response) => {
        setNotas(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        setError("No se pudieron cargar las notas.");
        setLoading(false);
      });
  };

  const fetchEstudiantes = () => {
    UsuariosService.getAll()
      .then(res => {
        const soloEstudiantes = res.data.filter(u => u.rol === 'estudiante');
        setEstudiantes(soloEstudiantes);
      })
      .catch(err => console.error("Error cargando estudiantes:", err));
  };

  // --- MANEJO DE FORMULARIO ---
  const fetchMaterias = () => {
    TareasService.getAllMaterias().then(res => {
      setMaterias(res.data || []);
    });
  };
  // CARGAR DATOS
  useEffect(() => {
    if (!user?.email) return;
    
    fetchNotas();

    // Llamamos a las funciones con () para obtener el booleano
    if (isDocente() || isAdmin()) {
      fetchEstudiantes();
      fetchMaterias();
    }
  }, [user, isDocente, isAdmin]);


  const handleOpenCreate = () => {
    setEditingNota(null);
    setFormData({
      materia: "",
      calificacion: "",
      observacion: "",
      usuario_id: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (nota) => {
    setEditingNota(nota);
    setFormData({
      materia: nota.materia,
      calificacion: nota.calificacion,
      observacion: nota.observacion || "",
      usuario_id: nota.usuario_id
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.materia.trim() || formData.calificacion === "") {
      alert("Materia y Calificación son obligatorios");
      return;
    }

    const dataToSave = {
      materia: formData.materia.trim(),
      calificacion: parseFloat(formData.calificacion),
      observacion: formData.observacion.trim(),
      usuario_id: formData.usuario_id || user.email
    };

    setLoading(true);
    const promise = editingNota 
      ? NotasService.update(editingNota.id, dataToSave)
      : NotasService.create(dataToSave);

    promise
      .then(() => {
        alert(editingNota ? "Nota actualizada" : "Nota registrada");
        setIsModalOpen(false);
        fetchNotas();
      })
      .catch((error) => {
        alert("Error: " + (error.response?.data?.error || "No se pudo guardar"));
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar esta nota permanentemente?")) {
      NotasService.remove(id)
        .then(() => fetchNotas())
        .catch(() => alert("Error al eliminar"));
    }
  };

  const estudiantesFiltrados = estudiantes.filter(est => 
    est.nombre_completo.toLowerCase().includes(filtroEstudiantes.toLowerCase()) ||
    est.email.toLowerCase().includes(filtroEstudiantes.toLowerCase())
  );

  const getGradeColor = (grade) => {
    if (grade >= 7) return "text-green-600 font-bold";
    if (grade >= 4) return "text-orange-600 font-bold";
    return "text-red-600 font-bold";
  };

  if (!user) return <div className="p-8 text-center">Debes iniciar sesión</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEstudiante() ? "Mis Notas" : "Gestión de Calificaciones"}
        </h2>
        
        {(isDocente() || isAdmin()) && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={18} className="mr-2" />Nueva Nota
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading && <div className="text-center py-10 text-gray-500">Cargando calificaciones...</div>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {notas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {isEstudiante() ? "No tienes calificaciones registradas." : "No hay notas registradas en el sistema."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                    {(isDocente() || isAdmin()) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calificación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observación</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notas.map((nota) => (
                    <tr key={nota.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{nota.materia}</td>
                      
                      {(isDocente() || isAdmin()) && (
                        <td className="px-6 py-4 text-sm text-gray-600">{nota.usuario_id}</td>
                      )}

                      <td className="px-6 py-4 text-sm">
                        <span className={`text-xl ${getGradeColor(nota.calificacion)}`}>
                          {nota.calificacion}
                        </span>
                          <span className="text-gray-400 text-sm ml-1">/10</span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500 italic">{nota.observacion || "-"}</td>
                      
                      <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                        {(isDocente() || isAdmin()) && (
                          <>
                            <button onClick={() => handleOpenEdit(nota)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(nota.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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

      {/* --- MODAL CREAR / EDITAR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingNota ? "Editar Calificación" : "Registrar Calificación"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
                <input
                  type="text"
                  name="materia"
                  value={formData.materia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={isEstudiante()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calificación (0-10) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="calificacion"
                  value={formData.calificacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={isEstudiante()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
                <textarea
                  name="observacion"
                  value={formData.observacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                />
              </div>

              {(isDocente() || isAdmin()) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
                  <div className="relative mb-2">
                    <Search size={16} className="absolute left-3 top-2.5 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Buscar estudiante..."
                      value={filtroEstudiantes}
                      onChange={(e) => setFiltroEstudiantes(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <select
                    name="usuario_id"
                    value={formData.usuario_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 bg-gray" // Corregido de bg-blue a bg-white
                    required
                  >
                    <option value="">-- Seleccionar Estudiante --</option>
                    {estudiantesFiltrados.map((est) => (
                      <option key={est.id} value={est.email}>
                        {est.nombre_completo} ({est.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notas;