"""
Procesador de Datos para Confianza al Volante
Convierte datos de telemetría en métricas significativas de calma y control.
Este es el corazón emocional del proyecto: transformar datos técnicos en 
pruebas tangibles de fortaleza interior.
"""

import math
import statistics
from collections import deque
from typing import Dict, List, Optional, Tuple
import logging
import colorsys

logger = logging.getLogger(__name__)

class DriverPerformanceProcessor:
    """
    Procesador que mantiene historial y calcula métricas de rendimiento 
    emocional para cada conductor.
    """
    
    def __init__(self, history_size: int = 50):
        """
        Args:
            history_size: Número de registros a mantener en el historial
        """
        self.history_size = history_size
        # Historial por simulador {sim_id: deque of data}
        self.data_history: Dict[str, deque] = {}
        # Métricas actuales por simulador
        self.current_metrics: Dict[str, Dict] = {}
        
    def update_data(self, sim_id: str, raw_data: Dict) -> None:
        """
        Añade nuevos datos de telemetría al historial del simulador
        
        Args:
            sim_id: Identificador del simulador
            raw_data: Datos de telemetría recién obtenidos
        """
        # Inicializar historial si es la primera vez
        if sim_id not in self.data_history:
            self.data_history[sim_id] = deque(maxlen=self.history_size)
            self.current_metrics[sim_id] = self._get_default_metrics()
            
        # Añadir datos al historial
        self.data_history[sim_id].append(raw_data)
        
        # Calcular nuevas métricas si tenemos suficientes datos
        if len(self.data_history[sim_id]) >= 10:  # Mínimo para cálculos
            self._calculate_all_metrics(sim_id)
            
    def _get_default_metrics(self) -> Dict:
        """Métricas por defecto para inicialización"""
        return {
            "calm_index": 50.0,
            "control_index": 50.0,
            "art_parameters": {
                "position": 0.5,
                "color": [180, 50, 50],  # HSL: Azul medio
                "thickness": 2.0,
                "opacity": 0.5
            }
        }
    
    def _calculate_all_metrics(self, sim_id: str) -> None:
        """Calcula todas las métricas para un simulador"""
        try:
            calm = self.calculate_calm_index(sim_id)
            control = self.calculate_control_index(sim_id)
            art = self.get_art_parameters(sim_id)
            
            self.current_metrics[sim_id] = {
                "calm_index": calm,
                "control_index": control,
                "art_parameters": art
            }
            
        except Exception as e:
            logger.error(f"Error calculando métricas para {sim_id}: {e}")
    
    def calculate_calm_index(self, sim_id: str) -> float:
        """
        Calcula el Índice de Calma basado en la suavidad del volante.
        
        Un volante que se mueve suavemente indica calma y control emocional.
        Este es un reflejo directo de la serenidad interior de la conductora.
        
        Args:
            sim_id: Identificador del simulador
            
        Returns:
            Índice de calma (0-100), donde 100 es máxima calma
        """
        if sim_id not in self.data_history or len(self.data_history[sim_id]) < 10:
            return 50.0  # Valor neutral por defecto
            
        try:
            # Obtener últimos ángulos del volante
            steering_angles = [
                data.get("SteeringAngle", 0.0) 
                for data in list(self.data_history[sim_id])[-self.history_size:]
            ]
            
            if len(steering_angles) < 2:
                return 50.0
                
            # Calcular derivada (cambios entre puntos consecutivos)
            derivatives = []
            for i in range(1, len(steering_angles)):
                derivative = abs(steering_angles[i] - steering_angles[i-1])
                derivatives.append(derivative)
                
            # Calcular desviación estándar de la derivada
            if len(derivatives) < 2:
                return 50.0
                
            std_dev = statistics.stdev(derivatives)
            
            # Normalizar a escala 0-100
            # Valores típicos de std_dev para volante: 0-20 grados
            # std_dev bajo = alta calma
            max_std_expected = 15.0  # Ajustable según experiencia
            calm_index = max(0, 100 - (std_dev / max_std_expected * 100))
            
            return min(100.0, max(0.0, calm_index))
            
        except Exception as e:
            logger.error(f"Error en calculate_calm_index para {sim_id}: {e}")
            return 50.0
    
    def calculate_control_index(self, sim_id: str) -> float:
        """
        Calcula el Índice de Control basado en la precisión de aceleración y frenado.
        
        Controles precisos y decididos indican dominio y confianza.
        Esto refleja la capacidad de tomar decisiones firmes bajo presión.
        
        Args:
            sim_id: Identificador del simulador
            
        Returns:
            Índice de control (0-100), donde 100 es máximo control
        """
        if sim_id not in self.data_history or len(self.data_history[sim_id]) < 10:
            return 50.0
            
        try:
            recent_data = list(self.data_history[sim_id])[-self.history_size:]
            
            throttle_values = [data.get("Throttle", 0.0) for data in recent_data]
            brake_values = [data.get("Brake", 0.0) for data in recent_data]
            
            # Detectar inputs erráticos
            jerky_inputs = 0
            total_inputs = len(recent_data)
            
            for i, data in enumerate(recent_data):
                throttle = data.get("Throttle", 0.0)
                brake = data.get("Brake", 0.0)
                
                # Penalizar uso simultáneo de acelerador y freno
                if throttle > 0.1 and brake > 0.1:
                    jerky_inputs += 1
                    
                # Penalizar cambios bruscos
                if i > 0:
                    prev_data = recent_data[i-1]
                    throttle_change = abs(throttle - prev_data.get("Throttle", 0.0))
                    brake_change = abs(brake - prev_data.get("Brake", 0.0))
                    
                    # Si hay cambios muy bruscos (> 0.3 en una lectura)
                    if throttle_change > 0.3 or brake_change > 0.3:
                        jerky_inputs += 1
            
            # Calcular porcentaje de inputs erráticos
            jerky_percentage = jerky_inputs / total_inputs if total_inputs > 0 else 0
            
            # Convertir a índice de control (menos errático = más control)
            control_index = max(0, 100 - (jerky_percentage * 100))
            
            return min(100.0, max(0.0, control_index))
            
        except Exception as e:
            logger.error(f"Error en calculate_control_index para {sim_id}: {e}")
            return 50.0
    
    def get_art_parameters(self, sim_id: str) -> Dict:
        """
        Genera parámetros para la visualización artística.
        
        Cada conductor contribuye a la obra de arte colectiva con su 
        estilo único de conducción traducido a elementos visuales.
        
        Args:
            sim_id: Identificador del simulador
            
        Returns:
            Diccionario con parámetros artísticos
        """
        if sim_id not in self.data_history or not self.data_history[sim_id]:
            return self._get_default_metrics()["art_parameters"]
            
        try:
            latest_data = list(self.data_history[sim_id])[-1]
            
            # POSICIÓN: Basada en ángulo del volante (-1 a 1 normalizado a 0-1)
            steering_angle = latest_data.get("SteeringAngle", 0.0)
            # Asumir rango típico de -45 a +45 grados
            position = (steering_angle + 45) / 90
            position = max(0.0, min(1.0, position))
            
            # COLOR: Basado en velocidad (HSL)
            speed = latest_data.get("SpeedKmh", 0.0)
            # Mapear velocidad a matiz (hue): 0 km/h = azul (240°), 200 km/h = rojo (0°)
            max_speed = 200.0
            hue = 240 - (min(speed, max_speed) / max_speed * 240)
            
            # Saturación basada en el índice de calma (más calma = más saturado)
            calm = self.current_metrics.get(sim_id, {}).get("calm_index", 50)
            saturation = 30 + (calm * 0.7)  # 30-100% saturación
            
            # Luminosidad fija para buen contraste
            lightness = 50
            
            color = [hue, saturation, lightness]
            
            # GROSOR: Basado en RPMs
            rpms = latest_data.get("Rpms", 0.0)
            max_rpms = 8000.0
            thickness = 1.0 + (min(rpms, max_rpms) / max_rpms * 8.0)  # 1-9 píxeles
            
            # OPACIDAD: Basada en acelerador
            throttle = latest_data.get("Throttle", 0.0)
            opacity = 0.2 + (throttle * 0.8)  # 0.2-1.0 opacidad
            
            return {
                "position": position,
                "color": color,
                "thickness": thickness,
                "opacity": opacity
            }
            
        except Exception as e:
            logger.error(f"Error en get_art_parameters para {sim_id}: {e}")
            return self._get_default_metrics()["art_parameters"]
    
    def get_metrics(self, sim_id: str) -> Optional[Dict]:
        """
        Obtiene las métricas actuales de un simulador
        
        Args:
            sim_id: Identificador del simulador
            
        Returns:
            Diccionario con las métricas o None si no existe
        """
        return self.current_metrics.get(sim_id)
    
    def get_all_metrics(self) -> Dict[str, Dict]:
        """
        Obtiene las métricas de todos los simuladores
        
        Returns:
            Diccionario con todas las métricas por simulador
        """
        return self.current_metrics.copy()
    
    def get_summary_stats(self) -> Dict:
        """
        Genera estadísticas resumidas del grupo
        
        Returns:
            Estadísticas colectivas para la obra de arte grupal
        """
        try:
            all_calm = []
            all_control = []
            connected_count = 0
            
            for sim_id, metrics in self.current_metrics.items():
                if sim_id in self.data_history and self.data_history[sim_id]:
                    latest_data = list(self.data_history[sim_id])[-1]
                    if latest_data.get("connected", False):
                        connected_count += 1
                        all_calm.append(metrics.get("calm_index", 50))
                        all_control.append(metrics.get("control_index", 50))
            
            return {
                "connected_drivers": connected_count,
                "total_drivers": 5,
                "group_calm_avg": statistics.mean(all_calm) if all_calm else 50,
                "group_control_avg": statistics.mean(all_control) if all_control else 50,
                "group_calm_harmony": 100 - statistics.stdev(all_calm) if len(all_calm) > 1 else 50,
                "collective_strength": statistics.mean([
                    statistics.mean(all_calm) if all_calm else 50,
                    statistics.mean(all_control) if all_control else 50
                ])
            }
            
        except Exception as e:
            logger.error(f"Error en get_summary_stats: {e}")
            return {
                "connected_drivers": 0,
                "total_drivers": 5,
                "group_calm_avg": 50,
                "group_control_avg": 50,
                "group_calm_harmony": 50,
                "collective_strength": 50
            }


def test_processor():
    """Función de prueba para el procesador"""
    print("🧠 Probando Data Processor...")
    
    processor = DriverPerformanceProcessor()
    
    # Simular datos de prueba
    test_data = {
        "sim_id": "test_sim",
        "connected": True,
        "SpeedKmh": 85.5,
        "Rpms": 4500.0,
        "Gear": 3,
        "SteeringAngle": 12.5,
        "Throttle": 0.6,
        "Brake": 0.0,
        "timestamp": 1234567890
    }
    
    # Añadir varios puntos de datos
    for i in range(20):
        test_data["SteeringAngle"] = 10 + math.sin(i * 0.3) * 5  # Volante suave
        test_data["Throttle"] = 0.5 + math.sin(i * 0.2) * 0.2   # Acelerador estable
        processor.update_data("test_sim", test_data.copy())
    
    # Obtener métricas
    metrics = processor.get_metrics("test_sim")
    if metrics:
        print(f"📊 Métricas calculadas:")
        print(f"  💙 Índice de Calma: {metrics['calm_index']:.1f}/100")
        print(f"  🎯 Índice de Control: {metrics['control_index']:.1f}/100")
        
        art = metrics['art_parameters']
        print(f"  🎨 Parámetros Artísticos:")
        print(f"    Posición: {art['position']:.2f}")
        print(f"    Color HSL: {art['color']}")
        print(f"    Grosor: {art['thickness']:.1f}")
        print(f"    Opacidad: {art['opacity']:.2f}")


if __name__ == "__main__":
    test_processor()