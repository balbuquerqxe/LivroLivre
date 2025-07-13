import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import Wave from "react-wavify";
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logorosa.png';

export default function CadastroLivro() {
  const navigate = useNavigate();
  const { usuario, atualizarCreditos, fetchMeusLivros } = useAuth();

  const [form, setForm] = useState({ titulo: "", autor: "" });
  const [imagem, setImagem] = useState(null); // 🆕 novo estado para imagem
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!usuario || !usuario.email || !usuario.chaveStellar) {
      setErro("Você precisa estar logado e ter uma chave Stellar associada para cadastrar um livro.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("autor", form.autor);
      formData.append("doador", usuario.email);
      formData.append("chaveStellar", usuario.chaveStellar);
      formData.append("imagem", imagem); // 🆕 adiciona imagem no envio

      await axios.post("http://localhost:3001/api/livros", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await atualizarCreditos(usuario.email);
      await fetchMeusLivros(usuario.email);

      setSucesso("Livro cadastrado com sucesso!");
      setForm({ titulo: "", autor: "" });
      setImagem(null); // 🆕 limpa imagem
    } catch (err) {
      setSucesso("");
      setErro("Erro ao cadastrar. Verifique os dados.");
      console.error("Erro ao cadastrar livro:", err);
      if (err.response?.data?.erro) {
        setErro(err.response.data.erro);
      }
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-pink-100 px-4 py-10 text-white overflow-hidden">
      <Wave
        fill="#FFC0CB"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      <div className="bg-pink-800 text-black z-10 p-6 rounded shadow w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-white">Cadastrar Livro</h1>

        {erro && <p className="mb-4 text-red-600">{erro}</p>}
        {sucesso && <p className="mb-4 text-white">{sucesso}</p>}

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

          {/* Imagem */}
          <div>
            <label className="block text-sm font-medium text-white">Imagem da Capa</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
              required
              className="w-full border border-pink-700 px-3 py-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-pink-300"
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

      <button
        onClick={() => navigate('/')}
        className="z-10 mt-6 text-pink-800 underline font-semibold hover:text-pink-900"
      >
      </button>
    </div>
  );
}
