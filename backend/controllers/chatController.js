// controllers/chatController.js

// Lista em memória com todos os chats
const chats = [];

// Cria um novo chat (ou retorna um existente)
function abrirChat(req, res) {
  const { livroId, titulo, doadorEmail, adotanteEmail } = req.body;

  // Verifica se todos os dados foram enviados
  if (!livroId || !titulo || !doadorEmail || !adotanteEmail) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
  }

  // Impede duplicação: se já existir um chat com esse livro, retorna o mesmo
  const existente = chats.find(c => c.livroId === livroId);
  if (existente) {
    return res.status(200).json({ mensagem: 'Chat já existe.', chat: existente });
  }

  const novoChat = {
    id: chats.length + 1,
    livroId,
    titulo,
    doadorEmail,
    adotanteEmail,
    mensagens: [],
    resolvido: false
  };

  chats.push(novoChat);
  res.status(201).json(novoChat);
}

// Lista os chats ativos de um usuário (como doador ou adotante)
function listarChatsPorUsuario(req, res) {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ erro: 'E-mail é obrigatório.' });
  }

  // Retorna apenas os chats ainda não resolvidos
  const relacionados = chats.filter(
    c => !c.resolvido && (c.doadorEmail === email || c.adotanteEmail === email)
  );

  res.json(relacionados);
}

// Envia uma nova mensagem em um chat existente
function enviarMensagem(req, res) {
  const { id } = req.params;
  const { autor, texto } = req.body;

  if (!autor || !texto) {
    return res.status(400).json({ erro: 'Autor e texto são obrigatórios.' });
  }

  const chat = chats.find(c => c.id === parseInt(id));

  if (!chat) {
    return res.status(404).json({ erro: 'Chat não encontrado.' });
  }

  chat.mensagens.push({
    autor,
    texto,
    data: new Date().toISOString()
  });

  res.status(200).json({ sucesso: true, chat });
}

// Encerra (remove) um chat da lista
function encerrarChat(req, res) {
  const { id } = req.params;

  const index = chats.findIndex(c => c.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ erro: 'Chat não encontrado.' });
  }

  chats.splice(index, 1); // Remove definitivamente da memória
  res.status(200).json({ mensagem: 'Chat encerrado com sucesso.' });
}

module.exports = {
  abrirChat,
  listarChatsPorUsuario,
  enviarMensagem,
  encerrarChat
};
