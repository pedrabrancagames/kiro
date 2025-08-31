/**
 * Sistema de Animações para Ghostbusters AR
 * Gerencia todas as animações da interface do usuário
 */

class AnimationManager {
    constructor() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        this.setupButtonAnimations();
        this.setupModalAnimations();
        this.setupHoverEffects();
        this.setupContextualHaptics();
        this.captureHapticInterval = null;
        // this.createTestButton(); // Botão de teste removido
        console.log('Sistema de animações e feedback tátil inicializado');
    }

    /**
     * Cria um botão de teste para verificar animações (temporário)
     */
    createTestButton() {
        const testButton = document.createElement('button');
        testButton.id = 'animation-test-button';
        testButton.textContent = 'TESTE ANIMAÇÃO';
        testButton.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 9999;
            padding: 10px 20px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        testButton.addEventListener('click', () => {
            console.log('Botão de teste clicado!');
            this.triggerHapticFeedback('medium');
            testButton.classList.add('animate-button-press');
            setTimeout(() => {
                testButton.classList.remove('animate-button-press');
            }, 150);
        });

        document.body.appendChild(testButton);
        this.addButtonAnimation(testButton);
        console.log('Botão de teste criado');
    }

    /**
     * Configura animações para todos os botões
     */
    setupButtonAnimations() {
        // Botões de ação
        const actionButtons = document.querySelectorAll('.action-button');
        actionButtons.forEach(button => {
            this.addButtonAnimation(button);
        });

        // Botões de localização
        const locationButtons = document.querySelectorAll('.location-button');
        locationButtons.forEach(button => {
            this.addButtonAnimation(button);
        });

        // Ícones interativos
        const interactiveElements = [
            '#inventory-icon-container',
            '#proton-pack-icon',
            '#close-inventory-button',
            '#close-scanner-button',
            '#notification-close-button'
        ];

        interactiveElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                this.addButtonAnimation(element);
            }
        });
    }

    /**
     * Adiciona animação de clique a um elemento
     */
    addButtonAnimation(element) {
        if (!element || this.isReducedMotion) {
            return;
        }

        element.addEventListener('mousedown', () => {
            element.classList.add('animate-button-press');
        });

        element.addEventListener('mouseup', () => {
            setTimeout(() => {
                element.classList.remove('animate-button-press');
            }, 150);
        });

        element.addEventListener('mouseleave', () => {
            element.classList.remove('animate-button-press');
        });

        // Suporte para touch
        element.addEventListener('touchstart', () => {
            element.classList.add('animate-button-press');
        });

        element.addEventListener('touchend', () => {
            setTimeout(() => {
                element.classList.remove('animate-button-press');
            }, 150);
        });

        // Adicionar classe para transições suaves
        element.classList.add('smooth-transition');
    }

    /**
     * Configura animações para modais
     */
    setupModalAnimations() {
        // Observar mudanças na classe 'hidden' dos modais
        const modals = [
            '#inventory-modal',
            '#qr-scanner-screen',
            '#notification-modal'
        ];

        modals.forEach(selector => {
            const modal = document.querySelector(selector);
            if (modal) {
                this.observeModalVisibility(modal);
            }
        });
    }

    /**
     * Observa mudanças de visibilidade em modais
     */
    observeModalVisibility(modal) {
        if (this.isReducedMotion) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isHidden = modal.classList.contains('hidden');
                    
                    if (!isHidden && !modal.classList.contains('animate-modal-in')) {
                        // Modal está sendo mostrado
                        modal.classList.add('animate-modal-in');
                        modal.classList.remove('animate-modal-out');
                    }
                }
            });
        });

        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }

    /**
     * Configura efeitos de hover
     */
    setupHoverEffects() {
        if (this.isReducedMotion) return;

        // Adicionar classe smooth-transition a elementos que precisam
        const elementsToSmooth = [
            '.action-button',
            '.location-button',
            '#inventory-icon-container',
            '#proton-pack-icon',
            '#close-inventory-button',
            '#close-scanner-button'
        ];

        elementsToSmooth.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.add('smooth-transition');
            });
        });
    }

    /**
     * Anima transição entre telas
     */
    animateScreenTransition(fromScreen, toScreen, direction = 'right') {
        if (this.isReducedMotion) {
            fromScreen.classList.add('hidden');
            toScreen.classList.remove('hidden');
            return;
        }

        // Animar saída da tela atual
        if (direction === 'right') {
            fromScreen.classList.add('animate-slide-out');
        } else {
            fromScreen.classList.add('animate-fade-out');
        }

        setTimeout(() => {
            fromScreen.classList.add('hidden');
            fromScreen.classList.remove('animate-slide-out', 'animate-fade-out');
            
            // Animar entrada da nova tela
            toScreen.classList.remove('hidden');
            if (direction === 'right') {
                toScreen.classList.add('animate-slide-in');
            } else {
                toScreen.classList.add('animate-fade-in');
            }

            setTimeout(() => {
                toScreen.classList.remove('animate-slide-in', 'animate-fade-in');
            }, 400);
        }, 300);
    }

    /**
     * Anima elemento com efeito de pulso
     */
    addPulseAnimation(element) {
        if (this.isReducedMotion) return;
        
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.add('animate-pulse');
        }
    }

    /**
     * Remove animação de pulso
     */
    removePulseAnimation(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.remove('animate-pulse');
        }
    }

    /**
     * Anima elemento com efeito de brilho
     */
    addGlowAnimation(element) {
        if (this.isReducedMotion) return;
        
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.add('animate-glow');
        }
    }

    /**
     * Remove animação de brilho
     */
    removeGlowAnimation(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.remove('animate-glow');
        }
    }

    /**
     * Anima fade in de um elemento
     */
    fadeIn(element, callback) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;

        if (this.isReducedMotion) {
            element.style.opacity = '1';
            if (callback) callback();
            return;
        }

        element.classList.add('animate-fade-in');
        
        if (callback) {
            setTimeout(callback, 300);
        }
        
        setTimeout(() => {
            element.classList.remove('animate-fade-in');
        }, 300);
    }

    /**
     * Anima fade out de um elemento
     */
    fadeOut(element, callback) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;

        if (this.isReducedMotion) {
            element.style.opacity = '0';
            if (callback) callback();
            return;
        }

        element.classList.add('animate-fade-out');
        
        setTimeout(() => {
            element.classList.remove('animate-fade-out');
            if (callback) callback();
        }, 300);
    }

    /**
     * Trigger para feedback tátil (vibração)
     */
    triggerHapticFeedback(type = 'light') {
        if (!navigator.vibrate) return;

        const patterns = {
            light: 50,
            medium: 100,
            heavy: 200,
            success: [100, 50, 100],
            error: [200, 100, 200, 100, 200],
            capture_start: [50, 30, 50],
            capture_progress: 30,
            capture_success: [150, 50, 150, 50, 150],
            ghost_nearby: [80, 40, 80],
            inventory_full: [200, 100, 200],
            button_press: 40,
            modal_open: 60,
            notification: 80,
            ar_enter: [100, 50, 100, 50, 100]
        };

        const pattern = patterns[type] || patterns.light;
        navigator.vibrate(pattern);
    }

    /**
     * Sistema de feedback tátil contextual
     */
    setupContextualHaptics() {
        // Feedback para diferentes contextos do jogo
        this.hapticContexts = {
            ui: ['button_press', 'modal_open', 'notification'],
            gameplay: ['capture_start', 'capture_progress', 'capture_success', 'ghost_nearby'],
            system: ['success', 'error', 'inventory_full', 'ar_enter']
        };
    }

    /**
     * Feedback tátil para captura de fantasma
     */
    startCaptureHaptics() {
        if (!navigator.vibrate) return;
        
        // Apenas vibração inicial ao começar captura (sem vibração contínua para economizar bateria)
        this.triggerHapticFeedback('capture_start');
        
        // Vibração contínua removida para economizar bateria do celular
        // this.captureHapticInterval = setInterval(() => {
        //     this.triggerHapticFeedback('capture_progress');
        // }, 500);
    }

    /**
     * Para feedback tátil de captura
     */
    stopCaptureHaptics() {
        // Método mantido para compatibilidade, mas sem intervalo para limpar
        if (this.captureHapticInterval) {
            clearInterval(this.captureHapticInterval);
            this.captureHapticInterval = null;
        }
    }

    /**
     * Feedback tátil para sucesso de captura
     */
    captureSuccessHaptics() {
        this.stopCaptureHaptics();
        this.triggerHapticFeedback('capture_success');
    }

    /**
     * Feedback tátil para proximidade de fantasma
     */
    ghostNearbyHaptics() {
        this.triggerHapticFeedback('ghost_nearby');
    }

    /**
     * Feedback tátil para inventário cheio
     */
    inventoryFullHaptics() {
        this.triggerHapticFeedback('inventory_full');
    }

    /**
     * Feedback tátil para entrada no AR
     */
    arEnterHaptics() {
        this.triggerHapticFeedback('ar_enter');
    }

    /**
     * Adiciona efeito visual de press com feedback tátil
     */
    addHapticPressEffect(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element && !this.isReducedMotion) {
            element.classList.add('haptic-press');
            setTimeout(() => {
                element.classList.remove('haptic-press');
            }, 150);
        }
    }

    /**
     * Adiciona efeito visual de sucesso com feedback tátil
     */
    addHapticSuccessEffect(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element && !this.isReducedMotion) {
            element.classList.add('haptic-success');
            setTimeout(() => {
                element.classList.remove('haptic-success');
            }, 600);
        }
    }

    /**
     * Adiciona efeito visual de erro com feedback tátil
     */
    addHapticErrorEffect(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element && !this.isReducedMotion) {
            element.classList.add('haptic-error');
            setTimeout(() => {
                element.classList.remove('haptic-error');
            }, 500);
        }
    }

    /**
     * Ativa estado visual de captura
     */
    setCapturingState(active = true) {
        const protonPackIcon = document.querySelector('#proton-pack-icon');
        if (protonPackIcon) {
            if (active) {
                protonPackIcon.classList.add('capturing');
            } else {
                protonPackIcon.classList.remove('capturing');
            }
        }
    }

    /**
     * Ativa estado visual de inventário cheio
     */
    setInventoryFullState(full = true) {
        const inventoryBadge = document.querySelector('#inventory-badge');
        if (inventoryBadge) {
            if (full) {
                inventoryBadge.classList.add('full');
            } else {
                inventoryBadge.classList.remove('full');
            }
        }
    }

    /**
     * Ativa estado visual de fantasma próximo
     */
    setGhostNearbyState(nearby = true) {
        const distanceInfo = document.querySelector('#distance-info');
        if (distanceInfo) {
            if (nearby) {
                distanceInfo.classList.add('ghost-nearby');
            } else {
                distanceInfo.classList.remove('ghost-nearby');
            }
        }
    }
}

// Inicializar o sistema de animações
let animationManager;

function initAnimationManager() {
    if (!animationManager) {
        animationManager = new AnimationManager();
        window.animationManager = animationManager;
        console.log('AnimationManager inicializado:', animationManager);
    }
}

// Tentar inicializar imediatamente se DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimationManager);
} else {
    // DOM já está pronto
    initAnimationManager();
}

// Também tentar inicializar quando a janela carregar completamente
window.addEventListener('load', initAnimationManager);

// Exportar para uso global
window.AnimationManager = AnimationManager;