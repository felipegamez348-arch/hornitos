/* ============================================================
   DULCE - Panadería & Pastelería Artesanal
   Main JavaScript: AOS, GSAP, Navbar, WhatsApp, Drag & Drop Game
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const pageKey = (window.location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
    const heroPageKey = pageKey === 'delicias-del-horno' ? 'delicias' : pageKey;

    const heroConfigs = {
        index: {
            badges: [
                '✦ Panadería & Repostería de Autor',
                '✦ Sabor casero, tradición y calidad',
                '✦ Horneado hoy en Tocaima',
                '✦ Dulce Tentación en cada detalle'
            ],
            phraseParts: {
                starters: [
                    'Experiencias gastronómicas de autor horneadas a diario.',
                    'Cada bocado nace del cuidado de una receta hecha con cariño.',
                    'La cocina de Dulce Tentación combina tradición, dedicación y sabor.'
                ],
                middles: [
                    'Con ingredientes frescos y una elaboración minuciosa.',
                    'Con técnicas artesanales que se sienten en cada pieza.',
                    'Con la paciencia de una panadería que sabe lo que hace.'
                ],
                endings: [
                    'Todo pensado para hacer cada momento más dulce.',
                    'Y dejar un recuerdo memorable en cada mesa.',
                    'Porque el sabor auténtico siempre se nota desde el primer mordisco.'
                ]
            }
        },
        panaderia: {
            badges: [
                '✦ Masa Madre & Horno Tradicional',
                '✦ Pan recién hecho cada mañana',
                '✦ Arte casero en cada pieza',
                '✦ Tradición horneada con amor'
            ],
            phraseParts: {
                starters: [
                    'El aroma inconfundible del pan recién horneado.',
                    'Cada pieza llega con ese toque dorado y casero.',
                    'La masa reposada se transforma en una experiencia tibia y completa.'
                ],
                middles: [
                    'Cada pieza es elaborada a mano con masa reposada.',
                    'Todo se trabaja con paciencia, técnica y tradición.',
                    'Cada lote combina ingredientes frescos con un proceso artesanal.'
                ],
                endings: [
                    'Horneada al punto exacto de dorado.',
                    'Hecha para acompañar tus desayunos, meriendas y momentos más sabrosos.',
                    'Listo para despertar tus mejores recuerdos por la mañana.'
                ]
            }
        },
        reposteria: {
            badges: [
                '✦ Alta Pastelería & Decoración Fina',
                '✦ Repostería de autor con estilo',
                '✦ Detalles finos, sabores inolvidables',
                '✦ Celebraciones hechas con dulzura'
            ],
            phraseParts: {
                starters: [
                    'Diseños que celebran momentos inolvidables.',
                    'Cada torta se crea para transformar una fecha especial en un recuerdo.',
                    'La repostería de Dulce Tentación combina creatividad, calidad y pasión.'
                ],
                middles: [
                    'Texturas sedosas, ganaches premium y sabores que se sienten.',
                    'Ingredientes naturales y una presentación impecable en cada detalle.',
                    'Una elaboración cuidadosa para que cada porción se disfrute con orgullo.'
                ],
                endings: [
                    'Porque las mejores celebraciones se hacen con dulzura.',
                    'Y cada detalle cuenta cuando se trata de un momento especial.',
                    'Listo para ser el centro de una historia deliciosa.'
                ]
            }
        },
        delicias: {
            badges: [
                '✦ Antojos & Hojaldres Dulces',
                '✦ Pequeños placeres del horno',
                '✦ Delicias para cada momento',
                '✦ Dulce pausa, sabor auténtico'
            ],
            phraseParts: {
                starters: [
                    'Pequeños placeres que transforman cualquier momento.',
                    'Cada bocadito trae esa mezcla de dulzor, textura y tradición.',
                    'Las delicias del horno están pensadas para sorprenderte en cualquier instante.'
                ],
                middles: [
                    'Hojaldres caramelizados, bocados tradicionales y sabores irresistibles.',
                    'Preparaciones con un toque especial y una receta que se siente casera.',
                    'Una variedad de sabores pensada para conquistar cada paladar.'
                ],
                endings: [
                    'Ideal para acompañar una tarde, un café o un gesto de cariño.',
                    'Hechas para disfrutar despacio y volver por más.',
                    'Porque lo mejor a veces viene en una pequeña porción.'
                ]
            }
        }
    };

    const buildPhraseBank = (phraseParts, total = 1000) => {
        const bank = [];
        const { starters, middles, endings } = phraseParts;

        for (let i = 0; i < total; i++) {
            const starter = starters[Math.floor(Math.random() * starters.length)];
            const middle = middles[Math.floor(Math.random() * middles.length)];
            const ending = endings[Math.floor(Math.random() * endings.length)];
            bank.push(`${starter} ${middle} ${ending}`);
        }

        return bank;
    };

    const applyRandomHeroCopy = () => {
        const config = heroConfigs[heroPageKey];
        if (!config) return;

        const heroContainer = document.querySelector('.hero-velar-container');
        if (!heroContainer) return;

        const badge = heroContainer.querySelector('.velar-lead-badge');
        const paragraph = heroContainer.querySelector('p');

        if (badge && config.badges.length) {
            badge.textContent = config.badges[Math.floor(Math.random() * config.badges.length)];
        }

        if (paragraph) {
            const bank = buildPhraseBank(config.phraseParts, 1000);
            paragraph.textContent = bank[Math.floor(Math.random() * bank.length)];
        }
    };

    applyRandomHeroCopy();
    setInterval(applyRandomHeroCopy, 30000);

    // ==================== PRELOADER ====================
    const preloader = document.getElementById('preloader');
    const bakeriaIntro = document.getElementById('bakeria-intro');
    const introProgress = document.getElementById('intro-loading-progress');
    const introLoadingText = document.getElementById('intro-loading-text');
    const introPlayBtn = document.getElementById('intro-play-btn');
    const saveSlotScreen = document.getElementById('save-slot-screen');
    const characterScreen = document.getElementById('character-screen');
    const trainingScreen = document.getElementById('training-screen');
    const trainingStartBtn = document.getElementById('training-start-btn');

    function showGameScreen(screen) {
        [bakeriaIntro, saveSlotScreen, characterScreen, trainingScreen].forEach(item => {
            if (item) item.hidden = item !== screen;
        });
    }

    if (bakeriaIntro) {
        let introValue = 0;
        const introTimer = setInterval(() => {
            introValue = Math.min(100, introValue + Math.floor(Math.random() * 18) + 8);
            if (introProgress) introProgress.style.width = `${introValue}%`;
            if (introLoadingText) introLoadingText.textContent = introValue >= 100
                ? '¡La pastelería está lista!'
                : `Preparando la pastelería... ${introValue}%`;
            if (introValue >= 100) {
                clearInterval(introTimer);
                if (introLoadingText) introLoadingText.textContent = '¡La pastelería está lista!';
                if (introPlayBtn) introPlayBtn.hidden = false;
            }
        }, 180);
    }

    introPlayBtn?.addEventListener('click', () => showGameScreen(saveSlotScreen));
    document.querySelectorAll('.save-slot').forEach(slot => {
        slot.addEventListener('click', () => showGameScreen(characterScreen));
    });
    document.querySelectorAll('.character-option').forEach(option => {
        option.addEventListener('click', () => showGameScreen(trainingScreen));
    });
    trainingStartBtn?.addEventListener('click', () => {
        document.body.classList.add('game-mode');
        const cartTrigger = document.getElementById('cartTrigger');
        const whatsappButton = document.querySelector('.floating-whatsapp');
        const gameHeader = document.querySelector('.rush-header');
        const gameStatus = document.querySelector('.rush-status-row');
        const gameBoard = document.querySelector('.bakery-rush-wrapper');
        const referenceScene = document.querySelector('.reference-game-scene');
        if (cartTrigger) cartTrigger.style.display = 'none';
        if (whatsappButton) whatsappButton.style.display = 'none';
        if (gameHeader) gameHeader.style.display = 'none';
        if (gameStatus) gameStatus.style.display = 'none';
        if (referenceScene) referenceScene.style.pointerEvents = 'none';
        if (gameBoard) {
            gameBoard.style.width = '900px';
            gameBoard.style.maxWidth = '100vw';
            gameBoard.style.height = '620px';
            gameBoard.style.maxHeight = '100vh';
        }
        [bakeriaIntro, saveSlotScreen, characterScreen, trainingScreen].forEach(screen => {
            if (screen) {
                screen.hidden = true;
                screen.style.display = 'none';
            }
        });
        window.scrollTo(0, 0);
        showGameScreen(null);
    });
    document.querySelectorAll('.game-back-btn').forEach(button => {
        button.addEventListener('click', () => showGameScreen(button.dataset.back === 'save' ? saveSlotScreen : bakeriaIntro));
    });

    const hidePreloader = () => {
        if (!preloader) return;
        preloader.classList.add('hidden');
    };

    const shouldSpeakWelcome = () => {
        const normalizedPath = ((window.location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index').toLowerCase();
        return normalizedPath === 'index';
    };

    const playWelcomeVoice = () => {
        if (!shouldSpeakWelcome()) return;
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        const message = new SpeechSynthesisUtterance('Bienvenidos a Dulce Tentación');
        message.lang = 'es-ES';
        message.rate = 1;
        message.pitch = 1;

        window.speechSynthesis.speak(message);
    };

    if (document.readyState === 'complete') {
        setTimeout(playWelcomeVoice, 1750);
        setTimeout(hidePreloader, 1750);
    } else {
        window.addEventListener('load', () => {
            setTimeout(playWelcomeVoice, 1750);
            setTimeout(hidePreloader, 1750);
        });
    }

    // Fallback: asegúra que nunca se quede bloqueando la página
    setTimeout(hidePreloader, 1750);

    // ==================== AOS INIT ====================
    AOS.init({
        duration: 650,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
    });

    // Replace product sharing controls with compact quantity markers.
    document.querySelectorAll('.velar-actions button[onclick*="shareProduct"]').forEach((shareButton) => {
        const card = shareButton.closest('.velar-card');
        const productName = card?.querySelector('.velar-card-title')?.textContent.trim();
        const productImage = card?.querySelector('.velar-card-img-wrap img')?.getAttribute('src');
        const priceText = card?.querySelector('.velar-card-price')?.textContent || '';
        const productPrice = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
        const controls = document.createElement('span');
        controls.className = 'quantity-markers';
        controls.setAttribute('aria-label', 'Controles de cantidad');
        controls.innerHTML = `
            <button type="button" class="quantity-marker" aria-label="Añadir ${productName}" title="Añadir al carrito">+</button>
            <button type="button" class="quantity-marker" aria-label="Reducir ${productName}" title="Reducir del carrito">-</button>
        `;
        controls.querySelector('.quantity-marker:first-child').addEventListener('click', () => {
            window.agregar(productName, productPrice, productImage);
        });
        controls.querySelector('.quantity-marker:last-child').addEventListener('click', () => {
            window.disminuirPorNombre(productName);
        });
        shareButton.replaceWith(controls);
    });

    // ==================== PARTICLES ====================
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = 4 + Math.random() * 4 + 's';
            particle.style.width = 2 + Math.random() * 4 + 'px';
            particle.style.height = particle.style.width;
            particlesContainer.appendChild(particle);
        }
    }

    // ==================== NAVBAR SCROLL EFFECT ====================
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 60;

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    const loweredPromotions = document.getElementById('promociones');
    const projectSection = document.getElementById('proyecto');
    if (loweredPromotions && projectSection) {
        loweredPromotions.classList.add('promotions-lowered');
        projectSection.after(loweredPromotions);
    }

    // ==================== MOBILE MENU ====================
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Mobile dropdown toggle
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dd => {
        const toggle = dd.querySelector('.dropdown-toggle');
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dd.classList.toggle('open');
            }
        });
    });

    // ==================== GSAP ANIMATIONS ====================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Parallax on hero image
        gsap.to('.hero', {
            backgroundPositionY: '30%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            }
        });

        // Section headers entrance
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header, {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

    }

    // ==================== WHATSAPP FORM ====================
    const form = document.getElementById('whatsapp-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            const numero = '573105731569'; // Dulce Tentación Tocaima

            const texto = encodeURIComponent(
                `¡Hola Dulce Panadería! 🍞🍰\n\n` +
                `Soy *${nombre}*.\n` +
                `Mi teléfono: ${telefono}\n\n` +
                `Pedido/Mensaje:\n${mensaje}`
            );

            window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
        });
    }

    const cakeRequestForm = document.getElementById('cake-request-form');
    if (cakeRequestForm) {
        cakeRequestForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const flavor = document.getElementById('cake-request-flavor').value;
            const size = document.getElementById('cake-request-size').value;
            const details = document.getElementById('cake-request-details').value.trim();
            const ingredients = [...cakeRequestForm.querySelectorAll('input[name="cake-ingredient"]:checked')]
                .map(input => input.value);
            const selectedIngredients = ingredients.length ? ingredients.join(', ') : 'Por definir';
            const message = encodeURIComponent(
                `¡Hola Dulce Artesanal! 🎂\n\n` +
                `Quiero cotizar una torta personalizada:\n` +
                `• Sabor: ${flavor}\n` +
                `• Tamaño: ${size}\n` +
                `• Ingredientes/decoración: ${selectedIngredients}\n` +
                `• Así la quisiera: ${details}`
            );
            window.open(`https://wa.me/573105731569?text=${message}`, '_blank');
        });
    }

    // ==================== MINI-GAME: PAPA'S BAKERIA STYLE ====================
    const rushOrderEl = document.getElementById('rush-order');
    const rushQueueEl = document.getElementById('rush-queue');
    const rushTimerEl = document.getElementById('rush-timer');
    const rushScoreEl = document.getElementById('rush-score');
    const rushComboEl = document.getElementById('rush-combo');
    const rushStatusEl = document.getElementById('rush-status');
    const rushProgressEl = document.getElementById('rush-progress');
    const rushBakedItemEl = document.getElementById('rush-baked-item');
    const rushCustomerAvatarEl = document.getElementById('rush-customer-avatar');
    const rushCustomerNameEl = document.getElementById('rush-customer-name');
    const rushCustomerMessageEl = document.getElementById('rush-customer-message');
    const rushServeBtn = document.getElementById('rush-serve-btn');
    const rushResetBtn = document.getElementById('rush-reset-btn');
    const takeOrderBtn = document.getElementById('take-order-btn');
    const stationButtons = document.querySelectorAll('.station-btn');
    const stationTabs = document.querySelectorAll('.station-tab');
    const stationPanels = document.querySelectorAll('[data-station-panel]');
    const moldButtons = document.querySelectorAll('.mold-btn');
    const pourBatterBtn = document.getElementById('pour-batter-btn');
    const batterProgressEl = document.getElementById('batter-progress');
    const bakeBtn = document.getElementById('bake-btn');
    const bakeProgressEl = document.getElementById('bake-progress');
    const bakeStatusEl = document.getElementById('bake-status');
    const topPlacedToppingsEl = document.getElementById('top-placed-toppings');
    const topDecorationStatusEl = document.getElementById('top-decoration-status');
    const topCakeDropzone = document.getElementById('top-cake-dropzone');
    const deliverOrderBtn = document.getElementById('deliver-order-btn');
    const topCakeBaseContainer = document.getElementById('top-cake-base-container');

    const customerProfiles = [
        { name: 'Sofía', image: 'assets/images/sofia_abril.jpeg', mood: '😊' },
        { name: 'Mateo', image: 'assets/images/felipe_gamez.jpeg', mood: '🙂' },
        { name: 'Valentina', image: 'assets/images/karen_jimenez.jpeg', mood: '✨' },
        { name: 'Cristian', image: 'assets/images/danna_arias.jpeg', mood: '😄' },
        { name: 'Daniela', image: 'assets/images/pan aliniado.jpeg', mood: '🌟' }
    ];
    const orderPool = [
        { base: 'Chocolate', filling: 'Arequipe', topping: 'Fresas', icon: '🍰', label: 'Cumpleaños' },
        { base: 'Vainilla', filling: 'Crema', topping: 'Chispas', icon: '🧁', label: 'Fiesta' },
        { base: 'Red Velvet', filling: 'Ganache', topping: 'Cerezas', icon: '🍒', label: 'Especial' },
        { base: 'Chocolate', filling: 'Crema', topping: 'Fresas', icon: '🍫', label: 'Clásica' },
        { base: 'Vainilla', filling: 'Arequipe', topping: 'Cerezas', icon: '🍮', label: 'Premium' }
    ];

    const ingredientIcons = {
        Chocolate: '🍫',
        Vainilla: '🍞',
        'Red Velvet': '❤️',
        Arequipe: '🍯',
        Ganache: '🍫',
        Crema: '🧁',
        Fresas: '🍓',
        Chispas: '✨',
        Cerezas: '🍒'
    };

    const currentBuild = { base: '', filling: '', topping: '' };
    let selectedMold = 'Redondo';
    let batterReady = false;
    let bakedReady = false;
    let bakeTimer = null;
    let bakeProgress = 0;
    let orderTaken = false;
    let placedToppings = [];
    let nextOrderNumber = 1;
    const orderQueue = [];
    let currentScore = 0;
    let combo = 1;
    let level = 1;
    let timeLeft = 25;
    let orderTimer = null;
    let completedOrders = 0;

    function getBuildProgress() {
        return Object.values(currentBuild).filter(Boolean).length;
    }

    function getBuildStateText() {
        const progress = getBuildProgress();
        if (progress === 0) return 'Elige la base';
        if (progress === 1) return 'Agrega relleno';
        if (progress === 2) return 'Termina la decoración';
        return 'Listo para servir';
    }

    function setActiveStation(station) {
        const gameBoard = document.querySelector('.bakery-rush-wrapper');
        const customerStage = document.querySelector('.rush-customer-stage');
        const workArea = document.querySelector('.station-grid');
        const referenceScene = document.querySelector('.reference-game-scene');
        if (gameBoard) gameBoard.dataset.activeStation = station;
        if (customerStage) customerStage.style.display = station === 'order' ? '' : 'none';
        if (referenceScene) referenceScene.style.display = station === 'order' ? 'block' : 'none';
        if (workArea) {
            workArea.dataset.scene = station;
            if (station === 'order') {
                workArea.style.removeProperty('top');
                workArea.style.removeProperty('bottom');
                workArea.style.removeProperty('height');
                workArea.style.removeProperty('z-index');
            } else {
                workArea.style.setProperty('top', '0', 'important');
                workArea.style.setProperty('bottom', '58px', 'important');
                workArea.style.setProperty('height', 'auto', 'important');
                workArea.style.setProperty('z-index', '8', 'important');
            }
        }
        stationTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.stationTab === station);
        });
        stationPanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.stationPanel === station);
        });
    }

    function randomFrom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function generateOrder() {
        const template = randomFrom(orderPool);
        const customer = randomFrom(customerProfiles);
        const orderNumber = nextOrderNumber;
        nextOrderNumber = nextOrderNumber >= 100 ? 1 : nextOrderNumber + 1;
        return {
            orderNumber,
            customer: customer.name,
            customerImage: customer.image,
            customerMood: customer.mood,
            base: template.base,
            filling: template.filling,
            topping: template.topping,
            icon: template.icon,
            label: template.label,
            bonus: 120 + level * 60,
            timeLimit: Math.max(12, 25 - level)
        };
    }

    function getCurrentOrder() {
        return orderQueue[0] || null;
    }

    function renderCurrentOrder() {
        const current = getCurrentOrder();
        if (!rushOrderEl) return;

        if (!current) {
            rushOrderEl.innerHTML = '<p>No hay pedidos.</p>';
            return;
        }

        rushOrderEl.innerHTML = `
            <div class="rush-order-header">
                <span class="customer-tag">${current.customerMood} ${current.customer}</span>
                <strong>${current.icon}</strong>
            </div>
            <div class="rush-ticket-meta">
                <span>${current.label}</span>
                <strong>${current.timeLimit}s</strong>
            </div>
            <p>Base: <strong>${current.base}</strong></p>
            <p>Relleno: <strong>${current.filling}</strong></p>
            <p>Decoración: <strong>${current.topping}</strong></p>
        `;

        const sceneOrderNumber = document.getElementById('scene-order-number');
        if (sceneOrderNumber) sceneOrderNumber.textContent = String(current.orderNumber).padStart(2, '0');

        if (rushCustomerAvatarEl) {
            rushCustomerAvatarEl.innerHTML = `<img src="${current.customerImage}" alt="${current.customer}" loading="eager"><span class="customer-mood">${current.customerMood}</span>`;
        }
        if (rushCustomerNameEl) rushCustomerNameEl.textContent = current.customer;
        if (rushCustomerMessageEl) rushCustomerMessageEl.textContent = getBuildStateText();
    }

    function renderQueue() {
        if (!rushQueueEl) return;
        const queue = orderQueue.slice(1, 6);
        rushQueueEl.innerHTML = queue.length
            ? queue.map(order => `
                <div class="rush-mini-order">
                    <div class="rush-mini-customer">
                        <img src="${order.customerImage}" alt="${order.customer}" loading="lazy">
                        <span>${order.customer}</span>
                    </div>
                    <strong>${order.label}</strong>
                    <small>${order.filling} • ${order.topping}</small>
                </div>
            `).join('')
            : '<div class="rush-mini-order empty"><span>Sin más pedidos</span></div>';
    }

    function updateHud() {
        if (rushScoreEl) rushScoreEl.textContent = String(currentScore);
        if (rushComboEl) rushComboEl.textContent = `x${combo}`;
        if (rushTimerEl) rushTimerEl.textContent = `${timeLeft}s`;
        if (rushProgressEl) rushProgressEl.textContent = `Nivel ${level}`;
        if (rushStatusEl) rushStatusEl.textContent = getCurrentOrder() ? getBuildStateText() : 'Esperando';
        if (rushCustomerMessageEl && getCurrentOrder()) rushCustomerMessageEl.textContent = getBuildStateText();
        if (rushBakedItemEl) {
            const currentIngredients = [currentBuild.base, currentBuild.filling, currentBuild.topping].filter(Boolean);
            if (!currentIngredients.length) {
                rushBakedItemEl.innerHTML = '';
                rushBakedItemEl.title = 'Sin pastel aún';
                return;
            }

            // Construir el gráfico del pastel para el HUD/Horno
            const baseClass = currentBuild.base ? `base-${currentBuild.base.replace(' ', '-')}` : '';
            const fillingLayer = currentBuild.filling ? `<div class="filling-layer filling-${currentBuild.filling}"></div>` : '';
            
            rushBakedItemEl.innerHTML = `<div class="cake-graphic ${baseClass} ${currentBuild.filling ? 'has-filling' : ''}" style="transform: scale(0.6); margin-top:-10px;">${fillingLayer}</div>`;
            rushBakedItemEl.title = currentIngredients.join(' • ');
        }
        
        if (topCakeBaseContainer) {
            const baseClass = currentBuild.base ? `base-${currentBuild.base.replace(' ', '-')}` : '';
            const fillingLayer = currentBuild.filling ? `<div class="filling-layer filling-${currentBuild.filling}"></div>` : '';
            topCakeBaseContainer.innerHTML = currentBuild.base ? `<div class="cake-graphic ${baseClass} ${currentBuild.filling ? 'has-filling' : ''}">${fillingLayer}</div>` : '';
        }
    }

    function startTimer() {
        clearInterval(orderTimer);
        const current = getCurrentOrder();
        timeLeft = current ? current.timeLimit : 25;

        orderTimer = setInterval(() => {
            const active = getCurrentOrder();
            if (!active) {
                clearInterval(orderTimer);
                return;
            }

            timeLeft -= 1;
            updateHud();

            if (timeLeft <= 0) {
                clearInterval(orderTimer);
                failOrder();
            }
        }, 1000);
    }

    function addOrder() {
        orderQueue.push(generateOrder());
        renderCurrentOrder();
        renderQueue();
        if (orderQueue.length === 1) startTimer();
        updateHud();
    }

    function resetBuild() {
        currentBuild.base = '';
        currentBuild.filling = '';
        currentBuild.topping = '';
        stationButtons.forEach(button => button.classList.remove('selected'));
        selectedMold = 'Redondo';
        batterReady = false;
        bakedReady = false;
        bakeProgress = 0;
        clearInterval(bakeTimer);
        if (batterProgressEl) batterProgressEl.style.width = '0%';
        if (bakeProgressEl) bakeProgressEl.style.width = '0%';
        if (bakeStatusEl) bakeStatusEl.textContent = 'Horno apagado';
        placedToppings = [];
        if (topPlacedToppingsEl) topPlacedToppingsEl.innerHTML = '';
        if (topDecorationStatusEl) topDecorationStatusEl.textContent = 'Elige una decoración para colocarla';
        moldButtons.forEach(button => button.classList.toggle('selected', button.dataset.mold === selectedMold));
        updateHud();
    }

    function checkMatch() {
        const current = getCurrentOrder();
        if (!current) return false;
        return current.base === currentBuild.base && current.filling === currentBuild.filling && current.topping === currentBuild.topping;
    }

    function failOrder() {
        if (!orderQueue.length) return;
        orderQueue.shift();
        combo = 1;
        currentScore = Math.max(0, currentScore - 80);
        resetBuild();
        playRemoveSound();
        if (orderQueue.length === 0) addOrder();
        renderCurrentOrder();
        renderQueue();
        updateHud();
        startTimer();
    }

    function serveOrder() {
        const current = getCurrentOrder();
        if (!current) return;

        if (!currentBuild.base || !currentBuild.filling || !currentBuild.topping) {
            showCelebration('Falta ingrediente');
            if (rushStatusEl) rushStatusEl.textContent = 'Completa el pedido';
            if (rushCustomerMessageEl) rushCustomerMessageEl.textContent = 'Todavía falta algo...';
            return;
        }

        if (!batterReady || !bakedReady) {
            showCelebration('Termina el horno');
            if (rushStatusEl) rushStatusEl.textContent = 'Hornea antes de servir';
            return;
        }

        if (checkMatch()) {
            const precisionBonus = selectedMold === 'Redondo' ? 40 : 20;
            const reward = current.bonus + combo * 35 + precisionBonus;
            currentScore += reward;
            combo += 1;
            completedOrders += 1;
            level = 1 + Math.floor(completedOrders / 2);
            orderQueue.shift();
            resetBuild();
            orderTaken = false;
            if (takeOrderBtn) {
                takeOrderBtn.textContent = '📋 TOMAR PEDIDO';
                takeOrderBtn.classList.remove('taken');
            }
            showCelebration(`¡Listo! +${reward}`);
            playFanfareSound();
            if (rushCustomerMessageEl) rushCustomerMessageEl.textContent = '¡Qué rico, gracias!';

            if (orderQueue.length < 5) addOrder();
            renderCurrentOrder();
            renderQueue();
            updateHud();
            startTimer();
            setActiveStation('order');
        } else {
            currentScore = Math.max(0, currentScore - 60);
            combo = 1;
            showCelebration('Pedido equivocado');
            playRemoveSound();
            if (rushCustomerMessageEl) rushCustomerMessageEl.textContent = 'Ese no era mi pedido...';
            resetBuild();
            updateHud();
        }
    }

    function resetGame() {
        clearInterval(orderTimer);
        orderQueue.length = 0;
        currentScore = 0;
        combo = 1;
        level = 1;
        completedOrders = 0;
        orderTaken = false;
        nextOrderNumber = 1;
        if (takeOrderBtn) {
            takeOrderBtn.textContent = '📋 TOMAR PEDIDO';
            takeOrderBtn.classList.remove('taken');
        }
        resetBuild();
        for (let i = 0; i < 5; i++) addOrder();
        renderCurrentOrder();
        renderQueue();
        updateHud();
        startTimer();
    }

    function showCelebration(text) {
        if (!rushBakedItemEl) return;
        const toast = document.createElement('div');
        toast.className = 'rush-toast';
        toast.textContent = text;
        rushBakedItemEl.appendChild(toast);
        setTimeout(() => toast.remove(), 1200);
    }

    function placeTopping(value) {
        if (!value) return;
        currentBuild.topping = value;
        placedToppings.push(value);
        stationButtons.forEach(button => {
            if (button.dataset.category === 'topping') button.classList.toggle('selected', button.dataset.value === value);
        });
        if (topPlacedToppingsEl) {
            topPlacedToppingsEl.innerHTML = placedToppings.slice(-8).map((topping, index) => {
                // Posicionar aleatoriamente sobre la torta
                const left = 30 + Math.random() * 40;
                const top = 10 + Math.random() * 40;
                return `<div class="topping-graphic topping-${topping.replace(' ', '-')}" style="left:${left}%; top:${top}%; animation-delay: ${index * 0.05}s;"></div>`;
            }).join('');
        }
        if (topDecorationStatusEl) topDecorationStatusEl.textContent = `${placedToppings.length} decoración${placedToppings.length === 1 ? '' : 'es'} colocada${placedToppings.length === 1 ? '' : 's'}`;
        setActiveStation('topping');
        updateHud();
        playAudioTone(440, 0.08, 'triangle');
    }

    function playAudioTone(freq, duration = 0.1, type = 'sine') {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (error) {}
    }

    function playRemoveSound() { playAudioTone(220, 0.12, 'sawtooth'); }
    function playFanfareSound() {
        playAudioTone(523.25, 0.12, 'triangle');
        setTimeout(() => playAudioTone(659.25, 0.12, 'triangle'), 120);
        setTimeout(() => playAudioTone(783.99, 0.18, 'triangle'), 240);
    }

    if (stationButtons.length) {
        stationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                const value = button.dataset.value;
                if (!category || !value) return;

                currentBuild[category] = value;
                stationButtons.forEach(btn => {
                    if (btn.dataset.category === category) {
                        btn.classList.toggle('selected', btn === button);
                    }
                });

                if (getBuildProgress() >= 3 && getCurrentOrder()) {
                    if (rushStatusEl) rushStatusEl.textContent = 'Listo para servir';
                } else {
                    if (rushStatusEl) rushStatusEl.textContent = getBuildStateText();
                }

                updateHud();
                if (category === 'topping') {
                    placeTopping(value);
                }
                playAudioTone(440, 0.08, 'triangle');
            });
        });
    }

    stationTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveStation(tab.dataset.stationTab);
            if (rushStatusEl) rushStatusEl.textContent = tab.dataset.stationTab === 'order' ? 'Pedido abierto' : getBuildStateText();
            playAudioTone(330, 0.06, 'triangle');
        });
    });

    document.querySelectorAll('.station-btn[data-category="topping"]').forEach(button => {
        button.draggable = true;
        button.addEventListener('dragstart', event => {
            event.dataTransfer?.setData('text/plain', button.dataset.value || '');
            button.classList.add('dragging');
        });
        button.addEventListener('dragend', () => button.classList.remove('dragging'));
    });

    topCakeDropzone?.addEventListener('dragover', event => {
        event.preventDefault();
        topCakeDropzone.classList.add('drop-ready');
    });

    topCakeDropzone?.addEventListener('dragleave', () => {
        topCakeDropzone.classList.remove('drop-ready');
    });

    topCakeDropzone?.addEventListener('drop', event => {
        event.preventDefault();
        topCakeDropzone.classList.remove('drop-ready');
        placeTopping(event.dataTransfer?.getData('text/plain'));
    });

    function takeCurrentOrder() {
        if (!getCurrentOrder()) return;
        orderTaken = true;
        setActiveStation('filling');
        if (takeOrderBtn) {
            takeOrderBtn.textContent = '✅ PEDIDO TOMADO';
            takeOrderBtn.classList.add('taken');
        }
        if (rushStatusEl) rushStatusEl.textContent = 'Pedido abierto';
        if (rushCustomerMessageEl) rushCustomerMessageEl.textContent = 'Prepara esta orden en BUILD STATION';
        showCelebration('¡Pedido tomado!');
        playAudioTone(520, 0.1, 'triangle');
    }

    rushOrderEl?.addEventListener('click', takeCurrentOrder);
    takeOrderBtn?.addEventListener('click', takeCurrentOrder);

    moldButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedMold = button.dataset.mold || 'Redondo';
            moldButtons.forEach(item => item.classList.toggle('selected', item === button));
            playAudioTone(380, 0.08, 'triangle');
        });
    });

    pourBatterBtn?.addEventListener('click', () => {
        if (!currentBuild.base) {
            showCelebration('Elige una base primero');
            return;
        }
        batterReady = true;
        if (batterProgressEl) batterProgressEl.style.width = '100%';
        showCelebration('¡Mezcla lista!');
        playFanfareSound();
    });

    bakeBtn?.addEventListener('click', () => {
        if (!batterReady) {
            showCelebration('Vierte la mezcla primero');
            return;
        }
        if (bakeTimer) return;
        bakeProgress = 0;
        bakedReady = false;
        if (bakeStatusEl) bakeStatusEl.textContent = 'Horneando...';
        bakeTimer = setInterval(() => {
            bakeProgress += 10;
            if (bakeProgressEl) bakeProgressEl.style.width = `${bakeProgress}%`;
            if (bakeProgress >= 100) {
                clearInterval(bakeTimer);
                bakeTimer = null;
                bakedReady = true;
                if (bakeStatusEl) bakeStatusEl.textContent = '¡Horneado perfecto!';
                showCelebration('¡Listo para decorar!');
                playFanfareSound();
            }
        }, 180);
    });

    deliverOrderBtn?.addEventListener('click', () => serveOrder());

    setActiveStation('filling');

    if (rushServeBtn) {
        rushServeBtn.addEventListener('click', () => serveOrder());
    }

    if (rushResetBtn) {
        rushResetBtn.addEventListener('click', () => resetGame());
    }

    resetGame();

    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = navbar ? navbar.offsetHeight + 10 : 70;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ==================== VELAR CARDS INTERACTIONS ====================
    document.querySelectorAll('.velar-fav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                if (this.classList.contains('active')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#e74c3c';
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '';
                }
            }
        });
    });

    window.shareProduct = function(name) {
        if (navigator.share) {
            navigator.share({
                title: `${name} | Dulce Artesanal`,
                text: `¡Mira esta delicia artesanal: ${name} en Dulce!`,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(`Enlace copiado al portapapeles para compartir: ${name}`);
        }
    };

    // Inicializar estrellas interactiva si existe
    initStarRating();
});

/* ============================================================
   LÓGICA DE RESEÑAS ("TU OPINIÓN NOS IMPORTA") Y PANEL ADMIN
   ============================================================ */

function initStarRating() {
    document.querySelectorAll('.star-rating-wrap').forEach(wrap => {
        const stars = wrap.querySelectorAll('.star-btn');
        const card = wrap.closest('.glass-card') || wrap.parentElement;
        const ratingInput = card ? card.querySelector('input[type="hidden"]') : null;
        if (!stars.length) return;

        let selectedRating = ratingInput ? (parseInt(ratingInput.value) || 5) : 5;

        function updateStars(val) {
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                if (sVal <= val) {
                    s.classList.add('active', 'fas');
                    s.classList.remove('far');
                } else {
                    s.classList.remove('active', 'fas');
                    s.classList.add('far');
                }
            });
        }

        updateStars(selectedRating);

        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const hoverVal = parseInt(star.getAttribute('data-value'));
                stars.forEach(s => {
                    const sVal = parseInt(s.getAttribute('data-value'));
                    if (sVal <= hoverVal) {
                        s.classList.add('hover', 'fas');
                        s.classList.remove('far');
                    } else {
                        s.classList.remove('hover', 'fas');
                        s.classList.add('far');
                    }
                });
            });

            star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.classList.remove('hover'));
                updateStars(selectedRating);
            });

            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-value'));
                if (ratingInput) ratingInput.value = selectedRating;
                updateStars(selectedRating);
            });
        });
    });
}

function getTodayDateKey() {
    return new Date().toISOString().slice(0, 10);
}

function getDashboardState() {
    const today = getTodayDateKey();
    const saved = JSON.parse(localStorage.getItem('dulce_dashboard_state') || '{}');
    const reviews = JSON.parse(localStorage.getItem('dulce_reviews') || '[]');
    const baseState = {
        date: today,
        visits: 124,
        orders: 38,
        reviews: reviews.length || 12
    };

    if (!saved || saved.date !== today) {
        const normalized = { ...baseState, date: today };
        localStorage.setItem('dulce_dashboard_state', JSON.stringify(normalized));
        return normalized;
    }

    return {
        ...baseState,
        ...saved,
        reviews: reviews.length || saved.reviews || baseState.reviews,
        date: today
    };
}

function saveDashboardState(nextState) {
    localStorage.setItem('dulce_dashboard_state', JSON.stringify(nextState));
}

function registerVisit() {
    if (sessionStorage.getItem('dulce_visit_logged') === 'true') return;

    const state = getDashboardState();
    state.visits = Number(state.visits || 0) + 1;
    saveDashboardState(state);
    sessionStorage.setItem('dulce_visit_logged', 'true');
    updateDashboardMetrics();
}

function registerOrder() {
    const state = getDashboardState();
    state.orders = Number(state.orders || 0) + 1;
    saveDashboardState(state);
    updateDashboardMetrics();
}

function updateDashboardMetrics() {
    const state = getDashboardState();
    const values = {
        visits: Number(state.visits || 0),
        orders: Number(state.orders || 0),
        reviews: Number(JSON.parse(localStorage.getItem('dulce_reviews') || '[]').length || state.reviews || 0)
    };

    const targets = { visits: 220, orders: 120, reviews: 80 };

    Object.keys(values).forEach((key) => {
        const valueEl = document.querySelector(`[data-metric="${key}"]`);
        const ring = document.querySelector(`.ring-${key}`);
        const label = document.getElementById(`${key}Today`);

        if (valueEl) valueEl.textContent = values[key];
        if (label) label.textContent = values[key];
        if (ring) {
            const percent = Math.min((values[key] / targets[key]) * 100, 100);
            ring.style.setProperty('--progress', `${percent}%`);
        }
    });
}

function persistReviewRecords(reviews) {
    try {
        localStorage.setItem('dulce_reviews', JSON.stringify(reviews));
    } catch (e) {
        return Promise.resolve(false);
    }

    if (window.DulceDB && typeof window.DulceDB.setReviewsSync === 'function') {
        window.DulceDB.setReviewsSync(reviews);
        return Promise.resolve(true);
    }

    if (!window.indexedDB) return Promise.resolve(true);

    return new Promise((resolve) => {
        try {
            const request = indexedDB.open('DulceArtesanalDB', 2);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                ['products', 'reviews', 'orders', 'visitors', 'snapshots'].forEach((storeName) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: false });
                    }
                });
            };
            request.onerror = () => resolve(false);
            request.onblocked = () => resolve(false);
            request.onsuccess = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('reviews')) {
                    db.close();
                    resolve(false);
                    return;
                }

                const transaction = db.transaction('reviews', 'readwrite');
                const store = transaction.objectStore('reviews');
                store.clear();
                reviews.forEach((review) => {
                    if (review && review.id !== undefined && review.id !== null) store.put(review);
                });
                transaction.oncomplete = () => {
                    db.close();
                    resolve(true);
                };
                transaction.onerror = transaction.onabort = () => {
                    db.close();
                    resolve(false);
                };
            };
        } catch (e) {
            resolve(false);
        }
    });
}

window.handleUnifiedSubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    
    const nombreInput = form.querySelector('input[name="nombre"]') || document.getElementById('nombre') || document.getElementById('nombreIndex');
    const telefonoInput = form.querySelector('input[name="telefono"]') || document.getElementById('telefono') || document.getElementById('telefonoIndex');
    const mensajeInput = form.querySelector('textarea[name="mensaje"]') || document.getElementById('mensaje') || document.getElementById('mensajeIndex');
    
    const card = form.closest('.glass-card') || form.parentElement;
    const ratingInput = card ? card.querySelector('input[type="hidden"]') : (document.getElementById('starRatingValue') || document.getElementById('starRatingValueIndex'));

    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const contacto = telefonoInput ? telefonoInput.value.trim() : '';
    const mensaje = mensajeInput ? mensajeInput.value.trim() : '';
    const rating = ratingInput ? (parseInt(ratingInput.value) || 5) : 5;

    if (!nombre || !contacto || !mensaje) {
        alert('Por favor completa todos los campos.');
        return;
    }

    // 1. Guardar en localStorage para el panel de administración
    const reviewObj = {
        id: Date.now(),
        nombre: nombre,
        contacto: contacto,
        comentario: mensaje,
        rating: rating,
        fecha: new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
    };

    const reviews = JSON.parse(localStorage.getItem('dulce_reviews') || '[]');
    reviews.unshift(reviewObj);
    await persistReviewRecords(reviews);

    const state = getDashboardState();
    state.reviews = reviews.length;
    saveDashboardState(state);
    registerOrder();

    // 2. Formatear y enviar mensaje a WhatsApp
    const starsEmoji = '⭐'.repeat(rating);
    const numeroWA = '573105731569';
    const textoWA = encodeURIComponent(
        `¡Hola Dulce Artesanal! 🍞🍰\n\n` +
        `*Calificación:* ${starsEmoji} (${rating}/5)\n` +
        `*Cliente:* ${nombre}\n` +
        `*Contacto:* ${contacto}\n\n` +
        `*Pedido / Opinión:* \n${mensaje}`
    );

    window.open(`https://wa.me/${numeroWA}?text=${textoWA}`, '_blank');

    form.reset();
    if (ratingInput) ratingInput.value = 5;
    initStarRating();
    updateDashboardMetrics();
};

window.handlePqrsSubmit = function(e) {
    if (!e) return;
    e.preventDefault();

    const form = e.target;
    const nombre = (form.querySelector('#pqrsNombre') || {}).value?.trim() || '';
    const contacto = (form.querySelector('#pqrsEmail') || {}).value?.trim() || '';
    const tipo = (form.querySelector('#pqrsTipo') || {}).value || 'Pregunta';
    const asunto = (form.querySelector('#pqrsAsunto') || {}).value?.trim() || '';
    const mensaje = (form.querySelector('#pqrsMensaje') || {}).value?.trim() || '';

    if (!nombre || !contacto || !asunto || !mensaje) {
        alert('Completa todos los campos del PQRS antes de enviar.');
        return;
    }

    const entry = {
        id: Date.now(),
        nombre,
        contacto,
        tipo,
        asunto,
        mensaje,
        fecha: new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
    };

    const pqrs = JSON.parse(localStorage.getItem('dulce_pqrs') || '[]');
    pqrs.unshift(entry);
    localStorage.setItem('dulce_pqrs', JSON.stringify(pqrs));

    const textoWA = encodeURIComponent(
        `¡Hola Dulce Artesanal! 📝\n\n` +
        `*Tipo:* ${tipo}\n` +
        `*Nombre:* ${nombre}\n` +
        `*Contacto:* ${contacto}\n` +
        `*Asunto:* ${asunto}\n\n` +
        `*Mensaje:*\n${mensaje}`
    );

    window.open(`https://wa.me/573105731569?text=${textoWA}`, '_blank');
    form.reset();
    alert('Tu PQRS fue registrada y enviada correctamente.');
};

const pqrsForm = document.getElementById('pqrsForm');
if (pqrsForm) {
    pqrsForm.addEventListener('submit', window.handlePqrsSubmit);
}

window.addEventListener('DOMContentLoaded', () => {
    registerVisit();
    updateDashboardMetrics();
});

window.handleReviewSubmit = function(e) {
    return window.handleUnifiedSubmit(e);
};

window.openAdminModal = function() {
    const modal = document.getElementById('adminReviewModal');
    const authStep = document.getElementById('adminAuthStep');
    const reviewsStep = document.getElementById('adminReviewsStep');
    const passInput = document.getElementById('adminPasswordInput');

    if (!modal) return;
    modal.classList.add('active');
    
    if (sessionStorage.getItem('dulce_admin_auth') === 'true') {
        authStep.style.display = 'none';
        reviewsStep.style.display = 'block';
        renderAdminReviews();
    } else {
        authStep.style.display = 'block';
        reviewsStep.style.display = 'none';
        if (passInput) passInput.value = '';
    }
};

window.closeAdminModal = function() {
    const modal = document.getElementById('adminReviewModal');
    if (modal) modal.classList.remove('active');
};

window.verifyAdminPassword = function() {
    const passInput = document.getElementById('adminPasswordInput');
    if (!passInput) return;
    const pass = passInput.value.trim();

    if (pass === 'dulce2026' || pass === 'dulce' || pass === '1234') {
        sessionStorage.setItem('dulce_admin_auth', 'true');
        document.getElementById('adminAuthStep').style.display = 'none';
        document.getElementById('adminReviewsStep').style.display = 'block';
        renderAdminReviews();
    } else {
        alert('Contraseña incorrecta. Inténtalo de nuevo.');
        passInput.focus();
    }
};

function renderAdminReviews() {
    const listContainer = document.getElementById('adminReviewsList');
    const badge = document.getElementById('reviewCountBadge');
    if (!listContainer) return;

    const reviews = JSON.parse(localStorage.getItem('dulce_reviews') || '[]');
    
    if (badge) {
        badge.textContent = `${reviews.length} ${reviews.length === 1 ? 'Reseña registrada' : 'Reseñas registradas'}`;
    }

    if (reviews.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:30px; color:#888;"><i class="fas fa-inbox" style="font-size:2rem; margin-bottom:10px; display:block;"></i>Aún no hay reseñas registradas por clientes.</div>';
        return;
    }

    listContainer.innerHTML = reviews.map(r => {
        const starsHtml = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        return `
            <div class="review-item-card">
                <div class="review-item-header">
                    <span class="review-item-name">${escapeHtml(r.nombre)}</span>
                    <span class="review-item-stars" title="${r.rating} Estrellas">${starsHtml}</span>
                </div>
                <div class="review-item-contact"><i class="fas fa-user-circle"></i> Contacto: <strong>${escapeHtml(r.contacto)}</strong></div>
                <div class="review-item-comment">"${escapeHtml(r.comentario)}"</div>
                <div class="review-item-actions">
                    <span><i class="far fa-clock"></i> ${r.fecha}</span>
                    <button type="button" class="btn-delete-review" onclick="deleteSingleReview(${r.id})"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

window.deleteSingleReview = async function(id) {
    if (!confirm('¿Seguro que deseas eliminar esta reseña?')) return;
    let reviews = JSON.parse(localStorage.getItem('dulce_reviews') || '[]');
    reviews = reviews.filter(r => String(r.id) !== String(id));
    await persistReviewRecords(reviews);
    renderAdminReviews();
    updateDashboardMetrics();
};

window.clearAllReviews = async function() {
    if (!confirm('¿Seguro que deseas BORRAR TODAS las reseñas registradas?')) return;
    await persistReviewRecords([]);
    renderAdminReviews();
    updateDashboardMetrics();
};

/* ============================================================
   DULCE AI CHAT — Asistente de ventas virtual
   ============================================================ */

(function initDulceChat() {
    // Knowledge base — respuestas por palabras clave
    const KB = [
        {
            keys: ['hola', 'buenas', 'buen día', 'buenos días', 'buenas tardes', 'buenas noches', 'saludo'],
            reply: '¡Hola! 👋 Bienvenido/a a **Dulce Tentación** 🍰. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedo orientarte sobre precios, productos, pedidos y horarios. 😊'
        },
        {
            keys: ['torta', 'pastel', 'cake', 'cumpleaños', 'aniversario', 'celebración', 'boda'],
            reply: '🎂 Nuestras tortas son completamente personalizadas y artesanales. Tenemos desde tortas básicas de 12 personas (~$55.000) hasta tortas temáticas de varios pisos. Para cotizar la tuya, escríbenos directamente por WhatsApp al 📱 +57 310 573 1569 indicando: tamaño, sabor, decoración y fecha. ¡Con gusto te ayudamos!'
        },
        {
            keys: ['pan', 'panadería', 'mogolla', 'croissant', 'hojaldre'],
            reply: '🥐 Nuestra panadería trabaja con masa madre y horno artesanal. Tenemos pan campesino, mogollas, croissants, pandebonos y mucho más, horneados cada mañana desde las 6:00 am. ¡Vienen recién sacados del horno para ti!'
        },
        {
            keys: ['precio', 'costo', 'cuánto vale', 'cuánto cuesta', 'valor', 'tarifa'],
            reply: '💰 Nuestros precios varían según el producto:\n• 🍞 Pan: desde $1.200\n• 🥐 Croissant artesanal: $3.500\n• 🧁 Cupcake: desde $4.000\n• 🎂 Tortas: desde $55.000\n\nPara un presupuesto personalizado, escríbenos por WhatsApp 📱 +57 310 573 1569.'
        },
        {
            keys: ['horario', 'hora', 'abierto', 'cerrado', 'atienden', 'cuando abren'],
            reply: '🕐 Nuestro horario de atención es:\n📅 **Lunes a Domingo**\n⏰ 6:00 am — 9:00 pm\n\nEstamos ubicados en Urbanización San Jacinto, Diagonal 2B #5-45, Tocaima, Cundinamarca. ¡Te esperamos!'
        },
        {
            keys: ['dirección', 'donde quedan', 'ubicación', 'como llegar', 'mapa', 'tocaima'],
            reply: '📍 Nos encontramos en:\n**Urbanización San Jacinto**\nDiagonal 2B #5-45, Tocaima, Cundinamarca.\n\nPuedes encontrarnos fácilmente ingresando por la vía principal de Tocaima, tomando la cuadra de la Diagonal 2B hasta el fondo 🗺️.'
        },
        {
            keys: ['pedido', 'pedir', 'ordenar', 'encargar', 'hacer pedido', 'reservar'],
            reply: '📋 Para hacer un pedido:\n1️⃣ Escríbenos por WhatsApp: **+57 310 573 1569**\n2️⃣ Dinos: producto, cantidad y fecha que lo necesitas.\n3️⃣ Te confirmamos disponibilidad y precio.\n\nO puedes usar el formulario de esta misma página 👇'
        },
        {
            keys: ['domicilio', 'envío', 'delivery', 'entregan', 'a domicilio'],
            reply: '🛵 Por el momento atendemos principalmente de forma presencial en nuestra sede en Tocaima. Para consultar disponibilidad de entrega en tu zona, escríbenos por WhatsApp al 📱 +57 310 573 1569.'
        },
        {
            keys: ['sabores', 'opciones', 'tipos', 'variedades', 'que tienen', 'qué ofrecen'],
            reply: '🍰 Tenemos una gran variedad:\n**Tortas:** Chocolate, Vainilla, Red Velvet, Arequipe, Fresas, Zanahoria, Tres Leches y más.\n**Rellenos:** Ganache, Crema, Arequipe, Crema de frutas.\n**Panadería:** Pan campesino, Croissant, Mogollas, Pandebonos, Roscón, Buñuelos.\n\n¿Algo en particular que se te antoje? 😋'
        },
        {
            keys: ['instagram', 'ig', 'redes sociales', 'redes', 'seguir'],
            reply: '📸 ¡Síguenos en Instagram para ver nuestras creaciones más recientes! 🎂 Tortas, panes y delicias frescas cada día:\n👉 **@dulcetentacion1413**\nhttps://www.instagram.com/dulcetentacion1413\n\nTambién estamos en Facebook: **@dulcetentacion1413** 🔵'
        },
        {
            keys: ['whatsapp', 'escribir', 'teléfono', 'número', 'contacto', 'llamar'],
            reply: '📱 Puedes contactarnos directamente:\n**WhatsApp:** +57 310 573 1569\n**Llamadas:** +57 310 573 1569\n\nAtención de **Lunes a Domingo, 6:00 am — 9:00 pm**.'
        },
        {
            keys: ['gracias', 'thank', 'listo', 'ok', 'perfecto', 'excelente', 'genial'],
            reply: '¡De nada! 😊 Fue un placer atenderte. Si tienes alguna otra duda, aquí estoy. ¡Que disfrutes de nuestros productos! 🍞🍰✨'
        },
        {
            keys: ['persona', 'humano', 'vendedor', 'asesor', 'hablar con alguien'],
            reply: '👤 Para hablar directamente con uno de nuestros vendedores, escríbenos por WhatsApp:\n📱 **+57 310 573 1569**\n\nEstamos disponibles de Lunes a Domingo, 6:00 am — 9:00 pm. ¡Con gusto te asesoramos personalmente!'
        }
    ];

    const FALLBACK = '🤔 Hmm, no estoy seguro de cómo ayudarte con eso. Para una respuesta más detallada, escríbenos directamente por WhatsApp al 📱 **+57 310 573 1569** y uno de nuestros asesores te ayudará. ¡Gracias por contactar a Dulce Tentación! 🍰';

    const QUICK = ['🎂 Tortas', '🥐 Panadería', '💰 Precios', '🕐 Horarios', '📍 Dirección', '📦 Hacer pedido'];

    function getBotReply(text) {
        const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (const entry of KB) {
            for (const key of entry.keys) {
                const normKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (lower.includes(normKey)) return entry.reply;
            }
        }
        return FALLBACK;
    }

    function renderMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    // Build widget HTML and inject into body
    const widgetHTML = `
    <!-- Floating Social Stack -->
    <div class="floating-socials-stack" id="floatingSocialsStack">
        <button type="button" class="float-social-btn btn-chat" id="chatToggleBtn" aria-label="Chat con asistente Dulce">
            <i class="fas fa-comment-dots"></i>
            <span class="float-tooltip">Chat con nosotros</span>
            <span class="notif-dot" id="chatNotifDot"></span>
        </button>
        <a href="https://www.facebook.com/dulcetentacion1413" target="_blank" rel="noreferrer" class="float-social-btn btn-fb" aria-label="Facebook @dulcetentacion1413">
            <i class="fab fa-facebook-f"></i>
            <span class="float-tooltip">@dulcetentacion1413</span>
        </a>
        <a href="https://www.instagram.com/dulcetentacion1413" target="_blank" rel="noreferrer" class="float-social-btn btn-ig" aria-label="Instagram @dulcetentacion1413">
            <i class="fab fa-instagram"></i>
            <span class="float-tooltip">@dulcetentacion1413</span>
        </a>
        <a href="https://wa.me/573105731569" target="_blank" rel="noreferrer" class="float-social-btn btn-wa" aria-label="WhatsApp">
            <i class="fab fa-whatsapp"></i>
            <span class="float-tooltip">WhatsApp</span>
        </a>
    </div>

    <!-- AI Chat Widget -->
    <div class="dulce-chat-widget" id="dulceChatWidget" aria-live="polite">
        <div class="dulce-chat-header">
            <div class="dulce-chat-avatar">🍰</div>
            <div class="dulce-chat-header-info">
                <div class="dulce-chat-header-name">Dulce — Asistente Virtual</div>
                <div class="dulce-chat-header-status">● En línea ahora</div>
            </div>
            <button type="button" class="dulce-chat-close" id="chatCloseBtn" aria-label="Cerrar chat">&times;</button>
        </div>
        <div class="dulce-chat-messages" id="chatMessages"></div>
        <div class="dulce-chat-quick-replies" id="chatQuickReplies"></div>
        <div class="dulce-chat-input-row">
            <input type="text" class="dulce-chat-input" id="chatInput" placeholder="Escribe tu pregunta..." autocomplete="off" maxlength="300">
            <button type="button" class="dulce-chat-send" id="chatSendBtn" aria-label="Enviar"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>
    `;

    // Remove old floating-whatsapp to avoid duplication
    document.querySelectorAll('.floating-whatsapp').forEach(el => el.remove());

    // Inject
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    const widget = document.getElementById('dulceChatWidget');
    const messagesEl = document.getElementById('chatMessages');
    const inputEl = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const closeBtn = document.getElementById('chatCloseBtn');
    const toggleBtn = document.getElementById('chatToggleBtn');
    const quickRepliesEl = document.getElementById('chatQuickReplies');
    const notifDot = document.getElementById('chatNotifDot');
    let chatOpened = false;

    function addMessage(text, type = 'bot') {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;
        if (type === 'bot') {
            msg.innerHTML = `
                <div class="chat-msg-icon">🍰</div>
                <div class="chat-msg-bubble">${renderMarkdown(text)}</div>
            `;
        } else {
            msg.innerHTML = `<div class="chat-msg-bubble">${escapeHtml(text)}</div>`;
        }
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'chat-msg bot';
        typing.id = 'typingIndicator';
        typing.innerHTML = `
            <div class="chat-msg-icon">🍰</div>
            <div class="chat-typing-indicator">
                <span class="chat-typing-dot"></span>
                <span class="chat-typing-dot"></span>
                <span class="chat-typing-dot"></span>
            </div>
        `;
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return typing;
    }

    function renderQuickReplies() {
        quickRepliesEl.innerHTML = QUICK.map(q =>
            `<button type="button" class="chat-quick-btn" data-q="${q}">${q}</button>`
        ).join('');
        quickRepliesEl.querySelectorAll('.chat-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.q.replace(/^[^\w]+/, '').trim();
                sendUserMessage(text);
            });
        });
    }

    function sendUserMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        inputEl.value = '';
        const typing = showTyping();
        const delay = 900 + Math.random() * 600;
        setTimeout(() => {
            typing.remove();
            addMessage(getBotReply(text), 'bot');
        }, delay);
    }

    // Greet on first open
    function openChat() {
        widget.classList.add('open');
        if (notifDot) notifDot.remove();
        if (!chatOpened) {
            chatOpened = true;
            const typing = showTyping();
            setTimeout(() => {
                typing.remove();
                addMessage('¡Hola! 👋 Soy el asistente virtual de **Dulce Tentación** 🍰. Estoy aquí para ayudarte con información sobre productos, precios, pedidos y horarios. ¿En qué puedo ayudarte hoy?', 'bot');
                renderQuickReplies();
            }, 900);
        }
    }

    function closeChat() {
        widget.classList.remove('open');
    }

    toggleBtn.addEventListener('click', () => {
        widget.classList.contains('open') ? closeChat() : openChat();
    });
    closeBtn.addEventListener('click', closeChat);

    sendBtn.addEventListener('click', () => sendUserMessage(inputEl.value));
    inputEl.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendUserMessage(inputEl.value);
    });

    // Show notif dot after 3s to attract attention
    setTimeout(() => {
        if (!chatOpened && notifDot) notifDot.style.display = 'block';
    }, 3000);

})();
