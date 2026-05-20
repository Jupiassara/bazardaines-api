import React, { useState, useEffect, useMemo } from 'react';

const App = () => {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [imagemZoom, setImagemZoom] = useState(null);

  const [entrega, setEntrega] = useState({ bairro: 'Retirar na Loja (Pronto em ~1h)', valor: 0 });
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState('PIX');
  const [troco, setTroco] = useState('');

  const TELEFONE_WHATSAPP = '5512991715524';

  const normalizarCategoriaProduto = (categoria) => {
    const catOriginal = String(categoria || '').trim();

    if (!catOriginal) return 'Sem categoria';

    if (catOriginal.endsWith('- Pap')) return 'Papelaria';
    if (catOriginal.endsWith('- UD')) return 'Utilidades Domésticas';
    if (catOriginal.endsWith('- Fer')) return 'Ferramentas';
    if (catOriginal.endsWith('- Fest') || catOriginal.endsWith('- Fes')) return 'Festa/Embalagens';
    
    if (catOriginal.endsWith('- Pas')) return 'Páscoa';
    if (catOriginal.endsWith('- Bij')) return 'Bijuterias';
    if (catOriginal.endsWith('- Nat')) return 'Natal';
    if (catOriginal.endsWith('- Hal')) return 'Halloween';
    if (catOriginal.endsWith('- PisPrai')) return 'Praia e Piscina';
    if (catOriginal.endsWith('- Inf')) return 'Informatica';
    if (catOriginal.endsWith('- Car')) return 'Carnaval';
    if (catOriginal.endsWith('- Jun')) return 'Festa Junina';
    if (catOriginal.endsWith('- Cop')) return 'Copa';
    
    if (catOriginal.endsWith('- Bri')) return 'Brinquedos';
    if (catOriginal.endsWith('- Art')) return 'Artesanato';
    if (catOriginal.endsWith('- Arm')) return 'Armarinho';
    if (catOriginal.endsWith('- Perf')) return 'Perfumaria';
    if (catOriginal.endsWith('- Beb')) return 'Bebê';
    if (catOriginal.endsWith('- Cas')) return 'Casa';
    if (catOriginal.endsWith('- Var') || catOriginal.endsWith('- Div')) return 'Diversos';

    return 'Sem categoria';
  };

  const categorias = useMemo(() => {
    if (!produtos || produtos.length === 0) return ['Todos'];

    const grupos = produtos.map(p => normalizarCategoriaProduto(p.categoria));

    const ordemCategorias = [
  'Todos',
  'Papelaria',
  'Informatica',
  'Utilidades Domésticas',
  'Ferramentas',
  'Festa/Embalagens',
  'Brinquedos',
  'Bijuterias',
  'Artesanato',
  'Armarinho',
  'Perfumaria',
  'Bebê',
  'Casa',
  'Diversos',
  'Natal',
  'Carnaval',
  'Páscoa',
  'Festa Junina',
  'Halloween',
  'Copa',
  'Sem categoria'
];

const categoriasUnicas = [...new Set(grupos)];

return [
  'Todos',
  ...ordemCategorias.filter(cat =>
    cat !== 'Todos' && categoriasUnicas.includes(cat)
  )
];
}, [produtos]);

  const TAXAS_ENTREGA = [
    { bairro: 'Retirar na Loja (Pronto em ~1h)', valor: 0 },
    { bairro: 'Centro', valor: 5.00 },
    { bairro: 'Bairro A', valor: 7.00 },
    { bairro: 'Bairro B', valor: 10.00 },
  ];

  useEffect(() => {
    fetch('/produtos.json')
      .then(res => res.json())
      .then(data => setProdutos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erro:", err));
  }, []);

  const produtosFiltrados = useMemo(() => {
    const termo = (busca || '').toLowerCase();

    return produtos.filter(p => {
      const mBusca = (p.nome || '').toLowerCase().includes(termo);

      if (categoriaAtiva === 'Todos') return mBusca;

      const categoriaProduto = normalizarCategoriaProduto(p.categoria);
      const mCat = categoriaProduto === categoriaAtiva;

      return mBusca && mCat;
    });
  }, [busca, categoriaAtiva, produtos]);

  const adicionarAoCarrinho = (p) => {
    setCarrinho(prev => {
      const itemExiste = prev.find(item => item.nome === p.nome);
      if (itemExiste) {
        return prev.map(item =>
          item.nome === p.nome ? { ...item, qtd: item.qtd + 1 } : item
        );
      }
      return [...prev, { ...p, qtd: 1 }];
    });
  };

  const subtrairDoCarrinho = (nome) => {
    setCarrinho(prev => {
      const item = prev.find(i => i.nome === nome);
      if (item && item.qtd > 1) {
        return prev.map(i =>
          i.nome === nome ? { ...i, qtd: i.qtd - 1 } : i
        );
      }
      return prev.filter(i => i.nome !== nome);
    });
  };

  const totalProdutos = carrinho.reduce(
    (acc, item) => acc + (Number(item.preco) * item.qtd),
    0
  );

  const totalGeral = totalProdutos + entrega.valor;

  const finalizarPedido = () => {
    let message = `*Novo Pedido - Bazar da Inês*\n\n`;
    message += `*PRODUTOS:*\n`;

    carrinho.forEach(item => {
      message += `• ${item.qtd}x [${item.codigo}] ${item.nome} (R$ ${(item.preco * item.qtd).toFixed(2)})\n`;
    });

    message += `\n*RESUMO:*`;
    message += `\nSubtotal: R$ ${totalProdutos.toFixed(2)}`;
    message += `\nOpção: ${entrega.bairro}`;

    if (entrega.valor > 0) {
      message += `\nTaxa de Entrega: R$ ${entrega.valor.toFixed(2)}`;
      if (endereco) message += `\nEndereço: ${endereco}`;
    }

    message += `\n*TOTAL: R$ ${totalGeral.toFixed(2)}*`;
    message += `\n\n*PAGAMENTO:* ${pagamento}`;

    if (pagamento === 'Dinheiro' && troco) {
      message += ` (Troco para R$ ${troco})`;
    }

    window.open(
      `https://wa.me/${TELEFONE_WHATSAPP}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; max-width: 100%; }
        
        :root { color-scheme: light; }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: fixed;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f7f7fa;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          width: 100vw;
          max-width: 100%;
          overflow-x: hidden;
        }
        
        header {
          flex-shrink: 0;
          background: #ffffff;
          padding: 15px 15px 5px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          z-index: 10;
          max-width: 100%;
        }

        .header-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #eee;
          overflow: hidden;
          border: 1px solid #3483fa;
        }

        .logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-title {
          font-size: 22px;
          margin: 0;
          color: #3483fa !important;
          font-weight: 800;
        }

        .busca-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .input-busca {
          width: 100%;
          height: 45px;
          padding: 0 40px 0 15px;
          border: 2px solid #3483fa;
          border-radius: 10px;
          font-size: 16px !important;
          font-weight: 600 !important;
          outline: none;
          box-sizing: border-box;
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-appearance: none;
          opacity: 1 !important;
        }

        .input-busca::placeholder {
          color: #666 !important;
          opacity: 1 !important;
        }

        .btn-limpar-busca {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          font-size: 18px;
          color: #888;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }

        .categorias-scroll {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 6px 0 8px;
  gap: 5px;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  border-bottom: 1px solid #eee;
}
  .categorias-scroll::after {
  content: '›';
  position: sticky;
  right: 0;
  min-width: 28px;
  color: #3483fa;
  font-size: 26px;
  font-weight: bold;
  background: linear-gradient(to right, transparent, #ffffff 45%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
}

        .btn-categoria {
          padding: 6px 10px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 20px;
          font-size: 13px;
          white-space: nowrap;
          color: #555;
          font-weight: 500;
        }

        .btn-categoria.ativo {
          background: #3483fa;
          color: #fff;
          border-color: #3483fa;
        }

        main {
          flex-grow: 1;
          overflow-y: auto;
          padding: 15px;
          padding-bottom: 100px;
          -webkit-overflow-scrolling: touch;
          max-width: 100%;
          overflow-x: hidden;
        }

        .card {
          background: #fff;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          max-width: 100%;
          box-sizing: border-box;
        }

        .card-corpo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .foto-produto {
          width: 65px;
          height: 65px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #eee;
          cursor: zoom-in;
          flex-shrink: 0;
        }

        .foto-produto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-add {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 6px;
          background: #3483fa;
          color: #fff;
          font-weight: bold;
          max-width: 100%;
          box-sizing: border-box;
        }

        .floating-cart {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: #2ecc71;
          border-radius: 50%;
          color: #fff;
          border: none;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 99;
        }

        .cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          font-weight: bold;
        }

        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: ${carrinhoAberto ? 'block' : 'none'};
        }

        .cart-sidebar {
          position: fixed;
          right: 0;
          top: 0;
          width: 90%;
          height: 100%;
          background: #ffffff;
          z-index: 1001;
          transition: 0.3s;
          transform: ${carrinhoAberto ? 'translateX(0)' : 'translateX(100%)'};
          display: flex;
          flex-direction: column;
          max-width: 100%;
          box-sizing: border-box;
        }

        .cart-header {
          padding: 15px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          max-width: 100%;
          box-sizing: border-box;
        }

        .cart-content {
          flex-grow: 1;
          overflow-y: auto;
          padding: 15px;
          background: #fff;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin: 20px 0 10px;
          color: #3483fa;
          border-left: 4px solid #3483fa;
          padding-left: 8px;
        }

        select, .input-checkout {
          width: 100%;
          height: 45px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          margin-bottom: 10px;
          font-size: 14px;
          background-color: #ffffff !important;
          box-sizing: border-box;
          color: #000000 !important;
          -webkit-appearance: none;
          opacity: 1 !important;
          max-width: 100%;
        }

        .cart-item {
          border-bottom: 1px solid #f5f5f5;
          padding: 10px 0;
          color: #000;
          max-width: 100%;
          box-sizing: border-box;
        }

        .btn-q {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: #fff;
          color: #000;
          font-weight: bold;
          font-size: 18px;
        }

        .cart-footer {
          padding: 15px;
          background: #ffffff;
          border-top: 1px solid #eee;
          max-width: 100%;
          box-sizing: border-box;
        }

        .total-azul {
          color: #3483fa;
          font-size: 24px;
          font-weight: 800;
        }

        .btn-finalizar {
          width: 100%;
          padding: 15px;
          background: #25d366;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          max-width: 100%;
          box-sizing: border-box;
        }

        .zoom-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100dvh;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
          box-sizing: border-box;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .zoom-imagem {
          max-width: 90%;
          max-height: 80dvh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .zoom-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      <div className="app-container">
        <header>
          <div className="header-top">
            <div className="logo">
              <img
                src="/logo.png"
                alt="B"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>

            <h1 className="header-title">Bazar da Inês</h1>
          </div>

          <div className="busca-container">
            <input
              type="text"
              className="input-busca"
              placeholder="Digite para buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {busca && (
              <button
                className="btn-limpar-busca"
                onClick={() => setBusca('')}
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          <div className="categorias-scroll">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  backgroundColor: categoriaAtiva === cat ? '#007bff' : '#fff',
                  color: categoriaAtiva === cat ? '#fff' : '#333',
                  cursor: 'pointer',
                  marginRight: '0px',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <main>
          {produtosFiltrados.map((p, i) => {
            const urlImagem = p.imagem_url || p.foto_url || p.imagem || '/sem-imagem.png';

            return (
              <div key={i} className="card">
                <div className="card-corpo">
                  <div
                    className="foto-produto"
                    onClick={() => setImagemZoom(urlImagem)}
                  >
                    <img
                      src={urlImagem}
                      loading="lazy"
                      onError={(e) => e.target.src = '/sem-imagem.png'}
                      alt={p.nome}
                    />
                  </div>

                  <div
                    className="info-produto"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '15px'
                    }}
                  >
                    <strong
                      style={{
                        fontSize: '15px',
                        color: '#000',
                        display: 'block'
                      }}
                    >
                      {p.nome}
                    </strong>

                    <span
                      style={{
                        fontWeight: 'bold',
                        color: '#007bff',
                        fontSize: '18px',
                        display: 'block'
                      }}
                    >
                      R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                    </span>

                    
                  </div>
                </div>

                <button
                  className="btn-add"
                  onClick={() => adicionarAoCarrinho(p)}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            );
          })}
        </main>

        {carrinho.length > 0 && (
          <button
            className="floating-cart"
            onClick={() => setCarrinhoAberto(true)}
          >
            🛒
            <div className="cart-count">
              {carrinho.reduce((a, b) => a + b.qtd, 0)}
            </div>
          </button>
        )}

        <div
          className="cart-overlay"
          onClick={() => setCarrinhoAberto(false)}
        />

        <div className="cart-sidebar">
          <div className="cart-header">
            <h2 style={{ fontSize: '18px', margin: 0, color: '#3483fa' }}>
              Meu Pedido
            </h2>

            <button
              onClick={() => setCarrinhoAberto(false)}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '28px',
                color: '#000'
              }}
            >
              ✕
            </button>
          </div>

          <div className="cart-content">
            <div className="section-title">ITENS</div>

            {carrinho.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ flex: 1, color: '#000' }}>
                    {item.nome}
                  </span>

                  <strong style={{ color: '#000' }}>
                    R$ {(item.preco * item.qtd).toFixed(2)}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '5px'
                  }}
                >
                  <button
                    className="btn-q"
                    onClick={() => subtrairDoCarrinho(item.nome)}
                  >
                    -
                  </button>

                  <span style={{ color: '#000', fontWeight: 'bold' }}>
                    {item.qtd}
                  </span>

                  <button
                    className="btn-q"
                    onClick={() => adicionarAoCarrinho(item)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="section-title">ENTREGA OU RETIRADA</div>

            <select
              value={entrega.bairro}
              onChange={(e) => {
                const b = TAXAS_ENTREGA.find(t => t.bairro === e.target.value);
                setEntrega({ ...b });
              }}
            >
              {TAXAS_ENTREGA.map(t => (
                <option key={t.bairro} value={t.bairro}>
                  {t.bairro} {t.valor > 0 ? `(R$ ${t.valor.toFixed(2)})` : ''}
                </option>
              ))}
            </select>

            {entrega.valor > 0 && (
              <input
                className="input-checkout"
                placeholder="Rua, número e bairro"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            )}

            <div className="section-title">PAGAMENTO</div>

            <select
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
            >
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão">Cartão</option>
            </select>

            {pagamento === 'Dinheiro' && (
              <input
                type="number"
                className="input-checkout"
                placeholder="Troco para quanto?"
                value={troco}
                onChange={(e) => setTroco(e.target.value)}
              />
            )}
          </div>

          <div className="cart-footer">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px',
                alignItems: 'center'
              }}
            >
              <span style={{ color: '#555', fontWeight: 'bold' }}>
                TOTAL FINAL:
              </span>

              <span className="total-azul">
                R$ {totalGeral.toFixed(2)}
              </span>
            </div>

            <button
              className="btn-finalizar"
              onClick={finalizarPedido}
            >
              Finalizar pelo WhatsApp
            </button>
          </div>
        </div>
      </div>

      {imagemZoom && (
        <div
          className="zoom-overlay"
          onClick={() => setImagemZoom(null)}
        >
          <button
            className="zoom-close"
            onClick={() => setImagemZoom(null)}
          >
            ✕
          </button>

          <img
            src={imagemZoom}
            className="zoom-imagem"
            alt="Zoom do produto"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default App;