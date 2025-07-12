import { useEffect, useState } from 'react';
import axios from 'axios';
import AdotarModal from '../components/AdotarModal';
import { useAuth } from '../contexts/AuthContext';

export default function ListaLivros() {
  const [livros, setLivros] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  const [filtroTitulo, setFiltroTitulo] = useState('');   // ⬅️ NOVO
  const [filtroAutor, setFiltroAutor] = useState('');     // ⬅️ NOVO

  const { usuario, atualizarCreditos } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:3001/livros')
      .then(response => setLivros(response.data))
      .catch(error => console.error('Erro ao buscar livros:', error));
  }, []);

  const handleAdocaoConfirmada = async () => {
    if (!usuario?.nome) {
      alert('Você precisa estar logado para adotar um livro.');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3001/livros/${livroSelecionado.id}/adotar`,
        { adotante: usuario.email }
      );

      if (!res.data.livro) {
        alert('Erro: resposta inválida do servidor.');
        return;
      }

      const livroAtualizado = res.data.livro;
      setLivros(prev =>
        prev.map(l => (l.id === livroAtualizado.id ? livroAtualizado : l))
      );

      await atualizarCreditos(usuario.email);
      setModalAberto(false);
    } catch (err) {
      console.error('Erro ao adotar livro:', err);
      const erroMsg = err.response?.data?.erro || 'Erro ao adotar livro.';
      alert(erroMsg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Livros Disponíveis</h1>

      {/* Campos de filtro */} {/* ⬅️ NOVO */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrar por título"
          value={filtroTitulo}
          onChange={e => setFiltroTitulo(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          placeholder="Filtrar por autor"
          value={filtroAutor}
          onChange={e => setFiltroAutor(e.target.value)}
          className="border p-2 rounded flex-1"
        />
      </div>

      {livros.length === 0 ? (
        <p className="text-gray-500">Nenhum livro disponível.</p>
      ) : (
        <ul className="space-y-4">
          {livros
            .filter(l =>
              !l.adotadoPor &&
              l.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&   // ⬅️ NOVO
              l.autor.toLowerCase().includes(filtroAutor.toLowerCase())        // ⬅️ NOVO
            )
            .map(livro => (
              <li key={livro.id} className="border p-4 rounded">
                <p><strong>Título:</strong> {livro.titulo}</p>
                <p><strong>Autor:</strong> {livro.autor}</p>
                <p><strong>Doador:</strong> {livro.doador}</p>
                <button
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  onClick={() => {
                    setLivroSelecionado(livro);
                    setModalAberto(true);
                  }}
                >
                  Adotar
                </button>
              </li>
            ))}
        </ul>
      )}

      {modalAberto && livroSelecionado && (
        <AdotarModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          onConfirm={handleAdocaoConfirmada}
        />
      )}
    </div>
  );
}