import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ListaLivros from './pages/ListaLivros';
import CadastroLivro from './pages/CadastroLivro';
import CadastroUsuario from './pages/CadastroUsuario';
import Login from "./pages/LoginUsuario";

export default function App() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {usuario && (
        <nav className="mb-4 flex gap-4 items-center">
          <Link to="/" className="text-blue-600 font-semibold">Livros</Link>
          <Link to="/cadastro" className="text-blue-600 font-semibold">Cadastrar Livro</Link>
          <button
            onClick={logout}
            className="text-red-600 font-semibold ml-auto"
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        {/* Acesso público */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />

        {/* Acesso privado */}
        <Route path="/" element={usuario ? <ListaLivros /> : <Navigate to="/login" />} />
        <Route path="/cadastro" element={usuario ? <CadastroLivro /> : <Navigate to="/login" />} />
        
        {/* Qualquer outro caminho redireciona para login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}
