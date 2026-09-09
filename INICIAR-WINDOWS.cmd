@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale Node.js 24.15 ou superior e execute novamente.
  pause
  exit /b 1
)
echo Abrindo Stage Music em http://127.0.0.1:4173
start "" "http://127.0.0.1:4173"
node scripts/serve.mjs
pause
