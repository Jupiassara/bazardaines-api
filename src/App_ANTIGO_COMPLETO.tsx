import React, { useEffect, useMemo, useRef, useState } from "react";

type Categoria = string;

type Produto = {
  codigo: string;
  nome: string;
  preco: number | string;
  categoria: Categoria | string;
  imagem?: string;
};

type CarrinhoItem = {
  codigo: string;
  nome: string;
  preco: number;
  categoria: Categoria | string;
  imagem?: string;
  quantidade: number;
};

type Ordenacao = "relevancia" | "menor-preco" | "maior-preco" | "nome";

const LOGO_URL = "/logo.png";
const WHATSAPP_NUMERO = "5512991715524";
const IMAGEM_PADRAO = "/sem-imagem-2.png";S

function normalizarCategoria(categoria: string): Categoria {
  const texto = String(categoria || "").trim();
  return texto === "" ? "Sem categoria" : texto;
}

function normalizarPreco(valor: unknown): number {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  const texto = String(valor || "").trim();
  if (!texto) return 0;

  const numero = Number(
    texto
      .replace(/\s/g, "")
      .replace(/R\$/gi, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(numero) ? numero : 0;
}

function formatarPreco(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizarTexto(texto: string | number | undefined | null) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function contemPalavra(texto: string, busca: string) {
  const textoNormalizado = normalizarTexto(texto);

  if (!busca) return true;

  const termos = busca.split(" ").filter(Boolean);

  return termos.every((termo) => {
    const padrao = new RegExp(`(^|[^a-z0-9])${termo}([^a-z0-9]|$)`, "i");
    return padrao.test(textoNormalizado);
  });
}

function ImagemProduto({
  codigo,
  nome,
  imagem,
}: {
  codigo: string;
  nome: string;
  imagem?: string;
}) {
  const cod = String(codigo).replace(/\D/g, "").padStart(6, "0");
  const imagemInformada = String(imagem || "").trim();

  const fontes = [
  imagemInformada,
  IMAGEM_PADRAO,
].filter((f, i, arr) => !!f && arr.indexOf(f) === i);

  const [indice, setIndice] = React.useState(0);

  React.useEffect(() => {
    setIndice(0);
  }, [cod, imagemInformada]);

 const fonteAtual = fontes[indice] || IMAGEM_PADRAO;

return (
  <img
    src={fonteAtual}
    alt={nome}
    style={styles.imagemProduto}
    onError={(e) => {
      const target = e.currentTarget as HTMLImageElement;

      setIndice((atual) => {
        const proximo = atual + 1;

        if (proximo < fontes.length) {
          return proximo;
        }

        if (!target.src.includes("sem-imagem-2.png")) {
          target.src = "/sem-imagem-2.png";
        }

        return atual;
      });
    }}
  />
);
}

export default function App() {
 const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>("Todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("relevancia");
  const [produtosBrutos, setProdutosBrutos] = useState<Produto[]>([]);
  
  const nomeCliente = localStorage.getItem("nomeCliente") || "";

  const produtosRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetch(`https://bazardaines-api.onrender.com/produtos`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro ao carregar produtos: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProdutosBrutos(data);
        } else {
          setProdutosBrutos([]);
        }
      })
      .catch((erro) => {
        console.error("Falha ao carregar produtos:", erro);
        setProdutosBrutos([]);
      });
     
  }, []);

 
  const produtos = useMemo(() => {
    return produtosBrutos.map((produto) => ({
      codigo: String(produto.codigo || "").trim(),
      nome: String(produto.nome || "").trim(),
      preco: normalizarPreco(produto.preco),
      categoria: normalizarCategoria(String(produto.categoria)),
      imagem:
        produto.imagem && String(produto.imagem).trim() !== ""
          ? String(produto.imagem).trim()
          : "",
    }));
  }, [produtosBrutos]);

  const ordemCategorias: Categoria[] = [
    "Papelaria",
    "Armarinhos",
    "Artesanato",
    "Informática",
    "Brinquedos",
    "Utilidade Doméstica",
    "Artigos de Festa",
    "Bebê",
    "Bijuterias",
    "Perfumaria",
    "Variedades",
    "Diversos",
    "Carnaval",
    "Festa Junina",
    "Halloween",
    "Natal",
    "Páscoa",
    "Sem categoria",
  ];

  const categoriasDisponiveis = useMemo(() => {
    const existentes = Array.from(
      new Set(
        produtos
          .map((produto) => String(produto.categoria || "").trim())
          .filter(Boolean)
      )
    );

    const ordenadas = ordemCategorias.filter((categoria) =>
      existentes.includes(categoria)
    );

    const extras = existentes
      .filter((categoria) => !ordemCategorias.includes(categoria))
      .sort((a, b) => a.localeCompare(b, "pt-BR"));

    return ["Todos", ...ordenadas, ...extras];
  }, [produtos]);

  function adicionarProduto(produto: {
    codigo: string;
    nome: string;
    preco: number;
    categoria: Categoria | string;
    imagem?: string;
  }) {
    setCarrinho((anterior) => {
      const existente = anterior.find((item) => item.codigo === produto.codigo);

      if (existente) {
        return anterior.map((item) =>
          item.codigo === produto.codigo
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [
        ...anterior,
        {
          codigo: produto.codigo,
          nome: produto.nome,
          preco: normalizarPreco(produto.preco),
          categoria: produto.categoria,
          imagem:
            produto.imagem && String(produto.imagem).trim() !== ""
              ? String(produto.imagem).trim()
              : "",
          quantidade: 1,
        },
      ];
    });
  }

  function aumentarQuantidade(codigo: string) {
    setCarrinho((anterior) =>
      anterior.map((item) =>
        item.codigo === codigo
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  }

  function diminuirQuantidade(codigo: string) {
    setCarrinho((anterior) =>
      anterior
        .map((item) =>
          item.codigo === codigo
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }
  function limparCarrinho() {
  if (window.confirm("Deseja limpar o carrinho?")) {
    setCarrinho([]);
  }
}

  function quantidadeDoProduto(codigo: string) {
    const item = carrinho.find((produto) => produto.codigo === codigo);
    return item ? item.quantidade : 0;
  }

  function produtoEmOferta(produto: { preco: number }) {
    return Number(produto.preco) <= 9.99;
  }

  function aoDigitarBusca(valor: string) {
    setBusca(valor);

    const texto = normalizarTexto(valor);

    if (texto === "") {
      setSugestoes([]);
      return;
    }

    const nomesUnicos = Array.from(
      new Set(produtos.map((p) => String(p.nome || "").trim()).filter(Boolean))
    );

    const filtradas = nomesUnicos
      .filter(
        (nome) =>
          contemPalavra(nome, texto) || normalizarTexto(nome).includes(texto)
      )
      .slice(0, 5);

    setSugestoes(filtradas);

    setTimeout(() => {
      produtosRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  const produtosFiltrados = useMemo(() => {
    const textoBusca = normalizarTexto(busca);
    const buscando = textoBusca !== "";

    const filtrados = produtos.filter((produto) => {
      const nomeProduto = String(produto.nome || "");
      const codigoProduto = String(produto.codigo || "");

      const atendeBusca =
        !buscando ||
        contemPalavra(nomeProduto, textoBusca) ||
        normalizarTexto(codigoProduto).includes(textoBusca);

      const atendeCategoria =
        buscando ||
        categoriaAtiva === "Todos" ||
        produto.categoria === categoriaAtiva;

      return atendeBusca && atendeCategoria;
    });

    if (ordenacao === "menor-preco") {
      return [...filtrados].sort((a, b) => Number(a.preco) - Number(b.preco));
    }

    if (ordenacao === "maior-preco") {
      return [...filtrados].sort((a, b) => Number(b.preco) - Number(a.preco));
    }

    if (ordenacao === "nome") {
      return [...filtrados].sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return filtrados;
  }, [produtos, busca, categoriaAtiva, ordenacao]);

  const total = useMemo(() => {
    return carrinho.reduce(
      (soma, item) =>
        soma + normalizarPreco(item.preco) * Number(item.quantidade),
      0
    );
  }, [carrinho]);

  const quantidadeTotalItens = useMemo(() => {
    return carrinho.reduce((soma, item) => soma + Number(item.quantidade), 0);
  }, [carrinho]);

  const linkWhatsApp = useMemo(() => {
    const mensagemBase = "Olá! Gostaria de fazer este pedido na Bazar da Inês:";

    if (carrinho.length === 0) {
      return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
        "Olá! Gostaria de informações sobre os produtos da Bazar da Inês."
      )}`;
    }

    const itens = carrinho
      .map(
        (item) =>
          `• [${item.codigo}] ${item.nome} - Qtd: ${item.quantidade} - Unit: R$ ${formatarPreco(item.preco)}`
      )
      .join("\n");

    const mensagem = `${mensagemBase}

${itens}

Total do pedido: R$ ${formatarPreco(total)}

Nome do cliente: ${nomeCliente}
Forma de pagamento:
Retirada ou entrega:`;

    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
      mensagem
    )}`;
    }, [carrinho, total, nomeCliente]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.topo}>
          <div style={styles.topoEsquerda}>
            <img
              src={LOGO_URL}
              alt="Logo da loja"
              style={styles.logo}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = IMAGEM_PADRAO;
              }}
            />
            <div>
              <h1 style={styles.titulo}>Bazar da Inês</h1>
              <p style={styles.subtitulo}>
                Papelaria, utilidades, brinquedos e muito mais
              </p>
            </div>
          </div>
        </div>

        <div style={styles.buscaLinha}>
          <div style={styles.buscaContainer}>
            <input
              type="search"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => aoDigitarBusca(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              style={styles.buscaInput}
            />

            {busca && (
              <button
                type="button"
                onClick={() => {
                  setBusca("");
                  setSugestoes([]);
                }}
                style={styles.botaoLimpar}
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            style={styles.selectOrdenacaoPequeno}
          >
            <option value="relevancia">Relevância</option>
            <option value="menor-preco">Menor</option>
            <option value="maior-preco">Maior</option>
            <option value="nome">Nome</option>
          </select>
        </div>

        {sugestoes.length > 0 && (
          <div style={styles.caixaSugestoes}>
            {sugestoes.map((item, index) => (
              <div
                key={index}
                style={styles.itemSugestao}
                onClick={() => {
                  setBusca(item);
                  setSugestoes([]);
                  setTimeout(() => {
                    produtosRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }}
              >
                🔍 {item}
              </div>
            ))}
          </div>
        )}
      </header>

      <main style={styles.main}>
        <section style={styles.bannerCompacto}>
          <div style={styles.bannerTituloPequeno}>
            Encontre seus produtos rapidamente
          </div>
        </section>

        

        <section style={styles.section}>
          <div style={styles.sectionTopo}>
            <h2 style={styles.sectionTitulo}>Categorias</h2>
          </div>

          <div style={styles.categoriasLinha}>
            {categoriasDisponiveis.map((categoria: Categoria) => {
              const ativa = categoria === categoriaAtiva;

              return (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => setCategoriaAtiva(categoria)}
                  style={{
                    ...styles.categoriaBotao,
                    ...(ativa ? styles.categoriaBotaoAtiva : {}),
                  }}
                >
                  {categoria}
                </button>
              );
            })}
          </div>
        </section>

        <section id="produtos" style={styles.section} ref={produtosRef}>
          <div style={styles.sectionTopo}>
            <h2 style={styles.sectionTitulo}>Produtos</h2>
            <span style={styles.sectionInfo}>
              {produtosFiltrados.length} produtos encontrados
            </span>
          </div>

          {produtosFiltrados.length === 0 ? (
            <div style={styles.semResultado}>Nenhum produto encontrado</div>
          ) : (
            <div style={styles.listaProdutos} key={`${categoriaAtiva}-${busca}`}>
              {produtosFiltrados.map((produto) => {
                const qtd = quantidadeDoProduto(produto.codigo);

                return (
                  <div key={produto.codigo} style={styles.cardProduto}>
                    <div style={styles.areaImagem}>
                      {produtoEmOferta(produto) && (
                        <div style={styles.seloOferta}>Oferta</div>
                      )}

                      <ImagemProduto
                        codigo={produto.codigo}
                        nome={produto.nome}
                        imagem={produto.imagem}
                      />
                    </div>

                    <div style={styles.cardConteudo}>
                      <div style={styles.codigo}>Cód. {produto.codigo}</div>
                      <div style={styles.nomeProduto}>{produto.nome}</div>
                      <div style={styles.categoriaProduto}>
                        {produto.categoria}
                      </div>
                      <div style={styles.precoProduto}>
                        R$ {formatarPreco(normalizarPreco(produto.preco))}
                      </div>

                      {qtd === 0 ? (
                        <button
                          type="button"
                          onClick={() => adicionarProduto(produto)}
                          style={styles.botaoAdicionar}
                        >
                          🛒 Comprar agora
                        </button>
                      ) : (
                        <div style={styles.controleQuantidade}>
                          <button
                            type="button"
                            onClick={() => diminuirQuantidade(produto.codigo)}
                            style={styles.botaoQtd}
                          >
                            -
                          </button>

                          <span style={styles.textoQtd}>{qtd}</span>

                          <button
                            type="button"
                            onClick={() => aumentarQuantidade(produto.codigo)}
                            style={styles.botaoQtd}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <div style={styles.espacoFinal} />

     <footer style={styles.barraCarrinho}>
  <div style={styles.barraConteudo}>
    <div style={styles.barraEsquerda}>
  <div style={styles.barraItens}>
  Itens no carrinho: {quantidadeTotalItens}
</div>
  <div style={styles.barraTotal}>
  Total: R$ {formatarPreco(total)}
</div>

  {quantidadeTotalItens > 0 && (
    <button
      type="button"
      onClick={limparCarrinho}
      style={styles.botaoLimparCarrinho}
    >
       🗑 Limpar
    </button>
  )}
</div>

    <a
  href="#"
  rel="noreferrer"
  style={{
    ...styles.botaoWhatsApp,
    opacity: quantidadeTotalItens === 0 ? 0.5 : 1,
    pointerEvents: quantidadeTotalItens === 0 ? "none" : "auto",
  }}
  onClick={(e) => {
    e.preventDefault();

    if (quantidadeTotalItens === 0) return;

    const confirmar = window.confirm(
      "📦 Informações importantes:\n\n" +
      "• Retirada na loja em até 1 hora\n" +
      "• Ou entregamos para você\n\n" +
      "Deseja continuar para o WhatsApp?"
    );

    if (confirmar) {
      window.open(linkWhatsApp, "_blank");
    }
  }}
>
  Finalizar pedido no WhatsApp
</a>
  </div>
</footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#1e293b",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 14px 14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  topo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  topoEsquerda: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
    borderRadius: 12,
    background: "#ffffff",
    flexShrink: 0,
  },

  titulo: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.1,
    fontWeight: 800,
  },

  subtitulo: {
    margin: "4px 0 0 0",
    fontSize: 13,
    color: "#64748b",
  },

  buscaLinha: {
    display: "grid",
    gridTemplateColumns: "1fr 110px",
    gap: 8,
    alignItems: "center",
  },

  buscaContainer: {
    position: "relative",
    width: "100%",
  },

  buscaInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 40px 12px 14px",
    border: "1px solid #d7e0ea",
    borderRadius: 14,
    background: "#f8fbff",
    fontSize: 15,
    outline: "none",
    WebkitAppearance: "none",
  },

  botaoLimpar: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "#e2e8f0",
    borderRadius: "50%",
    width: 28,
    height: 28,
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
  },

  caixaSugestoes: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    marginTop: 8,
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
  },

  itemSugestao: {
    padding: "12px 14px",
    fontSize: 14,
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
  },

  selectOrdenacaoPequeno: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 10px",
    border: "1px solid #d7e0ea",
    borderRadius: 12,
    background: "#ffffff",
    fontSize: 12,
    outline: "none",
  },

  main: {
    maxWidth: 820,
    margin: "0 auto",
    padding: 14,
  },

  bannerCompacto: {
  background: "#2563eb",
  color: "#fff",
  borderRadius: 12,
  padding: "8px 10px",
  marginBottom: 10,
  textAlign: "center",
},

  bannerTituloPequeno: {
  fontSize: 14,
  fontWeight: 800,
  lineHeight: 1.1,
},

  section: {
  marginBottom: 12,
},

inputCliente: {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #d7e0ea",
  borderRadius: 14,
  background: "#f8fbff",
  fontSize: 15,
  outline: "none",
},

  sectionTopo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  sectionTitulo: {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
},

  sectionInfo: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 700,
  },

  categoriasLinha: {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  paddingBottom: 2,
},

  categoriaBotao: {
  border: "1px solid #d7e0ea",
  background: "#ffffff",
  color: "#334155",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
},
  categoriaBotaoAtiva: {
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid #2563eb",
  },

  listaProdutos: {
    display: "grid",
    gap: 14,
  },

  semResultado: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
  },

  cardProduto: {
  background: "#ffffff",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  padding: 10,
  display: "grid",
  gridTemplateColumns: "80px 1fr",
  gap: 10,
  alignItems: "center",
  boxShadow: "0 6px 14px rgba(15,23,42,0.05)",
},

  areaImagem: {
  position: "relative",
  width: 80,
  height: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  borderRadius: 14,
  overflow: "hidden",
},

  imagemProduto: {
  width: 80,
  height: 80,
  borderRadius: 14,
  objectFit: "contain",
  background: "#ffffff",
  display: "block",
},

  seloOferta: {
    position: "absolute",
    top: -6,
    left: -6,
    zIndex: 2,
    background: "#ef4444",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 800,
    padding: "5px 8px",
    borderRadius: 999,
    boxShadow: "0 6px 12px rgba(239,68,68,0.25)",
  },

  cardConteudo: {
    minWidth: 0,
  },

  codigo: {
  fontSize: 10,
  color: "#64748b",
  marginBottom: 3,
},

nomeProduto: {
  fontSize: 15,
  fontWeight: 800,
  lineHeight: 1.25,
  marginBottom: 4,
},

 categoriaProduto: {
  fontSize: 12,
  color: "#64748b",
  marginBottom: 6,
},

  precoProduto: {
  fontSize: 20,
  fontWeight: 900,
  color: "#16a34a",
  marginBottom: 6,
},

  botaoAdicionar: {
  width: "100%",
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  borderRadius: 12,
  padding: "10px",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(22,163,74,0.35)",
  transition: "transform 0.1s ease",
},

  controleQuantidade: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    background: "#f8fbff",
    border: "1px solid #dbe5ef",
    borderRadius: 14,
    padding: "8px 10px",
  },

  botaoQtd: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid #cfd9e4",
    background: "#ffffff",
    fontSize: 22,
    fontWeight: 800,
    cursor: "pointer",
    lineHeight: 1,
  },

  textoQtd: {
    minWidth: 18,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 800,
  },

  espacoFinal: {
  height: 70,
},
  barraCarrinho: {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 60,
  background: "rgba(255,255,255,0.96)",
  borderTop: "1px solid #dbe5ef",
  boxShadow: "0 -4px 12px rgba(15,23,42,0.05)",
  padding: "6px 10px calc(6px + env(safe-area-inset-bottom))",
},

  barraConteudo: {
  maxWidth: 820,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 6,
},
barraEsquerda: {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: 1,
},

boxNome: {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "4px",
  padding: "0",
  margin: "0",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  minWidth: "unset",
  width: "96px",
},

labelNome: {
  fontSize: "11px",
  fontWeight: 600,
  color: "#475569",
  lineHeight: 1.1,
  margin: 0,
  padding: 0,
},
inputNomeCarrinho: {
  width: "110px",
  height: "38px",
  padding: "0 10px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: "14px",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  boxSizing: "border-box",
},
  barraItens: {
  fontSize: 10,
  color: "#64748b",
  fontWeight: 700,
  marginBottom: 1,
},

 barraTotal: {
  fontSize: 16,
  fontWeight: 900,
  color: "#16a34a",
  lineHeight: 1,
},

botaoLimparCarrinho: {
  marginTop: 4,
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: 12,
  fontWeight: 700,
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
},

  botaoWhatsApp: {
  textDecoration: "none",
  background: "#16a34a",
  color: "#ffffff",
  padding: "8px 12px",
  borderRadius: 12,
  fontWeight: 900,
  fontSize: 13,
  whiteSpace: "nowrap",
  boxShadow: "0 4px 10px rgba(22,163,74,0.25)",
},
};