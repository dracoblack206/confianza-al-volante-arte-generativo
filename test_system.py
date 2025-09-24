#!/usr/bin/env python3
"""
Script de Prueba del Sistema - Confianza al Volante
Verifica que todos los componentes funcionen correctamente
"""

import asyncio
import sys
import json
from pathlib import Path

# Agregar el directorio backend al path
sys.path.append(str(Path(__file__).parent / "backend"))

async def test_simhub_connector():
    """Probar el conector de SimHub"""
    print("🔧 Probando SimHub Connector...")
    
    try:
        from simhub_connector import SimHubConnector, test_connector
        await test_connector()
        print("✅ SimHub Connector: OK")
        return True
    except Exception as e:
        print(f"❌ SimHub Connector: ERROR - {e}")
        return False

def test_data_processor():
    """Probar el procesador de datos"""
    print("\n🧠 Probando Data Processor...")
    
    try:
        from data_processor import test_processor
        test_processor()
        print("✅ Data Processor: OK")
        return True
    except Exception as e:
        print(f"❌ Data Processor: ERROR - {e}")
        return False

def test_frontend_files():
    """Verificar archivos del frontend"""
    print("\n🎨 Verificando archivos del frontend...")
    
    frontend_files = [
        "frontend/index.html",
        "frontend/styles.css", 
        "frontend/script.js"
    ]
    
    all_ok = True
    for file_path in frontend_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}: Existe")
        else:
            print(f"❌ {file_path}: No encontrado")
            all_ok = False
    
    return all_ok

def test_backend_files():
    """Verificar archivos del backend"""
    print("\n⚙️  Verificando archivos del backend...")
    
    backend_files = [
        "backend/main.py",
        "backend/simhub_connector.py",
        "backend/data_processor.py"
    ]
    
    all_ok = True
    for file_path in backend_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}: Existe")
        else:
            print(f"❌ {file_path}: No encontrado")
            all_ok = False
    
    return all_ok

def test_project_structure():
    """Verificar estructura completa del proyecto"""
    print("\n📁 Verificando estructura del proyecto...")
    
    expected_structure = {
        "backend/": ["main.py", "simhub_connector.py", "data_processor.py"],
        "frontend/": ["index.html", "styles.css", "script.js"],
        "": ["requirements.txt", "README.md", "start.py", "start.bat"]
    }
    
    all_ok = True
    for directory, files in expected_structure.items():
        dir_path = Path(directory)
        
        if directory == "":
            print(f"📂 Archivos raíz:")
        else:
            print(f"📂 {directory}")
            
        for file_name in files:
            file_path = dir_path / file_name
            if file_path.exists():
                size_kb = file_path.stat().st_size / 1024
                print(f"   ✅ {file_name} ({size_kb:.1f} KB)")
            else:
                print(f"   ❌ {file_name}: No encontrado")
                all_ok = False
    
    return all_ok

async def test_import_dependencies():
    """Probar importación de dependencias"""
    print("\n📦 Probando dependencias...")
    
    dependencies = [
        "fastapi",
        "uvicorn", 
        "aiohttp",
        "websockets",
        "requests"
    ]
    
    all_ok = True
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep}: Instalado")
        except ImportError:
            print(f"❌ {dep}: No instalado")
            all_ok = False
    
    return all_ok

def generate_test_report(results):
    """Generar reporte de pruebas"""
    print("\n" + "="*60)
    print("📋 REPORTE DE PRUEBAS DEL SISTEMA")
    print("="*60)
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    
    print(f"✅ Pruebas pasadas: {passed_tests}/{total_tests}")
    print(f"❌ Pruebas fallidas: {total_tests - passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("\n🎉 ¡TODOS LOS TESTS PASARON!")
        print("🚀 El sistema está listo para usar")
        print("\n💡 Para iniciar el proyecto:")
        print("   - Windows: Ejecutar start.bat")
        print("   - Linux/Mac: python start.py")
    else:
        print("\n⚠️  ALGUNOS TESTS FALLARON")
        print("🔧 Revisa los errores arriba y soluciona los problemas")
        
        print("\n❌ Tests fallidos:")
        for test_name, result in results.items():
            if not result:
                print(f"   - {test_name}")
    
    print("\n" + "="*60)

async def main():
    """Función principal de pruebas"""
    print("🧪 SISTEMA DE PRUEBAS - CONFIANZA AL VOLANTE")
    print("="*60)
    
    # Ejecutar todas las pruebas
    results = {}
    
    results["Estructura del Proyecto"] = test_project_structure()
    results["Archivos Backend"] = test_backend_files()
    results["Archivos Frontend"] = test_frontend_files()
    results["Dependencias"] = await test_import_dependencies()
    results["SimHub Connector"] = await test_simhub_connector()
    results["Data Processor"] = test_data_processor()
    
    # Generar reporte
    generate_test_report(results)

if __name__ == "__main__":
    asyncio.run(main())
