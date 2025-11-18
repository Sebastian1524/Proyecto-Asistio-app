# Script de configuración rápida para ASISTIO Backend
# Uso: .\setup.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ASISTIO - Setup Automático" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$opcion = Read-Host @"
¿Qué deseas hacer?

1. Instalar dependencias (npm install)
2. Crear base de datos (ejecutar database.sql)
3. Ejecutar servidor en desarrollo (npm run dev)
4. Ejecutar servidor en producción (npm start)
5. Abrir panel web en navegador
6. Ver información del proyecto
0. Salir

Selecciona una opción (0-6)
"@

switch ($opcion) {
    "1" {
        Write-Host "`nInstalando dependencias..." -ForegroundColor Yellow
        npm install
        Write-Host "`n✅ Dependencias instaladas" -ForegroundColor Green
    }
    "2" {
        Write-Host "`nCreando base de datos..." -ForegroundColor Yellow
        Write-Host "Asegúrate de que PostgreSQL esté corriendo" -ForegroundColor Yellow
        $user = Read-Host "Usuario PostgreSQL (default: postgres)"
        if ($user -eq "") { $user = "postgres" }
        $db = "asistio"
        
        Write-Host "`nEjecutando script SQL..." -ForegroundColor Yellow
        psql -U $user -d $db -f database.sql
        
        Write-Host "`n✅ Base de datos creada" -ForegroundColor Green
    }
    "3" {
        Write-Host "`nIniciando servidor en desarrollo..." -ForegroundColor Yellow
        Write-Host "El servidor estará en http://localhost:3000" -ForegroundColor Cyan
        npm run dev
    }
    "4" {
        Write-Host "`nIniciando servidor en producción..." -ForegroundColor Yellow
        Write-Host "El servidor estará en http://localhost:3000" -ForegroundColor Cyan
        npm start
    }
    "5" {
        Write-Host "`nAbriendo panel web..." -ForegroundColor Yellow
        Start-Process "http://localhost:3000"
    }
    "6" {
        Write-Host @"

========== INFORMACIÓN DEL PROYECTO ==========

📦 ASISTIO - Sistema de Control de Asistencias
🔧 Backend: Node.js + Express + PostgreSQL

📚 Estructura:
  - config/        → Configuración de BD
  - controllers/   → Lógica de negocios
  - middleware/    → Autenticación y validaciones
  - routes/        → Definición de endpoints
  - public/        → Panel web interactivo
  - database.sql   → Script para crear BD

🔌 Endpoints Principales:
  - POST /api/auth/login
  - POST /api/clases
  - POST /api/asistencia/evento
  - POST /api/asistencia/registrar-qr
  - GET  /api/asistencia/reporte/clase/:id

👥 Usuarios de Prueba:
  Admin:      admin@sena.gov.co / admin123
  Docente:    docente@sena.gov.co / admin123
  Estudiante: estudiante1@sena.gov.co / admin123

📝 Archivos importantes:
  - README.md        → Documentación completa
  - CAMBIOS.md       → Resumen de cambios
  - .env             → Variables de entorno
  - package.json     → Dependencias

🚀 Para empezar:
  1. npm install
  2. Crear BD: psql -U postgres -d asistio -f database.sql
  3. npm run dev
  4. Abrir http://localhost:3000

" -ForegroundColor Cyan
    }
    "0" {
        Write-Host "`nHasta luego! 👋" -ForegroundColor Green
        exit
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
    }
}

Write-Host ""
$continuar = Read-Host "¿Deseas realizar otra acción? (s/n)"
if ($continuar -eq "s") {
    & $PSScriptRoot\setup.ps1
}
