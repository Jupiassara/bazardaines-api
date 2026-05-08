@echo off
echo [1/3] Limpando arquivos antigos...
if exist produtos.json del produtos.json /q

echo [2/3] Buscando estoque no Gestaoclick...
node sincronizar.cjs

echo [3/3] Enviando atualizacoes para o site...
git add .
git commit -m "Sincronizacao automatica Bazar"
git push origin main

echo ------------------------------------------
echo ✅ SUCESSO: Seu site foi atualizado!
echo ------------------------------------------
pause