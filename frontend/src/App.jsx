import { Routes, Route, Link } from 'react-router-dom';
import ListaLivros from './pages/ListaLivros';
import CadastroLivro from './pages/CadastroLivro';
import CadastroUsuario from './pages/CadastroUsuario';
import LoginUsuario from './pages/LoginUsuario';


export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <nav className="mb-4 flex gap-4">
        <Link to="/" className="text-blue-600 font-semibold">Livros</Link>
        <Link to="/cadastro" className="text-blue-600 font-semibold">Cadastrar Livro</Link>
        <Link to="/cadastro-usuario" className="text-blue-600 font-semibold">Cadastrar Usuário</Link>
        <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ListaLivros />} />
        <Route path="/cadastro" element={<CadastroLivro />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/login" element={<LoginUsuario />} />
      </Routes>
    </div>
  );
}
