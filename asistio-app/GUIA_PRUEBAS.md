# 🧪 Guía de Pruebas - Sistema de Asistencia Asistio

## ✅ Pre-requisitos

Antes de empezar las pruebas, asegúrate de que:

1. **Backend está corriendo**
   ```bash
   cd asistio-app/backend
   node server.js
   ```
   Deberías ver: `Servidor corriendo en http://localhost:3000`

2. **Frontend está corriendo**
   ```bash
   cd asistio-app/frontend/Asistio-master
   npm start
   ```
   Se abrirá Expo DevTools

3. **Base de datos configurada**
   - PostgreSQL corriendo
   - Tablas creadas (evento_clase, asistencia, etc.)

---

## 👥 Usuarios de Prueba

### 🎓 Docente
- **Email:** `test@sena.edu.co`
- **Contraseña:** `123456`
- **Rol:** Docente
- **Permisos:** Crear clases, eventos, ver reportes completos

### 📚 Estudiante
- **Email:** `estudiante@sena.edu.co`
- **Contraseña:** `123456`
- **Rol:** Estudiante
- **Permisos:** Ver clases, registrar asistencia, ver su reporte

---

## 🔄 Flujo de Prueba Completo

### FASE 1: Como Docente (Preparación)

#### 1.1 Iniciar Sesión
1. Abre la app en tu celular/emulador
2. Toca "Iniciar Sesión"
3. Ingresa:
   - Email: `test@sena.edu.co`
   - Contraseña: `123456`
4. Deberías ver el **Home** con tu nombre

#### 1.2 Crear una Clase
1. Desde el Home, toca **"Mis Clases"**
2. Toca el botón **"+ Nueva"** (arriba a la derecha)
3. Completa el formulario:
   - Nombre: `Programación Web`
   - Descripción: `Desarrollo de aplicaciones web modernas`
   - Sede: Selecciona una
   - Máx estudiantes: `30`
4. Toca **"Crear Clase"**
5. ✅ Deberías ver la clase en la lista

#### 1.3 Crear un Evento de Asistencia
1. Vuelve al Home (botón Volver)
2. Toca **"Eventos"**
3. Toca **"+ Nuevo"** (arriba a la derecha)
4. Completa el formulario:
   - Clase: Selecciona `Programación Web`
   - Nombre evento: `Clase Práctica 1`
   - Descripción: `Ejercicios de React`
   - Fecha: Hoy
   - Hora inicio: `14:00`
   - Hora fin: `16:00`
5. Toca **"Crear Evento"**
6. ✅ Deberías ver el evento creado

#### 1.4 Obtener el Código QR
1. En la lista de eventos, busca `Clase Práctica 1`
2. Toca **"📱 Ver QR"**
3. Se abrirá un modal con:
   - Código QR grande
   - Token del evento
4. **IMPORTANTE:** Copia o memoriza el token (primeros 8 caracteres)
5. Toma una captura de pantalla del QR
6. Cierra el modal

---

### FASE 2: Como Estudiante (Registro de Asistencia)

#### 2.1 Cambiar de Usuario
1. Vuelve al Home
2. Toca **"Cerrar sesión"**
3. Confirma

#### 2.2 Iniciar Sesión como Estudiante
1. Toca "Iniciar Sesión"
2. Ingresa:
   - Email: `estudiante@sena.edu.co`
   - Contraseña: `123456`
3. Deberías ver el Home del estudiante

#### 2.3 Registrar Asistencia por QR
1. Desde el Home, toca **"Escanear QR"**
2. En el campo de texto, pega el **token que copiaste** antes
3. Toca **"✓ Registrar Asistencia"**
4. ✅ Deberías ver:
   - Mensaje verde: "Asistencia registrada exitosamente"
   - Nombre del evento: `Clase Práctica 1`
   - Nombre de la clase: `Programación Web`

#### 2.4 Ver Mi Reporte (Estudiante)
1. Vuelve al Home
2. Toca **"Reportes"**
3. Deberías ver:
   - Tu porcentaje de asistencia (100% si es tu primera asistencia)
   - Total de eventos: 1
   - Asistencias: 1
   - Faltas: 0
   - Mensaje: "¡Excelente asistencia! Sigue así."

---

### FASE 3: Como Docente (Verificación)

#### 3.1 Volver a Iniciar Sesión como Docente
1. Cierra sesión del estudiante
2. Inicia sesión con `test@sena.edu.co`

#### 3.2 Ver Lista de Asistencias del Evento
1. Ve a **"Eventos"**
2. Busca `Clase Práctica 1`
3. Toca **"👥 Asistencias"**
4. ✅ Deberías ver:
   - Estadísticas en la parte superior:
     - Presentes: 1
     - Ausentes: 0
     - Asistencia: 100%
   - Lista con el estudiante:
     - Nombre: `Estudiante Prueba Test`
     - Estado: ✓ (presente)
     - Hora de entrada registrada

#### 3.3 Ver Reporte Completo de la Clase
1. Vuelve al Home
2. Toca **"Reportes"**
3. Selecciona la clase `Programación Web` en el tab superior
4. ✅ Deberías ver:
   - Lista de estudiantes con sus estadísticas
   - `Estudiante Prueba Test`
   - Porcentaje: 100%
   - Asistencias: 1/1
   - Avatar con iniciales "EP"

---

## 🎯 Casos de Prueba Adicionales

### Prueba 1: Múltiples Asistencias
1. Como docente, crea otro evento
2. Como estudiante, registra asistencia
3. Verifica que el porcentaje siga en 100%

### Prueba 2: Ausencia
1. Como docente, crea un tercer evento
2. NO registres asistencia como estudiante
3. Verifica que:
   - El reporte muestre: Asistencias 2/3 (66.7%)
   - El color cambie a amarillo (advertencia)

### Prueba 3: Token Inválido
1. Como estudiante, intenta registrar asistencia con un token falso
2. Deberías ver error: "Evento o token inválido"

### Prueba 4: Doble Registro
1. Como estudiante, registra asistencia en un evento
2. Intenta registrarlo de nuevo con el mismo token
3. Deberías ver error: "Ya has registrado tu asistencia en este evento"

### Prueba 5: Vista de Eventos
1. Como estudiante, ve a "Eventos"
2. Deberías ver solo los eventos de tus clases
3. Como docente, deberías ver todos los eventos de la institución

---

## 📊 Resultados Esperados

### ✅ Sistema Funcionando Correctamente Si:

- [ ] Login funciona para docente y estudiante
- [ ] Docente puede crear clases
- [ ] Docente puede crear eventos con QR
- [ ] Se genera automáticamente el código QR
- [ ] Estudiante puede registrar asistencia con token
- [ ] No permite doble registro de asistencia
- [ ] Valida que el token sea correcto
- [ ] Lista de asistencias muestra estudiantes correctamente
- [ ] Reportes muestran estadísticas precisas
- [ ] Porcentaje de asistencia se calcula bien
- [ ] Colores cambian según el porcentaje (verde/amarillo/rojo)

---

## 🐛 Problemas Comunes

### Backend no responde
```bash
# Verificar si está corriendo
curl http://localhost:3000/api/clases

# Si no funciona, reiniciar
cd backend
node server.js
```

### Frontend no conecta
- Verifica que `API_URL` en `src/config/api.js` sea correcta
- Si usas celular físico, usa la IP de tu PC en lugar de localhost

### Usuario no existe
```bash
# Crear usuarios de prueba
cd backend
node scripts/crear_usuario_prueba.js
node scripts/cambiar_rol_docente.js
```

### Error de base de datos
```bash
# Verificar conexión
psql -U postgres -d asistio
# Verificar tablas
\dt
```

---

## 📱 Pruebas en Diferentes Plataformas

### En Emulador Android
1. Asegúrate de usar `10.0.2.2:3000` como API_URL
2. O usa `ipconfig` para obtener tu IP local

### En iPhone/iPad Simulator
1. Usa `localhost:3000` (funciona en iOS simulator)

### En Dispositivo Físico
1. Obtén tu IP local:
   ```bash
   ipconfig
   # Busca IPv4 Address (ej: 192.168.1.10)
   ```
2. Actualiza `API_URL` a `http://192.168.1.10:3000/api`
3. Asegúrate de estar en la misma red WiFi

---

## 🎉 ¡Prueba Exitosa!

Si completaste todos los pasos y todo funciona correctamente, ¡felicidades! 🎊

El sistema está listo para:
- Gestionar múltiples clases
- Crear eventos de asistencia
- Generar códigos QR automáticamente
- Registrar asistencias de estudiantes
- Generar reportes detallados
- Mostrar estadísticas en tiempo real

---

## 📞 Soporte

Si encuentras algún problema durante las pruebas:
1. Revisa los logs del backend (terminal donde corre `node server.js`)
2. Revisa los logs de Expo (terminal donde corre `npm start`)
3. Verifica que la base de datos tenga todos los datos necesarios
4. Asegúrate de que los usuarios estén inscritos en las clases
