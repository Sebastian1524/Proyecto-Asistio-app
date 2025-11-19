@echo off
echo ========================================
echo   PRUEBA MANUAL DEL FLUJO COMPLETO
echo ========================================
echo.

echo [1] Verificando que el backend este corriendo...
curl -s http://localhost:3000/api/clases > nul 2>&1
if errorlevel 1 (
    echo ERROR: El backend no esta corriendo en el puerto 3000
    echo Por favor inicia el backend primero: cd backend ^&^& node server.js
    pause
    exit /b
)
echo OK - Backend corriendo
echo.

echo [2] El frontend debe estar corriendo en Expo
echo    Abre la app en tu celular o emulador
echo.

echo ========================================
echo   PASOS PARA PROBAR MANUALMENTE:
echo ========================================
echo.
echo 1. COMO DOCENTE:
echo    - Email: test@sena.edu.co
echo    - Password: 123456
echo.
echo    a) Inicia sesion
echo    b) Ve a "Mis Clases"
echo    c) Crea una nueva clase
echo    d) Entra a "Eventos"
echo    e) Crea un nuevo evento
echo    f) Toca "Ver QR" para ver el codigo
echo    g) Copia el token que aparece
echo.
echo 2. COMO ESTUDIANTE:
echo    - Email: estudiante@sena.edu.co
echo    - Password: 123456
echo.
echo    a) Cierra sesion del docente
echo    b) Inicia sesion como estudiante
echo    c) Ve a "Escanear QR"
echo    d) Pega el token que copiaste
echo    e) Registra tu asistencia
echo.
echo 3. VERIFICAR COMO DOCENTE:
echo    - Cierra sesion del estudiante
echo    - Vuelve a iniciar sesion como docente
echo.
echo    a) Ve a "Eventos"
echo    b) Toca "Asistencias" en el evento
echo    c) Deberias ver al estudiante en la lista
echo    d) Ve a "Reportes"
echo    e) Deberias ver las estadisticas
echo.
echo ========================================
echo   CREDENCIALES:
echo ========================================
echo.
echo DOCENTE:
echo   Email: test@sena.edu.co
echo   Pass:  123456
echo.
echo ESTUDIANTE:
echo   Email: estudiante@sena.edu.co
echo   Pass:  123456
echo.
echo ========================================

pause
