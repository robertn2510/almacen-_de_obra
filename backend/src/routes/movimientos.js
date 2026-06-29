import express from 'express';
import { query } from '../config/database.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// Get all movements
router.get('/', verifyToken, async (req, res) => {
  try {
    const { tipo, fecha_inicio, fecha_fin, proyecto_id } = req.query;
    
    let sql = `SELECT * FROM movimientos WHERE 1=1`;
    const params = [];

    if (tipo) {
      sql += ` AND tipo = $${params.length + 1}`;
      params.push(tipo);
    }

    if (fecha_inicio) {
      sql += ` AND fecha >= $${params.length + 1}`;
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      sql += ` AND fecha <= $${params.length + 1}`;
      params.push(fecha_fin);
    }

    if (proyecto_id) {
      sql += ` AND proyecto_id = $${params.length + 1}`;
      params.push(proyecto_id);
    }

    sql += ` ORDER BY fecha DESC, creado_en DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Get movement by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM movimientos WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Create movement (Ingreso/Salida)
router.post('/', verifyToken, verifyRole('almacenero', 'supervisor'), async (req, res) => {
  try {
    const { 
      tipo, material_id, cantidad, precio_unitario, 
      proyecto_id, responsable_id, observaciones, partida_presupuestal 
    } = req.body;

    if (!tipo || !material_id || !cantidad) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    if (!['ingreso', 'salida'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' });
    }

    // Get current stock
    const materialResult = await query(
      'SELECT stock_actual, precio_unitario FROM materiales WHERE id = $1',
      [material_id]
    );

    if (materialResult.rows.length === 0) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    const { stock_actual, precio_unitario: precioStored } = materialResult.rows[0];
    const precioUnitario = precio_unitario || precioStored || 0;

    // Validate stock for salida
    if (tipo === 'salida' && cantidad > stock_actual) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Calculate new stock
    const nuevoStock = tipo === 'ingreso' 
      ? stock_actual + cantidad 
      : stock_actual - cantidad;

    // Create movement
    const movementResult = await query(
      `INSERT INTO movimientos 
       (tipo, material_id, cantidad, precio_unitario, valor_total,
        proyecto_id, responsable_id, observaciones, partida_presupuestal,
        numero_kardex, fecha, creado_en, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11)
       RETURNING *`,
      [
        tipo, material_id, cantidad, precioUnitario, cantidad * precioUnitario,
        proyecto_id, responsable_id, observaciones, partida_presupuestal,
        `KARDEX-${Date.now()}`, req.user.id
      ]
    );

    // Update material stock
    await query(
      'UPDATE materiales SET stock_actual = $1 WHERE id = $2',
      [nuevoStock, material_id]
    );

    res.status(201).json(movementResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Get KARDEX report for material
router.get('/kardex/:materialId', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, tipo, cantidad, precio_unitario, valor_total, 
              numero_kardex, fecha, responsable_id, observaciones
       FROM movimientos 
       WHERE material_id = $1
       ORDER BY fecha ASC`,
      [req.params.materialId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
