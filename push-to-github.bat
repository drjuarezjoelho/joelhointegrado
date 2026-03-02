@echo off
chcp 65001 >nul
echo ========================================
echo  Enviar projeto para o GitHub
echo  Repositório: drjuarezjoelho/joelhointegrado
echo ========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Git não encontrado. Instale em: https://git-scm.com/download/win
    echo Depois feche e abra o terminal de novo.
    pause
    exit /b 1
)

cd /d "%~dp0"

if not exist .git (
    echo Inicializando repositório...
    git init
)

git add .
git commit -m "Projeto C.I.J. - Centro Integrado de Joelho" 2>nul
if errorlevel 1 git commit -m "Atualização - C.I.J."
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/drjuarezjoelho/joelhointegrado.git
git branch -M main

echo.
echo Enviando para GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo Se pedir login: use seu usuário do GitHub e um Personal Access Token como senha.
    echo Token: GitHub - Settings - Developer settings - Personal access tokens
    pause
    exit /b 1
)

echo.
echo Concluído. Projeto em: https://github.com/drjuarezjoelho/joelhointegrado
pause
