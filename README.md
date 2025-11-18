# Asistio - Sistema de Control de Asistencias

Sistema de control de asistencias con backend Node.js/Express/PostgreSQL y frontend React Native/Expo.

## 📋 Requisitos

- Node.js 16.x o superior
- PostgreSQL 12 o superior
- Git
- Expo Go (app móvil) o Android Studio/Xcode para emular

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/asistio-app.git
cd asistio-app
```

### 2. Backend (API)

```bash
cd asistio-app/backend
npm install
```

**Configurar variables de entorno:**
- Crea un archivo `.env` en `backend/` con:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_password_postgres
DB_NAME=asistio
JWT_SECRET=tu_secret_muy_seguro
NODE_ENV=development
```

**Crear la base de datos:**
```bash
# Conectarse a PostgreSQL y ejecutar:
psql -U postgres
CREATE DATABASE asistio;
\q

# Aplicar el esquema:
psql -U postgres -d asistio -f backend/database.sql
```

**Arrancar el backend:**
```bash
npm run dev
```
Debería mostrar: `Servidor corriendo en puerto 3000`

### 3. Frontend (React Native/Expo)

```bash
cd asistio-app/frontend/Asistio-master
npm install
```

**Configurar URL de la API:**
- Edita `src/config/api.js` y ajusta `BASE_URL` según tu entorno:
  - Emulador Android: `http://10.0.2.2:3000/api`
  - iOS simulator: `http://localhost:3000/api`
  - Dispositivo físico: `http://TU_IP_LOCAL:3000/api` (usa `ipconfig` para ver tu IP)

**Arrancar la app:**
```bash
npx expo start --lan
```
Escanea el QR con Expo Go en tu móvil o presiona `a` para emulador Android.

## 📁 Estructura del Proyecto

```
asistio-app/
├── backend/              # API Node.js/Express
│   ├── config/           # Configuración de BD
│   ├── controllers/      # Lógica de negocio
│   ├── routes/           # Endpoints
│   ├── middleware/       # Auth/validaciones
│   ├── public/           # Panel web
│   └── database.sql      # Esquema de BD
└── frontend/             # App móvil React Native/Expo
    └── Asistio-master/
        ├── src/
        │   ├── config/   # Configuración API
        │   ├── services/ # Llamadas HTTP
        │   ├── pantallas/
        │   └── componentes/
        └── assets/
```

## 🔧 Endpoints Principales

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/clases` - Crear clase
- `POST /api/asistencia/eventos` - Crear evento con QR
- `POST /api/asistencia/asistencia-qr` - Registrar asistencia

## 👥 Equipo

[Agrega los nombres de tus compañeros aquí]

## 📝 Notas

- El backend corre en `http://localhost:3000`
- La app móvil conecta a la API del backend
- Usa las credenciales de prueba o regístrate desde la app
