# 📚 Explicación del Sistema Asistio

## 🎨 Estados de Color (Activo/Inactivo)

### Por qué la clase nueva sale en ROJO:
El problema es que cuando creas una clase nueva, el estado se guarda como `'activa'` (minúscula con 'a'), pero el código de la app busca `'activo'` (sin la 'a' final).

**Solución:** Cambiar el estado en la base de datos a `'activo'` o actualizar el código para que acepte `'activa'`.

**Estados actuales:**
- 🟢 **Verde** = estado: `'activo'` ✅
- 🔴 **Rojo** = estado: `'activa'`, `'inactivo'`, o cualquier otro ❌

---

## 🏫 Funcionalidad del Sistema: CLASES vs EVENTOS

### 📖 **CLASES** (Asignaturas/Cursos)
Son como las **materias** en una institución educativa.

**Ejemplo:**
- Programación en Python
- Base de Datos
- Inglés Técnico
- Matemáticas

**Características:**
- Son **permanentes** durante un período académico
- Tienen estudiantes **inscritos**
- Pueden tener un **docente** asignado
- Estado: activo/inactivo

**¿Para qué sirven?**
- Organizar a los estudiantes por grupos
- Agrupar eventos/sesiones relacionadas
- Llevar control de asistencia por materia

---

### 📅 **EVENTOS** (Sesiones de Clase)
Son las **clases individuales** o sesiones dentro de una materia.

**Ejemplo:**
- Clase de Python - Lunes 20 nov (8:00 AM)
- Clase de Python - Miércoles 22 nov (8:00 AM)
- Examen Final Python - Viernes 24 nov (10:00 AM)

**Características:**
- Ocurren en una **fecha y hora específica**
- Generan un **código QR único**
- Los estudiantes registran asistencia escaneando el QR
- Pueden estar activos/cerrados

**¿Para qué sirven?**
- Registrar asistencia a cada sesión
- Generar reportes por clase individual
- Control de puntualidad (hora de entrada)

---

## 🔄 Flujo del Sistema

```
INSTITUCIÓN
    └── CLASES (materias)
        ├── Estudiantes inscritos
        └── EVENTOS (sesiones)
            └── Asistencias registradas
```

### Ejemplo Real:

**SENA - Centro de Formación** (Institución)
├── **Programación Python** (Clase)
│   ├── Estudiantes: Juan, María, Pedro
│   └── Eventos:
│       ├── Sesión 1 - Introducción (20 nov)
│       │   └── Asistencias: Juan ✓, María ✓, Pedro ✗
│       ├── Sesión 2 - Variables (22 nov)
│       │   └── Asistencias: Juan ✓, María ✗, Pedro ✓
│       └── Sesión 3 - Funciones (24 nov)
│
└── **Base de Datos** (Clase)
    ├── Estudiantes: Ana, Carlos
    └── Eventos:
        └── Clase 1 - SQL Básico (21 nov)

---

## 👥 Roles y Gestión de Usuarios

Tu sistema **SÍ tiene** roles definidos:

### 🔑 **Roles Disponibles:**

1. **👨‍💼 ADMINISTRADOR**
   - Usuario: `admin@sena.edu.co`
   - **Puede hacer:**
     - ✅ Crear/editar/eliminar CLASES
     - ✅ Crear/editar/eliminar EVENTOS
     - ✅ Crear USUARIOS (estudiantes, docentes, otros admins)
     - ✅ Asignar estudiantes a clases
     - ✅ Ver reportes de toda la institución
     - ✅ Gestionar toda la base de datos

2. **👨‍🏫 DOCENTE**
   - Usuario: `test@sena.edu.co`
   - **Puede hacer:**
     - ✅ Crear CLASES (sus materias)
     - ✅ Crear EVENTOS en sus clases
     - ✅ Ver estudiantes de sus clases
     - ✅ Ver/descargar reportes de asistencia
     - ✅ Registrar asistencia manual
     - ❌ No puede crear otros usuarios
     - ❌ No puede ver clases de otros docentes

3. **👨‍🎓 ESTUDIANTE**
   - Usuario: `estudiante@sena.edu.co`
   - **Puede hacer:**
     - ✅ Ver sus clases inscritas
     - ✅ Ver eventos de sus clases
     - ✅ Escanear QR para registrar asistencia
     - ✅ Ver su propio reporte de asistencia
     - ❌ No puede crear clases ni eventos
     - ❌ No puede ver asistencia de otros

---

## 🛠️ Funcionalidades Actuales del Sistema

### ✅ **Lo que YA TIENES implementado:**

1. **Autenticación**
   - Login por email/contraseña
   - Sistema de tokens JWT
   - Roles diferenciados

2. **Gestión de Clases**
   - Crear clases
   - Listar clases
   - Inscribir estudiantes

3. **Gestión de Eventos**
   - Crear eventos con fecha/hora
   - Generar código QR automáticamente
   - Ver lista de eventos

4. **Registro de Asistencia**
   - ✅ Scanner de QR con cámara (recién implementado)
   - ✅ Registro manual con token
   - Validación de inscripción
   - Control de duplicados
   - Registro de hora de entrada

5. **Reportes**
   - Asistencias por evento
   - Porcentaje de asistencia por estudiante
   - Lista de presentes/ausentes

---

## 🚀 Funcionalidades que FALTAN (Recomendadas)

### 📋 **Panel de Administración**
**¿Qué necesitas?**
Una pantalla donde el ADMIN pueda:
- ✅ Crear usuarios (estudiantes, docentes)
- ✅ Asignar estudiantes a clases
- ✅ Ver todos los usuarios del sistema
- ✅ Editar/desactivar usuarios

**Archivos a crear:**
- `PantallaAdministracion.js` (frontend)
- `usuariosController.js` (backend - ya existe parcialmente)

### 📊 **Gestión de Inscripciones**
**¿Qué necesitas?**
- Pantalla para que el docente/admin agregue estudiantes a sus clases
- Sistema de invitaciones (opcional)
- Vista de estudiantes por clase

### 📈 **Reportes Avanzados**
- Exportar a PDF/Excel
- Gráficas de asistencia
- Reportes por período (semanal, mensual)

---

## 💡 Flujo Recomendado para Gestión

### **Opción 1: Administrador Centralizado** (Más formal)

```
1. ADMIN crea usuarios:
   - admin@sena.edu.co → Crea cuenta de docente
   - admin@sena.edu.co → Crea cuentas de estudiantes

2. ADMIN o DOCENTE crea clases:
   - Docente crea "Programación Python"

3. ADMIN o DOCENTE inscribe estudiantes:
   - Asigna a Juan, María, Pedro a la clase

4. DOCENTE crea eventos:
   - Crea "Clase 1 - Introducción" con QR

5. ESTUDIANTES registran asistencia:
   - Escanean QR en su móvil
```

### **Opción 2: Auto-registro** (Más flexible)

```
1. Los usuarios se registran solos (sign up)

2. ADMIN aprueba y asigna roles

3. Los estudiantes pueden solicitar inscripción a clases

4. DOCENTE aprueba inscripciones

5. Resto del flujo igual
```

---

## 🔧 Scripts Útiles que ya tienes

En `backend/scripts/`:
- ✅ `crear_usuario_prueba.js` - Crea usuarios de prueba
- ✅ `inscribir_estudiante_clase.js` - Inscribe estudiante en clases
- ✅ `crear_clase_y_evento.js` - Crea clase + evento de prueba
- ✅ `listar_usuarios.js` - Ver todos los usuarios

---

## 📝 Próximos Pasos Recomendados

1. **Arreglar el estado de la clase** (rojo → verde)
2. **Crear pantalla de administración** para gestionar usuarios
3. **Crear pantalla para inscribir estudiantes** a clases
4. **Implementar sistema de notificaciones** (cuando se crea evento)
5. **Agregar exportación de reportes** (PDF/Excel)

¿Quieres que implemente alguna de estas funcionalidades?
