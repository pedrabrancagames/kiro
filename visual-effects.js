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
            z-index: 9999;
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
        if (!this.isActive) {
            console.log('❌ Animação não ativa, parando...');
            return;
        }

        this.clearCanvas();
        this.updateParticles();
        this.renderEffects();

        // Log apenas ocasionalmente para não spam
        if (Math.random() < 0.01) {
            console.log('🎬 Animando... Partículas:', this.particles.length);
        }

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
        // Log ocasional para debug
        if (this.particles.length > 0 && Math.random() < 0.05) {
            console.log('🎨 Renderizando', this.particles.length, 'partículas');
        }

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
     * Cria efeito de celebração com partículas DOM
     */
    showCelebrationEffect(x = null, y = null, type = 'ghost_captured') {
        // Usar centro da tela se não especificado
        if (x === null) x = window.innerWidth / 2;
        if (y === null) y = window.innerHeight / 2;

        console.log('🎉 showCelebrationEffect chamado (DOM):', { x, y, type });

        // Limpar partículas canvas antigas para evitar spam de logs
        this.clearCanvasParticles();

        // Criar efeito DOM - mais eficiente e visível
        this.createDOMCelebration(x, y, type);
    }

    /**
     * Cria efeito de celebração usando elementos DOM
     */
    createDOMCelebration(x, y, type) {
        console.log('🎨 Criando celebração DOM em:', x, y);

        const colors = {
            ghost_captured: ['#92F428', '#4CAF50', '#8BC34A', '#CDDC39'],
            ecto1_unlocked: ['#FFD700', '#FFA500', '#FF6347', '#FF4500'],
            inventory_full: ['#FF9800', '#FF5722', '#F44336']
        };

        const particleColors = colors[type] || colors.ghost_captured;
        const particleCount = type === 'ecto1_unlocked' ? 20 : 15;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'dom-particle';
            
            const color = particleColors[Math.floor(Math.random() * particleColors.length)];
            const size = Math.random() * 8 + 4;
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = Math.random() * 100 + 50;
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                box-shadow: 0 0 10px ${color};
                border: 1px solid white;
            `;

            document.body.appendChild(particle);

            // Animar partícula
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance + Math.random() * 100;

            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`, 
                    opacity: 0 
                }
            ], {
                duration: 1500 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }

        console.log('✨ Criadas', particleCount, 'partículas DOM');
    }

    /**
     * Cria efeito de sucção visual
     */
    showSuctionEffect(targetX, targetY, sourceX = null, sourceY = null) {
        // Usar posição da proton pack se não especificado
        if (sourceX === null) sourceX = window.innerWidth / 2;
        if (sourceY === null) sourceY = window.innerHeight * 0.8;

        console.log('🌪️ Criando efeito de sucção DOM:', { targetX, targetY, sourceX, sourceY });

        // Limpar partículas canvas antigas
        this.clearCanvasParticles();

        // Criar efeito DOM - mais eficiente e visível
        this.createDOMSuction(targetX, targetY, sourceX, sourceY);
    }

    /**
     * Cria efeito de sucção usando elementos DOM
     */
    createDOMSuction(startX, startY, endX, endY) {
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'dom-suction-particle';
            
            const size = Math.random() * 6 + 3;
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;
            
            particle.style.cssText = `
                position: fixed;
                left: ${startX + offsetX}px;
                top: ${startY + offsetY}px;
                width: ${size}px;
                height: ${size}px;
                background: #92F428;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                box-shadow: 0 0 8px #92F428;
            `;

            document.body.appendChild(particle);

            // Animar sucção
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${endX - startX - offsetX}px, ${endY - startY - offsetY}px) scale(0.2)`, 
                    opacity: 0.8 
                },
                { 
                    transform: `translate(${endX - startX - offsetX}px, ${endY - startY - offsetY}px) scale(0)`, 
                    opacity: 0 
                }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }

        console.log('🌪️ Criadas', particleCount, 'partículas de sucção DOM');
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
     * Limpa apenas as partículas canvas
     */
    clearCanvasParticles() {
        this.particles = [];
        if (this.particles.length === 0 && !this.effects.protonBeam) {
            this.stopAnimation();
        }
        console.log('🧹 Partículas canvas limpas');
    }

    /**
     * Teste de visibilidade - cria partículas DOM bem visíveis
     */
    testVisibility() {
        console.log('🧪 Testando visibilidade com partículas DOM...');
        
        // Limpar partículas canvas antigas
        this.clearCanvasParticles();
        
        // Criar partículas DOM grandes e coloridas
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'dom-test-particle';
            particle.textContent = i.toString();
            
            particle.style.cssText = `
                position: fixed;
                left: ${50 + i * 35}px;
                top: 100px;
                width: 30px;
                height: 30px;
                background: #FF0000;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                box-shadow: 0 0 15px #FF0000;
                border: 3px solid #FFFFFF;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            `;

            document.body.appendChild(particle);

            // Animar para chamar atenção
            particle.animate([
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(1.2)', opacity: 0.8 },
                { transform: 'scale(1)', opacity: 1 }
            ], {
                duration: 1000,
                iterations: 3
            });

            // Remover após 5 segundos
            setTimeout(() => {
                particle.remove();
            }, 5000);
        }
        
        console.log('🎯 Partículas DOM de teste criadas. Você deve ver círculos vermelhos numerados!');
        
        // Teste adicional: criar uma grande no centro
        const centerParticle = document.createElement('div');
        centerParticle.textContent = '★';
        centerParticle.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: #FFD700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
            box-shadow: 0 0 30px #FFD700;
            border: 4px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
        `;

        document.body.appendChild(centerParticle);

        centerParticle.animate([
            { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
            { transform: 'translate(-50%, -50%) scale(1.3) rotate(180deg)' },
            { transform: 'translate(-50%, -50%) scale(1) rotate(360deg)' }
        ], {
            duration: 2000,
            iterations: 2
        });

        setTimeout(() => {
            centerParticle.remove();
        }, 5000);
    }

    /**
     * Cria efeito de falha na captura
     */
    showCaptureFailEffect(x, y) {
        console.log('💥 Criando efeito de falha DOM em:', x, y);

        // Limpar partículas canvas antigas
        this.clearCanvasParticles();

        // Criar efeito DOM
        this.createDOMFailEffect(x, y);
    }

    /**
     * Cria efeito de falha usando elementos DOM
     */
    createDOMFailEffect(x, y) {
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'dom-fail-particle';
            
            const size = Math.random() * 8 + 4;
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const distance = Math.random() * 80 + 30;
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: #FF4444;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                box-shadow: 0 0 10px #FF4444;
                border: 1px solid #FFFFFF;
            `;

            document.body.appendChild(particle);

            // Animar explosão
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;

            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`, 
                    opacity: 0 
                }
            ], {
                duration: 600 + Math.random() * 300,
                easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'
            }).onfinish = () => {
                particle.remove();
            };
        }

        console.log('💥 Criadas', particleCount, 'partículas de falha DOM');
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
        
        // Adicionar sombra para maior visibilidade
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Desenhar partícula como círculo com borda
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
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

// Função global para testar visibilidade
window.testVisualEffectsVisibility = function() {
    if (window.visualEffectsSystem) {
        window.visualEffectsSystem.testVisibility();
    } else {
        console.error('Sistema de efeitos visuais não disponível');
    }
};