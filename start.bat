@echo off
REM Atalho para iniciar o Central de Compras em modo dev
cd /d "%~dp0"
start "" http://localhost:5173
pnpm dev
