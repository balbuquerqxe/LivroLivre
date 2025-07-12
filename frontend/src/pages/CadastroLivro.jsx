import { useState } from 'react';
import axios from 'axios';

export default function CadastroUsuario() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [mensagem, setMensagem] = useState('');
  const [chavePublica, setChavePublica] = useState('');
  const [chavePrivada, setChavePrivada] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await axios.post('http://localhost:3001/usuarios/cadastro', form);
      const { usuario, chavePrivada } = response.data;

      // Salva o usuário no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('chavePrivada', chavePrivada);

      setChavePublica(usuario.chaveStellar);
      setChavePrivada(chavePrivada);
      setMensagem('Usuário cadastrado com sucesso!');
    } catch (erro) {
      console.error('Erro ao cadastrar usuário:', erro);
      setMensagem('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro de Usuário</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={form.senha}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Cadastrar
          </button>
        </form>

        {mensagem && <p className="mt-4 text-center text-sm text-gray-700">{mensagem}</p>}

        {chavePublica && (
          <div className="mt-6 text-sm text-gray-800 break-all">
            <p><strong>Chave Pública:</strong> {chavePublica}</p>
            <p className="mt-2"><strong>Chave Privada:</strong> {chavePrivada}</p>
            <p className="mt-2 text-red-600 text-xs">
              Guarde a chave privada com segurança! Ela será necessária para movimentações na blockchain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
