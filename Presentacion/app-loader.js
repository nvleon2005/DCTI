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
        "Presentacion/Components/AdminCardTemplate.js",

        // --- Servicios ---
        "Service/AuditService.js",
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
        "Presentacion/Pages/Auditoria/Auditoria.page.js",
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
        "Presentacion/Controllers/Courses/Certifier.js",

        "Presentacion/main.js"

    ];

    let loadedCount = 0;
    const totalScripts = scripts.length;

    function onScriptLoaded() {
        loadedCount++;
        if (loadedCount === totalScripts) {
            console.log("DCTI: Todos los módulos cargados dinámicamente en paralelo.");
            document.dispatchEvent(new CustomEvent('DCTIScriptsLoaded'));
            // Poblar links de redes sociales del footer tan pronto estén disponibles
            if (typeof window.applyDctiContactLinks === 'function') {
                window.applyDctiContactLinks();
            }
        }
    }

    // Iniciamos la carga en paralelo de todos los scripts a la vez
    // El navegador los descargará simultáneamente pero los ejecutará estrictamente
    // en el orden en el que se anexan al DOM porque async = false.
    const appVersion = '1.0.0'; // Cambiar esto cuando haya una nueva versión a producción
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src + '?v=' + appVersion;
        script.async = false; // Importante para mantener el orden de ejecución global
        script.onload = onScriptLoaded;
        script.onerror = () => {
            console.error(`Error cargando: ${src}`);
            // A pesar del error, sumamos para no bloquear eternamente el loader
            onScriptLoaded(); 
        };
        document.body.appendChild(script);
    });
})();
