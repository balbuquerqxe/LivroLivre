// Importa o express para criar as rotas
const express = require('express');

// Lida apenas com as rotas relacionadas aos usuários
const router = express.Router();

// Importa as funções do controller de usuários
const { criarUsuario, autenticarUsuario } = require('../models/user');

// Importa os serviços Stellar para gerar chaves e criar trustlines
const { gerarChavesStellar, criarTrustline } = require('../services/stellarService');

// Rota de cadastro do usuário!
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    // Gera chave Stellar nova (MUITO IMPORTANTE!)
    const { publicKey, secret } = await gerarChavesStellar();

    // Cria trustline
    await criarTrustline(secret);

    // Cria usuário
    const usuario = criarUsuario(nome, email, senha, publicKey);
    res.status(201).json({ usuario, chavePrivada: secret });
});

// Rota de login do usuário
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = autenticarUsuario(email, senha);

    // Verifica se o usuário existe e se as credenciais estão corretas
    if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Retorna o usuário autenticado
    res.json({ mensagem: 'Login bem-sucedido', usuario });
});

// Exporta o router para ser usado em outros arquivos
module.exports = router;
