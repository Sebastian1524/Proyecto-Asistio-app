const { pool } = require('../config/database');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

async function crearClaseYEvento() {
  const client = await pool.connect();
  
  try {
    console.log('🎓 Creando nueva clase y evento...\n');

    // 1. Buscar el docente
    const docenteRes = await client.query(
      `SELECT id_usuario FROM usuario WHERE email = 'test@sena.edu.co'`
    );
    
    if (docenteRes.rows.length === 0) {
      console.error('❌ No se encontró el docente');
      return;
    }
    
    const idDocente = docenteRes.rows[0].id_usuario;
    const idInstitucion = 1;

    // 2. Crear una nueva clase
    const nombreClase = `Clase Scanner Test ${new Date().toLocaleDateString('es-CO')}`;
    const claseRes = await client.query(
      `INSERT INTO clase (nombre_clase, id_institucion, estado)
       VALUES ($1, $2, 'activa')
       RETURNING *`,
      [nombreClase, idInstitucion]
    );
    
    const clase = claseRes.rows[0];
    console.log(`✅ Clase creada: ${clase.nombre_clase} (ID: ${clase.id_clase})\n`);

    // 3. Inscribir al estudiante en la clase
    const estudianteRes = await client.query(
      `SELECT id_usuario FROM usuario WHERE email = 'estudiante@sena.edu.co'`
    );
    
    if (estudianteRes.rows.length > 0) {
      const idEstudiante = estudianteRes.rows[0].id_usuario;
      
      await client.query(
        `INSERT INTO clase_estudiante (id_clase, id_usuario, fecha_inscripcion)
         VALUES ($1, $2, CURRENT_DATE)
         ON CONFLICT DO NOTHING`,
        [clase.id_clase, idEstudiante]
      );
      
      console.log('✅ Estudiante inscrito en la clase\n');
    }

    // 4. Crear un evento para hoy
    const tokenUnico = uuidv4();
    const nombreEvento = `Evento Test - ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    const fechaHoy = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    const eventoRes = await client.query(
      `INSERT INTO evento_clase (id_clase, nombre_evento, descripcion, fecha_evento, 
                                 hora_inicio, token_unico, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'activo')
       RETURNING *`,
      [clase.id_clase, nombreEvento, 'Evento de prueba para scanner', fechaHoy, horaActual, tokenUnico]
    );
    
    const evento = eventoRes.rows[0];
    console.log(`✅ Evento creado: ${evento.nombre_evento}`);
    console.log(`   ID Evento: ${evento.id_evento}`);
    console.log(`   Fecha: ${evento.fecha_evento}`);
    console.log(`   Hora: ${evento.hora_inicio}\n`);

    // 5. Generar código QR
    const datosQR = {
      id_evento: evento.id_evento,
      id_clase: evento.id_clase,
      nombre_evento: evento.nombre_evento,
      fecha_evento: evento.fecha_evento,
      hora_inicio: evento.hora_inicio,
      token: evento.token_unico
    };

    const codigoQR = await QRCode.toDataURL(JSON.stringify(datosQR));
    
    await client.query(
      'UPDATE evento_clase SET codigo_qr = $1 WHERE id_evento = $2',
      [codigoQR, evento.id_evento]
    );

    console.log('✅ Código QR generado\n');
    console.log('📋 Datos del QR:');
    console.log(JSON.stringify(datosQR, null, 2));
    console.log('\n🔗 Token único:', tokenUnico);
    console.log('\n✨ ¡Todo listo! Ahora puedes escanear el QR desde la app móvil.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

crearClaseYEvento();
