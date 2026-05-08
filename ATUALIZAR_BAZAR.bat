@echo off
echo Atualizando estoque do Bazar da Ines...

:: 1. Comando para seu PDV exportar os dados (Exemplo genérico)
:: Se o seu PDV gera um CSV, coloque o comando aqui.
:: c:\seupdv\exportar_estoque.exe --output=produtos.csv

:: 2. Se você usa um script Python ou Node para converter o CSV para produtos.json
:: node converter_estoque.js

:: 3. Enviar para o GitHub automaticamente
git add produtos.json
git commit -m "Atualizacao automatica de estoque %date% %time%"
git push origin main

echo Tudo pronto! Site atualizado.
pause