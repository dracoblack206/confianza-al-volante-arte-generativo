"""
Aplicación Principal - Confianza al Volante
Orquesta la captura de datos, procesamiento y distribución en tiempo real
a través de WebSockets para crear una experiencia inmersiva de empoderamiento.
"""

import asyncio
import json
import logging
from typing import Dict, Set
import os
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

from simhub_connector import SimHubConnector, DEFAULT_SIM_URLS
from data_processor import DriverPerformanceProcessor

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# CONFIGURACIÓN DE PRODUCCIÓN
PRODUCTION_MODE = True  # Sistema listo para simuladores reales

# Configuración de la aplicación
class ConfianzaConfig:
    """Configuración centralizada de la aplicación"""
    
    # URLs de SimHub (se pueden personalizar via variables de entorno)
    SIM_URLS = {
        "sim_1": os.getenv("SIM_1_URL", "http://192.168.1.4:8888/api/getgamedata"),
        "sim_2": os.getenv("SIM_2_URL", "http://192.168.1.101:8888/api/getgamedata"),
        "sim_3": os.getenv("SIM_3_URL", "http://192.168.1.102:8888/api/getgamedata"),
        "sim_4": os.getenv("SIM_4_URL", "http://192.168.1.103:8888/api/getgamedata"),
        "sim_5": os.getenv("SIM_5_URL", "http://192.168.1.104:8888/api/getgamedata")
    }
    
    # Intervalo de actualización en segundos
    UPDATE_INTERVAL = float(os.getenv("UPDATE_INTERVAL", "0.1"))  # 100ms por defecto
    
    # Configuración del puerto frontend
    FRONTEND_PATH = Path(__file__).parent.parent / "frontend"

config = ConfianzaConfig()

# Inicializar FastAPI
app = FastAPI(
    title="Confianza al Volante - Data Bridge",
    description="Sistema de captura y visualización de métricas de conducción para empoderamiento femenino",
    version="1.0.0"
)

# Gestión de conexiones WebSocket
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
connector = None

# Estado de la aplicación
app_state = {
    "running": False,
    "stats": {
        "total_updates": 0,
        "last_update": None,
        "connected_sims": 0
    }
}

@app.on_event("startup")
async def startup_event():
    """Inicialización al arrancar la aplicación"""
    global connector
    
    logger.info("🚀 Iniciando Confianza al Volante...")
    
    # Inicializar conector SimHub
    connector = SimHubConnector()
    await connector.__aenter__()
    
    # Iniciar bucle principal de datos
    asyncio.create_task(main_data_loop())
    
    logger.info("✅ Sistema iniciado correctamente")

@app.on_event("shutdown")
async def shutdown_event():
    """Limpieza al cerrar la aplicación"""
    global connector
    
    logger.info("🛑 Cerrando Confianza al Volante...")
    
    app_state["running"] = False
    
    if connector:
        await connector.__aexit__(None, None, None)
    
    logger.info("✅ Sistema cerrado correctamente")

async def main_data_loop():
    """
    Bucle principal que captura datos de SimHub, los procesa y los distribuye
    """
    app_state["running"] = True
    logger.info(f"🔄 Iniciando bucle de datos (intervalo: {config.UPDATE_INTERVAL}s)")
    
    while app_state["running"]:
        try:
            # Capturar datos de todos los simuladores
            sim_data = await connector.fetch_all_sim_data(config.SIM_URLS)
            
            # Procesar datos y calcular métricas
            for sim_id, data in sim_data.items():
                processor.update_data(sim_id, data)
            
            # Obtener métricas procesadas
            all_metrics = processor.get_all_metrics()
            summary_stats = processor.get_summary_stats()
            
            # Preparar payload para frontend
            payload = {
                "timestamp": asyncio.get_event_loop().time(),
                "simulators": {},
                "summary": summary_stats
            }
            
            # Añadir datos de cada simulador
            for sim_id in config.SIM_URLS.keys():
                sim_raw_data = sim_data.get(sim_id, {})
                sim_metrics = all_metrics.get(sim_id, {})
                
                payload["simulators"][sim_id] = {
                    "raw_data": sim_raw_data,
                    "metrics": sim_metrics,
                    "pilot_name": f"Piloto {sim_id.split('_')[1]}"  # "Piloto 1", etc.
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
            logger.error(f"Error en bucle principal de datos: {e}")
            await asyncio.sleep(1)  # Espera más tiempo en caso de error

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
            "message": "Conectado a Confianza al Volante",
            "config": {
                "update_interval": config.UPDATE_INTERVAL,
                "simulators": list(config.SIM_URLS.keys())
            }
        }
        await websocket.send_text(json.dumps(initial_payload))
        
        # Mantener conexión viva
        while True:
            # Esperar mensajes del cliente (si los hubiera)
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
    """Endpoint REST para obtener estado del sistema"""
    return {
        "status": "running" if app_state["running"] else "stopped",
        "stats": app_state["stats"],
        "config": {
            "sim_urls": config.SIM_URLS,
            "update_interval": config.UPDATE_INTERVAL,
            "frontend_path": str(config.FRONTEND_PATH)
        }
    }

@app.get("/api/metrics")
async def get_current_metrics():
    """Endpoint REST para obtener métricas actuales"""
    return {
        "metrics": processor.get_all_metrics(),
        "summary": processor.get_summary_stats(),
        "timestamp": asyncio.get_event_loop().time()
    }

# Montar archivos estáticos del frontend
if config.FRONTEND_PATH.exists():
    app.mount("/static", StaticFiles(directory=config.FRONTEND_PATH), name="static")
    logger.info(f"📁 Frontend servido desde: {config.FRONTEND_PATH}")
else:
    logger.warning(f"⚠️ Directorio frontend no encontrado: {config.FRONTEND_PATH}")

if __name__ == "__main__":
    # Configuración para desarrollo
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
