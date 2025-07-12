// Importa o express para criar as rotas
const express = require('express');

// Lida apenas com as rotas relacionadas aos usuários
const router = express.Router();

// Importa as funções do controller de usuários
const { criarUsuario, autenticarUsuario, consultarCreditos } = require('../models/user');

// Importa os serviços Stellar para gerar chaves, fundear conta e criar trustlines
const {
    gerarChavesStellar,
    criarTrustline,
    fundearConta
} = require('../services/stellarService');

// Rota de cadastro do usuário!
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Gera chave Stellar nova
        const { publicKey, secret } = await gerarChavesStellar();

        // FUNDAMENTAL: fundeia a conta com 1 XLM na testnet
        await fundearConta(publicKey);

        // Cria trustline
        await criarTrustline(secret);

        // Cria usuário
        const usuario = criarUsuario(nome, email, senha, publicKey);
        res.status(201).json({ usuario, chavePrivada: secret });

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
});

// Rota de login do usuário
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = autenticarUsuario(email, senha);

    if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    res.json({ mensagem: 'Login bem-sucedido', usuario });
});

router.get('/creditos/:email', (req, res) => {
  const { email } = req.params;
  const creditos = consultarCreditos(email);
  res.json({ creditos });
});

// Exporta o router para ser usado em outros arquivos
module.exports = router;
