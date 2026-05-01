import { useEffect, useState } from "react";

type Produto = {
  codigo: string;
  nome: string;
  preco: number;
  categoria: string;
  imagem: string;
};

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    try {
      const res = await fetch("http://localhost:3000/produtos");
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      console.error(err);
    }
  }

  const filtrados = produtos.filter((p) =>
  p.nome.toLowerCase().includes(busca.toLowerCase()) ||
  p.codigo.includes(busca)
);

  return (
    <div style={{ padding: 20 }}>
      <h1>Bazar da Inês</h1>

      <input
        placeholder="Buscar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />

      <p>
  {produtos.length === 0
    ? "Carregando produtos..."
    : `${produtos.length} produtos encontrados`}
</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {filtrados.map((p) => (
          <div key={p.codigo} style={{ border: "1px solid #ccc", padding: 10 }}>
            <img
              src={p.imagem}
              alt={p.nome}
              style={{ width: "100%", height: 150, objectFit: "contain" }}
              onError={(e) => (e.currentTarget.src = "/sem-imagem.png")}
            />
            <p><strong>{p.codigo}</strong></p>
<p>{p.nome}</p>
<strong>R$ {p.preco}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}