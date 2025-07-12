import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function MeusLivros() {
    const { usuario } = useAuth();
    const [livrosDoados, setLivrosDoados] = useState([]);
    const [livrosAdotados, setLivrosAdotados] = useState([]);

    useEffect(() => {
        if (!usuario) return;

        axios.get(`http://localhost:3001/livros/meus-doacoes/${usuario.chaveStellar}`)
            .then(res => setLivrosDoados(res.data))
            .catch(err => console.error('Erro ao buscar livros doados:', err));

        axios.get(`http://localhost:3001/livros/meus-adotados/${usuario.nome}`)
            .then(res => setLivrosAdotados(res.data))
            .catch(err => console.error('Erro ao buscar livros adotados:', err));
    }, [usuario]);

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow space-y-6">
            <h1 className="text-2xl font-bold">Meus Livros</h1>

            <section>
                <h2 className="text-xl font-semibold mb-2">Livros Doados</h2>
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

            <section>
                <h2 className="text-xl font-semibold mb-2">Livros Adotados</h2>
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
    );
}
