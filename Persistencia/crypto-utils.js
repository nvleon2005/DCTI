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
 * [SECURITY] Genera un JWT simulado (HS256 simplificado)
 */
async function generateJWT(payload) {
    const secret = "dcti_super_secret_key_2026"; // Simulación de variable de entorno (Backend)
    const header = { alg: 'HS256', typ: 'JWT' };
    
    const base64UrlEncode = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    
    // HMAC simplificado usando el hash que ya tenemos
    const signatureHex = await hashSHA256(data + secret);
    const encodedSignature = base64UrlEncode(signatureHex);
    
    return `${data}.${encodedSignature}`;
}
window.generateJWT = generateJWT;

/**
 * [SECURITY] Verifica un JWT simulado y retorna el payload si es válido
 */
async function verifyJWT(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const secret = "dcti_super_secret_key_2026";
    const data = `${parts[0]}.${parts[1]}`;
    const expectedSignatureHex = await hashSHA256(data + secret);
    
    const base64UrlEncode = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const expectedEncodedSignature = base64UrlEncode(expectedSignatureHex);
    
    if (parts[2] === expectedEncodedSignature) {
        try {
            // Decodificamos el payload
            const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            // Soporte para caracteres UTF-8 en base64
            const utf8PayloadStr = decodeURIComponent(escape(payloadStr));
            return JSON.parse(utf8PayloadStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}
window.verifyJWT = verifyJWT;

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
    return doc.body.innerHTML; // Getter is safe
};

/**
 * [SECURITY] DOMHelper: Inyector de DOM seguro que reemplaza innerHTML.
 */
window.DOMHelper = {
    /**
     * Modo ESTRICTO: Elimina on*, style, script, iframe, etc.
     * Usar para contenido que incluye datos directos de usuario sin sanitizar.
     */
    setSafeHTML: function(element, htmlString) {
        if (!element) return;
        element.replaceChildren();
        if (htmlString === undefined || htmlString === null || htmlString === '') return;
        const str = String(htmlString);
        
        const tagName = element.tagName.toLowerCase();
        let wrapStart = '', wrapEnd = '';
        if (tagName === 'tbody' || tagName === 'thead' || tagName === 'tfoot') {
            wrapStart = '<table><tbody>'; wrapEnd = '</tbody></table>';
        } else if (tagName === 'tr') {
            wrapStart = '<table><tbody><tr>'; wrapEnd = '</tr></tbody></table>';
        }
        
        const doc = new DOMParser().parseFromString(wrapStart + str + wrapEnd, 'text/html');
        
        const unsafeTags = doc.querySelectorAll('script, style, iframe, object, embed, link, base');
        unsafeTags.forEach(s => s.remove());
        
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
        
        let sourceNode = doc.body;
        if (tagName === 'tbody' || tagName === 'thead' || tagName === 'tfoot') {
            sourceNode = doc.body.querySelector('tbody') || doc.body;
        } else if (tagName === 'tr') {
            sourceNode = doc.body.querySelector('tr') || doc.body;
        }

        const fragment = document.createDocumentFragment();
        while (sourceNode.firstChild) {
            fragment.appendChild(sourceNode.firstChild);
        }
        element.appendChild(fragment);
    },

    /**
     * Modo CONFIABLE: Para HTML generado internamente por el código del desarrollador.
     * Preserva onclick, onchange, onerror, <style>, etc.
     */
    setTrustedHTML: function(element, htmlString) {
        if (!element) return;
        element.replaceChildren();
        if (htmlString === undefined || htmlString === null || htmlString === '') return;
        const str = String(htmlString);

        const tagName = element.tagName.toLowerCase();
        let wrapStart = '', wrapEnd = '';
        if (tagName === 'tbody' || tagName === 'thead' || tagName === 'tfoot') {
            wrapStart = '<table><tbody>'; wrapEnd = '</tbody></table>';
        } else if (tagName === 'tr') {
            wrapStart = '<table><tbody><tr>'; wrapEnd = '</tr></tbody></table>';
        }

        const doc = new DOMParser().parseFromString(wrapStart + str + wrapEnd, 'text/html');
        doc.querySelectorAll('script').forEach(s => s.remove());
        doc.querySelectorAll('*').forEach(el => {
            ['href', 'src', 'action', 'formaction'].forEach(attrName => {
                const val = (el.getAttribute(attrName) || '').toLowerCase().trim();
                if (val.startsWith('javascript:') || val.startsWith('data:text/html')) {
                    el.removeAttribute(attrName);
                }
            });
        });

        let sourceNode = doc.body;
        if (tagName === 'tbody' || tagName === 'thead' || tagName === 'tfoot') {
            sourceNode = doc.body.querySelector('tbody') || doc.body;
        } else if (tagName === 'tr') {
            sourceNode = doc.body.querySelector('tr') || doc.body;
        }

        const fragment = document.createDocumentFragment();
        while (sourceNode.firstChild) fragment.appendChild(sourceNode.firstChild);
        element.appendChild(fragment);
    }
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
