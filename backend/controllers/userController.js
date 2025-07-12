// ===============================
// CONTROLLER DE USUÁRIO
// ===============================
const {
  criarUsuario,
  buscarUsuarioPorEmail,
  usuarios // exportado do models/user.js
} = require('../models/user');

const {
  gerarChaveStellar,
  criarTrustline
} = require('../services/stellarService');

// Cadastro de novo usuário
async function cadastrarUsuario(req, res) {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });

  try {
    // 1. Gera chave Stellar e trustline
    const { chavePublica, chaveSecreta } = await gerarChaveStellar();
    await criarTrustline(chaveSecreta);

    // 2. Cria e registra usuário com créditos iniciados em 0
    const novo = criarUsuario(nome, email, senha, chavePublica); // já inicia com 0 créditos

    // 3. Retorna sem a chave secreta
    res.status(201).json({
      id: novo.id,
      nome: novo.nome,
      email: novo.email,
      chavePublica: novo.chaveStellar,
      creditos: novo.creditos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
}

// Lista simples de usuários
function listarUsuarios(req, res) {
  const lista = usuarios.map(u => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    creditos: u.creditos
  }));
  res.json(lista);
}

module.exports = { cadastrarUsuario, listarUsuarios };
