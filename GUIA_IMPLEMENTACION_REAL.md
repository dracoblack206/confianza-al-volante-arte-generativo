# 🚀 GUÍA DE IMPLEMENTACIÓN REAL - CONFIANZA AL VOLANTE

## 🎯 OBJETIVO
Esta guía te llevará paso a paso desde el código hasta tener el sistema funcionando con SimHub en el entorno real de producción.

---

## 📋 FASE 1: PREPARACIÓN DEL ENTORNO

### 🖥️ Requisitos del Sistema
- **PC Principal (Servidor):** Windows 10+ con Python 3.10+
- **PCs Simuladores:** 5 PCs con SimHub instalado
- **Red:** Todos los PCs en la misma red local
- **Pantalla:** Monitor grande o proyector para el dashboard

### 🐍 1.1 Verificar/Instalar Python

**En el PC donde ejecutarás el servidor:**

```bash
# Verificar si Python está instalado
python --version
# o también probar:
py --version
```

**Si no tienes Python o tienes una versión antigua:**
1. Ir a https://www.python.org/downloads/
2. Descargar Python 3.11 o 3.12
3. **IMPORTANTE:** Durante la instalación, marcar "Add Python to PATH"

**Si ya tienes Python pero no está en PATH:**
```bash
# Buscar donde está instalado Python
where python
# o
where py

# Ejemplo de paths comunes:
# C:\Users\[Usuario]\AppData\Local\Programs\Python\Python311\python.exe
# C:\Python311\python.exe
```

### 🔧 1.2 Preparar el Proyecto

1. **Copiar el proyecto** al PC servidor
2. **Abrir terminal** en la carpeta del proyecto
3. **Verificar estructura:**
```
confianza_al_volante/
├── backend/
├── frontend/
├── start.bat
├── start.py
├── requirements.txt
└── README.md
```

---

## 📡 FASE 2: CONFIGURACIÓN DE SIMHUB

### 🎮 2.1 Instalar SimHub en Cada PC Simulador

**Para cada uno de los 5 PCs simuladores:**

1. **Descargar SimHub:**
   - Ir a: https://www.simhubdash.com/
   - Descargar la versión más reciente
   - Instalar en cada PC simulador

2. **Abrir SimHub** en cada PC

### 🌐 2.2 Configurar Web Server Plugin

**En cada PC simulador, hacer lo siguiente:**

1. **Abrir SimHub**
2. **Ir a Settings (Configuración)**
3. **Buscar "Plugins" en el menú lateral**
4. **Encontrar "Web Server Plugin"**
5. **Configurar así:**
   ```
   ✓ Enable Web Server Plugin
   Port: 8888 (dejar por defecto)
   ✓ Enable REST API
   ✓ Enable CORS
   Host: 0.0.0.0 (para permitir conexiones externas)
   ```
6. **Hacer click en "Apply" o "Save"**

### 📊 2.3 Configurar Datos Expuestos

**En cada SimHub, configurar qué datos exponer:**

1. **Dentro de Web Server Plugin**
2. **Buscar "Available Properties" o "Propiedades Disponibles"**
3. **Seleccionar estas métricas:**
   ```
   ✓ SpeedKmh (Velocidad)
   ✓ Rpms (Revoluciones)
   ✓ Gear (Marcha)
   ✓ SteeringAngle (Ángulo del volante)
   ✓ Throttle (Acelerador)
   ✓ Brake (Freno)
   ```
4. **Guardar configuración**

### 🔍 2.4 Obtener las IPs de los PCs Simuladores

**En cada PC simulador:**

```bash
# Abrir Command Prompt (cmd)
ipconfig

# Buscar la IP local, algo como:
# Ethernet adapter:
#   IPv4 Address: 192.168.1.XXX
```

**Anotar las IPs:**
```
PC Simulador 1: 192.168.1.100
PC Simulador 2: 192.168.1.101
PC Simulador 3: 192.168.1.102
PC Simulador 4: 192.168.1.103
PC Simulador 5: 192.168.1.104
```

---

## 🧪 FASE 3: PRUEBAS DE CONEXIÓN

### 🔗 3.1 Probar URLs de SimHub

**Desde el PC servidor (donde ejecutarás el proyecto):**

1. **Abrir navegador web**
2. **Probar cada URL:**
   ```
   http://192.168.1.100:8888/api/v1/data
   http://192.168.1.101:8888/api/v1/data
   http://192.168.1.102:8888/api/v1/data
   http://192.168.1.103:8888/api/v1/data
   http://192.168.1.104:8888/api/v1/data
   ```

3. **Deberías ver algo como:**
   ```json
   {
     "SpeedKmh": 0,
     "Rpms": 0,
     "Gear": 0,
     "SteeringAngle": 0,
     "Throttle": 0,
     "Brake": 0
   }
   ```

### 🚨 Si NO Funciona:

**Problema común: "Esta página no se puede mostrar"**

1. **Verificar firewall en PCs simuladores:**
   ```
   Panel de Control > Sistema y Seguridad > Firewall de Windows
   > Configuración avanzada > Reglas de entrada
   > Nueva regla... > Puerto > TCP > 8888 > Permitir
   ```

2. **Verificar que SimHub esté ejecutándose** en el PC simulador

3. **Verificar la IP correcta:**
   ```bash
   # En el PC simulador:
   ping 192.168.1.XXX  # Usar la IP que anotaste
   ```

---

## 🚀 FASE 4: EJECUTAR EL SISTEMA

### 🎬 4.1 Primera Ejecución

**En el PC servidor:**

1. **Ejecutar el iniciador:**
   ```bash
   # Opción 1: Doble-click en start.bat
   # Opción 2: Desde terminal
   python start.py
   ```

2. **El script te pedirá las URLs de SimHub:**
   ```
   📡 Configuración de SimHub:
   sim_1 [http://192.168.1.100:8888/api/v1/data]: 
   # Presionar Enter o escribir la IP correcta
   ```

3. **Configurar todas las IPs correctas**

4. **El sistema iniciará automáticamente**

### 🌐 4.2 Verificar que Funciona

1. **El navegador se abrirá automáticamente** en `http://localhost:8000`
2. **Verificar estado de conexión:**
   - ✅ Verde: Conectado correctamente
   - ❌ Rojo: Problema de conexión

3. **Verificar simuladores:**
   - Cada tarjeta debe mostrar estado de conexión
   - Datos de telemetría deben aparecer (aunque sean 0)

---

## 🎮 FASE 5: PRUEBA CON SIMULADOR REAL

### 🏁 5.1 Configurar un Juego de Carreras

**En AL MENOS uno de los PCs simuladores:**

1. **Instalar un juego compatible con SimHub:**
   - Forza Horizon/Motorsport
   - Assetto Corsa
   - F1 series
   - Gran Turismo (PlayStation)
   - Cualquier juego que SimHub detecte

2. **Iniciar el juego**

3. **Verificar en SimHub que detecta el juego:**
   - Debería aparecer el nombre del juego
   - Los datos deberían cambiar de 0 cuando manejes

### 🚗 5.2 Prueba de Conducción

1. **Iniciar una carrera o modo libre**
2. **En el dashboard web, deberías ver:**
   - Velocidad cambiando en tiempo real
   - RPMs subiendo/bajando
   - Datos de volante, acelerador, freno actualizándose

3. **Después de ~30 segundos de conducción:**
   - Los medidores de Calma y Control empezarán a mostrar valores reales
   - El arte colectivo empezará a aparecer en el fondo

---

## 🔧 TROUBLESHOOTING COMÚN

### ❌ Problema: "No se puede conectar al servidor"

**Solución:**
```bash
# Verificar que Python esté funcionando
python --version

# Verificar que las dependencias estén instaladas
pip list | findstr fastapi

# Reinstalar dependencias si es necesario
pip install -r requirements.txt
```

### ❌ Problema: "WebSocket desconectado"

**Solución:**
1. Verificar que el firewall del PC servidor permita el puerto 8000
2. Refrescar la página web (F5)
3. Verificar logs en la consola del navegador (F12)

### ❌ Problema: "Datos siempre en 0"

**Solución:**
1. Verificar que un JUEGO esté ejecutándose en el PC simulador
2. Verificar que SimHub detecte el juego (debería aparecer el nombre)
3. Verificar configuración de "Available Properties" en SimHub

### ❌ Problema: "Solo algunos simuladores conectan"

**Solución:**
1. Verificar IPs una por una en navegador
2. Verificar que SimHub esté ejecutándose en todos los PCs
3. Verificar configuración de firewall en cada PC

### ❌ Problema: "Métricas no se calculan"

**Solución:**
1. Necesitas al menos 10-15 puntos de datos para que se calculen las métricas
2. Conducir activamente por al menos 30 segundos
3. Mover el volante y usar acelerador/freno

---

## 📊 FASE 6: VALIDACIÓN COMPLETA

### ✅ Checklist de Funcionamiento

**Antes del evento real, verificar:**

- [ ] Todos los 5 PCs simuladores conectados
- [ ] SimHub ejecutándose en todos los PCs
- [ ] URLs responden correctamente en navegador
- [ ] Sistema de dashboard iniciado sin errores
- [ ] WebSocket conectado (indicador verde)
- [ ] Al menos un juego probado con datos reales
- [ ] Métricas de Calma y Control calculándose
- [ ] Arte colectivo apareciendo en canvas
- [ ] Pantalla grande/proyector configurado
- [ ] Red estable sin cortes

### 🎯 Prueba Final

1. **Tener 2-3 personas conduciendo simultáneamente**
2. **Verificar que se vean:**
   - Datos diferentes en cada simulador
   - Métricas grupales actualizándose
   - Arte colectivo con múltiples colores/líneas
   - Contador de "X/5 Pilotos Conectados"

---

## 🏁 CONFIGURACIÓN PARA EVENTO REAL

### 📺 Setup de Pantalla Grande

1. **Conectar monitor/proyector al PC servidor**
2. **Configurar resolución óptima** (1920x1080 mínimo)
3. **Abrir navegador en pantalla completa** (F11)
4. **Asegurar que la URL sea:** `http://localhost:8000`

### 🎵 Configuración de Audio (Opcional)

Si quieres efectos de sonido:
1. Conectar altavoces al PC servidor
2. El sistema está preparado para añadir sonidos (contacta si quieres esta función)

### 🔄 Durante el Evento

**Monitoreo:**
- Mantener terminal del servidor visible en segundo monitor
- Verificar logs por si hay desconexiones
- Tener `test_system.py` listo para diagnósticos rápidos

---

## 🆘 CONTACTO DE EMERGENCIA

**Si algo no funciona durante el setup:**

1. **Ejecutar diagnósticos:**
   ```bash
   python test_system.py
   ```

2. **Verificar logs del servidor:**
   - Revisar la terminal donde corre el sistema
   - Buscar mensajes de error en rojo

3. **Verificar conexión red:**
   ```bash
   ping [IP_DEL_SIMULADOR]
   ```

4. **Reinicio completo:**
   - Cerrar sistema (Ctrl+C en terminal)
   - Reiniciar SimHub en todos los PCs
   - Ejecutar `start.bat` nuevamente

---

## 🎉 CHECKLIST FINAL PRE-EVENTO

**24 horas antes:**
- [ ] Todos los PCs funcionando
- [ ] SimHub configurado en todos
- [ ] Red estable verificada
- [ ] Juegos instalados y probados
- [ ] Sistema completo probado con datos reales

**1 hora antes:**
- [ ] Todos los sistemas encendidos
- [ ] SimHub ejecutándose
- [ ] Dashboard iniciado y conectado
- [ ] Pantalla gigante configurada
- [ ] Prueba rápida con conducción real

**¡LISTO PARA EMPODERAR! 🚗💪✨**
