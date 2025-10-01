/**
 * Confianza al Volante - Frontend JavaScript
 * 
 * Este script conecta con el backend vía WebSockets para recibir datos en tiempo real
 * y crear visualizaciones que muestran la fortaleza interior de cada participante.
 * 
 * Funcionalidades principales:
 * - Conexión WebSocket con reconexión automática
 * - Actualización de medidores de calma y control
 * - Creación de obra de arte colectiva en canvas
 * - Animaciones fluidas y efectos visuales
 */

class ConfianzaAlVolante {
    constructor() {
        // Configuración
        this.config = {
            websocketUrl: `ws://${window.location.host}/ws`,
            reconnectDelay: 3000,
            maxReconnectAttempts: 10
        };
        
        // Estado de la aplicación
        this.state = {
            connected: false,
            reconnectAttempts: 0,
            lastUpdate: null,
            simulators: {},
            gauges: {}
        };
        
        // Referencias del DOM
        this.elements = {};
        
        // Arte movido a página separada - /artwork
        
        // WebSocket
        this.websocket = null;
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicialización principal
     */
    async init() {
        console.log('🚀 Iniciando Confianza al Volante...');
        
        try {
            this.setupDOM();
            this.setupGauges();
            this.connectWebSocket();
            
            console.log('✅ Aplicación iniciada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
        }
    }
    
    /**
     * Configurar referencias del DOM
     */
    setupDOM() {
        // Status de conexión
        this.elements.connectionStatus = document.getElementById('connection-status');
        this.elements.statusIndicator = this.elements.connectionStatus?.querySelector('.status-indicator');
        this.elements.statusText = this.elements.connectionStatus?.querySelector('.status-text');
        
        // Métricas grupales
        this.elements.groupCalm = document.getElementById('group-calm');
        this.elements.groupControl = document.getElementById('group-control');
        this.elements.groupHarmony = document.getElementById('group-harmony');
        this.elements.collectiveStrength = document.getElementById('collective-strength');
        this.elements.connectedCount = document.getElementById('connected-count');
        
        // Referencias por simulador
        for (let i = 1; i <= 5; i++) {
            const simId = `sim_${i}`;
            this.elements[simId] = {
                container: document.getElementById(`sim-${i}`),
                calmValue: document.getElementById(`calm-value-${i}`),
                controlValue: document.getElementById(`control-value-${i}`),
                speedReal: document.getElementById(`speed-real-${i}`),
                speedNorm: document.getElementById(`speed-norm-${i}`),
                rpmsReal: document.getElementById(`rpms-real-${i}`),
                rpmsNorm: document.getElementById(`rpms-norm-${i}`),
                throttleBrake: document.getElementById(`throttle-brake-${i}`),
                connectionDot: document.querySelector(`#sim-${i} .connection-dot`)
            };
        }
    }
    
    
    /**
     * Configurar medidores (gauges)
     */
    setupGauges() {
        // Configuración base para gauges
        const gaugeConfig = {
            lines: 12,
            angle: 0.15,
            lineWidth: 0.15,
            pointer: {
                length: 0.6,
                strokeWidth: 0.05,
                color: '#ffffff'
            },
            limitMax: false,
            limitMin: false,
            colorStart: '#3b82f6', // Azul calma
            colorStop: '#8b5cf6',  // Púrpura control
            strokeColor: '#2d3748',
            generateGradient: true,
            highDpiSupport: true,
            staticZones: [
                {strokeStyle: '#ef4444', min: 0, max: 30},     // Rojo (bajo)
                {strokeStyle: '#f97316', min: 30, max: 60},    // Naranja (medio)
                {strokeStyle: '#10b981', min: 60, max: 100}    // Verde (alto)
            ]
        };
        
        // Crear gauges para cada simulador
        for (let i = 1; i <= 5; i++) {
            const simId = `sim_${i}`;
            
            // Gauge de Calma
            const calmCanvas = document.getElementById(`calm-gauge-${i}`);
            if (calmCanvas) {
                const calmGauge = new Gauge(calmCanvas).setOptions(gaugeConfig);
                calmGauge.maxValue = 100;
                calmGauge.setMinValue(0);
                calmGauge.animationSpeed = 32;
                calmGauge.set(50);
                
                this.state.gauges[`${simId}_calm`] = calmGauge;
            }
            
            // Gauge de Control
            const controlCanvas = document.getElementById(`control-gauge-${i}`);
            if (controlCanvas) {
                const controlGauge = new Gauge(controlCanvas).setOptions(gaugeConfig);
                controlGauge.maxValue = 100;
                controlGauge.setMinValue(0);
                controlGauge.animationSpeed = 32;
                controlGauge.set(50);
                
                this.state.gauges[`${simId}_control`] = controlGauge;
            }
        }
    }
    
    /**
     * Conectar WebSocket
     */
    connectWebSocket() {
        // Verificar si ya hay una conexión WebSocket global activa
        if (window.globalWebSocket && window.globalWebSocket.readyState === WebSocket.OPEN) {
            console.log('🔄 Reutilizando WebSocket global existente');
            this.websocket = window.globalWebSocket;
            this.state.connected = true;
            this.updateConnectionStatus(true);
            return;
        }
        
        try {
            console.log(`🔌 Conectando a WebSocket: ${this.config.websocketUrl}`);
            
            this.websocket = new WebSocket(this.config.websocketUrl);
            window.globalWebSocket = this.websocket; // Guardar globalmente
            
            this.websocket.onopen = (event) => {
                console.log('✅ WebSocket conectado');
                this.state.connected = true;
                this.state.reconnectAttempts = 0;
                this.updateConnectionStatus(true);
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('❌ Error parseando mensaje WebSocket:', error);
                }
            };
            
            this.websocket.onclose = (event) => {
                console.log('🔌 WebSocket desconectado');
                this.state.connected = false;
                this.updateConnectionStatus(false);
                
                // Limpiar referencia global
                if (window.globalWebSocket === this.websocket) {
                    window.globalWebSocket = null;
                }
                
                // Solo reconectar si no fue navegación
                if (!event.wasClean) {
                    this.scheduleReconnect();
                }
            };
            
            this.websocket.onerror = (error) => {
                console.error('❌ Error en WebSocket:', error);
                this.updateConnectionStatus(false, 'Error de conexión');
            };
            
        } catch (error) {
            console.error('❌ Error creando WebSocket:', error);
            this.scheduleReconnect();
        }
    }
    
    /**
     * Programar reconexión automática
     */
    scheduleReconnect() {
        if (this.state.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error('❌ Máximo de intentos de reconexión alcanzado');
            this.updateConnectionStatus(false, 'Sin conexión');
            return;
        }
        
        this.state.reconnectAttempts++;
        const delay = this.config.reconnectDelay * this.state.reconnectAttempts;
        
        console.log(`🔄 Reintentando conexión en ${delay/1000}s (intento ${this.state.reconnectAttempts})`);
        this.updateConnectionStatus(false, `Reconectando... (${this.state.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connectWebSocket();
        }, delay);
    }
    
    /**
     * Manejar mensajes del WebSocket
     */
    handleWebSocketMessage(data) {
        // Actualizar estado
        this.state.lastUpdate = Date.now();
        
        // Mensaje de conexión inicial
        if (data.type === 'connection_established') {
            console.log('🎉 Conexión establecida:', data.message);
            
            // Si es modo demo, mostrar indicador
            if (data.demo_mode) {
                this.showDemoMode();
            }
            return;
        }
        
        // Datos de telemetría
        if (data.simulators) {
            this.updateDashboard(data);
        }
    }
    
    /**
     * Actualizar dashboard con nuevos datos
     */
    updateDashboard(data) {
        // Actualizar métricas grupales
        if (data.summary) {
            this.updateGroupMetrics(data.summary);
        }
        
        // Actualizar simuladores individuales
        if (data.simulators) {
            for (const [simId, simData] of Object.entries(data.simulators)) {
                this.updateSimulator(simId, simData);
            }
        }
    }
    
    /**
     * Actualizar métricas grupales
     */
    updateGroupMetrics(summary) {
        if (this.elements.groupCalm) {
            this.elements.groupCalm.textContent = Math.round(summary.group_calm_avg || 50);
        }
        
        if (this.elements.groupControl) {
            this.elements.groupControl.textContent = Math.round(summary.group_control_avg || 50);
        }
        
        if (this.elements.groupHarmony) {
            this.elements.groupHarmony.textContent = Math.round(summary.group_calm_harmony || 50);
        }
        
        if (this.elements.collectiveStrength) {
            this.elements.collectiveStrength.textContent = Math.round(summary.collective_strength || 50);
        }
        
        if (this.elements.connectedCount) {
            this.elements.connectedCount.textContent = summary.connected_drivers || 0;
        }
    }
    
    /**
     * Actualizar un simulador individual
     */
    updateSimulator(simId, simData) {
        const elements = this.elements[simId];
        if (!elements) return;
        
        const rawData = simData.raw_data || {};
        const metrics = simData.metrics || {};
        const connected = rawData.connected || false;
        
        // Actualizar estado de conexión
        if (elements.connectionDot) {
            elements.connectionDot.classList.toggle('connected', connected);
        }
        
        if (elements.container) {
            elements.container.classList.toggle('connected', connected);
            elements.container.classList.toggle('disconnected', !connected);
        }
        
        // Actualizar métricas
        const calmIndex = metrics.calm_index || 50;
        const controlIndex = metrics.control_index || 50;
        
        if (elements.calmValue) {
            elements.calmValue.textContent = Math.round(calmIndex);
        }
        
        if (elements.controlValue) {
            elements.controlValue.textContent = Math.round(controlIndex);
        }
        
        // Actualizar gauges
        const calmGauge = this.state.gauges[`${simId}_calm`];
        const controlGauge = this.state.gauges[`${simId}_control`];
        
        if (calmGauge) {
            calmGauge.set(calmIndex);
        }
        
        if (controlGauge) {
            controlGauge.set(controlIndex);
        }
        
        // Actualizar telemetría - DATOS DUALES (real → normalizado)
        const rawGameData = rawData.raw_game_data || {};
        
        // Velocidad real vs normalizada
        if (elements.speedReal) {
            elements.speedReal.textContent = `${Math.round(rawGameData.SpeedKmh || 0)} km/h`;
        }
        if (elements.speedNorm) {
            elements.speedNorm.textContent = `${Math.round(rawData.SpeedKmh || 0)} km/h`;
        }
        
        // RPMs reales vs normalizados
        if (elements.rpmsReal) {
            elements.rpmsReal.textContent = Math.round(rawGameData.Rpms || 0);
        }
        if (elements.rpmsNorm) {
            elements.rpmsNorm.textContent = Math.round(rawData.Rpms || 0);
        }
        
        // Throttle y Brake
        if (elements.throttleBrake) {
            const throttle = Math.round((rawData.Throttle || 0) * 100);
            const brake = Math.round((rawData.Brake || 0) * 100);
            elements.throttleBrake.textContent = `${throttle}% / ${brake}%`;
        }
    }
    
    /**
     * Actualizar estado de conexión en UI
     */
    updateConnectionStatus(connected, customMessage = null) {
        if (!this.elements.statusIndicator || !this.elements.statusText) return;
        
        this.elements.statusIndicator.classList.toggle('connected', connected);
        
        let message = customMessage;
        if (!message) {
            message = connected ? 'Conectado' : 'Desconectado';
        }
        
        this.elements.statusText.textContent = message;
    }
    
    /**
     * Mostrar indicador de modo demo
     */
    showDemoMode() {
        // Añadir indicador visual de modo demo
        const header = document.querySelector('.header-content');
        if (header && !header.querySelector('.demo-indicator')) {
            const demoIndicator = document.createElement('div');
            demoIndicator.className = 'demo-indicator';
            demoIndicator.innerHTML = '🎮 MODO DEMO - Datos Simulados';
            demoIndicator.style.cssText = `
                background: linear-gradient(135deg, #f59e0b, #ec4899);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 600;
                margin-top: 1rem;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
                animation: pulse 2s infinite;
            `;
            header.appendChild(demoIndicator);
        }
        
        console.log('🎮 MODO DEMO ACTIVADO - Usando datos simulados');
    }
    
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.confianzaApp = new ConfianzaAlVolante();
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('❌ Error global:', event.error);
});

// Exportar para depuración
window.ConfianzaAlVolante = ConfianzaAlVolante;
