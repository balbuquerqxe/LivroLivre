// Lista com todos os livros cadastrados
const livros = require('../data/livros');

// Garante que cada licro tenha um ID único
let contadorId = 1;

// Função que cria um novo livro (info específicas do livro)
function criarLivro(titulo, autor, doador, chaveStellar) {
    // Cria um objeto novoLivro
  const novoLivro = {
    id: contadorId++,
    titulo,
    autor,
    doador,
    chaveStellar, // Chave pública do doador!
    adotadoPor: null, // Ainda não foi transferido
    hashTransacao: null,
    historico: [] // Histórico de transações
  };

  // Adiciona o novo livro na lista de livros
  livros.push(novoLivro);   

  // Retorna o novo livro criado
  return novoLivro;
}

// Função que lista apenas os livros que estão para doação
function listarLivrosDisponiveis() {
  return livros.filter(livro => livro.adotadoPor === null);
}

// Busca um livro pelo ID
function buscarLivroPorId(id) {
  return livros.find(livro => livro.id === parseInt(id));
}

// Exporta as funções para serem usadas em outros arquivos
module.exports = {
  criarLivro,
  listarLivrosDisponiveis,
  buscarLivroPorId
};