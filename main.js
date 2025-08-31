import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

AFRAME.registerComponent('game-manager', {
    init: function () {
        this.CAPTURE_RADIUS = 15;
        this.CAPTURE_DURATION_NORMAL = 5000;
        this.CAPTURE_DURATION_STRONG = 8000;
        this.INVENTORY_LIMIT = 5;
        this.CONTAINMENT_UNIT_ID = "GHOSTBUSTERS_CONTAINMENT_UNIT_01";
        this.ECTO1_UNLOCK_COUNT = 5;

        this.firebaseConfig = {
            apiKey: "AIzaSyC8DE4F6mU9oyRw8cLU5vcfxOp5RxLcgHA",
            authDomain: "ghostbusters-ar-game.firebaseapp.com",
            databaseURL: "https://ghostbusters-ar-game-default-rtdb.firebaseio.com",
            projectId: "ghostbusters-ar-game",
            storageBucket: "ghostbusters-ar-game.appspot.com",
            messagingSenderId: "4705887791",
            appId: "1:4705887791:web:a1a4e360fb9f8415be08da"
        };

        this.locations = {
            "Praça Central": { lat: -27.630913, lon: -48.679793 },
            "Parque da Cidade": { lat: -27.639797, lon: -48.667749 },
            "Casa do Vô": { lat: -27.51563471648395, lon: -48.64996016391755 }
        };
        this.ECTO1_POSITION = {};

        this.bindMethods();
        this.initializeDOMElements();
        this.initializeApp();
        this.addEventListeners();

        this.gameInitialized = false;
        this.hitTestSource = null;
        this.placedObjects = { ghost: false, ecto1: false };
        this.currentUser = null;
        this.selectedLocation = null;
        this.objectToPlace = null;
        this.isCapturing = false;
        this.captureTimer = null;
        this.progressInterval = null;
        this.inventory = [];
        this.map = null;
        this.playerMarker = null;
        this.ghostMarker = null;
        this.ecto1Marker = null;
        this.ghostData = {};
        this.userStats = { points: 0, captures: 0, ecto1Unlocked: false };
        this.html5QrCode = null;
        this.currentRotatorEntity = null; // Novo: para controlar a animação de rotação do fantasma ativo
        this.currentBobberEntity = null; // Novo: para controlar a animação de flutuação do fantasma ativo
    },

    bindMethods: function () {
        this.saveUserToDatabase = this.saveUserToDatabase.bind(this);
        this.onAuthStateChanged = this.onAuthStateChanged.bind(this);
        this.updateInventoryUI = this.updateInventoryUI.bind(this);
        this.depositGhosts = this.depositGhosts.bind(this);
        this.onScanSuccess = this.onScanSuccess.bind(this);
        this.startQrScanner = this.startQrScanner.bind(this);
        this.stopQrScanner = this.stopQrScanner.bind(this);
        this.showNotification = this.showNotification.bind(this);
        this.hideNotification = this.hideNotification.bind(this);
        this.initGame = this.initGame.bind(this);
        this.initMap = this.initMap.bind(this);
        this.showEcto1OnMap = this.showEcto1OnMap.bind(this);
        this.generateGhost = this.generateGhost.bind(this);
        this.startGps = this.startGps.bind(this);
        this.onGpsUpdate = this.onGpsUpdate.bind(this);
        this.checkProximity = this.checkProximity.bind(this);
        this.startCapture = this.startCapture.bind(this);
        this.cancelCapture = this.cancelCapture.bind(this);
        this.ghostCaptured = this.ghostCaptured.bind(this);
        this.setupHitTest = this.setupHitTest.bind(this);
        this.placeObject = this.placeObject.bind(this);
        this.tick = this.tick.bind(this);
    },

    initializeDOMElements: function () {
        this.loginScreen = document.getElementById('login-screen');
        this.locationScreen = document.getElementById('location-screen');
        this.enterButton = document.getElementById('enter-button');
        this.googleLoginButton = document.getElementById('google-login-button');
        this.gameUi = document.getElementById('game-ui');
        this.locationButtons = document.querySelectorAll('.location-button');
        this.minimapElement = document.getElementById('minimap');
        this.distanceInfo = document.getElementById('distance-info');
        this.inventoryIconContainer = document.getElementById('inventory-icon-container');
        this.inventoryModal = document.getElementById('inventory-modal');
        this.closeInventoryButton = document.getElementById('close-inventory-button');
        this.inventoryBadge = document.getElementById('inventory-badge');
        this.ghostList = document.getElementById('ghost-list');
        this.qrScannerScreen = document.getElementById('qr-scanner-screen');
        this.depositButton = document.getElementById('deposit-button');
        this.closeScannerButton = document.getElementById('close-scanner-button');
        this.reticle = document.getElementById('reticle');
        this.ghostComumEntity = document.getElementById('ghost-comum');
        this.ghostForteEntity = document.getElementById('ghost-forte');
        this.ghostComumRotator = document.getElementById('ghost-comum-rotator');
        this.ghostComumBobber = document.getElementById('ghost-comum-bobber');
        this.ghostForteRotator = document.getElementById('ghost-forte-rotator');
        this.ghostForteBobber = document.getElementById('ghost-forte-bobber');
        this.activeGhostEntity = null; // Novo: para rastrear o fantasma ativo
        this.ecto1Entity = document.getElementById('ecto-1');
        this.protonBeamSound = document.getElementById('proton-beam-sound');
        this.ghostCaptureSound = document.getElementById('ghost-capture-sound');
        this.inventoryFullSound = document.getElementById('inventory-full-sound');
        this.protonPackIcon = document.getElementById('proton-pack-icon');
        this.protonPackProgressBar = document.getElementById('proton-pack-progress-bar');
        this.protonPackProgressFill = document.getElementById('proton-pack-progress-fill');
        this.protonBeamEntity = document.getElementById('proton-beam-entity'); // Nova referência para o feixe de prótons
        this.notificationModal = document.getElementById('notification-modal');
        this.notificationMessage = document.getElementById('notification-message');
        this.notificationCloseButton = document.getElementById('notification-close-button');
    },

    initializeApp: function () {
        const app = initializeApp(this.firebaseConfig);
        this.auth = getAuth(app);
        this.database = getDatabase(app);
        this.provider = new GoogleAuthProvider();
        onAuthStateChanged(this.auth, this.onAuthStateChanged);
        this.googleLoginButton.style.display = 'block';
    },

    addEventListeners: function () {
        this.googleLoginButton.addEventListener('click', () => {
            if (window.animationManager) {
                window.animationManager.triggerHapticFeedback('button_press');
            }
            signInWithPopup(this.auth, this.provider);
        });
        this.enterButton.addEventListener('click', async () => {
            if (!this.selectedLocation) return;
            if (window.animationManager) {
                window.animationManager.arEnterHaptics();
            }
            try {
                await this.el.sceneEl.enterAR();
                // Notificação de boas-vindas ao AR
                setTimeout(() => {
                    showInfo("👻 Bem-vindo ao mundo AR! Procure por fantasmas ao seu redor.", 5000);
                }, 1000);
            } catch (e) { showError("Erro ao iniciar AR: " + e.message); }
        });
        this.locationButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (window.animationManager) {
                    window.animationManager.triggerHapticFeedback('button_press');
                }
                this.locationButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedLocation = this.locations[button.dataset.locationName];
                this.enterButton.disabled = false;
                this.enterButton.style.display = 'block';
            });
        });
        this.inventoryIconContainer.addEventListener('click', () => {
            // Usar o novo sistema de animações do inventário
            if (window.inventoryAnimations) {
                window.inventoryAnimations.openInventory();
            } else {
                // Fallback para o sistema antigo
                this.inventoryModal.classList.remove('hidden');
                if (window.animationManager) {
                    window.animationManager.triggerHapticFeedback('modal_open');
                }
            }
        });
        this.closeInventoryButton.addEventListener('click', () => {
            // Usar o novo sistema de animações do inventário
            if (window.inventoryAnimations) {
                window.inventoryAnimations.closeInventory();
            } else {
                // Fallback para o sistema antigo
                this.inventoryModal.classList.add('hidden');
                if (window.animationManager) {
                    window.animationManager.triggerHapticFeedback('button_press');
                }
            }
        });
        this.depositButton.addEventListener('click', () => {
            if (window.animationManager) {
                window.animationManager.triggerHapticFeedback('button_press');
            }
            this.startQrScanner();
        });
        this.closeScannerButton.addEventListener('click', () => {
            if (window.animationManager) {
                window.animationManager.triggerHapticFeedback('button_press');
            }
            this.stopQrScanner();
        });
        // Event listeners com prevenção de conflitos mouse/touch
        this.protonPackIcon.addEventListener('mousedown', (e) => {
            if (e.pointerType !== 'touch') { // Evitar conflito com touch
                this.startCapture();
            }
        });
        this.protonPackIcon.addEventListener('mouseup', (e) => {
            if (e.pointerType !== 'touch') {
                this.cancelCapture();
            }
        });
        this.protonPackIcon.addEventListener('mouseleave', (e) => {
            if (e.pointerType !== 'touch') {
                this.cancelCapture();
            }
        });
        
        // Touch events com prevenção de cancelamento imediato
        this.protonPackIcon.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevenir mouse events duplicados
            this.startCapture();
        });
        this.protonPackIcon.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Delay para evitar cancelamento imediato
            setTimeout(() => {
                this.cancelCapture();
            }, 50);
        });
        
        this.protonPackIcon.addEventListener('contextmenu', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
        });
        this.notificationCloseButton.addEventListener('click', () => {
            if (window.animationManager) {
                window.animationManager.triggerHapticFeedback('button_press');
            }
            this.hideNotification();
        });
        this.el.sceneEl.addEventListener('enter-vr', this.initGame);
    },

    showNotification: function (message) {
        this.notificationMessage.textContent = message;
        this.notificationModal.classList.remove('hidden');
        // Adicionar feedback tátil para notificações
        if (window.animationManager) {
            window.animationManager.triggerHapticFeedback('notification');
        }
    },

    hideNotification: function () {
        this.notificationModal.classList.add('hidden');
        if (window.animationManager) {
            window.animationManager.triggerHapticFeedback('button_press');
        }
    },

    saveUserToDatabase: function (user) {
        const userRef = ref(this.database, 'users/' + user.uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                this.userStats = snapshot.val();
                this.inventory = this.userStats.inventory || [];
            } else {
                const newUserStats = { displayName: user.displayName, email: user.email, points: 0, captures: 0, level: 1, inventory: [], ecto1Unlocked: false };
                set(userRef, newUserStats);
                this.userStats = newUserStats;
                this.inventory = [];
            }
            this.updateInventoryUI();
        });
    },

    onAuthStateChanged: function (user) {
        if (user) {
            this.currentUser = user;
            this.saveUserToDatabase(user);
            // Usar animação de transição de tela
            if (window.animationManager) {
                window.animationManager.animateScreenTransition(this.loginScreen, this.locationScreen, 'right');
            } else {
                this.loginScreen.classList.add('hidden');
                this.locationScreen.classList.remove('hidden');
            }
        } else {
            this.currentUser = null;
            if (window.animationManager) {
                window.animationManager.animateScreenTransition(this.locationScreen, this.loginScreen, 'left');
                window.animationManager.animateScreenTransition(this.gameUi, this.loginScreen, 'left');
            } else {
                this.loginScreen.classList.remove('hidden');
                this.locationScreen.classList.add('hidden');
                this.gameUi.classList.add('hidden');
            }
            this.googleLoginButton.style.display = 'block';
        }
    },

    updateInventoryUI: function () {
        this.inventoryBadge.innerText = `${this.inventory.length}/${this.INVENTORY_LIMIT}`;

        // Atualizar estado visual do inventário
        if (window.animationManager) {
            window.animationManager.setInventoryFullState(this.inventory.length >= this.INVENTORY_LIMIT);
        }

        // Usar sistema de indicadores dinâmicos
        if (window.dynamicIndicators) {
            window.dynamicIndicators.updateInventoryIndicator(this.inventory.length, this.INVENTORY_LIMIT);
        }

        // Usar o novo sistema de animações do inventário
        if (window.inventoryAnimations) {
            window.inventoryAnimations.updateGhostList(this.inventory);
        } else {
            // Fallback para o sistema antigo
            this.ghostList.innerHTML = '';
            if (this.inventory.length === 0) {
                this.ghostList.innerHTML = '<li>Inventário vazio.</li>';
                this.depositButton.style.display = 'none';
            } else {
                this.inventory.forEach(ghost => {
                    const li = document.createElement('li');
                    li.textContent = `${ghost.type} (Pontos: ${ghost.points}) - ID: ${ghost.id}`;
                    this.ghostList.appendChild(li);
                });
                this.depositButton.style.display = 'block';
            }
        }

        // Mostrar/esconder botão de depósito
        if (this.inventory.length === 0) {
            this.depositButton.style.display = 'none';
        } else {
            this.depositButton.style.display = 'block';
        }
    },

    depositGhosts: function () {
        this.inventory = [];
        const userRef = ref(this.database, 'users/' + this.currentUser.uid);
        update(userRef, { inventory: this.inventory });
        this.updateInventoryUI();

        // Feedback tátil para sucesso do depósito
        if (window.animationManager) {
            window.animationManager.triggerHapticFeedback('success');
        }

        // Mostrar indicador de sucesso para depósito
        if (window.dynamicIndicators) {
            window.dynamicIndicators.showSuccessIndicator('deposit');
        }

        showSuccess("Fantasmas depositados com sucesso!");
        this.generateGhost();
    },

    onScanSuccess: function (decodedText, decodedResult) {
        this.stopQrScanner();
        if (decodedText === this.CONTAINMENT_UNIT_ID) {
            this.depositGhosts();
        } else {
            // Feedback tátil para QR Code inválido e efeito visual
            if (window.animationManager) {
                window.animationManager.triggerHapticFeedback('error');
                window.animationManager.addHapticErrorEffect('#qr-reader');
            }
            showError("QR Code inválido!");
        }
    },

    startQrScanner: async function () {
        // Fechar inventário com animação
        if (window.inventoryAnimations) {
            window.inventoryAnimations.closeInventory();
        } else {
            this.inventoryModal.classList.add('hidden');
        }

        if (this.el.sceneEl.is('ar-mode')) {
            try {
                // exitVR() é a função correta para sair de sessões AR e VR.
                await this.el.sceneEl.exitVR();
            } catch (e) {
                console.error("Falha ao sair do modo AR.", e);
            }
        }

        // Adiciona um pequeno atraso para garantir que o navegador libere a câmera.
        setTimeout(() => {
            // Usar animação de transição para o scanner
            if (window.animationManager) {
                window.animationManager.animateScreenTransition(this.gameUi, this.qrScannerScreen, 'right');
            } else {
                this.gameUi.classList.add('hidden');
                this.qrScannerScreen.classList.remove('hidden');
            }

            this.html5QrCode = new Html5Qrcode("qr-reader");
            this.html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                this.onScanSuccess,
                () => { }
            ).catch(err => {
                showError("Erro ao iniciar scanner de QR Code. Verifique as permissões da câmera no navegador.");
                this.stopQrScanner();
            });
        }, 200); // Atraso de 200ms
    },

    stopQrScanner: function () {
        if (this.html5QrCode && this.html5QrCode.isScanning) {
            this.html5QrCode.stop().catch(err => console.warn("Falha ao parar o scanner de QR.", err));
        }
        this.qrScannerScreen.classList.add('hidden');
        // Retorna à tela de seleção de local para permitir re-entrar no modo AR de forma limpa.
        this.locationScreen.classList.remove('hidden');
        this.gameUi.classList.add('hidden');
    },

    initGame: function () {
        this.gameInitialized = true;
        // Usar animação de transição para entrar no jogo
        if (window.animationManager) {
            window.animationManager.animateScreenTransition(this.locationScreen, this.gameUi, 'right');
        } else {
            this.locationScreen.classList.add('hidden');
            this.gameUi.classList.remove('hidden');
        }
        this.initMap();
        this.setupHitTest();
    },

    initMap: function () {
        // Garante que o mapa anterior seja removido antes de inicializar um novo.
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        this.ECTO1_POSITION = { lat: this.selectedLocation.lat + 0.0005, lon: this.selectedLocation.lon - 0.0005 };
        this.map = L.map(this.minimapElement).setView([this.selectedLocation.lat, this.selectedLocation.lon], 18);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        if (this.userStats.ecto1Unlocked) this.showEcto1OnMap();
        this.generateGhost();
        this.startGps();
    },

    showEcto1OnMap: function () {
        const ectoIcon = L.divIcon({ className: 'ecto-marker', html: '<div style="font-size: 20px;">🚗</div>', iconSize: [20, 20] });
        if (!this.ecto1Marker) {
            this.ecto1Marker = L.marker([this.ECTO1_POSITION.lat, this.ECTO1_POSITION.lon], { icon: ectoIcon }).addTo(this.map);
        }
    },

    generateGhost: function () {
        if (this.inventory.length >= this.INVENTORY_LIMIT) {
            this.distanceInfo.innerText = "Inventário Cheio!";
            if (this.ghostMarker) this.ghostMarker.remove();
            return;
        }
        const radius = 0.0001;
        const isStrong = Math.random() < 0.25;
        this.ghostData = {
            lat: this.selectedLocation.lat + (Math.random() - 0.5) * radius * 2,
            lon: this.selectedLocation.lon + (Math.random() - 0.5) * radius * 2,
            type: isStrong ? 'Fantasma Forte' : 'Fantasma Comum',
            points: isStrong ? 25 : 10,
            captureDuration: isStrong ? this.CAPTURE_DURATION_STRONG : this.CAPTURE_DURATION_NORMAL
        };

        const iconUrl = isStrong ? 'assets/images/pke_meter.png' : 'assets/images/logo.png';
        const ghostIcon = L.icon({ iconUrl: iconUrl, iconSize: [35, 35] });
        if (this.ghostMarker) this.ghostMarker.setLatLng([this.ghostData.lat, this.ghostData.lon]).setIcon(ghostIcon);
        else this.ghostMarker = L.marker([this.ghostData.lat, this.ghostData.lon], { icon: ghostIcon }).addTo(this.map);
    },

    startGps: function () {
        navigator.geolocation.watchPosition(this.onGpsUpdate,
            () => { showError("Não foi possível obter sua localização."); },
            { enableHighAccuracy: true }
        );
    },

    onGpsUpdate: function (position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        if (!this.playerMarker) {
            const playerIcon = L.divIcon({ className: 'player-marker', html: '<div style="background-color: #92F428; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>', iconSize: [15, 15] });
            this.playerMarker = L.marker([userLat, userLon], { icon: playerIcon }).addTo(this.map);
        } else {
            this.playerMarker.setLatLng([userLat, userLon]);
        }
        this.map.setView([userLat, userLon], this.map.getZoom());
        this.checkProximity(userLat, userLon);
    },

    checkProximity: function (userLat, userLon) {
        const R = 6371e3;
        let isNearObject = false;

        if (this.inventory.length < this.INVENTORY_LIMIT && this.ghostData && this.ghostData.lat) {
            const dPhiGhost = (this.ghostData.lat - userLat) * Math.PI / 180;
            const dLambdaGhost = (this.ghostData.lon - userLon) * Math.PI / 180;
            const aGhost = Math.sin(dPhiGhost / 2) * Math.sin(dPhiGhost / 2) + Math.cos(userLat * Math.PI / 180) * Math.cos(this.ghostData.lat * Math.PI / 180) * Math.sin(dLambdaGhost / 2) * Math.sin(dLambdaGhost / 2);
            const distanceGhost = R * (2 * Math.atan2(Math.sqrt(aGhost), Math.sqrt(1 - aGhost)));

            // Atualizar indicadores de proximidade dinâmicos
            if (window.dynamicIndicators) {
                window.dynamicIndicators.updateProximityIndicator(distanceGhost, 100);
            }

            if (distanceGhost <= this.CAPTURE_RADIUS) {
                // Feedback tátil apenas na primeira vez que fica próximo
                if (!this.objectToPlace && window.animationManager) {
                    window.animationManager.ghostNearbyHaptics();
                    window.animationManager.setGhostNearbyState(true);
                }
                this.objectToPlace = 'ghost';
                this.activeGhostEntity = this.ghostData.type === 'Fantasma Forte' ? this.ghostForteEntity : this.ghostComumEntity;
                this.distanceInfo.innerText = `FANTASMA ${this.ghostData.type.toUpperCase()} PRÓXIMO!`;
                this.distanceInfo.style.color = "#ff0000";
                isNearObject = true;
            } else {
                this.distanceInfo.innerText = `Fantasma: ${distanceGhost.toFixed(0)}m`;
                this.distanceInfo.style.color = "#92F428";
            }
        }

        if (this.userStats.ecto1Unlocked && !isNearObject) {
            const dPhiEcto = (this.ECTO1_POSITION.lat - userLat) * Math.PI / 180;
            const dLambdaEcto = (this.ECTO1_POSITION.lon - userLon) * Math.PI / 180;
            const aEcto = Math.sin(dPhiEcto / 2) * Math.sin(dPhiEcto / 2) + Math.cos(userLat * Math.PI / 180) * Math.cos(this.ECTO1_POSITION.lat * Math.PI / 180) * Math.sin(dLambdaEcto / 2) * Math.sin(dLambdaEcto / 2);
            const distanceEcto = R * (2 * Math.atan2(Math.sqrt(aEcto), Math.sqrt(1 - aEcto)));

            if (distanceEcto <= this.CAPTURE_RADIUS) {
                // Feedback tátil apenas na primeira vez que fica próximo do Ecto-1
                if (this.objectToPlace !== 'ecto1' && window.animationManager) {
                    window.animationManager.triggerHapticFeedback('success');
                }
                this.objectToPlace = 'ecto1';
                this.distanceInfo.innerText = "ECTO-1 PRÓXIMO! OLHE AO REDOR!";
                this.distanceInfo.style.color = "#00aaff";
                isNearObject = true;
            }
        }

        if (!isNearObject) {
            this.objectToPlace = null;
            this.activeGhostEntity = null;
            // Remover efeito visual de fantasma próximo
            if (window.animationManager) {
                window.animationManager.setGhostNearbyState(false);
            }
        }
    },

    startCapture: function () {
        if (this.isCapturing || !this.placedObjects.ghost || this.inventory.length >= this.INVENTORY_LIMIT) return;

        // Pausa as animações do fantasma
        if (this.currentRotatorEntity && this.currentBobberEntity) {
            this.currentRotatorEntity.components.animation__rotation.pause();
            this.currentBobberEntity.components.animation__bob.pause();
        }

        this.isCapturing = true;
        this.captureStartTime = Date.now(); // Marcar o tempo de início da captura
        this.protonBeamSound.play();
        this.protonBeamEntity.setAttribute('visible', true); // Mostra o feixe de prótons

        // Iniciar feedback tátil de captura e efeito visual
        if (window.animationManager) {
            window.animationManager.startCaptureHaptics();
            window.animationManager.setCapturingState(true);
        }

        // Mostrar indicador de captura
        if (window.dynamicIndicators) {
            window.dynamicIndicators.showCaptureIndicator(0);
        }

        // Iniciar efeito visual do feixe de prótons
        if (window.visualEffectsSystem) {
            window.visualEffectsSystem.startProtonBeamEffect();
        }

        // Adicionar classe CSS para efeito visual adicional
        const protonPackIcon = document.getElementById('proton-pack-icon');
        if (protonPackIcon) {
            protonPackIcon.classList.add('capturing-glow');
        }

        // Define os pontos de início e fim do feixe em coordenadas relativas à câmera
        const startPoint = new THREE.Vector3(0.15, -0.4, -0.5); // Ponta da pistola
        const endPoint = new THREE.Vector3(0, 0, -10); // Centro da tela, 10m de distância

        // Calcula o vetor do feixe, seu comprimento e ponto médio
        const beamVector = new THREE.Vector3().subVectors(endPoint, startPoint);
        const beamLength = beamVector.length();
        const beamMidpoint = new THREE.Vector3().addVectors(startPoint, endPoint).divideScalar(2);

        // Define a altura e posição do cilindro
        this.protonBeamEntity.setAttribute('geometry', { height: beamLength });
        this.protonBeamEntity.object3D.position.copy(beamMidpoint);

        // Calcula a rotação para alinhar o cilindro (que por padrão aponta para cima) com o vetor do feixe
        const cylinderUp = new THREE.Vector3(0, 1, 0); // Eixo Y padrão do cilindro
        const quaternion = new THREE.Quaternion().setFromUnitVectors(cylinderUp, beamVector.normalize());
        this.protonBeamEntity.object3D.quaternion.copy(quaternion);

        // Usar o novo sistema avançado de animações da barra de progresso
        const duration = this.ghostData.captureDuration;

        if (window.progressBarAnimations) {
            // Adicionar efeito visual ao ícone do proton pack
            this.protonPackIcon.classList.add('capturing');

            window.progressBarAnimations.startProgress(
                duration,
                // Callback de conclusão
                () => {
                    this.ghostCaptured();
                },
                // Callback de atualização
                (progress, normalizedProgress) => {
                    // Atualizar indicador de captura dinâmico
                    if (window.dynamicIndicators) {
                        window.dynamicIndicators.showCaptureIndicator(progress);
                    }

                    // Efeitos especiais baseados no progresso
                    if (progress > 50 && progress <= 80) {
                        this.protonPackProgressBar.classList.add('phase-middle');
                        this.protonPackProgressBar.classList.remove('phase-start');
                    } else if (progress > 80) {
                        this.protonPackProgressBar.classList.add('phase-critical');
                        this.protonPackProgressBar.classList.remove('phase-middle');

                        // Feedback tátil mais intenso na fase crítica
                        if (window.animationManager && Math.random() < 0.3) {
                            window.animationManager.triggerHapticFeedback('medium');
                        }
                    } else {
                        this.protonPackProgressBar.classList.add('phase-start');
                    }
                }
            );
        } else {
            // Fallback para o sistema antigo
            this.protonPackProgressBar.style.display = 'block';
            let startTime = Date.now();

            this.progressInterval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                this.protonPackProgressFill.style.height = `${progress * 100}%`;
            }, 100);

            this.captureTimer = setTimeout(() => {
                this.ghostCaptured();
            }, duration);
        }
    },

    cancelCapture: function () {
        if (!this.isCapturing) return;
        
        // Prevenir cancelamento imediato (delay mínimo de 300ms)
        const minCaptureTime = 300;
        const elapsedTime = Date.now() - (this.captureStartTime || 0);
        
        if (elapsedTime < minCaptureTime) {
            console.log('🚫 Cancelamento muito rápido, ignorando...', elapsedTime + 'ms');
            return;
        }
        
        console.log('✅ Cancelando captura após', elapsedTime + 'ms');
        this.isCapturing = false;
        this.protonBeamSound.pause();
        this.protonBeamSound.currentTime = 0;
        this.protonBeamEntity.setAttribute('visible', false); // Esconde o feixe de prótons

        // Cancelar timers antigos (fallback)
        clearTimeout(this.captureTimer);
        clearInterval(this.progressInterval);

        // Usar o novo sistema de animações se disponível
        if (window.progressBarAnimations) {
            window.progressBarAnimations.cancelProgress();
        } else {
            // Fallback para o sistema antigo
            this.protonPackProgressBar.style.display = 'none';
            this.protonPackProgressFill.style.height = '0%';
        }

        // Remover classes visuais
        this.protonPackIcon.classList.remove('capturing');
        this.protonPackProgressBar.classList.remove('phase-start', 'phase-middle', 'phase-critical');

        // Parar feedback tátil de captura e efeito visual
        if (window.animationManager) {
            window.animationManager.stopCaptureHaptics();
            window.animationManager.setCapturingState(false);
        }

        // Esconder indicador de captura
        if (window.dynamicIndicators) {
            window.dynamicIndicators.hideCaptureIndicator();
        }
        }

        // Parar efeito visual do feixe de prótons
        if (window.visualEffectsSystem) {
            window.visualEffectsSystem.stopProtonBeamEffect();

            // NOVO: Efeito visual de falha na captura
            console.log('💥 Tentando ativar efeito de falha...', !!this.activeGhostEntity);
            if (this.activeGhostEntity) {
                const ghostPosition = this.getGhostScreenPosition();
                console.log('👻 Posição do fantasma para falha:', ghostPosition);
                window.visualEffectsSystem.showCaptureFailEffect(ghostPosition.x, ghostPosition.y);
                console.log('💥 Efeito de falha ativado!');
            }
        }

        // Remover classe CSS de efeito visual e adicionar efeito de falha
        const protonPackIcon = document.getElementById('proton-pack-icon');
        if (protonPackIcon) {
            protonPackIcon.classList.remove('capturing-glow');
            // Adicionar efeito visual de falha
            protonPackIcon.classList.add('capture-fail-shake');
            setTimeout(() => {
                protonPackIcon.classList.remove('capture-fail-shake');
            }, 500);
        }

        // Feedback tátil de erro
        if (window.animationManager) {
            window.animationManager.triggerHapticFeedback('error');
        }

        // Retoma as animações do fantasma
        if (this.currentRotatorEntity && this.currentBobberEntity) {
            this.currentRotatorEntity.components.animation__rotation.play();
            this.currentBobberEntity.components.animation__bob.play();
        }

        // Mostrar mensagem de falha
        showError("Captura falhou! O fantasma escapou!");
    },

    ghostCaptured: function () {
        this.cancelCapture();
        this.ghostCaptureSound.play(); // Som de captura bem-sucedida

        // Feedback tátil de sucesso na captura e efeito visual
        if (window.animationManager) {
            window.animationManager.captureSuccessHaptics();
            window.animationManager.addHapticSuccessEffect('#proton-pack-icon');
        }

        // Mostrar indicador de sucesso
        if (window.dynamicIndicators) {
            window.dynamicIndicators.showSuccessIndicator('capture');
        }

        // Efeitos visuais de celebração e sucção
        console.log('🎮 Tentando ativar efeitos visuais...', !!window.visualEffectsSystem);
        if (window.visualEffectsSystem) {
            // Efeito de sucção do fantasma para a proton pack
            const ghostPosition = this.getGhostScreenPosition();
            const protonPackPosition = this.getProtonPackScreenPosition();

            console.log('👻 Posição do fantasma:', ghostPosition);
            console.log('🔫 Posição da proton pack:', protonPackPosition);

            window.visualEffectsSystem.showSuctionEffect(
                ghostPosition.x, ghostPosition.y,
                protonPackPosition.x, protonPackPosition.y
            );
            console.log('✨ Efeito de sucção ativado!');

            // Efeito de celebração após um pequeno delay
            setTimeout(() => {
                window.visualEffectsSystem.showCelebrationEffect(
                    protonPackPosition.x, protonPackPosition.y,
                    'ghost_captured'
                );
                console.log('🎉 Efeito de celebração ativado!');
            }, 500);
        } else {
            console.error('❌ Sistema de efeitos visuais não disponível!');
        }

        if (this.activeGhostEntity) {
            this.activeGhostEntity.setAttribute('visible', false);
        }
        this.placedObjects.ghost = false;
        this.objectToPlace = null;

        // Limpa as referências das entidades de animação do fantasma capturado
        this.currentRotatorEntity = null;
        this.currentBobberEntity = null;

        this.inventory.push({ id: Date.now(), type: this.ghostData.type, points: this.ghostData.points });
        this.userStats.points += this.ghostData.points;
        this.userStats.captures += 1;
        this.updateInventoryUI();

        // Celebração para novo fantasma no inventário
        if (window.inventoryAnimations) {
            window.inventoryAnimations.celebrateNewGhost();
        }

        let captureMessage = `Fantasma capturado! Você agora tem ${this.userStats.points} pontos.`;

        if (this.inventory.length === this.INVENTORY_LIMIT) {
            this.inventoryFullSound.play(); // Som de inventário cheio
            // Feedback tátil para inventário cheio e efeito visual
            if (window.animationManager) {
                window.animationManager.inventoryFullHaptics();
                window.animationManager.setInventoryFullState(true);
            }
            // Efeito visual especial no inventário
            if (window.inventoryAnimations) {
                window.inventoryAnimations.showInventoryFullEffect();
            }
            // Notificação de inventário cheio
            showWarning("Inventário cheio! Encontre uma Unidade de Contenção para depositar os fantasmas.", 6000);
        }

        if (this.userStats.captures >= this.ECTO1_UNLOCK_COUNT && !this.userStats.ecto1Unlocked) {
            this.userStats.ecto1Unlocked = true;
            this.showEcto1OnMap();

            // Efeito visual especial para o Ecto-1
            if (window.visualEffectsSystem) {
                setTimeout(() => {
                    window.visualEffectsSystem.showCelebrationEffect(
                        window.innerWidth / 2,
                        window.innerHeight / 2,
                        'ecto1_unlocked'
                    );
                }, 1000);
            }

            // Notificação especial para o Ecto-1
            setTimeout(() => {
                showSuccess("🚗 ECTO-1 DESBLOQUEADO! Você ouve um barulho de motor familiar... Algo especial apareceu no mapa!", 8000);
            }, 2000);
        }

        const userRef = ref(this.database, 'users/' + this.currentUser.uid);
        update(userRef, { points: this.userStats.points, captures: this.userStats.captures, inventory: this.inventory, ecto1Unlocked: this.userStats.ecto1Unlocked });

        showSuccess(captureMessage);
        this.generateGhost();
    },

    /**
     * Obtém a posição do fantasma na tela
     */
    getGhostScreenPosition: function () {
        // Posição padrão no centro da tela se não conseguir obter a posição real
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;

        // Tentar obter posição real do fantasma se disponível
        if (this.activeGhostEntity && this.activeGhostEntity.object3D) {
            const camera = this.el.sceneEl.camera;
            const ghostWorldPosition = this.activeGhostEntity.object3D.position.clone();

            // Converter posição 3D para coordenadas de tela
            ghostWorldPosition.project(camera);

            x = (ghostWorldPosition.x * 0.5 + 0.5) * window.innerWidth;
            y = (ghostWorldPosition.y * -0.5 + 0.5) * window.innerHeight;
        }

        return { x, y };
    },

    /**
     * Obtém a posição da proton pack na tela
     */
    getProtonPackScreenPosition: function () {
        const protonPackIcon = document.getElementById('proton-pack-icon');

        if (protonPackIcon) {
            const rect = protonPackIcon.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }

        // Posição padrão no canto inferior direito
        return {
            x: window.innerWidth - 80,
            y: window.innerHeight - 80
        };
    },

    /**
     * Limpa todos os efeitos visuais ativos
     */
    clearAllVisualEffects: function () {
        if (window.visualEffectsSystem) {
            window.visualEffectsSystem.clearAllEffects();
        }
    },

    /**
     * Testa efeitos visuais (função de debug)
     */
    testVisualEffects: function () {
        if (!window.visualEffectsSystem) {
            console.warn('Sistema de efeitos visuais não disponível');
            return;
        }

        console.log('Testando efeitos visuais...');

        // Teste de celebração
        setTimeout(() => {
            window.visualEffectsSystem.showCelebrationEffect(
                window.innerWidth / 2,
                window.innerHeight / 2,
                'ghost_captured'
            );
            showSuccess('Teste: Efeito de celebração');
        }, 1000);

        // Teste de sucção
        setTimeout(() => {
            const ghostPos = this.getGhostScreenPosition();
            const protonPos = this.getProtonPackScreenPosition();
            window.visualEffectsSystem.showSuctionEffect(
                ghostPos.x, ghostPos.y,
                protonPos.x, protonPos.y
            );
            showInfo('Teste: Efeito de sucção');
        }, 3000);

        // Teste de feixe de prótons
        setTimeout(() => {
            window.visualEffectsSystem.startProtonBeamEffect();
            showWarning('Teste: Feixe de prótons iniciado');

            setTimeout(() => {
                window.visualEffectsSystem.stopProtonBeamEffect();
                showInfo('Teste: Feixe de prótons parado');
            }, 2000);
        }, 5000);

        // Teste de falha
        setTimeout(() => {
            window.visualEffectsSystem.showCaptureFailEffect(
                window.innerWidth / 2,
                window.innerHeight / 2
            );
            showError('Teste: Efeito de falha na captura');
        }, 8000);

        // Teste do Ecto-1
        setTimeout(() => {
            window.visualEffectsSystem.showCelebrationEffect(
                window.innerWidth / 2,
                window.innerHeight / 2,
                'ecto1_unlocked'
            );
            showSuccess('Teste: Efeito especial do Ecto-1');
        }, 10000);
    },

    setupHitTest: async function () {
        const session = this.el.sceneEl.renderer.xr.getSession();
        const referenceSpace = await session.requestReferenceSpace('viewer');
        this.hitTestSource = await session.requestHitTestSource({ space: referenceSpace });
    },

    tick: function (time, timeDelta) {
        if (!this.gameInitialized || !this.hitTestSource) return;

        const frame = this.el.sceneEl.renderer.xr.getFrame();
        if (!frame) return;

        const hitTestResults = frame.getHitTestResults(this.hitTestSource);

        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(this.el.sceneEl.renderer.xr.getReferenceSpace());
            this.reticle.setAttribute('visible', true);
            this.reticle.object3D.matrix.fromArray(pose.transform.matrix);
            this.reticle.object3D.matrix.decompose(this.reticle.object3D.position, this.reticle.object3D.quaternion, this.reticle.object3D.scale);

            // Posicionamento automático
            if (this.objectToPlace && !this.placedObjects[this.objectToPlace]) {
                this.placeObject();
            }
        } else {
            this.reticle.setAttribute('visible', false);
        }
    },

    placeObject: function () {
        if (!this.objectToPlace || this.placedObjects[this.objectToPlace] || !this.reticle.getAttribute('visible')) return;

        let entityToPlace;
        if (this.objectToPlace === 'ghost') {
            entityToPlace = this.activeGhostEntity;
        } else if (this.objectToPlace === 'ecto1') {
            entityToPlace = this.ecto1Entity;
        }

        if (entityToPlace) {
            const pos = this.reticle.object3D.position;
            entityToPlace.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
            entityToPlace.setAttribute('visible', 'true');
            entityToPlace.setAttribute('scale', '0.5 0.5 0.5');

            // Determina qual tipo de fantasma está sendo colocado e inicia suas animações.
            let rotatorEntity, bobberEntity;
            if (this.activeGhostEntity === this.ghostComumEntity) {
                rotatorEntity = this.ghostComumRotator;
                bobberEntity = this.ghostComumBobber;
            } else if (this.activeGhostEntity === this.ghostForteEntity) {
                rotatorEntity = this.ghostForteRotator;
                bobberEntity = this.ghostForteBobber;
            }

            if (rotatorEntity && bobberEntity) {
                // Garante que as animações sejam reiniciadas e reproduzidas.
                rotatorEntity.components.animation__rotation.pause();
                rotatorEntity.components.animation__rotation.currentTime = 0;
                rotatorEntity.components.animation__rotation.play();

                bobberEntity.components.animation__bob.pause();
                bobberEntity.components.animation__bob.currentTime = 0;
                bobberEntity.components.animation__bob.play();
            }

            this.currentRotatorEntity = rotatorEntity; // Armazena a referência
            this.currentBobberEntity = bobberEntity;   // Armazena a referência

            this.placedObjects[this.objectToPlace] = true;
            this.reticle.setAttribute('visible', 'false');
        }
    }
});

// Função global para testar efeitos visuais (acessível via console)
window.testGhostbustersEffects = function () {
    console.log('🧪 Testando efeitos visuais...');
    console.log('Sistema disponível:', !!window.visualEffectsSystem);

    if (window.visualEffectsSystem) {
        // Teste básico de celebração
        console.log('🎉 Testando celebração...');
        window.visualEffectsSystem.showCelebrationEffect(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'ghost_captured'
        );

        // Teste de sucção
        setTimeout(() => {
            console.log('🌪️ Testando sucção...');
            window.visualEffectsSystem.showSuctionEffect(
                window.innerWidth / 2 - 100, window.innerHeight / 2 - 100,
                window.innerWidth / 2 + 100, window.innerHeight / 2 + 100
            );
        }, 2000);

        // Teste de falha
        setTimeout(() => {
            console.log('💥 Testando falha...');
            window.visualEffectsSystem.showCaptureFailEffect(
                window.innerWidth / 2,
                window.innerHeight / 2
            );
        }, 4000);

        if (window.showSuccess) {
            showSuccess('Efeitos visuais testados! Verifique o console.');
        }
        console.log('✅ Testes iniciados - verifique a tela!');
    } else {
        console.error('❌ Sistema de efeitos visuais não disponível');
        if (window.showError) {
            showError('Sistema de efeitos visuais não disponível!');
        }
    }
};

// Função para limpar todos os efeitos (acessível via console)
window.clearGhostbustersEffects = function () {
    if (window.visualEffectsSystem) {
        window.visualEffectsSystem.clearAllEffects();
        if (window.showInfo) {
            showInfo('Todos os efeitos visuais foram limpos');
        }
        console.log('Efeitos visuais limpos');
    } else {
        console.warn('Sistema de efeitos visuais não disponível');
    }
};

// Log de inicialização
console.log('🎮 Ghostbusters AR - Efeitos visuais integrados!');
console.log('💡 Use testGhostbustersEffects() no console para testar os efeitos');
console.log('🧹 Use clearGhostbustersEffects() no console para limpar os efeitos');