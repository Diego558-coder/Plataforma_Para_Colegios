# Estado Actual - Plataforma Escolar (10 Diciembre 2025)

## ✅ Lo que ya funciona LOCALMENTE

### Backend API (Node.js + Express + TypeScript)
- **Estado**: ✅ Ejecutándose en `http://localhost:4000`
- **Base de Datos**: ✅ PostgreSQL corriendo en Docker en `localhost:5432`
- **Datos de Prueba**: ✅ Seed ejecutado con 3 usuarios:
  - Admin: `admin@plataforma.edu.co` / `admin123`
  - Docente: `docente@plataforma.edu.co` / `docente123`
  - Estudiante: `estudiante@plataforma.edu.co` / `estudiante123`

### Endpoints Verificados
- ✅ `POST /api/auth/login` - Genera JWT, Login correcto
- ✅ `GET /api/schools` - Retorna escuelas (requiere Bearer token)
- ✅ `GET /api/profile/me` - Retorna datos del usuario autenticado
- ✅ `GET /api/profile/student/registration` - Registros del estudiante
- ✅ `GET /api/profile/student/assignments` - Tareas asignadas
- ✅ `GET /api/profile/teacher/assignments` - Tareas del docente
- ✅ Validación JWT en headers Authorization
- ✅ CORS configurado para localhost

### Base de Datos
- ✅ Migraciones ejecutadas (`npx prisma migrate dev`)
- ✅ Schema Prisma sincronizado con PostgreSQL
- ✅ Tablas creadas: Users, Schools, Registrations, Payments, Assignments, AssignmentStudents
- ✅ Relaciones configuradas correctamente

---

## 📋 Próximos Pasos

### 1. Probar Frontend (Este PC, en otra terminal)
Abrir nueva terminal en el directorio raíz del proyecto:
```powershell
# Navegar a la raíz
cd "c:\Users\diego\Desktop\Para trabajo\Proyecto plataforma escolar"

# Abrir index.html en navegador (usa http://localhost:3000 para la API)
# O configurar un servidor estático
python -m http.server 8000  # Python 3
# O
npx http-server        # Node.js
```

Luego acceder a:
- `http://localhost:8000` (acceso al sitio)
- `http://localhost:4000/api` (acceso a la API)

### 2. Probar Dashboards Localmente
Los dashboards en `views/` y `public/` ya están configurados para consumir la API:

- **Admin Dashboard** (`scripts/admin.js`):
  - Carga datos de `/api/admin/*` endpoints
  - Requiere token de admin en localStorage
  
- **Student Dashboard** (`views/estudiante/dashboard.html`):
  - Carga perfil desde `/api/profile/me`
  - Carga registros desde `/api/profile/student/registration`
  - Carga tareas desde `/api/profile/student/assignments`
  
- **Teacher Dashboard** (`views/docente/dashboard.html`):
  - Carga tareas desde `/api/profile/teacher/assignments`

### 3. Verificar Todos los Endpoints
```powershell
# Con token de admin
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWowOWprcjkwMDAxZGs0NmFoNjJodHAyIiwicm9sZSI6IkFETUlOIiwiZW1haWwiOiJhZG1pbkBwbGF0YWZvcm1hLmVkdS5jbyIsImlhdCI6MTc2NTM4NzkzMSwiZXhwIjoxNzY1OTkyNzMxfQ.mmXvxUyXy1ZJEWtE115mduSoQks2FQnsNmHZtJNifG0"

# Obtener usuarios
Invoke-WebRequest -Uri "http://localhost:4000/api/users" -Headers @{"Authorization"="Bearer $adminToken"}

# Obtener registros
Invoke-WebRequest -Uri "http://localhost:4000/api/admin/registrations" -Headers @{"Authorization"="Bearer $adminToken"}

# Obtener asignaciones
Invoke-WebRequest -Uri "http://localhost:4000/api/assignments" -Headers @{"Authorization"="Bearer $adminToken"}
```

### 4. Probar Pagos (Stripe/Wompi) - Requiere Configuración
Actualmente los endpoints de pagos están pero:
- ✅ Stripe: Ya integrado con validación de firmas
- ✅ Wompi: Ya integrado con validación HMAC
- ❌ Sin claves reales (usar valores de prueba en .env)

Para probar:
```bash
cd api
npm run build
npm start
```

---

## 🔐 Variables de Entorno Actuales (`api/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/plataforma?schema=public"
JWT_SECRET="dev-secret-change-in-production-min-32-chars-long"
TOKEN_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_dev"
STRIPE_WEBHOOK_SECRET="whsec_dev"
WOMPI_PUBLIC_KEY="pub_test_dev"
WOMPI_PRIVATE_KEY="prv_test_dev"
WOMPI_WEBHOOK_SECRET="whsec_wompi_dev"
PORT=4000
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://localhost:8080"
PUBLIC_URL="http://localhost:4000"
FORCE_HTTPS=false
NODE_ENV=development
```

---

## 📁 Estructura de Archivos Importantes

```
api/
├── dist/              ✅ Código compilado (TypeScript -> JavaScript)
├── node_modules/      ✅ Dependencias instaladas
├── prisma/
│   ├── schema.prisma  ✅ Modelo de base de datos
│   ├── seed.js        ✅ Script para poblar datos
│   └── migrations/    ✅ Historial de cambios DB
├── src/
│   ├── app.ts         ✅ Configuración Express
│   ├── server.ts      ✅ Punto de entrada
│   ├── config/        ✅ Configuración (env, etc)
│   ├── routes/        ✅ Endpoints (auth, users, schools, etc)
│   ├── middlewares/   ✅ Auth, error handling
│   └── utils/         ✅ JWT, crypto, helpers
├── .env               ✅ Variables de entorno local
└── docker-compose.yml ✅ PostgreSQL en Docker
```

---

## 🚀 Verificación de Salud

```powershell
# Ver si Docker está corriendo
docker ps

# Verificar si PostgreSQL está activo
docker logs plataforma-postgres

# Ver si la API está escuchando
netstat -ano | findstr :4000

# Verificar base de datos
docker exec plataforma-postgres psql -U postgres -d plataforma -c "SELECT * FROM \"User\" LIMIT 5;"
```

---

## 📝 Notas Importantes

1. **El servidor API está corriendo en background** (terminal ID: 8fff0276-8a62-42b4-aef4-5f3ef06d87f7)
   - Para detenerlo: `Stop-Process -Id <PID>`
   - Para reiniciarlo: `npm start` desde `api/`

2. **PostgreSQL está en Docker**
   - Datos persisten en volumen `postgres_data`
   - Para detener: `docker-compose down`
   - Para reiniciar: `docker-compose up -d`

3. **Tokens JWT duran 7 días** en desarrollo
   - Cambiar en `.env`: `TOKEN_EXPIRES_IN`

4. **Todos los endpoints requieren Bearer token** excepto `/api/auth/login`

---

## ✨ Siguiente Paso Recomendado

**Probar el frontend localmente:**
1. Abrir nueva terminal PowerShell
2. Navegar a la raíz del proyecto
3. Correr un servidor HTTP (Python o Node)
4. Acceder a `http://localhost:<puerto>` e iniciar sesión con un usuario de prueba
5. Verificar que los dashboards carguen datos de la API

---

**Creado**: 10 de diciembre de 2025  
**Ambiente**: Desarrollo Local (Windows)  
**Estado**: ✅ TODO FUNCIONANDO
