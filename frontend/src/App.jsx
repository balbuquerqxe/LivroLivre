import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ListaLivros from './pages/ListaLivros';
import CadastroLivro from './pages/CadastroLivro';
import CadastroUsuario from './pages/CadastroUsuario';
import Login from './pages/LoginUsuario';
import MeusLivros from './pages/MeusLivros';

export default function App() {
  const { usuario, logout, carregando } = useAuth();
  const navigate = useNavigate();

  // Evita renderizar qualquer coisa até terminar de checar o localStorage
  if (carregando) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {usuario && (
        <nav className="mb-4 flex items-center gap-4">
          <Link to="/">Livros</Link>
          <Link to="/cadastro">Cadastrar Livro</Link>
          <Link to="/meus-livros">Meus Livros</Link>

          <span className="ml-auto font-semibold text-gray-800">
            {usuario.nome} — Créditos: {usuario.creditos ?? 0}
          </span>

          <button onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </button>
        </nav>
      )}

      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />

        {/* Rotas privadas */}
        <Route path="/" element={usuario ? <ListaLivros /> : <Navigate to="/login" />} />
        <Route path="/cadastro" element={usuario ? <CadastroLivro /> : <Navigate to="/login" />} />
        <Route path="/meus-livros" element={usuario ? <MeusLivros /> : <Navigate to="/login" />} />

        {/* Qualquer outra URL → login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}