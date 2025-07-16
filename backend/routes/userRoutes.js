// Importa o Express e inicializa o router
const express = require('express');
const router = express.Router();

// Importa as funções do controller de usuários
const { 
  cadastrarUsuario, 
  autenticarUsuario, 
  consultarCreditosUsuario, 
  listarTodosUsuarios
} = require('../controllers/userController');

// Rota que cadastra novo usuário
router.post('/cadastro', cadastrarUsuario);


// Rota que autentica usuário e retorna seus dados
router.post('/login', autenticarUsuario);


//Rota que retorna os créditos do usuário
router.get('/creditos/:email', consultarCreditosUsuario);


// Rota que lista todos os usuários
router.get('/', listarTodosUsuarios);


// Exporta o router para ser usado na aplicação
module.exports = router;