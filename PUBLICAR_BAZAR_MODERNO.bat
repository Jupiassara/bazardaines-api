@echo off
chcp 65001 >nul
title Publicar Bazar da Ines

echo =====================================
echo        PUBLICAR BAZAR DA INES
echo =====================================
echo.

cd /d C:\Users\jupia\bazardaines-api

echo [1/4] Limpando arquivos temporarios...
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [2/4] Gerando produtos.json...
node gerar_produtos_json.cjs

if errorlevel 1 (
    echo.
    echo ERRO: produtos.json nao foi gerado.
    echo Publicacao cancelada.
    pause
    exit /b
)

echo.
echo Copiando produtos.json para public...
copy /Y produtos.json public\produtos.json >nul

if errorlevel 1 (
    echo.
    echo ERRO: nao conseguiu copiar produtos.json.
    pause
    exit /b
)

echo.
echo [3/4] Criando build do app...
call npm run build

if errorlevel 1 (
    echo.
    echo ERRO: build falhou.
    echo Publicacao cancelada.
    pause
    exit /b
)

echo.
echo [4/4] Publicando no Cloudflare...
call npx wrangler pages deploy dist --project-name=bazar-da-ines-app --commit-dirty=true

if errorlevel 1 (
    echo.
    echo ERRO: falhou ao publicar no Cloudflare.
    pause
    exit /b
)

echo.
echo =====================================
echo     PUBLICADO COM SUCESSO!
echo =====================================
echo.
pause