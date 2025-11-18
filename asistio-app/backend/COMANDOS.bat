@echo off
REM Comandos útiles para ASISTIO Backend
REM Ejecutar desde la carpeta backend/

echo.
echo ========================================
echo   ASISTIO - Comandos Rápidos
echo ========================================
echo.
echo 1. Para crear la base de datos (primera vez):
echo    psql -U postgres -d asistio -f database.sql
echo.
echo 2. Para instalar dependencias:
echo    npm install
echo.
echo 3. Para ejecutar en desarrollo (con auto-reload):
echo    npm run dev
echo.
echo 4. Para ejecutar en producción:
echo    npm start
echo.
echo 5. Para acceder al panel web:
echo    http://localhost:3000
echo.
echo ========================================
echo   Usuarios de Prueba
echo ========================================
echo.
echo Admin:
echo   Email: admin@sena.gov.co
echo   Contraseña: admin123
echo.
echo Docente:
echo   Email: docente@sena.gov.co
echo   Contraseña: admin123
echo.
echo Estudiantes:
echo   Email: estudiante1@sena.gov.co
echo   Email: estudiante2@sena.gov.co
echo   Email: estudiante3@sena.gov.co
echo   Contraseña: admin123 (todos)
echo.
echo ========================================
echo.
pause
