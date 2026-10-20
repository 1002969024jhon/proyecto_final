-- Datos de prueba de AutoServi.
-- Contraseña de todos los usuarios: Password123!
-- El hash es bcrypt real con 10 rondas.

BEGIN;

INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
('Admin Sistema', 'admin@autoservi.com', '$2b$10$ThDw752EvmViLDz7wdi1KeOTS4.hc.mH.3UlZNQypvSw2btrQetKu', 'administrador'),
('Operador Taller', 'operador@autoservi.com', '$2b$10$ThDw752EvmViLDz7wdi1KeOTS4.hc.mH.3UlZNQypvSw2btrQetKu', 'operador'),
('Usuario Consulta', 'consulta@autoservi.com', '$2b$10$ThDw752EvmViLDz7wdi1KeOTS4.hc.mH.3UlZNQypvSw2btrQetKu', 'consulta'),
('Auditor General', 'auditor@autoservi.com', '$2b$10$ThDw752EvmViLDz7wdi1KeOTS4.hc.mH.3UlZNQypvSw2btrQetKu', 'auditor')
ON CONFLICT (correo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    rol = EXCLUDED.rol;

INSERT INTO clientes (documento, nombre, correo, telefono) VALUES
('1002003001', 'Laura Gómez', 'laura.gomez@correo.com', '3001112233'),
('1002003002', 'Carlos Pérez', 'carlos.perez@correo.com', '3004445566')
ON CONFLICT (documento) DO NOTHING;

INSERT INTO vehiculos (placa, marca, modelo, anio, cliente_id, kilometraje, estado) VALUES
(
    'ABC123',
    'Chevrolet',
    'Onix',
    2020,
    (SELECT id FROM clientes WHERE documento = '1002003001'),
    45000,
    'en_taller'
),
(
    'XYZ987',
    'Renault',
    'Duster',
    2018,
    (SELECT id FROM clientes WHERE documento = '1002003002'),
    82000,
    'disponible'
)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO tecnicos (codigo, nombre, especialidad) VALUES
('TEC-001', 'Andrés Rojas', 'Motor'),
('TEC-002', 'Marta Díaz', 'Frenos')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO repuestos (codigo, nombre, descripcion, precio_unitario, stock, stock_minimo) VALUES
('REP-ACEITE', 'Filtro de aceite', 'Filtro para cambio de aceite', 45000, 8, 2),
('REP-PASTILLAS', 'Pastillas de freno', 'Juego delantero', 120000, 5, 1),
('REP-BUJIA', 'Bujía', 'Bujía de encendido', 18000, 20, 4)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO ordenes (
    numero, vehiculo_id, tecnico_id, usuario_id, descripcion, tipo, estado,
    mano_obra, total_repuestos, total
)
SELECT
    'ORD-001',
    v.id,
    t.id,
    u.id,
    'Cambio de aceite y revisión de frenos',
    'preventivo',
    'abierta',
    80000,
    210000,
    290000
FROM vehiculos v
JOIN tecnicos t ON t.codigo = 'TEC-001'
JOIN usuarios u ON u.correo = 'operador@autoservi.com'
WHERE v.placa = 'ABC123'
ON CONFLICT (numero) DO NOTHING;

INSERT INTO detalle_orden (orden_id, repuesto_id, cantidad, precio_unitario, subtotal)
SELECT o.id, r.id, 2, 45000, 90000
FROM ordenes o
JOIN repuestos r ON r.codigo = 'REP-ACEITE'
WHERE o.numero = 'ORD-001'
  AND NOT EXISTS (
      SELECT 1 FROM detalle_orden d
      WHERE d.orden_id = o.id AND d.repuesto_id = r.id
  );

INSERT INTO detalle_orden (orden_id, repuesto_id, cantidad, precio_unitario, subtotal)
SELECT o.id, r.id, 1, 120000, 120000
FROM ordenes o
JOIN repuestos r ON r.codigo = 'REP-PASTILLAS'
WHERE o.numero = 'ORD-001'
  AND NOT EXISTS (
      SELECT 1 FROM detalle_orden d
      WHERE d.orden_id = o.id AND d.repuesto_id = r.id
  );

INSERT INTO inventario (
    repuesto_id, orden_id, usuario_id, tipo, cantidad, stock_antes, stock_despues, motivo
)
SELECT r.id, o.id, u.id, 'consumo', 2, 10, 8, 'Consumo por orden de mantenimiento N° ORD-001'
FROM repuestos r
JOIN ordenes o ON o.numero = 'ORD-001'
JOIN usuarios u ON u.correo = 'operador@autoservi.com'
WHERE r.codigo = 'REP-ACEITE'
  AND NOT EXISTS (
      SELECT 1 FROM inventario i
      WHERE i.orden_id = o.id AND i.repuesto_id = r.id AND i.tipo = 'consumo'
  );

INSERT INTO inventario (
    repuesto_id, orden_id, usuario_id, tipo, cantidad, stock_antes, stock_despues, motivo
)
SELECT r.id, o.id, u.id, 'consumo', 1, 6, 5, 'Consumo por orden de mantenimiento N° ORD-001'
FROM repuestos r
JOIN ordenes o ON o.numero = 'ORD-001'
JOIN usuarios u ON u.correo = 'operador@autoservi.com'
WHERE r.codigo = 'REP-PASTILLAS'
  AND NOT EXISTS (
      SELECT 1 FROM inventario i
      WHERE i.orden_id = o.id AND i.repuesto_id = r.id AND i.tipo = 'consumo'
  );

COMMIT;
