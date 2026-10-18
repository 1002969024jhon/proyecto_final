import pool from '../config/db.js';

// Listar órdenes (con sus detalles básicos)
export const getOrdenes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, v.placa AS vehiculo_placa, t.nombre AS tecnico_nombre, u.nombre AS usuario_nombre
            FROM ordenes o
            JOIN vehiculos v ON o.vehiculo_id = v.id
            JOIN tecnicos t ON o.tecnico_id = t.id
            JOIN usuarios u ON o.usuario_id = u.id
            ORDER BY o.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar las órdenes.' });
    }
};

// Consultar una orden y su detalle específico
export const getOrdenById = async (req, res) => {
    const { id } = req.params;
    try {
        const ordenResult = await pool.query(`
            SELECT o.*, v.placa AS vehiculo_placa, t.nombre AS tecnico_nombre, u.nombre AS usuario_nombre
            FROM ordenes o
            JOIN vehiculos v ON o.vehiculo_id = v.id
            JOIN tecnicos t ON o.tecnico_id = t.id
            JOIN usuarios u ON o.usuario_id = u.id
            WHERE o.id = $1
        `, [id]);

        if (ordenResult.rows.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada.' });
        }

        const detalleResult = await pool.query(`
            SELECT d.*, r.codigo AS repuesto_codigo, r.nombre AS repuesto_nombre
            FROM detalle_orden d
            JOIN repuestos r ON d.repuesto_id = r.id
            WHERE d.orden_id = $1
        `, [id]);

        res.json({
            orden: ordenResult.rows[0],
            detalles: detalleResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el detalle de la orden.' });
    }
};

// OPERACIÓN TRANSACCIONAL : Crear orden y consumir repuestos
export const crearOrden = async (req, res) => {
    const { vehiculo_id, tecnico_id, descripcion, tipo, mano_obra, repuestos } = req.body;
    const usuario_id = req.usuario ? req.usuario.id : 1; 

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Iniciar transacción

        // --- GENERAR CONSECUTIVO AUTOMÁTICO (Ej: ORD-001, ORD-002...) ---
        const ultimoRes = await client.query('SELECT id FROM ordenes ORDER BY id DESC LIMIT 1');
        const siguienteId = ultimoRes.rows.length > 0 ? ultimoRes.rows[0].id + 1 : 1;
        const numero = `ORD-${String(siguienteId).padStart(3, '0')}`;
        // -------------------------------------------------------------

        let totalRepuestosCalculado = 0;
        const detallesCalculados = [];

        // 1. Validar y bloquear filas de repuestos, verificar stock y calcular subtotales
        if (repuestos && repuestos.length > 0) {
            for (const item of repuestos) {
                const { repuesto_id, cantidad } = item;

                if (!cantidad || cantidad <= 0) {
                    throw new Error(`La cantidad para el repuesto ID ${repuesto_id} debe ser mayor a cero.`);
                }

                // Bloquear la fila del repuesto para evitar condiciones de carrera (FOR UPDATE)
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
        }

        const manoObraValor = Number(mano_obra || 0);
        const totalOrden = totalRepuestosCalculado + manoObraValor;

        // 2. Insertar la cabecera de la orden con el número consecutivo limpio
        const ordenQuery = `
            INSERT INTO ordenes (numero, vehiculo_id, tecnico_id, usuario_id, descripcion, tipo, mano_obra, total_repuestos, total, estado)
            VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'preventivo'), $7, $8, $9, 'abierta')
            RETURNING *;
        `;
        const ordenValues = [numero, vehiculo_id, tecnico_id, usuario_id, descripcion, tipo, manoObraValor, totalRepuestosCalculado, totalOrden];
        const ordenResult = await client.query(ordenQuery, ordenValues);
        const nuevaOrden = ordenResult.rows[0];

        // 3. Insertar detalles, descontar repuestos y registrar movimientos de inventario
        for (const detalle of detallesCalculados) {
            await client.query(
                `INSERT INTO detalle_orden (orden_id, repuesto_id, cantidad, precio_unitario, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [nuevaOrden.id, detalle.repuesto_id, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
            );

            await client.query(
                `UPDATE repuestos SET stock = stock - $1 WHERE id = $2`,
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

        await client.query('COMMIT'); 

        req.auditData = { recurso: 'ordenes', recurso_id: nuevaOrden.id, datos_nuevos: nuevaOrden };

        res.status(201).json({
            mensaje: 'Orden creada exitosamente con número consecutivo.',
            orden: nuevaOrden,
            detalles: detallesCalculados
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Error transaccional en orden (ROLLBACK ejecutado):', error.message);
        res.status(400).json({ error: error.message || 'Error al procesar la orden transaccional.' });
    } finally {
        client.release();
    }
};