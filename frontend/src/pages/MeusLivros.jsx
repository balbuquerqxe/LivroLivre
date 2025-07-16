// Importa os hooks do React
import { useEffect, useState } from 'react';

// Importa o contexto de autenticação
import { useAuth } from '../contexts/AuthContext';

// Importa a onda animada
import Wave from 'react-wavify';

// Importa o logo amarelo
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoamarelo.png';

export default function MeusLivros() {
  // Pega os dados do usuário e listas diretamente do contexto
  const {
    usuario,
    meusLivrosDoados,
    meusLivrosAdotados,
    carregando,
    fetchMeusLivros,
  } = useAuth();

  // Quando a página carregar, verifica se precisa buscar os livros do usuário
  useEffect(() => {
    if (
      !carregando &&
      usuario?.email &&
      meusLivrosDoados.length === 0 &&
      meusLivrosAdotados.length === 0
    ) {
      fetchMeusLivros(usuario.email);
    }
  }, [
    carregando,
    usuario,
    meusLivrosDoados.length,
    meusLivrosAdotados.length,
    fetchMeusLivros,
  ]);

  // Enquanto estiver carregando, mostra tela de espera
  if (carregando) {
    return (
      <div className="relative min-h-screen bg-yellow-700 flex flex-col items-center justify-center px-4 py-10 text-white">
        <p>Carregando seus livros...</p>
        <img src={logo} alt="Logo LivroLivre" className="w-24 h-auto mt-4" />
      </div>
    );
  }

  // Se o usuário não estiver logado, pede para fazer login
  if (!usuario) {
    return (
      <div className="relative min-h-screen bg-yellow-700 flex flex-col items-center justify-center px-4 py-10 text-white">
        <p className="text-lg">Você precisa estar logado para ver seus livros.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="mt-4 bg-white text-yellow-700 px-6 py-2 rounded font-semibold hover:bg-gray-100"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-yellow-100 flex flex-col items-center justify-start px-4 py-10 text-white overflow-hidden">

      {/* Logo do topo */}
      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      {/* Card com os livros doados e adotados */}
      <div className="z-10 bg-white text-left text-black w-full max-w-3xl p-6 rounded shadow space-y-6">
        <h1 className="text-2xl font-bold text-yellow-700 text">Meus Livros</h1>

        {/* Lista dos livros doados */}
        <section>
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Livros Doados</h2>
          {meusLivrosDoados.length === 0 ? (
            <p className="text-gray-500">Você ainda não doou nenhum livro.</p>
          ) : (
            <ul className="space-y-2">
              {meusLivrosDoados.map(livro => (
                <li key={livro.id} className="border rounded p-3">
                  <p><strong>Título:</strong> {livro.titulo}</p>
                  <p><strong>Autor:</strong> {livro.autor}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Lista dos livros adotados */}
        <section>
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Livros Adotados</h2>
          {meusLivrosAdotados.length === 0 ? (
            <p className="text-gray-500">Você ainda não adotou nenhum livro.</p>
          ) : (
            <ul className="space-y-2">
              {meusLivrosAdotados.map(livro => (
                <li key={livro.id} className="border rounded p-3">
                  <p><strong>Título:</strong> {livro.titulo}</p>
                  <p><strong>Autor:</strong> {livro.autor}</p>
                  <p><strong>Doador:</strong> {livro.doador}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Onda no fundo da página */}
      <Wave
        fill="#e9cf7aff"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />
    </div>
  );
}
