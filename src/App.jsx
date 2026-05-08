import React, { useState, useEffect, useMemo } from 'react';

const App = () => {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const [entrega, setEntrega] = useState({ bairro: 'Retirar na Loja (Pronto em ~1h)', valor: 0 });
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState('PIX');
  const [troco, setTroco] = useState('');

  const TELEFONE_WHATSAPP = '5511999999999'; // AJUSTE SEU NÚMERO
  const categorias = ['Todos', 'Papelaria', 'Armarinhos', 'Brinquedos', 'Variedades', 'Utensílios', 'Utilidades'];
  
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
    const termo = busca.toLowerCase();
    const cat = categoriaAtiva.toLowerCase();
    return produtos.filter(p => {
      const mBusca = (p.nome || '').toLowerCase().includes(termo);
      const mCat = categoriaAtiva === 'Todos' || (p.categoria || '').toLowerCase().includes(cat);
      return mBusca && mCat;
    });
  }, [produtos, busca, categoriaAtiva]);

  const adicionarAoCarrinho = (p) => {
    setCarrinho(prev => {
      const itemExiste = prev.find(item => item.nome === p.nome);
      if (itemExiste) return prev.map(item => item.nome === p.nome ? { ...item, qtd: item.qtd + 1 } : item);
      return [...prev, { ...p, qtd: 1 }];
    });
  };

  const subtrairDoCarrinho = (nome) => {
    setCarrinho(prev => {
      const item = prev.find(i => i.nome === nome);
      if (item && item.qtd > 1) return prev.map(i => i.nome === nome ? { ...i, qtd: i.qtd - 1 } : i);
      return prev.filter(i => i.nome !== nome);
    });
  };

  const totalProdutos = carrinho.reduce((acc, item) => acc + (Number(item.preco) * item.qtd), 0);
  const totalGeral = totalProdutos + entrega.valor;

  const finalizarPedido = () => {
    let mensagem = `*Novo Pedido - Bazar da Inês*\n\n`;
    mensagem += `*PRODUTOS:*\n`;
    carrinho.forEach(item => {
      mensagem += `• ${item.qtd}x ${item.nome} (R$ ${(item.preco * item.qtd).toFixed(2)})\n`;
    });
    mensagem += `\n*RESUMO:*`;
    mensagem += `\nSubtotal: R$ ${totalProdutos.toFixed(2)}`;
    mensagem += `\nOpção: ${entrega.bairro}`;
    if (entrega.valor > 0) {
        mensagem += `\nTaxa de Entrega: R$ ${entrega.valor.toFixed(2)}`;
        if (endereco) mensagem += `\nEndereço: ${endereco}`;
    }
    mensagem += `\n*TOTAL: R$ ${totalGeral.toFixed(2)}*`;
    mensagem += `\n\n*PAGAMENTO:* ${pagamento}`;
    if (pagamento === 'Dinheiro' && troco) mensagem += ` (Troco para R$ ${troco})`;
    
    window.open(`https://wa.me/${TELEFONE_WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  return (
    <>
      <style>{`
        :root { color-scheme: light; }
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; position: fixed; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f7f7fa; }
        .app-container { display: flex; flex-direction: column; height: 100dvh; width: 100vw; }
        
        header { flex-shrink: 0; background: #ffffff; padding: 15px 15px 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); z-index: 10; }
        .header-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .logo { width: 40px; height: 40px; border-radius: 50%; background: #eee; overflow: hidden; border: 1px solid #3483fa; }
        .logo img { width: 100%; height: 100%; object-fit: cover; }
        .header-title { font-size: 22px; margin: 0; color: #3483fa !important; font-weight: 800; }
        
        .input-busca { 
          width: 100%; height: 45px; padding: 0 15px; border: 2px solid #3483fa; border-radius: 10px; 
          font-size: 16px !important; font-weight: 600 !important; outline: none; box-sizing: border-box; 
          color: #000000 !important; background-color: #ffffff !important;
          -webkit-appearance: none; opacity: 1 !important;
        }
        .input-busca::placeholder { color: #666 !important; opacity: 1 !important; }

        .categorias-scroll { display: flex; overflow-x: auto; padding: 10px 0; gap: 8px; }
        .btn-categoria { padding: 8px 15px; border: 1px solid #ddd; background: #fff; border-radius: 20px; font-size: 13px; white-space: nowrap; color: #555; font-weight: 500; }
        .btn-categoria.ativo { background: #3483fa; color: #fff; border-color: #3483fa; }

        main { flex-grow: 1; overflow-y: auto; padding: 15px; padding-bottom: 100px; -webkit-overflow-scrolling: touch; }
        .card { background: #fff; padding: 12px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .card-corpo { display: flex; align-items: center; gap: 12px; }
        .foto-produto { width: 65px; height: 65px; border-radius: 6px; overflow: hidden; border: 1px solid #eee; }
        .foto-produto img { width: 100%; height: 100%; object-fit: cover; }
        .btn-add { margin-top: 10px; width: 100%; padding: 12px; border: none; border-radius: 6px; background: #3483fa; color: #fff; font-weight: bold; }

        .floating-cart { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: #2ecc71; border-radius: 50%; color: #fff; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 99; }
        .cart-count { position: absolute; top: -5px; right: -5px; background: #ff4757; width: 22px; height: 22px; border-radius: 50%; font-size: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; font-weight: bold; }

        .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: ${carrinhoAberto ? 'block' : 'none'}; }
        .cart-sidebar { position: fixed; right: 0; top: 0; width: 90%; height: 100%; background: #ffffff; z-index: 1001; transition: 0.3s; transform: ${carrinhoAberto ? 'translateX(0)' : 'translateX(100%)'}; display: flex; flex-direction: column; }
        .cart-header { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .cart-content { flex-grow: 1; overflow-y: auto; padding: 15px; background: #fff; }
        
        .section-title { font-size: 14px; font-weight: bold; margin: 20px 0 10px; color: #3483fa; border-left: 4px solid #3483fa; padding-left: 8px; }
        select, .input-checkout { 
          width: 100%; height: 45px; padding: 0 10px; border-radius: 8px; border: 1px solid #ccc; 
          margin-bottom: 10px; font-size: 14px; background-color: #ffffff !important; 
          box-sizing: border-box; color: #000000 !important; -webkit-appearance: none; opacity: 1 !important;
        }
        .cart-item { border-bottom: 1px solid #f5f5f5; padding: 10px 0; color: #000; }
        .btn-q { width: 34px; height: 34px; border-radius: 50%; border: 1px solid #ddd; background: #fff; color: #000; font-weight: bold; font-size: 18px; }

        .cart-footer { padding: 15px; background: #ffffff; border-top: 1px solid #eee; }
        .total-azul { color: #3483fa; font-size: 24px; font-weight: 800; }
        .btn-finalizar { width: 100%; padding: 15px; background: #25d366; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
      `}</style>

      <div className="app-container">
        <header>
          <div className="header-top">
            <div className="logo"><img src="/logo.png" alt="B" onError={(e)=>e.target.style.display='none'}/></div>
            <h1 className="header-title">Bazar da Inês</h1>
          </div>
          <input 
            type="text" 
            className="input-busca" 
            placeholder="Digite para buscar..." 
            value={busca} 
            onChange={(e)=>setBusca(e.target.value)} 
          />
          <div className="categorias-scroll">
            {categorias.map(cat => (
              <button key={cat} className={`btn-categoria ${categoriaAtiva === cat ? 'ativo' : ''}`} onClick={()=>setCategoriaAtiva(cat)}>{cat}</button>
            ))}
          </div>
        </header>

        <main>
          {produtosFiltrados.map((p, i) => (
            <div key={i} className="card">
              <div className="card-corpo">
                <div className="foto-produto">
                  <img src={p.imagem_url || p.foto_url || p.imagem || '/sem-imagem.png'} loading="lazy" onError={(e)=>e.target.src='/sem-imagem.png'} />
                </div>
                <div className="info-produto">
                  <strong style={{fontSize:'15px', color:'#000'}}>{p.nome}</strong>
                  <span style={{fontWeight:'bold', color:'#333', fontSize:'16px'}}>R$ {Number(p.preco).toFixed(2)}</span>
                </div>
              </div>
              <button className="btn-add" onClick={()=>adicionarAoCarrinho(p)}>Adicionar ao Carrinho</button>
            </div>
          ))}
        </main>

        {carrinho.length > 0 && (
          <button className="floating-cart" onClick={()=>setCarrinhoAberto(true)}>
            🛒 <div className="cart-count">{carrinho.reduce((a,b)=>a+b.qtd, 0)}</div>
          </button>
        )}

        <div className="cart-overlay" onClick={() => setCarrinhoAberto(false)} />
        <div className="cart-sidebar">
          <div className="cart-header">
            <h2 style={{fontSize:'18px', margin:0, color:'#3483fa'}}>Meu Pedido</h2>
            <button onClick={() => setCarrinhoAberto(false)} style={{border:'none', background:'none', fontSize:'28px', color: '#000'}}>✕</button>
          </div>

          <div className="cart-content">
            <div className="section-title">ITENS</div>
            {carrinho.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span style={{flex: 1, color:'#000'}}>{item.nome}</span>
                  <strong style={{color:'#000'}}>R$ {(item.preco * item.qtd).toFixed(2)}</strong>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'5px'}}>
                  <button className="btn-q" onClick={()=>subtrairDoCarrinho(item.nome)}>-</button>
                  <span style={{color:'#000', fontWeight:'bold'}}>{item.qtd}</span>
                  <button className="btn-q" onClick={()=>adicionarAoCarrinho(item)}>+</button>
                </div>
              </div>
            ))}

            <div className="section-title">ENTREGA OU RETIRADA</div>
            <select value={entrega.bairro} onChange={(e) => {
              const b = TAXAS_ENTREGA.find(t => t.bairro === e.target.value);
              setEntrega({ ...b });
            }}>
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
                onChange={(e)=>setEndereco(e.target.value)}
              />
            )}

            <div className="section-title">PAGAMENTO</div>
            <select value={pagamento} onChange={(e)=>setPagamento(e.target.value)}>
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
                onChange={(e)=>setTroco(e.target.value)} 
              />
            )}
          </div>

          <div className="cart-footer">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', alignItems:'center'}}>
              <span style={{color:'#555', fontWeight:'bold'}}>TOTAL FINAL:</span>
              <span className="total-azul">R$ {totalGeral.toFixed(2)}</span>
            </div>
            <button className="btn-finalizar" onClick={finalizarPedido}>
              Finalizar pelo WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;