import React, { useState, useEffect, useCallback } from "react";
import TareasService from "../servicios/tareas.service";
import UsuariosService from "../servicios/usuarios.service";
import { useAuth } from "../autenticacion/AuthContext";
import { Plus, Save, X, Users, GraduationCap, Search } from "lucide-react";

const Materias = () => {
  const { user, isAdmin, isDocente } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    docente_id: "",
    estudiantes: [] // Lista de emails seleccionados
  });
  const fetchMaterias = () => {
    const filter = isDocente() ? { docente_id: user.email } : {};
    TareasService.getAllMaterias(filter)
      .then(res => {
        setMaterias(res.data || []);
        setLoading(false);
      });
  };
  const fetchDocentes = () => {
    UsuariosService.getAll().then(res => {
      setDocentes(res.data.filter(u => u.rol === 'docente'));
    });
  };
  const fetchEstudiantes = () => {
    UsuariosService.getAll().then(res => {
      setEstudiantes(res.data.filter(u => u.rol === 'estudiante'));
    });
  };

  useEffect(() => {
    if (!user) return;
    fetchMaterias();
    if (isAdmin) {
      fetchDocentes();
    }
    if (isDocente()) {
      fetchEstudiantes(); // Para gestionar mi lista
    }
  }, [user, isAdmin, isDocente]);


  const handleOpenCreate = () => {
    setEditingMateria(null);
    setFormData({ nombre: "", docente_id: "", estudiantes: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (materia) => {
    setEditingMateria(materia);
    setFormData({
      nombre: materia.nombre,
      docente_id: materia.docente_id,
      estudiantes: materia.estudiantes || []
    });
    if (isDocente()) fetchEstudiantes(); // Asegurar lista de estudiantes
    setIsModalOpen(true);
  };

  const toggleStudent = (email) => {
    const current = formData.estudiantes || [];
    setFormData({
      ...formData,
      estudiantes: current.includes(email) ? current.filter(e => e !== email) : [...current, email]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const promise = editingMateria
      ? TareasService.updateMateria(editingMateria._id, formData)
      : TareasService.createMateria(formData);

    promise
      .then(() => {
        alert(editingMateria ? "Materia actualizada" : "Materia creada");
        setIsModalOpen(false);
        fetchMaterias();
      })
      .catch(err => alert("Error: " + err.response?.data?.error));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Materias</h2>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            <Plus size={18} className="mr-2" /> Crear Materia
          </button>
        )}
      </div>

      {loading ? <div className="text-center">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map(m => (
            <div key={m._id} className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-gray-800">{m.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">Docente: {m.docente_id}</p>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Users size={16} className="mr-1" /> {m.estudiantes?.length || 0} Estudiantes
              </div>
              {(isAdmin || isDocente()) && (
                <button onClick={() => handleOpenEdit(m)} className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                  {isAdmin ? "Editar / Asignar" : "Gestionar Estudiantes"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">{editingMateria ? "Editar Materia" : "Crear Materia"}</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray font-medium text-black mb-1">Nombre de la Materia *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>


              {isAdmin && (
                <div>
                  <label className="block text-gray font-medium  text-black mb-1">Docente Asignado *</label>
                  <select
                    name="docente_id"
                    value={formData.docente_id}
                    onChange={e => setFormData({ ...formData, docente_id: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">-- Seleccionar Docente --</option>
                    {docentes.map(d => (
                      <option key={d.id} value={d.email}>{d.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* SELECCIÓN DE ESTUDIANTES */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Estudiantes Inscritos</label>
                <div className="border rounded p-2 h-40 overflow-y-auto text-black bg-gray-50">
                  {estudiantes.length === 0 ? <p className="text-sm text-gray-400">No hay estudiantes cargados.</p> :
                    estudiantes.map(est => (
                      <label key={est.id} className="flex items-center p-1 hover:bg-gray-200 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.estudiantes.includes(est.email)}
                          onChange={() => toggleStudent(est.email)}
                          className="mr-2"
                        />
                        <span className="text-sm ">{est.nombre_completo}</span>
                      </label>
                    ))
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">{formData.estudiantes.length} estudiantes seleccionados.</p>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materias;