/**
 * ═══════════════════════════════════════════════════════════════
 *  DULCE ARTESANAL — Motor de Datos Permanente (products.js)
 *  IndexedDB + localStorage · Autenticación · Productos · CRUD
 *  Visitantes · Gráficas · Respaldo · Compresión de Imágenes
 * ═══════════════════════════════════════════════════════════════
 */

/* ============================================================
   1. CONFIGURACIÓN Y CONSTANTES
   ============================================================ */
const DB_NAME = 'DulceArtesanalDB';
const DB_VERSION = 2;
const STORES = {
    products: 'products',
    reviews: 'reviews',
    orders: 'orders',
    visitors: 'visitors',
    snapshots: 'snapshots'
};

const LS_KEYS = {
    products: 'dulce_artesanal_products_v1',
    reviews: 'dulce_reviews',
    orders: 'dulce_orders',
    visitors: 'dulce_visitors',
    session: 'dulce_admin_session',
    sessionPersist: 'dulce_admin_session_persist'
};

/* ============================================================
   2. BASE DE DATOS IndexedDB
   ============================================================ */
let _db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (_db) return resolve(_db);
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            Object.values(STORES).forEach(name => {
                if (!db.objectStoreNames.contains(name)) {
                    db.createObjectStore(name, { keyPath: 'id', autoIncrement: false });
                }
            });
        };
        req.onsuccess = (e) => {
            _db = e.target.result;
            resolve(_db);
        };
        req.onerror = (e) => {
            console.warn('IndexedDB error:', e);
            resolve(null);
        };
    });
}

async function idbGetAll(storeName) {
    try {
        const db = await openDB();
        if (!db) return null;
        return new Promise((resolve) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve(null);
        });
    } catch { return null; }
}

async function idbPutAll(storeName, items) {
    try {
        const db = await openDB();
        if (!db) return;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        items.forEach(item => {
            if (item && (item.id !== undefined && item.id !== null)) {
                store.put(item);
            }
        });
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    } catch { return false; }
}

async function idbPut(storeName, item) {
    try {
        const db = await openDB();
        if (!db) return;
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(item);
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    } catch { return false; }
}

async function idbDelete(storeName, id) {
    try {
        const db = await openDB();
        if (!db) return false;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        if (typeof id === 'string' && !isNaN(id)) {
            store.delete(Number(id));
        } else if (typeof id === 'number') {
            store.delete(String(id));
        }
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    } catch { return false; }
}

async function idbClear(storeName) {
    try {
        const db = await openDB();
        if (!db) return false;
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    } catch { return false; }
}

/* ============================================================
   3. CAPA DE SINCRONIZACIÓN localStorage ↔ IndexedDB
   ============================================================ */
function lsGet(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
}

function lsSet(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.warn('localStorage write error:', e); }
}

async function syncFromIDB(storeName, lsKey) {
    const idbData = await idbGetAll(storeName);
    if (idbData && idbData.length > 0) {
        lsSet(lsKey, idbData);
        return idbData;
    }
    const lsData = lsGet(lsKey);
    if (lsData.length > 0) {
        await idbPutAll(storeName, lsData);
    }
    return lsData;
}

/* ============================================================
   4. PRODUCTOS POR DEFECTO DE FÁBRICA
   ============================================================ */
const DEFAULT_PRODUCTS = [
    {
        id: 'prod-croissant',
        name: 'Croissant Francés de Mantequilla',
        category: 'panaderia',
        price: 2000,
        badge: '✦ POPULAR',
        status: 'DISPONIBLE HOY',
        description: 'Croissant artesanal con capas de hojaldre, mantequilla de campo y fermentación larga de 72 horas.',
        specs: ['Hojaldre 72h', 'Mantequilla de campo', 'Crujiente'],
        image: 'assets/images/croissant.jpeg'
    },
    {
        id: 'prod-pan-alinado',
        name: 'Pan Aliñado Tradicional',
        category: 'panaderia',
        price: 2000,
        badge: '✦ TRADICIÓN',
        status: 'DISPONIBLE HOY',
        description: 'Pan aliñado artesanal con especias seleccionadas, suave y aromático.',
        specs: ['Artesanal', 'Especias naturales', 'Fresco diario'],
        image: 'assets/images/pan-aliniado.jpeg'
    },
    {
        id: 'prod-roscon',
        name: 'Roscón Tradicional de Guayaba',
        category: 'panaderia',
        price: 2000,
        badge: '✦ CLÁSICO',
        status: 'DISPONIBLE HOY',
        description: 'Roscón de guayaba artesanal con bocadillo veleño.',
        specs: ['Guayaba natural', 'Bocadillo veleño', 'Tradición colombiana'],
        image: 'assets/images/roscon.jpeg'
    },
    {
        id: 'prod-pan-queso',
        name: 'Pan de Queso Campesino',
        category: 'panaderia',
        price: 3000,
        badge: '✦ FAVORITO',
        status: 'DISPONIBLE HOY',
        description: 'Pan relleno de queso campesino derretido, crujiente por fuera y suave por dentro.',
        specs: ['Queso campesino', 'Horneado fresco', 'Doble queso'],
        image: 'assets/images/pan_de_queso.jpg'
    },
    {
        id: 'prod-mantecada',
        name: 'Mantecada Artesanal de Vainilla',
        category: 'panaderia',
        price: 4500,
        badge: '✦ ARTESANAL',
        status: 'DISPONIBLE HOY',
        description: 'Mantecada esponjosa con mantequilla de primera y esencia de vainilla natural.',
        specs: ['Vainilla natural', 'Esponjosa', 'Mantequilla premium'],
        image: 'assets/images/producto_1.jpg'
    },
    {
        id: 'prod-torta-choco',
        name: 'Torta Artesanal de Chocolate',
        category: 'reposteria',
        price: 16000,
        badge: '✦ ESPECIAL',
        status: 'BAJO PEDIDO',
        description: 'Torta húmeda de chocolate artesanal con ganache oscuro, decorada a mano.',
        specs: ['Chocolate 70%', 'Ganache artesanal', 'Decoración premium'],
        image: 'assets/images/torta_de_choco.jpg'
    },
    {
        id: 'prod-torta-casera',
        name: 'Torta Casera Tradicional',
        category: 'reposteria',
        price: 15000,
        badge: '✦ TRADICIÓN',
        status: 'DISPONIBLE HOY',
        description: 'Torta casera esponjosa con receta familiar de tres generaciones.',
        specs: ['Receta familiar', 'Esponjosa', 'Sin conservantes'],
        image: 'assets/images/torta_casera.jpeg'
    },
    {
        id: 'prod-torta-stitch',
        name: 'Torta Personalizada Stitch',
        category: 'reposteria',
        price: 45000,
        badge: '✦ PERSONALIZADA',
        status: 'BAJO PEDIDO',
        description: 'Torta temática personalizada con diseño artístico de Stitch en fondant.',
        specs: ['Fondant artístico', 'Personalizable', '3 pisos disponibles'],
        image: 'assets/images/torta_stitch.jpg'
    },
    {
        id: 'prod-torta-unicornio',
        name: 'Torta Mágica de Unicornio',
        category: 'reposteria',
        price: 50000,
        badge: '✦ PREMIUM',
        status: 'BAJO PEDIDO',
        description: 'Torta de fantasía con diseño de unicornio, crema de colores pastel y topper dorado.',
        specs: ['Diseño unicornio', 'Colores pastel', 'Topper dorado'],
        image: 'assets/images/torta_unicornio.jpeg'
    },
    {
        id: 'prod-torta-corazon',
        name: 'Torta Corazón de San Valentín',
        category: 'reposteria',
        price: 35000,
        badge: '✦ ROMÁNTICA',
        status: 'BAJO PEDIDO',
        description: 'Torta en forma de corazón con crema de fresa, ideal para ocasiones románticas.',
        specs: ['Forma corazón', 'Crema de fresa', 'Mensaje personalizado'],
        image: 'assets/images/torta_corazon.jpg'
    }
];

/* ============================================================
   5. DulceAuth — Sistema de Autenticación
   ============================================================ */
window.DulceAuth = (() => {
    const VALID_USERS = [
        { email: 'felipegamez348@gmail.com', password: 'PASTEL 2060', name: 'Felipe Gámez', role: 'admin' }
    ];

    function login(email, password, remember = false) {
        const user = VALID_USERS.find(u => u.email === email && u.password === password);
        if (!user) return { success: false, message: 'Correo o contraseña incorrectos.' };

        const session = { email: user.email, name: user.name, role: user.role, loggedIn: true, ts: Date.now() };
        try {
            sessionStorage.setItem(LS_KEYS.session, JSON.stringify(session));
            if (remember) localStorage.setItem(LS_KEYS.sessionPersist, JSON.stringify(session));
        } catch (e) { }
        return { success: true, user };
    }

    function logout() {
        try {
            sessionStorage.removeItem(LS_KEYS.session);
            localStorage.removeItem(LS_KEYS.sessionPersist);
        } catch (e) { }
    }

    function isAuthenticated() {
        try {
            const ss = JSON.parse(sessionStorage.getItem(LS_KEYS.session));
            if (ss && ss.loggedIn) return true;
            const ls = JSON.parse(localStorage.getItem(LS_KEYS.sessionPersist));
            if (ls && ls.loggedIn) {
                sessionStorage.setItem(LS_KEYS.session, JSON.stringify(ls));
                return true;
            }
        } catch (e) { }
        return false;
    }

    function getUser() {
        try {
            return JSON.parse(sessionStorage.getItem(LS_KEYS.session)) || JSON.parse(localStorage.getItem(LS_KEYS.sessionPersist)) || null;
        } catch { return null; }
    }

    return { login, logout, isAuthenticated, getUser };
})();

/* ============================================================
   6. DulceProducts — CRUD de Productos
   ============================================================ */
window.DulceProducts = (() => {
    let _productsCache = null;

    function _load() {
        if (_productsCache) return _productsCache;
        const raw = localStorage.getItem(LS_KEYS.products);
        if (raw !== null) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    _productsCache = parsed;
                    return _productsCache;
                }
            } catch (e) { }
        }
        _productsCache = [...DEFAULT_PRODUCTS];
        _save(_productsCache);
        return _productsCache;
    }

    function _save(products) {
        _productsCache = products;
        lsSet(LS_KEYS.products, products);
        idbPutAll(STORES.products, products);
        window.dispatchEvent(new Event('dulce:products-updated'));
    }

    function getAll() { return _load(); }

    function getById(id) {
        const strId = String(id);
        return _load().find(p => String(p.id) === strId) || null;
    }

    async function save(productData) {
        try {
            const products = _load();
            if (productData.id) {
                const strId = String(productData.id);
                const idx = products.findIndex(p => String(p.id) === strId);
                if (idx >= 0) {
                    products[idx] = { ...products[idx], ...productData };
                } else {
                    products.unshift(productData);
                }
            } else {
                productData.id = 'prod-' + Date.now();
                products.unshift(productData);
            }
            _save(products);
            return { success: true, product: productData };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    function deleteProduct(id) {
        const strId = String(id);
        const products = _load().filter(p => String(p.id) !== strId && p.id !== id);
        _save(products);
        idbDelete(STORES.products, id);
        return true;
    }

    function clearAll() {
        _productsCache = [];
        _save([]);
        idbClear(STORES.products);
        return true;
    }

    function resetDefaults() {
        _productsCache = [...DEFAULT_PRODUCTS];
        _save(_productsCache);
        return true;
    }

    function exportJSON() {
        const products = _load();
        const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `catalogo_dulce_artesanal_${today}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function importJSON(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            if (!Array.isArray(data)) return { success: false, message: 'Formato inválido.' };
            const valid = data.filter(p => p.name);
            valid.forEach(p => { if (!p.id) p.id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5); });
            _save(valid);
            return { success: true, count: valid.length };
        } catch (e) {
            return { success: false, message: 'Error al leer archivo JSON.' };
        }
    }

    function formatPrice(price) {
        return '$' + Number(price || 0).toLocaleString('es-CO');
    }

    return { getAll, getById, save, delete: deleteProduct, clearAll, resetDefaults, exportJSON, importJSON, formatPrice };
})();

/* ============================================================
   7. DulceDB — Motor de Base de Datos Avanzado
   ============================================================ */
window.DulceDB = (() => {

    // ─── REVIEWS (opiniones + atención al cliente) ───
    function getReviewsSync() {
        return lsGet(LS_KEYS.reviews, []);
    }

    function setReviewsSync(list) {
        lsSet(LS_KEYS.reviews, list);
        idbPutAll(STORES.reviews, list);
        window.dispatchEvent(new Event('dulce:reviews-updated'));
    }

    // ─── ORDERS (pedidos y ventas) ───
    function getOrdersSync() {
        return lsGet(LS_KEYS.orders, []);
    }

    function setOrdersSync(list) {
        lsSet(LS_KEYS.orders, list);
        idbPutAll(STORES.orders, list);
        window.dispatchEvent(new Event('dulce:orders-updated'));
    }

    // ─── VISITORS (rastreo de visitantes diarios) ───
    function getVisitors() {
        return lsGet(LS_KEYS.visitors, []);
    }

    function setVisitors(list) {
        lsSet(LS_KEYS.visitors, list);
        idbPutAll(STORES.visitors, list.map((v, i) => ({ ...v, id: v.date || ('v-' + i) })));
    }

    function recordVisit() {
        const today = new Date().toISOString().split('T')[0];
        const visitors = getVisitors();
        const existing = visitors.find(v => v.date === today);
        if (existing) {
            existing.count = (existing.count || 0) + 1;
        } else {
            visitors.push({ date: today, count: 1, id: today });
        }
        // Keep last 365 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 365);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const trimmed = visitors.filter(v => v.date >= cutoffStr);
        setVisitors(trimmed);
        return trimmed;
    }

    function getVisitorStats() {
        const visitors = getVisitors();
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = visitors.find(v => v.date === today);
        const totalAll = visitors.reduce((sum, v) => sum + (v.count || 0), 0);

        // Last 7 days
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const entry = visitors.find(v => v.date === dateStr);
            last7.push({
                date: dateStr,
                label: d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
                count: entry ? entry.count : 0
            });
        }

        // Last 30 days
        const last30 = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const entry = visitors.find(v => v.date === dateStr);
            last30.push({
                date: dateStr,
                label: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
                count: entry ? entry.count : 0
            });
        }

        return {
            today: todayEntry ? todayEntry.count : 0,
            total: totalAll,
            last7,
            last30,
            raw: visitors
        };
    }

    // ─── CHART DATA AGGREGATION ───
    function getOrdersChartData() {
        const orders = getOrdersSync();
        const daily = {};
        orders.forEach(o => {
            const date = (o.fecha || '').split(',')[0].trim();
            let isoDate = '';
            if (o.timestamp) {
                isoDate = new Date(o.timestamp).toISOString().split('T')[0];
            } else {
                isoDate = date || new Date().toISOString().split('T')[0];
            }
            daily[isoDate] = (daily[isoDate] || 0) + 1;
        });

        const last30 = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last30.push({
                date: dateStr,
                label: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
                count: daily[dateStr] || 0
            });
        }
        return { last30, total: orders.length };
    }

    function getReviewsChartData() {
        const reviews = getReviewsSync();
        const daily = {};
        reviews.forEach(r => {
            let isoDate = '';
            if (r.timestamp) {
                isoDate = new Date(r.timestamp).toISOString().split('T')[0];
            } else {
                isoDate = new Date().toISOString().split('T')[0];
            }
            daily[isoDate] = (daily[isoDate] || 0) + 1;
        });

        const last30 = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last30.push({
                date: dateStr,
                label: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
                count: daily[dateStr] || 0
            });
        }
        return { last30, total: reviews.length };
    }

    // ─── IMAGE COMPRESSION ───
    function compressImage(file, maxWidth = 600, quality = 0.6) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    if (w > maxWidth) {
                        h = Math.round(h * maxWidth / w);
                        w = maxWidth;
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/webp', quality));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ─── PERSISTENCE & STORAGE STATUS ───
    async function requestPersistence() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                return await navigator.storage.persist();
            }
        } catch { }
        return false;
    }

    async function getStorageStatus() {
        let isPersisted = false, usageMB = '0.00', quotaMB = '0.00';
        try {
            if (navigator.storage && navigator.storage.persisted) {
                isPersisted = await navigator.storage.persisted();
            }
            if (navigator.storage && navigator.storage.estimate) {
                const est = await navigator.storage.estimate();
                usageMB = ((est.usage || 0) / 1048576).toFixed(2);
                quotaMB = ((est.quota || 0) / 1048576).toFixed(0);
            }
        } catch { }
        return { isPersisted, usageMB, quotaMB };
    }

    // ─── SNAPSHOTS / BACKUP ───
    function createSnapshot(reason) {
        const snapshot = {
            id: 'snap-' + Date.now(),
            reason,
            timestamp: Date.now(),
            date: new Date().toLocaleString('es-CO')
        };
        const snaps = lsGet('dulce_snapshots', []);
        snaps.unshift(snapshot);
        if (snaps.length > 50) snaps.length = 50;
        lsSet('dulce_snapshots', snaps);
    }

    function _putAllInIDB(storeName, data) {
        idbPutAll(storeName, data);
    }

    // ─── MASTER BACKUP / RESTORE ───
    function exportMasterBackup() {
        const backup = {
            version: 2,
            exportDate: new Date().toISOString(),
            products: window.DulceProducts.getAll(),
            reviews: getReviewsSync(),
            pqrs: lsGet('dulce_pqrs', []),
            orders: getOrdersSync(),
            visitors: getVisitors()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `respaldo_maestro_dulce_artesanal_${today}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async function importMasterBackup(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            let productsCount = 0, reviewsCount = 0, pqrsCount = 0, ordersCount = 0;

            if (Array.isArray(data.products)) {
                const result = window.DulceProducts.importJSON(JSON.stringify(data.products));
                if (!result.success) throw new Error(result.message || 'No se pudieron restaurar los productos.');
                productsCount = result.count;
                await idbPutAll(STORES.products, window.DulceProducts.getAll());
            }
            if (Array.isArray(data.reviews)) {
                lsSet(LS_KEYS.reviews, data.reviews);
                await idbPutAll(STORES.reviews, data.reviews);
                reviewsCount = data.reviews.length;
            }
            if (Array.isArray(data.pqrs)) {
                lsSet('dulce_pqrs', data.pqrs);
                pqrsCount = data.pqrs.length;
            }
            if (Array.isArray(data.orders)) {
                lsSet(LS_KEYS.orders, data.orders);
                await idbPutAll(STORES.orders, data.orders);
                ordersCount = data.orders.length;
            }
            if (Array.isArray(data.visitors)) {
                setVisitors(data.visitors);
            }

            window.dispatchEvent(new Event('dulce:products-updated'));
            window.dispatchEvent(new Event('dulce:reviews-updated'));
            window.dispatchEvent(new Event('dulce:orders-updated'));

            return { success: true, products: productsCount, reviews: reviewsCount, pqrs: pqrsCount, orders: ordersCount };
        } catch (e) {
            return { success: false, message: 'Formato de archivo inválido: ' + e.message };
        }
    }

    async function saveToDiskFile() {
        try {
            if (!window.showSaveFilePicker) {
                exportMasterBackup();
                return { success: true };
            }
            const handle = await window.showSaveFilePicker({
                suggestedName: `respaldo_dulce_artesanal_${new Date().toISOString().split('T')[0]}.json`,
                types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
            });
            const writable = await handle.createWritable();
            const backup = {
                version: 2,
                exportDate: new Date().toISOString(),
                products: window.DulceProducts.getAll(),
                reviews: getReviewsSync(),
                pqrs: lsGet('dulce_pqrs', []),
                orders: getOrdersSync(),
                visitors: getVisitors()
            };
            await writable.write(JSON.stringify(backup, null, 2));
            await writable.close();
            return { success: true };
        } catch (e) {
            if (e.name !== 'AbortError') exportMasterBackup();
            return { success: true };
        }
    }

    function clearOrders() {
        setOrdersSync([]);
        idbClear(STORES.orders);
        return true;
    }

    function clearAllFeedback() {
        setReviewsSync([]);
        idbClear(STORES.reviews);
        return true;
    }

    return {
        getReviewsSync,
        setReviewsSync,
        getOrdersSync,
        setOrdersSync,
        getVisitors,
        setVisitors,
        recordVisit,
        getVisitorStats,
        getOrdersChartData,
        getReviewsChartData,
        compressImage,
        requestPersistence,
        getStorageStatus,
        createSnapshot,
        _putAllInIDB,
        idbClear,
        idbDelete,
        clearOrders,
        clearAllFeedback,
        exportMasterBackup,
        importMasterBackup,
        saveToDiskFile
    };
})();

/* ============================================================
   8. INICIALIZACIÓN — Sincronizar IDB y registrar visita
   ============================================================ */
(async function init() {
    await openDB();

    // Sync products from IDB
    const idbProducts = await idbGetAll(STORES.products);
    if (idbProducts && idbProducts.length > 0) {
        const lsProducts = lsGet(LS_KEYS.products, []);
        if (lsProducts.length === 0) {
            lsSet(LS_KEYS.products, idbProducts);
        }
    }

    // Sync reviews
    await syncFromIDB(STORES.reviews, LS_KEYS.reviews);
    // Sync orders
    await syncFromIDB(STORES.orders, LS_KEYS.orders);
    // Sync visitors
    await syncFromIDB(STORES.visitors, LS_KEYS.visitors);

    // Record this visit
    window.DulceDB.recordVisit();

    // Request persistence
    window.DulceDB.requestPersistence();

    // Signal ready
    window.dispatchEvent(new Event('dulce:db-ready'));
})();
