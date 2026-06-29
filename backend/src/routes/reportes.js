import express from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'xlsx';
import QRCode from 'qrcode';
import { query } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get KARDEX report
router.get('/kardex', verifyToken, async (req, res) => {
  try {
    const { proyecto_id, material_id, fecha_inicio, fecha_fin } = req.query;

    let sql = `
      SELECT m.numero_kardex, m.fecha, m.tipo, mat.nombre, mat.codigo, 
             m.cantidad, m.precio_unitario, m.valor_total, m.responsable_id,
             m.observaciones
      FROM movimientos m
      JOIN materiales mat ON m.material_id = mat.id
      WHERE 1=1
    `;
    const params = [];

    if (proyecto_id) {
      sql += ` AND m.proyecto_id = $${params.length + 1}`;
      params.push(proyecto_id);
    }

    if (material_id) {
      sql += ` AND m.material_id = $${params.length + 1}`;
      params.push(material_id);
    }

    if (fecha_inicio) {
      sql += ` AND m.fecha >= $${params.length + 1}`;
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      sql += ` AND m.fecha <= $${params.length + 1}`;
      params.push(fecha_fin);
    }

    sql += ` ORDER BY m.fecha ASC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Export KARDEX to Excel
router.get('/kardex/export/excel', verifyToken, async (req, res) => {
  try {
    const { proyecto_id } = req.query;

    let sql = `
      SELECT m.numero_kardex, m.fecha, m.tipo, mat.nombre, mat.codigo, 
             m.cantidad, m.precio_unitario, m.valor_total, m.responsable_id,
             m.observaciones
      FROM movimientos m
      JOIN materiales mat ON m.material_id = mat.id
      WHERE 1=1
    `;
    const params = [];

    if (proyecto_id) {
      sql += ` AND m.proyecto_id = $${params.length + 1}`;
      params.push(proyecto_id);
    }

    sql += ` ORDER BY m.fecha DESC`;

    const result = await query(sql, params);

    // Create Excel workbook
    const wb = ExcelJS.utils.book_new();
    const ws = ExcelJS.utils.json_to_sheet(result.rows);
    ExcelJS.utils.book_append_sheet(wb, ws, 'KARDEX');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="kardex.xlsx"');

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generando reporte Excel' });
  }
});

// Export KARDEX to PDF
router.get('/kardex/export/pdf', verifyToken, async (req, res) => {
  try {
    const { proyecto_id } = req.query;

    let sql = `
      SELECT m.numero_kardex, m.fecha, m.tipo, mat.nombre, mat.codigo, 
             m.cantidad, m.precio_unitario, m.valor_total,
             m.observaciones, p.nombre as proyecto
      FROM movimientos m
      JOIN materiales mat ON m.material_id = mat.id
      LEFT JOIN proyectos p ON m.proyecto_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (proyecto_id) {
      sql += ` AND m.proyecto_id = $${params.length + 1}`;
      params.push(proyecto_id);
    }

    sql += ` ORDER BY m.fecha ASC`;

    const result = await query(sql, params);

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="kardex.pdf"');

    doc.pipe(res);

    // Header
    doc.fontSize(16).text('KARDEX DE ALMACÉN', { align: 'center' });
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });

    // Table
    doc.moveDown();
    doc.fontSize(9);
    
    const rows = [['Fecha', 'Tipo', 'Material', 'Cantidad', 'P. Unitario', 'Total']];
    result.rows.forEach(row => {
      rows.push([
        new Date(row.fecha).toLocaleDateString('es-ES'),
        row.tipo.toUpperCase(),
        row.nombre,
        row.cantidad.toString(),
        `$${parseFloat(row.precio_unitario).toFixed(2)}`,
        `$${parseFloat(row.valor_total).toFixed(2)}`
      ]);
    });

    // Draw table
    let y = doc.y;
    rows.forEach((row, i) => {
      let x = 50;
      row.forEach((cell, j) => {
        doc.text(cell, x, y, { width: 90 });
        x += 100;
      });
      y += 20;
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generando reporte PDF' });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  try {
    // Total materials
    const materialsResult = await query('SELECT COUNT(*) FROM materiales');
    
    // Total projects
    const projectsResult = await query('SELECT COUNT(*) FROM proyectos WHERE estado = $1', ['activo']);
    
    // Low stock materials
    const lowStockResult = await query(
      'SELECT COUNT(*) FROM materiales WHERE stock_actual < stock_minimo'
    );
    
    // Total movements today
    const movementsResult = await query(
      "SELECT COUNT(*) FROM movimientos WHERE DATE(fecha) = CURRENT_DATE"
    );

    res.json({
      totalMateriales: parseInt(materialsResult.rows[0].count),
      proyectosActivos: parseInt(projectsResult.rows[0].count),
      materialesBajoStock: parseInt(lowStockResult.rows[0].count),
      movimientosHoy: parseInt(movementsResult.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
