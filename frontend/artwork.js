/**
 * Obra de Arte Colectiva - Confianza al Volante
 * Sistema de pintura en tiempo real dirigido por conductoras
 */

class ArtworkEngine {
    constructor() {
        // Configuración del lienzo
        this.canvas = document.getElementById('art-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // WebSocket
        this.websocket = null;
        this.connected = false;
        
        // Estado del arte
        this.painting = true;
        this.artists = new Map();
        this.paintHistory = [];
        
        // Configuración artística - BASADO 100% EN MÉTRICAS SIMHUB + ORGÁNICO
        this.artConfig = {
            fadeRate: 0.00001,         // Aún más lento para persistencia
            maxBrushSize: 30,          // Pinceles más grandes para mejor visibilidad
            minBrushSize: 1,           
            expressiveness: 1.2,       // Poco más expresivo para organicidad
            colorSaturation: 0.85,     // Colores más vibrantes
            paintingSpeed: 0.001,      // Súper lento - muy pausado humano
            chaosLevel: 0.15,          // Pequeño caos para movimiento orgánico
            energyMultiplier: 0.3,     // Mínima energía
            humanPaintingRate: 200,    // CAMBIADO: 200ms para más frecuencia y continuidad
            throttleLineMode: true,    // Líneas rectas al acelerar
            brakeSpotMode: true,       // Manchas circulares al frenar
            pureMetrics: true,         // 100% basado en métricas SIMHUB
            organicMovement: true,     // NUEVO: Movimiento más orgánico
            curveIntensity: 0.3,       // NUEVO: Intensidad de curvas
            continuousLines: true,     // NUEVO: Líneas continuas
            pathMemory: 50             // NUEVO: Recordar últimos 50 puntos
        };
        
        // Control de timing humano - simular 5 manos reales
        this.lastPaintTime = {};       // Último trazo por conductora
        this.paintingQueue = [];       // Cola de acciones pendientes
        this.humanTimers = {};         // Timers individuales por conductora
        
        // === SISTEMA DE LÍNEAS CONTINUAS ===
        this.driverPaths = {};         // Rutas continuas por conductora
        this.lastPositions = {};       // Últimas posiciones para continuidad
        this.drivingStates = {};       // Estados de conducción (recta, giro, freno)
        this.pathSegments = {};        // Segmentos de línea actual
        
        // === SISTEMA MULTI-ARTISTA (40 MUJERES x GRUPO) ===
        this.artistProfiles = {};      // Perfiles únicos por conductora
        this.currentSessions = {};     // Sesiones actuales (5-7 min cada una)
        this.sessionStartTime = {};    // Tiempo de inicio de sesión
        this.artistCounter = 0;        // Contador global de artistas
        this.generationSeed = Date.now(); // Semilla para consistencia artística
        
        // Colores base por conductora para diferenciación
        this.driverColors = {
            sim_1: { name: 'Azul Serenidad', base: 200 },     // Azul
            sim_2: { name: 'Verde Natura', base: 120 },       // Verde  
            sim_3: { name: 'Dorado Solar', base: 50 },        // Amarillo
            sim_4: { name: 'Rojo Pasión', base: 10 },         // Rojo
            sim_5: { name: 'Violeta Místico', base: 280 }     // Violeta
        };
        
        // POSICIONES DISTRIBUIDAS PARA COBERTURA TOTAL DEL CANVAS
        this.driverPositions = {
            sim_1: { x: 0.2, y: 0.2 },   // Cuadrante superior izquierdo
            sim_2: { x: 0.8, y: 0.2 },   // Cuadrante superior derecho  
            sim_3: { x: 0.2, y: 0.8 },   // Cuadrante inferior izquierdo
            sim_4: { x: 0.8, y: 0.8 },   // Cuadrante inferior derecho
            sim_5: { x: 0.5, y: 0.5 }    // Centro del canvas
        };
        
        // POSICIONES INICIALES DISTRIBUIDAS
        this.currentPositions = {
            sim_1: { x: 0.2, y: 0.2 },
            sim_2: { x: 0.8, y: 0.2 },
            sim_3: { x: 0.2, y: 0.8 },
            sim_4: { x: 0.8, y: 0.8 },
            sim_5: { x: 0.5, y: 0.5 }
        };
        
        // === SISTEMA DE DISTRIBUCIÓN FORZADA ===
        this.targetZones = {
            sim_1: { minX: 0.05, maxX: 0.45, minY: 0.05, maxY: 0.45 },  // Cuadrante 1
            sim_2: { minX: 0.55, maxX: 0.95, minY: 0.05, maxY: 0.45 },  // Cuadrante 2
            sim_3: { minX: 0.05, maxX: 0.45, minY: 0.55, maxY: 0.95 },  // Cuadrante 3
            sim_4: { minX: 0.55, maxX: 0.95, minY: 0.55, maxY: 0.95 },  // Cuadrante 4
            sim_5: { minX: 0.25, maxX: 0.75, minY: 0.25, maxY: 0.75 }   // Zona central expandida
        };
        
        this.init();
    }
    
    async init() {
        console.log('🎨 Iniciando Motor de Arte Colectivo...');
        
        this.setupCanvas();
        this.connectWebSocket();
        this.startArtLoop();
        
        // Eventos de ventana
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log('✅ Motor de Arte iniciado');
    }
    
    setupCanvas() {
        this.resizeCanvas();
        
        // Configuración del contexto para arte de alta calidad
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Fondo inicial
        this.clearCanvas();
    }
    
    resizeCanvas() {
        // === RESOLUCIÓN 2K PARA PROYECCIÓN GIGANTE ===
        const resolution2K = {
            width: 2560,   // 2K QHD
            height: 1440   // 16:9 ratio
        };
        
        // Canvas interno en 2K para máxima calidad
        this.canvas.width = resolution2K.width;
        this.canvas.height = resolution2K.height;
        
        // Escalar CSS para que se ajuste a la ventana del navegador
        const screenRatio = Math.min(
            window.innerWidth / resolution2K.width, 
            window.innerHeight / resolution2K.height
        );
        
        this.canvas.style.width = (resolution2K.width * screenRatio) + 'px';
        this.canvas.style.height = (resolution2K.height * screenRatio) + 'px';
        
        // Configurar calidad de renderizado máxima
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        console.log(`🖼️ Canvas 2K configurado: ${resolution2K.width}x${resolution2K.height} | Escala pantalla: ${(screenRatio*100).toFixed(1)}%`);
    }
    
    clearCanvas() {
        // Fondo blanco tipo lienzo de óleo
        this.ctx.fillStyle = '#ffffff'; // Blanco puro para exportación
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // TEXTURA REALISTA DE ÓLEO CON PINCELADAS
        this.addOilCanvasTexture();
    }
    
    addOilCanvasTexture() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // === 1. TEXTURA BASE DEL LIENZO (trama irregular) ===
        ctx.globalAlpha = 0.015;
        const tramSize = 3;
        for (let x = 0; x < canvas.width; x += tramSize) {
            for (let y = 0; y < canvas.height; y += tramSize) {
                // Crear patrón de trama irregular basado en posición
                const irregularity = Math.sin(x * 0.01) * Math.cos(y * 0.01);
                const fiber = (x % 7) + (y % 5); // Patrón de fibras
                
                if (fiber % 3 === 0) {
                    // Fibras horizontales
                    ctx.fillStyle = irregularity > 0 ? '#f8f8f8' : '#f2f2f2';
                    ctx.fillRect(x, y, tramSize + 1, 1);
                } else if (fiber % 3 === 1) {
                    // Fibras verticales
                    ctx.fillStyle = irregularity > 0.5 ? '#f6f6f6' : '#f0f0f0';
                    ctx.fillRect(x, y, 1, tramSize + 1);
                }
            }
        }
        
        // === 2. PINCELADAS PREVIAS SUTILES (gesso/preparación) ===
        ctx.globalAlpha = 0.008;
        const brushStrokes = 25; // Número de pinceladas base
        
        for (let i = 0; i < brushStrokes; i++) {
            // Posición basada en patrón, no aleatoria
            const angle = (i / brushStrokes) * Math.PI * 4; // Múltiples direcciones
            const startX = (canvas.width / brushStrokes) * i;
            const startY = canvas.height * ((i % 3) / 3);
            
            // Largo de pincelada variable
            const strokeLength = 80 + (i % 5) * 40; // 80-280px
            const strokeWidth = 8 + (i % 3) * 4; // 8-16px
            
            // Color base ligeramente variable
            const grayValue = 245 + (i % 3) * 3; // 245-251
            ctx.strokeStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            
            // Crear pincelada curvada
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            const segments = 8;
            for (let s = 1; s <= segments; s++) {
                const progress = s / segments;
                const x = startX + Math.cos(angle) * strokeLength * progress;
                const y = startY + Math.sin(angle) * strokeLength * progress;
                
                // Añadir variación orgánica basada en segmento
                const variation = Math.sin(progress * Math.PI * 3) * (10 + i % 8);
                const varX = x + Math.cos(angle + Math.PI/2) * variation;
                const varY = y + Math.sin(angle + Math.PI/2) * variation;
                
                if (s === 1) {
                    ctx.lineTo(varX, varY);
                } else {
                    // Control point para curva suave
                    const prevX = startX + Math.cos(angle) * strokeLength * (progress - 1/segments);
                    const prevY = startY + Math.sin(angle) * strokeLength * (progress - 1/segments);
                    const ctrlX = (prevX + varX) / 2 + Math.sin(i + s) * 5;
                    const ctrlY = (prevY + varY) / 2 + Math.cos(i + s) * 5;
                    ctx.quadraticCurveTo(ctrlX, ctrlY, varX, varY);
                }
            }
            ctx.stroke();
        }
        
        // === 3. IMPERFECCIONES DEL LIENZO ===
        ctx.globalAlpha = 0.012;
        const imperfections = 60;
        
        for (let i = 0; i < imperfections; i++) {
            // Distribuir imperfecciones de forma controlada
            const x = (canvas.width / 10) * (i % 10) + ((i % 7) * 20);
            const y = (canvas.height / 6) * Math.floor(i / 10) + ((i % 11) * 15);
            
            const imperfectionSize = 2 + (i % 4); // 2-5px
            const intensity = 250 - (i % 8); // 242-250
            
            ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            
            // Diferentes tipos de imperfecciones
            if (i % 4 === 0) {
                // Pequeñas fibras sueltas
                ctx.fillRect(x, y, imperfectionSize * 2, 1);
            } else if (i % 4 === 1) {
                // Pequeños grumos
                ctx.beginPath();
                ctx.arc(x, y, imperfectionSize / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (i % 4 === 2) {
                // Fibras verticales
                ctx.fillRect(x, y, 1, imperfectionSize * 2);
            } else {
                // Manchitas irregulares
                ctx.fillRect(x, y, imperfectionSize, imperfectionSize);
            }
        }
        
        // === 4. VARIACIONES SUTILES DE COLOR (oxidación, edad) ===
        ctx.globalAlpha = 0.005;
        const colorVariations = 15;
        
        for (let i = 0; i < colorVariations; i++) {
            const regionX = (canvas.width / 5) * (i % 5);
            const regionY = (canvas.height / 3) * Math.floor(i / 5);
            const regionSize = 120 + (i % 3) * 40; // 120-200px
            
            // Crear gradiente sutil
            const gradient = ctx.createRadialGradient(
                regionX + regionSize/2, regionY + regionSize/2, 0,
                regionX + regionSize/2, regionY + regionSize/2, regionSize
            );
            
            // Colores ligeramente diferentes según región
            if (i % 3 === 0) {
                gradient.addColorStop(0, 'rgba(255, 253, 250, 0.3)'); // Ligeramente cálido
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            } else if (i % 3 === 1) {
                gradient.addColorStop(0, 'rgba(250, 250, 255, 0.2)'); // Ligeramente frío
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(253, 253, 253, 0.1)'); // Neutro
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(regionX, regionY, regionSize, regionSize);
        }
        
        // Restaurar configuración
        ctx.globalAlpha = 1;
    }
    
    connectWebSocket() {
        // Reutilizar WebSocket global si existe y está activo
        if (window.globalWebSocket && window.globalWebSocket.readyState === WebSocket.OPEN) {
            console.log('🔄 Reutilizando WebSocket global para arte');
            this.websocket = window.globalWebSocket;
            this.connected = true;
            this.updateConnectionStatus(true);
            
            // Agregar nuestro handler sin interferir con otros
            const artworkHandler = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Error parseando mensaje en arte:', error);
                }
            };
            
            // Si ya hay un handler, crear uno combinado
            if (this.websocket.onmessage) {
                const existingHandler = this.websocket.onmessage;
                this.websocket.onmessage = (event) => {
                    existingHandler(event);
                    artworkHandler(event);
                };
            } else {
                this.websocket.onmessage = artworkHandler;
            }
            
            return;
        }
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`🔌 Conectando WebSocket Arte: ${wsUrl}`);
        
        this.websocket = new WebSocket(wsUrl);
        window.globalWebSocket = this.websocket; // Guardar globalmente
        
        this.websocket.onopen = () => {
            console.log('✅ WebSocket Arte conectado');
            this.connected = true;
            this.updateConnectionStatus(true);
        };
        
        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('❌ Error parseando mensaje:', error);
            }
        };
        
        this.websocket.onclose = (event) => {
            console.log('🔌 WebSocket Arte desconectado');
            this.connected = false;
            this.updateConnectionStatus(false);
            
            // Limpiar referencia global
            if (window.globalWebSocket === this.websocket) {
                window.globalWebSocket = null;
            }
            
            // Solo reconectar si no fue navegación
            if (!event.wasClean) {
                setTimeout(() => this.connectWebSocket(), 3000);
            }
        };
        
        this.websocket.onerror = (error) => {
            console.error('❌ Error WebSocket Arte:', error);
        };
    }
    
    handleMessage(data) {
        // Mensaje inicial
        if (data.type === 'connection_established') {
            console.log('🎉 Conexión establecida:', data.message);
            
            if (data.demo_mode) {
                document.getElementById('demo-indicator').style.display = 'block';
            }
            return;
        }
        
        // Datos de telemetría para arte
        if (data.simulators && this.painting) {
            this.updateArtwork(data);
        }
    }
    
    updateArtwork(data) {
        // DEBUG COMPLETO: Verificar estado de todas las conductoras
        const expectedDrivers = ['sim_1', 'sim_2', 'sim_3', 'sim_4', 'sim_5'];
        const receivedDrivers = Object.keys(data.simulators);
        const missingDrivers = expectedDrivers.filter(id => !receivedDrivers.includes(id));
        
        console.log(`📊 ESPERADAS: ${expectedDrivers.join(', ')}`);
        console.log(`📊 RECIBIDAS: ${receivedDrivers.join(', ')}`);
        if (missingDrivers.length > 0) {
            console.warn(`⚠️ FALTANTES: ${missingDrivers.join(', ')}`);
        }
        
        // PRODUCCIÓN: Solo reportar conductoras faltantes sin simular datos
        if (missingDrivers.length > 0) {
            console.warn(`⚠️ CONDUCTORAS NO CONECTADAS: ${missingDrivers.join(', ')}`);
            // En producción, trabajamos solo con las conductoras realmente conectadas
        }
        
        // TIMING HUMANO - Procesar cada conductora con velocidad humana realista
        for (const [simId, simData] of Object.entries(data.simulators)) {
            // DEBUG: Estado de conexión detallado
            const connected = simData.raw_data?.connected;
            const speed = simData.raw_data?.SpeedKmh || 0;
            const throttle = simData.raw_data?.Throttle || 0;
            const brake = simData.raw_data?.Brake || 0;
            
            console.log(`🔍 ${simId}: connected=${connected}, speed=${speed.toFixed(1)}, throttle=${throttle.toFixed(2)}, brake=${brake.toFixed(2)}`);
            
            if (!connected) {
                this.updateArtistStatus(simId, 'Desconectado', false);
                continue;
            }
            
            // Control de timing humano por conductora
            const now = Date.now();
            const lastPaint = this.lastPaintTime[simId] || 0;
            const timeSinceLast = now - lastPaint;
            
            // CAMBIADO: Pintar más frecuentemente para líneas continuas
            if (timeSinceLast >= this.artConfig.humanPaintingRate) {
                this.updateArtistStatus(simId, 'Pintando', true);
                this.paintContinuousLine(simId, simData); // NUEVA FUNCIÓN
                this.lastPaintTime[simId] = now;
                
                // Variación humana basada en métricas - datos disponibles
                const rawData = simData.raw_data;
                const rpmDelay = ((rawData?.Rpms || 0) / 8000) * 30; // 0-30ms según RPMs
                const speedDelay = ((rawData?.SpeedKmh || 0) / 200) * 20; // 0-20ms según velocidad
                this.lastPaintTime[simId] += rpmDelay - speedDelay;
            } else {
                // Mostrar que está "preparando el pincel"
                this.updateArtistStatus(simId, 'Preparando pincel...', true);
            }
        }
    }
    
    paintContinuousLine(simId, simData) {
        const rawData = simData.raw_data;
        const metrics = simData.metrics || {};
        
        // Verificar datos válidos
        if (!rawData) {
            console.warn(`❌ No hay datos rawData para ${simId}`);
            return;
        }
        
        // Calcular parámetros basados SOLO en métricas reales
        const realParams = this.calculateRealParams(rawData, metrics, simId);
        
        // Verificar parámetros válidos
        if (!realParams || isNaN(realParams.x) || isNaN(realParams.y)) {
            console.warn(`❌ Parámetros inválidos para ${simId}:`, realParams);
            return;
        }
        
        // Inicializar ruta si no existe
        if (!this.driverPaths[simId]) {
            this.driverPaths[simId] = [];
            this.drivingStates[simId] = 'starting';
        }
        
        // Agregar punto actual a la ruta
        const currentPoint = {
            x: realParams.x,
            y: realParams.y,
            throttle: realParams.throttle,
            brake: realParams.brake,
            speed: rawData.SpeedKmh || 0,
            steering: rawData.SteeringAngle || 0,
            timestamp: Date.now(),
            calmIndex: metrics.calm_index || 50,
            controlIndex: metrics.control_index || 50,
            hue: realParams.hue
        };
        
        this.driverPaths[simId].push(currentPoint);
        
        // Mantener solo los últimos puntos para memoria
        if (this.driverPaths[simId].length > this.artConfig.pathMemory) {
            this.driverPaths[simId].shift();
        }
        
        // Obtener eventos extremos
        const artParams = metrics.art_parameters || {};
        const extremeEvents = artParams.extreme_events || {type: "normal", intensity: 0.0};
        
        // EFECTOS ESPECIALES PARA EVENTOS EXTREMOS
        if (extremeEvents.type !== "normal") {
            this.paintExtremeEvent(realParams, extremeEvents, simId);
            return;
        }
        
        // PINTAR LÍNEA CONTINUA DESDE EL ÚLTIMO PUNTO
        this.drawContinuousPath(simId);
        
        // Debug ocasional
        if (realParams.throttle > 0.3 || realParams.brake > 0.3) {
            console.log(`🛣️ ${simId} ruta: ${this.driverPaths[simId].length} puntos, estado: ${this.drivingStates[simId]}`);
        }
    }
    
    drawContinuousPath(simId) {
        const path = this.driverPaths[simId];
        if (!path || path.length < 2) return;
        
        const ctx = this.ctx;
        const lastTwoPoints = path.slice(-2);
        const [prevPoint, currentPoint] = lastTwoPoints;
        
        // Determinar estado de conducción
        const state = this.determineDrivingState(prevPoint, currentPoint);
        this.drivingStates[simId] = state;
        
        // Configurar color y estilo basado en métricas del punto actual
        this.setupContinuousLineStyle(ctx, currentPoint, state);
        
        // Dibujar segmento de línea continua
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        
        // Estilo de línea basado en estado y calma
        if (currentPoint.calmIndex > 80) {
            // CONDUCCIÓN CALMA: Línea suave con curvas
            const midX = (prevPoint.x + currentPoint.x) / 2;
            const midY = (prevPoint.y + currentPoint.y) / 2;
            const curveOffset = Math.sin(Date.now() * 0.001) * 5;
            ctx.quadraticCurveTo(midX + curveOffset, midY, currentPoint.x, currentPoint.y);
        } else if (currentPoint.calmIndex < 40) {
            // CONDUCCIÓN NERVIOSA: Línea temblorosa
            this.drawNervousLine(ctx, prevPoint, currentPoint);
        } else {
            // CONDUCCIÓN NORMAL: Línea recta
            ctx.lineTo(currentPoint.x, currentPoint.y);
        }
        
        ctx.stroke();
        
        // Agregar efectos especiales según el estado
        this.addStateEffects(ctx, currentPoint, state);
    }
    
    determineDrivingState(prevPoint, currentPoint) {
        const speedChange = Math.abs(currentPoint.speed - prevPoint.speed);
        const steeringChange = Math.abs(currentPoint.steering - prevPoint.steering);
        
        if (currentPoint.brake > 0.5) return 'braking';
        if (currentPoint.throttle > 0.7) return 'accelerating';
        if (speedChange > 20) return 'speed_change';
        if (steeringChange > 15) return 'turning';
        if (currentPoint.speed > 1) return 'cruising';
        return 'stationary';
    }
    
    setupContinuousLineStyle(ctx, point, state) {
        // COLOR VIVO Y MOTIVADOR
        const saturation = 85 + (point.controlIndex / 100) * 15; // 85-100% (MUY VIBRANTE)
        const luminance = 50 + (point.controlIndex / 100) * 20;   // 50-70% (BRILLANTE)
        const color = `hsl(${point.hue}, ${saturation}%, ${luminance}%)`;
        
        // Grosor basado en velocidad y estado
        let lineWidth = 2 + (point.speed / 50) * 8; // 2-10px
        if (state === 'accelerating') lineWidth *= 1.5;
        if (state === 'braking') lineWidth *= 2;
        
        // Opacidad basada en actividad
        const activity = Math.max(point.throttle, point.brake, point.speed / 100);
        const opacity = 0.7 + (activity * 0.3);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, Math.min(15, lineWidth));
        ctx.globalAlpha = opacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    
    drawNervousLine(ctx, start, end) {
        const segments = 8;
        const dx = (end.x - start.x) / segments;
        const dy = (end.y - start.y) / segments;
        
        for (let i = 1; i <= segments; i++) {
            const x = start.x + dx * i;
            const y = start.y + dy * i;
            const nervousness = (100 - start.calmIndex) / 15;
            const jitterX = (Math.random() - 0.5) * nervousness;
            const jitterY = (Math.random() - 0.5) * nervousness;
            ctx.lineTo(x + jitterX, y + jitterY);
        }
    }
    
    addStateEffects(ctx, point, state) {
        ctx.globalAlpha = 0.6;
        
        switch (state) {
            case 'braking':
                // CÍRCULO PRINCIPAL DE FRENO - MANTENER COLOR DE LA LÍNEA
                const brakeIntensity = point.brake || 0; // 0-1
                const baseCircleSize = 8; // Tamaño base
                const maxCircleSize = 40; // Tamaño máximo
                const circleSize = baseCircleSize + (brakeIntensity * (maxCircleSize - baseCircleSize));
                
                // USAR EL COLOR ACTUAL DE LA LÍNEA (no blanco)
                const saturation = 85 + (point.controlIndex / 100) * 15; // 85-100%
                const luminance = 50 + (point.controlIndex / 100) * 20;   // 50-70%
                const brakeColor = `hsl(${point.hue}, ${saturation}%, ${luminance}%)`;
                ctx.fillStyle = brakeColor;
                ctx.strokeStyle = brakeColor;
                
                // Círculo principal más grande y visible CON COLOR
                ctx.globalAlpha = 0.8 + (brakeIntensity * 0.2); // Muy opaco para visibilidad
                ctx.beginPath();
                ctx.arc(point.x, point.y, circleSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Añadir borde más oscuro para contraste
                ctx.globalAlpha = 0.9;
                ctx.lineWidth = 2 + (brakeIntensity * 3); // Borde más grueso con más freno
                const darkerLuminance = Math.max(20, luminance - 25); // 25% más oscuro
                ctx.strokeStyle = `hsl(${point.hue}, ${saturation}%, ${darkerLuminance}%)`;
                ctx.stroke();
                
                // Partículas de frenado CON EL MISMO COLOR
                const particleCount = 3 + Math.floor(brakeIntensity * 8); // 3-11 partículas
                ctx.fillStyle = brakeColor; // Restaurar color de relleno
                
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2; // Distribución uniforme
                    const distance = circleSize + 5 + (brakeIntensity * 20); // Distancia según intensidad
                    const px = point.x + Math.cos(angle) * distance;
                    const py = point.y + Math.sin(angle) * distance;
                    const particleSize = 2 + (brakeIntensity * 5); // 2-7px según intensidad
                    
                    ctx.globalAlpha = 0.7 + (brakeIntensity * 0.3);
                    ctx.beginPath();
                    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                console.log(`🛑 ${point.brake ? 'Freno' : 'Estado'} intensidad: ${brakeIntensity.toFixed(2)}, círculo: ${circleSize.toFixed(1)}px, color: ${brakeColor}`);
                break;
                
            case 'accelerating':
                // Líneas de velocidad
                for (let i = 0; i < 2; i++) {
                    const length = 15 + point.throttle * 20;
                    const angle = (point.steering * Math.PI / 180) + (i - 0.5) * 0.2;
                    const endX = point.x + Math.cos(angle) * length;
                    const endY = point.y + Math.sin(angle) * length;
                    
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                break;
        }
        
        ctx.globalAlpha = 1;
    }
    
    ensureArtistProfile(simId) {
        // Si no existe perfil o es momento de cambiar artista
        if (!this.artistProfiles[simId] || this.shouldChangeArtist(simId)) {
            this.createNewArtistProfile(simId);
        }
    }
    
    shouldChangeArtist(simId) {
        const sessionStart = this.sessionStartTime[simId] || Date.now();
        const sessionDuration = Date.now() - sessionStart;
        const maxSessionTime = 5.5 * 60 * 1000; // 5.5 minutos promedio
        
        return sessionDuration > maxSessionTime;
    }
    
    createNewArtistProfile(simId) {
        this.artistCounter++;
        const profile = this.generateArtistPersonality(simId, this.artistCounter);
        
        this.artistProfiles[simId] = profile;
        this.sessionStartTime[simId] = Date.now();
        
        // Actualizar UI con nueva artista
        this.updateArtistInfo(simId, profile);
        
        console.log(`🎨 Nueva artista en ${simId}: ${profile.name} (${profile.style})`);
    }
    
    generateArtistPersonality(simId, artistNumber) {
        // Usar semilla + número para consistencia
        const seed = this.generationSeed + artistNumber * 1000 + simId.charCodeAt(simId.length - 1);
        const random = this.seededRandom(seed);
        
        const baseColor = this.driverColors[simId];
        
        // Generar personalidad artística única
        const personalities = [
            { style: 'Enérgica', speed: 1.5, chaos: 2.0, brushSize: 1.3, description: 'Trazos rápidos y decididos' },
            { style: 'Contemplativa', speed: 0.7, chaos: 0.8, brushSize: 0.8, description: 'Movimientos suaves y pensados' },
            { style: 'Explosiva', speed: 1.8, chaos: 2.5, brushSize: 1.5, description: 'Salpicaduras intensas' },
            { style: 'Delicada', speed: 0.5, chaos: 0.5, brushSize: 0.6, description: 'Trazos finos y precisos' },
            { style: 'Salvaje', speed: 2.0, chaos: 3.0, brushSize: 1.8, description: 'Arte sin límites' },
            { style: 'Rítmica', speed: 1.2, chaos: 1.5, brushSize: 1.0, description: 'Patrones fluidos' },
            { style: 'Audaz', speed: 1.6, chaos: 2.2, brushSize: 1.4, description: 'Colores vibrantes' }
        ];
        
        const personality = personalities[Math.floor(random() * personalities.length)];
        
        return {
            name: `${baseColor.name} ${artistNumber}`,
            style: personality.style,
            description: personality.description,
            speedMultiplier: personality.speed,
            chaosMultiplier: personality.chaos,
            brushSizeMultiplier: personality.brushSize,
            colorShift: (random() - 0.5) * 60, // ±30° de variación en hue
            sessionNumber: artistNumber,
            created: Date.now()
        };
    }
    
    seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return () => {
            x = Math.sin(++seed) * 10000;
            return x - Math.floor(x);
        };
    }
    
    checkSessionChange(simId) {
        if (this.shouldChangeArtist(simId)) {
            this.createNewArtistProfile(simId);
        }
    }
    
    updateArtistInfo(simId, profile) {
        // Actualizar información de la artista en la UI
        const artistElement = document.querySelector(`[data-artist="${simId}"]`);
        if (artistElement) {
            const nameElement = artistElement.querySelector('.artist-name');
            const statusElement = artistElement.querySelector('.artist-status');
            
            if (nameElement) {
                nameElement.textContent = `${profile.name} - ${profile.style}`;
            }
            
            if (statusElement) {
                statusElement.textContent = profile.description;
            }
            
            // Efecto visual de transición
            artistElement.style.animation = 'pulse 2s ease-in-out';
            setTimeout(() => {
                artistElement.style.animation = '';
            }, 2000);
        }
        
        // Log detallado para seguimiento
        console.log(`🎨 Artista ${profile.sessionNumber}: ${profile.name}`);
        console.log(`   Estilo: ${profile.style} - ${profile.description}`);
        console.log(`   Velocidad: ${profile.speedMultiplier}x | Caos: ${profile.chaosMultiplier}x | Pincel: ${profile.brushSizeMultiplier}x`);
        console.log(`   Color Shift: ${profile.colorShift.toFixed(1)}°`);
    }
    
    calculateRealParams(rawData, metrics, simId) {
        const canvas = this.canvas;
        
        // === MÉTRICAS REALES DE SIMHUB ===
        const steeringAngle = rawData.SteeringAngle || 0;
        const speed = rawData.SpeedKmh || 0;
        const rpms = rawData.Rpms || 0;
        const throttle = rawData.Throttle || 0;
        const brake = rawData.Brake || 0;
        const gear = rawData.Gear || 1;
        
        // === MOVIMIENTO DINÁMICO POR TODO EL CANVAS - 100% MÉTRICAS ===
        const basePos = this.driverPositions[simId] || { x: 0.5, y: 0.5 };
        const currentPos = this.currentPositions[simId] || { x: basePos.x, y: basePos.y };
        
        // ACELERADOR controla velocidad de movimiento (mayor cobertura del canvas)
        const moveSpeed = (throttle * 0.015) + (speed / 300) * 0.01; // Reducido para más control
        
        // CORREGIR INTERPRETACIÓN DE DIRECCIÓN (steering 0° = hacia adelante)
        // En coches: 0° = adelante, +° = derecha, -° = izquierda
        // En canvas: necesitamos rotar 90° para que 0° = hacia abajo (adelante)
        let carDirection = (steeringAngle * Math.PI) / 180; // Ángulo del coche
        let canvasDirection = carDirection + Math.PI / 2; // Rotar 90° (0° coche = hacia abajo canvas)
        
        // MOVIMIENTO PRINCIPAL hacia donde "mira" el coche
        const primarySpeed = speed > 10 ? (speed / 200) * 0.012 : 0.003; // Siempre algo de movimiento hacia adelante
        let primaryDeltaX = Math.cos(canvasDirection) * primarySpeed;
        let primaryDeltaY = Math.sin(canvasDirection) * primarySpeed;
        
        // MOVIMIENTO ADICIONAL por acelerador (en la misma dirección)
        const accelSpeed = (throttle * 0.010); // 0-0.010 adicional por acelerar
        let accelDeltaX = Math.cos(canvasDirection) * accelSpeed;
        let accelDeltaY = Math.sin(canvasDirection) * accelSpeed;
        
        // COMBINAR MOVIMIENTOS
        let deltaX = primaryDeltaX + accelDeltaX;
        let deltaY = primaryDeltaY + accelDeltaY;
        
        // VARIACIÓN ANTI-AGRUPAMIENTO basada en posición actual
        const antiClusterX = Math.sin(currentPos.x * Math.PI * 4) * 0.002;
        const antiClusterY = Math.cos(currentPos.y * Math.PI * 4) * 0.002;
        deltaX += antiClusterX;
        deltaY += antiClusterY;
        
        // FRENO modifica el movimiento (derrape, pérdida de control)
        if (brake > 0.2) {
            const brakeFactor = brake * 0.5; // 0-0.5
            deltaX += Math.sin(Date.now() * 0.008) * brakeFactor * 0.01; // Inestabilidad X
            deltaY += Math.cos(Date.now() * 0.012) * brakeFactor * 0.01; // Inestabilidad Y
        }
        
        // Nueva posición
        let newX = currentPos.x + deltaX;
        let newY = currentPos.y + deltaY;
        
        // === REBOTES DINÁMICOS CON CAMBIO DE COLOR Y DIRECCIÓN ALEATORIA ===
        let bounced = false;
        let bounceInfo = null;
        let newDirection = canvasDirection; // Preservar dirección original
        
        // REBOTE EN BORDE IZQUIERDO
        if (newX < 0.05) {
            newX = 0.05 + (0.1 * ((Date.now() + simId.length) % 10) / 10); // Reposición más agresiva
            newDirection = Math.PI * 0.0; // Forzar hacia la derecha
            bounceInfo = {edge: 'left', time: Date.now()};
            bounced = true;
        }
        
        // REBOTE EN BORDE DERECHO  
        if (newX > 0.95) {
            newX = 0.95 - (0.1 * ((Date.now() + simId.length) % 10) / 10); // Reposición más agresiva
            newDirection = Math.PI; // Forzar hacia la izquierda
            bounceInfo = {edge: 'right', time: Date.now()};
            bounced = true;
        }
        
        // REBOTE EN BORDE SUPERIOR
        if (newY < 0.05) {
            newY = 0.05 + (0.1 * ((Date.now() + simId.length) % 10) / 10); // Reposición más agresiva
            newDirection = Math.PI * 0.5; // Forzar hacia abajo
            bounceInfo = {edge: 'top', time: Date.now()};
            bounced = true;
        }
        
        // REBOTE EN BORDE INFERIOR - CORRECCIÓN CRÍTICA
        if (newY > 0.95) {
            newY = 0.95 - (0.15 * ((Date.now() + simId.length) % 10) / 10); // Reposición MUY agresiva
            newDirection = Math.PI * 1.5; // Forzar hacia arriba
            bounceInfo = {edge: 'bottom', time: Date.now()};
            bounced = true;
            console.log(`🔄 ${simId} REBOTE INFERIOR FORZADO - Nueva Y: ${newY.toFixed(3)}, Dirección: ARRIBA`);
        }
        
        // REBOTES EN ESQUINAS (prioritario)
        if ((newX < 0.05 || newX > 0.95) && (newY < 0.05 || newY > 0.95)) {
            bounceInfo = {edge: 'corner', time: Date.now()};
            bounced = true;
        }
        
        // APLICAR NUEVO MOVIMIENTO SI REBOTÓ
        if (bounced && bounceInfo) {
            // USAR LA DIRECCIÓN FORZADA EN LUGAR DE SEMI-ALEATORIA
            canvasDirection = newDirection; // Ya fue calculada arriba según el borde
            
            // === VARIACIÓN ADICIONAL SOLO PARA ESQUINAS ===
            if (bounceInfo.edge === 'corner') {
                // En esquinas, dirigir hacia el centro con variación mínima
                const centerX = 0.5;
                const centerY = 0.5;
                const toCenterDirection = Math.atan2(centerY - newY, centerX - newX);
                
                const timeVariation = (bounceInfo.time % 1000) / 1000;
                const variationAngle = (timeVariation - 0.5) * 0.3; // ±0.15 radianes de variación
                
                canvasDirection = toCenterDirection + variationAngle;
                console.log(`🎯 ${simId} ESQUINA -> CENTRO: ${(canvasDirection * 180/Math.PI).toFixed(0)}°`);
            }
            
            // === CAMBIO DE COLOR AL REBOTAR ===
            if (!this.bounceColorOffsets) this.bounceColorOffsets = {};
            if (!this.bounceColorOffsets[simId]) this.bounceColorOffsets[simId] = 0;
            
            // Incrementar offset de color en cada rebote
            this.bounceColorOffsets[simId] += 30 + (variationFactor * 60); // +30-90° por rebote
            
            // VELOCIDAD DE REBOTE EXTREMADAMENTE AGRESIVA
            const baseSpeed = bounceInfo.edge === 'bottom' ? 0.08 : 0.05; // Borde inferior más agresivo
            const bounceSpeed = baseSpeed + (primarySpeed + accelSpeed) * 3.0; // 3x velocidad
            
            deltaX = Math.cos(canvasDirection) * bounceSpeed;
            deltaY = Math.sin(canvasDirection) * bounceSpeed;
            
            // APLICAR MOVIMIENTO DE REBOTE INMEDIATO
            newX = Math.max(0.05, Math.min(0.95, newX + deltaX));
            newY = Math.max(0.05, Math.min(0.95, newY + deltaY));
            
            // VERIFICACIÓN ESPECIAL PARA BORDE INFERIOR
            if (bounceInfo.edge === 'bottom' && newY > 0.85) {
                newY = 0.8; // Forzar más hacia arriba
                console.log(`⚠️ ${simId} FORZADO HACIA ARRIBA desde borde inferior`);
            }
            
            // Log del rebote para debug
            console.log(`🏀 ${simId} rebotó en ${bounceInfo.edge}, nueva pos: (${newX.toFixed(2)}, ${newY.toFixed(2)}), dir: ${(canvasDirection * 180/Math.PI).toFixed(0)}°, speed: ${bounceSpeed.toFixed(3)}`);
        }
        
        // === SISTEMA ANTI-ESTANCAMIENTO AGRESIVO ===
        if (!this.lastPositions) this.lastPositions = {};
        if (!this.stagnationCounters) this.stagnationCounters = {};
        
        // Verificar si se movió muy poco en los últimos frames
        const lastPos = this.lastPositions[simId];
        if (lastPos) {
            const distanceMoved = Math.abs(newX - lastPos.x) + Math.abs(newY - lastPos.y);
            
            // MEJORADO: Incrementar contador de estancamiento (más sensible)
            if (distanceMoved < 0.015) { // Umbral más alto para detectar estancamiento antes
                this.stagnationCounters[simId] = (this.stagnationCounters[simId] || 0) + 1;
            } else {
                this.stagnationCounters[simId] = 0; // Reset si se mueve bien
            }
            
            // MEJORADO: Activar escape más rápido y con más fuerza
            if (this.stagnationCounters[simId] > 3) { // Activar más rápido (era 5)
                // Crear dirección "semi-aleatoria" basada en métricas + tiempo
                const timeNow = Date.now();
                const timeVariation = (timeNow % 1000) / 1000; // 0-1
                const speedVar = (speed % 50) / 50; // 0-1
                const rpmVar = (rpms % 500) / 500; // 0-1
                const combinedVar = (timeVariation + speedVar + rpmVar + simId.length * 0.1) % 1;
                
                // Generar dirección basada en la variación combinada
                const randomDirection = combinedVar * Math.PI * 2; // 0-360° según métricas
                
                // MEJORADO: Velocidad de escape mucho más agresiva
                const baseEscapeSpeed = 0.05; // Velocidad mínima garantizada
                const escapeSpeed = baseEscapeSpeed + (primarySpeed + accelSpeed) * (3.0 + combinedVar); // 3x-4x velocidad
                
                deltaX = Math.cos(randomDirection) * escapeSpeed;
                deltaY = Math.sin(randomDirection) * escapeSpeed;
                
                // MEJORADO: Permitir movimiento hacia el centro, no solo bordes
                newX = Math.max(0.05, Math.min(0.95, newX + deltaX));
                newY = Math.max(0.05, Math.min(0.95, newY + deltaY));
                
                // VERIFICACIÓN ESPECIAL: Si está en borde inferior, forzar hacia arriba
                if (newY > 0.85) {
                    const upDirection = Math.PI * 1.5; // Directamente hacia arriba
                    const upSpeed = 0.12; // Velocidad muy alta hacia arriba
                    newY -= upSpeed; // Movimiento directo hacia arriba
                    newY = Math.max(0.1, newY);
                    console.log(`⬆️ ${simId} FORZADO HACIA ARRIBA desde Y=${newY.toFixed(2)}`);
                }
                
                // NUEVO: Si sigue en una esquina después del escape, forzar al centro
                if ((newX < 0.15 || newX > 0.85) && (newY < 0.15 || newY > 0.85)) {
                    const centerDirection = Math.atan2(0.5 - newY, 0.5 - newX); // Dirección hacia el centro
                    const centerSpeed = 0.08; // Velocidad hacia el centro
                    newX += Math.cos(centerDirection) * centerSpeed;
                    newY += Math.sin(centerDirection) * centerSpeed;
                    newX = Math.max(0.1, Math.min(0.9, newX));
                    newY = Math.max(0.1, Math.min(0.9, newY));
                    console.log(`🎯 ${simId} FORZADO AL CENTRO desde esquina`);
                }
                
                // Reset contador y añadir cambio de color por "escape"
                this.stagnationCounters[simId] = 0;
                if (!this.bounceColorOffsets) this.bounceColorOffsets = {};
                if (!this.bounceColorOffsets[simId]) this.bounceColorOffsets[simId] = 0;
                this.bounceColorOffsets[simId] += 45 + (combinedVar * 45); // +45-90° por escape
                
                console.log(`🚀 ${simId} ESCAPE AGRESIVO - Posición: (${newX.toFixed(2)}, ${newY.toFixed(2)}), Dirección: ${(randomDirection * 180/Math.PI).toFixed(0)}°, Velocidad: ${escapeSpeed.toFixed(3)}`);
            }
        }
        
        // Guardar posición actual para el próximo frame
        this.lastPositions[simId] = {x: newX, y: newY};
        
        // === VERIFICACIÓN FINAL ANTI-ACUMULACIÓN EN TODOS LOS BORDES ===
        let repositioned = false;
        
        // Borde inferior
        if (newY > 0.9) {
            newY = 0.7 + Math.random() * 0.15; // 0.7-0.85
            repositioned = true;
        }
        
        // Borde superior
        if (newY < 0.1) {
            newY = 0.15 + Math.random() * 0.15; // 0.15-0.3
            repositioned = true;
        }
        
        // Borde derecho
        if (newX > 0.9) {
            newX = 0.7 + Math.random() * 0.15; // 0.7-0.85
            repositioned = true;
        }
        
        // Borde izquierdo
        if (newX < 0.1) {
            newX = 0.15 + Math.random() * 0.15; // 0.15-0.3
            repositioned = true;
        }
        
        // VERIFICACIÓN ESPECIAL: Prevenir todas las esquinas
        if ((newX < 0.2 && newY < 0.2) || // Esquina superior izquierda
            (newX > 0.8 && newY < 0.2) || // Esquina superior derecha
            (newX < 0.2 && newY > 0.8) || // Esquina inferior izquierda
            (newX > 0.8 && newY > 0.8)) { // Esquina inferior derecha
            
            // Forzar hacia el centro con variación
            newX = 0.4 + Math.random() * 0.2; // 0.4-0.6 (centro horizontal)
            newY = 0.4 + Math.random() * 0.2; // 0.4-0.6 (centro vertical)
            repositioned = true;
            console.log(`🎯 ${simId} ANTI-ESQUINA - Forzado al centro: (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
        }
        
        // === SISTEMA DE DISTRIBUCIÓN POR CUADRANTES ===
        const targetZone = this.targetZones[simId];
        if (targetZone) {
            // Verificar si está fuera de su zona asignada
            if (newX < targetZone.minX || newX > targetZone.maxX || 
                newY < targetZone.minY || newY > targetZone.maxY) {
                
                // Mover gradualmente hacia su zona (20%)
                const targetCenterX = (targetZone.minX + targetZone.maxX) / 2;
                const targetCenterY = (targetZone.minY + targetZone.maxY) / 2;
                
                newX = newX + (targetCenterX - newX) * 0.3; // 30% hacia el objetivo
                newY = newY + (targetCenterY - newY) * 0.3;
                
                // Asegurar que está dentro de los límites de la zona
                newX = Math.max(targetZone.minX + 0.02, Math.min(targetZone.maxX - 0.02, newX));
                newY = Math.max(targetZone.minY + 0.02, Math.min(targetZone.maxY - 0.02, newY));
                
                console.log(`🎯 ${simId} DISTRIBUCIÓN - Zona: (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
            }
        }
        
        // Actualizar posición actual
        this.currentPositions[simId] = { x: newX, y: newY };
        
        // Convertir a píxeles
        const x = newX * canvas.width;
        const y = newY * canvas.height;
        
        // === COLOR BASADO SOLO EN MÉTRICAS REALES ===
        const calmness = metrics.calm_index || 50;
        const control = metrics.control_index || 50;
        
        const baseHues = {
            'sim_1': 200, // Azul - Esquina superior izquierda
            'sim_2': 120, // Verde - Esquina superior derecha  
            'sim_3': 50,  // Amarillo - Esquina inferior izquierda
            'sim_4': 10,  // Rojo - Esquina inferior derecha
            'sim_5': 280  // Violeta - Centro
        };
        
        let hue = baseHues[simId] || 0;
        
        // Color cambia SOLO con VELOCIDAD (sin aleatoriedad)
        hue += (speed / 200) * 60; // 0-60° de shift por velocidad
        
        // RPMs añaden variación de tono
        hue += (rpms / 8000) * 30; // 0-30° de shift por RPMs
        
        // === CAMBIO DE COLOR POR REBOTES ===
        if (this.bounceColorOffsets && this.bounceColorOffsets[simId]) {
            hue += this.bounceColorOffsets[simId]; // Acumular cambios de rebote
        }
        
        // === SATURACIÓN VIVA Y MOTIVADORA ===
        const saturation = 80 + (control / 100) * 20; // 80-100% (SIEMPRE VIBRANTE)
        
        // === LUMINOSIDAD BRILLANTE Y ENERGÉTICA ===
        const luminance = 45 + (speed / 200) * 25; // 45-70% (COLORES BRILLANTES, NUNCA OSCUROS)
        
        // === TAMAÑO BASADO EN GEAR Y VELOCIDAD ===
        let size = 2 + (gear * 2) + (speed / 100) * 8; // 2-18px según gear y velocidad
        size = Math.max(1, Math.min(20, size));
        
        // === DIRECCIÓN BASADA EN VOLANTE ===
        const direction = steeringAngle * Math.PI / 180; // Ángulo en radianes
        
        // === DETERMINAR ACCIÓN PRINCIPAL ===
        const isAccelerating = throttle > 0.05; // Acelerar (umbral más bajo)
        const isBraking = brake > 0.05;         // Frenar (umbral más bajo)
        const isCoasting = !isAccelerating && !isBraking; // En neutral
        
        // Debug de datos (solo si hay actividad)
        if (throttle > 0.05 || brake > 0.05 || speed > 5) {
            console.log(`📊 ${simId} - throttle: ${throttle.toFixed(2)}, brake: ${brake.toFixed(2)}, speed: ${speed.toFixed(1)}`);
        }
        
        return {
            x, y, 
            hue: hue % 360, 
            saturation, 
            luminance, 
            size,
            direction,
            isAccelerating,
            isBraking,
            isCoasting,
            // Métricas originales para debug
            steeringAngle, speed, rpms, throttle, brake, gear,
            rawData, metrics, simId
        };
    }
    
    paintMetricsStyle(params, simId) {
        const { 
            x, y, size, direction, throttle, brake,
            rawData, metrics // ¡Aquí está la magia!
        } = params;
        
        const calmIndex = metrics.calm_index || 50;
        const controlIndex = metrics.control_index || 50;
        const ctx = this.ctx;
        
        // 1. CORREGIR INTENSIDAD DE COLOR - EVITAR PERDIDA EN BLANCO
        const hue = params.hue;
        // SATURACION: Mínimo 60% para visibilidad garantizada
        const saturation = 60 + (controlIndex / 100) * 40; // 60% a 100% (NUNCA baja de 60%)
        // LUMINOSIDAD: Máximo 45% para contraste fuerte con fondo blanco
        const luminance = 25 + (controlIndex / 100) * 20;  // 25% a 45% (NUNCA sube de 45%)
        const mainColor = `hsl(${hue}, ${saturation}%, ${luminance}%)`;
        ctx.strokeStyle = mainColor;
        ctx.fillStyle = mainColor;
        
        // DEBUG: Verificar visibilidad de colores
        if (throttle > 0.1 || brake > 0.1) {
            console.log(`🎨 ${simId} COLOR: H${Math.round(hue)} S${Math.round(saturation)}% L${Math.round(luminance)}% = ${mainColor}`);
        }
        
        // 2. Definir la FORMA del trazo basado en la CALMA
        const strokeLength = 10 + (throttle * 100);
        const endX = x + Math.cos(direction) * strokeLength;
        const endY = y + Math.sin(direction) * strokeLength;
        
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // === LOGICA SIMPLIFICADA: DIRECCION DIRECTA POR VOLANTE ===
        // SteeringAngle debe ser el director principal del trazo
        const speed = rawData?.SpeedKmh || 0;
        
        // DEBUG EXTENDIDO: Verificar todas las conductoras
        if (throttle > 0.1 || brake > 0.1 || speed > 10) {
            console.log(`🎨 ${simId} ACTIVA - Pos:(${(x/this.canvas.width).toFixed(2)},${(y/this.canvas.height).toFixed(2)}) Calma:${calmIndex.toFixed(0)} Control:${controlIndex.toFixed(0)} Speed:${speed.toFixed(0)} Throttle:${throttle.toFixed(2)} Brake:${brake.toFixed(2)}`);
        }
        
        // === COLORES DINAMICOS POR MEZCLA ENTRE ARTISTAS ===
        // CORREGIR: Solo usar operaciones que mantengan visibilidad
        const artistIndex = parseInt(simId.slice(-1)) || 1; // Fallback si no se puede parsear
        
        // VERIFICAR: Asegurar que todas las conductoras sean visibles
        if (artistIndex < 1 || artistIndex > 5) {
            console.error(`❌ ÍNDICE INVÁLIDO para ${simId}: ${artistIndex}`);
            return; // Salir si el índice es inválido
        }
        
        // OPERACIONES SEGURAS: Alternar para máxima visibilidad
        const compositeOperations = ['source-over', 'source-over', 'screen', 'overlay', 'soft-light'];
        const operation = compositeOperations[(artistIndex - 1) % compositeOperations.length];
        ctx.globalCompositeOperation = operation;
        
        // DEBUG: Verificar que todas las conductoras estén activas
        if (throttle > 0.05 || brake > 0.05) {
            console.log(`🎨 ${simId} (${artistIndex}) pintando con: ${operation}`);
        }
        
        // === LOGICA PRINCIPAL SIMPLIFICADA: ACELERADOR vs FRENO ===
        
        if (throttle > 0.05) { // ACELERADOR: Controla longitud y energia del trazo
            // CORREGIR OPACIDAD: Mínimo 0.8 para visibilidad garantizada
            ctx.globalAlpha = 0.8 + (throttle * 0.2); // 0.8 a 1.0 (SIEMPRE visible)
            
            ctx.beginPath();
            ctx.moveTo(x, y);

            if (calmIndex > 85) {
                // Trazos CALMOS: Una curva suave y elegante
                const controlX = (x + endX) / 2 + Math.sin(direction) * (strokeLength / 4);
                const controlY = (y + endY) / 2 - Math.cos(direction) * (strokeLength / 4);
                ctx.quadraticCurveTo(controlX, controlY, endX, endY);
            } else if (calmIndex > 40) {
                // Trazos NORMALES: Una linea recta y decidida
                ctx.lineTo(endX, endY);
            } else {
                // Trazos ERRATICOS: Una linea temblorosa
                const segments = 10;
                for (let i = 1; i <= segments; i++) {
                    const progress = i / segments;
                    const segmentX = x + (endX - x) * progress;
                    const segmentY = y + (endY - y) * progress;
                    // El "caos" es inversamente proporcional a la calma
                    const chaos = (100 - calmIndex) / 20; 
                    ctx.lineTo(segmentX + (Math.random() - 0.5) * chaos, segmentY + (Math.random() - 0.5) * chaos);
                }
            }
            
            ctx.stroke();
            
            // Salpicaduras por velocidad alta
            if (speed > 80) {
                const splatters = Math.floor(1 + speed / 100);
                for (let s = 0; s < splatters; s++) {
                    const splatAngle = direction + (Math.sin(s * Math.PI) * 0.8);
                    const splatDist = 15 + (speed / 20);
                    const splatX = endX + Math.cos(splatAngle) * splatDist;
                    const splatY = endY + Math.sin(splatAngle) * splatDist;
                    const splatSize = 2 + (throttle * 4);
                    
                    ctx.globalAlpha = 0.4;
                    ctx.beginPath();
                    ctx.arc(splatX, splatY, splatSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
        } else if (brake > 0.05) { // FRENO: Evento de puntuacion (mancha/explosion)
            const spotSize = 5 + (brake * 15) + (size * 2);
            
            // CORREGIR OPACIDAD: Mínimo 0.8 para visibilidad garantizada
            ctx.globalAlpha = 0.8 + (brake * 0.2); // 0.8 a 1.0 (SIEMPRE visible)
            
            // Mancha principal circular
            ctx.beginPath();
            ctx.arc(x, y, spotSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Explosion direccional si freno fuerte
            if (brake > 0.7) {
                const splashLines = Math.floor(brake * 8) + 3;
                for (let i = 0; i < splashLines; i++) {
                    const angleVariation = (i - splashLines/2) * 0.3;
                    const splashAngle = direction + angleVariation;
                    const splashLength = 20 + (brake * 35);
                    
                    // CORREGIR OPACIDAD: Mínimo 0.7 para explosiones visibles
                    ctx.globalAlpha = 0.7 + (brake * 0.3); // 0.7 a 1.0
                    ctx.lineWidth = 2 + (brake * 4);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    
                    const endX = x + Math.cos(splashAngle) * splashLength;
                    const endY = y + Math.sin(splashAngle) * splashLength;
                    
                    if (calmIndex < 40) {
                        // Lineas temblorosas si esta estresada
                        const segments = 5;
                        for (let j = 1; j <= segments; j++) {
                            const progress = j / segments;
                            const segX = x + (endX - x) * progress;
                            const segY = y + (endY - y) * progress;
                            const tremor = (100 - calmIndex) / 30;
                            ctx.lineTo(segX + (Math.random() - 0.5) * tremor, segY + (Math.random() - 0.5) * tremor);
                        }
                    } else {
                        // Linea limpia si esta calmada
                        ctx.lineTo(endX, endY);
                    }
                    ctx.stroke();
                }
            }
            
        } else { // NEUTRAL: Punto sutil
            const pointSize = Math.max(3, size * 0.8); // Puntos más grandes
            
            // CORREGIR OPACIDAD: Mínimo 0.5 para puntos visibles
            ctx.globalAlpha = 0.5 + (controlIndex / 100) * 0.4; // 0.5 a 0.9 (SIEMPRE visible)
            ctx.beginPath();
            ctx.arc(x, y, pointSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Restaurar configuracion
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    paintExtremeEvent(params, extremeEvent, simId) {
        /**
         * Efectos visuales dramáticos para eventos extremos de conducción
         * Cada tipo de evento tiene su representación visual única
         */
        const { x, y, hue, saturation, luminance, direction } = params;
        const { type, intensity } = extremeEvent;
        const ctx = this.ctx;
        
        // Color base más intenso para eventos extremos
        const extremeColor = `hsl(${hue}, ${Math.min(100, saturation + 30)}%, ${Math.min(80, luminance + 20)}%)`;
        
        // Log del evento extremo cuando es significativo
        if (intensity > 0.5) { // Solo eventos intensos
            console.log(`🚨 EVENTO EXTREMO ${simId}: ${type} (intensidad: ${intensity.toFixed(2)})`);
        }
        
        switch (type) {
            case 'spin':
                this.paintSpin(x, y, extremeColor, intensity, extremeEvent, ctx, simId);
                break;
                
            case 'crash':
                this.paintCrash(x, y, extremeColor, intensity, extremeEvent, ctx, simId);
                break;
                
            case 'emergency_brake':
                this.paintEmergencyBrake(x, y, extremeColor, intensity, extremeEvent, ctx, simId);
                break;
                
            case 'correction':
                this.paintCorrection(x, y, extremeColor, intensity, extremeEvent, ctx, simId);
                break;
                
            case 'erratic':
                this.paintErratic(x, y, extremeColor, intensity, extremeEvent, ctx, simId);
                break;
                
            default:
                // Fallback a pintura normal
                this.paintMetricsStyle(params, simId);
                break;
        }
        
        // Actualizar estado del artista
        this.updateArtistStatus(simId, `⚡ ${type.toUpperCase()}!`, true);
        
        // Resetear configuración
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    paintSpin(x, y, color, intensity, event, ctx, simId) {
        /**
         * Efecto SPIN/TROMPO: Espiral dramática con salpicaduras
         */
        const direction = event.direction;
        const spiralSize = 30 + (intensity * 80); // 30-110px
        const splatters = Math.floor(3 + intensity * 8); // 3-11 salpicaduras
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2 + (intensity * 6); // 2-8px
        ctx.globalAlpha = 0.8 + (intensity * 0.2);
        
        // === ESPIRAL PRINCIPAL ===
        ctx.beginPath();
        const turns = 2 + intensity; // 2-3 vueltas
        const angleStep = (Math.PI * 2 * turns) / 50;
        
        for (let i = 0; i <= 50; i++) {
            const angle = i * angleStep * (direction === 'left' ? -1 : 1);
            const radius = (i / 50) * spiralSize;
            const spiralX = x + Math.cos(angle) * radius;
            const spiralY = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(spiralX, spiralY);
            } else {
                ctx.lineTo(spiralX, spiralY);
            }
        }
        ctx.stroke();
        
        // === SALPICADURAS RADIALES (100% basado en métricas) ===
        for (let i = 0; i < splatters; i++) {
            const angle = (i / splatters) * Math.PI * 2;
            
            // Distancia basada en velocidad y posición
            const baseDistance = 20 + (event.speed / 10);
            const variationDistance = spiralSize * (0.3 + (i % 3) * 0.2); // Variación controlada
            const distance = baseDistance + variationDistance;
            
            const splatX = x + Math.cos(angle) * distance;
            const splatY = y + Math.sin(angle) * distance;
            
            // Tamaño basado en intensidad e índice
            const splatSize = 3 + (intensity * 8) + (i % 3);
            
            // Opacidad basada en intensidad e índice
            ctx.globalAlpha = 0.6 + (intensity * 0.4) - (i * 0.05);
            ctx.beginPath();
            ctx.arc(splatX, splatY, splatSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Actualizar posición (el spin te lleva a otro lugar)
        const spinMoveX = Math.cos(Date.now() * 0.01) * 0.02;
        const spinMoveY = Math.sin(Date.now() * 0.01) * 0.02;
        this.currentPositions[simId] = {
            x: Math.max(0, Math.min(1, this.currentPositions[simId]?.x + spinMoveX || 0.5)),
            y: Math.max(0, Math.min(1, this.currentPositions[simId]?.y + spinMoveY || 0.5))
        };
    }
    
    paintCrash(x, y, color, intensity, event, ctx, simId) {
        /**
         * Efecto CRASH: Explosión radial con fragmentos
         */
        const impactSize = 25 + (intensity * 60); // 25-85px
        const fragments = Math.floor(8 + intensity * 15); // 8-23 fragmentos
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        
        // === CÍRCULO DE IMPACTO ===
        ctx.lineWidth = 3 + (intensity * 5);
        ctx.beginPath();
        ctx.arc(x, y, impactSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // === FRAGMENTOS RADIALES (100% métricas) ===
        for (let i = 0; i < fragments; i++) {
            const baseAngle = (i / fragments) * Math.PI * 2;
            const angleVariation = (event.impact_speed / 200) * (i % 2 === 0 ? 0.3 : -0.3);
            const angle = baseAngle + angleVariation;
            
            const distance = impactSize + (intensity * 40) + (i % 4) * 8;
            const fragmentLength = 10 + (intensity * 25) + ((i % 3) * 5);
            
            const startX = x + Math.cos(angle) * impactSize;
            const startY = y + Math.sin(angle) * impactSize;
            const endX = startX + Math.cos(angle) * fragmentLength;
            const endY = startY + Math.sin(angle) * fragmentLength;
            
            ctx.lineWidth = 1 + (intensity * 3) + (i % 2);
            ctx.globalAlpha = 0.7 + (intensity * 0.3) - (i * 0.02);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // === ONDAS DE CHOQUE ===
        for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = 0.3 / i;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, impactSize + (i * 15), 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    paintEmergencyBrake(x, y, color, intensity, event, ctx, simId) {
        /**
         * Efecto FRENADA DE EMERGENCIA: Líneas de humo/derrape
         */
        const skidLength = 40 + (intensity * 80); // 40-120px
        const skidLines = Math.floor(2 + intensity * 4); // 2-6 líneas
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 + (intensity * 4);
        ctx.globalAlpha = 0.8;
        
        // === LÍNEAS DE DERRAPE ===
        for (let i = 0; i < skidLines; i++) {
            const offsetY = (i - skidLines/2) * 8;
            const startX = x - skidLength;
            const startY = y + offsetY;
            const endX = x;
            const endY = y + offsetY;
            
            ctx.globalAlpha = 0.6 + (i * 0.1);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            // Línea con variación (no perfectamente recta)
            const segments = 10;
            for (let j = 1; j <= segments; j++) {
                const progress = j / segments;
                const segmentX = startX + (endX - startX) * progress;
                const segmentY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 3) * 2;
                ctx.lineTo(segmentX, segmentY);
            }
            ctx.stroke();
        }
        
        // === HUMO/PARTÍCULAS (100% métricas) ===
        const particles = Math.floor(5 + intensity * 10);
        for (let i = 0; i < particles; i++) {
            const particleX = x - (i / particles) * skidLength;
            const particleY = y + ((i % 3) - 1) * 10 + Math.sin(i) * (event.speed / 20);
            const particleSize = 1 + (intensity * 4) + (i % 2);
            
            ctx.globalAlpha = 0.4 + (intensity * 0.3) - (i * 0.03);
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    paintCorrection(x, y, color, intensity, event, ctx, simId) {
        /**
         * Efecto CONTRAVOLANTE: Zigzag violento
         */
        const zigzagLength = 30 + (intensity * 50);
        const amplitude = 10 + (intensity * 20);
        const frequency = 2 + intensity * 2;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 + (intensity * 4);
        ctx.globalAlpha = 0.8;
        
        // === ZIGZAG PRINCIPAL ===
        ctx.beginPath();
        ctx.moveTo(x - zigzagLength/2, y);
        
        const steps = 20;
        for (let i = 1; i <= steps; i++) {
            const progress = i / steps;
            const zigX = x - zigzagLength/2 + (zigzagLength * progress);
            const zigY = y + Math.sin(progress * Math.PI * frequency) * amplitude;
            ctx.lineTo(zigX, zigY);
        }
        ctx.stroke();
        
        // === LÍNEAS DE CORRECCIÓN ADICIONALES ===
        if (event.severity === 'violent') {
            for (let i = 0; i < 3; i++) {
                ctx.globalAlpha = 0.4;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - zigzagLength/2, y + (i-1)*8);
                
                for (let j = 1; j <= steps; j++) {
                    const progress = j / steps;
                    const corrX = x - zigzagLength/2 + (zigzagLength * progress);
                    const corrY = y + (i-1)*8 + Math.sin(progress * Math.PI * frequency + i) * (amplitude * 0.5);
                    ctx.lineTo(corrX, corrY);
                }
                ctx.stroke();
            }
        }
    }
    
    paintErratic(x, y, color, intensity, event, ctx, simId) {
        /**
         * Efecto ERRÁTICO: Líneas caóticas múltiples
         */
        const chaosLines = Math.floor(5 + intensity * 8); // 5-13 líneas
        const chaosRange = 20 + (intensity * 40); // 20-60px
        
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.6;
        
        // === LÍNEAS CAÓTICAS (100% métricas) ===
        for (let i = 0; i < chaosLines; i++) {
            // Ángulos basados en métricas, no aleatorios
            const startAngle = (i / chaosLines) * Math.PI * 2 + (event.chaos_level / 50) * Math.PI;
            const angleVariation = (i % 2 === 0 ? 1 : -1) * (intensity * Math.PI * 0.3);
            const endAngle = startAngle + angleVariation;
            
            const startDistance = (i % 3) * chaosRange * 0.2; // Distancias escalonadas
            const endDistance = chaosRange * 0.5 + (i % 4) * chaosRange * 0.15;
            
            const startX = x + Math.cos(startAngle) * startDistance;
            const startY = y + Math.sin(startAngle) * startDistance;
            const endX = x + Math.cos(endAngle) * endDistance;
            const endY = y + Math.sin(endAngle) * endDistance;
            
            ctx.lineWidth = 1 + (intensity * 3) + (i % 2);
            ctx.globalAlpha = 0.3 + (intensity * 0.4) - (i * 0.05);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // === PUNTOS DE TENSIÓN (100% métricas) ===
        const tensionPoints = Math.floor(3 + intensity * 5);
        for (let i = 0; i < tensionPoints; i++) {
            // Distribución radial controlada
            const pointAngle = (i / tensionPoints) * Math.PI * 2 + (intensity * Math.PI);
            const pointDistance = ((i % 3) + 1) * chaosRange / 3; // Distancias escalonadas
            const pointX = x + Math.cos(pointAngle) * pointDistance;
            const pointY = y + Math.sin(pointAngle) * pointDistance;
            const pointSize = 2 + (intensity * 4) + (i % 3);
            
            ctx.globalAlpha = 0.6 + (intensity * 0.4) - (i * 0.08);
            ctx.beginPath();
            ctx.arc(pointX, pointY, pointSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    startArtLoop() {
        const animate = () => {
            // Efecto de desvanecimiento muy sutil para que la obra persista
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = this.artConfig.fadeRate;
            this.ctx.fillStyle = '#ffffff'; // Blanco puro para exportación
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Restaurar configuración normal
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    updateArtistStatus(simId, status, active) {
        const artistItem = document.querySelector(`[data-artist="${simId}"]`);
        const paintDot = document.querySelector(`[data-sim="${simId}"]`);
        
        if (artistItem) {
            const statusEl = artistItem.querySelector('.artist-status');
            if (statusEl) {
                // Estados más artísticos basados en métricas
                if (status === 'Pintando') {
                    const actions = ['Creando trazos', 'Salpicando color', 'En acción', 'Expresándose', 'Fluyendo'];
                    // Usar hash del simId para selección consistente
                    const hash = simId.charCodeAt(simId.length - 1) % actions.length;
                    statusEl.textContent = actions[hash];
                } else if (status === 'Desconectado') {
                    statusEl.textContent = 'Pincel en reposo';
                } else {
                    statusEl.textContent = status;
                }
            }
            
            artistItem.classList.toggle('active', active);
            
            // === ACTUALIZAR COLOR DINÁMICO DEL CÍRCULO ===
            const colorDot = artistItem.querySelector('.artist-color');
            if (colorDot) {
                // Calcular el color actual incluyendo rebotes
                const baseHues = {
                    'sim_1': 200, // Azul
                    'sim_2': 120, // Verde
                    'sim_3': 50,  // Amarillo
                    'sim_4': 10,  // Rojo
                    'sim_5': 280  // Violeta
                };
                
                let currentHue = baseHues[simId] || 0;
                
                // Añadir offset de rebotes si existe
                if (this.bounceColorOffsets && this.bounceColorOffsets[simId]) {
                    currentHue += this.bounceColorOffsets[simId];
                }
                
                // Normalizar hue a 0-360°
                currentHue = currentHue % 360;
                if (currentHue < 0) currentHue += 360;
                
                // Aplicar el nuevo color
                const newColor = `hsl(${currentHue}, 70%, 50%)`;
                colorDot.style.background = newColor;
            }
        }
        
        if (paintDot) {
            paintDot.classList.toggle('painting', active);
        }
    }
    
    updateConnectionStatus(connected) {
        console.log(connected ? '✅ Arte conectado' : '❌ Arte desconectado');
    }
    
    // Métodos de control público
    togglePainting() {
        this.painting = !this.painting;
        const btn = document.querySelector('.control-btn:nth-child(3)');
        if (btn) {
            btn.innerHTML = this.painting ? '⏸️ Pausar' : '▶️ Continuar';
        }
        console.log(this.painting ? '🎨 Pintura activada' : '⏸️ Pintura pausada');
    }
    
    saveArtwork() {
        const link = document.createElement('a');
        link.download = `obra-colectiva-${new Date().toISOString().slice(0,10)}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        console.log('💾 Obra de arte guardada');
    }
}

// Inicializar aplicación
let artworkApp;

document.addEventListener('DOMContentLoaded', () => {
    artworkApp = new ArtworkEngine();
});

// Exportar para depuración
window.ArtworkEngine = ArtworkEngine;
