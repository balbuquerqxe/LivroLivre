// backend/models/chatModel.js
const db = require('../database');

/* ---------- helpers ------------ */
function parseMensagens(str) {
  try { return JSON.parse(str || '[]'); } catch { return []; }
}

function criarChat(livroId, titulo, doador, adotante) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO chats (livroId, doador, adotante, mensagens, criadoEm, resolvido)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
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
          mensagens: [],
          criadoEm: agora,
          resolvido: false,
        });
      }
    );
  });
}


function buscarChatPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM chats WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (row) row.mensagens = parseMensagens(row.mensagens);
      resolve(row);
    });
  });
}

function listarChatsDoUsuario(email) {
  const sql = 'SELECT * FROM chats WHERE doador = ? OR adotante = ?';
  return new Promise((resolve, reject) => {
    db.all(sql, [email, email], (err, rows) => {
      if (err) return reject(err);
      rows.forEach(r => (r.mensagens = parseMensagens(r.mensagens)));
      resolve(rows);
    });
  });
}

function enviarMensagem(chatId, remetente, texto) {
  return new Promise(async (resolve, reject) => {
    try {
      const chat = await buscarChatPorId(chatId);
      if (!chat) return reject(new Error('Chat não encontrado'));

      chat.mensagens.push({ remetente, texto, data: new Date().toISOString() });
      const json = JSON.stringify(chat.mensagens);

      db.run('UPDATE chats SET mensagens = ? WHERE id = ?', [json, chatId], err => {
        if (err) return reject(err);
        resolve(chat);            // devolve chat atualizado
      });
    } catch (e) { reject(e); }
  });
}

function encerrarChat(chatId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM chats WHERE id = ?', [chatId], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

module.exports = {
  criarChat,
  buscarChatPorId,
  listarChatsDoUsuario,
  enviarMensagem,
  encerrarChat
};
