/**
 * Sistema de Notificações Toast para Ghostbusters AR
 * Gerencia notificações estilizadas que substituem os alerts padrão
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 4000;
        this.init();
    }

    init() {
        this.createContainer();
        console.log('Sistema de notificações inicializado');
    }

    /**
     * Cria o container principal para as notificações
     */
    createContainer() {
        // Verificar se já existe
        if (document.getElementById('toast-container')) {
            this.container = document.getElementById('toast-container');
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo da notificação (success, error, warning, info)
     * @param {number} duration - Duração em ms (0 = não remove automaticamente)
     * @param {Object} options - Opções adicionais
     */
    show(message, type = 'info', duration = null, options = {}) {
        const notification = {
            id: this.generateId(),
            message,
            type,
            duration: duration !== null ? duration : this.defaultDuration,
            timestamp: Date.now(),
            ...options
        };

        this.queueNotification(notification);
        return notification.id;
    }

    /**
     * Métodos de conveniência para diferentes tipos
     */
    success(message, duration = null, options = {}) {
        return this.show(message, 'success', duration, options);
    }

    error(message, duration = null, options = {}) {
        return this.show(message, 'error', duration, options);
    }

    warning(message, duration = null, options = {}) {
        return this.show(message, 'warning', duration, options);
    }

    info(message, duration = null, options = {}) {
        return this.show(message, 'info', duration, options);
    }

    /**
     * Adiciona notificação à fila
     */
    queueNotification(notification) {
        this.notifications.push(notification);
        this.processQueue();
    }

    /**
     * Processa a fila de notificações
     */
    processQueue() {
        // Limitar número de notificações visíveis
        const visibleToasts = this.container.querySelectorAll('.toast:not(.toast-removing)');
        
        if (visibleToasts.length >= this.maxNotifications) {
            // Remover a mais antiga
            const oldestToast = visibleToasts[0];
            if (oldestToast) {
                this.removeToast(oldestToast);
            }
        }

        // Processar próxima notificação na fila
        if (this.notifications.length > 0) {
            const notification = this.notifications.shift();
            this.createToastElement(notification);
        }
    }

    /**
     * Cria o elemento DOM da notificação
     */
    createToastElement(notification) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type}`;
        toast.setAttribute('data-toast-id', notification.id);

        // Ícone baseado no tipo
        const icon = this.getIconForType(notification.type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close" aria-label="Fechar notificação">×</button>
        `;

        // Event listeners
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Adicionar ao container
        this.container.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Feedback tátil
        if (window.animationManager) {
            const hapticType = this.getHapticTypeForNotification(notification.type);
            window.animationManager.triggerHapticFeedback(hapticType);
        }

        // Auto-dismiss se especificado
        if (notification.duration > 0) {
            this.scheduleAutoDismiss(toast, notification.duration);
        }

        return toast;
    }

    /**
     * Remove uma notificação
     */
    removeToast(toastElement) {
        if (toastElement.classList.contains('toast-removing')) {
            return;
        }

        toastElement.classList.add('toast-removing');
        toastElement.classList.remove('toast-show');

        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }

    /**
     * Agenda remoção automática
     */
    scheduleAutoDismiss(toastElement, duration) {
        setTimeout(() => {
            if (toastElement.parentNode && !toastElement.classList.contains('toast-removing')) {
                this.removeToast(toastElement);
            }
        }, duration);
    }

    /**
     * Remove notificação por ID
     */
    dismiss(notificationId) {
        const toast = this.container.querySelector(`[data-toast-id="${notificationId}"]`);
        if (toast) {
            this.removeToast(toast);
        }
    }

    /**
     * Remove todas as notificações
     */
    dismissAll() {
        const toasts = this.container.querySelectorAll('.toast:not(.toast-removing)');
        toasts.forEach(toast => {
            this.removeToast(toast);
        });
    }

    /**
     * Gera ID único para notificação
     */
    generateId() {
        return 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Retorna ícone baseado no tipo
     */
    getIconForType(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Retorna tipo de feedback tátil baseado no tipo de notificação
     */
    getHapticTypeForNotification(type) {
        const hapticMap = {
            success: 'success',
            error: 'error',
            warning: 'medium',
            info: 'light'
        };
        return hapticMap[type] || 'light';
    }

    /**
     * Configura duração padrão
     */
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    /**
     * Configura número máximo de notificações
     */
    setMaxNotifications(max) {
        this.maxNotifications = max;
    }
}

// Inicializar o sistema de notificações
let notificationSystem;

function initNotificationSystem() {
    if (!notificationSystem) {
        notificationSystem = new NotificationSystem();
        window.notificationSystem = notificationSystem;
        console.log('NotificationSystem inicializado:', notificationSystem);
    }
}

// Tentar inicializar imediatamente se DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    // DOM já está pronto
    initNotificationSystem();
}

// Também tentar inicializar quando a janela carregar completamente
window.addEventListener('load', initNotificationSystem);

// Exportar para uso global
window.NotificationSystem = NotificationSystem;
// Fun
ções globais de conveniência para facilitar o uso
window.showToast = function(message, type = 'info', duration = null) {
    if (window.notificationSystem) {
        return window.notificationSystem.show(message, type, duration);
    } else {
        console.warn('NotificationSystem não inicializado, usando fallback');
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
};

window.showSuccess = function(message, duration = null) {
    return window.showToast(message, 'success', duration);
};

window.showError = function(message, duration = null) {
    return window.showToast(message, 'error', duration);
};

window.showWarning = function(message, duration = null) {
    return window.showToast(message, 'warning', duration);
};

window.showInfo = function(message, duration = null) {
    return window.showToast(message, 'info', duration);
};

// Função para substituir alerts existentes
window.showNotification = function(message, type = 'info') {
    return window.showToast(message, type);
};

// Função para remover todas as notificações
window.dismissAllToasts = function() {
    if (window.notificationSystem) {
        window.notificationSystem.dismissAll();
    }
};