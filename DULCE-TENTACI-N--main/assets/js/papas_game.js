/* ============================================================
   PAPA'S BAKERIA STYLE GAME - papas_game.js
   Complete game logic with drag-and-drop, bake meter, and scoring
   ============================================================ */

(function() {
    'use strict';

    const MAX_LEVEL = 100;

    // ---- STATE ----
    const G = {
        score: 0,
        combo: 1,
        level: 1,
        orderNum: 1,
        currentOrder: null,
        orderQueue: [],
        build: { base: null, mold: 'Redondo' },
        bake: { score: 0, baked: false },
        top: { toppings: [], toolSelected: null, dotCount: 0 },
        scores: { build: 0, bake: 0, top: 0 },
        pouringActive: false,
        pourValue: 0,   // 0-100
        pourDirection: 1,
        pourRAF: null,
        bakeNeedlePos: 0,
        bakeDirection: 1,
        bakeRAF: null,
        bakeNeedleSpeed: 1,
    };

    const ORDERS = [
        { base: 'Chocolate', filling: 'Arequipe', topping: 'Fresas',   label: 'Cumpleaños', time: 90 },
        { base: 'Vainilla',  filling: 'Crema',    topping: 'Chispas',  label: 'Fiesta',     time: 80 },
        { base: 'Red Velvet',filling: 'Ganache',  topping: 'Cerezas',  label: 'Especial',   time: 100 },
        { base: 'Chocolate', filling: 'Crema',    topping: 'Fresas',   label: 'Clásica',    time: 75 },
        { base: 'Vainilla',  filling: 'Arequipe', topping: 'Cerezas',  label: 'Premium',    time: 85 },
        { base: 'Chocolate', filling: 'Crema',    topping: 'Merengue', label: 'Nube dulce', time: 90 },
        { base: 'Red Velvet',filling: 'Ganache',  topping: 'Flores',   label: 'Jardín rojo', time: 95 },
        { base: 'Vainilla',  filling: 'Crema',    topping: 'Perlas',   label: 'Celebración', time: 80 },
        { base: 'Fresa',     filling: 'Crema',    topping: 'Chocolate', label: 'Fresa y chocolate', time: 90 },
        { base: 'Zanahoria', filling: 'Arequipe', topping: 'Pepas',     label: 'Casera', time: 85 },
    ];

    const CUSTOMERS = [
        { name: 'Sofía',    img: 'assets/images/sofia_abril.jpeg',   mood: '😊' },
        { name: 'Mateo',    img: 'assets/images/felipe_gamez.jpeg',  mood: '🙂' },
        { name: 'Valentina',img: 'assets/images/karen_jimenez.jpeg', mood: '✨' },
        { name: 'Daniela',  img: 'assets/images/danna_arias.jpeg',   mood: '😄' },
    ];

    const BASE_COLORS = {
        'Chocolate': { cls: 'choco', fill: '#5c3010' },
        'Vainilla':  { cls: '',      fill: '#C8A030' },
        'Red Velvet':{ cls: 'redvelvet', fill: '#8b1a1a' },
        'Fresa':     { cls: 'strawberry', fill: '#d85b70' },
        'Zanahoria': { cls: 'carrot', fill: '#d9822b' },
        'Coco':      { cls: 'coconut', fill: '#eadfc7' },
        'Moka':      { cls: 'mocha', fill: '#8b5a3c' },
        'Arequipe':  { cls: 'arequipe', fill: '#c8860a' },
        'Limón':     { cls: 'lemon', fill: '#d5d94e' },
        'Maracuyá':  { cls: 'passionfruit', fill: '#e5a52c' },
        'Oreo':      { cls: 'oreo', fill: '#27211f' },
        'Tres Leches': { cls: 'tres-leches', fill: '#f2e6c9' },
    };

    const TOPPING_COLORS = {
        'Arequipe': '#c8860a', 'Ganache': '#3e1a05',
        'Crema': '#fffaf0', 'Crema Chantilly': '#fffaf0', 'Merengue': '#fffdf7',
        'Fresas': '#c0392b', 'Cerezas': '#7b0000', 'Chispas': '#2980b9',
        'Flores': '#e989b5', 'Perlas': '#d9e2e8', 'Caramelo': '#d88b27',
        'Chocolate': '#4a210e', 'Fresa': '#e64b68', 'Pepas': '#6b4226',
        'Chips': '#f0c04a', 'Espuma': '#fffdf7', 'Mousse': '#fffdf7'
    };

    // ---- DOM REFS ----
    const $ = id => document.getElementById(id);
    const el = {
        ticketSlots: $('pb-ticket-slots'),
        timer: $('pb-timer'),
        score: $('pb-score'),
        combo: $('pb-combo'),
        level: $('pb-level'),
        customerImg: $('pb-customer-img'),
        customerEmotion: $('pb-customer-emotion'),
        customerName: $('pb-customer-name'),
        customerMsg: $('pb-customer-msg'),
        orderCard: $('pb-order-card'),
        orderNum: $('pb-order-number'),
        orderReqs: $('pb-order-requirements'),
        takeOrderBtn: $('pb-take-order-btn'),
        // build
        pourZone: $('pb-pour-zone'),
        moldVisual: $('pb-mold-visual'),
        moldFill: $('pb-mold-fill'),
        moldDropHint: $('pb-mold-drop-hint'),
        pourControls: $('pb-pour-controls'),
        pourIndicator: $('pb-pour-indicator'),
        pourStopBtn: $('pb-pour-stop-btn'),
        toBakeBtn: $('pb-to-bake-btn'),
        // bake
        rawCake: $('pb-raw-cake'),
        rawCakeVisual: $('pb-raw-cake-visual'),
        ovenDropzone: $('pb-oven-dropzone'),
        ovenGlass: $('pb-oven-glass'),
        ovenHeat: $('pb-oven-heat'),
        ovenCakeInside: $('pb-oven-cake-inside'),
        bakeMeterArea: $('pb-bake-meter-area'),
        bakeNeedle: $('pb-bake-needle'),
        bakeStatus: $('pb-bake-status'),
        takeOutBtn: $('pb-take-out-btn'),
        toTopBtn: $('pb-to-top-btn'),
        // top
        toppingTools: document.querySelectorAll('.pb-topping-tool'),
        selectedToolIndicator: $('pb-selected-tool-indicator'),
        cakeCanvas: $('pb-cake-canvas'),
        finalBase: $('pb-final-base'),
        finalFilling: $('pb-final-filling'),
        finalToppings: $('pb-final-toppings'),
        deliverBtn: $('pb-deliver-btn'),
        // score panel
        sbarBuild: $('sbar-build'), snumBuild: $('snum-build'),
        sbarBake: $('sbar-bake'),   snumBake: $('snum-bake'),
        sbarTop: $('sbar-top'),     snumTop: $('snum-top'),
        sbarTotal: $('sbar-total'), snumTotal: $('snum-total'),
        grade: $('pb-grade'),
        tip: $('pb-tip'),
        // result overlay
        resultOverlay: $('pb-result-overlay'),
        resultGrade: $('pb-result-grade'),
        resultLabel: $('pb-result-label'),
        resultStars: $('pb-result-stars'),
        resultScore: $('pb-result-score'),
        nextOrderBtn: $('pb-next-order-btn'),
        // reset
        resetBtn: $('pb-reset-btn'),
        // stations
        stationTabs: document.querySelectorAll('.pb-station-tab'),
        stations: document.querySelectorAll('.pb-station'),
        moldBtns: document.querySelectorAll('.pb-mold-btn'),
        ingredients: document.querySelectorAll('.pb-ingredient'),
    };

    // ---- HELPERS ----
    function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function showStation(name) {
        el.stations.forEach(s => s.hidden = s.dataset.station !== name);
        el.stationTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    }

    function updateHud() {
        el.score.textContent = G.score;
        el.combo.textContent = `x${G.combo}`;
        el.level.textContent = `${G.level}/${MAX_LEVEL}`;
    }

    function difficultyFactor() {
        return Math.min(G.level, MAX_LEVEL) / MAX_LEVEL;
    }

    function gradeFromScore(pct) {
        if (pct >= 95) return { grade: 'A+', label: '¡Perfecto! ¡Eres un maestro!', stars: '⭐⭐⭐' };
        if (pct >= 80) return { grade: 'A',  label: '¡Excelente trabajo!',          stars: '⭐⭐⭐' };
        if (pct >= 65) return { grade: 'B',  label: '¡Muy bien!',                   stars: '⭐⭐' };
        if (pct >= 50) return { grade: 'C',  label: 'Bien, ¡sigue practicando!',    stars: '⭐' };
        return { grade: 'D', label: 'Necesitas más práctica', stars: '' };
    }

    // ---- QUEUES & TICKETS ----
    function generateOrder() {
        const order = Object.assign({}, pickRandom(ORDERS));
        const customer = pickRandom(CUSTOMERS);
        order.customer = customer;
        order.num = G.orderNum++;
        return order;
    }

    function fillQueue(count = 3) {
        while (G.orderQueue.length < count) {
            G.orderQueue.push(generateOrder());
        }
        renderTickets();
    }

    function renderTickets() {
        if (!el.ticketSlots) return;
        el.ticketSlots.innerHTML = G.orderQueue.slice(0, 5).map((o, i) =>
            `<div class="pb-ticket${i === 0 && G.currentOrder ? ' active-ticket' : ''}" data-idx="${i}">
                <strong>#${String(o.num).padStart(2,'0')}</strong>
                ${o.base} · ${o.topping}
            </div>`
        ).join('');
    }

    function takeOrder() {
        if (!G.orderQueue.length) fillQueue(3);
        G.currentOrder = G.orderQueue.shift();
        fillQueue(3);

        // Show customer
        const c = G.currentOrder.customer;
        el.customerImg.src = c.img;
        el.customerEmotion.textContent = c.mood;
        el.customerName.textContent = c.name;
        el.customerMsg.textContent = `¡Quiero: ${G.currentOrder.label}!`;

        // Show order card
        el.orderNum.textContent = `#${String(G.currentOrder.num).padStart(2,'0')}`;
        el.orderReqs.innerHTML = `
            <div class="req-row"><span class="req-icon">🎂</span> Base: <strong>${G.currentOrder.base}</strong></div>
            <div class="req-row"><span class="req-icon">🫙</span> Relleno: <strong>${G.currentOrder.filling}</strong></div>
            <div class="req-row"><span class="req-icon">🍓</span> Decoración: <strong>${G.currentOrder.topping}</strong></div>
        `;

        el.takeOrderBtn.disabled = true;
        renderTickets();

        // Reset build state
        resetBuild();
        showStation('build');
    }

    // ---- BUILD STATION ----
    function resetBuild() {
        G.build = { base: null, mold: 'Redondo' };
        G.bake = { score: 0, baked: false };
        G.top = { toppings: [], toolSelected: null, dotCount: 0 };
        G.pouringActive = false;
        G.pourValue = 0;
        cancelAnimationFrame(G.pourRAF);
        cancelAnimationFrame(G.bakeRAF);

        // Reset UI
        el.moldFill.style.height = '0%';
        el.moldFill.style.background = '';
        el.moldDropHint.style.display = '';
        el.pourControls.style.display = 'none';
        el.pourIndicator.style.left = '0%';
        el.toBakeBtn.disabled = true;

        // Reset bake
        el.ovenGlass.classList.remove('heating');
        el.ovenCakeInside.style.display = 'none';
        el.bakeMeterArea.style.display = 'none';
        el.bakeNeedle.style.left = '50%';
        el.bakeStatus.textContent = 'Mete la torta al horno';
        el.toTopBtn.disabled = true;
        el.rawCake.style.display = 'flex';

        // Reset top
        el.finalToppings.innerHTML = '';
        el.finalFilling.innerHTML = '';
        el.finalBase.className = 'pb-cake-layer base-layer';
        el.selectedToolIndicator.textContent = 'Sin herramienta seleccionada';
        el.toppingTools.forEach(t => t.classList.remove('selected'));
    }

    // Drag & Drop: Ingredient → Mold
    el.ingredients.forEach(ing => {
        ing.addEventListener('dragstart', e => {
            e.dataTransfer.setData('base', ing.dataset.value);
            ing.classList.add('dragging');
        });
        ing.addEventListener('dragend', () => ing.classList.remove('dragging'));
    });

    el.pourZone.addEventListener('dragover', e => {
        e.preventDefault();
        el.pourZone.classList.add('drag-over');
    });
    el.pourZone.addEventListener('dragleave', () => el.pourZone.classList.remove('drag-over'));
    el.pourZone.addEventListener('drop', e => {
        e.preventDefault();
        el.pourZone.classList.remove('drag-over');
        const base = e.dataTransfer.getData('base');
        if (!base || !G.currentOrder) return;
        startPouring(base);
    });

    function startPouring(base) {
        G.build.base = base;
        const color = BASE_COLORS[base];
        el.moldDropHint.style.display = 'none';
        el.moldFill.style.background = color.fill;
        el.pourControls.style.display = 'flex';
        G.pouringActive = true;
        G.pourValue = 0;
        G.pourDirection = 1;
        animatePour();
    }

    function animatePour() {
        if (!G.pouringActive) return;
        G.pourValue += G.pourDirection * 1.2;
        if (G.pourValue >= 100) { G.pourValue = 100; G.pourDirection = -1; }
        if (G.pourValue <= 0)   { G.pourValue = 0;   G.pourDirection =  1; }

        // Indicator moves in the track (0-100% maps to 2%-90% CSS)
        const trackPct = (G.pourValue / 100) * 88 + 2;
        el.pourIndicator.style.left = trackPct + '%';
        G.pourRAF = requestAnimationFrame(animatePour);
    }

    el.pourStopBtn.addEventListener('click', () => {
        if (!G.pouringActive) return;
        G.pouringActive = false;
        cancelAnimationFrame(G.pourRAF);

        // The perfect pouring zone narrows as the level rises.
        const v = G.pourValue;
        const perfectHalf = 24 - difficultyFactor() * 18;
        const goodHalf = 38 - difficultyFactor() * 18;
        let buildScore = 0;
        if (v >= 50 - perfectHalf && v <= 50 + perfectHalf) buildScore = 100;
        else if (v >= 50 - goodHalf && v <= 50 + goodHalf) buildScore = 70;
        else buildScore = 30;

        G.scores.build = buildScore;
        el.moldFill.style.height = `${40 + v * 0.4}%`;
        el.pourControls.style.display = 'none';
        el.toBakeBtn.disabled = false;

        // Feedback
        const tip = buildScore === 100 ? '¡Masa perfecta! 👏' : buildScore === 70 ? '¡Buen intento!' : 'La masa quedó muy mal 😬';
        el.tip.textContent = tip;

        // Update mold visual to show color
        const color = BASE_COLORS[G.build.base];
        el.moldFill.style.background = color.fill;
        el.moldFill.style.height = '75%';
    });

    // Mold buttons
    el.moldBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.moldBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            G.build.mold = btn.dataset.mold;
            // Apply mold shape
            if (btn.dataset.mold === 'Cuadrado') el.moldVisual.className = 'pb-mold-visual square';
            else if (btn.dataset.mold === 'Corazon') el.moldVisual.className = 'pb-mold-visual heart';
            else el.moldVisual.className = 'pb-mold-visual';
        });
    });

    el.toBakeBtn.addEventListener('click', () => {
        if (!G.build.base) return;
        // Update raw cake visual
        const color = BASE_COLORS[G.build.base];
        el.rawCakeVisual.style.background = `linear-gradient(145deg, ${color.fill}cc, ${color.fill})`;
        showStation('bake');
    });

    // ---- BAKE STATION ----
    // Drag raw cake → oven
    el.rawCake.addEventListener('dragstart', e => {
        e.dataTransfer.setData('cake', '1');
        el.rawCake.classList.add('dragging');
    });
    el.rawCake.addEventListener('dragend', () => el.rawCake.classList.remove('dragging'));

    el.ovenDropzone.addEventListener('dragover', e => {
        e.preventDefault();
        el.ovenDropzone.classList.add('drag-over');
    });
    el.ovenDropzone.addEventListener('dragleave', () => el.ovenDropzone.classList.remove('drag-over'));
    el.ovenDropzone.addEventListener('drop', e => {
        e.preventDefault();
        el.ovenDropzone.classList.remove('drag-over');
        startBaking();
    });

    function startBaking() {
        el.rawCake.style.display = 'none';
        el.ovenGlass.classList.add('heating');
        el.ovenCakeInside.style.display = 'block';

        // Set oven cake color to match base
        const color = BASE_COLORS[G.build.base || 'Vainilla'];
        el.ovenCakeInside.style.background = `linear-gradient(145deg, ${color.fill}dd, ${color.fill})`;

        el.bakeMeterArea.style.display = 'flex';
        el.bakeStatus.textContent = '🔥 Horneando...';

        G.bakeNeedlePos = 10; // Start in "Cruda" zone
        G.bakeDirection = 1;
        G.bakeNeedleSpeed = 0.6 + difficultyFactor() * 3; // Level 100 is the fastest challenge.
        animateBakeNeedle();
    }

    function animateBakeNeedle() {
        G.bakeNeedlePos += G.bakeDirection * G.bakeNeedleSpeed;

        if (G.bakeNeedlePos >= 98) { G.bakeNeedlePos = 98; G.bakeDirection = -1; }
        if (G.bakeNeedlePos <= 2)  { G.bakeNeedlePos = 2;  G.bakeDirection =  1; }

        el.bakeNeedle.style.left = G.bakeNeedlePos + '%';

        // Update status text
        const p = G.bakeNeedlePos;
        if (p < 15 || p > 85) el.bakeStatus.textContent = '🥶 ¡Muy cruda / quemada!';
        else if ((p >= 15 && p < 30) || (p > 70 && p <= 85)) el.bakeStatus.textContent = '👍 Casi lista...';
        else if (p >= 30 && p <= 70) el.bakeStatus.textContent = '✅ ¡Zona perfecta! ¡Ahora!';

        G.bakeRAF = requestAnimationFrame(animateBakeNeedle);
    }

    el.takeOutBtn.addEventListener('click', () => {
        cancelAnimationFrame(G.bakeRAF);
        const p = G.bakeNeedlePos;

        const perfectHalf = 10 - difficultyFactor() * 6;
        const goodHalf = 20 - difficultyFactor() * 10;
        const fairHalf = 30 - difficultyFactor() * 12;
        let bakeScore = 0;
        let label = '';
        if (p >= 50 - perfectHalf && p <= 50 + perfectHalf) { bakeScore = 100; label = '¡Cocción PERFECTA! 🎉'; }
        else if (p >= 50 - goodHalf && p <= 50 + goodHalf) { bakeScore = 75; label = '¡Bien horneada! 👍'; }
        else if (p >= 50 - fairHalf && p <= 50 + fairHalf) { bakeScore = 40; label = 'Poco cocida... 😕'; }
        else { bakeScore = 10; label = '¡Quemada! 🔥😱'; }

        G.scores.bake = bakeScore;
        G.bake.baked = true;
        el.bakeStatus.textContent = label;
        el.tip.textContent = label;
        el.toTopBtn.disabled = false;
        el.ovenGlass.classList.remove('heating');

        setTimeout(() => {
            showStation('top');
            setupTopStation();
        }, 800);
    });

    // ---- TOP STATION ----
    function setupTopStation() {
        const base = G.build.base || 'Vainilla';
        const color = BASE_COLORS[base];

        el.finalBase.className = `pb-cake-layer base-layer${color.cls ? ' ' + color.cls : ''}`;
        el.finalFilling.innerHTML = '';
        el.finalToppings.innerHTML = '';
        G.top.toppings = [];
        G.top.dotCount = 0;
    }

    // Select topping tool
    el.toppingTools.forEach(tool => {
        tool.addEventListener('click', () => {
            el.toppingTools.forEach(t => t.classList.remove('selected'));
            tool.classList.add('selected');
            G.top.toolSelected = tool.dataset.topping;
            el.selectedToolIndicator.textContent = `🖌️ Usando: ${G.top.toolSelected}`;

            // Update cursor
            el.cakeCanvas.style.cursor = 'crosshair';
        });
    });

    // Click on cake canvas to place topping
    el.cakeCanvas.addEventListener('click', e => {
        if (!G.top.toolSelected) {
            el.selectedToolIndicator.textContent = '⚠️ ¡Selecciona una herramienta primero!';
            return;
        }
        const rect = el.cakeCanvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp to cake shape (ellipse)
        const cx = 50, cy = 45, rx = 45, ry = 35;
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy > 1) return; // Outside cake ellipse

        placeToppingDot(x, y, G.top.toolSelected);
    });

    function placeToppingDot(x, y, topping) {
        G.top.toppings.push(topping);
        G.top.dotCount++;

        const color = TOPPING_COLORS[topping] || '#888';
        const isCream = ['Arequipe', 'Ganache', 'Crema', 'Crema Chantilly', 'Merengue', 'Espuma', 'Mousse'].includes(topping);
        const isMousse = topping === 'Mousse';

        const dot = document.createElement('div');
        dot.className = `pb-topping-dot${isCream ? ' pb-cream-dollop' : ''}${isMousse ? ' pb-mousse-foam' : ''}`;
        dot.style.left = x + '%';
        dot.style.top = y + '%';
        dot.style.width = isMousse ? '38px' : isCream ? '30px' : '14px';
        dot.style.height = isMousse ? '30px' : isCream ? '24px' : '14px';
        dot.style.background = color;
        dot.style.transform = 'translate(-50%, -50%)';
        if (!isCream) dot.style.borderRadius = '50%';
        else dot.style.borderRadius = '8px';
        dot.style.opacity = '1';
        dot.style.animation = 'toppingPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

        el.finalToppings.appendChild(dot);

        // Auto calc top score based on count and correct topping
        const correct = G.currentOrder ? G.currentOrder.topping : '';
        const correctCount = G.top.toppings.filter(t => t === correct).length;
        const total = G.top.dotCount;
        const coverage = Math.min(total / 8, 1); // ideal: 8 dots
        const accuracy = total > 0 ? correctCount / total : 0;
        G.scores.top = Math.round(coverage * 60 + accuracy * 40);
    }

    el.deliverBtn.addEventListener('click', deliverOrder);

    function deliverOrder() {
        if (!G.currentOrder) return;

        // Calculate ingredient accuracy bonus
        const order = G.currentOrder;
        let ingredientBonus = 0;
        if (G.build.base === order.base) ingredientBonus += 20;
        const topCorrect = G.top.toppings.filter(t => t === order.topping).length;
        if (topCorrect >= 3) ingredientBonus += 20;
        G.scores.top = Math.min(G.scores.top + ingredientBonus, 100);

        const total = Math.round((G.scores.build + G.scores.bake + G.scores.top) / 3);
        const pts = Math.round(total * G.combo * 10);
        G.score += pts;
        G.combo = total >= 80 ? G.combo + 1 : 1;
        G.level = Math.min(MAX_LEVEL, Math.floor(G.score / 500) + 1);

        // Update score bars
        animateBar(el.sbarBuild, G.scores.build); el.snumBuild.textContent = G.scores.build + '%';
        animateBar(el.sbarBake, G.scores.bake);   el.snumBake.textContent  = G.scores.bake  + '%';
        animateBar(el.sbarTop, G.scores.top);     el.snumTop.textContent   = G.scores.top   + '%';
        animateBar(el.sbarTotal, total);           el.snumTotal.textContent = total           + '%';

        const g = gradeFromScore(total);
        el.grade.textContent = g.grade;
        el.tip.textContent   = g.label;

        updateHud();

        if (G.level === MAX_LEVEL) {
            el.tip.textContent = '¡Nivel 100 alcanzado! Los pedidos siguen en dificultad máxima.';
        }

        // Show result overlay
        el.resultOverlay.hidden = false;
        el.resultGrade.textContent  = g.grade;
        el.resultLabel.textContent  = g.label;
        el.resultStars.textContent  = g.stars;
        el.resultScore.textContent  = `+${pts} pts`;

        G.currentOrder = null;
    }

    function animateBar(bar, pct) {
        bar.style.width = '0%';
        requestAnimationFrame(() => {
            setTimeout(() => { bar.style.width = pct + '%'; }, 50);
        });
    }

    el.nextOrderBtn.addEventListener('click', () => {
        el.resultOverlay.hidden = true;
        el.takeOrderBtn.disabled = false;
        el.customerMsg.textContent = '¡Listo para un nuevo pedido!';
        el.customerEmotion.textContent = '😊';
        showStation('build');
        resetBuild();
    });

    el.takeOrderBtn.addEventListener('click', takeOrder);

    el.resetBtn.addEventListener('click', () => {
        G.score = 0; G.combo = 1; G.level = 1; G.orderNum = 1;
        G.currentOrder = null; G.orderQueue = [];
        el.resultOverlay.hidden = true;
        el.takeOrderBtn.disabled = false;
        el.sbarBuild.style.width = '0%'; el.snumBuild.textContent = '-';
        el.sbarBake.style.width  = '0%'; el.snumBake.textContent  = '-';
        el.sbarTop.style.width   = '0%'; el.snumTop.textContent   = '-';
        el.sbarTotal.style.width = '0%'; el.snumTotal.textContent = '-';
        el.grade.textContent = '';
        el.tip.textContent = '¡Prepara tu primer pedido!';
        updateHud();
        fillQueue(3);
        resetBuild();
        showStation('build');
    });

    el.toTopBtn.addEventListener('click', () => {
        showStation('top');
        setupTopStation();
    });

    // ---- INIT ----
    function init() {
        if (!$('pb-game-wrapper')) return; // Not on game page
        fillQueue(3);
        updateHud();
        showStation('build');
        el.tip.textContent = '¡Toma un pedido para comenzar!';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();