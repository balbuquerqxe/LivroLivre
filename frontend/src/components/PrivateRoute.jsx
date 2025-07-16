// Importa o componente de redirecionamento do React Router
import { Navigate } from 'react-router-dom';

// Importa o contexto de autenticação para saber se o usuário está logado
import { useAuth } from '../contexts/AuthContext';

// Componente que protege rotas privadas
export default function PrivateRoute({ children }) {
  const { usuario } = useAuth(); // Recupera o usuário logado do contexto

  // Se o usuário estiver logado, renderiza o conteúdo 
  // Caso contrário, redireciona para a página de login
  return usuario ? children : <Navigate to="/login" replace />;
}
