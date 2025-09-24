#!/usr/bin/env python3
"""
DEMO START - Confianza al Volante
Iniciador de la versión demo con datos simulados
"""

import sys
import os
import subprocess
import webbrowser
import time
from pathlib import Path

def print_demo_banner():
    """Banner para modo demo"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🎮 MODO DEMO ACTIVADO 🎮                  ║
    ║                                                              ║
    ║                 Confianza al Volante                        ║
    ║                                                              ║
    ║    📊 Datos simulados - NO requiere SimHub                  ║
    ║    🚀 Prueba completa del sistema                           ║
    ║    ⚡ Listo en 30 segundos                                  ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python():
    """Verificar Python"""
    if sys.version_info < (3, 8):
        print("❌ Error: Se requiere Python 3.8 o superior")
        print(f"   Versión actual: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detectado")

def install_dependencies():
    """Instalar dependencias mínimas para demo"""
    print("📦 Verificando dependencias...")
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "requests", 
        "aiohttp",
        "websockets"
    ]
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            print(f"📥 Instalando {package}...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", package
            ], check=True, capture_output=True)
    
    print("✅ Dependencias verificadas")

def start_demo():
    """Iniciar la demo"""
    print("\n🎮 INICIANDO DEMO...")
    print("━" * 60)
    print()
    print("🌐 El navegador se abrirá en: http://localhost:8000")
    print("📊 Verás 5 simuladores con datos realistas en tiempo real")
    print("🎨 Arte colectivo animado en el fondo")
    print("💙 Métricas de calma y control calculándose")
    print()
    print("⏹️  Para parar: Presiona Ctrl+C en esta ventana")
    print("━" * 60)
    print()
    
    # Cambiar al directorio backend
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Error: Directorio backend no encontrado")
        sys.exit(1)
    
    os.chdir("backend")
    
    # Abrir navegador después de 3 segundos
    def open_browser():
        time.sleep(3)
        try:
            webbrowser.open("http://localhost:8000")
        except:
            pass
    
    import threading
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Ejecutar demo
    try:
        subprocess.run([sys.executable, "main_demo.py"])
    except KeyboardInterrupt:
        print("\n\n👋 Demo terminado por el usuario")
    except Exception as e:
        print(f"\n❌ Error: {e}")

def main():
    """Función principal"""
    print_demo_banner()
    
    print("🔍 Verificando sistema...")
    check_python()
    install_dependencies()
    
    print("\n🎯 Todo listo para la demo!")
    input("⚡ Presiona Enter para iniciar...")
    
    start_demo()

if __name__ == "__main__":
    main()
