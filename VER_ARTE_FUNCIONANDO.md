# 🎨 CÓMO VER EL ARTE FUNCIONANDO

## ✅ CAMBIOS REALIZADOS (commit a6855a3)

1. ✅ **Intervalo de actualización:** 100ms → 300ms (3 actualizaciones/segundo)
   - Más datos disponibles para pintura continua
   
2. ✅ **Logs de debug habilitados:**
   - Verás exactamente cuándo se pinta
   - Posición, colores, estados

3. ✅ **Sistema optimizado para 1 simulador**
   - sim_1 puede pintar solo
   - No necesitas los 5 simuladores para ver arte

---

## 🚀 PASOS PARA VER EL ARTE

### 1. INICIAR EL SISTEMA

**Terminal 1 - Backend:**
```bash
cd backend
C:\Users\User\AppData\Local\Programs\Python\Python311\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**O simplemente:**
```bash
start.bat
```

### 2. ABRIR CONSOLA DEL NAVEGADOR

**Antes de abrir la página de arte:**

1. Presiona **F12** en el navegador
2. Ve a la pestaña **"Console"**
3. **IMPORTANTE:** Deja esta consola visible

### 3. ABRIR LA OBRA DE ARTE

```
http://localhost:8000/artwork
```

---

## 📊 QUÉ VERÁS EN LA CONSOLA

### **Cuando el sistema se conecta:**
```
🎨 Iniciando Motor de Arte Colectivo...
✅ Sistema de arte inicializado
🔌 Conectando a WebSocket...
✅ WebSocket conectado
```

### **Cuando llegas datos (cada 300ms):**
```
🎨 updateArtwork llamado: ["sim_1", "sim_2", "sim_3", "sim_4", "sim_5"]
📊 ESPERADAS: sim_1, sim_2, sim_3, sim_4, sim_5
📊 RECIBIDAS: sim_1, sim_2, sim_3, sim_4, sim_5
```

### **Cuando sim_1 está conectado pero sin conducir:**
```
🔍 sim_1: connected=true, speed=0.0, throttle=0.00, brake=0.00
```

### **Cuando empiezas a conducir (ESTO ES LO IMPORTANTE):**
```
🔍 sim_1: connected=true, speed=86.9, throttle=0.33, brake=0.13
✏️ sim_1 PINTANDO - Throttle: 0.33, Brake: 0.13, Speed: 86.9
📍 sim_1 posición: (1280, 720), hue: 200°
🛣️ sim_1 ruta: 15 puntos, estado: accelerating
```

---

## 🎨 QUÉ VERÁS EN EL CANVAS

### **Con datos válidos (conduciendo activamente):**

**Al ACELERAR (Throttle > 0.3):**
- ✅ **Líneas pintándose** desde el centro hacia afuera
- ✅ **Color:** Azul (sim_1)
- ✅ **Grosor:** Aumenta con velocidad
- ✅ **Dirección:** Hacia donde "mira" el auto

**Al FRENAR (Brake > 0.3):**
- ✅ **Círculos/explosiones** donde frenas
- ✅ **Tamaño:** Según intensidad de frenado
- ✅ **Partículas** alrededor del círculo principal

**Conduciendo suavemente (Calma alta):**
- ✅ **Líneas curvas** y orgánicas
- ✅ **Movimiento fluido**

**Conduciendo nerviosamente (Calma baja):**
- ✅ **Líneas temblorosas**
- ✅ **Movimiento errático**

---

## ⚠️ SI NO VES PINTURA

### **Revisar en consola:**

1. **¿Ves "updateArtwork llamado"?**
   - ❌ NO → Problema de WebSocket
   - ✅ SÍ → Sigue al siguiente paso

2. **¿Ves "sim_1: connected=true"?**
   - ❌ NO → SimHub no está conectado
   - ✅ SÍ → Sigue al siguiente paso

3. **¿Ves "speed > 0"?**
   - ❌ NO → **ENTRA EN SESIÓN DE CONDUCCIÓN** en Assetto Corsa
   - ✅ SÍ → Sigue al siguiente paso

4. **¿Ves "PINTANDO"?**
   - ❌ NO → Espera 200ms (timing humano)
   - ✅ SÍ → Deberías ver arte pintándose

### **Revisar en canvas:**

1. **Canvas completamente negro:**
   - Puede ser que el arte esté en otra parte del canvas
   - sim_1 inicia en el centro (50%, 50%)
   - Haz scroll o zoom out

2. **Canvas con fade muy rápido:**
   - El arte se está pintando pero se borra rápido
   - fadeRate está en 0.00001 (muy lento)
   - Debería persistir mucho tiempo

3. **No se ve nada pero hay logs de "PINTANDO":**
   - Revisa los valores de x, y en los logs
   - Si están fuera del canvas (< 0 o > 2560), hay un bug

---

## 🐛 DEBUGGING PASO A PASO

### **Test 1 - Verificar datos llegan:**

En consola, busca:
```
🔍 sim_1: connected=true, speed=86.9, throttle=0.33
```

✅ **Si ves esto:** Los datos llegan correctamente

### **Test 2 - Verificar se intenta pintar:**

Busca:
```
✏️ sim_1 PINTANDO
```

✅ **Si ves esto:** El sistema está intentando pintar

### **Test 3 - Verificar posición válida:**

Busca:
```
📍 sim_1 posición: (1280, 720)
```

✅ **Si ves esto:** La posición es válida (centro del canvas 2560x1440)

### **Test 4 - Verificar ruta se construye:**

Busca:
```
🛣️ sim_1 ruta: 15 puntos
```

✅ **Si ves esto:** El sistema está guardando puntos para pintar líneas continuas

---

## 🎯 PRUEBA CONTROLADA

Para ver arte de manera garantizada:

1. **Inicia Assetto Corsa**
2. **Entra en sesión de conducción**
3. **Acelera y mantén el acelerador** (Throttle > 0.3)
4. **Observa la consola:**
   ```
   ✏️ sim_1 PINTANDO - Throttle: 0.75, Brake: 0.00, Speed: 120.3
   📍 sim_1 posición: (1350, 680), hue: 180°
   ```
5. **Mira el canvas:** Deberías ver una línea azul pintándose

---

## 📸 LO QUE DEBERÍAS VER

### **Terminal del servidor:**
```
INFO - ✅ sim_1: Speed=86.9km/h, RPM=5659, Throttle=0.33, Brake=0.13
INFO - ✅ sim_1: Speed=94.2km/h, RPM=6234, Throttle=0.78, Brake=0.00
```

### **Consola del navegador (F12):**
```
✏️ sim_1 PINTANDO - Throttle: 0.33, Brake: 0.13, Speed: 86.9
📍 sim_1 posición: (1280, 720), hue: 200°
🛣️ sim_1 ruta: 15 puntos, estado: accelerating
```

### **Canvas:**
- Líneas azules moviéndose desde el centro
- Círculos cuando frenas
- Colores más cálidos cuando vas rápido

---

## 🚗 ACCIONES Y EFECTOS

| Acción en Assetto Corsa | Efecto en el Arte |
|--------------------------|-------------------|
| Acelerar (> 30%) | Líneas rectas pintándose |
| Frenar (> 30%) | Círculos/explosiones |
| Alta velocidad | Color más rojo/caliente |
| Baja velocidad | Color más azul/frío |
| Conducción suave | Líneas curvas orgánicas |
| Conducción brusca | Líneas temblorosas |
| RPMs altas | Líneas más gruesas |
| Giros suaves | Cambio gradual de dirección |

---

**¡Listo para probar! Ejecuta el sistema y abre la consola (F12) para ver los logs!** 🎨🏁

