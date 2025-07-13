// LivroLivre/backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Importa as funções do controller de usuários
// As funções Stellar agora são chamadas DENTRO do userController.js
const { 
    cadastrarUsuario, 
    autenticarUsuario, 
    consultarCreditosUsuario, 
    listarTodosUsuarios // Opcional, para listar todos
} = require('../controllers/userController'); // Caminho para o controller

// --- Middleware de Autenticação (EXEMPLO) ---
// Se você implementar um middleware de autenticação, ele iria aqui.
// Exemplo:
// const authMiddleware = require('../middleware/auth'); 

// ---------------------------------------------------------
// Rota de cadastro do usuário! (POST /api/usuarios/cadastro)
// ---------------------------------------------------------
router.post('/cadastro', cadastrarUsuario); // Chama diretamente o controller

// ---------------------------------------------------------
// Rota de login do usuário (POST /api/usuarios/login)
// ---------------------------------------------------------
router.post('/login', autenticarUsuario); // Chama diretamente o controller

// ---------------------------------------------------------
// Rota para consultar créditos do usuário (GET /api/usuarios/creditos/:email)
// ---------------------------------------------------------
router.get('/creditos/:email', consultarCreditosUsuario); // Chama diretamente o controller

// ---------------------------------------------------------
// Opcional: Rota para listar todos os usuários (GET /api/usuarios/)
// RECOMENDADO PROTEGER COM AUTENTICAÇÃO E AUTORIZAÇÃO EM PROD!
// Exemplo: router.get('/', authMiddleware, listarTodosUsuarios);
router.get('/', listarTodosUsuarios); // Sem proteção por enquanto

module.exports = router;