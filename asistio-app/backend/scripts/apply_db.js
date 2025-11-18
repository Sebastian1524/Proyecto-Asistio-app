const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const filePath = path.join(__dirname, '..', 'database.sql');

const run = async () => {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('Leyendo', filePath);
    // Ejecutar todo el script de una vez
    await pool.query(sql);
    console.log('Script SQL aplicado correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error aplicando script SQL:', error.message || error);
    process.exit(1);
  }
};

run();
