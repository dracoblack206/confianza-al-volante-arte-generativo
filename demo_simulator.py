#!/usr/bin/env python3
"""
DEMO SIMULATOR - Confianza al Volante
Simula datos de 5 conductores para probar el sistema SIN SimHub
"""

import asyncio
import json
import math
import random
import time
from typing import Dict, List

class DemoDriver:
    """Simula un conductor con patrones de conducción realistas"""
    
    def __init__(self, driver_id: str, style: str = "normal"):
        self.driver_id = driver_id
        self.style = style
        self.time_offset = random.uniform(0, 10)  # Para variación
        
        # Patrones de conducción F1 Monaco más realistas
        self.patterns = {
            "calm": {
                "steering_intensity": 0.4,
                "speed_variation": 0.3,
                "brake_frequency": 0.8,  # Más frenadas para Monaco
                "aggression": 0.3,
                "precision": 0.8
            },
            "aggressive": {
                "steering_intensity": 0.9,
                "speed_variation": 0.7,
                "brake_frequency": 0.6,  # Menos frenadas, más arriesgada
                "aggression": 0.9,
                "precision": 0.6
            },
            "normal": {
                "steering_intensity": 0.6,
                "speed_variation": 0.5,
                "brake_frequency": 0.7,
                "aggression": 0.5,
                "precision": 0.7
            },
            "nervous": {
                "steering_intensity": 1.0,
                "speed_variation": 0.9,
                "brake_frequency": 1.2,  # Mucho freno
                "aggression": 0.4,
                "precision": 0.4
            },
            "expert": {
                "steering_intensity": 0.3,
                "speed_variation": 0.2,
                "brake_frequency": 0.9,  # Frena bien pero eficientemente
                "aggression": 0.7,
                "precision": 0.95
            }
        }
        
        self.pattern = self.patterns.get(style, self.patterns["normal"])
        
    def generate_telemetry(self, elapsed_time: float) -> Dict:
        """Genera datos de telemetría realistas"""
        
        # Tiempo ajustado para este conductor
        t = elapsed_time + self.time_offset
        
        # Velocidad base con variaciones
        base_speed = 60 + 40 * math.sin(t * 0.1) + 30 * math.sin(t * 0.05)
        speed_noise = random.uniform(-1, 1) * self.pattern["speed_variation"] * 20
        speed = max(0, base_speed + speed_noise)
        
        # RPMs basadas en velocidad y marcha
        gear = min(6, max(1, int(speed / 25) + 1))
        base_rpms = (speed / gear) * 100 + 1000
        rpms_noise = random.uniform(-1, 1) * 500
        rpms = max(800, min(8000, base_rpms + rpms_noise))
        
        # Acelerador base (inverso del freno generalmente)
        throttle_base = 0.7 + 0.3 * math.sin(t * 0.2)
        throttle_noise = random.uniform(-0.1, 0.1)
        throttle = max(0, min(1, throttle_base + throttle_noise))
        
        # Ángulo del volante con patrones según estilo
        steering_base = 30 * math.sin(t * 0.3) * self.pattern["steering_intensity"]
        steering_noise = random.uniform(-1, 1) * self.pattern["steering_intensity"] * 15
        steering_angle = steering_base + steering_noise
        
        # === EVENTOS EXTREMOS OCASIONALES (5% probabilidad) ===
        if random.random() < 0.05:
            event_type = random.choice(['spin', 'correction', 'emergency'])
            
            if event_type == 'spin' and speed > 60:
                # Simular trompo/spin
                steering_angle = random.choice([-150, 150]) + random.uniform(-30, 30)
                
            elif event_type == 'correction' and speed > 40:
                # Simular contravolante violento
                steering_angle = steering_angle * -2.5  # Cambio dramático de dirección
                
            elif event_type == 'emergency':
                # Forzar frenada de emergencia
                brake = 0.95
                throttle = 0.0
        
        # Freno (más realista para F1 Monaco - curvas frecuentes)
        brake = 0
        # Simular frenadas antes de curvas (basado en steering y velocidad)
        approaching_corner = abs(steering_angle) > 20 and speed > 80
        if approaching_corner or random.random() < self.pattern["brake_frequency"] * 0.3:
            brake = random.uniform(0.3, 0.9)  # Frenadas más fuertes
            throttle *= 0.1  # Reducir acelerador cuando se frena
        
        # No acelerar y frenar simultáneamente (realismo)
        if brake > 0.1:
            throttle = min(throttle, 0.2)
        
        return {
            "sim_id": self.driver_id,
            "connected": True,
            "SpeedKmh": round(speed, 1),
            "Rpms": round(rpms, 1),
            "Gear": gear,
            "SteeringAngle": round(steering_angle, 1),
            "Throttle": round(throttle, 2),
            "Brake": round(brake, 2),
            "timestamp": time.time()
        }

class DemoSimulator:
    """Simulador completo de 5 conductores"""
    
    def __init__(self):
        # Crear 5 conductores con estilos diferentes
        self.drivers = {
            "sim_1": DemoDriver("sim_1", "expert"),     # Conductor experto
            "sim_2": DemoDriver("sim_2", "calm"),       # Conductor calmado
            "sim_3": DemoDriver("sim_3", "normal"),     # Conductor normal
            "sim_4": DemoDriver("sim_4", "aggressive"), # Conductor agresivo
            "sim_5": DemoDriver("sim_5", "nervous")     # Conductor nervioso
        }
        
        self.start_time = time.time()
        
    def generate_all_data(self) -> Dict[str, Dict]:
        """Genera datos de todos los conductores"""
        elapsed = time.time() - self.start_time
        
        data = {}
        for sim_id, driver in self.drivers.items():
            # Simular desconexiones ocasionales (5% probabilidad)
            if random.random() < 0.05:
                data[sim_id] = {
                    "sim_id": sim_id,
                    "connected": False,
                    "SpeedKmh": 0,
                    "Rpms": 0,
                    "Gear": 0,
                    "SteeringAngle": 0,
                    "Throttle": 0,
                    "Brake": 0,
                    "timestamp": time.time()
                }
            else:
                data[sim_id] = driver.generate_telemetry(elapsed)
        
        return data

# Para testing directo
if __name__ == "__main__":
    print("🎮 Demo Simulator - Confianza al Volante")
    print("=" * 50)
    
    demo = DemoSimulator()
    
    print("Generando datos de ejemplo...")
    print("(Ctrl+C para parar)")
    print()
    
    try:
        while True:
            data = demo.generate_all_data()
            
            print(f"Tiempo: {time.time() - demo.start_time:.1f}s")
            for sim_id, sim_data in data.items():
                status = "🟢" if sim_data["connected"] else "🔴"
                print(f"{status} {sim_id}: {sim_data['SpeedKmh']}km/h, "
                      f"RPM:{sim_data['Rpms']}, Volante:{sim_data['SteeringAngle']:.1f}°")
            
            print("-" * 50)
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n👋 Demo terminado")
