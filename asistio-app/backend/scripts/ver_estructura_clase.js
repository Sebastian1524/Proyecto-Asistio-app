const { pool } = require('../config/database');

async function verEstructuraClase() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Estructura de la tabla clase:\n');

    const columnas = await client.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'clase'
       ORDER BY ordinal_position`
    );

    columnas.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '* requerido' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verEstructuraClase();
