import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Importar axios aqui para usar nas novas funções

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setLoading] = useState(true);
  // --- NOVOS ESTADOS PARA LIVROS DO USUÁRIO ---
  const [meusLivrosDoados, setMeusLivrosDoados] = useState([]);
  const [meusLivrosAdotados, setMeusLivrosAdotados] = useState([]);
  // --- FIM NOVOS ESTADOS ---

  useEffect(() => {
    const salvo = localStorage.getItem('usuario');
    if (salvo) {
      const user = JSON.parse(salvo);
      setUsuario(user);
      // Se o usuário já está salvo, tente buscar os livros dele ao carregar
      if (user.email) {
        fetchMeusLivros(user.email);
      }
    }
    setLoading(false);
  }, []);

  // --- NOVA FUNÇÃO: Buscar Meus Livros (Doados e Adotados) ---
  const fetchMeusLivros = async (email) => {
    if (!email) return;
    try {
      // A rota /api/livros/usuario/:email já retorna { creditos, doados, adotados }
      const response = await axios.get(`http://localhost:3001/api/livros/usuario/${email}`);
      const { creditos, doados, adotados } = response.data;

      // Atualiza os estados do contexto
      setMeusLivrosDoados(doados);
      setMeusLivrosAdotados(adotados);

      // Também atualiza os créditos no objeto usuário no estado e localStorage
      const atualizado = { ...usuario, creditos };
      setUsuario(atualizado);
      localStorage.setItem('usuario', JSON.stringify(atualizado));

      console.log('[AuthContext] Meus livros e créditos atualizados para:', email);
    } catch (err) {
      console.error('[AuthContext] Erro ao buscar meus livros ou créditos:', err);
      // Se der erro, pode limpar as listas para evitar exibir dados antigos
      setMeusLivrosDoados([]);
      setMeusLivrosAdotados([]);
    }
  };
  // --- FIM NOVA FUNÇÃO ---

  function login(dadosUsuario) {
    setUsuario(dadosUsuario);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    // Ao fazer login, também busca os livros do usuário
    fetchMeusLivros(dadosUsuario.email);
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem('usuario');
    // Ao fazer logout, limpa as listas de livros
    setMeusLivrosDoados([]);
    setMeusLivrosAdotados([]);
  }

  // A função atualizarCreditos agora pode chamar fetchMeusLivros, que já atualiza os créditos
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
      meusLivrosDoados, // Exporta os novos estados
      meusLivrosAdotados, // Exporta os novos estados
      fetchMeusLivros // Exporta a função para re-fetch manual
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);