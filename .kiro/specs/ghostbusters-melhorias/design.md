# Documento de Design - Melhorias na Interface e UX do Ghostbusters AR

## Visão Geral

Este documento detalha o design técnico para implementar melhorias significativas na interface do usuário e experiência do usuário do jogo Ghostbusters AR, focando em animações suaves, feedback visual aprimorado e interações mais intuitivas.

## Arquitetura

### Estrutura de Componentes UI

```
UI System
├── Animation Manager
│   ├── CSS Transitions
│   ├── Keyframe Animations
│   └── Haptic Feedback
├── Notification System
│   ├── Toast Manager
│   ├── Message Queue
│   └── Auto-dismiss Timer
├── Visual Effects
│   ├── Particle System
│   ├── Progress Animations
│   └── Capture Effects
└── Responsive Layout
    ├── Viewport Adapter
    ├── Orientation Handler
    └── Device Detection
```

### Fluxo de Interação

1. **Entrada do Usuário** → **Animation Manager** → **Visual Feedback**
2. **Estado do Jogo** → **Notification System** → **Toast Display**
3. **Captura de Fantasma** → **Visual Effects** → **Celebration Animation**
4. **Mudança de Tela** → **Responsive Layout** → **Adaptação Automática**

## Componentes e Interfaces

### 1. Animation Manager

**Responsabilidade:** Gerenciar todas as animações da interface

```javascript
class AnimationManager {
    // Animações de botões
    animateButtonPress(element, callback)
    animateButtonRelease(element)
    
    // Transições de modal
    showModal(modalElement, animationType = 'fadeIn')
    hideModal(modalElement, animationType = 'fadeOut')
    
    // Feedback tátil
    triggerHapticFeedback(type = 'light')
    
    // Animações de estado
    animateStateChange(element, fromState, toState)
}
```

**Implementação:**
- CSS Transitions para mudanças de estado básicas
- CSS Keyframes para animações complexas
- Web Vibration API para feedback tátil
- RequestAnimationFrame para animações JavaScript customizadas

### 2. Notification System

**Responsabilidade:** Gerenciar sistema de notificações toast

```javascript
class NotificationSystem {
    // Mostrar notificações
    showToast(message, type = 'info', duration = 3000)
    showSuccess(message, duration = 3000)
    showError(message, duration = 5000)
    showWarning(message, duration = 4000)
    
    // Gerenciar fila
    queueNotification(notification)
    processQueue()
    
    // Auto-dismiss
    scheduleAutoDismiss(toastElement, duration)
}
```

**Tipos de Toast:**
- `success`: Verde com ícone de check
- `error`: Vermelho com ícone de X
- `warning`: Amarelo com ícone de alerta
- `info`: Azul com ícone de informação

### 3. Visual Effects System

**Responsabilidade:** Efeitos visuais para captura e celebração

```javascript
class VisualEffectsSystem {
    // Efeitos de captura
    startCaptureEffect(targetElement)
    stopCaptureEffect()
    
    // Efeitos de celebração
    showCelebrationEffect(position, type = 'ghost_captured')
    
    // Efeitos de partículas
    createParticleEffect(config)
    
    // Animações de progresso
    animateProgressBar(element, fromValue, toValue, duration)
}
```

### 4. Responsive UI Manager

**Responsabilidade:** Adaptação responsiva da interface

```javascript
class ResponsiveUIManager {
    // Detecção de dispositivo
    detectDeviceCapabilities()
    
    // Adaptação de layout
    adaptLayoutForScreen(screenSize)
    handleOrientationChange()
    
    // Otimização de performance
    adjustQualityForDevice()
}
```

## Modelos de Dados

### Animation Config
```javascript
{
    type: 'fadeIn' | 'slideUp' | 'scale' | 'bounce',
    duration: number, // em ms
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out',
    delay: number, // em ms
    fillMode: 'forwards' | 'backwards' | 'both'
}
```

### Toast Notification
```javascript
{
    id: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration: number,
    timestamp: number,
    dismissed: boolean
}
```

### Visual Effect Config
```javascript
{
    type: 'particles' | 'glow' | 'pulse' | 'shake',
    target: HTMLElement,
    duration: number,
    intensity: 'low' | 'medium' | 'high',
    color: string,
    size: number
}
```

## Implementação Detalhada

### 1. Sistema de Animações CSS

**Keyframes Principais:**
```css
@keyframes buttonPress {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}

@keyframes modalFadeIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
}

@keyframes toastSlideIn {
    0% { transform: translateY(100px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

@keyframes celebrationPulse {
    0% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.2); filter: brightness(1.5); }
    100% { transform: scale(1); filter: brightness(1); }
}
```

### 2. Sistema de Partículas para Celebração

**Implementação com Canvas:**
```javascript
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
    }
    
    createCelebrationBurst(x, y, color = '#92F428') {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, color));
        }
        this.animate();
    }
}
```

### 3. Feedback Tátil

**Implementação com Vibration API:**
```javascript
class HapticFeedback {
    static light() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    static medium() {
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    static success() {
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
}
```

### 4. Sistema de Toast Responsivo

**HTML Structure:**
```html
<div id="toast-container">
    <!-- Toasts serão inseridos aqui dinamicamente -->
</div>
```

**CSS Responsivo:**
```css
#toast-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    max-width: 90vw;
}

.toast {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    margin-bottom: 10px;
    backdrop-filter: blur(10px);
    animation: toastSlideIn 0.3s ease-out;
}
```

## Estratégia de Implementação

### Fase 1: Animações Básicas (1-2 dias)
- Implementar animações CSS para botões
- Adicionar transições suaves para modais
- Configurar feedback tátil básico

### Fase 2: Sistema de Notificações (1-2 dias)
- Criar NotificationSystem class
- Implementar diferentes tipos de toast
- Adicionar sistema de fila e auto-dismiss

### Fase 3: Efeitos Visuais (2-3 dias)
- Implementar sistema de partículas
- Criar efeitos de celebração para captura
- Melhorar animações da barra de progresso

### Fase 4: Responsividade (1-2 dias)
- Implementar adaptação para diferentes telas
- Otimizar para orientação landscape/portrait
- Ajustar elementos para diferentes densidades de pixel

### Fase 5: Polimento (1 dia)
- Ajustar timings e easings
- Otimizar performance
- Testes em diferentes dispositivos

## Considerações de Performance

### Otimizações CSS
- Usar `transform` e `opacity` para animações (GPU-accelerated)
- Evitar animações de propriedades que causam reflow
- Usar `will-change` para elementos que serão animados

### Otimizações JavaScript
- Debounce para eventos de resize
- RequestAnimationFrame para animações customizadas
- Cleanup de event listeners e timers

### Detecção de Capacidades
```javascript
const deviceCapabilities = {
    supportsVibration: 'vibrate' in navigator,
    supportsTouch: 'ontouchstart' in window,
    isHighDPI: window.devicePixelRatio > 1,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};
```

## Testes e Validação

### Testes de Animação
- Verificar suavidade em dispositivos de baixa performance
- Testar em diferentes navegadores
- Validar acessibilidade (prefers-reduced-motion)

### Testes de Responsividade
- Testar em diferentes tamanhos de tela
- Verificar orientação landscape/portrait
- Validar em dispositivos reais

### Testes de UX
- Tempo de resposta das animações
- Clareza das notificações
- Intuitividade das interações