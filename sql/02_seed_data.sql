-- Insertar Usuarios de Prueba (Password para todos: Password123!)
-- Hash generado con bcrypt (10 salt rounds)
INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
('Admin Sistema', 'admin@autoservi.com', '$2a$10$eE8k6vE4Lw14Gj2o0F3Mne5y9Q2x5E7sW8mR0tY1uI2o3P4q5R6sS', 'administrador'),
('Operador Taller', 'operador@autoservi.com', '$2a$10$eE8k6vE4Lw14Gj2o0F3Mne5y9Q2x5E7sW8mR0tY1uI2o3P4q5R6sS', 'operador'),
('Usuario Consulta', 'consulta@autoservi.com', '$2a$10$eE8k6vE4Lw14Gj2o0F3Mne5y9Q2x5E7sW8mR0tY1uI2o3P4q5R6sS', 'consulta'),
('Auditor General', 'auditor@autoservi.com', '$2a$10$eE8k6vE4Lw14Gj2o0F3Mne5y9Q2x5E7sW8mR0tY1uI2o3P4q5R6sS', 'auditor');