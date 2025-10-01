# PRUEBA CON ASSETTO CORSA - INSTRUCCIONES

## ESTADO ACTUAL DEL SISTEMA

✅ **Sistema actualizado** para usar endpoint real de SimHub
✅ **Endpoint configurado:** `http://192.168.1.4:8888/api/getgamedata`  
✅ **Archivos de prueba eliminados**
✅ **Código listo** para recibir datos reales

---

## PREPARACIÓN

### EN EL PC CON SIMHUB (192.168.1.4):

1. **Asegúrate de que SimHub esté ejecutándose**
   - El puerto 8888 ya está activo (verificado)

2. **Inicia Assetto Corsa**
   - Cualquier modo (Carrera rápida, Práctica libre, etc.)
   - SimHub debería detectarlo automáticamente

3. **Verifica en SimHub:**
   - Debería aparecer "AssettoCorsa" o "Assetto Corsa" como juego detectado
   - Los datos deberían empezar a moverse cuando conduzcas

### EN ESTE PC (SERVIDOR):

El sistema ya está configurado correctamente.

---

## EJECUTAR EL SISTEMA

### OPCIÓN 1: Inicio Automático (Recomendado)

```bash
start.bat
```

- El script te pedirá confirmación de las URLs
- Presiona Enter para sim_1 (ya está configurado como 192.168.1.4:8888/api/getgamedata)
- Presiona Enter para sim_2-5 (usarán valores por defecto, no conectarán pero no es problema)

### OPCIÓN 2: Inicio Manual

```bash
cd backend
C:\Users\User\AppData\Local\Programs\Python\Python311\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ACCEDER AL SISTEMA

Una vez iniciado el servidor:

### **Dashboard de Métricas:**
```
http://localhost:8000
```

Aquí verás:
- Estado de conexión de sim_1 (debería aparecer ✅ verde)
- Medidores de Calma y Control (actualizándose en tiempo real)
- Datos de telemetría: Velocidad, RPMs

### **Obra de Arte en Tiempo Real:**
```
http://localhost:8000/artwork
```

Aquí verás:
- Arte generativo basado 100% en tus acciones reales de conducción
- Al acelerar: líneas orgánicas
- Al frenar: explosiones circulares
- Al girar el volante: dirección del trazo
- Velocidad y RPMs: grosor y longitud

---

## QUÉ ESPERAR

### **SIN JUEGO ACTIVO:**
```json
{
  "SpeedKmh": 0,
  "Rpms": 0,
  "Gear": 0,
  "SteeringAngle": 0,  // Cambiará si mueves el volante
  "Throttle": 0,       // Cambiará si presionas acelerador
  "Brake": 0           // Cambiará si presionas freno
}
```

### **CON ASSETTO CORSA ACTIVO:**
```json
{
  "SpeedKmh": 85.3,    // Velocidad real del auto
  "Rpms": 4500,        // RPMs del motor
  "Gear": 3,           // Marcha actual
  "SteeringAngle": 12.5,  // Ángulo del volante
  "Throttle": 0.65,    // Acelerador (0-1)
  "Brake": 0.0         // Freno (0-1)
}
```

---

## PRUEBAS SUGERIDAS

### 1. **Verificar Conexión:**
   - Abre el dashboard
   - Verifica que sim_1 tenga el punto verde (conectado)
   - Los números deben aparecer (aunque sean 0)

### 2. **Probar con Juego en Menú:**
   - Con Assetto Corsa abierto pero en menú
   - Los datos deberían seguir en 0
   - Esto es normal

### 3. **Probar en Sesión de Conducción:**
   - Inicia una sesión en Assetto Corsa
   - En cuanto el auto esté en pista:
     - Dashboard debería mostrar velocidad y RPMs
     - Obra de arte debería empezar a pintarse
     - Medidores de Calma y Control deberían calcular valores

### 4. **Conducir Activamente:**
   - Acelera: verás líneas en el arte
   - Frena: verás explosiones circulares
   - Gira el volante: verás dirección del trazo
   - Conduce suavemente: índice de Calma subirá
   - Usa pedales con precisión: índice de Control subirá

---

## TROUBLESHOOTING

### ❌ "sim_1 desconectado (punto rojo)"

**Solución:**
1. Verifica que SimHub esté ejecutándose en 192.168.1.4
2. Verifica ping: `ping 192.168.1.4`
3. Revisa la consola del servidor (terminal) para ver errores específicos

### ❌ "Conectado pero todos los datos en 0"

**Posibles causas:**
1. **Assetto Corsa no está en sesión activa** → Entra a una carrera
2. **SimHub no detecta el juego** → Reinicia SimHub
3. **El juego está pausado** → Reanuda el juego

### ❌ "Los datos cambian muy lento"

**Esto es normal:**
- El sistema actualiza cada 100ms (10 veces por segundo)
- Los medidores de Calma y Control necesitan ~10 segundos de datos para estabilizarse

### ❌ "El arte no se pinta"

**Verifica:**
1. Que estés en la página `/artwork`
2. Que sim_1 esté conectado (punto verde)
3. Que estés ACELERANDO o FRENANDO activamente
4. Revisa la consola del navegador (F12) para errores

---

## EXPORTAR EL ARTE

1. Abre `http://localhost:8000/artwork`
2. Conduce por 2-3 minutos
3. Click en el botón **"💾 Exportar PNG"**
4. Se descargará una imagen 2K (2560x1440)

---

## PRÓXIMOS PASOS

Una vez que funcione con 1 simulador (sim_1):

1. **Agregar más simuladores:**
   - Configura SimHub en otros PCs
   - Anota sus IPs
   - Modifica las URLs en `start.py` o variables de entorno

2. **Probar con F1 2024:**
   - El proceso es idéntico
   - SimHub detectará automáticamente F1 2024
   - Los datos fluirán de la misma manera

3. **Configuración para evento:**
   - Una vez que funcione, documenta las IPs de todos los PCs
   - Haz un commit de la configuración final
   - Prepara un checklist pre-evento

---

## LOGS Y DEPURACIÓN

### Ver logs del servidor:
- Los logs aparecen en la terminal donde ejecutaste `start.bat`
- Busca mensajes como:
  ```
  INFO - Datos obtenidos de sim_1: SpeedKmh=85.3, GameRunning=True
  ```

### Ver logs del frontend:
- Presiona F12 en el navegador
- Ve a la pestaña "Console"
- Busca mensajes de WebSocket y datos recibidos

---

## ¿TODO LISTO?

✅ SimHub ejecutándose en 192.168.1.4  
✅ Assetto Corsa instalado  
✅ Este servidor listo para iniciar  

**Ejecuta:** `start.bat` y comienza la prueba! 🏎️🎨

