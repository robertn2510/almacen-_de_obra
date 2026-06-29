-- Create database
CREATE DATABASE almacen_obra_db;

\c almacen_obra_db;

-- Create ENUM types
CREATE TYPE rol_enum AS ENUM ('admin', 'supervisor', 'almacenero', 'reportero');
CREATE TYPE tipo_movimiento AS ENUM ('ingreso', 'salida');
CREATE TYPE estado_proyecto AS ENUM ('activo', 'pausado', 'finalizado');
CREATE TYPE estado_material AS ENUM ('activo', 'descontinuado');

-- Table: Usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol rol_enum DEFAULT 'almacenero',
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Table: Proyectos
CREATE TABLE proyectos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  ubicacion VARCHAR(255),
  cliente VARCHAR(150),
  fecha_inicio DATE,
  fecha_fin DATE,
  presupuesto DECIMAL(15, 2) DEFAULT 0,
  responsable_id INTEGER REFERENCES usuarios(id),
  estado estado_proyecto DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_responsable ON proyectos(responsable_id);

-- Table: Materiales
CREATE TABLE materiales (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  unidad_medida VARCHAR(20),
  stock_minimo DECIMAL(10, 2) DEFAULT 0,
  stock_actual DECIMAL(10, 2) DEFAULT 0,
  precio_unitario DECIMAL(12, 2) DEFAULT 0,
  proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE SET NULL,
  partida_presupuestal VARCHAR(50),
  estado estado_material DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_materiales_codigo ON materiales(codigo);
CREATE INDEX idx_materiales_proyecto ON materiales(proyecto_id);
CREATE INDEX idx_materiales_stock ON materiales(stock_actual);

-- Table: Movimientos (KARDEX)
CREATE TABLE movimientos (
  id SERIAL PRIMARY KEY,
  numero_kardex VARCHAR(50) UNIQUE NOT NULL,
  tipo tipo_movimiento NOT NULL,
  material_id INTEGER NOT NULL REFERENCES materiales(id),
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(12, 2),
  valor_total DECIMAL(15, 2),
  proyecto_id INTEGER REFERENCES proyectos(id),
  responsable_id INTEGER REFERENCES usuarios(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  partida_presupuestal VARCHAR(50),
  observaciones TEXT,
  fecha TIMESTAMP DEFAULT NOW(),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_movimientos_material ON movimientos(material_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_proyecto ON movimientos(proyecto_id);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);

-- Table: Ingresos de Materiales
CREATE TABLE ingresos (
  id SERIAL PRIMARY KEY,
  numero_ingreso VARCHAR(50) UNIQUE NOT NULL,
  proveedor VARCHAR(150),
  fecha_ingreso TIMESTAMP DEFAULT NOW(),
  proyecto_id INTEGER REFERENCES proyectos(id),
  responsable_id INTEGER REFERENCES usuarios(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'completado',
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ingresos_fecha ON ingresos(fecha_ingreso);
CREATE INDEX idx_ingresos_proyecto ON ingresos(proyecto_id);

-- Table: Detalles de Ingreso
CREATE TABLE detalles_ingreso (
  id SERIAL PRIMARY KEY,
  ingreso_id INTEGER NOT NULL REFERENCES ingresos(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materiales(id),
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(12, 2),
  lote VARCHAR(50),
  fecha_vencimiento DATE
);

-- Table: Salidas de Materiales
CREATE TABLE salidas (
  id SERIAL PRIMARY KEY,
  numero_salida VARCHAR(50) UNIQUE NOT NULL,
  destino VARCHAR(150),
  solicitante VARCHAR(150),
  fecha_salida TIMESTAMP DEFAULT NOW(),
  proyecto_id INTEGER REFERENCES proyectos(id),
  responsable_id INTEGER REFERENCES usuarios(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'completado',
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_salidas_fecha ON salidas(fecha_salida);
CREATE INDEX idx_salidas_proyecto ON salidas(proyecto_id);

-- Table: Detalles de Salida
CREATE TABLE detalles_salida (
  id SERIAL PRIMARY KEY,
  salida_id INTEGER NOT NULL REFERENCES salidas(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materiales(id),
  cantidad DECIMAL(10, 2) NOT NULL
);

-- Table: PECOSA (Parte de Egreso de Caja Almacén)
CREATE TABLE pecosa (
  id SERIAL PRIMARY KEY,
  numero_pecosa VARCHAR(50) UNIQUE NOT NULL,
  fecha_pecosa TIMESTAMP DEFAULT NOW(),
  proyecto_id INTEGER REFERENCES proyectos(id),
  solicitante VARCHAR(150),
  descripcion TEXT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  estado VARCHAR(20) DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pecosa_fecha ON pecosa(fecha_pecosa);
CREATE INDEX idx_pecosa_proyecto ON pecosa(proyecto_id);
CREATE INDEX idx_pecosa_estado ON pecosa(estado);

-- Table: Detalles PECOSA
CREATE TABLE detalles_pecosa (
  id SERIAL PRIMARY KEY,
  pecosa_id INTEGER NOT NULL REFERENCES pecosa(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materiales(id),
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(12, 2),
  valor_total DECIMAL(15, 2)
);

-- Table: Auditoría
CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  tabla VARCHAR(50),
  operacion VARCHAR(10),
  registro_id INTEGER,
  datos_antiguos JSONB,
  datos_nuevos JSONB,
  usuario_id INTEGER REFERENCES usuarios(id),
  fecha_cambio TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha_cambio);

-- View: Stock Actual
CREATE VIEW v_stock_actual AS
SELECT 
  m.id,
  m.codigo,
  m.nombre,
  m.stock_actual,
  m.stock_minimo,
  m.precio_unitario,
  m.stock_actual * m.precio_unitario as valor_total,
  p.nombre as proyecto,
  CASE 
    WHEN m.stock_actual < m.stock_minimo THEN 'Bajo stock'
    ELSE 'OK'
  END as estado_stock
FROM materiales m
LEFT JOIN proyectos p ON m.proyecto_id = p.id
WHERE m.estado = 'activo';

-- View: Movimientos del Día
CREATE VIEW v_movimientos_diarios AS
SELECT 
  DATE(m.fecha) as fecha,
  m.tipo,
  COUNT(*) as total_movimientos,
  SUM(m.cantidad) as cantidad_total,
  SUM(m.valor_total) as valor_total
FROM movimientos m
WHERE DATE(m.fecha) = CURRENT_DATE
GROUP BY DATE(m.fecha), m.tipo;
