/**
 * app-loader.js
 * Carga dinámica de todos los módulos del sistema DCTI.
 * Esto mantiene el index.html limpio y facilita el mantenimiento de las dependencias.
 */

(function () {
    const scripts = [
        // --- Persistencia ---
        "Persistencia/mock-data.js",
        "Persistencia/crypto-utils.js",

        // --- Componentes UI/UX ---
        "Presentacion/Components/Notification.js",
        "Presentacion/Components/Carousel.js",
        "Presentacion/Components/Mapa.js",
        "Presentacion/Components/AdminShell.js",

        // --- Servicios ---
        "Service/UsersService.js",
        "Service/ConsultasService.js",
        "Service/NewsService.js",
        "Service/DctiService.js",
        "Service/StrategicService.js",
        "Service/ProjectsService.js",
        "Service/CoursesService.js",
        "Service/ReportsService.js",
        "Service/AuthService.js",
        // --- Páginas Administrativas (Dashboard) ---
        "Presentacion/Pages/Dashboard/Dashboard.page.js",
        "Presentacion/Pages/Users/Users.page.js",
        "Presentacion/Pages/Consultas/Consultas.page.js",
        "Presentacion/Pages/News/News.page.js",
        "Presentacion/Pages/Projects/Projects.page.js",
        "Presentacion/Pages/Courses/Courses.page.js",
        "Presentacion/Pages/Strategic/Strategic.page.js",
        "Presentacion/Pages/Reports/Reports.page.js",
        "Presentacion/Pages/Dcti/Dcti.page.js",
        "Presentacion/Pages/Profile/Profile.page.js",
        "Presentacion/Pages/MyCourses/MyCourses.page.js",

        // --- Lógica de Aplicación & Controladores ---
        "Presentacion/Application/ViewRenderer.js",
        "Presentacion/Application/Router.js",
        "Presentacion/Application/App.js",
        "Presentacion/Application/Portal.controller.js",
        "Presentacion/Application/PublicNavigation.js",

        // --- Controladores Específicos ---
        "Presentacion/Controllers/Dashboard/Dashboard.controller.js",
        "Presentacion/Controllers/Users/Users.controller.js",
        "Presentacion/Controllers/News/News.controller.js",
        "Presentacion/Controllers/Courses/Courses.controller.js",

        "Presentacion/main.js"

    ];

    function loadNext() {
        if (scripts.length === 0) {
            console.log("DCTI: Todos los módulos cargados dinámicamente.");
            document.dispatchEvent(new CustomEvent('DCTIScriptsLoaded'));
            // Poblar links de redes sociales del footer tan pronto estén disponibles
            if (typeof window.applyDctiContactLinks === 'function') {
                window.applyDctiContactLinks();
            }
            return;
        }

        const src = scripts.shift();
        const script = document.createElement('script');
        script.src = src + '?v=' + new Date().getTime();
        script.async = false; // Importante para mantener el orden de ejecución global
        script.onload = loadNext;
        script.onerror = () => console.error(`Error cargando: ${src}`);
        document.body.appendChild(script);
    }

    // Iniciamos la carga secuencial
    loadNext();
})();
