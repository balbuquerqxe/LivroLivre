import { useEffect, useState } from 'react'; // 'useState' não será mais necessário para as listas, mas pode ser para outros estados locais
import axios from 'axios'; // 'axios' não será mais necessário aqui se o AuthContext faz as chamadas
import { useAuth } from '../contexts/AuthContext'; // Importa useAuth do seu contexto
import Wave from 'react-wavify'; 
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoverde.png';

export default function MeusLivros() {
    // --- MUDANÇA PRINCIPAL: Recebe as listas e o estado de carregamento do AuthContext ---
    const { 
        usuario, 
        meusLivrosDoados,        // Lista de livros doados do contexto
        meusLivrosAdotados,      // Lista de livros adotados do contexto
        carregando,              // Estado de carregamento do contexto
        fetchMeusLivros          // Função para forçar um re-fetch (útil se o usuário for direto para esta página)
    } = useAuth();
    // --- FIM MUDANÇA PRINCIPAL ---

    // Este useEffect agora é mais para garantir que as listas sejam carregadas se o usuário
    // vier diretamente para esta página sem passar pelo login/cadastro de livro que já acionou fetchMeusLivros
    useEffect(() => {
        if (!carregando && usuario?.email && (meusLivrosDoados.length === 0 && meusLivrosAdotados.length === 0)) {
            // Se o contexto terminou de carregar, há um usuário logado, e as listas ainda estão vazias,
            // força um fetch para preenchê-las.
            fetchMeusLivros(usuario.email);
        }
    }, [carregando, usuario, meusLivrosDoados.length, meusLivrosAdotados.length, fetchMeusLivros]);


    // --- Lógica de carregamento e usuário não logado ---
    if (carregando) {
        return (
            <div className="relative min-h-screen bg-green-700 flex flex-col items-center justify-center px-4 py-10 text-white">
                <p>Carregando seus livros...</p>
                <img src={logo} alt="Logo LivroLivre" className="w-24 h-auto mt-4" />
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="relative min-h-screen bg-green-700 flex flex-col items-center justify-center px-4 py-10 text-white">
                <p className="text-lg">Você precisa estar logado para ver seus livros.</p>
                <button 
                    onClick={() => window.location.href = '/login'} // Redireciona para o login
                    className="mt-4 bg-white text-green-700 px-6 py-2 rounded font-semibold hover:bg-gray-100"
                >
                    Fazer Login
                </button>
            </div>
        );
    }
    // --- FIM Lógica de carregamento e usuário não logado ---


    return (
        <div className="relative min-h-screen bg-green-700 flex flex-col items-center justify-start px-4 py-10 text-white overflow-hidden">
            {/* Logo */}
            <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

            {/* Conteúdo */}
            <div className="z-10 bg-white text-left text-black w-full max-w-3xl p-6 rounded shadow space-y-6">
                <h1 className="text-2xl font-bold text-green-700 text-center">Meus Livros</h1>

                {/* Livros Doados */}
                <section>
                    <h2 className="text-xl font-semibold mb-2 text-green-700">Livros Doados</h2>
                    {meusLivrosDoados.length === 0 ? ( // Usa a lista do contexto
                        <p className="text-gray-500">Você ainda não doou nenhum livro.</p>
                    ) : (
                        <ul className="space-y-2">
                            {meusLivrosDoados.map(livro => ( // Mapeia a lista do contexto
                                <li key={livro.id} className="border rounded p-3">
                                    <p><strong>Título:</strong> {livro.titulo}</p>
                                    <p><strong>Autor:</strong> {livro.autor}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Livros Adotados */}
                <section>
                    <h2 className="text-xl font-semibold mb-2 text-green-700">Livros Adotados</h2>
                    {meusLivrosAdotados.length === 0 ? ( // Usa a lista do contexto
                        <p className="text-gray-500">Você ainda não adotou nenhum livro.</p>
                    ) : (
                        <ul className="space-y-2">
                            {meusLivrosAdotados.map(livro => ( // Mapeia a lista do contexto
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

            {/* Onda */}
            <Wave
                fill="#56c27cff"
                paused={false}
                options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
                className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
            />
        </div>
    );
}