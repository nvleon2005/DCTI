let mapInstance = null;

window.initContactMap = function () {
    if (mapInstance !== null) {
        mapInstance.invalidateSize();
        return; // El mapa ya fue inicializado
    }

    mapInstance = L.map('mi_map').setView([9.7446818, -63.1722970], 20);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    let marker = L.marker([9.7446818, -63.1722970]).addTo(mapInstance);
    marker.bindTooltip("Lotería de oriente sede.").openTooltip();
};

