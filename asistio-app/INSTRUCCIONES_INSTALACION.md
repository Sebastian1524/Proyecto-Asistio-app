# 📱 Instrucciones de Instalación - Proyecto Asistio

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

1. **Node.js** (versión 16 o superior)
   - Descargar desde: https://nodejs.org/
   - Verifica la instalación: `node --version`

2. **PostgreSQL** (versión 12 o superior)
   - Descargar desde: https://www.postgresql.org/download/
   - Anota el usuario y contraseña que configures

3. **Git**
   - Descargar desde: https://git-scm.com/

4. **Expo Go** (en tu celular)
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

---

## 🚀 Pasos de Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Sebastian1524/Proyecto-Asistio-app.git
cd Proyecto-Asistio-app
```

---

### 2️⃣ Configurar la Base de Datos

1. **Crear la base de datos:**
   - Abre PostgreSQL (pgAdmin o terminal)
   - Ejecuta el archivo `backend/database.sql` completo

2. **Configurar credenciales:**
   - Crea un archivo `.env` en la carpeta `backend/`
   - Copia el siguiente contenido y ajusta tus datos:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asistio_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui

# Configuración de Servidor
PORT=3000
NODE_ENV=development

# JWT Secret (puedes dejar este)
JWT_SECRET=tu_clave_secreta_super_segura_123456
```

---

### 3️⃣ Instalar Dependencias del Backend

```bash
cd backend
npm install
```

**Dependencias que se instalarán:**
- `express` - Framework del servidor
- `pg` - Conexión a PostgreSQL
- `bcryptjs` - Encriptación de contraseñas
- `jsonwebtoken` - Autenticación JWT
- `cors` - Permisos de origen cruzado
- `qrcode` - Generación de códigos QR
- `express-validator` - Validación de datos
- `json2csv` - Exportación de reportes
- `dotenv` - Variables de entorno
- `uuid` - Generación de IDs únicos
- `nodemon` - Auto-recarga en desarrollo

---

### 4️⃣ Instalar Dependencias del Frontend

```bash
cd ../frontend/Asistio-master
npm install
```

**Dependencias que se instalarán:**
- `expo` - Framework de React Native
- `react` y `react-native` - Librerías base
- `@react-navigation/native` - Navegación entre pantallas
- `expo-camera` - Acceso a la cámara
- `expo-barcode-scanner` - Escaneo de QR
- `expo-linear-gradient` - Gradientes
- `@react-native-async-storage/async-storage` - Almacenamiento local
- `react-native-svg` - Gráficos SVG
- `expo-file-system` - Sistema de archivos
- `expo-sharing` - Compartir archivos
- Y más...

---

### 5️⃣ Configurar la IP del Backend

1. **Obtener tu IP local:**
   - Windows: `ipconfig` (busca IPv4 en WiFi/Ethernet)
   - Mac/Linux: `ifconfig` o `ip addr`

2. **Actualizar archivo de configuración:**
   - Abre `frontend/Asistio-master/src/config/api.js`
   - Cambia la IP por la tuya:

```javascript
const API_URL = 'http://TU_IP_AQUI:3000/api';
// Ejemplo: const API_URL = 'http://192.168.1.100:3000/api';
```

---

## ▶️ Ejecutar el Proyecto

### Backend (Terminal 1)

```bash
cd backend
npm start
```

✅ Deberías ver: `Servidor corriendo en puerto 3000`

### Frontend (Terminal 2)

```bash
cd frontend/Asistio-master
npx expo start
```

✅ Aparecerá un código QR

### Ver en tu Celular

1. Abre **Expo Go** en tu celular
2. Escanea el código QR que aparece en la terminal
3. Espera a que cargue la aplicación

---

## 👥 Usuarios de Prueba

**Docente:**
- Correo: `docente@sena.edu.co`
- Contraseña: `123456`

**Estudiante:**
- Correo: `estudiante@sena.edu.co`
- Contraseña: `123456`

---

## 🛠️ Solución de Problemas Comunes

### ❌ "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `.env`
- Asegúrate de haber ejecutado `database.sql`

### ❌ "Network request failed" en la app
- Verifica que el backend esté corriendo
- Confirma que la IP en `api.js` sea correcta
- Asegúrate de estar en la misma red WiFi

### ❌ "npm install" falla
- Borra `node_modules` y `package-lock.json`
- Ejecuta `npm cache clean --force`
- Vuelve a ejecutar `npm install`

### ❌ Error de permisos de cámara
- En la primera apertura, acepta los permisos
- Si ya los rechazaste, ve a Configuración > Apps > Expo Go > Permisos

---

## 📂 Estructura del Proyecto

```
Proyecto-Asistio-app/
├── backend/
│   ├── server.js           # Servidor principal
│   ├── database.sql        # Script de BD
│   ├── package.json        # Dependencias backend
│   ├── .env               # Configuración (CREAR)
│   ├── config/            # Configuración BD
│   ├── controllers/       # Lógica de negocio
│   ├── routes/           # Rutas API
│   └── middleware/       # Autenticación
│
└── frontend/
    └── Asistio-master/
        ├── package.json   # Dependencias frontend
        ├── App.js        # Componente principal
        └── src/
            ├── pantallas/    # Screens
            ├── componentes/  # Components
            ├── services/     # API calls
            └── config/
                └── api.js    # URL del backend (EDITAR)
```

---

## 📞 Soporte

Si tienes problemas, verifica:
1. Que todas las dependencias se instalaron correctamente
2. Que la base de datos está configurada
3. Que el archivo `.env` existe y tiene los datos correctos
4. Que estás en la misma red WiFi (celular y PC)

---

## ✅ Checklist de Instalación

- [ ] Node.js instalado
- [ ] PostgreSQL instalado y corriendo
- [ ] Repositorio clonado
- [ ] Base de datos creada con `database.sql`
- [ ] Archivo `.env` creado en `backend/`
- [ ] `npm install` en `backend/`
- [ ] `npm install` en `frontend/Asistio-master/`
- [ ] IP actualizada en `src/config/api.js`
- [ ] Backend corriendo (`npm start`)
- [ ] Frontend corriendo (`npx expo start`)
- [ ] Expo Go instalado en el celular
- [ ] Aplicación abierta en el celular

---

**¡Listo! Ya deberías tener el proyecto corriendo** 🎉
