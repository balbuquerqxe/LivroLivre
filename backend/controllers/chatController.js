// Importa o Express e o model de chat
const express = require('express');
const router = express.Router();
const chat = require('../models/chatModel');


// Rota para abrir um novo chat ou obter um já existente
router.post('/', async (req, res) => {
  const { livroId, titulo, doadorEmail, adotanteEmail } = req.body;

  // Verifica se os campos obrigatórios foram enviados
  if (!livroId || !doadorEmail || !adotanteEmail)
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });

  try {
    
    // Verifica se já existe um chat para esse livro entre doador e adotante
    const existente = await chat.listarChatsDoUsuario(doadorEmail)
      .then(arr => arr.find(c => c.livroId === livroId));

    // Se já existir, retorna o chat existente
    if (existente) return res.json(existente);

    // Se não existir, cria um novo chat
    const novo = await chat.criarChat(livroId, titulo, doadorEmail, adotanteEmail);
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});


// Rota para listar todos os chats de um usuário
router.get('/:email', async (req, res) => {
  try {
    const dados = await chat.listarChatsDoUsuario(req.params.email);
    res.json(dados);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});


// Rota para buscar um chat específico pelo ID
router.get('/id/:id', async (req, res) => {
  try {
    const c = await chat.buscarChatPorId(req.params.id);

    // Se o chat não for encontrado, retorna 404
    if (!c) return res.status(404).json({ erro: 'Chat não encontrado' });

    res.json(c);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});


// Rota para enviar uma nova mensagem em um chat
router.post('/:id/mensagem', async (req, res) => {
  const { remetente, texto } = req.body;

  // Verifica se os campos foram preenchidos
  if (!remetente || !texto) return res.status(400).json({ erro: 'remetente e texto obrigatórios' });

  try {
    const atualizado = await chat.enviarMensagem(req.params.id, remetente, texto);
    res.json(atualizado);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});


// Rota para encerrar (deletar) um chat
router.delete('/:id', async (req, res) => {
  try {
    const ok = await chat.encerrarChat(req.params.id);

    // Se o chat não existir, retorna erro 404
    if (!ok) return res.status(404).json({ erro: 'Chat não encontrado' });

    res.json({ mensagem: 'Chat encerrado' });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});


// Exporta o router para ser usado na aplicação
module.exports = router;
