-- Insert sample users
INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
('Admin Sistema', 'admin@almacen.com', '$2a$10$8L4DvYdCYkVl2YOXn7U5h.8t5Z1YYZLZZo3LqE2qSZdVpUMVqMbTe', 'admin', true),
('Juan Pérez', 'juan.perez@almacen.com', '$2a$10$8L4DvYdCYkVl2YOXn7U5h.8t5Z1YYZLZZo3LqE2qSZdVpUMVqMbTe', 'almacenero', true),
('María García', 'maria.garcia@almacen.com', '$2a$10$8L4DvYdCYkVl2YOXn7U5h.8t5Z1YYZLZZo3LqE2qSZdVpUMVqMbTe', 'supervisor', true),
('Carlos López', 'carlos.lopez@almacen.com', '$2a$10$8L4DvYdCYkVl2YOXn7U5h.8t5Z1YYZLZZo3LqE2qSZdVpUMVqMbTe', 'reportero', true);

-- Insert sample projects
INSERT INTO proyectos (nombre, descripcion, ubicacion, cliente, fecha_inicio, fecha_fin, presupuesto, responsable_id, estado) VALUES
('Proyecto Edificio A', 'Construcción de edificio de 10 pisos', 'Calle Principal 123', 'Construcciones XYZ', '2026-01-15', '2027-01-15', 500000.00, 3, 'activo'),
('Proyecto Puente B', 'Reparación y ampliación de puente', 'Km 25 Carretera Sur', 'Obras Públicas', '2026-02-01', '2026-12-31', 750000.00, 3, 'activo'),
('Proyecto Casa C', 'Construcción de vivienda unifamiliar', 'Avenida Central 456', 'Cliente Privado', '2026-03-01', '2026-09-30', 150000.00, 3, 'activo');

-- Insert sample materials
INSERT INTO materiales (codigo, nombre, descripcion, unidad_medida, stock_minimo, stock_actual, precio_unitario, proyecto_id, partida_presupuestal, estado) VALUES
('MAT-001', 'Cemento Portland', 'Bolsa 50kg', 'bolsa', 100, 500, 8.50, 1, '1.2.3', 'activo'),
('MAT-002', 'Arena Gruesa', 'Metro cúbico', 'm3', 50, 200, 25.00, 1, '1.2.3', 'activo'),
('MAT-003', 'Grava', 'Metro cúbico', 'm3', 50, 150, 30.00, 1, '1.2.3', 'activo'),
('MAT-004', 'Varilla de Acero', '12mm diámetro', 'varilla', 200, 800, 12.50, 1, '1.2.4', 'activo'),
('MAT-005', 'Tubo PVC', '2 pulgadas', 'tubo', 100, 300, 5.75, 2, '1.3.2', 'activo'),
('MAT-006', 'Ladrillo Rojo', 'Por mil', 'mil', 100, 2000, 180.00, 1, '1.2.2', 'activo'),
('MAT-007', 'Pintura Látex', 'Galón blanco', 'galón', 50, 250, 22.00, 1, '1.4.1', 'activo'),
('MAT-008', 'Vidrio Claro', 'Metro cuadrado', 'm2', 50, 120, 18.50, 3, '1.4.2', 'activo');

-- Insert sample movements (KARDEX)
INSERT INTO movimientos (numero_kardex, tipo, material_id, cantidad, precio_unitario, valor_total, proyecto_id, responsable_id, usuario_id, observaciones, fecha) VALUES
('KARDEX-20260601-001', 'ingreso', 1, 500, 8.50, 4250.00, 1, 2, 1, 'Compra a proveedor principal', NOW() - INTERVAL '10 days'),
('KARDEX-20260602-001', 'salida', 1, 50, 8.50, 425.00, 1, 2, 1, 'Uso en obra primer piso', NOW() - INTERVAL '9 days'),
('KARDEX-20260603-001', 'ingreso', 2, 200, 25.00, 5000.00, 1, 2, 1, 'Entrega de arena', NOW() - INTERVAL '8 days'),
('KARDEX-20260604-001', 'salida', 2, 75, 25.00, 1875.00, 1, 2, 1, 'Uso en mezcla de concreto', NOW() - INTERVAL '7 days'),
('KARDEX-20260605-001', 'ingreso', 4, 800, 12.50, 10000.00, 1, 2, 1, 'Varilla de acero', NOW() - INTERVAL '6 days');
