import { useEffect, useState } from 'react';
import axios from 'axios';
import AdotarModal from '../components/AdotarModal';
import { useAuth } from '../contexts/AuthContext'; // Caminho corrigido
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoazul.png';

export default function ListaLivros() {
  const [livros, setLivros] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroAutor, setFiltroAutor] = useState('');

  // Adicionar fetchMeusLivros do useAuth
  const { usuario, atualizarCreditos, fetchMeusLivros } = useAuth(); 

  // Função para buscar os livros disponíveis (chamada no useEffect e após adoção)
  const fetchLivrosDisponiveis = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/livros');
      setLivros(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros disponíveis:', error);
    }
  };

  useEffect(() => {
    fetchLivrosDisponiveis(); // Chama a função para carregar os livros disponíveis na montagem
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  const handleAdocaoConfirmada = async () => {
    if (!usuario?.email) { // Use usuario.email para verificar se está logado
      alert('Você precisa estar logado para adotar um livro.');
      return;
    }

    try {
      const res = await axios.post(
        // Correção da URL para incluir /api/ e o ID do livro
        `http://localhost:3001/api/livros/${livroSelecionado.id}/adotar`, 
        { adotante: usuario.email } // Envia o email do usuário logado como adotante
      );

      if (!res.data.livro) {
        alert('Erro: resposta inválida do servidor.');
        return;
      }

      // const livroAtualizado = res.data.livro; // Não precisamos mapear manualmente agora
      // setLivros((prev) =>
      //   prev.map((l) => (l.id === livroAtualizado.id ? livroAtualizado : l))
      // );

      // --- AQUI ESTÁ A ATUALIZAÇÃO PARA OS CRÉDITOS E LISTAS DE LIVROS DO USUÁRIO ---
      if (usuario) { // Garante que o usuário está logado
        await atualizarCreditos(usuario.email); // Atualiza os créditos do adotante
        await fetchMeusLivros(usuario.email);   // <<< CHAMA ISSO AQUI! Re-busca os livros doados/adotados do usuário
      }
      await fetchLivrosDisponiveis(); // <--- CHAMA ISSO AQUI! Atualiza a lista de livros disponíveis (o adotado sumirá)
      // --- FIM DA ATUALIZAÇÃO ---

      setModalAberto(false); // Fecha o modal
      alert('Livro adotado com sucesso!'); // Feedback ao usuário
      
    } catch (err) {
      console.error('Erro ao adotar livro:', err);
      // Ajusta a mensagem de erro para o usuário
      const erroMsg = err.response?.data?.erro || 'Erro ao processar adoção do livro. Crédito devolvido.';
      alert(erroMsg);
      // Se a adoção falhou e o crédito foi devolvido, pode ser útil atualizar os créditos
      if (usuario && erroMsg.includes('Crédito devolvido')) {
          atualizarCreditos(usuario.email); // Re-fetch para refletir o crédito devolvido
      }
    }
  };

  // Funções de filtro (mantidas como estão)
  const livrosFiltrados = livros.filter(
    (l) =>
      !l.adotadoPor && // Apenas livros não adotados
      l.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
      l.autor.toLowerCase().includes(filtroAutor.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-blue-300 overflow-hidden px-4 py-10 text-white">

      {/* Logo */}
      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      {/* Cartão principal */}
      <div className="z-10 w-full max-w-3xl bg-white p-6 rounded shadow text-black">
        <h1 className="text-2xl font-bold mb-4 text-blue-900">
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

        {livrosFiltrados.length === 0 ? ( // Use livrosFiltrados aqui
          <p className="text-gray-500">Nenhum livro disponível que corresponda aos filtros.</p>
        ) : (
          <ul className="space-y-4">
            {livrosFiltrados.map((livro) => ( // Renderize livrosFiltrados
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
                    className="mt-2 bg-blue-900 text-white px-4 py-1 rounded hover:bg-blue-900"
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