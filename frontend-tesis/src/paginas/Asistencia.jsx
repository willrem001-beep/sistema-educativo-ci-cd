import React, { useEffect, useState } from "react";
import { useAuth } from "../autenticacion/AuthContext";
import AsistenciaService from "../services/AsistenciaService";
import { Plus, Trash2, Calendar, Search, X } from "lucide-react";
import TareasService from "../services/TareasService";
import UsuariosService from "../services/UsuariosService";

const Asistencia = () => {
  const { user, isDocente, isAdmin, isEstudiante } = useAuth();

  const [logs, setLogs] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materia: "",
    usuario_id: "",
    estado: "presente"
  });

  const fetchLogs = () => {
    setLoading(true);
    const filterId = isEstudiante() ? user.email : "";

    AsistenciaService.getAll(filterId)
      .then(res => {
        setLogs(res.data || []);
        setError("");
      })
      .catch(err => {
        console.error("Error cargando logs:", err);
        setError("No se pudieron cargar los registros de asistencia");
      })
      .finally(() => setLoading(false));
  };

  const fetchMaterias = () => {
    const filter = isDocente() ? { docente_id: user.email } : {};

    TareasService.getAllMaterias(filter)
      .then(res => {
        setMaterias(res.data || []);
      })
      .catch(err => console.error("Error cargando materias:", err));
  };

  const fetchEstudiantes = () => {
    UsuariosService.getAll()
      .then(res => {
        const soloEstudiantes = res.data.filter(u => u.rol === 'estudiante');
        setEstudiantes(soloEstudiantes);
      })
      .catch(err => console.error("Error cargando estudiantes:", err));
  };

  const [filtroEstudiantes, setFiltroEstudiantes] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
  const loadData = async () => {
    await fetchLogs();

    if (isDocente() || isAdmin()) {
      await fetchMaterias();
      await fetchEstudiantes();
    }
  };

  if (user?.email) {
    loadData();
  }
}, [user]);



  const handleOpenModal = () => {
    setFormData({ materia: "", usuario_id: "", estado: "presente" });
    setFiltroEstudiantes("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.materia || !formData.usuario_id) {
      alert("Materia y Estudiante son obligatorios");
      return;
    }

    setLoading(true);
    AsistenciaService.create(formData)
      .then(() => {
        alert("Asistencia registrada correctamente");
        setIsModalOpen(false);
        fetchLogs();
      })
      .catch(err => {
        console.error("Error registrando:", err);
        alert("Error: " + (err.response?.data?.error || "No se pudo registrar"));
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este registro permanentemente?")) {
      AsistenciaService.remove(id)
        .then(() => {
          fetchLogs();
        })
        .catch(err => {
          console.error("Error eliminando:", err);
          alert("Error al eliminar el registro");
        });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "presente": return "text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold";
      case "tarde": return "text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-xs font-semibold";
      case "falta": return "text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-semibold";
      default: return "text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Filtrar estudiantes para el buscador
  const estudiantesFiltrados = estudiantes.filter(est =>
    est.nombre_completo?.toLowerCase().includes(filtroEstudiantes.toLowerCase()) ||
    est.email?.toLowerCase().includes(filtroEstudiantes.toLowerCase())
  );

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Debes iniciar sesión para ver la asistencia</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEstudiante() ? "Mi Historial de Asistencia" : "Gestión de Asistencia"}
        </h2>

        {(isDocente() || isAdmin()) && (
          <button
            onClick={handleOpenModal}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Registrar Asistencia
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
          <button
            onClick={fetchLogs}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          Cargando registros de asistencia...
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {isEstudiante()
                ? "No tienes registros de asistencia aún."
                : "No hay registros de asistencia en el sistema."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    {(isDocente() || isAdmin()) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    {(isDocente() || isAdmin()) && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => {
                    const estudiante = estudiantes.find(e => e.email === log.usuario_id);

                    return (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            {formatDate(log.fecha_hora_entrada || log.fecha)}
                          </div>
                        </td>

                        {(isDocente() || isAdmin()) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {estudiante?.nombre_completo || log.usuario_id}
                          </td>
                        )}

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.materia}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={getStatusColor(log.estado)}>
                            {log.estado?.toUpperCase() || "PENDIENTE"}
                          </span>
                        </td>

                        {(isDocente() || isAdmin()) && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDelete(log._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Eliminar registro"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL REGISTRAR ASISTENCIA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Registrar Asistencia</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* MATERIA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia <span className="text-red-500">*</span>
                </label>
                <select
                  name="materia"
                  value={formData.materia}
                  onChange={e => setFormData({ ...formData, materia: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">-- Seleccionar Materia --</option>
                  {materias.map(m => (
                    <option key={m._id || m.id} value={m.nombre}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* ESTUDIANTE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estudiante <span className="text-red-500">*</span>
                </label>

                {/* Buscador */}
                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar estudiante por nombre o email..."
                    value={filtroEstudiantes}
                    onChange={(e) => setFiltroEstudiantes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <select
                  name="usuario_id"
                  value={formData.usuario_id}
                  onChange={e => setFormData({ ...formData, usuario_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  required
                >
                  <option value="">-- Seleccionar Estudiante --</option>
                  {estudiantesFiltrados.map(est => (
                    <option key={est.id} value={est.email}>
                      {est.nombre_completo} ({est.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* ESTADO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estado"
                      value="presente"
                      checked={formData.estado === 'presente'}
                      onChange={() => setFormData({ ...formData, estado: 'presente' })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-green-600 font-medium">Presente</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estado"
                      value="tarde"
                      checked={formData.estado === 'tarde'}
                      onChange={() => setFormData({ ...formData, estado: 'tarde' })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-orange-600 font-medium">Tarde</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estado"
                      value="falta"
                      checked={formData.estado === 'falta'}
                      onChange={() => setFormData({ ...formData, estado: 'falta' })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-red-600 font-medium">Falta</span>
                  </label>
                </div>
              </div>

              {/* BOTONES */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Asistencia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asistencia;