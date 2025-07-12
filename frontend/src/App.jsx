import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ListaLivros      from './pages/ListaLivros';
import CadastroLivro    from './pages/CadastroLivro';
import CadastroUsuario  from './pages/CadastroUsuario';
import Login            from './pages/LoginUsuario';
import MeusLivros       from './pages/MeusLivros';

export default function App() {
  const { usuario, logout, carregando } = useAuth();
  const navigate = useNavigate();

  // Evita renderizar qualquer coisa até terminar de checar o localStorage
  if (carregando) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {usuario && (
        <nav className="mb-4 flex gap-4 items-center">
          <Link to="/"            className="text-blue-600 font-semibold">Livros</Link>
          <Link to="/cadastro"    className="text-blue-600 font-semibold">Cadastrar Livro</Link>
          <Link to="/meus-livros" className="text-blue-600 font-semibold">Meus Livros</Link>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-red-600 font-semibold ml-auto"
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        {/* Rotas públicas */}
        <Route path="/login"            element={<Login />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />

        {/* Rotas privadas */}
        <Route path="/"          element={usuario ? <ListaLivros />   : <Navigate to="/login" />} />
        <Route path="/cadastro"  element={usuario ? <CadastroLivro /> : <Navigate to="/login" />} />
        <Route path="/meus-livros" element={usuario ? <MeusLivros />  : <Navigate to="/login" />} />

        {/* Qualquer outra URL → login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}