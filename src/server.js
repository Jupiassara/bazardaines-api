const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "90d6f6f6a741248a6d7cef52015e0fcada662f73";
const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN || "06b1c43ca9339432e74a23e7cecf6ead69f78cef";
const LOJA_ID = "259292";

// Quantas páginas buscar na API.
// 2 = mais rápido / menos produtos
// 5 = mais produtos / um pouco mais demorado
const LIMITE_PAGINAS = 5;

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

      if (!data.data || data.data.length === 0) break;

      data.data.forEach((p) => {
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
              : "https://via.placeholder.com/300x300?text=Sem+Imagem",
        });
      });

      if (!data.meta?.proxima_pagina) break;

      pagina++;
    }

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