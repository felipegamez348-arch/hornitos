/* ============================================================
   DULCE TENTACIÓN - Carrito de Compras Profesional
   - Persistencia en localStorage con expiración de 48 horas
   - Banner y temporizador en tiempo real de 48 hrs
   - Modal interactivo de entrega estilo DiDi con Leaflet + Google Maps
   - Enlace automático a WhatsApp (+57 310 573 1569) con coordenadas GPS
   - Simulador de rastreo en vivo en mapa con animación del repartidor y voz
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initCartSystem();
});

// Número oficial de WhatsApp y dirección
const BAKERY_PHONE = '573105731569';
const BAKERY_ADDRESS = 'Urbanización San Jacinto, Diagonal 2B #5-45, Tocaima, Cundinamarca';
const BAKERY_COORDS = [4.461453, -74.633131]; // Urbanización San Jacinto, Diagonal 2B #5-45, Tocaima

// Formateador de moneda colombiana
const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// Estado global del carrito
let carrito = [];

// ==========================================
// Carga y Expiración del Carrito (48 horas)
// ==========================================
function cargarCarritoDesdeStorage() {
    try {
        const savedCart = localStorage.getItem('carrito');
        const savedTimestamp = localStorage.getItem('carritoTimestamp');

        if (savedCart) {
            const now = Date.now();
            const tiempoTranscurrido = now - parseInt(savedTimestamp || '0', 10);
            const limite48Horas = 48 * 60 * 60 * 1000;

            if (savedTimestamp && tiempoTranscurrido > limite48Horas) {
                console.log("El carrito ha expirado después de 48 horas. Borrando historial...");
                localStorage.removeItem('carrito');
                localStorage.removeItem('carritoTimestamp');
                carrito = [];
            } else {
                carrito = JSON.parse(savedCart);
            }
        }
    } catch (e) {
        console.error("Error al cargar el carrito de localStorage:", e);
        carrito = [];
    }
}

function guardarCarritoEnStorage() {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        if (carrito.length > 0) {
            if (!localStorage.getItem('carritoTimestamp')) {
                localStorage.setItem('carritoTimestamp', Date.now().toString());
            }
        } else {
            localStorage.removeItem('carritoTimestamp');
        }
    } catch (e) {
        console.error("Error al guardar el carrito en localStorage:", e);
    }
}

// ==========================================
// Métodos públicos del Carrito
// ==========================================
window.agregar = function(nombre, precio, imagen) {
    cargarCarritoDesdeStorage();
    
    // Normalizar precio numérico si viene como string
    if (typeof precio === 'string') {
        precio = parseInt(precio.replace(/[^0-9]/g, ''), 10) || 0;
    }

    const itemExistente = carrito.find(item => item.nombre === nombre || item.name === nombre);

    if (itemExistente) {
        itemExistente.cantidad = (itemExistente.cantidad || itemExistente.qty || 1) + 1;
    } else {
        carrito.push({
            nombre: nombre,
            name: nombre,
            precio: precio,
            price: precio,
            imagen: imagen || 'assets/images/croissant.jpeg',
            cantidad: 1,
            qty: 1
        });
    }

    guardarCarritoEnStorage();
    actualizarCarrito();
    abrirCarrito();
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.classList.remove('cart-badge-pop');
        void badge.offsetWidth;
        badge.classList.add('cart-badge-pop');
    }
    mostrarToastFeedback(`🛒 "${nombre}" agregado al pedido`);
};

// Compatibilidad con addToCart
window.addToCart = function(nombre, precio, imagen) {
    window.agregar(nombre, precio, imagen);
};

window.eliminarItem = function(index) {
    if (carrito[index]) {
        const eliminado = carrito[index].nombre || 'Producto';
        carrito.splice(index, 1);
        guardarCarritoEnStorage();
        actualizarCarrito();
        mostrarToastFeedback(`❌ "${eliminado}" eliminado`);
    }
};

window.removeFromCart = function(index) {
    window.eliminarItem(index);
};

window.cambiarCantidad = function(index, delta) {
    if (carrito[index]) {
        carrito[index].cantidad = (carrito[index].cantidad || 1) + delta;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        guardarCarritoEnStorage();
        actualizarCarrito();
    }
};

window.disminuirPorNombre = function(nombre) {
    cargarCarritoDesdeStorage();
    const index = carrito.findIndex(item => (item.nombre || item.name) === nombre);
    if (index !== -1) {
        window.cambiarCantidad(index, -1);
    }
};

window.changeQty = function(index, delta) {
    window.cambiarCantidad(index, delta);
};

window.vaciarCarrito = function() {
    if (confirm("¿Deseas vaciar todos los productos de tu carrito?")) {
        carrito = [];
        localStorage.removeItem('carrito');
        localStorage.removeItem('carritoTimestamp');
        actualizarCarrito();
        mostrarToastFeedback("Carrito vaciado");
    }
};

// ==========================================
// Renderizado y Actualización de UI
// ==========================================
function actualizarCarrito() {
    const lista = document.getElementById("listaCarrito");
    const countBadge = document.getElementById("cartCount");
    const navBadge = document.querySelector(".cart-badge");
    const totalElement = document.getElementById("cartTotalValue");
    const totalItemsElement = document.getElementById("cartTotalItems");

    let totalPrecio = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        const cant = item.cantidad || item.qty || 1;
        const prec = item.precio || item.price || 0;
        totalPrecio += prec * cant;
        totalItems += cant;
    });

    // Actualizar insignias de conteo
    if (countBadge) {
        countBadge.textContent = totalItems > 99 ? '99+' : totalItems;
        countBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (navBadge) {
        navBadge.textContent = totalItems > 0 ? totalItems : '🛒';
    }

    // Actualizar valor total
    if (totalElement) {
        totalElement.textContent = formatter.format(totalPrecio);
    }
    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems;
    }

    if (!lista) return;

    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="cart-empty-view">
                <div style="font-size: 3.5rem; margin-bottom: 12px; opacity: 0.7;">🧺</div>
                <p class="empty-cart-msg">Tu carrito está vacío.</p>
                <p style="font-size: 0.85rem; color: #8D7B77; margin-top: 5px;">¡Explora nuestros panes frescos y delicias artesanales!</p>
            </div>
        `;
        const btnPagar = document.querySelector(".checkout-btn");
        if (btnPagar) btnPagar.disabled = true;
        return;
    }

    const btnPagar = document.querySelector(".checkout-btn");
    if (btnPagar) btnPagar.disabled = false;

    // Banner de advertencia de 48 horas (Idéntico a la tienda de Tocaima)
    const bannerDiv = document.createElement("div");
    bannerDiv.className = "cart-expiration-banner";
    bannerDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 1.1rem;">⏳</span>
            <span>Tu pedido se reservará por 48 horas para asegurar su máxima frescura artesanal.</span>
        </div>
        <div id="cartTimerDisplay" style="font-size: 0.72rem; font-weight: 800; opacity: 0.9; text-align: center; color: #D84315;"></div>
    `;
    lista.appendChild(bannerDiv);

    // Listar productos
    carrito.forEach((item, index) => {
        const cant = item.cantidad || item.qty || 1;
        const prec = item.precio || item.price || 0;
        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";

        itemDiv.innerHTML = `
            <img src="${item.imagen || 'assets/images/croissant.jpeg'}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='assets/images/croissant.jpeg'">
            <div class="cart-item-info">
                <h4>${item.nombre || item.name}</h4>
                <p>${formatter.format(prec)} c/u</p>
                <div class="cart-qty">
                    <button class="qty-btn" onclick="cambiarCantidad(${index}, -1)" title="Disminuir">-</button>
                    <span>${cant}</span>
                    <button class="qty-btn" onclick="cambiarCantidad(${index}, 1)" title="Aumentar">+</button>
                </div>
                <button class="delete-btn" onclick="eliminarItem(${index})">ELIMINAR</button>
            </div>
            <div class="cart-item-subtotal" aria-label="Subtotal">
                ${formatter.format(prec * cant)}
            </div>
        `;

        lista.appendChild(itemDiv);
    });

    actualizarTemporizador48h();
}

// Temporizador regresivo en vivo
let _timerInterval = null;
function actualizarTemporizador48h() {
    const timerDisplay = document.getElementById("cartTimerDisplay");
    const savedTimestamp = localStorage.getItem('carritoTimestamp');
    if (!savedTimestamp || carrito.length === 0) {
        if (_timerInterval) clearInterval(_timerInterval);
        return;
    }

    const limiteMs = parseInt(savedTimestamp, 10) + (48 * 60 * 60 * 1000);

    const tick = () => {
        const ahora = Date.now();
        const restante = limiteMs - ahora;

        if (restante <= 0) {
            clearInterval(_timerInterval);
            console.log("El pedido ha alcanzado el límite de 48 horas.");
            carrito = [];
            localStorage.removeItem('carrito');
            localStorage.removeItem('carritoTimestamp');
            actualizarCarrito();
            return;
        }

        const horas = Math.floor(restante / (1000 * 60 * 60));
        const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((restante % (1000 * 60)) / 1000);

        const pad = (n) => n < 10 ? '0' + n : n;
        const textoTiempo = `Tiempo restante: ${pad(horas)}h ${pad(minutos)}m ${pad(segundos)}s`;

        const display = document.getElementById("cartTimerDisplay");
        if (display) display.textContent = textoTiempo;
    };

    tick();
    if (_timerInterval) clearInterval(_timerInterval);
    _timerInterval = setInterval(tick, 1000);
}

// ==========================================
// Control del Cajón Lateral (Cart Sidebar)
// ==========================================
function abrirCarrito() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
}
window.openCart = abrirCarrito;

function cerrarCarrito() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
}
window.closeCartSidebar = cerrarCarrito;

function initCartSystem() {
    cargarCarritoDesdeStorage();

    // Trigger flotante
    const cartTrigger = document.getElementById('cartTrigger');
    if (cartTrigger) {
        cartTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sidebar = document.getElementById('cartSidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                cerrarCarrito();
            } else {
                abrirCarrito();
            }
        });
    }

    // Botón cerrar y overlay
    const closeBtn = document.getElementById('closeCart');
    if (closeBtn) closeBtn.addEventListener('click', cerrarCarrito);

    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', cerrarCarrito);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') cerrarCarrito();
    });

    // Evitar cierre al hacer click dentro del sidebar
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => e.stopPropagation());
    }

    actualizarCarrito();
}

// ==========================================
// Checkout / Pagar -> Abre Modal DiDi
// ==========================================
window.pagar = function() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega deliciosos productos antes de continuar.");
        return;
    }
    abrirMapaPedidoDidi();
};

window.hacerPedido = window.pagar;

// ==========================================
// MODAL INTERACTIVO ESTILO DIDI (Mapa Leaflet + Google Tiles)
// ==========================================
window.abrirMapaPedidoDidi = function() {
    // 1. Cargar CSS de Leaflet si no está presente
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    // 2. Cargar JS de Leaflet si no está presente
    if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = iniciarMapaDidi;
        document.head.appendChild(script);
    } else {
        iniciarMapaDidi();
    }
};

function iniciarMapaDidi() {
    const existModal = document.getElementById('didiMapModal');
    if (existModal) existModal.remove();

    const modal = document.createElement('div');
    modal.id = 'didiMapModal';
    modal.className = 'didi-modal';

    modal.innerHTML = `
        <div class="didi-modal-content">
            <div class="didi-header">
                <button class="didi-back-btn" onclick="cerrarDidiMapModal()" title="Volver">←</button>
                <div class="didi-header-title">Fija tu Punto de Entrega 🛵</div>
            </div>
            
            <div style="flex-grow: 1; position: relative;">
                <!-- Leaflet Map Container -->
                <div id="didiMap" style="width: 100%; height: 100%; z-index: 1;"></div>
                
                <!-- Floating Pin en el centro del mapa -->
                <div class="didi-center-pin">
                    <div class="didi-pin-label">Entregar aquí 📍</div>
                    <div class="didi-pin-icon"></div>
                    <div class="didi-pin-shadow"></div>
                </div>
            </div>
            
            <!-- Didi Bottom Sheet -->
            <div class="didi-bottom-sheet">
                <div class="didi-sheet-handle"></div>
                <div class="didi-location-box">
                    <div class="didi-icon-marker">📍</div>
                    <div class="didi-info-text">
                        <label>Dirección de Entrega en Tocaima:</label>
                        <input type="text" id="didiAddressInput" placeholder="Ej: Urbanización San Jacinto, Diagonal 2B #5-45, Tocaima" value="Urbanización San Jacinto, Diagonal 2B #5-45, Tocaima, Cundinamarca">
                    </div>
                </div>
                
                <div class="didi-details-row">
                    <div class="didi-detail-item">
                        <span class="didi-detail-icon">🕒</span>
                        <span class="didi-detail-text">15 - 25 min</span>
                    </div>
                    <div class="didi-detail-item">
                        <span class="didi-detail-icon">💵</span>
                        <span class="didi-detail-text">Efectivo / Nequi</span>
                    </div>
                    <div class="didi-detail-item">
                        <span class="didi-detail-icon">🛵</span>
                        <span class="didi-detail-text">Envío Gratis</span>
                    </div>
                </div>
                
                <button class="didi-confirm-btn" onclick="confirmarPedidoDidi()">
                    CONFIRMAR DIRECCIÓN Y PEDIR ➔
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animación de entrada
    setTimeout(() => modal.classList.add('active'), 50);

    // Coordenadas iniciales: Centro de Tocaima
    let startCoords = BAKERY_COORDS;

    const setupMap = (coords) => {
        const map = L.map('didiMap', { zoomControl: false }).setView(coords, 16);
        modal.didiMapInstance = map;

        // Capa de Google Maps Satélite/Calles
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: '© Google Maps'
        }).addTo(map);

        // Resaltar la sede principal de la panadería
        L.circle(BAKERY_COORDS, {
            color: '#E65100',
            fillColor: '#E65100',
            fillOpacity: 0.15,
            radius: 120
        }).addTo(map);

        // Geocodificación inversa al mover el mapa
        map.on('moveend', () => {
            const center = map.getCenter();
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=18&addressdetails=1`)
                .then(res => res.json())
                .then(data => {
                    const addressInput = document.getElementById('didiAddressInput');
                    if (addressInput && data && data.display_name) {
                        const addr = data.address || {};
                        const road = addr.road || addr.pedestrian || "";
                        const house = addr.house_number || "";
                        const suburb = addr.suburb || addr.neighbourhood || "";
                        const city = addr.city || addr.town || addr.village || "Tocaima";

                        let readableStr = "";
                        if (road) readableStr += road;
                        if (house) readableStr += " #" + house;
                        if (suburb) readableStr += (readableStr ? ", " : "") + suburb;
                        if (city) readableStr += (readableStr ? ", " : "") + city;

                        addressInput.value = readableStr || data.display_name.split(',').slice(0, 3).join(',');
                    }
                })
                .catch(err => {
                    console.warn("Geocodificación:", err);
                    const addressInput = document.getElementById('didiAddressInput');
                    if (addressInput) {
                        addressInput.value = `Tocaima (${center.lat.toFixed(4)}, ${center.lng.toFixed(4)})`;
                    }
                });
        });
    };

    // Intentar geolocalización o usar coordenadas por defecto
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                startCoords = [pos.coords.latitude, pos.coords.longitude];
                setupMap(startCoords);
            },
            () => setupMap(startCoords),
            { enableHighAccuracy: true, timeout: 3500 }
        );
    } else {
        setupMap(startCoords);
    }
}

window.cerrarDidiMapModal = function() {
    const modal = document.getElementById('didiMapModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 350);
    }
};

window.confirmarPedidoDidi = function() {
    const modal = document.getElementById('didiMapModal');
    if (!modal || !modal.didiMapInstance) return;

    const map = modal.didiMapInstance;
    const center = map.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    const addressInput = document.getElementById('didiAddressInput');
    const addressText = addressInput ? addressInput.value.trim() : BAKERY_ADDRESS;

    // 1. Generar enlace de Google Maps con las coordenadas para el domiciliario
    const mapsLink = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

    // 2. Construir mensaje de WhatsApp con formato idéntico
    let mensaje = "🍰 *¡Hola Dulce Tentación!* Me gustaría realizar el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach(item => {
        const cant = item.cantidad || item.qty || 1;
        const prec = item.precio || item.price || 0;
        const nom = item.nombre || item.name;
        mensaje += `• *${cant}x* ${nom} (_${formatter.format(prec * cant)}_)\n`;
        total += prec * cant;
    });

    mensaje += `\n*Total a pagar:* ${formatter.format(total)}\n`;
    mensaje += `\n📍 *Dirección de entrega:* ${addressText}\n`;
    mensaje += `🗺️ *Ubicación GPS:* ${mapsLink}\n\n`;
    mensaje += "¡Muchas gracias! Quedo atento a la confirmación de mi orden.";

    // 3. Abrir WhatsApp con el número oficial (+57 310 573 1569)
    const encodeUrl = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${BAKERY_PHONE}?text=${encodeUrl}`, '_blank');

    // 4. Guardar coordenadas para el simulador y limpiar carrito
    const deliveryCoords = [lat, lng];
    cerrarDidiMapModal();

    carrito = [];
    localStorage.removeItem('carrito');
    localStorage.removeItem('carritoTimestamp');
    actualizarCarrito();
    cerrarCarrito();

    // 5. Iniciar simulador de rastreo en tiempo real
    iniciarRastreoDidiConCoords(deliveryCoords, addressText);
};

// ==========================================
// SIMULADOR DE RASTREO EN VIVO ESTILO DIDI
// ==========================================
function iniciarRastreoDidiConCoords(deliveryCoords, addressText) {
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => montarMapaRastreo(deliveryCoords, addressText);
        document.head.appendChild(script);
    } else {
        montarMapaRastreo(deliveryCoords, addressText);
    }
}

function montarMapaRastreo(userLocation, addressText) {
    const modal = document.createElement('div');
    modal.id = 'trackingModal';

    modal.innerHTML = `
        <div class="tracking-content whatsapp-style">
            <div class="tracking-header-wa">
                <button onclick="document.getElementById('trackingModal').remove()" class="back-btn" title="Cerrar">←</button>
                <h3>Sigue tu Pedido en Tiempo Real 🛵</h3>
            </div>
            <div id="trackingMap" style="width: 100%; height: 50vh; z-index: 1;"></div>
            <div class="tracking-bottom-sheet">
                <div class="sheet-item live-location">
                    <div class="icon-circle black" style="background: var(--accent-orange, #E65100); color: white;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    </div>
                    <div class="sheet-text">
                        <h4 id="trackingStatus">Preparando tu pedido</h4>
                        <p id="trackingSubStatus">El horno artesanal está encendido</p>
                    </div>
                </div>
                <div class="sheet-divider"></div>
                <div class="sheet-subtitle">Detalles de la Entrega</div>
                <div class="sheet-item">
                    <div class="icon-circle green">🏍️</div>
                    <div class="sheet-text">
                        <h4>Repartidor Dulce Tentación</h4>
                        <p id="trackingDistance">Calculando distancia en ruta...</p>
                    </div>
                </div>
                <div class="sheet-item">
                    <div class="icon-circle" style="background:#FAF6EE; color:#3E2723; font-size:16px;">🏪</div>
                    <div class="sheet-text">
                        <h4>Sede Principal Tocaima</h4>
                        <p>${BAKERY_ADDRESS}</p>
                    </div>
                </div>
                <div class="sheet-item">
                    <div class="icon-circle" style="background:#FAF6EE; color:#E65100; font-size:16px;">🏠</div>
                    <div class="sheet-text">
                        <h4>Destino del Pedido</h4>
                        <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${addressText}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const bakeryLocation = BAKERY_COORDS;
    const map = L.map('trackingMap', { zoomControl: false });
    map.fitBounds([bakeryLocation, userLocation], { padding: [40, 40] });

    // Google Maps satellite + labels layer for a more realistic live delivery view
    L.tileLayer('https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google Maps'
    }).addTo(map);

    // Ruta con línea punteada naranja
    L.polyline([bakeryLocation, userLocation], {
        color: '#E65100',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
    }).addTo(map);

    // Pines de Panadería y Casa
    const houseHtml = `<div style="background:#E65100; width:38px; height:38px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 15px rgba(230,81,0,0.4); color:white; font-size:18px;">🏠</div>`;
    const userIcon = L.divIcon({ html: houseHtml, className: '', iconSize: [38, 38], iconAnchor: [19, 19] });

    const bakeryHtml = `<div style="background:#3E2723; width:38px; height:38px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 15px rgba(62,39,35,0.4); color:white; font-size:18px;">🏪</div>`;
    const bakeryIcon = L.divIcon({ html: bakeryHtml, className: '', iconSize: [38, 38], iconAnchor: [19, 19] });

    // Moto del repartidor
    const motoHtml = `<div style="background:#E65100; width:44px; height:44px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; box-shadow: 0 6px 20px rgba(230,81,0,0.5); font-size: 22px;">🛵</div>`;
    const deliveryIcon = L.divIcon({ html: motoHtml, className: '', iconSize: [44, 44], iconAnchor: [22, 22] });

    L.marker(bakeryLocation, { icon: bakeryIcon }).addTo(map);
    L.marker(userLocation, { icon: userIcon }).addTo(map);

    const deliveryMarker = L.marker(bakeryLocation, { icon: deliveryIcon }).addTo(map);

    // Animación de ruta y voz
    let step = 0;
    const totalSteps = 100;
    const statusEl = document.getElementById('trackingStatus');
    const subStatusEl = document.getElementById('trackingSubStatus');
    const distEl = document.getElementById('trackingDistance');

    const hablar = () => {
        // La voz solo se activa en la animación inicial de entrada.
        return;
    };

setTimeout(() => {}, 800);

    const interval = setInterval(() => {
        step++;
        const lat = bakeryLocation[0] + (userLocation[0] - bakeryLocation[0]) * (step / totalSteps);
        const lng = bakeryLocation[1] + (userLocation[1] - bakeryLocation[1]) * (step / totalSteps);
        deliveryMarker.setLatLng([lat, lng]);

        map.panTo([lat, lng], { animate: true, duration: 0.15 });

        const distanceLeft = Math.round(600 - (600 * (step / totalSteps)));
        if (distEl) distEl.textContent = `A ${distanceLeft} metros de tu ubicación`;

        if (step === 10) {
            if (statusEl) statusEl.textContent = 'En camino';
            if (subStatusEl) subStatusEl.textContent = 'El repartidor está en ruta con tu pedido';
        }
        if (step === 50) {
        }
        if (step === 80) {
            if (statusEl) statusEl.textContent = 'Casi llegando';
            if (subStatusEl) subStatusEl.textContent = 'El repartidor está en tu cuadra';
        }

        if (step >= totalSteps) {
            clearInterval(interval);
            if (statusEl) statusEl.textContent = '¡Entregado!';
            if (subStatusEl) subStatusEl.textContent = 'Disfruta tus delicias recién horneadas';
            if (distEl) distEl.textContent = 'Completado con éxito';

            const liveCircle = document.querySelector('.icon-circle.black');
            if (liveCircle) liveCircle.style.background = '#25D366';

        }
    }, 240);
}

// Toast de notificación rápido
function mostrarToastFeedback(mensaje) {
    let toast = document.getElementById('cartNotificationToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartNotificationToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #2C2018;
            color: #fff;
            padding: 14px 24px;
            border-radius: 30px;
            font-size: 0.9rem;
            font-weight: 700;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            border: 1px solid rgba(212,140,41,0.4);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2800);
}
