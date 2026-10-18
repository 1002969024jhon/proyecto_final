import pool from '../config/db.js';

const getAuditoria = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo
            FROM auditoria a
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            ORDER BY a.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los registros de auditoría.' });
    }
};

export { getAuditoria };