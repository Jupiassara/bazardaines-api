@echo off
echo ===============================
echo ATUALIZANDO BAZAR DA INES
echo ===============================

cd /d C:\Users\jupia\bazardaines-api

echo.
echo Testando servidor local...

curl -s http://localhost:3000/produtos >nul

if %errorlevel%==0 (
    echo Servidor respondendo.
) else (
    echo Ligando servidor...
    start cmd /k node server.cjs
    timeout /t 10 >nul
)

echo.
echo 1 - Gerando produtos.json...
node gerar_produtos_json.cjs

if errorlevel 1 (
    echo ERRO ao gerar produtos.json
    pause
    exit /b
)

echo.
echo 2 - Copiando para public...
copy /Y produtos.json public\produtos.json

if errorlevel 1 (
    echo ERRO ao copiar para public.
    pause
    exit /b
)

echo.
echo Limpando dist antigo...
if exist dist rmdir /s /q dist

echo.
echo 3 - Build do app...
npm run build

if errorlevel 1 (
    echo ERRO no build.
    pause
    exit /b
)

echo.
echo 4 - Publicando no Cloudflare...
npx wrangler pages deploy dist --project-name bazar-da-ines-app --commit-dirty=true

if errorlevel 1 (
    echo ERRO na publicacao.
    pause
    exit /b
)

echo.
echo ===============================
echo PUBLICADO COM SUCESSO!
echo ===============================

pause