// Conexão com o banco de dados
const db = require('../database'); 

// Função que cria um novo livro
function criarLivro(titulo, autor, doador, chaveStellarDoador, imagem) {

    // Define a query SQL para inserir um novo livro no banco
    const sql = `
        INSERT INTO livros (titulo, autor, doador, chaveStellarDoador, adotadoPor, hashTransacao, historico, imagem)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    
    // Começa o histórico como um array vazio em formato de string JSON
    const historicoJson = JSON.stringify([]); 

    return new Promise((resolve, reject) => {

        // Executa a query passando os valores
        db.run(sql, [titulo, autor, doador, chaveStellarDoador, null, null, historicoJson, imagem], function(err) {
            if (err) {

                // Mostra erro no console e rejeita a Promise
                console.error(`[LIVRO] Erro ao criar livro: ${err.message}`);
                reject(err);
            } else {

                // Cria um objeto representando o novo livro
                const novoLivro = {
                    id: this.lastID, // ID gerado automaticamente
                    titulo,
                    autor,
                    doador,
                    chaveStellarDoador, 
                    adotadoPor: null, // Ainda não foi adotado (acabou de ser doado)
                    hashTransacao: null, // Nenhuma transação feita ainda
                    historico: [], // Histórico vazio
                    imagem
                };

                // Mostra que o livro foi criado
                console.log('[LIVRO] Livro cadastrado:', novoLivro.titulo, '(ID:', novoLivro.id, ')');
                resolve(novoLivro); // Retorna o livro criado
            }
        });
    });
}

// Função que lista todos os livros que ainda estão disponíveis
function listarLivrosDisponiveis() {
    const sql = "SELECT * FROM livros WHERE adotadoPor IS NULL;";
    
    return new Promise((resolve, reject) => {

        // Busca todos os livros disponíveis no banco
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(`[LIVRO] Erro ao listar livros disponíveis: ${err.message}`);
                reject(err);
            } else {

                // Converte o histórico de string para array para cada livro
                const livrosDisponiveis = rows.map(row => ({
                    ...row,
                    historico: JSON.parse(row.historico || '[]')
                }));

                // Mostra quantos livros foram encontrados
                console.log(`[LIVRO] Livros disponíveis encontrados no DB: ${livrosDisponiveis.length} livros.`);
                resolve(livrosDisponiveis);
            }
        });
    });
}

// Função que busca um livro específico pelo ID
function buscarLivroPorId(id) {
    const sql = "SELECT * FROM livros WHERE id = ?;";
    
    return new Promise((resolve, reject) => {
        const livroId = parseInt(id); 

        // Verifica se o ID é um número válido
        if (isNaN(livroId)) {
            console.warn(`[LIVRO] ID inválido: ${id}`);
            return resolve(null);
        }

        // Busca o livro no banco pelo ID
        db.get(sql, [livroId], (err, row) => {
            if (err) {
                console.error(`[LIVRO] Erro ao buscar livro por ID: ${err.message}`);
                reject(err);
            } else {

                // Converte o histórico se o livro for encontrado
                if (row) {
                    row.historico = JSON.parse(row.historico || '[]');
                }
                resolve(row); // Retorna o livro (ou null se não encontrar)
            }
        });
    });
}

// Função que atualiza os dados de um livro já existente
function atualizarLivro(id, dadosAtualizados) {
    return new Promise(async (resolve, reject) => {
        try {

            // Busca o livro antes de atualizar
            const livroExistente = await buscarLivroPorId(id);
            if (!livroExistente) {
                console.warn(`[LIVRO] Livro com ID ${id} não encontrado para atualização.`);
                return resolve(null);
            }

            // Atualiza APENAS os campos recebidos
            livroExistente.titulo = dadosAtualizados.titulo || livroExistente.titulo;
            livroExistente.autor = dadosAtualizados.autor || livroExistente.autor;
            livroExistente.doador = dadosAtualizados.doador || livroExistente.doador;
            livroExistente.chaveStellarDoador = dadosAtualizados.chaveStellarDoador || livroExistente.chaveStellarDoador;
            livroExistente.adotadoPor = dadosAtualizados.adotadoPor || livroExistente.adotadoPor;
            livroExistente.hashTransacao = dadosAtualizados.hashTransacao || livroExistente.hashTransacao;
            
            // Se tiver novo item de histórico, adiciona
            if (dadosAtualizados.novoHistoricoItem) {
                livroExistente.historico.push(dadosAtualizados.novoHistoricoItem);
            }

            // Query para atualizar os dados no banco
            const sql = `
                UPDATE livros 
                SET titulo = ?, autor = ?, doador = ?, chaveStellarDoador = ?, adotadoPor = ?, hashTransacao = ?, historico = ?
                WHERE id = ?;
            `;

            // Converte o histórico de volta para JSON string
            const historicoJson = JSON.stringify(livroExistente.historico);

            // Executa a atualização no banco
            db.run(sql, [
                livroExistente.titulo,
                livroExistente.autor,
                livroExistente.doador,
                livroExistente.chaveStellarDoador,
                livroExistente.adotadoPor,
                livroExistente.hashTransacao,
                historicoJson,
                id
            ], function(err) {
                if (err) {
                    console.error(`[LIVRO] Erro ao atualizar livro ${id}: ${err.message}`);
                    reject(err);
                } else {

                    // Verifica se alguma linha foi realmente alterada
                    if (this.changes > 0) {
                        console.log(`[LIVRO] Livro ${id} atualizado.`);
                        resolve(livroExistente); 
                    } else {
                        resolve(null); // Nenhuma alteração feita
                    }
                }
            });
        } catch (error) {

            // Caso algum erro ocorra no processo inteiro
            console.error(`[LIVRO] Erro ao buscar/preparar livro para atualização: ${error.message}`);
            reject(error);
        }
    });
}

// Função que retorna todos os livros cadastrados
function getTodosLivros() {
    const sql = "SELECT * FROM livros;";
    
    return new Promise((resolve, reject) => {

        // Busca todos os livros no banco
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(`[LIVRO] Erro ao obter todos os livros: ${err.message}`);
                reject(err);
            } else {
                
                // Converte o histórico de cada livro de string para array
                const todosLivros = rows.map(row => ({
                    ...row,
                    historico: JSON.parse(row.historico || '[]')
                }));
                console.log(`[MODEL-LIVRO] Total de livros encontrados no DB: ${todosLivros.length} livros.`);
                resolve(todosLivros);
            }
        });
    });
}

// Exporta todas as funções para uso em outras partes do backend
module.exports = {
  criarLivro,
  listarLivrosDisponiveis,
  buscarLivroPorId,
  atualizarLivro,
  getTodosLivros
};
