# Plataforma Escolar

Una plataforma educativa para la gestión integral de instituciones educativas. Incluye gestión de estudiantes, docentes, tareas, calificaciones, pagos y más.

## Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura](#estructura)
- [Stack Tecnológico](#stack-tecnológico)
- [API](#api)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Características

### Para Estudiantes
- Acceso a contenido educativo
- Envío y seguimiento de tareas
- Ver calificaciones
- Chat con docentes y compañeros
- Sistema de logros y niveles
- Acceso a conferencias de video

### Para Docentes
- Gestionar estudiantes
- Crear y publicar contenido
- Calificar tareas
- Reportes de desempeño
- Programar clases
- Comunicación directa con estudiantes

### Para Administradores
- Gestionar escuelas e instituciones
- Administración de usuarios y roles
- Control de permisos y seguridad
- Gestión de pagos integrada
- Reportes y analytics
- Configuración del sistema

## Requisitos

Para usar el proyecto necesitas:

- Node.js v18 o superior
- npm o yarn
- Docker (opcional)
- PostgreSQL
- Python 3.8+ para desarrollo

## Instalación

### Con Docker

```bash
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar
docker-compose up -d
docker exec plataforma-escolar-api npm run prisma:seed
```

### Instalación Manual

```bash
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar
cd api
npm install

cp .env.example .env
# Edita .env con tus valores

npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Configuración

Copia el archivo `.env.example` a `.env` en la carpeta `/api` y configura:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/plataforma_escolar
JWT_SECRET=tu-secreto-muy-seguro
STRIPE_SECRET_KEY=sk_test_...
PORT=5000
NODE_ENV=development
```

## Uso

Inicia el servidor en desarrollo:

```bash
cd api
npm run dev
```

La API estará disponible en http://localhost:5000

Para producción:

```bash
npm run build
npm start
```

## Estructura

```
plataforma-escolar/
├── api/                    # Backend API
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
├── assets/                 # Recursos estáticos
│   ├── css/
│   ├── images/
│   └── js/
├── components/
├── views/
├── config/
├── docker-compose.yml
└── README.md
```

## Stack Tecnológico

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticación
- Stripe para pagos

### Frontend
- HTML5 / CSS3
- JavaScript
- Pyodide (Python en navegador)

### DevOps
- Docker
- Docker Compose

## API

Los endpoints principales incluyen:

Autenticación:
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

Usuarios:
```
GET /api/users
GET /api/profile
PUT /api/profile
```

Contenido:
```
GET /api/contents
POST /api/contents
PUT /api/contents/:id
DELETE /api/contents/:id
```

Tareas:
```
GET /api/tasks
POST /api/tasks
POST /api/tasks/:id/submit
```

Para más detalles, consulta [API_DOCS.md](./API_DOCS.md)

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
3. Commit tus cambios: `git commit -m 'Agregar feature'`
4. Push a la rama: `git push origin feature/mi-feature`
5. Abre un Pull Request

Para más detalles, consulta [CONTRIBUTING.md](./CONTRIBUTING.md)

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta [LICENSE](./LICENSE) para más detalles.

## Autor

Diego - Desarrollador Full Stack

GitHub: https://github.com/Diego558-coder

## Soporte

Para soporte, abre un issue en GitHub o envía un email a support@plataformaescolar.com

## Documentación Adicional

- [Guía Rápida](./QUICKSTART.md)
- [Arquitectura](./ARCHITECTURE.md)
- [Despliegue](./DEPLOYMENT.md)
- [Seguridad](./SECURITY.md)
- [Documentación API](./API_DOCS.md)

