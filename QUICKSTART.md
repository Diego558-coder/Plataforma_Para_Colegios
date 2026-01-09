# 📖 Guía Rápida de Inicio

Comienza a usar Plataforma Escolar en 5 minutos.

## ⚡ Inicio Rápido

### Con Docker (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar

# 2. Iniciar servicios
docker-compose up -d

# 3. Listo! Accede a:
# - Frontend: http://localhost:3000
# - API: http://localhost:5000
# - Base de datos: postgres://localhost:5432
```

### Instalación Manual

```bash
# 1. Clonar repositorio
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar

# 2. Instalar dependencias
npm run install-all

# 3. Configurar variables de entorno
cp api/.env.example api/.env
# Editar api/.env con tus configuraciones

# 4. Migraciones de BD
cd api
npm run prisma:migrate

# 5. Datos de prueba
npm run prisma:seed

# 6. Iniciar servidor
npm run dev

# 7. En otra terminal, abrir frontend
# Abrir http://localhost:3000 en navegador
```

## 👤 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@plataforma.edu | admin123 |
| Docente | teacher@plataforma.edu | teacher123 |
| Estudiante | student@plataforma.edu | student123 |

## 📁 Archivos Importantes

```
plataforma-escolar/
├── README.md                # Documentación principal
├── CONTRIBUTING.md          # Guía de contribución
├── ARCHITECTURE.md          # Arquitectura del sistema
├── .env.example             # Plantilla de variables
├── docker-compose.yml       # Configuración Docker
├── package.json             # Dependencias
└── api/                     # Backend
    ├── src/
    ├── prisma/
    └── package.json
```

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor en modo desarrollo

# Base de datos
npm run migrate          # Ejecutar migraciones
npm run seed             # Cargar datos de prueba

# Código
npm run lint             # Verificar estilo
npm run format           # Formatear código

# Testing
npm run test             # Ejecutar tests

# Docker
npm run docker-up        # Iniciar servicios
npm run docker-down      # Detener servicios
npm run docker-logs      # Ver logs
```

## 🔧 Configuración Básica

Edita `api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/plataforma_escolar
JWT_SECRET=tu-secreto-super-seguro
STRIPE_SECRET_KEY=sk_test_...
```

## 📚 Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/admin` | Panel de administrador |
| `/docente` | Panel de docente |
| `/estudiante` | Panel de estudiante |
| `/api` | API REST |

## 🆘 Troubleshooting

### Error de conexión a BD

```bash
# Verificar que PostgreSQL está corriendo
# En Docker:
docker-compose ps

# Revisar logs:
docker-compose logs postgres
```

### Puerto en uso

```bash
# Cambiar puerto en .env
PORT=5001
```

### Módulos no encontrados

```bash
# Reinstalar dependencias
rm -rf api/node_modules
npm run install-all
```

## 📖 Más Información

- [Documentación Completa](./README.md)
- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Guía de Contribución](./CONTRIBUTING.md)
- [API REST](./README.md#-api-rest)

---

¿Problemas? [Abre un issue](https://github.com/Diego558-coder/plataforma-escolar/issues)
