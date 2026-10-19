import pool from '../config/db.js';

export const listarAuditoria = async (filtros = {}) => {
    let query = `
        SELECT a.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo
        FROM auditoria a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;
    
    // Columnas reales permitidas según tu tabla de auditoría en la BD
    const columnasValidas = ['accion', 'metodo', 'recurso', 'usuario_id'];

    for (const [key, value] of Object.entries(filtros)) {
        if (value !== undefined && value !== '' && columnasValidas.includes(key)) {
            if (key === 'usuario_id') {
                query += ` AND a.usuario_id = $${paramIndex++}`;
                values.push(value);
            } else {
                query += ` AND a.${key} ILIKE $${paramIndex++}`;
                values.push(`%${value}%`);
            }
        }
    }

    query += ` ORDER BY a.id DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};