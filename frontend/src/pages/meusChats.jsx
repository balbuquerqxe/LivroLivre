import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MeusChats() {
  const { usuario } = useAuth();
  const [chats, setChats] = useState([]);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario?.email) {
      fetchChats(usuario.email);
    }
  }, [usuario]);

  async function fetchChats(email) {
    try {
      const res = await axios.get(`http://localhost:3001/api/chats/${email}`);
      setChats(res.data);
    } catch (err) {
      console.error("Erro ao buscar chats:", err);
      setErro("Não foi possível carregar seus chats.");
    }
  }

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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meus Chats</h1>

      {erro && <p className="text-red-600">{erro}</p>}

      {chats.length === 0 ? (
        <p className="text-gray-600">Nenhum chat encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {chats.map((chat) => (
            <li key={chat.id} className="border p-4 rounded shadow bg-white text-black">
              <p><strong>Livro ID:</strong> {chat.livroId}</p>
              <p><strong>Doador:</strong> {chat.doador}</p>
              <p><strong>Adotante:</strong> {chat.adotante}</p>
              <p><strong>Mensagens:</strong> {chat.mensagens.length} mensagens</p>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Abrir Chat
                </button>

                <button
                  onClick={() => resolverEntrega(chat.id)}
                  className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800"
                >
                  Entrega resolvida!
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
