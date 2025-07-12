import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Wave from 'react-wavify'; // ✅ Importa a onda
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoverde.png';

export default function MeusLivros() {
    const { usuario } = useAuth();
    const [livrosDoados, setLivrosDoados] = useState([]);
    const [livrosAdotados, setLivrosAdotados] = useState([]);

    useEffect(() => {
        if (!usuario) return;

        axios.get(`http://localhost:3001/livros/meus-doacoes/${usuario.chaveStellar}`)
            .then(res => setLivrosDoados(res.data))
            .catch(err => console.error('Erro ao buscar livros doados:', err));

        axios.get(`http://localhost:3001/livros/meus-adotados/${usuario.email}`)
            .then(res => setLivrosAdotados(res.data))
            .catch(err => console.error('Erro ao buscar livros adotados:', err));
    }, [usuario]);

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
                    {livrosDoados.length === 0 ? (
                        <p className="text-gray-500">Você ainda não doou nenhum livro.</p>
                    ) : (
                        <ul className="space-y-2">
                            {livrosDoados.map(livro => (
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
                    {livrosAdotados.length === 0 ? (
                        <p className="text-gray-500">Você ainda não adotou nenhum livro.</p>
                    ) : (
                        <ul className="space-y-2">
                            {livrosAdotados.map(livro => (
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
