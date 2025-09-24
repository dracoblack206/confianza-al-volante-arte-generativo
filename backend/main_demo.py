"""
DEMO VERSION - Aplicación Principal Confianza al Volante
Versión de prueba que funciona SIN SimHub usando datos simulados
"""

import asyncio
import json
import logging
import sys
import os
from typing import Dict, Set
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# Importar nuestros módulos
from data_processor import DriverPerformanceProcessor

# Importar el simulador de datos
sys.path.append(str(Path(__file__).parent.parent))
from demo_simulator import DemoSimulator

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración de la aplicación
class DemoConfig:
    """Configuración para la versión demo"""
    
    # Intervalo de actualización en segundos
    UPDATE_INTERVAL = 0.1  # 100ms
    
    # Configuración del puerto frontend
    FRONTEND_PATH = Path(__file__).parent.parent / "frontend"

config = DemoConfig()

# Inicializar FastAPI
app = FastAPI(
    title="Confianza al Volante - DEMO VERSION",
    description="Versión de demostración con datos simulados (SIN SimHub requerido)",
    version="1.0.0-demo"
)

# Gestión de conexiones WebSocket (mismo código que la versión real)
class ConnectionManager:
    """Gestor de conexiones WebSocket activas"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        """Acepta nueva conexión WebSocket"""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Nueva conexión WebSocket. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Desconecta WebSocket"""
        self.active_connections.discard(websocket)
        logger.info(f"Conexión WebSocket cerrada. Total: {len(self.active_connections)}")
    
    async def broadcast_data(self, data: dict):
        """Envía datos a todas las conexiones activas"""
        if not self.active_connections:
            return
            
        message = json.dumps(data)
        disconnected = set()
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Error enviando datos a WebSocket: {e}")
                disconnected.add(connection)
        
        # Limpiar conexiones muertas
        for connection in disconnected:
            self.active_connections.discard(connection)

# Instancias globales
manager = ConnectionManager()
processor = DriverPerformanceProcessor()
demo_simulator = DemoSimulator()

# Estado de la aplicación
app_state = {
    "running": False,
    "stats": {
        "total_updates": 0,
        "last_update": None,
        "connected_sims": 5  # En demo, siempre 5 conectados
    },
    "demo_mode": True
}

@app.on_event("startup")
async def startup_event():
    """Inicialización al arrancar la aplicación"""
    logger.info("🎮 Iniciando Confianza al Volante - MODO DEMO")
    logger.info("📊 Usando datos simulados (NO se requiere SimHub)")
    
    # Iniciar bucle principal de datos
    asyncio.create_task(demo_data_loop())
    
    logger.info("✅ Sistema DEMO iniciado correctamente")

@app.on_event("shutdown")
async def shutdown_event():
    """Limpieza al cerrar la aplicación"""
    logger.info("🛑 Cerrando Confianza al Volante - DEMO")
    app_state["running"] = False
    logger.info("✅ Sistema DEMO cerrado correctamente")

async def demo_data_loop():
    """
    Bucle principal que genera datos simulados, los procesa y los distribuye
    """
    app_state["running"] = True
    logger.info(f"🔄 Iniciando bucle de datos DEMO (intervalo: {config.UPDATE_INTERVAL}s)")
    
    while app_state["running"]:
        try:
            # Generar datos simulados
            sim_data = demo_simulator.generate_all_data()
            
            # Procesar datos y calcular métricas (mismo código que versión real)
            for sim_id, data in sim_data.items():
                processor.update_data(sim_id, data)
            
            # Obtener métricas procesadas
            all_metrics = processor.get_all_metrics()
            summary_stats = processor.get_summary_stats()
            
            # Preparar payload para frontend (mismo formato que versión real)
            payload = {
                "timestamp": asyncio.get_event_loop().time(),
                "simulators": {},
                "summary": summary_stats,
                "demo_mode": True  # Indicador de que es demo
            }
            
            # Añadir datos de cada simulador
            for sim_id in ["sim_1", "sim_2", "sim_3", "sim_4", "sim_5"]:
                sim_raw_data = sim_data.get(sim_id, {})
                sim_metrics = all_metrics.get(sim_id, {})
                
                payload["simulators"][sim_id] = {
                    "raw_data": sim_raw_data,
                    "metrics": sim_metrics,
                    "pilot_name": f"Piloto {sim_id.split('_')[1]} (DEMO)"
                }
            
            # Enviar a todos los clientes conectados
            await manager.broadcast_data(payload)
            
            # Actualizar estadísticas
            app_state["stats"]["total_updates"] += 1
            app_state["stats"]["last_update"] = payload["timestamp"]
            app_state["stats"]["connected_sims"] = sum(
                1 for data in sim_data.values() 
                if data.get("connected", False)
            )
            
            # Esperar antes del siguiente ciclo
            await asyncio.sleep(config.UPDATE_INTERVAL)
            
        except Exception as e:
            logger.error(f"Error en bucle principal de datos DEMO: {e}")
            await asyncio.sleep(1)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Endpoint WebSocket para comunicación en tiempo real con el frontend
    """
    await manager.connect(websocket)
    
    try:
        # Enviar estado inicial
        initial_payload = {
            "type": "connection_established",
            "message": "Conectado a Confianza al Volante - MODO DEMO",
            "demo_mode": True,
            "config": {
                "update_interval": config.UPDATE_INTERVAL,
                "simulators": ["sim_1", "sim_2", "sim_3", "sim_4", "sim_5"]
            }
        }
        await websocket.send_text(json.dumps(initial_payload))
        
        # Mantener conexión viva
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        logger.info("Cliente WebSocket desconectado")
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
    finally:
        manager.disconnect(websocket)

@app.get("/")
async def serve_frontend():
    """Servir la página principal del frontend"""
    return FileResponse(config.FRONTEND_PATH / "index.html")

@app.get("/styles.css")
async def serve_css():
    """Servir archivo CSS"""
    return FileResponse(config.FRONTEND_PATH / "styles.css")

@app.get("/script.js") 
async def serve_js():
    """Servir archivo JavaScript"""
    return FileResponse(config.FRONTEND_PATH / "script.js")

@app.get("/artwork")
async def serve_artwork():
    """Servir página de obra de arte"""
    return FileResponse(config.FRONTEND_PATH / "artwork.html")

@app.get("/artwork.js")
async def serve_artwork_js():
    """Servir JavaScript de obra de arte"""
    return FileResponse(config.FRONTEND_PATH / "artwork.js")

@app.get("/api/status")
async def get_status():
    """Endpoint REST para obtener estado del sistema DEMO"""
    return {
        "status": "running" if app_state["running"] else "stopped",
        "mode": "DEMO - Datos Simulados",
        "stats": app_state["stats"],
        "config": {
            "update_interval": config.UPDATE_INTERVAL,
            "frontend_path": str(config.FRONTEND_PATH),
            "demo_mode": True
        }
    }

@app.get("/api/metrics")
async def get_current_metrics():
    """Endpoint REST para obtener métricas actuales DEMO"""
    return {
        "metrics": processor.get_all_metrics(),
        "summary": processor.get_summary_stats(),
        "timestamp": asyncio.get_event_loop().time(),
        "demo_mode": True
    }

# Montar archivos estáticos del frontend
if config.FRONTEND_PATH.exists():
    app.mount("/static", StaticFiles(directory=config.FRONTEND_PATH), name="static")
    logger.info(f"📁 Frontend servido desde: {config.FRONTEND_PATH}")
else:
    logger.warning(f"⚠️ Directorio frontend no encontrado: {config.FRONTEND_PATH}")

if __name__ == "__main__":
    print("🎮 INICIANDO MODO DEMO - CONFIANZA AL VOLANTE")
    print("=" * 60)
    print("📊 Este modo usa datos simulados")
    print("🚫 NO requiere SimHub ni juegos instalados")
    print("🌐 Abrirá automáticamente en: http://localhost:8000")
    print("⏹️  Presiona Ctrl+C para detener")
    print("=" * 60)
    
    # Configuración para desarrollo
    uvicorn.run(
        "main_demo:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Deshabilitado en demo para evitar problemas
        log_level="info"
    )
