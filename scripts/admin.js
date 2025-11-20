 
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email || currentUser.role !== 'admin') {
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
    
    
    loadSectionData(section);
}

 
function loadSectionData(section) {
    console.log('Loading data for section:', section);
    try {
        switch(section) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'registrations':
                loadRegistrations('all');
                break;
            case 'students':
                loadStudents();
                break;
            case 'assignments':
                loadAssignments();
                break;
            case 'teachers':
                loadTeachers();
                break;
            case 'schools':
                loadSchools();
                break;
            case 'payments':
                loadPayments();
                break;
            default:
                console.warn('Unknown section:', section);
        }
    } catch (error) {
        console.error('Error loading section data:', error);
        showToast('Error al cargar los datos');
    }
}

 
function loadDashboard() {
    console.log('Loading dashboard...');
    try {
        const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const schools = JSON.parse(localStorage.getItem('schools') || '[]');
        
        const pending = registrations.filter(r => r.status === 'pending').length;
        const students = registrations.filter(r => r.status === 'approved').length;
        const teachers = users.filter(u => u.role === 'docente' || u.role === 'teacher').length;
        const activeSchools = schools.filter(s => s.status === 'active').length;
        
        
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
        
        console.log('Dashboard stats updated:', {pending, students, teachers, activeSchools});
        
        
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
                    <span class="text-xs text-gray-500">${formatDate(reg.registrationDate)}</span>
                </div>
            `).join('');
            
            recentActivity.innerHTML = recentHtml || '<p class="text-gray-500 text-sm">No hay actividad reciente</p>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

 
function loadRegistrations(filter = 'all') {
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    let filtered = registrations;
    
    if (filter !== 'all') {
        filtered = registrations.filter(r => r.status === filter);
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
                            <span class="font-medium">Colegio:</span> ${reg.schoolName}
                        </div>
                        <div>
                            <span class="font-medium">Grado:</span> ${reg.gradeName}
                        </div>
                        <div>
                            <span class="font-medium">Fecha:</span> ${formatDate(reg.registrationDate)}
                        </div>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p><span class="font-medium">Acudiente:</span> ${reg.guardianName} - ${reg.guardianPhone}</p>
                    </div>
                </div>
                <div class="flex flex-col space-y-2 ml-4">
                    ${reg.status === 'pending' ? `
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

 
function filterRegistrations(status) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadRegistrations(status);
}

 
function approveRegistration(id) {
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    const registration = registrations.find(r => r.id === id);
    
    if (registration) {
        registration.status = 'approved';
        registration.approvedDate = new Date().toISOString();
        registration.approvedBy = JSON.parse(localStorage.getItem('currentUser')).email;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            email: registration.email,
            password: 'estudiante123',
            name: registration.fullName,
            role: 'estudiante',
            grade: parseInt(registration.grade),
            schoolId: registration.schoolId,
            schoolName: registration.schoolName,
            document: registration.document,
            phone: registration.phone,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        
        localStorage.setItem('studentRegistrations', JSON.stringify(registrations));
        localStorage.setItem('users', JSON.stringify(users));
        
        showToast('Estudiante aprobado exitosamente');
        loadRegistrations();
        loadDashboard();
    }
}

 
function rejectRegistration(id) {
    if (!confirm('¿Estás seguro de rechazar esta solicitud?')) return;
    
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    const registration = registrations.find(r => r.id === id);
    
    if (registration) {
        registration.status = 'rejected';
        registration.rejectedDate = new Date().toISOString();
        registration.rejectedBy = JSON.parse(localStorage.getItem('currentUser')).email;
        
        localStorage.setItem('studentRegistrations', JSON.stringify(registrations));
        
        showToast('Solicitud rechazada');
        loadRegistrations();
        loadDashboard();
    }
}

 
function loadStudents() {
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    const approved = registrations.filter(r => r.status === 'approved');
    
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
            <td class="px-6 py-4 text-sm text-gray-900">${student.schoolName}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${student.gradeName}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>
            </td>
            <td class="px-6 py-4">
                <button onclick="editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('studentsTableBody').innerHTML = html || '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay estudiantes aprobados</td></tr>';
}

 
function loadAssignments() {
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teachers = users.filter(u => u.role === 'docente');
    
    const teacherOptions = teachers.map(t => `
        <option value="${t.email}">${t.name}</option>
    `).join('');
    document.getElementById('assignTeacher').innerHTML = '<option value="">Seleccionar docente...</option>' + teacherOptions;
    
    
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    const approved = registrations.filter(r => r.status === 'approved');
    
    const studentCheckboxes = approved.map(s => `
        <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" value="${s.email}" class="w-4 h-4 text-purple-600 border-gray-300 rounded">
            <span class="text-sm text-gray-700">${s.fullName} - ${s.gradeName}</span>
        </label>
    `).join('');
    document.getElementById('studentCheckboxes').innerHTML = studentCheckboxes || '<p class="text-gray-500 text-sm">No hay estudiantes disponibles</p>';
    
    
    const assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    const assignmentsList = Object.entries(assignments).map(([teacherEmail, students]) => {
        const teacher = users.find(u => u.email === teacherEmail);
        return `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-900">${teacher?.name || teacherEmail}</h4>
                    <button onclick="deleteAssignment('${teacherEmail}')" class="text-red-600 hover:text-red-800 text-sm">
                        Eliminar
                    </button>
                </div>
                <div class="space-y-1">
                    ${students.map(email => {
                        const student = approved.find(s => s.email === email);
                        return `<p class="text-sm text-gray-600">• ${student?.fullName || email}</p>`;
                    }).join('')}
                </div>
                <p class="text-xs text-gray-500 mt-2">${students.length} estudiante(s) asignado(s)</p>
            </div>
        `;
    }).join('');
    
    document.getElementById('assignmentsList').innerHTML = assignmentsList || '<p class="text-gray-500 text-sm">No hay asignaciones</p>';
}

 
document.getElementById('assignmentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const teacherEmail = document.getElementById('assignTeacher').value;
    const checkboxes = document.querySelectorAll('#studentCheckboxes input[type="checkbox"]:checked');
    const studentEmails = Array.from(checkboxes).map(cb => cb.value);
    
    if (!teacherEmail) {
        alert('Selecciona un docente');
        return;
    }
    
    if (studentEmails.length === 0) {
        alert('Selecciona al menos un estudiante');
        return;
    }
    
    const assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    assignments[teacherEmail] = studentEmails;
    localStorage.setItem('assignments', JSON.stringify(assignments));
    
    showToast('Asignación creada exitosamente');
    this.reset();
    loadAssignments();
});

 
function deleteAssignment(teacherEmail) {
    if (!confirm('¿Eliminar esta asignación?')) return;
    
    const assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    delete assignments[teacherEmail];
    localStorage.setItem('assignments', JSON.stringify(assignments));
    
    showToast('Asignación eliminada');
    loadAssignments();
}

 
function loadTeachers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teachers = users.filter(u => u.role === 'docente' || u.role === 'teacher');
    
    const html = teachers.map(teacher => `
        <div class="p-6 hover:bg-gray-50 flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-xl">👩‍🏫</span>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">${teacher.name}</h4>
                    <p class="text-sm text-gray-600">${teacher.email}</p>
                    ${teacher.schoolName ? `<p class="text-xs text-gray-500">${teacher.schoolName}</p>` : ''}
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="viewTeacherDetails('${teacher.email}')" class="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm">
                    Ver Detalles
                </button>
                <button onclick="editTeacher('${teacher.email}')" class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                    Editar
                </button>
                <button onclick="deleteTeacher('${teacher.email}')" class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('teachersList').innerHTML = html || '<p class="p-6 text-gray-500">No hay docentes registrados</p>';
}

 
function viewTeacherDetails(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacher = users.find(u => u.email === email);
    const assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    const assignedStudents = assignments[email] || [];
    
    if (teacher) {
        alert(`Docente: ${teacher.name}\nEmail: ${teacher.email}\nEstudiantes asignados: ${assignedStudents.length}`);
    }
}

 
function editTeacher(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacher = users.find(u => u.email === email);
    
    if (teacher) {
        const newName = prompt('Nuevo nombre:', teacher.name);
        if (newName && newName.trim()) {
            teacher.name = newName.trim();
            localStorage.setItem('users', JSON.stringify(users));
            showToast('Docente actualizado');
            loadTeachers();
        }
    }
}

 
function deleteTeacher(email) {
    if (!confirm('¿Eliminar este docente? También se eliminarán sus asignaciones.')) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filtered = users.filter(u => u.email !== email);
    localStorage.setItem('users', JSON.stringify(filtered));
    
    const assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    delete assignments[email];
    localStorage.setItem('assignments', JSON.stringify(assignments));
    
    showToast('Docente eliminado');
    loadTeachers();
    loadDashboard();
}

 
function loadSchools() {
    const schools = JSON.parse(localStorage.getItem('schools') || '[]');
    
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
}

 
function showAddSchoolModal() {
    document.getElementById('addSchoolModal').classList.remove('hidden');
}

 
function closeAddSchoolModal() {
    document.getElementById('addSchoolModal').classList.add('hidden');
    document.getElementById('addSchoolForm').reset();
}

 
document.getElementById('addSchoolForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const schools = JSON.parse(localStorage.getItem('schools') || '[]');
    
    const newSchool = {
        id: 'sch' + Date.now(),
        name: document.getElementById('schoolName').value,
        city: document.getElementById('schoolCity').value,
        address: document.getElementById('schoolAddress').value,
        phone: document.getElementById('schoolPhone').value,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    schools.push(newSchool);
    localStorage.setItem('schools', JSON.stringify(schools));
    
    showToast('Colegio agregado exitosamente');
    closeAddSchoolModal();
    loadSchools();
    loadDashboard();
});

 
function showAddTeacherModal() {
    
    const schools = JSON.parse(localStorage.getItem('schools') || '[]');
    const select = document.getElementById('teacherSchool');
    select.innerHTML = '<option value="">Seleccionar colegio...</option>' +
        schools.filter(s => s.status === 'active').map(school => 
            `<option value="${school.id}">${school.name}</option>`
        ).join('');
    
    document.getElementById('addTeacherModal').classList.remove('hidden');
}

 
function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').classList.add('hidden');
    document.getElementById('addTeacherForm').reset();
}

 
document.getElementById('addTeacherForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const schools = JSON.parse(localStorage.getItem('schools') || '[]');
    
    const email = document.getElementById('teacherEmail').value;
    
    
    if (users.find(u => u.email === email)) {
        alert('Este email ya está registrado');
        return;
    }
    
    const schoolId = document.getElementById('teacherSchool').value;
    const school = schools.find(s => s.id === schoolId);
    
    const newTeacher = {
        email: email,
        password: document.getElementById('teacherPassword').value,
        name: document.getElementById('teacherName').value,
        role: 'docente',
        schoolId: schoolId || null,
        schoolName: school ? school.name : null,
        createdAt: new Date().toISOString()
    };
    
    users.push(newTeacher);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('Docente agregado exitosamente');
    closeAddTeacherModal();
    loadTeachers();
    loadDashboard();
});

 
function toggleSchoolStatus(id) {
    const schools = JSON.parse(localStorage.getItem('schools') || '[]');
    const school = schools.find(s => s.id === id);
    
    if (school) {
        school.status = school.status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('schools', JSON.stringify(schools));
        showToast(`Colegio ${school.status === 'active' ? 'activado' : 'desactivado'}`);
        loadSchools();
        loadDashboard();
    }
}

 
function editSchool(id) {
    const schools = JSON.parse(localStorage.getItem('schools') || '[]');
    const school = schools.find(s => s.id === id);
    
    if (school) {
        const newName = prompt('Nuevo nombre:', school.name);
        if (newName && newName.trim()) {
            school.name = newName.trim();
            const newCity = prompt('Nueva ciudad:', school.city);
            if (newCity) school.city = newCity.trim();
            localStorage.setItem('schools', JSON.stringify(schools));
            showToast('Colegio actualizado');
            loadSchools();
        }
    }
}

 
function editStudent(id) {
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    const student = registrations.find(r => r.id === id);
    
    if (student) {
        const newName = prompt('Nuevo nombre:', student.fullName);
        if (newName && newName.trim()) {
            student.fullName = newName.trim();
            localStorage.setItem('studentRegistrations', JSON.stringify(registrations));
            
            if (student.status === 'approved') {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === student.email);
                if (user) {
                    user.name = newName.trim();
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
            
            showToast('Estudiante actualizado');
            loadStudents();
        }
    }
}

 
function viewDetails(id) {
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    const reg = registrations.find(r => r.id === id);
    
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
Colegio: ${reg.schoolName}
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

 
function loadPayments() {
    const registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    
    const html = registrations.map(reg => `
        <tr>
            <td class="px-6 py-4 text-sm text-gray-900">${reg.id}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${reg.fullName}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">$${reg.amount?.toLocaleString()} COP</td>
            <td class="px-6 py-4 text-sm text-gray-900">${getPaymentMethodText(reg.paymentMethod)}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${formatDate(reg.registrationDate)}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 text-xs rounded-full ${reg.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${reg.status === 'approved' ? 'Completado' : 'Pendiente'}
                </span>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('paymentsTableBody').innerHTML = html || '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay pagos registrados</td></tr>';
}

 
function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado'
    };
    return texts[status] || status;
}

function getPaymentMethodText(method) {
    const methods = {
        'card': 'Tarjeta',
        'pse': 'PSE',
        'transfer': 'Transferencia'
    };
    return methods[method] || method;
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
    
    
    initializeDefaultData();
    
    loadDashboard();
    
    
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

 
function initializeDefaultData() {
    
    let schools = JSON.parse(localStorage.getItem('schools') || '[]');
    if (schools.length === 0) {
        schools = [
            { id: 'sch1', name: 'Colegio San José', city: 'Bogotá', address: 'Calle 123 #45-67', phone: '3001234567', status: 'active', createdAt: new Date().toISOString() },
            { id: 'sch2', name: 'Institución Educativa La Esperanza', city: 'Medellín', address: 'Carrera 50 #30-20', phone: '3009876543', status: 'active', createdAt: new Date().toISOString() },
            { id: 'sch3', name: 'Colegio Americano', city: 'Cali', address: 'Avenida 5N #25-50', phone: '3005556789', status: 'active', createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('schools', JSON.stringify(schools));
    }
    
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacherExists = users.find(u => u.role === 'docente' || u.role === 'teacher');
    if (!teacherExists) {
        users.push({
            email: 'profesor@escuela.edu.co',
            password: 'docente123',
            name: 'Profesor Juan Pérez',
            role: 'docente',
            schoolId: 'sch1',
            schoolName: 'Colegio San José',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    
    let registrations = JSON.parse(localStorage.getItem('studentRegistrations') || '[]');
    if (registrations.length === 0) {
        registrations = [
            {
                id: 'REG-' + Date.now(),
                fullName: 'María García López',
                document: '1234567890',
                email: 'maria.garcia@email.com',
                phone: '3001112233',
                birthdate: '2010-05-15',
                gender: 'F',
                address: 'Calle 45 #23-10',
                schoolId: 'sch1',
                schoolName: 'Colegio San José',
                grade: '6',
                gradeName: '6° Bachillerato',
                guardianName: 'Ana López',
                guardianPhone: '3002223344',
                guardianEmail: 'ana.lopez@email.com',
                paymentMethod: 'card',
                amount: 150000,
                status: 'pending',
                registrationDate: new Date().toISOString(),
                approvedBy: null,
                approvedDate: null
            }
        ];
        localStorage.setItem('studentRegistrations', JSON.stringify(registrations));
    }
}
