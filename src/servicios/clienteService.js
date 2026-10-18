import pool from '../config/db.js';

export const listarClientes = async () => {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
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
