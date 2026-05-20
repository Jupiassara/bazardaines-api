const axios = require("axios");

const ACCESS_TOKEN = "90d6f6f6a741248a6d7cef52015e0fcada662f73";
const SECRET_ACCESS_TOKEN = "06b1c43ca9339432e74a23e7cecf6ead69f78cef";
const LOJA_ID = "259292";

async function testar() {
  try {
    console.log("Buscando produto na API do GestãoClick...");

    const response = await axios.get(
      `https://api.gestaoclick.com/produtos?loja_id=${LOJA_ID}&ativo=1&pagina=1`,
      {
        headers: {
          "Content-Type": "application/json",
          "access-token": ACCESS_TOKEN,
          "secret-access-token": SECRET_ACCESS_TOKEN,
        },
        timeout: 30000,
      }
    );

    console.log("Resposta recebida.");
    console.log("Campos principais:");
    console.log(Object.keys(response.data));

    console.log("\nAmostra da resposta:");
    console.log(JSON.stringify(response.data, null, 2).slice(0, 15000));
  } catch (error) {
    console.error("Erro no teste:");
    console.error(error.response?.data || error.message);
  }
}

testar();