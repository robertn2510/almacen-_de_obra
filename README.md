# Sistema de Gestión de Almacén de Obra 🏗️

Control integral de almacén para obras de construcción con interfaz moderna tipo ERP.

## 🎯 Características Principales

### Módulos Funcionales
- ✅ Datos generales del proyecto
- ✅ Registro de materiales
- ✅ Ingreso de materiales
- ✅ Salida de materiales
- ✅ Movimiento diario KARDEX
- ✅ Responsable del movimiento
- ✅ Observaciones
- ✅ Exportación Excel/PDF

### Funcionalidades Avanzadas
- ✅ Control diario de almacén
- ✅ Registro histórico de movimientos
- ✅ Kardex valorizado
- ✅ Reportes automáticos
- ✅ Gestión por fechas
- ✅ Stock automático en tiempo real
- ✅ Alertas de stock mínimo
- ✅ Usuarios y permisos
- ✅ PECOSA automática
- ✅ Control por partidas presupuestales
- ✅ Dashboard con gráficos
- ✅ Generación de PDFs profesionales
- ✅ Código QR
- ✅ Firma digital
- ✅ Multiusuario
- ✅ Instalador EXE para Windows

## 🛠️ Stack Tecnológico

### Backend
- **Node.js + Express.js** - API RESTful
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación y autorización
- **Multer** - Manejo de archivos
- **node-cache** - Caché de sesiones

### Frontend Desktop
- **Electron** - Aplicación de escritorio Windows
- **React** - Interfaz de usuario
- **Redux** - Gestión de estado
- **Ant Design** - Componentes UI profesionales
- **Recharts** - Gráficos interactivos

### Reportes y Exportación
- **pdfkit** - Generación de PDFs
- **xlsx** - Exportación a Excel
- **qrcode** - Generación de códigos QR
- **crypto** - Firmas digitales

## 📁 Estructura del Proyecto

```
almacen-_de_obra/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── migrations/
│   ├── seeds/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── electron/
│   │   ├── main.js
│   │   ├── preload.js
│   │   └── installer.js
│   ├── package.json
│   └── README.md
├── database/
│   ├── schema.sql
│   ├── init.sql
│   └── migrations/
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── INSTALL.md
├── .gitignore
├── .env.example
└── package.json (root)
```

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js v16+
- PostgreSQL 12+
- npm o yarn

### Configuración Rápida

1. **Clonar repositorio**
```bash
git clone https://github.com/robertn2510/almacen-_de_obra.git
cd almacen-_de_obra
```

2. **Instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

4. **Inicializar base de datos**
```bash
cd ../database
psql -U postgres -f schema.sql
```

5. **Ejecutar aplicación**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (Electron)
cd frontend
npm start
```

## 📖 Documentación

- [API REST](./docs/API.md) - Endpoints disponibles
- [Base de Datos](./docs/DATABASE.md) - Esquema y relaciones
- [Instalación](./docs/INSTALL.md) - Guía de instalación

## 👥 Módulos de Usuario

- **Administrador** - Acceso total
- **Responsable de Almacén** - Gestión de movimientos
- **Reportero** - Visualización de reportes
- **Supervisor** - Control y auditoría

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

---

**Autor:** robertn2510
**Última actualización:** 2026-06-29
