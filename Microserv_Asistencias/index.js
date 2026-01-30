// index.js - Asistencia
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// --- Esquema de Asistencia ---
const asistenciaSchema = new mongoose.Schema({
  usuario_id: { type: String, required: true },
  materia: { type: String, required: true },
  fecha_hora_entrada: { type: Date, default: Date.now },
  estado: { 
    type: String, 
    enum: ['presente', 'tarde', 'falta'], 
    default: 'presente' 
  }
});

const Asistencia = mongoose.model('Asistencia', asistenciaSchema);

// --- Conexión ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB: db_asistencia'))
  .catch(err => console.error('Error MongoDB:', err));

// --- Rutas ---

// RUTA: Registrar asistencia
app.post('/asistencia', async (req, res) => {
  try {
    const nuevoLog = new Asistencia(req.body);
    await nuevoLog.save();
    res.status(201).json({ mensaje: "Asistencia registrada", log: nuevoLog });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RUTA: Obtener historial
app.get('/asistencia', async (req, res) => {
  const { usuario_id } = req.query;
  try {
    const logs = await Asistencia.find(usuario_id ? { usuario_id } : {});
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Microservicio de Asistencia corriendo en puerto ${3004}`);
});