import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // Caminho corrigido para contexts/AuthContext
import Wave from "react-wavify";
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logorosa.png';

export default function CadastroLivro() {
  const navigate = useNavigate();
  // Importa a nova função fetchMeusLivros do contexto
  const { usuario, atualizarCreditos, fetchMeusLivros } = useAuth(); 

  const [form, setForm] = useState({ titulo: "", autor: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(""); // Adicionado para feedback de sucesso

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso(""); // Limpa mensagem de sucesso anterior

    // Validação para garantir que o usuário esteja logado e tenha as chaves
    if (!usuario || !usuario.email || !usuario.chaveStellar) {
        setErro("Você precisa estar logado e ter uma chave Stellar associada para cadastrar um livro.");
        return;
    }

    try {
      await axios.post("http://localhost:3001/api/livros", {
        ...form,
        doador: usuario.email,
        chaveStellar: usuario.chaveStellar, // Passa a chave Stellar do usuário logado
      });

      // --- AQUI ESTÁ A ATUALIZAÇÃO ---
      await atualizarCreditos(usuario.email); // Atualiza os créditos
      await fetchMeusLivros(usuario.email); // <--- CHAMA A NOVA FUNÇÃO PARA ATUALIZAR AS LISTAS DE LIVROS
      // --- FIM DA ATUALIZAÇÃO ---

      setSucesso("Livro cadastrado com sucesso!"); // Mensagem de sucesso
      setForm({ titulo: "", autor: "" }); // Limpa o formulário
      // Opcional: navegar para a página de "Meus Livros" ou lista geral
      // navigate("/meus-livros"); 

    } catch (err) {
      setSucesso(""); // Limpa mensagem de sucesso em caso de erro
      setErro("Erro ao cadastrar. Verifique os dados.");
      console.error('Erro ao cadastrar livro:', err);
      // Se for um erro do backend, tente pegar a mensagem mais específica
      if (err.response && err.response.data && err.response.data.erro) {
          setErro(err.response.data.erro);
      }
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-pink-100 px-4 py-10 text-white overflow-hidden">
      {/* Onda */}
      <Wave
        fill="#FFC0CB"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Logo */}
      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      {/* Cartão de cadastro */}
      <div className="bg-pink-800 text-black z-10 p-6 rounded shadow w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-white">Cadastrar Livro</h1>

        {erro && <p className="mb-4 text-red-600">{erro}</p>}
        {sucesso && <p className="mb-4 text-white">{sucesso}</p>} {/* Exibe mensagem de sucesso */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-white">Título</label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              required
              className="w-full border border-pink-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Autor */}
          <div>
            <label className="block text-sm font-medium text-white">Autor</label>
            <input
              name="autor"
              value={form.autor}
              onChange={handleChange}
              required
              className="w-full border border-pink-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <button
            type="submit"
            className="bg-pink-700 hover:bg-pink-800 text-white px-4 py-2 rounded w-full font-semibold"
          >
            Salvar
          </button>
        </form>
      </div>
      {/* Botão voltar para a tela pós-login */}
      <button
        onClick={() => navigate('/')} // Ajuste para a rota correta da sua tela pós-login
        className="z-10 mt-6 text-pink-800 underline font-semibold hover:text-pink-900"
      >
        ← Voltar
      </button>
    </div>
  );
}