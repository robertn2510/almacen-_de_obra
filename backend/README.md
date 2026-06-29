# Backend - Sistema de Gestión de Almacén de Obra

API REST con Node.js + Express + PostgreSQL

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

Copia `.env.example` a `.env` y actualiza las variables:

```bash
cp .env.example .env
```

### Ejecutar en desarrollo

```bash
npm run dev
```

El servidor estará en `http://localhost:3001`

## 📚 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/change-password` - Cambiar contraseña

### Proyectos
- `GET /api/proyectos` - Listar proyectos
- `GET /api/proyectos/:id` - Obtener proyecto
- `POST /api/proyectos` - Crear proyecto
- `PUT /api/proyectos/:id` - Actualizar proyecto
- `DELETE /api/proyectos/:id` - Eliminar proyecto

### Materiales
- `GET /api/materiales` - Listar materiales
- `GET /api/materiales/proyecto/:proyectoId` - Materiales por proyecto
- `GET /api/materiales/:id` - Obtener material
- `POST /api/materiales` - Crear material
- `PUT /api/materiales/:id` - Actualizar material

### Movimientos
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Crear movimiento (ingreso/salida)
- `GET /api/movimientos/kardex/:materialId` - KARDEX de material

### Usuarios
- `GET /api/usuarios` - Listar usuarios (admin)
- `POST /api/usuarios` - Crear usuario (admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (admin)
- `POST /api/usuarios/:id/reset-password` - Reset password (admin)

### Reportes
- `GET /api/reportes/kardex` - Reporte KARDEX
- `GET /api/reportes/kardex/export/excel` - Exportar Excel
- `GET /api/reportes/kardex/export/pdf` - Exportar PDF
- `GET /api/reportes/dashboard/stats` - Estadísticas

## 🔐 Roles y Permisos

- **admin** - Acceso total
- **supervisor** - Gestión de proyectos y reportes
- **almacenero** - Gestión de movimientos y materiales
- **reportero** - Visualización de reportes

## 📂 Estructura

```
src/
├── config/        - Configuración de BD
├── controllers/   - Lógica de negocio
├── middleware/    - Middlewares (auth, validación)
├── models/        - Modelos de datos
├── routes/        - Rutas API
├── services/      - Servicios auxiliares
├── utils/         - Utilidades
└── server.js      - Punto de entrada
```

## 📋 Scripts

- `npm run dev` - Desarrollo con nodemon
- `npm start` - Producción
- `npm test` - Tests
- `npm run lint` - Linting

## 🗄️ Variables de Entorno

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=almacen_obra_db
DB_USER=postgres
DB_PASSWORD=xxx

PORT=3001
JWT_SECRET=xxx
JWT_EXPIRE=24h
```
