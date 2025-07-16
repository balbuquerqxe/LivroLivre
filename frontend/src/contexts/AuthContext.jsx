// Importa hooks do React
import { createContext, useContext, useState, useEffect } from 'react';

// Importa o axios para chamadas HTTP
import axios from 'axios';

// Cria o contexto de autenticação
const AuthContext = createContext();

// Componente que fornece o contexto para o app
export function AuthProvider({ children }) {

  // Usuário logado
  const [usuario, setUsuario] = useState(null);

  // Estado de carregamento
  const [carregando, setLoading] = useState(true);

  // Livros doados e adotados pelo usuário logado
  const [meusLivrosDoados, setMeusLivrosDoados] = useState([]);
  const [meusLivrosAdotados, setMeusLivrosAdotados] = useState([]);

  // Executa ao carregar o app — verifica se já há usuário salvo no localStorage
  useEffect(() => {
    const salvo = localStorage.getItem('usuario');
    console.log('[AuthContext - useEffect] Valor salvo no localStorage:', salvo); 

    if (salvo) {
      const user = JSON.parse(salvo);
      console.log('[AuthContext - useEffect] Usuario parseado do localStorage:', user); 

      setUsuario(user);

      // Se houver e-mail, busca livros e atualiza créditos
      if (user.email) {
        fetchMeusLivros(user.email); 
      }
    }

    setLoading(false); 
  }, []);

  // Função para buscar livros doados/adotados e atualizar créditos
  const fetchMeusLivros = async (email) => {
    if (!email) return;

    try {
      const response = await axios.get(`http://localhost:3001/api/livros/usuario/${email}`);
      const { creditos, doados, adotados } = response.data;

      // Atualiza listas no estado
      setMeusLivrosDoados(doados);
      setMeusLivrosAdotados(adotados);

      // Atualiza os créditos do usuário mantendo o restante dos dados
      setUsuario(prevUsuario => {
        const updatedUser = { 
          ...prevUsuario,            
          creditos: creditos         // Atualiza só os créditos!!
        };

        localStorage.setItem('usuario', JSON.stringify(updatedUser));
        return updatedUser;
      });

      console.log('[AuthContext] Meus livros e créditos atualizados para:', email);
    } catch (err) {
      console.error('[AuthContext] Erro ao buscar meus livros ou créditos:', err);

      // Em caso de erro, zera as listas
      setMeusLivrosDoados([]);
      setMeusLivrosAdotados([]);

      // Se o erro for de autenticação, faz logout
      if (err.response && err.response.status === 401) {
        logout();
      }
    }
  };

  // Função de login — salva usuário no estado e no localStorage
  function login(dadosUsuario) {
    console.log('[AuthContext - login] Dados recebidos para login (completos):', dadosUsuario); 

    setUsuario(dadosUsuario);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));

    // Busca livros e créditos logo após o login
    fetchMeusLivros(dadosUsuario.email); 
  }

  // Função de logout — limpa usuário e listas do contexto e localStorage
  function logout() {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setMeusLivrosDoados([]);
    setMeusLivrosAdotados([]);
  }

  // Função auxiliar para atualizar apenas os créditos (e livros) com base no e-mail
  async function atualizarCreditos(email) {
    await fetchMeusLivros(email);
  }

  // Provedor que torna os dados e funções acessíveis nos componentes filhos
  return (
    <AuthContext.Provider value={{ 
      usuario, 
      login, 
      logout, 
      carregando, 
      atualizarCreditos, 
      meusLivrosDoados, 
      meusLivrosAdotados, 
      fetchMeusLivros 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);
