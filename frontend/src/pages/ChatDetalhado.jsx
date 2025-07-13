// frontend/src/pages/ChatDetalhado.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function ChatDetalhado() {
    const { chatId } = useParams();
    const { usuario } = useAuth();
    const [chat, setChat] = useState(null);
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:3001/api/chats/id/${chatId}`)
            .then(res => {
                console.log("📥 Chat recebido:", res.data); // 👈 Debug no console
                setChat(res.data);
            })
            .catch(err => {
                console.error('❌ Erro ao buscar chat:', err);
                alert("Erro ao carregar o chat.");
            });
    }, [chatId]);

    const enviarMensagem = async () => {
        if (!mensagem.trim()) return;
        try {
            const novaMensagem = {
                remetente: usuario.email,
                texto: mensagem
            };
            const res = await axios.post(`http://localhost:3001/api/chats/${chatId}/mensagem`, novaMensagem);
            setChat(res.data);
            setMensagem('');
        } catch (err) {
            console.error('❌ Erro ao enviar mensagem:', err);
            alert("Erro ao enviar mensagem.");
        }
    };

    if (!chat) {
        return (
            <div className="text-center mt-10 text-gray-600">
                Carregando o chat...
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-6">
            <h2 className="text-xl font-bold mb-4">
                Chat com {chat.doador === usuario.email ? chat.adotante : chat.doador}
            </h2>

            <div className="border rounded p-3 h-64 overflow-y-auto mb-4 bg-gray-50">
                {(!chat.mensagens || chat.mensagens.length === 0) ? (
                    <p className="text-gray-500">Nenhuma mensagem ainda.</p>
                ) : (
                    chat.mensagens.map((m, i) => (
                        <div key={i} className={`mb-2 ${m.remetente === usuario.email ? 'text-right' : 'text-left'}`}>
                            <span className="inline-block px-3 py-1 rounded bg-blue-200">{m.texto}</span>
                            <div className="text-xs text-gray-500">{m.remetente}</div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-grow p-2 border rounded"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                />
                <button onClick={enviarMensagem} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Enviar
                </button>
            </div>
        </div>
    );
}
