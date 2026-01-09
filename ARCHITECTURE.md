# 🏗️ Arquitectura del Sistema

Documentación de la arquitectura técnica de Plataforma Escolar.

## 📐 Diagrama General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
│  HTML5 | CSS3 | JavaScript | Pyodide (Python)          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   API REST (Backend)                     │
│         Express.js + TypeScript + Node.js               │
│                                                          │
│  ├─ Autenticación (JWT)                                │
│  ├─ Autorización (Role-based)                          │
│  ├─ Rutas de Negocio                                   │
│  └─ Manejo de Errores                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌────────────┐
   │PostgreSQL   │ Stripe   │  │Google Meet │
   │  (BD)       │ (Pagos)  │  │  (Video)   │
   └─────────┘  └──────────┘  └────────────┘
```

## 🗂️ Estructura de Carpetas

### Backend (`/api`)

```
api/
├── src/
│   ├── app.ts              # Configuración de Express
│   ├── server.ts           # Punto de entrada
│   ├── config/
│   │   ├── env.ts          # Variables de entorno
│   │   └── prisma.ts       # Configuración de Prisma
│   ├── middlewares/
│   │   ├── auth.ts         # Autenticación JWT
│   │   └── errorHandler.ts # Manejo de errores
│   ├── routes/
│   │   ├── auth.ts         # Rutas de autenticación
│   │   ├── users.ts        # Gestión de usuarios
│   │   ├── contents.ts     # Contenido educativo
│   │   ├── tasks.ts        # Tareas y asignaciones
│   │   ├── assignments.ts  # Entregas y calificaciones
│   │   ├── payments.ts     # Procesamiento de pagos
│   │   ├── schools.ts      # Gestión de escuelas
│   │   ├── registrations.ts # Inscripciones
│   │   ├── profile.ts      # Perfil de usuario
│   │   └── index.ts        # Agregador de rutas
│   └── utils/
│       ├── jwt.ts          # Funciones JWT
│       ├── crypto.ts       # Encriptación
│       └── dataStore.ts    # Almacenamiento de datos
├── prisma/
│   ├── schema.prisma       # Definición de modelos
│   ├── migrations/         # Historial de migraciones
│   └── seed.ts/js          # Datos iniciales
├── package.json
└── tsconfig.json

```

### Frontend

```
/
├── index.html              # Página principal
├── config/
│   └── config.js           # Configuración global
├── assets/
│   ├── css/                # Hojas de estilos
│   ├── js/                 # Scripts auxiliares
│   ├── images/             # Imágenes
│   └── fonts/              # Tipografías
├── components/             # Componentes reutilizables
├── views/
│   ├── admin/              # Vistas de administrador
│   ├── docente/            # Vistas de docente
│   └── estudiante/         # Vistas de estudiante
├── scripts/                # Scripts del sistema
└── public/                 # Archivos públicos
```

## 🔐 Flujo de Autenticación

```
1. Usuario ingresa credenciales
         ↓
2. Backend valida credenciales
         ↓
3. Si es correcto:
   - Hash contraseña con bcrypt
   - Generar JWT access token
   - Generar JWT refresh token
   - Guardar refresh token en BD
         ↓
4. Enviar tokens al cliente
         ↓
5. Cliente almacena tokens
         ↓
6. Próximas solicitudes incluyen access token
         ↓
7. Si token expira:
   - Cliente envía refresh token
   - Backend valida y genera nuevo access token
         ↓
8. Logout: eliminar refresh token de BD
```

## 📊 Modelo de Base de Datos

### Principales Tablas

```sql
-- Usuarios
User (id, email, password, name, role, createdAt, updatedAt)

-- Roles y Permisos
Role (id, name, permissions[], createdAt)

-- Escuelas
School (id, name, address, phone, email, website)

-- Estudiantes
StudentEnrollment (id, studentId, schoolId, courseId, enrollmentDate)

-- Contenido
Content (id, title, description, courseId, createdBy, createdAt)

-- Tareas
Task (id, title, description, courseId, dueDate, createdBy)

-- Entregas
Assignment (id, taskId, studentId, submittedAt, grade, feedback)

-- Pagos
Payment (id, userId, amount, stripePaymentId, status, createdAt)
```

## 🔄 Ciclo de Vida de una Solicitud

```
1. Cliente envía solicitud HTTP
         ↓
2. Express recibe solicitud
         ↓
3. Middlewares:
   - CORS
   - Logger (Morgan)
   - Parseo JSON
   - Autenticación JWT
         ↓
4. Routing: selecciona ruta apropiada
         ↓
5. Controlador procesa lógica
         ↓
6. Consulta a BD via Prisma
         ↓
7. Procesa respuesta
         ↓
8. Error handler (si aplica)
         ↓
9. Envía respuesta al cliente
```

## 🔌 Integraciones Externas

### 1. Stripe (Pagos)
- Crear intentos de pago
- Confirmar pagos
- Webhooks para actualizaciones

### 2. Google Meet (Video Conferencias)
- Crear meetings
- Enviar invitaciones
- Registrar asistencia

### 3. Email (SMTP)
- Notificaciones
- Confirmación de cuenta
- Recordatorios

## 🔒 Seguridad

### Autenticación
- JWT (JSON Web Tokens)
- Tokens con expiración
- Refresh token rotation

### Autorización
- Role-Based Access Control (RBAC)
- Middleware de permisos
- Validación en servidor

### Protección de Datos
- Hashing de contraseñas (bcrypt)
- Variables de entorno para secretos
- HTTPS en producción
- CORS configurado

### Validación
- Zod para validación de esquemas
- Validación en servidor siempre
- Sanitización de inputs

## 📈 Escalabilidad

### Caching
- Redis para sesiones
- Caché de rutas frecuentes
- CDN para assets estáticos

### Base de Datos
- Índices en campos críticos
- Paginación de resultados
- Lazy loading de relaciones

### Rendimiento
- Compresión gzip
- Minificación de assets
- Code splitting en frontend

## 🚀 Despliegue

### Desarrollo
- Stack local con Docker
- Datos de prueba con seed
- Hot reload en cambios

### Producción
- Docker containers
- Variables de entorno seguras
- Base de datos RDS
- CDN para static assets
- Monitoring y logs

## 📝 Estándares de Código

- **TypeScript** - Type safety
- **ESLint** - Linting
- **Prettier** - Formato
- **Git Hooks** - Pre-commit validation
- **Tests** - Jest para unit tests

---

Para más detalles, consulta la documentación específica de cada módulo.
