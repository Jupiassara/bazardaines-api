const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const ACCESS_TOKEN =
  process.env.ACCESS_TOKEN || "SEU_ACCESS_TOKEN_AQUI";

const SECRET_ACCESS_TOKEN =
  process.env.SECRET_ACCESS_TOKEN || "SEU_SECRET_ACCESS_TOKEN_AQUI";

const LOJA_ID = "259292";
const LIMITE_PAGINAS =250;

app.get("/", (req, res) => {
  res.send("API Bazar da Inês online");
});

app.get("/produtos", async (req, res) => {
  try {
    let pagina = 1;
    const produtos = [];

    while (pagina <= LIMITE_PAGINAS) {
      console.log("Buscando página:", pagina);

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
      const lista = data.data || data.produtos || [];

      if (!Array.isArray(lista) || lista.length === 0) break;

      lista.forEach((p) => {
        const estoque = Number(String(p.estoque || "0").replace(",", "."));

        if (estoque <= 0) return;

        produtos.push({
          codigo: String(p.codigo_interno || "").padStart(6, "0"),
          nome: p.nome || "",
          preco: Number(String(p.valor_venda || 0).replace(",", ".")),
          categoria: p.nome_grupo || "Sem categoria",
          estoque,
          imagem:
            Array.isArray(p.fotos) && p.fotos.length > 0
              ? p.fotos[0]
              : "",
        });
      });

      if (!data.meta?.proxima_pagina && lista.length === 0) break;

      pagina++;
    }
    console.log("TOTAL DE PRODUTOS:", produtos.length);
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
        timeout: 30000,
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});