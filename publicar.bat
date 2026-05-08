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
    echo ERRO ao gerar produtos.json - usando versao antiga
    if not exist public\produtos.json (
        echo Nao tem produtos.json antigo. Abortando.
        pause
        exit /b
    )
    echo Continuando com produtos.json antigo...
)

echo.
echo 2 - Copiando para public...
copy /Y produtos.json public\produtos.json

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
echo 3.5 - Forcando versionamento anti-cache iPhone...
powershell -Command "(gc dist\index.html) -replace 'main.tsx\?v=\d+', 'main.tsx?v=%random%' | Out-File -encoding utf8 dist\index.html"
powershell -Command "(gc dist\index.html) -replace 'versao-bazar\" content=\"[^\"]+\"', 'versao-bazar\" content=\"iphone-v%random%\"' | Out-File -encoding utf8 dist\index.html"

if errorlevel 1 (
    echo ERRO ao aplicar cache bust.
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