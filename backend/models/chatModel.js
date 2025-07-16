// Conexão com o banco de dados
const db = require('../database');

// Função que transforma uma string JSON em um array de mensagens
function parseMensagens(str) {
  try { return JSON.parse(str || '[]'); } catch { return []; }
}

// Função que cria um novo Chat no banco de dados
function criarChat(livroId, titulo, doador, adotante) {
  return new Promise((resolve, reject) => {

    // Define a query SQL para inserir um novo chat
    const sql = `
      INSERT INTO chats (livroId, doador, adotante, mensagens, criadoEm, resolvido)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Define a data e hora atual para colocar na mensagem (organização)
    const agora = new Date().toISOString();
    db.run(
      sql,
      [livroId, doador, adotante, '[]', agora, false],
      function (err) {
        if (err) return reject(err);
        resolve({
          id: this.lastID,
          livroId,
          titulo,
          doador,
          adotante,
          mensagens: [], // Chat começa sem mensagens
          criadoEm: agora, // Data atual!
          resolvido: false, // Ainda não resolveu a entrega
        });
      }
    );
  });
}

// Função que busca um chat pelo ID
function buscarChatPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM chats WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (row) row.mensagens = parseMensagens(row.mensagens);
      resolve(row);
    });
  });
}

// Função que lista todos os chats de um usuário (doador ou adotante)
function listarChatsDoUsuario(email) {

  // Precisa consultar todos os chats onde o usuário é doador ou adotante
  const sql = 'SELECT * FROM chats WHERE doador = ? OR adotante = ?';
  return new Promise((resolve, reject) => {
    db.all(sql, [email, email], (err, rows) => {
      if (err) return reject(err);

      // Muda a estrutura de mensagens de string para array
      rows.forEach(r => (r.mensagens = parseMensagens(r.mensagens)));
      resolve(rows);
    });
  });
}

// Função que envia uma mensagem em um chat
function enviarMensagem(chatId, remetente, texto) {
  return new Promise(async (resolve, reject) => {
    try {

      // Busca o chat correspondente pelo ID
      const chat = await buscarChatPorId(chatId);
      
      // Se não encontrar o chat, rejeita a promise com erro
      if (!chat) return reject(new Error('Chat não encontrado'));

      // Adiciona a nova mensagem ao chat com a data atual
      chat.mensagens.push({ remetente, texto, data: new Date().toISOString() });
      
      // Converte as mensagens de volta para string JSON
      const json = JSON.stringify(chat.mensagens);

      // Atualiza o chat no banco de dados com as novas mensagens
      db.run('UPDATE chats SET mensagens = ? WHERE id = ?', [json, chatId], err => {
        if (err) return reject(err);
        resolve(chat); // Retorna chat atualizado!
      });
    } catch (e) { reject(e); }
  });
}

// Remove um chat do banco de dados (quando a entrega já foi resolvida)
function encerrarChat(chatId) {
  return new Promise((resolve, reject) => {

    // Executa a exclusão do chat
    db.run('DELETE FROM chats WHERE id = ?', [chatId], function (err) {
      if (err) return reject(err);

      // Retorna true se o chat foi removido com sucesso
      resolve(this.changes > 0);
    });
  });
}

// Exporta as funções para serem usadas em outras partes do código
module.exports = {
  criarChat,
  buscarChatPorId,
  listarChatsDoUsuario,
  enviarMensagem,
  encerrarChat
};
