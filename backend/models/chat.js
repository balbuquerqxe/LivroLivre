// models/chat.js

// Lista de chats em memória
let chats = [];

/**
 * Cria um novo chat se ainda não existir, ou retorna o existente.
 * @param {number} livroId - ID do livro associado ao chat
 * @param {string} doador - E-mail do doador
 * @param {string} adotante - E-mail do adotante
 * @param {string} titulo - Título do livro (usado como nome do chat)
 * @returns {object} chat
 */
function criarOuObterChat(livroId, doador, adotante, titulo) {
  let chat = chats.find(c => c.livroId === livroId);
  if (!chat) {
    chat = {
      livroId,
      titulo,
      doador,
      adotante,
      mensagens: [],
      resolvido: false
    };
    chats.push(chat);
  }
  return chat;
}

/**
 * Lista todos os chats ativos (não resolvidos) em que o usuário participa
 * @param {string} nomeUsuario - e-mail do usuário
 * @returns {Array} lista de chats
 */
function listarChatsPorUsuario(nomeUsuario) {
  return chats.filter(c =>
    (c.doador === nomeUsuario || c.adotante === nomeUsuario) && !c.resolvido
  );
}

/**
 * Envia uma nova mensagem em um chat existente
 * @param {number} livroId - ID do livro/chat
 * @param {string} remetente - nome ou email do remetente
 * @param {string} texto - conteúdo da mensagem
 * @returns {object|null} chat atualizado ou null se não encontrado
 */
function enviarMensagem(livroId, remetente, texto) {
  const chat = chats.find(c => c.livroId === livroId);
  if (!chat) return null;

  chat.mensagens.push({
    remetente,
    texto,
    timestamp: new Date().toISOString()
  });

  return chat;
}

/**
 * Marca um chat como resolvido (esconde da lista principal)
 * @param {number} livroId - ID do livro/chat
 * @returns {object|null} chat atualizado ou null se não encontrado
 */
function marcarComoResolvido(livroId) {
  const chat = chats.find(c => c.livroId === livroId);
  if (chat) {
    chat.resolvido = true;
    return chat;
  }
  return null;
}

// Exporta as funções do modelo
module.exports = {
  criarOuObterChat,
  listarChatsPorUsuario,
  enviarMensagem,
  marcarComoResolvido
};
