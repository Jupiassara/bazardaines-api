const axios = require("axios");
const fs = require("fs");

async function gerar() {
  try {
    console.log("Buscando produtos da API...");

    const response = await axios.get("http://localhost:3000/produtos");

    const produtosApi = response.data;

    console.log(`Total recebido: ${produtosApi.length}`);

    const produtos = produtosApi.map((p) => {
  const codigo = String(p.codigo || "").padStart(6, "0");

  return {
  codigo,
  nome: p.nome || "SEM NOME",
  preco: parseFloat(p.preco || 0),
  categoria: p.categoria || "Sem categoria",
  estoque: p.estoque || 0,
  imagem: p.imagem || "",
};
});

    fs.writeFileSync(
  "./produtos.json",
  JSON.stringify(produtos, null, 2),
  "utf-8"
);

console.log("SALVOU produtos.json COM SUCESSO!");
console.log("PRIMEIRO PRODUTO:", produtos[0]);

    console.log("Arquivo produtos.json gerado com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar JSON:", error.message);
  }
}

gerar();