@echo off
echo [1/2] Buscando estoque no Gestaoclick...
node sincronizar.cjs

echo [2/2] Enviando para a internet...
git add .
git commit -m "Sincronizacao automatica Bazar"
git push origin main

echo --- SUCESSO: Seu site foi atualizado! ---
pause