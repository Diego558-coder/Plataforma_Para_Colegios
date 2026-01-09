 
const API_BASE = 'http://localhost:4000/api';

async function apiFetch(path, options = {}) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const headers = options.headers || {};
    if (currentUser.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
    }
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return null;
}

const adminState = {
    registrations: [],
    stats: null,
    schools: [],
    users: [],
    assignments: []
};

async function syncDataFromApi() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.token) {
        console.error('No hay token de autenticación');
        return;
    }
    console.log('Sincronizando datos del API...');
    try {
        const [registrations, stats, schools, users, assignments] = await Promise.all([
            apiFetch('/admin/registrations').catch(e => { console.error('Error en /admin/registrations:', e); return []; }),
            apiFetch('/admin/stats').catch(e => { console.warn('Error en /admin/stats:', e); return null; }),
            apiFetch('/schools').catch(e => { console.warn('Error en /schools:', e); return []; }),
            apiFetch('/users').catch(e => { console.warn('Error en /users:', e); return []; }),
            apiFetch('/assignments').catch(e => { console.warn('Error en /assignments:', e); return []; })
        ]);

        adminState.registrations = registrations || [];
        adminState.stats = stats || null;
        adminState.schools = schools || [];
        adminState.users = users || [];
        adminState.assignments = assignments || [];
        
        console.log(`✓ Cargados ${adminState.registrations.length} registros`);
    } catch (err) {
        console.error('Error general sincronizando con API:', err);
    }
}

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email || !currentUser.role || currentUser.role.toLowerCase() !== 'admin') {
        alert('Debes iniciar sesión como administrador');
        window.location.href = '../../index.html';
        return false;
    }
    document.getElementById('adminName').textContent = currentUser.name || 'Administrador';
    return true;
}

 
function showSection(section, event) {
    console.log('Showing section:', section);
    
    
    if (event) {
        event.preventDefault();
        console.log('Event prevented');
    }
    
    
    document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
    
    
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    
    
    const sectionMap = {
        'dashboard': 'dashboardSection',
        'registrations': 'registrationsSection',
        'students': 'studentsSection',
        'assignments': 'assignmentsSection',
        'teachers': 'teachersSection',
        'schools': 'schoolsSection',
        'payments': 'paymentsSection'
    };
    
    const sectionId = sectionMap[section];
    if (sectionId) {
        const sectionEl = document.getElementById(sectionId);
        if (sectionEl) {
            sectionEl.classList.remove('hidden');
            console.log('Section element found and shown:', sectionId);
        } else {
            console.error('Section element not found:', sectionId);
        }
    }
    
    
    if (event && event.target) {
        const link = event.target.closest('.sidebar-link');
        if (link) {
            link.classList.add('active');
            console.log('Active link set');
        }
    }
    
    
    const titles = {
        'dashboard': 'Dashboard',
        'registrations': 'Solicitudes de Registro',
        'students': 'Estudiantes',
        'assignments': 'Asignaciones',
        'teachers': 'Docentes',
        'schools': 'Colegios',
        'payments': 'Pagos'
    };
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) {
        titleEl.textContent = titles[section] || 'Dashboard';
    }
    
    
    loadSectionData(section).catch(err => console.error('Error loading section:', err));
}

 
async function loadSectionData(section) {
    console.log('Loading data for section:', section);
    try {
        switch(section) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'registrations':
                await loadRegistrations('all');
                break;
            case 'students':
                await loadStudents();
                break;
            case 'assignments':
                await loadAssignments();
                break;
            case 'teachers':
                await loadTeachers();
                break;
            case 'schools':
                await loadSchools();
                break;
            case 'payments':
                await loadPayments();
                break;
            default:
                console.warn('Unknown section:', section);
        }
    } catch (error) {
        console.error('Error loading section data:', error);
        showToast('Error al cargar los datos');
    }
}

 
async function loadDashboard() {
    console.log('Loading dashboard...');
    try {
        if (!adminState.registrations.length) {
            await syncDataFromApi();
        }

        const registrations = adminState.registrations;
        const stats = adminState.stats;
        const users = adminState.users;
        const schools = adminState.schools;

        const pending = stats?.pending ?? registrations.filter(r => (r.status || '').toLowerCase() === 'pending').length;
        const students = stats?.approved ?? registrations.filter(r => (r.status || '').toLowerCase() === 'approved').length;
        const teachers = stats?.teachers ?? users.filter(u => (u.role || '').toUpperCase() === 'TEACHER').length;
        const activeSchools = stats?.activeSchools ?? schools.filter(s => s.status === 'active').length;

        const statPending = document.getElementById('statPending');
        const statStudents = document.getElementById('statStudents');
        const statTeachers = document.getElementById('statTeachers');
        const statSchools = document.getElementById('statSchools');
        const pendingBadge = document.getElementById('pendingBadge');

        if (statPending) statPending.textContent = pending;
        if (statStudents) statStudents.textContent = students;
        if (statTeachers) statTeachers.textContent = teachers;
        if (statSchools) statSchools.textContent = activeSchools;
        if (pendingBadge) pendingBadge.textContent = pending;

        const recentActivity = document.getElementById('recentActivity');
        if (recentActivity) {
            const recentHtml = registrations.slice(-5).reverse().map(reg => `
                <div class="flex items-center justify-between py-2">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span>👤</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${reg.fullName}</p>
                            <p class="text-xs text-gray-500">Nueva solicitud de registro</p>
                        </div>
                    </div>
                    <span class="text-xs text-gray-500">${formatDate(reg.createdAt || reg.registrationDate)}</span>
                </div>
            `).join('');

            recentActivity.innerHTML = recentHtml || '<p class="text-gray-500 text-sm">No hay actividad reciente</p>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

 
async function loadRegistrations(filter = 'all') {
    if (!adminState.registrations.length) {
        await syncDataFromApi();
    }

    const registrations = adminState.registrations;
    let filtered = registrations;
    if (filter !== 'all') {
        filtered = registrations.filter(r => (r.status || '').toLowerCase() === filter);
    }

    const html = filtered.map(reg => `
        <div class="p-6 hover:bg-gray-50">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                        <h4 class="text-lg font-semibold text-gray-900">${reg.fullName}</h4>
                        <span class="px-3 py-1 text-xs rounded-full ${getStatusBadgeClass(reg.status)}">
                            ${getStatusText(reg.status)}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                            <span class="font-medium">Documento:</span> ${reg.document}
                        </div>
                        <div>
                            <span class="font-medium">Email:</span> ${reg.email}
                        </div>
                        <div>
                            <span class="font-medium">Teléfono:</span> ${reg.phone}
                        </div>
                        <div>
                            <span class="font-medium">Colegio:</span> ${reg.school?.name || reg.schoolName || 'No especificado'}
                        </div>
                        <div>
                            <span class="font-medium">Grado:</span> ${reg.gradeName}
                        </div>
                        <div>
                            <span class="font-medium">Fecha:</span> ${formatDate(reg.createdAt || reg.registrationDate)}
                        </div>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p><span class="font-medium">Acudiente:</span> ${reg.guardianName} - ${reg.guardianPhone}</p>
                    </div>
                </div>
                <div class="flex flex-col space-y-2 ml-4">
                    ${(reg.status || '').toLowerCase() === 'pending' ? `
                        <button onclick="approveRegistration('${reg.id}')" 
                                class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                            ✓ Aprobar
                        </button>
                        <button onclick="rejectRegistration('${reg.id}')" 
                                class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                            ✗ Rechazar
                        </button>
                    ` : ''}
                    <button onclick="viewDetails('${reg.id}')" 
                            class="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('registrationsList').innerHTML = html || '<p class="p-6 text-gray-500">No hay registros</p>';
}

 
function filterRegistrations(status, ev) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (ev?.target) ev.target.classList.add('active');
    loadRegistrations(status);
}

 
async function approveRegistration(id) {
    try {
        await apiFetch(`/registrations/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'APPROVED' })
        });
        await syncDataFromApi();
        loadRegistrations();
        loadDashboard();
        showToast('Estudiante aprobado exitosamente');
    } catch (err) {
        console.error(err);
        alert('No se pudo aprobar');
    }
}

 
async function rejectRegistration(id) {
    if (!confirm('¿Estás seguro de rechazar esta solicitud?')) return;
    try {
        await apiFetch(`/registrations/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'REJECTED' })
        });
        await syncDataFromApi();
        loadRegistrations();
        loadDashboard();
        showToast('Solicitud rechazada');
    } catch (err) {
        console.error(err);
        alert('No se pudo rechazar');
    }
}

 
async function loadStudents() {
    if (!adminState.registrations.length) {
        await syncDataFromApi();
    }
    const approved = adminState.registrations.filter(r => (r.status || '').toLowerCase() === 'approved');

    const html = approved.map(student => `
        <tr>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span class="font-semibold text-purple-600">${student.fullName.charAt(0)}</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${student.fullName}</p>
                        <p class="text-sm text-gray-500">${student.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">${student.document}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${student.school?.name || student.schoolName || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${student.gradeName}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>
            </td>
            <td class="px-6 py-4">
                <button onclick="viewDetails('${student.id}')" class="text-blue-600 hover:text-blue-800 text-sm">Ver</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('studentsTableBody').innerHTML = html || '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay estudiantes aprobados</td></tr>';
}

 
async function loadAssignments() {
    if (!adminState.assignments.length || !adminState.users.length) {
        await syncDataFromApi();
    }

    // mapa de estudiantes ya asignados -> docente
    const assignedByStudent = new Map();
    adminState.assignments.forEach(a => {
        a.students.forEach(s => {
            assignedByStudent.set(s.id, a.teacher?.name || 'Docente');
        });
    });

    const teachers = adminState.users.filter(u => (u.role || '').toUpperCase() === 'TEACHER');
    const teacherOptions = teachers.map(t => `<option value="${t.id}">${t.name} (${t.email})</option>`).join('');
    document.getElementById('assignTeacher').innerHTML = '<option value="">Seleccionar docente...</option>' + teacherOptions;

    const approved = adminState.registrations.filter(r => (r.status || '').toLowerCase() === 'approved' && r.userId);
    const studentCheckboxes = approved.map(s => `
        <label class="flex items-center justify-between space-x-2 cursor-pointer border border-gray-200 rounded-lg px-3 py-2">
            <div class="flex items-center space-x-2">
                <input type="checkbox" value="${s.userId}" class="w-4 h-4 text-purple-600 border-gray-300 rounded">
                <span class="text-sm text-gray-700">${s.fullName} - ${s.gradeName}</span>
            </div>
            <div class="text-right text-xs">
                ${assignedByStudent.has(s.userId)
                    ? `<span class="px-2 py-1 rounded-full bg-amber-100 text-amber-700">Asignado a ${assignedByStudent.get(s.userId)}</span>
                       <button type="button" onclick="unassignStudent('${s.userId}')" class="ml-2 text-rose-600 hover:text-rose-800">Desasignar</button>`
                    : '<span class="text-gray-400">Disponible</span>'}
            </div>
        </label>
    `).join('');
    document.getElementById('studentCheckboxes').innerHTML = studentCheckboxes || '<p class="text-gray-500 text-sm">No hay estudiantes disponibles</p>';

    const assignmentsList = adminState.assignments.map(item => `
        <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-gray-900">${item.teacher?.name || 'Docente'}</h4>
                <button onclick="deleteAssignment('${item.id}')" class="text-red-600 hover:text-red-800 text-sm">
                    Eliminar
                </button>
            </div>
            <div class="space-y-1">
                ${item.students.map(st => `<p class="text-sm text-gray-600">• ${st.name} (${st.email})</p>`).join('')}
            </div>
            <p class="text-xs text-gray-500 mt-2">${item.students.length} estudiante(s) asignado(s)</p>
        </div>
    `).join('');

    document.getElementById('assignmentsList').innerHTML = assignmentsList || '<p class="text-gray-500 text-sm">No hay asignaciones</p>';
}


document.getElementById('assignmentForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const teacherId = document.getElementById('assignTeacher').value;
    const checkboxes = document.querySelectorAll('#studentCheckboxes input[type="checkbox"]:checked');
    const studentIds = Array.from(checkboxes).map(cb => cb.value);

    if (!teacherId) {
        alert('Selecciona un docente');
        return;
    }

    if (studentIds.length === 0) {
        alert('Selecciona al menos un estudiante');
        return;
    }

    try {
        await apiFetch('/assignments', {
            method: 'POST',
            body: JSON.stringify({ teacherId, studentIds })
        });
        await syncDataFromApi();
        showToast('Asignación creada exitosamente');
        this.reset();
        loadAssignments();
    } catch (err) {
        console.error(err);
        alert('No se pudo crear la asignación');
    }
});

// Desasignar estudiante (borra el vínculo y si queda vacía, elimina la asignación)
async function unassignStudent(studentId) {
    try {
        const assignment = adminState.assignments.find(a => a.students.some(s => s.id === studentId));
        if (!assignment) {
            alert('El estudiante no tiene asignación');
            return;
        }
        await apiFetch(`/assignments/${assignment.id}/student/${studentId}`, { method: 'DELETE' });
        await syncDataFromApi();
        loadAssignments();
        showToast('Estudiante desasignado');
    } catch (err) {
        console.error(err);
        alert('No se pudo desasignar');
    }
}


async function deleteAssignment(assignmentId) {
    if (!confirm('¿Eliminar esta asignación?')) return;
    try {
        await apiFetch(`/assignments/${assignmentId}`, { method: 'DELETE' });
        await syncDataFromApi();
        showToast('Asignación eliminada');
        loadAssignments();
    } catch (err) {
        console.error(err);
        alert('No se pudo eliminar la asignación');
    }
}

 
async function loadTeachers() {
    if (!adminState.users.length) {
        await syncDataFromApi();
    }
    const teachers = adminState.users.filter(u => (u.role || '').toUpperCase() === 'TEACHER');

    const html = teachers.map(teacher => {
        // Contraseña default es docente123 (o firstname+123 si existe createdAt reciente)
        const defaultPass = 'docente123';
        return `
        <div class="p-6 hover:bg-gray-50 flex items-center justify-between border-b">
            <div class="flex items-center space-x-4 flex-1">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-xl">👩‍🏫</span>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">${teacher.name}</h4>
                    <p class="text-sm text-gray-600">${teacher.email}</p>
                    ${teacher.school?.name ? `<p class="text-xs text-gray-500">${teacher.school.name}</p>` : ''}
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="copyToClipboard('${teacher.email}', 'Email copiado')" class="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm" title="Copiar email">
                    📋 Email
                </button>
                <button onclick="copyToClipboard('${defaultPass}', 'Contraseña default copiada')" class="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 text-sm" title="Copiar contraseña default">
                    🔑 Copiar Pass
                </button>
                <button onclick="resetTeacherPassword('${teacher.id}', '${teacher.name}')" class="px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 text-sm">
                    🔄 Resetear
                </button>
                <button onclick="editTeacher('${teacher.id}')" class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                    Editar
                </button>
                <button onclick="deleteTeacher('${teacher.id}')" class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                    Eliminar
                </button>
            </div>
        </div>
    `}).join('');

    document.getElementById('teachersList').innerHTML = html || '<p class="p-6 text-gray-500">No hay docentes registrados</p>';
}

 
function viewTeacherDetails(id) {
    const teacher = adminState.users.find(u => u.id === id);
    const assignment = adminState.assignments.find(a => a.teacher?.id === id);
    const assignedStudents = assignment?.students?.length || 0;
    if (teacher) {
        alert(`Docente: ${teacher.name}\nEmail: ${teacher.email}\nEstudiantes asignados: ${assignedStudents}`);
    }
}

async function editTeacher(id) {
    const teacher = adminState.users.find(u => u.id === id);
    if (!teacher) return;

    const newName = prompt('Nuevo nombre:', teacher.name);
    if (!newName || !newName.trim()) return;

    try {
        await apiFetch(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: newName.trim() })
        });
        await syncDataFromApi();
        showToast('Docente actualizado');
        loadTeachers();
    } catch (err) {
        console.error(err);
        alert('No se pudo actualizar el docente');
    }
}

function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message || 'Copiado al portapapeles');
    }).catch(() => {
        alert('No se pudo copiar: ' + text);
    });
}

async function resetTeacherPassword(id, name) {
    const newPassword = prompt(`Nueva contraseña para ${name}:`, 'docente123');
    if (!newPassword || newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        await apiFetch(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ password: newPassword })
        });
        
        // Copia al portapapeles
        await navigator.clipboard.writeText(newPassword);
        
        // Mensaje claro con la nueva contraseña
        alert(`✓ Contraseña reseteada exitosamente\n\n📋 Nueva contraseña (ya copiada):\n${newPassword}\n\nCompartelo con el docente`);
        
        showToast('Contraseña reseteada y copiada');
        await syncDataFromApi();
        loadTeachers();
    } catch (err) {
        console.error(err);
        alert('No se pudo resetear la contraseña: ' + err.message);
    }
}

async function deleteTeacher(id) {
    if (!confirm('¿Eliminar este docente? También se eliminarán sus asignaciones.')) return;
    try {
        await apiFetch(`/users/${id}`, { method: 'DELETE' });
        await syncDataFromApi();
        showToast('Docente eliminado');
        loadTeachers();
        loadDashboard();
    } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el docente');
    }
}

 
async function loadSchools() {
    try {
        if (!adminState.schools.length) {
            await syncDataFromApi();
        }
        const schools = adminState.schools;
        const html = schools.map(school => `
            <div class="p-6 hover:bg-gray-50 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span class="text-xl">🏫</span>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900">${school.name}</h4>
                        <p class="text-sm text-gray-600">${school.city || 'Ciudad no especificada'}</p>
                        ${school.address ? `<p class="text-xs text-gray-500">${school.address}</p>` : ''}
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-xs rounded-full ${school.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${school.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onclick="toggleSchoolStatus('${school.id}')" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                        ${school.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onclick="editSchool('${school.id}')" class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                        Editar
                    </button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('schoolsList').innerHTML = html || '<p class="p-6 text-gray-500">No hay colegios registrados</p>';
    } catch (err) {
        console.error(err);
        document.getElementById('schoolsList').innerHTML = '<p class="p-6 text-red-500">Error cargando colegios</p>';
    }
}

 
function showAddSchoolModal() {
    document.getElementById('addSchoolModal').classList.remove('hidden');
}

 
function closeAddSchoolModal() {
    document.getElementById('addSchoolModal').classList.add('hidden');
    document.getElementById('addSchoolForm').reset();
}

 
document.getElementById('addSchoolForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        await apiFetch('/schools', {
            method: 'POST',
            body: JSON.stringify({
                name: document.getElementById('schoolName').value,
                city: document.getElementById('schoolCity').value,
                address: document.getElementById('schoolAddress').value,
                phone: document.getElementById('schoolPhone').value
            })
        });
        showToast('Colegio agregado exitosamente');
        closeAddSchoolModal();
        await loadSchools();
        await syncDataFromApi();
        loadDashboard();
    } catch (err) {
        console.error(err);
        alert('No se pudo agregar el colegio');
    }
});

 
function showAddTeacherModal() {
    const select = document.getElementById('teacherSchool');
    const schools = adminState.schools.filter(s => s.status === 'active');
    select.innerHTML = '<option value="">Seleccionar colegio...</option>' +
        schools.map(school => `<option value="${school.id}">${school.name}</option>`).join('');

    document.getElementById('addTeacherModal').classList.remove('hidden');
}

 
function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').classList.add('hidden');
    document.getElementById('addTeacherForm').reset();
}

 
document.getElementById('addTeacherForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('teacherEmail').value;
    const schoolId = document.getElementById('teacherSchool').value || null;
    const name = document.getElementById('teacherName').value;
    const password = document.getElementById('teacherPassword').value;

    try {
        await apiFetch('/users', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role: 'TEACHER', schoolId })
        });
        await syncDataFromApi();
        showToast('Docente agregado exitosamente');
        closeAddTeacherModal();
        loadTeachers();
        loadDashboard();
    } catch (err) {
        console.error(err);
        alert('No se pudo agregar el docente');
    }
});

 
async function toggleSchoolStatus(id) {
    const school = adminState.schools.find(s => s.id === id);
    if (!school) return;
    const nextStatus = school.status === 'active' ? 'inactive' : 'active';
    try {
        await apiFetch(`/schools/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
        await syncDataFromApi();
        showToast(`Colegio ${nextStatus === 'active' ? 'activado' : 'desactivado'}`);
        loadSchools();
        loadDashboard();
    } catch (err) {
        console.error(err);
        alert('No se pudo actualizar el colegio');
    }
}

 
async function editSchool(id) {
    const school = adminState.schools.find(s => s.id === id);
    if (!school) return;

    const newName = prompt('Nuevo nombre:', school.name);
    const newCity = prompt('Nueva ciudad:', school.city || '');
    const newAddress = prompt('Nueva dirección:', school.address || '');
    const newPhone = prompt('Nuevo teléfono:', school.phone || '');

    try {
        await apiFetch(`/schools/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                name: newName || school.name,
                city: newCity || school.city,
                address: newAddress || school.address,
                phone: newPhone || school.phone
            })
        });
        await syncDataFromApi();
        showToast('Colegio actualizado');
        loadSchools();
    } catch (err) {
        console.error(err);
        alert('No se pudo actualizar el colegio');
    }
}

 
function editStudent() {
    alert('Edición de estudiantes no disponible aún. Usa el backend para actualizar los datos.');
}

 
function viewDetails(id) {
    const reg = adminState.registrations.find(r => r.id === id);
    
    if (reg) {
        const details = `
📋 DETALLES DE REGISTRO

👤 ESTUDIANTE
Nombre: ${reg.fullName}
Documento: ${reg.document}
Email: ${reg.email}
Teléfono: ${reg.phone}
Fecha Nacimiento: ${reg.birthdate || 'N/A'}
Género: ${reg.gender || 'N/A'}
Dirección: ${reg.address || 'N/A'}

🏫 INFORMACIÓN ACADÉMICA
Colegio: ${reg.school?.name || reg.schoolName || 'N/A'}
Grado: ${reg.gradeName}

👨‍👩‍👧 ACUDIENTE
Nombre: ${reg.guardianName}
Teléfono: ${reg.guardianPhone}
Email: ${reg.guardianEmail || 'N/A'}

💳 PAGO
Método: ${getPaymentMethodText(reg.paymentMethod)}
Monto: $${reg.amount?.toLocaleString()} COP
Fecha: ${formatDate(reg.registrationDate)}

📊 ESTADO
Estado: ${getStatusText(reg.status)}
${reg.approvedBy ? `Aprobado por: ${reg.approvedBy}\nFecha aprobación: ${formatDate(reg.approvedDate)}` : ''}
${reg.rejectedBy ? `Rechazado por: ${reg.rejectedBy}\nFecha rechazo: ${formatDate(reg.rejectedDate)}` : ''}
        `;
        alert(details);
    }
}

 
async function loadPayments() {
    try {
        const payments = await apiFetch('/payments');
        const html = payments.map(pay => `
            <tr>
                <td class="px-6 py-4 text-sm text-gray-900">${pay.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${pay.registration?.fullName || '-'}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">$${pay.amount?.toLocaleString()} ${pay.currency || 'COP'}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${(pay.method || '').toUpperCase()}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${formatDate(pay.createdAt)}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 text-xs rounded-full ${getStatusBadgeClass(pay.status)}">${getStatusText(pay.status)}</span>
                </td>
            </tr>
        `).join('');
        document.getElementById('paymentsTableBody').innerHTML = html || '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay pagos registrados</td></tr>';
    } catch (err) {
        console.error(err);
        document.getElementById('paymentsTableBody').innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error cargando pagos</td></tr>';
    }
}

 
function getStatusBadgeClass(status) {
    const key = (status || '').toString().toLowerCase();
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'paid': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800'
    };
    return classes[key] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const key = (status || '').toString().toLowerCase();
    const texts = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'paid': 'Pagado',
        'failed': 'Fallido'
    };
    return texts[key] || status;
}

function getPaymentMethodText(method) {
    const key = (method || '').toString().toLowerCase();
    const methods = {
        'card': 'Tarjeta',
        'pse': 'PSE',
        'transfer': 'Transferencia'
    };
    return methods[key] || method;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('span').textContent = message;
    toast.classList.remove('translate-y-full');
    setTimeout(() => toast.classList.add('translate-y-full'), 3000);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../../index.html';
}

 
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    
    syncDataFromApi().finally(() => {
        loadDashboard();
    });
    
    
    const now = new Date();
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('es-CO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    
    const style = document.createElement('style');
    style.textContent = `
        .filter-btn {
            background: #f3f4f6;
            color: #4b5563;
        }
        .filter-btn.active {
            background: #667eea;
            color: white;
        }
    `;
    document.head.appendChild(style);
});
