import { useEffect, useState } from 'react';
import axios from 'axios';
import AdotarModal from '../components/AdotarModal';

export default function ListaLivros() {
  const [livros, setLivros] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/livros')
      .then(response => {
        setLivros(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar livros:', error);
      });
  }, []);

  const handleAdotar = (id, adotante) => {
    axios.post(`http://localhost:3001/livros/${id}/adotar`, { adotante })
      .then(res => {
        // Atualiza o livro na lista local com a resposta da adoção
        const livroAtualizado = res.data.livro;
        setLivros(prev =>
          prev.map(l => (l.id === livroAtualizado.id ? livroAtualizado : l))
        );
        setModalAberto(false);
      })
      .catch(err => {
        console.error('Erro ao adotar livro:', err);
        alert('Erro ao adotar livro.');
      });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Livros Disponíveis</h1>
      {livros.length === 0 ? (
        <p className="text-gray-500">Nenhum livro disponível.</p>
      ) : (
        <ul className="space-y-4">
          {livros
            .filter(livro => !livro.adotadoPor)
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
          livro={livroSelecionado}
          onClose={() => setModalAberto(false)}
          onAdotar={handleAdotar}
        />
      )}
    </div>
  );
}