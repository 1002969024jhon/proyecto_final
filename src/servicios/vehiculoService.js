import pool from '../config/db.js';

export const listarVehiculos = async () => {
    const result = await pool.query(`
        SELECT v.*, c.nombre AS cliente_nombre, c.documento AS cliente_documento
        FROM vehiculos v
        JOIN clientes c ON v.cliente_id = c.id
        ORDER BY v.id DESC
    `);
    return result.rows;
};

export const obtenerVehiculoPorId = async (id) => {
    const result = await pool.query('SELECT * FROM vehiculos WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const crearVehiculo = async ({ placa, marca, modelo, anio, cliente_id, kilometraje, estado }) => {
    const result = await pool.query(
        `INSERT INTO vehiculos (placa, marca, modelo, anio, cliente_id, kilometraje, estado, activo)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'disponible'), true) RETURNING *`,
        [placa, marca, modelo, anio, cliente_id, kilometraje, estado]
    );
    return result.rows[0];
};

export const actualizarVehiculo = async (id, { placa, marca, modelo, anio, cliente_id }) => {
    const result = await pool.query(
        'UPDATE vehiculos SET placa = $1, marca = $2, modelo = $3, anio = $4, cliente_id = $5 WHERE id = $6 RETURNING *',
        [placa, marca, modelo, anio, cliente_id, id]
    );
    return result.rows[0] || null;
};

export const desactivarVehiculo = async (id) => {
    const result = await pool.query(
        'UPDATE vehiculos SET activo = false WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
};
