// LivroLivre/backend/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuração do destino e nome do arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);  // Ex: 1720978629182.jpg
  }
});

const upload = multer({ storage });

// Importa as funções do controller de livros
const {
    cadastrarLivro,
    listarLivros,        
    adotarLivro,
    listarLivrosDoUsuario 
} = require('../controllers/bookController'); // Caminho para o controller

// --- Middleware de Autenticação (EXEMPLO) ---
// Você VAI precisar de um middleware de autenticação para as rotas que usam req.user
// Exemplo:
// const authMiddleware = require('../middleware/auth'); 


// --------------------------------------------------------------------------
// Rotas de Livros
// --------------------------------------------------------------------------

// Quando for criado um novo livro (POST /api/livros)
// Esta rota espera 'doador' e 'chaveStellar' no req.body vindo do frontend.
// Se você quiser que o backend extraia de req.user, precisaria de um middleware
// router.post('/', authMiddleware, cadastrarLivro); // Exemplo com middleware
router.post('/', upload.single('imagem'), cadastrarLivro);

// Quando for listar os livros disponíveis (GET /api/livros)
router.get('/', listarLivros);     

// Quando for adotar um livro pelo ID (POST /api/livros/:id/adotar)
// Esta rota espera 'adotante' no req.body vindo do frontend.
// Se você quiser que o backend extraia de req.user, precisaria de um middleware
// router.post('/:id/adotar', authMiddleware, adotarLivro); // Exemplo com middleware
router.post('/:id/adotar', adotarLivro);    


// --------------------------------------------------------------------------
// Rotas de Livros de um Usuário Específico (GET /api/livros/usuario/:email)
// --------------------------------------------------------------------------
// Lista livros doados, adotados e créditos de um usuário específico por email
router.get('/usuario/:email', listarLivrosDoUsuario);


module.exports = router;