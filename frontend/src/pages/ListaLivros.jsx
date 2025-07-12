import { useEffect, useState } from 'react';
import axios from 'axios';
import AdotarModal from '../components/AdotarModal';
import { useAuth } from '../contexts/AuthContext';
import Wave from 'react-wavify';
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoverde.png';

export default function ListaLivros() {
  const [livros, setLivros] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroAutor, setFiltroAutor] = useState('');

  const { usuario, atualizarCreditos } = useAuth();

  useEffect(() => {
    axios
      .get('http://localhost:3001/livros')
      .then((response) => setLivros(response.data))
      .catch((error) => console.error('Erro ao buscar livros:', error));
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
      setLivros((prev) =>
        prev.map((l) => (l.id === livroAtualizado.id ? livroAtualizado : l))
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
    <div className="relative min-h-screen flex flex-col items-center bg-green-700 overflow-hidden px-4 py-10 text-white">
      {/* Onda decorativa */}
      <Wave
        fill="#56c27cff"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Logo */}
      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      {/* Cartão principal */}
      <div className="z-10 w-full max-w-3xl bg-white p-6 rounded shadow text-black">
        <h1 className="text-2xl font-bold mb-4 text-green-700">
          Livros Disponíveis
        </h1>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Filtrar por título"
            value={filtroTitulo}
            onChange={(e) => setFiltroTitulo(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            type="text"
            placeholder="Filtrar por autor"
            value={filtroAutor}
            onChange={(e) => setFiltroAutor(e.target.value)}
            className="border p-2 rounded flex-1"
          />
        </div>

        {livros.length === 0 ? (
          <p className="text-gray-500">Nenhum livro disponível.</p>
        ) : (
          <ul className="space-y-4">
            {livros
              .filter(
                (l) =>
                  !l.adotadoPor &&
                  l.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
                  l.autor.toLowerCase().includes(filtroAutor.toLowerCase())
              )
              .map((livro) => (
                <li key={livro.id} className="border p-4 rounded">
                  <p>
                    <strong>Título:</strong> {livro.titulo}
                  </p>
                  <p>
                    <strong>Autor:</strong> {livro.autor}
                  </p>
                  <p>
                    <strong>Doador:</strong> {livro.doador}
                  </p>
                  <button
                    className="mt-2 bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800"
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
      </div>

      {/* Modal de confirmação */}
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
