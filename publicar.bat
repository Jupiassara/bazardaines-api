@echo off
echo ===============================
echo ATUALIZANDO BAZAR DA INES
echo ===============================

cd /d C:\Users\jupia\bazardaines-api
echo.
echo Iniciando servidor da API...
start "API BAZAR" cmd /k node server.cjs

echo Aguardando servidor iniciar...
timeout /t 5 >nul
echo.
echo 1 - Limpando arquivos temporarios...
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 2 - Gerando produtos.json...
node gerar_produtos_json.cjs

if not exist produtos.json (
    echo.
    echo ERRO: produtos.json nao foi criado.
    echo PUBLICACAO CANCELADA.
    pause
    exit /b
)

findstr /C:"codigo" produtos.json >nul

if errorlevel 1 (
    echo.
    echo ERRO: produtos.json parece estar vazio ou invalido.
    echo PUBLICACAO CANCELADA.
    pause
    exit /b
)
echo.
echo 2.1 - Copiando produtos.json para public...
copy /Y produtos.json public\produtos.json

if errorlevel 1 (
    echo.
    echo ERRO ao copiar produtos.json para public.
    pause
    exit /b
)

echo.
echo 3 - Build do app...
call npm run build

if errorlevel 1 (
    echo.
    echo ERRO critico no build. O deploy foi cancelado.
    pause
    exit /b
)

echo.
echo 4 - Publicando no Cloudflare...
call npx wrangler pages deploy dist --project-name=bazar-da-ines-app --commit-dirty=true

if errorlevel 1 (
    echo.
    echo ERRO ao publicar no Cloudflare.
    pause
    exit /b
)

echo.
echo ===============================
echo PUBLICADO COM SUCESSO!
echo ===============================
pause