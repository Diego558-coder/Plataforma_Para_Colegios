# Quick Start Guide

Comienza con Plataforma Escolar en 5 minutos.

## Con Docker

```bash
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar
docker-compose up -d
docker exec plataforma-escolar-api npm run prisma:seed
```

Accede a:
- Frontend: http://localhost:3000
- API: http://localhost:5000

## Instalación Manual

```bash
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar
npm run install-all

cp api/.env.example api/.env
# Edita api/.env con tus valores

cd api
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@plataforma.edu | admin123 |
| Docente | teacher@plataforma.edu | teacher123 |
| Estudiante | student@plataforma.edu | student123 |

## Comandos Útiles

```bash
npm run dev          # Iniciar en desarrollo
npm run migrate      # Ejecutar migraciones
npm run seed         # Cargar datos de prueba
npm run docker-up    # Iniciar Docker
npm run docker-down  # Detener Docker
```

## Archivos Importantes

- README.md - Documentación principal
- ARCHITECTURE.md - Explicación técnica
- API_DOCS.md - Referencia de endpoints
- DEPLOYMENT.md - Despliegue en producción

## Troubleshooting

Si tienes problemas:
- Verifica que PostgreSQL esté corriendo
- Revisa que los puertos 3000 y 5000 estén libres
- Consulta DEPLOYMENT.md para más ayuda

Más información en [README.md](./README.md)

