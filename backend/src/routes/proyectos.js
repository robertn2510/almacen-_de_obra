import express from 'express';
import { query } from '../config/database.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nombre, descripcion, ubicacion, cliente, 
              fecha_inicio, fecha_fin, estado, presupuesto, 
              responsable_id, creado_en
       FROM proyectos 
       ORDER BY creado_en DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Get project by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nombre, descripcion, ubicacion, cliente, 
              fecha_inicio, fecha_fin, estado, presupuesto, 
              responsable_id, creado_en
       FROM proyectos 
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Create project
router.post('/', verifyToken, verifyRole('admin', 'supervisor'), async (req, res) => {
  try {
    const { nombre, descripcion, ubicacion, cliente, fecha_inicio, fecha_fin, presupuesto } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre del proyecto requerido' });
    }

    const result = await query(
      `INSERT INTO proyectos 
       (nombre, descripcion, ubicacion, cliente, fecha_inicio, fecha_fin, 
        presupuesto, responsable_id, estado, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo', NOW())
       RETURNING *`,
      [nombre, descripcion, ubicacion, cliente, fecha_inicio, fecha_fin, presupuesto || 0, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Update project
router.put('/:id', verifyToken, verifyRole('admin', 'supervisor'), async (req, res) => {
  try {
    const { nombre, descripcion, ubicacion, cliente, fecha_inicio, fecha_fin, estado, presupuesto } = req.body;

    const result = await query(
      `UPDATE proyectos 
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           ubicacion = COALESCE($3, ubicacion),
           cliente = COALESCE($4, cliente),
           fecha_inicio = COALESCE($5, fecha_inicio),
           fecha_fin = COALESCE($6, fecha_fin),
           estado = COALESCE($7, estado),
           presupuesto = COALESCE($8, presupuesto)
       WHERE id = $9
       RETURNING *`,
      [nombre, descripcion, ubicacion, cliente, fecha_inicio, fecha_fin, estado, presupuesto, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Delete project
router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM proyectos WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ message: 'Proyecto eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
