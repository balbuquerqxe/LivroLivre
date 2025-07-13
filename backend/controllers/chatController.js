// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chat = require('../models/chatModel');

/* abrir ou obter (POST) */
router.post('/', async (req, res) => {
  const { livroId, titulo, doadorEmail, adotanteEmail } = req.body;
  if (!livroId || !doadorEmail || !adotanteEmail)
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });

  try {
    // procura se já existe um chat para esse livro
    const existente = await chat.listarChatsDoUsuario(doadorEmail)
      .then(arr => arr.find(c => c.livroId === livroId));
    if (existente) return res.json(existente);

    const novo = await chat.criarChat(livroId, titulo, doadorEmail, adotanteEmail);
    res.status(201).json(novo);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

/* listar chats do usuário */
router.get('/:email', async (req, res) => {
  try {
    const dados = await chat.listarChatsDoUsuario(req.params.email);
    res.json(dados);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

/* buscar chat por id */
router.get('/id/:id', async (req, res) => {
  try {
    const c = await chat.buscarChatPorId(req.params.id);
    if (!c) return res.status(404).json({ erro: 'Chat não encontrado' });
    res.json(c);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

/* enviar mensagem */
router.post('/:id/mensagem', async (req, res) => {
  const { remetente, texto } = req.body;
  if (!remetente || !texto) return res.status(400).json({ erro: 'remetente e texto obrigatórios' });
  try {
    const atualizado = await chat.enviarMensagem(req.params.id, remetente, texto);
    res.json(atualizado);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

/* encerrar chat */
router.delete('/:id', async (req, res) => {
  try {
    const ok = await chat.encerrarChat(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Chat não encontrado' });
    res.json({ mensagem: 'Chat encerrado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = router;
