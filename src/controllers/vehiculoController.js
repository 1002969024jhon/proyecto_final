import * as vehiculoService from '../services/vehiculoService.js';

export const getVehiculos = async (req, res) => {
    try {
        const vehiculos = await vehiculoService.listarVehiculos();
        res.json(vehiculos);
    } catch (error) {
        console.error('Error al listar vehículos:', error);
        res.status(500).json({ error: 'Error interno al listar vehículos.' });
    }
};

export const getVehiculoById = async (req, res) => {
    const { id } = req.params;
    try {
        const vehiculo = await vehiculoService.obtenerVehiculoPorId(id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json(vehiculo);
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const crearVehiculo = async (req, res) => {
    const { placa, marca, modelo, anio, cliente_id, kilometraje, estado } = req.body;
    try {
        const vehiculo = await vehiculoService.crearVehiculo({ placa, marca, modelo, anio, cliente_id, kilometraje, estado });
        res.status(201).json({
            mensaje: 'Vehículo creado exitosamente.',
            vehiculo
        });
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        res.status(500).json({ error: 'Error interno al crear el vehículo.' });
    }
};

export const updateVehiculo = async (req, res) => {
    const { id } = req.params;
    const { placa, marca, modelo, anio, cliente_id } = req.body;
    try {
        const vehiculo = await vehiculoService.actualizarVehiculo(id, { placa, marca, modelo, anio, cliente_id });
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json(vehiculo);
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({ error: 'Error interno al actualizar el vehículo.', detalle: error.message });
    }
};

export const deleteVehiculo = async (req, res) => {
    const { id } = req.params;
    try {
        const vehiculo = await vehiculoService.desactivarVehiculo(id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json({ mensaje: 'Vehículo desactivado correctamente', vehiculo });
    } catch (error) {
        console.error('Error al desactivar vehículo:', error);
        res.status(500).json({ error: 'Error interno al desactivar el vehículo.', detalle: error.message });
    }
};
