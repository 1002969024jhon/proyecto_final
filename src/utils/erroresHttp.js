const MENSAJES_UNICOS = {
    clientes_documento_key: 'El documento ya está registrado',
    vehiculos_placa_key: 'La placa ya está registrada',
    tecnicos_codigo_key: 'El código de técnico ya está registrado',
    repuestos_codigo_key: 'El código de repuesto ya está registrado',
    usuarios_correo_key: 'El correo electrónico ya está registrado',
    ordenes_numero_key: 'El número de orden ya existe'
};

const CODIGOS_DATOS_INVALIDOS = new Set([
    '23502',
    '23503',
    '23514',
    '22P02',
    '22001',
    '22003'
]);

export const responderErrorBd = (res, error, mensajeInterno) => {
    console.error(mensajeInterno, error);

    if (error.code === '23505') {
        const mensaje = MENSAJES_UNICOS[error.constraint] || 'Ya existe un registro con ese valor único';
        return res.status(409).json({ error: mensaje });
    }

    if (CODIGOS_DATOS_INVALIDOS.has(error.code)) {
        return res.status(400).json({ error: 'Los datos enviados son inválidos o están incompletos' });
    }

    return res.status(500).json({ error: mensajeInterno });
};
