// LivroLivre/backend/models/livroModel.js

const db = require('../database'); // Importa a conexão com o banco de dados

// Função que cria um novo livro
function criarLivro(titulo, autor, doador, chaveStellarDoador, imagem) {
    const sql = `
        INSERT INTO livros (titulo, autor, doador, chaveStellarDoador, adotadoPor, hashTransacao, historico, imagem)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    
    const historicoJson = JSON.stringify([]); 

    return new Promise((resolve, reject) => {
        db.run(sql, [titulo, autor, doador, chaveStellarDoador, null, null, historicoJson, imagem], function(err) {
            if (err) {
                console.error(`[MODEL-LIVRO] Erro ao criar livro: ${err.message}`);
                reject(err);
            } else {
                const novoLivro = {
                    id: this.lastID, 
                    titulo,
                    autor,
                    doador,
                    chaveStellarDoador, 
                    adotadoPor: null,
                    hashTransacao: null,
                    historico: [],
                    imagem
                };
                console.log('[DEBUG-MODEL-LIVRO] Livro cadastrado:', novoLivro.titulo, '(ID:', novoLivro.id, ')');
                resolve(novoLivro);
            }
        });
    });
}

// Função que lista apenas os livros que estão para doação
function listarLivrosDisponiveis() {
    const sql = "SELECT * FROM livros WHERE adotadoPor IS NULL;";
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(`[MODEL-LIVRO] Erro ao listar livros disponíveis: ${err.message}`);
                reject(err);
            } else {
                // O histórico vem como string JSON, precisa ser parseado de volta para objeto
                const livrosDisponiveis = rows.map(row => ({
                    ...row,
                    historico: JSON.parse(row.historico || '[]')
                }));
                console.log(`[MODEL-LIVRO] Livros disponíveis encontrados no DB: ${livrosDisponiveis.length} livros.`); // NOVO LOG
                resolve(livrosDisponiveis);
            }
        });
    });
}

// Busca um livro pelo ID
function buscarLivroPorId(id) {
    const sql = "SELECT * FROM livros WHERE id = ?;";
    
    return new Promise((resolve, reject) => {
        const livroId = parseInt(id); 
        if (isNaN(livroId)) {
            console.warn(`[MODEL-LIVRO] ID inválido: ${id}`);
            return resolve(null);
        }

        db.get(sql, [livroId], (err, row) => {
            if (err) {
                console.error(`[MODEL-LIVRO] Erro ao buscar livro por ID: ${err.message}`);
                reject(err);
            } else {
                if (row) {
                    row.historico = JSON.parse(row.historico || '[]');
                }
                resolve(row);
            }
        });
    });
}

// Função para atualizar um livro (usada para adoção, histórico etc.)
function atualizarLivro(id, dadosAtualizados) {
    return new Promise(async (resolve, reject) => {
        try {
            const livroExistente = await buscarLivroPorId(id);
            if (!livroExistente) {
                console.warn(`[MODEL-LIVRO] Livro com ID ${id} não encontrado para atualização.`);
                return resolve(null);
            }

            livroExistente.titulo = dadosAtualizados.titulo || livroExistente.titulo;
            livroExistente.autor = dadosAtualizados.autor || livroExistente.autor;
            livroExistente.doador = dadosAtualizados.doador || livroExistente.doador;
            livroExistente.chaveStellarDoador = dadosAtualizados.chaveStellarDoador || livroExistente.chaveStellarDoador;
            livroExistente.adotadoPor = dadosAtualizados.adotadoPor || livroExistente.adotadoPor;
            livroExistente.hashTransacao = dadosAtualizados.hashTransacao || livroExistente.hashTransacao;
            
            if (dadosAtualizados.novoHistoricoItem) {
                livroExistente.historico.push(dadosAtualizados.novoHistoricoItem);
            }

            const sql = `
                UPDATE livros 
                SET titulo = ?, autor = ?, doador = ?, chaveStellarDoador = ?, adotadoPor = ?, hashTransacao = ?, historico = ?
                WHERE id = ?;
            `;

            const historicoJson = JSON.stringify(livroExistente.historico);

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
                    console.error(`[MODEL-LIVRO] Erro ao atualizar livro ${id}: ${err.message}`);
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        console.log(`[DEBUG-MODEL-LIVRO] Livro ${id} atualizado.`);
                        resolve(livroExistente); 
                    } else {
                        resolve(null); 
                    }
                }
            });
        } catch (error) {
            console.error(`[MODEL-LIVRO] Erro ao buscar/preparar livro para atualização: ${error.message}`);
            reject(error);
        }
    });
}

// Retorna TODOS os livros cadastrados no banco de dados (para listar todos, doados, adotados)
function getTodosLivros() {
    const sql = "SELECT * FROM livros;";
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(`[MODEL-LIVRO] Erro ao obter todos os livros: ${err.message}`);
                reject(err);
            } else {
                const todosLivros = rows.map(row => ({
                    ...row,
                    historico: JSON.parse(row.historico || '[]')
                }));
                console.log(`[MODEL-LIVRO] Total de livros encontrados no DB: ${todosLivros.length} livros.`); // NOVO LOG
                resolve(todosLivros);
            }
        });
    });
}

module.exports = {
  criarLivro,
  listarLivrosDisponiveis,
  buscarLivroPorId,
  atualizarLivro,
  getTodosLivros // Adicionado para poder listar todos os livros
};