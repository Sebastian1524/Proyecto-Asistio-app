# 🎓 ASISTIO - Sistema de Control de Asistencias

Backend API para gestión de asistencias con código QR, desarrollado con **Node.js**, **Express** y **PostgreSQL**.

## 📋 Características

✅ **Autenticación JWT** - Login y registro seguro  
✅ **Control de Roles** - Administrador, Docente, Estudiante  
✅ **Generación de QR** - Código QR para eventos de clase  
✅ **Registro de Asistencias** - Escaneo de QR o registro manual  
✅ **Reportes** - Seguimiento de asistencia por estudiante y clase  
✅ **Panel Web Interactivo** - Prueba todos los endpoints  

---

## 🔧 Requisitos Previos

- **Node.js** v14+ 
- **PostgreSQL** 12+
- **npm** (incluido en Node.js)

---

## 📦 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar la Base de Datos

#### Opción A: Con pgAdmin o línea de comandos

```bash
# En PostgreSQL, crear la base de datos
createdb asistio

# Ejecutar el script SQL
psql -U postgres -d asistio -f database.sql
```

#### Opción B: Directamente en psql

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE asistio;

# Conectarse a la BD
\c asistio

# Ejecutar el contenido de database.sql (copiar y pegar)
```

### 3. Verificar archivo `.env`

El archivo `.env` ya existe con configuración de prueba. Asegúrate de que los datos coincidan con tu instalación de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asistio
DB_USER=postgres
DB_PASSWORD=admin123
JWT_SECRET=asistio_secret_key_2025_sena_cucuta_adso
PORT=3000
NODE_ENV=development
```

---

## 🚀 Ejecutar el Servidor

### Desarrollo (con auto-reload)

```bash
npm run dev
```

### Producción

```bash
npm start
```

El servidor estará disponible en **`http://localhost:3000`**

---

## 🌐 Acceso a la Interfaz Web

Una vez que el servidor esté corriendo, abre en tu navegador:

```
http://localhost:3000
```

Verás un **panel interactivo** para probar todos los endpoints.

---

## 👥 Usuarios de Prueba

Estos usuarios se crean automáticamente al ejecutar `database.sql`:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@sena.gov.co | admin123 |
| Docente | docente@sena.gov.co | admin123 |
| Estudiante 1 | estudiante1@sena.gov.co | admin123 |
| Estudiante 2 | estudiante2@sena.gov.co | admin123 |
| Estudiante 3 | estudiante3@sena.gov.co | admin123 |

---

## 📚 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js           # Configuración de conexión PostgreSQL
├── controllers/
│   ├── authController.js     # Lógica de autenticación
│   ├── clasesController.js   # Lógica de clases
│   └── asistenciaController.js # Lógica de asistencias y QR
├── middleware/
│   └── auth.js               # Verificación JWT y roles
├── routes/
│   ├── auth.js               # Rutas de autenticación
│   ├── clases.js             # Rutas de clases
│   └── asistencia.js         # Rutas de asistencias
├── public/
│   └── index.html            # Panel web interactivo
├── server.js                 # Punto de entrada principal
├── .env                      # Variables de entorno
├── database.sql              # Script para crear BD
└── package.json              # Dependencias
```

---

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil del usuario (requiere token)

### Clases
- `POST /api/clases` - Crear clase (admin, docente)
- `GET /api/clases` - Listar clases
- `GET /api/clases/:id` - Obtener clase específica
- `PUT /api/clases/:id` - Actualizar clase
- `DELETE /api/clases/:id` - Eliminar clase (admin)

### Asistencias
- `POST /api/asistencia/evento` - Crear evento con QR
- `GET /api/asistencia/evento/:id_evento/qr` - Obtener código QR
- `POST /api/asistencia/registrar-qr` - Registrar asistencia por QR
- `POST /api/asistencia/registrar-manual` - Registrar asistencia manual
- `GET /api/asistencia/evento/:id_evento/asistencias` - Ver asistencias del evento
- `GET /api/asistencia/reporte/mi-asistencia/:id_clase` - Mi reporte de asistencia
- `GET /api/asistencia/reporte/clase/:id_clase` - Reporte completo de clase

---

## 🔐 Autenticación

Todos los endpoints (excepto registro y login) requieren un token JWT en el header:

```
Authorization: Bearer <tu_token>
```

El token se obtiene al hacer login y tiene una validez de **7 días** (configurable en `.env`).

---

## 📊 Flujo de Uso Típico

### Para Docentes

1. **Login** → `POST /api/auth/login`
2. **Crear Evento** → `POST /api/asistencia/evento`
3. **Obtener QR** → `GET /api/asistencia/evento/:id/qr` (mostrar a estudiantes)
4. **Ver Asistencias** → `GET /api/asistencia/evento/:id/asistencias`
5. **Generar Reportes** → `GET /api/asistencia/reporte/clase/:id`

### Para Estudiantes

1. **Registrarse** → `POST /api/auth/registro`
2. **Login** → `POST /api/auth/login`
3. **Escanear QR** → `POST /api/asistencia/registrar-qr` (con datos del QR)
4. **Ver mi Asistencia** → `GET /api/asistencia/reporte/mi-asistencia/:id`

---

## 🛠️ Solución de Problemas

### "Cannot find module 'qrcode'"

```bash
npm install qrcode
```

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL no está corriendo. Inicia el servicio:

**Windows:**
```powershell
net start postgresql-x64-12
```

**Linux:**
```bash
sudo service postgresql start
```

### "Database asistio does not exist"

Ejecuta el script SQL primero:

```bash
psql -U postgres -d postgres -f database.sql
```

---

## 📝 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno (development/production) | development |
| `DB_HOST` | Host PostgreSQL | localhost |
| `DB_PORT` | Puerto PostgreSQL | 5432 |
| `DB_NAME` | Nombre de la BD | asistio |
| `DB_USER` | Usuario PostgreSQL | postgres |
| `DB_PASSWORD` | Contraseña PostgreSQL | admin123 |
| `JWT_SECRET` | Clave secreta para JWT | asistio_secret... |
| `JWT_EXPIRES_IN` | Expiración del token | 7d |
| `ALLOWED_ORIGINS` | CORS origins | * |

---

## 🎯 Próximos Pasos

- [ ] Implementar app móvil (React Native/Flutter)
- [ ] Agregar validaciones más robustas
- [ ] Implementar rate limiting
- [ ] Agregar logs persistentes
- [ ] Crear dashboard de analytics
- [ ] Implementar backup automático

---

## 📧 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo SENA.

---

**Desarrollado con ❤️ para SENA Cúcuta ADSO**
