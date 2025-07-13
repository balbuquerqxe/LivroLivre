import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Wave from 'react-wavify';

export default function CadastroUsuario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:3001/api/usuarios/cadastro', {
        nome,
        email,
        senha,
      });

      setMensagem('Cadastro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMensagem('Erro ao cadastrar usuário.');
      console.error(error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-center bg-yellow-100 overflow-hidden px-4">
      {/* Onda verde clara */}
      <Wave
        fill="#e9cf7aff"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Formulário */}
      <div className="z-10 bg-yellow-600 text-white rounded shadow p-6 w-full max-w-md text-left">
        <h2 className="text-2xl font-bold mb-4 text-center">Cadastro de Usuário</h2>
        <form onSubmit={handleCadastro} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-white bg-yellow-700 text-white rounded p-2 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-white bg-yellow-700 text-white rounded p-2 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-white bg-yellow-700 text-white rounded p-2 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <button
            type="submit"
            className="w-full bg-white text-yellow-800 p-2 rounded hover:bg-gray-100 font-semibold"
          >
            Cadastrar
          </button>
        </form>

        {mensagem && (
          <p className="mt-4 text-center text-sm text-white">{mensagem}</p>
        )}
      </div>

      {/* Botão voltar embaixo */}
      <button
        onClick={() => navigate('/inicio')}
        className="z-10 mt-6 text-yellow-800 underline font-semibold hover:text-yellow-900"
      >
        ← Voltar à tela inicial
      </button>
    </div>
  );
}
