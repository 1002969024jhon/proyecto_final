import pool from '../config/db.js';

export const listarRepuestos = async (filtros = {}) => {
    let query = `SELECT * FROM repuestos WHERE 1=1`;
    const values = [];
    let paramIndex = 1;
    const columnasValidas = ['nombre', 'codigo'];

    for (const [key, value] of Object.entries(filtros)) {
        if (value && columnasValidas.includes(key)) {
            query += ` AND ${key} ILIKE $${paramIndex++}`;
            values.push(`%${value}%`);
        }
    }

    query += ` ORDER BY id DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const obtenerRepuestoPorId = async (id) => {
    const result = await pool.query('SELECT * FROM repuestos WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const crearRepuesto = async ({ codigo, nombre, descripcion, precio_unitario, stock, stock_minimo }) => {
    const result = await pool.query(
        `INSERT INTO repuestos (codigo, nombre, descripcion, precio_unitario, stock, stock_minimo, activo)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, 0), true) RETURNING *`,
        [codigo, nombre, descripcion, precio_unitario, stock, stock_minimo]
    );
    return result.rows[0];
};

export const actualizarRepuesto = async (id, { codigo, nombre, descripcion, precio_unitario, stock, stock_minimo, activo }) => {
    const result = await pool.query(
        `UPDATE repuestos
         SET codigo = COALESCE($1, codigo),
             nombre = COALESCE($2, nombre),
             descripcion = COALESCE($3, descripcion),
             precio_unitario = COALESCE($4, precio_unitario),
             stock = COALESCE($5, stock),
             stock_minimo = COALESCE($6, stock_minimo),
             activo = COALESCE($7, activo)
         WHERE id = $8 RETURNING *`,
        [codigo, nombre, descripcion, precio_unitario, stock, stock_minimo, activo, id]
    );
    return result.rows[0] || null;
};

export const desactivarRepuesto = async (id) => {
    const result = await pool.query(
        'UPDATE repuestos SET activo = false WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
};
