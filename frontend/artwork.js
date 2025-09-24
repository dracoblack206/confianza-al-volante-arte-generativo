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
            humanPaintingRate: 1000,   // 1s entre trazos - más humano
            throttleLineMode: true,    // Líneas rectas al acelerar
            brakeSpotMode: true,       // Manchas circulares al frenar
            pureMetrics: true,         // 100% basado en métricas SIMHUB
            organicMovement: true,     // NUEVO: Movimiento más orgánico
            curveIntensity: 0.3        // NUEVO: Intensidad de curvas
        };
        
        // Control de timing humano - simular 5 manos reales
        this.lastPaintTime = {};       // Último trazo por conductora
        this.paintingQueue = [];       // Cola de acciones pendientes
        this.humanTimers = {};         // Timers individuales por conductora
        
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
        
        // Posiciones fijas para que se vean las 5 conductoras claramente
        this.driverPositions = {
            sim_1: { x: 0.1, y: 0.1 },   // Esquina superior izquierda
            sim_2: { x: 0.9, y: 0.1 },   // Esquina superior derecha  
            sim_3: { x: 0.1, y: 0.9 },   // Esquina inferior izquierda
            sim_4: { x: 0.9, y: 0.9 },   // Esquina inferior derecha
            sim_5: { x: 0.5, y: 0.5 }    // Centro del canvas
        };
        
        // Posición actual de cada conductora (se mueve con telemetría)
        this.currentPositions = {
            sim_1: { x: 0.1, y: 0.1 },
            sim_2: { x: 0.9, y: 0.1 },
            sim_3: { x: 0.1, y: 0.9 },
            sim_4: { x: 0.9, y: 0.9 },
            sim_5: { x: 0.5, y: 0.5 }
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
        
        // Añadir textura muy sutil de lienzo
        this.ctx.globalAlpha = 0.02;
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.fillStyle = Math.random() > 0.5 ? '#fafafa' : '#f5f5f5';
            this.ctx.fillRect(x, y, 1, 1);
        }
        this.ctx.globalAlpha = 1;
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
        // TIMING HUMANO - Procesar cada conductora con velocidad humana realista
        for (const [simId, simData] of Object.entries(data.simulators)) {
            if (!simData.raw_data?.connected) {
                this.updateArtistStatus(simId, 'Desconectado', false);
                continue;
            }
            
            // Control de timing humano por conductora
            const now = Date.now();
            const lastPaint = this.lastPaintTime[simId] || 0;
            const timeSinceLast = now - lastPaint;
            
            // Solo pintar si ha pasado suficiente tiempo (simular mano humana)
            if (timeSinceLast >= this.artConfig.humanPaintingRate) {
                this.updateArtistStatus(simId, 'Pintando', true);
                this.paintFromDriver(simId, simData);
                this.lastPaintTime[simId] = now;
                
                // Variación humana aleatoria - a veces pintar más lento/rápido
                const randomDelay = (Math.random() - 0.5) * 50; // ±25ms de variación
                this.lastPaintTime[simId] += randomDelay;
            } else {
                // Mostrar que está "preparando el pincel"
                this.updateArtistStatus(simId, 'Preparando pincel...', true);
            }
        }
    }
    
    paintFromDriver(simId, simData) {
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
        
        // PINTURA BASADA 100% EN ACELERADOR/FRENO/VOLANTE
        this.paintMetricsStyle(realParams, simId);
        
        // Debug ocasional
        if (Math.random() < 0.1) { // Solo 10% de las veces
            console.log(`🎨 Pintando ${simId}: throttle=${realParams.throttle?.toFixed(2)}, brake=${realParams.brake?.toFixed(2)}`);
        }
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
        
        // === POSICIÓN BASADA EN POSICIÓN INICIAL + MOVIMIENTO CON VOLANTE ===
        const basePos = this.driverPositions[simId] || { x: 0.5, y: 0.5 };
        const currentPos = this.currentPositions[simId] || { x: basePos.x, y: basePos.y };
        
        // Movimiento basado SOLO en volante (sin aleatoriedad)
        const steeringMovement = steeringAngle / 45; // -1 a 1
        const speedMovement = speed / 200; // 0 a 1 normalmente
        
        // Actualizar posición actual con volante y velocidad
        let newX = currentPos.x + (steeringMovement * 0.01); // Movimiento suave
        let newY = currentPos.y + (speedMovement * 0.005); // Avance con velocidad
        
        // Mantener en límites del canvas
        newX = Math.max(0.05, Math.min(0.95, newX));
        newY = Math.max(0.05, Math.min(0.95, newY));
        
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
        
        // === SATURACIÓN BASADA EN CONTROL ===
        const saturation = 50 + (control / 100) * 50; // 50-100% según control
        
        // === LUMINOSIDAD BASADA EN VELOCIDAD ===
        const luminance = 30 + (speed / 200) * 40; // 30-70% según velocidad
        
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
            x, y, hue, saturation, luminance, size, direction,
            isAccelerating, isBraking, isCoasting,
            steeringAngle, speed, rpms, throttle, brake, gear
        } = params;
        
        const canvas = this.canvas;
        const ctx = this.ctx;
        
        // Debug pintura ocasional
        if (Math.random() < 0.05) { // Solo 5% de las veces
            console.log(`🖌️ ${simId} en (${x.toFixed(0)}, ${y.toFixed(0)}) - Accel: ${isAccelerating}, Freno: ${isBraking}`);
        }
        
        // Color principal basado en métricas
        const mainColor = `hsl(${hue}, ${saturation}%, ${luminance}%)`;
        
        ctx.globalAlpha = 0.7 + (speed / 200) * 0.3; // Opacidad según velocidad
        ctx.strokeStyle = mainColor;
        ctx.fillStyle = mainColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // === LÓGICA PRINCIPAL: ACELERADOR vs FRENO ===
        
        if (isAccelerating) {
            // === LÍNEAS MÁS ORGÁNICAS AL ACELERAR ===
            const lineLength = 15 + (throttle * 40) + (speed / 15);
            const lineWidth = 1 + (throttle * 2.5);
            
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            // Crear línea orgánica con pequeñas curvas en lugar de recta
            const segments = Math.max(2, Math.floor(lineLength / 10));
            let currentX = x;
            let currentY = y;
            
            for (let i = 0; i < segments; i++) {
                const progress = (i + 1) / segments;
                const segmentLength = lineLength / segments;
                
                // Dirección base con variación orgánica sutil
                let segmentDirection = direction;
                if (this.artConfig.organicMovement) {
                    const organicNoise = Math.sin(x * 0.02 + y * 0.02 + Date.now() * 0.0001) * 0.2;
                    segmentDirection += organicNoise * this.artConfig.curveIntensity;
                }
                
                const nextX = currentX + Math.cos(segmentDirection) * segmentLength;
                const nextY = currentY + Math.sin(segmentDirection) * segmentLength;
                
                // Usar curvas suaves
                if (i === 0) {
                    ctx.lineTo(nextX, nextY);
                } else {
                    const controlX = (currentX + nextX) / 2 + Math.sin(progress * Math.PI * 2) * 3;
                    const controlY = (currentY + nextY) / 2 + Math.cos(progress * Math.PI * 2) * 3;
                    ctx.quadraticCurveTo(controlX, controlY, nextX, nextY);
                }
                
                currentX = nextX;
                currentY = nextY;
            }
            
            ctx.stroke();
            
            // Líneas adicionales estilizadas si acelerador está muy presionado
            if (throttle > 0.7) {
                const extraLines = Math.floor(throttle * 3);
                for (let i = 0; i < extraLines; i++) {
                    const offsetAngle = direction + (i - 1) * 0.2; // Ligero offset
                    const extraEndX = x + Math.cos(offsetAngle) * lineLength * 0.8;
                    const extraEndY = y + Math.sin(offsetAngle) * lineLength * 0.8;
                    
                    ctx.globalAlpha = 0.4;
                    ctx.lineWidth = lineWidth * 0.6;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(extraEndX, extraEndY);
                    ctx.stroke();
                }
            }
            
        } else if (isBraking) {
            // === MANCHAS CIRCULARES CON GOTAS AL FRENAR ===
            const spotSize = 5 + (brake * 15) + (size * 2); // Tamaño según freno y métricas
            
            // Mancha principal circular
            ctx.globalAlpha = 0.6 + (brake * 0.4);
            ctx.beginPath();
            ctx.arc(x, y, spotSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Gotas alrededor de la mancha
            const dropCount = Math.floor(brake * 8) + 2; // Más gotas con más freno
            for (let i = 0; i < dropCount; i++) {
                const dropAngle = (i / dropCount) * Math.PI * 2;
                const dropDistance = spotSize + 10 + (brake * 20);
                const dropX = x + Math.cos(dropAngle) * dropDistance;
                const dropY = y + Math.sin(dropAngle) * dropDistance;
                const dropSize = 1 + (brake * 4);
                
                ctx.globalAlpha = 0.4 + (brake * 0.3);
                ctx.beginPath();
                ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Efecto de salpicadura direccional si freno es muy fuerte
            if (brake > 0.7) {
                const splashLines = Math.floor(brake * 5);
                for (let i = 0; i < splashLines; i++) {
                    const splashAngle = direction + (Math.random() - 0.5) * Math.PI * 0.5;
                    const splashLength = 15 + (brake * 25);
                    const splashEndX = x + Math.cos(splashAngle) * splashLength;
                    const splashEndY = y + Math.sin(splashAngle) * splashLength;
                    
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 2 + (brake * 3);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(splashEndX, splashEndY);
                    ctx.stroke();
                }
            }
            
        } else {
            // === PUNTOS SUTILES AL NO ACELERAR NI FRENAR ===
            const pointSize = Math.max(2, size * 0.7); // Punto más visible
            
            ctx.globalAlpha = 0.5 + (speed / 200) * 0.3; // Más visible
            ctx.beginPath();
            ctx.arc(x, y, pointSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Debug coast ocasional
            if (Math.random() < 0.01 && pointSize > 3) { // Solo si es punto grande
                console.log(`⚪ ${simId} Coast punto: ${pointSize.toFixed(1)}`);
            }
        }
        
        // Restaurar configuración
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
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
                // Estados más artísticos
                if (status === 'Pintando') {
                    const actions = ['Creando trazos', 'Salpicando color', 'En acción', 'Expresándose', 'Fluyendo'];
                    statusEl.textContent = actions[Math.floor(Math.random() * actions.length)];
                } else if (status === 'Desconectado') {
                    statusEl.textContent = 'Pincel en reposo';
                } else {
                    statusEl.textContent = status;
                }
            }
            
            artistItem.classList.toggle('active', active);
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
