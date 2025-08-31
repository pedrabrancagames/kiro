/**
 * Sistema de Indicadores Visuais Dinâmicos para Ghostbusters AR
 * Gerencia animações e feedback visual para inventário, proximidade e estados do jogo
 */

class DynamicIndicators {
    constructor() {
        this.inventoryBadge = null;
        this.inventoryIcon = null;
        this.distanceInfo = null;
        this.protonPackIcon = null;
        
        this.currentInventoryState = 'normal'; // normal, warning, full, critical
        this.proximityLevel = 0; // 0-100
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.findElements();
        this.setupStyles();
        this.setupObservers();
        this.isInitialized = true;
        console.log('🎯 Sistema de indicadores dinâmicos inicializado');
    }

    /**
     * Encontra elementos DOM necessários
     */
    findElements() {
        this.inventoryBadge = document.getElementById('inventory-badge');
        this.inventoryIcon = document.getElementById('inventory-icon-container');
        this.distanceInfo = document.getElementById('distance-info');
        this.protonPackIcon = document.getElementById('proton-pack-icon');
        
        if (!this.inventoryBadge) {
            console.warn('⚠️ Elemento inventory-badge não encontrado');
        }
    }

    /**
     * Configura estilos CSS dinâmicos
     */
    setupStyles() {
        // Adicionar estilos CSS se não existirem
        if (!document.getElementById('dynamic-indicators-styles')) {
            const style = document.createElement('style');
            style.id = 'dynamic-indicators-styles';
            style.textContent = `
                /* Animações do Badge do Inventário */
                .inventory-badge-normal {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    transform: scale(1);
                    transition: all 0.3s ease;
                }

                .inventory-badge-warning {
                    background: linear-gradient(135deg, #FF9800, #f57c00);
                    animation: gentle-pulse 2s ease-in-out infinite;
                }

                .inventory-badge-full {
                    background: linear-gradient(135deg, #F44336, #d32f2f);
                    animation: urgent-pulse 1s ease-in-out infinite;
                    box-shadow: 0 0 20px rgba(244, 67, 54, 0.6);
                }

                .inventory-badge-critical {
                    background: linear-gradient(135deg, #9C27B0, #7b1fa2);
                    animation: critical-flash 0.5s ease-in-out infinite;
                    box-shadow: 0 0 30px rgba(156, 39, 176, 0.8);
                }

                /* Animações do Ícone do Inventário */
                .inventory-icon-shake {
                    animation: shake 0.5s ease-in-out;
                }

                .inventory-icon-bounce {
                    animation: bounce 0.6s ease-in-out;
                }

                /* Indicadores de Proximidade */
                .proximity-none {
                    opacity: 0.6;
                    transform: scale(1);
                }

                .proximity-far {
                    opacity: 0.8;
                    animation: slow-pulse 3s ease-in-out infinite;
                }

                .proximity-medium {
                    opacity: 0.9;
                    animation: medium-pulse 2s ease-in-out infinite;
                    color: #FF9800;
                }

                .proximity-close {
                    opacity: 1;
                    animation: fast-pulse 1s ease-in-out infinite;
                    color: #F44336;
                    text-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
                }

                .proximity-very-close {
                    opacity: 1;
                    animation: urgent-glow 0.5s ease-in-out infinite;
                    color: #E91E63;
                    text-shadow: 0 0 15px rgba(233, 30, 99, 0.8);
                    font-weight: bold;
                }

                /* Keyframes */
                @keyframes gentle-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }

                @keyframes urgent-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                @keyframes critical-flash {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes slow-pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }

                @keyframes medium-pulse {
                    0%, 100% { opacity: 0.9; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.02); }
                }

                @keyframes fast-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }

                @keyframes urgent-glow {
                    0%, 100% { 
                        opacity: 1; 
                        transform: scale(1);
                        filter: brightness(1);
                    }
                    50% { 
                        opacity: 0.9; 
                        transform: scale(1.08);
                        filter: brightness(1.2);
                    }
                }

                /* Responsividade para animações reduzidas */
                @media (prefers-reduced-motion: reduce) {
                    .inventory-badge-warning,
                    .inventory-badge-full,
                    .inventory-badge-critical,
                    .proximity-far,
                    .proximity-medium,
                    .proximity-close,
                    .proximity-very-close {
                        animation: none !important;
                    }
                    
                    .inventory-badge-full {
                        background: #F44336;
                        box-shadow: 0 0 5px rgba(244, 67, 54, 0.3);
                    }
                    
                    .inventory-badge-critical {
                        background: #9C27B0;
                        box-shadow: 0 0 5px rgba(156, 39, 176, 0.3);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Configura observadores para mudanças automáticas
     */
    setupObservers() {
        // Observer para mudanças no inventário
        if (this.inventoryBadge) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        this.updateInventoryIndicator();
                    }
                });
            });

            observer.observe(this.inventoryBadge, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }

    /**
     * Atualiza indicador do inventário baseado no estado atual
     */
    updateInventoryIndicator(currentCount = null, maxCount = null) {
        if (!this.inventoryBadge) return;

        // Extrair números do texto do badge se não fornecidos
        if (currentCount === null || maxCount === null) {
            const badgeText = this.inventoryBadge.textContent || '0/5';
            const [current, max] = badgeText.split('/').map(n => parseInt(n) || 0);
            currentCount = current;
            maxCount = max;
        }

        const percentage = (currentCount / maxCount) * 100;
        let newState = 'normal';

        // Determinar estado baseado na porcentagem
        if (percentage >= 100) {
            newState = 'full';
        } else if (percentage >= 80) {
            newState = 'warning';
        } else if (percentage >= 120) { // Caso especial para overflow
            newState = 'critical';
        }

        this.setInventoryState(newState, currentCount, maxCount);
    }

    /**
     * Define o estado visual do inventário
     */
    setInventoryState(state, currentCount = 0, maxCount = 5) {
        if (!this.inventoryBadge || this.currentInventoryState === state) return;

        // Remover classes anteriores
        this.inventoryBadge.classList.remove(
            'inventory-badge-normal',
            'inventory-badge-warning', 
            'inventory-badge-full',
            'inventory-badge-critical'
        );

        // Adicionar nova classe
        this.inventoryBadge.classList.add(`inventory-badge-${state}`);
        this.currentInventoryState = state;

        // Animação do ícone baseada no estado
        if (this.inventoryIcon) {
            if (state === 'full') {
                this.inventoryIcon.classList.add('inventory-icon-shake');
                setTimeout(() => {
                    this.inventoryIcon.classList.remove('inventory-icon-shake');
                }, 500);
            } else if (state === 'warning') {
                this.inventoryIcon.classList.add('inventory-icon-bounce');
                setTimeout(() => {
                    this.inventoryIcon.classList.remove('inventory-icon-bounce');
                }, 600);
            }
        }

        // Log para debug
        console.log(`🎯 Estado do inventário: ${state} (${currentCount}/${maxCount})`);

        // Feedback tátil para estados críticos
        if ((state === 'full' || state === 'critical') && 'vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    /**
     * Atualiza indicadores de proximidade de fantasmas
     */
    updateProximityIndicator(distance, maxDistance = 100) {
        if (!this.distanceInfo) return;

        // Calcular nível de proximidade (0-100)
        const proximityPercentage = Math.max(0, Math.min(100, 
            ((maxDistance - distance) / maxDistance) * 100
        ));

        let proximityClass = 'proximity-none';

        if (proximityPercentage > 80) {
            proximityClass = 'proximity-very-close';
        } else if (proximityPercentage > 60) {
            proximityClass = 'proximity-close';
        } else if (proximityPercentage > 30) {
            proximityClass = 'proximity-medium';
        } else if (proximityPercentage > 10) {
            proximityClass = 'proximity-far';
        }

        // Remover classes anteriores
        this.distanceInfo.classList.remove(
            'proximity-none',
            'proximity-far',
            'proximity-medium', 
            'proximity-close',
            'proximity-very-close'
        );

        // Adicionar nova classe
        this.distanceInfo.classList.add(proximityClass);

        // Atualizar nível interno
        this.proximityLevel = proximityPercentage;

        // Feedback tátil para proximidade muito alta
        if (proximityPercentage > 90 && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }

        console.log(`👻 Proximidade: ${proximityPercentage.toFixed(1)}% - ${proximityClass}`);
    }

    /**
     * Mostra indicador de captura em progresso
     */
    showCaptureIndicator(progress = 0) {
        if (!this.protonPackIcon) return;

        // Adicionar classe de captura se não existir
        if (!this.protonPackIcon.classList.contains('capturing')) {
            this.protonPackIcon.classList.add('capturing');
        }

        // Atualizar intensidade baseada no progresso
        const intensity = Math.min(1, progress / 100);
        this.protonPackIcon.style.filter = `brightness(${1 + intensity * 0.5}) saturate(${1 + intensity})`;
    }

    /**
     * Remove indicador de captura
     */
    hideCaptureIndicator() {
        if (!this.protonPackIcon) return;

        this.protonPackIcon.classList.remove('capturing');
        this.protonPackIcon.style.filter = '';
    }

    /**
     * Mostra celebração visual temporária
     */
    showSuccessIndicator(type = 'capture') {
        const indicators = {
            capture: { color: '#4CAF50', duration: 2000 },
            deposit: { color: '#2196F3', duration: 1500 },
            unlock: { color: '#FF9800', duration: 3000 }
        };

        const config = indicators[type] || indicators.capture;

        // Criar elemento de celebração temporário
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: ${config.color};
            opacity: 0;
            pointer-events: none;
            z-index: 99999;
            box-shadow: 0 0 50px ${config.color};
        `;

        document.body.appendChild(celebration);

        // Animar celebração
        celebration.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0)' },
            { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1.5)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(2)' }
        ], {
            duration: config.duration,
            easing: 'ease-out'
        }).onfinish = () => {
            celebration.remove();
        };

        console.log(`🎉 Indicador de sucesso: ${type}`);
    }

    /**
     * Reseta todos os indicadores para estado normal
     */
    resetAllIndicators() {
        this.setInventoryState('normal');
        this.hideCaptureIndicator();
        
        if (this.distanceInfo) {
            this.distanceInfo.classList.remove(
                'proximity-far', 'proximity-medium', 
                'proximity-close', 'proximity-very-close'
            );
            this.distanceInfo.classList.add('proximity-none');
        }

        console.log('🔄 Todos os indicadores resetados');
    }

    /**
     * Obtém estado atual do sistema
     */
    getStatus() {
        return {
            inventoryState: this.currentInventoryState,
            proximityLevel: this.proximityLevel,
            isInitialized: this.isInitialized
        };
    }
}

// Inicializar sistema
let dynamicIndicators;

function initDynamicIndicators() {
    if (!dynamicIndicators) {
        dynamicIndicators = new DynamicIndicators();
        window.dynamicIndicators = dynamicIndicators;
        console.log('DynamicIndicators inicializado:', dynamicIndicators);
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicIndicators);
} else {
    setTimeout(initDynamicIndicators, 100);
}

// Também inicializar quando janela carregar
window.addEventListener('load', initDynamicIndicators);

// Inicializar imediatamente
setTimeout(initDynamicIndicators, 0);

// Exportar para uso global
window.DynamicIndicators = DynamicIndicators;

// Funções globais de conveniência
window.updateInventoryIndicator = function(current, max) {
    if (window.dynamicIndicators) {
        window.dynamicIndicators.updateInventoryIndicator(current, max);
    }
};

window.updateProximityIndicator = function(distance, maxDistance) {
    if (window.dynamicIndicators) {
        window.dynamicIndicators.updateProximityIndicator(distance, maxDistance);
    }
};

window.showSuccessIndicator = function(type) {
    if (window.dynamicIndicators) {
        window.dynamicIndicators.showSuccessIndicator(type);
    }
};