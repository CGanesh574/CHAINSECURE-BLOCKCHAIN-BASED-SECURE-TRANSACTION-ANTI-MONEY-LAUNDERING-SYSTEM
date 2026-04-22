@echo off
echo Starting ChainSecure Servers...
echo.

echo Starting Backend Server...
start "ChainSecure Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3

echo Starting Frontend Server...
start "ChainSecure Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
