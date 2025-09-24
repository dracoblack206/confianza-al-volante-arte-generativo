@echo off
chcp 65001 >nul
title 🎮 DEMO - Confianza al Volante

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎮 MODO DEMO ACTIVADO 🎮                  ║
echo ║                                                              ║
echo ║                 Confianza al Volante                        ║
echo ║                                                              ║
echo ║    📊 Datos simulados - NO requiere SimHub                  ║
echo ║    🚀 Prueba completa del sistema                           ║
echo ║    ⚡ Listo en 30 segundos                                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python no está instalado o no está en el PATH
    echo.
    echo 📥 Instala Python desde: https://www.python.org/downloads/
    echo ✅ Durante la instalación marca "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo ✅ Python detectado
echo.

:: Verificar si existe entorno virtual, si no crearlo
if not exist "venv\" (
    echo 🔧 Creando entorno virtual...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Error creando entorno virtual
        pause
        exit /b 1
    )
    echo ✅ Entorno virtual creado
)

:: Activar entorno virtual
echo 🔄 Activando entorno virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Error activando entorno virtual
    pause
    exit /b 1
)

:: Instalar dependencias si es necesario
echo 📦 Verificando dependencias...
pip install -q fastapi uvicorn requests aiohttp websockets

echo.
echo 🎮 INICIANDO DEMO...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 El navegador se abrirá en: http://localhost:8000
echo 📊 Verás 5 simuladores con datos realistas en tiempo real
echo 🎨 Arte colectivo animado en el fondo
echo 💙 Métricas de calma y control calculándose
echo.
echo ⏹️  Para parar: Presiona Ctrl+C en esta ventana
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Cambiar al directorio backend
cd backend

:: Abrir navegador después de 3 segundos
start "" timeout /t 3 >nul && start http://localhost:8000

:: Ejecutar la aplicación demo
python main_demo.py

echo.
echo 👋 Demo terminado
pause
