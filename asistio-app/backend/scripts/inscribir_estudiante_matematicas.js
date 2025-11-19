const { pool } = require('../config/database');

async function inscribirEstudiante() {
  const client = await pool.connect();
  
  try {
    console.log('📚 Inscribiendo estudiante en Matemáticas...\n');

    // 1. Buscar el estudiante
    const estudianteRes = await client.query(
      `SELECT id_usuario, nombre, primer_apellido, email 
       FROM usuario 
       WHERE email = 'estudiante@sena.edu.co'`
    );
    
    if (estudianteRes.rows.length === 0) {
      console.log('❌ No se encontró el estudiante');
      return;
    }
    
    const estudiante = estudianteRes.rows[0];
    console.log(`✅ Estudiante: ${estudiante.nombre} ${estudiante.primer_apellido} (${estudiante.email})\n`);

    // 2. Buscar la clase de Matemáticas
    const claseRes = await client.query(
      `SELECT id_clase, nombre_clase 
       FROM clase 
       WHERE nombre_clase ILIKE '%matemática%' OR nombre_clase ILIKE '%matematica%'`
    );
    
    if (claseRes.rows.length === 0) {
      console.log('❌ No se encontró la clase de Matemáticas');
      return;
    }
    
    const clase = claseRes.rows[0];
    console.log(`✅ Clase: ${clase.nombre_clase} (ID: ${clase.id_clase})\n`);

    // 3. Verificar si ya está inscrito
    const inscripcionExistente = await client.query(
      `SELECT * FROM clase_estudiante 
       WHERE id_clase = $1 AND id_usuario = $2`,
      [clase.id_clase, estudiante.id_usuario]
    );

    if (inscripcionExistente.rows.length > 0) {
      console.log('ℹ️  El estudiante ya está inscrito en esta clase');
      return;
    }

    // 4. Inscribir al estudiante
    await client.query(
      `INSERT INTO clase_estudiante (id_clase, id_usuario, fecha_inscripcion)
       VALUES ($1, $2, CURRENT_DATE)`,
      [clase.id_clase, estudiante.id_usuario]
    );

    console.log('✨ ¡Estudiante inscrito exitosamente!\n');

    // 5. Mostrar resumen de inscripciones del estudiante
    const inscripciones = await client.query(
      `SELECT c.nombre_clase, ce.fecha_inscripcion
       FROM clase_estudiante ce
       JOIN clase c ON ce.id_clase = c.id_clase
       WHERE ce.id_usuario = $1
       ORDER BY ce.fecha_inscripcion DESC`,
      [estudiante.id_usuario]
    );

    console.log('📋 Clases inscritas:');
    inscripciones.rows.forEach(ins => {
      console.log(`  - ${ins.nombre_clase} (${ins.fecha_inscripcion.toISOString().split('T')[0]})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

inscribirEstudiante();
