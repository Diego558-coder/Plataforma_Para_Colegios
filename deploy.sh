#!/bin/bash

echo "🚀 Iniciando despliegue de Plataforma Escolar..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar .env
if [ ! -f "api/.env" ]; then
    echo -e "${RED}❌ Error: api/.env no existe${NC}"
    echo "Copia api/.env.example a api/.env y configúralo"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env encontrado"

# Verificar variables críticas
source api/.env
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "change-me" ]; then
    echo -e "${RED}❌ Error: JWT_SECRET no configurado o es débil${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no configurado${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Variables de entorno validadas"

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
cd api
npm install

# Generar cliente Prisma
echo -e "${YELLOW}🔨 Generando cliente Prisma...${NC}"
npx prisma generate

# Ejecutar migraciones
echo -e "${YELLOW}📊 Ejecutando migraciones...${NC}"
npx prisma migrate deploy

# Seed (solo si no existe data)
echo -e "${YELLOW}🌱 Verificando datos iniciales...${NC}"
npx prisma db seed || echo "Seed ya ejecutado o falló (ignorar si ya hay datos)"

# Build
echo -e "${YELLOW}🔨 Compilando TypeScript...${NC}"
npm run build

# Test rápido
echo -e "${YELLOW}🧪 Verificando compilación...${NC}"
if [ ! -f "dist/server.js" ]; then
    echo -e "${RED}❌ Error: Build falló${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build exitoso"

echo ""
echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo ""
echo "Para iniciar el servidor:"
echo "  cd api && npm start"
echo ""
echo "O con PM2:"
echo "  pm2 start api/dist/server.js --name plataforma-api"
echo ""
echo "Endpoints disponibles:"
echo "  http://localhost:4000/api/schools"
echo "  http://localhost:4000/api/auth/login"
