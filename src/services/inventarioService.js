import pool from '../config/db.js';

export const listarMovimientos = async (filtros = {}) => {
    let query = `
        SELECT i.*, r.codigo AS repuesto_codigo, r.nombre AS repuesto_nombre, u.nombre AS usuario_nombre
        FROM inventario i
        JOIN repuestos r ON i.repuesto_id = r.id
        JOIN usuarios u ON i.usuario_id = u.id
        WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;
    
    
    const columnasValidas = ['tipo', 'repuesto_id', 'usuario_id'];

    for (const [key, value] of Object.entries(filtros)) {
        if (value !== undefined && value !== '' && columnasValidas.includes(key)) {
            query += ` AND i.${key} = $${paramIndex++}`;
            values.push(value);
        }
    }

    query += ` ORDER BY i.id DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};