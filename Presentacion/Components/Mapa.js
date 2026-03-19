let mapInstance = null;

window.initContactMap = function () {
    if (mapInstance !== null) {
        mapInstance.invalidateSize();
        return; // El mapa ya fue inicializado
    }

    // Leer coordenadas guardadas en DCTI
    let lat = 9.7446818;
    let lng = -63.1722970;

    try {
        const savedString = localStorage.getItem('dcti_info');
        if (savedString) {
            const savedData = JSON.parse(savedString);
            if (savedData.lat && savedData.lng) {
                lat = parseFloat(savedData.lat);
                lng = parseFloat(savedData.lng);
            }
        }
    } catch (e) {
        console.error("Error reading map coordinates from localStorage", e);
    }

    mapInstance = L.map('mi_map').setView([lat, lng], 20);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    let marker = L.marker([lat, lng]).addTo(mapInstance);
    marker.bindTooltip("Dirección de Ciencia, Tecnología e Innovación").openTooltip();
};

