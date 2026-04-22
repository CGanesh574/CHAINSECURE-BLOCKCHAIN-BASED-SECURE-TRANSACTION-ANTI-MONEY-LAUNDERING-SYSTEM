#!/usr/bin/env pwsh
# Start Frontend Server

Write-Host "Starting Frontend Server..." -ForegroundColor Green
Set-Location "C:\Users\Ganesh\OneDrive\Desktop\chainsecure\frontend"

$env:BROWSER = "none"
$env:PORT = "3000"

Write-Host "Running npm start..." -ForegroundColor Yellow
& npm start
