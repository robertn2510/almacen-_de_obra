import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { query } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Get user from database
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.rol,
        nombre: user.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Update last login
    await query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Logout
router.post('/logout', verifyToken, (req, res) => {
  // JWT stateless - logout es solo del lado del cliente
  res.json({ message: 'Logout exitoso' });
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, nombre, rol, activo FROM usuarios WHERE id = $1',
      [req.user.id]
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

// Change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseñas requeridas' });
    }

    const userResult = await query(
      'SELECT password_hash FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcryptjs.compare(
      oldPassword,
      userResult.rows[0].password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña antigua incorrecta' });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
