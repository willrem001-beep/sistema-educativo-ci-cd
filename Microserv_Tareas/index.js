
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento local de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
  asignados: [{ type: String }], // Lista de emails de estudiantes
  archivo: { type: String }, // URL o nombre del archivo PDF
  fecha_creacion: { type: Date, default: Date.now }
});

const Tarea = mongoose.model('Tarea', tareaSchema);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB: db_tareas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// RUTA: Crear nueva tarea
app.post('/tareas', upload.single('archivo'), async (req, res) => {
  try {
    // Si viene un archivo, guardamos su nombre
    const archivo = req.file ? req.file.filename : null;

    // Convertir la lista de estudiantes (si viene como string) a array
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
        // Busca tareas donde el usuario es el CREADOR O está en la lista de ASIGNADOS
        tareas = await Tarea.find({
            $or: [
                { usuario_id: usuario_id }, // Tareas que yo creé
                { asignados: usuario_id }  // Tareas que me asignaron
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