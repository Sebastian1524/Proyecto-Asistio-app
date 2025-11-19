const { pool } = require('../config/database');

async function fixForeignKey() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Corrigiendo foreign key de asistencia...\n');

    // 1. Eliminar la constraint antigua
    console.log('1️⃣ Eliminando constraint antigua...');
    await client.query(`
      ALTER TABLE asistencia 
      DROP CONSTRAINT IF EXISTS asistencia_id_evento_fkey;
    `);
    console.log('✅ Constraint antigua eliminada\n');

    // 2. Agregar la nueva constraint apuntando a evento_clase
    console.log('2️⃣ Agregando nueva constraint a evento_clase...');
    await client.query(`
      ALTER TABLE asistencia 
      ADD CONSTRAINT asistencia_id_evento_fkey 
      FOREIGN KEY (id_evento) 
      REFERENCES evento_clase(id_evento) 
      ON DELETE CASCADE;
    `);
    console.log('✅ Nueva constraint agregada\n');

    console.log('✨ Foreign key corregida exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixForeignKey();
