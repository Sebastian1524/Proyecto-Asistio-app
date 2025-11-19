# Integración Backend ↔ Frontend - Paso 1 Completado ✅

## Qué se implementó

### 1. Contexto de Autenticación (`AuthContext.js`)
- Manejo global del usuario y token JWT
- Persistencia con AsyncStorage (guarda token localmente)
- Funciones: `login()`, `logout()`, `estaAutenticado`

### 2. Pantalla de Login conectada al backend
- Llama a `/api/auth/login` cuando el usuario presiona "Iniciar sesión"
- Muestra mensajes de error si falla
- Muestra "Iniciando sesión..." mientras carga
- Guarda token y datos del usuario al login exitoso

### 3. Pantalla Home (Dashboard básico)
- Muestra saludo personalizado con nombre del usuario
- 4 tarjetas de acceso rápido: Clases, Eventos, Escanear QR, Reportes
- Botón para cerrar sesión

## Cómo probar ahora

### 1. Asegúrate que el backend esté corriendo
```powershell
cd 'C:\Users\SEBASTIAN\Desktop\asistio-app\asistio-app\backend'
npm run dev
```
Debe mostrar: `Servidor corriendo en puerto 3000`

### 2. Ajusta la IP en `src/config/api.js` (si usas dispositivo físico)
- Si usas emulador Android: ya está en `http://10.0.2.2:3000/api`
- Si usas dispositivo físico: cambia a `http://TU_IP_LOCAL:3000/api`

### 3. Arranca la app móvil
```powershell
cd 'C:\Users\SEBASTIAN\Desktop\asistio-app\asistio-app\frontend\Asistio-master'
npx expo start --lan
```

### 4. Prueba el flujo
1. Abre la app en Expo Go o emulador
2. Ve a la pantalla de login
3. Usa un usuario que exista en tu BD (o crea uno con `/api/auth/register`)
4. Ingresa email y contraseña
5. Presiona "Iniciar sesión"
6. Si es correcto, deberías ver la pantalla Home con tu nombre

## Siguientes pasos (próximos a implementar)

1. **Pantalla de Registro** (conectar al backend)
2. **Pantalla de Clases**:
   - Lista de clases del usuario
   - Crear nueva clase
   - Ver detalle de clase
3. **Pantalla de Eventos**:
   - Ver eventos de una clase
   - Crear evento con QR
   - Mostrar QR generado
4. **Escanear QR** (usar cámara para registrar asistencia)
5. **Reportes** (ver asistencias por clase/estudiante)
6. **Backend**: completar endpoints faltantes según necesidades del frontend

## Archivos modificados/creados en este paso

- ✅ `src/contexto/AuthContext.js` (nuevo)
- ✅ `src/pantallas/PantallaLogin.js` (modificado - conectado al backend)
- ✅ `src/pantallas/PantallaHome.js` (nuevo)
- ✅ `App.js` (modificado - añadido AuthProvider y ruta Home)
- ✅ `src/services/authService.js` (creado anteriormente)
- ✅ `src/config/api.js` (creado anteriormente)

## Posibles errores y soluciones

### Error: "Could not connect to the server"
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Revisa que la IP en `src/config/api.js` sea correcta
- Si usas emulador Android, debe ser `http://10.0.2.2:3000/api`

### Error: "Usuario o contraseña incorrectos"
- Verifica que el usuario exista en la BD
- Prueba con Postman/curl primero: `POST http://localhost:3000/api/auth/login`

### Error: "No se pudo guardar el token"
- Reinstala la app (limpia cache de Expo)
- Verifica que AsyncStorage esté instalado: `npx expo install @react-native-async-storage/async-storage`

## Logs útiles para debug

En la terminal del backend verás:
```
2025-11-18T... - POST /api/auth/login
```

En la terminal de Expo (Metro) verás (si hay errores):
```
[authService] POST http://10.0.2.2:3000/api/auth/login { email: '...' }
[authService] response 200 { success: true, token: '...', usuario: {...} }
```
o
```
[authService] error Usuario o contraseña incorrectos
```
