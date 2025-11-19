const { pool } = require('../config/database');

async function normalizarEstados() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Normalizando estados de clases y eventos...\n');

    // 1. Actualizar estados de clases
    console.log('1️⃣ Actualizando estados de clases...');
    const resultClases = await client.query(`
      UPDATE clase 
      SET estado = 'activo' 
      WHERE estado = 'activa' OR estado IS NULL
    `);
    console.log(`✅ ${resultClases.rowCount} clases actualizadas a 'activo'\n`);

    // 2. Actualizar estados de eventos
    console.log('2️⃣ Actualizando estados de eventos...');
    const resultEventos = await client.query(`
      UPDATE evento_clase 
      SET estado = 'activo' 
      WHERE estado = 'activa' OR estado IS NULL
    `);
    console.log(`✅ ${resultEventos.rowCount} eventos actualizados a 'activo'\n`);

    // 3. Mostrar resumen
    console.log('📊 Resumen de estados:');
    
    const clases = await client.query(`
      SELECT estado, COUNT(*) as cantidad 
      FROM clase 
      GROUP BY estado
    `);
    
    console.log('\nClases:');
    clases.rows.forEach(row => {
      console.log(`  - ${row.estado}: ${row.cantidad}`);
    });

    const eventos = await client.query(`
      SELECT estado, COUNT(*) as cantidad 
      FROM evento_clase 
      GROUP BY estado
    `);
    
    console.log('\nEventos:');
    eventos.rows.forEach(row => {
      console.log(`  - ${row.estado}: ${row.cantidad}`);
    });

    console.log('\n✨ Estados normalizados correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

normalizarEstados();
