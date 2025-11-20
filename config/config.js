 

const CONFIG = {
    institution: {
        name: 'Plataforma Escolar',
        logo: '/assets/images/logo.png',
        address: '',
        phone: '',
        email: '',
        website: ''
    },

    app: {
        name: 'Plataforma Escolar',
        version: '1.0.0',
        environment: 'development',
        timezone: 'America/Bogota',
        locale: 'es-CO'
    },

    api: {
        baseUrl: 'https://api.plataformaescolar.com',
        timeout: 30000,
        retries: 3
    },

    videoConference: {
        provider: 'Google Meet',
        defaultDuration: 90,
        reminderTime: 10
    },

    grading: {
        scale: {
            min: 0,
            max: 5.0
        },
        passing: 3.0,
        decimals: 1,
        weights: {
            tasks: 40,
            quizzes: 30,
            projects: 30
        }
    },

    files: {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ['.pdf', '.doc', '.docx', '.py', '.zip', '.jpg', '.png'],
        uploadPath: '/uploads'
    },

    notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        email: false
    },

    chat: {
        maxMessageLength: 1000,
        allowAttachments: true,
        typingTimeout: 3000
    },

    theme: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6'
    },

    roles: {
        admin: {
            name: 'Administrador',
            permissions: ['all']
        },
        teacher: {
            name: 'Docente',
            permissions: ['view_students', 'grade', 'create_content', 'manage_class']
        },
        student: {
            name: 'Estudiante',
            permissions: ['view_content', 'submit_tasks', 'view_grades', 'chat']
        }
    },

    python: {
        version: '0.23.4',
        cdnUrl: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
        timeout: 30000,
        packages: ['numpy', 'pandas', 'matplotlib']
    },

    gamification: {
        enabled: true,
        badges: {
            firstTask: { name: 'Primera Tarea', icon: '🎯', points: 10 },
            perfectScore: { name: 'Puntuación Perfecta', icon: '⭐', points: 50 },
            streak7: { name: 'Racha de 7 días', icon: '🔥', points: 30 },
            helpfulPeer: { name: 'Compañero Útil', icon: '🤝', points: 20 }
        },
        levels: [
            { name: 'Principiante', min: 0, max: 100 },
            { name: 'Intermedio', min: 101, max: 300 },
            { name: 'Avanzado', min: 301, max: 600 },
            { name: 'Experto', min: 601, max: 1000 },
            { name: 'Maestro', min: 1001, max: Infinity }
        ]
    },

    calendar: {
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        holidays: [
            { date: '2024-05-01', name: 'Día del Trabajo' },
            { date: '2024-07-20', name: 'Día de la Independencia' },
            { date: '2024-08-07', name: 'Batalla de Boyacá' },
            { date: '2024-10-14', name: 'Día de la Raza' }
        ]
    },

    features: {
        aiAssistant: false,
        codePlayground: true,
        peerReview: false,
        liveCollaboration: false
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
