import pool from '../config/db.js';

export const listarClientes = async (filtros = {}) => {
    let query = `SELECT * FROM clientes WHERE 1=1`;
    const values = [];
    let paramIndex = 1;
    
    const columnasValidas = ['documento', 'nombre', 'correo', 'telefono', 'activo'];

    for (const [key, value] of Object.entries(filtros)) {
        if (value !== undefined && value !== '' && columnasValidas.includes(key)) {
            if (key === 'activo') {
                query += ` AND activo = $${paramIndex++}`;
                values.push(value === 'true' || value === true);
            } else {
                query += ` AND ${key} ILIKE $${paramIndex++}`;
                values.push(`%${value}%`);
            }
        }
    }

    query += ` ORDER BY id DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const obtenerClientePorId = async (id) => {
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const crearCliente = async ({ documento, nombre, correo, telefono }) => {
    const result = await pool.query(
        `INSERT INTO clientes (documento, nombre, correo, telefono, activo)
         VALUES ($1, $2, $3, $4, true) RETURNING *`,
        [documento, nombre, correo, telefono]
    );
    return result.rows[0];
};

export const actualizarCliente = async (id, { documento, nombre, correo, telefono, activo }) => {
    const result = await pool.query(
        `UPDATE clientes
         SET documento = COALESCE($1, documento),
             nombre = COALESCE($2, nombre),
             correo = COALESCE($3, correo),
             telefono = COALESCE($4, telefono),
             activo = COALESCE($5, activo)
         WHERE id = $6 RETURNING *`,
        [documento, nombre, correo, telefono, activo, id]
    );
    return result.rows[0] || null;
};

export const desactivarCliente = async (id) => {
    const result = await pool.query(
        'UPDATE clientes SET activo = false WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
};
