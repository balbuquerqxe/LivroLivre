import { Routes, Route, Link } from 'react-router-dom';
import ListaLivros from './pages/ListaLivros';
import CadastroLivro from './pages/CadastroLivro';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <nav className="mb-4 flex gap-4">
        <Link to="/" className="text-blue-600 font-semibold">Livros</Link>
        <Link to="/cadastro" className="text-blue-600 font-semibold">Cadastrar Livro</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ListaLivros />} />
        <Route path="/cadastro" element={<CadastroLivro />} />
      </Routes>
    </div>
  );
}
