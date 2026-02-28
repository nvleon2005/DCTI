const CoursesView = {
    render: (data) => {
        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                    <h2>Oferta Académica</h2>
                    <button class="btn-action"><i class="fas fa-plus"></i> Crear Curso</button>
                </div>
                <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--color-surface-muted); border-bottom: 2px solid var(--color-border);">
                            <tr>
                                <th style="padding: 15px; text-align: left; font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted);">Curso</th>
                                <th style="padding: 15px; text-align: left; font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted);">Modalidad</th>
                                <th style="padding: 15px; text-align: left; font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted);">Inscritos</th>
                                <th style="padding: 15px; text-align: center; font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted);">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.courses.map(c => `
                                <tr style="border-bottom: 1px solid var(--color-border);">
                                    <td style="padding: 15px; font-weight: 600;">${c.title}</td>
                                    <td style="padding: 15px;"><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${c.type}</span></td>
                                    <td style="padding: 15px;">${c.enrollment}</td>
                                    <td style="padding: 15px; text-align: center;">
                                        <button style="background: none; border: none; color: var(--color-primary); cursor: pointer;"><i class="fas fa-edit"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
};
