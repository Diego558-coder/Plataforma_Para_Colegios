# Script para iniciar/detener/reiniciar todos los servicios locales
# Uso: .\manage-services.ps1 -Action start|stop|restart|status

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action
)

$RootPath = "c:\Users\diego\Desktop\Para trabajo\Proyecto plataforma escolar"
$ApiPath = "$RootPath\api"

function Write-Header {
    param([string]$Text)
    Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $Text$("`t" * ([Math]::Max(0, (37 - $Text.Length) / 4)))║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor Yellow
}

function Start-Services {
    Write-Header "INICIANDO SERVICIOS"
    
    # Detener procesos previos si existen
    Write-Info "Deteniendo procesos previos..."
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Stop-Process -Name python -Force -ErrorAction SilentlyContinue
    
    # Iniciar PostgreSQL
    Write-Info "Iniciando PostgreSQL en Docker..."
    Set-Location $RootPath
    docker-compose up -d
    Start-Sleep -Seconds 3
    
    if (docker ps | Select-String "plataforma-postgres") {
        Write-Success "PostgreSQL iniciado"
    } else {
        Write-Error "PostgreSQL no inició correctamente"
        return
    }
    
    # Compilar y iniciar API
    Write-Info "Compilando y iniciando API..."
    Set-Location $ApiPath
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "API compilada"
        
        # Iniciar API en background (nuevo proceso)
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ApiPath'; npm start" -WindowStyle Normal
        Write-Success "API iniciada (nueva ventana)"
        Start-Sleep -Seconds 2
    } else {
        Write-Error "Error compilando API"
        return
    }
    
    # Iniciar Frontend
    Write-Info "Iniciando Frontend en Puerto 8000..."
    Set-Location $RootPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; python -m http.server 8000" -WindowStyle Normal
    Write-Success "Frontend iniciado (nueva ventana)"
    
    Write-Header "SERVICIOS INICIADOS ✨"
    Write-Info "API: http://localhost:4000"
    Write-Info "Frontend: http://localhost:8000"
    Write-Info "PostgreSQL: localhost:5432"
}

function Stop-Services {
    Write-Header "DETENIENDO SERVICIOS"
    
    Write-Info "Deteniendo Node.js (API)..."
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    
    Write-Info "Deteniendo Python (Frontend)..."
    Stop-Process -Name python -Force -ErrorAction SilentlyContinue
    
    Write-Info "Deteniendo PostgreSQL..."
    Set-Location $RootPath
    docker-compose down
    
    Write-Success "Todos los servicios detenidos"
}

function Restart-Services {
    Stop-Services
    Start-Sleep -Seconds 2
    Start-Services
}

function Show-Status {
    Write-Header "ESTADO DE SERVICIOS"
    
    # Node.js
    $nodeProcess = Get-Process node -ErrorAction SilentlyContinue
    if ($nodeProcess) {
        Write-Success "Node.js (API) - CORRIENDO (PID: $($nodeProcess.Id))"
    } else {
        Write-Error "Node.js (API) - DETENIDO"
    }
    
    # Python
    $pythonProcess = Get-Process python -ErrorAction SilentlyContinue
    if ($pythonProcess) {
        Write-Success "Python (Frontend) - CORRIENDO (PID: $($pythonProcess.Id))"
    } else {
        Write-Error "Python (Frontend) - DETENIDO"
    }
    
    # Docker Postgres
    Write-Info "Contenedores Docker:"
    docker ps --filter "name=plataforma" --format "{{.Names}}: {{.Status}}"
    
    Write-Info "Puertos en uso:"
    netstat -ano | findstr "4000\|8000\|5432" | ForEach-Object { Write-Info $_ }
}

# Ejecutar acción
switch ($Action) {
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "status" { Show-Status }
}

Write-Host "`n" -NoNewline
