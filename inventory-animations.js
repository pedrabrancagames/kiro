/**
 * Sistema de Animações do Inventário
 * Gerencia animações suaves de abertura/fechamento e efeitos visuais
 */
class InventoryAnimations {
    constructor() {
        this.modal = null;
        this.content = null;
        this.ghostList = null;
        this.isAnimating = false;
        this.isOpen = false;
        
        this.init();
        console.log('Sistema de animações do inventário inicializado');
    }

    init() {
        this.modal = document.getElementById('inventory-modal');
        this.content = document.getElementById('inventory-content');
        this.ghostList = document.getElementById('ghost-list');
        
        if (!this.modal || !this.content || !this.ghostList) {
            console.error('Elementos do inventário não encontrados');
            return;
        }

        // Configurar estado inicial
        this.setupInitialState();
    }

    /**
     * Configura o estado inicial do modal
     */
    setupInitialState() {
        this.modal.classList.remove('show', 'hide');
        this.isOpen = false;
        this.isAnimating = false;
    }

    /**
     * Abre o inventário com animação suave
     */
    openInventory() {
        if (this.isAnimating || this.isOpen) return;
        
        console.log('Abrindo inventário com animação');
        this.isAnimating = true;
        this.isOpen = true;

        // Mostrar modal
        this.modal.classList.remove('hidden', 'hide');
        this.modal.classList.add('show');
        
        // Feedback tátil
        if (window.animationManager) {
            window.animationManager.triggerHapticFeedback('modal_open');
        }
        
        // Animar itens da lista
        setTimeout(() => {
            this.animateGhostItems();
            this.isAnimating = false;
        }, 200);
    }

    /**
     * Fecha o inventário com animação suave
     */
    closeInventory() {
        if (this.isAnimating || !this.isOpen) return;
        
        console.log('Fechando inventário com animação');
        this.isAnimating = true;
        this.isOpen = false;

        // Animar saída
        this.modal.classList.remove('show');
        this.modal.classList.add('hide');
        
        // Feedback tátil
        if (window.animationManager) {
            window.animationManager.triggerHapticFeedback('button_press');
        }
        
        // Esconder após animação
        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('hide');
            this.isAnimating = false;
        }, 400);
    }

    /**
     * Anima os itens da lista de fantasmas
     */
    animateGhostItems() {
        const items = this.ghostList.querySelectorAll('li');
        
        // Remover animações anteriores
        items.forEach(item => {
            item.style.animation = 'none';
            item.offsetHeight; // Forçar reflow
        });
        
        // Aplicar animações com delay
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = `ghostItemSlideIn 0.4s ease-out forwards`;
            }, index * 100);
        });
    }

    /**
     * Atualiza a lista de fantasmas com animação
     */
    updateGhostList(ghosts) {
        console.log('Atualizando lista de fantasmas:', ghosts.length);
        
        // Limpar lista atual
        this.ghostList.innerHTML = '';
        
        if (ghosts.length === 0) {
            // Estado vazio
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-state';
            emptyItem.innerHTML = `
                <div style="font-size: 2em; margin-bottom: 10px;">👻</div>
                <div>Inventário vazio</div>
                <div style="font-size: 0.9em; margin-top: 5px; color: #666;">
                    Capture fantasmas para vê-los aqui!
                </div>
            `;
            this.ghostList.appendChild(emptyItem);
        } else {
            // Criar itens dos fantasmas
            ghosts.forEach((ghost, index) => {
                const item = this.createGhostItem(ghost, index);
                this.ghostList.appendChild(item);
            });
        }
        
        // Animar se o modal estiver aberto
        if (this.isOpen) {
            setTimeout(() => this.animateGhostItems(), 50);
        }
    }

    /**
     * Cria um item visual para um fantasma
     */
    createGhostItem(ghost, index) {
        const item = document.createElement('li');
        item.className = 'ghost-item';
        item.style.animationDelay = `${index * 0.1}s`;
        
        // Determinar ícone baseado no tipo
        const ghostIcon = ghost.type === 'Fantasma Forte' ? '👹' : '👻';
        const rarityClass = ghost.type === 'Fantasma Forte' ? 'rare' : 'common';
        
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 2em; filter: drop-shadow(0 0 5px rgba(146, 244, 40, 0.5));">
                    ${ghostIcon}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #92F428; margin-bottom: 4px;">
                        ${ghost.type}
                    </div>
                    <div style="font-size: 0.9em; color: #ccc;">
                        Pontos: <span style="color: #FFD700; font-weight: bold;">${ghost.points}</span>
                    </div>
                    <div style="font-size: 0.8em; color: #888; margin-top: 2px;">
                        ID: ${ghost.id}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="rarity-badge ${rarityClass}">
                        ${ghost.type === 'Fantasma Forte' ? 'RARO' : 'COMUM'}
                    </div>
                </div>
            </div>
        `;
        
        return item;
    }

    /**
     * Adiciona efeito de celebração ao adicionar item
     */
    celebrateNewGhost() {
        if (!this.isOpen) return;
        
        console.log('Celebrando novo fantasma no inventário');
        
        // Efeito de brilho no modal
        this.content.classList.add('celebration-glow');
        setTimeout(() => {
            this.content.classList.remove('celebration-glow');
        }, 1000);
        
        // Feedback tátil
        if (window.animationManager) {
            window.animationManager.triggerHapticFeedback('success');
        }
    }

    /**
     * Efeito visual para inventário cheio
     */
    showInventoryFullEffect() {
        console.log('Mostrando efeito de inventário cheio');
        
        if (this.content) {
            this.content.classList.add('inventory-full-pulse');
            setTimeout(() => {
                this.content.classList.remove('inventory-full-pulse');
            }, 2000);
        }
    }

    /**
     * Verifica se o inventário está aberto
     */
    isInventoryOpen() {
        return this.isOpen;
    }

    /**
     * Força o fechamento (para casos de emergência)
     */
    forceClose() {
        this.isAnimating = false;
        this.isOpen = false;
        this.modal.classList.add('hidden');
        this.modal.classList.remove('show', 'hide');
    }
}

// Inicializar o sistema de animações do inventário
let inventoryAnimations;

function initInventoryAnimations() {
    if (!inventoryAnimations) {
        inventoryAnimations = new InventoryAnimations();
        window.inventoryAnimations = inventoryAnimations;
        console.log('InventoryAnimations inicializado:', inventoryAnimations);
    }
}

// Tentar inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInventoryAnimations);
} else {
    setTimeout(initInventoryAnimations, 100);
}

// Também inicializar quando a janela carregar
window.addEventListener('load', initInventoryAnimations);

// Inicializar imediatamente também
setTimeout(initInventoryAnimations, 0);

// Exportar para uso global
window.InventoryAnimations = InventoryAnimations;

// Funções globais de conveniência
window.openInventoryWithAnimation = function() {
    if (window.inventoryAnimations) {
        window.inventoryAnimations.openInventory();
    }
};

window.closeInventoryWithAnimation = function() {
    if (window.inventoryAnimations) {
        window.inventoryAnimations.closeInventory();
    }
};

window.updateInventoryDisplay = function(ghosts) {
    if (window.inventoryAnimations) {
        window.inventoryAnimations.updateGhostList(ghosts);
    }
};