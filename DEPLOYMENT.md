# 🚀 Guía de Despliegue

Instrucciones para desplegar Plataforma Escolar en diferentes entornos.

## 📋 Requisitos Previos

### Para Producción
- Docker & Docker Compose
- PostgreSQL 15+
- Node.js 18+ (si no usas Docker)
- Cuenta de Stripe
- Dominio propio
- SSL Certificate
- Servidor (AWS, Azure, DigitalOcean, etc.)

---

## 🐳 Despliegue con Docker

### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### 2. Clonar Repositorio

```bash
cd /var/www
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar
```

### 3. Configurar Variables de Entorno

```bash
# Copiar plantilla
cp api/.env.example api/.env

# Editar con valores de producción
sudo nano api/.env
```

**Variables críticas:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/plataforma_escolar
JWT_SECRET=generar-con-openssl-rand-hex-32
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Generar Secretos Seguros

```bash
# Generar JWT secret
openssl rand -hex 32

# Generar otro secret para refresh token
openssl rand -hex 32
```

### 5. Iniciar Servicios

```bash
# Iniciar en background
docker-compose up -d

# Verificar contenedores
docker-compose ps

# Ver logs
docker-compose logs -f

# Inicializar BD
docker exec plataforma-escolar-api npm run prisma:migrate
docker exec plataforma-escolar-api npm run prisma:seed
```

### 6. Configurar Nginx como Proxy Reverso

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/plataforma-escolar
```

```nginx
upstream api_backend {
    server localhost:5000;
}

upstream app_frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Seguridad SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        proxy_pass http://app_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
}
```

### 7. Habilitar Sitio

```bash
sudo ln -s /etc/nginx/sites-available/plataforma-escolar /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 8. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot certonly --nginx -d tu-dominio.com -d www.tu-dominio.com
```

---

## ☁️ Despliegue en AWS

### Usando EC2 + RDS

1. **Crear instancia EC2**
   - Ubuntu 22.04 LTS
   - t3.small (mínimo)
   - 20GB almacenamiento

2. **Crear base de datos RDS**
   - PostgreSQL 15
   - db.t3.micro
   - Multi-AZ para producción

3. **Security Groups**
   - EC2: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - RDS: 5432 (PostgreSQL) desde EC2

4. **Configurar y Desplegar**
   ```bash
   # Conectar por SSH
   ssh -i your-key.pem ec2-user@your-instance-ip

   # Seguir instrucciones de despliegue Docker
   ```

---

## 🔄 CI/CD con GitHub Actions

Crear archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/plataforma-escolar
            git pull origin main
            docker-compose build
            docker-compose up -d
            docker exec plataforma-escolar-api npm run prisma:migrate
```

---

## 📊 Monitoreo y Mantenimiento

### Health Check

```bash
# Verificar servicio
curl -s http://localhost:5000/health

# Ver logs en tiempo real
docker-compose logs -f api
```

### Backups

```bash
# Backup automático diario
0 2 * * * pg_dump -h localhost -U user -d plataforma_escolar > /backups/db-$(date +\%Y\%m\%d).sql
```

### Actualizaciones

```bash
# Actualizar código
git pull origin main

# Reconstruir imágenes
docker-compose build

# Reiniciar servicios (sin downtime)
docker-compose up -d
```

---

## 🔒 Checklist de Seguridad Producción

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET cambiado
- [ ] CORS restringido a dominio específico
- [ ] HTTPS habilitado
- [ ] Rate limiting activado
- [ ] Logs configurados
- [ ] Backups automáticos
- [ ] Monitoreo habilitado
- [ ] Firewall configurado
- [ ] Actualizaciones de seguridad aplicadas

---

## 🆘 Troubleshooting

### Puerto ya en uso

```bash
# Encontrar proceso usando puerto 5000
lsof -i :5000

# Matar proceso
kill -9 <PID>
```

### Base de datos no conecta

```bash
# Verificar contenedor postgres
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### Out of Memory

```bash
# Ver uso de memoria
docker stats

# Aumentar límites en docker-compose.yml
```

---

## 📈 Performance Optimization

### Caching
- Redis para sesiones
- CDN para assets estáticos
- Caché HTTP en navegador

### Base de Datos
- Índices en queries frecuentes
- Paginación de listados
- Connection pooling

### Aplicación
- Gzip compression
- Code splitting
- Lazy loading

---

Para soporte en despliegue, contacta: support@plataformaescolar.com
