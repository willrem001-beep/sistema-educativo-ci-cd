
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// -----------------------------------------------------
// 1. DEFINIR EL ESQUEMA (SCHEMA) DE MONGO
// En MongoDB no se usa tablas fijas, sino que se define el "formato" de los documentos.
// -----------------------------------------------------
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
  // Para vincular con el usuario, guardamos su ID o Email (incluso si es en otra base de datos)
  usuario_id: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now }
});

// Crear el Modelo (La 'tabla' virtual en MongoDB)
const Tarea = mongoose.model('Tarea', tareaSchema);

// -----------------------------------------------------
// 2. CONEXIÓN A MONGODB
// -----------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB: db_tareas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// -----------------------------------------------------
// 3. RUTAS CRUD
// -----------------------------------------------------

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

// RUTA: Listar todas las tareas (GET)
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Microservicio de Tareas corriendo en puerto ${3002}`);
});