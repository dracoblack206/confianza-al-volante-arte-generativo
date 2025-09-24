#!/usr/bin/env python3
"""
Script de Inicio - Confianza al Volante
Facilita el lanzamiento del sistema con configuración automática
"""

import sys
import os
import subprocess
import webbrowser
import time
from pathlib import Path

def print_banner():
    """Mostrar banner del proyecto"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🚗 CONFIANZA AL VOLANTE 🚗                ║
    ║                                                              ║
    ║              Juntas Llegamos Más Lejos                      ║
    ║                                                              ║
    ║    Sistema de empoderamiento femenino a través de la        ║
    ║    traducción de habilidades de conducción en métricas      ║
    ║    visuales de calma y control.                             ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Verificar versión de Python"""
    if sys.version_info < (3, 10):
        print("❌ Error: Se requiere Python 3.10 o superior")
        print(f"   Versión actual: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detectado")

def check_virtual_environment():
    """Verificar si estamos en un entorno virtual"""
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    
    if not in_venv:
        print("⚠️  Advertencia: No se detectó entorno virtual")
        print("   Se recomienda usar un entorno virtual:")
        print("   python -m venv venv")
        print("   venv\\Scripts\\activate  # Windows")
        print("   source venv/bin/activate  # Linux/Mac")
        
        response = input("\n¿Continuar sin entorno virtual? [y/N]: ")
        if response.lower() != 'y':
            sys.exit(0)
    else:
        print("✅ Entorno virtual detectado")

def install_dependencies():
    """Instalar dependencias del proyecto"""
    requirements_path = Path("requirements.txt")
    
    if not requirements_path.exists():
        print("❌ Error: No se encontró requirements.txt")
        sys.exit(1)
    
    print("📦 Instalando dependencias...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True, capture_output=True)
        print("✅ Dependencias instaladas correctamente")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        sys.exit(1)

def get_configuration():
    """Obtener configuración del usuario"""
    print("\n🔧 Configuración del Sistema")
    print("=" * 50)
    
    # URLs de SimHub
    print("\n📡 Configuración de SimHub:")
    print("Ingresa las URLs de los simuladores (o presiona Enter para usar valores por defecto)")
    
    sim_urls = {}
    defaults = {
        "sim_1": "http://192.168.1.100:8888/api/v1/data",
        "sim_2": "http://192.168.1.101:8888/api/v1/data",
        "sim_3": "http://192.168.1.102:8888/api/v1/data",
        "sim_4": "http://192.168.1.103:8888/api/v1/data",
        "sim_5": "http://192.168.1.104:8888/api/v1/data"
    }
    
    for sim_id, default_url in defaults.items():
        user_input = input(f"{sim_id} [{default_url}]: ").strip()
        sim_urls[sim_id] = user_input if user_input else default_url
    
    # Puerto del servidor
    default_port = "8000"
    port = input(f"\n🌐 Puerto del servidor [{default_port}]: ").strip()
    port = port if port else default_port
    
    # Intervalo de actualización
    default_interval = "0.1"
    interval = input(f"⏱️  Intervalo de actualización en segundos [{default_interval}]: ").strip()
    interval = interval if interval else default_interval
    
    return {
        'sim_urls': sim_urls,
        'port': port,
        'interval': interval
    }

def create_env_file(config):
    """Crear archivo .env con la configuración"""
    env_content = f"""# Configuración Confianza al Volante
# Generado automáticamente por start.py

# URLs de SimHub
SIM_1_URL={config['sim_urls']['sim_1']}
SIM_2_URL={config['sim_urls']['sim_2']}
SIM_3_URL={config['sim_urls']['sim_3']}
SIM_4_URL={config['sim_urls']['sim_4']}
SIM_5_URL={config['sim_urls']['sim_5']}

# Configuración del servidor
SERVER_PORT={config['port']}
UPDATE_INTERVAL={config['interval']}
"""
    
    with open('.env', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print("✅ Archivo .env creado")

def start_server(port):
    """Iniciar el servidor FastAPI"""
    print(f"\n🚀 Iniciando servidor en puerto {port}...")
    
    # Cambiar al directorio backend
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Error: Directorio backend no encontrado")
        sys.exit(1)
    
    os.chdir("backend")
    
    try:
        # Comando para iniciar uvicorn
        cmd = [
            sys.executable, "-m", "uvicorn",
            "main:app",
            "--host", "0.0.0.0",
            "--port", port,
            "--reload"
        ]
        
        print("📋 Comando de inicio:")
        print(f"   {' '.join(cmd)}")
        print(f"\n🌐 Servidor iniciará en: http://localhost:{port}")
        print("🎨 Dashboard disponible en: http://localhost:" + port)
        print("📊 API status en: http://localhost:" + port + "/api/status")
        print("\n⚠️  Asegúrate de que SimHub esté ejecutándose en los PCs simuladores")
        print("🔄 El servidor se reiniciará automáticamente al detectar cambios")
        print("\n💡 Presiona Ctrl+C para detener el servidor")
        print("=" * 60)
        
        # Pequeña pausa antes de abrir el navegador
        time.sleep(2)
        
        # Abrir navegador automáticamente
        try:
            webbrowser.open(f"http://localhost:{port}")
        except:
            pass  # No hay problema si no se puede abrir el navegador
        
        # Ejecutar servidor
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor detenido por el usuario")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error ejecutando servidor: {e}")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")

def main():
    """Función principal"""
    print_banner()
    
    print("🔍 Verificando sistema...")
    check_python_version()
    check_virtual_environment()
    
    print("\n📦 Verificando dependencias...")
    install_dependencies()
    
    # Obtener configuración
    config = get_configuration()
    
    # Crear archivo .env
    create_env_file(config)
    
    print(f"\n🎯 Configuración completada")
    print("=" * 50)
    for sim_id, url in config['sim_urls'].items():
        print(f"   {sim_id}: {url}")
    print(f"   Puerto: {config['port']}")
    print(f"   Intervalo: {config['interval']}s")
    
    input("\n⚡ Presiona Enter para iniciar el servidor...")
    
    # Iniciar servidor
    start_server(config['port'])

if __name__ == "__main__":
    main()
