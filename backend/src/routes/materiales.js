import express from 'express';
import { query } from '../config/database.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// Get all materials
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, codigo, nombre, descripcion, unidad_medida, 
              stock_minimo, stock_actual, precio_unitario, 
              proyecto_id, estado, creado_en
       FROM materiales 
       ORDER BY nombre ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Get materials by project
router.get('/proyecto/:proyectoId', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, codigo, nombre, descripcion, unidad_medida, 
              stock_minimo, stock_actual, precio_unitario, 
              proyecto_id, estado, creado_en
       FROM materiales 
       WHERE proyecto_id = $1
       ORDER BY nombre ASC`,
      [req.params.proyectoId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Get material by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM materiales WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Create material
router.post('/', verifyToken, verifyRole('admin', 'almacenero'), async (req, res) => {
  try {
    const { codigo, nombre, descripcion, unidad_medida, stock_minimo, precio_unitario, proyecto_id, partida_presupuestal } = req.body;

    if (!codigo || !nombre) {
      return res.status(400).json({ error: 'Código y nombre requeridos' });
    }

    const result = await query(
      `INSERT INTO materiales 
       (codigo, nombre, descripcion, unidad_medida, stock_minimo, 
        stock_actual, precio_unitario, proyecto_id, partida_presupuestal, 
        estado, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'activo', NOW())
       RETURNING *`,
      [codigo, nombre, descripcion, unidad_medida, stock_minimo || 0, 0, precio_unitario || 0, proyecto_id, partida_presupuestal]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Update material
router.put('/:id', verifyToken, verifyRole('admin', 'almacenero'), async (req, res) => {
  try {
    const { nombre, descripcion, unidad_medida, stock_minimo, precio_unitario, estado } = req.body;

    const result = await query(
      `UPDATE materiales 
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           unidad_medida = COALESCE($3, unidad_medida),
           stock_minimo = COALESCE($4, stock_minimo),
           precio_unitario = COALESCE($5, precio_unitario),
           estado = COALESCE($6, estado)
       WHERE id = $7
       RETURNING *`,
      [nombre, descripcion, unidad_medida, stock_minimo, precio_unitario, estado, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
