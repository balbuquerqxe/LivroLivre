// Indica quais funções devem ser chamadas quando certos acessos forem feitos

// Importa o express para criar as rotas
const express = require('express');

// Lida apenas com as rotas relacionadas aos livros
const router = express.Router();

// Importa as funções do controller de livros
const {
    cadastrarLivro,
    listarLivros,
    adotarLivro
} = require('../controllers/bookController');

// OBS: POST é quando queremos enviar dados para criar algo novo

// OBS: GET é quando queremos obter ou ler dados

// Quando for criado um novo livro (POST)
router.post('/', cadastrarLivro);

// Quando for listar os livros disponíveis (GET)
router.get('/', listarLivros);     

// Quando for adotar um livro pelo ID (POST)
router.post('/:id/adotar', adotarLivro);    

// Importa o controller de livros para listar livros do usuário
const { listarLivrosDoUsuario } = require('../controllers/bookController');

router.get('/usuario/:email', (req, res) => {
  const { email } = req.params;
  const livros = require('../data/livros');

  const doados = livros.filter(l => l.doador === email);
  const adotados = livros.filter(l => l.adotadoPor === email);

  res.json({ doados, adotados });
});

// Rota para listar livros do usuário
router.get('/meus-doacoes/:chaveStellar', (req, res) => {
  const { chaveStellar } = req.params;
  const livros = require('../data/livros');
  const doados = livros.filter(l => l.chaveStellar === chaveStellar);
  res.json(doados);
});

router.get('/meus-adotados/:nome', (req, res) => {
  const { nome } = req.params;
  const livros = require('../data/livros');
  const adotados = livros.filter(l => l.adotadoPor === nome);
  res.json(adotados);
});

// Exporta o router para ser usado em outros arquivos
module.exports = router;