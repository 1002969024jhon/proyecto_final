import pool from '../config/db.js';

const getMovimientosInventario = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT i.*, r.codigo AS repuesto_codigo, r.nombre AS repuesto_nombre, u.nombre AS usuario_nombre
            FROM inventario i
            JOIN repuestos r ON i.repuesto_id = r.id
            JOIN usuarios u ON i.usuario_id = u.id
            ORDER BY i.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los movimientos de inventario.' });
    }
};

export { getMovimientosInventario };