# 🚀 Guía de Pruebas Locales - Plataforma Escolar

## Estado Actual

✅ **API Backend**: Corriendo en `http://localhost:4000`  
✅ **PostgreSQL**: Corriendo en Docker (`localhost:5432`)  
✅ **Frontend Estático**: Disponible en `http://localhost:8000`  
✅ **Datos de Prueba**: Cargados en la base de datos

---

## 📋 URLs Disponibles

| Recurso | URL | Descripción |
|---------|-----|-------------|
| **API** | `http://localhost:4000/api` | Backend (requiere tokens JWT) |
| **Frontend** | `http://localhost:8000` | Sitio web estático |
| **Inicio de Sesión** | `http://localhost:8000/index.html` | Login con usuario de prueba |
| **Registro Estudiante** | `http://localhost:8000/public/registro-estudiante.html` | Formulario de registro |

---

## 👤 Usuarios de Prueba

### Admin
- **Email**: `admin@plataforma.edu.co`
- **Contraseña**: `admin123`
- **Rol**: ADMIN
- **Acceso**: Panel de administración

### Docente
- **Email**: `docente@plataforma.edu.co`
- **Contraseña**: `docente123`
- **Rol**: TEACHER
- **Acceso**: Dashboard de docente (ver asignaciones)

### Estudiante
- **Email**: `estudiante@plataforma.edu.co`
- **Contraseña**: `estudiante123`
- **Rol**: STUDENT
- **Acceso**: Dashboard de estudiante (ver tareas y registros)

---

## 🧪 Pruebas Paso a Paso

### 1️⃣ Probar Login en el Frontend

1. Abre el navegador: `http://localhost:8000`
2. Ingresa credenciales:
   - Email: `admin@plataforma.edu.co`
   - Contraseña: `admin123`
3. Haz clic en "Ingresar"

**Resultado esperado**:
- Recibis un JWT token
- Se guarda en `localStorage` como `currentUser.token`
- Se redirige al dashboard

### 2️⃣ Verificar el Dashboard del Admin

1. Luego del login, deberías ver:
   - Lista de registros de estudiantes
   - Botones para aprobar/rechazar registraciones
   - Opción de crear usuarios
   - Panel de administración general

**Si no funciona**:
- Abre DevTools (`F12`)
- Verifica la consola (Console tab)
- Revisa que en Network vea llamadas a `/api/admin/registrations`

### 3️⃣ Probar Login como Estudiante

1. Cierra sesión (abre DevTools y ejecuta):
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. Login nuevamente con:
   - Email: `estudiante@plataforma.edu.co`
   - Contraseña: `estudiante123`

3. Deberías ver:
   - Dashboard de estudiante
   - Datos personales
   - Tareas asignadas
   - Información de registro

### 4️⃣ Probar Login como Docente

1. Repite el proceso anterior con:
   - Email: `docente@plataforma.edu.co`
   - Contraseña: `docente123`

2. Deberías ver:
   - Dashboard de docente
   - Asignaciones que ha creado
   - Estudiantes asignados

---

## 🔌 Pruebas de API con PowerShell

### Login y obtener token

```powershell
$body = @{
    email = "admin@plataforma.edu.co"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType 'application/json'

$response.Content | ConvertFrom-Json
```

**Respuesta esperada**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Administrador",
    "email": "admin@plataforma.edu.co",
    "role": "ADMIN"
  }
}
```

### Obtener escuelas

```powershell
$token = "TOKEN_AQUI"

Invoke-WebRequest -Uri "http://localhost:4000/api/schools" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"} | `
  Select-Object -ExpandProperty Content | `
  ConvertFrom-Json
```

### Obtener usuarios

```powershell
$token = "TOKEN_AQUI"

Invoke-WebRequest -Uri "http://localhost:4000/api/users" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"} | `
  Select-Object -ExpandProperty Content | `
  ConvertFrom-Json
```

### Obtener registros de estudiantes

```powershell
$token = "TOKEN_AQUI"

Invoke-WebRequest -Uri "http://localhost:4000/api/admin/registrations" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"} | `
  Select-Object -ExpandProperty Content | `
  ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Crear un nuevo usuario

```powershell
$token = "TOKEN_AQUI"

$newUser = @{
    name = "Nuevo Docente"
    email = "nuevodocente@ejemplo.com"
    password = "password123"
    role = "TEACHER"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/users" `
  -Method POST `
  -Body $newUser `
  -Headers @{"Authorization" = "Bearer $token"} `
  -ContentType 'application/json' | `
  Select-Object -ExpandProperty Content
```

---

## 🐛 Solucionar Problemas

### Error: "API no responde" o CORS error

**Causa**: Es posible que la API se haya detenido

**Solución**:
```powershell
# En terminal nueva:
cd "c:\Users\diego\Desktop\Para trabajo\Proyecto plataforma escolar\api"
npm start
```

### Error: "Database connection failed"

**Causa**: PostgreSQL no está corriendo

**Solución**:
```powershell
# Verificar que Docker está activo
docker ps

# Si no aparece plataforma-postgres, iniciar Docker Compose:
cd "c:\Users\Diego\Desktop\Para trabajo\Proyecto plataforma escolar"
docker-compose up -d
```

### Error: "Invalid token" o token expirado

**Causa**: El JWT expiró o no es válido

**Solución**:
1. Haz login nuevamente en el frontend para obtener un nuevo token
2. O ejecuta el comando de login en PowerShell y copia el token nuevo

### Frontend no actualiza datos

**Causa**: Posiblemente caché del navegador

**Solución**:
```javascript
// En DevTools Console:
localStorage.clear();
location.reload();
```

---

## 📊 Verificar Estado de Servicios

### Verificar API

```powershell
Test-NetConnection -ComputerName localhost -Port 4000
```

**Resultado esperado**: `TcpTestSucceeded : True`

### Verificar PostgreSQL

```powershell
docker ps | Select-String "postgres"
```

**Resultado esperado**: Debería mostrar el contenedor `plataforma-postgres`

### Verificar Frontend

```powershell
Test-NetConnection -ComputerName localhost -Port 8000
```

**Resultado esperado**: `TcpTestSucceeded : True`

---

## 🎯 Checklist de Verificación

- [ ] API responde en `http://localhost:4000/api/auth/login`
- [ ] PostgreSQL está activo (`docker ps`)
- [ ] Frontend carga en `http://localhost:8000`
- [ ] Login funciona con admin
- [ ] Dashboard de admin carga datos
- [ ] Login funciona con estudiante
- [ ] Dashboard de estudiante carga datos
- [ ] Login funciona con docente
- [ ] Dashboard de docente carga datos
- [ ] Tokens JWT se guardan en localStorage
- [ ] Network tab muestra llamadas a `/api/*`

---

## 🔄 Reiniciar Todo

Si algo se queda colgado o hay errores persistentes:

```powershell
# 1. Detener API (si está corriendo)
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# 2. Detener servidor HTTP (si está corriendo)
Stop-Process -Name python -Force -ErrorAction SilentlyContinue

# 3. Detener y reiniciar PostgreSQL
docker-compose down
docker-compose up -d

# 4. Esperar 3 segundos
Start-Sleep -Seconds 3

# 5. Compilar y correr API
cd "c:\Users\diego\Desktop\Para trabajo\Proyecto plataforma escolar\api"
npm run build
npm start

# 6. En otra terminal, correr frontend
cd "c:\Users\diego\Desktop\Para trabajo\Proyecto plataforma escolar"
python -m http.server 8000
```

---

## 📚 Documentación Relacionada

- `ESTADO_LOCAL.md` - Estado actual del proyecto
- `DEPLOY.md` - Guía para desplegar a producción
- `README.md` - Información general del proyecto
- `api/README.md` - Documentación de la API

---

**Última actualización**: 10 de diciembre de 2025  
**Ambiente**: Desarrollo Local (Windows)
