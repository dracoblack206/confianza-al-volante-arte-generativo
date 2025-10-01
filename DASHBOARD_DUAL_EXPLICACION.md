# 📊 DASHBOARD DUAL - Datos Reales y Normalizados

## ✅ **IMPLEMENTACIÓN COMPLETA**

El dashboard ahora muestra **AMBOS** valores para cada piloto:
- ✅ **Datos REALES** del juego (F1, Assetto Corsa, etc.)
- ✅ **Datos NORMALIZADOS** usados para generar el arte
- ✅ **Índices de Calma y Control** por piloto
- ✅ **Throttle y Brake** en tiempo real

---

## 🎨 **VISUALIZACIÓN DUAL**

### **Para Cada Piloto (1-5):**

```
┌─────────────────────────────────────┐
│  👤 Piloto 1                        │
│                                     │
│  🎯 Calma: 85    🎮 Control: 72    │
│                                     │
│  Velocidad:                         │
│  [280 km/h] → [110 km/h]           │
│   ↑ REAL       ↑ NORMALIZADO       │
│                                     │
│  RPMs:                              │
│  [12,500] → [6,200]                │
│   ↑ REAL     ↑ NORMALIZADO         │
│                                     │
│  Throttle/Brake: 85% / 0%          │
└─────────────────────────────────────┘
```

### **Códigos de Color:**

- 🟡 **AMARILLO/DORADO**: Datos REALES del juego
- 🔵 **AZUL**: Datos NORMALIZADOS (usados en el arte)
- ➡️ **FLECHA**: Indica transformación real → normalizado

---

## 📈 **QUÉ MUESTRA CADA SECCIÓN**

### **1. Gauges (Calma y Control)**
```javascript
Calma: 85/100
- Basado en suavidad del volante
- 100 = máxima calma, movimientos fluidos
- 0 = erráticos, movimientos bruscos

Control: 72/100  
- Basado en precisión de throttle/brake
- 100 = máximo control, inputs decididos
- 0 = inputs erráticos, poco control
```

### **2. Velocidad Dual**
```
[REAL]         →    [NORMALIZADO]
280 km/h       →    110 km/h

🟡 280 km/h = Lo que el piloto está conduciendo en F1 2024
🔵 110 km/h = El valor que usa el arte para pintar
```

### **3. RPMs Duales**
```
[REAL]         →    [NORMALIZADO]
12,500         →    6,200

🟡 12,500 = RPMs reales del motor F1
🔵 6,200  = RPMs que definen el color en el arte
```

### **4. Throttle/Brake**
```
85% / 0%

85% = Acelerador al 85% (líneas largas en el arte)
0%  = Sin freno (sin círculos/manchas)
```

---

## 🎯 **POR QUÉ DATOS DUALES**

### **Transparencia Total:**
El público puede ver:
1. **Lo que realmente está pasando** en el simulador (datos reales)
2. **Cómo se transforma** para el arte (datos normalizados)
3. **Por qué el arte se ve así** (relación directa visible)

### **Ejemplo Real:**

**Piloto conduciendo F1 2024:**
- Velocidad real: `320 km/h` 🏎️
- Arte usa: `135 km/h` 🎨
- **El público entiende:** "Wow, va a 320 pero el sistema lo convierte a 135 para que el arte se vea perfecto"

**Piloto conduciendo Assetto Corsa:**
- Velocidad real: `180 km/h` 🏁
- Arte usa: `95 km/h` 🎨
- **El público entiende:** "Está a 180 pero el arte lo usa como 95, por eso se ve igual de fluido"

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **Backend (simhub_connector.py):**
```python
# Envía AMBOS datos:
processed_data = {
    # Datos normalizados (para arte y métricas)
    "SpeedKmh": 110,         # Normalizado
    "Rpms": 6200,            # Normalizado
    
    # Datos reales (para dashboard)
    "raw_game_data": {
        "SpeedKmh": 280,     # Real del juego
        "Rpms": 12500,       # Real del juego
    }
}
```

### **Frontend (script.js):**
```javascript
// Muestra ambos valores
speedReal.textContent = `${rawGameData.SpeedKmh} km/h`;  // 280
speedNorm.textContent = `${rawData.SpeedKmh} km/h`;      // 110
```

### **Frontend (index.html):**
```html
<div class="telemetry-dual-values">
    <span class="telemetry-value-real">280 km/h</span>
    <span class="telemetry-separator">→</span>
    <span class="telemetry-value-normalized">110 km/h</span>
</div>
```

---

## 🎨 **ESTILOS VISUALES**

### **Datos Reales (Amarillo):**
```css
.telemetry-value-real {
    color: #fbbf24;                      /* Amarillo */
    background: rgba(245, 158, 11, 0.1); /* Fondo suave */
    border-left: 3px solid #f59e0b;      /* Borde dorado */
}
```

### **Datos Normalizados (Azul):**
```css
.telemetry-value-normalized {
    color: #60a5fa;                      /* Azul claro */
    background: rgba(37, 99, 235, 0.15); /* Fondo suave */
    border-left: 3px solid #2563eb;      /* Borde azul */
}
```

### **Flecha de Transformación:**
```css
.telemetry-separator {
    color: #f59e0b;  /* Dorado */
    opacity: 0.6;
    font-weight: 700;
}
```

---

## 📋 **LEYENDA EN EL DASHBOARD**

En la parte superior del dashboard hay una leyenda visible:

```
┌─────────────────────────────────────────────┐
│  [REAL] Dato del juego  →  [NORMALIZADO]   │
│                        Dato usado en el arte│
└─────────────────────────────────────────────┘
```

**Propósito:**
- Educar al público instantáneamente
- Explicar sin palabras la transformación
- Mantener transparencia total

---

## 🚀 **BENEFICIOS**

### **Para el Público:**
✅ **Entienden** qué está pasando realmente  
✅ **Ven** cómo se transforma para el arte  
✅ **Conectan** la conducción con el arte generado  
✅ **Aprecian** la complejidad del sistema

### **Para la Psicóloga:**
✅ **Transparencia** total en las métricas  
✅ **Confianza** en el sistema  
✅ **Validación** de que funciona con cualquier juego  
✅ **Educación** del público sobre el proceso

### **Para el Proyecto:**
✅ **Profesionalismo** evidente  
✅ **Tecnología** visible pero comprensible  
✅ **Adaptabilidad** demostrada  
✅ **Impacto** emocional y técnico combinados

---

## 🎯 **RESULTADO FINAL**

**Dashboard Completo por Piloto:**
```
┌──────────────────────────────────┐
│ 👤 Piloto 3                      │
│                                  │
│ 🧘 Calma: 78    🎮 Control: 85  │
│                                  │
│ Velocidad:                       │
│ 🟡 240 km/h → 🔵 105 km/h       │
│                                  │
│ RPMs:                            │
│ 🟡 11,200 → 🔵 5,800            │
│                                  │
│ Throttle/Brake: 78% / 0%        │
└──────────────────────────────────┘
```

**Interpretación:**
- "El piloto conduce a 240 km/h reales"
- "El sistema lo convierte a 105 km/h para el arte"
- "Tiene 78% de calma (muy tranquilo)"
- "Tiene 85% de control (muy preciso)"
- "Por eso sus trazos son suaves y definidos"

---

## 💡 **MENSAJE FINAL**

**El dashboard ya NO es solo telemetría.**  
**Es una VENTANA EDUCATIVA que muestra:**
1. La realidad del simulador 🏎️
2. La magia de la transformación ✨
3. El resultado artístico 🎨

**Todo en tiempo real, todo transparente, todo comprensible.** 🚀
