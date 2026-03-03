
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());


// En MongoDB definimos el formato de los documentos.
const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String },
  materia: { type: String, required: true },
  fecha_entrega: { type: Date, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'en progreso', 'entregado'], 
    default: 'pendiente' 
  },
  usuario_id: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now }
});

const Tarea = mongoose.model('Tarea', tareaSchema);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB: db_tareas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// RUTA: Crear nueva tarea
app.post('/tareas', async (req, res) => {
  try {
    const nuevaTarea = new Tarea(req.body);
    const tareaGuardada = await nuevaTarea.save();
    
    res.status(201).json({
      mensaje: "Tarea creada exitosamente",
      tarea: tareaGuardada
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RUTA: Listar todas las tareas 
app.get('/tareas', async (req, res) => {
  try {
    // Podemos filtrar por usuario_id (ej: ?usuario_id=123)
    const { usuario_id } = req.query;
    const filtro = usuario_id ? { usuario_id } : {};
    
    const tareas = await Tarea.find(filtro);
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA: Actualizar Tarea
app.put('/tareas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;

  try {
    
    const tareaActualizada = await Tarea.findByIdAndUpdate(
      id, 
      { titulo, descripcion, estado }, 
      { new: true, runValidators: true }
    );

    if (!tareaActualizada) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ mensaje: "Tarea actualizada", tarea: tareaActualizada });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RUTA: Eliminar Tarea 
app.delete('/tareas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tareaBorrada = await Tarea.findByIdAndDelete(id);

    if (!tareaBorrada) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ mensaje: "Tarea eliminada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Microservicio de Tareas corriendo en puerto ${3002}`);
});