# Despliegue de Plataforma Escolar
# PowerShell Script

Write-Host "🚀 Iniciando despliegue de Plataforma Escolar..." -ForegroundColor Cyan

# Verificar .env
if (-not (Test-Path "api\.env")) {
    Write-Host "❌ Error: api\.env no existe" -ForegroundColor Red
    Write-Host "Copia api\.env.example a api\.env y configúralo"
    exit 1
}

Write-Host "✓ .env encontrado" -ForegroundColor Green

# Leer variables críticas
$envContent = Get-Content "api\.env" -Raw
if ($envContent -notmatch 'JWT_SECRET=".{32,}"') {
    Write-Host "❌ Error: JWT_SECRET no configurado o es débil (min 32 chars)" -ForegroundColor Red
    exit 1
}

if ($envContent -notmatch 'DATABASE_URL=') {
    Write-Host "❌ Error: DATABASE_URL no configurado" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Variables de entorno validadas" -ForegroundColor Green

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
Set-Location api
npm install

# Generar cliente Prisma
Write-Host "🔨 Generando cliente Prisma..." -ForegroundColor Yellow
npx prisma generate

# Ejecutar migraciones
Write-Host "📊 Ejecutando migraciones..." -ForegroundColor Yellow
npx prisma migrate deploy

# Seed
Write-Host "🌱 Verificando datos iniciales..." -ForegroundColor Yellow
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seed falló o ya ejecutado (ignorar si ya hay datos)" -ForegroundColor Yellow
}

# Build
Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Yellow
npm run build

# Verificar build
if (-not (Test-Path "dist\server.js")) {
    Write-Host "❌ Error: Build falló" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build exitoso" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor:"
Write-Host "  cd api; npm start"
Write-Host ""
Write-Host "O con PM2:"
Write-Host "  pm2 start api\dist\server.js --name plataforma-api"
Write-Host ""
Write-Host "Endpoints disponibles:"
Write-Host "  http://localhost:4000/api/schools"
Write-Host "  http://localhost:4000/api/auth/login"
