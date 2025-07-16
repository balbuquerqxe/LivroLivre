// Importa as funções do modelo de usuário
const {
  criarUsuario,
  buscarUsuarioPorEmail,
  adicionarCredito,
  consultarCreditos,
  getTodosUsuarios
} = require('../models/usuarioModel');

// Importa os serviços relacionados à Stellar
const {
  gerarChaveStellar,
  criarTrustline,
  fundearConta
} = require('../services/stellarService');


// Função que cadastra um novo usuário no sistema
async function cadastrarUsuario(req, res) {
  const { nome, email, senha } = req.body;

  // Verifica se todos os campos obrigatórios foram enviados
  if (!nome || !email || !senha) {
    console.log("[CONTROLLER-USUARIO] Erro: Nome, e-mail e senha são obrigatórios.");
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    
    // Gera um par de chaves Stellar
    console.log("[CONTROLLER-USUARIO] Gerando chave Stellar...");
    const { publicKey, secret } = await gerarChaveStellar();

    // Fundeia a conta com saldo inicial
    console.log("[CONTROLLER-USUARIO] Fundeando conta...");
    await fundearConta(publicKey);

    // Cria a trustline para o token BOOK
    console.log("[CONTROLLER-USUARIO] Criando trustline...");
    await criarTrustline(secret);

    // Verifica se o usuário já existe
    const existingUser = await buscarUsuarioPorEmail(email);
    if (existingUser) {
      console.warn(`[CONTROLLER-USUARIO] Usuário ${email} já existe.`);
      return res.status(409).json({ erro: `O e-mail ${email} já está cadastrado.` });
    }

    // Cria o usuário no banco de dados
    console.log("[CONTROLLER-USUARIO] Criando usuário no banco de dados...");
    const novo = await criarUsuario(nome, email, senha, publicKey);

    // Retorna os dados do novo usuário (incluindo a chave privada apenas neste momento)
    res.status(201).json({
      id: novo.id,
      nome: novo.nome,
      email: novo.email,
      chavePublica: novo.chaveStellar,
      creditos: novo.creditos,
      chavePrivada: secret
    });

    console.log("[CONTROLLER-USUARIO] Cadastro finalizado com sucesso.");
  } catch (err) {
    console.error(`[CONTROLLER-USUARIO] Erro ao cadastrar usuário: ${err.message}`);
    console.error(err);

    if (err.code === 'UNIQUE_CONSTRAINT_FAILED') {
      return res.status(409).json({ erro: err.message });
    }

    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
    }
  }
}


// Função que autentica um usuário pelo e-mail e senha
async function autenticarUsuario(req, res) {
  const { email, senha } = req.body;

  // Verifica se os campos foram enviados
  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {

    // Busca o usuário com as credenciais informadas
    const usuario = await require('../models/usuarioModel').autenticarUsuario(email, senha);

    // Se não encontrar, retorna erro de autenticação
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Retorna o usuário autenticado
    res.json({ mensagem: 'Login bem-sucedido', usuario });
  } catch (err) {
    console.error(`[CONTROLLER-LOGIN] Erro ao autenticar usuário: ${err.message}`);
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro interno ao fazer login.' });
    }
  }
}


// Função que retorna os créditos de um usuário
async function consultarCreditosUsuario(req, res) {
  const { email } = req.params;

  // Verifica se o email foi fornecido
  if (!email) {
    return res.status(400).json({ erro: 'E-mail é obrigatório para consultar créditos.' });
  }

  try {

    // Busca a quantidade de créditos do usuário
    const creditos = await require('../models/usuarioModel').consultarCreditos(email);
    res.json({ creditos });
  } catch (err) {
    console.error(`[CONTROLLER-USUARIO] Erro ao consultar créditos para ${email}: ${err.message}`);
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro interno ao consultar créditos.' });
    }
  }
}


// Função que lista todos os usuários cadastrados (admin/debug)
async function listarTodosUsuarios(req, res) {
  try {
    
    // Busca todos os usuários do banco
    const usuarios = await require('../models/usuarioModel').getTodosUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error(`[CONTROLLER-USUARIO] Erro ao listar todos os usuários: ${error.message}`);
    console.error(error);

    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro interno ao listar usuários.' });
    }
  }
}


// Exporta as funções para serem usadas em outras partes do código
module.exports = {
  cadastrarUsuario,
  autenticarUsuario,
  consultarCreditosUsuario,
  listarTodosUsuarios
};