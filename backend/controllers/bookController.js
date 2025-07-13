// LivroLivre/backend/controllers/bookController.js
// ---------------------------------------------------------
//  CONTROLLER DE LIVROS – com sistema de créditos ✔️ (ADAPTADO PARA DB)
// ---------------------------------------------------------

// --- MODELO DE LIVROS ---
const {
  criarLivro,
  listarLivrosDisponiveis, // Esta lista apenas os 'adotadoPor IS NULL'
  buscarLivroPorId,
  atualizarLivro,
  getTodosLivros               // <<< Esta é a função que busca TODOS os livros
} = require('../models/livroModel'); // Caminho para o novo modelo

// --- MODELO DE USUÁRIOS (com créditos) ---
const {
  buscarUsuarioPorEmail,
  adicionarCredito,
  usarCredito,
  consultarCreditos
} = require('../models/usuarioModel');

// --- SERVIÇO STELLAR ---
const { sendBookToken } = require('../services/stellarService');


// ---------------------------------------------------------
// 1. Cadastrar Livro  ➜  +1 crédito ao doador
// ---------------------------------------------------------
async function cadastrarLivro(req, res) {
  const { titulo, autor, doador, chaveStellar } = req.body;
  const imagemPath = req.file ? `uploads/${req.file.filename}` : null;


  // ... (validações iniciais, como antes) ...

  /* Garante que o doador já esteja registrado no DB */
  const user = await buscarUsuarioPorEmail(doador);
  if (!user) {
    return res.status(400).json({ erro: `O doador ${doador} não está cadastrado. Faça o login ou cadastro antes de doar um livro.` });
  }

  try {
    const novoLivro = await criarLivro(titulo, autor, doador, chaveStellar, imagemPath);

    // --- NOVOS LOGS AQUI ---
    console.log(`[CONTROLLER-LIVRO] Livro cadastrado. Tentando adicionar crédito para o doador: '${doador}'.`);
    const creditoAdicionado = await adicionarCredito(doador); // Captura o resultado da Promise
    console.log(`[CONTROLLER-LIVRO] Resultado de adicionar crédito para '${doador}': ${creditoAdicionado ? 'SUCESSO (Crédito atualizado)' : 'FALHA (Usuário não encontrado para atualização de crédito)'}.`);
    // --- FIM NOVOS LOGS ---

    return res.status(201).json(novoLivro);

  } catch (err) {
    console.error(`[CONTROLLER-LIVRO] Erro ao cadastrar livro: ${err.message}`);
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar livro.' });
  }
}


// ---------------------------------------------------------
// 2. Listar Livros (todos, ou apenas disponíveis, depende do frontend)
// ---------------------------------------------------------
async function listarLivros(_req, res) {
  try {
    // Se você quer listar APENAS os disponíveis, use listarLivrosDisponiveis()
    // Se você quer listar TODOS os livros (e o frontend filtra depois), use getTodosLivros()
    const livros = await listarLivrosDisponiveis(); // Ou getTodosLivros()

    // --- NOVO LOG ---
    console.log(`[CONTROLLER-LIVRO] Enviando ${livros.length} livros para o frontend.`);
    // --- FIM NOVO LOG ---
    return res.json(livros);
  } catch (err) {
    console.error('[CONTROLLER-LIVRO] Erro ao listar livros disponíveis:', err);
    return res.status(500).json({ erro: 'Erro interno ao listar livros.' });
  }
}


// ---------------------------------------------------------
// 3. Adotar Livro  ➜  -1 crédito do adotante
// ---------------------------------------------------------
async function adotarLivro(req, res) {
  const { id } = req.params;
  const { adotante } = req.body;
  console.log(`[DEBUG] Tentando adotar: ${adotante}`);

  if (!adotante) {
    return res.status(400).json({ erro: 'Adotante é obrigatório.' });
  }

  const livro = await buscarLivroPorId(id);
  if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });

  if (livro.doador.toLowerCase() === adotante.toLowerCase()) {
    return res.status(400).json({ erro: 'Você não pode adotar seu próprio livro.' });
  }

  if (livro.adotadoPor) {
    return res.status(400).json({ erro: 'Livro já foi adotado.' });
  }

  const creditosAtuais = await consultarCreditos(adotante);
  console.log(`[DEBUG] Créditos do adotante (${adotante}): ${creditosAtuais}`);

  const creditoUsadoComSucesso = await usarCredito(adotante);
  if (!creditoUsadoComSucesso) {
    return res.status(403).json({ erro: 'Você não possui créditos suficientes para adotar um livro.' });
  }

  try {
    const { hash } = await sendBookToken(livro.chaveStellarDoador);

    const novoHistoricoItem = {
      doador: livro.doador,
      adotante,
      hash,
      data: new Date().toISOString()
    };

    const dadosAtualizadosLivro = {
      adotadoPor: adotante,
      hashTransacao: hash,
      novoHistoricoItem: novoHistoricoItem
    };

    const livroAtualizado = await atualizarLivro(id, dadosAtualizadosLivro);

    if (!livroAtualizado) {
      throw new Error("Falha ao atualizar o status do livro no banco de dados após a transação.");
    }

    return res.json({ mensagem: 'Livro adotado e token enviado!', livro: livroAtualizado });

  } catch (err) {
    await adicionarCredito(adotante);
    console.error('[CONTROLLER-LIVRO] Falha ao processar adoção/enviar token:', err.message || err);
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao processar adoção do livro. Crédito devolvido.' });
  }
}


// ---------------------------------------------------------
// 4. Livros (e saldo) de um Usuário
// ---------------------------------------------------------
async function listarLivrosDoUsuario(req, res) {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ erro: 'E-mail do usuário é obrigatório nos parâmetros da URL.' });
  }

  try {
    const todos = await getTodosLivros();

    const doados = todos.filter(l => l.doador && l.doador.toLowerCase() === email.toLowerCase());
    const adotados = todos.filter(l => l.adotadoPor && l.adotadoPor.toLowerCase() === email.toLowerCase());

    const creditos = await consultarCreditos(email);

    return res.json({ creditos, doados, adotados });

  } catch (err) {
    console.error(`[CONTROLLER-LIVRO] Erro ao listar livros do usuário ${email}: ${err.message}`);
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno ao listar livros do usuário.' });
  }
}


module.exports = {
  cadastrarLivro,
  listarLivros,
  adotarLivro,
  listarLivrosDoUsuario
};