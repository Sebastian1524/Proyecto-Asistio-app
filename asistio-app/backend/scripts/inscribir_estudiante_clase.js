const { pool } = require('../config/database');

async function inscribirEstudianteEnClase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Buscando estudiante y clase...\n');
    
    // Buscar el estudiante
    const estudiante = await client.query(
      `SELECT id_usuario, email, nombre, primer_apellido, segundo_apellido
       FROM usuario 
       WHERE email = 'estudiante@sena.edu.co'`
    );
    
    if (estudiante.rows.length === 0) {
      console.log('❌ Estudiante no encontrado');
      return;
    }
    
    const idEstudiante = estudiante.rows[0].id_usuario;
    const nombreCompleto = `${estudiante.rows[0].nombre} ${estudiante.rows[0].primer_apellido} ${estudiante.rows[0].segundo_apellido || ''}`.trim();
    console.log('✅ Estudiante encontrado:', nombreCompleto);
    
    // Buscar todas las clases activas
    const clases = await client.query(
      `SELECT id_clase, nombre_clase 
       FROM clase 
       WHERE estado = 'activo' 
       ORDER BY fecha_de_creacion DESC`
    );
    
    console.log(`\n📚 Clases activas encontradas: ${clases.rows.length}\n`);
    
    for (const clase of clases.rows) {
      console.log(`Inscribiendo en: ${clase.nombre_clase}...`);
      
      // Verificar si ya está inscrito
      const yaInscrito = await client.query(
        `SELECT * FROM clase_estudiante 
         WHERE id_clase = $1 AND id_usuario = $2`,
        [clase.id_clase, idEstudiante]
      );
      
      if (yaInscrito.rows.length > 0) {
        console.log(`  ⚠️  Ya inscrito en ${clase.nombre_clase}`);
        continue;
      }
      
      // Inscribir al estudiante
      await client.query(
        `INSERT INTO clase_estudiante (id_clase, id_usuario, fecha_inscripcion)
         VALUES ($1, $2, NOW())`,
        [clase.id_clase, idEstudiante]
      );
      
      console.log(`  ✅ Inscrito exitosamente en ${clase.nombre_clase}`);
    }
    
    console.log('\n✨ Proceso completado!');
    
    // Mostrar resumen
    const resumen = await client.query(
      `SELECT c.nombre_clase, ce.fecha_inscripcion
       FROM clase_estudiante ce
       JOIN clase c ON ce.id_clase = c.id_clase
       WHERE ce.id_usuario = $1
       ORDER BY ce.fecha_inscripcion DESC`,
      [idEstudiante]
    );
    
    console.log('\n📋 Clases en las que está inscrito el estudiante:');
    resumen.rows.forEach(r => {
      console.log(`  - ${r.nombre_clase} (${new Date(r.fecha_inscripcion).toLocaleDateString()})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

inscribirEstudianteEnClase();
