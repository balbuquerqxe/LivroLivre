import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setLoading] = useState(true);   // ← novo

  // Carrega o usuário salvo (se houver) e depois marca “pronto”
  useEffect(() => {
    const salvo = localStorage.getItem('usuario');
    if (salvo) setUsuario(JSON.parse(salvo));
    setLoading(false);             // ← avisa que terminou de ler o storage
  }, []);

  function login(dadosUsuario) {
    setUsuario(dadosUsuario);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem('usuario');
  }

  async function atualizarCreditos(email) {
    try {
      const res = await fetch(`http://localhost:3001/usuarios/creditos/${email}`);
      const { creditos } = await res.json();

      const atualizado = { ...usuario, creditos };
      setUsuario(atualizado);
      localStorage.setItem('usuario', JSON.stringify(atualizado));
    } catch (err) {
      console.error('Erro ao consultar créditos:', err);
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando, atualizarCreditos }}>
      {children}
    </AuthContext.Provider>
  );

}

export const useAuth = () => useContext(AuthContext);
