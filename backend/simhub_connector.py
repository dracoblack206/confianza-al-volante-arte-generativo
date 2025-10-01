"""
SimHub Connector para Confianza al Volante
Conecta de forma asíncrona a múltiples instancias de SimHub 
para capturar datos de telemetría en tiempo real.
"""

import asyncio
import aiohttp
import logging
from typing import List, Dict, Optional
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimHubConnector:
    """Conector asíncrono para múltiples instancias de SimHub"""
    
    def __init__(self, timeout: int = 5):
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Inicializar sesión HTTP asíncrona"""
        self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cerrar sesión HTTP"""
        if self.session:
            await self.session.close()
    
    async def fetch_single_sim_data(self, sim_id: str, url: str) -> Dict:
        """
        Obtiene datos de telemetría de un solo simulador
        
        Args:
            sim_id: Identificador del simulador (ej. "sim_1")
            url: URL de la API de SimHub
            
        Returns:
            Diccionario con los datos del simulador o datos por defecto si hay error
        """
        default_data = {
            "sim_id": sim_id,
            "connected": False,
            "SpeedKmh": 0.0,
            "Rpms": 0.0,
            "Gear": 0,
            "SteeringAngle": 0.0,
            "Throttle": 0.0,
            "Brake": 0.0,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        try:
            if not self.session:
                logger.error(f"Sesión no inicializada para {sim_id}")
                return default_data
                
            async with self.session.get(url) as response:
                if response.status == 200:
                    raw_data = await response.json()
                    
                    # SimHub /api/getgamedata puede contener datos en "NewData" cuando hay juego activo
                    # o directamente en el root si está configurado así
                    game_data = raw_data.get("NewData", raw_data)
                    
                    # Verificar si hay juego activo
                    game_running = raw_data.get("GameRunning", False)
                    is_in_race = raw_data.get("IsGameInRace", False)
                    
                    # Extraer y validar los datos necesarios
                    # Intentar diferentes nombres de campos que SimHub puede usar
                    processed_data = {
                        "sim_id": sim_id,
                        "connected": True,
                        "game_running": game_running,
                        "is_in_race": is_in_race,
                        "SpeedKmh": float(game_data.get("SpeedKmh") or game_data.get("Speed") or 0),
                        "Rpms": float(game_data.get("Rpms") or game_data.get("RPM") or game_data.get("EngineRpm") or 0),
                        "Gear": int(game_data.get("Gear") or game_data.get("CurrentGear") or 0),
                        "SteeringAngle": float(game_data.get("SteeringAngle") or game_data.get("Steering") or 0),
                        "Throttle": float(game_data.get("Throttle") or game_data.get("Gas") or 0),
                        "Brake": float(game_data.get("Brake") or 0),
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    
                    logger.debug(f"Datos obtenidos de {sim_id}: SpeedKmh={processed_data['SpeedKmh']}, GameRunning={game_running}")
                    return processed_data
                else:
                    logger.warning(f"Error HTTP {response.status} en {sim_id} ({url})")
                    return default_data
                    
        except asyncio.TimeoutError:
            logger.warning(f"Timeout en {sim_id} ({url})")
            return default_data
        except aiohttp.ClientError as e:
            logger.warning(f"Error de cliente en {sim_id} ({url}): {e}")
            return default_data
        except json.JSONDecodeError as e:
            logger.warning(f"Error JSON en {sim_id} ({url}): {e}")
            return default_data
        except Exception as e:
            logger.error(f"Error inesperado en {sim_id} ({url}): {e}")
            return default_data
    
    async def fetch_all_sim_data(self, sim_urls: Dict[str, str]) -> Dict[str, Dict]:
        """
        Obtiene datos de telemetría de múltiples simuladores en paralelo
        
        Args:
            sim_urls: Diccionario {sim_id: url} para cada simulador
            
        Returns:
            Diccionario con datos de todos los simuladores
        """
        if not sim_urls:
            logger.warning("No se proporcionaron URLs de simuladores")
            return {}
            
        # Crear tareas asíncronas para todos los simuladores
        tasks = [
            self.fetch_single_sim_data(sim_id, url) 
            for sim_id, url in sim_urls.items()
        ]
        
        try:
            # Ejecutar todas las tareas en paralelo
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Procesar resultados
            all_data = {}
            for result in results:
                if isinstance(result, Exception):
                    logger.error(f"Excepción en tarea paralela: {result}")
                    continue
                    
                sim_id = result.get("sim_id")
                if sim_id:
                    all_data[sim_id] = result
                    
            logger.info(f"Datos obtenidos de {len(all_data)} simuladores")
            return all_data
            
        except Exception as e:
            logger.error(f"Error en fetch_all_sim_data: {e}")
            return {}


# Configuración por defecto para desarrollo/testing
DEFAULT_SIM_URLS = {
    "sim_1": "http://192.168.1.4:8888/api/getgamedata",
    "sim_2": "http://192.168.1.101:8888/api/getgamedata", 
    "sim_3": "http://192.168.1.102:8888/api/getgamedata",
    "sim_4": "http://192.168.1.103:8888/api/getgamedata",
    "sim_5": "http://192.168.1.104:8888/api/getgamedata"
}


async def test_connector():
    """Función de prueba para el conector"""
    print("🔧 Probando SimHub Connector...")
    
    async with SimHubConnector() as connector:
        data = await connector.fetch_all_sim_data(DEFAULT_SIM_URLS)
        
        print(f"📊 Datos obtenidos de {len(data)} simuladores:")
        for sim_id, sim_data in data.items():
            status = "✅ Conectado" if sim_data["connected"] else "❌ Desconectado"
            print(f"  {sim_id}: {status} - Velocidad: {sim_data['SpeedKmh']} km/h")


if __name__ == "__main__":
    # Ejecutar prueba
    asyncio.run(test_connector())
