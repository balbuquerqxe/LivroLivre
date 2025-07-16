// Importações de bibliotecas e hooks
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import Wave from "react-wavify";

// Componente principal do chat detalhado
export default function ChatDetalhado() {

  // Obtém o ID do chat da URL
  const { chatId } = useParams();

  // Obtém o usuário autenticado do contexto
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Estados do componente
  const [chat, setChat] = useState(null);        // Armazena o objeto do chat completo
  const [mensagem, setMensagem] = useState("");  // Texto da nova mensagem!!

  // Carrega os dados do chat assim que o componente for montado
  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/chats/id/${chatId}`)
      .then((res) => {
        setChat(res.data); // Armazena o chat carregado no estado
      })
      .catch((err) => {
        console.error("Erro ao buscar chat:", err);
        alert("Erro ao carregar o chat.");
      });
  }, [chatId]);

  // Envia nova mensagem para o backend
  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    try {
      const novaMensagem = {
        remetente: usuario.email,
        texto: mensagem,
      };

      const res = await axios.post(
        `http://localhost:3001/api/chats/${chatId}/mensagem`,
        novaMensagem
      );

      setChat(res.data); // Atualiza o chat com a nova mensagem
      setMensagem("");   // Limpa o campo de mensagem
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      alert("Erro ao enviar mensagem.");
    }
  };

  // Enquanto o chat ainda não foi carregado
  if (!chat) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Carregando o chat...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-green-100 px-4 py-10 text-white overflow-hidden">
      {/* Fundo com onda animada */}
      <Wave
        fill="#6dc074ff"
        paused={false}
        options={{ height: 80, amplitude: 100, speed: 0.25, points: 5 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Card do conteúdo do chat */}
      <div className="bg-green-800 text-black z-10 p-6 rounded shadow w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Chat com{" "}
          {chat.doador === usuario.email ? chat.adotante : chat.doador}
        </h2>

        {/* Área de mensagens */}
        <div className="border border-green-300 rounded p-3 h-64 overflow-y-auto mb-4 bg-green-100">
          {(!chat.mensagens || chat.mensagens.length === 0) ? (
            <p className="text-gray-600">Nenhuma mensagem ainda.</p>
          ) : (
            chat.mensagens.map((m, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  m.remetente === usuario.email ? "text-right" : "text-left"
                }`}
              >
                {/* Caixa da mensagem */}
                <div
                  className={`inline-block px-3 py-1 rounded ${
                    m.remetente === usuario.email
                      ? "bg-green-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {m.texto}
                </div>
                {/* Remetente (pequeno e cinza) */}
                <div className="text-xs text-gray-500">{m.remetente}</div>
              </div>
            ))
          )}
        </div>

        {/* Campo de entrada e botão de envio */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded bg-white text-black"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
          <button
            onClick={enviarMensagem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
