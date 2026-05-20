@echo off
echo ===============================
echo ATUALIZANDO BAZAR DA INES
echo ===============================

cd /d C:\Users\jupia\bazardaines-api

echo.
echo 1 - Limpando arquivos temporarios...
:: Apaga a pasta dist e a pasta de cache do vite/react para garantir um build limpo
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 2 - Gerando produtos.json...
node gerar_produtos_json.cjs

if errorlevel 1 (
    echo ERRO ao gerar produtos.json - usando versao antiga
) else (
    copy /Y produtos.json public\produtos.json
)

echo.
echo 3 - Build do app (Criando versao nova)...
call npm run build

if errorlevel 1 (
    echo ERRO critico no build. O deploy foi cancelado.
    pause
    exit /b
)

echo.
echo 4 - Aplicando Cache Busting (Para iPhone/Safari)...
:: Este comando agora procura qualquer arquivo .js dentro da pasta dist e gera um numero novo
powershell -Command "$val = Get-Random; Get-ChildItem dist\*.html | ForEach-Object { (Get-Content $_.FullName) -replace '(\.js\?v=|\.js\?|\.js)''', ('.js?v=' + $val + '''') | Set-Content $_.FullName }"

echo.
echo 5 - Publicando no Cloudflare...
call npx wrangler pages deploy dist --project-name bazar-da-ines-app --commit-dirty=true

echo.
echo ===============================
echo PUBLICADO COM SUCESSO!
echo ===============================
pause