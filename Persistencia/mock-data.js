const MOCK_DATA = {
    dcti: {
        address: "Av. Alirio Ugarte Pelayo, Sector PDVSA Edif. ESEM, Planta Baja. Maturín, Monagas.",
        phone: "+58 412-1234567",
        email: "contacto@dctimonagas.gob.ve",
        facebook: "DCTI_Monagas",
        instagram: "@dcti_monagas",
        twitter: "@dcti_monagas",
        mission: "Impulsar el desarrollo científico y tecnológico a través de la innovación y la transferencia de conocimiento.",
        vision: "Ser el referente regional en gestión de proyectos de ciencia y tecnología para el año 2030.",
        review: "El DCTI nació como una respuesta a la necesidad de centralizar los esfuerzos de investigación en el país."
    },
    stats: {
        users: 154,
        projects: 42,
        news: 89,
        courses: 12,
        strategic: 2
    },
    news: [
        {
            id: 1,
            headline: "Avances en la Misión Ciencia en Monagas",
            category: "Institucionales",
            summary: "Jóvenes monaguenses participan en la nueva etapa de Misión Ciencia.",
            content: "En un encuentro con la gobernación, se establecieron las nuevas directrices para fomentar la ciencia en la juventud.",
            published: new Date(Date.now() - 86400000).toISOString(),
            status: "Publicado",
            author: "Prensa DCTI",
            multimedia: "assets/images/img8.jpg"
        },
        {
            id: 2,
            headline: "Inauguración de Laboratorios de Robótica",
            category: "Regional",
            summary: "Nuevas instalaciones para escuelas primarias.",
            content: "Se han distribuido más de 50 kits de robótica educativa en el estado.",
            published: new Date(Date.now() - 172800000).toISOString(),
            status: "Publicado",
            author: "Prensa DCTI",
            multimedia: "assets/images/img3.jpg"
        },
        {
            id: 3,
            headline: "Concurso Regional de Innovación",
            category: "Nacional",
            summary: "Abiertas las inscripciones para el premio anual a la innovación tecnológica.",
            content: "Participa y demuestra cómo la tecnología puede resolver problemas locales.",
            published: new Date().toISOString(),
            status: "Publicado",
            author: "Dirección Académica",
            multimedia: "assets/images/img4.jpg"
        },
        {
            id: 4,
            headline: "Nuevo programa de formación tecnológica en Maturín",
            category: "Local",
            summary: "La alcaldía inicia cursos gratuitos de programación básica.",
            content: "A partir del próximo lunes, jóvenes y adultos podrán inscribirse en el nuevo ciclo de formación.",
            published: new Date(Date.now() - 259200000).toISOString(),
            status: "Publicado",
            author: "Equipo Local",
            multimedia: "assets/images/img5.jpg"
        },
        {
            id: 5,
            headline: "Acuerdo de cooperación tecnológica transfronteriza",
            category: "Internacional",
            summary: "Firma de convenio internacional para investigación compartida.",
            content: "El acuerdo permitirá el intercambio de investigadores y recursos entre naciones aliadas.",
            published: new Date(Date.now() - 345600000).toISOString(),
            status: "Publicado",
            author: "Relaciones Internacionales",
            multimedia: "assets/images/img9.jpg"
        }
    ],
    projects: [
        {
            id: 1,
            title: "Plataforma Educativa Monagas Digital",
            description: "Desarrollo de un sistema de gestión de aprendizaje para escuelas del estado Monagas, integrando recursos multimedia y seguimiento académico en línea.",
            objectives: "- Facilitar clases en línea para todos los niveles\n- Seguimiento individualizado del desempeño estudiantil\n- Proveer una biblioteca de recursos digitales gratuitos",
            status: "Destacado",
            advances: "Se completó la plataforma base y fue lanzada exitosamente en 15 escuelas piloto con más de 2.000 estudiantes activos.",
            image: "assets/images/img5.jpg"
        },
        {
            id: 2,
            title: "AgroTech Monagas",
            description: "Implementación de sensores IoT para monitoreo y control de cultivos en el estado Monagas, apoyando a pequenos y medianos productores agrícolas.",
            objectives: "- Optimizar el uso del riego mediante sensores de humedad\n- Control temprano de plagas con alertas automáticas\n- Aumentar el rendimiento de cultivos en un 30%",
            status: "En Progreso",
            advances: "Fase de instalación de sensores en 5 fincas piloto completada. Se está procesando la integración con la plataforma de monitoreo central.",
            image: "assets/images/img10.jpg"
        },
        {
            id: 3,
            title: "Red de Conectividad Estadal",
            description: "Proyecto de ampliación de la cobertura de internet de alta velocidad en zonas rurales y comunidades aisladas del estado Monagas.",
            objectives: "- Conectar al menos 50 escuelas rurales a internet\n- Instalar 20 puntos de acceso Wi-Fi público gratuito\n- Capacitar a comunidades en el uso de la tecnología",
            status: "A Futuro",
            advances: "",
            image: "assets/images/img7.jpg"
        }
    ],
    strategic: [
        {
            id: 1,
            title: "Soberanía Tecnológica",
            description: "Promovemos el desarrollo de software libre en la gestión pública.",
            goals: "- Migración a tecnologías abiertas\n- Formación comunitaria\n- Independencia tecnológica",
            multimedia: "assets/images/img4.jpg"
        },
        {
            id: 2,
            title: "Ciencia para la Vida",
            description: "Aplicación de conocimientos científicos en la salud y protección ambiental.",
            goals: "- Proyectos ecosustentables\n- Innovación médica regional",
            multimedia: "assets/images/img15.jpg"
        }
    ]
};

// Función para inicializar datos si están vacíos
function initMockData() {
    // Migración de datos antiguos: si el usuario tiene datos viejos con categorías que no existen en el nuevo diseño
    let existingNewsRaw = localStorage.getItem('dcti_news');
    if (existingNewsRaw) {
        try {
            let existingNews = JSON.parse(existingNewsRaw);
            let modified = false;
            existingNews.forEach(n => {
                if (n.category === 'Ciencia') { n.category = 'Institucionales'; modified = true; }
                if (n.category === 'Educación') { n.category = 'Regional'; modified = true; }
                if (n.category === 'Innovación') { n.category = 'Nacional'; modified = true; }
                if (n.multimedia && n.multimedia.startsWith('img/')) {
                    n.multimedia = n.multimedia.replace('img/', 'assets/images/');
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem('dcti_news', JSON.stringify(existingNews));
                console.log("Noticias antiguas migradas a nuevas categorías y rutas de imágenes actualizadas.");
            }
        } catch (e) { }
    }

    // Migración de rutas de imágenes para cursos (si existen datos cacheados)
    let existingCoursesRaw = localStorage.getItem('dcti_courses');
    if (existingCoursesRaw) {
        try {
            let existingCourses = JSON.parse(existingCoursesRaw);
            let modified = false;
            existingCourses.forEach(c => {
                if (c.images && Array.isArray(c.images)) {
                    c.images = c.images.map(img => {
                        if (img.startsWith('img/')) {
                            modified = true;
                            return img.replace('img/', 'assets/images/');
                        }
                        return img;
                    });
                }
            });
            if (modified) {
                localStorage.setItem('dcti_courses', JSON.stringify(existingCourses));
                console.log("Rutas de imágenes de cursos locales actualizadas en caché.");
            }
        } catch (e) { }
    }

    // Migración de rutas de imágenes para proyectos (si existen datos cacheados)
    let existingProjectsRaw = localStorage.getItem('dcti_projects');
    if (existingProjectsRaw) {
        try {
            let existingProjects = JSON.parse(existingProjectsRaw);
            let modified = false;
            const legacyStatusMap = {
                'En Proceso': 'En Progreso', 'En Desarrollo': 'En Progreso',
                'En Revisión': 'En Progreso', 'Borrador': 'A Futuro',
                'Validado': 'Destacado', 'Finalizado': 'Destacado', 'Implementado': 'Destacado'
            };
            existingProjects.forEach(p => {
                if (legacyStatusMap[p.status]) {
                    p.status = legacyStatusMap[p.status];
                    modified = true;
                }
                if (typeof p.progress !== 'undefined') {
                    delete p.progress;
                    modified = true;
                }
                if (typeof p.featured !== 'undefined') {
                    delete p.featured;
                    modified = true;
                }
                if (p.multimedia && p.multimedia.startsWith('img/')) {
                    p.multimedia = p.multimedia.replace('img/', 'assets/images/');
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem('dcti_projects', JSON.stringify(existingProjects));
                console.log("Proyectos migrados al nuevo esquema de estados.");
            }
        } catch (e) { }
    }

    // Migración de rutas de imágenes para ejes estratégicos (si existen datos cacheados)
    let existingStrategicRaw = localStorage.getItem('dcti_strategic');
    if (existingStrategicRaw) {
        try {
            let existingStrategic = JSON.parse(existingStrategicRaw);
            let modified = false;
            existingStrategic.forEach(s => {
                if (s.multimedia && s.multimedia.startsWith('img/')) {
                    s.multimedia = s.multimedia.replace('img/', 'assets/images/');
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem('dcti_strategic', JSON.stringify(existingStrategic));
                console.log("Rutas de imágenes de áreas estratégicas locales actualizadas en caché.");
            }
        } catch (e) { }
    }

    if (!localStorage.getItem('dcti_news') || JSON.parse(localStorage.getItem('dcti_news')).length === 0) {
        localStorage.setItem('dcti_news', JSON.stringify(MOCK_DATA.news));
        console.log("Mock News injected");
    }
    if (!localStorage.getItem('dcti_projects') || JSON.parse(localStorage.getItem('dcti_projects')).length === 0) {
        localStorage.setItem('dcti_projects', JSON.stringify(MOCK_DATA.projects));
        console.log("Mock Projects injected");
    }
    if (!localStorage.getItem('dcti_strategic') || JSON.parse(localStorage.getItem('dcti_strategic')).length === 0) {
        localStorage.setItem('dcti_strategic', JSON.stringify(MOCK_DATA.strategic));
        console.log("Mock Strategic Areas injected");
    }

    // --- MIGRACIÓN: SISTEMA DE AUDITORÍA ---
    const collections = ['dcti_news', 'dcti_projects', 'dcti_courses', 'dcti_strategic', 'dcti_users'];
    collections.forEach(key => {
        let raw = localStorage.getItem(key);
        if (raw) {
            try {
                let items = JSON.parse(raw);
                let modified = false;
                items.forEach(item => {
                    if (!item.createdAt) {
                        item.createdAt = item.published || new Date().toISOString();
                        item.createdBy = "Ing.David Acosta";
                        item.updatedAt = item.createdAt;
                        item.updatedBy = "Ing.David Acosta";
                        item.history = [{
                            date: new Date().toLocaleString('es-VE'),
                            responsible: "Ing.David Acosta",
                            action: "Migración Inicial",
                            fields: "Todos"
                        }];
                        modified = true;
                    }
                });
                if (modified) {
                    localStorage.setItem(key, JSON.stringify(items));
                    console.log(`Auditoría migrada en ${key}.`);
                }
            } catch (e) {
                console.error(`Error migrando auditoría en ${key}:`, e);
            }
        }
    });

    if (!localStorage.getItem('dcti_info')) {
        localStorage.setItem('dcti_info', JSON.stringify(MOCK_DATA.dcti));
        console.log("Mock DCTI Info injected");
    }
}

// Ejecutar automáticamente al cargar este script
initMockData();
