# Tulumbak Port Manager
# Bu script port yönetimini kolaylaştırır

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("check", "kill", "start", "status")]
    [string]$Action = "status"
)

# Proje portları
$PORTS = @{
    API = 3001
    ADMIN = 3002
    STORE = 3003
}

function Show-Status {
    Write-Host "Port Durumu Kontrol Ediliyor..." -ForegroundColor Cyan
    
    foreach ($service in $PORTS.Keys) {
        $port = $PORTS[$service]
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($processes) {
            $processId = $processes[0].OwningProcess
            $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
            Write-Host "Port $port ($service): KULLANIMDA - PID: $processId ($processName)" -ForegroundColor Red
        } else {
            Write-Host "Port $port ($service): BOS" -ForegroundColor Green
        }
    }
}

function Kill-Ports {
    Write-Host "Tum proje portlari kapatiliyor..." -ForegroundColor Yellow
    
    foreach ($service in $PORTS.Keys) {
        $port = $PORTS[$service]
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($processes) {
            $processId = $processes[0].OwningProcess
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "Port $port ($service) kapatildi - PID: $processId" -ForegroundColor Green
            } catch {
                Write-Host "Port $port ($service) kapatilamadi - PID: $processId" -ForegroundColor Red
            }
        } else {
            Write-Host "Port $port ($service) zaten bos" -ForegroundColor Blue
        }
    }
}

function Start-Dev {
    Write-Host "Gelistirme ortami baslatiliyor..." -ForegroundColor Cyan
    
    # Önce tüm portları temizle
    Kill-Ports
    
    # API'yi baslat
    Write-Host "API baslatiliyor (Port 3001)..." -ForegroundColor Yellow
    Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory "apps/api" -WindowStyle Minimized
    
    # 3 saniye bekle
    Start-Sleep -Seconds 3
    
    # Admin Dashboard'i baslat
    Write-Host "Admin Dashboard baslatiliyor (Port 3002)..." -ForegroundColor Yellow
    Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory "apps/admin-dashboard" -WindowStyle Minimized
    
    # 3 saniye bekle
    Start-Sleep -Seconds 3
    
    # Store'u baslat
    Write-Host "Store baslatiliyor (Port 3003)..." -ForegroundColor Yellow
    Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory "apps/store" -WindowStyle Minimized
    
    Write-Host "Tum servisler baslatildi!" -ForegroundColor Green
    Write-Host "Store: http://localhost:3003" -ForegroundColor Cyan
    Write-Host "Admin: http://localhost:3002" -ForegroundColor Cyan
    Write-Host "API: http://localhost:3001" -ForegroundColor Cyan
}

function Check-Ports {
    Show-Status
}

# Ana işlem
switch ($Action) {
    "check" { Check-Ports }
    "kill" { Kill-Ports }
    "start" { Start-Dev }
    "status" { Show-Status }
    default { Show-Status }
}
