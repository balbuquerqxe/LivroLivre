// Importa as funções relacionadas ao livro
const {
    criarLivro,
    listarLivrosDisponiveis,
    buscarLivroPorId
} = require('../models/book');

// Importa a função que envia o token Stellar
const { sendBookToken } = require('../services/stellarService');

// Função para cadastrar livro
function cadastrarLivro(req, res) {
    const { titulo, autor, doador, chaveStellar } = req.body;
    const novoLivro = criarLivro(titulo, autor, doador, chaveStellar);
    res.status(201).json(novoLivro);
}

// Função para listar livros disponíveis
function listarLivros(req, res) {
    const livros = listarLivrosDisponiveis();
    res.json(livros);
}

// Função para adotar um livro
async function adotarLivro(req, resposta) {
    // Obtém o ID da rota
    const { id } = req.params;

    // Nome de quem está pegando o livro
    const { adotante } = req.body;

    // Procura o livro pelo ID e verifica se ele está disponível
    const livro = buscarLivroPorId(id);
    if (!livro || livro.adotadoPor) {
        // Não está disponível.
        return resposta.status(404).json({ erro: 'Livro não encontrado ou já adotado.' });
    }

    try {
        // Faz uma transação na blockchain enviando 1 token para o doador
        // ATENÇÃO: usa await pq a função leva um tempinho e retorna uma promessa
        const respostaultado = await sendBookToken(livro.chaveStellar);

        // Registro de quem adotou o livro
        livro.adotadoPor = adotante;

        // Guarda o hash da transação e adiciona ao histórico
        livro.hashTransacao = respostaultado.hash;

        // Atualiza o histórico do livro
        livro.historico.push({
            doador: livro.doador,
            adotante,
            hash: respostaultado.hash,
            data: new Date().toISOString()
        });

        // Mostra que deu tudo certo
        resposta.json({ mensagem: 'Livro adotado e token enviado!', livro });
    } catch (erro) {
        if (erro.response?.data?.extras?.hash) {
            console.log("Hash da transação (mesmo com erro):", erro.response.data.extras.hash);
        } else if (erro.response?.data?.extras) {
            console.log("Extras completos:", JSON.stringify(erro.response.data.extras, null, 2));
        } else {
            console.error("Erro ao enviar token via Stellar:", erro.message || erro);
        }

        resposta.status(500).json({ erro: 'Erro ao enviar token via Stellar.' });
    }
}

// Importa a lista de livros (assumindo que é salvo em memória em /data/livros.js)
const livros = require('../data/livros');

// Função para listar os livros doados e adotados por um usuário (baseado no e-mail)
function listarLivrosDoUsuario(req, res) {
    const email = req.params.email;

    const doados = livros.filter(l => l.doador === email);
    const adotados = livros.filter(l => l.adotadoPor === email);

    res.json({ doados, adotados });
}

// Exportamos de novo para facilitar a utilização futura.
module.exports = {
    cadastrarLivro,
    listarLivros,
    adotarLivro,
    listarLivrosDoUsuario
};