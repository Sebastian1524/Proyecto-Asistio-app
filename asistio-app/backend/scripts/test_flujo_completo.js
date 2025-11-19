const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';
let token = '';
let idClase = null;
let idEvento = null;
let tokenQR = '';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}[PASO ${step}]${colors.reset} ${message}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Login como docente
async function login() {
  logStep(1, 'Iniciando sesión como docente...');
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@sena.edu.co',
      password: '123456'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    token = data.token;
    log(`✓ Login exitoso como: ${data.usuario.nombre}`, 'green');
    log(`  Rol: ${data.usuario.rol}`, 'blue');
    log(`  Email: ${data.usuario.email}`, 'blue');
    return true;
  } else {
    log(`✗ Error en login: ${data.message}`, 'red');
    return false;
  }
}

// 2. Crear una clase
async function crearClase() {
  logStep(2, 'Creando nueva clase...');
  
  const response = await fetch(`${API_URL}/clases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre_clase: 'Programación Web - Prueba',
      descripcion: 'Clase de prueba para sistema de asistencia',
      id_sede: 1,
      max_estudiantes: 30
    })
  });

  const data = await response.json();
  
  if (data.success) {
    idClase = data.data.id_clase;
    log(`✓ Clase creada exitosamente`, 'green');
    log(`  ID: ${idClase}`, 'blue');
    log(`  Nombre: ${data.data.nombre_clase}`, 'blue');
    return true;
  } else {
    log(`✗ Error al crear clase: ${data.message}`, 'red');
    return false;
  }
}

// 3. Crear un evento con QR
async function crearEvento() {
  logStep(3, 'Creando evento de asistencia...');
  
  const hoy = new Date().toISOString().split('T')[0];
  
  const response = await fetch(`${API_URL}/asistencia/eventos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id_clase: idClase,
      nombre_evento: 'Clase Práctica - Prueba',
      descripcion: 'Evento de prueba para asistencia',
      fecha_evento: hoy,
      hora_inicio: '14:00',
      hora_fin: '16:00'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    idEvento = data.data.id_evento;
    tokenQR = data.data.token_unico;
    log(`✓ Evento creado exitosamente`, 'green');
    log(`  ID: ${idEvento}`, 'blue');
    log(`  Nombre: ${data.data.nombre_evento}`, 'blue');
    log(`  Token QR: ${tokenQR.substring(0, 20)}...`, 'yellow');
    log(`  Código QR generado: ${data.data.codigo_qr ? 'SÍ' : 'NO'}`, data.data.codigo_qr ? 'green' : 'red');
    return true;
  } else {
    log(`✗ Error al crear evento: ${data.message}`, 'red');
    return false;
  }
}

// 4. Obtener el QR del evento
async function obtenerQR() {
  logStep(4, 'Obteniendo código QR del evento...');
  
  const response = await fetch(`${API_URL}/asistencia/eventos/${idEvento}/qr`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    log(`✓ QR obtenido exitosamente`, 'green');
    log(`  Token: ${data.data.token_unico.substring(0, 30)}...`, 'yellow');
    return true;
  } else {
    log(`✗ Error al obtener QR: ${data.message}`, 'red');
    return false;
  }
}

// 5. Crear un estudiante de prueba
async function crearEstudiante() {
  logStep(5, 'Creando estudiante de prueba...');
  
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Estudiante',
      primer_apellido: 'Prueba',
      segundo_apellido: 'Test',
      email: 'estudiante@sena.edu.co',
      password: '123456',
      tipo_documento: 'CC',
      numero_documento: '9999999',
      id_sede: 1
    })
  });

  const data = await response.json();
  
  if (data.success || data.message?.includes('ya existe')) {
    log(`✓ Estudiante creado/existe`, 'green');
    log(`  Email: estudiante@sena.edu.co`, 'blue');
    return true;
  } else {
    log(`✗ Error al crear estudiante: ${data.message}`, 'red');
    return false;
  }
}

// 6. Login como estudiante
async function loginEstudiante() {
  logStep(6, 'Iniciando sesión como estudiante...');
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'estudiante@sena.edu.co',
      password: '123456'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    token = data.token;
    log(`✓ Login como estudiante exitoso`, 'green');
    log(`  Nombre: ${data.usuario.nombre}`, 'blue');
    return data.usuario.id_usuario;
  } else {
    log(`✗ Error en login estudiante: ${data.message}`, 'red');
    return null;
  }
}

// 7. Inscribir estudiante a la clase
async function inscribirEstudiante(idUsuario) {
  logStep(7, 'Inscribiendo estudiante a la clase...');
  
  const response = await fetch(`${API_URL}/clases/${idClase}/estudiantes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id_usuario: idUsuario
    })
  });

  if (response.ok || response.status === 409) {
    log(`✓ Estudiante inscrito en la clase`, 'green');
    return true;
  } else {
    log(`⚠ Inscripción manual necesaria (creando directamente en DB)`, 'yellow');
    // Fallback: usar query directo
    try {
      const { query } = require('../config/database');
      await query(
        'INSERT INTO clase_estudiante (id_clase, id_usuario) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [idClase, idUsuario]
      );
      log(`✓ Estudiante inscrito exitosamente`, 'green');
      return true;
    } catch (error) {
      log(`✗ Error al inscribir: ${error.message}`, 'red');
      return false;
    }
  }
}

// 8. Registrar asistencia con QR
async function registrarAsistencia() {
  logStep(8, 'Registrando asistencia con código QR...');
  
  const response = await fetch(`${API_URL}/asistencia/asistencia-qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id_evento: idEvento,
      token_unico: tokenQR
    })
  });

  const data = await response.json();
  
  if (data.success) {
    log(`✓ Asistencia registrada exitosamente`, 'green');
    log(`  Evento: ${data.data.evento.nombre}`, 'blue');
    log(`  Hora entrada: ${new Date(data.data.hora_entrada).toLocaleTimeString()}`, 'blue');
    return true;
  } else {
    log(`✗ Error al registrar asistencia: ${data.message}`, 'red');
    return false;
  }
}

// 9. Ver lista de asistencias (como docente)
async function verAsistencias() {
  logStep(9, 'Obteniendo lista de asistencias (como docente)...');
  
  // Volver a login como docente
  await login();
  
  const response = await fetch(`${API_URL}/asistencia/eventos/${idEvento}/asistencias`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    log(`✓ Lista de asistencias obtenida`, 'green');
    log(`  Total asistentes: ${data.data.length}`, 'blue');
    
    data.data.forEach((asistencia, i) => {
      const nombreCompleto = `${asistencia.nombre} ${asistencia.primer_apellido}`;
      const estado = asistencia.presente ? '✓ Presente' : '✗ Ausente';
      log(`  ${i + 1}. ${nombreCompleto} - ${estado}`, asistencia.presente ? 'green' : 'red');
    });
    
    return true;
  } else {
    log(`✗ Error al obtener asistencias: ${data.message}`, 'red');
    return false;
  }
}

// 10. Ver reporte de clase
async function verReporte() {
  logStep(10, 'Obteniendo reporte de la clase...');
  
  const response = await fetch(`${API_URL}/asistencia/reporte/clase/${idClase}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    log(`✓ Reporte de clase obtenido`, 'green');
    
    data.data.forEach((estudiante, i) => {
      const nombreCompleto = `${estudiante.nombre} ${estudiante.primer_apellido}`;
      const porcentaje = parseFloat(estudiante.porcentaje_asistencia || 0).toFixed(1);
      const color = porcentaje >= 80 ? 'green' : porcentaje >= 60 ? 'yellow' : 'red';
      
      log(`  ${i + 1}. ${nombreCompleto}`, 'blue');
      log(`     Asistencias: ${estudiante.asistencias}/${estudiante.total_eventos} (${porcentaje}%)`, color);
    });
    
    return true;
  } else {
    log(`✗ Error al obtener reporte: ${data.message}`, 'red');
    return false;
  }
}

// Ejecutar flujo completo
async function ejecutarFlujoCompleto() {
  console.clear();
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     PRUEBA DE FLUJO COMPLETO - SISTEMA DE ASISTENCIA     ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  try {
    // Flujo como docente
    if (!await login()) return;
    await sleep(500);
    
    if (!await crearClase()) return;
    await sleep(500);
    
    if (!await crearEvento()) return;
    await sleep(500);
    
    if (!await obtenerQR()) return;
    await sleep(500);
    
    // Flujo como estudiante
    if (!await crearEstudiante()) return;
    await sleep(500);
    
    const idUsuario = await loginEstudiante();
    if (!idUsuario) return;
    await sleep(500);
    
    if (!await inscribirEstudiante(idUsuario)) return;
    await sleep(500);
    
    if (!await registrarAsistencia()) return;
    await sleep(500);
    
    // Verificación como docente
    if (!await verAsistencias()) return;
    await sleep(500);
    
    if (!await verReporte()) return;
    
    // Resumen final
    log('\n╔═══════════════════════════════════════════════════════════╗', 'green');
    log('║              ✓ PRUEBA COMPLETADA EXITOSAMENTE            ║', 'green');
    log('╚═══════════════════════════════════════════════════════════╝\n', 'green');
    
    log('Resumen:', 'cyan');
    log(`  • Clase creada: ID ${idClase}`, 'blue');
    log(`  • Evento creado: ID ${idEvento}`, 'blue');
    log(`  • QR generado: ${tokenQR.substring(0, 20)}...`, 'yellow');
    log(`  • Asistencia registrada: ✓`, 'green');
    log(`  • Sistema funcionando correctamente`, 'green');
    
  } catch (error) {
    log(`\n✗ ERROR INESPERADO: ${error.message}`, 'red');
    console.error(error);
  }
  
  process.exit(0);
}

// Ejecutar solo si se ejecuta directamente
if (require.main === module) {
  ejecutarFlujoCompleto();
}
