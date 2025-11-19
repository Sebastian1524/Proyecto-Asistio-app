const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { verificarConexion } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clases', require('./routes/clases'));
app.use('/api/asistencia', require('./routes/asistencia'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Asistio funcionando correctamente',
    version: '1.0.0'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConectada = await verificarConexion();
    
    if (!dbConectada) {
      console.error('No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 Entorno: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Base de datos: ${process.env.DB_NAME}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();