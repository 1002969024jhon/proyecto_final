import pool from '../config/db.js';

export const listarOrdenes = async (filtros = {}) => {
    let query = `
        SELECT o.*, v.placa AS vehiculo_placa, t.nombre AS tecnico_nombre, u.nombre AS usuario_nombre
        FROM ordenes o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        JOIN tecnicos t ON o.tecnico_id = t.id
        JOIN usuarios u ON o.usuario_id = u.id
        WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    // Lista de columnas permitidas en la tabla ordenes para mayor seguridad
    const columnasValidas = ['estado', 'tipo', 'vehiculo_id', 'tecnico_id', 'usuario_id', 'numero'];

    // Recorremos dinámicamente cada filtro que venga en la URL
    for (const [key, value] of Object.entries(filtros)) {
        if (value && columnasValidas.includes(key)) {
            query += ` AND o.${key} = $${paramIndex++}`;
            values.push(value);
        }
    }

    query += ` ORDER BY o.id DESC`;

    const result = await pool.query(query, values);
    return result.rows;
};

export const obtenerOrdenPorId = async (id) => {
    const ordenResult = await pool.query(`
        SELECT o.*, v.placa AS vehiculo_placa, t.nombre AS tecnico_nombre, u.nombre AS usuario_nombre
        FROM ordenes o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        JOIN tecnicos t ON o.tecnico_id = t.id
        JOIN usuarios u ON o.usuario_id = u.id
        WHERE o.id = $1
    `, [id]);

    if (ordenResult.rows.length === 0) {
        return null;
    }

    const detalleResult = await pool.query(`
        SELECT d.*, r.codigo AS repuesto_codigo, r.nombre AS repuesto_nombre
        FROM detalle_orden d
        JOIN repuestos r ON d.repuesto_id = r.id
        WHERE d.orden_id = $1
    `, [id]);

    return {
        orden: ordenResult.rows[0],
        detalles: detalleResult.rows
    };
};

export const crearOrden = async ({ 
    vehiculo_id, 
    tecnico_id, 
    usuario_id, 
    descripcion, 
    tipo, 
    mano_obra, 
    repuestos,
    ip = '::1',
    user_agent = 'PostmanRuntime'
}) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Validar que el array de repuestos sea válido
        if (!repuestos || !Array.isArray(repuestos) || repuestos.length === 0) {
            throw new Error('La orden debe incluir un array de repuestos válido.');
        }

        // 2. Validar que el vehículo exista en la base de datos
        const vehiculoRes = await client.query('SELECT id FROM vehiculos WHERE id = $1', [vehiculo_id]);
        if (vehiculoRes.rows.length === 0) {
            throw new Error(`El vehículo con ID ${vehiculo_id} no existe.`);
        }

        // 3. Validar que el técnico exista en la base de datos
        const tecnicoRes = await client.query('SELECT id FROM tecnicos WHERE id = $1', [tecnico_id]);
        if (tecnicoRes.rows.length === 0) {
            throw new Error(`El técnico con ID ${tecnico_id} no existe.`);
        }

        

        const ultimoRes = await client.query('SELECT id FROM ordenes ORDER BY id DESC LIMIT 1');
        const siguienteId = ultimoRes.rows.length > 0 ? ultimoRes.rows[0].id + 1 : 1;
        const numero = `ORD-${String(siguienteId).padStart(3, '0')}`;

        let totalRepuestosCalculado = 0;
        const detallesCalculados = [];

        for (const item of repuestos) {
            const { repuesto_id, cantidad } = item;

            if (!cantidad || cantidad <= 0) {
                throw new Error(`La cantidad para el repuesto ID ${repuesto_id} debe ser mayor a cero.`);
            }

            const repuestoRes = await client.query(
                'SELECT id, precio_unitario, stock FROM repuestos WHERE id = $1 FOR UPDATE',
                [repuesto_id]
            );

            if (repuestoRes.rows.length === 0) {
                throw new Error(`El repuesto con ID ${repuesto_id} no existe.`);
            }

            const repuesto = repuestoRes.rows[0];

            if (repuesto.stock < cantidad) {
                throw new Error(`Stock insuficiente para el repuesto ID ${repuesto_id}. Stock actual: ${repuesto.stock}, solicitado: ${cantidad}`);
            }

            const precio_unitario = Number(repuesto.precio_unitario);
            const subtotal = precio_unitario * cantidad;
            totalRepuestosCalculado += subtotal;

            detallesCalculados.push({
                repuesto_id,
                cantidad,
                precio_unitario,
                subtotal,
                stock_antes: repuesto.stock,
                stock_despues: repuesto.stock - cantidad
            });
        }

        const manoObraValor = Number(mano_obra || 0);
        const totalOrden = totalRepuestosCalculado + manoObraValor;

        const ordenResult = await client.query(
            `INSERT INTO ordenes (numero, vehiculo_id, tecnico_id, usuario_id, descripcion, tipo, mano_obra, total_repuestos, total, estado)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'preventivo'), $7, $8, $9, 'abierta')
             RETURNING *`,
            [numero, vehiculo_id, tecnico_id, usuario_id, descripcion, tipo, manoObraValor, totalRepuestosCalculado, totalOrden]
        );
        const nuevaOrden = ordenResult.rows[0];

        for (const detalle of detallesCalculados) {
            await client.query(
                `INSERT INTO detalle_orden (orden_id, repuesto_id, cantidad, precio_unitario, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [nuevaOrden.id, detalle.repuesto_id, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
            );

            await client.query(
                'UPDATE repuestos SET stock = stock - $1 WHERE id = $2',
                [detalle.cantidad, detalle.repuesto_id]
            );

            await client.query(
                `INSERT INTO inventario (repuesto_id, orden_id, usuario_id, tipo, cantidad, stock_antes, stock_despues, motivo)
                 VALUES ($1, $2, $3, 'consumo', $4, $5, $6, $7)`,
                [
                    detalle.repuesto_id,
                    nuevaOrden.id,
                    usuario_id,
                    detalle.cantidad,
                    detalle.stock_antes,
                    detalle.stock_despues,
                    `Consumo por orden de mantenimiento N° ${numero}`
                ]
            );
        }

        await client.query(
            `INSERT INTO auditoria (
                usuario_id, 
                accion, 
                metodo, 
                ruta, 
                recurso, 
                recurso_id, 
                datos_nuevos, 
                codigo_http, 
                ip, 
                user_agent, 
                fecha
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
            [
                usuario_id,
                'CREAR',
                'POST',
                '/api/ordenes',
                'ordenes',
                String(nuevaOrden.id),
                JSON.stringify(nuevaOrden),
                201,
                ip,
                user_agent
            ]
        );

        await client.query('COMMIT');
        return { orden: nuevaOrden, detalles: detallesCalculados };
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error en ROLLBACK:', rollbackError.message);
        }
        throw error;
    } finally {
        client.release();
    }
};

export const finalizarOrden = async (id) => {
    const actual = await pool.query('SELECT id, estado FROM ordenes WHERE id = $1', [id]);

    if (actual.rows.length === 0) {
        return { orden: null, motivo: 'no_encontrada' };
    }

    const estado = actual.rows[0].estado;

    if (estado === 'finalizada') {
        return { orden: null, motivo: 'ya_finalizada' };
    }

    if (estado === 'anulada') {
        return { orden: null, motivo: 'anulada' };
    }

    const result = await pool.query(
        `UPDATE ordenes
         SET estado = 'finalizada', finalizada_en = NOW()
         WHERE id = $1 AND estado IN ('abierta', 'en_proceso')
         RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        return { orden: null, motivo: 'no_actualizada' };
    }

    return { orden: result.rows[0], motivo: null };
};