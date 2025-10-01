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
from f1_2024_normalizer import normalize_f1_data

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
                    
                    # Verificar que raw_data sea válido
                    if not raw_data or not isinstance(raw_data, dict):
                        logger.warning(f"Datos inválidos recibidos de {sim_id}")
                        return default_data
                    
                    # SimHub /api/getgamedata puede contener datos en "NewData" cuando hay juego activo
                    # o directamente en el root si está configurado así
                    game_data = raw_data.get("NewData")
                    if not game_data or not isinstance(game_data, dict):
                        # Si NewData no existe o no es dict, usar raw_data directamente
                        game_data = raw_data
                    
                    # Verificar si hay juego activo
                    game_running = raw_data.get("GameRunning", False)
                    is_in_race = raw_data.get("IsGameInRace", False)
                    
                    # Extraer y validar los datos necesarios
                    # Intentar diferentes nombres de campos que SimHub puede usar
                    
                    # Throttle puede venir en escala 0-100 (Assetto Corsa) o 0-1
                    throttle_value = game_data.get("Throttle") or game_data.get("Gas") or 0
                    throttle_raw = float(throttle_value) if throttle_value is not None else 0.0
                    throttle = throttle_raw / 100.0 if throttle_raw > 1.0 else throttle_raw
                    
                    # Brake generalmente está en 0-1
                    brake_value = game_data.get("Brake") or 0
                    brake = float(brake_value) if brake_value is not None else 0.0
                    
                    # SteeringAngle: Assetto Corsa no lo expone directamente
                    # Usar YawChangeVelocity o OrientationYaw como alternativa
                    steering_value = (
                        game_data.get("SteeringAngle") or 
                        game_data.get("Steering") or
                        game_data.get("YawChangeVelocity") or
                        game_data.get("OrientationYaw") or 
                        0
                    )
                    steering_angle = float(steering_value) if steering_value is not None else 0.0
                    
                    # Si usamos YawChangeVelocity, normalizarlo a rango más apropiado
                    if abs(steering_angle) > 180:
                        # Es OrientationYaw, normalizar a -45 a +45
                        steering_angle = (steering_angle % 360) - 180
                        steering_angle = max(-45, min(45, steering_angle / 4))
                    
                    # Extraer otros campos de manera segura
                    speed_value = game_data.get("SpeedKmh") or game_data.get("Speed") or 0
                    speed = float(speed_value) if speed_value is not None else 0.0
                    
                    rpms_value = game_data.get("Rpms") or game_data.get("RPM") or game_data.get("EngineRpm") or 0
                    rpms = float(rpms_value) if rpms_value is not None else 0.0
                    
                    gear_value = game_data.get("Gear") or game_data.get("CurrentGear") or 0
                    gear = int(float(gear_value)) if gear_value is not None else 0
                    
                    # DATOS REALES DEL JUEGO (sin normalizar)
                    raw_game_data = {
                        "SpeedKmh": speed,
                        "Rpms": rpms,
                        "Gear": gear,
                        "SteeringAngle": steering_angle,
                        "Throttle": throttle,
                        "Brake": brake,
                    }
                    
                    raw_processed_data = {
                        "sim_id": sim_id,
                        "connected": True,
                        "game_running": game_running,
                        "is_in_race": is_in_race,
                        "timestamp": asyncio.get_event_loop().time(),
                        **raw_game_data
                    }
                    
                    # NORMALIZAR DATOS PARA QUE EL ARTE SE VEA COMO EL DEMO
                    normalized_data = normalize_f1_data(raw_processed_data, apply_boost=True)
                    
                    # ENVIAR AMBOS: datos reales Y normalizados
                    processed_data = {
                        "sim_id": sim_id,
                        "connected": True,
                        "game_running": game_running,
                        "is_in_race": is_in_race,
                        "timestamp": raw_processed_data["timestamp"],
                        # Datos normalizados (para arte y cálculo de métricas)
                        "SpeedKmh": normalized_data["SpeedKmh"],
                        "Rpms": normalized_data["Rpms"],
                        "Gear": normalized_data["Gear"],
                        "SteeringAngle": normalized_data["SteeringAngle"],
                        "Throttle": normalized_data["Throttle"],
                        "Brake": normalized_data["Brake"],
                        # Datos reales del juego (para dashboard)
                        "raw_game_data": raw_game_data
                    }
                    
                    logger.info(f"✅ {sim_id}: Real({raw_game_data['SpeedKmh']:.0f}km/h, {raw_game_data['Rpms']:.0f}rpm) → Norm({normalized_data['SpeedKmh']:.0f}km/h, {normalized_data['Rpms']:.0f}rpm)")
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
