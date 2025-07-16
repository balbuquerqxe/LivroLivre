// Hooks e bibliotecas necessárias
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Wave from 'react-wavify';

// Componente principal de login
export default function LoginUsuario() {
  const { login } = useAuth();            // Função de login do contexto
  const navigate = useNavigate();         // Hook para redirecionar após login

  // Estados para armazenar campos do formulário e mensagens de erro
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  // Função chamada ao submeter o formulário
  const handleLogin = async (e) => {
    e.preventDefault(); // Previne reload da página

    try {
      // Envia email e senha para o backend
      const resposta = await axios.post('http://localhost:3001/api/usuarios/login', {
        email,
        senha,
      });

      // Se sucesso, chama login do contexto e redireciona para a home
      login(resposta.data.usuario);
      navigate('/');
    } catch (err) {

      // Caso erro exibe mensagem
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-center bg-pink-100 overflow-hidden px-4">
      
      {/* Onda rosa clara no fundo */}
      <Wave
        fill="#FFC0CB"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Formulário de login */}
      <form
        onSubmit={handleLogin}
        className="z-10 bg-pink-800 text-white p-6 rounded shadow w-full max-w-md text-left"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

        {/* Campo de e-mail */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-white bg-pink-700 text-white rounded p-2 mb-3 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
          required
        />

        {/* Campo de senha */}
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border border-white bg-pink-700 text-white rounded p-2 mb-3 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
          required
        />

        {/* Mensagem de erro, se houver */}
        {erro && (
          <p className="text-red-400 text-sm text-center mb-3">{erro}</p>
        )}

        {/* Botão de login */}
        <button
          type="submit"
          className="w-full bg-white text-pink-800 py-2 rounded hover:bg-gray-100 font-semibold"
        >
          Entrar
        </button>

        {/* Link para criar nova conta */}
        <Link
          to="/cadastro-usuario"
          className="block text-center text-white text-sm mt-4 underline hover:text-pink-100"
        >
          Criar nova conta
        </Link>
      </form>

      {/* Botão voltar à tela inicial */}
      <button
        onClick={() => navigate('/inicio')}
        className="z-10 mt-6 text-pink-800 underline font-semibold hover:text-pink-900"
      >
        ← Voltar à tela inicial
      </button>
    </div>
  );
}
