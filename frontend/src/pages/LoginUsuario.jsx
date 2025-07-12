import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginUsuario() {
  const { login } = useAuth();  // usa o contexto de autenticação
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const resposta = await axios.post('http://localhost:3001/usuarios/login', {
        email,
        senha
      });

      login(resposta.data.usuario); // grava no contexto e localStorage
      navigate('/');                // vai para lista de livros
    } catch (err) {
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded w-80 space-y-4 shadow">
        <h1 className="text-xl font-bold text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        {erro && <p className="text-red-600 text-sm">{erro}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Entrar
        </button>

        <Link to="/cadastro-usuario" className="block text-center text-blue-600 text-sm">
          Criar nova conta
        </Link>
      </form>
    </div>
  );
}