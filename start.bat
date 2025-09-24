@echo off
chcp 65001 >nul
title Confianza al Volante - Iniciador

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🚗 CONFIANZA AL VOLANTE 🚗                ║
echo ║                                                              ║
echo ║              Juntas Llegamos Más Lejos                      ║
echo ║                                                              ║
echo ║    Iniciador automático para Windows                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Verificar si Python está instalado
C:\Users\User\AppData\Local\Programs\Python\Python311\python.exe python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python no está instalado o no está en el PATH
    echo.
    echo 📥 Por favor instala Python 3.10+ desde:
    echo    https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

:: Verificar si existe entorno virtual
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

:: Ejecutar script de Python
echo 🚀 Iniciando Confianza al Volante...
python start.py

pause
