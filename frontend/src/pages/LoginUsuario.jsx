import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Wave from 'react-wavify';
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logobranco.png'; // ajuste o caminho se necessário

export default function LoginUsuario() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const resposta = await axios.post('http://localhost:3001/api/usuarios/login', {
        email,
        senha,
      });

      login(resposta.data.usuario);
      navigate('/');
    } catch (err) {
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-center bg-white overflow-hidden px-4">
      {/* Onda verde clara */}
      <Wave
        fill="#56c27cff"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Logo */}
      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      {/* Formulário de login */}
      <form
        onSubmit={handleLogin}
        className="z-10 bg-green-800 text-white p-6 rounded shadow w-full max-w-md text-left"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-white bg-green-700 text-white rounded p-2 mb-3 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border border-white bg-green-700 text-white rounded p-2 mb-3 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
          required
        />

        {erro && (
          <p className="text-red-400 text-sm text-center mb-3">{erro}</p>
        )}

        <button
          type="submit"
          className="w-full bg-white text-green-800 py-2 rounded hover:bg-gray-100 font-semibold"
        >
          Entrar
        </button>

        <Link
          to="/cadastro-usuario"
          className="block text-center text-white text-sm mt-4 underline hover:text-green-100"
        >
          Criar nova conta
        </Link>
      </form>

      {/* Botão voltar à tela inicial */}
      <button
        onClick={() => navigate('/inicio')}
        className="z-10 mt-6 text-green-800 underline font-semibold hover:text-green-900"
      >
        ← Voltar à tela inicial
      </button>
    </div>
  );
}
