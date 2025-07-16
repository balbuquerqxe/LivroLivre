// Importa o Express
const express = require('express');

// Inicializa o router
const router = express.Router();

// Importa o multer que faz o upload de imagem
const multer = require('multer');

// Lida com os caminhos
const path = require('path');

// Configura o destino e o nome do arquivo para imagens enviadas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Pasta onde a imagem será salva
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Captura a extensão original
    cb(null, Date.now() + ext);                   // Gera um nome único com timestamp
  }
});

// Ttrata os uploads de imagem
const upload = multer({ storage });


// Importa as funções do controller de livros
const {
  cadastrarLivro,
  listarLivros,
  adotarLivro,
  listarLivrosDoUsuario
} = require('../controllers/bookController');

// Rota para cadastrar um novo livro (com imagem)
router.post('/', upload.single('imagem'), cadastrarLivro);

// Rota para listar todos os livros disponíveis
router.get('/', listarLivros);

// Rota para adotar um livro pelo ID
router.post('/:id/adotar', adotarLivro);

// Rota para buscar os livros de um usuário (doado + adotado) + seus créditos
router.get('/usuario/:email', listarLivrosDoUsuario);


// Exporta o router para ser usado na aplicação principal
module.exports = router;
