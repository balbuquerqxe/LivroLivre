// Importa hooks e bibliotecas externas
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Wave from 'react-wavify';

// Componente de cadastro de novo usuário
export default function CadastroUsuario() {

  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Mensagem de feedback (sucesso ou erro)
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate(); // Para redirecionamento

  // Função chamada ao enviar o formulário
  const handleCadastro = async (e) => {
    e.preventDefault();

    try {
      
      // Envia os dados para o backend
      await axios.post('http://localhost:3001/api/usuarios/cadastro', {
        nome,
        email,
        senha,
      });

      // Mostra mensagem de sucesso e redireciona após 2s
      setMensagem('Cadastro realizado com sucesso! Aguarde...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMensagem('Erro ao cadastrar usuário.');
      console.error(error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-center bg-yellow-100 overflow-hidden px-4">
      {/* Onda decorativa amarela na base da tela */}
      <Wave
        fill="#e9cf7aff"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Cartão com formulário de cadastro */}
      <div className="z-10 bg-yellow-600 text-white rounded shadow p-6 w-full max-w-md text-left">
        <h2 className="text-2xl font-bold mb-4 text-center">Cadastro de Usuário</h2>

        {/* Formulário */}
        <form onSubmit={handleCadastro} className="space-y-4">
          {/* Campo: Nome */}
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-white bg-yellow-700 text-white rounded p-2 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
            required
          />

          {/* Campo: Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-white bg-yellow-700 text-white rounded p-2 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
            required
          />

          {/* Campo: Senha */}
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-white bg-yellow-700 text-white rounded p-2 placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
            required
          />

          {/* Botão de envio */}
          <button
            type="submit"
            className="w-full bg-white text-yellow-800 p-2 rounded hover:bg-gray-100 font-semibold"
          >
            Cadastrar
          </button>
        </form>

        {/* Mensagem de feedback */}
        {mensagem && (
          <p className="mt-4 text-center text-sm text-white">{mensagem}</p>
        )}
      </div>

      {/* Botão para voltar à tela inicial */}
      <button
        onClick={() => navigate('/inicio')}
        className="z-10 mt-6 text-yellow-800 underline font-semibold hover:text-yellow-900"
      >
        ← Voltar à tela inicial
      </button>
    </div>
  );
}
