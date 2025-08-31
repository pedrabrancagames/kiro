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
        console.log('Sistema de animações inicializado');
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
        if (!element || this.isReducedMotion) return;

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
            error: [200, 100, 200, 100, 200]
        };

        const pattern = patterns[type] || patterns.light;
        navigator.vibrate(pattern);
    }
}

// Inicializar o sistema de animações quando o DOM estiver pronto
let animationManager;

document.addEventListener('DOMContentLoaded', () => {
    animationManager = new AnimationManager();
});

// Exportar para uso global
window.AnimationManager = AnimationManager;
window.animationManager = animationManager;