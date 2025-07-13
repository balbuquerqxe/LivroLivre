// LivroLivre/backend/routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuração do destino e nome do arquivo para upload de imagem
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);  // Exemplo: 1720978629182.jpg
  }
});

const upload = multer({ storage });

// --- Importa TODAS as funções do controller ---
const {
  cadastrarLivro,
  listarLivros,
  adotarLivro,
  listarLivrosDoUsuario
} = require('../controllers/bookController');

// --------------------------------------------------------------------------
// Rotas de Livros
// --------------------------------------------------------------------------

// POST /api/livros ➜ cadastrar livro (com imagem)
router.post('/', upload.single('imagem'), cadastrarLivro);

// GET /api/livros ➜ listar livros disponíveis
router.get('/', listarLivros);

// POST /api/livros/:id/adotar ➜ adotar livro
router.post('/:id/adotar', adotarLivro);

// GET /api/livros/usuario/:email ➜ livros doados/adotados + créditos do usuário
router.get('/usuario/:email', listarLivrosDoUsuario);

module.exports = router;
