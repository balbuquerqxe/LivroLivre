// src/pages/CadastroLivro.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CadastroLivro() {
  const navigate = useNavigate();

  // estados dos campos
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    doador: "",
    chaveStellar: "",
  });
  const [erro, setErro] = useState("");

  // atualiza cada campo
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // envia para o backend
  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      await axios.post("http://localhost:3001/livros", form);
      navigate("/"); // volta para a lista
    } catch (err) {
      setErro("Erro ao cadastrar. Verifique os dados.");
      console.error(err);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Livro</h1>

      {erro && <p className="mb-4 text-red-600">{erro}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/** TÍTULO */}
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/** AUTOR */}
        <div>
          <label className="block text-sm font-medium">Autor</label>
          <input
            name="autor"
            value={form.autor}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/** DOADOR */}
        <div>
          <label className="block text-sm font-medium">Doador</label>
          <input
            name="doador"
            value={form.doador}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/** CHAVE STELLAR */}
        <div>
          <label className="block text-sm font-medium">Chave Stellar (G...)</label>
          <input
            name="chaveStellar"
            value={form.chaveStellar}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
