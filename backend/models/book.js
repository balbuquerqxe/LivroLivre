// Lista com todos os livros cadastrados
let livros = []

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