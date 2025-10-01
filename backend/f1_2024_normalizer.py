"""
Universal Game Data Normalizer
Normaliza datos de CUALQUIER juego (F1, Assetto Corsa, etc.) 
para que el arte se vea IGUAL que en el demo
"""

import logging

logger = logging.getLogger(__name__)

class UniversalGameNormalizer:
    """
    Normaliza datos de CUALQUIER juego para que coincidan con el comportamiento del demo
    Detecta automáticamente el juego y ajusta rangos
    """
    
    def __init__(self):
        # Rangos conocidos de diferentes juegos
        self.game_ranges = {
            "f1": {
                "speed_max": 350,  # F1 puede llegar a 350+ km/h
                "rpms_max": 15000,  # F1 2024 usa RPMs muy altos
                "steering_max": 540,  # Volante puede girar más en F1
            },
            "assetto_corsa": {
                "speed_max": 300,  # Assetto Corsa GT3/LMP
                "rpms_max": 9000,  # Assetto Corsa típico
                "steering_max": 900,  # Volante de Assetto puede ser 900°
            },
            "generic": {
                "speed_max": 250,  # Genérico para otros juegos
                "rpms_max": 10000,
                "steering_max": 720,
            }
        }
        
        # Rangos del demo que funcionaron perfectamente
        self.demo_ranges = {
            "speed_max": 150,  # Demo usaba 60-130 km/h típicamente
            "rpms_max": 8000,  # Demo usaba 800-8000 RPMs
            "steering_max": 45,  # Demo usaba ±45 grados
        }
        
        # Detección automática de juego
        self.detected_game = "generic"
        self.detection_samples = 0
        self.max_values_seen = {
            "speed": 0,
            "rpms": 0,
            "steering": 0
        }
        
    def detect_game_type(self, raw_data: dict):
        """
        Detecta automáticamente el tipo de juego basado en los valores máximos vistos
        """
        speed = abs(raw_data.get("SpeedKmh", 0))
        rpms = abs(raw_data.get("Rpms", 0))
        steering = abs(raw_data.get("SteeringAngle", 0))
        
        # Actualizar máximos vistos
        self.max_values_seen["speed"] = max(self.max_values_seen["speed"], speed)
        self.max_values_seen["rpms"] = max(self.max_values_seen["rpms"], rpms)
        self.max_values_seen["steering"] = max(self.max_values_seen["steering"], steering)
        
        self.detection_samples += 1
        
        # Detectar cada 50 muestras o si vemos valores muy altos
        if self.detection_samples % 50 == 0 or rpms > 12000 or speed > 300:
            # F1: RPMs muy altos (>12000) o velocidades extremas (>300)
            if self.max_values_seen["rpms"] > 12000 or self.max_values_seen["speed"] > 300:
                self.detected_game = "f1"
                logger.info(f"🏎️ Juego detectado: F1 (Speed max: {self.max_values_seen['speed']:.0f}, RPMs max: {self.max_values_seen['rpms']:.0f})")
            
            # Assetto Corsa: Steering muy alto (>600°) o RPMs moderados
            elif self.max_values_seen["steering"] > 600 or (8000 < self.max_values_seen["rpms"] < 11000):
                self.detected_game = "assetto_corsa"
                logger.info(f"🏁 Juego detectado: Assetto Corsa (Steering max: {self.max_values_seen['steering']:.0f}°)")
            
            # Genérico para otros
            else:
                self.detected_game = "generic"
                logger.info(f"🎮 Juego genérico detectado")
    
    def normalize_telemetry(self, raw_data: dict) -> dict:
        """
        Normaliza datos de CUALQUIER juego a rangos del demo
        Detecta automáticamente el juego y ajusta
        """
        
        # Detectar tipo de juego automáticamente
        self.detect_game_type(raw_data)
        
        # Obtener rangos del juego detectado
        game_ranges = self.game_ranges.get(self.detected_game, self.game_ranges["generic"])
        
        # Speed: Escalar al rango del demo
        speed_raw = raw_data.get("SpeedKmh", 0)
        # Escalar de 0-[max_juego] a 40-150 km/h
        if speed_raw > 0:
            speed_normalized = (speed_raw / game_ranges["speed_max"]) * 110 + 40
            speed_normalized = max(0, min(150, speed_normalized))
        else:
            speed_normalized = 0
        
        # RPMs: Escalar al rango del demo
        rpms_raw = raw_data.get("Rpms", 0)
        # Escalar de 0-[max_juego] a 800-8000
        if rpms_raw > 0:
            rpms_normalized = (rpms_raw / game_ranges["rpms_max"]) * 7200 + 800
            rpms_normalized = max(800, min(8000, rpms_normalized))
        else:
            rpms_normalized = 800
        
        # Steering: Escalar al rango del demo
        steering_raw = raw_data.get("SteeringAngle", 0)
        # Escalar de ±[max_juego] a ±45
        steering_normalized = (steering_raw / game_ranges["steering_max"]) * 45
        steering_normalized = max(-45, min(45, steering_normalized))
        
        # Throttle y Brake: ya deberían estar en 0-1 pero validar
        throttle_raw = raw_data.get("Throttle", 0)
        throttle = throttle_raw / 100.0 if throttle_raw > 1.0 else throttle_raw
        throttle = max(0, min(1, throttle))
        
        brake_raw = raw_data.get("Brake", 0)
        brake = brake_raw / 100.0 if brake_raw > 1.0 else brake_raw
        brake = max(0, min(1, brake))
        
        # BOOST ARTÍSTICO: Aumentar intensidad para que se vea como el demo
        # El demo tenía valores más dinámicos
        
        # Si hay acelerador, hacerlo más visible
        if throttle > 0.3:
            throttle = min(1.0, throttle * 1.2)  # 20% más intenso
            
        # Si hay freno, hacerlo más dramático
        if brake > 0.3:
            brake = min(1.0, brake * 1.3)  # 30% más intenso
            
        # Steering más expresivo
        if abs(steering_normalized) > 10:
            steering_normalized *= 1.15  # 15% más expresivo
            steering_normalized = max(-45, min(45, steering_normalized))
        
        # Gear: F1 2024 tiene 8 marchas, demo usaba 6
        gear_raw = raw_data.get("Gear", 1)
        gear = min(6, max(1, gear_raw))
        
        # Crear datos normalizados
        normalized_data = {
            "connected": raw_data.get("connected", True),
            "SpeedKmh": speed_normalized,
            "Rpms": rpms_normalized,
            "Gear": gear,
            "SteeringAngle": steering_normalized,
            "Throttle": throttle,
            "Brake": brake,
            # Mantener datos originales para referencia
            "_original_speed": speed_raw,
            "_original_rpms": rpms_raw,
            "_original_steering": steering_raw,
        }
        
        # Log ocasional para debugging (cada 100 frames aprox)
        import random
        if random.random() < 0.01:
            logger.info(f"🎨 NORMALIZACIÓN {self.detected_game.upper()}→Demo: "
                       f"Speed {speed_raw:.0f}→{speed_normalized:.0f}, "
                       f"RPMs {rpms_raw:.0f}→{rpms_normalized:.0f}, "
                       f"Steering {steering_raw:.1f}→{steering_normalized:.1f}")
        
        return normalized_data
    
    def apply_demo_frequency_boost(self, normalized_data: dict) -> dict:
        """
        Aplica boost de frecuencia para que los eventos sean más visibles
        como en el demo
        """
        
        # En el demo había más variación y eventos
        # Agregar variación artificial si los datos son muy estables
        
        import random
        
        # Si el volante está muy quieto, agregar pequeña variación orgánica
        if abs(normalized_data.get("SteeringAngle", 0)) < 5:
            variation = random.uniform(-2, 2)
            normalized_data["SteeringAngle"] += variation
        
        # Si va muy constante en throttle, agregar micro-variaciones
        throttle = normalized_data.get("Throttle", 0)
        if 0.4 < throttle < 0.9:
            variation = random.uniform(-0.05, 0.05)
            normalized_data["Throttle"] = max(0, min(1, throttle + variation))
        
        return normalized_data


# Instancia global para uso en el conector
universal_normalizer = UniversalGameNormalizer()


def normalize_f1_data(raw_data: dict, apply_boost: bool = True) -> dict:
    """
    Función de conveniencia para normalizar datos de CUALQUIER juego
    
    Args:
        raw_data: Datos crudos de SimHub (F1, Assetto Corsa, etc.)
        apply_boost: Si aplicar boost de frecuencia artística
    
    Returns:
        Datos normalizados para que se vean como el demo
    """
    normalized = universal_normalizer.normalize_telemetry(raw_data)
    
    if apply_boost:
        normalized = universal_normalizer.apply_demo_frequency_boost(normalized)
    
    return normalized

