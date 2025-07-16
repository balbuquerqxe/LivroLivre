// Importa a função de criação de chat entre doador e adotante
const { criarChat } = require('../models/chatModel');

// Importa as funções do modelo de livros
const {
  criarLivro,
  listarLivrosDisponiveis, // Lista apenas os livros ainda não adotados
  buscarLivroPorId,
  atualizarLivro,
  getTodosLivros // Lista TODOS os livros
} = require('../models/livroModel');

// Importa as funções do modelo de usuários (relacionadas ao crédito)
const {
  buscarUsuarioPorEmail,
  adicionarCredito,
  usarCredito,
  consultarCreditos
} = require('../models/usuarioModel');

// Importa o serviço responsável por enviar tokens via Stellar
const { sendBookToken } = require('../services/stellarService');


// Função que cadastra livro e dá um crédito ao doador
async function cadastrarLivro(req, res) {

  // Informações do livro
  const { titulo, autor, doador, chaveStellar } = req.body;

  // Imagem da capa do livro (opcional)
  const imagemPath = req.file ? `uploads/${req.file.filename}` : null;

  // Verifica se o doador já está cadastrado
  const user = await buscarUsuarioPorEmail(doador);
  if (!user) {
    return res.status(400).json({ erro: `O doador ${doador} não está cadastrado. Faça o login ou cadastro antes de doar um livro.` });
  }

  try {

    // Cria o novo livro no banco, adicionando suas principais informações
    const novoLivro = await criarLivro(titulo, autor, doador, chaveStellar, imagemPath);

    // Adiciona 1 crédito ao doador
    console.log(`[LIVRO] Livro cadastrado. Tentando adicionar crédito para o doador: '${doador}'.`);
    const creditoAdicionado = await adicionarCredito(doador);
    console.log(`[LIVRO] Resultado de adicionar crédito para '${doador}': ${creditoAdicionado ? 'SUCESSO (Crédito atualizado)' : 'FALHA (Usuário não encontrado para atualização de crédito)'}.`);
    return res.status(201).json(novoLivro);

  } catch (err) {
    console.error(`[LIVRO] Erro ao cadastrar livro: ${err.message}`);
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar livro.' });
  }
}

// Função que lista todos os livros disponíveis
async function listarLivros(_req, res) {
  try {

    // Busca apenas os livros ainda disponíveis (não adotados)
    const livros = await listarLivrosDisponiveis();

    // Loga quantos livros foram enviados
    console.log(`[LIVRO] Enviando ${livros.length} livros para o frontend.`);
    return res.json(livros);
  } catch (err) {
    console.error('[LIVRO] Erro ao listar livros disponíveis:', err);
    return res.status(500).json({ erro: 'Erro interno ao listar livros.' });
  }
}


// Função que adota um livro e tira um crédito do adotante
async function adotarLivro(req, res) {
  const { id } = req.params;
  const { adotante } = req.body;

  // Verifica se o adotante foi informado
  if (!adotante) {
    return res.status(400).json({ erro: 'Adotante é obrigatório.' });
  }

  // Busca o livro pelo ID
  const livro = await buscarLivroPorId(id);
  if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });

  // Impede o doador de adotar o próprio livro
  if (livro.doador.toLowerCase() === adotante.toLowerCase()) {
    return res.status(400).json({ erro: 'Você não pode adotar seu próprio livro.' });
  }

  // Verifica se o livro já foi adotado
  if (livro.adotadoPor) {
    return res.status(400).json({ erro: 'Livro já foi adotado.' });
  }

  // Consulta os créditos do adotante
  const creditosAtuais = await consultarCreditos(adotante);
  console.log(`[DEBUG] Créditos do adotante (${adotante}): ${creditosAtuais}`);

  // Tenta descontar 1 crédito
  const creditoUsadoComSucesso = await usarCredito(adotante);
  if (!creditoUsadoComSucesso) {
    return res.status(403).json({ erro: 'Você não possui créditos suficientes para adotar um livro.' });
  }

  try {
    // Envia o token para o adotante usando Stellar
    const { hash } = await sendBookToken(livro.chaveStellarDoador);

    // Cria item de histórico para salvar no livro
    const novoHistoricoItem = {
      doador: livro.doador,
      adotante,
      hash,
      data: new Date().toISOString()
    };

    // Prepara os dados atualizados do livro
    const dadosAtualizadosLivro = {
      adotadoPor: adotante,
      hashTransacao: hash,
      novoHistoricoItem
    };

    // Atualiza o livro no banco
    const livroAtualizado = await atualizarLivro(id, dadosAtualizadosLivro);
    if (!livroAtualizado) {
      throw new Error("Falha ao atualizar o status do livro no banco de dados após a transação.");
    }

    // Tenta criar o chat entre doador e adotante
    try {
      await criarChat(livro.id, livro.titulo, livro.doador, adotante);
    } catch (errChat) {
      console.error('[ADOTAR] Erro ao criar chat:', errChat.message || errChat);
    }

    return res.json({ mensagem: 'Livro adotado, token enviado e chat criado!', livro: livroAtualizado });
  } catch (err) {

    // Se algo der errado, devolve o crédito
    await adicionarCredito(adotante);
    console.error('[LIVRO] Falha ao processar adoção/enviar token:', err.message || err);
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao processar adoção do livro. Crédito devolvido.' });
  }
}

// Livros do usuário
async function listarLivrosDoUsuario(req, res) {
  const { email } = req.params;

  // Verifica se o e-mail foi fornecido
  if (!email) {
    return res.status(400).json({ erro: 'E-mail do usuário é obrigatório nos parâmetros da URL.' });
  }

  try {

    // Busca todos os livros do sistema
    const todos = await getTodosLivros();

    // Filtra os livros doados este usuário
    const doados = todos.filter(l => l.doador && l.doador.toLowerCase() === email.toLowerCase());

    // Filtra os livros adotados este usuário
    const adotados = todos.filter(l => l.adotadoPor && l.adotadoPor.toLowerCase() === email.toLowerCase());

    // Consulta os créditos do usuário
    const creditos = await consultarCreditos(email);

    return res.json({ creditos, doados, adotados });
  } catch (err) {
    console.error(`[LIVRO] Erro ao listar livros do usuário ${email}: ${err.message}`);
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno ao listar livros do usuário.' });
  }
}


// Exporta as funções para serem usadas em outras partes do código
module.exports = {
  cadastrarLivro,
  listarLivros,
  adotarLivro,
  listarLivrosDoUsuario
};
