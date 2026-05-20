const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public"));

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "90d6f6f6a741248a6d7cef52015e0fcada662f73";
const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN || "06b1c43ca9339432e74a23e7cecf6ead69f78cef";
const LOJA_ID = "259292";

// Quantas páginas buscar na API.
const LIMITE_PAGINAS = 250;

// Lê o arquivo categorias_ocultas.json na mesma pasta do server.cjs.
// Assim funciona mesmo quando o .bat for executado de outro lugar.
function carregarCategoriasOcultas() {
  const arquivo = path.join(__dirname, "categorias_ocultas.json");

  if (!fs.existsSync(arquivo)) {
    console.log("Arquivo categorias_ocultas.json não encontrado. Nenhuma categoria será ocultada.");
    return [];
  }

  try {
    const conteudo = fs.readFileSync(arquivo, "utf8");
    const lista = JSON.parse(conteudo);

    if (!Array.isArray(lista)) {
      console.log("categorias_ocultas.json precisa ser uma lista. Exemplo: [\"Copa\"]");
      return [];
    }

    return lista
      .map((c) => String(c || "").trim())
      .filter(Boolean);
  } catch (erro) {
    console.log("Erro ao ler categorias_ocultas.json:", erro.message);
    return [];
  }
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function categoriaPrincipal(catOriginal) {
  const categoria = String(catOriginal || "").trim();

  if (!categoria) return "Sem categoria";

  if (categoria.endsWith("- Pap")) return "Papelaria";
  if (categoria.endsWith("- UD")) return "Utilidades Domésticas";
  if (categoria.endsWith("- Fer")) return "Ferramentas";
  if (categoria.endsWith("- Fest") || categoria.endsWith("- Fes")) return "Festa/Embalagens";
  if (categoria.endsWith("- Pas")) return "Páscoa";
  if (categoria.endsWith("- Bij")) return "Bijuterias";
  if (categoria.endsWith("- Nat")) return "Natal";
  if (categoria.endsWith("- Hal")) return "Halloween";
  if (categoria.endsWith("- PisPrai")) return "Praia e Piscina";
  if (categoria.endsWith("- Inf")) return "Informatica";
  if (categoria.endsWith("- Car")) return "Carnaval";
  if (categoria.endsWith("- Cop")) return "Copa";
  if (categoria.endsWith("- Bri")) return "Brinquedos";
  if (categoria.endsWith("- Art")) return "Artesanato";
  if (categoria.endsWith("- Arm")) return "Armarinho";
  if (categoria.endsWith("- Perf")) return "Perfumaria";
  if (categoria.endsWith("- Beb")) return "Bebê";
  if (categoria.endsWith("- Cas")) return "Casa";
  if (categoria.endsWith("- Var") || categoria.endsWith("- Div")) return "Diversos";

  return categoria;
}

function deveOcultarCategoria(categoriaOriginal, categoriasOcultas) {
  if (!categoriasOcultas.length) return false;

  const originalNormalizada = normalizarTexto(categoriaOriginal);
  const principalNormalizada = normalizarTexto(categoriaPrincipal(categoriaOriginal));

  return categoriasOcultas.some((categoriaOculta) => {
    const ocultaNormalizada = normalizarTexto(categoriaOculta);

    return (
      originalNormalizada.includes(ocultaNormalizada) ||
      principalNormalizada.includes(ocultaNormalizada)
    );
  });
}

app.get("/", (req, res) => {
  res.send("API Bazar da Inês online");
});

app.get("/produtos", async (req, res) => {
  try {
    const categoriasOcultas = carregarCategoriasOcultas();

    console.log("Categorias ocultas:", categoriasOcultas.length ? categoriasOcultas.join(", ") : "nenhuma");

    let pagina = 1;
    let totalOcultados = 0;
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

  console.log(
    JSON.stringify(
      response.data.produtos?.[0] || response.data[0],
      null,
      2
    )
  );

      const data = response.data;

      if (!data.data || data.data.length === 0) break;

      data.data.forEach((p) => {
        const estoque = Number(String(p.estoque || "0").replace(",", "."));

        if (estoque <= 0) return;

        const categoria = p.nome_grupo || "Sem categoria";

        if (deveOcultarCategoria(categoria, categoriasOcultas)) {
          totalOcultados++;
          return;
        }

        produtos.push({
          codigo: String(p.codigo_interno || "").padStart(6, "0"),
          nome: p.nome || "",
          preco: Number(String(p.valor_venda || 0).replace(",", ".")),
          categoria,
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

    console.log("TOTAL DE PRODUTOS:", produtos.length);
    console.log("TOTAL OCULTADO POR CATEGORIA:", totalOcultados);

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

console.log("=== TESTE API ORIGINAL ===");
console.log(Object.keys(response.data));
console.log(JSON.stringify(response.data, null, 2).slice(0, 5000));
console.log("=== FIM TESTE API ORIGINAL ===");
    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
