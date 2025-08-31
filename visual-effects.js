/**
 * Sistema de Efeitos Visuais para Ghostbusters AR
 * Gerencia partículas, animações de captura e efeitos especiais
 */

class VisualEffectsSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationFrame = null;
        this.isActive = false;
        this.effects = {
            celebration: [],
            suction: [],
            protonBeam: null
        };
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        console.log('Sistema de efeitos visuais inicializado');
    }

    /**
     * Cria o canvas para os efeitos visuais
     */
    createCanvas() {
        // Verificar se já existe
        if (document.getElementById('visual-effects-canvas')) {
            this.canvas = document.getElementById('visual-effects-canvas');
            this.ctx = this.canvas.getContext('2d');
            return;
        }

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'visual-effects-canvas';
        this.canvas.className = 'visual-effects-canvas';
        
        // Posicionar sobre a cena AR
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 100;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Ajustar resolução do canvas
        this.resizeCanvas();
    }

    /**
     * Ajusta o tamanho do canvas
     */
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeCanvas();
            }, 100);
        });
    }

    /**
     * Inicia o loop de animação
     */
    startAnimation() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.animate();
    }

    /**
     * Para o loop de animação
     */
    stopAnimation() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.clearCanvas();
    }

    /**
     * Loop principal de animação
     */
    animate() {
        if (!this.isActive) return;

        this.clearCanvas();
        this.updateParticles();
        this.renderEffects();

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    /**
     * Limpa o canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Atualiza todas as partículas
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();

            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Renderiza todos os efeitos
     */
    renderEffects() {
        // Renderizar partículas
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });

        // Renderizar efeito de feixe de prótons se ativo
        if (this.effects.protonBeam) {
            this.renderProtonBeam();
        }
    }

    /**
     * Cria efeito de celebração com partículas
     */
    showCelebrationEffect(x = null, y = null, type = 'ghost_captured') {
        // Usar centro da tela se não especificado
        if (x === null) x = window.innerWidth / 2;
        if (y === null) y = window.innerHeight / 2;

        const configs = {
            ghost_captured: {
                count: 50,
                colors: ['#92F428', '#4CAF50', '#8BC34A', '#CDDC39'],
                size: { min: 3, max: 8 },
                speed: { min: 2, max: 6 },
                life: { min: 1000, max: 2000 },
                gravity: 0.1,
                spread: 360
            },
            ecto1_unlocked: {
                count: 80,
                colors: ['#FFD700', '#FFA500', '#FF6347', '#FF4500'],
                size: { min: 4, max: 12 },
                speed: { min: 3, max: 8 },
                life: { min: 1500, max: 3000 },
                gravity: 0.05,
                spread: 360
            },
            inventory_full: {
                count: 30,
                colors: ['#FF9800', '#FF5722', '#F44336'],
                size: { min: 2, max: 6 },
                speed: { min: 1, max: 4 },
                life: { min: 800, max: 1500 },
                gravity: 0.15,
                spread: 180
            }
        };

        const config = configs[type] || configs.ghost_captured;
        
        // Criar partículas
        for (let i = 0; i < config.count; i++) {
            const particle = new CelebrationParticle(x, y, config);
            this.particles.push(particle);
        }

        this.startAnimation();

        // Parar animação automaticamente após um tempo
        setTimeout(() => {
            if (this.particles.length === 0) {
                this.stopAnimation();
            }
        }, Math.max(...config.life.map ? [config.life.min, config.life.max] : [config.life]) + 500);
    }

    /**
     * Cria efeito de sucção visual
     */
    showSuctionEffect(targetX, targetY, sourceX = null, sourceY = null) {
        // Usar posição da proton pack se não especificado
        if (sourceX === null) sourceX = window.innerWidth / 2;
        if (sourceY === null) sourceY = window.innerHeight * 0.8;

        // Criar partículas que se movem do fantasma para a proton pack
        for (let i = 0; i < 30; i++) {
            const particle = new SuctionParticle(targetX, targetY, sourceX, sourceY);
            this.particles.push(particle);
        }

        this.startAnimation();
    }

    /**
     * Inicia efeito visual do feixe de prótons
     */
    startProtonBeamEffect() {
        this.effects.protonBeam = {
            active: true,
            intensity: 0,
            targetIntensity: 1,
            pulsePhase: 0,
            startTime: Date.now()
        };

        this.startAnimation();
    }

    /**
     * Para efeito visual do feixe de prótons
     */
    stopProtonBeamEffect() {
        if (this.effects.protonBeam) {
            this.effects.protonBeam.targetIntensity = 0;
            
            // Remover completamente após fade out
            setTimeout(() => {
                this.effects.protonBeam = null;
                if (this.particles.length === 0) {
                    this.stopAnimation();
                }
            }, 500);
        }
    }

    /**
     * Renderiza o efeito do feixe de prótons
     */
    renderProtonBeam() {
        const beam = this.effects.protonBeam;
        if (!beam.active) return;

        // Animar intensidade
        const fadeSpeed = 0.05;
        if (beam.intensity < beam.targetIntensity) {
            beam.intensity = Math.min(beam.intensity + fadeSpeed, beam.targetIntensity);
        } else if (beam.intensity > beam.targetIntensity) {
            beam.intensity = Math.max(beam.intensity - fadeSpeed, beam.targetIntensity);
        }

        if (beam.intensity <= 0) return;

        // Atualizar fase de pulso
        beam.pulsePhase += 0.1;

        // Posição do feixe (centro da tela)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const beamLength = 200;

        // Efeito de pulso
        const pulse = Math.sin(beam.pulsePhase) * 0.3 + 0.7;
        const alpha = beam.intensity * pulse;

        // Desenhar feixe principal
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Gradiente do feixe
        const gradient = this.ctx.createLinearGradient(
            centerX, centerY - beamLength/2,
            centerX, centerY + beamLength/2
        );
        gradient.addColorStop(0, 'rgba(146, 244, 40, 0)');
        gradient.addColorStop(0.5, 'rgba(146, 244, 40, 0.8)');
        gradient.addColorStop(1, 'rgba(146, 244, 40, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(centerX - 10, centerY - beamLength/2, 20, beamLength);

        // Efeito de brilho
        this.ctx.shadowColor = '#92F428';
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(centerX - 5, centerY - beamLength/2, 10, beamLength);

        this.ctx.restore();

        // Adicionar partículas do feixe ocasionalmente
        if (Math.random() < 0.3) {
            const particle = new ProtonBeamParticle(centerX, centerY);
            this.particles.push(particle);
        }
    }

    /**
     * Limpa todos os efeitos
     */
    clearAllEffects() {
        this.particles = [];
        this.effects.protonBeam = null;
        this.stopAnimation();
    }

    /**
     * Mostra efeito de falha na captura
     */
    showCaptureFailEffect(x = null, y = null) {
        if (x === null) x = window.innerWidth / 2;
        if (y === null) y = window.innerHeight / 2;

        // Criar efeito de "explosão" vermelha
        for (let i = 0; i < 20; i++) {
            const particle = new FailureParticle(x, y);
            this.particles.push(particle);
        }

        this.startAnimation();
    }
}

/**
 * Classe para partículas de celebração
 */
class CelebrationParticle {
    constructor(x, y, config) {
        this.x = x + (Math.random() - 0.5) * 50;
        this.y = y + (Math.random() - 0.5) * 50;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.size = config.size.min + Math.random() * (config.size.max - config.size.min);
        this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
        this.life = config.life.min + Math.random() * (config.life.max - config.life.min);
        this.maxLife = this.life;
        this.gravity = config.gravity;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        
        this.rotation += this.rotationSpeed;
        this.life -= 16; // Assumindo 60fps
        
        // Fade out
        this.vx *= 0.99;
        this.vy *= 0.99;
    }

    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

/**
 * Classe para partículas de sucção
 */
class SuctionParticle {
    constructor(startX, startY, targetX, targetY) {
        this.startX = startX + (Math.random() - 0.5) * 30;
        this.startY = startY + (Math.random() - 0.5) * 30;
        this.x = this.startX;
        this.y = this.startY;
        
        this.targetX = targetX;
        this.targetY = targetY;
        
        this.progress = 0;
        this.speed = 0.02 + Math.random() * 0.03;
        this.size = 2 + Math.random() * 4;
        this.color = '#92F428';
        
        // Curva bezier para movimento mais natural
        this.controlX = (this.startX + this.targetX) / 2 + (Math.random() - 0.5) * 100;
        this.controlY = (this.startY + this.targetY) / 2 + (Math.random() - 0.5) * 100;
    }

    update() {
        this.progress += this.speed;
        
        // Movimento em curva bezier
        const t = Math.min(this.progress, 1);
        const invT = 1 - t;
        
        this.x = invT * invT * this.startX + 
                 2 * invT * t * this.controlX + 
                 t * t * this.targetX;
                 
        this.y = invT * invT * this.startY + 
                 2 * invT * t * this.controlY + 
                 t * t * this.targetY;
    }

    render(ctx) {
        const alpha = 1 - this.progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    isDead() {
        return this.progress >= 1;
    }
}

/**
 * Classe para partículas do feixe de prótons
 */
class ProtonBeamParticle {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y + (Math.random() - 0.5) * 100;
        
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        
        this.size = 1 + Math.random() * 3;
        this.life = 500 + Math.random() * 500;
        this.maxLife = this.life;
        this.color = '#92F428';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 16;
        
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 3;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

/**
 * Classe para partículas de falha
 */
class FailureParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.size = 3 + Math.random() * 5;
        this.life = 800 + Math.random() * 400;
        this.maxLife = this.life;
        this.color = '#F44336';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 16;
        
        this.vx *= 0.95;
        this.vy *= 0.95;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Inicializar o sistema de efeitos visuais
let visualEffectsSystem;

function initVisualEffectsSystem() {
    if (!visualEffectsSystem) {
        visualEffectsSystem = new VisualEffectsSystem();
        window.visualEffectsSystem = visualEffectsSystem;
        console.log('VisualEffectsSystem inicializado:', visualEffectsSystem);
    }
}

// Tentar inicializar imediatamente se DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualEffectsSystem);
} else {
    setTimeout(initVisualEffectsSystem, 100);
}

// Também tentar inicializar quando a janela carregar completamente
window.addEventListener('load', initVisualEffectsSystem);

// Inicializar imediatamente também
setTimeout(initVisualEffectsSystem, 0);

// Exportar para uso global
window.VisualEffectsSystem = VisualEffectsSystem;