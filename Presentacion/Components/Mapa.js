let mapInstance = null;

window.initContactMap = function () {
    const mapContainer = document.getElementById('mi_map');
    if (!mapContainer) return;

    if (mapInstance !== null) {
        // En una SPA, el contenedor DOM mi_map es destruido y recreado.
        // Debemos desmontar la instancia anterior de Leaflet antes de re-inyectarla.
        mapInstance.remove();
        mapInstance = null;
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

    mapInstance = L.map('mi_map', {
        attributionControl: false // Ocultamos el copyright por estética
    }).setView([lat, lng], 17); // Nivel de acercamiento óptimo para ver lugares

    // Servidor de tiles de Google Maps: Tiene la base de datos más grande de "Puntos de Referencia" (POIs) y sin advertencias
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
    }).addTo(mapInstance);

    let marker = L.marker([lat, lng]).addTo(mapInstance);
    marker.bindTooltip("Dirección de Ciencia, Tecnología e Innovación").openTooltip();
};
