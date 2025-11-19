const { pool } = require('../config/database');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

async function crearEventosParaClase() {
  const client = await pool.connect();
  
  try {
    console.log('📚 Creando eventos para clases existentes...\n');

    // Buscar todas las clases activas
    const clasesRes = await client.query(`
      SELECT id_clase, nombre_clase 
      FROM clase 
      WHERE estado = 'activo'
      ORDER BY id_clase
    `);

    if (clasesRes.rows.length === 0) {
      console.log('❌ No hay clases activas');
      return;
    }

    console.log(`📋 Clases encontradas: ${clasesRes.rows.length}\n`);

    for (const clase of clasesRes.rows) {
      console.log(`\n🎓 Clase: ${clase.nombre_clase} (ID: ${clase.id_clase})`);
      
      // Verificar si ya tiene eventos
      const eventosExistentes = await client.query(
        'SELECT COUNT(*) FROM evento_clase WHERE id_clase = $1',
        [clase.id_clase]
      );
      
      const cantidadEventos = parseInt(eventosExistentes.rows[0].count);
      console.log(`   Eventos existentes: ${cantidadEventos}`);

      if (cantidadEventos === 0) {
        // Crear 2 eventos de prueba para esta clase
        const fechaHoy = new Date().toISOString().split('T')[0];
        const horaActual = new Date().toTimeString().split(' ')[0].substring(0, 5);
        
        for (let i = 1; i <= 2; i++) {
          const tokenUnico = uuidv4();
          const nombreEvento = `Sesión ${i} - ${clase.nombre_clase}`;
          
          const eventoRes = await client.query(
            `INSERT INTO evento_clase (id_clase, nombre_evento, descripcion, fecha_evento, 
                                       hora_inicio, token_unico, estado)
             VALUES ($1, $2, $3, $4, $5, $6, 'activo')
             RETURNING *`,
            [clase.id_clase, nombreEvento, `Clase ${i} de ${clase.nombre_clase}`, fechaHoy, horaActual, tokenUnico]
          );
          
          const evento = eventoRes.rows[0];
          
          // Generar código QR
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
          
          console.log(`   ✅ Evento creado: ${nombreEvento} (ID: ${evento.id_evento})`);
        }
      } else {
        console.log('   ℹ️  Ya tiene eventos, saltando...');
      }
    }

    console.log('\n✨ Proceso completado!');
    console.log('\n📊 Resumen final:');
    
    const resumen = await client.query(`
      SELECT c.nombre_clase, COUNT(e.id_evento) as eventos
      FROM clase c
      LEFT JOIN evento_clase e ON c.id_clase = e.id_clase
      WHERE c.estado = 'activo'
      GROUP BY c.id_clase, c.nombre_clase
      ORDER BY c.nombre_clase
    `);
    
    resumen.rows.forEach(row => {
      console.log(`  - ${row.nombre_clase}: ${row.eventos} evento(s)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

crearEventosParaClase();
