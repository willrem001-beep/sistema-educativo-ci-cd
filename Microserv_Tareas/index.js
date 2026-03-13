const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// --- CONFIGURACIÓN DE MULTTER (SUBIDA DE ARCHIVOS) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// MIDDLEWARES 
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// NOTA: No necesitamos express.urlencoded() aquí porque multer maneja el form-data

// --- ESQUEMA MONGODB ---
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
  asignados: [{ type: String }], 
  archivo: { type: String }, 
  fecha_creacion: { type: Date, default: Date.now }
});

const Tarea = mongoose.model('Tarea', tareaSchema);

const materiaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true }, 
  docente_id: { type: String, required: true }, 
  estudiantes: [{ type: String }]
});

const Materia = mongoose.model('Materia', materiaSchema);

// --- CONEXIÓN MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB: db_tareas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));
 
//RUTAS CRUD DEL MICROSERVICIO TAREAS
// RUTA: Crear nueva tarea (Con Multer para archivo)
app.post('/tareas', upload.single('archivo'), async (req, res) => {
    console.log("DEBUG REQ.BODY:", req.body); // DEBUG: Ver qué llega
    
    try {
    const archivo = req.file ? req.file.filename : null;

    let estudiantesAsignados = req.body.asignados;
    if (typeof estudiantesAsignados === 'string') {
        estudiantesAsignados = estudiantesAsignados.split(',');
    }

    const nuevaTarea = new Tarea({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      materia: req.body.materia,
      fecha_entrega: req.body.fecha_entrega,
      usuario_id: req.body.usuario_id,
      asignados: estudiantesAsignados || [],
      archivo: archivo 
    });
    
    const tareaGuardada = await nuevaTarea.save();
    
    res.status(201).json({
      mensaje: "Tarea creada exitosamente",
      tarea: tareaGuardada
    });
  } catch (error) {
    console.error("ERROR:", error); // DEBUG
    res.status(400).json({ error: error.message });
  }
});

// RUTA: Listar tareas
app.get('/tareas', async (req, res) => {
  try {
    const { usuario_id } = req.query;
    let tareas;

    if (!usuario_id) {
        tareas = await Tarea.find();
    } else {
        tareas = await Tarea.find({
            $or: [
                { usuario_id: usuario_id }, 
                { asignados: usuario_id }  
            ]
        });
    }
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

    if (!tareaActualizada) return res.status(404).json({ error: "Tarea no encontrada" });
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
    if (!tareaBorrada) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ mensaje: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//RUTAS PARA CREAR MATERIAS 
// 1. Crear Materia (El Admin la crea y asigna docente)
app.post('/materias', async (req, res) => {
  try {
    const { nombre, docente_id, estudiantes } = req.body;
    const nuevaMateria = new Materia({
      nombre, 
      docente_id, 
      estudiantes: estudiantes || []
    });
    await nuevaMateria.save();
    res.status(201).json(nuevaMateria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Listar Materias (Para usar en los Dropdowns)
app.get('/materias', async (req, res) => {
  try {
    // Si soy docente, veo solo mis materias. Si admin, veo todas.
    const { docente_id } = req.query;
    const query = docente_id ? { docente_id } : {};
    const materias = await Materia.find(query);
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Asignar/Editar Estudiantes a una Materia
app.put('/materias/:id', async (req, res) => {
  try {
    const { nombre, estudiantes } = req.body;
    const materiaActualizada = await Materia.findByIdAndUpdate(
      req.params.id, 
      { nombre, estudiantes }, 
      { new: true }
    );
    res.json(materiaActualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Microservicio de Tareas corriendo en puerto ${PORT}`);
});