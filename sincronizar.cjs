const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SECRET_KEY = process.env.SECRET_KEY;

async function atualizarEstoque() {
    try {
        console.log("🚀 Conectando ao GestãoClick...");
        
        const response = await axios.get('https://api.gestaoclick.com.br/produtos', {
            headers: {
                'access-token': ACCESS_TOKEN,
                'secret-key': SECRET_KEY
            }
        });

        const produtosDoSistema = response.data.data;
        const produtosFormatados = produtosDoSistema.map(p => ({
            id: p.id,
            nome: p.nome,
            preco: parseFloat(p.preco_venda).toFixed(2),
            categoria: p.categoria || "Geral",
            estoque: p.estoque_atual,
            imagem: p.imagem_url || "img/placeholder.jpg" 
        }));

        fs.writeFileSync('./produtos.json', JSON.stringify(produtosFormatados, null, 2));
        
        console.log(`✅ Sucesso! ${produtosFormatados.length} produtos sincronizados.`);
    } catch (error) {
        console.error("❌ Erro:", error.message);
    }
}

atualizarEstoque();