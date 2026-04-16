// index.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const promClient = require('prom-client');


const app = express();
const PORT = process.env.PORT || 3001;
promClient.collectDefaultMetrics();

app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  promClient.register.metrics().then(metrics => {
    res.end(metrics);
  }).catch(err => {
    res.status(500).end(err.message);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'metrics-exporter' });
});

const PORT = 9090;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Metrics server running on port ${PORT}`);
});
// Middlewares
app.use(cors());
app.use(express.json());

// -----------------------------------------------------
// RUTA 1: REGISTRO 
// -----------------------------------------------------
app.post('/register', async (req, res) => {
  const { email, password, nombre_completo, rol } = req.body;

  try {
    // 1. Verificar si el correo ya existe
    const userCheck = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10); // 10 rondas de seguridad
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insertar usuario con la contraseña hasheada
    const query = `
      INSERT INTO usuarios (email, password_hash, nombre_completo, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, nombre_completo, rol, activo
    `;

    const values = [
      email,
      passwordHash,
      nombre_completo,
      rol || 'estudiante'
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------------------------------
// RUTA 2: LOGIN 
// -----------------------------------------------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar al usuario por email
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // 2. Verificar la contraseña (Comparamos el texto plano con el hash guardado)
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 3. Generar el Token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol
      }, // Payload (información del usuario)
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 4. Devolver el token
    res.json({
      mensaje: "Login exitoso - VERSION AUTOMATIZADA v1.0",
      token: token,
      usuario: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre_completo
      }
    });

  } catch (error) {
    console.error('ERROR REAL:', error.message);
    res.status(500).json({ error: error.message });
  }

});


app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, nombre_completo, rol, activo, fecha_creacion FROM usuarios'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// RUTA: Obtener un usuario específico por ID 
app.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, email, nombre_completo, rol, activo, fecha_creacion FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// RUTA: Actualizar Usuario VERSIÓN ROBUSTA
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, rol, activo, password } = req.body;

  try {
    // Validar ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Verificar si el usuario existe
    const existeUsuario = await pool.query('SELECT id FROM usuarios WHERE id = $1', [userId]);
    if (existeUsuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let result;

    if (password && password.trim() !== '') {
      // Si hay nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      result = await pool.query(
        `UPDATE usuarios 
         SET nombre_completo = $1, email = $2, rol = $3, activo = $4, 
             password_hash = $5, fecha_actualizacion = NOW()
         WHERE id = $6 
         RETURNING id, email, nombre_completo, rol, activo, fecha_creacion, fecha_actualizacion`,
        [nombre_completo, email, rol, activo, passwordHash, userId]
      );
    } else {
      // Sin cambiar contraseña
      result = await pool.query(
        `UPDATE usuarios 
         SET nombre_completo = $1, email = $2, rol = $3, activo = $4, 
             fecha_actualizacion = NOW()
         WHERE id = $5 
         RETURNING id, email, nombre_completo, rol, activo, fecha_creacion, fecha_actualizacion`,
        [nombre_completo, email, rol, activo, userId]
      );
    }

    res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});


// RUTA: Eliminar Usuario 
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Iniciar servidor
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Microservicio de Usuarios mejorado corriendo en puerto ${3001}`);
});