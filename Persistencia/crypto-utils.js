/**
 * ADMIN DASHBOARD - CRYPTO UTILS
 * Standalone utilities for security compliance.
 */

/**
 * Genera un hash SHA-256 de un string (Asíncrono usando Web Crypto API)
 * Utilizado para cumplimiento de HU-001 y Ley Especial contra Delitos Informáticos.
 */
async function hashSHA256(message) {
    if (window.crypto && window.crypto.subtle) {
        try {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            console.warn("Crypto API failed, falling back to basic hash", e);
        }
    }

    // Fallback básico para entornos no seguros como protocol file:///
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'fb_' + Math.abs(hash).toString(16);
}

/**
 * [SECURITY] Vanilla JS XSS Sanitizer (Anti-Scripting)
 * Crea un árbol DOM inerte usando DOMParser para purgar scripts y listeners peligrosos.
 */
window.sanitizeHTML = function (str) {
    if (!str || typeof str !== 'string') return str;
    const doc = new DOMParser().parseFromString(str, 'text/html');
    // Eliminar etiquetas explícitamente inseguras
    const unsafeTags = doc.querySelectorAll('script, style, iframe, object, embed, link, base');
    unsafeTags.forEach(s => s.remove());
    
    // Recorrer todos los nodos para eliminar atributos on* y javascript: URI
    const all = doc.querySelectorAll('*');
    all.forEach(el => {
        for (let i = el.attributes.length - 1; i >= 0; i--) {
            const attr = el.attributes[i];
            const name = attr.name.toLowerCase();
            const val = attr.value.toLowerCase();
            if (name.startsWith('on') || val.includes('javascript:') || val.includes('data:text/html')) {
                el.removeAttribute(attr.name);
            }
        }
    });
    return doc.body.innerHTML;
};

/**
 * [SECURITY] Anti-Spam Frontend (Mitigación Capa 7 DDoS / Limitador de Fuerza Bruta)
 * Previene el envío masivo de llamadas envolviendo las acciones sensibles.
 */
window.rateLimitAction = (fn, delayMs = 3000) => {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delayMs) {
            console.warn(`[Seguridad] Acción bloqueada (Rate Limit). Espere ${Math.ceil((delayMs - (now - lastCall))/1000)}s.`);
            if (typeof AlertService !== 'undefined') {
                AlertService.error(`Por seguridad, espere unos segundos antes de intentarlo de nuevo.`, 'Protección Anti-Spam');
            }
            return;
        }
        lastCall = now;
        return fn.apply(this, args);
    };
};
