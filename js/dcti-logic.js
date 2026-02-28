/**
 * DCTI LOGIC - Institutional Information Management (RF001)
 * Role: Admin only for registration and modification.
 */

const DCTI_STORAGE_KEY = 'dcti_info';

/**
 * Get institutional data from localStorage or fallback to MOCK_DATA
 */
function getLocalDcti() {
    const saved = localStorage.getItem(DCTI_STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    // Fallback based on interface-logic.js MOCK_DATA structure
    return typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.dcti : {
        mission: "",
        vision: "",
        review: ""
    };
}

/**
 * Save institutional data to localStorage
 */
function saveLocalDcti(data) {
    if (!data.mission || !data.vision || !data.review) {
        if (typeof AlertService !== 'undefined') {
            AlertService.notify('Todos los campos institucionales son obligatorios.', 'error');
        }
        return false;
    }

    localStorage.setItem(DCTI_STORAGE_KEY, JSON.stringify(data));

    // Synchronize global MOCK_DATA if available
    if (typeof MOCK_DATA !== 'undefined') {
        MOCK_DATA.dcti = data;
    }

    if (typeof AlertService !== 'undefined') {
        AlertService.notify('Información institucional actualizada correctamente.', 'success');
    }
    return true;
}

/**
 * Form handler for DCTI view
 */
function handleDctiSubmit(event) {
    event.preventDefault();

    const mission = document.getElementById('admin-dcti-mission').value.trim();
    const vision = document.getElementById('admin-dcti-vision').value.trim();
    const review = document.getElementById('admin-dcti-review').value.trim();

    const result = saveLocalDcti({ mission, vision, review });

    if (result && typeof renderModule === 'function') {
        renderModule('dcti');
    }
}
