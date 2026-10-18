import {
    listarClientes,
    obtenerClientePorId,
    crearCliente as guardarCliente,
    actualizarCliente as guardarCambiosCliente,
    desactivarCliente as desactivarClienteEnBd
} from '../servicios/clienteService.js';

export const getClientes = async (req, res) => {
    try {
        const clientes = await listarClientes();
        res.json(clientes);
    } catch (error) {
        console.error('Error al listar clientes:', error);
        res.status(500).json({ error: 'Error interno al listar clientes.' });
    }
};

export const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await obtenerClientePorId(id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json(cliente);
    } catch (error) {
        console.error('Error al buscar cliente:', error);
        res.status(500).json({ error: 'Error interno al buscar el cliente.' });
    }
};

export const crearCliente = async (req, res) => {
    const { documento, nombre, correo, telefono } = req.body;
    try {
        const cliente = await guardarCliente({ documento, nombre, correo, telefono });
        res.status(201).json({
            mensaje: 'Cliente creado exitosamente.',
            cliente
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: 'Error interno al crear el cliente.' });
    }
};

export const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { documento, nombre, correo, telefono, activo } = req.body;
    try {
        const cliente = await guardarCambiosCliente(id, { documento, nombre, correo, telefono, activo });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado para actualizar.' });
        }
        res.json({
            mensaje: 'Cliente actualizado exitosamente.',
            cliente
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error interno al actualizar el cliente.' });
    }
};

export const desactivarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await desactivarClienteEnBd(id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json({
            mensaje: 'Cliente desactivado exitosamente.',
            cliente
        });
    } catch (error) {
        console.error('Error al desactivar cliente:', error);
        res.status(500).json({ error: 'Error interno al desactivar el cliente.' });
    }
};
