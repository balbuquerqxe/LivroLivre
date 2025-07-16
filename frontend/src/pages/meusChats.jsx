// Hooks e bibliotecas necessárias
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Wave from "react-wavify";
import logo from "/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoverde2.png";

export default function MeusChats() {
  const { usuario } = useAuth();
  const [chats, setChats] = useState([]);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Busca os chats do usuário assim que o componente for carregado
  useEffect(() => {
    if (usuario?.email) {
      fetchChats(usuario.email);
    }
  }, [usuario]);

  // Requisição GET: traz todos os chats do usuário logado
  async function fetchChats(email) {
    try {
      const res = await axios.get(`http://localhost:3001/api/chats/${email}`);
      setChats(res.data);
    } catch (err) {
      console.error("Erro ao buscar chats:", err);
      setErro("Não foi possível carregar seus chats.");
    }
  }

  // Requisição DELETE: exclui o chat quando a entrega é resolvida
  async function resolverEntrega(chatId) {
    try {
      await axios.delete(`http://localhost:3001/api/chats/${chatId}`);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      console.error("Erro ao excluir chat:", err);
      alert("Erro ao resolver entrega.");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-green-100 px-4 py-10 text-white overflow-hidden">

      {/* Fundo animado com onda verde */}
      <Wave
        fill="#6dc074ff"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Logo */}
      <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 z-10" />

      {/* Card com os chats */}
      <div className="bg-green-800 text-black z-10 p-6 rounded shadow w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-white">Meus Chats</h1>

        {erro && <p className="mb-4 text-red-600">{erro}</p>}

        {chats.length === 0 ? (
          <p className="text-gray-200">Nenhum chat encontrado.</p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className="border border-green-700 bg-green-100 rounded p-4 text-black shadow-sm"
              >
                <p><strong>Livro ID:</strong> {chat.livroId}</p>
                <p><strong>Doador:</strong> {chat.doador}</p>
                <p><strong>Adotante:</strong> {chat.adotante}</p>
                <p>
                  <strong>Mensagens:</strong> {chat.mensagens.length}{" "}
                  {chat.mensagens.length === 1 ? "mensagem" : "mensagens"}
                </p>

                <div className="mt-4 flex gap-4">
                  {/* Abre a conversa */}
                  <button
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="bg-green-600 hover:bg-green-800 text-white px-4 py-1 rounded w-full sm:w-auto"
                  >
                    Abrir Chat
                  </button>

                  {/* Marca a entrega como resolvida e apaga o chat */}
                  <button
                    onClick={() => resolverEntrega(chat.id)}
                    className="bg-green-600 hover:bg-green-800 text-white px-4 py-1 rounded w-full sm:w-auto"
                  >
                    Entrega resolvida!
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>    
    </div>
  );
}
