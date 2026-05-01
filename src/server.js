const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const ACCESS_TOKEN = "COLE_SEU_ACCESS_TOKEN";
const SECRET_ACCESS_TOKEN = "COLE_SEU_SECRET_ACCESS_TOKEN";
const LOJA_ID = "259292";

let cacheProdutos = null;
let cacheHorario = 0;
const CACHE_TEMPO = 5 * 60 * 1000; // 5 minutos

function numero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  return Number(String(valor).replace(",", ".")) || 0;
}

function estoqueDoProduto(p) {
  let estoques = [];

  estoques.push(numero(p.estoque));

  if (Array.isArray(p.variacoes)) {
    p.variacoes.forEach((v) => {
      estoques.push(numero(v?.variacao?.estoque));
    });
  }

  return Math.max(...estoques);
}

app.get("/produtos", async (req, res) => {
  try {
    if (cacheProdutos && Date.now() - cacheHorario < CACHE_TEMPO) {
      return res.json(cacheProdutos);
    }

    let pagina = 1;
    let produtos = [];

    while (true) {
      console.log("Buscando página", pagina);

      const response = await axios.get(
        `https://api.gestaoclick.com/produtos?loja_id=${LOJA_ID}&ativo=1&pagina=${pagina}`,
        {
          headers: {
            "Content-Type": "application/json",
            "access-token": ACCESS_TOKEN,
            "secret-access-token": SECRET_ACCESS_TOKEN,
          },
          timeout: 30000,
        }
      );

      const data = response.data;

      if (!data.data || data.data.length === 0) break;

      data.data.forEach((p) => {
        const estoqueTexto = String(p.estoque || "").replace(",", ".").trim();

// só aceita se for número válido maior que zero
if (!estoqueTexto || isNaN(estoqueTexto) || Number(estoqueTexto) <= 0) return;

const estoqueFinal = Number(estoqueTexto);

        produtos.push({
          codigo: String(p.codigo_interno || "").padStart(6, "0"),
          nome: p.nome || "",
          preco: numero(p.valor_venda),
          categoria: p.nome_grupo || "Sem categoria",
          estoque: estoqueFinal,
          imagem:
            Array.isArray(p.fotos) && p.fotos.length > 0
              ? p.fotos[0]
              : "https://via.placeholder.com/300x300?text=Sem+Imagem",
        });
      });

      if (pagina >= 5) break; // teste rápido: até 500 produtos brutos
      if (!data.meta?.proxima_pagina) break;

      pagina++;
    }

    cacheProdutos = produtos;
    cacheHorario = Date.now();

    console.log("Produtos enviados ao app:", produtos.length);
    res.json(produtos);
  } catch (err) {
    console.error("STATUS:", err.response?.status);
    console.error("RESPOSTA:", err.response?.data);
    console.error("ERRO:", err.message);
    res.status(500).send("Erro na API");
  }
});


app.get("/teste-produto/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo;
    const response = await axios.get(
      `https://api.gestaoclick.com/produtos?codigo=${codigo}`,
      {
        headers: {
          "Content-Type": "application/json",
          "access-token": ACCESS_TOKEN,
          "secret-access-token": SECRET_ACCESS_TOKEN,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});