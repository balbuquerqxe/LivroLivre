import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import ListaLivros from './pages/ListaLivros';
import CadastroLivro from './pages/CadastroLivro';
import CadastroUsuario from './pages/CadastroUsuario';
import Login from './pages/LoginUsuario';
import MeusLivros from './pages/MeusLivros';
import TelaInicial from './pages/TelaInicial'; // ✅ Importação da nova tela

export default function App() {
  const { usuario, logout, carregando } = useAuth();
  const navigate = useNavigate();

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
        {/* Tela inicial pública */}
        <Route path="/inicio" element={<TelaInicial />} />

        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />

        {/* Rotas privadas */}
        <Route path="/" element={usuario ? <ListaLivros /> : <Navigate to="/inicio" />} />
        <Route path="/cadastro" element={usuario ? <CadastroLivro /> : <Navigate to="/inicio" />} />
        <Route path="/meus-livros" element={usuario ? <MeusLivros /> : <Navigate to="/inicio" />} />

        {/* Qualquer outra URL → /inicio */}
        <Route path="*" element={<Navigate to="/inicio" />} />
      </Routes>
    </div>
  );
}
