# 🚀 INICIO RÁPIDO - PRUEBA CON ASSETTO CORSA

## ✅ SISTEMA ACTUALIZADO Y LISTO

**Últimos cambios (commit 8a046d1):**
- ✅ Manejo correcto de datos de Assetto Corsa
- ✅ Throttle normalizado de escala 0-100 a 0-1
- ✅ SteeringAngle usando YawChangeVelocity como alternativa
- ✅ Validación robusta contra valores None
- ✅ Logs detallados para ver datos en tiempo real

---

## 📝 PASOS PARA PROBAR

### 1. EN EL PC CON SIMHUB (192.168.1.4):

```
✅ SimHub ejecutándose
✅ Puerto 8888 activo
✅ Assetto Corsa instalado
```

**IMPORTANTE:** Inicia Assetto Corsa y **ENTRA EN UNA SESIÓN DE CONDUCCIÓN**
- No solo abrir el juego
- No quedarse en el menú
- Iniciar una carrera o práctica libre
- **Empezar a conducir**

### 2. EN ESTE PC (SERVIDOR):

**Opción A - Inicio automático:**
```bash
start.bat
```

**Opción B - Inicio manual:**
```bash
cd backend
C:\Users\User\AppData\Local\Programs\Python\Python311\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. ABRIR EN EL NAVEGADOR:

**Dashboard:**
```
http://localhost:8000
```

**Obra de Arte:**
```
http://localhost:8000/artwork
```

---

## 📊 QUÉ VERÁS

### En la Terminal (Logs):
```
INFO - ✅ sim_1: Speed=86.9km/h, RPM=5659, Throttle=0.33, Brake=0.13
```

### En el Dashboard:
- **sim_1:** Punto verde ✅ (conectado)
- **Velocidad:** Actualizándose en tiempo real
- **RPMs:** Moviéndose según el motor
- **Medidores:** Calculándose después de ~10 segundos

### En la Obra de Arte:
- **Al acelerar:** Verás líneas pintándose
- **Al frenar:** Verás explosiones circulares
- **Velocidad:** Controla el color (azul→rojo)
- **RPMs:** Controla el grosor de las líneas

---

## ⚠️ TROUBLESHOOTING

### "sim_1 aparece desconectado (rojo)"
**Solución:**
1. Verifica que SimHub esté ejecutándose en 192.168.1.4
2. Prueba: `ping 192.168.1.4` (debe responder)
3. Reinicia SimHub

### "sim_1 conectado pero datos en 0"
**Solución:**
1. **Entra en una sesión de conducción en Assetto Corsa**
2. No solo abrir el juego, debes estar en pista
3. Empieza a manejar activamente

### "No veo actualización en el dashboard"
**Solución:**
1. Presiona F12 en el navegador
2. Ve a Console
3. Busca mensajes de WebSocket
4. Verifica que no haya errores

### "La obra de arte no se pinta"
**Solución:**
1. Asegúrate de estar en `/artwork`
2. Verifica que sim_1 esté conectado
3. **ACELERA o FRENA activamente**
4. Las líneas solo aparecen cuando conduces

---

## 🎮 PRUEBAS RECOMENDADAS

### 1. Verificar Conexión (30 segundos)
- Inicia el servidor
- Abre el dashboard
- Verifica punto verde en sim_1
- Ve los números moviéndose

### 2. Probar Dashboard (2 minutos)
- Observa la velocidad cambiando
- Ve los RPMs subiendo/bajando
- Mira los medidores de Calma y Control

### 3. Probar Obra de Arte (5 minutos)
- Abre `/artwork`
- Conduce normalmente
- Acelera → verás líneas
- Frena → verás explosiones
- Gira el volante → verás dirección

### 4. Exportar Arte
- Click en "💾 Exportar PNG"
- Se descarga imagen 2K

---

## 📈 DATOS QUE SE RECIBEN

Basado en la telemetría real de Assetto Corsa:

```json
{
  "SpeedKmh": 86.88,           // ✅ Velocidad real
  "Rpms": 5659,                // ✅ RPMs del motor
  "Gear": "2",                 // ✅ Marcha actual
  "Throttle": 0.33,            // ✅ Acelerador (normalizado a 0-1)
  "Brake": 0.13,               // ✅ Freno (0-1)
  "SteeringAngle": 21.9        // ✅ Derivado de YawChangeVelocity
}
```

**Nota sobre SteeringAngle:**
- Assetto Corsa no expone SteeringAngle directamente
- Usamos `YawChangeVelocity` como alternativa
- Funciona perfectamente para el arte y métricas

---

## 🎯 PRÓXIMOS PASOS

Una vez que funcione con 1 simulador:

1. **Documentar la configuración** que funcionó
2. **Replicar en otros PCs** para sim_2-5
3. **Probar con F1 2024** (proceso idéntico)
4. **Configurar para el evento** final

---

## 📞 SI ALGO NO FUNCIONA

1. **Mira los logs** en la terminal del servidor
2. **Presiona F12** en el navegador y revisa Console
3. **Verifica** que Assetto Corsa esté en sesión activa
4. **Reinicia** SimHub si es necesario

---

**¡LISTO PARA PROBAR! 🏁🎨**

**Comando:** `start.bat`

