// Importa o Express
const express = require('express');

// Inicializa o router
const router = express.Router();

// Importa o banco de dados SQL
const db = require('../database');

// Função que busca chat por ID
function buscarChatPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM chats WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);

      // Faz o parse das mensagens armazenadas em formato JSON
      if (row) {
        try { row.mensagens = JSON.parse(row.mensagens || '[]'); }
        catch { row.mensagens = []; }
      }

      resolve(row);
    });
  });
}

// Busca um chat específico pelo ID
router.get('/id/:id', async (req, res) => {
  try {
    const chat = await buscarChatPorId(req.params.id);

    if (!chat)
      return res.status(404).json({ erro: 'Chat não encontrado.' });

    res.json(chat);
  } catch (err) {
    console.error('Erro ao buscar chat por ID:', err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});


// Envia uma nova mensagem para um chat
router.post('/:id/mensagem', async (req, res) => {
  const chatId = req.params.id;
  const novaMensagem = req.body;

  try {
    const chat = await buscarChatPorId(chatId);

    if (!chat)
      return res.status(404).json({ erro: 'Chat não encontrado.' });

    // Garante que mensagens seja um array e adiciona a nova mensagem
    const mensagens = Array.isArray(chat.mensagens) ? chat.mensagens : [];
    mensagens.push({ ...novaMensagem, data: new Date().toISOString() });

    // Atualiza o chat com a nova lista de mensagens
    db.run(
      'UPDATE chats SET mensagens = ? WHERE id = ?',
      [JSON.stringify(mensagens), chatId],
      function (err) {
        if (err) {
          console.error('Erro ao salvar mensagem:', err.message);
          return res.status(500).json({ erro: 'Erro ao salvar mensagem.' });
        }
        res.json({ ...chat, mensagens });
      }
    );
  } catch (err) {
    console.error('Erro no envio da mensagem:', err);
    res.status(500).json({ erro: 'Erro interno ao enviar mensagem.' });
  }
});


// Marca a entrega como resolvida (encerra o chat daí)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('UPDATE chats SET resolvido = 1 WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Erro ao resolver chat:', err.message);
      return res.status(500).json({ erro: 'Erro ao resolver entrega.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Chat não encontrado.' });
    }

    res.json({ mensagem: 'Entrega resolvida com sucesso!' });
  });
});


// Lista todos os chats de um usuário (doador ou adotante)
router.get('/:email', (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT * FROM chats
    WHERE (doador = ? OR adotante = ?)
      AND (resolvido IS NULL OR resolvido = 0)
  `;

  db.all(sql, [email, email], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar chats:', err.message);
      return res.status(500).json({ erro: 'Erro interno ao buscar chats.' });
    }

    // Faz o parse das mensagens para cada chat encontrado
    const chats = rows.map(c => {
      try { c.mensagens = JSON.parse(c.mensagens || '[]'); }
      catch { c.mensagens = []; }
      return c;
    });

    res.json(chats);
  });
});


// Exporta o router para ser usado pela aplicação principal
module.exports = router;
