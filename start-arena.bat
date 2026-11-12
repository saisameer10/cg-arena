@echo off
rem Double-click to start the arena; close the "cg-arena server" window to stop it.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed: https://nodejs.org & pause & exit /b 1)
start "cg-arena server" cmd /k node server\index.js
timeout /t 2 /nobreak >nul
start "" http://localhost:3000
