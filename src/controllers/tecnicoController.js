import {
    listarTecnicos,
    obtenerTecnicoPorId,
    crearTecnico as guardarTecnico,
    actualizarTecnico as guardarCambiosTecnico,
    desactivarTecnico as desactivarTecnicoEnBd
} from '../servicios/tecnicoService.js';

export const getTecnicos = async (req, res) => {
    try {
        const tecnicos = await listarTecnicos();
        res.json(tecnicos);
    } catch (error) {
        console.error('Error al listar técnicos:', error);
        res.status(500).json({ error: 'Error interno al listar técnicos.' });
    }
};

export const getTecnicoById = async (req, res) => {
    const { id } = req.params;
    try {
        const tecnico = await obtenerTecnicoPorId(id);
        if (!tecnico) {
            return res.status(404).json({ error: 'Técnico no encontrado.' });
        }
        res.json(tecnico);
    } catch (error) {
        console.error('Error al buscar técnico:', error);
        res.status(500).json({ error: 'Error interno al buscar el técnico.' });
    }
};

export const crearTecnico = async (req, res) => {
    const { codigo, nombre, especialidad } = req.body;
    try {
        const tecnico = await guardarTecnico({ codigo, nombre, especialidad });
        res.status(201).json({
            mensaje: 'Técnico creado exitosamente.',
            tecnico
        });
    } catch (error) {
        console.error('Error al crear técnico:', error);
        res.status(500).json({ error: 'Error interno al crear el técnico.' });
    }
};

export const actualizarTecnico = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, especialidad, activo } = req.body;
    try {
        const tecnico = await guardarCambiosTecnico(id, { codigo, nombre, especialidad, activo });
        if (!tecnico) {
            return res.status(404).json({ error: 'Técnico no encontrado para actualizar.' });
        }
        res.json({
            mensaje: 'Técnico actualizado exitosamente.',
            tecnico
        });
    } catch (error) {
        console.error('Error al actualizar técnico:', error);
        res.status(500).json({ error: 'Error interno al actualizar el técnico.' });
    }
};

export const desactivarTecnico = async (req, res) => {
    const { id } = req.params;
    try {
        const tecnico = await desactivarTecnicoEnBd(id);
        if (!tecnico) {
            return res.status(404).json({ error: 'Técnico no encontrado.' });
        }
        res.json({
            mensaje: 'Técnico desactivado exitosamente.',
            tecnico
        });
    } catch (error) {
        console.error('Error al desactivar técnico:', error);
        res.status(500).json({ error: 'Error interno al desactivar el técnico.' });
    }
};
