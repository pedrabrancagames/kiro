/**
 * Sistema Avançado de Animações da Barra de Progresso
 * Gerencia animações fluidas, efeitos visuais e transições suaves
 */
class ProgressBarAnimations {
    constructor() {
        this.progressBar = null;
        this.progressFill = null;
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.animationFrame = null;
        this.isAnimating = false;
        this.startTime = 0;
        this.duration = 0;
        this.onComplete = null;
        this.onUpdate = null;
        this.state = 'hidden'; // hidden, showing, active, completing, hiding
        
        this.init();
        console.log('Sistema de animações da barra de progresso inicializado');
    }

    init() {
        this.progressBar = document.getElementById('proton-pack-progress-bar');
        this.progressFill = document.getElementById('proton-pack-progress-fill');
        
        if (!this.progressBar || !this.progressFill) {
            console.error('Elementos da barra de progresso não encontrados');
            return;
        }

        // Configurar estado inicial
        this.reset();
    }

    /**
     * Inicia a animação da barra de progresso
     */
    startProgress(duration = 3000, onComplete = null, onUpdate = null) {
        if (!this.progressBar || !this.progressFill) return;

        console.log('Iniciando animação da barra de progresso');
        
        this.duration = duration;
        this.onComplete = onComplete;
        this.onUpdate = onUpdate;
        this.startTime = Date.now();
        this.currentProgress = 0;
        this.targetProgress = 100;
        this.state = 'showing';

        // Mostrar barra com animação de entrada
        this.showProgressBar();
        
        // Iniciar animação do progresso
        setTimeout(() => {
            this.state = 'active';
            this.animate();
        }, 300); // Aguardar animação de entrada
    }

    /**
     * Mostra a barra de progresso com animação suave
     */
    showProgressBar() {
        this.progressBar.style.display = 'block';
        this.progressBar.classList.remove('hide');
        
        // Forçar reflow para garantir que a transição funcione
        this.progressBar.offsetHeight;
        
        this.progressBar.classList.add('show');
        
        // Efeito de vibração no ícone do proton pack
        const protonIcon = document.getElementById('proton-pack-icon');
        if (protonIcon) {
            protonIcon.classList.add('capture-shake');
            setTimeout(() => {
                protonIcon.classList.remove('capture-shake');
            }, 600);
        }
    }

    /**
     * Esconde a barra de progresso com animação suave
     */
    hideProgressBar() {
        this.state = 'hiding';
        this.progressBar.classList.remove('show');
        this.progressBar.classList.add('hide');
        
        setTimeout(() => {
            if (this.state === 'hiding') {
                this.progressBar.style.display = 'none';
                this.state = 'hidden';
            }
        }, 300);
    }    /**

     * Loop principal de animação
     */
    animate() {
        if (this.state !== 'active') return;

        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // Usar easing para suavizar a animação
        const easedProgress = this.easeInOutCubic(progress);
        this.currentProgress = easedProgress * 100;
        
        // Atualizar visual da barra
        this.updateProgressVisual();
        
        // Callback de atualização
        if (this.onUpdate) {
            this.onUpdate(this.currentProgress, progress);
        }
        
        // Verificar se completou
        if (progress >= 1) {
            this.completeProgress();
            return;
        }
        
        // Continuar animação
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    /**
     * Atualiza o visual da barra de progresso
     */
    updateProgressVisual() {
        if (!this.progressFill) return;

        this.progressFill.style.height = `${this.currentProgress}%`;
        
        // Efeitos especiais baseados no progresso
        if (this.currentProgress > 80) {
            this.progressFill.classList.add('critical');
        } else {
            this.progressFill.classList.remove('critical');
        }
        
        // Efeito de vibração quando próximo do fim
        if (this.currentProgress > 90 && !this.progressFill.classList.contains('critical-shake')) {
            this.progressFill.classList.add('critical-shake');
            
            // Feedback tátil intenso
            if (window.animationManager) {
                window.animationManager.triggerHapticFeedback('heavy');
            }
        }
    }

    /**
     * Completa a animação da barra de progresso
     */
    completeProgress() {
        this.state = 'completing';
        this.currentProgress = 100;
        this.progressFill.style.height = '100%';
        
        // Efeito de sucesso
        this.progressFill.classList.remove('critical', 'critical-shake');
        this.progressFill.classList.add('success');
        
        // Callback de conclusão
        if (this.onComplete) {
            this.onComplete();
        }
        
        // Esconder após um breve delay
        setTimeout(() => {
            this.hideProgressBar();
        }, 800);
        
        console.log('Animação da barra de progresso concluída');
    }

    /**
     * Cancela a animação da barra de progresso
     */
    cancelProgress() {
        console.log('Cancelando animação da barra de progresso');
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.state = 'hiding';
        
        // Animação de cancelamento (diminuir rapidamente)
        this.animateCancellation();
    }

    /**
     * Animação especial para cancelamento
     */
    animateCancellation() {
        const startProgress = this.currentProgress;
        const startTime = Date.now();
        const duration = 500; // Meio segundo para cancelar
        
        const cancelAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Diminuir o progresso rapidamente
            this.currentProgress = startProgress * (1 - this.easeInCubic(progress));
            this.progressFill.style.height = `${this.currentProgress}%`;
            
            if (progress >= 1) {
                this.hideProgressBar();
                this.reset();
                return;
            }
            
            requestAnimationFrame(cancelAnimation);
        };
        
        cancelAnimation();
    }

    /**
     * Reseta a barra de progresso
     */
    reset() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.state = 'hidden';
        
        if (this.progressFill) {
            this.progressFill.style.height = '0%';
            this.progressFill.classList.remove('critical', 'success', 'critical-shake');
        }
        
        if (this.progressBar) {
            this.progressBar.classList.remove('show', 'hide');
            this.progressBar.style.display = 'none';
        }
    }

    /**
     * Função de easing cubic in-out
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Função de easing cubic in
     */
    easeInCubic(t) {
        return t * t * t;
    }

    /**
     * Atualiza o progresso manualmente (para uso externo)
     */
    setProgress(progress, animated = true) {
        if (!animated) {
            this.currentProgress = progress;
            this.updateProgressVisual();
            return;
        }
        
        // Animar para o novo progresso
        const startProgress = this.currentProgress;
        const targetProgress = Math.max(0, Math.min(100, progress));
        const startTime = Date.now();
        const duration = 300;
        
        const animateToProgress = () => {
            const elapsed = Date.now() - startTime;
            const animProgress = Math.min(elapsed / duration, 1);
            
            this.currentProgress = startProgress + (targetProgress - startProgress) * this.easeInOutCubic(animProgress);
            this.updateProgressVisual();
            
            if (animProgress < 1) {
                requestAnimationFrame(animateToProgress);
            }
        };
        
        animateToProgress();
    }

    /**
     * Obtém o progresso atual
     */
    getProgress() {
        return this.currentProgress;
    }

    /**
     * Verifica se está animando
     */
    isActive() {
        return this.state === 'active' || this.state === 'showing';
    }
}

// Inicializar o sistema de animações da barra de progresso
let progressBarAnimations;

function initProgressBarAnimations() {
    if (!progressBarAnimations) {
        progressBarAnimations = new ProgressBarAnimations();
        window.progressBarAnimations = progressBarAnimations;
        console.log('ProgressBarAnimations inicializado:', progressBarAnimations);
    }
}

// Tentar inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgressBarAnimations);
} else {
    setTimeout(initProgressBarAnimations, 100);
}

// Também inicializar quando a janela carregar
window.addEventListener('load', initProgressBarAnimations);

// Inicializar imediatamente também
setTimeout(initProgressBarAnimations, 0);

// Exportar para uso global
window.ProgressBarAnimations = ProgressBarAnimations;