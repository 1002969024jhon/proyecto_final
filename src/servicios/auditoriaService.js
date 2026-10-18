import pool from '../config/db.js';

export const listarAuditoria = async () => {
    const result = await pool.query(`
        SELECT a.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo
        FROM auditoria a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        ORDER BY a.id DESC
    `);
    return result.rows;
};
