// index.js - Notas
const express = require('express');
const cors = require('cors');
const pool = require('./db'); 
require('dotenv').config();
const client = require('prom-client');


const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
client.collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

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

// RUTA: Actualizar Nota (UPDATE)
app.put('/notas/:id', async (req, res) => {
  const { id } = req.params;
  const { materia, calificacion, observacion } = req.body;
  
  try {
    const query = `
      UPDATE notas 
      SET materia = $1, calificacion = $2, observacion = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [materia, calificacion, observacion, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }

    res.json({ mensaje: "Nota actualizada", nota: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar nota" });
  }
});

// RUTA: Eliminar Nota (DELETE)
app.delete('/notas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM notas WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }

    res.json({ mensaje: "Nota eliminada correctamente" });

  } catch (error) {
    res.status(500).json({ error: "Error al eliminar nota" });
  }
});

app.listen(PORT, () => {
  console.log(`Microservicio de Notas corriendo en puerto ${3003}`);
});