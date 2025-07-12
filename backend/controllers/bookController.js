// Importa as funções relacionadas ao livro
const {
  criarLivro,
  listarLivrosDisponiveis,
  buscarLivroPorId
} = require('../models/book');

// Importa a função que envia o token Stellar
const { sendBookToken } = require('../services/stellarService');

// Importa a lista de livros (em memória, do módulo que os armazena)
const livros = require('../models/book').getLivros?.() || []; // fallback caso getLivros não exista

// Função para cadastrar livro
function cadastrarLivro(req, res) {
  const { titulo, autor, doador, chaveStellar } = req.body;

  if (!titulo || !autor || !doador || !chaveStellar) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  const novoLivro = criarLivro(titulo, autor, doador, chaveStellar);
  res.status(201).json(novoLivro);
}

// Função para listar livros disponíveis
function listarLivros(req, res) {
  const livros = listarLivrosDisponiveis();
  res.json(livros);
}

// Função para adotar um livro
async function adotarLivro(req, res) {
  const { id } = req.params;
  const { adotante } = req.body;

  if (!adotante) {
    return res.status(400).json({ erro: 'Nome do adotante é obrigatório.' });
  }

  const livro = buscarLivroPorId(id);

  if (!livro) {
    return res.status(404).json({ erro: 'Livro não encontrado.' });
  }

  if (livro.adotadoPor) {
    return res.status(400).json({ erro: 'Livro já foi adotado.' });
  }

  try {
    // Faz a transação de envio de token para o doador
    const resultado = await sendBookToken(livro.chaveStellar);

    livro.adotadoPor = adotante;
    livro.hashTransacao = resultado.hash;

    livro.historico.push({
      doador: livro.doador,
      adotante,
      hash: resultado.hash,
      data: new Date().toISOString()
    });

    res.json({ mensagem: 'Livro adotado e token enviado!', livro });
  } catch (erro) {
    if (erro.response?.data?.extras?.hash) {
      console.log("Hash da transação (mesmo com erro):", erro.response.data.extras.hash);
    } else if (erro.response?.data?.extras) {
      console.log("Extras completos:", JSON.stringify(erro.response.data.extras, null, 2));
    } else {
      console.error("Erro ao enviar token via Stellar:", erro.message || erro);
    }

    res.status(500).json({ erro: 'Erro ao enviar token via Stellar.' });
  }
}

// Função para listar os livros doados e adotados por um usuário (baseado no e-mail)
function listarLivrosDoUsuario(req, res) {
  const email = req.params.email;

  if (!email) {
    return res.status(400).json({ erro: 'E-mail é obrigatório.' });
  }

  // Filtra pela chaveStellar no caso dos doados, e pelo nome para adotados
  const doados = livros.filter(l => l.doador === email || l.chaveStellar === email);
  const adotados = livros.filter(l => l.adotadoPor === email);

  res.json({ doados, adotados });
}

// Exporta as funções do controller
module.exports = {
  cadastrarLivro,
  listarLivros,
  adotarLivro,
  listarLivrosDoUsuario
};
