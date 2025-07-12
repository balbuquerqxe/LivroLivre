// controllers/bookController.js
// ---------------------------------------------------------
//  CONTROLLER DE LIVROS – com sistema de créditos ✔️
// ---------------------------------------------------------

// --- MODELO DE LIVROS ---
const {
  criarLivro,
  listarLivrosDisponiveis,
  buscarLivroPorId,
  getLivros                     // devolve toda a lista em memória
} = require('../models/book');

// --- MODELO DE USUÁRIOS (com créditos) ---
const {
  buscarUsuarioPorEmail,
  adicionarCredito,             // +1 crédito
  usarCredito,                  // -1 crédito (true|false)
  consultarCreditos             // saldo numérico
} = require('../models/user');

// --- SERVIÇO STELLAR ---
const { sendBookToken } = require('../services/stellarService');


// ---------------------------------------------------------
// 1. Cadastrar Livro  ➜  +1 crédito ao doador
// ---------------------------------------------------------
function cadastrarLivro(req, res) {
  const { titulo, autor, doador, chaveStellar } = req.body;

  if (!titulo || !autor || !doador || !chaveStellar) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  /* garante que o doador já esteja registrado
     (caso use outro endpoint de cadastro, isso nunca roda) */
  const user = buscarUsuarioPorEmail(doador);
  if (!user) {
    return res.status(400).json({ erro: `O doador ${doador} não está cadastrado. Faça o login ou cadastro antes de doar um livro.` });
  }


  // cria o livro
  const novoLivro = criarLivro(titulo, autor, doador, chaveStellar);

  // credita o doador
  adicionarCredito(doador);

  return res.status(201).json(novoLivro);
}


// ---------------------------------------------------------
// 2. Listar Livros Disponíveis
// ---------------------------------------------------------
function listarLivros(_req, res) {
  try {
    return res.json(listarLivrosDisponiveis());
  } catch (err) {
    console.error('Erro ao listar livros:', err);
    return res.status(500).json({ erro: 'Erro interno ao listar livros.' });
  }
}


// ---------------------------------------------------------
// 3. Adotar Livro  ➜  -1 crédito do adotante
// ---------------------------------------------------------
async function adotarLivro(req, res) {
  const { id } = req.params;
  const { adotante } = req.body;   // e-mail do usuário logado
  console.log(`[DEBUG] Tentando adotar: ${adotante}`);

  if (!adotante)
    return res.status(400).json({ erro: 'Adotante é obrigatório.' });

  const livro = buscarLivroPorId(id);
  if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
  if (livro.adotadoPor)
    return res.status(400).json({ erro: 'Livro já foi adotado.' });

  console.log(`[DEBUG] Créditos do adotante (${adotante}): ${consultarCreditos(adotante)}`);
  // tenta descontar crédito
  if (!usarCredito(adotante)) {
    return res.status(403).json({ erro: 'Você não possui créditos suficientes para adotar um livro.' });
  }

  try {
    // envia 1 token BOOK ao doador
    const { hash } = await sendBookToken(livro.chaveStellar);

    // atualiza estado do livro
    livro.adotadoPor = adotante;
    livro.hashTransacao = hash;
    livro.historico.push({
      doador: livro.doador,
      adotante,
      hash,
      data: new Date().toISOString()
    });

    return res.json({ mensagem: 'Livro adotado e token enviado!', livro });

  } catch (err) {
    // falhou: devolve o crédito
    adicionarCredito(adotante);
    console.error('Falha ao enviar token:', err.message || err);
    return res.status(500).json({ erro: 'Erro ao processar adoção do livro.' });
  }
}


// ---------------------------------------------------------
// 4. Livros (e saldo) de um Usuário
// ---------------------------------------------------------
function listarLivrosDoUsuario(req, res) {
  const { email } = req.params;
  if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório.' });

  const todos = getLivros();
  const doados = todos.filter(l => l.doador === email);
  const adotados = todos.filter(l => l.adotadoPor === email);
  const creditos = consultarCreditos(email);   // 0 se não existir

  return res.json({ creditos, doados, adotados });
}


// ---------------------------------------------------------
// EXPORTAÇÕES
// ---------------------------------------------------------
module.exports = {
  cadastrarLivro,
  listarLivros,
  adotarLivro,
  listarLivrosDoUsuario
};
