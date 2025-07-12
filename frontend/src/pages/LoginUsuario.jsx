import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginUsuario() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const resposta = await axios.post('http://localhost:3001/usuarios/login', {
        email,
        senha
      });

      alert('Login realizado com sucesso!');
      console.log('Usuário logado:', resposta.data.usuario);

      // Aqui você pode salvar no localStorage se quiser manter a sessão
      // localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));

      navigate('/'); // redireciona para a página inicial após login
    } catch (err) {
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Login do Usuário</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Senha</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-red-600">{erro}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}
