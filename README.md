# 🚗 Confianza al Volante - Arte Generativo Real

Una experiencia tecnológica que transforma las métricas reales de conducción de 5 simuladores en una obra de arte colectiva en tiempo real.

## 🎨 Sistema de Arte Basado en Métricas

### **Lógica de Pintura Real:**
- **🏁 Al Acelerar:** Líneas rectas delgadas estilizadas en dirección del volante
- **🛑 Al Frenar:** Manchas circulares con gotas alrededor  
- **🔄 Al Girar:** Cambio de dirección de todos los trazos
- **⚡ Velocidad/RPMs:** Modifica tamaño y color dinámicamente
- **🎯 Sin Aleatoriedad:** 100% basado en telemetría SimHub

### **5 Conductoras Claramente Visibles:**
- **🔵 Azul (sim_1):** Esquina superior izquierda
- **🟢 Verde (sim_2):** Esquina superior derecha
- **🟡 Amarillo (sim_3):** Esquina inferior izquierda  
- **🔴 Rojo (sim_4):** Esquina inferior derecha
- **🟣 Violeta (sim_5):** Centro del canvas

## 🎯 Características Técnicas

### **Canvas 2K para Proyección:**
- Resolución: **2560x1440** (2K QHD)
- Fondo blanco para exportación PNG
- Calidad máxima para pantallas gigantes

### **Velocidad Humana Real:**
- **800ms entre trazos** por conductora
- **Máximo 1.25 trazos/segundo** por persona
- **5 simultáneas = 6.25 total/segundo**

### **40 Artistas por Grupo:**
- **Sesiones de 5-7 minutos** por mujer
- **Personalidades únicas:** Enérgica, Contemplativa, Explosiva, Delicada, Salvaje, Rítmica, Audaz
- **Transiciones automáticas** entre artistas

## 🚀 Uso Rápido

### **Demo (Sin SimHub):**
```bash
demo_start.bat
```
- **Dashboard:** http://localhost:8000
- **Obra de Arte:** http://localhost:8000/artwork

### **Producción (Con SimHub):**
```bash
start.bat
```

## ⚡ Instalación

### **Requisitos:**
- Python 3.10+
- SimHub en cada PC simulador
- Red local configurada

### **Pasos:**
1. **Clonar repositorio**
2. **Instalar dependencias:** `pip install -r requirements.txt`
3. **Configurar SimHub:** Activar Web Server API
4. **Ejecutar:** `start.bat` o `demo_start.bat`

## 🎨 Exportar Arte

1. **Ir a:** http://localhost:8000/artwork
2. **Click:** "💾 Exportar PNG"
3. **Resultado:** Imagen 2K con fondo blanco

## 📊 Métricas SimHub Utilizadas

### **Datos Principales:**
- **SpeedKmh:** Velocidad (color/tamaño)
- **SteeringAngle:** Dirección de trazos
- **Throttle:** Activar líneas rectas
- **Brake:** Activar manchas circulares
- **Rpms:** Modificador de color
- **Gear:** Modificador de tamaño

### **Métricas Calculadas:**
- **calm_index:** Basado en suavidad del volante
- **control_index:** Basado en uso de pedales

## 🔧 Configuración SimHub

1. **Instalar SimHub** en cada PC simulador
2. **Activar Web Server** en Settings > Plugins > Web
3. **Configurar datos a exponer:**
   - SpeedKmh
   - Rpms
   - Gear
   - SteeringAngle
   - Throttle
   - Brake
4. **Anotar IP y puerto** de cada PC
5. **Actualizar URLs** en el código si es necesario

## 📁 Estructura del Proyecto

```
confianza_al_volante/
├── backend/
│   ├── main.py              # FastAPI principal
│   ├── main_demo.py         # Versión demo
│   ├── simhub_connector.py  # Conexión SimHub
│   └── data_processor.py    # Procesamiento métricas
├── frontend/
│   ├── index.html           # Dashboard
│   ├── artwork.html         # Obra de arte
│   ├── script.js            # Lógica dashboard
│   ├── artwork.js           # Motor de arte
│   └── styles.css           # Estilos
├── demo_simulator.py        # Simulador datos demo
├── start.bat               # Iniciador producción
├── demo_start.bat          # Iniciador demo
└── requirements.txt        # Dependencias Python
```

## 🎯 Flujo de Datos

1. **SimHub** → Expone telemetría por Web API
2. **Backend** → Conecta a 5 SimHub, calcula métricas
3. **WebSocket** → Transmite datos en tiempo real
4. **Frontend** → Recibe datos y pinta según métricas
5. **Arte** → Se genera 100% basado en acciones reales

## 🌟 Características Únicas

### **Sin Simulación Artística:**
- **Cada trazo** corresponde a una acción real
- **Sin aleatoriedad** en la generación
- **Líneas rectas** solo al acelerar
- **Manchas circulares** solo al frenar

### **Navegación Fluida:**
- **WebSocket compartido** entre páginas
- **Sin reinicio** al cambiar de vista
- **Estado persistente** de conexiones

### **Calidad Profesional:**
- **Canvas 2K** para proyección gigante
- **Fondo blanco** para exportación
- **Colores diferenciados** por conductora
- **Timing humano** realista

---

## 📞 Soporte

Para problemas técnicos o consultas sobre implementación, revisar:
- `GUIA_IMPLEMENTACION_REAL.md` - Guía detallada de despliegue
- `PROYECTO_COMPLETADO.md` - Resumen ejecutivo completo
- Logs del sistema en la consola del navegador

**¡Sistema listo para crear arte auténtico basado en la telemetría real de conducción! 🏁🎨**