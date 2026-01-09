# 📚 Guía de APIs

Documentación completa de los endpoints de Plataforma Escolar.

## 🔑 Autenticación

Todos los endpoints requieren un token JWT en el header:

```
Authorization: Bearer <tu_jwt_token>
```

### Registrarse

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Juan Pérez",
  "role": "student"
}
```

**Respuesta (201):**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "Juan Pérez",
  "role": "student",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Respuesta (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "student"
  }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 👥 Usuarios

### Listar Usuarios (Admin)

```http
GET /api/users?page=1&limit=10
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "Juan Pérez",
      "role": "student",
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Obtener Usuario

```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Actualizar Usuario

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Juan Carlos Pérez",
  "email": "juancarlos@example.com"
}
```

### Perfil del Usuario Actual

```http
GET /api/profile
Authorization: Bearer <token>
```

### Actualizar Perfil

```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+573001234567",
  "photo": "https://example.com/photo.jpg",
  "bio": "Estudiante de matemáticas"
}
```

---

## 📚 Contenido Educativo

### Listar Contenido

```http
GET /api/contents?courseId=course-123&page=1
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "content-123",
      "title": "Introducción a Álgebra",
      "description": "Conceptos básicos de álgebra",
      "courseId": "course-123",
      "type": "video",
      "url": "https://example.com/video.mp4",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-05T14:30:00Z"
    }
  ],
  "total": 1
}
```

### Crear Contenido (Docente)

```http
POST /api/contents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introducción a Álgebra",
  "description": "Conceptos básicos de álgebra",
  "courseId": "course-123",
  "type": "video",
  "url": "https://example.com/video.mp4"
}
```

### Actualizar Contenido

```http
PUT /api/contents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introducción a Álgebra Lineal",
  "description": "Actualizado"
}
```

### Eliminar Contenido

```http
DELETE /api/contents/:id
Authorization: Bearer <token>
```

---

## ✅ Tareas y Asignaciones

### Listar Tareas

```http
GET /api/tasks?courseId=course-123
Authorization: Bearer <token>
```

### Crear Tarea (Docente)

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Taller de Ecuaciones",
  "description": "Resolver 10 ecuaciones",
  "courseId": "course-123",
  "dueDate": "2025-01-15T23:59:59Z",
  "maxScore": 100
}
```

### Enviar Tarea (Estudiante)

```http
POST /api/tasks/:taskId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Mi respuesta...",
  "attachments": ["file-id-123"]
}
```

### Calificar Tarea (Docente)

```http
POST /api/assignments/:assignmentId/grade
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 85,
  "feedback": "¡Excelente trabajo! Solo hay un pequeño error aquí...",
  "rubric": {
    "accuracy": 9,
    "completeness": 8,
    "clarity": 9
  }
}
```

---

## 💳 Pagos

### Crear Intención de Pago

```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "currency": "COP",
  "description": "Inscripción al curso de Matemáticas",
  "metadata": {
    "courseId": "course-123"
  }
}
```

**Respuesta:**
```json
{
  "clientSecret": "pi_1234567890",
  "publishableKey": "pk_test_..."
}
```

### Obtener Estado de Pago

```http
GET /api/payments/:paymentId
Authorization: Bearer <token>
```

### Webhook de Stripe

```http
POST /api/payments/webhook
Content-Type: application/json
```

---

## 🏫 Escuelas

### Listar Escuelas

```http
GET /api/schools?page=1
Authorization: Bearer <token>
```

### Crear Escuela (Admin)

```http
POST /api/schools
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Colegio San José",
  "address": "Calle 1 #2-3",
  "city": "Bogotá",
  "phone": "+573001234567",
  "email": "info@colegiosanjose.edu.co",
  "website": "https://colegiosanjose.edu.co"
}
```

---

## 📋 Registros e Inscripciones

### Registrar Estudiante en Curso

```http
POST /api/registrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "student-123",
  "courseId": "course-123",
  "enrollmentDate": "2025-01-01T00:00:00Z"
}
```

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Recurso duplicado |
| 500 | Server Error - Error del servidor |

**Respuesta de error:**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token inválido o expirado",
    "details": "Please refresh your token"
  }
}
```

---

## 📊 Rate Limiting

- 100 solicitudes por 15 minutos por IP
- 1000 solicitudes por hora por usuario autenticado

Headers de respuesta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## 🧪 Testing

Usando curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@plataforma.edu","password":"student123"}'

# Obtener token, luego:
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>"
```

---

Para más información, consulta la [documentación completa](./README.md).
