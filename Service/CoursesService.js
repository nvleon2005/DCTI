/**
 * Service/CoursesService.js
 * Responsabilidad: Gestión de Cursos e Inscripciones.
 */

const CoursesController = {
    globalFilter: 'Publicado',
    imageQueue: [],
    materialsQueue: [],

    getLocalCourses() {
        const courses = localStorage.getItem('dcti_courses');
        return courses ? JSON.parse(courses) : [];
    },

    saveLocalCourses(coursesArray) {
        localStorage.setItem('dcti_courses', JSON.stringify(coursesArray));
        if (typeof renderModule === 'function') {
            this.filterCoursesAdmin(this.globalFilter, false);
        }
    },

    getLocalParticipations() {
        const p = localStorage.getItem('dcti_participations');
        return p ? JSON.parse(p) : [];
    },

    openCourseModal(id = null) {
        this.imageQueue = [];
        this.materialsQueue = [];

        const modal = document.getElementById('course-modal');
        const form = document.getElementById('course-admin-form');
        if (!modal || !form) return;

        form.reset();
        document.getElementById('edit-course-id').value = id || '';
        document.getElementById('admin-course-gallery').innerHTML = '';

        if (id) {
            document.getElementById('course-modal-title').textContent = "Gestionar Curso";
            const courses = this.getLocalCourses();
            const course = courses.find(c => c.id == id);

            if (course) {
                document.getElementById('admin-course-name').value = course.nombreCurso;
                document.getElementById('admin-course-description').value = course.descripcion;
                document.getElementById('admin-course-start').value = course.fechaInicio;
                document.getElementById('admin-course-end').value = course.fechaFin;
                document.getElementById('admin-course-quota').value = course.cupoMaximo;
                document.getElementById('admin-course-status').value = course.estadoCurso;

                if (course.images) {
                    this.imageQueue = [...course.images];
                    this.renderCourseGallery();
                }
                if (course.materiales) {
                    this.materialsQueue = [...course.materiales];
                }
                this.renderCourseMaterialsGallery();
            }
        } else {
            document.getElementById('course-modal-title').textContent = "Nuevo Curso";
            document.getElementById('admin-course-status').value = "Borrador";
            this.renderCourseMaterialsGallery();
        }

        modal.classList.remove('hidden');
    },

    closeCourseModal() {
        const modal = document.getElementById('course-modal');
        if (modal) modal.classList.add('hidden');
    },

    async handleCourseSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('edit-course-id').value;
        const nombreCurso = document.getElementById('admin-course-name').value.trim();
        const descripcion = document.getElementById('admin-course-description').value.trim();
        const fechaInicio = document.getElementById('admin-course-start').value;
        const fechaFin = document.getElementById('admin-course-end').value;
        const cupoMaximo = parseInt(document.getElementById('admin-course-quota').value, 10);
        const estadoCurso = document.getElementById('admin-course-status').value;

        if (!nombreCurso || !descripcion || !fechaInicio || !fechaFin || isNaN(cupoMaximo)) {
            AlertService.notify('Error', 'Complete todos los campos.', 'error');
            return;
        }

        let allCourses = this.getLocalCourses();

        if (id) {
            const index = allCourses.findIndex(c => c.id == id);
            if (index !== -1) {
                allCourses[index] = {
                    ...allCourses[index],
                    nombreCurso, descripcion, fechaInicio, fechaFin, cupoMaximo, estadoCurso,
                    images: this.imageQueue,
                    materiales: this.materialsQueue
                };
                AlertService.notify('Actualizado', 'Curso guardado.', 'success');
            }
        } else {
            allCourses.push({
                id: Date.now(),
                nombreCurso, descripcion, fechaInicio, fechaFin, cupoMaximo, estadoCurso,
                images: this.imageQueue,
                materiales: this.materialsQueue
            });
            AlertService.notify('Creado', 'Curso publicado.', 'success');
        }

        this.saveLocalCourses(allCourses);
        this.closeCourseModal();
    },

    renderCourseGallery() {
        const container = document.getElementById('admin-course-gallery');
        if (!container) return;
        container.innerHTML = this.imageQueue.map((src, i) => `
            <div style="position:relative;">
                <img src="${src}" style="width:100px;height:100px;object-fit:cover;border-radius:4px;">
                <button type="button" onclick="removeCourseImage(${i})" style="position:absolute;top:0;right:0;background:red;color:white;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;">&times;</button>
            </div>
        `).join('');
    },

    renderCourseMaterialsGallery() {
        const container = document.getElementById('materials-grid-container');
        if (!container) return;
        container.innerHTML = this.materialsQueue.map((mat, i) => `
            <div style="border:1px solid #ddd;padding:10px;border-radius:4px;text-align:center;">
                <i class="fas ${mat.iconClass || 'fa-file'}" style="font-size:2rem;color:${mat.iconColor || '#666'}"></i>
                <p style="font-size:0.8rem;margin:5px 0;">${mat.name}</p>
                <button type="button" onclick="removeCourseMaterial(${i})" style="color:red;border:none;background:none;cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        `).join('') + `
            <div style="border:2px dashed #ccc;padding:20px;text-align:center;cursor:pointer;" onclick="document.getElementById('admin-course-materials-file').click()">
                <i class="fas fa-plus"></i><br>Subir Material
                <input type="file" id="admin-course-materials-file" style="display:none;" multiple onchange="handleCourseMaterialUpload(event)">
            </div>
        `;
    },

    filterCoursesAdmin(category, resetPage = true) {
        this.globalFilter = category;
        if (typeof renderModule === 'function') renderModule('courses');
    }
};

// Global exports
window.openCourseModal = CoursesController.openCourseModal.bind(CoursesController);
window.closeCourseModal = CoursesController.closeCourseModal.bind(CoursesController);
window.handleCourseSubmit = CoursesController.handleCourseSubmit.bind(CoursesController);
window.filterCoursesAdmin = CoursesController.filterCoursesAdmin.bind(CoursesController);
window.getLocalCourses = CoursesController.getLocalCourses.bind(CoursesController);
window.getLocalParticipations = CoursesController.getLocalParticipations.bind(CoursesController);
window.removeCourseImage = (i) => { CoursesController.imageQueue.splice(i, 1); CoursesController.renderCourseGallery(); };
window.removeCourseMaterial = (i) => { CoursesController.materialsQueue.splice(i, 1); CoursesController.renderCourseMaterialsGallery(); };
