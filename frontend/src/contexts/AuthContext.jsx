// LivroLivre/frontend/src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Importar axios para usar nas funções de fetch

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setLoading] = useState(true);
  const [meusLivrosDoados, setMeusLivrosDoados] = useState([]);
  const [meusLivrosAdotados, setMeusLivrosAdotados] = useState([]);

  useEffect(() => {
    const salvo = localStorage.getItem('usuario');
    console.log('[AuthContext - useEffect] Valor salvo no localStorage:', salvo); 
    if (salvo) {
      const user = JSON.parse(salvo);
      console.log('[AuthContext - useEffect] Usuario parseado do localStorage:', user); 
      setUsuario(user);
      if (user.email) { 
        // Busca os livros do usuario ao carregar (inicializa as listas e os créditos)
        fetchMeusLivros(user.email); 
      }
    }
    setLoading(false); 
  }, []);

  // --- FUNÇÃO CORRIGIDA: Buscar Meus Livros (Doados e Adotados) e ATUALIZAR CRÉDITOS ---
  const fetchMeusLivros = async (email) => {
    if (!email) return;
    try {
      const response = await axios.get(`http://localhost:3001/api/livros/usuario/${email}`);
      const { creditos, doados, adotados } = response.data;

      // Atualiza os estados das listas de livros no contexto
      setMeusLivrosDoados(doados);
      setMeusLivrosAdotados(adotados);

      // --- A CORREÇÃO ESSENCIAL ESTÁ AQUI: ATUALIZA usuario SEM PERDER PROPRIEDADES ---
      setUsuario(prevUsuario => {
          // prevUsuario é o objeto usuario que estava no estado ANTES desta chamada.
          // Isso garante que propriedades como 'id', 'nome', 'email', 'chaveStellar' não sejam perdidas.
          const updatedUser = { 
              ...prevUsuario, // Mantém todas as propriedades existentes do usuário
              creditos: creditos // Apenas atualiza a propriedade 'creditos'
          };
          localStorage.setItem('usuario', JSON.stringify(updatedUser)); // Salva o objeto completo e atualizado no localStorage
          return updatedUser;
      });
      // --- FIM CORREÇÃO ESSENCIAL ---

      console.log('[AuthContext] Meus livros e créditos atualizados para:', email);
    } catch (err) {
      console.error('[AuthContext] Erro ao buscar meus livros ou créditos:', err);
      // Se der erro ao buscar (ex: usuário não encontrado, erro de rede), limpa as listas
      setMeusLivrosDoados([]);
      setMeusLivrosAdotados([]);
      // E pode remover o usuário do estado/localStorage se for um erro de autenticação
      if (err.response && err.response.status === 401) { // Exemplo para 401 Unauthorized
          logout();
      }
    }
  };
  // --- FIM FUNÇÃO CORRIGIDA ---

  function login(dadosUsuario) {
    console.log('[AuthContext - login] Dados recebidos para login (completos):', dadosUsuario); 
    setUsuario(dadosUsuario); // Define o usuário completo recebido do backend
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    // Após o login, aciona o fetch para pegar créditos e listas e atualizar o objeto usuario
    fetchMeusLivros(dadosUsuario.email); 
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setMeusLivrosDoados([]);
    setMeusLivrosAdotados([]);
  }

  // A função atualizarCreditos agora simplesmente chama fetchMeusLivros, que já faz tudo
  async function atualizarCreditos(email) {
    await fetchMeusLivros(email);
  }

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

export const useAuth = () => useContext(AuthContext);