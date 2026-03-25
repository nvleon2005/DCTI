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
            description: "Desarrollo de un sistema de gestión de aprendizaje para escuelas.",
            objectives: "- Facilitar clases online\n- Seguimiento de estudiantes\n- Recursos digitales",
            status: "En Desarrollo",
            progress: 65,
            multimedia: "assets/images/img5.jpg"
        },
        {
            id: 2,
            title: "AgroTech Monagas",
            description: "Implementación de sensores IoT para control de cultivos.",
            objectives: "- Optimizar riego\n- Control de plagas",
            status: "Implementado",
            progress: 100,
            multimedia: "assets/images/img10.jpg"
        },
        {
            id: 3,
            title: "Red de Conectividad Estadal",
            description: "Ampliación de la cobertura de internet en zonas rurales.",
            objectives: "- Conectar escuelas\n- Puntos Wi-Fi públicos",
            status: "En Revisión",
            progress: 20,
            multimedia: "assets/images/img7.jpg"
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
            existingProjects.forEach(p => {
                if (p.multimedia && p.multimedia.startsWith('img/')) {
                    p.multimedia = p.multimedia.replace('img/', 'assets/images/');
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem('dcti_projects', JSON.stringify(existingProjects));
                console.log("Rutas de imágenes de proyectos locales actualizadas en caché.");
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
    if (!localStorage.getItem('dcti_info')) {
        localStorage.setItem('dcti_info', JSON.stringify(MOCK_DATA.dcti));
        console.log("Mock DCTI Info injected");
    }
}

// Ejecutar automáticamente al cargar este script
initMockData();
