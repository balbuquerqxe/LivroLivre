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

// 🧠 Importa apenas o que existe de fato no seu controller
const {
  adotarLivro
} = require('../controllers/bookController'); // ✅ ajuste o caminho se estiver diferente

// 🔒 Se quiser usar autenticação futuramente:
// const authMiddleware = require('../middleware/auth');

// --------------------------------------------------------------------------
// Rotas de Livros
// --------------------------------------------------------------------------

// POST /api/livros/:id/adotar
router.post('/:id/adotar', adotarLivro);

// ⚠️ Caso for adicionar outras rotas como cadastrarLivro ou listarLivros,
// adicione aqui apenas se essas funções forem exportadas corretamente do controller.

module.exports = router;
