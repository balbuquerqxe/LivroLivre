// Hooks e bibliotecas necessárias
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdotarModal from '../components/AdotarModal';          // Modal de confirmação
import { useAuth } from '../contexts/AuthContext';            // Contexto de autenticação
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoazul1.png';
import Wave from 'react-wavify';

// Componente principal
export default function ListaLivros() {
  
  // Estado que armazena todos os livros disponíveis
  const [livros, setLivros] = useState([]);

  // Controle do modal de adoção
  const [modalAberto, setModalAberto] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  // Filtros de pesquisa
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroAutor, setFiltroAutor] = useState('');

  // Usuário e funções auxiliares do contexto
  const { usuario, atualizarCreditos, fetchMeusLivros } = useAuth(); 

  // Busca os livros disponíveis no backend
  const fetchLivrosDisponiveis = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/livros');
      setLivros(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros disponíveis:', error);
    }
  };

  // Executa a busca ao carregar a página
  useEffect(() => {
    fetchLivrosDisponiveis();
  }, []);

  // Quando a pessoa confirma que quer adotar o livro
  const handleAdocaoConfirmada = async () => {
    if (!usuario?.email) {
      alert('Você precisa estar logado para adotar um livro.');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3001/api/livros/${livroSelecionado.id}/adotar`,
        { adotante: usuario.email }
      );

      // Confirma se o backend retornou o livro
      if (!res.data.livro) {
        alert('Erro: resposta inválida do servidor.');
        return;
      }

      // Atualiza créditos, livros e lista
      if (usuario) {
        await atualizarCreditos(usuario.email);
        await fetchMeusLivros(usuario.email);
      }
      await fetchLivrosDisponiveis();

      // Fecha o modal e avisa sucesso
      setModalAberto(false);
      alert('Livro adotado com sucesso!');
    } catch (err) {
      console.error('Erro ao adotar livro:', err);
      const erroMsg = err.response?.data?.erro || 'Erro ao processar adoção do livro. Crédito devolvido.';
      alert(erroMsg);
      
      // Se deu erro e devolveu crédito, atualiza mesmo assim
      if (usuario && erroMsg.includes('Crédito devolvido')) {
        atualizarCreditos(usuario.email);
      }
    }
  };

  // Aplica os filtros de título e autor
  const livrosFiltrados = livros.filter(
    (l) =>
      !l.adotadoPor &&
      l.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
      l.autor.toLowerCase().includes(filtroAutor.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-blue-300 overflow-hidden px-4 py-10 text-white">

      {/* Logo do LivroLivre */}
      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      {/* Card principal com lista e filtros */}
      <div className="z-10 w-full max-w-3xl bg-white p-6 rounded shadow text-black">
        <h1 className="text-2xl font-bold mb-4 text-blue-900">
          Livros Disponíveis
        </h1>

        {/* Filtros de busca */}
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

        {/* Lista de livros */}
        {livrosFiltrados.length === 0 ? (
          <p className="text-gray-500">Nenhum livro disponível que corresponda aos filtros.</p>
        ) : (
          <ul className="space-y-4">
            {livrosFiltrados.map((livro) => (
              <li key={livro.id} className="border p-4 rounded flex gap-4 items-center">
                
                {/* Imagem da capa */}
                <img
                  src={
                    livro.imagem
                      ? `http://localhost:3001/${livro.imagem}`
                      : '/capa_padrao.png'
                  }
                  alt={`Capa de ${livro.titulo}`}
                  className="w-24 h-32 object-cover rounded shadow"
                />

                {/* Informações do livro */}
                <div className="flex-1">
                  <p><strong>Título:</strong> {livro.titulo}</p>
                  <p><strong>Autor:</strong> {livro.autor}</p>
                  <p><strong>Doador:</strong> {livro.doador}</p>
                  <button
                    className="mt-2 bg-blue-900 text-white px-4 py-1 rounded hover:bg-blue-800"
                    onClick={() => {
                      setLivroSelecionado(livro);
                      setModalAberto(true);
                    }}
                  >
                    Adotar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de confirmação de adoção */}
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
