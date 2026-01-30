// index.js - Notas
const express = require('express');
const cors = require('cors');
const pool = require('./db'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// RUTA: Crear nota
app.post('/notas', async (req, res) => {
  const { materia, calificacion, observacion, usuario_id } = req.body;
  
  try {
    const query = `
      INSERT INTO notas (materia, calificacion, observacion, usuario_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [materia, calificacion, observacion, usuario_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear nota" });
  }
});

// RUTA: Listar notas por usuario
app.get('/notas', async (req, res) => {
  const { usuario_id } = req.query;
  try {
    let query = 'SELECT * FROM notas';
    let params = [];

    if (usuario_id) {
      query += ' WHERE usuario_id = $1';
      params.push(usuario_id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notas" });
  }
});

app.listen(PORT, () => {
  console.log(`Microservicio de Notas corriendo en puerto ${3003}`);
});