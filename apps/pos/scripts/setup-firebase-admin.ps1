# Copies Firebase service account JSON into project root for local password reset.
# Usage:
#   npm run firebase:setup-admin
#   npm run firebase:setup-admin -- "C:\Users\You\Downloads\fir-app-79c12-firebase-adminsdk-abc.json"

param(
  [Parameter(Mandatory = $false)]
  [string]$JsonPath
)

$root = Split-Path $PSScriptRoot -Parent
$dest = Join-Path $root "firebase-service-account.json"

function Find-DownloadedKey {
  $downloads = Join-Path $env:USERPROFILE "Downloads"
  if (-not (Test-Path $downloads)) { return $null }
  $found = Get-ChildItem -Path $downloads -Filter "*firebase*adminsdk*.json" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending
  if ($found) { return $found[0].FullName }
  return $null
}

function Test-LooksLikeJsonPath([string]$p) {
  if ([string]::IsNullOrWhiteSpace($p)) { return $false }
  $t = $p.Trim().Trim('"')
  return ($t -match '\.json$') -or (Test-Path $t)
}

Write-Host ""
Write-Host "=== QuickPOS Firebase Admin setup ===" -ForegroundColor Cyan
Write-Host "You need the JSON file from Firebase Console (NOT a .js file)."
Write-Host "Download: Project settings -> Service accounts -> Generate new private key"
Write-Host ""

if (Test-Path $dest) {
  Write-Host "Already exists: $dest" -ForegroundColor Yellow
  $overwrite = Read-Host "Overwrite? (y/N)"
  if ($overwrite -notmatch '^[yY]') {
    Write-Host "Keeping existing file. Run: npm run firebase:check-admin" -ForegroundColor Green
    exit 0
  }
}

if (-not $JsonPath) {
  $auto = Find-DownloadedKey
  if ($auto) {
    Write-Host "Found in Downloads: $auto" -ForegroundColor Green
    $use = Read-Host "Use this file? (Y/n)"
    if ($use -eq "" -or $use -match '^[yY]') {
      $JsonPath = $auto
    }
  }
}

if (-not $JsonPath) {
  Write-Host "Paste the FULL path to the downloaded .json file (example below):" -ForegroundColor Yellow
  Write-Host '  C:\Users\YourName\Downloads\fir-app-79c12-firebase-adminsdk-xxxxx.json'
  Write-Host 'Tip: In Explorer, right-click the file -> Copy as path'
  Write-Host ""
  $JsonPath = Read-Host "Path"
}

$JsonPath = $JsonPath.Trim().Trim('"')

if (-not (Test-LooksLikeJsonPath $JsonPath)) {
  Write-Host ""
  Write-Host "That does not look like a JSON file path." -ForegroundColor Red
  Write-Host "You entered: $JsonPath"
  Write-Host ""
  Write-Host "Common mistakes:" -ForegroundColor Yellow
  Write-Host '  - Typing npm run dev here (command, not a file path)'
  Write-Host '  - Using .js instead of .json from Firebase'
  Write-Host '  - Pasting only filename without folder'
  Write-Host ""
  $retry = Find-DownloadedKey
  if ($retry) {
    Write-Host "Try this path instead:" -ForegroundColor Green
    Write-Host $retry
    $JsonPath = $retry
  } else {
    exit 1
  }
}

if (-not (Test-Path $JsonPath)) {
  Write-Host "File not found: $JsonPath" -ForegroundColor Red
  Write-Host "Open Downloads and confirm the file ends with .json"
  exit 1
}

Copy-Item -Force $JsonPath $dest
Write-Host ""
Write-Host "OK - copied to:" -ForegroundColor Green
Write-Host "  $dest"
Write-Host ""

$envLocal = Join-Path $root ".env.local"
$line = "FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json"
if (Test-Path $envLocal) {
  $content = Get-Content $envLocal -Raw
  if ($content -notmatch "FIREBASE_SERVICE_ACCOUNT") {
    Add-Content $envLocal "`n$line"
  }
} else {
  Set-Content $envLocal $line
}

Write-Host "Next commands:" -ForegroundColor Cyan
Write-Host '  npm run firebase:check-admin'
Write-Host '  npm run dev'
