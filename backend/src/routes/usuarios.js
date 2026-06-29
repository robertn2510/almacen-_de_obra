import express from 'express';
import bcryptjs from 'bcryptjs';
import { query } from '../config/database.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nombre, email, rol, activo, ultimo_acceso, creado_en
       FROM usuarios 
       ORDER BY nombre ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Create user
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Datos requeridos faltantes' });
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, activo, creado_en)
       VALUES ($1, $2, $3, $4, true, NOW())
       RETURNING id, nombre, email, rol, activo, creado_en`,
      [nombre, email, hashedPassword, rol || 'almacenero']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Update user
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { nombre, email, rol, activo } = req.body;

    const result = await query(
      `UPDATE usuarios 
       SET nombre = COALESCE($1, nombre),
           email = COALESCE($2, email),
           rol = COALESCE($3, rol),
           activo = COALESCE($4, activo)
       WHERE id = $5
       RETURNING id, nombre, email, rol, activo, creado_en`,
      [nombre, email, rol, activo, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Reset user password
router.post('/:id/reset-password', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Nueva contraseña requerida' });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    const result = await query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2 RETURNING id',
      [hashedPassword, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Deactivate user
router.post('/:id/deactivate', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await query(
      'UPDATE usuarios SET activo = false WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario desactivado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
