// frontend/src/App.jsx

import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import ListaLivros from './pages/ListaLivros';
import CadastroLivro from './pages/CadastroLivro';
import CadastroUsuario from './pages/CadastroUsuario';
import Login from './pages/LoginUsuario';
import MeusLivros from './pages/MeusLivros';
import TelaInicial from './pages/TelaInicial';
import MeusChats from './pages/meusChats';
import ChatDetalhado from './pages/ChatDetalhado';

export default function App() {
  const { usuario, logout, carregando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (carregando) return null;

  // Define a aba ativa
  const abaAtiva = location.pathname;

  const linkBase =
    'px-3 py-1 rounded hover:bg-gray-400 transition-colors duration-150';

  function classeLink(path, corAtiva = 'bg-blue-600 text-white') {
    return abaAtiva === path ? `${linkBase} ${corAtiva}` : `${linkBase} text-black`;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {usuario && (
        <nav className="mb-4 flex items-center gap-2">
          <Link to="/" className={classeLink('/')}>Livros</Link>
          <Link to="/cadastro" className={classeLink('/cadastro', 'bg-pink-700 text-white')}>
            Cadastrar Livro
          </Link>
          <Link to="/meus-livros" className={classeLink('/meus-livros', 'bg-yellow-600 text-white')}>
            Meus Livros
          </Link>
          <Link to="/meus-chats" className={classeLink('/meus-chats', 'bg-green-700 text-white')}>
            Meus Chats
          </Link>

          <span className="ml-auto font-semibold text-gray-800">
            {usuario.nome} — Créditos: {usuario.creditos ?? 0}
          </span>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="ml-4 font-semibold text-red-600 hover:text-red-800 transition-colors"
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/inicio" element={<TelaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/" element={usuario ? <ListaLivros /> : <Navigate to="/inicio" />} />
        <Route path="/cadastro" element={usuario ? <CadastroLivro /> : <Navigate to="/inicio" />} />
        <Route path="/meus-livros" element={usuario ? <MeusLivros /> : <Navigate to="/inicio" />} />
        <Route path="/meus-chats" element={usuario ? <MeusChats /> : <Navigate to="/inicio" />} />
        <Route path="/chat/:chatId" element={usuario ? <ChatDetalhado /> : <Navigate to="/inicio" />} />
        <Route path="*" element={<Navigate to="/inicio" />} />
      </Routes>
    </div>
  );
}
